/*!
 * Coded by CallMeKory - https://github.com/callmekory
 */

import { Database } from '../Database'
import sequelize from 'sequelize'

export const generalConfig = Database.db.define('generalConfig', {
  username: sequelize.STRING,
  id: {
    type: sequelize.STRING,
    primaryKey: true
  },
  config: sequelize.STRING
})

generalConfig.sync()
