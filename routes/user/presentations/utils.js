var cheerio    = require('cheerio')
  // , asyncblock = require('asyncblock')
  , fs         = require('fs')
  , mkdirp     = require('mkdirp')
  , moment      = require('moment')
  , config     = require('../../../config')
  , appLogger  = require('../../../lib').logger.appLogger
  , exec       = require('child_process').exec
  , when       = require('when')
  , gen        = require('when/generator');

var getPresentationsByCourse = gen.lift(function *getPresentationsByCourseGen(userId, Session, Slideshow) {
  appLogger.debug('getPresentationsByCourse');
  var slidesByCourse = null; //to evaluate as false in dustjs
  try{
    var sessionPromise = Session.getLiveSessions(userId);
    var slideshowPromise = Slideshow.find({
      owner : userId
    }, '_id title course lastSession lastEdit').exec();

    var results = yield when.all([sessionPromise, slideshowPromise])
    var sessions =  results[0];
    var slides = results[1];
    var live={};
    sessions.forEach(function(session){
      live[session.slides.toString()]=session._id;
    });

    if (typeof slides != "undefined"
          && slides != null
          && slides.length > 0) {
      slidesByCourse = {};
      for (var i = 0; i < slides.length; i++) {
        var slideshow = slides[i].toJSON();
        if (live.hasOwnProperty(slideshow._id)) {
          slideshow.live = live[slideshow._id]
        }else{
          slideshow.live = null;
        }

        if (!slidesByCourse.hasOwnProperty(slideshow.course)) {
          slidesByCourse[slideshow.course] = [];
        }
        slideshow.lastEdit = moment( slideshow.lastEdit)
            .format('DD.MM.YYYY HH:mm');
        slideshow.lastSession = moment( slideshow.lastSession)
            .format('DD.MM.YYYY HH:mm');
        slidesByCourse[slideshow.course].push(slideshow);
      }
    }
  }catch(err){
    appLogger.error( err.toString(), { err: err.stack });
  }
  return slidesByCourse;
});

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
      mkdirp.sync(app.get('uploadDir') + '/thumbs/' + slideshow._id);
      var call = new Array();
      call[0] = "/usr/local/w2png -W 1024 -H 768 --delay=1 -T -D ";
      call[1] = app.get('uploadDir')
      call[2] = "/thumbs/";
      call[3] = slideshow._id;
      call[4] = " -o ";
      call = call.join("");

      var url = new Array();
      url[0] = (config.enableHTTPS ? "https://" : "http://");
      url[1] = process.env.HOST;
      url[2] = ":";
      url[3] = process.env.PORT;
      url[4] = "/slidesInFrame/";
      url[5] = slideshow._id;
      url[6] = "/?url=";
      url = url.join("");

      for(var i = 0; i < ids.length; i++){
        appLogger.debug("calling: " + call + i + " -s 0.3 " + url + ids[i]);
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