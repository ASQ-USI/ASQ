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
      const slide = obj.data.slide;
      let fragment = obj.data.fragment;
      if (fragment !== null && fragment !== undefined) {
        fragment += 1;
        if (fragment > 0) {
          fragment = '.' + fragment;
        } else {
          fragment = '';
        }
      }
      else fragment = '';
      const name = slide + fragment;
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
  * Generates an array of slide transitions with the student perception
  * @param {Object[]} slideTransitions The slide transitions array ordered by date
  * @param {Object[]} studentPerceptionEvents The student perception events array ordered by date
  * @returns {Object[]}
  */

  generateStudentPerceptionPerSlideArray: function (slideTransitions, studentPerceptionEvents) {
    return slideTransitions.map( st => {
      let stEvents;
      //current slide
      if (st.endTime === undefined)
        stEvents = _.filter(studentPerceptionEvents, evt => evt.time >= st.startTime);
      else
        stEvents = _.filter(studentPerceptionEvents, evt => evt.time >= st.startTime && evt.time <= st.endTime);
      const evByUser = _.toArray(_.keyBy(stEvents, 'data.user'));
      const perception = [];
      const items = this.generateItems(21, 5);
      for (let i = 0; i < evByUser.length; i++) {
        // remove unecessary data
        const user = evByUser[i];
        const cleanedUser = {
          id: user.data.user,
          value: user.data.value,
          time: user.time,
        }
        perception.push(cleanedUser);
      }
      this.updateArrayValues(items, perception, 5);
      st.maxTotalViewers = this.computeMaxTotalViewers(items);
      st.perception = perception;
      st.items = items;
      return st;
    });
  },

  computeMaxTotalViewers(items) {
    const obj = _.maxBy(items, 'totalViewers');
    return obj.totalViewers;
  },

  generateItems: function (numOfElements, step) {
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

  compareValues: function (element) {
    return this.value === element.value;
  },

  updateArrayItems: function (items, obj) {
    const peopleToAdd = 1;
    const valueIndex = items.findIndex(this.compareValues, obj);
    if (valueIndex !== -1) {
      items[valueIndex].totalViewers += peopleToAdd;
    }
  },

  updateValues: function (items, element, step) {
    const remainder = element.value % step;
    const obj = {
      value: element.value - remainder,
    };
    this.updateArrayItems(items, obj);
  },

  updateArrayValues: function (items, currentPerception, step) {
    for (let i = 0; i < currentPerception.length; i++) {
      const usr = currentPerception[i];
      this.updateValues(items, usr, step);
    }
  }

}
