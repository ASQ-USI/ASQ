/**
	@fileoverview configuration file for ASQ
	@author Jacques DAFFLON jacques.dafflon@gmail.com
**/

module.exports = {
	//Server hostname to which clients have to connect (default: '127.0.0.1')
	//Note this is overwritten by the environment HOST value if it exists.
	host: "127.0.0.1",

	//Port used by the server to listen for http requests (default: 80)
	//Note this is overwritten by the environment HOST value if it exists.
	HTTPPort: 3000,

	//Port used by the server to listen for https requests (default: 443)
	//Note this is overwritten by the environment HOST value if it exists.
	HTTPSPort: 3443,

	//Clients limit (default: 50)
	clientsLimit: 50,

	//HTTPS Settings
	//Enable HTTPS (default: true)
	enableHTTPS: true,
	//Key path needed for HTTPS (default: './ssl/server.key')
	keyPath: "./ssl/server.key",
	//Cert path needed for HTTPS (default: './ssl/server.crt')
	certPath: "./ssl/server.crt",
	//CA path needed for HTTPS (default: './ssl/ca.crt')
	caPath: "./ssl/ca.crt",
	//Request a certificate for HTTPS (default: true)
	requestCert: false,
	//Reject unauthorized requests for HTTPS (default: false)
	rejectUnauthorized: false,

	//MongoDB
	//Hostname of the mongoDB server (default: '127.0.0.1')
	mongoDBServer: "127.0.0.1",
	//Port used by the mongoDB server (default: 27017)
	mongoDBPort: 27017,
	//Databse name (default: 'asq')
	dbName: "asq",

	dev: {
		dbName: "asq-dev"
	}
}