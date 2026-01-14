const path = require('path');
const dotenv = require('dotenv');

// Load env from backend/.env (same behavior as old server.js)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {};
