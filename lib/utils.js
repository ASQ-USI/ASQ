var cookie = require('cookie')
, connect  = require('connect');

//Compares two arrays. Ignores capitalisation.
function arrayEqual(array1, array2) {
	if (array1.length !== array2.length) {
		console.log("arrayEqual wrong length: " + array1.length + " " + array2.length)
		return false;
	} else {
		for (var i = 0; i < array1.length; i++) {
			if (array1[i].toString().toLowerCase() != array2[i].toString().toLowerCase()) {
				//console.log( typeof (array1[i]) + " - " + typeof (array2[i]))
				return false;
			}
		}
	}
	return true;
}

/**
 * Get the express session from a cookie.
 * Return null if it is unable to parse the cookie.
 */
function getSessionFromCookie(rawCookie) {
	var parsedCookie = cookie.parse(rawCookie);
	var session = connect.utils.parseSignedCookie(parsedCookie['asq.sid'], 'ASQSecret');
	return session == parsedCookie['asq.sid'] ? null : session;
}

module.exports =  {
  arrayEqual           : arrayEqual,
  getSessionFromCookie : getSessionFromCookie
} 