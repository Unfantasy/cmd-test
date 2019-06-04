#!/usr/bin/env node

const program = require('commander');
const reactDev = require('../lib/reactDev.js');
const util = require("../lib/util");


// let init = null;
let init = reactDev; // 默认启动 react服务
if (util.checkProjectType() === 'React Project') {
  init = reactDev;
}
program.action(init).parse(process.argv);
