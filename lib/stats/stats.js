/** Statistics */
const logger = require('logger-asq');
const Promise = require('bluebird');
const coroutine = Promise.coroutine;
const moment = require('moment');
const ObjectId = require('mongoose').Types.ObjectId;

const correctness = require('./correctness');
const Question = db.model('Question');
const Session = db.model('Session');
const Slideshow  = db.model('Slideshow');
const Answer = db.model('Answer');
const Assessment = db.model('Assessment');
const WhitelistEntry = db.model('WhitelistEntry');


exports.getStats = function(req, res) {

  // /stats/question...&metric=
  console.log(req.query);

  // Correctness with confidence levels
  if (req.query.metric == 'correctness'
    && req.query.session && req.query.question) {
    correctness(req, res);
    return;
  }

  //Create search object - This object will be filled with all the stuff we want to search for
  var searchObj = {};

  //If search is by question add array of questionIds to search object
  if (req.query.question != undefined) {
    searchObj.question = {
      $in : req.query.question.split(",")
    };
  }

  //If search is by session add array of sessionIds to search object
  if (req.query.session != undefined) {
    searchObj.session = {
      $in : req.query.session.split(",")
    };
  }

  //If search is by user add array of userIds to search object
  if (req.query.user != undefined) {
    searchObj.user = {
      $in : req.query.user.split(",")
    };
  }

  //If search is by slideshow add array of slideshowIds to search object
  if (req.query.slideshow != undefined) {
    searchObj.slideshow = {
      $in : req.query.slideshow.split(",")
    };
  }
  console.log("Search Object " + searchObj);
  console.log(searchObj);
  //Search Answer with search object
  Answer.find(searchObj, function(err, answers) {
    //If error is encountered
    if (err) {
      console.log(err);
      res.send(500, "Error in search query.");
    }
    //Claculate answers only if there are more than 1 submissions
    else if (answers.length > 0) {

      //Right vs wrong stats
      if (req.query.metric == "rightVsWrong") {
        var data = calcRightVsWrong(answers);
        var result = [['Correctness', 'Number of submissions'], ['Correct answers', data.correct], ['Wrong answers', data.wrong]];
        res.send(200, result);
      }

      //Distict options stats
      else if (req.query.metric == "distinctOptions") {

        //Test if question objects exists and if only one question is given (this metric works only with one question)
        if (searchObj.question != undefined && searchObj.question.$in.length == 1) {
          Question.findById(searchObj.question.$in[0], function(err, question) {
            if (err) {
              console.log(err);
              res.send(500, "Error in search query.");
            } else if (question) {
              var data = calcDistictOptions(answers, question);
              var result = [['Option', 'Correct answers', 'Wrong answers']];
              for (var i = 0; i < data.length; i++) {
                if (data[i].correct) {
                  result.push([data[i].text, data[i].quantity, 0]);
                } else {
                  result.push([data[i].text, 0, data[i].quantity]);
                }
              };
              res.send(200, result);
            } else {
              console.log("Question not found");
              res.send(404, "Question not found");
            }
          });
        } else {
          console.log("Question object missing or multiple objects given")
          res.send("Question object missing or multiple objects given")
        }
      }
      //Distinct answers stats
      else if (req.query.metric == "distinctAnswers") {
        //Test if question objects exists and if only one question is given (this metric works only with one question)
        if (searchObj.question != undefined && searchObj.question.$in.length == 1) {
          console.log(searchObj.question.$in[0]);
          Question.findById(searchObj.question.$in[0], function(err, question) {
            if (err) {
              console.log(err);
              res.send(500, "Error in search query.");
            } else if (question) {
              var data = calcDistictAnswers(answers, question);
              var result = [['Option', 'Correct answers', 'Wrong answers']];
              for (var i = 0; i < data.length; i++) {
                if (data[i].correct) {
                  result.push([data[i].text, data[i].quantity, 0]);
                } else {
                  result.push([data[i].text, 0, data[i].quantity]);
                }
              };
              res.send(200, result);
            } else {
              console.log("Question not found");
              res.send(404, "Question not found");
            }
          });
        } else {
          console.log("Question object missing or multiple objects given")
          res.send("Question object missing or multiple objects given")
        }
      } else {
        res.send(404, "Metric is missing try &metric=distinctAnswers or &metric=distinctOptions or &metric=rightVsWrong")
      }

    }
    //Return nothing if no answers found
    else {
      res.send(200, "No stats found");
    }

  });

}
//Given an array of answers, how many are right or wrong
//Returns object {correct: x, wrong: y}
function calcRightVsWrong(answers) {

  //Prepare return object
  var result = {
    correct : 0,
    wrong : 0
  }

  //Return empty element if no answer provided
  if (answers.length == 0) {
    return result;
  }

  //Iterate over array and update return object
  for (var i = 0; i < answers.length; i++) {
    if (answers[i].correctness == 100) {
      result.correct++;
    } else {
      result.wrong++;
    }
  }

  //returns object
  return result;
}

