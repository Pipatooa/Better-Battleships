const path = require('path');

module.exports = {
    entry: {
        game: './src/game/client/game.ts'
    },
    resolve: {
        extensions: ['.js', '.json', '.ts']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                include: [path.resolve(__dirname, 'src')]
            }
        ]
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'build/public/js')
    }
};
