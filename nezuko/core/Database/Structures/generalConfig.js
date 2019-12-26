const Sequelize = require('sequelize')
const Database = require('../Database')

const generalConfig = Database.db.define('generalConfig', {
  username: Sequelize.STRING,
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  config: Sequelize.STRING
})

generalConfig.sync()
module.exports = generalConfig
