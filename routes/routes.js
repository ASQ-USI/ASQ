var Account = require('./Account');


function setUp(app) {
  var account = new Account(app);
  account.setUp();

}