#!/usr/bin/env node

const program = require('commander');
const reactBuild = require('../lib/reactBuild.js');
const util = require("../lib/util");


// let init = null;
let init = reactBuild; // 默认启动 react服务
if (util.checkProjectType() === 'React Project') {
  init = reactBuild;
}
program.action(init).parse(process.argv);
