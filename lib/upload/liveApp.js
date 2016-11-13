var path = require('path');
const Promise = require("bluebird");
const fs = Promise.promisifyAll(require('fs-extra'));

module.exports = {
  addLiveAppFiles: function (destination) {
    const fileList = [
    'bower.json',
    '.bowerrc',
    'bower_components'
    ];
    return Promise.map(fileList, file => {
      const src = path.resolve(__dirname, '../support/liveApp/', file);
      const dest = path.resolve(destination, file);
      return fs.copyAsync(src, dest);
    })
  }
}
