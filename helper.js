const chalk = require('chalk')


//method to show colorful log messages into terminal
const log = {
    error: (msg) => console.log(chalk.red.bold(msg)),
    info: (msg) => console.log(chalk.blue.bold(msg)),
    warn: (msg) => console.log(chalk.yellow.bold(msg)),
    success: (msg) => console.log(chalk.magenta.bold(msg)),
    success: (msg) => console.log(chalk.magenta.bold(msg)),
    win: (msg) => console.log(chalk.green.bold(msg)),
  };

module.exports = {log};