//Given an array of answers and the solution to the question, returns array of distinct options
function calcDistictOptions(answers, question) {

  //Check if answers contains more than one submission and question is defined
  if (answers.length < 1 || question == undefined) {
    console.log("Error in calculating disctinct options: No answers provided or question missing")
    return;
  }

  //Prepare return object
  var result = [];
  //If questiion is a multiple choice question -> submission is array of boolean
  if (question.questionType == "multi-choice") {

    //All submissions must have same amount of options
    var optionsLength = question.questionOptions.length;

    //Fill return object with
    for (var i = 0; i < optionsLength; i++) {
      result.push({
        text : question.questionOptions[i].text,
        correct : question.questionOptions[i].correct,
        quantity : 0 //How often option was selected
      });
    }

    //Iterate over answers
    for (var i = 0; i < answers.length; i++) {
      //Check if answer has the correct amount of options
      if (answers[i].submission.length != optionsLength) {
        console.log("Error in calculating disctinct options: Multiple choice options differ in length. This can't be as every answer has to have the same length.")
        console.log(answers[i].submission);
        console.log(optionsLength);
      }

      //Update return object
      //For every option in submission of an answer check if selected and if true increase value in return object
      for (var j = 0; j < optionsLength; j++) {
        if (answers[i].submission[j] == true) {
          result[j].quantity++;
        }
      };

    };
  }
  //Text questions
  else if (question.questionType = "text-input") {
    for (var i = 0; i < answers.length; i++) {
      //Test if answer is new, if no increase quantity in results
      var isNewAnswer = true;
      for (var j = 0; j < result.length; j++) {
        if (arrayEqual(result[j].submission, answers[i].submission)) {
          isNewAnswer = false;
          result[j].quantity++;
        }
      };

      //If new answer push to results
      if (isNewAnswer) {
        var newAnswer = {
          submission : answers[i].submission,
          text : answers[i].submission.join(),
          correct : false,
          quantity : 1 //How often option was selected
        }
        if (answers[i].correctness == 100) {
          newAnswer.correct = true;
        }
        result.push(newAnswer)
      }
    };
  }

  // Else (missing or unknown question type) log error
  else {
    console.log("Error in calculating disctinct options: question type is unknown or mission: ");
    console.log(question.questionType)
  }

  return result;
}

//Given an array of answers and the solution to the question, returns array of distinct options
function calcDistictAnswers(answers, question) {

  //Check if answers contains more than one submission and question is defined
  if (answers.length < 1 || question == undefined) {
    console.log("Error in calculating disctinct answers: No answers provided or question missing")
    return;
  }

  //Prepare return object
  var result = new Array();

  if (question.questionType == "multi-choice") {
    //All submissions must have same amount of options
    var optionsLength = question.questionOptions.length;

    //Get correct answer
    var solution = new Array();
    for (var i = 0; i < optionsLength; i++) {
      if (question.questionType == "multi-choice") {
        solution.push(question.questionOptions[i].correct);
      } else {
        solution.push(question.questionOptions[i].text);
      }
    };
    console.log(solution);

    //Iterate over answers
    for (var i = 0; i < answers.length; i++) {
      //Check if answer has the correct amount of options
      if (answers[i].submission.length != optionsLength) {
        console.log("Error in calculating disctinct options: Multiple choice options differ in length. This can't be as every answer has to have the same length.")
      }

      //Remember id answer is not part of results yet
      var newAnswer = true

      //Check if answer was seen before. If yes increase quantity, if no add to results.

      for (var j = 0; j < result.length; j++) {
        //Check if answer alreday exists in results and if yes increase quantity
        if (arrayEqual(result[j].submission, answers[i].submission)) {
          result[j].quantity++;
          newAnswer = false;
          break;
        }
      };
      //If still new anser add to reluts
      if (newAnswer) {

        //Check if new answer is correct
        var correct = arrayEqual(answers[i].submission, solution);

        //text for each dataset
        var optionText = "";
        //text that contains all selected answer option texts

        var selected = new Array();
        for (var k = 0; k < answers[i].submission.length; k++) {
          if (answers[i].submission[k] == true) {
            selected.push(question.questionOptions[k].text.trim());
            optionText = optionText + String.fromCharCode(65 + k) + " ";
          }
        };

        if (question.questionType == "multi-choice") {
          optionText = optionText + "- " + selected.join(", ");

        } else {
          console.log("Qswefrgth");
          optionText = selected.join(", ");
        }

        //push new answer to results
        result.push({
          submission : answers[i].submission,
          text : optionText,
          correct : correct,
          quantity : 1 //How often option was selected
        });
      }

    };
  }
  //Text questions
  else if (question.questionType = "text-input") {
    for (var i = 0; i < answers.length; i++) {
      //Test if answer is new, if no increase quantity in results
      var isNewAnswer = true;
      for (var j = 0; j < result.length; j++) {
        if (arrayEqual(result[j].submission, answers[i].submission)) {
          isNewAnswer = false;
          result[j].quantity++;
        }
      };

      //If new answer push to results
      if (isNewAnswer) {
        var newAnswer = {
          submission : answers[i].submission,
          text : answers[i].submission.join(),
          correct : false,
          quantity : 1 //How often option was selected
        }
        if (answers[i].correctness == 100) {
          newAnswer.correct = true;
        }
        result.push(newAnswer)
      }
    };
  }
  //Else (missing or unknown question type) log error
  //else{
  //  console.log("Error in calculating disctinct options: question type is unknown or mission: ");
  //  console.log(question.questionType)
  //}

  return result;
}

