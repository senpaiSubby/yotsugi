const moment = require('moment')
const fs = require('fs')
const path = require('path')

const setup = (client) => {
  //* load commands from ./commands folder
  const cmdFiles = client.utils.findNested('./commands', '.js')
  cmdFiles.forEach((file) => {
    const command = require(file)
    client.commands.set(command.help.name, command)
  })
  console.log(`Loaded ${cmdFiles.length} commands`)

  //* load events from ./events folder
  fs.readdir('./events/', (err, files) => {
    if (err) console.error(err)
    const jsFiles = files.filter((f) => f.split('.').pop() === 'js')
    jsFiles.forEach((f, i) => {
      require(`../events/${f}`)
    })
  })
}

const findNested = (dir, pattern) => {
  let results = []

  fs.readdirSync(dir).forEach((innerDir) => {
    innerDir = path.resolve(dir, innerDir)

    const stat = fs.statSync(innerDir)

    if (stat.isDirectory()) {
      results = results.concat(findNested(innerDir, pattern))
    }
    if (stat.isFile() && innerDir.endsWith(pattern)) {
      results.push(innerDir)
    }
  })
  return results
}

const addSpace = (count) => {
  return '\ufeff '.repeat(count)
}

const capitalize = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}

const sortByKey = (array, key) => {
  let sortOrder
  if (key[0] === '-') {
    sortOrder = -1
    key = key.substr(1)
  }
  if (sortOrder === -1) {
    return array.sort((a, b) => {
      const x = a[key]
      const y = b[key]
      return x < y ? -1 : x > y ? 1 : 0
    })
  } else {
    return array.sort((a, b) => {
      const x = b[key]
      const y = a[key]
      return x < y ? -1 : x > y ? 1 : 0
    })
  }
}

const bytesToSize = (bytes, decimals = 1) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

const millisecondsToTime = (ms) => {
  var duration = moment.duration(ms)
  if (duration.asHours() > 1) {
    return Math.floor(duration.asHours()) + moment.utc(duration.asMilliseconds()).format(':mm:ss')
  } else {
    return moment.utc(duration.asMilliseconds()).format('mm:ss')
  }
}

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

module.exports = {
  setup,
  addSpace,
  capitalize,
  sortByKey,
  millisecondsToTime,
  findNested,
  bytesToSize,
  sleep
}
