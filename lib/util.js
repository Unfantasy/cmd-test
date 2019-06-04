// npm 相关工具
const shell = require('shelljs');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const currentPath = process.cwd();
if (typeof localStorage === "undefined" || localStorage === null) {
  const LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

// 检测命令是否存在
function checkCmd(cmd) {
  // if (shell.which('cnpm')) {
  //   return 'cnpm';
  // } else 
  if (shell.which(cmd)) {
    return cmd;
  } else {
    log(chalk.red(`当前环境未安装${cmd}命令!`));
    log(chalk.red(`请安装${npm}后重试`));
    log(chalk.red(`当前进程已退出`));
    process.exit(1);
  }
}

// 获取项目类型
function checkProjectType() {
  const projectType = localStorage.getItem('projectType');
  return projectType || '';
}

// 合并路径 -- 相对路径
function mergePath(path1, path2) {
  return path.join(path1, path2);
}

// 修改package.json文件
function modifyPackage(payload) {
  const pkg = require(currentPath + '/package.json');
  Object.keys(payload).forEach((key) => {
    pkg[key] = payload[key];
  });
  fs.writeFileSync(currentPath + '/package.json', JSON.stringify(pkg,null,2));
}

function abort(str) {
	console.error(str);
	process.exit(1);
}

// 判断目录是否为空
function emptyDirectory(path, fn) {
  // 需要忽略的文件白名单
  const whiteList = ['scratch']
	fs.readdir(path, function (err, files) {
    if (err && 'ENOENT' !== err.code) {
      abort(FILEREAD_ERROR);
    }
    let isEmptyDir = true;
    files.forEach((fileName) => {
      // 文件不存在白名单里且不以.开头
      if (whiteList.indexOf(fileName) === -1 && fileName.indexOf('.') !== 0) {
        isEmptyDir = false;
      }
    });

		fn(isEmptyDir);
	});
}

module.exports = {
  checkCmd,
  checkProjectType,
  mergePath,
  modifyPackage,
  emptyDirectory,
};
