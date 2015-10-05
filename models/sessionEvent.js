/** @module models/sessionEvent
    @description the SessionEvent Model
*/

var mongoose   = require('mongoose')
var Schema     = mongoose.Schema;
var ObjectId   = Schema.ObjectId;
var logger     = require('logger-asq');
var socketEmitter  = require('../lib/socket/pubsub');

var sessionEventSchema = new Schema({
  session            : { type: ObjectId, ref: 'Session', required: true },
  type               : { type: String, required: true },
  data               : { type: Object },
  time               : { type: Date, required: true, default: Date.now }
});


sessionEventSchema.post("save", function(doc){
  socketEmitter.emit('emitToRoles',{
    evtName : 'asq:sessionEvent',
    event : doc.toObject(),
    sessionId : doc.session,
    namespaces: ['ctrl']
  });
});


logger.debug('Loading SessionEvent model');
mongoose.model('SessionEvent', sessionEventSchema);

module.exports = mongoose.model('SessionEvent');