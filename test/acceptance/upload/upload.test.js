var file2Upload = require('path').resolve(__dirname + '/../assets/presentation.zip')

module.exports = {
  'upload test' : function (browser) {
    browser
      .loginUser('t', 'Tt123456')
      .url(browser.launchUrl + '/upload/')
      .waitForElementVisible('body', 500)
      .assert.elementPresent('form#le-dropzone')
      .assert.hidden('#upload-details')
      .pause(500)
      .dragAndDropFile(file2Upload)
      .pause(500)
      .assert.hidden('.dz-message')
      .assert.value('input[name=title]', 'presentation', 'Set title from presentation filename.')
      
      /* triglian: a bug in chrome-webdriver (https://bugs.chromium.org/p/chromedriver/issues/detail?id=915)
       * doesn't pass "application/zip" as the
       * mime type for the upload so the form won't work. Uncomment the next lines
       * when it's fixed. */

      // .click('button#upload-btn')
      // .pause(2000)
      // .assert.containsText('.alert', 'presentation uploaded successfully!')
      .end();
  },
  'remove dragged file' : function (browser) {
    browser
      .loginUser('t', 'Tt123456')
      .url(browser.launchUrl + '/upload/')
      .waitForElementVisible('body', 500)
      .dragAndDropFile(file2Upload)
      .pause(500)
      .click('a.data-dz-remove')
      .pause(500)
      .assert.visible('.dz-message')
      .assert.hidden('#upload-details')
      .end();
  },
};