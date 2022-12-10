const path = require('path')
const webpack = require('webpack')
const os = require('os')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const nets = os.networkInterfaces()
const host = nets['en0']?.find(net => net.family === 'IPv4' && !net.internal)

const onEnvironment = (production, development) =>
  process.env.NODE_ENV === 'production'
    ? JSON.stringify(production)
    : JSON.stringify(development)

module.exports = {
  mode: process.env.NODE_ENV,
  devtool: 'eval',
  entry: process.env.NODE_ENV === 'development'? [
    'webpack-dev-server/client?',
    './src/client'
  ] : ['./src/client'],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name]-[fullhash].bundle.js',
    chunkFilename: '[name]-[fullhash].chunk.js',
		publicPath: '/'
  },
  resolve: {
    alias: {
      process: 'process/browser',
      stream: 'stream-browserify',
      zlib: 'browserify-zlib'
    },
    extensions: ['.js', '.ts', '.tsx', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.mov', '.ttf', '.eot', '.woff', '.woff2']
  },
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: [{
        loader: 'ts-loader'
      }]
    }, {
      test: /\.(jpe?g|png|gif|svg|mov|ttf|eot|woff2?)$/,
      use: [{
        loader: 'file-loader',
        options: {
          hash: 'sha512',
          digest: 'hex',
          name: '[hash].[ext]'
        }
      }]
    }]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/client/index.html'
    }),
    new CopyWebpackPlugin({
      patterns: [{
        from: 'src/asset/static/**/*',
        to: '[name].[ext]'
      }]
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    }),
    new webpack.DefinePlugin({
      'ENV': JSON.stringify(process.env.NODE_ENV),
      'HYPEGIENIC_API': onEnvironment('', '')
    })
  ]
}
