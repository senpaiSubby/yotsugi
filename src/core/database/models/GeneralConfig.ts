/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import { Column, Model, Table } from 'sequelize-typescript'

@Table
export default class GeneralConfig extends Model<GeneralConfig> {
  @Column
  public username: string | undefined

  @Column
  public config: string | undefined

  @Column({ primaryKey: true })
  public id: string | undefined
}
