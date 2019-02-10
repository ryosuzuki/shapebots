const webpack = require('webpack')
const path = require('path')

module.exports = {
  devtool: 'eval',
  entry: {
    bundle: path.join(__dirname, '/src/index.js'),
  },
  output: {
    path: path.join(__dirname, '/static'),
    filename: 'bundle.js',
    publicPath: '/static'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: ['react', 'es2015', 'stage-3', 'stage-0']
        }
      }, {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      }, {
        test: /\.html$/,
        loader: 'html-loader',
      }
    ]
  },
  devServer: {
    contentBase: '.',
    watchContentBase: true,
    publicPath: '/',
    compress: true,
    hot: false,
    inline: true,
    port: 8080,
    /*
    proxy: {
      '**': {
        target: 'http://localhost:4000'
      }
    }
    */
  },
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  }

}
