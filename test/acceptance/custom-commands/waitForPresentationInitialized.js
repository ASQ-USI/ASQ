const util = require('util');
const events = require('events');

function WaitForPresentationInitialized(){
  events.EventEmitter.call(this);
  this.completed = false;
  this.startTimer = null;
  this.cb = null;
  this.ms = null;
  this.expectedValue = 'initilialized';
  this.abortOnFailure = typeof this.client.api.globals.abortOnAssertionFailure == 'undefined' || this.client.api.globals.abortOnAssertionFailure;
}

util.inherits(WaitForPresentationInitialized, events.EventEmitter);

/**
 * Waits a given time in milliseconds for the prsentation to be initialized in the page before performing any other commands or assertions.
 *
 * If the presentation fails to be initialized in the specified amount of time, the test fails. You can change this by setting `abortOnFailure` to `false`.
 *
 * You can specify a default timeout  by defining a global `waitForConditionTimeout` property (in milliseconds) as a global property in your `nightwatch.json` or in your external globals file.
 *
 * The custom message always is last and the callback is always before the message or last if a message is not passed.
 *
 * The first argument is always the time in milliseconds. 
 *
 * The third argument is abortOnFailure: this can overwrite the default behaviour of aborting the test if the condition is not met within the specified time
 *
 * Some of the multiple usage possibilities:
 * ---------------------------------------------------------------------------
 * - with no arguments; in this case a global default timeout is expected
 *  waitForPresentationInitialized();
 *
 * - with a global default timeout and a callback
 *  waitForPresentationInitialized(function() {});
 *
 * - with a global default timeout, a callback and a custom message
 *  waitForPresentationInitialized(function() {}, 'test message');
 *
 * - with only the timeout
 *  waitForPresentationInitialized(500);
 *
 * - with a timeout and a custom message
 *  waitForPresentationInitialized(500, 'test message);
 *
 * - with a timeout and a callback
 *  waitForPresentationInitialized(500, function() { .. });
 *
 * - with a timeout and a custom abortOnFailure
 *  waitForPresentationInitialized(500, true);
 *
 * - with a timeout, a custom abortOnFailure and a custom message
 *  waitForPresentationInitialized(500, true, 'test message');
 *
 * - with a timeout, a custom abortOnFailure and a callback
 *  waitForPresentationInitialized(500, true, function() { .. });
 *
 * - with a timeout, a custom abortOnFailure, a callback and a custom message
 *  waitForPresentationInitialized(500, true, function() { .. }, 'test message');
 *
 *
 * @param {number|function|string} milliseconds
 * @param {function|boolean|string|number} callbackOrAbort
 * @returns {waitForPresentationInitialized}
 */
WaitForPresentationInitialized.prototype.command = function commandFn(milliseconds, callbackOrAbort) {
  this.startTimer = new Date().getTime();
  this.ms = this.setMilliseconds(milliseconds);

  if (typeof arguments[0] === 'function') {
     ////////////////////////////////////////////////
     // The command was called with an implied global timeout:
     //
     // WaitForPresentationInitialized(function() {});
     // WaitForPresentationInitialized(function() {}, 'custom message');
     ////////////////////////////////////////////////
     this.cb = arguments[0];
   } else if (typeof arguments[1] === 'boolean') {
     ////////////////////////////////////////////////
     // The command was called with a custom abortOnFailure:
     //
     // WaitForPresentationInitialized(500, false);
     ////////////////////////////////////////////////
     this.abortOnFailure = arguments[1];

     // The optional callback is the 3rd argument now
     this.cb = arguments[2] || function() {};
   } else {
     // The optional callback is the 3th argument now
     this.cb = (typeof callbackOrAbort === 'function' && callbackOrAbort) || function() {};
   }

  // support for a custom message
  this.message = null;
  if (arguments.length > 1) {
    var lastArgument = arguments[arguments.length - 1];
    if (typeof lastArgument === 'string') {
      this.message = lastArgument;
    }
  }

  this.checkPresentation();
}

/**
 * Will fail the test if `this.ms` milliseconds elapse
 */
WaitForPresentationInitialized.prototype.countdown = function() {
  setTimeout(() => {
    const defaultMsg = `Timed out while waiting presentation to be initialized for ${this.ms} milliseconds.`;
    this.fail(null, 'not initialized', this.expectedValue, defaultMsg);
  }, this.ms);
};

/**
 * Checks if the presentation has been initialized. If it hasn'et
 * it will add listener for the init event and then notify. It also
 * starts the countdown.
 */
WaitForPresentationInitialized.prototype.checkPresentation = function(){
  this.countdown();
  this.client.api.timeoutsAsyncScript(this.ms);

  this.client.api
    .executeAsync(function(data, done){
      console.log(document.body.classList)
      if(! document.body.classList.contains('impress-enabled')){
          document.addEventListener('impress:init', function(){
            done(true);
          })
        }else{
          done(true);
        } 
      }, [null], function(result){
         if (result.status === 0 && result.value === true) {
          // presentation has  initialized
          const now = new Date().getTime();
          const timeMs = now - this.startTimer;
          const defaultMsg = `Presentation was initialized after ${timeMs} milliseconds.`; 
          return this.pass(result, defaultMsg);
        }

        if (result.status === -1) {
          const defaultMsg = `There was an error.`; 
          console.log(result)
          return this.fail(result, 'unknown error', this.expectedValue, defaultMsg);
        }

    }.bind(this));
}

WaitForPresentationInitialized.prototype.complete = function() {
  var args = Array.prototype.slice.call(arguments, 0);
  args.push(this);
  this.cb.apply(this.client.api, args);
  this.emit('complete');
  return this;
};

WaitForPresentationInitialized.prototype.pass = function(result, defaultMsg) {
  if(this.completed) return;

  this.completed = true;
  this.message = this.message || defaultMsg;
  this.client.assertion(true, null, null, this.message, this.abortOnFailure);
  return this.complete(result);
};

WaitForPresentationInitialized.prototype.fail = function(result, actual, expected, defaultMsg) {
  if(this.completed) return;

  this.completed = true;
  this.message = this.message || defaultMsg;
  this.client.assertion(false, actual, expected, this.message, this.abortOnFailure, this._stackTrace);
  return this.complete(result);
};

/**
 * Set the time in milliseconds to wait for the condition, accepting a given value or a globally defined default
 *
 * @param {number} [timeoutMs]
 * @throws Will throw an error if the global default is undefined or a non-number
 * @returns {number}
 */
WaitForPresentationInitialized.prototype.setMilliseconds = function (timeoutMs) {
  if (timeoutMs && typeof timeoutMs === 'number') {
    return timeoutMs;
  }

  var globalTimeout = this.client.api.globals.waitForConditionTimeout;
  if (typeof globalTimeout !== 'number') {
    throw new Error('WaitForPresentationInitialized expects second parameter to have a global default ' +
      '(waitForConditionTimeout) to be specified if not passed as the second parameter ');
  }

  return globalTimeout;
};

module.exports = WaitForPresentationInitialized;
