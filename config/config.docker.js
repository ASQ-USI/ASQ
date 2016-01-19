/**
  @fileoverview example configuration file for ASQ
**/

'use strict';

module.exports = {
  //Server hostname to which clients have to connect (default: '127.0.0.1')
  //Note this is overwritten by the environment HOST value if it exists.
  host: "127.0.0.1",

  //Port used by the server to listen for http requests (default: 80)
  //Note this is overwritten by the environment PORT value if it exists.
  //Nginx is currently tied to port 3000 (hard coded) - Do not change, it is inside the container
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

  // MongoDB
  mongo:{
    // Hostname of the mongoDB server (default: '127.0.0.1')
    host: "mongo",
    // Port used by the mongoDB server (default: 27017)
    port: 27017,
    //username disabled by default Uncomment to enable
    //username: '',
    //password disabled by default. Uncomment to enable
    //password: '',
    // Database name (default: 'asq')
    dbName: "asq",
  },

  // Redis
  redis:{
    // Hostname of the redis server (default: '127.0.0.1')
    host: "redis",
    // Port used by the redis server (default: 6379)
    port: 6379,
  },

  // Reverse Proxy Settings
  // if usingReverseProxy is true, ASQ will the proxy host option for the url 
  // (default: false).  The reverse proxy communicates with ASQ through http
  // requests (enableHTTPS option will be ignored)
  usingReverseProxy: false,

  reverseProxyOptions:{
    // secure: whether the reverse proxy is using http or https (default: true)
    secure: true,
    // host: the host of the reverse proxy (default: 'www.example.com')
    host: 'www.example.com',
    // port: the port of the reverse proxy (default: 443)
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