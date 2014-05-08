var ObjectId = require('mongoose').Types.ObjectId
, path       = require('path');


var ids = {
  batman : new ObjectId()
};

var fixtures = {};

fixtures.User = [
  {
    _id        : ids.batman,
    firstname  : 'Bruce',
    lastname   : 'Wayne',
    username   : 'batman',
    screenName : 'Batman',
    password   : 'bat-password',
    email      : 'batman@bat-mail.com'
  }
];

var reqs = {
  invalid : {
    user : fixtures.User[0],
    files : {
      upload : {
        path : path.resolve(__dirname, './upload-method-invalid-slideshow.zip'),
        name : 'invalid slides'
      }
    }
  },
  valid : {
    user : fixtures.User[0],
    files : {
      upload : {
        path : path.resolve(__dirname, './upload-method-valid-slideshow.zip'),
        name : 'valid slides'
      }
    }
  }
};

// Empty fixtures on purpose to empty the db of docs created by the tested fn.
// fixtures.Question = [];
// fixtures.Rubric = [];
// fixtures.Slideshow = [];

var uploadDir = path.resolve(__dirname, './tmp-upload-method-slides');

module.exports = {
  ids       : ids,
  fixtures  : fixtures,
  reqs      : reqs,
  uploadDir : uploadDir
};

// global app object so that the upload method can fetch the app data it needs.
app = {};

app.get = function get(key) {
  appData = {
    uploadDir : uploadDir
  }
  return appData[key];
}