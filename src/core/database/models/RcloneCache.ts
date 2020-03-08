/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { Column, Model, Table } from 'sequelize-typescript'

@Table
export default class RcloneCache extends Model<RcloneCache> {
  @Column
  public cache: string | undefined

  @Column({ primaryKey: true })
  public id: string | undefined
}