//Compares two arrys. Ignores capitalisation.
function arrayEqual(array1, array2) {
  if (array1.length !== array2.length) {
    console.log("arrayEqual wrong length: " + array1.length + " " + array2.length)
    return false;
  } else {
    for (var i = 0; i < array1.length; i++) {
      if (array1[i].toString().toLowerCase() != array2[i].toString().toLowerCase()) {
        //console.log( typeof (array1[i]) + " - " + typeof (array2[i]))
        return false;
      }
    }
  }
  return true;
}

// exports.getSessionStats = function(req, res) {

//   Slideshow.findById(req.params.id, function(err, slideshow) {
//     if (err) {
//       console.log(err);
//     } else {

//       //Find all sessions for this slideshow
//       Session.find({
//         slides : req.params.id
//       }, function(err, allSessions) {

//         //Get dates of all sessions
//         var sessionArray = new Array();
//         for (var i = 0; i < allSessions.length; i++) {
//           console.log(allSessions[i])
//           var timeString = allSessions[i].startDate.getDate() + "." + allSessions[i].startDate.getMonth() + "." + allSessions[i].startDate.getFullYear() + " " + allSessions[i].startDate.getHours() + ":" + allSessions[i].startDate.getMinutes();

//           sessionArray.push({
//             time : timeString,
//             sessionId : allSessions[i]._id
//           });
//         }

//         //Find all Questions
//         var questions = new Array();
//         for (var i = 0; i < slideshow.questions.length; i++) {
//           Question.findById(slideshow.questions[i], function(err, question) {
//             if (question) {
//               questions.push({
//                 text : question.stemText,
//                 questionId : question._id,
//                 question : question
//               });
//             }
//             //Render it after last question added!
//             if (questions.length == slideshow.questions.length) {
//               var userId = req.user._id;
//               sessionFromUserName(req.user.username, function(err, session) {
//                 if (err)
//                   throw err;
                  
//                 console.log(session)
//                 if(session != false){
//                   var liveData = (session.slideshow._id == req.params.id);
//                 }

//                 res.render('statistics', {
//                   username : req.user.username,
//                   session : sessionArray,
//                   title : slideshow.title,
//                   questions : questions,
//                   host : req.app.locals.urlHost,
//                   port : req.app.locals.urlPort,
//                   id : session.id,
//                   liveData: liveData
//                 });

//               });
//             }
//           });
//         }

//         //If session is selected load data
//         if (req.query.session != null) {
//           //find questions for slideshow
//           Slideshow.findById(req.params.id, function(err, slideshow) {
//             //repeat for every question in slideshow
//             for (var quest = 0; quest < question.length; quest++) {
//               getStats(questionId, req.query.session, function(err, stats) {
//                 results.push(stats);
//               });
//             }
//           });
//         }

//       });
//     }
//   });

// }

