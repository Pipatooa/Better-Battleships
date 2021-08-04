const path = require('path');
const PnpWebpackPlugin = require('pnp-webpack-plugin');

module.exports = {
    entry: {
        game: './src/game/client/game.ts'
    },
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
            }
        ]
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'build/public/js')
    }
};
