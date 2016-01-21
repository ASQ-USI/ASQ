var config = require('./index.js')

module.exports = {
  dbSettings: {
    host: config.host,
    port: config.port,
    db: config.dbName
  }
}