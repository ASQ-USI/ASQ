const zipFile = require('path').resolve(__dirname + '/../assets/samplepresentation.zip')
const pdfFile = require('path').resolve(__dirname + '/../assets/samplepresentation.pdf')

module.exports = {
  'upload zip' : function (browser) {
    browser
      .loginUser('t', 'Tt123456')
      .url(browser.launchUrl + '/upload/')
      .waitForElementVisible('body', 500)
      .assert.elementPresent('form#le-dropzone')
      .assert.hidden('#upload-details')
      .pause(500)
      .dragAndDropFile(zipFile)
      .pause(500)
      .assert.hidden('.dz-message')
      .assert.value('input[name=title]', 'samplepresentation', 'Set title from presentation filename.')
      .click('button#upload-btn')
      .pause(3000)
      .assert.elementPresent('body[data-view-name="presentations"]')
      .end();
  },
  'upload pdf' : function (browser) {
    browser
      .loginUser('t', 'Tt123456')
      .url(browser.launchUrl + '/upload/')
      .waitForElementVisible('body', 500)
      .assert.elementPresent('form#le-dropzone')
      .assert.hidden('#upload-details')
      .pause(500)
      .dragAndDropFile(pdfFile)
      .pause(500)
      .assert.hidden('.dz-message')
      .assert.value('input[name=title]', 'samplepresentation.pdf', 'Set title from presentation filename.')
      .click('button#upload-btn')
      .pause(3000)
      .assert.elementPresent('body[data-view-name="presentations"]')
      .assert.elementPresent('.thumb-conversion-status-label', 'Testing if conversion has started')
      .end();
  },
  'remove dragged file' : function (browser) {
    browser
      .loginUser('t', 'Tt123456')
      .url(browser.launchUrl + '/upload/')
      .waitForElementVisible('body', 500)
      .dragAndDropFile(zipFile)
      .pause(500)
      .click('a.data-dz-remove')
      .pause(500)
      .assert.visible('.dz-message')
      .assert.hidden('#upload-details')
      .end();
  },
};