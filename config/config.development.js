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
      file: "log/app.log",
      json: true
    },

    //db error logging (Note: only warn and error make sense for db logging)
    db: {
      level: "silly",
      file: "log/db.err.log",
      json: false
    }
  },

	dbName: "asq-dev"
}