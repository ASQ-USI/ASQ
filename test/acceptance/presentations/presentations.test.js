module.exports = {
  "Presentation test" : function (browser) {
    browser
      .url(browser.launchUrl + '/login')
      .waitForElementVisible('body', 500)
      .assert.elementPresent('input[name="username"]')
      .assert.elementPresent('input[name="password"]')
      .setValue('input[type=text]', 't')
      .setValue('input[type=password]', ['Tt123456', browser.Keys.ENTER])
      .pause(1000)
      .url(browser.launchUrl + "/t/presentations/")
      .waitForElementVisible('body', 1000)
      .assert.elementPresent(".thumb")
      .end();
  }
};