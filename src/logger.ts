'use strict';

import chalk from 'chalk';

export const log = {
  info: console.log.bind(console, chalk.gray.bold('suman-utils info:')),
  warning: console.error.bind(console, chalk.yellow('suman-utils warn:')),
  error: console.error.bind(console, chalk.redBright('suman-utils error:')),
  good: console.log.bind(console, chalk.cyan('suman-utils:')),
  veryGood: console.log.bind(console, chalk.green('suman-utils:'))
};

export default log;
