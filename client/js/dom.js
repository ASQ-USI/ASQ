/*
* Require this in your views to setup the dom bindings by calling
* <pre>dom.bindingsFor(viewName)</pre>. The function <pre>bindingsFor</pre> will search for
* a <pre>viewName</pre> property in the binders and, if it's a function, it
* will call it. This way you can specify dom logic per view. Moreover this is 
* a good place to setup the form bindings as well.
*/
'use strict';

var debug = require('bows')("dom");
var form = require('./form.js');
var utils = require('./utils');
var presenterControl = require('./presenterControl.js');
var sessionStats = require('./sessionStats.js');
var menuDOMBinder = require('./views/menu');
var presentations = require('./views/presentations');
var pluginsSettings = require('./views/pluginsSettings');
var upload = require('./views/upload');

//binding the init function to the module to preserve the correct 'this'
var presentationsDOMBinder =  presentations.init.bind(presentations);
var pluginsSettingsDOMBinder =  pluginsSettings.init.bind(pluginsSettings);
var uploadDOMBinder =  upload.init.bind(upload);

var binders = Object.create(null);
binders['completeRegistration'] = completeRegistrationDOMBinder,
binders['menu']   =  menuDOMBinder;
binders['user']   =  userDOMBinder;
binders['signup'] =  signupDOMBinder;
binders['usersSettings'] =  usersSettingsDOMBinder;
binders['presentations']  = presentationsDOMBinder;
binders['pluginsSettings']  = pluginsSettingsDOMBinder;
binders['upload']  = uploadDOMBinder;
binders['presentationSettings'] =  require('./presentationSettingsBindings');
binders['presenterControl'] =  function(){
  menuDOMBinder();
  presenterControl();
};
binders['sessionStats'] =  function(){
  menuDOMBinder();
  sessionStats();
};
binders['userLive'] =  userLiveDOMBinder;


function bindingsFor(viewName){
  if (typeof binders[viewName] == 'function'){
    binders[viewName]();
  }else{
    debug("No Dom Bindings for "+ viewName);
  }
}

var dom = module.exports={
  bindingsFor : bindingsFor
}  


// completeRegistration.dust
function completeRegistrationDOMBinder(){
  form.setup('completeRegistration');
}


// signup.dust
function signupDOMBinder(){
  bindingsFor('signupMenu')
  form.setup('signup');

  $(function(){
    var fromsignup = $('body').attr('data-from-signup');
    fromsignup = typeof fromsignup == 'undefined' ? false : Boolean(fromsignup);
    if(fromsignup)$('#signup-modal').modal('show');
  });
}

// usersSettings.dust
function usersSettingsDOMBinder(){
  menuDOMBinder();

  // the singular user is not a typo. Right now the users settings page
  // display info for the current user
  form.setup('userSettings');
}


// presentations.dust
function userLiveDOMBinder(){
  $(function(){
    utils.showIOSInstallAsApp();
  })
}

// user.dust
function userDOMBinder(){
  //TODO update this for user
  psesentationsDOMBinder();
} 

var $ = require('jquery');
$(function(){
  var viewname = $('body').attr('data-view-name')
  if(! viewname) return;
  bindingsFor(viewname);
})

 