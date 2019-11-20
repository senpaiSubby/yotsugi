const Sequelize = require('sequelize')
const Database = require('../Database')

const mainConfig = Database.db.define('mainConfig', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  }
})

mainConfig.sync()
module.exports = mainConfig
