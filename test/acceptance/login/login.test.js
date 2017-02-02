module.exports = {
  "login with enter" : function (browser) {
    browser
      .page.login().navigate();
    browser
      .page.login().loginUserWithEnterKey('t', 'Tt123456')
      .assert.urlEquals(browser.launchUrl + '/t/')
      .assert.containsText('.navbar-main-nav', 'My Presentations', 'should redirect to the user page')
      .end();
  },
  "login test click" : function (browser) {
    browser
      .page.login().navigate();
    browser
      .page.login().loginUser('t', 'Tt123456')
      .assert.urlEquals(browser.launchUrl + '/t/')
      .assert.containsText('.navbar-main-nav', 'My Presentations', 'should redirect to the user page')
      .end();
  }
};