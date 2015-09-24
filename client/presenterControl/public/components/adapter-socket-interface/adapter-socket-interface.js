/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var debug = __webpack_require__(1)("adapter-socket-interface");
	
	Polymer({
	
	  is: 'adapter-socket-interface', 
	
	  properties: {
	    socket: {
	      type: Object,
	      value: function() { return null;},
	      observer: 'socketChanged'
	    }
	  },
	
	  bounce : false,
	
	  ready : function(){
	    this.cbs = [];
	  },
	
	  socketChanged : function(newSocket, oldSocket){
	    if(newSocket){
	      newSocket.on("asq:goto", function onSocketGoto(evt){
	        debug("Reveived goto event:", evt);
	        this.onGotoReceived(evt);
	      }.bind(this));
	    }
	  },
	
	  setBounce: function(val){
	    this.bounce = !! val;
	  },
	
	  onGotoReceived : function(evt){
	    for(var i = 0, l = this.cbs.length; i<l; i++){
	      //don't let one bad function affect the rest of them
	      try{
	        this.cbs[i].call(null, evt.data);
	      }catch(err){
	        debug(err.toString() + err.stack);
	      }
	    }
	  },
	
	  onGoto :function(cb){
	    if("function" !== typeof cb){
	      throw new Error("cb should be a function")
	    }
	    this.cbs.push(cb)
	  },
	
	  offGoto :function(cb){
	    if("function" !== typeof cb){
	      throw new Error("cb should be a function")
	    }
	    var index = this.cbs.indexOf(cb);
	
	    if (index > -1) {
	        this.cbs.splice(index, 1);
	    }
	  },
	
	  emitGoto : function(data){
	    debug("Emitting goto data:", data);
	    this.socket.emit('asq:goto', {
	      data : data
	    });
	    debug("Data was emitted:");
	  },
	
	  bounceGoto : function(data){
	    debug("Bouncing goto data:", data);
	    this.onGotoReceived({data : data });
	    debug("Data was bounced:");
	  }
	});


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	(function() {
	  function checkColorSupport() {
	    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
	      return false;
	    }
	    var chrome = !!window.chrome,
	        firefox = /firefox/i.test(navigator.userAgent),
	        firefoxVersion;
	
	    if (firefox) {
	        var match = navigator.userAgent.match(/Firefox\/(\d+\.\d+)/);
	        if (match && match[1] && Number(match[1])) {
	            firefoxVersion = Number(match[1]);
	        }
	    }
	    return chrome || firefoxVersion >= 31.0;
	  }
	
	  var yieldColor = function() {
	    var goldenRatio = 0.618033988749895;
	    hue += goldenRatio;
	    hue = hue % 1;
	    return hue * 360;
	  };
	
	  var inNode = typeof window === 'undefined',
	      ls = !inNode && window.localStorage,
	      debugKey = ls.andlogKey || 'debug',
	      debug = ls[debugKey],
	      logger = __webpack_require__(2),
	      bind = Function.prototype.bind,
	      hue = 0,
	      padLength = 15,
	      noop = function() {},
	      colorsSupported = ls.debugColors || checkColorSupport(),
	      bows = null,
	      debugRegex = null,
	      invertRegex = false,
	      moduleColorsMap = {};
	
	  if (debug && debug[0] === '!' && debug[1] === '/') {
	    invertRegex = true;
	    debug = debug.slice(1);
	  }
	  debugRegex = debug && debug[0]==='/' && new RegExp(debug.substring(1,debug.length-1));
	
	  var logLevels = ['log', 'debug', 'warn', 'error', 'info'];
	
	  //Noop should noop
	  for (var i = 0, ii = logLevels.length; i < ii; i++) {
	      noop[ logLevels[i] ] = noop;
	  }
	
	  bows = function(str) {
	    var msg, colorString, logfn;
	    msg = (str.slice(0, padLength));
	    msg += Array(padLength + 3 - msg.length).join(' ') + '|';
	
	    if (debugRegex) {
	        var matches = str.match(debugRegex);
	        if (
	            (!invertRegex && !matches) ||
	            (invertRegex && matches)
	        ) return noop;
	    }
	
	    if (!bind) return noop;
	
	    var logArgs = [logger];
	    if (colorsSupported) {
	      if(!moduleColorsMap[str]){
	        moduleColorsMap[str]= yieldColor();
	      }
	      var color = moduleColorsMap[str];
	      msg = "%c" + msg;
	      colorString = "color: hsl(" + (color) + ",99%,40%); font-weight: bold";
	
	      logArgs.push(msg, colorString);
	    }else{
	      logArgs.push(msg);
	    }
	
	    if(arguments.length>1){
	        var args = Array.prototype.slice.call(arguments, 1);
	        logArgs = logArgs.concat(args);
	    }
	
	    logfn = bind.apply(logger.log, logArgs);
	
	    logLevels.forEach(function (f) {
	      logfn[f] = bind.apply(logger[f] || logfn, logArgs);
	    });
	    return logfn;
	  };
	
	  bows.config = function(config) {
	    if (config.padLength) {
	      padLength = config.padLength;
	    }
	  };
	
	  if (true) {
	    module.exports = bows;
	  } else {
	    window.bows = bows;
	  }
	}).call();


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	// follow @HenrikJoreteg and @andyet if you like this ;)
	(function () {
	    var inNode = typeof window === 'undefined',
	        ls = !inNode && window.localStorage,
	        out = {};
	
	    if (inNode) {
	        module.exports = console;
	        return;
	    }
	
	    var andlogKey = ls.andlogKey || 'debug'
	    if (ls && ls[andlogKey] && window.console) {
	        out = window.console;
	    } else {
	        var methods = "assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),
	            l = methods.length,
	            fn = function () {};
	
	        while (l--) {
	            out[methods[l]] = fn;
	        }
	    }
	    if (true) {
	        module.exports = out;
	    } else {
	        window.console = out;
	    }
	})();


/***/ }
/******/ ]);
//# sourceMappingURL=adapter-socket-interface.js.map