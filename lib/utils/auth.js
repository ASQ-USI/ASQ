var cookie = require('cookie')
, connect  = require('connect');

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
  getSessionFromCookie : getSessionFromCookie
};