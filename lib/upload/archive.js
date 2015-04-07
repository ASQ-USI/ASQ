/**
 * @module lib/upload/archive
 * @description invokes the unzip program to unzip uploaded presentations.
 **/

 // adapted from https://github.com/sharelatex/web-sharelatex/blob/master/app/coffee/Features/Uploads/ArchiveManager.coffee

"use strict";
var child = require("child_process")
  , logger = require('../logger').appLogger;

module.exports = {

  extractZipArchive: function(source, destination, callback) {

    if (callback == null) {
      callback = function(err) {};
    }

    logger.log({
      source: source,
      destination: destination
    }, "unzipping file");

    var unzip = child.spawn("unzip", [source, "-d", destination]);

    //some zip files need this
    unzip.stdout.on("data", function(d) {});

    var error = null;

    unzip.stderr.on("data", function(chunk) {
      error || (error = "");
      return error += chunk;
    });

    unzip.on("error", function(err) {
      logger.error({
        err: err,
        source: source,
        destination: destination
      }, "unzip failed");
      
      if(err.code =="ENOENT"){
        logger.error ("unzip command not found. Please check the unzip command is installed")
      }
      return callback(error);
    });

    return unzip.on("exit", function() {

      if (error != null) {
        error = new Error(error);
        logger.error({
          err: error,
          source: source,
          destination: destination
        }, "error unzipping file");
      }
      return callback(error);
    });
  }
};
