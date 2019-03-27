const webpack = require('webpack')
const path = require('path')

module.exports = {
  devtool: 'eval',
  entry: {
    bundle: [ '@babel/polyfill', path.join(__dirname, '/src/index.js') ],
  },
  output: {
    path: path.join(__dirname, '/static'),
    filename: 'bundle.js',
    publicPath: '/static'
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      '__REACT_DEVTOOLS_GLOBAL_HOOK__': '({ isDisabled: true })'
    }),
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
          presets: [
            '@babel/preset-react',
            '@babel/preset-env'
          ]
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
  }

}
