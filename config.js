/**
	@fileoverview configuration file for ASQ
	@author Jacques DAFFLON jacques.dafflon@gmail.com
**/

//Server hostname to which clients have to connect (default: '127.0.0.1')
//Note this is overwritten by the environment HOST value if it exists.
module.exports.host = '127.0.0.1';

//Port used by the server to listen for web requests (default: 443)
//By default HTTP uses port 80 and HTTPS uses port 443
//Note this is overwritten by the environment HOST value if it exists.
module.exports.port = 3443;

//Clients limit (default: 50)
module.exports.clientsLimit = 50;

//HTTPS Settings
//Enable HTTPS (default: true)
module.exports.enableHTTPS = true;
//Key path needed for HTTPS (default: './ssl/server.key')
module.exports.keyPath = './ssl/server.key';
//Cert path needed for HTTPS (default: './ssl/server.crt')
module.exports.certPath = './ssl/server.crt';
//CA path needed for HTTPS (default: './ssl/ca.crt')
module.exports.caPath = './ssl/ca.crt';
//Request a certificate for HTTPS (default: true)
module.exports.requestCert = true;
//Reject unauthorized requests for HTTPS (default: false)
module.exports.rejectUnauthorized = false;

//MongoDB
//Hostname of the mongoDB server (default: '127.0.0.1')
module.exports.mongoDBServer = '127.0.0.1';
//Port used by the mongoDB server (default: 27017)
module.exports.mongoDBPort = 27017;
//Databse name (default: 'asq')
module.exports.dbName = 'asq';


//DO NOT MODIFY
//Used for permanent storage of client sessions
module.exports.sessionStore = {};
module.exports.setSessionStore = function (aSessionStore) { module.exports.sessionStore = aSessionStore; }
module.exports.rootPath = "";
module.exports.setRootPath = function (path) { module.exports.rootPath = path; }




