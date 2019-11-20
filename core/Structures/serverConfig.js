const Sequelize = require('sequelize')
const Database = require('../Database')

const serverConfig = Database.db.define('serverConfig', {
  serverName: Sequelize.STRING,
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  ownerID: Sequelize.STRING,
  prefix: Sequelize.STRING,
  welcomeChannel: Sequelize.STRING,
  starboardChannel: Sequelize.STRING
})

serverConfig.sync()
module.exports = serverConfig
