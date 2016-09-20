var util = require('util');
var Promise = require('bluebird');
var sourcedRepoMongo = require('sourced-repo-mongo');
var MongoRepository  = sourcedRepoMongo.Repository;
var Session = require('./session');

function SessionRepository () {
  this.cache = {};
  MongoRepository.call(this, Session);
}

util.inherits(SessionRepository, MongoRepository);

SessionRepository.prototype.get = function (id, cb) {
  var self = this;
  var promise = new Promise(function (resolve, reject) {
    var session = self.cache[id];
    if(!session) {
      // rebuild from event snapshots and store
      SessionRepository.super_.prototype.get.call(self, id, function (err, session) {
        self.cache[id] = session;
        resolve(session);
      });
    } else {
      resolve(session);
    }
  });

  promise.done(function (session) {
    cb(null, session);
  });
};

module.exports = SessionRepository