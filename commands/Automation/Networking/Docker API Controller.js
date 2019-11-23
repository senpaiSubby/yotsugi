// todo refactor code and functions
const fetch = require('node-fetch')
const urljoin = require('url-join')
const Command = require('../../../core/Command')

class DockerManagement extends Command {
  constructor(client) {
    super(client, {
      name: 'docker',
      category: 'Networking',
      description: 'Docker Management',
      usage: `docker <state> <name> | docker list <state>`,
      aliases: ['container'],
      ownerOnly: true,
      webUI: true,
      args: true
    })
  }

  async run(client, msg, args, api) {
    // -------------------------- Setup --------------------------
    const { p, Log, Utils, colors } = client
    const { errorMessage, warningMessage, validOptions, standardMessage, missingConfig } = Utils
    const { channel } = msg
    // ------------------------- Config --------------------------

    const { host } = JSON.parse(client.settings.docker)
    if (!host) {
      const settings = [`${p}db set docker host <http://ip>`]
      return missingConfig(msg, 'docker', settings)
    }
    // ----------------------- Main Logic ------------------------

    /**
     *
     * @param {String} state state of container. Ex: running/exited
     * @return {list} list of containers based on state specified
     */
    const getContainers = async (state = 'running') => {
      const options = ['running', 'paused', 'exited', 'created', 'restarting', 'dead']
      if (!options.includes(state)) return 'bad params'
      const params = `filters={%22status%22:[%22${state}%22]}`
      try {
        const response = await fetch(urljoin(host, `/containers/json?${params}`))
        const containers = await response.json()
        const containerList = []

        for (const container of containers) {
          const { Id, Names, Ports, State, Status } = container
          const exposedports = []

          for (const port of Ports) {
            // filter out only exposed host ports
            if ('PublicPort' in port) exposedports.push(port.PublicPort)
          }
          containerList.push({
            name: Names[0].replace('/', ''),
            id: Id,
            state: State,
            status: Status,
            ports: exposedports
          })
        }
        return containerList
      } catch (error) {
        Log.warn(error)
        return 'no connection'
      }
    }

    const setContainerState = async (newState, containerName) => {
      const options = ['start', 'restart', 'stop']
      if (!options.includes(newState)) return 'bad params'
      const containers = await getContainers()
      if (containers === 'bad params') {
        return 'bad params'
      }
      if (containers === 'no connection') {
        return 'no connection'
      }
      // find index based off of key name
      const index = containers.findIndex((c) => c.name === containerName, newState)
      // if container name doesnt match
      if (!containers[index].id) return 'no match'
      try {
        const response = await fetch(
          urljoin(host, `/containers/${containers[index].id}/${newState}`),
          {
            method: 'POST'
          }
        )
        const { status } = response
        if (status >= 200 && status < 300) {
          return 'success'
        }
        if (newState !== 'restart' && status >= 300 && status < 400) {
          return 'same state'
        }
      } catch (error) {
        Log.warn(error)
        return 'failure'
      }
    }

    // ---------------------- Usage Logic ------------------------

    const embed = Utils.embed(msg, 'green')

    switch (args[0]) {
      case 'list': {
        const filterState = args[1]
        const containers = await getContainers(filterState)
        if (containers === 'bad params') {
          if (api) return 'Valid options are `running, paused, exited, created, restarting, dead`'
          embed.setColor(colors.yellow)
          return validOptions(msg, ['running', 'paused', 'exited', 'created', 'restarting', 'dead'])
        }
        if (containers === 'no connection') {
          if (api) return 'Could not connect to the docker daemon'
          return errorMessage(msg, `Could not connect to the docker daemon`)
        }

        if (api) return containers

        embed.setDescription('Docker Containers')

        for (const container of containers) {
          const { name, ports, state } = container
          embed.addField(`${name}`, `${state}\n${ports.length ? ports.join(', ') : '---'}`, true)
        }

        return channel.send({ embed })
      }
      default: {
        const containerName = args[1]
        const newState = args[0]
        const status = await setContainerState(newState, containerName)

        switch (status) {
          case 'bad params': {
            if (api) return 'Valid options are `start, restart, stop'
            return validOptions(msg, ['start', 'restart', 'stop'])
          }

          case 'no match':
            if (api) return `No container named: ${containerName} found.`
            return warningMessage(msg, `No container named: ${containerName} found`)

          case 'success':
            if (api) return `Container: ${containerName} has been ${newState}ed successfully`

            return standardMessage(
              msg,
              `Container ${containerName} has been ${newState}ed successfully`
            )

          case 'same state':
            if (api) {
              return `Container: ${containerName} is already ${newState}${
                newState === 'stop' ? 'ped' : 'ed'
              }`
            }

            return warningMessage(
              msg,
              `Container ${containerName} is already ${newState}${
                newState === 'stop' ? 'ped' : 'ed'
              }`
            )

          case 'failure':
            if (api) return 'Action could not be completed'

            return errorMessage(msg`Action could not be completed`)
          default:
            break
        }
        break
      }
    }
  }
}
module.exports = DockerManagement
