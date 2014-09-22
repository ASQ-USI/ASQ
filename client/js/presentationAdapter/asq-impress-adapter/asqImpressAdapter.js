/**
*  @fileoverview asqImpressAdapter.js
*  @description  This adapter adds impress.js presentation support to ASQ.
* It can work with or without an impress presenation in the page.
*
*  Released under the MIT and GPL Licenses.
*
* ------------------------------------------------
*  author:  Vasileios Triglianos
*  version: 0.0.1
*  source:  http://github.com/ASQ-USI/asq-impress-adapter/
*
* Based on code from  Bartek Szopka (@bartaz) http://github.com/bartaz/
*
* Impress doesn't allow a lot of control over it's internals. The way this script works
* is by registering listeners for the same events as impress.js and blocking
* subsequent listeners per event type. 
*
* This implementation is based on a representation of steps as an Array of ids. It DOESN'T
* support DOM elements like impress.js to be more lightweight.
*
* We try to match variable nomenclature | function implementation as close to impress.js
* as possible.
*
* IMPORTANT: make sure this script is executed before impress so that the listeneners of the
* adpater are register FIRST.
*
*/


/**
* @param {Object} asqSocket an interface object to the real asq socket.
*/

var debug = require('bows')("asqImpressAdapter")
module.exports = impressAdapter = function(asqSocket, slidesTree){

  function isDebugModeOn(){
    return (("undefined" !== typeof window.debug)? window.debug : false);
  }

  asqSocket.onGoto(function(data){
    if("undefined" === typeof data || data === null){
      debug("data is undefined or null");
      return;
    }
    if("undefined" === typeof data.step || data.step === null){
      debug("data.step is undefined or null");
      return;
    }

    if(typeof impress === 'function'){
      var impressActiveStep = impress().goto(data.step, data.duration)
      // in contrast to impress we return the just the id
      if (impressActiveStep){
          activeStep = impressActiveStep.id
      }
    }else{ //no impress just maintain state
      impressActiveStep = data.step;
    }
  })

  //varnames follow impress
  var activeStep = null;
  var lastHash = "";
  var steps = null;
  if("undefined" !== typeof slidesTree){
    steps = slidesTree
  }else{
    var domsteps = slidesTree || document.querySelectorAll('.step');
    steps = [].slice.call(domsteps).map(function(el, idx){
        //this should be the same as impress.js
        if ( !el.id ) {
          el.id = "step-" + (idx + 1);
        }
        return el.id;
      })
  }

  // `goto` function that moves to step given with `el` parameter (ONLY id),
  // with a transition `duration` optionally given as second parameter.
  var goto = function ( id, duration ) {
    if('string'!== typeof id || steps.indexOf(id) < 0 ){
      return null;
    }

    activeStep = id;

    debug("goto #"+ activeStep);
    asqSocket.emitGoto({step: activeStep, duration: duration})
    return activeStep;
  }

  // `prev` API function goes to previous step (in document order)
  var prev = function () {
    var prev = steps.indexOf( activeStep ) - 1;
    prev = prev >= 0 ? steps[ prev ] : steps[ steps.length-1 ];

    return goto(prev);
  };

  // `next` API function goes to next step (in document order)
  var next = function () {
    var next = steps.indexOf( activeStep ) + 1;
    next = next < steps.length ? steps[ next ] : steps[ 0 ];

    return goto(next);
  };

  // `getElementFromHash` returns an element located by id from hash part of
  // window location.
  var getElementFromHash = function () {
    // get id from url # by removing `#` or `#/` from the beginning,
    // so both "fallback" `#slide-id` and "enhanced" `#/slide-id` will work
    return window.location.hash.replace(/^#\/?/,"");
  };

  var impressEl = document.getElementById('impress');
  if(impressEl){
    impressEl.addEventListener("impress:stepenter", function (event) {
      window.location.hash = lastHash = "#/" + event.target.id;
    }, false);
  }
  
  window.addEventListener("hashchange", function () {
    // When the step is entered hash in the location is updated
    // (just few lines above from here), so the hash change is 
    // triggered and we would call `goto` again on the same element.
    //
    // To avoid this we store last entered hash and compare.
    if (window.location.hash !== lastHash) {
      goto( getElementFromHash() );
    }
  }, false);

  // START 
  // by selecting step defined in url or first step of the presentation
  goto(getElementFromHash() || steps[0], 0);

  document.addEventListener('keydown', function(){
    if(event.target == document.body){
       if ( event.keyCode === 9 || ( event.keyCode >= 32 && event.keyCode <= 34 ) || (event.keyCode >= 37 && event.keyCode <= 40) ) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }
  })

  document.addEventListener('keyup', function(){
    if(event.target == document.body){
      if ( event.keyCode === 9 || ( event.keyCode >= 32 && event.keyCode <= 34 ) || (event.keyCode >= 37 && event.keyCode <= 40) ) {

        event.preventDefault();
        event.stopImmediatePropagation();

        switch( event.keyCode ) {
          case 33: // pg up
          case 37: // left
          case 38: // up
          prev();
          break;
          case 9:  // tab
          case 32: // space
          case 34: // pg down
          case 39: // right
          case 40: // down
          next();
          break;
        }
      }
    }
  },false);

  // delegated handler for clicking on the links to presentation steps
  // in contrast to impress.js this uses id only (for goto)
  document.addEventListener("click", function ( event ) {
    // event delegation with "bubbling"
    // check if event target (or any of its parents is a link)
    var target = event.target;
    while ( (target.tagName !== "A") &&
      (target !== document.documentElement) ) {
      target = target.parentNode;
    } 

    if ( target.tagName === "A" ) {
      var href = target.getAttribute("href");

      // if it's a link to presentation step, target this step
      if ( href && href[0] === '#' ) {
        target = href.slice(1);
      }
    }

    if (typeof target == "string" && goto(target) ) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  }, false);

  // delegated handler for clicking on step elements
  // in contrast to impress.js this uses id only (for goto)
  document.addEventListener("click", function ( event ) {
    var target = event.target;
      // find closest step element that is not active
      while ( !(target.classList.contains("step") && !target.classList.contains("active")) &&
        (target !== document.documentElement) ) {
        target = target.parentNode;
    }
    target = target.id;
    if ( goto(target) ) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  }, false);

  // touch handler to detect taps on the left and right side of the screen
  // based on awesome work of @hakimel: https://github.com/hakimel/reveal.js
  document.addEventListener("touchstart", function ( event ) {
    if (event.touches.length === 1) {
      var x = event.touches[0].clientX,
      width = window.innerWidth * 0.3,
      result = null;

      if ( x < width ) {
        result = prev();
      } else if ( x > window.innerWidth - width ) {
        result = next();
      }

      if (result) {
        event.preventDefault();
      }
    }
  }, false);

  return {
    prev: prev,
    next: next,
    goto: goto
    //createThumb: createThumb
  }
}
