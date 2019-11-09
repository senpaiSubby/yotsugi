// todo refactor code and functions

const Discord = require('discord.js')
const fetch = require('node-fetch')
const urljoin = require('url-join')
const config = require('../../data/config')
const { prefix } = config.general

module.exports = {
  help: {
    name: 'docker',
    category: 'Server Management',
    description: 'Docker Management',
    usage: `${prefix}docker <state> <name> | ${prefix}docker list <state>`,
    aliases: ['container']
  },
  options: {
    enabled: true,
    apiEnabled: true,
    showInHelp: true,
    ownerOnly: true,
    guildOnly: true,
    args: true,
    cooldown: 5
  },
  async execute(client, msg, args, api) {
    // -------------------------- Setup --------------------------
    const logger = client.logger

    // ------------------------- Config --------------------------

    const { host } = client.config.commands.docker

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
        logger.warn(error)
        return 'no connection'
      }
    }

    const setContainerState = async (newState, containerName) => {
      const options = ['start', 'restart', 'stop']
      if (!options.includes(newState)) return 'bad params'
      const containers = await getContainers()
      if (containers === 'bad params') {
        return 'bad params'
      } else if (containers === 'no connection') {
        return 'no connection'
      }
      // find index based off of key name
      const index = containers.findIndex((c) => c.name === containerName, newState)
      // if container name doesnt match
      if (!containers[index].id) return 'no match'
      try {
        const response = await fetch(urljoin(host, `/containers/${containers[index].id}/${newState}`), {
          method: 'POST'
        })
        const status = response.status
        if (status >= 200 && status < 300) {
          return 'success'
        } else if (newState !== 'restart' && status >= 300 && status < 400) {
          return 'same state'
        }
      } catch (error) {
        logger.warn(error)
        return 'failure'
      }
    }

    // ---------------------- Usage Logic ------------------------

    const embed = new Discord.RichEmbed()
    if (!api) {
      embed.setFooter(`Requested by: ${msg.author.username}`, msg.author.avatarURL)
    }

    switch (args[0]) {
      case 'list': {
        const filterState = args[1]
        const containers = await getContainers(filterState)
        if (containers === 'bad params') {
          if (api) return 'Valid options are `running, paused, exited, created, restarting, dead`'

          embed.setTitle(':rotating_light: Valid options are `running, paused, exited, created, restarting, dead`')
          return msg.channel.send({ embed })
        } else if (containers === 'no connection') {
          if (api) return 'Could not connect to the docker daemon.'

          embed.setTitle(':rotating_light: Could not connect to the docker daemon.')
          return msg.channel.send({ embed })
        }

        if (api) return containers

        embed.setTitle('Docker Containers')

        for (const container of containers) {
          const { name, ports, state } = container
          embed.addField(`${name}`, `${state}\n${ports.length ? ports.join(', ') : '---'}`, true)
        }

        return msg.channel.send({ embed })
      }
      default: {
        const containerName = args[1]
        const newState = args[0]
        const status = await setContainerState(newState, containerName)

        switch (status) {
          case 'bad params':
            if (api) return 'Valid options are `start, restart, stop'

            embed.setTitle(':rotating_light: Valid options are `start, restart, stop`')
            return msg.channel.send({ embed })

          case 'no match':
            if (api) return `No container named: ${containerName} found.`

            embed.setTitle(`:rotating_light: No container named: ${containerName} found.`)
            return msg.channel.send({ embed })

          case 'success':
            if (api) return `Container: ${containerName} has been ${newState}ed successfully.`

            embed.setTitle(`:ok_hand: Container: ${containerName} has been ${newState}ed successfully.`)
            return msg.channel.send({ embed })

          case 'same state':
            if (api) {
              return `Container: ${containerName} is already ${newState}${newState === 'stop' ? 'ped' : 'ed'}.`
            }

            embed.setTitle(`:warning: Container: ${containerName} is already ${newState}${newState === 'stop' ? 'ped' : 'ed'}.`)
            return msg.channel.send({ embed })

          case 'failure':
            if (api) return 'Action could not be completed.'

            embed.setTitle(':rotating_light: Action could not be completed.')
            return msg.channel.send({ embed })
        }
        break
      }
    }
  }
}
