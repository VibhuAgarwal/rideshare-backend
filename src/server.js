require('./config/env');

const app = require('./app');
const { attachMongoEventHandlers, connectMongo, getMongoConnectConfig } = require('./config/db');

const PORT = process.env.PORT || 5000;

const start = async () => {
  attachMongoEventHandlers();

  try {
    await connectMongo();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 API URL: http://localhost:${PORT}/api`);
    });
  } catch (err) {
    const { uri } = getMongoConnectConfig();
    console.error('❌ Failed to connect to MongoDB. Details:', err?.message || err);
    console.error(`ℹ️ Mongo URI: ${uri}`);
    console.error('ℹ️ Check MONGODB_URI and (optionally) set MONGODB_DB for Atlas.');
    process.exit(1);
  }
};

module.exports = { start };
