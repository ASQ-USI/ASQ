/** @module routes/index
    @description Main file for routing to ther modules.
*/

module.exports = {
  slides  : require('./slides'),
  upload : require('./upload'),
  index   : function(req, res){  res.render('index', { title: 'Express' })}
}