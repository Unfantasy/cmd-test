
'use strict';

const program = require('commander');
program
  .option('-F, --fast', 'fast build')
  .option("--rem", "打包为rem")
  .option("--analyse", "分析包")
  .option("--eslint", "是否开启 eslint 检查")
  .parse(process.argv);

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';
const util = require('./util');

// Ensure environment variables are read.
require(util.mergePath(__dirname, 'webpackConfig/env'));

const path = require('path');
const chalk = require('chalk');
const fs = require('fs-extra');
const webpack = require('webpack');
const paths = require(util.mergePath(__dirname, 'webpackConfig/paths'));
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const printHostingInstructions = require(util.mergePath(__dirname, 'webpackConfig/printHostingInstructions'));
const FileSizeReporter = require('react-dev-utils/FileSizeReporter');
const printBuildError = require('react-dev-utils/printBuildError');

function reactBuild(arg) {
  const buildArg = typeof arg === 'string' ? arg : '';
  console.time(chalk.cyan('构建用时'));
  let remBuild;
  let isEslint;
  // 是否将 px 转化为 rem
  if (program.rem) {
    console.log();
    console.log(chalk.cyan('当前模式：rem'));
    remBuild = true;
  }

  // 是否开启包分析 
  if (program.analyse) {
    remBuild = 'analyse';
  }

  if (program.eslint) {
    isEslint = true;
    console.log(chalk.cyan('eslint 已开启'));
  }

  const config = require(util.mergePath(__dirname, 'webpackConfig/webpack.config.prod'))(buildArg, { remBuild, isEslint });
  // localStorage.setItem('buildArg', typeof arg === 'string' ? arg : '');
  // Makes the script crash on unhandled rejections instead of silently
  // ignoring them. In the future, promise rejections that are not handled will
  // terminate the Node.js process with a non-zero exit code.
  process.on('unhandledRejection', err => {
    throw err;
  });

  const measureFileSizesBeforeBuild =
    FileSizeReporter.measureFileSizesBeforeBuild;
  const printFileSizesAfterBuild = FileSizeReporter.printFileSizesAfterBuild;
  const useYarn = fs.existsSync(paths.yarnLockFile);

  // These sizes are pretty large. We'll warn for bundles exceeding them.
  const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024;
  const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024;

  // Warn and crash if required files are missing
  const entryPaths = paths.entryPaths.map(v => (v.value));
  if (!checkRequiredFiles([paths.appHtml, ...entryPaths])) {
    process.exit(1);
  }

  // First, read the current file sizes in build directory.
  // This lets us display how much they changed later.
  measureFileSizesBeforeBuild(paths.appBuild)
    .then(previousFileSizes => {
      // Remove all content but keep the directory so that
      // if you're in it, you don't end up in Trash
      fs.emptyDirSync(paths.appBuild);
      // Merge with the public folder
      copyPublicFolder();
      // Start the webpack build
      return build(previousFileSizes);
    })
    .then(
      ({ stats, previousFileSizes, warnings }) => {
        if (warnings.length) {
          console.log(chalk.yellow('Compiled with warnings.\n'));
          console.log(warnings.join('\n\n'));
          console.log(
            '\nSearch for the ' +
              chalk.underline(chalk.yellow('keywords')) +
              ' to learn more about each warning.'
          );
          console.log(
            'To ignore, add ' +
              chalk.cyan('// eslint-disable-next-line') +
              ' to the line before.\n'
          );
        } else {
          console.log(chalk.green('Compiled successfully.\n'));
        }

        console.timeEnd(chalk.cyan('构建用时'));
        console.log();
        
        if (!program.fast) {
          console.log();
          console.log('File sizes after gzip:\n');
          printFileSizesAfterBuild(
            stats,
            previousFileSizes,
            paths.appBuild,
            WARN_AFTER_BUNDLE_GZIP_SIZE,
            WARN_AFTER_CHUNK_GZIP_SIZE
          );
          console.log();
          console.log();
        }
        // console.log(chalk.green('构建成功'));


        // const appPackage = require(paths.appPackageJson);
        // const publicUrl = paths.publicUrl;
        // const publicPath = config.output.publicPath;
        // const buildFolder = path.relative(process.cwd(), paths.appBuild);
        // printHostingInstructions(
        //   appPackage,
        //   publicUrl,
        //   publicPath,
        //   buildFolder,
        //   useYarn
        // );
      },
      err => {
        console.log(chalk.red('Failed to compile.\n'));
        printBuildError(err);
        process.exit(1);
      }
    );

  // Create the production build and print the deployment instructions.
  function build(previousFileSizes) {
    console.log('Creating an optimized production build...');

    let compiler = webpack(config);
    return new Promise((resolve, reject) => {
      compiler.run((err, stats) => {
        if (err) {
          return reject(err);
        }
        const messages = formatWebpackMessages(stats.toJson({}, true));
        if (messages.errors.length) {
          // Only keep the first error. Others are often indicative
          // of the same problem, but confuse the reader with noise.
          if (messages.errors.length > 1) {
            messages.errors.length = 1;
          }
          return reject(new Error(messages.errors.join('\n\n')));
        }
        if (
          process.env.CI &&
          (typeof process.env.CI !== 'string' ||
            process.env.CI.toLowerCase() !== 'false') &&
          messages.warnings.length
        ) {
          console.log(
            chalk.yellow(
              '\nTreating warnings as errors because process.env.CI = true.\n' +
                'Most CI servers set it automatically.\n'
            )
          );
          return reject(new Error(messages.warnings.join('\n\n')));
        }
        return resolve({
          stats,
          previousFileSizes,
          warnings: messages.warnings,
        });
      });
    });
  }
}

function copyPublicFolder() {
  fs.copySync(paths.appPublic, paths.appBuild, {
    dereference: true,
    filter: file => file !== paths.appHtml,
  });
}

module.exports = reactBuild;
