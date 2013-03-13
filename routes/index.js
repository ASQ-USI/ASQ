/** @module routes/index
    @author Jacques Dafflon jacques.dafflon@gmail.com
    @description Main file for routing to ther modules.
*/

exports.slides = require('./slides');
exports.upload = require('./upload');

exports.index = function(req, res){
    res.render('index', { title: 'Express' });
};
