//models and schemas
var SlideshowModel = require('../../models/slideshow')
  , QuestionsPerSlide = db.model("QuestionsPerSlide", SlideshowModel.questionsPerSlideSchema)
  , StatsPerSlide = db.model("StatsPerSlide", SlideshowModel.statsPerSlideSchema);

// ids
var ObjectId = require('mongoose').Types.ObjectId
var ids = exports.ids ={
  session1Id: ObjectId(),

  //slideshow ids
  slideshowNormalId: ObjectId(),
  slideshowWithInvalidOwnerId: ObjectId(), 
  slideshowWithInvalidQuestionsId: ObjectId(), 
  slideshowLiveId: ObjectId(),

  slideshowWithQPerSlidesButNoQId: ObjectId(),
  slideshowWithQButNoQPerSlidesId: ObjectId(),
  slideshowWithNoQNoQPerSlidesId: ObjectId(),
  slideshowWithMoreQThanQPerSlidesId: ObjectId(),
  slideshowWithMoreQPerSlidesThanQId: ObjectId(),

  slideshowWithNoQNoSPerSlidesId: ObjectId(),
  slideshowWithSPerSlidesButNoQId: ObjectId(),

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
var qPerSlide1 = new QuestionsPerSlide({
  slideHtmlId: 'slide03',
  questions: [ids.question1Id]
});
var qPerSlide2 = new QuestionsPerSlide({
  slideHtmlId: 'slide05',
  questions: [ids.question2Id]
});
var qPerSlide3 = new QuestionsPerSlide({
  slideHtmlId: 'slide07',
  questions: [ids.question3Id]
});

var qPerSlideInvalid1 = new QuestionsPerSlide({
  slideHtmlId: 'slide03',
  questions: [ids.questionInvalid1Id]
});
var qPerSlideInvalid2 = new QuestionsPerSlide({
  slideHtmlId: 'slide05',
  questions: [ids.questionInvalid2Id]
});

var sPerSlide1 = new QuestionsPerSlide({
  slideHtmlId: 'slide04',
  statQuestions: [ids.question1Id]
});
var sPerSlide2 = new QuestionsPerSlide({
  slideHtmlId: 'slide06',
  statQuestions: [ids.question2Id]
});
var sPerSlide3 = new QuestionsPerSlide({
  slideHtmlId: 'slide08',
  statQuestions: [ids.question3Id]
});

exports.slideshowWithInvalidOwner = {
  _id: ids.slideshowWithInvalidOwnerId,
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
  _id: ids.slideshowWithInvalidQuestionsId,
  title: 'test presentation that has invalid questions',
  course: 'General',
  originalFile: "index.html",
  presenterFile: "index.asq-presenter.html",
  viewerFile: "index.asq-viewer.html",
  owner: ids.owner1Id,
  questions: [ids.questionInvalid1Id , ids.questionInvalid2Id],
  questionsPerSlide: [qPerSlideInvalid1, qPerSlideInvalid2],
  statsPerSlide: [sPerSlide1, sPerSlide2]
};

exports.slideshowWithQPerSlidesButNoQ = {
  _id: ids.slideshowWithQPerSlidesButNoQId,
  title: 'test presentation that has questionsPerSlide but no questions',
  course: 'General',
  originalFile: "index.html",
  presenterFile: "index.asq-presenter.html",
  viewerFile: "index.asq-viewer.html",
  owner: ids.owner1Id,
  questionsPerSlide: [qPerSlide1, qPerSlide2, qPerSlide3]
};

exports.slideshowWithQButNoQPerSlides = {
  _id: ids.slideshowWithQButNoQPerSlidesId,
  title: 'test presentation that has questionsPerSlide but no questions',
  course: 'General',
  originalFile: "index.html",
  presenterFile: "index.asq-presenter.html",
  viewerFile: "index.asq-viewer.html",
  owner: ids.owner1Id,
  questions: [ids.question1Id],
};

exports.slideshowWithNoQNoQPerSlides = {
  _id: ids.slideshowWithNoQNoQPerSlidesId,
  title: 'test presentation that has no questions and no questionsPerSlide',
  course: 'General',
  originalFile: "index.html",
  presenterFile: "index.asq-presenter.html",
  viewerFile: "index.asq-viewer.html",
  owner: ids.owner1Id
};

exports.slideshowWithMoreQThanQPerSlides = {
  _id: ids.slideshowWithMoreQThanQPerSlidesId,
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
  _id: ids.slideshowWithMoreQPerSlidesThanQId,
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
  _id: ids.slideshowWithNoQNoSPerSlidesId,
  title: 'test presentation that has more questions than questionsPerSlide',
  course: 'General',
  originalFile: "index.html",
  presenterFile: "index.asq-presenter.html",
  viewerFile: "index.asq-viewer.html",
  owner: ids.owner1Id
};

exports.slideshowWithSPerSlidesButNoQ = {
  _id: ids.slideshowWithSPerSlidesButNoQId,
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
    name: 'test user',
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
  questionsDisplayed: [],
  showingAnswer: false,
  showingQuestion: false,
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
  questionsDisplayed: [],
  showingAnswer: false,
  showingQuestion: false,
  slides: ids.slideshowLiveId,
  started: false,
  viewers: []
}
]