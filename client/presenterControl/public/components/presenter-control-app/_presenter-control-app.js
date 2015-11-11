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
      notify: true
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
    this._prevItemIndex = 1
    var c = this.config = this.$.config.values;
    this.$.connection.connect(c.protocol, c.host, c.port, c.liveSessionId, c.namespace, c.token, this.eventBus);
    this.$.presenterControlSlides.connection = this.$.connection;

    //set correct menu-item
    var hash = window.location.hash
    var paths = Polymer.dom(this.root).querySelectorAll('main-nav-item').map(function(el){
      if(hash == ('#!'+ el.path)){
        this.selectedPath = el.path;
        return true;
      }
      return false;
    }.bind(this))

    setTimeout(function(){
      this._animateArrow(this.$['main-nav-menu'].selectedItem);
    }.bind(this),100)

  },

  _menuIconClicked: function(event, detail){
      this.$.drawerPanel.togglePanel();
  },

  _computeUrl: function(path, params) {
    var params = params ? JSON.parse(params) : {};
    return MoreRouting.urlFor(path, params);
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
     var diff = Math.abs(this.prevItemIndex - newIndex)
     var t = (200 - (22 * Math.log(diff))) * diff
     var top = getComputedStyle(arrow).top || "0px"
     var y = parseInt(target.offsetTop + (target.offsetHeight - arrow.offsetHeight) / 2) ||0

    arrow.animate([{"top" : top }, {"top" : y + "px"}], {duration: t, easing: 'ease-out', iterations:1, fill:"forwards"  })
  }
});