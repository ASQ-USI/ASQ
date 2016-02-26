var Order = require('./order');
var Entity = require('sourced').Entity;
var util = require('util');

function Session () {
  this.id = null;
  this.presenter = null;
  this.slides = null;
  this.flow = null;
  this.authLevel = null;
  this.activeSlide = null;
  this.startDate = null;
  this.endDate = null;
  this.started = false;
  this.activeExercises = [];
  this.activeQuestions = [];
  this.activeStatsQuestions = [];
  Entity.call(this);
}

util.inherits(Market, Entity);

Session.prototype.initialize = function(doc, cb) {
    this.id = doc.id;
    this.presenter = doc.presenter;
    this.slides = doc.slides;
    this.flow = doc.flow;
    this.authLevel = doc.authLevel;
    if(cb) cb();
};

Session.prototype.setActiveSlide = function(s, cb) {
    // tell sourced to automatically digest the event and params
    this.digest('setActiveSlide', s);
    
    this.activeSlide = s;
    
    if(cb) cb();
};

Session.prototype.activateExercise = function(ex, cb) {
    // tell sourced to automatically digest the event and params
    this.digest('activateExercise', ex);
    
    this.activeQuestions.push(ex);
    
    if(cb) cb();
};

Session.prototype.activateQuestion = function(q, cb) {
    // tell sourced to automatically digest the event and params
    this.digest('activateQuestion', q);
    
    this.activeQuestions.push(q);
    
    if(cb) cb();
};

Session.prototype.activateStatQuestion = function(sq, cb) {
    // tell sourced to automatically digest the event and params
    this.digest('activateStatQuestion', sq);
    
    this.activeStatsQuestions.push(sq);
    
    if(cb) cb();
};

module.exports = Session;