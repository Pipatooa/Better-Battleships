const path = require('path');
const PnpWebpackPlugin = require('pnp-webpack-plugin');
const NodemonPlugin = require('nodemon-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ZipWebpackPlugin = require('zip-file-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { readdirSync } = require('fs');

/**
 * Common config
 */

const commonConfig = {
    resolve: {
        extensions: ['.js', '.json', '.ts'],
        plugins: [PnpWebpackPlugin]
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
    entry: './src/server/app.ts',
    ...commonConfig,
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader'
            }
        ]
    },
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, './dist')
    },
    target: 'node',
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
        new TerserPlugin({
            parallel: true
        }),
        new NodemonPlugin({
            watch: path.resolve(__dirname, './dist/app.js'),
            nodeArgs: ['--unhandled-rejections=strict']
        })
    ]
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
        'game': './src/client/game.ts',
        'create-game': './src/client/create-game.ts',
        'register': './src/client/register.ts'
    },
    ...commonConfig,
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader'
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
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
