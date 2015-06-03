/*
* Require this in your views to setup the dom bindings by calling
* <pre>dom.bindingsFor(viewName)</pre>. The function <pre>bindingsFor</pre> will search for
* a <pre>viewName</pre> property in the binders and, if it's a function, it
* will call it. This way you can specify dom logic per view. Moreover this is 
* a good place to setup the form bindings as well.
*/
'use strict';

var debug = require('bows')("dom")
  , request = require('superagent')
  , dust = require('dustjs-linkedin')
  , templates = require('imports?dust=dustjs-linkedin!./templates')
  , form = require('./form.js')
  , presenterControl = require('./presenterControl.js')
  , sessionStats = require('./sessionStats.js');

var binders = Object.create(null);
binders['completeRegistration'] = completeRegistrationDOMBinder,
binders['menu']   =  menuDOMBinder,
binders['user']   =  userDOMBinder,
binders['signup'] =  signupDOMBinder,
binders['usersSettings'] =  usersSettingsDOMBinder,
binders['presentations']    =  psesentationsDOMBinder,
binders['presentationSettings']  =  require('./presentationSettingsBindings'),
binders['presenterControl'] =  function(){
  menuDOMBinder();
  presenterControl();
},
binders['sessionStats'] =  function(){
  menuDOMBinder();
  sessionStats();
},
binders['userLive'] =  userLiveDOMBinder


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

//All uses of ASQ[property] assume that ASQ is global

// completeRegistration.dust
function completeRegistrationDOMBinder(){
  form.setup('completeRegistration');
}

