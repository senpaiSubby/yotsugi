const fetch = require("node-fetch")
const config = require("../config.json")

const host = config.network.healthChecks.host
const protocol = config.network.healthChecks.protocol
const subDomains = config.network.healthChecks.subDomains

async function checkStatus(url) {
  return fetch(url).then(res => {
    const status = res.status
    if (status === 200) {
      return "U"
    } else {
      return "D"
    }
  })
}

async function healthChecks() {
  const services = []
  for (let item of subDomains) {
    const url = `${protocol}://${item}.${host}`
    const status = await checkStatus(url)
    services.push({ host: item.charAt(0).toUpperCase() + item.slice(1), status: status })
  }
  return services
}

module.exports.healthChecks = healthChecks
