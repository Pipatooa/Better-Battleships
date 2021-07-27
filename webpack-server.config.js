const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    entry: './src/app.ts',
    resolve: {
        extensions: ['.js', '.json', '.ts'],
        modules: [
            path.resolve('src'),
            'node_modules'
        ]
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                include: [path.resolve(path.dirname(''), 'src')]
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
            module: /^\.\/node_modules/,
            message: /not found|not supported|Critical dependency/
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
