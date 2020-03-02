/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import generator from 'generate-password'
import { NezukoMessage } from 'typings'
import unirest, { get, post } from 'unirest'

import { Command } from '../../core/base/Command'
import { database } from '../../core/database/database'
import { NezukoClient } from '../../core/NezukoClient'

export default class JFManager extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'jfm',
      category: 'Server Management',
      description: 'Manages Jellyfin Server Management server account',
      ownerOnly: true,
      args: true,
      usage: [
        'jfm add <@user | username>',
        'jfm remove <@user | username>',
        'jfm reset <@user | username>',
        'jfm users'
      ]
    })
  }

  public async run(client: NezukoClient, msg: NezukoMessage, args: string[]) {
    // * ------------------ Setup --------------------

    const { standardMessage, embed, warningMessage, errorMessage, validOptions, missingConfig } = client.Utils
    const { channel, p } = msg

    // * ------------------ Config --------------------

    const { apiKey, host, userID, username, password } = client.db.config.jellyfin

    // * ------------------ Check Config --------------------

    if (!host || !apiKey || !userID || !username || !password) {
      const settings = [
        `${p}config set jellyfin host <http://ip>`,
        `${p}config set jellyfin apiKey <APIKEY>`,
        `${p}config set jellyfin username <USERNAME>`,
        `${p}config set jellyfin userID <USERID>`,
        `${p}config set jellyfin password <PASSWORD>`
      ]
      return missingConfig(msg, 'jellyfin', settings)
    }

    let token = null

    // * ------------------ Logic --------------------

    const createRandomPassword = () =>
      generator.generate({
        length: 10,
        numbers: true
      })

    /**
     * Logins and saves the Authorization token
     */
    const login = async () => {
      const response = await post(`${host}/jellyfin/Users/AuthenticateByName`)
        .headers({
          'X-Emby-Authorization':
            'Emby UserId="(guid)", Client="(string)", Device="(string)", DeviceId="(string)", Version="string", Token="(string)"'
        })
        .send({
          Username: username,
          Pw: password,
          Password: password
        })

      if (response.code === 200) {
        token = response.body.AccessToken
        return true
      }

      return false
    }

    /**
     * Get the users from JF
     */
    const getUsers = async () => {
      const response = await get(`${host}/jellyfin/Users?api_key=${apiKey}`).headers({ 'X-Emby-Token': token })
      if (response.code === 200) {
        interface ParsedUserList {
          username: string
          userID: string
        }
        const userList = response.body.map((u) => ({ username: u.Name, userID: u.Id }))
        return userList.sort() as ParsedUserList[]
      }
    }

    const removeUser = async (ID: string) => {
      const response = await unirest.delete(`${host}/jellyfin/Users/${ID}`).headers({ 'X-Emby-Token': token })

      switch (response.code) {
        case 204: {
          return standardMessage(msg, 'green', `User has been removed`)
        }
      }
    }

    /**
     * Resets the password for the specified user
     * @param ID User ID of user to reset password
     */
    const resetPassword = async (ID: string) => {
      const response = await post(`${host}/jellyfin/Users/${ID}/Password`)
        .headers({ 'X-Emby-Token': token })
        .send({
          Id: userID,
          ResetPassword: true
        })

      if (response.code === 204) return true
    }

    /**
     * Set the password of the specified user
     * @param ID User ID of the user to set password
     */
    const setUserPassword = async (ID: string, newPass: string) => {
      const response = await post(`${host}/jellyfin/Users/${ID}/Password`)
        .headers({ 'X-Emby-Token': token })
        .send({
          Id: ID,
          CurrentPw: '',
          NewPw: newPass
        })

      if (response.code === 204) return true
    }

    /**
     * Create a new user with the specified username
     * @param name Name of the user to create
     */
    const createUser = async (name: string) => {
      try {
        const response = await post(`${host}/jellyfin/Users/New?api_key=${apiKey}`)
          .headers({ 'X-Emby-Token': token })
          .send({ name })

        switch (response.code) {
          case 200: {
            const { Name, Id } = response.body
            const newPassword = createRandomPassword()

            await setUserPassword(Id, newPassword)

            return { newPassword, name: Name, ID: Id }
          }
          case 400: {
            await warningMessage(msg, `The user [ ${name} ] is already added to Jellyfin`)
            break
          }
          case 401: {
            await errorMessage(msg, `Your access token is invalid`)
            break
          }
        }
      } catch {
        // Error connecting
      }
    }

    /**
     * Check if user has a Jellyfin account
     * if so then return details
     * @param user Username of Jellyfin user
     */
    const getUserInfo = async (user: string) => {
      const userList = await getUsers()
      const foundUser = userList.find((u) => u.username.toLowerCase() === user.toLowerCase())

      if (foundUser) return foundUser
    }

    // * ------------------ Usage Logic --------------------

    if (await login()) {
      const command = args[0]
      args.shift()
      const discordMember = msg.mentions.members.first()
      const userList = await getUsers()

      if (userList) {
        switch (command) {
          case 'users': {
            const e = embed(msg, '#9B62C5')
              .setTitle('Jellyfin User List')
              .setThumbnail('https://apps.jellyfin.org/chromecast/img/logo.png')

            userList.forEach((u) => e.addField(u.username, '\u200b', true))

            return channel.send(e)
          }
          case 'reset': {
            let member = args[0]

            if (discordMember) member = discordMember.user.username.toLowerCase()

            const foundUser = await getUserInfo(member)

            if (foundUser) {
              const newPass = createRandomPassword()
              if ((await resetPassword(foundUser.userID)) && (await setUserPassword(foundUser.userID, newPass))) {
                if (discordMember) {
                  await discordMember.send(
                    embed(msg, '#9B62C5')
                      .setThumbnail('https://apps.jellyfin.org/chromecast/img/logo.png')
                      .setTitle('JellyFin Manager')
                      .setDescription(
                        `Your password has been reset.
                    Here are your new login details`
                      )
                      .addField('Username', member, true)
                      .addField('New Password', newPass, true)
                  )
                }

                return channel.send(
                  embed(msg, '#9B62C5')
                    .setThumbnail('https://apps.jellyfin.org/chromecast/img/logo.png')
                    .setTitle('JellyFin Manager')
                    .setDescription(`Successfully reset password.`)
                    .addField('Username', member, true)
                    .addField('New Password', newPass, true)
                    .addField('User ID', foundUser.userID)
                )
              }

              return warningMessage(msg, `No user by the name [ ${args[0]} ] to reset password for`)
            }
            return warningMessage(msg, 'An error occured')
          }
          case 'remove': {
            let member = args[0]

            if (discordMember) member = discordMember.user.username.toLowerCase()

            const foundUser = await getUserInfo(member)
            if (foundUser) return removeUser(foundUser.userID)

            return warningMessage(msg, `No user by the name [ ${member} ] to remove`)
          }
          case 'add': {
            let user = args[0].toLowerCase()
            let discordID: string

            if (discordMember) {
              user = discordMember.user.username.toLowerCase()
              discordID = discordMember.user.id
            }

            const isCreated = await createUser(user)

            if (isCreated) {
              const { name, ID, newPassword } = isCreated

              const db = await database.models.JellyfinUsers.findOne({ where: { id: ID } })
              if (!db) {
                const data = {
                  jfUsername: name,
                  discordUsername: null,
                  discordID: null,
                  plan: null,
                  lastPayment: null,
                  nextPayment: null,
                  id: ID
                }

                if (discordMember) {
                  data.discordUsername = user
                  data.discordID = discordID
                }

                await database.models.Jellyfin.create(data)
              }

              if (discordMember) {
                discordMember.send(
                  embed(msg, '#9B62C5')
                    .setThumbnail('https://apps.jellyfin.org/chromecast/img/logo.png')
                    .setTitle('Welcome to TLD Server Management')
                    .setDescription(
                      `You've been added to TLD Server Managements Jellyfin server.
                    You can login at https://somesite.com`
                    )
                    .addField('Username', name, true)
                    .addField('Password', newPassword, true)
                )
              }

              return channel.send(
                embed(msg, '#9B62C5')
                  .setThumbnail('https://apps.jellyfin.org/chromecast/img/logo.png')
                  .setTitle('JellyFin Manager')
                  .setDescription(`Sucessfully created a new account.`)
                  .addField('Username', name, true)
                  .addField('Password', newPassword, true)
                  .addField('User ID', ID)
              )
            }
            return
          }
          default:
            return validOptions(msg, ['add', 'remove', 'reset', 'users'])
        }
      }
    }

    return errorMessage(msg, 'Failed to connect to Jellfin instance. Maybe the username/password is incorrect?')
  }
}
