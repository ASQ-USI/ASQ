exports.command = function(username, password, callback) {
  var browser = this;

  browser
     .url(browser.launchUrl + '/login')
     .waitForElementVisible('body', 500)
     .setValue('input[type=text]', username)
     .setValue('input[type=password]', [password, browser.Keys.ENTER])
     .pause(500);

  return this;
};
