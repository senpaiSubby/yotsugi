const Sequelize = require('sequelize')
const { join } = require('path')

const database = new Sequelize({
  logging: false,
  dialect: 'sqlite',
  storage: join(__dirname, '../../..', 'config', 'db.sqlite')
})

module.exports = class Database {
  static get db() {
    return database
  }

  static get Models() {
    return {
      serverConfig: require('./Structures/serverConfig'),
      generalConfig: require('./Structures/generalConfig'),
      memberConfig: require('./Structures/memberConfig')
    }
  }
}
