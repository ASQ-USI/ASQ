
var mongodb = require('mongodb');

exports.up = function(db, next){
    db.collection('slideshows').update({
      "presentationFramework" : {$exists : false}
    }, {
      $set: {"presentationFramework" : "impress.js"}
    }, {
      multi: true
    }, next);
};

exports.down = function(db, next){
    next();
};
