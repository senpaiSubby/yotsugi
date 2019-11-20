const Sequelize = require('sequelize')
const path = require('path')

const database = new Sequelize({
  logging: false,
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'data', 'db.sqlite')
})

class Database {
  static get db() {
    return database
  }

  static get Models() {
    return {
      serverConfig: require('./Structures/serverConfig'),
      generalConfig: require('./Structures/generalConfig')
    }
  }
}

module.exports = Database
