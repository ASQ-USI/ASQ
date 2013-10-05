/*
* Require this in your views to setup the dom bindings by calling
* <pre>dom.bindingsFor(viewName)</pre>. The function bindingsFor will search for
* a <pre>viewName</pre> property in the binders and, if it's a function, it
* will call it. This way you can specify dom logic per view. Moreover this is 
* a good place to setup the form bindings as well.
*/
'use strict';

var $ = require("jQuery")
  , form = require('./form.js')
  , presenterControlDOMBinder = require('./presenterControl.js').presenterControlDOMBinder

var binders = {
  'menu'   : menuDOMBinder,
  'user'   : userDOMBinder,
  'signIn' : signInDOMBinder,
  'presentations'    : psesentationsDOMBinder,
  'presenterControl' : presenterControlDOMBinder,
  'userLive' : userLiveDOMBinder
}

function bindingsFor(viewName){
  if (binders.hasOwnProperty(viewName) && typeof binders[viewName] == 'function'){
    binders[viewName]();
  }else{
    console.log("No Dom Bindings for "+ viewName);
  }
}

var dom = module.exports={
  bindingsFor : bindingsFor
}  

//All uses of ASQ[property] supppose that ASQ is global

function menuDOMBinder(){
  $(function(){
    $('#logoutAnchor').on('click.asq.logout', function(){
      $('#logoutForm').submit()
    })
  })
}


// signIn.dust
function signInDOMBinder(){
  form.setup('signIn');

  $(function(){
    var fromRegister = $('body').attr('data-from-register');
    fromRegister = typeof fromRegister == 'undefined' ? false : Boolean(fromRegister);
    if(fromRegister)$('#register-modal').modal('show');
  });
}

// presentations.dust
function psesentationsDOMBinder(){
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
    
    $('.thumb').click(function (event) {
        
        event.stopPropagation();
        $(".thumb").removeClass("flipped").css("z-index", "1");
        
        $(this).addClass("flipped");
        $(this).parent().css("z-index", "10");
    });

    $('.dropdown-toggle').click(function(event) {
      event.stopPropagation();
      $(this).parent().toggleClass("open");
    });

    
    $(".buttons a").click(function (event) {
        event.preventDefault();
        var $this = $(this);

        if($this.hasClass("start")){
          //start presentation
          var username = $this.data('username');
          var presentationId = $this.data('id');
          var authLevel = $this.data('authlevel');
          var url = ['/', username, '/presentations/', presentationId, '/live/?start&al=',
            authLevel].join('');
          console.log('POST ' + url);
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
              console.log(window.navigator.standalone);
            }
          });
        }
    });
    
    
    $(document).click(function () {
        $(".thumb").removeClass("flipped");
        $(".thumb").parent().css("z-index", "100");
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
    
    $('.thumb').click(function (event) {
        
        event.stopPropagation();
        $(".thumb").removeClass("flipped").css("z-index", "1");
        
        $(this).addClass("flipped");
        $(this).parent().css("z-index", "10");
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
          console.log('POST ' + url);
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
              console.log(window.navigator.standalone);
            }
          });
        }
    });
    
    
    $(document).click(function () {
        $(".thumb").removeClass("flipped");
        $(".thumb").parent().css("z-index", "100");
    });
  })
}

// user.dust
function userDOMBinder(){
  //TODO update this for user
  psesentationsDOMBinder();
}  