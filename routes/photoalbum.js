var schemas =require("../models/models.js");
var fs=require('fs');


exports.getsingle=function(req, res) {
	res.sendfile(req.path);
	
}

