const path = require('path');

module.exports = (env, options) => {
    const isDevMode = options.mode === "development";
    return {
        devtool: isDevMode ? "source-map" : false,
        entry: {
            app: './src/scripts/index.js'
        },
        output: {
            path: path.join(__dirname, 'public/assets'),
            filename: 'bundle-min.js'
        },
        module: {
            rules: [{
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader'
                },
                {
                    test: /\.s[ac]ss$/i,
                    use: [
                        'style-loader',
                        'css-loader',
                        'sass-loader',
                    ],
                }
            ]
        },
        devServer: {
            contentBase: path.join(__dirname, 'public'),
            compress: true,
            port: 9000,
            hot: true
        },
        resolve: {
            extensions: ['*', '.js', '.jsx']
        },
        watch: true
    }
};