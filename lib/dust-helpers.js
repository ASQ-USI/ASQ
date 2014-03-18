/** @module lib/dust-helpers.js
    @description Custom dust helpers
*/


/**
 * Dust context helper to iterate over  a JSON object as key value.
 * By: akdubya at http://github.com/akdubya/dustjs/issues/9#issuecomment-697615
*/
function JSONIter(chk, ctx, bodies, params) {
  var obj = ctx.current();
  var i = 0;
  for (var k in obj) {
    chk = chk.render(bodies.block, ctx.push({
      idx   : i++,
      key   : k,
      value : obj[k],
      params : params
    }));
  }
  return chk;
}



/**
 * Dust helper to format a date.
*/
function formatDate (chunk, context, bodies, params) {
  var value = dust.helpers.tap(params.value, chunk, context)
    , timestamp
    , month
    , date
    , year;

    timestamp = new Date(value);
    month = timestamp.getMonth() + 1;
    date = timestamp.getDate();
    year = timestamp.getFullYear();

    return chunk.write(date + '.' + month + '.' + year);
};


module.exports = function(dust){
  dust.helpers.JSONIter = JSONIter;
  dust.helpers.formatDate = formatDate;
}