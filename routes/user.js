var fs = require('fs');

var users = [
    { uname: "test", first: "te", last: "est" }
]

exports.index = function(req, res) {
    var user = users[req.params.user];
    if (user)
        res.send(200, "user: " + users.uname);
    else
        res.send(404, "user " + req.params.user + " not found!");
}

exports.admin = function(req, res) {
    var user = users[req.params.user];
    if (!user)
        res.send(404, "user " + req.params.user + " not found!");
    else {
        var presentation = req.params.presentation
        console.log(req.params.presentation)
        fs.exists('./public/presentations/' + presentation, function(exists) {
            if (!exists)
                res.send(404, "presentation not found");
            else
                res.send(200, "presentation found");
        });

    }
}

exports.live = function(req, res) {
    var user = users[req.params.user];
    if (!user)
        res.send(404, "user " + req.params.user + " not found!");
    else {
        var presentation = req.params.presentation
        fs.exists('/public/presentations/' + presentation, function(exists) {
            if (!exists)
                res.send(404, "presentation not found");
            else
                res.send(200, "presentation found");
        });

    }
}

exports.stats = function(req, res) {
    var user = users[req.params.user];
    if (!user)
        res.send(404, "user " + req.params.user + " not found!");
    else {
        var presentation = req.params.presentation
        fs.exists('/public/presentations/' + presentation, function(exists) {
            if (!exists)
                res.send(404, "presentation not found");
            else
                res.send(200, "presentation found");
        });

    }

}

exports.index = function(req, res) {
    var user = users[req.params.user];
    if (!user)
        res.send(404, "user " + req.params.user + " not found!");
    else {
        var presentation = req.params.presentation
        fs.exists('/public/presentations/' + presentation, function(exists) {
            if (!exists)
                res.send(404, "presentation not found");
            else
                res.send(200, "presentation found");
        });

    }
}