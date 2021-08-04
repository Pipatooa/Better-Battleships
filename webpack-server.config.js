const path = require('path');
const PnpWebpackPlugin = require('pnp-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');

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
                }
            ]
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
