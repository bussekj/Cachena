const Sequelize = require('@sequelize/core');
const sequelize = require('../config/database');

const User = require('./user')(sequelize, Sequelize);

module.exports = {
    User
};
