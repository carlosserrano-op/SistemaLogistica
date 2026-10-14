const path = require('path');
const HtmlRspackPlugin = require('html-rspack-plugin');


module.exports = {
    mode: 'development',
    entry: './src/index.jsx', // Apunta al archivo jsx
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js',
        clean: true,
    },
    resolve: {
        extensions: ['.js', '.jsx', '.css'],
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                use: {
                    loader: 'builtin:swc-loader', // Motor de Rust
                    options: {
                        jsc: {
                            parser: {
                                syntax: 'ecmascript',
                                jsx: true, 
                            },
                            transform: {
                                react: {
                                    runtime: 'automatic',
                                },
                            },
                        },
                    },
                },
                type: 'javascript/auto',
            },
            {
                test: /\.css$/,
                use: [{ loader: 'postcss-loader' }],
                type: 'css',
            },
        ],
    },
    plugins: [
        new HtmlRspackPlugin({
            template: './public/index.html',// Apunta al archivo html principal
        }),
    ],
    devServer: {
        port: 8080,
        hot: true,
    },
};
