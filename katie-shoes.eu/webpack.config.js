var webpack = require('webpack');
var uglifyJsPlugin = webpack.optimize.UglifyJsPlugin;

module.exports = env => {

  const production = env === "production",
    plugins = production ? [
      new uglifyJsPlugin({
        compress: {
          warnings: false
        }
      })
    ] : [];

  return {
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
    "devtool": !production ? "eval-source-map" : false,
    plugins: plugins
  }
};
