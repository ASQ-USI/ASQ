/** @module routes/index
    @description Main file for routing to ther modules.
*/

module.exports = {
  index  : function(req, res){  res.render('index', { title: 'Express' })},
  setUp  : require('./routes').setUp
}