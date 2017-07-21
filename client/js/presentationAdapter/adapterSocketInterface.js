/**
	*  @fileoverview adapterSocketInterface.js
	*  @description  provides presentation adapters with methods to interface
	* with ASQ sockets
	*
	*/


/**
	* @param {Object} asqSocket the client side asq socket
	*/

module.exports = function(asqSocket, bounce){
  bounce = bounce || false
  var debug = __webpack_require__(/*! bows */ 2)("adapterSocketInterface")
  var goto_cbs = [];
	var addSlide_cbs = [];

	asqSocket.on("asq:goto", function onSocketGoto(evt){
		debug("Reveived goto event:", evt);
		onGotoReceived(evt);
	});

	asqSocket.on("asq:addSlide", function onSocketAddSlide(evt){
		debug("Reveived addSlide event:", evt);
		onAddSlideReceived(evt);
	});


  var setBounce =  function(val){
    bounce = !! val;
  }

  var onGotoReceived = function(evt){
    for(var i=0, l=goto_cbs.length; i<l; i++){
      //don't let one bad function affect the rest of them
      try{
        goto_cbs[i].call(null, evt.data);
      }catch(err){
        debug(err.toString() + err.stack);
      }
    }
  }

	var onAddSlideReceived = function(evt) {
		for(var i=0, l=addSlide_cbs.length; i<l; i++){
			//don't let one bad function affect the rest of them
			try{
				addSlide_cbs[i].call(null, evt.data);
			}catch(err){
				debug(err.toString() + err.stack);
			}
		}
	}


  var onGoto = function(cb){
    if("function" !== typeof cb){
      throw new Error("cb should be a function")
    }
    goto_cbs.push(cb)
  }

	var onAddSlide = function(cb) {
		if("function" !== typeof cb){
			throw new Error("cb should be a function")
		}
		addSlide_cbs.push(cb);
	}

  var emitGoto = function(data){
    debug("Emitting goto data:", data);
    asqSocket.emit('asq:goto', {
      data : data
    });
    debug("Data was emitted:");
  }

  var bounceGoto = function(data){
    debug("Bouncing goto data:", data);
    onGotoReceived({data : data });
    debug("Data was bounced:");
  }

  return {
    setBounce : setBounce,
    onGoto : onGoto,
    emitGoto: (bounce? bounceGoto: emitGoto),
		onAddSlide : onAddSlide
		}
  }
