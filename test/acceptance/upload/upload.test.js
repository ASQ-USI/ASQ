var uploadFile = require('path').resolve(__dirname + '/../assets/test.zip')

module.exports = {
  "upload test" : function (browser) {
    browser
      .url(browser.launchUrl)
      .deleteCookies()
      .setCookie({
        name     : "asq.sid",
        value    : "s%3AnOeC1DM45qanW0mw7dFRkG3z.%2BhabCTcXZLaYwVwV775uzRvb%2BjoZ5yZfpjeFVujHqEw",
        path     : "/", 
      })
      .url(browser.launchUrl + '/upload')
      .waitForElementVisible('body', 500)
      .assert.elementPresent('input#lefile')
      .pause(500)
      .setValue('input#lefile', uploadFile)
      .click('button[type=submit]')
      .pause(2000)
      .assert.containsText('.alert', 'test.zip uploaded successfully!')
      .end();
  },
};