/** @module routes/index */

/**
   Dummy function for root URL.
   This will be replaced.
 */

var ejs = require('ejs');

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};/** Renders the slideshow for admins */
exports.admin = function(req, res) {
    res.render('slides', {title: 'demo', mode:'admin', host:'test', port:'3000', user:'jacques', pass:'HG23WX'});
}

/** Renders the slideshow for viewers */
exports.live = function(req, res) {
    res.render('slides', {title: 'demo', mode:'viewer', host:'test', port:'3000', user:'jacques', pass:'HG23WX'});
}