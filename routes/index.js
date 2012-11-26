exports.index = function(req, res) {
    res.send(200, "(to implement) login page")
}

exports.live = function(req, res) {
    res.render('impress', {title: 'example', script:'viewer'})
}