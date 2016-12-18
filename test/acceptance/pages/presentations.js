module.exports = {
  url: function() {
    return `${this.api.launchUrl}/${this.api.globals.users.normalUser.username}/presentations`;
  },
  elements: {
    presentationsBody: {
      selector: 'body[data-view-name="presentations"]'
    },
    startButtons: {
      selector: 'a.btn-start'
    },
    stopButtons: {
      selector: 'a.btn-stop'
    },
    cockpitViewButtons: {
      selector: 'a.btn-cockpit-view'
    },
    beamerViewButtons: {
      selector: 'a.btn-beamer-view'
    },
    viewerViewButtons: {
      selector: 'a.btn-viewer-view'
    },
    convertingFromPDFLabels: {
      selector: '.thumb-conversion-status-label'
    },
    notLivePresentations: {
      selector: '.thumb:not(.thumb-live)'
    },
    notLivePresentationsRemoveButtons: {
      selector: '.thumb:not(.thumb-live) a.remove'
    },
    successAlert: {
      selector : '.alert-success.alert-dismissible'
    }
  },
  commands: [{
    startFirstPresentation: function(username, password) {
      this
          .waitForElementVisible('@presentationsBody', 1000)
          .click('@startButtons')
          .waitForElementVisible('asq-welcome', 2000, 'Presentation should start')

      return this.api;
    },
    visitFirstLivePresentationsBeamerView: function(username, password) {
      this
          .waitForElementVisible('@presentationsBody', 1000)
          .click('@beamerViewButtons')
          .waitForElementVisible('body[data-asq-role="presenter"]', 2000, 'Should visit the beamer view')

      return this.api;
    },
    visitFirstLivePresentationsCockpitView: function(username, password) {
      this
          .waitForElementVisible('@presentationsBody', 1000)
          .click('@cockpitViewButtons')
          .waitForElementVisible('cockpit-asq', 2000, 'Should visit the cockpit view')

      return this.api;
    },
    visitFirstLivePresentationsViewerView: function(username, password) {
      this
          .waitForElementVisible('@presentationsBody', 1000)
          .click('@viewerViewButtons')
          .waitForElementVisible('body[data-asq-role="viewer"]', 2000, 'Should visit the viewer view')

      return this.api;
    },
    stopFirstLivePresentation: function(username, password) {
      this
          .waitForElementVisible('@presentationsBody', 1000)
          .click('@stopButtons')
          .waitForElementVisible('@successAlert', 1000, 'Presentation should stop')

      return this.api;
    },
    deleteFirstNonLivePresentation: function(username, password) {
      this
          .waitForElementVisible('@presentationsBody', 1000)
          .moveToElement('@notLivePresentations', 10, 10)
          .waitForElementVisible('@notLivePresentationsRemoveButtons', 500)
          .click('@notLivePresentationsRemoveButtons');
        
      this.api.acceptAlert();
      this.api.pause(500)

      return this.api;
    },
  }]
};