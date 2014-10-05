module.exports = {
  // presenter: {
    entry: "./client/js/presenter.js",
    output: {
      path: "./public/js/",
      filename: "asq-presenter.js"
    },
    devtool: "sourcemap",
    debug: true,
    module:{
      loaders: [
          { test: /[\/]impress\-asq\.js$/, loader: "exports?impress" },
      ]
    },
    // resolve : {
    //   packageAlias: "browser"
    // },
    externals:[{
      jquery: 'jQuery'
    }]
  }
// }