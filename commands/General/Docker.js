// todo refactor code and functions
const fetch = require('node-fetch')
const urljoin = require('url-join')
const Command = require('../../core/Command')

module.exports = class Docker extends Command {
  constructor(client) {
    super(client, {
      name: 'docker',
      category: 'General',
      description: 'Docker Management',
      usage: [`docker <state> <name>`, `docker list <state>`],
      aliases: ['container'],
      ownerOnly: true,
      webUI: true,
      args: true
    })
  }

  async run(client, msg, args, api) {
    // * ------------------ Setup --------------------

    const { p, Utils, Log } = client

    const {
      errorMessage,
      warningMessage,
      validOptions,
      standardMessage,
      missingConfig,
      embed
    } = Utils

    const { channel } = msg

    // * ------------------ Config --------------------

    const { host } = client.db.config.docker

    // * ------------------ Check Config --------------------

    if (!host) {
      const settings = [`${p}db set docker host <http://ip>`]
      return missingConfig(msg, 'docker', settings)
    }

    // * ------------------ Logic --------------------

    const getContainers = async (state = 'running') => {
      const params = `filters={%22status%22:[%22${state}%22]}`
      try {
        const response = await fetch(urljoin(host, `/containers/json?${params}`))
        const containers = await response.json()
        const containerList = []

        containers.forEach((container) => {
          const { Id, Names, Ports, State, Status } = container
          const exposedports = []

          Ports.forEach((port) => {
            // filter out only exposed host ports
            if ('PublicPort' in port) exposedports.push(port.PublicPort)
          })
          containerList.push({
            name: Names[0].replace('/', ''),
            id: Id,
            state: State,
            status: Status,
            ports: exposedports
          })
        })
        return containerList
      } catch (e) {
        if (api) return `Failed to connect to Docker daemon`
        Log.error('Docker', 'Failed to connect to Docker', e)
        await errorMessage(msg, `Failed to connect to Docker daemon`)
      }
    }

    const setContainerState = async (containers, newState, containerName) => {
      const options = ['start', 'restart', 'stop']
      if (!options.includes(newState)) return validOptions(msg, options)

      // find index based off of key name
      const index = containers.findIndex((c) => c.name === containerName, newState)
      // if container name doesnt match
      if (!containers[index].id) {
        return warningMessage(msg, `No container named: ${containerName} found`)
      }

      try {
        const response = await fetch(
          urljoin(host, `/containers/${containers[index].id}/${newState}`),
          {
            method: 'POST'
          }
        )
        const { status } = response
        if (status >= 200 && status < 300) {
          if (api) return `Container ${containerName} has been ${newState}ed successfully`
          return standardMessage(
            msg,
            `Container ${containerName} has been ${newState}ed successfully`
          )
        }
        if (newState !== 'restart' && status >= 300 && status < 400) {
          if (api) {
            return `Container ${containerName} is already ${newState}${
              newState === 'stop' ? 'ped' : 'ed'
            }`
          }
          return warningMessage(
            msg,
            `Container ${containerName} is already ${newState}${newState === 'stop' ? 'ped' : 'ed'}`
          )
        }
      } catch (e) {
        if (api) return `Failed to connect to Docker daemon`
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
          if (api) return `Valid options are [ ${options.join(', ')} ]`
          return validOptions(msg, options)
        }

        const containers = await getContainers(filterState)
        if (containers) {
          if (containers.length) {
            if (api) return containers
            const e = embed('green').setDescription('Docker Containers')

            containers.forEach((container) => {
              const { name, ports, state } = container
              e.addField(`${name}`, `${state}\n${ports.length ? ports.join(', ') : '---'}`, true)
            })

            return channel.send(e)
          }
          if (api) return `No containers currently in state [ ${filterState} ]`
          return warningMessage(msg, `No containers currently in state [ ${filterState} ]`)
        }
        return
      }
      default: {
        const containers = await getContainers()
        if (containers) {
          const containerName = args[1]
          const newState = args[0]
          return setContainerState(containers, newState, containerName)
        }
      }
    }
  }
}
