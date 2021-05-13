const Sequelize = require('sequelize')
const sequelize = require('../postgres_connection')
const moment = require('moment-timezone');
var CallMeta = sequelize.define('call_meta', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING
    },
    srcPhoneNumber: {
        type: Sequelize.STRING
    },
    desPhoneNumber: {
        type: Sequelize.STRING
    },
    selectedDuration: {
        type: Sequelize.INTEGER,
    },
    actualDuration: {
        type: Sequelize.INTEGER
    },
    endStatus: {
        type: Sequelize.STRING
    },
    createdAt: {
        type: Sequelize.BIGINT,
        defaultValue: moment(moment().utc()).tz("Asia/Kolkata").valueOf(),
        allowNull: false,
    },
    updatedAt: {
        type: Sequelize.BIGINT,
        defaultValue: moment(moment().utc()).tz("Asia/Kolkata").valueOf(),
        allowNull: false
    },
}, {
    freezeTableName: true,
    defaultScope: {
        attributes: { exclude: ['createdAt', 'updatedAt'] }
    }
});

// CallMeta.sync({force: true});


module.exports = CallMeta;