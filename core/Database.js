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
      Config: require('./Structures/Config')
    }
  }
}

module.exports = Database