/**
* Calculates the stats for a presentation(slideshow)
* @param {ObjectId | String| Slideshow} presentation The mongodb _id of the slideshow or the Mongoose object itself
* @returns {Object} 
*/

exports.getPresentationStats = coroutine (
  function *getPresentationStatsGen(presentation) {

  //in case we have objectid or string
  if(! (presentation instanceof Slideshow))
  {
    var pId = presentation;
    try{
      presentation = yield Slideshow.findById(pId).exec();
    }catch(err){
      logger.error("Presentation %s not found", pId);
      logger.error(err.message, { err: err.stack });
    }
  }

  //Find all Sessions
  var allSessions = Session.find({ slides : presentation._id}).exec();

  //Get dates of all sessions
  var sessions = new Array();
  for (var i = 0; i < allSessions.length; i++) {
    console.log(allSessions[i])
    var timeString = allSessions[i].startDate.getDate() + "." + allSessions[i].startDate.getMonth() + "." + allSessions[i].startDate.getFullYear() + " " + allSessions[i].startDate.getHours() + ":" + allSessions[i].startDate.getMinutes();

    sessions.push({
      time : timeString,
      sessionId : allSessions[i]._id
    });
  }

  var allQuestions = yield Question.find({ _id : { $in : presentation.questions }}).exec();
  var questions = []
  allQuestions.forEach(function(q){
    questions.push({
      text : q.stemText,
      questionId : q._id,
      question : q
    });
  });

  var liveSession = yield Session.findOne({ slides: presentation._id, endDate: null}).exec();

  return {
    sessions : sessions,
    title : presentation.title,
    questions : questions,
    liveId : (liveSession ? liveSession.id : null),
    liveData: (liveSession ? true : false)
  }
});

/** Given a userName, find it's current session **/
var sessionFromUserName = function(userName, callback) {
  callback(
    new Error('Deprecated: user does not have the current field anymore.'),
    null
  );
  return false;
  var User = db.model('User');
  //console.log('user');
  //console.log(userName);
  User.findOne({
    username : userName
  }, function(err, user) {
    if (err)
      callback(err);
    //console.log('user');
    //console.log(user);
    if (!user)
      callback(new Error('User does not exist'));
    else if (user.current) {
      var Session = db.model('Session');
      Session.findById(user.current, function(err, session) {
        if (err)
          callback(err);
        var Slideshow = db.model('Slideshow');
        Slideshow.findById(session.slides, function(err, slideshow) {
          if (err)
            callback(err);
          callback(null, {
            id : session._id,
            slideshow : slideshow
          });
        });
      });
    } else {//no session for user
      callback(null, false);
    }
  });
}

/**
* Calculates the stats for a session
* @param {ObjectId | String| Session} presentation The mongodb _id of the session or the Mongoose object itself
* @returns {Object} 
*/

var getSessionStats = exports.getSessionStats = coroutine (
  function *getSessionStatsGen(session) {

  //in case we have objectid or string
  if(! (session instanceof Session))
  {
    var sId = session;
    try{
      session = yield Session.findById(sId).populate('slides').exec();
    }catch(err){
      logger.error("Session %s not found", sId);
      logger.error(err.message, { err: err.stack });
    }
  }

  if(! (session.slides instanceof Slideshow)){
     try{
     yield session.populate('slides').execPopulate();
    }catch(err){
      logger.error("Error populating slides for session &s", session._id);
      logger.error(err.message, { err: err.stack });
    }
  }

  var allQuestions = yield Question.find({ _id : { $in : session.slides.questions}}).exec();
  var questions = []
  allQuestions.forEach(function(q){
    questions.push({
      text : q.stemText,
      questionId : q._id,
      question : q
    });
  });

  var users = yield WhitelistEntry.find({
    session : session._id,
    role: 'viewer'
  }).exec();

  var userData = users.map(function(user){
    var userQuestions = allQuestions.map(function(q){
      return {
        'id': q._id.toString(),
        'answered': 'pending',
      }
    })


    var ms = moment().diff(user.joinDate);
    var totalTime = moment.utc(ms).format("mm:ss");
    var completed = false;
    if( user.sessionData && user.sessionData.answeredAllDate) {
      completed = true;
    }
    return{
      'user': {
        'id': user._id.toString(),
        'screenName': user.screenName.toString(),
        'joinDate': user.joinDate,
        'rawTotalTime': ms ,
        'totalTime': totalTime ,
        'score': 0,
        'completed': completed//(user.sessionData.answeredAllDate ? true: false)
      },
      'userQuestions': userQuestions
    }
  });


  var assessments = yield Assessment.find({
      session: session._id,
    }).exec();   

  assessments.forEach(function(assessment){
    var userEntry;
    for(var i = 0, l = userData.length; i<l; i++){
      if(userData[i].user.id === assessment.assessee.toString()){
        userEntry = userData[i];
        break;
      }
    }
   
    if(! userEntry) return;
    var userQuestions = userEntry.userQuestions;
    for(var i = 0, l = userQuestions.length; i<l; i++){
      if(userQuestions[i].id === assessment.question.toString()){
        if(assessment.score === 100){
          userQuestions[i].answered = 'correct';
          userEntry.user.score ++;
        }else{
          userQuestions[i].answered = 'wrong';
        }
        break;
      }
    }
  });

  //rankings is sorted
  var rankings = getSessionRankings(userData)
  rankings.forEach(function(ranking, idx){
    for(var i=0, l=userData.length; i<l; i++){
      if(userData[i].user.id == ranking.userId){
        userData[i].user.rank = idx+1;
      }
    }
  });


  return {
    users: userData,
    questions : questions,
    rankings: rankings
  }
});

