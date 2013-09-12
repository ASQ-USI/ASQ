/* Presentations DOM */
'use strict'
var $ = require("jQuery");

var init = function (){
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

//     $('.start').on('click', function(event) {
//   event.stopPropagation();
//   console.log('Start presentation');
//   console.log($(this).data('username'));
 
// });
    
    $(".buttons a").click(function (event) {
        event.preventDefault();
        var $this = $(this);

        if($this.hasClass("start")){
          //start presentation
          var username = $this.data('username');
          var presentationId = $this.data('id');
          var authLevel = $this.data('authLevel');
          var url = ['/', username, '/presentations/', presentationId, '/live/?start&al=',
            authLevel].join('');
          $.post(url, null , function(data){
            console.log(data)
            if(!window.navigator.standalone){
              window.open("/admin", '');
              slideshow.blur();
              window.focus();
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

var dom = module.exports={
  init : init
}    