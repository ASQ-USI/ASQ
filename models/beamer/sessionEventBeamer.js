/** @module models/presenterControl/sessionEventBeamer
    @description a SessionEvent Model to hold denormalized sessionEvents for presenter progress view
*/

var mongoose   = require('mongoose');
var Schema     = mongoose.Schema;
var ObjectId   = Schema.ObjectId;
var logger     = require('logger-asq');
var socketEmitter  = require('../../lib/socket/pubsub');

var sessionEventBeamerSchema = new Schema({
  origSessionEvent   : { type: ObjectId, ref: 'SessionEvent', required: true },
  session            : { type: ObjectId, ref: 'Session', required: true },
  type               : { type: String, required: true },
  time               : { type: Date, required: true, default: Date.now }
}, { strict: false });


sessionEventBeamerSchema.post("save", function(doc){
  socketEmitter.emit('emitToRoles',{
    evtName : 'asq:sessionEventBeamer',
    event : {
      data: {
        sessionEvent: doc.toObject()
      }
    },
    sessionId : doc.session,
    namespaces: ['ctrl']
  });
});

sessionEventBeamerSchema.index({ session: 1, type: 1, time: 1 });


logger.debug('Loading SessionEventBeamer model');
mongoose.model('SessionEventBeamer', sessionEventBeamerSchema);

module.exports = mongoose.model('SessionEventBeamer'); 
