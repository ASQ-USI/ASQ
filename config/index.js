/** @module config/index
    @description Main file for config files.
*/
'use strict';

//we import bunyan instead of the dedicated loggers because they are not setup yet

var logger      = require('logger-asq');
var _           = require('lodash');
var path        = require('path')
var fs          = require('fs');
var defaultConf = {};
var env         = process.env.NODE_ENV || 'development';
var envConf     = {};
var rootDir     = path.resolve(__dirname, '../')


// Base configuration
var conf = {
  //Server hostname to which clients have to connect (default: '127.0.0.1')
  //Note this is overwritten by the environment HOST value if it exists.
  host: "127.0.0.1",

  //Port used by the server to listen for http requests (default: 80)
  //Note this is overwritten by the environment PORT value if it exists.
  HTTPPort: 3000,

  //Port used by the server to listen for https requests (default: 443)
  //Note this is overwritten by the environment PORT value if it exists.
  HTTPSPort: 3443,

  // HTTPS Settings
  // Enable HTTPS (default: false). WARNING: When 'usingReverseProxy' is true,
  // the server accepts HTTP only. Make sure your reverseProxy is using HTTPS to
  // communicate with the Internet
  enableHTTPS: false,
  //Key path needed for HTTPS (default: './ssl/server.key')
  keyPath: "./ssl/server.key",
  //Cert path needed for HTTPS (default: './ssl/server.crt')
  certPath: "./ssl/server.crt",
  //CA path needed for HTTPS (default: './ssl/ca.crt')
  caPath: "./ssl/ca.crt",
  //Request a certificate for HTTPS (default: false)
  requestCert: false,
  //Reject unauthorized requests for HTTPS (default: false)
  rejectUnauthorized: false,

  //MongoDB
  //Hostname of the mongoDB server (default: '127.0.0.1')
  mongoDBServer: "127.0.0.1",
  //Port used by the mongoDB server (default: 27017)
  mongoDBPort: 27017,
  //Database name (default: 'asq')
  dbName: "asq",

  // Reverse Proxy Settings
  // if usingReverseProxy is true, ASQ will the proxy host option for the url 
  // (default: false).  The reverse proxy communicates with ASQ through http
  // requests (enableHTTPS option will be ignored)
  usingReverseProxy: false,

  reverseProxyOptions:{
    // secure: whether the reverse proxy is using http or https (defualt: true)
    secure: true,
    // host: the host of the reverse proxy (defualt: 'www.example.com')
    host: 'www.example.com',
    // port: the port of the reverse proxy (defualt: 443)
    port: 443
  },

  //LDAP Settings
  //Enable LDAP (default: false)
  enableLdap: false,

  ldapOptions:{
    //ldap server URL (default: ldap://myldapserver.com)
    url : 'ldap://myldapserver.com',
    // LDAP search filter with which to find a user by
    //    username.(default: '(uid={{username}})') Use the 
    //    literal '{{username}}' to have the given username
    //    be interpolated in for the LDAP search.
    searchFilter : '(uid={{username}})',
    //ldap base to search (default: o=example)
    searchBase : 'o=example',
    //scope for the search. One of base, one, or sub. (default: sub)
    searchScope: 'sub',
  },

  //Clients limit (default: 50)
  clientsLimit: 50,

  //Slideshow
  //Upload directory.Make sure you have the correct permissions.
  //This should be an absolute path like: '/var/www/asq/slides'
  // without a backslash in the end
  uploadDir: './slides',

  // plugins
  // Plugin directory.Make sure you have the correct permissions.
  pluginDir: './plugins',

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
      level: "info",
      file: "log/app.log",
      json: false
    }
  }
};


// check for default configuration
if (fs.existsSync(__dirname + '/config.defaults.js')){
  defaultConf = require(__dirname + '/config.defaults.js');
}else{
  logger.info('Default configuration file not found(don\'t worry I have default defaults :-)');
}

// check for env configuration
if (fs.existsSync(__dirname + '/config.'+ env + '.js')){
  envConf = require('./config.'+ env);
}else{
  logger.info('There is no configuration file for environment: '+env);
}

//overwrite default configuration with env configuration
_.extend(conf, defaultConf, envConf);

//Set the process host and port if undefined.
process.env.HOST = conf.host = process.env.HOST || conf.host;
process.env.PORT = conf.port = process.env.PORT || (conf.enableHTTPS ? conf.HTTPSPort : conf.HTTPPort);

// to generate urls from the rest of the app we need the following info
// urlProtocol, urlPort and urlHost MAY NOT be this process's protocol
// port and host. It might as well be the reverse proxy ones. 
if(conf.usingReverseProxy){
  var proxyOpts = conf.reverseProxyOptions;

  conf.urlProtocol = proxyOpts.secure 
    ? "https"
    : "http";

  conf.urlPort = (proxyOpts.port && parseInt(proxyOpts.port) !== 80) 
    ? proxyOpts.port
    : "";

  conf.urlHost = proxyOpts.host
}else{
  conf.urlProtocol = conf.enableHTTPS
    ? "https"
    : "http";
  conf.urlPort = conf.port
  conf.urlHost = conf.host;
}

var portFragment =  (conf.urlPort === 80 || conf.urlPort === 443)
  ? ''
  : ':' + conf.urlPort;

conf.rootUrl = conf.urlProtocol +"://" + conf.urlHost + portFragment;
conf.rootDir = rootDir;

conf.uploadDir = path.resolve(path.join(conf.rootDir, conf.uploadDir));
conf.pluginDir = path.resolve(path.join(conf.rootDir, conf.pluginDir));

module.exports = conf;
