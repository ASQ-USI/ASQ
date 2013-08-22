
/*
 *  Dust context helper to iterate over  a JSON object as key value.
 *  By: akdubya at http://github.com/akdubya/dustjs/issues/9#issuecomment-697615
 */
function JSONIter(chk, ctx, bodies) {
  var obj = ctx.current();
  for (var k in obj) {
    chk = chk.render(bodies.block, ctx.push({
      key   : k,
      value : obj[k]
    }));
  }
  return chk;
}


module.exports = {
  JSONIter : JSONIter
}