$(window).on('load', function () {
  var $el = $('#small-logo').data('asq-affixed', false);

  //check for window resize to see if we need mobile layout
  var $window = $(window)
    .on('resize.asq', checkWidth);

  function checkWidth(){
    if($window.innerWidth() > 979){
      $window
      .off('scroll.asq')
      .on('scroll.asq',checkPosition);

      if ($el.offset().top >214) {
        $el.fadeIn().data('asq-affixed', true);
      }else{
        $el.fadeOut().data('asq-affixed', false);
      }
    }else{
      $window.off('scroll.asq');
      $el.fadeIn().data('asq-affixed', true);
    }
  }

  function checkPosition(){
    if($window.innerWidth() < 979){
      return;
    }

    var offsetTop = $el.offset().top;

    if(offsetTop >214 && $el.data('asq-affixed') == false  ){
      $el.fadeIn().data('asq-affixed', true);
    }else if(offsetTop <214 && $el.data('asq-affixed') == true){
      $el.fadeOut().data('asq-affixed', false);
    }
  }

  checkWidth();
}); 