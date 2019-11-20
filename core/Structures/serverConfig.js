const Sequelize = require('sequelize')
const Database = require('../Database')

const serverConfig = Database.db.define('config', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  prefix: Sequelize.STRING,
  welcomeChannel: Sequelize.STRING,
  starboardChannel: Sequelize.STRING
})

serverConfig.sync()
module.exports = serverConfig
