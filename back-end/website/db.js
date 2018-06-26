// mongoose 链接
const mongoose = require('mongoose');
const Config = require('../config.json');

mongoose.connect(Config.db);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

module.exports = db;