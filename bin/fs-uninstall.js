#!/usr/bin/env node

const program = require('commander');
const log = console.log;
const shell = require('shelljs');
const chalk = require('chalk');
const ora = require('ora');
const util = require("../lib/util");

function uninstall(cmd, env) {
  const npm = util.checkCmd('npm');
  let uninstallCmd = `${npm} uninstall ${typeof cmd === 'string' ? cmd : ''}`;
  if (env && env.saveDev) {
    uninstallCmd = `${npm} uninstall ${typeof cmd === 'string' ? cmd : ''} -D`;
  }
  if (env && env.save) {
    uninstallCmd = `${npm} install ${typeof cmd === 'string' ? cmd : ''} --save`;
  }
  log();
  log(chalk.green(`> ${uninstallCmd}`));
  const spinner = ora('卸载依赖中...');
  log();
  log();
  shell.exec(uninstallCmd, () => {
    log(chalk.green('依赖卸载完成'));
    spinner.stop();
  });
}

program
  .option("-D, --save-dev", "卸载开发包")
  .option("-S, --save", "卸载生产包")
  .action(uninstall)
  .parse(process.argv);
