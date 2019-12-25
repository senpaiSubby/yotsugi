/*!
 * Coded by CallMeKory - https://github.com/callmekory
 */

import { Client } from 'discord.js'
import { Database } from '../core/Database/Database'
import { Log } from '../core/Logger'
import { Model } from 'sequelize/types'
import { NezukoDB } from 'types'
import Utils from '../core/Utils'

// tslint:disable-next-line:no-var-requires
const config = require('../../config/config.json')

export class NezukoClient extends Client {
  public config: {
    ownerID: string
    prefix: string
    token: string
    webServerPort: number
  } = config

  // tslint:disable-next-line:variable-name
  public Utils: typeof Utils = Utils
  public db: NezukoDB = []
  public generalConfig: any = Database.Models.generalConfig
  public serverConfig: any = Database.Models.serverConfig
  public memberConfig: any = Database.Models.memberConfig
  public p: string | undefined
  public Log: typeof Log = Log
}
