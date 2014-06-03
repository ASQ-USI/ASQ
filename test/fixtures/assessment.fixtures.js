var ObjectId = require('mongoose').Types.ObjectId
  , ids = Object.create(null)
  , token = 'bat-token'
  , fixtures = {}
  , i;

//basic scenario threes submissions for one question from three users
ids.basic = {
  session : new ObjectId(),
  whitelist : new ObjectId(),
  ex : new ObjectId(),
  questions : [
    new ObjectId('537e06283ee07f38c41fc554'),
  ],
  answers : [
    new ObjectId('537e06283ee07f38c41fc554'),
    new ObjectId('537e06283ee07f38c41fc555'),
    new ObjectId('537e06283ee07f38c41fc556'),
  ],
}


// User
var batmanUid = new ObjectId();
var robinUid = new ObjectId();
var jokerUid = new ObjectId();
var users = fixtures.User = [
  {
    _id        : batmanUid,
    firstname  : 'Bruce',
    lastname   : 'Wayne',
    username   : 'batman',
    screenName : 'Batman',
    password   : 'bat-password',
    email      : 'batman@bat-mail.com'
  },
  {
    _id        : robinUid,
    firstname  : 'Dick',
    lastname   : 'Grayson',
    username   : 'robin',
    screenName : 'Robin',
    password   : 'robin-password',
    email      : 'robin@bat-mail.com'
  },
  {
    _id        : jokerUid,
    firstname  : 'Jack',
    lastname   : 'Napier',
    username   : 'joker',
    screenName : 'Joker',
    password   : 'joker-password',
    email      : 'joker@bat-mail.com'
  }
];
// Slides
var sid = new ObjectId();
fixtures.Slideshow = [
  {
    _id               : sid,
    title             : 'The new batmobile',
    originalFile      : 'bat.html',
    presenterFile     : 'bat-presenter.html',
    viewerFile        : 'bat-viewer.html',
    owner             : uid,
    questions         : [],
    questionsPerSlide : [],
    statsPerSlide     : [],
  }
];

// Sessions
fixtures.Session = [];
var sessions = {};
for (i in ids) {
  var session = {
    _id       : ids[i].session,
    presenter : uid,
    slides    : sid
  }
  fixtures.Session.push(session);
  sessions[i] = session;
}

fixtures.WhitelistEntry = []
var whitelist = {};
for (i in ids) {
  //for all users
  users.forEach(function(user){
    var wle = {
      _id         : ids[i].whitelist,
      session     : ids[i].session,
      user         : user._id,
      token       : token,
      screenName  : 'bat-screenName',
      role        : 'viewer'
    };
    fixtures.WhitelistEntry.push(wle);
    whitelist[i] = wle;
  });  
}

// Questions
fixtures.Question = [];
for (i in ids) {
  ids[i].questions.forEach(function(q) {
    fixtures.Question.push({
      _id: q,
      assessment : (i === 'self' || i === 'peer') ? [i] : [],
      correctAnswer : 'submission-' + i + '-0'
    });
  });
}

// Answer,
fixtures.Answer = [];
for (i in ids) {
  ids[i].answers.forEach(function(q, j) {
    fixtures.Answer.push({
      question : q,
      session: ids[i].session,
      submission : [i + '-' + j],
      correctness : 90,
      confidence : 3,
      answeree : ids[i].whitelist,
      exercise : ids[i].ex
    });
  });
}

// Exercise
fixtures.Exercise = [];
for (i in ids) {
    fixtures.Exercise.push({
      _id        : ids[i].ex,
      questions  : ids[i].questions,
      assessment : (i === 'self' || i === 'peer') ? [i,] : []
    });
}

var submissions =  {}
for (i in ids) {
  submissions[i] = {
    _id : ids[i].ex,
    id : ids[i].ex.toString(),
    answers : (hasOwn.call(ids[i], 'submitted')
      ? ids[i].submitted
      : ids[i].questions).map(function(q, j) {
        return {
          question : q,
          submission : [ 'submission-' + i + '-' + j],
          correctness: 100,
          confidence: 4,
          logData : []
        };
    })
  };
}
//console.log(require('util').inspect(events, { showHidden: false, depth: null, colors: true }));

module.exports = {
  ids         : ids,
  token       : token,
  sessions    : sessions,
  fixtures    : fixtures,
  submissions : submissions,
  whitelist   : whitelist
};