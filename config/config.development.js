/**
	@fileoverview development configuration file for ASQ
**/

'use strict';

module.exports = {

  //Logging
  //  Available log level options:
  //    "silly"
  //    "debug"
  //    "verbose"
  //    "info"
  //    "warn"
  //    "error"
  log: {
    //application logging
    application: {
      level: "silly",
      file: "log/dev-app.log",
      json: false
    },

    //db error logging (Note: only warn and error make sense for db logging)
    //db logging (Note: only warn and error make sense for db logging)
    db: {
      level: "silly",
      file: "log/dev-db.log",
      json: false
    },

    // sockets logging
    // (Note: sockets only support error, warn, info and debug levels.)
    sockets: {
      level: "info",
      file: "log/dev-soc.log",
      json: false
    }
  },

	dbName: "asq-dev"
}