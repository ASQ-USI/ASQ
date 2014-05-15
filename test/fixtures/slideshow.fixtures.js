//models and schemas
var SlideshowModel = require('../../models/slideshow')

// ids
var ObjectId = require('mongoose').Types.ObjectId
var ids = exports.ids ={
  //session ids
  session1Id: ObjectId(),

  //slideshow ids
  slideshowNormalId: ObjectId(),
  slideshowLiveId: ObjectId(),

  //owner ids
  owner1Id    : ObjectId(),
  nonExistantOwnerId : ObjectId(),

  //question ids
  question1Id : ObjectId(),
  question2Id : ObjectId(),
  question3Id : ObjectId(),
  question4Id : ObjectId(),
  questionInvalid1Id : ObjectId(),
  questionInvalid2Id : ObjectId(),
}

//model instances
var qPerSlide1 = {
  slideHtmlId : 'slide03',
  questions   : [ids.question1Id]
};
var qPerSlide2 = {
  slideHtmlId : 'slide05',
  questions   : [ids.question2Id]
};
var qPerSlide3 = {
  slideHtmlId : 'slide07',
  questions   : [ids.question3Id]
};

var qPerSlideInvalid1 = {
  slideHtmlId : 'slide03',
  questions   : [ids.questionInvalid1Id]
};
var qPerSlideInvalid2 = {
  slideHtmlId : 'slide05',
  questions   : [ids.questionInvalid2Id]
};

var sPerSlide1 = {
  slideHtmlId   : 'slide04',
  statQuestions : [ids.question1Id]
};
var sPerSlide2 = {
  slideHtmlId   : 'slide06',
  statQuestions : [ids.question2Id]
};
var sPerSlide3 = {
  slideHtmlId   : 'slide08',
  statQuestions : [ids.question3Id]
};

exports.slideshowWithInvalidOwner = {
  title: 'test presentation that has invalid owner',
  course: 'General',
  originalFile: "index.html",
  presenterFile: "index.asq-presenter.html",
  viewerFile: "index.asq-viewer.html",
  owner: ids.nonExistantOwnerId,
  questions: [ids.question1Id , ids.question2Id, ids.question3Id],
  questionsPerSlide: [qPerSlide1, qPerSlide2, qPerSlide3],
  statsPerSlide: [sPerSlide1, sPerSlide2, sPerSlide3]
};

exports.slideshowWithInvalidQuestions = {
  title: 'test presentation that has invalid questions',
  course: 'General',
  originalFile: "index.html",
  presenterFile: "index.asq-presenter.html",
  viewerFile: "index.asq-viewer.html",
  owner: ids.owner1Id,
  questions: [ids.questionInvalid1Id , ids.questionInvalid2Id],
  questionsPerSlide: [qPerSlideInvalid1, qPerSlideInvalid2]
};

exports.slideshowWithQPerSlidesButNoQ = {
  title: 'test presentation that has questionsPerSlide but no questions',
  course: 'General',
  originalFile: "index.html",
  presenterFile: "index.asq-presenter.html",
  viewerFile: "index.asq-viewer.html",
  owner: ids.owner1Id,
  questionsPerSlide: [qPerSlide1, qPerSlide2, qPerSlide3]
};

exports.slideshowWithQButNoQPerSlides = {
  title: 'test presentation that has questionsPerSlide but no questions',
  course: 'General',
  originalFile: "index.html",
  presenterFile: "index.asq-presenter.html",
  viewerFile: "index.asq-viewer.html",
  owner: ids.owner1Id,
  questions: [ids.question1Id],
};

exports.slideshowWithNoQNoQPerSlides = {
  title: 'test presentation that has no questions and no questionsPerSlide',
  course: 'General',
  originalFile: "index.html",
  presenterFile: "index.asq-presenter.html",
  viewerFile: "index.asq-viewer.html",
  owner: ids.owner1Id
};

exports.slideshowWithMoreQThanQPerSlides = {
  title: 'test presentation that has more questions than questionsPerSlide',
  course: 'General',
  originalFile: "index.html",
  presenterFile: "index.asq-presenter.html",
  viewerFile: "index.asq-viewer.html",
  owner: ids.owner1Id,
  questions: [ids.question1Id , ids.question3Id],
  questionsPerSlide: [qPerSlide1]
};

exports.slideshowWithMoreQPerSlidesThanQ = {
  title: 'test presentation that has more questionsPerSlide than questions',
  course: 'General',
  originalFile: "index.html",
  presenterFile: "index.asq-presenter.html",
  viewerFile: "index.asq-viewer.html",
  owner: ids.owner1Id,
  questions: [ids.question1Id , ids.question2Id],
  questionsPerSlide: [qPerSlide1, qPerSlide2, qPerSlide3]
};

exports.slideshowWithNoQNoSPerSlides = {
  title: 'test presentation that has more questions than questionsPerSlide',
  course: 'General',
  originalFile: "index.html",
  presenterFile: "index.asq-presenter.html",
  viewerFile: "index.asq-viewer.html",
  owner: ids.owner1Id
};

