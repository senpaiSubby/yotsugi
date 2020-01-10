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

export const generalConfig = async (id: string) =>
  await database.models.GeneralConfig.findOne({
    where: { id }
  })

export const serverConfig = async (id: string) =>
  await database.models.ServerConfig.findOne({
    where: { id }
  })

export const memberConfig = async (id: string) =>
  await database.models.MemberConfig.findOne({
    where: { id }
  })
