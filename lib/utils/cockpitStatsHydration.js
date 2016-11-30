const _              = require('lodash');

module.exports = {
  /**
  * Generates an array of all the slide transitions of the lecture
  * @param {Object[]} ctrlGoToEvents The goto events ordered by date
  * @returns {Object[]}
  */
  generateSlideTransitionsArray: function(ctrlGoToEvents){
    const SlideTransitionsArray = [];
    // scanning all the go-to events fired
    const length = ctrlGoToEvents.length
    for (let i = 0; i < length; i++) {
      const obj = ctrlGoToEvents[i];
      const name = obj.data.slide;
      let startTime = obj.time;
      let endTime;
      if ((i + 1) < length) 
        endTime = ctrlGoToEvents[i + 1].time
      SlideTransitionsArray.push({
        name,
        startTime,
        endTime
      });
    }
    return SlideTransitionsArray;
  },
  /**
  * Generates an array of slides transitions with the student perception
  * @param {Object[]} slideTransitions The slides transitions array ordered by date
  * @param {Object[]} studentPerceptionEvents The student perception events array ordered by date
  * @returns {Object[]}
  */

  generateStudentPerceptionPerSlideArray: function(slideTransitions, studentPerceptionEvents){
    return slideTransitions.map( st => {
      let stEvents;
      //current slide
      if (st.endTime === undefined)
        stEvents = _.filter(studentPerceptionEvents, evt => evt.time >= st.startTime);
      else
        stEvents = _.filter(studentPerceptionEvents, evt => evt.time >= st.startTime && evt.time <= st.endTime);
      const evByUser = _.toArray(_.keyBy(stEvents, 'data.user'));
      st.perception = evByUser;
      return st;
    });
  },

  generateItems: function(numOfElements, step){
    const items = [];
    for (var i = 0; i < numOfElements; i++) {
      const item = {
        value: i * step,
        totalViewers: 0
      };
      items.push(item);
    }
    return items;
  },
}