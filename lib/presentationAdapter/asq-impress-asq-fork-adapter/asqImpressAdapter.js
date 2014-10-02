module.exports.getSlideFromGotoData = function(data){
  if("undefined" !== typeof data && "undefined" !== typeof data.step){
    return data.step
  }
  return null;
}

// The structure of an impress presentation comprises a list of `.step` elements
// We represent this list as an Array of strings where each string is the HTML 
// id of the corresponding slide. For example slidesTree = ['slide-1', 'slide-2']
// If a `.step` element has no id we use the same algorithm that impress.js uses
// to create one
// Based on code from  Bartek Szopka (@bartaz) http://github.com/bartaz/
module.exports.getSlidesTree = function(html){
  if("undefined" == typeof html){
    throw new Error ('html should be defined')
  }
  
  var slidesTree = {};
  slidesTree.allSubsteps={};

  var $=require('cheerio').load(html);

  //generate steps array
  slidesTree.steps = $('.step').map(function(idx, el){
    var $el = $(el);
    if ( "undefined" == typeof  $el.attr('id') ||  $el.attr('id').trim() == '' ) {
       $el.attr('id' ,"step-" + (idx + 1));
    }

    //generate substeps Object
    var elSubs = slidesTree.allSubsteps[ $el.attr('id')] = Object.create(null);
    elSubs.substeps = getSubSteps($, el);
    elSubs.active = -1;

    return  $el.attr('id');
  });

  return slidesTree;
}


function getSubSteps($, step) {
  var substeps = $(step).find(".substep"),
  order = [], unordered = [];
  substeps.each( function (idx, el) {
    var $el = $(el);
    if ($el.attr('data-order')) {
      var index = Number($el.attr('data-order'));
      
      // we fill with emtpy strings since the presentation adapter
      // doesn't care about the DOM element.
      // It only cares about the array length
      if (!isNaN(index)) {
        if (!order[index]) {
            order[index] = '';
        } else if (Array.isArray(order[index])) {
            order[index].push('');
        } else {
            order[index] = [order[index], ''];
        }
      } else {
        unordered.push('');
      } 
    } else {
       unordered.push('');
    }
  });
  return order.filter(Boolean).concat(unordered);
};