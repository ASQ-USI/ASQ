var ObjectId = require('mongoose').Types.ObjectId;
var ids = {
  missmatch : {
    session : new ObjectId(),
    ex : new ObjectId(),
    questions : [
      new ObjectId('537e06283ee07f38c41fc550'),
      new ObjectId('537e06283ee07f38c41fc551'),
      new ObjectId('537e06283ee07f38c41fc552'),
    ],
    answers : [
      // new ObjectId('537e06283ee07f38c41fc550'),
      // new ObjectId('537e06283ee07f38c41fc553'),
    ],
    submitted : [
      new ObjectId('537e06283ee07f38c41fc550'),
      new ObjectId('537e06283ee07f38c41fc553'),
    ]
  },
  resubmit : {
    session : new ObjectId(),
    ex : new ObjectId(),
    questions : [
      new ObjectId('537e06283ee07f38c41fc554'),
      new ObjectId('537e06283ee07f38c41fc555'),
      new ObjectId('537e06283ee07f38c41fc556'),
    ],
    answers : [
      new ObjectId('537e06283ee07f38c41fc554'),
      new ObjectId('537e06283ee07f38c41fc555'),
      new ObjectId('537e06283ee07f38c41fc556'),
    ],
  },
  plain : {
    session : new ObjectId(),
    ex : new ObjectId(),
    questions : [
      new ObjectId('537e06283ee07f38c41fc557'),
      new ObjectId('537e06283ee07f38c41fc558'),
      new ObjectId('537e06283ee07f38c41fc559'),
    ],
    answers : [
      // new ObjectId('537e06283ee07f38c41fc557'),
      // new ObjectId('537e06283ee07f38c41fc558'),
      // new ObjectId('537e06283ee07f38c41fc559'),
    ],
  },
  self : {
    session : new ObjectId(),
    ex : new ObjectId(),
    questions : [
      new ObjectId('537e06283ee07f38c41fc560'),
      new ObjectId('537e06283ee07f38c41fc561'),
      new ObjectId('537e06283ee07f38c41fc562'),
    ],
    answers : [
      // new ObjectId('537e06283ee07f38c41fc560'),
      // new ObjectId('537e06283ee07f38c41fc561'),
      // new ObjectId('537e06283ee07f38c41fc562'),
    ],
  },
  peer : {
    session : new ObjectId(),
    ex : new ObjectId(),
    questions : [
      new ObjectId('537e06283ee07f38c41fc563'),
      new ObjectId('537e06283ee07f38c41fc564'),
      new ObjectId('537e06283ee07f38c41fc565'),
    ],
    answers : [
      // new ObjectId('537e06283ee07f38c41fc563'),
      // new ObjectId('537e06283ee07f38c41fc564'),
      // new ObjectId('537e06283ee07f38c41fc565'),
    ],
  }
}

var token = 'bat-token';

var i, hasOwn = Object.prototype.hasOwnProperty;
var fixtures = {};

// User
var uid = new ObjectId();
fixtures.User = [
  {
    _id        : uid,
    firstname  : 'Bruce',
    lastname   : 'Wayne',
    username   : 'batman',
    screenName : 'Batman',
    password   : 'bat-password',
    email      : 'batman@bat-mail.com'
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
  if(hasOwn.call(ids, i)) {
    var session = {
      _id       : ids[i].session,
      presenter : uid,
      slides    : sid
    }
    fixtures.Session.push(session);
    sessions[i] = session;
  }
}

// Questions
fixtures.Question = [];
for (i in ids) {
  if(hasOwn.call(ids, i)) {
    ids[i].questions.forEach(function(q) {
      fixtures.Question.push({
        _id: q,
        assessment : (i === 'self' || i === 'peer') ? [i] : []
      });
    });
  }
}

// Answer,
fixtures.Answer = [];
for (i in ids) {
  if(hasOwn.call(ids, i)) {
    ids[i].answers.forEach(function(q, j) {
      fixtures.Answer.push({
        question : q,
        session: ids[i].session,
        submission : [i + '-' + j],
        correctness : 90,
        confidence : 3,
        answeree : token,
        exercise : ids[i].ex
      });
    });
  }
}

// Exercise
fixtures.Exercise = [];
for (i in ids) {
  if(hasOwn.call(ids, i)) {
    fixtures.Exercise.push({
      _id        : ids[i].ex,
      questions  : ids[i].questions,
      assessment : (i === 'self' || i === 'peer') ? [i,] : []
    });
  }
}

var submissions =  {}
for (i in ids) {
  if(hasOwn.call(ids, i)) {
    submissions[i] = {
      id : ids[i].ex,
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
}
//console.log(require('util').inspect(events, { showHidden: false, depth: null, colors: true }));

module.exports = {
  ids         : ids,
  token       : token,
  sessions    : sessions,
  fixtures    : fixtures,
  submissions : submissions
};