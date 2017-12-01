var webpack = require('webpack');
var uglifyJsPlugin = webpack.optimize.UglifyJsPlugin;

module.exports = {
  entry: './main.jsx',
  output: {
    filename: 'bundle.js'
  },
  module: {
    loaders:[
      {
        test: /\.js[x]?$/,
        exclude: /node_modules/,
        loader: 'babel-loader?presets[]=es2015&presets[]=react'
      },      
      { 
        test: /\.css$/, 
        loader: 'style-loader!css-loader' 
      }
    ]
  },
  "devtool": "inline-source-map"
  /*plugins: [
    new uglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ]*/
};
