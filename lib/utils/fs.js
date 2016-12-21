/** @module lib/utils/fs
    @description various fs utilities
*/

const Promise = require('bluebird');
const coroutine = Promise.coroutine;
const fs = Promise.promisifyAll(require('fs-extra'));
const path = require('path');
const getDirname = path.dirname;

function getExtension(filename) {
    var ext = path.extname(filename||'').split('.');
    return ext[ext.length - 1];
}

function copyFile(source, target) {
  return new Promise(function (resolve, reject) {

    const rd = fs.createReadStream(source);
    rd.on("error", function(err) {
      reject(err);
    });
    const wr = fs.createWriteStream(target);
    wr.on("error", function(err) {
      reject(err);
    });
    wr.on("close", function(ex) {
      resolve();
    });
    rd.pipe(wr);
  })
}

const getFirstHtmlFile = coroutine(function *getFirstHtmlFileGen(path2Search){
  return new Promise( coroutine(function *promiseGen(resolve, reject) {
    const list = yield fs.readdirAsync(path2Search);
    const hasHTML = Promise.mapSeries(list.sort(), coroutine(function *someGen(file) {
      const stat = yield fs.statAsync(path2Search + '/' + file);
      if (stat && stat.isFile() && getExtension(file) === 'html'){
        resolve(path.join(path2Search,  file));
        return true;
      }
    }));

    if(! hasHTML) {
      reject(new Error('Could not find a file with html extension'));
    }
  }));
});

module.exports =  {
  copyFile:  copyFile,
  getExtension: getExtension,
  getFirstHtmlFile: getFirstHtmlFile,
}