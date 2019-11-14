const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('./data/db.json')
const db = low(adapter)

//db.defaults({ uiButtons: [] }).write()

module.exports = db
