module.exports = {

  generateCtrlGoToEventsTable: function(ctrlGoToEvents){
    let ctrlGoToEventsTable = {};
    // scanning all the go-to events fired
    const length = ctrlGoToEvents.length
    for (var i = 0; i < length; i++) {
      const obj = ctrlGoToEvents[i];
      const name = obj.data.slide;
      let startTime = obj.time;
      let endTime;
      if ((i + 1) < length) 
        endTime = ctrlGoToEvents[i + 1].time
      ctrlGoToEventsTable["slide" + i] = {
        name,
        startTime,
        endTime
      };
    }
    return ctrlGoToEventsTable;
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

  generateRestoredCockpit: function(ctrlGoToEventsTable, sliderChangeEvents){
    let key;
    const cockpitState = {
      previousSlides: []
    }
    const items = this.generateItems(21, 5);
    for(key in Object.keys(ctrlGoToEventsTable)){
      const obj = ctrlGoToEventsTable["slide" + key];
      obj.perception = [];
      if (obj.hasOwnProperty('endTime')) {
        for (var i = 0; i < sliderChangeEvents.length; i++) {
          const sCObj = sliderChangeEvents[i];
          const eventHappenedInSlide = this.checkTimeBetweenTimestamp(sCObj.time, obj.startTime, obj.endTime);
          if(eventHappenedInSlide)
            obj.perception.push(sCObj);
        }
      }
      obj.items = items;
      const o = {
        items: obj.items,
        perception: obj.perception,
        currentSlide: obj.name,
        position: parseInt(key)
      };
      cockpitState.previousSlides.push(o);
    }
    return cockpitState;
  },

  checkTimeBetweenTimestamp: function(time, startTime, endTime){
    time = Date.parse(new Date(time));
    startTime = Date.parse(new Date(startTime));
    if(endTime !== undefined){
      endTime = Date.parse(new Date(endTime));
      return time >= startTime && time < endTime; 
    }
    return time >= startTime;
    


    
  }

}