exports.slideshowWithSPerSlidesButNoQ = {
  title: 'test presentation that has more questions than questionsPerSlide',
  course: 'General',
  originalFile: "index.html",
  presenterFile: "index.asq-presenter.html",
  viewerFile: "index.asq-viewer.html",
  owner: ids.owner1Id,
  statsPerSlide: [sPerSlide1, sPerSlide2, sPerSlide3]
};

exports.fixtures = {};

//models.User
exports.fixtures.User = {
  owner1: {
    _id: ids.owner1Id,
    firstname: 'Test',
    lastname: 'User',
    username: 'testuser',
    screenName: 'Test User',
    password: 'abcedfghiklmnopqrstuvwxyz',
    email: 'user@test.com',
    slides: [ids.slideshowNormalId, ids.slideshowLiveId],
    current: ids.slideshowLiveId
  }
}

//models.Question
exports.fixtures.Question = [
  {
  _id: ids.question1Id,
  stem: "<h3 class=\"stem\">Lugano is located in...</h3>",
  stemText: "Lugano is located in...",
  questionType: "multi-choice",
  formButtonType: "radio",
  questionOptions: [
    {
      "correct": true,
      "classList": "option",
      "text": "\n              Switzerland\n            "
    },
    {
      "correct": false,
      "classList": "option",
      "text": "\n              Italy\n            "
    },
    {
      "correct": false,
      "classList": "option",
      "text": "\n              France\n            "
    },
    {
      "correct": false,
      "classList": "option",
      "text": "\n              Germany\n            "
    }
  ]
},
{
  _id: ids.question2Id,
  stem: "<h3 class=\"stem\">Which are the official languages of Switzerland?</h3>",
  stemText: "Which are the official languages of Switzerland?",
  questionType: "multi-choice",
  formButtonType: "checkbox",
  questionOptions: [
    {
      "correct": true,
      "classList": "option",
      "text": "\n              German\n            "
    },
    {
      "correct": true,
      "classList": "option",
      "text": "\n              French\n            "
    },
    {
      "correct": true,
      "classList": "option",
      "text": "\n              Italian\n            "
    },
    {
      "correct": false,
      "classList": "option",
      "text": "\n              English\n            "
    },
    {
      "correct": true,
      "classList": "option",
      "text": "\n              Rumantsch\n            "
    }
  ]
}
,{
  _id: ids.question3Id,
  stem: "<h3 class=\"stem\"><img width=\"200\" alt=\"target1\" src=\"img/rect.png\"></h3>",
  stemText: "<img width=\"200\" alt=\"target1\" src=\"img/rect.png\">",
  questionType: "multi-choice",
  formButtonType: "checkbox",
  questionOptions: [
    {
      "correct": true,
      "classList": "option",
      "text": "\n              This figure is a square.\n            "
    },
    {
      "correct": false,
      "classList": "option",
      "text": "\n              This figure is a circle.\n            "
    },
    {
      "correct": true,
      "classList": "option",
      "text": "\n              This figure is symetric.\n            "
    },
    {
      "correct": true,
      "classList": "option",
      "text": "\n              This figure has four corners.\n            "
    }
  ]
}
];

//models.Slideshow
exports.fixtures.Slideshow = {

  slideshowNormal: {
    _id: ids.slideshowNormalId,
    title: 'test presentation',
    course: 'General',
    originalFile: "index.html",
    presenterFile: "index.asq-presenter.html",
    viewerFile: "index.asq-viewer.html",
    owner: ids.owner1Id,
    questions: [ids.question1Id , ids.question2Id, ids.question3Id],
    questionsPerSlide: [qPerSlide1, qPerSlide2, qPerSlide3],
    statsPerSlide: [sPerSlide1, sPerSlide2, sPerSlide3],
  },

  slideshowLive: {
    _id: ids.slideshowLiveId,
    title: 'test presentation that is going to be live',
    course: 'General',
    originalFile: "index.html",
    presenterFile: "index.asq-presenter.html",
    viewerFile: "index.asq-viewer.html",
    owner: ids.owner1Id,
    questions: [ids.question1Id , ids.question2Id, ids.question3Id],
    questionsPerSlide: [qPerSlide1, qPerSlide2, qPerSlide3],
    statsPerSlide: [sPerSlide1, sPerSlide2, sPerSlide3],
  }
};

//models.Session
exports.fixtures.Session = [
{
  _id: ids.session1Id,
  activeQuestions: [],
  activeSlide: "slide01",
  activeStatsQuestions: [],
  answers: [],
  authLevel: "public",
  endDate: Date.now(),
  presenter: ids.owner1Id,
  slides: ids.slideshowNormalId,
  started: false,
  viewers: []
},
{
  activeQuestions: [],
  activeSlide: "slide02",
  activeStatsQuestions: [],
  answers: [],
  authLevel: "public",
  endDate: null,
  presenter: ids.owner1Id,
  slides: ids.slideshowLiveId,
  started: false,
  viewers: []
}
]