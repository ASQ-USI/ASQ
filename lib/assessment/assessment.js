const Promise = require('bluebird');
const coroutine = Promise.coroutine;
const ObjectId = require('mongoose').Types.ObjectId;
const Answer = db.model('Answer');
const AnswerProgress = db.model('AnswerProgress');
const Assessment = db.model('Assessment');
const AssessmentJob = db.model('AssessmentJob');
const Exercise = db.model('Exercise');
const Question = db.model('Question');
const Rubric = db.model('Rubric');
const Session = db.model('Session');
const WhitelistEntry = db.model('WhitelistEntry');
const jobCreator = new Object(null);


/**
* "Terminate" all jobs for the given parameters and update the progress.
* In this context, terminate means changing the assessment job status to finished.
* @param {ObjectId} sessionId The session of the job.
* @param {ObjectId} exerciseId The exercise of the job.
* @param {ObjectId} assessorId The assessor of the job.
* @param {ObjectId} assesseeId The assessee of the job.
* @return a promise fulfilled with the update progress object.
*/
var terminateJobsAndUpdateProgress = coroutine(function *terminateJobsAndUpdateProgressGen
  (sessionId, exerciseId, assessorId, assesseeId) {

  var self = 0
    , peer = 0;
  
  var jobs = yield AssessmentJob.find({
    session  : sessionId,
    exercise : exerciseId,
    assessor : assessorId,
    assessee : assesseeId,
    status   : { $in: ['pending', 'active'] },
  }).exec();

  if (! jobs) { return null; }

  var savedJobs = yield  Promise.map(jobs, function saveJob(job) {
    job.status = 'finished';
    if (job.type === 'self') { self++; }
    if (job.type === 'peer') { peer++; }
    return job.save()
  });

  var updateObj = {};
  if (self > 0) { updateObj.self = self; }
  if (peer > 0) { updateObj.peer = peer; }
  
  return AnswerProgress.update(sessionId, exerciseId, updateObj);
});

/**
* Enqueues an Answer instance or array of Answer instances for assessment. This function
* assumes that all of the Answer instances should belong to the same session
* (to avoid quering the database for a session).
* @param {ObjectId} sessionId
* @param {Answer | Answer[]} val An Answer or an array of Answer instances
* @returns a promise that will fulfill with created Assessments
*/
function enqueue(sessionId, exercise, answers){
  if (arguments.length < 3){
    throw new Error('Invalid number of arguments. Function expects\
 \'sessionId\', \'exercise\' and \'answers\' arguments');
  }
  // make sure arguments are valid
  // and their relationship is valid
  if( ! (sessionId instanceof ObjectId)){
    throw new Error('Invalid argument. First argument\
 should be a valid ObjectId instance');
  }
  if( ! (exercise instanceof Exercise)){
    throw new Error('Invalid argument. Second argument\
 should be a valid Exercise instance');
  }
  if( ! (answers instanceof Array)){
    throw new Error('Invalid argument. Third argument\
 should be a valid Array instance');
  }

  // return empty array if answers length ==0;
  if( answers.length < 1){
    return Promise.resolve([]);
  }

  //make sure answers belong to the same session, exercise and
  // share the same answeree and assessment type
  var answeree = answers[0].answeree.toString();
    // , type = answers[0].question.assessment[0];
  answers.forEach(function(answer){
    if (answer.session.toString() !== sessionId.toString()){
      throw new Error('Mismatch Error: Property session of Answer ' + answer +
       ' doesn\'t match the _id property of Session '+ sessionId);
    }
    if (answer.exercise.toString() !== exercise._id.toString()){
      throw new Error('Mismatch Error: Property exercise of Answer ' + answer +
       ' doesn\'t match the _id property of Exercise ' + exercise);
    }
    if (answer.answeree.toString() !== answeree){
      throw new Error('Mismatch Error: Property answeree of Answer ' + answer +
       ' doesn\'t match the property answeree of first Answer ' + answers[0]);
    }
    if ( ! (answer.question instanceof Question)){
      throw new TypeError('Type Error: Property question of Answer ' + answer +
       ' is not populated with a Question instance');
    }
    // if( type !=  answer.question.assessment[0]){
    //   throw new Error('Mismatch Error: Property assessment[0] of answer.question ' +
    //     answer.question._id + ' for answer ' + answer._id)
    // }
  })

  return _enqueueAssessmentJob(sessionId, exercise, answers);
}


/**
* Enqueues an single Assessment for the specified session and answer
* @param {ObjectId} sessionId
* @param {Answer} val An Answer instance  with the same session property as session._id
* @returns a promise that will fulfill with the created Assessments
*/
var _enqueueSelfAssessmentJob = coroutine(function *enqueuePeerAssessmentJobGen(sessionId, exercise, answers) {
  try{
    var newJob = yield _createJob(answers[0].answeree, exercise, answers, 'self');
    yield AssessmentJob.create(newJob);
  }catch(err){
  }
});


var _enqueuePeerAssessmentJob = coroutine(function *enqueuePeerAssessmentJobGen(sessionId, exercise, answers) {
  try{
    var answeree = answers[0].answeree
      , criteria = {
          session: sessionId,
          role: 'viewer',
          _id : {$ne: answeree }
        }
      , answereeStr = answeree.toString()
      , newJobs=[]
      , createdJobs;

    var whitelistEntries = yield WhitelistEntry.find(criteria)
      .select('_id')
      .lean()
      .exec();

    var newJobs = yield Promise.map(whitelistEntries , function(wlEntry){
      return _createJob(wlEntry._id , exercise, answers, 'peer')
    });
    createdJobs = yield AssessmentJob.create(newJobs);
  }catch(err){

  }
});

