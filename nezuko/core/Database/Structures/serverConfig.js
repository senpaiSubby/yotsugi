const Sequelize = require('sequelize')
const Database = require('../Database')

const serverConfig = Database.db.define('serverConfig', {
  serverName: Sequelize.STRING,
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  ownerID: Sequelize.STRING,
  config: Sequelize.STRING,
  messages: Sequelize.STRING
})

serverConfig.sync()
module.exports = serverConfig
