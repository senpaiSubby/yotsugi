/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import { Column, Model, Table } from 'sequelize-typescript'

@Table
export default class ServerConfig extends Model<ServerConfig> {
  @Column
  public serverName: string | undefined

  @Column({ primaryKey: true })
  public id: string | undefined

  @Column
  public ownerID: string | undefined

  @Column
  public config: string | undefined

  @Column
  public messages: string | undefined

  @Column
  public memberLevels: string | undefined
}
