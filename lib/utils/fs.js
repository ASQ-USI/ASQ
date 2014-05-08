/** @module lib/utils/fs
    @description various fs utilities
*/

var fs        = require('fs')
, pfs         = require('promised-io/fs')
, when        = require('when')
, path        = require('path')
, getDirname  = path.dirname
, mkdirp      = require('mkdirp')
, appLogger   = require('../logger').appLogger

function getExtension(filename) {
    var ext = path.extname(filename||'').split('.');
    return ext[ext.length - 1];
}

function getFirstHtmlFile(path){

  var deferred = when.defer();
  var hasHTML = false;
  pfs.readdir(path).then(
    function(list){
      hasHTML = list.sort().some(function (file){
        var stat =fs.statSync(path + '/' + file);
        if (stat && stat.isFile() && getExtension(file)=="html"){
          deferred.resolve(path + '/' + file);
          return true;
        }
      });
      if(! hasHTML) {
        deferred.reject(new Error('no page with html extension found'));
      }
  },
  function(error){
     deferred.reject(error);
  });

  return deferred.promise;
}

/* ### removeRecursive
* author: Jorrit Duin (venalis @ github)
* https://gist.github.com/venalis/1722941
* NodeJS:
* Delete a file or delete a DIR recursively
* be aware that this is a power full delete function
* so best is to check if the PATH given is really
* the path you want to DELETE ENTIRELY
*
* ### usage example
* remove a folder recursively
*
*      fs.removeRecursive(full_path_to_dir,function(err,status){});
*
* or just delete a file (works to)
*
*      fs.removeRecursive(full_path_to_file,function(err,status){});
*/

function removeRecursive(path,cb){
    var self = this;

    fs.stat(path, function(err, stats) {
      if(err){
        cb(err,stats);
        return;
      }
      if(stats.isFile()){
        fs.unlink(path, function(err) {
          if(err) {
            cb(err,null);
          }else{
            cb(null,true);
          }
          return;
        });
      }else if(stats.isDirectory()){
        // A folder may contain files
        // We need to delete the files first
        // When all are deleted we could delete the
        // dir itself
        fs.readdir(path, function(err, files) {
          if(err){
            cb(err,null);
            return;
          }
          var f_length = files.length;
          var f_delete_index = 0;

          // Check and keep track of deleted files
          // Delete the folder itself when the files are deleted

          var checkStatus = function(){
            // We check the status
            // and count till we r done
            if(f_length===f_delete_index){
              fs.rmdir(path, function(err) {
                if(err){
                  cb(err,null);
                }else{
                  cb(null,true);
                }
              });
              return true;
            }
            return false;
          };
          if(!checkStatus()){
            for(var i=0;i<f_length;i++){
              // Create a local scope for filePath
              // Not really needed, but just good practice
              // (as strings arn't passed by reference)
              (function(){
                var filePath = path + '/' + files[i];
                // Add a named function as callback
                // just to enlighten debugging
                removeRecursive(filePath,function removeRecursiveCB(err,status){
                  if(!err){
                    f_delete_index ++;
                    checkStatus();
                  }else{
                    cb(err,null);
                    return;
                  }
                });

              })()
            }
          }
        });
      }
    });
  };

// If file exists it justs calls the callback, otherwise it
// creates empty file if it doesnt exist.
// This function alse exists in logger.js, the reason we duplicate
// is that , by convention, other app modules should use fs-utils
// but the logger shouldn't have dependencies from within the app.
function createFileIfNotExistsSync(path){
  if(fs.existsSync(path)){
    console.log(path + " exists")
    return true;
  }else{
    mkdirp.sync(getDirname(path));
    //write and close immediately
    fs.closeSync(fs.openSync(path, 'w'));
    return true;
  }
}



module.exports =  {
  getExtension              : getExtension,
  getFirstHtmlFile          : getFirstHtmlFile,
  removeRecursive           : removeRecursive,
  createFileIfNotExistsSync : createFileIfNotExistsSync
}