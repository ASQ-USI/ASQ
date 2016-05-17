module.exports = {
  "login test enter" : function (browser) {
    console.log(browser.launchUrl)
    browser
      .url(browser.launchUrl + '/login')
      .waitForElementVisible('body', 500)
      .assert.elementPresent('input[name="username"]')
      .assert.elementPresent('input[name="password"]')
      .setValue('input[type=text]', 't')
      .setValue('input[type=password]', ['Tt123456', browser.Keys.ENTER])
      .pause(500)
      .assert.urlEquals(browser.launchUrl + '/t/')
      .assert.containsText('.navbar-main-nav', 'My Presentations')
      .end();
  },
  "login test click" : function (browser) {
    browser
      .url(browser.launchUrl + '/login')
      .waitForElementVisible('body', 500)
      .assert.elementPresent('input[name="username"]')
      .assert.elementPresent('input[name="password"]')
      .setValue('input[type=text]', 't')
      .setValue('input[type=password]', 'Tt123456')
      .click('input[type=submit]')
      .pause(500)
      .assert.urlEquals(browser.launchUrl + '/t/')
      .assert.containsText('.navbar-main-nav', 'My Presentations')
      .end();
  }
};