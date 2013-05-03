var fs      = require('fs')
, pfs       = require('promised-io/fs')
, when      = require('when')
, path      = require('path')

function getExtension(filename) {
    var ext = path.extname(filename||'').split('.');
    return ext[ext.length - 1];
}

function getFirstHtmlFile(path){

  var deferred = when.defer();

  pfs.readdir(path).then(
    function(list){
      list.sort().some(function(file){
        var stat =fs.statSync(path + '/' + file);
        if (stat && stat.isFile() && getExtension(file)=="html"){
          deferred.resolve(path + '/' + file);
          return true;
        }
      });
      deferred.reject(new Error('no page with html extension found'));      
  },
  function(error){
     deferred.reject(error);
  });

  return deferred.promise;
}

module.exports ={
  getExtension      : getExtension,
  getFirstHtmlFile  : getFirstHtmlFile
} 