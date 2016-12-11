const zipFile = require('path').resolve(__dirname + '/../assets/samplepresentation.zip');
const testData = {};

module.exports = {
  "Presentations page" : ' '+ function (browser) {
    const presentationsPage = browser.page.presentations();

    browser
      .login(browser.globals.users.normalUser.username, browser.globals.users.normalUser.password);
    
    presentationsPage.navigate();
   
    browser
      .waitForElementVisible('body', 1000);

     presentationsPage.assert.visible('@presentationsBody', 'should be at `presentations` page')
     browser.end();
  },
  'start presentation' : ' '+ function (browser) {
    const presentationsPage = browser.page.presentations();

    browser
      .login(browser.globals.users.normalUser.username, browser.globals.users.normalUser.password)
      .uploadPresentation(zipFile)

    presentationsPage.navigate();

    presentationsPage
      .startFirstPresentation()
      .end();
  },

  // The following tests depending on having an uploaded and started presentation
  'visit beamer view' : ' '+ function (browser) {
    const presentationsPage = browser.page.presentations();

    browser
      .login(browser.globals.users.normalUser.username, browser.globals.users.normalUser.password);

    presentationsPage.navigate();
    
    presentationsPage
      .visitFirstLivePresentationsBeamerView()
      .end();
  },
  'visit cockpit view' : ' '+ function (browser) {
    const presentationsPage = browser.page.presentations();

    browser
      .login(browser.globals.users.normalUser.username, browser.globals.users.normalUser.password);

    presentationsPage.navigate();
    
    presentationsPage
      .visitFirstLivePresentationsCockpitView()
      .end();
  },
  'visit viewer view' : ' '+ function (browser) {
    const presentationsPage = browser.page.presentations();

    browser
      .login(browser.globals.users.normalUser.username, browser.globals.users.normalUser.password);

    presentationsPage.navigate();
    
    presentationsPage
      .visitFirstLivePresentationsViewerView()
      .end();
  },

  'stop presentation' : ' '+ function (browser) {
    const presentationsPage = browser.page.presentations();

    browser
      .login(browser.globals.users.normalUser.username, browser.globals.users.normalUser.password);

    presentationsPage.navigate();
    
    presentationsPage
      .stopFirstLivePresentation()

    presentationsPage
      .assert.containsText('@successAlert', 'Session stopped successfully', "with the correct message")

    browser.end();
  },
  'delete non-live presentation' : function (browser) {
     const presentationsPage = browser.page.presentations();

    browser
      .login(browser.globals.users.normalUser.username, browser.globals.users.normalUser.password);

    presentationsPage.navigate();

    browser.execute(function(){
        return document.querySelectorAll('.thumb:not(.thumb-live)').length;
      }, [], function(res){
        testData.totalNonLivePresentations = res.value
      });
    
    presentationsPage
      .deleteFirstNonLivePresentation()

    browser
      .execute(function(){
        return document.querySelectorAll('.thumb:not(.thumb-live)').length;
      }, [], function(res){
        testData.totalNonLivePresentationsAfter = res.value
        browser.assert.equal(testData.totalNonLivePresentations - testData.totalNonLivePresentationsAfter, 1, 'Presentation should be deleted');
      })
      .end();
  }
};