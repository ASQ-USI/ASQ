var mongoose=require('mongoose');
db = mongoose.createConnection('localhost', 'benchmark');

var gen = require('when/generator')
  , when = require('when')
  , models = require('../../models') // load all models
  , mongooseFixtures  = require('../util/mongoose-fixtures')
  , assessmentManager =  require('../../lib/assessment/assessment')
  , Assessment = db.model('Assessment')
  , Session = db.model('Session')
  , Answer = db.model('Answer')
  , WhitelistEntry = db.model('WhitelistEntry')
  , util = require('util');

var viewerNum = 100
  , modes = {
    worst: null,
    avg: null
  }
  , mode="avg";

//process command line args
var args = {};
process.argv.slice(2).forEach(function(clarg){
  var splitted = clarg.split("=");
  args[splitted[0]] = (1 in splitted)? splitted[1] : '' 
})

//check for --users=<number> argument
if("undefined" != typeof args['--users']){
  viewerNum= + args['--users']
}

//check for --mode=<value> argument
// value= 'worst', 'avg'
if("undefined" != typeof args['--mode']){
  var value = args['--mode'];
  if(modes.hasOwnProperty(value)) mode = value;
}

var fixtureObj = require('./fixtures')(viewerNum)
  , fixtures = fixtureObj.fixtures
  , answers = fixtureObj.answers
  , session = fixtureObj.session
  , whitelist = fixtureObj.whitelist;




modes.worst = gen.lift(function *boostrapWorstGen(){
  session = yield Session.findOne({_id: session._id}).exec();

  //query answers
  var answerIds = answers.map(function(answer){return answer._id})
  answers = yield Answer.find({_id : { $in: answerIds } })
    .select('_id answeree question session')
    .populate('question', '_id, assessment')
    .exec();

    console.log('answer: Using %s of memory', bytesToSize(process.memoryUsage().heapUsed));

  // create pending assessments
  var startAssessmentCreation = new Date();
  var result;
  try{
   result = yield assessmentManager.enqueue(session, answers)
  console.log ( "Created assessments in %s ms", new Date() - startAssessmentCreation);
  console.log('after queue:Using %s of memory', bytesToSize(process.memoryUsage().heapUsed));
}catch(err){console.log(err)}
  var wlCriteria = {session: session._id, role: "viewer"};
  var whitelistEntries = yield WhitelistEntry.find(wlCriteria).exec();


  /* ---------- ACTUAL BENCHMARK STARTS HERE ---------- */
  start = new Date();

  // find next assessment job for each of the viewers
  yield when.map(whitelistEntries, assessmentManager.getNextAssessmentJob);
  
  console.log("Assigned assignments in %d ms to \
 jobs for %d users", (new Date() - start), whitelistEntries.length);
  /* ---------- ACTUAL BENCHMARK ENDS HERE ---------- */
  
  return result;
});

modes.avg = gen.lift(function *boostrapAvgGen(){
  var result;
  try{
    // retrieve a Mongoose session object
    session = yield Session.findOne({_id: session._id}).exec();

    var lamda = viewerNum/600000 //viewer submissions every 10 minutes
      , l = whitelist.length;
    
    // l = 1;
    for (var i=0; i<l; i++){
      var index = Math.floor(Math.random() * whitelist.length);
      var whitelistEntry = whitelist[index];
      whitelist.splice(index, 1);

      answers = yield Answer.find({answeree : whitelistEntry._id })
      .select('_id answeree question session')
      .populate('question', '_id, assessment')
      .exec();

      var startAssessmentCreation = new Date;
      result = yield assessmentManager.enqueue(session, answers)
      console.log ( "Created assessments in %s ms", new Date() - startAssessmentCreation);
      console.log('after queue:Using %s of memory', bytesToSize(process.memoryUsage().heapUsed));

      /* ---------- ACTUAL BENCHMARK STARTS HERE ---------- */
      start = new Date();

      // find next assessment job for each of the viewers
      yield assessmentManager.getNextAssessmentJob(whitelistEntry);
      
      console.log("Assigned assignments in %d ms to \
user %d of %d %s", (new Date() - start), i+1, l, whitelistEntry.screenName);
      /* ---------- ACTUAL BENCHMARK ENDS HERE ---------- */

      yield wait( ~~expSample(lamda))
    }

  }catch(err){
    console.log(err)
  }
  
  return result;
});


var seedTimer = new Date();
mongooseFixtures.load(fixtures, db, function(err){
  if (err)  return console.log(err);
  console.log('Data loaded in %s ms', new Date()- seedTimer);
  console.log('Using %s of memory', bytesToSize(process.memoryUsage().heapUsed));
 
  modes[mode]().then(function(){
    console.log('after bootstrap: Using %s of memory', bytesToSize(process.memoryUsage().heapUsed));
    console.log("job finished")
    process.exit();
  });
});


//utility function to print bytes nicely
function bytesToSize(bytes) {
   if(bytes == 0) return '0 Byte';
   var k = 1000;
   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
   var i = Math.floor(Math.log(bytes) / Math.log(k));
   return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
}


function measureTime(job){
  var start = new Date();
  job();

  return (new Date() - start);
};

//exponential distribution sampler
function expSample(lamda){
  return - Math.log(1- Math.random())/lamda;
}

function wait(ms){
  var deferred = when.defer();
  setTimeout(function(){
    deferred.resolve(true)
  }, ms)
  return deferred.promise;
}
