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
  database.models.Configs.findOne({
    where: { id }
  })

export const serverConfig = async (id: string) =>
  database.models.Servers.findOne({
    where: { id }
  })

export const memberConfig = async (id: string) =>
  database.models.Members.findOne({
    where: { id }
  })

export const jellyfinUsers = async (id: string) => database.models.JellyfinUsers.findOne({ where: { id } })
