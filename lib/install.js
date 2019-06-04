const log = console.log;
const shell = require('shelljs');
const chalk = require('chalk');
const ora = require('ora');
const util = require("./util");

function install(cmd, env) {
  const npm = util.checkCmd('npm');
  let installCmd = `${npm} install ${typeof cmd === 'string' ? cmd : ''}`;
  if (env && env.saveDev) {
    installCmd = `${npm} install ${typeof cmd === 'string' ? cmd : ''} --save-dev`;
  }
  if (env && env.save) {
    installCmd = `${npm} install ${typeof cmd === 'string' ? cmd : ''} --save`;
  }
  log();
  // log(chalk.green(`> ${installCmd}`));
  const spinner = ora(chalk.cyan('下载依赖中...'));
  spinner.start();
  log();
  log();
  shell.exec(installCmd, () => {
    spinner.stop();
    log();
    log(chalk.green('依赖下载完成!'));
    log();
  });
}

module.exports = install;
