'use strict';

const pxtorem = require('postcss-pxtorem');
const util = require('../util');
const chalk = require('chalk');
var HappyPack = require('happypack');
const os = require('os');
var happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });

const autoprefixer = require('autoprefixer');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');
// const ManifestPlugin = require('webpack-manifest-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
// const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const eslintFormatter = require('react-dev-utils/eslintFormatter');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const paths = require('./paths');
const packageJson = require(util.mergePath(process.cwd(), './package'))
const AutoDllPlugin = require('autodll-webpack-plugin');
const getClientEnvironment = require('./env');

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
// var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
// Webpack uses `publicPath` to determine where the app is being served from.
// It requires a trailing slash, or the file assets will get an incorrect path.
const publicPath = paths.servedPath;
// Some apps do not use client-side routing with pushState.
// For these, "homepage" can be set to "." to enable relative asset paths.
const shouldUseRelativeAssetPaths = publicPath === './';
// Source maps are resource heavy and can cause out of memory issue for large source files.
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';
// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// Omit trailing slash as %PUBLIC_URL%/xyz looks better than %PUBLIC_URL%xyz.
const publicUrl = publicPath.slice(0, -1);
// Get environment variables to inject into our app.
const env = getClientEnvironment(publicUrl);

// Assert this just to be safe.
// Development builds of React are slow and not intended for production.
if (env.stringified['process.env'].NODE_ENV !== '"production"') {
    throw new Error('Production builds must have NODE_ENV=production.');
}

// Note: defined here because it will be used more than once.
const cssFilename = packageJson.name + '/[name]' + '.css';

const extractTextPluginOptions = shouldUseRelativeAssetPaths
    ? // Making sure that the publicPath goes back to to build folder.
    {publicPath: Array(cssFilename.split('/').length).join('../')}
    : {};

// function getHtmlWebpackPluginAndEntry() {
    
// }


