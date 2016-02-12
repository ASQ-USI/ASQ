'use strict';

var env = process.env.NODE_ENV || "development"
var devtool ="cheap-module-eval-source-map";

var webpack = require('webpack');

var commonsPlugin =
  new webpack.optimize.CommonsChunkPlugin('asq-common.js');

module.exports = {  
    entry: {
      presenter: "./client/js/presenter.js",
      viewer: "./client/js/viewer.js",
      ghost: "./client/js/ghost.js",
      client: "./client/js/dom.js"
    },
    output: {
      path: "./public/js/",
      publicPath: "/js/",
      filename: "asq-[name].js"
    },
    devtool: devtool,
    module:{
      loaders: [
        { test: /\.less$/, loader: "style!css!less" },
        { test: /\.dust$/, loader: "imports?dust=dustjs-linkedin!dust-loader" },
        { test: /[\/]impress\-asq\.js$/, loader: "exports?impress" },
      ]
    },
    plugins: [commonsPlugin]
  }