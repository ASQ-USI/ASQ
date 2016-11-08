/** @module models/presenterControl/sessionEventCockpit
    @description a SessionEvent Model to hold denormalized sessionEvents for presenter control
*/

var mongoose   = require('mongoose')
var Schema     = mongoose.Schema;
var ObjectId   = Schema.ObjectId;
var logger     = require('logger-asq');
var socketEmitter  = require('../../lib/socket/pubsub');

var sessionEventCockpitSchema = new Schema({
  origSessionEvent   : { type: ObjectId, ref: 'SessionEvent', required: true },
  session            : { type: ObjectId, ref: 'Session', required: true },
  type               : { type: String, required: true },
  time               : { type: Date, required: true, default: Date.now }
}, { strict: false });


sessionEventCockpitSchema.post("save", function(doc){
  socketEmitter.emit('emitToRoles',{
    evtName : 'asq:sessionEventCockpit',
    event : {
      data: {
        sessionEvent: doc.toObject()
      }
    },
    sessionId : doc.session,
    namespaces: ['ctrl']
  });
});

sessionEventCockpitSchema.index({ session: 1, type: 1, time: 1 });


logger.debug('Loading SessionEventCockpit model');
mongoose.model('SessionEventCockpit', sessionEventCockpitSchema);

module.exports = mongoose.model('SessionEventCockpit');