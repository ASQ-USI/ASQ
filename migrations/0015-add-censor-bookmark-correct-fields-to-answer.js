
var mongodb = require('mongodb');

exports.up = function(db, next){
  db.collection('answers').update({
    'isCensored' : {$exists : false}
  }, {
    $set: {
      'isCensored' : false,
      'isBookmarked' : false
    }
  }, {
    multi: true
  }, next);
};

exports.down = function(db, next){
  next();
};
