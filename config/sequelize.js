const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE, process.env.USERNAMER, process.env.PASSWORD, {
    host: process.env.HOST,
    dialect: 'mysql',
    dialectModule: require('mysql2')
})

sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database because:', process.env.USERNAMER);
    });

module.exports = {
    sequelize: sequelize
};