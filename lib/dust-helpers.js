
/*
 *  Dust context helper to iterate over  a JSON object as key value.
 *  By: akdubya at http://github.com/akdubya/dustjs/issues/9#issuecomment-697615
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


module.exports = {
  JSONIter : JSONIter
}