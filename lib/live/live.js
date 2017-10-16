const Promise = require('bluebird');
const coroutine = Promise.coroutine;
const logger = require('logger-asq');
const lib = require('../index.js');
const presUtils = lib.utils.presentation;
const Slideshow = db.model('Slideshow');
const Exercise = db.model('Exercise');
const User = db.model('User', schemas.userSchema);
const Session = db.model('Session');
const Question = db.model('Question');


const startPresentation =  coroutine(function *startPresentationGen(req, res, next) {
  try{
    logger.debug('New session from ' + req.user.username);

    const  slidesId = req.params.presentationId

    const slideshow = yield Slideshow.findOne({
      _id   : slidesId,
      owner : req.user._id })
    .exec();

    if(!slideshow){
      throw new Error('No slideshow with this id');
    }  // FIXME: create proper error like in list presentations

    slideshow.lastSession = new Date();

    //Instantiate a new session
    const newSession = new Session();
    newSession.presenter = req.user._id;
    newSession.slides = slideshow._id;
    newSession.flow = ( Session.schema.path('flow').enumValues
      .indexOf(req.body.flow) > -1 ) ? req.body.flow : 'ctrl';
    newSession.authLevel = ( Session.schema.path('authLevel').enumValues
      .indexOf(req.body.authLevel) > -1 ) ? req.body.authLevel : 'public';

    /* 
      This is needed for the live app, since we need to store the active viewer question (the question that it's displayed to the users)
    */
    newSession.data = {
      activeViewerQuestion: null,
      questions: [],
      studentQuestionsEnabled: false,
    };
    newSession.markModified('data');
    const userPromise = User
      .findById(req.user._id)
      .exec()
      .then( function onUser(user){
        if(!user){
          return Promise.reject(new Error('No user with this id'))
        } //FIXME create proper error like in list presentations
        // user.current = (newSession._id)
        // user.liveSessions.addToSet(newSession._id)
        return user.save()
      });
    const implicitQuestionData = {
      type: 'asq-text-input-q',
      author: req.user._id,
      data: {
        description: 'Implicit question placeholder for live app student questions',
        type: 'implicit-student-question',
        session: newSession._id,
      },
    };

    const implicitQuestion = new Question(implicitQuestionData);
    const viewerQuestionExerciseData = {
      stem: 'viewerQuestionExercise',
      questions: [implicitQuestion._id],     
    };
    const viewerQuestionExercise = new Exercise(viewerQuestionExerciseData);
    yield Promise.all([
      slideshow.save(),
      newSession.save(),
      userPromise,
      implicitQuestion.save(),
      viewerQuestionExercise.save(),
    ]);

    const pFn = Promise.promisify(presUtils.generateWhitelist[newSession.authLevel]);
    yield pFn(newSession._id, req.user);

    logger.info('Starting new ' + newSession.authLevel + ' session');
    res.location(['/', req.user.username, '/presentations/', newSession.slides,
      '/live/', newSession._id, '/?role=presenter&view=ctrl'].join(''));
    res.sendStatus(201);
  }catch(err){
    next(err)
  }
});

const terminatePresentation = coroutine(function *terminatePresentationGen(req, res, next) {

  try{
    logger.debug({
      owner_id: req.user._id,
      slideshow: req.params.presentationId
    }, 'Stopping session');


    const userId = req.user._id;
    const presentationId = req.params.presentationId;
    
    const terminatedSessions = yield Session.terminateAllSessionsForPresentation(userId, presentationId)

    // if sessions has zero length there was no live sessions
    if (! terminatedSessions.length) {
      const err404 = Error.http(404, 'No session found', {type:'invalid_request_error'});
      throw err404;
    }
    
    res.sendStatus(204);
    
    logger.log({
      owner_id: req.user._id,
      slideshow: req.params.presentationId,
      sessions: terminatedSessions.map( s => s._id.toString()),
    }, "stopped session");

  }catch(err){
    logger.error({
      err: err,
      owner_id: req.user._id,
      sessions: terminatedSessions,
    }, "error stopping session");

    //let error middleware take care of it
    next(err);
  }
});

module.exports = {
  startPresentation,
  terminatePresentation,
}