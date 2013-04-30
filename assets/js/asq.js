$(window).on('load', function () {
  var $el = $('#small-logo');
  $el.data('asq-affixed', false);

  this.$window = $(window)
    .on('resize.asq', function(){
      checkPosition()
    })
    .on('scroll.asq', checkPosition);


  function checkWidth(){
    if($window.innerWidth() > 979){
      $el.css({'opacity':'0' , "display":"none"});
      checkPosition(0)
    }else{
      $el.css({'opacity':'1' , "display":"block"});
    }
  }

  function checkPosition(event, duration){
    var dur = duration? duration:400;

    if($window.innerWidth() < 979){
      return
    }

    if($el.offset().top >214 && $el.data('asq-affixed') == false  ){
      $el.fadeIn(dur).data('asq-affixed', true)
    }else if($el.offset().top <214 && $el.data('asq-affixed') == true){
      $el.fadeOut(dur).data('asq-affixed', false)
    }
  }

  checkPosition(0);
}); 