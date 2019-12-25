/*!
 * Coded by CallMeKory - https://github.com/callmekory
 */

import { Database } from '../Database'
import sequelize from 'sequelize'

export const serverConfig = Database.db.define('serverConfig', {
  serverName: sequelize.STRING,
  id: {
    type: sequelize.STRING,
    primaryKey: true
  },
  ownerID: sequelize.STRING,
  config: sequelize.STRING,
  messages: sequelize.STRING
})

serverConfig.sync()
