var mongoose=require('mongoose');
db = mongoose.createConnection('localhost', 'benchmark');

var gen = require('when/generator')
  , when = require('when')
  , models = require('../../models') // load all models
  , mongooseFixtures  = require('../util/mongoose-fixtures')
  , assessmentManager =  require('../../lib/assessment/assessment')
  , Session = db.model('Session')
  , Exercise = db.model('Exercise')
  , Answer = db.model('Answer')
  , WhitelistEntry = db.model('WhitelistEntry')
  , util = require('util');

var viewerNum = 100
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
  if(['worst', 'avg'].indexOf(value) >= 0) mode = value;
}

var fixtureObj = require('./fixtures')(viewerNum)
  , fixtures = fixtureObj.fixtures
  , answers = fixtureObj.answers
  , session = fixtureObj.session
  , exercise = fixtureObj.exercise
  , whitelist = fixtureObj.whitelist;


start = gen.lift(function *boostrapAvgGen(){
  var result;
  try{
    // retrieve Mongoose session objects for session and exercis
    session = yield Session.findOne({_id: session._id}).exec();
    exercise = yield Exercise.findOne({_id: exercise._id}).exec();


    // 5/60000 * (viewNum/5)

    var lamda = viewerNum/600 //viewer submissions every 10 minutes
      , l = whitelist.length;
    
    // l = 1;
    for (var i=0; i<l; i++){
      var index = Math.floor(Math.random() * whitelist.length);
      var whitelistEntry = whitelist[index];
      whitelist.splice(index, 1);

      answers = yield Answer.find({answeree : whitelistEntry._id })
      .select('_id answeree exercise question session')
      .populate('question', '_id assessment')
      .exec();

      var startAssessmentCreation = new Date;
      result = yield assessmentManager.enqueue(session._id, exercise, answers)
      console.log ( "Created assessments in %s ms", new Date() - startAssessmentCreation);
      console.log('after queue:Using %s of memory', bytesToSize(process.memoryUsage().heapUsed));

      /* ---------- ACTUAL BENCHMARK STARTS HERE ---------- */
      start = new Date();

      // find next assessment job for each of the viewers
      yield assessmentManager.getNextAssessmentJob(session._id, exercise, whitelistEntry);
      
      console.log("Assigned assignments in %d ms to \
user %d of %d %s", (new Date() - start), i+1, l, whitelistEntry.screenName);
      /* ---------- ACTUAL BENCHMARK ENDS HERE ---------- */

      if(mode === 'avg'){
         yield wait( ~~expSample(lamda))
      }  
    }

  }catch(err){
    console.log(err.stack)
  }
  
  return result;
});


//Main work starts here
var seedTimer = new Date();
mongooseFixtures.load(fixtures, db,dataLoaded);

 function dataLoaded(err){
  if (err)  return console.log(err);
  console.log('Data loaded in %s ms', new Date()- seedTimer);
  console.log('Using %s of memory', bytesToSize(process.memoryUsage().heapUsed));
 
  start().then(function(){
    console.log('after bootstrap: Using %s of memory', bytesToSize(process.memoryUsage().heapUsed));
    console.log("job finished")
    process.exit();
  });
}


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
