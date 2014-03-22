function bounce($el) {
  bounceOnce($el, -15, 100, function(){
    bounceOnce($el, -10, 75);
  });
}

function bounceOnce($el, distance, duration, cb){
  $el.animate({ left: "-=" + distance, position: 'aboslute' }, duration, function onAnim1() {
    $el.animate({ left: "+=" + distance, position: 'aboslute' }, 150, function onAnim2() {
      if(!!cb && _.isFunction(cb)) {
        cb();
      }
    });
  });
}

module.exports = {
  bounce: bounce,
  bounceOnce: bounceOnce
}
