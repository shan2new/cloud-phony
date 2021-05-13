const { Sequelize } = require('sequelize');
// const POSTGRES_CONNECTION_STRING = require('../config')['POSTGRES_CONNECTION_STRING']
var sequelize = new Sequelize({
    dialect: 'postgres',
    host: 'localhost',
    database: 'cloud_phony',
    username: 'cloudphonyadmins',
    password: 'password'
});
module.exports = sequelize;