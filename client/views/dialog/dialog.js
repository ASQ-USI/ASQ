  'use strict';

  var dust = require('dustjs-linkedin');
  require('./dialog.dust');
  var css = require('./dialog.less');

  var supportAnimation = false,
      animationstring = 'animation',
      keyframeprefix = '',
      domPrefixes = 'Webkit Moz O ms Khtml'.split(' '),
      pfx  = '',
      elm = document.createElement("fakeelement");

  if( elm.style.animationName !== undefined ) { supportAnimation = true; }    

  if( supportAnimation === false ) {
    for( var i = 0; i < domPrefixes.length; i++ ) {
      if( elm.style[ domPrefixes[i] + 'AnimationName' ] !== undefined ) {
        pfx = domPrefixes[ i ];
        animationstring = pfx + 'Animation';
        keyframeprefix = '-' + pfx.toLowerCase() + '-';
        supportAnimation = true;
        break;
      }
    }
  }

  var animEndEventNames = { 'WebkitAnimation' : 'webkitAnimationEnd', 'OAnimation' : 'oAnimationEnd', 'msAnimation' : 'MSAnimationEnd', 'animation' : 'animationend' },
  animEndEventName = animEndEventNames[ animationstring ],
  onEndAnimation = function( el, callback ) {
    var onEndCallbackFn = function( ev ) {
      if( supportAnimation ) {
        if( ev.target != this ) return;
        this.removeEventListener( animEndEventName, onEndCallbackFn );
      }
      if( callback && typeof callback === 'function' ) { callback.call(); }
    };
    if( supportAnimation ) {
      el.addEventListener( animEndEventName, onEndCallbackFn );
    }
    else {
      onEndCallbackFn();
    }
  };

  function extend( a, b ) {
    for( var key in b ) { 
      if( b.hasOwnProperty( key ) ) {
        a[key] = b[key];
      }
    }
    return a;
  }

  function Dialog( el, content, options ) {
    this.el = el;
    this.el.classList.add( 'dialog' );
    this.options = extend( {}, this.options );
    extend( this.options, options );

    dust.render('client/views/dialog/dialog', {content: content}, function(err, out){
      if(err) throw err;

      el.innerHTML = out;

      this.userContentEl = this.el.querySelector('.dialog__user-content');
      this.successContentEl = this.el.querySelector('.dialog__success-content');
      this.infoContentEl = this.el.querySelector('.dialog__info-content');
      this.warningContentEl = this.el.querySelector('.dialog__warning-content');
      this.errorContentEl = this.el.querySelector('.dialog__error-content');

      this.ctrlClose = this.el.querySelector( '[data-dialog-close]' );
      this.isOpen = false;
      this._initEvents();

    }.bind(this));
  }

  Dialog.prototype.clearContent = function(){
   
    this.userContentEl.classList.add('hidden');
    this.userContentEl.innerHTML = '';

    this.successContentEl.classList.add('hidden');
    this.successContentEl.innerHTML = '';

    this.infoContentEl.classList.add('hidden');
    this.infoContentEl.innerHTML = '';

    this.warningContentEl.classList.add('hidden');
    this.warningContentEl.innerHTML = '';

    this.errorContentEl.classList.add('hidden');
    this.errorContentEl.innerHTML = '';
  }

  Dialog.prototype.setContent = function(content) {
    this.clearContent();
    this.userContentEl.classList.remove('hidden');
    this.userContentEl.innerHTML = content;
    return this;
  }

  Dialog.prototype.setSuccessContent = function(content) {
    this.clearContent();
    this.successContentEl.classList.remove('hidden');
    this.successContentEl.innerHTML = content;
    return this;
  }

  Dialog.prototype.setInfoContent = function(content) {
    this.clearContent();
    this.infoContentEl.classList.remove('hidden');
    this.infoContentEl.innerHTML = content;
    return this;
  }

  Dialog.prototype.setWarningContent = function(content) {
    this.clearContent();
    this.warningContentEl.classList.remove('hidden');
    this.warningContentEl.innerHTML = content;
    return this;
  }

  Dialog.prototype.setErrorContent = function(content) {
    this.clearContent();
    this.errorContentEl.classList.remove('hidden');
    this.errorContentEl.innerHTML = content;
    return this;
  }

  Dialog.prototype.options = {
    // callbacks
    onOpenDialog : function() { return false; },
    onCloseDialog : function() { return false; }
  }

  Dialog.prototype._initEvents = function() {
    var self = this;

    // close action
    this.ctrlClose.addEventListener( 'click', this.toggle.bind(this) );

    // esc key closes dialog
    document.addEventListener( 'keydown', function( ev ) {
      var keyCode = ev.keyCode || ev.which;
      if( keyCode === 27 && self.isOpen ) {
        self.toggle();
      }
    } );

    this.el.querySelector( '.dialog__overlay' ).addEventListener( 'click', this.toggle.bind(this) );
  }

  Dialog.prototype.toggle = function() {
    var self = this;
    if( this.isOpen ) {
      this.el.classList.remove( 'dialog--open' );
      self.el.classList.add( 'dialog--close' );
      
      onEndAnimation( this.el.querySelector( '.dialog__content' ), function() {
        self.el.classList.remove( 'dialog--close' );
      } );

      // callback on close
      this.options.onCloseDialog( this );
    }
    else {
      this.el.classList.add( 'dialog--open' );

      // callback on open
      this.options.onOpenDialog( this );
    }
    this.isOpen = !this.isOpen;
    return this;
  };

  module.exports = Dialog;