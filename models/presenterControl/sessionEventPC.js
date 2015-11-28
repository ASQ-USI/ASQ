/** @module models/presenterControl/sessionEventPC
    @description a SessionEvent Model to hold denormalized sessionEvents for presenter control
*/

var mongoose   = require('mongoose')
var Schema     = mongoose.Schema;
var ObjectId   = Schema.ObjectId;
var logger     = require('logger-asq');
var socketEmitter  = require('../../lib/socket/pubsub');

var sessionEventPCSchema = new Schema({
  origSessionEvent   : { type: ObjectId, ref: 'SessionEvent', required: true },
  session            : { type: ObjectId, ref: 'Session', required: true },
  type               : { type: String, required: true },
  time               : { type: Date, required: true, default: Date.now }
}, { strict: false });


sessionEventPCSchema.post("save", function(doc){
  socketEmitter.emit('emitToRoles',{
    evtName : 'asq:sessionEventPC',
    event : {
      data: {
        sessionEvent: doc.toObject()
      }
    },
    sessionId : doc.session,
    namespaces: ['ctrl']
  });
});

sessionEventPCSchema.index({ session: 1, type: 1, time: 1 });


logger.debug('Loading SessionEventPC model');
mongoose.model('SessionEventPC', sessionEventPCSchema);

module.exports = mongoose.model('SessionEventPC');