var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
module.exports = {
    entry: './src/index.js',
    output: {
        path: path.join(__dirname, '/dist/'),
        publicPath: '/dist/',
        filename: '[name].js'
    },
    module: {
        rules: [{
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /node_modules/
        }, {
            test: /\.css$/,
            loader: ExtractTextPlugin.extract({
                fallbackLoader: 'style-loader',
                use: ['css-loader', 'postcss-loader']
            })
        }, {
            test: /\.(png|jpe?g|gif|svg)(\?\S*)?$/,
            loader: 'file-loader',
            query: {
                name: '[name].[ext]'
            }
        }, {
            test: /\.glsl$/,
            loader: 'raw-loader'
        }]
    },
    resolve: {
        alias: {
            '#': path.join(__dirname, 'src')
        }
    },
    devServer: {
        historyApiFallback: false,
        noInfo: true,
        compress: true,
        hot: true
    },
    devtool: '#source-map',
    plugins: [
        new ExtractTextPlugin("[name].css"),
        new webpack.LoaderOptionsPlugin({
            test: /\.js$/,
            options: { minimize: true }
        }),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            comments: false,
            compress: {
                warnings: false
            }
        }),
    ],
}