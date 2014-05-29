var config = require('../../config');
// Globals : mongoose, db, and schemas
mongoose   = require('mongoose');
db         = mongoose.createConnection(config.mongoDBServer, config.dbName, config.mongoDBPort);
schemas    = require('../../models');

var gen = require('when/generator');
var Session = db.model('Session');
var Answer = db.model('Answer');
var WhitelistEntry = db.model('WhitelistEntry');



/**
* Queues an Answer instance or array of Answer instances for assessment. This function
* assumes that all of the Answer instances should belong to the same session
* (to avoid quering the database for a session). 
*/
function queue(session, val){
  if (val  instanceof Array) {
    val.each(function(answer){
      queueAnswer(session, answer)
    });
  } else{
    queueAnswer(session, val);
  }
}


/**
* Queues an single Answer instance for the specified instance
* @return a promise that will fulfill with .. TODO
*/
function queueAnswer(session, answer){
  // make sure arguments are valid 
  // and their relationship is valid
  if( ! (session instanceof Session)){
    throw new Error("Invalid argument. First argument\
      should be a valid Session instance");
  }
  if( ! (answer instanceof Answer)){
    throw new Error("Invalid argument. Second argument\
     should be a valid Answer instances");
  }

  if( answer.sesssion !== session._id){
    throw new Error("Mismatch of properties:\
     answer.session does not match session.id");
  }

  // returns a promise
  return queueAssessmentJob(session, answer);
}





var queueAssessmentJob = gen.lift(function *queueAssessmentJobGen(session, answer) {
  try{
    var criteria = {session: session._id, role: "viewer"};
    // var popcriteria = {
    //   path: 'user',
    //   match: { _id: { $ne: answeree._id }}
    // }
    var whitelistEntries = yield WhitelistEntry.find(criteria).exec();

    whitelistEntries.forEach(function(wlEntry){
      var props = {
        session  : session._id,
        answer   : answer._id,
        assessee : answer.answeree._id,
        assessor : wlEntry._id,
        score    : 0,
        type     : answer.question.type,
        status  : "pending"
      }
      var assessment = new Assessment(props);
      // var sth= yield assessment.save();
      
    });
  } catch(e){
    console.log(e)
  }
});

module.exports = {
  queue : queue
}