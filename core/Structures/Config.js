const Sequelize = require('sequelize')
const Database = require('../Database')

const Config = Database.db.define('config', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  prefix: Sequelize.STRING
})

Config.sync()
module.exports = Config