exports.getUserSessionStats = coroutine (
  function *getUserSessionStatsGen(userId, sessionId) {

  var session;
  try{
    session = yield Session.findById(sessionId).populate('slides').exec();
  }catch(err){
    logger.error("Session %s not found", sessionId);
    logger.error(err.message, { err: err.stack });
  }

  var allQuestions = yield Question.find({ _id : { $in : session.slides.questions}}).exec();
  var questions = []
  allQuestions.forEach(function(q){
    questions.push({
      text : q.stemText,
      questionId : q._id,
      question : q
    });
  });

  var user = yield WhitelistEntry.findOne({
    _id : userId,
    session : sessionId,
    role: 'viewer'
  }).exec();

  if(! user){ throw new Error('Could not find WhitelistEntry for user ' + userId)}

  var userQuestions = allQuestions.map(function(q){
    return {
      id: q._id.toString(),
      answered: 'pending',
    }
  });
  
  var ms = moment().diff(user.joinDate);
  var totalTime = moment.utc(ms).format("mm:ss");
  var userData = {
     'user' : {
        'id': user._id.toString(),
        'screenName': user.screenName.toString(),
        'joinDate': user.joinDate,
        'rawTotalTime': ms,
        'totalTime': totalTime ,
        'score' : 0
      },
      'userQuestions' : userQuestions
  }

  var assessments = yield Assessment.find({
      session: session._id,
      assessee: userId
    }).exec();
   

  assessments.forEach(function(assessment){
    for(var i = 0, l = userQuestions.length; i<l; i++){
      if(userQuestions[i].id === assessment.question.toString()){
        console.log(assessment.question)
         if(assessment.score === 100){
          userQuestions[i].answered = 'correct';
          userData.user.score ++;
        }else{
          userQuestions[i].answered = 'wrong';
        }
        break;
      }
    }

  });

  return userData;
});

/**
* Calculates the rankings for the viewers
* @param {ObjectId | String| Session} presentation The mongodb _id of the session or the Mongoose object itself
* @returns {Object} 
*/

var getSessionRankings =  function (userData) {
  try{
    var scores = userData.map(function(stat){
      return {
        userId: stat.user.id,
        score: stat.user.score
      }
    })

    scores.sort(function(a,b){
      if(a.score > b.score){
        return -1
      }
      if(a.score < b.score){
        return 1
      }
      return 0;
    })
    return scores;
  }catch(err){
    logger.error(err.message, { err: err.stack });
  }
 
};

/** Given a userName, find it's current session **/
var sessionFromUserName = function(userName, callback) {
  callback(
    new Error('Deprecated: user does not have the current field anymore.'),
    null
  );
  return false;
  var User = db.model('User');
  //console.log('user');
  //console.log(userName);
  User.findOne({
    username : userName
  }, function(err, user) {
    if (err)
      callback(err);
    //console.log('user');
    //console.log(user);
    if (!user)
      callback(new Error('User does not exist'));
    else if (user.current) {
      var Session = db.model('Session');
      Session.findById(user.current, function(err, session) {
        if (err)
          callback(err);
        var Slideshow = db.model('Slideshow');
        Slideshow.findById(session.slides, function(err, slideshow) {
          if (err)
            callback(err);
          callback(null, {
            id : session._id,
            slideshow : slideshow
          });
        });
      });
    } else {//no session for user
      callback(null, false);
    }
  });
}