var _createJob = coroutine(function *createJobsGen(assessorId, exercise, answers, type){

  var newJobs = []
    ,assets = [];

  yield Promise.map(answers, coroutine(function *createAssets(answer){

    var rubrics = yield Rubric.find({question: answer.question._id}).lean().exec();
    assets.push ({
      question : answer.question.toObject(),
      rubrics  : rubrics,
      answer   : answer.toObject(),
    });

    return;
  }));

  return {
    session  : answers[0].session,
    exercise : exercise._id,
    assets   : assets,
    assessee : answers[0].answeree,
    assessor : assessorId,
    score    : 0,
    type     : type,
    status   : 'pending'
  }

});


/**
* Enqueues an single Assessment for the specified session ans answer
* @param {ObjectId} sessionId
* @param {Answer} val An Answer instance  with the same session property as session._id
* @returns a promise that will fulfill with the created Assessments
*/
var _enqueueAssessmentJob = coroutine(function *enqueueAssessmentJobGen(sessionId, exercise, answers) {
  try{

    var assessmentTypes = exercise.assessmentTypes;

    yield Promise.map(assessmentTypes , coroutine(function *createJobByType(type){
      if(jobCreator[type]){
        yield jobCreator[type](sessionId, exercise, answers);
      }
    }))

  } catch(err){
    console.error(err.stack); //TODO This is bad, should use logger
  }
  return;
});


/**
* Searches for the next assessment job for a given assessor
* @param {WhitelistEntry} assessor A WhitelistEntry object representing the assessor
* @returns {Promise } Promise will fulfill with WhitelistEntry _id of the assessee or null if there's no next job
*/
var getNextAssessmentJob = coroutine(function *searchAssesseesGen(sessionId , exercise, assessorId){
  try{
    // get all candidates for assessment
    var criteria = {
      session: sessionId,
      exercise : exercise._id,
      assessor : assessorId,
      status: 'pending'
    }

    // first get all users who have answered this specific exercise
    var candidates = yield AssessmentJob.distinct('assessee' , criteria ).exec();

    // find candidate with the most pending assessments
    criteria = {
      session  : sessionId,
      exercise : exercise._id,
      assessee : { $in: candidates },
      status: 'pending'
    }

    candidates = yield AssessmentJob
      .aggregate([
          {$match: criteria},
          {$group: { _id: '$assessee', total: {$sum: 1}}},
          { $sort: {total: -1}}
        ]).exec();

    if(candidates.length < 1) return null;

    //finally get the assessment job for this candidate
    criteria = {
      exercise: exercise._id,
      assessor : assessorId,
      assessee : candidates[0]._id,
      status: 'pending'
    }
   var assessmentJobs = yield AssessmentJob.find(criteria).exec();
   // var assessmentJobs = yield AssessmentJob.find(criteria).populate('assessor').exec();

   return (assessmentJobs.length > 0)
    ? assessmentJobs[0] : null
  }catch(err){
    console.error(err.stack); //TODO This is bad, should use logger
  }
});

var activateJob = function(job) {
  if (! job) {
    process.nextTick(function onNoJob() { return Promise.resolve(null); });
    return;
  }
  job.status = 'active';

  return job.save();
};


var getNextJobForIdleViewers = coroutine(function *getNextJobForIdleViewersGen(sessionId, exercise) {
  try{

    var criteria = {
      session  : sessionId,
      exercise : exercise._id
    }

    //first get all users who have answered this specific exercise
    var answereeIds = yield Answer
      .distinct('answeree' , {
        session : sessionId,
        exercise : exercise._id
      }).exec();

    // we want to find all the whitelist ids of users with pending jobs
    // that don't have an active job. To do this :
    //  - first, we exclude entries that have a finished job
    //  - then, we group by assessor (whitelist id) and we aggregate in the
    //     statuses array all the statuses for a specific assessor (which
    //     can be either pending or active since we excluded finished)
    //  - finally, we want the statuses array to contain 'pending' but not
    //     'active'
    var whitelistIds = yield AssessmentJob
      .aggregate([
        { $match: {
                    assessor: { $in : answereeIds },
                    session : sessionId,
                    exercise : exercise._id,
                    status: { $ne: "finished" }
          } },
        { $group: { _id: '$assessor',  statuses: { $addToSet: "$status" } } },
        { $match: { $and : [
                             { statuses: { $nin: ["active"] } },
                             { statuses: { $in: ["pending"] } }
                    ] } },
        { $project : { _id : 1 }}
      ]).exec();

    var nextJobs = yield Promise.map(whitelistIds , function(whitelistId){
      return getNextAssessmentJob(sessionId, exercise, whitelistId._id)
    })

    //remove null elements
    nextJobs = nextJobs.filter(function(n){ return n != undefined });

    return nextJobs;
  }catch(err){

  }
});

jobCreator.peer = _enqueuePeerAssessmentJob;
jobCreator.self = _enqueueSelfAssessmentJob;

module.exports = {
  activateJob                    : activateJob,
  enqueue                        : enqueue,
  getNextAssessmentJob           : getNextAssessmentJob,
  getNextJobForIdleViewers       : getNextJobForIdleViewers,
  terminateJobsAndUpdateProgress : terminateJobsAndUpdateProgress,
}