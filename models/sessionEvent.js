/** @module models/sessionEvent
    @description the SessionEvent Model
*/

const logger = require('logger-asq');
const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const modelBus = require('../lib/model/pubsub');

const sessionEventSchema = new Schema({
  session            : { type: ObjectId, ref: 'Session', required: true },
  type               : { type: String, required: true },
  data               : { type: Object },
  time               : { type: Date, required: true, default: Date.now }
});


sessionEventSchema.post('save', function(doc){
  modelBus.emit('sessionEventCreated', {
    data:{
      sessionEvent: doc.toObject()
    } 
  })
});

sessionEventSchema.index({ session: 1, type: 1, time: 1 });


logger.debug('Loading SessionEvent model');
mongoose.model('SessionEvent', sessionEventSchema);

module.exports = mongoose.model('SessionEvent');