/** @module config/index
    @description Main file for config files.
*/
'use strict';

const logger  = require('logger-asq');
const _       = require('lodash');
const path    = require('path');
const helpers = require('./helpers'); 

const rootDir = path.resolve(__dirname, '../');


// Base configuration
let conf = {
  //Server hostname to which clients have to connect 
  //Note this is overwritten by the environment HOST value if it exists.
  host: process.env.HOST || "127.0.0.1" ,

  //Port used by the server to listen for http requests
  //Note this is overwritten by the environment PORT value if it exists.
  HTTPPort: + process.env.HTTP_PORT || 3000,

  //Port used by the server to listen for https requests
  //Note this is overwritten by the environment PORT value if it exists.
  HTTPSPort: + process.env.HTTPS_PORT || 3443,

  // HTTPS Settings
  // Enable HTTPS. WARNING: When 'useReverseProxy' is true,
  // the server accepts HTTP only. Make sure your reverseProxy is using HTTPS to
  // communicate with the Internet
  enableHTTPS: helpers.booleanOrDefault(process.env.ENABLE_HTTPS, false),
  //Key path needed for HTTPS
  keyPath: process.env.KEY_PATH || "./ssl/server.key",
  //Cert path needed for HTTPS
  certPath: process.env.CERT_PATH || "./ssl/server.crt",
  //CA path needed for HTTPS
  caPath: process.env.CA_PATH || "./ssl/ca.crt",
  //Request a certificate for HTTPS
  requestCert: helpers.booleanOrDefault(process.env.REQUEST_CERT, false),
  //Reject unauthorized requests for HTTPS
  rejectUnauthorized: helpers.booleanOrDefault(process.env.REJECT_UNAUTHORIZED, true),

  // Reverse Proxy Settings
  // if useReverseProxy is true, ASQ will use the proxy host option for the URL.
  // The reverse proxy communicates with ASQ through HTTP
  // requests (enableHTTPS option will be ignored)
  useReverseProxy: helpers.booleanOrDefault(process.env.USE_REVERSE_PROXY, false),

  reverseProxyOptions:{
    // secure: whether the reverse proxy is using http or https
    secure: helpers.booleanOrDefault(process.env.REVERSE_PROXY_SECURE, true),
    // host: the host of the reverse proxy
    host: process.env.REVERSE_PROXY_HOST || 'www.example.com',
    // port: the port of the reverse proxy
    port: + process.env.REVERSE_PROXY_PORT
  },

  // MongoDB
  mongo:{
    // Hostname of the mongoDB server
    host: process.env.MONGO_HOST || "127.0.0.1",
    // Port used by the mongoDB server
    port: + process.env.MONGO_PORT || 27017,
    //username disabled by default Uncomment to enable
    //username: '',
    //password disabled by default. Uncomment to enable
    //password: '',
    // Database name (default: 'asq')
    dbName: process.env.MONGO_DB_NAME || "asq",
  },

  // Redis
  redis:{
    // Hostname of the redis server
    host: process.env.REDIS_HOST || "127.0.0.1",
    // Port used by the redis server
    port: + process.env.REDIS_PORT || 6379,
  },

  //LDAP Settings
  //Enable LDAP
  enableLdap: helpers.booleanOrDefault(process.env.ENABLE_LDAP, false),

  ldapOptions:{
    //ldap server URL
    url : process.env.LDAP_URL || 'ldap://myldapserver.com',
    // LDAP search filter with which to find a user by
    //    username. Use the 
    //    literal '{{username}}' to have the given username
    //    be interpolated in for the LDAP search.
    searchFilter : process.env.LDAP_SEARCH_FILTER || '(uid={{username}})',
    //ldap base to search
    searchBase : process.env.LDAP_SEARCH_BASE || 'o=example',
    //scope for the search. One of base, one, or sub.
    searchScope: process.env.LDAP_SEARCH_SCOPE || 'sub',
  },

  //Clients limit
  clientsLimit: + process.env.CLIENTS_LIMIT || 50,

  //Slideshow
  //Upload directory.Make sure you have the correct permissions.
  //This should be an absolute path like: '/var/www/asq/slides'
  // without a backslash in the end
  uploadDir: process.env.UPLOAD_DIR || './slides',

  // plugins
  // Plugin directory.Make sure you have the correct permissions.
  pluginDir: process.env.PLUGIN_DIR || './plugins',

  //Logging
  //  Available log level options:
  //    "trace"
  //    "debug"
  //    "info"
  //    "warn"
  //    "error"
  log: {
    //application logging
    application: {
      level: process.env.LOG_APPLICATION_LEVEL || "info",
      file: process.env.LOG_APPLICATION_FILE || "log/app.log",
      json: helpers.booleanOrDefault(process.env.LOG_APPLICATION_JSON, false)
    }
  },


  //where to send pdf uploads for conversion
  pdfServer:{
    url: process.env.PDF_SERVER_URL || "http://localhost:3300/api/impress"
  }
};


//Set the process host and port if undefined.
conf.host = process.env.HOST || conf.host;
conf.port = process.env.PORT || (conf.enableHTTPS ? conf.HTTPSPort : conf.HTTPPort);


//mongo stuff
conf.mongo.mongoUri = helpers.createMongoUri(conf.mongo);


// to generate urls from the rest of the app we need the following info.
// urlProtocol, urlPort and urlHost MAY NOT be this process's protocol
// port and host. It might as well be the reverse proxy ones. 
if(conf.useReverseProxy){
  var proxyOpts = conf.reverseProxyOptions;

  conf.urlProtocol = proxyOpts.secure 
    ? "https"
    : "http";

  // if reverse proxy port is empty, use default for protocol
  if(! proxyOpts.port){
    proxyOpts.port = proxyOpts.secure ? 443 : 80
  }

  conf.urlPort = proxyOpts.port;

  conf.urlHost = proxyOpts.host
}else{
  conf.urlProtocol = conf.enableHTTPS
    ? "https"
    : "http";
  conf.urlPort = conf.port
  conf.urlHost = conf.host;
}

// omit default port from rootUrl
var portFragment =  ((conf.urlProtocol === "http" && conf.urlPort === 80) 
  || (conf.urlProtocol === "https" && conf.urlPort === 443 ))
  ? ''
  : ':' + conf.urlPort;

conf.rootUrl = conf.urlProtocol +"://" + conf.urlHost + portFragment;
conf.rootDir = rootDir;

conf.uploadDir = path.resolve(path.join(conf.rootDir, conf.uploadDir));
conf.pluginDir = path.resolve(path.join(conf.rootDir, conf.pluginDir));

module.exports = conf;
