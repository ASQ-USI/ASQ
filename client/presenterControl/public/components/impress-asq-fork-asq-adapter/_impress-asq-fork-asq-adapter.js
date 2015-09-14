'use strict';

var debug = require('bows')('impress-asq-fork-asq-adapter')
var adapterConstructor = require('impress-asq-fork-asq-adapter').adapter;

Polymer({
  is: 'impress-asq-fork-asq-adapter', 

  properties: {
    activeStep: {
      type: String,
      value: '',
      notify: true,
      reflectToAttribute: true
    },

    asqSocket: {
      type: Object,
      value: function() { return null;},
      observer: 'asqSocketChanged'
    },

    slidesTree: {
      type: Object,
      value: function() { return null;},
      observer: 'slidesTreeChanged'
    },

    standalone: {
      type: Boolean,
      value: false,
      observer: 'standaloneChanged'
    },

    offset: {
      type: Number,
      value: 0,
      observer: 'offsetChanged'
    }
  },

  ready: function(){
    document.addEventListener("impress-adapter:onGoto", function(event){
      this.activeStep = event.detail.step || this.activeStep;
    }.bind(this));
  },

  asqSocketChanged: function(newSocket, oldSocket){
    this.setAdapter();
  },
  slidesTreeChanged: function(newTree, oldTree){
    this.setAdapter();
  },
  standaloneChanged: function(newVal, oldVal){
    this.setAdapter();
  },
  offsetChanged: function(newOffset, oldOffset){
    this.setAdapter();
  },

  goto: function(){
     this.adapter.goto.apply(this.adapter, arguments)
  },

  prev: function(){
    this.adapter.prev();
  },

  next: function(){
    this.adapter.next();
  },

  setAdapter: function(){
    if(this.asqSocket){
      if(this.adapter){
        this.adapter.destroy();
      }
      this.adapter = adapterConstructor(this.asqSocket, this.slidesTree, this.standalone, this.offset);
    }
  }
});
