const zipFile = require('path').resolve(__dirname + '/../assets/samplepresentation.zip');
const testData = {};
let beamerUrl, beamerWindow;
const presenter = 'presenter';
let viewerUrl, viewerWindow;
const viewer = 'viewer';


module.exports = {
  before : function(browser) {
    browser
      .login('t', 'Tt123456')
      .url(browser.launchUrl + '/t/presentations/')
      .waitForElementVisible('body', 500)
      .execute(function(){
        const bUrl = document.querySelector('.thumb-live  .btn-beamer-view').href;
        const vUrl = document.querySelector('.thumb-live  .btn-viewer-view').href;
        return {
          beamerUrl : bUrl,
          viewerUrl : vUrl
        }
      }, [null], function(result){
        beamerUrl = result.value.beamerUrl;
        viewerUrl = result.value.viewerUrl;
      }.bind(this))
      // perform is needed otherwise the array arguments or execute
      // are sealed to their initial values
      .perform(function(done){
        browser.execute(function (url, title) {
            window.open(url, title, 'height=1024,width=768');
          }, [beamerUrl, presenter], done);
      })
      .perform(function(done){
        browser.execute(function (url, title) {
            window.open(url, title, 'height=1024,width=768');
        }, [viewerUrl, viewer], done)
      }).window_handles(function(result) {
        beamerWindow = result.value[1];
        viewerWindow = result.value[2];
        // wait until presenter and viwer are initialized
        browser
          .switchWindow(beamerWindow)
          .waitForPresentationInitialized(5000)
          .switchWindow(viewerWindow)
          .waitForPresentationInitialized(5000);
      });
  },
  'can navigate the presentation' : function (browser) {
    browser
      .switchWindow(beamerWindow)
      .waitForElementVisible('asq-welcome', 10000)
      .execute(function(data){
        const steps = document.querySelectorAll('.step');
        return [...steps].map(step => step.id);
      }, [null], function(res){
        testData.stepIds = res.value;
      })
      .click('#impress')
      .keys([browser.Keys.RIGHT_ARROW])
      .pause(1100)
      .url(function(result){
        const url = result.value
        browser.assert.equal(url.endsWith(`#/${testData.stepIds[1]}`), true, 
          'Pressing the left arrow key should navigate the presenter to the second slide')
      })
      .switchWindow(viewerWindow)
      .url(function(result){
        const url = result.value
        browser.assert.equal(url.endsWith(`#/${testData.stepIds[1]}`), true, 
          'Pressing the left arrow key should navigate the viewer to the second slide')
      })
      .switchWindow(beamerWindow)
      .keys([browser.Keys.LEFT_ARROW])
      .pause(500)
      .keys([browser.Keys.LEFT_ARROW])
      .pause(1100)
      .url(function(result){
        const url = result.value
        browser.assert.equal(url.endsWith(`#/${testData.stepIds[testData.stepIds.length -1]}`), true, 
          'Pressing the left arrow key twice should navigate the presenter to the last slide')
      })
      .switchWindow(viewerWindow)
      .url(function(result){
        const url = result.value
        browser.assert.equal(url.endsWith(`#/${testData.stepIds[testData.stepIds.length -1]}`), true, 
          'Pressing the left arrow key twice should navigate the viewer to the last slide')
      })
      .end();
  },
};