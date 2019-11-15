// This module serves as a custom logger using loglevel

const chalk = require('chalk')
const log = require('loglevel')
const prefix = require('loglevel-plugin-prefix')

const colors = {
  TRACE: chalk.magenta,
  DEBUG: chalk.cyan,
  INFO: chalk.blue,
  WARN: chalk.yellow,
  ERROR: chalk.red
}

prefix.reg(log)
log.enableAll()

prefix.apply(log, {
  format(level, name, timestamp) {
    return `${chalk.gray(`[${timestamp}]`)} ${colors[level.toUpperCase()](level)}:`
  }
})

prefix.apply(log.getLogger('critical'), {
  format(level, name, timestamp) {
    return chalk.red.bold(`[${timestamp}] ${level}:`)
  }
})
/*
log.trace('trace')
log.debug('debug')
log.getLogger('critical').info('Something significant happened')
log.log('log')
log.info('info')
log.warn('warn')
*/
module.exports = log
