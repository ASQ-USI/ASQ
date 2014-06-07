(function ($) {
  $.fn.drags = function (opt) {

    opt = $.extend({
      handle: "",
      cursor: "ew-resize",
      min: 10
    }, opt);

    var $el;
    if (opt.handle === "") {
      $el = this;
    } else {
      $el = this.find(opt.handle);
    }

    var priorCursor = $('body').css('cursor');

    return $el.css('cursor', opt.cursor).on("mousedown", function (e) {

      priorCursor = $('body').css('cursor');
      $('body').css('cursor', opt.cursor);

      var $drag;
      if (opt.handle === "") {
        $drag = $(this).addClass('asq-modal-draggable');
      } else {
        $drag = $(this).addClass('active-handle').parent().addClass('asq-modal-draggable');
      }
      var z_idx = $drag.css('z-index'),
      drg_h = $drag.outerHeight(),
      drg_w = $drag.outerWidth(),
      pos_y = $drag.offset().top + drg_h - e.pageY,
      pos_x = $drag.offset().left + drg_w - e.pageX;
      $drag.css('z-index', 1000).parents().on("mousemove", function (e) {

        var prev = $('.asq-modal-draggable').prev();
        var next = $('.asq-modal-draggable').next();

        // Assume 50/50 split between prev and next then adjust to
        // the next X for prev

        var total = prev.outerWidth() + next.outerWidth();


        // console.log('l: ' + prev.outerWidth() + ', r:' + next.outerWidth());
        var offset = prev.offset();
        offset = Object.prototype.hasOwnProperty.call(offset, 'left') ? offset.left : 0;
        var leftPercentage = (((e.pageX - offset) + (pos_x - drg_w / 2)) / total);
        var rightPercentage = 1 - leftPercentage;

        if (leftPercentage * 100 < opt.min || rightPercentage * 100 < opt.min) {
          return;
        }

        // console.log('l: ' + leftPercentage + ', r:' + rightPercentage);

        prev.css('flex', leftPercentage.toString());
        next.css('flex', rightPercentage.toString());

        $(document).on("mouseup", function () {
          $('body').css('cursor', priorCursor);
          $('.asq-modal-draggable').removeClass('asq-modal-draggable').css('z-index', z_idx);
        });
      });
      e.preventDefault(); // disable selection
    });

}
})(jQuery);