const zipFile = require('path').resolve(__dirname + '/../assets/samplepresentation.zip')
const pdfFile = require('path').resolve(__dirname + '/../assets/samplepresentation.pdf')

module.exports = {
  'upload zip' : function (browser) {
    const uploadPage = browser.page.upload();

    browser
      .login(browser.globals.users.normalUser.username, browser.globals.users.normalUser.password)
      .page.upload().navigate()
      .waitForElementVisible('body', 500)

    uploadPage
      .assert.elementPresent('@uploadForm')
      .assert.hidden('@uploadDetails')
      .dragAndDropFile(zipFile);

    browser.pause(500);
    uploadPage
      .assert.hidden('@uploadMessage')
      .assert.value('@presentationTitleInput', 'samplepresentation', 'Set title from presentation filename.')
      .click('@uploadBtn');

    browser.page.presentations()
      .waitForElementVisible('@presentationsBody', 5000, 'After the upload it should redirect to the presentations page');
    browser.end();
  },
  'upload pdf' : function (browser) {
    const uploadPage = browser.page.upload();

    browser
      .login(browser.globals.users.normalUser.username, browser.globals.users.normalUser.password);
    
    uploadPage.navigate();
    browser.waitForElementVisible('body', 500);

    uploadPage.dragAndDropFile(pdfFile);
    browser.pause(500);
    uploadPage
      .assert.hidden('@uploadMessage')
      .assert.value('@presentationTitleInput', 'samplepresentation.pdf', 'Set title from presentation filename.')
      .click('@uploadBtn'); 
    browser.page.presentations()
      .waitForElementVisible('@presentationsBody', 5000, 'After the upload it should redirect to the presentations page')
      .assert.elementPresent('@convertingFromPDFLabels', 'Testing if conversion has started')
    browser.end();
  },
  'remove dragged file' : function (browser) {
    const uploadPage = browser.page.upload();

    browser
      .login(browser.globals.users.normalUser.username, browser.globals.users.normalUser.password);
    
    uploadPage.navigate();
    browser.waitForElementVisible('body', 500);
    uploadPage.dragAndDropFile(pdfFile);
    browser.pause(500);
    
    uploadPage.click('@removeFileBtn');
    browser.pause(500);

    uploadPage
      .assert.visible('@uploadMessage')
      .assert.hidden('@uploadDetails');
    browser.end();
  },
};