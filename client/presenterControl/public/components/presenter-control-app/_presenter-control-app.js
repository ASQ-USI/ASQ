var debug = require('bows')("presenter-control-app")
  , EventEmitter2 = require('eventemitter2');

Polymer({

  is: 'presenter-control-app',

  properties: {
    eventBus: {
      type: Object, 
      value: function(){
        return new EventEmitter2({delimiter: ':'});
      },
      notify: true,
      observer: '_eventBusChanged'
    },

    baseUrl: {
      type: String,
      notify: true
    },

    route: {
      type: String,
      notify: true,
      observer: '_routeChanged'
    },

    connection: {
      type: Object, 
      value: function(){
        return null;
      },
      notify: true
    },

    config: {
      type: Object, 
      value: function(){
        return {};
      },
      notify: true
    },

    selectedPath:{
      type: String, 
      value: '/slides'
    },

    model:{
      type: Object,
      value: function(){return {
        users:{
          "viewers": [],
          "presenters" : [],
          "ghosts" : []
          }
        } 
      },
      notify: true
    }
  },

  ready: function(){
    var username = document.body.dataset.asqUsername; 
    var presentationId = document.body.dataset.asqPresentationId; 
    var liveSessionId = document.body.dataset.asqSessionId; 
    this.baseUrl = "/" + username + "/presentations/" + presentationId + "/live/" + liveSessionId +"/";

    this._prevItemIndex = 1
    var c = this.config = this.$.config.values;
    this.$.connection.connect(c.protocol, c.host, c.port, c.liveSessionId, c.namespace, c.token, this.eventBus);
    this.$.presenterControlSlides.connection = this.$.connection;
    window.app = this;
  },

  _menuIconClicked: function(event, detail){
      this.$.drawerPanel.togglePanel();
  },

  _computeUrl: function(baseUrl, path) {
    path = baseUrl +  window.location.search +  "#!" + path ;
    return path.replace('//', '/');
  },

  _computeBeamerUrl: function(c){
    return "//" + c.host + ":" + c.port + "/" + c.username + "/presentations/" + c.presentationId + "/live/" + c.liveSessionId + "/?role=presenter&view=presentation";
  },

  _menuItemDeselected: function(event, detail){
    this._prevItemIndex = event.target.items.indexOf(detail.item);
  },

  _menuItemSelected: function(event, detail){
    var _prevItemIndex = this._prevItemIndex || 1
    this._animateArrow(detail.item)
  },

  _animateArrow: function(target){
     var newIndex =this.$['main-nav-menu'].items.indexOf(target);
     var arrow = this.$.learrow;

     // logarithmic time depending on distance
     var diff = Math.abs(this._prevItemIndex - newIndex)
     var t = (200 - (22 * Math.log(diff))) * diff
     var top = getComputedStyle(arrow).top || "0px"
     var y = parseInt(target.offsetTop + (target.offsetHeight - arrow.offsetHeight) / 2) ||0

    arrow.animate([{"top" : top }, {"top" : y + "px"}], {duration: t, easing: 'ease-out', iterations:1, fill:"forwards"  })
  },

  _routeChanged: function(newVal, oldVal){
    if(newVal == 'slides'){
      this.$.presenterControlSlides.loadIframes();
    }
  },

  _eventBusChanged: function(newVal, oldVal){
    if(! newVal) returnl
      
    this.eventBus.on('asq:session-terminated', function(){
      window.location.replace(this.config.presenterLiveUrl);
    }.bind(this))
  }
});