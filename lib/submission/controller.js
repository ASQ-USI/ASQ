/** @module lib/submission/controller
    @description handlers for socket events
*/

var assert = require('assert');
var Promise = require('bluebird');
var coroutine = Promise.coroutine;
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var _ = require('lodash');
var logger = require('../logger').appLogger;
var hooks = require ('../hooks/hooks');
var Exercise = db.model('Exercise');
var ExerciseSubmission = db.model('ExerciseSubmission')

module.exports = {

  exerciseSubmission : coroutine(function *submitGen(socket, submission) {
    try{
      logger.debug('Submission', require('util').inspect(submission));
      // make sure submission has valid format
      yield this.validateSubmission(submission);

      // Notify the sender that we're on it
      socket.emit('asq:submitted', {
        exerciseUid : submission.exerciseUid,
        status   : 'processing'
      });

      //augment submission with necessary properties
      submission.answeree = socket.request.token;
      submission.session = socket.request.sessionId;

      // check if whether the submission is allowed or it exceeds
      // the max times of allowed submissions
      if ( ! yield this.checkMaxSubmissionTimes(submission) ) {
        console.log('HHH', 'exceeds max allowed number of submissions');
        socket.emit('asq:submitted', {
          exercise : submission.exerciseUid,
          status   : 'error',
          message  : 'exceeds max allowed number of submissions'
        });
        return
      }

      yield hooks.doHook("exercise_submission", submission)

      // answer hook: interested plugins should register for this hook
      // and process/persist the question types they are responsible for
      var processedAnswers = yield Promise.map(submission.submission, function(answer){

        //augment answer with necessary properties
        answer.exercise_id = submission.exerciseUid;
        answer.answeree = socket.request.token;
        answer.session = socket.request.sessionId;
        answer.confidence = submission.confidence;

        return hooks.doHook("answer_submission", answer);
      });

      socket.emit('asq:submitted', {
        exercise : submission.exerciseUid,
        status   : 'success',
        type     : 'answer'
      });

     // this.afterExerciseSubmission(socket, submission.exerciseUid);

      // after answer hook: 
      var afterAnswers = yield Promise.map(processedAnswers, function(answer){
        return hooks.doHook("after_answer_submission", answer);
      });
     

    //   var token = socket.request.token;
    //   var session = yield Session.findOne({_id: socket.request.sessionId}).exec();

    //   //TODO : return object instead of an array
    //   var data = yield submission.answer.save(session, token, evt.exercise);

    //   var exercise  = data[0];
    //   var questions = data[1];
    //   var answers   = data[2];
    //   var progress  = data[3];
    //   var self      = data[4];
    //   var peer      = data[5];

    //   socketUtils.sendProgress(progress, session.id);

    //   socket.emit('asq:submitted', {
    //     exercise : exercise.id,
    //     resubmit : exercise.allowResubmit,
    //     status   : 'success',
    //     type     : 'answer'
    //   });

    //   //see if automatic asssemsent was created
    //   var assessments = yield Assessment.find({
    //     session: session._id,
    //     exercise: exercise._id,
    //     assessee : token,
    //     type : 'auto'
    //   }, {'_id': 0,
    //    'assessee': '1',
    //    'question': '1',
    //    'answer' : '1',
    //    'score': '1', 
    //    'type': '1',
    //    'submittedDate' :'1'
    //  })
    //   .populate('question answer')
    //   .exec();

    //   assessments.forEach(function(assessment){
    //     socket.emit('asq:assessment', assessment.toObject());
    //     socketUtils.emitToRoles('asq:assessment',assessment.toObject() , session.id, 'ctrl');
    //   })

    //   //check if the user has answered every question
    //   var slideshow = yield Slideshow
    //     .findById(session.slides)
    //     .exec();

    //   var answeredQuestions = yield Answer.aggregate()
    //     .match({ session: session._id, answeree: token })
    //     .group({_id : 0, questions: { $addToSet: "$question" }})
    //     .project({ _id: 0 , sameElements: { '$setEquals': [ "$questions", slideshow.questions ] } } )
    //     .exec();
        
    //   if(answeredQuestions[0].sameElements === true){
    //     var entry = yield WhitelistEntry.findById(token).exec();
    //     entry.sessionData.answeredAllDate = new Date();
    //     entry.markModified('sessionData');
    //     //save user
    //     var liftedSave = nodefn.lift(entry.save.bind(entry))
    //     var saved = yield liftedSave();
        
    //     socket.emit('asq:answered-all');
    //     socketUtils.emitToRoles('asq:answered-all', { userId: token }, session.id, 'ctrl');
    //   }

    //   //async
    //   calculateRankings(session);


    //   // Handle peer assessment
    //   if (self || peer) { // Add answers for peers
    //     // in the case of assessment -> add the answer to the queue
    //     var jobs = yield socketUtils.enqueueAnswersForAssessment(session._id, exercise, answers, token);
    //     var job = yield assessment.job.getNextAssessmentJob(session._id, exercise, token);
    //     job = assessment.job.activateJob(job);
    //     var html = yield assessment.render(job);

    //     if (!! html) {
    //       logger.info('Sending assessment to ' + socket.id);
    //       socket.emit('asq:assess', { html: html, exercise: exercise.id });
    //     }
    //     // notify ctrl of the assessment
    //     socketUtils.notifyCtrlForNewJobs([job]);

    //     var newJobs = yield assessment.job.getNextJobForIdleViewers(session._id, exercise); 
    //     var JobSocketsPairs = yield socketUtils.getSocketsForJobs(newJobs);
    //     JobSocketsPairs = yield socketUtils.activateJobsForSockets(JobSocketsPairs);
    //     var HtmlSocketsPairs = socketUtils.renderJobsForSockets(JobSocketsPairs);
    //     socketUtils.sendHtmlForSockets(HtmlSocketsPairs, exercise.id);
    //     socketUtils.notifyCtrlForNewJobs( newJobs);
    //   }
    }catch(err){
      // socket.emit('asq:submitted', {
      //   status   : 'error',
      //   message: : 'Invalid submission'
      // });
      logger.error(err.message, { 
        err: require('util').inspect(err),
        stack: err.stack });
    } 
  }),



  afterExerciseSubmission: coroutine(function *afterExerciseSubmissionGen(submission){
      // hooks.doHook("after_exercise_submission", {
      //   exercise_id:
      // });
  }),

  validateSubmission: coroutine(function *validateSubmissionGen(submission){

    var exerciseUid = submission.exerciseUid;
    console.log('validateSubmission', submission);    

    assert(ObjectId.isValid(exerciseUid) , 
      'Invalid Submission: Missing or invalid exerciseUid.');

    var confidence = submission.confidence;

    // TODO: when exercise has configuration check to see if confidence is required 
    // assert(_.isNumber(confidence)
    //   , 'Invalid submission, Missing or invalid `confidence`')

    if(confidence){  
      confidence = parseInt(submission.confidence);
      assert( submission.confidence >= 0 && confidence <= 5  
      , 'Invalid submission, `confidence` should be an integer between 0 and 5')
    }

    var submissions = submission.submission;
    assert(_.isArray(submissions), 
      'Invalid Submission: submission.submission should be an Array.')

    var questionUids = submissions.map(function answerMap(question){
      assert(ObjectId.isValid(question.questionUid), 
        'Invalid submission: Missing or invalid `questionUid`.');
      return ObjectId(question.questionUid);
    })

    var exercise = yield Exercise.findById(exerciseUid).exec();
    assert(exercise, 
      'Invalid Submission: `exerciseUid` '+ exerciseUid +' not found in Database.');

    assert(_.isEqual(exercise.questions, questionUids),
      'Invalid Submission: `exercise.questions` do not match `questionUids` of submitted answers.')
  }),


  checkMaxSubmissionTimes: coroutine(function *checkMaxSubmissionTimes (submission) {
    var exercise = yield Exercise.findById(submission.exerciseUid).exec();
    var max = exercise.maxNumSubmissions;

    var count = yield ExerciseSubmission.where({
      'exercise': submission.exerciseUid,
      'answeree': submission.answeree,
      'session' : submission.session,
    }).count();

    return Promise.resolve(count < max);
  })
}

