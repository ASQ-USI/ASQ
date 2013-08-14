/**
  @fileoverview steup loggers
**/

var winston = require('winston');

 //
  // Configure the logger for `category1`
  //
  winston.loggers.add('application', {
    console: {
      colorize: 'true',
      label: 'category one'
    },
    file: {
      filename: './log/app.log'
    }
  });

  //
  // Configure the logger for `category2`
  //
  winston.loggers.add('db', {
    console: {
      colorize: 'true',
      label: 'category one'
    },
    file: {
      filename: './log/db.err.log'
    }
  });