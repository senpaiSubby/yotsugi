/*!
 * Coded by CallMeKory - https://github.com/callmekory
 */

import { Database } from '../Database'
import sequelize from 'sequelize'

export const memberConfig = Database.db.define('memberConfig', {
  username: sequelize.STRING,
  id: {
    type: sequelize.STRING,
    primaryKey: true
  },
  config: sequelize.STRING
})

memberConfig.sync()
