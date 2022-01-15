const path                    = require('path');
const PnpWebpackPlugin        = require('pnp-webpack-plugin');
const { WebpackPnpExternals } = require('webpack-pnp-externals');
const TsconfigPathsPlugin     = require('tsconfig-paths-webpack-plugin');
const NodemonPlugin           = require('nodemon-webpack-plugin');
const CopyWebpackPlugin       = require('copy-webpack-plugin');
const ZipWebpackPlugin        = require('zip-file-webpack-plugin');
const FileManagerPlugin       = require('filemanager-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin    = require('mini-css-extract-plugin');
const TerserPlugin            = require('terser-webpack-plugin');
const { readdirSync }         = require('fs');

/**
 * Common config
 */
const commonConfig = {
    resolve: {
        extensions: ['.js', '.ts', '.d.ts'],
        plugins: [PnpWebpackPlugin, new TsconfigPathsPlugin()]
    },
    resolveLoader: {
        plugins: [PnpWebpackPlugin.moduleLoader(module)]
    }
};

/**
 * Webpack Node config
 */
const nodeConfig = {
    name: 'node',
    target: 'node',
    entry: './src/server/app.ts',
    ...commonConfig,
    externals: [
        WebpackPnpExternals()
    ],
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader'
            },
            {
                test: /\.toml$/,
                use: 'raw-loader'
            }
        ]
    },
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, './dist')
    },
    ignoreWarnings: [
        {
            module: /\.\/\.yarn\/cache\//,
            message: /not found|not supported|Critical dependency/
        },
        {
            module: /\.\/\.yarn\/__virtual__\/ws-virtual/,
            message: /not found/
        }
    ],
    plugins: [
        new NodemonPlugin({
            watch: path.resolve(__dirname, './dist/app.js'),
            nodeArgs: ['--unhandled-rejections=strict']
        })
    ],
    optimization: {
        minimizer: [new TerserPlugin({
            parallel: true
        })]
    }
};


/**
 * Webpack web config
 */
const scenarioDirs = readdirSync('./src/static/scenarios', { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);

const scenarioPatternEntries = Array.from({ length: scenarioDirs.length }, (_, i) => {
    let scenarioFolder = scenarioDirs[i];

    return {
        from: 'src/static/scenarios/' + scenarioFolder,
        to: 'tmp/scenarios/' + scenarioFolder
    };
});

const scenarioPluginEntries = Array.from({ length: scenarioDirs.length }, (_, i) => {
    let scenarioFolder = scenarioDirs[i];

    return new ZipWebpackPlugin({
        path: 'public/scenarios',
        filename: scenarioFolder + '.zip',
        pathMapper: function (assetPath) {
            return assetPath.replace(new RegExp('^tmp/scenarios/' + scenarioFolder + '/'), '');
        },
        include: new RegExp('^tmp/scenarios/' + scenarioFolder + '/')
    });
});

const webConfig = {
    name: 'web',
    entry: {
        'index': './src/client/index.ts',
        'game': './src/client/game.ts',
        'game-not-found': './src/client/game-not-found.ts',
        'register': './src/client/register.ts',
        'login': './src/client/login.ts',
        'stats': './src/client/stats.ts'
    },
    ...commonConfig,
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader'
            },
            {
                test: /\.(glsl|vert|frag)$/,
                use: 'ts-shader-loader'
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            },
            {
                test: /\.html$/,
                loader: "html-loader"
            }
        ]
    },
    output: {
        filename: './public/js/[name].js',
        path: path.resolve(__dirname, './dist')
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'src/static/public',
                    to: 'public'
                },
                {
                    from: 'src/static/views',
                    to: 'views'
                },
                {
                    from: 'src/static/db-scripts',
                    to: 'db-scripts'
                },
                {
                    from: 'src/static/bootstrap/dist',
                    to: 'public/bootstrap'
                },
                {
                    from: 'src/static/icons/icons',
                    to: 'public/icons'
                },
                ...scenarioPatternEntries
            ]
        }),
        ...scenarioPluginEntries,
        new FileManagerPlugin({
            events: {
                onEnd: {
                    delete: [
                        'dist/tmp'
                    ]
                }
            }
        }),
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css'
        })
    ],
    optimization: {
        minimizer: [
            new OptimizeCssAssetsPlugin(),
            new TerserPlugin({
                parallel: true
            })
        ]
    }
};

module.exports = [nodeConfig, webConfig];