function menuDOMBinder(){
  $(function(){
    $('#logoutAnchor').on('click.asq.logout', function(){
      $('#logoutForm').submit()
    })
  })
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
function psesentationsDOMBinder(){
  menuDOMBinder();
  //enable no-touch classes
  if ('ontouchstart' in document) {
    $('body').removeClass('no-touch');
  }

  var tooltipOptions = {
    container: 'body',
    delay: { "show": 600 }
  };

  //init dialog 
  var dialogEl = document.getElementById('main-dialog');
  var Dialog = require('../views/dialog/dialog');
  var dlg = new Dialog(dialogEl);
  
  //iphone/ipad install as web-app pop up
  $(function(){
    var iso; //the isotope container

    if(!window.navigator.standalone && navigator.userAgent.match(/(iPhone|iPod)/g) ? true : false ){
      $('#iOSWebAppInfo').popover({
        placement: "top",
        title: "Install ASQ as Web-app",
        html: true,
      });
      $('#iOSWebAppInfo').popover('show');
    }
    if(!window.navigator.standalone && navigator.userAgent.match(/(iPad)/g) ? true : false ){
      $('#iOSWebAppInfo').popover({
        placement: "bottom",
        title: "Install ASQ as Web-app",
        html: true,
      });
      $('#iOSWebAppInfo').popover('show');
    }

    //tooltip
    $('[data-toggle="tooltip"]').tooltip(tooltipOptions);

    var navThumSteps = function($thumb, direction) {
      var activeThumbStep = parseInt($thumb[0].dataset.activeThumbStep);
      var $thumbSteps = $thumb.find('.thumb-step');
      var l = $thumbSteps.length;

      $thumbSteps.eq(activeThumbStep).hide();

      //prev button
      if(direction == "prev"){
        activeThumbStep = (--activeThumbStep >= 0) ? activeThumbStep : (l-1);
      }else{ //next button
        activeThumbStep = (++activeThumbStep < l) ? activeThumbStep : 0;
      }
      $thumb[0].dataset.activeThumbStep = activeThumbStep;
      $thumbSteps.eq(activeThumbStep).show();
    }


    // Thumbs may contain polymer elements which take some time to render.
    // Layout operations should occur after polymer has initialized
    window.addEventListener('polymer-ready', function(e) {
    
    //resize thumbs
      var thumbGenerator = require('impress-asq-fork-asq-adapter').impressThumbGenerator();
      var thumbs = document.querySelectorAll('.thumb-step');

      [].forEach.call(thumbs, function resizeThumb(thumb){
        thumbGenerator.resizeThumb(thumb, {width: 280, height: 175});
      });

      // start isotope when thumbs are resized
      var container = document.querySelector('.isotope');

      iso = new Isotope(container, {
        itemSelector: '.thumb',
        filter: ':not(.removed-item)',
        masonry: {
          isFitWidth: true
        },
        sortBy: 'position',
        getSortData : {
          position : function ( $elem ) {
            return parseInt( $elem.dataset.sortPosition, 10 );
          }
        }
      });

      //hide all thumbs but the first one
      $('.thumb').each(function(){
        this.dataset.activeThumbStep = 0;
        $(this).find('.thumb-step').hide().eq(0).show();
      });
    });
  
    // store focused thumb
    $(document).on('click', function(evt){ 
      $('.thumb').each(function(){
         this.setAttribute('hasFocus', false);
      });
    });

    
    $(document).on('click', '.thumb', function(evt){ 
      $('.thumb').each(function(){
         this.setAttribute('hasFocus', false);
      });
      evt.stopPropagation();
      evt.currentTarget.setAttribute('hasFocus', true);
    })

    //navigate thumbs with keyboard
    $("body").keydown(function(e) {
      var $focusedThumb = $('.thumb[hasFocus=true]');
      if(! $focusedThumb.length) return;

      var direction = "";
      if(e.keyCode == 37) { // left
        direction = "prev";
      }
      else if(e.keyCode == 39) { // right
        direction = "next";
      }

      navThumSteps($focusedThumb, direction);
    });


    $(document).on('click', '.thumb-nav-btn', function(evt){
      var $btn = $(evt.currentTarget);

      var $thumb = $btn.parents('.thumb').eq(0);
      if(! $thumb) return;

      var direction = "";
      //prev button
      if($btn.hasClass('thumb-nav-prev-btn')){
        direction = "prev";
      }else{ //next button
        direction = "next";
      }

      navThumSteps($thumb, direction);
    });

    var $documentHammered = $(document).hammer();
    
    $documentHammered.on("touch", hidePopover);
    function hidePopover(){
      $('#iOSWebAppInfo').popover('destroy');
    };

    $documentHammered      
      //remove slideshow
      .on('tap', '.thumb > .remove' ,function(event) {
        event.preventDefault();
        var shouldDelete = confirm('Are you sure you want to delete this slideshow?')
        if(shouldDelete==false) return;

        var $thumb = $(this).parents('.thumb');

        // clone thumb in case server responds with failure
        var $clone = $thumb.clone();
        //delete from DOM
        iso.remove($thumb[0]);
        iso.layout();
          
        // send delete request to server
        request
          .del($thumb.attr('id'))
          .set('Accept', 'application/json')
          .end(function(err, res){
            if(err || res.statusType!=2){
              iso.insert($clone);
              alert('Something went wrong with removing your presentation: ' + 
                (err!=null ? err.message : JSON.stringify(res.body)));
              return;
            }
            //empty clone
            $clone= null;
          });
      })

    // click handlers for non GET requests
    .on('tap', '.thumb-controls a' , function(event) {
        event.preventDefault();
        var $this = $(this);

        // start presentation action
        if($this.hasClass("btn-start")){
          var username = $this.data('username');
          var presentationId = $this.data('id');
          var authLevel = $this.data('authlevel');
          var flow = $this.data('flow') || 'ctrl';
          var data = {authLevel : authLevel, flow: flow}
          var url = ['/', username, '/presentations/', presentationId, '/live'].join('');
          debug('POST ' + url);
          $.post(url, data)
          .success(function (data, textStatus, jqXHR){
            var location = jqXHR.getResponseHeader('Location');
            window.location = location;
            if(!window.navigator.standalone){
              //window.open("/admin", '');
              //slideshow.blur(); What is that?
              //window.focus();
            }else{
              window.location = $this.attr("href");
            }
          });
        }
        //stop presentation
        else if($this.hasClass("btn-stop")){ 
          var username = $this.data('username');
          var presentationId = $this.data('id');
          var authLevel = $this.data('authlevel');
          var url = ['/', username, '/presentations/', presentationId, '/live'].join('');
          debug('DELETE ' + url);
          $.ajax({
            url: url,
            type: "DELETE"
          })
          .success(function (data, textStatus, jqXHR){
            if(textStatus === "success" ||textStatus === "nocontent"){

              //re-render thumb
              var $currentThumb = $('#' + presentationId);
              var thumbData = {
                _id : presentationId,
                position : $currentThumb.attr('data-sort-position'),
                title : $currentThumb.find('.thumb-title').html(),
                params: {
                  username: username
                },
                lastSession: $currentThumb.find('.last-session').text(),
                lastEdit: $currentThumb.find('.last-session').text()
              }
              dust.render('presentationThumb', thumbData, function(err, out){
                  if(err){
                    debug(err)
                  }else{
                    $currentThumb.html($(out).html());
                    $('#'+ presentationId).find('[data-toggle="tooltip"]').tooltip(tooltipOptions);
                  }
              });    
              // show alert
              dust.render('alert', {
                alerts: [
                  {dismissible: true,
                  type: "success",
                  message: "Session stopped successfully"}
                ]
              }, function(err, out){
                  if(err){
                    debug(err)
                  }else{
                    $("#main-container").prepend(out);
                  }
              });              
            }
          });
        }
        //upload link
        else if($this.hasClass("btn-upload-command")){
          var data = {
              cookie: this.dataset.cookie,
              title: this.dataset.title,
              rootUrl: document.location.origin,
              username: this.dataset.username,
              presentationId : this.dataset.presentationId
          }
          dust.render("views/shared/presentationUploadCommand", data, function(err, out){
            if(err) throw err;
            dlg.setContent(out);
            var utils = require('./utils');
            utils.selectText(dlg.el.querySelector(".upload-code-snippet-modal"));
            dlg.toggle();
          });          
        }
    });
  })
}

// presentations.dust
function userLiveDOMBinder(){
  $(function(){
    if(!window.navigator.standalone && navigator.userAgent.match(/(iPhone|iPod)/g) ? true : false ){
      $('#iOSWebAppInfo').popover({
        placement: "top",
        title: "Install ASQ as Web-app",
        html: true,
      });
      $('#iOSWebAppInfo').popover('show');
    }
    if(!window.navigator.standalone && navigator.userAgent.match(/(iPad)/g) ? true : false ){
      $('#iOSWebAppInfo').popover({
        placement: "bottom",
        title: "Install ASQ as Web-app",
        html: true,
      });
      $('#iOSWebAppInfo').popover('show');
    }
    
    document.addEventListener("touchstart", hidePopover, false);
    function hidePopover(){
      $('#iOSWebAppInfo').popover('destroy');
    };
    
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
  bindingsFor(viewname);
})

 