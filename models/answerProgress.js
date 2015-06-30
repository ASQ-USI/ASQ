var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var when     = require('when');
var logger   = require('logger-asq');

var answerProgressSchema = new Schema({
  session      : { type: ObjectId, ref: 'Session', required: true },
  exercise     : { type: ObjectId, ref: 'Exercise', required: true },
  answers      : { type: Number, min: 0, default: 0 },
  self         : { type: Number, min: 0, default: 0 },
  peer         : { type: Number, min: 0, default: 0 },
  discAnswers  : { type: Number, min: 0, default: 0 },
  discSelf     : { type: Number, min: 0, default: 0 },
  discPeer     : { type: Number, min: 0, default: 0 },
});

answerProgressSchema.index({ session : -1, exercise: 1 }, { unique: true });

answerProgressSchema.statics.update = function (session, exercise, update) {
  var that = this;
  if (typeof update.answers !== 'number' || update.answers < 0) {
    update.answers = 0;
  }
  if (typeof update.self !== 'number' || update.self < 0) {
    update.self = 0;
  }
  if (typeof update.peer !== 'number' || update.peer < 0) {
    update.peer = 0;
  }
  if (typeof update.discAnswers !== 'number' || update.discAnswers < 0) {
    update.discAnswers = 0;
  }
  if (typeof update.discSelf !== 'number' || update.discSelf < 0) {
    update.discSelf = 0;
  }
  if (typeof update.discPeer !== 'number' || update.discPeer < 0) {
    update.discPeer = 0;
  }
  return this.findOne({session: session, exercise: exercise}).exec()
  .then(
    function onFind(progress) {
      if (!progress) {
        var AnswerProgress = mongoose.model('AnswerProgress');
        progress = new that({
          session     : session,
          exercise    : exercise,
          answers     : update.answers,
          self        : update.self,
          peer        : update.peer,
          discAnswers : update.discAnswers,
          discSelf    : update.discSelf,
          discPeer    : update.discPeer,
        });
      } else {
        progress.answers += update.answers;
        if (progress.answers < 0) { progress.answers = 0; }

        progress.self += update.self;
        if (progress.self < 0) { progress.self = 0; }

        progress.peer += update.peer;
        if (progress.peer < 0) { progress.peer = 0; }

        progress.discAnswers += update.discAnswers;
        if (progress.discAnswers < 0) { progress.discAnswers = 0; }

        progress.discSelf += update.discSelf;
        if (progress.discSelf < 0) { progress.discSelf = 0; }

        progress.discPeer += update.discPeer;
        if (progress.discPeer < 0) { progress.discPeer = 0; }
      }
      var defer = when.defer();
      progress.save(function onSave(err) {
        if (err) { defer.reject(err); }
        else { defer.resolve(progress); }
      });
      return defer.promise;
  }, function onError(err) {
    return when.reject(err);
  });
}

/**
 * Update the progress of answers submitted for a given exercise and session.
 *
 * @param {session} The session for the progress to update.
 * @param {exercise} The exercise for the progress to update.
 * @param {update} Object with the following optional fields: answers, self,
 *                 peer, disconnected whose value indicate by how much to
 *                 increment (negative values to decrement).
 * @param {options} Object with the mongoose findAndUpdate options: upsert, new,
 *                  sort and select
 * @return A mongoose query to find and update a progress. The query is not
 *         executed when returned, you must manually call .exec() afterwards.
 */
answerProgressSchema.statics.getUpdateQuery = function(session, exercise, update, options) {
  var obj = {}
  , ops   = { new: true, upsert: false},
  hasOwn  = Object.prototype.hasOwnProperty;

  if (! session || ! exercise) {
    return null;
  }

  // Update Object
  if (!! update) {
    // Answers
    var validAnswersUpdate = hasOwn.call(update, 'answers') &&
      (update.answers === 1 || update.answers === -1);
    if (validAnswersUpdate) {
      obj.answers = update.answers;
    }

    // Self
    var validSelfUpdate = hasOwn.call(update, 'self') &&
      (update.self === 1 || update.self === -1);
    if (validSelfUpdate) {
      obj.self = update.self;
    }

    // Peer
    var validPeerUpdate = hasOwn.call(update, 'peer') &&
      (update.peer === 1 || update.peer === -1);
    if (validPeerUpdate) {
      obj.peer = update.peer;
    }
  }

  // Options object
  if (!! options) {
    // Create (upsert)
    var validUpsert = hasOwn.call(options, 'upsert');
    if (validUpsert) {
      ops.upsert = options.upsert;
    }

    // New
    var validNew = hasOwn.call(options, 'new');
    if (validNew) {
      ops.new = options.new;
    }

    // Sort
    var validSort = hasOwn.call(options, 'sort');
    if (validSort) {
      ops.sort = options.sort;
    }

    // Select
    var validSelect = hasOwn.call(options, 'select');
    if (validSelect) {
      ops.select = options.select;
    }
  }

  // Yes it bypass potential hooks but it is wrapped in the schema, not exposed
  // so it's the responsibility of the one implementing the hook to make sure
  // this method still works and if does not fix it..
  // This does not run the update, one has to call exec() for that (which returns a promise)
  // Not returning the promise directly allows to register the promise before it actually returns.
  return this.findOneAndUpdate({
    session  : session,
    exercise : exercise
  }, obj, ops);
}

logger.debug('Loading AnswerProgress model');
mongoose.model('AnswerProgress', answerProgressSchema, 'answerprogresses');

module.exports =  mongoose.model('AnswerProgress');