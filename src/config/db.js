const mongoose = require('mongoose');

const DEFAULT_LOCAL_MONGO_URI = 'mongodb://127.0.0.1:27017/rideshare';

const getMongoConnectConfig = () => {
  const uri = (process.env.MONGODB_URI || DEFAULT_LOCAL_MONGO_URI).trim();
  const configuredDbName = (process.env.MONGODB_DB || process.env.MONGODB_DBNAME || '').trim();

  // Atlas URIs commonly omit the database name (i.e. `mongodb+srv://.../`)
  // which can lead to auth failures if the user only has permissions on a specific DB.
  const hasPathDbName = (() => {
    try {
      const url = new URL(uri);
      return Boolean(url.pathname && url.pathname !== '/');
    } catch {
      return false;
    }
  })();

  const dbName = hasPathDbName ? undefined : (configuredDbName || 'rideshare');

  return {
    uri,
    options: {
      dbName,
      serverSelectionTimeoutMS: 10_000,
      connectTimeoutMS: 10_000,
      maxPoolSize: 10
    }
  };
};

const attachMongoEventHandlers = () => {
  mongoose.connection.on('connected', () => {
    console.log(`✅ MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
  });
  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err?.message || err);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected');
  });

  process.on('unhandledRejection', (reason) => {
    console.error('❌ Unhandled promise rejection:', reason);
  });
};

const connectMongo = async () => {
  const { uri, options } = getMongoConnectConfig();
  await mongoose.connect(uri, options);
  return mongoose.connection;
};

module.exports = {
  connectMongo,
  attachMongoEventHandlers,
  getMongoConnectConfig
};
