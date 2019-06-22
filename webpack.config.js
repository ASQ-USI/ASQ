'use strict';

const path = require('path');

module.exports = {  
    entry: {
      presenter: './client/js/presenter.js',
      viewer: './client/js/viewer.js',
      ghost: './client/js/ghost.js',
      client: './client/js/dom.js'
    },
    output: {
      path: path.resolve(__dirname, 'public/js/'),
      publicPath: '/js/',
      filename: 'asq-[name].js'
    },
    devtool: 'cheap-module-source-map',
    module:{
      rules: [
        {
          test: /\.less$/,
          use: [
            'style-loader',
            'css-loader',
            {
              loader: 'less-loader',
              options: {
                javascriptEnabled: true
              }
            }
          ] 
        },
        {
          test: /\.dust$/,
          use: [
            {
              loader:'imports-loader',
              options: {
                dust: 'dustjs-linkedin'
              }
            },
            'dust-loader'
          ]
        },
        {
          test: /[\/]impress\-asq\.js$/,
          loader: 'exports-loader',
          options: {
            impress: 'impress'
          }
        },
      ]
    }
  }