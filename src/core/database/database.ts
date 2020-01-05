/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import { join } from 'path'
import { Sequelize } from 'sequelize-typescript'

export const database = new Sequelize({
  dialect: 'sqlite',
  logging: false,
  models: [`${__dirname}/models`],
  storage: join(`${__dirname}/../../config/db.sqlite`)
})
