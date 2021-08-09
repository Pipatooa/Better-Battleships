const path = require('path');
const PnpWebpackPlugin = require('pnp-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ZipWebpackPlugin = require('zip-file-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { readdirSync } = require('fs');

const scenarioDirs = readdirSync('./src/scenarios', { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);

const scenarioPatternEntries = Array.from({ length: scenarioDirs.length }, (_, i) => {
    let scenarioFolder = scenarioDirs[i];

    return {
        from: 'src/scenarios/' + scenarioFolder,
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

module.exports = {
    entry: './src/app.ts',
    resolve: {
        extensions: ['.js', '.json', '.ts'],
        plugins: [PnpWebpackPlugin]
    },
    resolveLoader: {
        plugins: [PnpWebpackPlugin.moduleLoader(module)]
    },
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
        filename: 'app.js',
        path: path.resolve(path.dirname(''), 'build')
    },
    target: 'node',
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'src/public',
                    to: 'public'
                },
                {
                    from: 'src/views',
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
                        'build/tmp'
                    ]
                }
            }
        }),
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css'
        })
    ],
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
    optimization: {
        minimizer: [
            new OptimizeCssAssetsPlugin(),
            new TerserPlugin({
                parallel: true
            })
        ]
    }
};
