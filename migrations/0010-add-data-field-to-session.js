
const mongodb = require('mongodb');

exports.up = function(db, next){
  db.collection('sessions').update({
    'data' : {$exists : false}
  }, {
    $set: {
      'data' : {
        'activeViewerQuestion': null,
        'questions': [],
        'studentQuestionsEnabled': false,
      }
    }
  }, {
    multi: true
  }, next);
};

exports.down = function(db, next){
  next();
};