const log = console.log;
// const child_process = require('child_process');
const inquirer = require('inquirer');
const shell = require('shelljs');
const path = require('path');
const chalk = require('chalk');
const vfs = require('vinyl-fs');
const install = require("./install");
const templatePath = path.join(__dirname, '../boilerplate/react-project/**/*');
// const templateVuePath1 = path.join(__dirname, '../boilerplate/vue-project/.*');
// const templateVuePath2 = path.join(__dirname, '../boilerplate/vue-project/*');
const currentPath = process.cwd();

const util = require("./util");

// 初始化react项目
function initReactProject(answers = {}) {
  log();
  log(chalk.cyan('开始初始化项目...'));
  log();
  vfs.src([templatePath, '!node_modules/**/*', '!.git/**/*'], { dot: true, }).pipe(vfs.dest('./')).on('end', function() {
    util.modifyPackage(answers);
    log(chalk.green('项目初始化完成'));
    log();
    log(chalk.cyan('开始下载依赖...'));
    install();
  });
}

// 初始化vue项目
function initVueProject() {
  log('开始初始化项目...');
  shell.cp('-R', templateVuePath1, currentPath);
  shell.cp('-R', templateVuePath2, currentPath);
  log('项目初始化完成');
  log('请按照 README 自行初始化项目');
}

// 默认初始化react项目
function initDefaultProject() {
  const questions = [
    {
      type: 'list',
      name: 'type',
      message: '请指定工程类型',
      choices: ['React Project', 'React Mobile Project'],
    },
    {
      type: 'input',
      name: 'name',
      message: '请输入项目名称',
      default: 'starfish',
    },
    {
      type: 'input',
      name: 'version',
      message: '请输入项目版本',
      default: '1.0.0',
    },
  ];
  inquirer.prompt(questions).then((answers) => {
    const { type } = answers;
    // 项目类型
    switch (type) {
      case 'React Project': 
        initReactProject(answers);
        localStorage.setItem('projectType', 'React Project')
        break;
      case 'React Mobile Project':
        localStorage.setItem('projectType', 'React Mobile Project')
        log(chalk.rgb(163, 224, 106)('\n暂无该项目'));
        // log(chalk.rgb(163, 224, 106)('敬请期待\n'));
        break;
      default:
        initReactProject();
    }
  });
}

function initProject(cmd) {
  if (cmd === 'react') {
    initReactProject();
  // } else if (cmd === 'vue') {
    // initVueProject();
  } else if (typeof cmd === 'object') {
    initDefaultProject();
  } else {
    // 默认构建 React 项目
    initReactProject();
  }
}

// 初始化的方法
function init(cmd, env) {
  util.emptyDirectory(currentPath, function(isEmptyDir) {
    if (isEmptyDir) {
      initProject(cmd);
    } else {
      const question = {
        type: 'confirm',
        name: 'shouldInit',
        message:
          chalk.yellow('当前目录不为空') + '\n\n是否继续初始化项目?',
        default: true,
      };
      inquirer.prompt(question).then(answer => {
        // console.log(answer.shouldInit);
        if (answer.shouldInit) {
          initProject(cmd);
        } else {
          process.exit(1);
        }
      });
    }
  });
  
};

module.exports = init;