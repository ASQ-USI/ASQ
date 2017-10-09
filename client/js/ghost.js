/**
 @fileoverview Socket code for the viewer client.
 */

/** Connect back to the server with a websocket */

'use strict';

var debug = require('bows')("viewer")
  , $ = require('jquery')
  , Hammer = require('hammerjs')
  , manager = require('asq-visualization').Manager()
  , connection = require('./connection.js')
  , EventEmitter2 = require('eventemitter2')
  , elements = require('./elements.js')
  , eventBus = new EventEmitter2({delimiter: ':',  maxListeners: 100})
  , $body, userId;

function assert(expected, actual, errorMsg){
  if(expected !== actual ){
    throw new Error(errorMsg || 'error');
  }
  return true;
}

function isString(val){
  return typeof val === 'string';
}

function isEmpty(val){
  return !val;
}

// Save current question id;
var questionId = null, socket, session;
var client = null;


this.init = function(event) {

  //let asq-elements get their eventEmitter instance
  var event = new CustomEvent('asq-ready', { 'detail': {asqEventBus : eventBus} });
  document.dispatchEvent(event);

  this.userId = document.body.dataset.asqUserSessionId;

  var si = this.readSessionInfo()
  eventBus.emit('asq:sessionInfo', si);
  this.setupASQElements(si.role);

  this.connect();
  this.initPresentationFramework(si.presentationFramework);

  this.subscribeToEvents();

}

this.readSessionInfo = function(){
  var body = document.body;
  var si = {};
  si.protocol  = this.protocol  = window.location.protocol;
  si.host      = this.host      = body.dataset.asqHost;
  si.port      = this.port      = parseInt(body.dataset.asqPort);
  si.liveUrl   = this.liveUrl   = body.dataset.asqLiveUrl;
  si.sessionId = this.sessionId = body.dataset.asqSessionId;
  si.role      = this.role      = body.dataset.asqRole;
  si.namespace = this.namespace = body.dataset.asqSocketNamespace;
  si.presentationFramework  = this.presentationFramework  = body.dataset.presentationFramework;
  si.presentationViewerUrl  = this.presentationViewerUrl  = body.dataset.asqPresentationViewerUrl;

  assert(true, (isString(si.protocol) && !!si.protocol)
    , 'protocol is required');
  assert(true, (isString(si.host) && !!si.host)
    , 'host is required');
  assert(true, (si.port > 0)
    , 'port is required');
  assert(true, (isString(si.sessionId) && !!si.sessionId)
    , 'sessionId is required');
  assert(true, (isString(si.role) && !!si.role)
    , 'role is required');
  assert(true, (isString(si.namespace) && !!si.namespace)
    , 'namespace is required');
  assert(true, (isString(si.presentationFramework) && !!si.presentationFramework)
    , 'presentationFramework is required');
  
  return si;
}

this.connect = function(){
  var events2Forward = [
    "asq:sessionFlow",
    "asq:folo-connected",
    "asq:ctrl-connected",
    "asq:ghost-connected",
    "asq:connected-clients",
    "asq:answered-all",
    "asq:user-session-stats",
    "asq:rankings",
    "asq:goto",
    "asq:submitted",
    "asq:assessment",
    "asq:assess",
    "asq:stat",
    "asq:question_type",
    "asq:session-terminated",
    'asq:update_live_presentation_settings',
    "asq-plugin",
    "asq:live-app",
  ];
  connection.addEvents2Forward(events2Forward);
  connection.connect(this.protocol, this.host, this.port, this.sessionId, this.namespace, eventBus);
}

this.setupASQElements = function(role) {
  assert(true, (isString(role) && !!role), 'role should be a non empty string');
  elements.setRole(role);
}

this.subscribeToEvents= function (){
  
  //socket events
  eventBus
  .on('socket:connect', function(evt){
    connection.socket.emit('asq:viewer', {
      session : this.session,
      mode : this.mode
    });
    debug.log('connected to ASQ server')
    // TODO: update connected viewers text
  })
  .on('socket:connect_error', function(evt){
    console.log('error connecting to server');
    debug.log(evt)
  })
  .on('socket:error', function(evt){
    console.log('socket error');
    debug.log(evt)
  })
  .on('asq:sessionFlow', function(evt) {
    // this.sessionFlow = evt.sessionFlow
    // asi.setBounce (that.sessionFlow == 'self')
  }.bind(this));

  // Live App Events
  document.addEventListener('live-app', function(evt){
    const normalizedEvent = Polymer.dom(evt);
    if (normalizedEvent.localTarget.tagName == "ASQ-LIVE-APP"){
      connection.socket.emit('live-app', evt.detail);
    }
  });
}

var webComponentsSupported = (
  'registerElement' in document
  && 'import' in document.createElement('link')
  && 'content' in document.createElement('template')
);

if (!webComponentsSupported) {
  document.addEventListener("WebComponentsReady", this.init.bind(this));
}else{
  this.init();
}

this.initPresentationFramework = function(presentationFramework){
  try{
    switch(presentationFramework){
      case 'impress.js':
        require.ensure([], function(){
          var adapter = require('impress-asq-fork-asq-adapter');
          this.initImpress(adapter);
        }.bind(this))
        break;

      case 'reveal.js':
        require.ensure([], function(){
          var adapter = require('./reveal-asq-fork-asq-adapter.js')
         this.initReveal(adapter);
        }.bind(this))
        break;

      case 'none':
        break;

      default:
        throw new Error('unknown presentationFramework ' + presentationFramework);
    }
  }catch(err){
    debug(err.toString + err.stack)
  }
}

this.initImpress = function(adapter){
  //init presentation adapter
  try{
    var offset = getUrlVars().offset || 0
    // var bounce = (that.sessionFlow == 'self') //used so that goto events are fast on self mode
    var asi = require('./presentationAdapter/adapterSocketInterface')(connection.socket);
    adapter.adapter(asi, null, false, offset);
    var impress = require('./impress-asq');
    impress().init();
  }catch(err){
    debug(err.toString + err.stack)
  }
}

this.initReveal = function(adapter){
  //init presentation adapter
  try{
    var offset = getUrlVars().offset || 0;
    // var bounce = (that.sessionFlow == 'self') //used so that goto events are fast on self mode
    var asi = require('./presentationAdapter/adapterSocketInterface')(connection.socket);
    adapter(asi, null, false, offset);
  }catch(err){
    debug(err.toString + err.stack)
  }
}

this.optimizeForMobile = function(){
  var hammertime = new Hammer(document.body, {
    // domEvents: true,
    preventDefault: true,
    dragLockToAxis: true,
    dragBlockHorizontal: true,
    dragBlockVertical: true
  });

  //prevent touchmove
  document.addEventListener('touchmove', function(evt){
    evt.preventDefault();
  })

  hammertime
  .on('swipeleft', function(evt) {
      impress().next();
  }).on('swiperight', function(evt) {
      impress().prev();
  });
}

this.setupNickname = function(){
    var setPlayerName = function(){
    var name = document.getElementById("playername").value;
    if(name.trim() === '')return;
    connection.emit('asq:change-screenname', {value: name.trim()});
  }

  $('#a').submit(function(evt){
    evt.preventDefault();
    setPlayerName();
  })

  $('#start-btn').on('click', function(evt){
    evt.preventDefault();
    setPlayerName();
  });
}

function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}


