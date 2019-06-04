#!/usr/bin/env node --max-old-space-size=16384

const program = require('commander');
const pkg = require('../package.json');

if (typeof localStorage === "undefined" || localStorage === null) {
  const LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

program
  .version(pkg.version, '-v, --version')
  .usage('<command> [options]')
  .command('init [cmd]', '初始化项目')
  .command('dev', '开发模式')
  .command('build', '打包')
  .command('install [cmd]', '安装依赖').alias('i')
  .command('uninstall [cmd]', '安装依赖').alias('u')
  .command('resume', '个人介绍')
  .parse(process.argv);
