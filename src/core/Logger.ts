/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import chalk from 'chalk'
import moment from 'moment'
import { format } from 'util'

export class Log {
  // Throw error if someone tries to create an instance
  constructor() {
    throw new Error(`${this.constructor.name} class cannot be instantiated`)
  }

  // Logging Time Format
  public static time() {
    return moment().format('MM-DD h:mm A')
  }

  public static ok(name: string, message: string | Error) {
    return Log.logger(chalk.green.bold, 'OK', name, message)
  }

  public static error(name: string, message: string | Error, stacktrace = null) {
    return Log.logger(chalk.red.bold, 'ERROR', name, message, stacktrace)
  }

  public static warn(name: string, message: string | Error) {
    return Log.logger(chalk.yellow.bold, 'WARN', name, message)
  }

  public static info(name: string, message: string | Error) {
    return Log.logger(chalk.blue.bold, 'INFO', name, message)
  }

  public static debug(name: string, message: string | Error) {
    return Log.logger(chalk.magenta.bold, 'DEBUG', name, message)
  }

  // Logger
  private static logger(
    style: chalk.Chalk,
    errorType: string | boolean,
    name: string,
    message: string | Error,
    stacktrace?: any
  ) {
    const msg = `[${chalk.grey(Log.time())}] ${style(errorType)}: ${chalk.green(name)} ${chalk.yellow(
      message ? `${chalk.white('-')} ${message}` : ''
    )}`

    // Logger Stacktrace
    if (stacktrace) {
      console.log(msg)
      return console.trace(format(message))
    }

    // Logger Normally
    return console.log(msg)
  }
}
