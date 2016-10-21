var cheerio    = require('cheerio');
var asyncblock = require('asyncblock');
var fs         = require('fs-extra');
var config     = require('../../../config');
var logger     = require('logger-asq');
var exec       = require('child_process').exec;

function createThumbs(slideshow) {
  //check if w2png exists
  if (!fs.existsSync("/usr/local/w2png")) { return;}

  fs.readFile(slideshow.viewerFile, 'utf-8', function(error, data) {
    var ids = [];
    var $ = cheerio.load(data);
    $('.step').each(function() {
      var id = this.attr().id;
      //If slide does not have id, use step-n instead (for url calling)
      if(id == undefined){
        ids.push("step-"+ (ids.length + 1));
      } else {
        ids.push(id);
      }
    });

    asyncblock(function(flow){
      fs.mkdirpSync(config.uploadDir + '/thumbs/' + slideshow._id);
      var call = new Array();
      call[0] = "/usr/local/w2png -W 1024 -H 768 --delay=1 -T -D ";
      call[1] = app.get('uploadDir')
      call[2] = "/thumbs/";
      call[3] = slideshow._id;
      call[4] = " -o ";
      call = call.join("");

      var url = config.rootUrl
      url += "/slidesInFrame/";
      url += slideshow._id;
      url += "/?url=";

      for(var i = 0; i < ids.length; i++){
        logger.debug("calling: " + call + i + " -s 0.3 " + url + ids[i]);
        exec(call + i + " -s 0.3 " + url + ids[i], flow.add());
        flow.wait();
      }
    });
  });
}

module.exports = {
  createThumbs : createThumbs,
  getPresentationsByCourse : getPresentationsByCourse
}