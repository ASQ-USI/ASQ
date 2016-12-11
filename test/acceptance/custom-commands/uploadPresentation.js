exports.command = function(zipFile) {
  var browser = this;

  browser
     .url(browser.launchUrl + '/upload/')
     .waitForElementVisible('body', 500)
     .dragAndDropFile(zipFile)
     .click('button#upload-btn')
     .pause(3000)

  return this;
};
