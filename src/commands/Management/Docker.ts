/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { GeneralDBConfig, NezukoMessage } from 'typings'
import { get, post } from 'unirest'
import urljoin from 'url-join'

import { Command } from '../../core/base/Command'
import { BotClient } from '../../core/BotClient'
import { database } from '../../core/database/database'
import { Log } from '../../core/Logger'
import { Utils } from '../../core/Utils'

/**
 * Command to manage your servers docker containers
 */
export default class Docker extends Command {
  constructor(client: BotClient) {
    super(client, {
      args: true,
      category: 'Management',
      description: 'Manage Docker containers',
      name: 'docker',
      ownerOnly: true,
      usage: [`docker [state] [name]`, `docker list [state]`],
      webUI: true
    })
  }

  public async run(client: BotClient, msg: NezukoMessage, args: any[], api) {
    // * ------------------ Setup --------------------

    const { p } = client

    const { errorMessage, warningMessage, validOptions, standardMessage, missingConfig, embed } = Utils

    const { channel } = msg

    // * ------------------ Config --------------------
    const db = await database.models.Configs.findOne({ where: { id: client.config.ownerID } })
    const config = JSON.parse(db.get('config') as string) as GeneralDBConfig
    const { host } = config.docker

    // * ------------------ Check Config --------------------

    if (!host) {
      const settings = [`${p}config set docker host <http://ip:port>`]
      return missingConfig(msg, 'docker', settings)
    }

    // * ------------------ Logic --------------------

    const getContainers = async (state = 'running') => {
      const params = `filters={%22status%22:[%22${state}%22]}`
      try {
        const response = await get(urljoin(host, `/containers/json?${params}`)).headers({
          accept: 'application/json'
        })
        const containers = response.body as DockerContainer[]
        const containerList: ContainerList[] = []

        containers.forEach((container) => {
          const { Id, Names, Ports, State, Status, Image } = container
          const exposedports: number[] = []

          Ports.forEach((port) => {
            // Filter out only exposed host ports
            if ('PublicPort' in port) exposedports.push(port.PublicPort)
          })
          containerList.push({
            name: Names[0].replace('/', ''),
            image: Image,
            id: Id,
            state: State,
            status: Status,
            ports: exposedports
          })
        })
        return containerList
      } catch (e) {
        Log.error('Docker', 'Failed to connect to Docker', e)
        await errorMessage(msg, `Failed to connect to Docker daemon`)
      }
    }

    const setContainerState = async (containers: ContainerList[], newState: string, containerName: string) => {
      const options = ['start', 'restart', 'stop']
      if (!options.includes(newState)) return validOptions(msg, options)

      // Find index based off of key name
      const index = containers.findIndex((c) => c.name === containerName, newState)
      // If container name doesnt match
      if (!containers[index].id) {
        return warningMessage(msg, `No container named: [ ${containerName} ] found`)
      }

      try {
        const response = await post(urljoin(host, `/containers/${containers[index].id}/${newState}`))
        const { status }: { status: number } = response

        if (status >= 200 && status < 300) {
          return standardMessage(msg, 'green', `Container [ ${containerName} ] has been [ ${newState}ed ] successfully`)
        }
        if (newState !== 'restart' && status >= 300 && status < 400) {
          return warningMessage(
            msg,
            `Container [ ${containerName} ] is already [ ${newState}${newState === 'stop' ? 'ped' : 'ed'} ]`
          )
        }
      } catch (e) {
        Log.error('Docker', 'Failed to connect to Docker', e)
        await errorMessage(msg, `Failed to connect to Docker daemon`)
      }
    }

    // * ------------------ Usage Logic --------------------

    switch (args[0]) {
      case 'list': {
        const filterState = args[1] || 'running'

        const options = ['running', 'paused', 'exited', 'created', 'restarting', 'dead']
        if (!options.includes(filterState)) {
          return validOptions(msg, options)
        }

        const containers = await getContainers(filterState)
        if (containers) {
          if (containers.length) {
            const e = embed(msg, 'green', 'docker.png').setDescription('Docker Containers')

            containers.forEach((container) => {
              const { name, ports, state } = container
              e.addField(`${name}`, `${state}\n${ports.length ? ports.join(', ') : '---'}`, true)
            })

            return channel.send(e)
          }
          return warningMessage(msg, `No containers currently in state [ ${filterState} ]`)
        }
        return
      }
      default: {
        const containers = await getContainers()
        if (containers) {
          const containerName: string = args[1]
          const newState: string = args[0]
          return setContainerState(containers, newState, containerName)
        }
      }
    }
  }
}