// This is the production configuration.
// It compiles slowly and is focused on producing a fast and minimal bundle.
// The development configuration is different and lives in a separate file.
module.exports = function(buildArg, extraParams = {}) {
    const { remBuild, isEslint } = extraParams;
    // entry, html参数
    const entry = {};
    let htmlWebpackPlugins = [];
    // const buildArg = localStorage.getItem('buildArg');
    // 带参数
    if (!!buildArg) {
        let index = paths.entryPaths.findIndex((entryPath) => (entryPath.key === buildArg));
        if (index === -1) {
            // console.log(chalk.green('test--参数错误'));
            console.log('');
            console.log(chalk.cyan('当前工程无所选项目，默认打包所有文件'));
            console.log('');
            paths.entryPaths.forEach((entryPath, i) => {
                entry[entryPath.key] = [
                    require.resolve('./polyfills'),
                    entryPath.value,
                ];
                htmlWebpackPlugins.push(
                    new HtmlWebpackPlugin({
                        inject: true,
                        filename: paths.htmlPaths[i].key + '.html',
                        template: paths.htmlPaths[i].value,
                        chunks: [paths.htmlPaths[i].key],
                        minify: {
                            removeComments: true,
                            collapseWhitespace: true,
                            removeRedundantAttributes: true,
                            useShortDoctype: true,
                            removeEmptyAttributes: true,
                            removeStyleLinkTypeAttributes: true,
                            keepClosingSlash: true,
                            minifyJS: true,
                            minifyCSS: true,
                            minifyURLs: true,
                        },
                    })
                )
            });
        } else {
            // console.log(chalk.green('test--参数正确'));

            console.log('');
            console.log(chalk.cyan('正在打包项目： ' + paths.entryPaths[index].key));
            console.log('');
            entry[paths.entryPaths[index].key] = [
                require.resolve('./polyfills'),
                paths.entryPaths[index].value,
            ];
            htmlWebpackPlugins = [new HtmlWebpackPlugin({
                inject: true,
                filename: paths.htmlPaths[index].key + '.html',
                template: paths.htmlPaths[index].value,
                chunks: [paths.htmlPaths[index].key],
                minify: {
                    removeComments: true,
                    collapseWhitespace: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeStyleLinkTypeAttributes: true,
                    keepClosingSlash: true,
                    minifyJS: true,
                    minifyCSS: true,
                    minifyURLs: true,
                },
            })];
        }
        
    } else {
        // console.log(chalk.green('test--无参数'));
        // console.log('chunks: ', [`${paths.htmlPaths[0].key}.chunk`]);
        console.log('');
        console.log(chalk.cyan(`正在打包${paths.isSingleApp ? '' : '所有'}项目`));
        console.log('');
        paths.entryPaths.forEach((entryPath, i) => {
            entry[entryPath.key] = [
                require.resolve('./polyfills'),
                entryPath.value,
            ];
            htmlWebpackPlugins.push(
                new HtmlWebpackPlugin({
                    inject: true,
                    filename: paths.htmlPaths[i].key + '.html',
                    template: paths.htmlPaths[i].value,
                    chunks: [paths.htmlPaths[i].key],
                    minify: {
                        removeComments: true,
                        collapseWhitespace: true,
                        removeRedundantAttributes: true,
                        useShortDoctype: true,
                        removeEmptyAttributes: true,
                        removeStyleLinkTypeAttributes: true,
                        keepClosingSlash: true,
                        minifyJS: true,
                        minifyCSS: true,
                        minifyURLs: true,
                    },
                })
            )
        });
    }

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
        require('cssnano'),
    ];

    if (remBuild === true) {
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
            require('cssnano'),
        ];
    }

    // 包分析
    let analyzerPlugin = [];
    if (remBuild === 'analyse') {
        analyzerPlugin = [new BundleAnalyzerPlugin()];
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
        // Don't attempt to continue if there are any errors.
        bail: true,
        // We generate sourcemaps in production. This is slow but gives good results.
        // You can exclude the *.map files from the build during deployment.
        devtool: shouldUseSourceMap ? 'source-map' : false,
        // In production, we only want to load the polyfills and the app code.
        entry,
        externals: {
            'react':'React',
            'react-dom':'ReactDOM'
        },
        output: {
            // The build folder.
            path: paths.appBuild,
            // Generated JS file names (with nested folders).
            // There will be one main bundle, and one file per asynchronous chunk.
            // We don't currently advertise code splitting but Webpack supports it.
            filename: packageJson.name + '/[name].js',
            // filename: 'static/js/' + packageJson.name + '.[name].js',
            chunkFilename: packageJson.name + '/[name].chunk.js',
            // We inferred the "public path" (such as / or /my-project) from homepage.
            publicPath: publicPath,
            // Point sourcemap entries to original disk location (format as URL on Windows)
            devtoolModuleFilenameTemplate: info =>
                path
                    .relative(paths.appSrc, info.absoluteResourcePath)
                    .replace(/\\/g, '/'),
        },
        resolve: {
            modules: ['node_modules', paths.appNodeModules].concat(
                // It is guaranteed to exist because we tweak it in `env.js`
                process.env.NODE_PATH.split(path.delimiter).filter(Boolean)
            ),
            extensions: ['.web.js', '.js', '.json', '.web.jsx', '.jsx'],
            alias: {
    
                'react-native': 'react-native-web',
                'src': path.join(process.cwd(), 'src'),
            },
            plugins: [
                new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson])
            ],
        },
        module: {
            strictExportPresence: true,
            rules: [
                // First, run the linter.
                // It's important to do this before Babel processes the JS.
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
                    // "oneOf" will traverse all following loaders until one will
                    // match the requirements. When no loader matches it will fall
                    // back to the "file" loader at the end of the loader list.
                    oneOf: [
                        // "url" loader works just like "file" loader but it also embeds
                        // assets smaller than specified size as data URLs to avoid requests.
                        {
                            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                            loader: require.resolve('url-loader'),
                            options: {
                                limit: 10000,
                                name: packageJson.name + '/media/[name].[hash:8].[ext]',
                            },
                        },
                        // Process JS with Babel.
                        {
                            test: /\.(js|jsx)$/,
                            include:[paths.appSrc, paths.aiLib],
                            loader: util.mergePath(__dirname, '../../node_modules/happypack/loader?id=javascript'),
                        },
                        {
                            test: /\.(c|sa|sc)ss$/,
                            loader: ExtractTextPlugin.extract(
                                Object.assign(
                                    {
                                        fallback: require.resolve('style-loader'),
                                        // use: util.mergePath(__dirname, '../../node_modules/happypack/loader?id=style'),
                                        use: [
                                            {
                                                loader: require.resolve('css-loader'),
                                                options: {
                                                    importLoaders: 1,
                                                    sourceMap: shouldUseSourceMap,
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
                                            {
                                                loader: require.resolve('sass-loader'),
                                            },
                                        ],
                                    },
                                    extractTextPluginOptions
                                )
                            ),
                            // Note: this won't work without `new ExtractTextPlugin()` in `plugins`.
                        },
                        {
                            loader: require.resolve('file-loader'),
                            exclude: [/\.js$/, /\.html$/, /\.json$/, /\.scss$/],
                            options: {
                                name: packageJson.name + '/media/[name].[hash:8].[ext]',
                            },
                        },
                    ],
                },
            ],
        },
        plugins: [
            ...analyzerPlugin,
            // optimize, happypack
            new HappyPack({
            id: 'javascript',
            loaders: [
                {
                    loader: require.resolve('babel-loader'),
                    options: {
                        cacheDirectory: true,
                        compact: true,
                        plugins: [
                            [require.resolve('babel-plugin-import'), [{
                                "libraryName": "@aistarfish/lib",
                                "camel2DashComponentName": false
                              }, {
                                "libraryName": "antd",
                                "libraryDirectory": "es",
                                "style": "css" // `style: true` 会加载 less 文件
                              }, {
                                "libraryName": "antd-mobile",
                                "style": "css"
                            }]],
                            require.resolve('babel-plugin-transform-decorators-legacy'),
                            require.resolve('babel-plugin-transform-runtime'),
                        ],
                        presets: [
                            require.resolve('babel-preset-react-app')
                        ]
                    }
                }
            ],
            threadPool: happyThreadPool
            }),
            // new HappyPack({
            // id: 'style',
            // loaders: [
            //     {
            //         loader: require.resolve('css-loader'),
            //         options: {
            //             importLoaders: 1,
            //             minimize: true,
            //             sourceMap: shouldUseSourceMap,
            //         },
            //     },
            //     {
            //         loader: require.resolve('postcss-loader'),
            //         options: {
            //             // Necessary for external CSS imports to work
            //             // https://github.com/facebookincubator/create-react-app/issues/2677
            //             ident: 'postcss',
            //             plugins: () => [
            //                 pxtorem({ rootValue: 50, minPixelValue: 3, propList: ['*'] }),
            //                 require('postcss-flexbugs-fixes'),
            //                 autoprefixer({
            //                     browsers: [
            //                         '>1%',
            //                         'last 4 versions',
            //                         'Firefox ESR',
            //                         'not ie < 9', // React doesn't support IE8 anyway
            //                     ],
            //                     flexbox: 'no-2009',
            //                 }),
            //             ],
            //         },
            //     },
            //     {
            //         loader: require.resolve('sass-loader'),
            //     },
            // ],
            // threadPool: happyThreadPool
            // }),
            new InterpolateHtmlPlugin(env.raw),
            ...htmlWebpackPlugins,
            new webpack.DefinePlugin(env.stringified),
            new webpack.optimize.ModuleConcatenationPlugin(),
            // Minify the code.
            new ParallelUglifyPlugin({
                cacheDir: '.cache/',
                uglifyJS:{
                    compress: {
                        warnings: true,
                        comparisons: false,
                        drop_debugger: true,
                        drop_console: true,
                        dead_code: true,
                        pure_funcs: ['console.log']
                    },
                    output: {
                        comments: false,
                        ascii_only: true,
                    },
                }
              }),
            new ExtractTextPlugin({
                filename: cssFilename,
            }),
            new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
            // new AutoDllPlugin({
            //     inject: true, // will inject the DLL bundles to index.html
            //     debug: true,
            //     filename: '[name].js',
            //     path: './dll',
            //     plugins: [
            //         new ParallelUglifyPlugin({
            //             cacheDir: '.cache/',
            //             uglifyJS:{
            //                 compress: {
            //                     warnings: true,
            //                     comparisons: false,
            //                     drop_debugger: true,
            //                     drop_console: true,
            //                     dead_code: true,
            //                     pure_funcs: ['console.log']
            //                 },
            //                 output: {
            //                     comments: false,
            //                     ascii_only: true,
            //                 },
            //             }
            //         }),
            //         new webpack.DefinePlugin(env.stringified)
            //     ],
            //     entry: {
            //         vendor: [
            //             "react",
            //             "mobx",
            //             "mobx-react",
            //             "react-dom",
            //             "react-router",
            //             "whatwg-fetch",
            //             'draft-js',
            //             'moment'
            //         ],
            //     }
            // })
        ],
        node: {
            dgram: 'empty',
            fs: 'empty',
            net: 'empty',
            tls: 'empty',
            child_process: 'empty',
        },
    };
};
