'use strict';

const pxtorem = require('postcss-pxtorem');
const autoprefixer = require('autoprefixer');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const eslintFormatter = require('react-dev-utils/eslintFormatter');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const getClientEnvironment = require('./env');
const AutoDllPlugin = require('autodll-webpack-plugin');
const paths = require('./paths');

const publicPath = '/';

const publicUrl = '';
const env = getClientEnvironment(publicUrl);
// console.log(paths.aiLib, '1111test');
// process.exit(1);

module.exports = function(devArg, extraParams = {}) {
    const { remDev, isEslint } = extraParams;
    // entry, html参数
    const entry = {};
    // const devArg = localStorage.getItem('devArg');
    // entry参数
    // console.log('paths.entryPaths: ', devArg);
    let index = paths.entryPaths.findIndex((entryPath) => (entryPath.key === devArg));
    if (index === -1) {
        index = 0;
    }
    entry[paths.entryPaths[index].key] = [
        require.resolve('./polyfills'),
        require.resolve('react-dev-utils/webpackHotDevClient'),
        paths.entryPaths[index].value,
    ];
    
    let postcssPlugins = () => [
        require('postcss-flexbugs-fixes'),
        autoprefixer({
            browsers: [
                '>1%',
                'last 4 versions',
                'Firefox ESR',
                'not ie < 9', // React doesn't support IE8 anyway
            ],
            flexbox: 'no-2009',
        }),
    ];

    if (remDev === true) {
        postcssPlugins = () => [
            pxtorem({ rootValue: 50, minPixelValue: 3, propList: ['*'] }),
            require('postcss-flexbugs-fixes'),
            autoprefixer({
                browsers: [
                    '>1%',
                    'last 4 versions',
                    'Firefox ESR',
                    'not ie < 9', // React doesn't support IE8 anyway
                ],
                flexbox: 'no-2009',
            }),
        ];
    }

    const eslintConfig = [];
    if (isEslint) {
        eslintConfig.push({
            test: /\.(js|jsx)$/,
            enforce: 'pre',
            use: [
                {
                    options: {
                        formatter: eslintFormatter,
                        eslintPath: require.resolve('eslint'),

                    },
                    loader: require.resolve('eslint-loader'),
                },
            ],
            include: paths.appSrc,
        });
    }

    return {
        devtool: 'cheap-module-source-map',
        entry,
        output: {
            path: paths.appBuild,
            pathinfo: true,
            filename: 'static/[name].bundle.js',
            chunkFilename: 'static/[name].chunk.js',
            publicPath: publicPath,
            devtoolModuleFilenameTemplate: info =>
                path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
        },
        resolve: {
            modules: ['node_modules', paths.appNodeModules].concat(
                process.env.NODE_PATH.split(path.delimiter).filter(Boolean)
            ),
            extensions: ['.web.js', '.js', '.json', '.web.jsx', '.jsx'],
            alias: {
                'react-native': 'react-native-web',
                'src': path.join(process.cwd(), 'src'),
            },
            plugins: [
                new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson]),
            ],
        },
        module: {
            strictExportPresence: true,
            rules: [
                // TODO: Disable require.ensure as it's not a standard language feature.
                // {
                //     test: /\.(js|jsx)$/,
                //     enforce: 'pre',
                //     use: [
                //         {
                //             options: {
                //                 formatter: eslintFormatter,
                //                 eslintPath: require.resolve('eslint'),
    
                //             },
                //             loader: require.resolve('eslint-loader'),
                //         },
                //     ],
                //     include: paths.appSrc,
                // },
                ...eslintConfig,
                {
                    oneOf: [
                        {
                            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                            loader: require.resolve('url-loader'),
                            options: {
                                limit: 10000,
                                name: 'static/media/[name].[hash:8].[ext]',
                            },
                        },
                        {
                            test: /\.(js|jsx)$/,
                            include:[paths.appSrc, paths.aiLib],
                            loader: require.resolve('babel-loader'),
                            options: {
                                cacheDirectory: true,
                                plugins: [
                                    [require.resolve('babel-plugin-import'), {
                                        "libraryName": "antd",
                                        "libraryDirectory": "es",
                                        "style": "css" // `style: true` 会加载 less 文件
                                    }],
                                    require.resolve('babel-plugin-transform-decorators-legacy'),
                                    require.resolve('babel-plugin-transform-runtime'),
                                ],
                                presets: [
                                    require.resolve('babel-preset-react-app')
                                ]
                            },
                        },
                        {
                            test: /\.(c|sc|sa)ss$/,
                            use: [
                                require.resolve('style-loader'),
                                {
                                    loader: require.resolve('css-loader'),
                                    options: {
                                        importLoaders: 1,
                                    },
                                },
                                {
                                    loader: require.resolve('postcss-loader'),
                                    options: {
                                        // Necessary for external CSS imports to work
                                        // https://github.com/facebookincubator/create-react-app/issues/2677
                                        ident: 'postcss',
                                        plugins: postcssPlugins,
                                    },
                                },
                                require.resolve('sass-loader'),
                            ],
                        },
                        // "file" loader makes sure those assets get served by WebpackDevServer.
                        // When you `import` an asset, you get its (virtual) filename.
                        // In production, they would get copied to the `build` folder.
                        // This loader don't uses a "test" so it will catch all modules
                        // that fall through the other loaders.
                        {
                            // Exclude `js` files to keep "css" loader working as it injects
                            // it's runtime that would otherwise processed through "file" loader.
                            // Also exclude `html` and `json` extensions so they get processed
                            // by webpacks internal loaders.
                            exclude: [/\.js$/, /\.html$/, /\.json$/],
                            loader: require.resolve('file-loader'),
                            options: {
                                name: 'static/media/[name].[hash:8].[ext]',
                            },
                        },
                    ],
                },
                // ** STOP ** Are you adding a new loader?
                // Make sure to add the new loader(s) before the "file" loader.
            ],
        },
        plugins: [
    
            new InterpolateHtmlPlugin(env.raw),
            // Generates an `index.html` file with the <script> injected.
            new HtmlWebpackPlugin({
                inject: true,
                template: paths.htmlPaths[index].value,
                chunks: `${paths.appPackageJson.name}/${paths.htmlPaths[index].key}.chunk.js`,
            }),
            // Add module names to factory functions so they appear in browser profiler.
            new webpack.NamedModulesPlugin(),
            // Makes some environment variables available to the JS code, for example:
            // if (process.env.NODE_ENV === 'development') { ... }. See `./env.js`.
            new webpack.DefinePlugin(env.stringified),
            // This is necessary to emit hot updates (currently CSS only):
            new webpack.HotModuleReplacementPlugin(),
            // Watcher doesn't work well if you mistype casing in a path so we use
            // a plugin that prints an error when you attempt to do this.
            // See https://github.com/facebookincubator/create-react-app/issues/240
            new CaseSensitivePathsPlugin(),
            // If you require a missing module and then `npm install` it, you still have
            // to restart the development server for Webpack to discover it. This plugin
            // makes the discovery automatic so you don't have to restart.
            // See https://github.com/facebookincubator/create-react-app/issues/186
            new WatchMissingNodeModulesPlugin(paths.appNodeModules),
            // Moment.js is an extremely popular library that bundles large locale files
            // by default due to how Webpack interprets its code. This is a practical
            // solution that requires the user to opt into importing specific locales.
            // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
            // You can remove this if you don't use Moment.js:
            new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
            new AutoDllPlugin({
                inject: true, // will inject the DLL bundles to index.html
                debug: true,
                filename: '[name].js',
                path: './dll',
                entry: {
                    vendor: [
                        "react",
                        "mobx",
                        "mobx-react",
                        "react-dom",
                        "react-router",
                        "whatwg-fetch",
                        // "echarts",
                        // "echarts-gl"
                    ]
                }
            })
        ],
        // Some libraries import Node modules but don't use them in the browser.
        // Tell Webpack to provide empty mocks for them so importing them works.
        node: {
            dgram: 'empty',
            fs: 'empty',
            net: 'empty',
            tls: 'empty',
            child_process: 'empty',
        },
        // Turn off performance hints during development because we don't do any
        // splitting or minification in interest of speed. These warnings become
        // cumbersome.
        performance: {
            hints: false,
        },
    };
}

