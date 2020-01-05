/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import { Column, Model, Table } from 'sequelize-typescript'

@Table
export default class MemberConfig extends Model<MemberConfig> {
  @Column
  public username: string | undefined

  @Column
  public config: string | undefined
  @Column
  public levels: string | undefined

  @Column({ primaryKey: true })
  public id: string | undefined
}
