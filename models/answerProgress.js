var mongoose = require('mongoose')
, Schema     = mongoose.Schema
, ObjectId   = Schema.ObjectId
, appLogger  = require('../lib/logger').appLogger;

var answerProgressSchema = new Schema({
  session      : { type: ObjectId, ref: 'Session', required: true },
  exercise     : { type: ObjectId, ref: 'Exercise', required: true },
  answers      : { type: Number, min: 0, default: 0 },
  self         : { type: Number, min: 0, default: 0 },
  peer         : { type: Number, min: 0, default: 0 },
  disconnected : { type: Number, min: 0, default: 0 }
});

answerProgressSchema.index({ session : -1, exercise: 1 }, { unique: true });

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
  var obj = {}, ops = {}, hasOwn = Object.prototype.hasOwnProperty;

  // Update Object
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

  // Options object
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

appLogger.debug('Loading AnswerProgress model');
mongoose.model('AnswerProgress', answerProgressSchema, 'answerprogresses');

module.exports =  mongoose.model('AnswerProgress');