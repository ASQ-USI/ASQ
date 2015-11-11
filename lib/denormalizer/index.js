/** @module eventDenormalizer/index
    @description Denormalize events so that they can be consumed by the ui
*/



var modelBus = require('../model/pubsub');

var denormalizers = {
  'sessionEvent' : require('./sessionEventDenormalizer')
}

modelBus.on('sessionEventCreated', function(event){
  var sEvent = event.data.sessionEvent;
  denormalizers['sessionEvent'].denormalizeEvent(sEvent);
});