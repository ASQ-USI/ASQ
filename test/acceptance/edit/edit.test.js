module.exports = {
  "Edit test" : function (browser) {
    browser
      .url(browser.launchUrl)
      .deleteCookies()
      .setCookie({
        name     : "asq.sid",
        value    : "s%3AnOeC1DM45qanW0mw7dFRkG3z.%2BhabCTcXZLaYwVwV775uzRvb%2BjoZ5yZfpjeFVujHqEw",
        path     : "/", 
      })
      .url(browser.launchUrl + "/t/presentations/5422c4d6db974083068cb635/edit/")
      .waitForElementVisible('body', 1000)
      .end();
  }
};