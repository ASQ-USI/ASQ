var ObjectId = require('mongoose').Types.ObjectId
  , ids = Object.create(null)
  , fixtures = {}
  , users, whitelist, i;

module.exports = function(viewers){
  //basic scenario
  ids.basic = {
    session : new ObjectId(),
    whitelist : new ObjectId(),
    ex : new ObjectId(),
    questions : [
      new ObjectId('537e06283ee07f38c41fc554'),
      new ObjectId('537e06283ee07f38c41fc555'),
      new ObjectId('537e06283ee07f38c41fc556'),
      new ObjectId('537e06283ee07f38c41fc557'),
      new ObjectId('537e06283ee07f38c41fc558'),
    ],
    answers : [
      new ObjectId('537e06283ee07f38c41fc554'),
      new ObjectId('537e06283ee07f38c41fc555'),
      new ObjectId('537e06283ee07f38c41fc556'),
    ],
  }

  /* ------------------ User ------------------ */
  var presenterId = new ObjectId()
  users = fixtures.User = [];
  whitelist = fixtures.WhitelistEntry = [];

  //create viewers and corresponding whitelist entries
  for (var i=0; i<viewers; i++){
    users.push({
      _id        : new ObjectId(),
      firstname  : 'first-' + i,
      lastname   : 'lastname-' + i,
      username   : 'username-' + i,
      screenName : 'screenName-' + i,
      password   : 'password-' + i,
      email      : 'email-' + i +'@tade.org'
    })

    whitelist.push({
      _id         : new ObjectId(),
      session     : ids.basic.session,
      user        : users[i]._id,
      token       : 'token-'+i,
      screenName  : users[i].screenName,
      role        : 'viewer'
    });
  }

  //presenter user
  users.push({
    _id        : presenterId,
    firstname  : 'Jackie',
    lastname   : 'Cane',
    username   : 'sugar',
    screenName : 'Sugar',
    password   : 'jackie-password',
    email      : 'jackie@cane.org'
  });

  /* ------------------ Slides ------------------ */
  var sid = new ObjectId();
  fixtures.Slideshow = [
    {
      _id               : sid,
      title             : 'The new batmobile',
      originalFile      : 'bat.html',
      presenterFile     : 'bat-presenter.html',
      viewerFile        : 'bat-viewer.html',
      owner             : presenterId,
      questions         : [],
      questionsPerSlide : [],
      statsPerSlide     : [],
    }
  ];

  /* ------------------ Sessions ------------------ */
  fixtures.Session = [];
  fixtures.Session.push({
    _id       : ids.basic.session,
    presenter : presenterId,
    slides    : sid
  });

  /* ------------------ Question and Rubrics ------------------ */
  fixtures.Question = [];
  fixtures.Rubric = [];
  ids.basic.questions.forEach(function(q, index) {
    fixtures.Question.push({
      _id: q,
      correctAnswer : 'submission-' + index + '-0'
    });
    fixtures.Rubric.push({
      question: q,
      maxScore : 100
    });
  });

  /* ------------------ Exercise ------------------ */
  fixtures.Exercise = [];
  fixtures.Exercise.push({
    _id        : ids.basic.ex,
    questions  : ids.basic.questions,
    assessmentTypes : ['peer']
  });

  // Empty Collections (will just be emptied)
  fixtures.Answer = [];
  fixtures.Assessment = [];
  fixtures.AssessmentJob = [];

  return{
    fixtures: fixtures,
    questions : fixtures.Question,
    session : fixtures.Session[0],
    exercise : fixtures.Exercise[0],
    viewers : users.splice(0, (viewers -1)),
    whitelist : whitelist
  }
}
