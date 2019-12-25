/*!
 * Coded by CallMeKory - https://github.com/callmekory
 */

import { Sequelize } from 'sequelize'
import { generalConfig } from './Structures/generalConfig'
import { join } from 'path'
import { memberConfig } from './Structures/memberConfig'
import { serverConfig } from './Structures/serverConfig'

const database = new Sequelize({
  logging: false,
  dialect: 'sqlite',
  storage: join(`${__dirname}/../../../config/db.sqlite`)
})

export class Database {
  static get db() {
    return database
  }

  static get Models() {
    return {
      serverConfig,
      generalConfig,
      memberConfig
    }
  }
}
