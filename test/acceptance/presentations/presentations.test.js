module.exports = {
  "Presentation test" : function (browser) {
    browser
      .url(browser.launchUrl)
      .deleteCookies()
      .setCookie({
        name     : "asq.sid",
        value    : "s%3AnOeC1DM45qanW0mw7dFRkG3z.%2BhabCTcXZLaYwVwV775uzRvb%2BjoZ5yZfpjeFVujHqEw",
        path     : "/", 
      })
      .url(browser.launchUrl + "/t/presentations/")
      .waitForElementVisible('body', 1000)
      .assert.elementPresent(".thumb-container")
      .assert.cssClassNotPresent(".thumb-container > .flipbox", "flipped")
      .click(".thumb-container")
       .pause("500")
      .assert.cssClassPresent(".thumb-container > .flipbox", "flipped")
      .end();
  }
};