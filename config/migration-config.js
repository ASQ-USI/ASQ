const config = require('./index.js').mongo

module.exports = {
  mongoAppDb: {
    host: config.host,
    port: config.port,
    db: config.dbName
  }
}