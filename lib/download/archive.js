const logger = require('logger-asq');
const archiver = require('archiver');

module.exports = {

  createArchiveStream: function(path, dustfile){

    logger.log({
      path,
      dustfile
    }, "preparing zip file");

    var archive = archiver('zip');  

    archive.glob('**/*', {
        cwd: path,
        ignore: [dustfile]
    }, {});

    archive.finalize();

    return archive;
  }
}