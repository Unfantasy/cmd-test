#!/usr/bin/env node

const program = require('commander');
const install = require("../lib/install");

program
  .option("-D, --save-dev", "安装开发包")
  .option("-S, --save", "安装生产包")
  .action(install)
  .parse(process.argv);
