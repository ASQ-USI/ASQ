//models and schemas
var SlideshowModel = require('../../models/slideshow')
  , QuestionsPerSlide = db.model("QuestionsPerSlide", SlideshowModel.questionsPerSlideSchema)
  , StatsPerSlide = db.model("StatsPerSlide", SlideshowModel.statsPerSlideSchema);

// ids
var ObjectId = require('mongoose').Types.ObjectId
var ids = exports.ids ={

  validSlideshow: ObjectId(),

  validSession: ObjectId(),
  invalidSession: ObjectId(),

  validUser0: ObjectId(),
  validUser1: ObjectId(),
  validUser2: ObjectId(),
  validGuest1: ObjectId(),
  validGuest2: ObjectId(),
  invalidUser: ObjectId(),
};

var tokens = {
  validUser0  : 'EBOLB7tXkdxDhkZvEq9fLNaJ',
  validUser1  : 'LXdUVGHL8ZZ6Yl3HhTx3VpNS',
  validUser2  : 'RbWZX5sjtfNpBpYFw2ZwnU04',
  validUser3  : 'eQz-GdoFv7IVY8H_PA2KHd88',
  validGuest1 : 'zJO4FXB4hwzlp5wsdM0TTXaF',
  validGuest2 : 'cdOhuMCHltV3WYxScL0wl2aA',
  validGuest3 : 'zdSAKdqtzr_-Fl9rdfShC1Mv',
  invalid     : 'WXMkZLG682CHniceQd1l92so',
};

var handshakes = {
  validPresenter : {
    "query"   : { "sid"    : ids.validSession },
    "headers" : { "cookie" : tokens.validUser0 }
  },
  validViewer : {
    "query"   : { "sid"    : ids.validSession },
    "headers" : { "cookie" : tokens.validUser3 }
  },
  invalidSession : {
    "query"   : { "sid"    : ids.invalidSession },
    "headers" : { "cookie" : tokens.validUser1 }
  },
  invalidToken : {
    "query"   : { "sid"    : ids.validSession },
    "headers" : { "cookie" : tokens.invalid }
  },
  invalidSessionAndToken : {
    "query"   : { "sid"    : ids.invalidSession },
    "headers" : { "cookie" : tokens.invalid }
  },
  missingQuery : {
    "headers" : { "cookie" : tokens.validUser1 }
  },
  missingSessionId : {
    "query"   : {},
    "headers" : { "cookie" : tokens.validUser1 }
  },
  missingHeaders : {
    "query"   : { "sid"    : ids.invalidSession }
  },
  missingToken : {
    "query"   : { "sid"    : ids.invalidSession },
    "headers" : {}
  },
  empty : {}
};

var fixtures = {};

fixtures.GuestUser = [
  {
    _id : ids.validGuest1,
    token : tokens.validGuest3,
    screenName : 'Guest 1 screen'
  }, {
    _id : ids.validGuest2,
    token : tokens.validGuest2,
    screenName : 'Guest 2 screen'
  }
];

fixtures.User = [
  {
    _id: ids.validUser0,
    firstname: 'Owner',
    lastname: 'User',
    username: 'owneruser',
    screenName: 'Owner User',
    password: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    email: 'user@owner.com',
  },
  {
    _id: ids.validUser1,
    firstname: 'Test',
    lastname: 'User',
    username: 'testuser',
    screenName: 'Test User',
    password: 'abcedfghiklmnopqrstuvwxyz',
    email: 'user@test.com',
  },
  {
    _id: ids.validUser2,
    firstname: 'New',
    lastname: 'User',
    username: 'newuser',
    screenName: 'New User',
    password: 'new password',
    email: 'user@new.com',
  },
];

fixtures.Slideshow = [
  {
    _id: ids.validSlideshow,
    title: 'test presentation',
    course: 'General',
    originalFile: "index.html",
    presenterFile: "index.asq-presenter.html",
    viewerFile: "index.asq-viewer.html",
    owner: ids.validUser0,
    questions: [],
    questionsPerSlide: [],
    statsPerSlide: [],
  }
];

//models.Session
fixtures.Session = [
  {
    _id: ids.validSession,
    presenter: fixtures.User[0]._id,
    slides: fixtures.Slideshow[0]._id,
    authLevel: 'public',
    activeSlide: '0',
    startDate: new Date(1394895518459),
    endDate: null,
    viewers: [],

    answers: [],
    showingQuestion: false,
    showingAnswer: false,
    started: true,
    questionsDisplayed: [],
    activeQuestions: [],
    activeStatsQuestions : []
  }
];

fixtures.WhitelistEntry = [
  {
    session     : ids.validSession,
    uid         : fixtures.User[0]._id,
    token       : tokens.validUser0,
    screenName  : fixtures.User[0].screenName,
    role        : 'presenter'
  },
  {
    session     : ids.validSession,
    uid         : fixtures.User[1]._id,
    screenName  : fixtures.User[1].screenName,
    role        : 'viewer'
  },
  {
    session     : ids.validSession,
    uid         : fixtures.User[1]._id,
    screenName  : fixtures.User[1].screenName,
    role        : 'viewer',
    token       : tokens.validUser3
  },
  {
    session     : ids.validSession,
    uid         : fixtures.GuestUser[0]._id,
    token       : fixtures.GuestUser[0].token,
    screenName  : fixtures.GuestUser[0].screenName,
    role        : 'viewer'
  }
];

var reqs = {
  missingHeaders : { "liveSession" : fixtures.Session[0] },
  missingToken : {
    "headers" : {},
    "liveSession" : fixtures.Session[0],
  },
  registeredNotWhite : {
    "headers" : { "cookie" : tokens.validUser2 },
    "user" : fixtures.User[2],
    "liveSession" : fixtures.Session[0],
    "session" : {
      "touch" : function touch() {}
    },
    "isAuthenticated" : function isAuthenticated() { return true; }
  },
  registeredWhite : {
    "headers" : { "cookie" : tokens.validUser3 },
    "user" : fixtures.User[2],
    "liveSession" : fixtures.Session[0],
    "session" : {
      "touch" : function touch() {}
    },
    "isAuthenticated" : function isAuthenticated() { return true; }
  },
  newGuest : {
    "headers" : { "cookie" : tokens.validGuest1 },
    "liveSession" : fixtures.Session[0],
    "session" : {
      "touch" : function touch() {}
    },
    "isAuthenticated" : function isAuthenticated() { return false; }
  },
  guestNotWhite : {
    "headers" : { "cookie" : tokens.validGuest2 },
    "liveSession" : fixtures.Session[0],
    "session" : {
      "touch" : function touch() {}
    },
    "isAuthenticated" : function isAuthenticated() { return false; }
  },
  guestWhite : {
    "headers" : { "cookie" : tokens.validGuest3 },
    "liveSession" : fixtures.Session[0],
    "session" : {
      "touch" : function touch() {}
    },
    "isAuthenticated" : function isAuthenticated() { return false; }
  }
}

module.exports = {
  ids : ids,
  fixtures : fixtures,
  handshakes : handshakes,
  tokens : tokens,
  reqs : reqs
};