const mongoose = require('mongoose');

const getHealth = async (req, res) => {
  res.json({
    ok: true,
    mongo: {
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host || null,
      name: mongoose.connection.name || null
    }
  });
};

module.exports = { getHealth };
