// import { Sequelize } from '@sequelize/core';
// import { MariaDbDialect } from '@sequelize/mariadb';


const { Sequelize } = require('@sequelize/core')
const { MariaDbDialect } = require('@sequelize/mariadb')

require('dotenv').config();

const sequelize = new Sequelize({
  dialect: MariaDbDialect,
  database: 'db',
  user: 'guest',
  password: 'duck6887',
  host: 'localhost',
  port: 3306,
  showWarnings: true,
  connectTimeout: 1000,
});

try {
    sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }

module.exports = sequelize;