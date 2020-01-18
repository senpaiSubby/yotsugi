/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { Column, Model, Table } from 'sequelize-typescript'

@Table
export default class JellyfinUsers extends Model<JellyfinUsers> {
  @Column
  public jfUsername: string | undefined

  @Column
  public discordUsername: string | undefined
  @Column
  public discordID: string | undefined
  @Column
  public plan: string | undefined
  @Column
  public lastPayment: string | undefined
  @Column
  public nextPayment: string | undefined
  @Column
  public email: string | undefined

  @Column({ primaryKey: true })
  public id: string | undefined
}
