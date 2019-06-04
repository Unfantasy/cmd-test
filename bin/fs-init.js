#!/usr/bin/env node

const program = require('commander');
const init = require('../lib/init.js');

program.action(init).parse(process.argv);
