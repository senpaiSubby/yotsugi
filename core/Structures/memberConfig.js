const Sequelize = require('sequelize')
const Database = require('../Database')

const memberConfig = Database.db.define('memberConfig', {
  username: Sequelize.STRING,
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  todos: Sequelize.STRING,
  messages: Sequelize.STRING
})

memberConfig.sync()
module.exports = memberConfig
