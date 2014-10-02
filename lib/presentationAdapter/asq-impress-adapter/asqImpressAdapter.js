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
  
  var $=require('cheerio').load(html);
  //need this for trim functionality
  var sugar = require('sugar');
  // return steps after making sure they have an id
  return $('.step').map(function(idx, el){
    console.log(this.attr('id'))
    if ( "undefined" == typeof this.attr('id') || this.attr('id').trim() == '' ) {
      this.attr('id' ,"step-" + (idx + 1));
    }
    return this.attr('id');
  });
}