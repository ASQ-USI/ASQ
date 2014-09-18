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
  , dust = require('dust')
  , templates = require('./templates')
  , form = require('./form.js')
  , presenterControlDOMBinder = require('./presenterControl.js').presenterControlDOMBinder;

var binders = Object.create(null);
binders['completeRegistration'] = completeRegistrationDOMBinder,
binders['menu']   =  menuDOMBinder,
binders['user']   =  userDOMBinder,
binders['signup'] =  signupDOMBinder,
binders['presentations']    =  psesentationsDOMBinder,
binders['presenterControl'] =  function(){
  menuDOMBinder();
  presenterControlDOMBinder();
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


// presentations.dust
function psesentationsDOMBinder(){
  menuDOMBinder();
  //enable no-touch classes
  if ('ontouchstart' in document) {
    $('body').removeClass('no-touch');
  }
  
  //iphone/ipad install as web-app pop up
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

    //isotope
    // var $container = $('.accordion-inner');
    var container = document.querySelector('.accordion-inner');
    
    // $container.isotope({
    //   itemSelector: '.thumb-container',
    //   filter: ':not(.removed-item)',
    //   sortBy: 'position',
    //   getSortData : {
    //     position : function ( $elem ) {
    //       return parseInt( $elem.data('sort-position'), 10 );
    //     }
    //   }
    // });

    var iso = new Isotope(container, {
      itemSelector: '.thumb-container',
      filter: ':not(.removed-item)',
      sortBy: 'position',
      getSortData : {
        position : function ( $elem ) {
          return parseInt( $elem.dataset.sortPosition, 10 );
        }
      }
    });


    var $documentHammered = $(document).hammer();
    
    $documentHammered.on("touch", hidePopover);
    function hidePopover(){
      $('#iOSWebAppInfo').popover('destroy');
    };

    $documentHammered
      // flip to show slideshow actions
      .on('tap', '.flipbox' ,function (event) {
          event.stopPropagation();
          $('.flipbox')
            .not($(this).addClass('flipped'))
            .removeClass('flipped');
      })

      // flip to front fa
      .on('tap',function () {
        $(".thumb-container .flipbox").removeClass("flipped");
      })

      //show slideshow title
      .on('swiperight', '.thumb-info' ,function (event) {
          $(this).addClass('title')
      })

      //show slideshow screenshot
      .on('swipeleft', '.thumb-info' ,function (event) {
          $(this).removeClass('title')
      })
      
      //remove slideshow
      .on('tap', '.thumb-container .remove' ,function(event) {
        event.preventDefault();
        var shouldDelete = confirm('Are you sure you want to delete this slideshow?')
        if(shouldDelete==false) return;

        var $thumb = $(this).parents('.thumb-container');

        // clone thumb in case server responds with failure
        var $clone = $thumb.clone();
        //delete from DOM
        iso('remove', $thumb);
          
        // send delete request to server
        request
          .del($thumb.attr('id'))
          .set('Accept', 'application/json')
          .end(function(err, res){
            if(err || res.statusType!=2){
              iso('insert', $clone);
              alert('Something went wrong with removing your presentation: ' + 
                (err!=null ? err.message : JSON.stringify(res.body)));
              return;
            }
            //empty clone
            $clone= null;
          });
      })

    // click handlers for non GET requests
    // if you add a new button, follow the style below, that is,
    // check for a specific class instead of attaching a handler
    // directly on a .thumb-buttons .btn . The reason for this is that
    // it's easy to messup the 3d rotation click handler
    .on('tap', '.thumb-buttons a.btn' , function(event) {
    // $(".thumb-buttons a").click(function (event) {
        event.preventDefault();
        var $this = $(this);

        // start presentation action
        if($this.hasClass("start")){
          var username = $this.data('username');
          var presentationId = $this.data('id');
          var authLevel = $this.data('authlevel');
          var url = ['/', username, '/presentations/', presentationId, '/live'].join('');
          debug('POST ' + url);
          $.post(url, null)
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
        else if($this.hasClass("stop")){ 
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
                    $("#mainContainer").prepend(out);
                  }
              });              
            }
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
    
    $('.thumb-container .flipbox').click(function (event) {
        
        event.stopPropagation();
        // $(".thumb").removeClass("flipped").css("z-index", "1");
        
        $(this).addClass("flipped");
        // $(this).parent().css("z-index", "10");
    });

    $('.dropdown-toggle').click(function(event) {
      event.stopPropagation();
      $(this).parent().toggleClass("open");
    });

    
    $(".buttons a").click(function (event) {
        
        var $this = $(this);

        if($this.hasClass("start")){
          event.preventDefault();
          //start presentation
          var username = $this.data('username');
          var presentationId = $this.data('id');
          var authLevel = $this.data('authlevel');
          var url = ['/', username, '/presentations/', presentationId, '/live/?start&al=',
            authLevel].join('');
          debug('POST ' + url);
          $.post(url, null)
          .success(function (data, textStatus, jqXHR){
            var location = jqXHR.getResponseHeader('Location');
            window.location = location;
            if(!window.navigator.standalone){
              //window.open("/admin", '');
              //slideshow.blur(); What is that?
              //window.focus();
            }else{
              window.location = $this.attr("href");
              debug(window.navigator.standalone);
            }
          });
        }
    });
    
    
    $(document).click(function () {
        $(".thumb-container .flipbox").removeClass("flipped");
        // $(".thumb").parent().css("z-index", "100");
    });
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

 