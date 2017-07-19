module.exports = {
  url: function() {
    return `${this.api.launchUrl}/login`;
  },
  elements: {
    asqWelcome: {
      selector: 'asq-welcome'
    },
    impressEl: {
      selector: '#impress'
    },
    submit: {
      selector: 'input[type=submit]'
    }
  },
  commands: [{
    clickPresentationElement: function(){
      this.click('@impressEl');
      return this.api;
    },
    goToNext: function() {
      this.api
        .keys([this.api.Keys.RIGHT_ARROW])
        .pause(3000)

      return this.api;
    },
    goToPrev: function() {
      this.api
        .keys([this.api.Keys.LEFT_ARROW])
        .pause(3000)

      return this.api;
    },
  }]
};