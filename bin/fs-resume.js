#!/usr/bin/env node

const program = require('commander');
const resume = require('../lib/resume.js');

program.option('-b, --basicinfo [type]', '基本信息').option('-e, --education [type]', '教育经历').option('-i, --itskill   [type]', 'IT技能').action(resume).parse(process.argv);
