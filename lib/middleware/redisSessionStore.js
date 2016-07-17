/** 
  * @module lib/middleware/redisSessionStore
  * @description redis store for session cookies
*/

const session = require('express-session');
const config = require('../../config');
const redisStore = require('connect-redis')(session);

const redisSessionStore = new redisStore({
    host: config.redis.host, //changed in order to use the host entries created by Docker in /etc/hosts while linking containers
    port: config.redis.port,
    db: 0,
  });

module.exports = redisSessionStore;