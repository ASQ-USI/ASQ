module.exports = function(config) {
  config.set({
    browsers: ['PhantomJS'],
    frameworks: ['mocha'],

    files: [
      '*.js'
    ]
  });
};