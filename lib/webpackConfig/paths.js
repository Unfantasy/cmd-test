'use strict';

const path = require('path');
const fs = require('fs');
const url = require('url');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const envPublicUrl = process.env.PUBLIC_URL;

function ensureSlash(path, needsSlash) {
    const hasSlash = path.endsWith('/');
    if (hasSlash && !needsSlash) {
        return path.substr(path, path.length - 1);
    } else if (!hasSlash && needsSlash) {
        return `${path}/`;
    } else {
        return path;
    }
}

const getPublicUrl = appPackageJson =>
    envPublicUrl || require(appPackageJson).homepage;

// We use ` ` environment variable or "homepage" field to infer
// "public path" at which the app is served.
// Webpack needs to know it to put the right <script> hrefs into HTML even in
// single-page apps that may serve index.html for nested URLs like /todos/42.
// We can't use a relative path in HTML because we don't want to load something
// like /todos/42/static/js/bundle.7289d.js. We have to know the root.
function getServedPath(appPackageJson) {
    const publicUrl = getPublicUrl(appPackageJson);
    const servedUrl =
        envPublicUrl || (publicUrl ? url.parse(publicUrl).pathname : '/');
    return ensureSlash(servedUrl, true);
}

// 判断entry文件夹里面是否有index.js， 如果有为单入口，没有则遍历目录按照多入口打包
let entryPaths = [];
let htmlPaths = [];
const files = fs.readdirSync(resolveApp('src/entry'));
let isSingleApp = false;
files.forEach(function (item, index) {
    let stat = fs.lstatSync(resolveApp('src/entry/' + item))
    if (stat.isDirectory() === true) { 
        entryPaths.push({ key: item, value: resolveApp('src/entry/' + item + '/index.js') });
        htmlPaths.push({ key: item, value: resolveApp('public/' + item + '.html') });
    }
    if (item === 'index.js') {
        isSingleApp = true;
    }
});
if (isSingleApp) {
    entryPaths = [{ key: 'index', value: resolveApp('src/entry/index.js') }];
    htmlPaths = [{ key: 'index', value: resolveApp('public/index.html') }];
}

// config after eject: we're in ./config/
module.exports = {
    dotenv: resolveApp('.env'),
    appBuild: resolveApp('build'),
    appBuildLib: resolveApp('build/lib'),
    appPublic: resolveApp('public'),
    appHtml: resolveApp('public/index.html'),
    appHtml1: resolveApp('public/index1.html'),
    appHtml2: resolveApp('public/index2.html'),
    appIndexJs: resolveApp('src/entry/index.js'),
    appPackageJson: resolveApp('package.json'),
    appSrc: resolveApp('src'),
    aiLib: resolveApp('node_modules/@aistarfish/lib'),
    yarnLockFile: resolveApp('yarn.lock'),
    testsSetup: resolveApp('src/setupTests.js'),
    appNodeModules: resolveApp('node_modules'),
    publicUrl: getPublicUrl(resolveApp('package.json')),
    servedPath: getServedPath(resolveApp('package.json')),
    entryPaths,
    htmlPaths,
    isSingleApp,
};
