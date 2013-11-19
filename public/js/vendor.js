require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"K5SPyQ":[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};(function browserifyShim(module, define) {

; global.jQuery = require("jQuery");
/**
* bootstrap.js v3.0.0 by @fat and @mdo
* Copyright 2013 Twitter Inc.
* http://www.apache.org/licenses/LICENSE-2.0
*/
if (!jQuery) { throw new Error("Bootstrap requires jQuery") }

/* ========================================================================
 * Bootstrap: transition.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#transitions
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap')

    var transEndEventNames = {
      'WebkitTransition' : 'webkitTransitionEnd'
    , 'MozTransition'    : 'transitionend'
    , 'OTransition'      : 'oTransitionEnd otransitionend'
    , 'transition'       : 'transitionend'
    }

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }
  }

  // http://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false, $el = this
    $(this).one($.support.transition.end, function () { called = true })
    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
    setTimeout(callback, duration)
    return this
  }

  $(function () {
    $.support.transition = transitionEnd()
  })

}(window.jQuery);

/* ========================================================================
 * Bootstrap: alert.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#alerts
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // ALERT CLASS DEFINITION
  // ======================

  var dismiss = '[data-dismiss="alert"]'
  var Alert   = function (el) {
    $(el).on('click', dismiss, this.close)
  }

  Alert.prototype.close = function (e) {
    var $this    = $(this)
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = $(selector)

    if (e) e.preventDefault()

    if (!$parent.length) {
      $parent = $this.hasClass('alert') ? $this : $this.parent()
    }

    $parent.trigger(e = $.Event('close.bs.alert'))

    if (e.isDefaultPrevented()) return

    $parent.removeClass('in')

    function removeElement() {
      $parent.trigger('closed.bs.alert').remove()
    }

    $.support.transition && $parent.hasClass('fade') ?
      $parent
        .one($.support.transition.end, removeElement)
        .emulateTransitionEnd(150) :
      removeElement()
  }


  // ALERT PLUGIN DEFINITION
  // =======================

  var old = $.fn.alert

  $.fn.alert = function (option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.alert')

      if (!data) $this.data('bs.alert', (data = new Alert(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  $.fn.alert.Constructor = Alert


  // ALERT NO CONFLICT
  // =================

  $.fn.alert.noConflict = function () {
    $.fn.alert = old
    return this
  }


  // ALERT DATA-API
  // ==============

  $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close)

}(window.jQuery);

/* ========================================================================
 * Bootstrap: button.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#buttons
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // BUTTON PUBLIC CLASS DEFINITION
  // ==============================

  var Button = function (element, options) {
    this.$element = $(element)
    this.options  = $.extend({}, Button.DEFAULTS, options)
  }

  Button.DEFAULTS = {
    loadingText: 'loading...'
  }

  Button.prototype.setState = function (state) {
    var d    = 'disabled'
    var $el  = this.$element
    var val  = $el.is('input') ? 'val' : 'html'
    var data = $el.data()

    state = state + 'Text'

    if (!data.resetText) $el.data('resetText', $el[val]())

    $el[val](data[state] || this.options[state])

    // push to event loop to allow forms to submit
    setTimeout(function () {
      state == 'loadingText' ?
        $el.addClass(d).attr(d, d) :
        $el.removeClass(d).removeAttr(d);
    }, 0)
  }

  Button.prototype.toggle = function () {
    var $parent = this.$element.closest('[data-toggle="buttons"]')

    if ($parent.length) {
      var $input = this.$element.find('input')
        .prop('checked', !this.$element.hasClass('active'))
        .trigger('change')
      if ($input.prop('type') === 'radio') $parent.find('.active').removeClass('active')
    }

    this.$element.toggleClass('active')
  }


  // BUTTON PLUGIN DEFINITION
  // ========================

  var old = $.fn.button

  $.fn.button = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.button')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.button', (data = new Button(this, options)))

      if (option == 'toggle') data.toggle()
      else if (option) data.setState(option)
    })
  }

  $.fn.button.Constructor = Button


  // BUTTON NO CONFLICT
  // ==================

  $.fn.button.noConflict = function () {
    $.fn.button = old
    return this
  }


  // BUTTON DATA-API
  // ===============

  $(document).on('click.bs.button.data-api', '[data-toggle^=button]', function (e) {
    var $btn = $(e.target)
    if (!$btn.hasClass('btn')) $btn = $btn.closest('.btn')
    $btn.button('toggle')
    e.preventDefault()
  })

}(window.jQuery);

/* ========================================================================
 * Bootstrap: carousel.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#carousel
 * ========================================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // CAROUSEL CLASS DEFINITION
  // =========================

  var Carousel = function (element, options) {
    this.$element    = $(element)
    this.$indicators = this.$element.find('.carousel-indicators')
    this.options     = options
    this.paused      =
    this.sliding     =
    this.interval    =
    this.$active     =
    this.$items      = null

    this.options.pause == 'hover' && this.$element
      .on('mouseenter', $.proxy(this.pause, this))
      .on('mouseleave', $.proxy(this.cycle, this))
  }

  Carousel.DEFAULTS = {
    interval: 5000
  , pause: 'hover'
  , wrap: true
  }

  Carousel.prototype.cycle =  function (e) {
    e || (this.paused = false)

    this.interval && clearInterval(this.interval)

    this.options.interval
      && !this.paused
      && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))

    return this
  }

  Carousel.prototype.getActiveIndex = function () {
    this.$active = this.$element.find('.item.active')
    this.$items  = this.$active.parent().children()

    return this.$items.index(this.$active)
  }

  Carousel.prototype.to = function (pos) {
    var that        = this
    var activeIndex = this.getActiveIndex()

    if (pos > (this.$items.length - 1) || pos < 0) return

    if (this.sliding)       return this.$element.one('slid', function () { that.to(pos) })
    if (activeIndex == pos) return this.pause().cycle()

    return this.slide(pos > activeIndex ? 'next' : 'prev', $(this.$items[pos]))
  }

  Carousel.prototype.pause = function (e) {
    e || (this.paused = true)

    if (this.$element.find('.next, .prev').length && $.support.transition.end) {
      this.$element.trigger($.support.transition.end)
      this.cycle(true)
    }

    this.interval = clearInterval(this.interval)

    return this
  }

  Carousel.prototype.next = function () {
    if (this.sliding) return
    return this.slide('next')
  }

  Carousel.prototype.prev = function () {
    if (this.sliding) return
    return this.slide('prev')
  }

  Carousel.prototype.slide = function (type, next) {
    var $active   = this.$element.find('.item.active')
    var $next     = next || $active[type]()
    var isCycling = this.interval
    var direction = type == 'next' ? 'left' : 'right'
    var fallback  = type == 'next' ? 'first' : 'last'
    var that      = this

    if (!$next.length) {
      if (!this.options.wrap) return
      $next = this.$element.find('.item')[fallback]()
    }

    this.sliding = true

    isCycling && this.pause()

    var e = $.Event('slide.bs.carousel', { relatedTarget: $next[0], direction: direction })

    if ($next.hasClass('active')) return

    if (this.$indicators.length) {
      this.$indicators.find('.active').removeClass('active')
      this.$element.one('slid', function () {
        var $nextIndicator = $(that.$indicators.children()[that.getActiveIndex()])
        $nextIndicator && $nextIndicator.addClass('active')
      })
    }

    if ($.support.transition && this.$element.hasClass('slide')) {
      this.$element.trigger(e)
      if (e.isDefaultPrevented()) return
      $next.addClass(type)
      $next[0].offsetWidth // force reflow
      $active.addClass(direction)
      $next.addClass(direction)
      $active
        .one($.support.transition.end, function () {
          $next.removeClass([type, direction].join(' ')).addClass('active')
          $active.removeClass(['active', direction].join(' '))
          that.sliding = false
          setTimeout(function () { that.$element.trigger('slid') }, 0)
        })
        .emulateTransitionEnd(600)
    } else {
      this.$element.trigger(e)
      if (e.isDefaultPrevented()) return
      $active.removeClass('active')
      $next.addClass('active')
      this.sliding = false
      this.$element.trigger('slid')
    }

    isCycling && this.cycle()

    return this
  }


  // CAROUSEL PLUGIN DEFINITION
  // ==========================

  var old = $.fn.carousel

  $.fn.carousel = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.carousel')
      var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
      var action  = typeof option == 'string' ? option : options.slide

      if (!data) $this.data('bs.carousel', (data = new Carousel(this, options)))
      if (typeof option == 'number') data.to(option)
      else if (action) data[action]()
      else if (options.interval) data.pause().cycle()
    })
  }

  $.fn.carousel.Constructor = Carousel


  // CAROUSEL NO CONFLICT
  // ====================

  $.fn.carousel.noConflict = function () {
    $.fn.carousel = old
    return this
  }


  // CAROUSEL DATA-API
  // =================

  $(document).on('click.bs.carousel.data-api', '[data-slide], [data-slide-to]', function (e) {
    var $this   = $(this), href
    var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) //strip for ie7
    var options = $.extend({}, $target.data(), $this.data())
    var slideIndex = $this.attr('data-slide-to')
    if (slideIndex) options.interval = false

    $target.carousel(options)

    if (slideIndex = $this.attr('data-slide-to')) {
      $target.data('bs.carousel').to(slideIndex)
    }

    e.preventDefault()
  })

  $(window).on('load', function () {
    $('[data-ride="carousel"]').each(function () {
      var $carousel = $(this)
      $carousel.carousel($carousel.data())
    })
  })

}(window.jQuery);

/* ========================================================================
 * Bootstrap: collapse.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#collapse
 * ========================================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================

  var Collapse = function (element, options) {
    this.$element      = $(element)
    this.options       = $.extend({}, Collapse.DEFAULTS, options)
    this.transitioning = null

    if (this.options.parent) this.$parent = $(this.options.parent)
    if (this.options.toggle) this.toggle()
  }

  Collapse.DEFAULTS = {
    toggle: true
  }

  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width')
    return hasWidth ? 'width' : 'height'
  }

  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('in')) return

    var startEvent = $.Event('show.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var actives = this.$parent && this.$parent.find('> .panel > .in')

    if (actives && actives.length) {
      var hasData = actives.data('bs.collapse')
      if (hasData && hasData.transitioning) return
      actives.collapse('hide')
      hasData || actives.data('bs.collapse', null)
    }

    var dimension = this.dimension()

    this.$element
      .removeClass('collapse')
      .addClass('collapsing')
      [dimension](0)

    this.transitioning = 1

    var complete = function () {
      this.$element
        .removeClass('collapsing')
        .addClass('in')
        [dimension]('auto')
      this.transitioning = 0
      this.$element.trigger('shown.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    var scrollSize = $.camelCase(['scroll', dimension].join('-'))

    this.$element
      .one($.support.transition.end, $.proxy(complete, this))
      .emulateTransitionEnd(350)
      [dimension](this.$element[0][scrollSize])
  }

  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in')) return

    var startEvent = $.Event('hide.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var dimension = this.dimension()

    this.$element
      [dimension](this.$element[dimension]())
      [0].offsetHeight

    this.$element
      .addClass('collapsing')
      .removeClass('collapse')
      .removeClass('in')

    this.transitioning = 1

    var complete = function () {
      this.transitioning = 0
      this.$element
        .trigger('hidden.bs.collapse')
        .removeClass('collapsing')
        .addClass('collapse')
    }

    if (!$.support.transition) return complete.call(this)

    this.$element
      [dimension](0)
      .one($.support.transition.end, $.proxy(complete, this))
      .emulateTransitionEnd(350)
  }

  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']()
  }


  // COLLAPSE PLUGIN DEFINITION
  // ==========================

  var old = $.fn.collapse

  $.fn.collapse = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.collapse')
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.collapse.Constructor = Collapse


  // COLLAPSE NO CONFLICT
  // ====================

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


  // COLLAPSE DATA-API
  // =================

  $(document).on('click.bs.collapse.data-api', '[data-toggle=collapse]', function (e) {
    var $this   = $(this), href
    var target  = $this.attr('data-target')
        || e.preventDefault()
        || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') //strip for ie7
    var $target = $(target)
    var data    = $target.data('bs.collapse')
    var option  = data ? 'toggle' : $this.data()
    var parent  = $this.attr('data-parent')
    var $parent = parent && $(parent)

    if (!data || !data.transitioning) {
      if ($parent) $parent.find('[data-toggle=collapse][data-parent="' + parent + '"]').not($this).addClass('collapsed')
      $this[$target.hasClass('in') ? 'addClass' : 'removeClass']('collapsed')
    }

    $target.collapse(option)
  })

}(window.jQuery);

/* ========================================================================
 * Bootstrap: dropdown.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#dropdowns
 * ========================================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // DROPDOWN CLASS DEFINITION
  // =========================

  var backdrop = '.dropdown-backdrop'
  var toggle   = '[data-toggle=dropdown]'
  var Dropdown = function (element) {
    var $el = $(element).on('click.bs.dropdown', this.toggle)
  }

  Dropdown.prototype.toggle = function (e) {
    var $this = $(this)

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    clearMenus()

    if (!isActive) {
      if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
        // if mobile we we use a backdrop because click events don't delegate
        $('<div class="dropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus)
      }

      $parent.trigger(e = $.Event('show.bs.dropdown'))

      if (e.isDefaultPrevented()) return

      $parent
        .toggleClass('open')
        .trigger('shown.bs.dropdown')

      $this.focus()
    }

    return false
  }

  Dropdown.prototype.keydown = function (e) {
    if (!/(38|40|27)/.test(e.keyCode)) return

    var $this = $(this)

    e.preventDefault()
    e.stopPropagation()

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    if (!isActive || (isActive && e.keyCode == 27)) {
      if (e.which == 27) $parent.find(toggle).focus()
      return $this.click()
    }

    var $items = $('[role=menu] li:not(.divider):visible a', $parent)

    if (!$items.length) return

    var index = $items.index($items.filter(':focus'))

    if (e.keyCode == 38 && index > 0)                 index--                        // up
    if (e.keyCode == 40 && index < $items.length - 1) index++                        // down
    if (!~index)                                      index=0

    $items.eq(index).focus()
  }

  function clearMenus() {
    $(backdrop).remove()
    $(toggle).each(function (e) {
      var $parent = getParent($(this))
      if (!$parent.hasClass('open')) return
      $parent.trigger(e = $.Event('hide.bs.dropdown'))
      if (e.isDefaultPrevented()) return
      $parent.removeClass('open').trigger('hidden.bs.dropdown')
    })
  }

  function getParent($this) {
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
    }

    var $parent = selector && $(selector)

    return $parent && $parent.length ? $parent : $this.parent()
  }


  // DROPDOWN PLUGIN DEFINITION
  // ==========================

  var old = $.fn.dropdown

  $.fn.dropdown = function (option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('dropdown')

      if (!data) $this.data('dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  $.fn.dropdown.Constructor = Dropdown


  // DROPDOWN NO CONFLICT
  // ====================

  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }


  // APPLY TO STANDARD DROPDOWN ELEMENTS
  // ===================================

  $(document)
    .on('click.bs.dropdown.data-api', clearMenus)
    .on('click.bs.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
    .on('click.bs.dropdown.data-api'  , toggle, Dropdown.prototype.toggle)
    .on('keydown.bs.dropdown.data-api', toggle + ', [role=menu]' , Dropdown.prototype.keydown)

}(window.jQuery);

/* ========================================================================
 * Bootstrap: modal.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#modals
 * ========================================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // MODAL CLASS DEFINITION
  // ======================

  var Modal = function (element, options) {
    this.options   = options
    this.$element  = $(element)
    this.$backdrop =
    this.isShown   = null

    if (this.options.remote) this.$element.load(this.options.remote)
  }

  Modal.DEFAULTS = {
      backdrop: true
    , keyboard: true
    , show: true
  }

  Modal.prototype.toggle = function (_relatedTarget) {
    return this[!this.isShown ? 'show' : 'hide'](_relatedTarget)
  }

  Modal.prototype.show = function (_relatedTarget) {
    var that = this
    var e    = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })

    this.$element.trigger(e)

    if (this.isShown || e.isDefaultPrevented()) return

    this.isShown = true

    this.escape()

    this.$element.on('click.dismiss.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade')

      if (!that.$element.parent().length) {
        that.$element.appendTo(document.body) // don't move modals dom position
      }

      that.$element.show()

      if (transition) {
        that.$element[0].offsetWidth // force reflow
      }

      that.$element
        .addClass('in')
        .attr('aria-hidden', false)

      that.enforceFocus()

      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })

      transition ?
        that.$element.find('.modal-dialog') // wait for modal to slide in
          .one($.support.transition.end, function () {
            that.$element.focus().trigger(e)
          })
          .emulateTransitionEnd(300) :
        that.$element.focus().trigger(e)
    })
  }

  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault()

    e = $.Event('hide.bs.modal')

    this.$element.trigger(e)

    if (!this.isShown || e.isDefaultPrevented()) return

    this.isShown = false

    this.escape()

    $(document).off('focusin.bs.modal')

    this.$element
      .removeClass('in')
      .attr('aria-hidden', true)
      .off('click.dismiss.modal')

    $.support.transition && this.$element.hasClass('fade') ?
      this.$element
        .one($.support.transition.end, $.proxy(this.hideModal, this))
        .emulateTransitionEnd(300) :
      this.hideModal()
  }

  Modal.prototype.enforceFocus = function () {
    $(document)
      .off('focusin.bs.modal') // guard against infinite focus loop
      .on('focusin.bs.modal', $.proxy(function (e) {
        if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
          this.$element.focus()
        }
      }, this))
  }

  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keyup.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide()
      }, this))
    } else if (!this.isShown) {
      this.$element.off('keyup.dismiss.bs.modal')
    }
  }

  Modal.prototype.hideModal = function () {
    var that = this
    this.$element.hide()
    this.backdrop(function () {
      that.removeBackdrop()
      that.$element.trigger('hidden.bs.modal')
    })
  }

  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove()
    this.$backdrop = null
  }

  Modal.prototype.backdrop = function (callback) {
    var that    = this
    var animate = this.$element.hasClass('fade') ? 'fade' : ''

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate

      this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />')
        .appendTo(document.body)

      this.$element.on('click.dismiss.modal', $.proxy(function (e) {
        if (e.target !== e.currentTarget) return
        this.options.backdrop == 'static'
          ? this.$element[0].focus.call(this.$element[0])
          : this.hide.call(this)
      }, this))

      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      this.$backdrop.addClass('in')

      if (!callback) return

      doAnimate ?
        this.$backdrop
          .one($.support.transition.end, callback)
          .emulateTransitionEnd(150) :
        callback()

    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')

      $.support.transition && this.$element.hasClass('fade')?
        this.$backdrop
          .one($.support.transition.end, callback)
          .emulateTransitionEnd(150) :
        callback()

    } else if (callback) {
      callback()
    }
  }


  // MODAL PLUGIN DEFINITION
  // =======================

  var old = $.fn.modal

  $.fn.modal = function (option, _relatedTarget) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.modal')
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option](_relatedTarget)
      else if (options.show) data.show(_relatedTarget)
    })
  }

  $.fn.modal.Constructor = Modal


  // MODAL NO CONFLICT
  // =================

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }


  // MODAL DATA-API
  // ==============

  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this   = $(this)
    var href    = $this.attr('href')
    var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) //strip for ie7
    var option  = $target.data('modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

    e.preventDefault()

    $target
      .modal(option, this)
      .one('hide', function () {
        $this.is(':visible') && $this.focus()
      })
  })

  $(document)
    .on('show.bs.modal',  '.modal', function () { $(document.body).addClass('modal-open') })
    .on('hidden.bs.modal', '.modal', function () { $(document.body).removeClass('modal-open') })

}(window.jQuery);

/* ========================================================================
 * Bootstrap: tooltip.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // TOOLTIP PUBLIC CLASS DEFINITION
  // ===============================

  var Tooltip = function (element, options) {
    this.type       =
    this.options    =
    this.enabled    =
    this.timeout    =
    this.hoverState =
    this.$element   = null

    this.init('tooltip', element, options)
  }

  Tooltip.DEFAULTS = {
    animation: true
  , placement: 'top'
  , selector: false
  , template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
  , trigger: 'hover focus'
  , title: ''
  , delay: 0
  , html: false
  , container: false
  }

  Tooltip.prototype.init = function (type, element, options) {
    this.enabled  = true
    this.type     = type
    this.$element = $(element)
    this.options  = this.getOptions(options)

    var triggers = this.options.trigger.split(' ')

    for (var i = triggers.length; i--;) {
      var trigger = triggers[i]

      if (trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
      } else if (trigger != 'manual') {
        var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focus'
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'blur'

        this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
      }
    }

    this.options.selector ?
      (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
      this.fixTitle()
  }

  Tooltip.prototype.getDefaults = function () {
    return Tooltip.DEFAULTS
  }

  Tooltip.prototype.getOptions = function (options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options)

    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay
      , hide: options.delay
      }
    }

    return options
  }

  Tooltip.prototype.getDelegateOptions = function () {
    var options  = {}
    var defaults = this.getDefaults()

    this._options && $.each(this._options, function (key, value) {
      if (defaults[key] != value) options[key] = value
    })

    return options
  }

  Tooltip.prototype.enter = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type)

    clearTimeout(self.timeout)

    self.hoverState = 'in'

    if (!self.options.delay || !self.options.delay.show) return self.show()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'in') self.show()
    }, self.options.delay.show)
  }

  Tooltip.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type)

    clearTimeout(self.timeout)

    self.hoverState = 'out'

    if (!self.options.delay || !self.options.delay.hide) return self.hide()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'out') self.hide()
    }, self.options.delay.hide)
  }

  Tooltip.prototype.show = function () {
    var e = $.Event('show.bs.'+ this.type)

    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e)

      if (e.isDefaultPrevented()) return

      var $tip = this.tip()

      this.setContent()

      if (this.options.animation) $tip.addClass('fade')

      var placement = typeof this.options.placement == 'function' ?
        this.options.placement.call(this, $tip[0], this.$element[0]) :
        this.options.placement

      var autoToken = /\s?auto?\s?/i
      var autoPlace = autoToken.test(placement)
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

      $tip
        .detach()
        .css({ top: 0, left: 0, display: 'block' })
        .addClass(placement)

      this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)

      var pos          = this.getPosition()
      var actualWidth  = $tip[0].offsetWidth
      var actualHeight = $tip[0].offsetHeight

      if (autoPlace) {
        var $parent = this.$element.parent()

        var orgPlacement = placement
        var docScroll    = document.documentElement.scrollTop || document.body.scrollTop
        var parentWidth  = this.options.container == 'body' ? window.innerWidth  : $parent.outerWidth()
        var parentHeight = this.options.container == 'body' ? window.innerHeight : $parent.outerHeight()
        var parentLeft   = this.options.container == 'body' ? 0 : $parent.offset().left

        placement = placement == 'bottom' && pos.top   + pos.height  + actualHeight - docScroll > parentHeight  ? 'top'    :
                    placement == 'top'    && pos.top   - docScroll   - actualHeight < 0                         ? 'bottom' :
                    placement == 'right'  && pos.right + actualWidth > parentWidth                              ? 'left'   :
                    placement == 'left'   && pos.left  - actualWidth < parentLeft                               ? 'right'  :
                    placement

        $tip
          .removeClass(orgPlacement)
          .addClass(placement)
      }

      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

      this.applyPlacement(calculatedOffset, placement)
      this.$element.trigger('shown.bs.' + this.type)
    }
  }

  Tooltip.prototype.applyPlacement = function(offset, placement) {
    var replace
    var $tip   = this.tip()
    var width  = $tip[0].offsetWidth
    var height = $tip[0].offsetHeight

    // manually read margins because getBoundingClientRect includes difference
    var marginTop = parseInt($tip.css('margin-top'), 10)
    var marginLeft = parseInt($tip.css('margin-left'), 10)

    // we must check for NaN for ie 8/9
    if (isNaN(marginTop))  marginTop  = 0
    if (isNaN(marginLeft)) marginLeft = 0

    offset.top  = offset.top  + marginTop
    offset.left = offset.left + marginLeft

    $tip
      .offset(offset)
      .addClass('in')

    // check to see if placing tip in new offset caused the tip to resize itself
    var actualWidth  = $tip[0].offsetWidth
    var actualHeight = $tip[0].offsetHeight

    if (placement == 'top' && actualHeight != height) {
      replace = true
      offset.top = offset.top + height - actualHeight
    }

    if (/bottom|top/.test(placement)) {
      var delta = 0

      if (offset.left < 0) {
        delta       = offset.left * -2
        offset.left = 0

        $tip.offset(offset)

        actualWidth  = $tip[0].offsetWidth
        actualHeight = $tip[0].offsetHeight
      }

      this.replaceArrow(delta - width + actualWidth, actualWidth, 'left')
    } else {
      this.replaceArrow(actualHeight - height, actualHeight, 'top')
    }

    if (replace) $tip.offset(offset)
  }

  Tooltip.prototype.replaceArrow = function(delta, dimension, position) {
    this.arrow().css(position, delta ? (50 * (1 - delta / dimension) + "%") : '')
  }

  Tooltip.prototype.setContent = function () {
    var $tip  = this.tip()
    var title = this.getTitle()

    $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
    $tip.removeClass('fade in top bottom left right')
  }

  Tooltip.prototype.hide = function () {
    var that = this
    var $tip = this.tip()
    var e    = $.Event('hide.bs.' + this.type)

    function complete() {
      if (that.hoverState != 'in') $tip.detach()
    }

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    $tip.removeClass('in')

    $.support.transition && this.$tip.hasClass('fade') ?
      $tip
        .one($.support.transition.end, complete)
        .emulateTransitionEnd(150) :
      complete()

    this.$element.trigger('hidden.bs.' + this.type)

    return this
  }

  Tooltip.prototype.fixTitle = function () {
    var $e = this.$element
    if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
    }
  }

  Tooltip.prototype.hasContent = function () {
    return this.getTitle()
  }

  Tooltip.prototype.getPosition = function () {
    var el = this.$element[0]
    return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : {
      width: el.offsetWidth
    , height: el.offsetHeight
    }, this.$element.offset())
  }

  Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
    return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2  } :
           placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2  } :
           placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
        /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width   }
  }

  Tooltip.prototype.getTitle = function () {
    var title
    var $e = this.$element
    var o  = this.options

    title = $e.attr('data-original-title')
      || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

    return title
  }

  Tooltip.prototype.tip = function () {
    return this.$tip = this.$tip || $(this.options.template)
  }

  Tooltip.prototype.arrow = function () {
    return this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow')
  }

  Tooltip.prototype.validate = function () {
    if (!this.$element[0].parentNode) {
      this.hide()
      this.$element = null
      this.options  = null
    }
  }

  Tooltip.prototype.enable = function () {
    this.enabled = true
  }

  Tooltip.prototype.disable = function () {
    this.enabled = false
  }

  Tooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled
  }

  Tooltip.prototype.toggle = function (e) {
    var self = e ? $(e.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type) : this
    self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
  }

  Tooltip.prototype.destroy = function () {
    this.hide().$element.off('.' + this.type).removeData('bs.' + this.type)
  }


  // TOOLTIP PLUGIN DEFINITION
  // =========================

  var old = $.fn.tooltip

  $.fn.tooltip = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.tooltip')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tooltip.Constructor = Tooltip


  // TOOLTIP NO CONFLICT
  // ===================

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old
    return this
  }

}(window.jQuery);

/* ========================================================================
 * Bootstrap: popover.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#popovers
 * ========================================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // POPOVER PUBLIC CLASS DEFINITION
  // ===============================

  var Popover = function (element, options) {
    this.init('popover', element, options)
  }

  if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js')

  Popover.DEFAULTS = $.extend({} , $.fn.tooltip.Constructor.DEFAULTS, {
    placement: 'right'
  , trigger: 'click'
  , content: ''
  , template: '<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
  })


  // NOTE: POPOVER EXTENDS tooltip.js
  // ================================

  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)

  Popover.prototype.constructor = Popover

  Popover.prototype.getDefaults = function () {
    return Popover.DEFAULTS
  }

  Popover.prototype.setContent = function () {
    var $tip    = this.tip()
    var title   = this.getTitle()
    var content = this.getContent()

    $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
    $tip.find('.popover-content')[this.options.html ? 'html' : 'text'](content)

    $tip.removeClass('fade top bottom left right in')

    // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
    // this manually by checking the contents.
    if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
  }

  Popover.prototype.hasContent = function () {
    return this.getTitle() || this.getContent()
  }

  Popover.prototype.getContent = function () {
    var $e = this.$element
    var o  = this.options

    return $e.attr('data-content')
      || (typeof o.content == 'function' ?
            o.content.call($e[0]) :
            o.content)
  }

  Popover.prototype.arrow = function () {
    return this.$arrow = this.$arrow || this.tip().find('.arrow')
  }

  Popover.prototype.tip = function () {
    if (!this.$tip) this.$tip = $(this.options.template)
    return this.$tip
  }


  // POPOVER PLUGIN DEFINITION
  // =========================

  var old = $.fn.popover

  $.fn.popover = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.popover')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.popover', (data = new Popover(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.popover.Constructor = Popover


  // POPOVER NO CONFLICT
  // ===================

  $.fn.popover.noConflict = function () {
    $.fn.popover = old
    return this
  }

}(window.jQuery);

/* ========================================================================
 * Bootstrap: scrollspy.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#scrollspy
 * ========================================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // SCROLLSPY CLASS DEFINITION
  // ==========================

  function ScrollSpy(element, options) {
    var href
    var process  = $.proxy(this.process, this)

    this.$element       = $(element).is('body') ? $(window) : $(element)
    this.$body          = $('body')
    this.$scrollElement = this.$element.on('scroll.bs.scroll-spy.data-api', process)
    this.options        = $.extend({}, ScrollSpy.DEFAULTS, options)
    this.selector       = (this.options.target
      || ((href = $(element).attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) //strip for ie7
      || '') + ' .nav li > a'
    this.offsets        = $([])
    this.targets        = $([])
    this.activeTarget   = null

    this.refresh()
    this.process()
  }

  ScrollSpy.DEFAULTS = {
    offset: 10
  }

  ScrollSpy.prototype.refresh = function () {
    var offsetMethod = this.$element[0] == window ? 'offset' : 'position'

    this.offsets = $([])
    this.targets = $([])

    var self     = this
    var $targets = this.$body
      .find(this.selector)
      .map(function () {
        var $el   = $(this)
        var href  = $el.data('target') || $el.attr('href')
        var $href = /^#\w/.test(href) && $(href)

        return ($href
          && $href.length
          && [[ $href[offsetMethod]().top + (!$.isWindow(self.$scrollElement.get(0)) && self.$scrollElement.scrollTop()), href ]]) || null
      })
      .sort(function (a, b) { return a[0] - b[0] })
      .each(function () {
        self.offsets.push(this[0])
        self.targets.push(this[1])
      })
  }

  ScrollSpy.prototype.process = function () {
    var scrollTop    = this.$scrollElement.scrollTop() + this.options.offset
    var scrollHeight = this.$scrollElement[0].scrollHeight || this.$body[0].scrollHeight
    var maxScroll    = scrollHeight - this.$scrollElement.height()
    var offsets      = this.offsets
    var targets      = this.targets
    var activeTarget = this.activeTarget
    var i

    if (scrollTop >= maxScroll) {
      return activeTarget != (i = targets.last()[0]) && this.activate(i)
    }

    for (i = offsets.length; i--;) {
      activeTarget != targets[i]
        && scrollTop >= offsets[i]
        && (!offsets[i + 1] || scrollTop <= offsets[i + 1])
        && this.activate( targets[i] )
    }
  }

  ScrollSpy.prototype.activate = function (target) {
    this.activeTarget = target

    $(this.selector)
      .parents('.active')
      .removeClass('active')

    var selector = this.selector
      + '[data-target="' + target + '"],'
      + this.selector + '[href="' + target + '"]'

    var active = $(selector)
      .parents('li')
      .addClass('active')

    if (active.parent('.dropdown-menu').length)  {
      active = active
        .closest('li.dropdown')
        .addClass('active')
    }

    active.trigger('activate')
  }


  // SCROLLSPY PLUGIN DEFINITION
  // ===========================

  var old = $.fn.scrollspy

  $.fn.scrollspy = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.scrollspy')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.scrollspy.Constructor = ScrollSpy


  // SCROLLSPY NO CONFLICT
  // =====================

  $.fn.scrollspy.noConflict = function () {
    $.fn.scrollspy = old
    return this
  }


  // SCROLLSPY DATA-API
  // ==================

  $(window).on('load', function () {
    $('[data-spy="scroll"]').each(function () {
      var $spy = $(this)
      $spy.scrollspy($spy.data())
    })
  })

}(window.jQuery);

/* ========================================================================
 * Bootstrap: tab.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#tabs
 * ========================================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // TAB CLASS DEFINITION
  // ====================

  var Tab = function (element) {
    this.element = $(element)
  }

  Tab.prototype.show = function () {
    var $this    = this.element
    var $ul      = $this.closest('ul:not(.dropdown-menu)')
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
    }

    if ($this.parent('li').hasClass('active')) return

    var previous = $ul.find('.active:last a')[0]
    var e        = $.Event('show.bs.tab', {
      relatedTarget: previous
    })

    $this.trigger(e)

    if (e.isDefaultPrevented()) return

    var $target = $(selector)

    this.activate($this.parent('li'), $ul)
    this.activate($target, $target.parent(), function () {
      $this.trigger({
        type: 'shown.bs.tab'
      , relatedTarget: previous
      })
    })
  }

  Tab.prototype.activate = function (element, container, callback) {
    var $active    = container.find('> .active')
    var transition = callback
      && $.support.transition
      && $active.hasClass('fade')

    function next() {
      $active
        .removeClass('active')
        .find('> .dropdown-menu > .active')
        .removeClass('active')

      element.addClass('active')

      if (transition) {
        element[0].offsetWidth // reflow for transition
        element.addClass('in')
      } else {
        element.removeClass('fade')
      }

      if (element.parent('.dropdown-menu')) {
        element.closest('li.dropdown').addClass('active')
      }

      callback && callback()
    }

    transition ?
      $active
        .one($.support.transition.end, next)
        .emulateTransitionEnd(150) :
      next()

    $active.removeClass('in')
  }


  // TAB PLUGIN DEFINITION
  // =====================

  var old = $.fn.tab

  $.fn.tab = function ( option ) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.tab')

      if (!data) $this.data('bs.tab', (data = new Tab(this)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tab.Constructor = Tab


  // TAB NO CONFLICT
  // ===============

  $.fn.tab.noConflict = function () {
    $.fn.tab = old
    return this
  }


  // TAB DATA-API
  // ============

  $(document).on('click.bs.tab.data-api', '[data-toggle="tab"], [data-toggle="pill"]', function (e) {
    e.preventDefault()
    $(this).tab('show')
  })

}(window.jQuery);

/* ========================================================================
 * Bootstrap: affix.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#affix
 * ========================================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // AFFIX CLASS DEFINITION
  // ======================

  var Affix = function (element, options) {
    this.options = $.extend({}, Affix.DEFAULTS, options)
    this.$window = $(window)
      .on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this))
      .on('click.bs.affix.data-api',  $.proxy(this.checkPositionWithEventLoop, this))

    this.$element = $(element)
    this.affixed  =
    this.unpin    = null

    this.checkPosition()
  }

  Affix.RESET = 'affix affix-top affix-bottom'

  Affix.DEFAULTS = {
    offset: 0
  }

  Affix.prototype.checkPositionWithEventLoop = function () {
    setTimeout($.proxy(this.checkPosition, this), 1)
  }

  Affix.prototype.checkPosition = function () {
    if (!this.$element.is(':visible')) return

    var scrollHeight = $(document).height()
    var scrollTop    = this.$window.scrollTop()
    var position     = this.$element.offset()
    var offset       = this.options.offset
    var offsetTop    = offset.top
    var offsetBottom = offset.bottom

    if (typeof offset != 'object')         offsetBottom = offsetTop = offset
    if (typeof offsetTop == 'function')    offsetTop    = offset.top()
    if (typeof offsetBottom == 'function') offsetBottom = offset.bottom()

    var affix = this.unpin   != null && (scrollTop + this.unpin <= position.top) ? false :
                offsetBottom != null && (position.top + this.$element.height() >= scrollHeight - offsetBottom) ? 'bottom' :
                offsetTop    != null && (scrollTop <= offsetTop) ? 'top' : false

    if (this.affixed === affix) return
    if (this.unpin) this.$element.css('top', '')

    this.affixed = affix
    this.unpin   = affix == 'bottom' ? position.top - scrollTop : null

    this.$element.removeClass(Affix.RESET).addClass('affix' + (affix ? '-' + affix : ''))

    if (affix == 'bottom') {
      this.$element.offset({ top: document.body.offsetHeight - offsetBottom - this.$element.height() })
    }
  }


  // AFFIX PLUGIN DEFINITION
  // =======================

  var old = $.fn.affix

  $.fn.affix = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.affix')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.affix', (data = new Affix(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.affix.Constructor = Affix


  // AFFIX NO CONFLICT
  // =================

  $.fn.affix.noConflict = function () {
    $.fn.affix = old
    return this
  }


  // AFFIX DATA-API
  // ==============

  $(window).on('load', function () {
    $('[data-spy="affix"]').each(function () {
      var $spy = $(this)
      var data = $spy.data()

      data.offset = data.offset || {}

      if (data.offsetBottom) data.offset.bottom = data.offsetBottom
      if (data.offsetTop)    data.offset.top    = data.offsetTop

      $spy.affix(data)
    })
  })

}(window.jQuery);

}).call(global, module, undefined);

},{"jQuery":"yMbvdo"}],"bootstrap":[function(require,module,exports){
module.exports=require('K5SPyQ');
},{}],"yMbvdo":[function(require,module,exports){
/*!
 * jQuery JavaScript Library v1.10.2
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2005, 2013 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2013-07-03T13:48Z
 */
(function( window, undefined ) {

// Can't do this because several apps including ASP.NET trace
// the stack via arguments.caller.callee and Firefox dies if
// you try to trace through "use strict" call chains. (#13335)
// Support: Firefox 18+
//"use strict";
var
  // The deferred used on DOM ready
  readyList,

  // A central reference to the root jQuery(document)
  rootjQuery,

  // Support: IE<10
  // For `typeof xmlNode.method` instead of `xmlNode.method !== undefined`
  core_strundefined = typeof undefined,

  // Use the correct document accordingly with window argument (sandbox)
  location = window.location,
  document = window.document,
  docElem = document.documentElement,

  // Map over jQuery in case of overwrite
  _jQuery = window.jQuery,

  // Map over the $ in case of overwrite
  _$ = window.$,

  // [[Class]] -> type pairs
  class2type = {},

  // List of deleted data cache ids, so we can reuse them
  core_deletedIds = [],

  core_version = "1.10.2",

  // Save a reference to some core methods
  core_concat = core_deletedIds.concat,
  core_push = core_deletedIds.push,
  core_slice = core_deletedIds.slice,
  core_indexOf = core_deletedIds.indexOf,
  core_toString = class2type.toString,
  core_hasOwn = class2type.hasOwnProperty,
  core_trim = core_version.trim,

  // Define a local copy of jQuery
  jQuery = function( selector, context ) {
    // The jQuery object is actually just the init constructor 'enhanced'
    return new jQuery.fn.init( selector, context, rootjQuery );
  },

  // Used for matching numbers
  core_pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,

  // Used for splitting on whitespace
  core_rnotwhite = /\S+/g,

  // Make sure we trim BOM and NBSP (here's looking at you, Safari 5.0 and IE)
  rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

  // A simple way to check for HTML strings
  // Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
  // Strict HTML recognition (#11290: must start with <)
  rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,

  // Match a standalone tag
  rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,

  // JSON RegExp
  rvalidchars = /^[\],:{}\s]*$/,
  rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,
  rvalidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
  rvalidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g,

  // Matches dashed string for camelizing
  rmsPrefix = /^-ms-/,
  rdashAlpha = /-([\da-z])/gi,

  // Used by jQuery.camelCase as callback to replace()
  fcamelCase = function( all, letter ) {
    return letter.toUpperCase();
  },

  // The ready event handler
  completed = function( event ) {

    // readyState === "complete" is good enough for us to call the dom ready in oldIE
    if ( document.addEventListener || event.type === "load" || document.readyState === "complete" ) {
      detach();
      jQuery.ready();
    }
  },
  // Clean-up method for dom ready events
  detach = function() {
    if ( document.addEventListener ) {
      document.removeEventListener( "DOMContentLoaded", completed, false );
      window.removeEventListener( "load", completed, false );

    } else {
      document.detachEvent( "onreadystatechange", completed );
      window.detachEvent( "onload", completed );
    }
  };

jQuery.fn = jQuery.prototype = {
  // The current version of jQuery being used
  jquery: core_version,

  constructor: jQuery,
  init: function( selector, context, rootjQuery ) {
    var match, elem;

    // HANDLE: $(""), $(null), $(undefined), $(false)
    if ( !selector ) {
      return this;
    }

    // Handle HTML strings
    if ( typeof selector === "string" ) {
      if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
        // Assume that strings that start and end with <> are HTML and skip the regex check
        match = [ null, selector, null ];

      } else {
        match = rquickExpr.exec( selector );
      }

      // Match html or make sure no context is specified for #id
      if ( match && (match[1] || !context) ) {

        // HANDLE: $(html) -> $(array)
        if ( match[1] ) {
          context = context instanceof jQuery ? context[0] : context;

          // scripts is true for back-compat
          jQuery.merge( this, jQuery.parseHTML(
            match[1],
            context && context.nodeType ? context.ownerDocument || context : document,
            true
          ) );

          // HANDLE: $(html, props)
          if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {
            for ( match in context ) {
              // Properties of context are called as methods if possible
              if ( jQuery.isFunction( this[ match ] ) ) {
                this[ match ]( context[ match ] );

              // ...and otherwise set as attributes
              } else {
                this.attr( match, context[ match ] );
              }
            }
          }

          return this;

        // HANDLE: $(#id)
        } else {
          elem = document.getElementById( match[2] );

          // Check parentNode to catch when Blackberry 4.6 returns
          // nodes that are no longer in the document #6963
          if ( elem && elem.parentNode ) {
            // Handle the case where IE and Opera return items
            // by name instead of ID
            if ( elem.id !== match[2] ) {
              return rootjQuery.find( selector );
            }

            // Otherwise, we inject the element directly into the jQuery object
            this.length = 1;
            this[0] = elem;
          }

          this.context = document;
          this.selector = selector;
          return this;
        }

      // HANDLE: $(expr, $(...))
      } else if ( !context || context.jquery ) {
        return ( context || rootjQuery ).find( selector );

      // HANDLE: $(expr, context)
      // (which is just equivalent to: $(context).find(expr)
      } else {
        return this.constructor( context ).find( selector );
      }

    // HANDLE: $(DOMElement)
    } else if ( selector.nodeType ) {
      this.context = this[0] = selector;
      this.length = 1;
      return this;

    // HANDLE: $(function)
    // Shortcut for document ready
    } else if ( jQuery.isFunction( selector ) ) {
      return rootjQuery.ready( selector );
    }

    if ( selector.selector !== undefined ) {
      this.selector = selector.selector;
      this.context = selector.context;
    }

    return jQuery.makeArray( selector, this );
  },

  // Start with an empty selector
  selector: "",

  // The default length of a jQuery object is 0
  length: 0,

  toArray: function() {
    return core_slice.call( this );
  },

  // Get the Nth element in the matched element set OR
  // Get the whole matched element set as a clean array
  get: function( num ) {
    return num == null ?

      // Return a 'clean' array
      this.toArray() :

      // Return just the object
      ( num < 0 ? this[ this.length + num ] : this[ num ] );
  },

  // Take an array of elements and push it onto the stack
  // (returning the new matched element set)
  pushStack: function( elems ) {

    // Build a new jQuery matched element set
    var ret = jQuery.merge( this.constructor(), elems );

    // Add the old object onto the stack (as a reference)
    ret.prevObject = this;
    ret.context = this.context;

    // Return the newly-formed element set
    return ret;
  },

  // Execute a callback for every element in the matched set.
  // (You can seed the arguments with an array of args, but this is
  // only used internally.)
  each: function( callback, args ) {
    return jQuery.each( this, callback, args );
  },

  ready: function( fn ) {
    // Add the callback
    jQuery.ready.promise().done( fn );

    return this;
  },

  slice: function() {
    return this.pushStack( core_slice.apply( this, arguments ) );
  },

  first: function() {
    return this.eq( 0 );
  },

  last: function() {
    return this.eq( -1 );
  },

  eq: function( i ) {
    var len = this.length,
      j = +i + ( i < 0 ? len : 0 );
    return this.pushStack( j >= 0 && j < len ? [ this[j] ] : [] );
  },

  map: function( callback ) {
    return this.pushStack( jQuery.map(this, function( elem, i ) {
      return callback.call( elem, i, elem );
    }));
  },

  end: function() {
    return this.prevObject || this.constructor(null);
  },

  // For internal use only.
  // Behaves like an Array's method, not like a jQuery method.
  push: core_push,
  sort: [].sort,
  splice: [].splice
};

// Give the init function the jQuery prototype for later instantiation
jQuery.fn.init.prototype = jQuery.fn;

jQuery.extend = jQuery.fn.extend = function() {
  var src, copyIsArray, copy, name, options, clone,
    target = arguments[0] || {},
    i = 1,
    length = arguments.length,
    deep = false;

  // Handle a deep copy situation
  if ( typeof target === "boolean" ) {
    deep = target;
    target = arguments[1] || {};
    // skip the boolean and the target
    i = 2;
  }

  // Handle case when target is a string or something (possible in deep copy)
  if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
    target = {};
  }

  // extend jQuery itself if only one argument is passed
  if ( length === i ) {
    target = this;
    --i;
  }

  for ( ; i < length; i++ ) {
    // Only deal with non-null/undefined values
    if ( (options = arguments[ i ]) != null ) {
      // Extend the base object
      for ( name in options ) {
        src = target[ name ];
        copy = options[ name ];

        // Prevent never-ending loop
        if ( target === copy ) {
          continue;
        }

        // Recurse if we're merging plain objects or arrays
        if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
          if ( copyIsArray ) {
            copyIsArray = false;
            clone = src && jQuery.isArray(src) ? src : [];

          } else {
            clone = src && jQuery.isPlainObject(src) ? src : {};
          }

          // Never move original objects, clone them
          target[ name ] = jQuery.extend( deep, clone, copy );

        // Don't bring in undefined values
        } else if ( copy !== undefined ) {
          target[ name ] = copy;
        }
      }
    }
  }

  // Return the modified object
  return target;
};

jQuery.extend({
  // Unique for each copy of jQuery on the page
  // Non-digits removed to match rinlinejQuery
  expando: "jQuery" + ( core_version + Math.random() ).replace( /\D/g, "" ),

  noConflict: function( deep ) {
    if ( window.$ === jQuery ) {
      window.$ = _$;
    }

    if ( deep && window.jQuery === jQuery ) {
      window.jQuery = _jQuery;
    }

    return jQuery;
  },

  // Is the DOM ready to be used? Set to true once it occurs.
  isReady: false,

  // A counter to track how many items to wait for before
  // the ready event fires. See #6781
  readyWait: 1,

  // Hold (or release) the ready event
  holdReady: function( hold ) {
    if ( hold ) {
      jQuery.readyWait++;
    } else {
      jQuery.ready( true );
    }
  },

  // Handle when the DOM is ready
  ready: function( wait ) {

    // Abort if there are pending holds or we're already ready
    if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
      return;
    }

    // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
    if ( !document.body ) {
      return setTimeout( jQuery.ready );
    }

    // Remember that the DOM is ready
    jQuery.isReady = true;

    // If a normal DOM Ready event fired, decrement, and wait if need be
    if ( wait !== true && --jQuery.readyWait > 0 ) {
      return;
    }

    // If there are functions bound, to execute
    readyList.resolveWith( document, [ jQuery ] );

    // Trigger any bound ready events
    if ( jQuery.fn.trigger ) {
      jQuery( document ).trigger("ready").off("ready");
    }
  },

  // See test/unit/core.js for details concerning isFunction.
  // Since version 1.3, DOM methods and functions like alert
  // aren't supported. They return false on IE (#2968).
  isFunction: function( obj ) {
    return jQuery.type(obj) === "function";
  },

  isArray: Array.isArray || function( obj ) {
    return jQuery.type(obj) === "array";
  },

  isWindow: function( obj ) {
    /* jshint eqeqeq: false */
    return obj != null && obj == obj.window;
  },

  isNumeric: function( obj ) {
    return !isNaN( parseFloat(obj) ) && isFinite( obj );
  },

  type: function( obj ) {
    if ( obj == null ) {
      return String( obj );
    }
    return typeof obj === "object" || typeof obj === "function" ?
      class2type[ core_toString.call(obj) ] || "object" :
      typeof obj;
  },

  isPlainObject: function( obj ) {
    var key;

    // Must be an Object.
    // Because of IE, we also have to check the presence of the constructor property.
    // Make sure that DOM nodes and window objects don't pass through, as well
    if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
      return false;
    }

    try {
      // Not own constructor property must be Object
      if ( obj.constructor &&
        !core_hasOwn.call(obj, "constructor") &&
        !core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
        return false;
      }
    } catch ( e ) {
      // IE8,9 Will throw exceptions on certain host objects #9897
      return false;
    }

    // Support: IE<9
    // Handle iteration over inherited properties before own properties.
    if ( jQuery.support.ownLast ) {
      for ( key in obj ) {
        return core_hasOwn.call( obj, key );
      }
    }

    // Own properties are enumerated firstly, so to speed up,
    // if last one is own, then all properties are own.
    for ( key in obj ) {}

    return key === undefined || core_hasOwn.call( obj, key );
  },

  isEmptyObject: function( obj ) {
    var name;
    for ( name in obj ) {
      return false;
    }
    return true;
  },

  error: function( msg ) {
    throw new Error( msg );
  },

  // data: string of html
  // context (optional): If specified, the fragment will be created in this context, defaults to document
  // keepScripts (optional): If true, will include scripts passed in the html string
  parseHTML: function( data, context, keepScripts ) {
    if ( !data || typeof data !== "string" ) {
      return null;
    }
    if ( typeof context === "boolean" ) {
      keepScripts = context;
      context = false;
    }
    context = context || document;

    var parsed = rsingleTag.exec( data ),
      scripts = !keepScripts && [];

    // Single tag
    if ( parsed ) {
      return [ context.createElement( parsed[1] ) ];
    }

    parsed = jQuery.buildFragment( [ data ], context, scripts );
    if ( scripts ) {
      jQuery( scripts ).remove();
    }
    return jQuery.merge( [], parsed.childNodes );
  },

  parseJSON: function( data ) {
    // Attempt to parse using the native JSON parser first
    if ( window.JSON && window.JSON.parse ) {
      return window.JSON.parse( data );
    }

    if ( data === null ) {
      return data;
    }

    if ( typeof data === "string" ) {

      // Make sure leading/trailing whitespace is removed (IE can't handle it)
      data = jQuery.trim( data );

      if ( data ) {
        // Make sure the incoming data is actual JSON
        // Logic borrowed from http://json.org/json2.js
        if ( rvalidchars.test( data.replace( rvalidescape, "@" )
          .replace( rvalidtokens, "]" )
          .replace( rvalidbraces, "")) ) {

          return ( new Function( "return " + data ) )();
        }
      }
    }

    jQuery.error( "Invalid JSON: " + data );
  },

  // Cross-browser xml parsing
  parseXML: function( data ) {
    var xml, tmp;
    if ( !data || typeof data !== "string" ) {
      return null;
    }
    try {
      if ( window.DOMParser ) { // Standard
        tmp = new DOMParser();
        xml = tmp.parseFromString( data , "text/xml" );
      } else { // IE
        xml = new ActiveXObject( "Microsoft.XMLDOM" );
        xml.async = "false";
        xml.loadXML( data );
      }
    } catch( e ) {
      xml = undefined;
    }
    if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
      jQuery.error( "Invalid XML: " + data );
    }
    return xml;
  },

  noop: function() {},

  // Evaluates a script in a global context
  // Workarounds based on findings by Jim Driscoll
  // http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
  globalEval: function( data ) {
    if ( data && jQuery.trim( data ) ) {
      // We use execScript on Internet Explorer
      // We use an anonymous function so that context is window
      // rather than jQuery in Firefox
      ( window.execScript || function( data ) {
        window[ "eval" ].call( window, data );
      } )( data );
    }
  },

  // Convert dashed to camelCase; used by the css and data modules
  // Microsoft forgot to hump their vendor prefix (#9572)
  camelCase: function( string ) {
    return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
  },

  nodeName: function( elem, name ) {
    return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
  },

  // args is for internal usage only
  each: function( obj, callback, args ) {
    var value,
      i = 0,
      length = obj.length,
      isArray = isArraylike( obj );

    if ( args ) {
      if ( isArray ) {
        for ( ; i < length; i++ ) {
          value = callback.apply( obj[ i ], args );

          if ( value === false ) {
            break;
          }
        }
      } else {
        for ( i in obj ) {
          value = callback.apply( obj[ i ], args );

          if ( value === false ) {
            break;
          }
        }
      }

    // A special, fast, case for the most common use of each
    } else {
      if ( isArray ) {
        for ( ; i < length; i++ ) {
          value = callback.call( obj[ i ], i, obj[ i ] );

          if ( value === false ) {
            break;
          }
        }
      } else {
        for ( i in obj ) {
          value = callback.call( obj[ i ], i, obj[ i ] );

          if ( value === false ) {
            break;
          }
        }
      }
    }

    return obj;
  },

  // Use native String.trim function wherever possible
  trim: core_trim && !core_trim.call("\uFEFF\xA0") ?
    function( text ) {
      return text == null ?
        "" :
        core_trim.call( text );
    } :

    // Otherwise use our own trimming functionality
    function( text ) {
      return text == null ?
        "" :
        ( text + "" ).replace( rtrim, "" );
    },

  // results is for internal usage only
  makeArray: function( arr, results ) {
    var ret = results || [];

    if ( arr != null ) {
      if ( isArraylike( Object(arr) ) ) {
        jQuery.merge( ret,
          typeof arr === "string" ?
          [ arr ] : arr
        );
      } else {
        core_push.call( ret, arr );
      }
    }

    return ret;
  },

  inArray: function( elem, arr, i ) {
    var len;

    if ( arr ) {
      if ( core_indexOf ) {
        return core_indexOf.call( arr, elem, i );
      }

      len = arr.length;
      i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

      for ( ; i < len; i++ ) {
        // Skip accessing in sparse arrays
        if ( i in arr && arr[ i ] === elem ) {
          return i;
        }
      }
    }

    return -1;
  },

  merge: function( first, second ) {
    var l = second.length,
      i = first.length,
      j = 0;

    if ( typeof l === "number" ) {
      for ( ; j < l; j++ ) {
        first[ i++ ] = second[ j ];
      }
    } else {
      while ( second[j] !== undefined ) {
        first[ i++ ] = second[ j++ ];
      }
    }

    first.length = i;

    return first;
  },

  grep: function( elems, callback, inv ) {
    var retVal,
      ret = [],
      i = 0,
      length = elems.length;
    inv = !!inv;

    // Go through the array, only saving the items
    // that pass the validator function
    for ( ; i < length; i++ ) {
      retVal = !!callback( elems[ i ], i );
      if ( inv !== retVal ) {
        ret.push( elems[ i ] );
      }
    }

    return ret;
  },

  // arg is for internal usage only
  map: function( elems, callback, arg ) {
    var value,
      i = 0,
      length = elems.length,
      isArray = isArraylike( elems ),
      ret = [];

    // Go through the array, translating each of the items to their
    if ( isArray ) {
      for ( ; i < length; i++ ) {
        value = callback( elems[ i ], i, arg );

        if ( value != null ) {
          ret[ ret.length ] = value;
        }
      }

    // Go through every key on the object,
    } else {
      for ( i in elems ) {
        value = callback( elems[ i ], i, arg );

        if ( value != null ) {
          ret[ ret.length ] = value;
        }
      }
    }

    // Flatten any nested arrays
    return core_concat.apply( [], ret );
  },

  // A global GUID counter for objects
  guid: 1,

  // Bind a function to a context, optionally partially applying any
  // arguments.
  proxy: function( fn, context ) {
    var args, proxy, tmp;

    if ( typeof context === "string" ) {
      tmp = fn[ context ];
      context = fn;
      fn = tmp;
    }

    // Quick check to determine if target is callable, in the spec
    // this throws a TypeError, but we will just return undefined.
    if ( !jQuery.isFunction( fn ) ) {
      return undefined;
    }

    // Simulated bind
    args = core_slice.call( arguments, 2 );
    proxy = function() {
      return fn.apply( context || this, args.concat( core_slice.call( arguments ) ) );
    };

    // Set the guid of unique handler to the same of original handler, so it can be removed
    proxy.guid = fn.guid = fn.guid || jQuery.guid++;

    return proxy;
  },

  // Multifunctional method to get and set values of a collection
  // The value/s can optionally be executed if it's a function
  access: function( elems, fn, key, value, chainable, emptyGet, raw ) {
    var i = 0,
      length = elems.length,
      bulk = key == null;

    // Sets many values
    if ( jQuery.type( key ) === "object" ) {
      chainable = true;
      for ( i in key ) {
        jQuery.access( elems, fn, i, key[i], true, emptyGet, raw );
      }

    // Sets one value
    } else if ( value !== undefined ) {
      chainable = true;

      if ( !jQuery.isFunction( value ) ) {
        raw = true;
      }

      if ( bulk ) {
        // Bulk operations run against the entire set
        if ( raw ) {
          fn.call( elems, value );
          fn = null;

        // ...except when executing function values
        } else {
          bulk = fn;
          fn = function( elem, key, value ) {
            return bulk.call( jQuery( elem ), value );
          };
        }
      }

      if ( fn ) {
        for ( ; i < length; i++ ) {
          fn( elems[i], key, raw ? value : value.call( elems[i], i, fn( elems[i], key ) ) );
        }
      }
    }

    return chainable ?
      elems :

      // Gets
      bulk ?
        fn.call( elems ) :
        length ? fn( elems[0], key ) : emptyGet;
  },

  now: function() {
    return ( new Date() ).getTime();
  },

  // A method for quickly swapping in/out CSS properties to get correct calculations.
  // Note: this method belongs to the css module but it's needed here for the support module.
  // If support gets modularized, this method should be moved back to the css module.
  swap: function( elem, options, callback, args ) {
    var ret, name,
      old = {};

    // Remember the old values, and insert the new ones
    for ( name in options ) {
      old[ name ] = elem.style[ name ];
      elem.style[ name ] = options[ name ];
    }

    ret = callback.apply( elem, args || [] );

    // Revert the old values
    for ( name in options ) {
      elem.style[ name ] = old[ name ];
    }

    return ret;
  }
});

jQuery.ready.promise = function( obj ) {
  if ( !readyList ) {

    readyList = jQuery.Deferred();

    // Catch cases where $(document).ready() is called after the browser event has already occurred.
    // we once tried to use readyState "interactive" here, but it caused issues like the one
    // discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
    if ( document.readyState === "complete" ) {
      // Handle it asynchronously to allow scripts the opportunity to delay ready
      setTimeout( jQuery.ready );

    // Standards-based browsers support DOMContentLoaded
    } else if ( document.addEventListener ) {
      // Use the handy event callback
      document.addEventListener( "DOMContentLoaded", completed, false );

      // A fallback to window.onload, that will always work
      window.addEventListener( "load", completed, false );

    // If IE event model is used
    } else {
      // Ensure firing before onload, maybe late but safe also for iframes
      document.attachEvent( "onreadystatechange", completed );

      // A fallback to window.onload, that will always work
      window.attachEvent( "onload", completed );

      // If IE and not a frame
      // continually check to see if the document is ready
      var top = false;

      try {
        top = window.frameElement == null && document.documentElement;
      } catch(e) {}

      if ( top && top.doScroll ) {
        (function doScrollCheck() {
          if ( !jQuery.isReady ) {

            try {
              // Use the trick by Diego Perini
              // http://javascript.nwbox.com/IEContentLoaded/
              top.doScroll("left");
            } catch(e) {
              return setTimeout( doScrollCheck, 50 );
            }

            // detach all dom ready events
            detach();

            // and execute any waiting functions
            jQuery.ready();
          }
        })();
      }
    }
  }
  return readyList.promise( obj );
};

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
  class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

function isArraylike( obj ) {
  var length = obj.length,
    type = jQuery.type( obj );

  if ( jQuery.isWindow( obj ) ) {
    return false;
  }

  if ( obj.nodeType === 1 && length ) {
    return true;
  }

  return type === "array" || type !== "function" &&
    ( length === 0 ||
    typeof length === "number" && length > 0 && ( length - 1 ) in obj );
}

// All jQuery objects should point back to these
rootjQuery = jQuery(document);
/*!
 * Sizzle CSS Selector Engine v1.10.2
 * http://sizzlejs.com/
 *
 * Copyright 2013 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2013-07-03
 */
(function( window, undefined ) {

var i,
  support,
  cachedruns,
  Expr,
  getText,
  isXML,
  compile,
  outermostContext,
  sortInput,

  // Local document vars
  setDocument,
  document,
  docElem,
  documentIsHTML,
  rbuggyQSA,
  rbuggyMatches,
  matches,
  contains,

  // Instance-specific data
  expando = "sizzle" + -(new Date()),
  preferredDoc = window.document,
  dirruns = 0,
  done = 0,
  classCache = createCache(),
  tokenCache = createCache(),
  compilerCache = createCache(),
  hasDuplicate = false,
  sortOrder = function( a, b ) {
    if ( a === b ) {
      hasDuplicate = true;
      return 0;
    }
    return 0;
  },

  // General-purpose constants
  strundefined = typeof undefined,
  MAX_NEGATIVE = 1 << 31,

  // Instance methods
  hasOwn = ({}).hasOwnProperty,
  arr = [],
  pop = arr.pop,
  push_native = arr.push,
  push = arr.push,
  slice = arr.slice,
  // Use a stripped-down indexOf if we can't use a native one
  indexOf = arr.indexOf || function( elem ) {
    var i = 0,
      len = this.length;
    for ( ; i < len; i++ ) {
      if ( this[i] === elem ) {
        return i;
      }
    }
    return -1;
  },

  booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

  // Regular expressions

  // Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
  whitespace = "[\\x20\\t\\r\\n\\f]",
  // http://www.w3.org/TR/css3-syntax/#characters
  characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

  // Loosely modeled on CSS identifier characters
  // An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors
  // Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
  identifier = characterEncoding.replace( "w", "w#" ),

  // Acceptable operators http://www.w3.org/TR/selectors/#attribute-selectors
  attributes = "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace +
    "*(?:([*^$|!~]?=)" + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]",

  // Prefer arguments quoted,
  //   then not containing pseudos/brackets,
  //   then attribute selectors/non-parenthetical expressions,
  //   then anything else
  // These preferences are here to reduce the number of selectors
  //   needing tokenize in the PSEUDO preFilter
  pseudos = ":(" + characterEncoding + ")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + attributes.replace( 3, 8 ) + ")*)|.*)\\)|)",

  // Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
  rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

  rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
  rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

  rsibling = new RegExp( whitespace + "*[+~]" ),
  rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*)" + whitespace + "*\\]", "g" ),

  rpseudo = new RegExp( pseudos ),
  ridentifier = new RegExp( "^" + identifier + "$" ),

  matchExpr = {
    "ID": new RegExp( "^#(" + characterEncoding + ")" ),
    "CLASS": new RegExp( "^\\.(" + characterEncoding + ")" ),
    "TAG": new RegExp( "^(" + characterEncoding.replace( "w", "w*" ) + ")" ),
    "ATTR": new RegExp( "^" + attributes ),
    "PSEUDO": new RegExp( "^" + pseudos ),
    "CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
      "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
      "*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
    "bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
    // For use in libraries implementing .is()
    // We use this for POS matching in `select`
    "needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
      whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
  },

  rnative = /^[^{]+\{\s*\[native \w/,

  // Easily-parseable/retrievable ID or TAG or CLASS selectors
  rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

  rinputs = /^(?:input|select|textarea|button)$/i,
  rheader = /^h\d$/i,

  rescape = /'|\\/g,

  // CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
  runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
  funescape = function( _, escaped, escapedWhitespace ) {
    var high = "0x" + escaped - 0x10000;
    // NaN means non-codepoint
    // Support: Firefox
    // Workaround erroneous numeric interpretation of +"0x"
    return high !== high || escapedWhitespace ?
      escaped :
      // BMP codepoint
      high < 0 ?
        String.fromCharCode( high + 0x10000 ) :
        // Supplemental Plane codepoint (surrogate pair)
        String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
  };

// Optimize for push.apply( _, NodeList )
try {
  push.apply(
    (arr = slice.call( preferredDoc.childNodes )),
    preferredDoc.childNodes
  );
  // Support: Android<4.0
  // Detect silently failing push.apply
  arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
  push = { apply: arr.length ?

    // Leverage slice if possible
    function( target, els ) {
      push_native.apply( target, slice.call(els) );
    } :

    // Support: IE<9
    // Otherwise append directly
    function( target, els ) {
      var j = target.length,
        i = 0;
      // Can't trust NodeList.length
      while ( (target[j++] = els[i++]) ) {}
      target.length = j - 1;
    }
  };
}

function Sizzle( selector, context, results, seed ) {
  var match, elem, m, nodeType,
    // QSA vars
    i, groups, old, nid, newContext, newSelector;

  if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
    setDocument( context );
  }

  context = context || document;
  results = results || [];

  if ( !selector || typeof selector !== "string" ) {
    return results;
  }

  if ( (nodeType = context.nodeType) !== 1 && nodeType !== 9 ) {
    return [];
  }

  if ( documentIsHTML && !seed ) {

    // Shortcuts
    if ( (match = rquickExpr.exec( selector )) ) {
      // Speed-up: Sizzle("#ID")
      if ( (m = match[1]) ) {
        if ( nodeType === 9 ) {
          elem = context.getElementById( m );
          // Check parentNode to catch when Blackberry 4.6 returns
          // nodes that are no longer in the document #6963
          if ( elem && elem.parentNode ) {
            // Handle the case where IE, Opera, and Webkit return items
            // by name instead of ID
            if ( elem.id === m ) {
              results.push( elem );
              return results;
            }
          } else {
            return results;
          }
        } else {
          // Context is not a document
          if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
            contains( context, elem ) && elem.id === m ) {
            results.push( elem );
            return results;
          }
        }

      // Speed-up: Sizzle("TAG")
      } else if ( match[2] ) {
        push.apply( results, context.getElementsByTagName( selector ) );
        return results;

      // Speed-up: Sizzle(".CLASS")
      } else if ( (m = match[3]) && support.getElementsByClassName && context.getElementsByClassName ) {
        push.apply( results, context.getElementsByClassName( m ) );
        return results;
      }
    }

    // QSA path
    if ( support.qsa && (!rbuggyQSA || !rbuggyQSA.test( selector )) ) {
      nid = old = expando;
      newContext = context;
      newSelector = nodeType === 9 && selector;

      // qSA works strangely on Element-rooted queries
      // We can work around this by specifying an extra ID on the root
      // and working up from there (Thanks to Andrew Dupont for the technique)
      // IE 8 doesn't work on object elements
      if ( nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
        groups = tokenize( selector );

        if ( (old = context.getAttribute("id")) ) {
          nid = old.replace( rescape, "\\$&" );
        } else {
          context.setAttribute( "id", nid );
        }
        nid = "[id='" + nid + "'] ";

        i = groups.length;
        while ( i-- ) {
          groups[i] = nid + toSelector( groups[i] );
        }
        newContext = rsibling.test( selector ) && context.parentNode || context;
        newSelector = groups.join(",");
      }

      if ( newSelector ) {
        try {
          push.apply( results,
            newContext.querySelectorAll( newSelector )
          );
          return results;
        } catch(qsaError) {
        } finally {
          if ( !old ) {
            context.removeAttribute("id");
          }
        }
      }
    }
  }

  // All others
  return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {Function(string, Object)} Returns the Object data after storing it on itself with
 *  property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *  deleting the oldest entry
 */
function createCache() {
  var keys = [];

  function cache( key, value ) {
    // Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
    if ( keys.push( key += " " ) > Expr.cacheLength ) {
      // Only keep the most recent entries
      delete cache[ keys.shift() ];
    }
    return (cache[ key ] = value);
  }
  return cache;
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
  fn[ expando ] = true;
  return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 */
function assert( fn ) {
  var div = document.createElement("div");

  try {
    return !!fn( div );
  } catch (e) {
    return false;
  } finally {
    // Remove from its parent by default
    if ( div.parentNode ) {
      div.parentNode.removeChild( div );
    }
    // release memory in IE
    div = null;
  }
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
function addHandle( attrs, handler ) {
  var arr = attrs.split("|"),
    i = attrs.length;

  while ( i-- ) {
    Expr.attrHandle[ arr[i] ] = handler;
  }
}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck( a, b ) {
  var cur = b && a,
    diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
      ( ~b.sourceIndex || MAX_NEGATIVE ) -
      ( ~a.sourceIndex || MAX_NEGATIVE );

  // Use IE sourceIndex if available on both nodes
  if ( diff ) {
    return diff;
  }

  // Check if b follows a
  if ( cur ) {
    while ( (cur = cur.nextSibling) ) {
      if ( cur === b ) {
        return -1;
      }
    }
  }

  return a ? 1 : -1;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
  return function( elem ) {
    var name = elem.nodeName.toLowerCase();
    return name === "input" && elem.type === type;
  };
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
  return function( elem ) {
    var name = elem.nodeName.toLowerCase();
    return (name === "input" || name === "button") && elem.type === type;
  };
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
  return markFunction(function( argument ) {
    argument = +argument;
    return markFunction(function( seed, matches ) {
      var j,
        matchIndexes = fn( [], seed.length, argument ),
        i = matchIndexes.length;

      // Match elements found at the specified indexes
      while ( i-- ) {
        if ( seed[ (j = matchIndexes[i]) ] ) {
          seed[j] = !(matches[j] = seed[j]);
        }
      }
    });
  });
}

/**
 * Detect xml
 * @param {Element|Object} elem An element or a document
 */
isXML = Sizzle.isXML = function( elem ) {
  // documentElement is verified for cases where it doesn't yet exist
  // (such as loading iframes in IE - #4833)
  var documentElement = elem && (elem.ownerDocument || elem).documentElement;
  return documentElement ? documentElement.nodeName !== "HTML" : false;
};

// Expose support vars for convenience
support = Sizzle.support = {};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
  var doc = node ? node.ownerDocument || node : preferredDoc,
    parent = doc.defaultView;

  // If no document and documentElement is available, return
  if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
    return document;
  }

  // Set our document
  document = doc;
  docElem = doc.documentElement;

  // Support tests
  documentIsHTML = !isXML( doc );

  // Support: IE>8
  // If iframe document is assigned to "document" variable and if iframe has been reloaded,
  // IE will throw "permission denied" error when accessing "document" variable, see jQuery #13936
  // IE6-8 do not support the defaultView property so parent will be undefined
  if ( parent && parent.attachEvent && parent !== parent.top ) {
    parent.attachEvent( "onbeforeunload", function() {
      setDocument();
    });
  }

  /* Attributes
  ---------------------------------------------------------------------- */

  // Support: IE<8
  // Verify that getAttribute really returns attributes and not properties (excepting IE8 booleans)
  support.attributes = assert(function( div ) {
    div.className = "i";
    return !div.getAttribute("className");
  });

  /* getElement(s)By*
  ---------------------------------------------------------------------- */

  // Check if getElementsByTagName("*") returns only elements
  support.getElementsByTagName = assert(function( div ) {
    div.appendChild( doc.createComment("") );
    return !div.getElementsByTagName("*").length;
  });

  // Check if getElementsByClassName can be trusted
  support.getElementsByClassName = assert(function( div ) {
    div.innerHTML = "<div class='a'></div><div class='a i'></div>";

    // Support: Safari<4
    // Catch class over-caching
    div.firstChild.className = "i";
    // Support: Opera<10
    // Catch gEBCN failure to find non-leading classes
    return div.getElementsByClassName("i").length === 2;
  });

  // Support: IE<10
  // Check if getElementById returns elements by name
  // The broken getElementById methods don't pick up programatically-set names,
  // so use a roundabout getElementsByName test
  support.getById = assert(function( div ) {
    docElem.appendChild( div ).id = expando;
    return !doc.getElementsByName || !doc.getElementsByName( expando ).length;
  });

  // ID find and filter
  if ( support.getById ) {
    Expr.find["ID"] = function( id, context ) {
      if ( typeof context.getElementById !== strundefined && documentIsHTML ) {
        var m = context.getElementById( id );
        // Check parentNode to catch when Blackberry 4.6 returns
        // nodes that are no longer in the document #6963
        return m && m.parentNode ? [m] : [];
      }
    };
    Expr.filter["ID"] = function( id ) {
      var attrId = id.replace( runescape, funescape );
      return function( elem ) {
        return elem.getAttribute("id") === attrId;
      };
    };
  } else {
    // Support: IE6/7
    // getElementById is not reliable as a find shortcut
    delete Expr.find["ID"];

    Expr.filter["ID"] =  function( id ) {
      var attrId = id.replace( runescape, funescape );
      return function( elem ) {
        var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
        return node && node.value === attrId;
      };
    };
  }

  // Tag
  Expr.find["TAG"] = support.getElementsByTagName ?
    function( tag, context ) {
      if ( typeof context.getElementsByTagName !== strundefined ) {
        return context.getElementsByTagName( tag );
      }
    } :
    function( tag, context ) {
      var elem,
        tmp = [],
        i = 0,
        results = context.getElementsByTagName( tag );

      // Filter out possible comments
      if ( tag === "*" ) {
        while ( (elem = results[i++]) ) {
          if ( elem.nodeType === 1 ) {
            tmp.push( elem );
          }
        }

        return tmp;
      }
      return results;
    };

  // Class
  Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
    if ( typeof context.getElementsByClassName !== strundefined && documentIsHTML ) {
      return context.getElementsByClassName( className );
    }
  };

  /* QSA/matchesSelector
  ---------------------------------------------------------------------- */

  // QSA and matchesSelector support

  // matchesSelector(:active) reports false when true (IE9/Opera 11.5)
  rbuggyMatches = [];

  // qSa(:focus) reports false when true (Chrome 21)
  // We allow this because of a bug in IE8/9 that throws an error
  // whenever `document.activeElement` is accessed on an iframe
  // So, we allow :focus to pass through QSA all the time to avoid the IE error
  // See http://bugs.jquery.com/ticket/13378
  rbuggyQSA = [];

  if ( (support.qsa = rnative.test( doc.querySelectorAll )) ) {
    // Build QSA regex
    // Regex strategy adopted from Diego Perini
    assert(function( div ) {
      // Select is set to empty string on purpose
      // This is to test IE's treatment of not explicitly
      // setting a boolean content attribute,
      // since its presence should be enough
      // http://bugs.jquery.com/ticket/12359
      div.innerHTML = "<select><option selected=''></option></select>";

      // Support: IE8
      // Boolean attributes and "value" are not treated correctly
      if ( !div.querySelectorAll("[selected]").length ) {
        rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
      }

      // Webkit/Opera - :checked should return selected option elements
      // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
      // IE8 throws error here and will not see later tests
      if ( !div.querySelectorAll(":checked").length ) {
        rbuggyQSA.push(":checked");
      }
    });

    assert(function( div ) {

      // Support: Opera 10-12/IE8
      // ^= $= *= and empty values
      // Should not select anything
      // Support: Windows 8 Native Apps
      // The type attribute is restricted during .innerHTML assignment
      var input = doc.createElement("input");
      input.setAttribute( "type", "hidden" );
      div.appendChild( input ).setAttribute( "t", "" );

      if ( div.querySelectorAll("[t^='']").length ) {
        rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
      }

      // FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
      // IE8 throws error here and will not see later tests
      if ( !div.querySelectorAll(":enabled").length ) {
        rbuggyQSA.push( ":enabled", ":disabled" );
      }

      // Opera 10-11 does not throw on post-comma invalid pseudos
      div.querySelectorAll("*,:x");
      rbuggyQSA.push(",.*:");
    });
  }

  if ( (support.matchesSelector = rnative.test( (matches = docElem.webkitMatchesSelector ||
    docElem.mozMatchesSelector ||
    docElem.oMatchesSelector ||
    docElem.msMatchesSelector) )) ) {

    assert(function( div ) {
      // Check to see if it's possible to do matchesSelector
      // on a disconnected node (IE 9)
      support.disconnectedMatch = matches.call( div, "div" );

      // This should fail with an exception
      // Gecko does not error, returns false instead
      matches.call( div, "[s!='']:x" );
      rbuggyMatches.push( "!=", pseudos );
    });
  }

  rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
  rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

  /* Contains
  ---------------------------------------------------------------------- */

  // Element contains another
  // Purposefully does not implement inclusive descendent
  // As in, an element does not contain itself
  contains = rnative.test( docElem.contains ) || docElem.compareDocumentPosition ?
    function( a, b ) {
      var adown = a.nodeType === 9 ? a.documentElement : a,
        bup = b && b.parentNode;
      return a === bup || !!( bup && bup.nodeType === 1 && (
        adown.contains ?
          adown.contains( bup ) :
          a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
      ));
    } :
    function( a, b ) {
      if ( b ) {
        while ( (b = b.parentNode) ) {
          if ( b === a ) {
            return true;
          }
        }
      }
      return false;
    };

  /* Sorting
  ---------------------------------------------------------------------- */

  // Document order sorting
  sortOrder = docElem.compareDocumentPosition ?
  function( a, b ) {

    // Flag for duplicate removal
    if ( a === b ) {
      hasDuplicate = true;
      return 0;
    }

    var compare = b.compareDocumentPosition && a.compareDocumentPosition && a.compareDocumentPosition( b );

    if ( compare ) {
      // Disconnected nodes
      if ( compare & 1 ||
        (!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

        // Choose the first element that is related to our preferred document
        if ( a === doc || contains(preferredDoc, a) ) {
          return -1;
        }
        if ( b === doc || contains(preferredDoc, b) ) {
          return 1;
        }

        // Maintain original order
        return sortInput ?
          ( indexOf.call( sortInput, a ) - indexOf.call( sortInput, b ) ) :
          0;
      }

      return compare & 4 ? -1 : 1;
    }

    // Not directly comparable, sort on existence of method
    return a.compareDocumentPosition ? -1 : 1;
  } :
  function( a, b ) {
    var cur,
      i = 0,
      aup = a.parentNode,
      bup = b.parentNode,
      ap = [ a ],
      bp = [ b ];

    // Exit early if the nodes are identical
    if ( a === b ) {
      hasDuplicate = true;
      return 0;

    // Parentless nodes are either documents or disconnected
    } else if ( !aup || !bup ) {
      return a === doc ? -1 :
        b === doc ? 1 :
        aup ? -1 :
        bup ? 1 :
        sortInput ?
        ( indexOf.call( sortInput, a ) - indexOf.call( sortInput, b ) ) :
        0;

    // If the nodes are siblings, we can do a quick check
    } else if ( aup === bup ) {
      return siblingCheck( a, b );
    }

    // Otherwise we need full lists of their ancestors for comparison
    cur = a;
    while ( (cur = cur.parentNode) ) {
      ap.unshift( cur );
    }
    cur = b;
    while ( (cur = cur.parentNode) ) {
      bp.unshift( cur );
    }

    // Walk down the tree looking for a discrepancy
    while ( ap[i] === bp[i] ) {
      i++;
    }

    return i ?
      // Do a sibling check if the nodes have a common ancestor
      siblingCheck( ap[i], bp[i] ) :

      // Otherwise nodes in our document sort first
      ap[i] === preferredDoc ? -1 :
      bp[i] === preferredDoc ? 1 :
      0;
  };

  return doc;
};

Sizzle.matches = function( expr, elements ) {
  return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
  // Set document vars if needed
  if ( ( elem.ownerDocument || elem ) !== document ) {
    setDocument( elem );
  }

  // Make sure that attribute selectors are quoted
  expr = expr.replace( rattributeQuotes, "='$1']" );

  if ( support.matchesSelector && documentIsHTML &&
    ( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
    ( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

    try {
      var ret = matches.call( elem, expr );

      // IE 9's matchesSelector returns false on disconnected nodes
      if ( ret || support.disconnectedMatch ||
          // As well, disconnected nodes are said to be in a document
          // fragment in IE 9
          elem.document && elem.document.nodeType !== 11 ) {
        return ret;
      }
    } catch(e) {}
  }

  return Sizzle( expr, document, null, [elem] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
  // Set document vars if needed
  if ( ( context.ownerDocument || context ) !== document ) {
    setDocument( context );
  }
  return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
  // Set document vars if needed
  if ( ( elem.ownerDocument || elem ) !== document ) {
    setDocument( elem );
  }

  var fn = Expr.attrHandle[ name.toLowerCase() ],
    // Don't get fooled by Object.prototype properties (jQuery #13807)
    val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
      fn( elem, name, !documentIsHTML ) :
      undefined;

  return val === undefined ?
    support.attributes || !documentIsHTML ?
      elem.getAttribute( name ) :
      (val = elem.getAttributeNode(name)) && val.specified ?
        val.value :
        null :
    val;
};

Sizzle.error = function( msg ) {
  throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
Sizzle.uniqueSort = function( results ) {
  var elem,
    duplicates = [],
    j = 0,
    i = 0;

  // Unless we *know* we can detect duplicates, assume their presence
  hasDuplicate = !support.detectDuplicates;
  sortInput = !support.sortStable && results.slice( 0 );
  results.sort( sortOrder );

  if ( hasDuplicate ) {
    while ( (elem = results[i++]) ) {
      if ( elem === results[ i ] ) {
        j = duplicates.push( i );
      }
    }
    while ( j-- ) {
      results.splice( duplicates[ j ], 1 );
    }
  }

  return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
  var node,
    ret = "",
    i = 0,
    nodeType = elem.nodeType;

  if ( !nodeType ) {
    // If no nodeType, this is expected to be an array
    for ( ; (node = elem[i]); i++ ) {
      // Do not traverse comment nodes
      ret += getText( node );
    }
  } else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
    // Use textContent for elements
    // innerText usage removed for consistency of new lines (see #11153)
    if ( typeof elem.textContent === "string" ) {
      return elem.textContent;
    } else {
      // Traverse its children
      for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
        ret += getText( elem );
      }
    }
  } else if ( nodeType === 3 || nodeType === 4 ) {
    return elem.nodeValue;
  }
  // Do not include comment or processing instruction nodes

  return ret;
};

Expr = Sizzle.selectors = {

  // Can be adjusted by the user
  cacheLength: 50,

  createPseudo: markFunction,

  match: matchExpr,

  attrHandle: {},

  find: {},

  relative: {
    ">": { dir: "parentNode", first: true },
    " ": { dir: "parentNode" },
    "+": { dir: "previousSibling", first: true },
    "~": { dir: "previousSibling" }
  },

  preFilter: {
    "ATTR": function( match ) {
      match[1] = match[1].replace( runescape, funescape );

      // Move the given value to match[3] whether quoted or unquoted
      match[3] = ( match[4] || match[5] || "" ).replace( runescape, funescape );

      if ( match[2] === "~=" ) {
        match[3] = " " + match[3] + " ";
      }

      return match.slice( 0, 4 );
    },

    "CHILD": function( match ) {
      /* matches from matchExpr["CHILD"]
        1 type (only|nth|...)
        2 what (child|of-type)
        3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
        4 xn-component of xn+y argument ([+-]?\d*n|)
        5 sign of xn-component
        6 x of xn-component
        7 sign of y-component
        8 y of y-component
      */
      match[1] = match[1].toLowerCase();

      if ( match[1].slice( 0, 3 ) === "nth" ) {
        // nth-* requires argument
        if ( !match[3] ) {
          Sizzle.error( match[0] );
        }

        // numeric x and y parameters for Expr.filter.CHILD
        // remember that false/true cast respectively to 0/1
        match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
        match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

      // other types prohibit arguments
      } else if ( match[3] ) {
        Sizzle.error( match[0] );
      }

      return match;
    },

    "PSEUDO": function( match ) {
      var excess,
        unquoted = !match[5] && match[2];

      if ( matchExpr["CHILD"].test( match[0] ) ) {
        return null;
      }

      // Accept quoted arguments as-is
      if ( match[3] && match[4] !== undefined ) {
        match[2] = match[4];

      // Strip excess characters from unquoted arguments
      } else if ( unquoted && rpseudo.test( unquoted ) &&
        // Get excess from tokenize (recursively)
        (excess = tokenize( unquoted, true )) &&
        // advance to the next closing parenthesis
        (excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

        // excess is a negative index
        match[0] = match[0].slice( 0, excess );
        match[2] = unquoted.slice( 0, excess );
      }

      // Return only captures needed by the pseudo filter method (type and argument)
      return match.slice( 0, 3 );
    }
  },

  filter: {

    "TAG": function( nodeNameSelector ) {
      var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
      return nodeNameSelector === "*" ?
        function() { return true; } :
        function( elem ) {
          return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
        };
    },

    "CLASS": function( className ) {
      var pattern = classCache[ className + " " ];

      return pattern ||
        (pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
        classCache( className, function( elem ) {
          return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== strundefined && elem.getAttribute("class") || "" );
        });
    },

    "ATTR": function( name, operator, check ) {
      return function( elem ) {
        var result = Sizzle.attr( elem, name );

        if ( result == null ) {
          return operator === "!=";
        }
        if ( !operator ) {
          return true;
        }

        result += "";

        return operator === "=" ? result === check :
          operator === "!=" ? result !== check :
          operator === "^=" ? check && result.indexOf( check ) === 0 :
          operator === "*=" ? check && result.indexOf( check ) > -1 :
          operator === "$=" ? check && result.slice( -check.length ) === check :
          operator === "~=" ? ( " " + result + " " ).indexOf( check ) > -1 :
          operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
          false;
      };
    },

    "CHILD": function( type, what, argument, first, last ) {
      var simple = type.slice( 0, 3 ) !== "nth",
        forward = type.slice( -4 ) !== "last",
        ofType = what === "of-type";

      return first === 1 && last === 0 ?

        // Shortcut for :nth-*(n)
        function( elem ) {
          return !!elem.parentNode;
        } :

        function( elem, context, xml ) {
          var cache, outerCache, node, diff, nodeIndex, start,
            dir = simple !== forward ? "nextSibling" : "previousSibling",
            parent = elem.parentNode,
            name = ofType && elem.nodeName.toLowerCase(),
            useCache = !xml && !ofType;

          if ( parent ) {

            // :(first|last|only)-(child|of-type)
            if ( simple ) {
              while ( dir ) {
                node = elem;
                while ( (node = node[ dir ]) ) {
                  if ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) {
                    return false;
                  }
                }
                // Reverse direction for :only-* (if we haven't yet done so)
                start = dir = type === "only" && !start && "nextSibling";
              }
              return true;
            }

            start = [ forward ? parent.firstChild : parent.lastChild ];

            // non-xml :nth-child(...) stores cache data on `parent`
            if ( forward && useCache ) {
              // Seek `elem` from a previously-cached index
              outerCache = parent[ expando ] || (parent[ expando ] = {});
              cache = outerCache[ type ] || [];
              nodeIndex = cache[0] === dirruns && cache[1];
              diff = cache[0] === dirruns && cache[2];
              node = nodeIndex && parent.childNodes[ nodeIndex ];

              while ( (node = ++nodeIndex && node && node[ dir ] ||

                // Fallback to seeking `elem` from the start
                (diff = nodeIndex = 0) || start.pop()) ) {

                // When found, cache indexes on `parent` and break
                if ( node.nodeType === 1 && ++diff && node === elem ) {
                  outerCache[ type ] = [ dirruns, nodeIndex, diff ];
                  break;
                }
              }

            // Use previously-cached element index if available
            } else if ( useCache && (cache = (elem[ expando ] || (elem[ expando ] = {}))[ type ]) && cache[0] === dirruns ) {
              diff = cache[1];

            // xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)
            } else {
              // Use the same loop as above to seek `elem` from the start
              while ( (node = ++nodeIndex && node && node[ dir ] ||
                (diff = nodeIndex = 0) || start.pop()) ) {

                if ( ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) && ++diff ) {
                  // Cache the index of each encountered element
                  if ( useCache ) {
                    (node[ expando ] || (node[ expando ] = {}))[ type ] = [ dirruns, diff ];
                  }

                  if ( node === elem ) {
                    break;
                  }
                }
              }
            }

            // Incorporate the offset, then check against cycle size
            diff -= last;
            return diff === first || ( diff % first === 0 && diff / first >= 0 );
          }
        };
    },

    "PSEUDO": function( pseudo, argument ) {
      // pseudo-class names are case-insensitive
      // http://www.w3.org/TR/selectors/#pseudo-classes
      // Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
      // Remember that setFilters inherits from pseudos
      var args,
        fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
          Sizzle.error( "unsupported pseudo: " + pseudo );

      // The user may use createPseudo to indicate that
      // arguments are needed to create the filter function
      // just as Sizzle does
      if ( fn[ expando ] ) {
        return fn( argument );
      }

      // But maintain support for old signatures
      if ( fn.length > 1 ) {
        args = [ pseudo, pseudo, "", argument ];
        return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
          markFunction(function( seed, matches ) {
            var idx,
              matched = fn( seed, argument ),
              i = matched.length;
            while ( i-- ) {
              idx = indexOf.call( seed, matched[i] );
              seed[ idx ] = !( matches[ idx ] = matched[i] );
            }
          }) :
          function( elem ) {
            return fn( elem, 0, args );
          };
      }

      return fn;
    }
  },

  pseudos: {
    // Potentially complex pseudos
    "not": markFunction(function( selector ) {
      // Trim the selector passed to compile
      // to avoid treating leading and trailing
      // spaces as combinators
      var input = [],
        results = [],
        matcher = compile( selector.replace( rtrim, "$1" ) );

      return matcher[ expando ] ?
        markFunction(function( seed, matches, context, xml ) {
          var elem,
            unmatched = matcher( seed, null, xml, [] ),
            i = seed.length;

          // Match elements unmatched by `matcher`
          while ( i-- ) {
            if ( (elem = unmatched[i]) ) {
              seed[i] = !(matches[i] = elem);
            }
          }
        }) :
        function( elem, context, xml ) {
          input[0] = elem;
          matcher( input, null, xml, results );
          return !results.pop();
        };
    }),

    "has": markFunction(function( selector ) {
      return function( elem ) {
        return Sizzle( selector, elem ).length > 0;
      };
    }),

    "contains": markFunction(function( text ) {
      return function( elem ) {
        return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
      };
    }),

    // "Whether an element is represented by a :lang() selector
    // is based solely on the element's language value
    // being equal to the identifier C,
    // or beginning with the identifier C immediately followed by "-".
    // The matching of C against the element's language value is performed case-insensitively.
    // The identifier C does not have to be a valid language name."
    // http://www.w3.org/TR/selectors/#lang-pseudo
    "lang": markFunction( function( lang ) {
      // lang value must be a valid identifier
      if ( !ridentifier.test(lang || "") ) {
        Sizzle.error( "unsupported lang: " + lang );
      }
      lang = lang.replace( runescape, funescape ).toLowerCase();
      return function( elem ) {
        var elemLang;
        do {
          if ( (elemLang = documentIsHTML ?
            elem.lang :
            elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

            elemLang = elemLang.toLowerCase();
            return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
          }
        } while ( (elem = elem.parentNode) && elem.nodeType === 1 );
        return false;
      };
    }),

    // Miscellaneous
    "target": function( elem ) {
      var hash = window.location && window.location.hash;
      return hash && hash.slice( 1 ) === elem.id;
    },

    "root": function( elem ) {
      return elem === docElem;
    },

    "focus": function( elem ) {
      return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
    },

    // Boolean properties
    "enabled": function( elem ) {
      return elem.disabled === false;
    },

    "disabled": function( elem ) {
      return elem.disabled === true;
    },

    "checked": function( elem ) {
      // In CSS3, :checked should return both checked and selected elements
      // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
      var nodeName = elem.nodeName.toLowerCase();
      return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
    },

    "selected": function( elem ) {
      // Accessing this property makes selected-by-default
      // options in Safari work properly
      if ( elem.parentNode ) {
        elem.parentNode.selectedIndex;
      }

      return elem.selected === true;
    },

    // Contents
    "empty": function( elem ) {
      // http://www.w3.org/TR/selectors/#empty-pseudo
      // :empty is only affected by element nodes and content nodes(including text(3), cdata(4)),
      //   not comment, processing instructions, or others
      // Thanks to Diego Perini for the nodeName shortcut
      //   Greater than "@" means alpha characters (specifically not starting with "#" or "?")
      for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
        if ( elem.nodeName > "@" || elem.nodeType === 3 || elem.nodeType === 4 ) {
          return false;
        }
      }
      return true;
    },

    "parent": function( elem ) {
      return !Expr.pseudos["empty"]( elem );
    },

    // Element/input types
    "header": function( elem ) {
      return rheader.test( elem.nodeName );
    },

    "input": function( elem ) {
      return rinputs.test( elem.nodeName );
    },

    "button": function( elem ) {
      var name = elem.nodeName.toLowerCase();
      return name === "input" && elem.type === "button" || name === "button";
    },

    "text": function( elem ) {
      var attr;
      // IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
      // use getAttribute instead to test this case
      return elem.nodeName.toLowerCase() === "input" &&
        elem.type === "text" &&
        ( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === elem.type );
    },

    // Position-in-collection
    "first": createPositionalPseudo(function() {
      return [ 0 ];
    }),

    "last": createPositionalPseudo(function( matchIndexes, length ) {
      return [ length - 1 ];
    }),

    "eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
      return [ argument < 0 ? argument + length : argument ];
    }),

    "even": createPositionalPseudo(function( matchIndexes, length ) {
      var i = 0;
      for ( ; i < length; i += 2 ) {
        matchIndexes.push( i );
      }
      return matchIndexes;
    }),

    "odd": createPositionalPseudo(function( matchIndexes, length ) {
      var i = 1;
      for ( ; i < length; i += 2 ) {
        matchIndexes.push( i );
      }
      return matchIndexes;
    }),

    "lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
      var i = argument < 0 ? argument + length : argument;
      for ( ; --i >= 0; ) {
        matchIndexes.push( i );
      }
      return matchIndexes;
    }),

    "gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
      var i = argument < 0 ? argument + length : argument;
      for ( ; ++i < length; ) {
        matchIndexes.push( i );
      }
      return matchIndexes;
    })
  }
};

Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
  Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
  Expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

function tokenize( selector, parseOnly ) {
  var matched, match, tokens, type,
    soFar, groups, preFilters,
    cached = tokenCache[ selector + " " ];

  if ( cached ) {
    return parseOnly ? 0 : cached.slice( 0 );
  }

  soFar = selector;
  groups = [];
  preFilters = Expr.preFilter;

  while ( soFar ) {

    // Comma and first run
    if ( !matched || (match = rcomma.exec( soFar )) ) {
      if ( match ) {
        // Don't consume trailing commas as valid
        soFar = soFar.slice( match[0].length ) || soFar;
      }
      groups.push( tokens = [] );
    }

    matched = false;

    // Combinators
    if ( (match = rcombinators.exec( soFar )) ) {
      matched = match.shift();
      tokens.push({
        value: matched,
        // Cast descendant combinators to space
        type: match[0].replace( rtrim, " " )
      });
      soFar = soFar.slice( matched.length );
    }

    // Filters
    for ( type in Expr.filter ) {
      if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
        (match = preFilters[ type ]( match ))) ) {
        matched = match.shift();
        tokens.push({
          value: matched,
          type: type,
          matches: match
        });
        soFar = soFar.slice( matched.length );
      }
    }

    if ( !matched ) {
      break;
    }
  }

  // Return the length of the invalid excess
  // if we're just parsing
  // Otherwise, throw an error or return tokens
  return parseOnly ?
    soFar.length :
    soFar ?
      Sizzle.error( selector ) :
      // Cache the tokens
      tokenCache( selector, groups ).slice( 0 );
}

function toSelector( tokens ) {
  var i = 0,
    len = tokens.length,
    selector = "";
  for ( ; i < len; i++ ) {
    selector += tokens[i].value;
  }
  return selector;
}

function addCombinator( matcher, combinator, base ) {
  var dir = combinator.dir,
    checkNonElements = base && dir === "parentNode",
    doneName = done++;

  return combinator.first ?
    // Check against closest ancestor/preceding element
    function( elem, context, xml ) {
      while ( (elem = elem[ dir ]) ) {
        if ( elem.nodeType === 1 || checkNonElements ) {
          return matcher( elem, context, xml );
        }
      }
    } :

    // Check against all ancestor/preceding elements
    function( elem, context, xml ) {
      var data, cache, outerCache,
        dirkey = dirruns + " " + doneName;

      // We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
      if ( xml ) {
        while ( (elem = elem[ dir ]) ) {
          if ( elem.nodeType === 1 || checkNonElements ) {
            if ( matcher( elem, context, xml ) ) {
              return true;
            }
          }
        }
      } else {
        while ( (elem = elem[ dir ]) ) {
          if ( elem.nodeType === 1 || checkNonElements ) {
            outerCache = elem[ expando ] || (elem[ expando ] = {});
            if ( (cache = outerCache[ dir ]) && cache[0] === dirkey ) {
              if ( (data = cache[1]) === true || data === cachedruns ) {
                return data === true;
              }
            } else {
              cache = outerCache[ dir ] = [ dirkey ];
              cache[1] = matcher( elem, context, xml ) || cachedruns;
              if ( cache[1] === true ) {
                return true;
              }
            }
          }
        }
      }
    };
}

function elementMatcher( matchers ) {
  return matchers.length > 1 ?
    function( elem, context, xml ) {
      var i = matchers.length;
      while ( i-- ) {
        if ( !matchers[i]( elem, context, xml ) ) {
          return false;
        }
      }
      return true;
    } :
    matchers[0];
}

function condense( unmatched, map, filter, context, xml ) {
  var elem,
    newUnmatched = [],
    i = 0,
    len = unmatched.length,
    mapped = map != null;

  for ( ; i < len; i++ ) {
    if ( (elem = unmatched[i]) ) {
      if ( !filter || filter( elem, context, xml ) ) {
        newUnmatched.push( elem );
        if ( mapped ) {
          map.push( i );
        }
      }
    }
  }

  return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
  if ( postFilter && !postFilter[ expando ] ) {
    postFilter = setMatcher( postFilter );
  }
  if ( postFinder && !postFinder[ expando ] ) {
    postFinder = setMatcher( postFinder, postSelector );
  }
  return markFunction(function( seed, results, context, xml ) {
    var temp, i, elem,
      preMap = [],
      postMap = [],
      preexisting = results.length,

      // Get initial elements from seed or context
      elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

      // Prefilter to get matcher input, preserving a map for seed-results synchronization
      matcherIn = preFilter && ( seed || !selector ) ?
        condense( elems, preMap, preFilter, context, xml ) :
        elems,

      matcherOut = matcher ?
        // If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
        postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

          // ...intermediate processing is necessary
          [] :

          // ...otherwise use results directly
          results :
        matcherIn;

    // Find primary matches
    if ( matcher ) {
      matcher( matcherIn, matcherOut, context, xml );
    }

    // Apply postFilter
    if ( postFilter ) {
      temp = condense( matcherOut, postMap );
      postFilter( temp, [], context, xml );

      // Un-match failing elements by moving them back to matcherIn
      i = temp.length;
      while ( i-- ) {
        if ( (elem = temp[i]) ) {
          matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
        }
      }
    }

    if ( seed ) {
      if ( postFinder || preFilter ) {
        if ( postFinder ) {
          // Get the final matcherOut by condensing this intermediate into postFinder contexts
          temp = [];
          i = matcherOut.length;
          while ( i-- ) {
            if ( (elem = matcherOut[i]) ) {
              // Restore matcherIn since elem is not yet a final match
              temp.push( (matcherIn[i] = elem) );
            }
          }
          postFinder( null, (matcherOut = []), temp, xml );
        }

        // Move matched elements from seed to results to keep them synchronized
        i = matcherOut.length;
        while ( i-- ) {
          if ( (elem = matcherOut[i]) &&
            (temp = postFinder ? indexOf.call( seed, elem ) : preMap[i]) > -1 ) {

            seed[temp] = !(results[temp] = elem);
          }
        }
      }

    // Add elements to results, through postFinder if defined
    } else {
      matcherOut = condense(
        matcherOut === results ?
          matcherOut.splice( preexisting, matcherOut.length ) :
          matcherOut
      );
      if ( postFinder ) {
        postFinder( null, results, matcherOut, xml );
      } else {
        push.apply( results, matcherOut );
      }
    }
  });
}

function matcherFromTokens( tokens ) {
  var checkContext, matcher, j,
    len = tokens.length,
    leadingRelative = Expr.relative[ tokens[0].type ],
    implicitRelative = leadingRelative || Expr.relative[" "],
    i = leadingRelative ? 1 : 0,

    // The foundational matcher ensures that elements are reachable from top-level context(s)
    matchContext = addCombinator( function( elem ) {
      return elem === checkContext;
    }, implicitRelative, true ),
    matchAnyContext = addCombinator( function( elem ) {
      return indexOf.call( checkContext, elem ) > -1;
    }, implicitRelative, true ),
    matchers = [ function( elem, context, xml ) {
      return ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
        (checkContext = context).nodeType ?
          matchContext( elem, context, xml ) :
          matchAnyContext( elem, context, xml ) );
    } ];

  for ( ; i < len; i++ ) {
    if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
      matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
    } else {
      matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

      // Return special upon seeing a positional matcher
      if ( matcher[ expando ] ) {
        // Find the next relative operator (if any) for proper handling
        j = ++i;
        for ( ; j < len; j++ ) {
          if ( Expr.relative[ tokens[j].type ] ) {
            break;
          }
        }
        return setMatcher(
          i > 1 && elementMatcher( matchers ),
          i > 1 && toSelector(
            // If the preceding token was a descendant combinator, insert an implicit any-element `*`
            tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
          ).replace( rtrim, "$1" ),
          matcher,
          i < j && matcherFromTokens( tokens.slice( i, j ) ),
          j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
          j < len && toSelector( tokens )
        );
      }
      matchers.push( matcher );
    }
  }

  return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
  // A counter to specify which element is currently being matched
  var matcherCachedRuns = 0,
    bySet = setMatchers.length > 0,
    byElement = elementMatchers.length > 0,
    superMatcher = function( seed, context, xml, results, expandContext ) {
      var elem, j, matcher,
        setMatched = [],
        matchedCount = 0,
        i = "0",
        unmatched = seed && [],
        outermost = expandContext != null,
        contextBackup = outermostContext,
        // We must always have either seed elements or context
        elems = seed || byElement && Expr.find["TAG"]( "*", expandContext && context.parentNode || context ),
        // Use integer dirruns iff this is the outermost matcher
        dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1);

      if ( outermost ) {
        outermostContext = context !== document && context;
        cachedruns = matcherCachedRuns;
      }

      // Add elements passing elementMatchers directly to results
      // Keep `i` a string if there are no elements so `matchedCount` will be "00" below
      for ( ; (elem = elems[i]) != null; i++ ) {
        if ( byElement && elem ) {
          j = 0;
          while ( (matcher = elementMatchers[j++]) ) {
            if ( matcher( elem, context, xml ) ) {
              results.push( elem );
              break;
            }
          }
          if ( outermost ) {
            dirruns = dirrunsUnique;
            cachedruns = ++matcherCachedRuns;
          }
        }

        // Track unmatched elements for set filters
        if ( bySet ) {
          // They will have gone through all possible matchers
          if ( (elem = !matcher && elem) ) {
            matchedCount--;
          }

          // Lengthen the array for every element, matched or not
          if ( seed ) {
            unmatched.push( elem );
          }
        }
      }

      // Apply set filters to unmatched elements
      matchedCount += i;
      if ( bySet && i !== matchedCount ) {
        j = 0;
        while ( (matcher = setMatchers[j++]) ) {
          matcher( unmatched, setMatched, context, xml );
        }

        if ( seed ) {
          // Reintegrate element matches to eliminate the need for sorting
          if ( matchedCount > 0 ) {
            while ( i-- ) {
              if ( !(unmatched[i] || setMatched[i]) ) {
                setMatched[i] = pop.call( results );
              }
            }
          }

          // Discard index placeholder values to get only actual matches
          setMatched = condense( setMatched );
        }

        // Add matches to results
        push.apply( results, setMatched );

        // Seedless set matches succeeding multiple successful matchers stipulate sorting
        if ( outermost && !seed && setMatched.length > 0 &&
          ( matchedCount + setMatchers.length ) > 1 ) {

          Sizzle.uniqueSort( results );
        }
      }

      // Override manipulation of globals by nested matchers
      if ( outermost ) {
        dirruns = dirrunsUnique;
        outermostContext = contextBackup;
      }

      return unmatched;
    };

  return bySet ?
    markFunction( superMatcher ) :
    superMatcher;
}

compile = Sizzle.compile = function( selector, group /* Internal Use Only */ ) {
  var i,
    setMatchers = [],
    elementMatchers = [],
    cached = compilerCache[ selector + " " ];

  if ( !cached ) {
    // Generate a function of recursive functions that can be used to check each element
    if ( !group ) {
      group = tokenize( selector );
    }
    i = group.length;
    while ( i-- ) {
      cached = matcherFromTokens( group[i] );
      if ( cached[ expando ] ) {
        setMatchers.push( cached );
      } else {
        elementMatchers.push( cached );
      }
    }

    // Cache the compiled function
    cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );
  }
  return cached;
};

function multipleContexts( selector, contexts, results ) {
  var i = 0,
    len = contexts.length;
  for ( ; i < len; i++ ) {
    Sizzle( selector, contexts[i], results );
  }
  return results;
}

function select( selector, context, results, seed ) {
  var i, tokens, token, type, find,
    match = tokenize( selector );

  if ( !seed ) {
    // Try to minimize operations if there is only one group
    if ( match.length === 1 ) {

      // Take a shortcut and set the context if the root selector is an ID
      tokens = match[0] = match[0].slice( 0 );
      if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
          support.getById && context.nodeType === 9 && documentIsHTML &&
          Expr.relative[ tokens[1].type ] ) {

        context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
        if ( !context ) {
          return results;
        }
        selector = selector.slice( tokens.shift().value.length );
      }

      // Fetch a seed set for right-to-left matching
      i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
      while ( i-- ) {
        token = tokens[i];

        // Abort if we hit a combinator
        if ( Expr.relative[ (type = token.type) ] ) {
          break;
        }
        if ( (find = Expr.find[ type ]) ) {
          // Search, expanding context for leading sibling combinators
          if ( (seed = find(
            token.matches[0].replace( runescape, funescape ),
            rsibling.test( tokens[0].type ) && context.parentNode || context
          )) ) {

            // If seed is empty or no tokens remain, we can return early
            tokens.splice( i, 1 );
            selector = seed.length && toSelector( tokens );
            if ( !selector ) {
              push.apply( results, seed );
              return results;
            }

            break;
          }
        }
      }
    }
  }

  // Compile and execute a filtering function
  // Provide `match` to avoid retokenization if we modified the selector above
  compile( selector, match )(
    seed,
    context,
    !documentIsHTML,
    results,
    rsibling.test( selector )
  );
  return results;
}

// One-time assignments

// Sort stability
support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Support: Chrome<14
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates = hasDuplicate;

// Initialize against the default document
setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert(function( div1 ) {
  // Should return 1, but returns 4 (following)
  return div1.compareDocumentPosition( document.createElement("div") ) & 1;
});

// Support: IE<8
// Prevent attribute/property "interpolation"
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !assert(function( div ) {
  div.innerHTML = "<a href='#'></a>";
  return div.firstChild.getAttribute("href") === "#" ;
}) ) {
  addHandle( "type|href|height|width", function( elem, name, isXML ) {
    if ( !isXML ) {
      return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
    }
  });
}

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if ( !support.attributes || !assert(function( div ) {
  div.innerHTML = "<input/>";
  div.firstChild.setAttribute( "value", "" );
  return div.firstChild.getAttribute( "value" ) === "";
}) ) {
  addHandle( "value", function( elem, name, isXML ) {
    if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
      return elem.defaultValue;
    }
  });
}

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if ( !assert(function( div ) {
  return div.getAttribute("disabled") == null;
}) ) {
  addHandle( booleans, function( elem, name, isXML ) {
    var val;
    if ( !isXML ) {
      return (val = elem.getAttributeNode( name )) && val.specified ?
        val.value :
        elem[ name ] === true ? name.toLowerCase() : null;
    }
  });
}

jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.pseudos;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;


})( window );
// String to Object options format cache
var optionsCache = {};

// Convert String-formatted options into Object-formatted ones and store in cache
function createOptions( options ) {
  var object = optionsCache[ options ] = {};
  jQuery.each( options.match( core_rnotwhite ) || [], function( _, flag ) {
    object[ flag ] = true;
  });
  return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *  options: an optional list of space-separated options that will change how
 *      the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *  once:     will ensure the callback list can only be fired once (like a Deferred)
 *
 *  memory:     will keep track of previous values and will call any callback added
 *          after the list has been fired right away with the latest "memorized"
 *          values (like a Deferred)
 *
 *  unique:     will ensure a callback can only be added once (no duplicate in the list)
 *
 *  stopOnFalse:  interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

  // Convert options from String-formatted to Object-formatted if needed
  // (we check in cache first)
  options = typeof options === "string" ?
    ( optionsCache[ options ] || createOptions( options ) ) :
    jQuery.extend( {}, options );

  var // Flag to know if list is currently firing
    firing,
    // Last fire value (for non-forgettable lists)
    memory,
    // Flag to know if list was already fired
    fired,
    // End of the loop when firing
    firingLength,
    // Index of currently firing callback (modified by remove if needed)
    firingIndex,
    // First callback to fire (used internally by add and fireWith)
    firingStart,
    // Actual callback list
    list = [],
    // Stack of fire calls for repeatable lists
    stack = !options.once && [],
    // Fire callbacks
    fire = function( data ) {
      memory = options.memory && data;
      fired = true;
      firingIndex = firingStart || 0;
      firingStart = 0;
      firingLength = list.length;
      firing = true;
      for ( ; list && firingIndex < firingLength; firingIndex++ ) {
        if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
          memory = false; // To prevent further calls using add
          break;
        }
      }
      firing = false;
      if ( list ) {
        if ( stack ) {
          if ( stack.length ) {
            fire( stack.shift() );
          }
        } else if ( memory ) {
          list = [];
        } else {
          self.disable();
        }
      }
    },
    // Actual Callbacks object
    self = {
      // Add a callback or a collection of callbacks to the list
      add: function() {
        if ( list ) {
          // First, we save the current length
          var start = list.length;
          (function add( args ) {
            jQuery.each( args, function( _, arg ) {
              var type = jQuery.type( arg );
              if ( type === "function" ) {
                if ( !options.unique || !self.has( arg ) ) {
                  list.push( arg );
                }
              } else if ( arg && arg.length && type !== "string" ) {
                // Inspect recursively
                add( arg );
              }
            });
          })( arguments );
          // Do we need to add the callbacks to the
          // current firing batch?
          if ( firing ) {
            firingLength = list.length;
          // With memory, if we're not firing then
          // we should call right away
          } else if ( memory ) {
            firingStart = start;
            fire( memory );
          }
        }
        return this;
      },
      // Remove a callback from the list
      remove: function() {
        if ( list ) {
          jQuery.each( arguments, function( _, arg ) {
            var index;
            while( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
              list.splice( index, 1 );
              // Handle firing indexes
              if ( firing ) {
                if ( index <= firingLength ) {
                  firingLength--;
                }
                if ( index <= firingIndex ) {
                  firingIndex--;
                }
              }
            }
          });
        }
        return this;
      },
      // Check if a given callback is in the list.
      // If no argument is given, return whether or not list has callbacks attached.
      has: function( fn ) {
        return fn ? jQuery.inArray( fn, list ) > -1 : !!( list && list.length );
      },
      // Remove all callbacks from the list
      empty: function() {
        list = [];
        firingLength = 0;
        return this;
      },
      // Have the list do nothing anymore
      disable: function() {
        list = stack = memory = undefined;
        return this;
      },
      // Is it disabled?
      disabled: function() {
        return !list;
      },
      // Lock the list in its current state
      lock: function() {
        stack = undefined;
        if ( !memory ) {
          self.disable();
        }
        return this;
      },
      // Is it locked?
      locked: function() {
        return !stack;
      },
      // Call all callbacks with the given context and arguments
      fireWith: function( context, args ) {
        if ( list && ( !fired || stack ) ) {
          args = args || [];
          args = [ context, args.slice ? args.slice() : args ];
          if ( firing ) {
            stack.push( args );
          } else {
            fire( args );
          }
        }
        return this;
      },
      // Call all the callbacks with the given arguments
      fire: function() {
        self.fireWith( this, arguments );
        return this;
      },
      // To know if the callbacks have already been called at least once
      fired: function() {
        return !!fired;
      }
    };

  return self;
};
jQuery.extend({

  Deferred: function( func ) {
    var tuples = [
        // action, add listener, listener list, final state
        [ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ],
        [ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ],
        [ "notify", "progress", jQuery.Callbacks("memory") ]
      ],
      state = "pending",
      promise = {
        state: function() {
          return state;
        },
        always: function() {
          deferred.done( arguments ).fail( arguments );
          return this;
        },
        then: function( /* fnDone, fnFail, fnProgress */ ) {
          var fns = arguments;
          return jQuery.Deferred(function( newDefer ) {
            jQuery.each( tuples, function( i, tuple ) {
              var action = tuple[ 0 ],
                fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];
              // deferred[ done | fail | progress ] for forwarding actions to newDefer
              deferred[ tuple[1] ](function() {
                var returned = fn && fn.apply( this, arguments );
                if ( returned && jQuery.isFunction( returned.promise ) ) {
                  returned.promise()
                    .done( newDefer.resolve )
                    .fail( newDefer.reject )
                    .progress( newDefer.notify );
                } else {
                  newDefer[ action + "With" ]( this === promise ? newDefer.promise() : this, fn ? [ returned ] : arguments );
                }
              });
            });
            fns = null;
          }).promise();
        },
        // Get a promise for this deferred
        // If obj is provided, the promise aspect is added to the object
        promise: function( obj ) {
          return obj != null ? jQuery.extend( obj, promise ) : promise;
        }
      },
      deferred = {};

    // Keep pipe for back-compat
    promise.pipe = promise.then;

    // Add list-specific methods
    jQuery.each( tuples, function( i, tuple ) {
      var list = tuple[ 2 ],
        stateString = tuple[ 3 ];

      // promise[ done | fail | progress ] = list.add
      promise[ tuple[1] ] = list.add;

      // Handle state
      if ( stateString ) {
        list.add(function() {
          // state = [ resolved | rejected ]
          state = stateString;

        // [ reject_list | resolve_list ].disable; progress_list.lock
        }, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
      }

      // deferred[ resolve | reject | notify ]
      deferred[ tuple[0] ] = function() {
        deferred[ tuple[0] + "With" ]( this === deferred ? promise : this, arguments );
        return this;
      };
      deferred[ tuple[0] + "With" ] = list.fireWith;
    });

    // Make the deferred a promise
    promise.promise( deferred );

    // Call given func if any
    if ( func ) {
      func.call( deferred, deferred );
    }

    // All done!
    return deferred;
  },

  // Deferred helper
  when: function( subordinate /* , ..., subordinateN */ ) {
    var i = 0,
      resolveValues = core_slice.call( arguments ),
      length = resolveValues.length,

      // the count of uncompleted subordinates
      remaining = length !== 1 || ( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

      // the master Deferred. If resolveValues consist of only a single Deferred, just use that.
      deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

      // Update function for both resolve and progress values
      updateFunc = function( i, contexts, values ) {
        return function( value ) {
          contexts[ i ] = this;
          values[ i ] = arguments.length > 1 ? core_slice.call( arguments ) : value;
          if( values === progressValues ) {
            deferred.notifyWith( contexts, values );
          } else if ( !( --remaining ) ) {
            deferred.resolveWith( contexts, values );
          }
        };
      },

      progressValues, progressContexts, resolveContexts;

    // add listeners to Deferred subordinates; treat others as resolved
    if ( length > 1 ) {
      progressValues = new Array( length );
      progressContexts = new Array( length );
      resolveContexts = new Array( length );
      for ( ; i < length; i++ ) {
        if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
          resolveValues[ i ].promise()
            .done( updateFunc( i, resolveContexts, resolveValues ) )
            .fail( deferred.reject )
            .progress( updateFunc( i, progressContexts, progressValues ) );
        } else {
          --remaining;
        }
      }
    }

    // if we're not waiting on anything, resolve the master
    if ( !remaining ) {
      deferred.resolveWith( resolveContexts, resolveValues );
    }

    return deferred.promise();
  }
});
jQuery.support = (function( support ) {

  var all, a, input, select, fragment, opt, eventName, isSupported, i,
    div = document.createElement("div");

  // Setup
  div.setAttribute( "className", "t" );
  div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";

  // Finish early in limited (non-browser) environments
  all = div.getElementsByTagName("*") || [];
  a = div.getElementsByTagName("a")[ 0 ];
  if ( !a || !a.style || !all.length ) {
    return support;
  }

  // First batch of tests
  select = document.createElement("select");
  opt = select.appendChild( document.createElement("option") );
  input = div.getElementsByTagName("input")[ 0 ];

  a.style.cssText = "top:1px;float:left;opacity:.5";

  // Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
  support.getSetAttribute = div.className !== "t";

  // IE strips leading whitespace when .innerHTML is used
  support.leadingWhitespace = div.firstChild.nodeType === 3;

  // Make sure that tbody elements aren't automatically inserted
  // IE will insert them into empty tables
  support.tbody = !div.getElementsByTagName("tbody").length;

  // Make sure that link elements get serialized correctly by innerHTML
  // This requires a wrapper element in IE
  support.htmlSerialize = !!div.getElementsByTagName("link").length;

  // Get the style information from getAttribute
  // (IE uses .cssText instead)
  support.style = /top/.test( a.getAttribute("style") );

  // Make sure that URLs aren't manipulated
  // (IE normalizes it by default)
  support.hrefNormalized = a.getAttribute("href") === "/a";

  // Make sure that element opacity exists
  // (IE uses filter instead)
  // Use a regex to work around a WebKit issue. See #5145
  support.opacity = /^0.5/.test( a.style.opacity );

  // Verify style float existence
  // (IE uses styleFloat instead of cssFloat)
  support.cssFloat = !!a.style.cssFloat;

  // Check the default checkbox/radio value ("" on WebKit; "on" elsewhere)
  support.checkOn = !!input.value;

  // Make sure that a selected-by-default option has a working selected property.
  // (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
  support.optSelected = opt.selected;

  // Tests for enctype support on a form (#6743)
  support.enctype = !!document.createElement("form").enctype;

  // Makes sure cloning an html5 element does not cause problems
  // Where outerHTML is undefined, this still works
  support.html5Clone = document.createElement("nav").cloneNode( true ).outerHTML !== "<:nav></:nav>";

  // Will be defined later
  support.inlineBlockNeedsLayout = false;
  support.shrinkWrapBlocks = false;
  support.pixelPosition = false;
  support.deleteExpando = true;
  support.noCloneEvent = true;
  support.reliableMarginRight = true;
  support.boxSizingReliable = true;

  // Make sure checked status is properly cloned
  input.checked = true;
  support.noCloneChecked = input.cloneNode( true ).checked;

  // Make sure that the options inside disabled selects aren't marked as disabled
  // (WebKit marks them as disabled)
  select.disabled = true;
  support.optDisabled = !opt.disabled;

  // Support: IE<9
  try {
    delete div.test;
  } catch( e ) {
    support.deleteExpando = false;
  }

  // Check if we can trust getAttribute("value")
  input = document.createElement("input");
  input.setAttribute( "value", "" );
  support.input = input.getAttribute( "value" ) === "";

  // Check if an input maintains its value after becoming a radio
  input.value = "t";
  input.setAttribute( "type", "radio" );
  support.radioValue = input.value === "t";

  // #11217 - WebKit loses check when the name is after the checked attribute
  input.setAttribute( "checked", "t" );
  input.setAttribute( "name", "t" );

  fragment = document.createDocumentFragment();
  fragment.appendChild( input );

  // Check if a disconnected checkbox will retain its checked
  // value of true after appended to the DOM (IE6/7)
  support.appendChecked = input.checked;

  // WebKit doesn't clone checked state correctly in fragments
  support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;

  // Support: IE<9
  // Opera does not clone events (and typeof div.attachEvent === undefined).
  // IE9-10 clones events bound via attachEvent, but they don't trigger with .click()
  if ( div.attachEvent ) {
    div.attachEvent( "onclick", function() {
      support.noCloneEvent = false;
    });

    div.cloneNode( true ).click();
  }

  // Support: IE<9 (lack submit/change bubble), Firefox 17+ (lack focusin event)
  // Beware of CSP restrictions (https://developer.mozilla.org/en/Security/CSP)
  for ( i in { submit: true, change: true, focusin: true }) {
    div.setAttribute( eventName = "on" + i, "t" );

    support[ i + "Bubbles" ] = eventName in window || div.attributes[ eventName ].expando === false;
  }

  div.style.backgroundClip = "content-box";
  div.cloneNode( true ).style.backgroundClip = "";
  support.clearCloneStyle = div.style.backgroundClip === "content-box";

  // Support: IE<9
  // Iteration over object's inherited properties before its own.
  for ( i in jQuery( support ) ) {
    break;
  }
  support.ownLast = i !== "0";

  // Run tests that need a body at doc ready
  jQuery(function() {
    var container, marginDiv, tds,
      divReset = "padding:0;margin:0;border:0;display:block;box-sizing:content-box;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;",
      body = document.getElementsByTagName("body")[0];

    if ( !body ) {
      // Return for frameset docs that don't have a body
      return;
    }

    container = document.createElement("div");
    container.style.cssText = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px";

    body.appendChild( container ).appendChild( div );

    // Support: IE8
    // Check if table cells still have offsetWidth/Height when they are set
    // to display:none and there are still other visible table cells in a
    // table row; if so, offsetWidth/Height are not reliable for use when
    // determining if an element has been hidden directly using
    // display:none (it is still safe to use offsets if a parent element is
    // hidden; don safety goggles and see bug #4512 for more information).
    div.innerHTML = "<table><tr><td></td><td>t</td></tr></table>";
    tds = div.getElementsByTagName("td");
    tds[ 0 ].style.cssText = "padding:0;margin:0;border:0;display:none";
    isSupported = ( tds[ 0 ].offsetHeight === 0 );

    tds[ 0 ].style.display = "";
    tds[ 1 ].style.display = "none";

    // Support: IE8
    // Check if empty table cells still have offsetWidth/Height
    support.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );

    // Check box-sizing and margin behavior.
    div.innerHTML = "";
    div.style.cssText = "box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;";

    // Workaround failing boxSizing test due to offsetWidth returning wrong value
    // with some non-1 values of body zoom, ticket #13543
    jQuery.swap( body, body.style.zoom != null ? { zoom: 1 } : {}, function() {
      support.boxSizing = div.offsetWidth === 4;
    });

    // Use window.getComputedStyle because jsdom on node.js will break without it.
    if ( window.getComputedStyle ) {
      support.pixelPosition = ( window.getComputedStyle( div, null ) || {} ).top !== "1%";
      support.boxSizingReliable = ( window.getComputedStyle( div, null ) || { width: "4px" } ).width === "4px";

      // Check if div with explicit width and no margin-right incorrectly
      // gets computed margin-right based on width of container. (#3333)
      // Fails in WebKit before Feb 2011 nightlies
      // WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
      marginDiv = div.appendChild( document.createElement("div") );
      marginDiv.style.cssText = div.style.cssText = divReset;
      marginDiv.style.marginRight = marginDiv.style.width = "0";
      div.style.width = "1px";

      support.reliableMarginRight =
        !parseFloat( ( window.getComputedStyle( marginDiv, null ) || {} ).marginRight );
    }

    if ( typeof div.style.zoom !== core_strundefined ) {
      // Support: IE<8
      // Check if natively block-level elements act like inline-block
      // elements when setting their display to 'inline' and giving
      // them layout
      div.innerHTML = "";
      div.style.cssText = divReset + "width:1px;padding:1px;display:inline;zoom:1";
      support.inlineBlockNeedsLayout = ( div.offsetWidth === 3 );

      // Support: IE6
      // Check if elements with layout shrink-wrap their children
      div.style.display = "block";
      div.innerHTML = "<div></div>";
      div.firstChild.style.width = "5px";
      support.shrinkWrapBlocks = ( div.offsetWidth !== 3 );

      if ( support.inlineBlockNeedsLayout ) {
        // Prevent IE 6 from affecting layout for positioned elements #11048
        // Prevent IE from shrinking the body in IE 7 mode #12869
        // Support: IE<8
        body.style.zoom = 1;
      }
    }

    body.removeChild( container );

    // Null elements to avoid leaks in IE
    container = div = tds = marginDiv = null;
  });

  // Null elements to avoid leaks in IE
  all = select = fragment = opt = a = input = null;

  return support;
})({});

var rbrace = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
  rmultiDash = /([A-Z])/g;

function internalData( elem, name, data, pvt /* Internal Use Only */ ){
  if ( !jQuery.acceptData( elem ) ) {
    return;
  }

  var ret, thisCache,
    internalKey = jQuery.expando,

    // We have to handle DOM nodes and JS objects differently because IE6-7
    // can't GC object references properly across the DOM-JS boundary
    isNode = elem.nodeType,

    // Only DOM nodes need the global jQuery cache; JS object data is
    // attached directly to the object so GC can occur automatically
    cache = isNode ? jQuery.cache : elem,

    // Only defining an ID for JS objects if its cache already exists allows
    // the code to shortcut on the same path as a DOM node with no cache
    id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey;

  // Avoid doing any more work than we need to when trying to get data on an
  // object that has no data at all
  if ( (!id || !cache[id] || (!pvt && !cache[id].data)) && data === undefined && typeof name === "string" ) {
    return;
  }

  if ( !id ) {
    // Only DOM nodes need a new unique ID for each element since their data
    // ends up in the global cache
    if ( isNode ) {
      id = elem[ internalKey ] = core_deletedIds.pop() || jQuery.guid++;
    } else {
      id = internalKey;
    }
  }

  if ( !cache[ id ] ) {
    // Avoid exposing jQuery metadata on plain JS objects when the object
    // is serialized using JSON.stringify
    cache[ id ] = isNode ? {} : { toJSON: jQuery.noop };
  }

  // An object can be passed to jQuery.data instead of a key/value pair; this gets
  // shallow copied over onto the existing cache
  if ( typeof name === "object" || typeof name === "function" ) {
    if ( pvt ) {
      cache[ id ] = jQuery.extend( cache[ id ], name );
    } else {
      cache[ id ].data = jQuery.extend( cache[ id ].data, name );
    }
  }

  thisCache = cache[ id ];

  // jQuery data() is stored in a separate object inside the object's internal data
  // cache in order to avoid key collisions between internal data and user-defined
  // data.
  if ( !pvt ) {
    if ( !thisCache.data ) {
      thisCache.data = {};
    }

    thisCache = thisCache.data;
  }

  if ( data !== undefined ) {
    thisCache[ jQuery.camelCase( name ) ] = data;
  }

  // Check for both converted-to-camel and non-converted data property names
  // If a data property was specified
  if ( typeof name === "string" ) {

    // First Try to find as-is property data
    ret = thisCache[ name ];

    // Test for null|undefined property data
    if ( ret == null ) {

      // Try to find the camelCased property
      ret = thisCache[ jQuery.camelCase( name ) ];
    }
  } else {
    ret = thisCache;
  }

  return ret;
}

function internalRemoveData( elem, name, pvt ) {
  if ( !jQuery.acceptData( elem ) ) {
    return;
  }

  var thisCache, i,
    isNode = elem.nodeType,

    // See jQuery.data for more information
    cache = isNode ? jQuery.cache : elem,
    id = isNode ? elem[ jQuery.expando ] : jQuery.expando;

  // If there is already no cache entry for this object, there is no
  // purpose in continuing
  if ( !cache[ id ] ) {
    return;
  }

  if ( name ) {

    thisCache = pvt ? cache[ id ] : cache[ id ].data;

    if ( thisCache ) {

      // Support array or space separated string names for data keys
      if ( !jQuery.isArray( name ) ) {

        // try the string as a key before any manipulation
        if ( name in thisCache ) {
          name = [ name ];
        } else {

          // split the camel cased version by spaces unless a key with the spaces exists
          name = jQuery.camelCase( name );
          if ( name in thisCache ) {
            name = [ name ];
          } else {
            name = name.split(" ");
          }
        }
      } else {
        // If "name" is an array of keys...
        // When data is initially created, via ("key", "val") signature,
        // keys will be converted to camelCase.
        // Since there is no way to tell _how_ a key was added, remove
        // both plain key and camelCase key. #12786
        // This will only penalize the array argument path.
        name = name.concat( jQuery.map( name, jQuery.camelCase ) );
      }

      i = name.length;
      while ( i-- ) {
        delete thisCache[ name[i] ];
      }

      // If there is no data left in the cache, we want to continue
      // and let the cache object itself get destroyed
      if ( pvt ? !isEmptyDataObject(thisCache) : !jQuery.isEmptyObject(thisCache) ) {
        return;
      }
    }
  }

  // See jQuery.data for more information
  if ( !pvt ) {
    delete cache[ id ].data;

    // Don't destroy the parent cache unless the internal data object
    // had been the only thing left in it
    if ( !isEmptyDataObject( cache[ id ] ) ) {
      return;
    }
  }

  // Destroy the cache
  if ( isNode ) {
    jQuery.cleanData( [ elem ], true );

  // Use delete when supported for expandos or `cache` is not a window per isWindow (#10080)
  /* jshint eqeqeq: false */
  } else if ( jQuery.support.deleteExpando || cache != cache.window ) {
    /* jshint eqeqeq: true */
    delete cache[ id ];

  // When all else fails, null
  } else {
    cache[ id ] = null;
  }
}

jQuery.extend({
  cache: {},

  // The following elements throw uncatchable exceptions if you
  // attempt to add expando properties to them.
  noData: {
    "applet": true,
    "embed": true,
    // Ban all objects except for Flash (which handle expandos)
    "object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
  },

  hasData: function( elem ) {
    elem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];
    return !!elem && !isEmptyDataObject( elem );
  },

  data: function( elem, name, data ) {
    return internalData( elem, name, data );
  },

  removeData: function( elem, name ) {
    return internalRemoveData( elem, name );
  },

  // For internal use only.
  _data: function( elem, name, data ) {
    return internalData( elem, name, data, true );
  },

  _removeData: function( elem, name ) {
    return internalRemoveData( elem, name, true );
  },

  // A method for determining if a DOM node can handle the data expando
  acceptData: function( elem ) {
    // Do not set data on non-element because it will not be cleared (#8335).
    if ( elem.nodeType && elem.nodeType !== 1 && elem.nodeType !== 9 ) {
      return false;
    }

    var noData = elem.nodeName && jQuery.noData[ elem.nodeName.toLowerCase() ];

    // nodes accept data unless otherwise specified; rejection can be conditional
    return !noData || noData !== true && elem.getAttribute("classid") === noData;
  }
});

jQuery.fn.extend({
  data: function( key, value ) {
    var attrs, name,
      data = null,
      i = 0,
      elem = this[0];

    // Special expections of .data basically thwart jQuery.access,
    // so implement the relevant behavior ourselves

    // Gets all values
    if ( key === undefined ) {
      if ( this.length ) {
        data = jQuery.data( elem );

        if ( elem.nodeType === 1 && !jQuery._data( elem, "parsedAttrs" ) ) {
          attrs = elem.attributes;
          for ( ; i < attrs.length; i++ ) {
            name = attrs[i].name;

            if ( name.indexOf("data-") === 0 ) {
              name = jQuery.camelCase( name.slice(5) );

              dataAttr( elem, name, data[ name ] );
            }
          }
          jQuery._data( elem, "parsedAttrs", true );
        }
      }

      return data;
    }

    // Sets multiple values
    if ( typeof key === "object" ) {
      return this.each(function() {
        jQuery.data( this, key );
      });
    }

    return arguments.length > 1 ?

      // Sets one value
      this.each(function() {
        jQuery.data( this, key, value );
      }) :

      // Gets one value
      // Try to fetch any internally stored data first
      elem ? dataAttr( elem, key, jQuery.data( elem, key ) ) : null;
  },

  removeData: function( key ) {
    return this.each(function() {
      jQuery.removeData( this, key );
    });
  }
});

function dataAttr( elem, key, data ) {
  // If nothing was found internally, try to fetch any
  // data from the HTML5 data-* attribute
  if ( data === undefined && elem.nodeType === 1 ) {

    var name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();

    data = elem.getAttribute( name );

    if ( typeof data === "string" ) {
      try {
        data = data === "true" ? true :
          data === "false" ? false :
          data === "null" ? null :
          // Only convert to a number if it doesn't change the string
          +data + "" === data ? +data :
          rbrace.test( data ) ? jQuery.parseJSON( data ) :
            data;
      } catch( e ) {}

      // Make sure we set the data so it isn't changed later
      jQuery.data( elem, key, data );

    } else {
      data = undefined;
    }
  }

  return data;
}

// checks a cache object for emptiness
function isEmptyDataObject( obj ) {
  var name;
  for ( name in obj ) {

    // if the public data object is empty, the private is still empty
    if ( name === "data" && jQuery.isEmptyObject( obj[name] ) ) {
      continue;
    }
    if ( name !== "toJSON" ) {
      return false;
    }
  }

  return true;
}
jQuery.extend({
  queue: function( elem, type, data ) {
    var queue;

    if ( elem ) {
      type = ( type || "fx" ) + "queue";
      queue = jQuery._data( elem, type );

      // Speed up dequeue by getting out quickly if this is just a lookup
      if ( data ) {
        if ( !queue || jQuery.isArray(data) ) {
          queue = jQuery._data( elem, type, jQuery.makeArray(data) );
        } else {
          queue.push( data );
        }
      }
      return queue || [];
    }
  },

  dequeue: function( elem, type ) {
    type = type || "fx";

    var queue = jQuery.queue( elem, type ),
      startLength = queue.length,
      fn = queue.shift(),
      hooks = jQuery._queueHooks( elem, type ),
      next = function() {
        jQuery.dequeue( elem, type );
      };

    // If the fx queue is dequeued, always remove the progress sentinel
    if ( fn === "inprogress" ) {
      fn = queue.shift();
      startLength--;
    }

    if ( fn ) {

      // Add a progress sentinel to prevent the fx queue from being
      // automatically dequeued
      if ( type === "fx" ) {
        queue.unshift( "inprogress" );
      }

      // clear up the last queue stop function
      delete hooks.stop;
      fn.call( elem, next, hooks );
    }

    if ( !startLength && hooks ) {
      hooks.empty.fire();
    }
  },

  // not intended for public consumption - generates a queueHooks object, or returns the current one
  _queueHooks: function( elem, type ) {
    var key = type + "queueHooks";
    return jQuery._data( elem, key ) || jQuery._data( elem, key, {
      empty: jQuery.Callbacks("once memory").add(function() {
        jQuery._removeData( elem, type + "queue" );
        jQuery._removeData( elem, key );
      })
    });
  }
});

jQuery.fn.extend({
  queue: function( type, data ) {
    var setter = 2;

    if ( typeof type !== "string" ) {
      data = type;
      type = "fx";
      setter--;
    }

    if ( arguments.length < setter ) {
      return jQuery.queue( this[0], type );
    }

    return data === undefined ?
      this :
      this.each(function() {
        var queue = jQuery.queue( this, type, data );

        // ensure a hooks for this queue
        jQuery._queueHooks( this, type );

        if ( type === "fx" && queue[0] !== "inprogress" ) {
          jQuery.dequeue( this, type );
        }
      });
  },
  dequeue: function( type ) {
    return this.each(function() {
      jQuery.dequeue( this, type );
    });
  },
  // Based off of the plugin by Clint Helfers, with permission.
  // http://blindsignals.com/index.php/2009/07/jquery-delay/
  delay: function( time, type ) {
    time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
    type = type || "fx";

    return this.queue( type, function( next, hooks ) {
      var timeout = setTimeout( next, time );
      hooks.stop = function() {
        clearTimeout( timeout );
      };
    });
  },
  clearQueue: function( type ) {
    return this.queue( type || "fx", [] );
  },
  // Get a promise resolved when queues of a certain type
  // are emptied (fx is the type by default)
  promise: function( type, obj ) {
    var tmp,
      count = 1,
      defer = jQuery.Deferred(),
      elements = this,
      i = this.length,
      resolve = function() {
        if ( !( --count ) ) {
          defer.resolveWith( elements, [ elements ] );
        }
      };

    if ( typeof type !== "string" ) {
      obj = type;
      type = undefined;
    }
    type = type || "fx";

    while( i-- ) {
      tmp = jQuery._data( elements[ i ], type + "queueHooks" );
      if ( tmp && tmp.empty ) {
        count++;
        tmp.empty.add( resolve );
      }
    }
    resolve();
    return defer.promise( obj );
  }
});
var nodeHook, boolHook,
  rclass = /[\t\r\n\f]/g,
  rreturn = /\r/g,
  rfocusable = /^(?:input|select|textarea|button|object)$/i,
  rclickable = /^(?:a|area)$/i,
  ruseDefault = /^(?:checked|selected)$/i,
  getSetAttribute = jQuery.support.getSetAttribute,
  getSetInput = jQuery.support.input;

jQuery.fn.extend({
  attr: function( name, value ) {
    return jQuery.access( this, jQuery.attr, name, value, arguments.length > 1 );
  },

  removeAttr: function( name ) {
    return this.each(function() {
      jQuery.removeAttr( this, name );
    });
  },

  prop: function( name, value ) {
    return jQuery.access( this, jQuery.prop, name, value, arguments.length > 1 );
  },

  removeProp: function( name ) {
    name = jQuery.propFix[ name ] || name;
    return this.each(function() {
      // try/catch handles cases where IE balks (such as removing a property on window)
      try {
        this[ name ] = undefined;
        delete this[ name ];
      } catch( e ) {}
    });
  },

  addClass: function( value ) {
    var classes, elem, cur, clazz, j,
      i = 0,
      len = this.length,
      proceed = typeof value === "string" && value;

    if ( jQuery.isFunction( value ) ) {
      return this.each(function( j ) {
        jQuery( this ).addClass( value.call( this, j, this.className ) );
      });
    }

    if ( proceed ) {
      // The disjunction here is for better compressibility (see removeClass)
      classes = ( value || "" ).match( core_rnotwhite ) || [];

      for ( ; i < len; i++ ) {
        elem = this[ i ];
        cur = elem.nodeType === 1 && ( elem.className ?
          ( " " + elem.className + " " ).replace( rclass, " " ) :
          " "
        );

        if ( cur ) {
          j = 0;
          while ( (clazz = classes[j++]) ) {
            if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
              cur += clazz + " ";
            }
          }
          elem.className = jQuery.trim( cur );

        }
      }
    }

    return this;
  },

  removeClass: function( value ) {
    var classes, elem, cur, clazz, j,
      i = 0,
      len = this.length,
      proceed = arguments.length === 0 || typeof value === "string" && value;

    if ( jQuery.isFunction( value ) ) {
      return this.each(function( j ) {
        jQuery( this ).removeClass( value.call( this, j, this.className ) );
      });
    }
    if ( proceed ) {
      classes = ( value || "" ).match( core_rnotwhite ) || [];

      for ( ; i < len; i++ ) {
        elem = this[ i ];
        // This expression is here for better compressibility (see addClass)
        cur = elem.nodeType === 1 && ( elem.className ?
          ( " " + elem.className + " " ).replace( rclass, " " ) :
          ""
        );

        if ( cur ) {
          j = 0;
          while ( (clazz = classes[j++]) ) {
            // Remove *all* instances
            while ( cur.indexOf( " " + clazz + " " ) >= 0 ) {
              cur = cur.replace( " " + clazz + " ", " " );
            }
          }
          elem.className = value ? jQuery.trim( cur ) : "";
        }
      }
    }

    return this;
  },

  toggleClass: function( value, stateVal ) {
    var type = typeof value;

    if ( typeof stateVal === "boolean" && type === "string" ) {
      return stateVal ? this.addClass( value ) : this.removeClass( value );
    }

    if ( jQuery.isFunction( value ) ) {
      return this.each(function( i ) {
        jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
      });
    }

    return this.each(function() {
      if ( type === "string" ) {
        // toggle individual class names
        var className,
          i = 0,
          self = jQuery( this ),
          classNames = value.match( core_rnotwhite ) || [];

        while ( (className = classNames[ i++ ]) ) {
          // check each className given, space separated list
          if ( self.hasClass( className ) ) {
            self.removeClass( className );
          } else {
            self.addClass( className );
          }
        }

      // Toggle whole class name
      } else if ( type === core_strundefined || type === "boolean" ) {
        if ( this.className ) {
          // store className if set
          jQuery._data( this, "__className__", this.className );
        }

        // If the element has a class name or if we're passed "false",
        // then remove the whole classname (if there was one, the above saved it).
        // Otherwise bring back whatever was previously saved (if anything),
        // falling back to the empty string if nothing was stored.
        this.className = this.className || value === false ? "" : jQuery._data( this, "__className__" ) || "";
      }
    });
  },

  hasClass: function( selector ) {
    var className = " " + selector + " ",
      i = 0,
      l = this.length;
    for ( ; i < l; i++ ) {
      if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) >= 0 ) {
        return true;
      }
    }

    return false;
  },

  val: function( value ) {
    var ret, hooks, isFunction,
      elem = this[0];

    if ( !arguments.length ) {
      if ( elem ) {
        hooks = jQuery.valHooks[ elem.type ] || jQuery.valHooks[ elem.nodeName.toLowerCase() ];

        if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
          return ret;
        }

        ret = elem.value;

        return typeof ret === "string" ?
          // handle most common string cases
          ret.replace(rreturn, "") :
          // handle cases where value is null/undef or number
          ret == null ? "" : ret;
      }

      return;
    }

    isFunction = jQuery.isFunction( value );

    return this.each(function( i ) {
      var val;

      if ( this.nodeType !== 1 ) {
        return;
      }

      if ( isFunction ) {
        val = value.call( this, i, jQuery( this ).val() );
      } else {
        val = value;
      }

      // Treat null/undefined as ""; convert numbers to string
      if ( val == null ) {
        val = "";
      } else if ( typeof val === "number" ) {
        val += "";
      } else if ( jQuery.isArray( val ) ) {
        val = jQuery.map(val, function ( value ) {
          return value == null ? "" : value + "";
        });
      }

      hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

      // If set returns undefined, fall back to normal setting
      if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
        this.value = val;
      }
    });
  }
});

jQuery.extend({
  valHooks: {
    option: {
      get: function( elem ) {
        // Use proper attribute retrieval(#6932, #12072)
        var val = jQuery.find.attr( elem, "value" );
        return val != null ?
          val :
          elem.text;
      }
    },
    select: {
      get: function( elem ) {
        var value, option,
          options = elem.options,
          index = elem.selectedIndex,
          one = elem.type === "select-one" || index < 0,
          values = one ? null : [],
          max = one ? index + 1 : options.length,
          i = index < 0 ?
            max :
            one ? index : 0;

        // Loop through all the selected options
        for ( ; i < max; i++ ) {
          option = options[ i ];

          // oldIE doesn't update selected after form reset (#2551)
          if ( ( option.selected || i === index ) &&
              // Don't return options that are disabled or in a disabled optgroup
              ( jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null ) &&
              ( !option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

            // Get the specific value for the option
            value = jQuery( option ).val();

            // We don't need an array for one selects
            if ( one ) {
              return value;
            }

            // Multi-Selects return an array
            values.push( value );
          }
        }

        return values;
      },

      set: function( elem, value ) {
        var optionSet, option,
          options = elem.options,
          values = jQuery.makeArray( value ),
          i = options.length;

        while ( i-- ) {
          option = options[ i ];
          if ( (option.selected = jQuery.inArray( jQuery(option).val(), values ) >= 0) ) {
            optionSet = true;
          }
        }

        // force browsers to behave consistently when non-matching value is set
        if ( !optionSet ) {
          elem.selectedIndex = -1;
        }
        return values;
      }
    }
  },

  attr: function( elem, name, value ) {
    var hooks, ret,
      nType = elem.nodeType;

    // don't get/set attributes on text, comment and attribute nodes
    if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
      return;
    }

    // Fallback to prop when attributes are not supported
    if ( typeof elem.getAttribute === core_strundefined ) {
      return jQuery.prop( elem, name, value );
    }

    // All attributes are lowercase
    // Grab necessary hook if one is defined
    if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
      name = name.toLowerCase();
      hooks = jQuery.attrHooks[ name ] ||
        ( jQuery.expr.match.bool.test( name ) ? boolHook : nodeHook );
    }

    if ( value !== undefined ) {

      if ( value === null ) {
        jQuery.removeAttr( elem, name );

      } else if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
        return ret;

      } else {
        elem.setAttribute( name, value + "" );
        return value;
      }

    } else if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
      return ret;

    } else {
      ret = jQuery.find.attr( elem, name );

      // Non-existent attributes return null, we normalize to undefined
      return ret == null ?
        undefined :
        ret;
    }
  },

  removeAttr: function( elem, value ) {
    var name, propName,
      i = 0,
      attrNames = value && value.match( core_rnotwhite );

    if ( attrNames && elem.nodeType === 1 ) {
      while ( (name = attrNames[i++]) ) {
        propName = jQuery.propFix[ name ] || name;

        // Boolean attributes get special treatment (#10870)
        if ( jQuery.expr.match.bool.test( name ) ) {
          // Set corresponding property to false
          if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {
            elem[ propName ] = false;
          // Support: IE<9
          // Also clear defaultChecked/defaultSelected (if appropriate)
          } else {
            elem[ jQuery.camelCase( "default-" + name ) ] =
              elem[ propName ] = false;
          }

        // See #9699 for explanation of this approach (setting first, then removal)
        } else {
          jQuery.attr( elem, name, "" );
        }

        elem.removeAttribute( getSetAttribute ? name : propName );
      }
    }
  },

  attrHooks: {
    type: {
      set: function( elem, value ) {
        if ( !jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input") ) {
          // Setting the type on a radio button after the value resets the value in IE6-9
          // Reset value to default in case type is set after value during creation
          var val = elem.value;
          elem.setAttribute( "type", value );
          if ( val ) {
            elem.value = val;
          }
          return value;
        }
      }
    }
  },

  propFix: {
    "for": "htmlFor",
    "class": "className"
  },

  prop: function( elem, name, value ) {
    var ret, hooks, notxml,
      nType = elem.nodeType;

    // don't get/set properties on text, comment and attribute nodes
    if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
      return;
    }

    notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

    if ( notxml ) {
      // Fix name and attach hooks
      name = jQuery.propFix[ name ] || name;
      hooks = jQuery.propHooks[ name ];
    }

    if ( value !== undefined ) {
      return hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ?
        ret :
        ( elem[ name ] = value );

    } else {
      return hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ?
        ret :
        elem[ name ];
    }
  },

  propHooks: {
    tabIndex: {
      get: function( elem ) {
        // elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
        // http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
        // Use proper attribute retrieval(#12072)
        var tabindex = jQuery.find.attr( elem, "tabindex" );

        return tabindex ?
          parseInt( tabindex, 10 ) :
          rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?
            0 :
            -1;
      }
    }
  }
});

// Hooks for boolean attributes
boolHook = {
  set: function( elem, value, name ) {
    if ( value === false ) {
      // Remove boolean attributes when set to false
      jQuery.removeAttr( elem, name );
    } else if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {
      // IE<8 needs the *property* name
      elem.setAttribute( !getSetAttribute && jQuery.propFix[ name ] || name, name );

    // Use defaultChecked and defaultSelected for oldIE
    } else {
      elem[ jQuery.camelCase( "default-" + name ) ] = elem[ name ] = true;
    }

    return name;
  }
};
jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
  var getter = jQuery.expr.attrHandle[ name ] || jQuery.find.attr;

  jQuery.expr.attrHandle[ name ] = getSetInput && getSetAttribute || !ruseDefault.test( name ) ?
    function( elem, name, isXML ) {
      var fn = jQuery.expr.attrHandle[ name ],
        ret = isXML ?
          undefined :
          /* jshint eqeqeq: false */
          (jQuery.expr.attrHandle[ name ] = undefined) !=
            getter( elem, name, isXML ) ?

            name.toLowerCase() :
            null;
      jQuery.expr.attrHandle[ name ] = fn;
      return ret;
    } :
    function( elem, name, isXML ) {
      return isXML ?
        undefined :
        elem[ jQuery.camelCase( "default-" + name ) ] ?
          name.toLowerCase() :
          null;
    };
});

// fix oldIE attroperties
if ( !getSetInput || !getSetAttribute ) {
  jQuery.attrHooks.value = {
    set: function( elem, value, name ) {
      if ( jQuery.nodeName( elem, "input" ) ) {
        // Does not return so that setAttribute is also used
        elem.defaultValue = value;
      } else {
        // Use nodeHook if defined (#1954); otherwise setAttribute is fine
        return nodeHook && nodeHook.set( elem, value, name );
      }
    }
  };
}

// IE6/7 do not support getting/setting some attributes with get/setAttribute
if ( !getSetAttribute ) {

  // Use this for any attribute in IE6/7
  // This fixes almost every IE6/7 issue
  nodeHook = {
    set: function( elem, value, name ) {
      // Set the existing or create a new attribute node
      var ret = elem.getAttributeNode( name );
      if ( !ret ) {
        elem.setAttributeNode(
          (ret = elem.ownerDocument.createAttribute( name ))
        );
      }

      ret.value = value += "";

      // Break association with cloned elements by also using setAttribute (#9646)
      return name === "value" || value === elem.getAttribute( name ) ?
        value :
        undefined;
    }
  };
  jQuery.expr.attrHandle.id = jQuery.expr.attrHandle.name = jQuery.expr.attrHandle.coords =
    // Some attributes are constructed with empty-string values when not defined
    function( elem, name, isXML ) {
      var ret;
      return isXML ?
        undefined :
        (ret = elem.getAttributeNode( name )) && ret.value !== "" ?
          ret.value :
          null;
    };
  jQuery.valHooks.button = {
    get: function( elem, name ) {
      var ret = elem.getAttributeNode( name );
      return ret && ret.specified ?
        ret.value :
        undefined;
    },
    set: nodeHook.set
  };

  // Set contenteditable to false on removals(#10429)
  // Setting to empty string throws an error as an invalid value
  jQuery.attrHooks.contenteditable = {
    set: function( elem, value, name ) {
      nodeHook.set( elem, value === "" ? false : value, name );
    }
  };

  // Set width and height to auto instead of 0 on empty string( Bug #8150 )
  // This is for removals
  jQuery.each([ "width", "height" ], function( i, name ) {
    jQuery.attrHooks[ name ] = {
      set: function( elem, value ) {
        if ( value === "" ) {
          elem.setAttribute( name, "auto" );
          return value;
        }
      }
    };
  });
}


// Some attributes require a special call on IE
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !jQuery.support.hrefNormalized ) {
  // href/src property should get the full normalized URL (#10299/#12915)
  jQuery.each([ "href", "src" ], function( i, name ) {
    jQuery.propHooks[ name ] = {
      get: function( elem ) {
        return elem.getAttribute( name, 4 );
      }
    };
  });
}

if ( !jQuery.support.style ) {
  jQuery.attrHooks.style = {
    get: function( elem ) {
      // Return undefined in the case of empty string
      // Note: IE uppercases css property names, but if we were to .toLowerCase()
      // .cssText, that would destroy case senstitivity in URL's, like in "background"
      return elem.style.cssText || undefined;
    },
    set: function( elem, value ) {
      return ( elem.style.cssText = value + "" );
    }
  };
}

// Safari mis-reports the default selected property of an option
// Accessing the parent's selectedIndex property fixes it
if ( !jQuery.support.optSelected ) {
  jQuery.propHooks.selected = {
    get: function( elem ) {
      var parent = elem.parentNode;

      if ( parent ) {
        parent.selectedIndex;

        // Make sure that it also works with optgroups, see #5701
        if ( parent.parentNode ) {
          parent.parentNode.selectedIndex;
        }
      }
      return null;
    }
  };
}

jQuery.each([
  "tabIndex",
  "readOnly",
  "maxLength",
  "cellSpacing",
  "cellPadding",
  "rowSpan",
  "colSpan",
  "useMap",
  "frameBorder",
  "contentEditable"
], function() {
  jQuery.propFix[ this.toLowerCase() ] = this;
});

// IE6/7 call enctype encoding
if ( !jQuery.support.enctype ) {
  jQuery.propFix.enctype = "encoding";
}

// Radios and checkboxes getter/setter
jQuery.each([ "radio", "checkbox" ], function() {
  jQuery.valHooks[ this ] = {
    set: function( elem, value ) {
      if ( jQuery.isArray( value ) ) {
        return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );
      }
    }
  };
  if ( !jQuery.support.checkOn ) {
    jQuery.valHooks[ this ].get = function( elem ) {
      // Support: Webkit
      // "" is returned instead of "on" if a value isn't specified
      return elem.getAttribute("value") === null ? "on" : elem.value;
    };
  }
});
var rformElems = /^(?:input|select|textarea)$/i,
  rkeyEvent = /^key/,
  rmouseEvent = /^(?:mouse|contextmenu)|click/,
  rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
  rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;

function returnTrue() {
  return true;
}

function returnFalse() {
  return false;
}

function safeActiveElement() {
  try {
    return document.activeElement;
  } catch ( err ) { }
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

  global: {},

  add: function( elem, types, handler, data, selector ) {
    var tmp, events, t, handleObjIn,
      special, eventHandle, handleObj,
      handlers, type, namespaces, origType,
      elemData = jQuery._data( elem );

    // Don't attach events to noData or text/comment nodes (but allow plain objects)
    if ( !elemData ) {
      return;
    }

    // Caller can pass in an object of custom data in lieu of the handler
    if ( handler.handler ) {
      handleObjIn = handler;
      handler = handleObjIn.handler;
      selector = handleObjIn.selector;
    }

    // Make sure that the handler has a unique ID, used to find/remove it later
    if ( !handler.guid ) {
      handler.guid = jQuery.guid++;
    }

    // Init the element's event structure and main handler, if this is the first
    if ( !(events = elemData.events) ) {
      events = elemData.events = {};
    }
    if ( !(eventHandle = elemData.handle) ) {
      eventHandle = elemData.handle = function( e ) {
        // Discard the second event of a jQuery.event.trigger() and
        // when an event is called after a page has unloaded
        return typeof jQuery !== core_strundefined && (!e || jQuery.event.triggered !== e.type) ?
          jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
          undefined;
      };
      // Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
      eventHandle.elem = elem;
    }

    // Handle multiple events separated by a space
    types = ( types || "" ).match( core_rnotwhite ) || [""];
    t = types.length;
    while ( t-- ) {
      tmp = rtypenamespace.exec( types[t] ) || [];
      type = origType = tmp[1];
      namespaces = ( tmp[2] || "" ).split( "." ).sort();

      // There *must* be a type, no attaching namespace-only handlers
      if ( !type ) {
        continue;
      }

      // If event changes its type, use the special event handlers for the changed type
      special = jQuery.event.special[ type ] || {};

      // If selector defined, determine special event api type, otherwise given type
      type = ( selector ? special.delegateType : special.bindType ) || type;

      // Update special based on newly reset type
      special = jQuery.event.special[ type ] || {};

      // handleObj is passed to all event handlers
      handleObj = jQuery.extend({
        type: type,
        origType: origType,
        data: data,
        handler: handler,
        guid: handler.guid,
        selector: selector,
        needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
        namespace: namespaces.join(".")
      }, handleObjIn );

      // Init the event handler queue if we're the first
      if ( !(handlers = events[ type ]) ) {
        handlers = events[ type ] = [];
        handlers.delegateCount = 0;

        // Only use addEventListener/attachEvent if the special events handler returns false
        if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
          // Bind the global event handler to the element
          if ( elem.addEventListener ) {
            elem.addEventListener( type, eventHandle, false );

          } else if ( elem.attachEvent ) {
            elem.attachEvent( "on" + type, eventHandle );
          }
        }
      }

      if ( special.add ) {
        special.add.call( elem, handleObj );

        if ( !handleObj.handler.guid ) {
          handleObj.handler.guid = handler.guid;
        }
      }

      // Add to the element's handler list, delegates in front
      if ( selector ) {
        handlers.splice( handlers.delegateCount++, 0, handleObj );
      } else {
        handlers.push( handleObj );
      }

      // Keep track of which events have ever been used, for event optimization
      jQuery.event.global[ type ] = true;
    }

    // Nullify elem to prevent memory leaks in IE
    elem = null;
  },

  // Detach an event or set of events from an element
  remove: function( elem, types, handler, selector, mappedTypes ) {
    var j, handleObj, tmp,
      origCount, t, events,
      special, handlers, type,
      namespaces, origType,
      elemData = jQuery.hasData( elem ) && jQuery._data( elem );

    if ( !elemData || !(events = elemData.events) ) {
      return;
    }

    // Once for each type.namespace in types; type may be omitted
    types = ( types || "" ).match( core_rnotwhite ) || [""];
    t = types.length;
    while ( t-- ) {
      tmp = rtypenamespace.exec( types[t] ) || [];
      type = origType = tmp[1];
      namespaces = ( tmp[2] || "" ).split( "." ).sort();

      // Unbind all events (on this namespace, if provided) for the element
      if ( !type ) {
        for ( type in events ) {
          jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
        }
        continue;
      }

      special = jQuery.event.special[ type ] || {};
      type = ( selector ? special.delegateType : special.bindType ) || type;
      handlers = events[ type ] || [];
      tmp = tmp[2] && new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" );

      // Remove matching events
      origCount = j = handlers.length;
      while ( j-- ) {
        handleObj = handlers[ j ];

        if ( ( mappedTypes || origType === handleObj.origType ) &&
          ( !handler || handler.guid === handleObj.guid ) &&
          ( !tmp || tmp.test( handleObj.namespace ) ) &&
          ( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
          handlers.splice( j, 1 );

          if ( handleObj.selector ) {
            handlers.delegateCount--;
          }
          if ( special.remove ) {
            special.remove.call( elem, handleObj );
          }
        }
      }

      // Remove generic event handler if we removed something and no more handlers exist
      // (avoids potential for endless recursion during removal of special event handlers)
      if ( origCount && !handlers.length ) {
        if ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
          jQuery.removeEvent( elem, type, elemData.handle );
        }

        delete events[ type ];
      }
    }

    // Remove the expando if it's no longer used
    if ( jQuery.isEmptyObject( events ) ) {
      delete elemData.handle;

      // removeData also checks for emptiness and clears the expando if empty
      // so use it instead of delete
      jQuery._removeData( elem, "events" );
    }
  },

  trigger: function( event, data, elem, onlyHandlers ) {
    var handle, ontype, cur,
      bubbleType, special, tmp, i,
      eventPath = [ elem || document ],
      type = core_hasOwn.call( event, "type" ) ? event.type : event,
      namespaces = core_hasOwn.call( event, "namespace" ) ? event.namespace.split(".") : [];

    cur = tmp = elem = elem || document;

    // Don't do events on text and comment nodes
    if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
      return;
    }

    // focus/blur morphs to focusin/out; ensure we're not firing them right now
    if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
      return;
    }

    if ( type.indexOf(".") >= 0 ) {
      // Namespaced trigger; create a regexp to match event type in handle()
      namespaces = type.split(".");
      type = namespaces.shift();
      namespaces.sort();
    }
    ontype = type.indexOf(":") < 0 && "on" + type;

    // Caller can pass in a jQuery.Event object, Object, or just an event type string
    event = event[ jQuery.expando ] ?
      event :
      new jQuery.Event( type, typeof event === "object" && event );

    // Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
    event.isTrigger = onlyHandlers ? 2 : 3;
    event.namespace = namespaces.join(".");
    event.namespace_re = event.namespace ?
      new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" ) :
      null;

    // Clean up the event in case it is being reused
    event.result = undefined;
    if ( !event.target ) {
      event.target = elem;
    }

    // Clone any incoming data and prepend the event, creating the handler arg list
    data = data == null ?
      [ event ] :
      jQuery.makeArray( data, [ event ] );

    // Allow special events to draw outside the lines
    special = jQuery.event.special[ type ] || {};
    if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
      return;
    }

    // Determine event propagation path in advance, per W3C events spec (#9951)
    // Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
    if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

      bubbleType = special.delegateType || type;
      if ( !rfocusMorph.test( bubbleType + type ) ) {
        cur = cur.parentNode;
      }
      for ( ; cur; cur = cur.parentNode ) {
        eventPath.push( cur );
        tmp = cur;
      }

      // Only add window if we got to document (e.g., not plain obj or detached DOM)
      if ( tmp === (elem.ownerDocument || document) ) {
        eventPath.push( tmp.defaultView || tmp.parentWindow || window );
      }
    }

    // Fire handlers on the event path
    i = 0;
    while ( (cur = eventPath[i++]) && !event.isPropagationStopped() ) {

      event.type = i > 1 ?
        bubbleType :
        special.bindType || type;

      // jQuery handler
      handle = ( jQuery._data( cur, "events" ) || {} )[ event.type ] && jQuery._data( cur, "handle" );
      if ( handle ) {
        handle.apply( cur, data );
      }

      // Native handler
      handle = ontype && cur[ ontype ];
      if ( handle && jQuery.acceptData( cur ) && handle.apply && handle.apply( cur, data ) === false ) {
        event.preventDefault();
      }
    }
    event.type = type;

    // If nobody prevented the default action, do it now
    if ( !onlyHandlers && !event.isDefaultPrevented() ) {

      if ( (!special._default || special._default.apply( eventPath.pop(), data ) === false) &&
        jQuery.acceptData( elem ) ) {

        // Call a native DOM method on the target with the same name name as the event.
        // Can't use an .isFunction() check here because IE6/7 fails that test.
        // Don't do default actions on window, that's where global variables be (#6170)
        if ( ontype && elem[ type ] && !jQuery.isWindow( elem ) ) {

          // Don't re-trigger an onFOO event when we call its FOO() method
          tmp = elem[ ontype ];

          if ( tmp ) {
            elem[ ontype ] = null;
          }

          // Prevent re-triggering of the same event, since we already bubbled it above
          jQuery.event.triggered = type;
          try {
            elem[ type ]();
          } catch ( e ) {
            // IE<9 dies on focus/blur to hidden element (#1486,#12518)
            // only reproducible on winXP IE8 native, not IE9 in IE8 mode
          }
          jQuery.event.triggered = undefined;

          if ( tmp ) {
            elem[ ontype ] = tmp;
          }
        }
      }
    }

    return event.result;
  },

  dispatch: function( event ) {

    // Make a writable jQuery.Event from the native event object
    event = jQuery.event.fix( event );

    var i, ret, handleObj, matched, j,
      handlerQueue = [],
      args = core_slice.call( arguments ),
      handlers = ( jQuery._data( this, "events" ) || {} )[ event.type ] || [],
      special = jQuery.event.special[ event.type ] || {};

    // Use the fix-ed jQuery.Event rather than the (read-only) native event
    args[0] = event;
    event.delegateTarget = this;

    // Call the preDispatch hook for the mapped type, and let it bail if desired
    if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
      return;
    }

    // Determine handlers
    handlerQueue = jQuery.event.handlers.call( this, event, handlers );

    // Run delegates first; they may want to stop propagation beneath us
    i = 0;
    while ( (matched = handlerQueue[ i++ ]) && !event.isPropagationStopped() ) {
      event.currentTarget = matched.elem;

      j = 0;
      while ( (handleObj = matched.handlers[ j++ ]) && !event.isImmediatePropagationStopped() ) {

        // Triggered event must either 1) have no namespace, or
        // 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
        if ( !event.namespace_re || event.namespace_re.test( handleObj.namespace ) ) {

          event.handleObj = handleObj;
          event.data = handleObj.data;

          ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
              .apply( matched.elem, args );

          if ( ret !== undefined ) {
            if ( (event.result = ret) === false ) {
              event.preventDefault();
              event.stopPropagation();
            }
          }
        }
      }
    }

    // Call the postDispatch hook for the mapped type
    if ( special.postDispatch ) {
      special.postDispatch.call( this, event );
    }

    return event.result;
  },

  handlers: function( event, handlers ) {
    var sel, handleObj, matches, i,
      handlerQueue = [],
      delegateCount = handlers.delegateCount,
      cur = event.target;

    // Find delegate handlers
    // Black-hole SVG <use> instance trees (#13180)
    // Avoid non-left-click bubbling in Firefox (#3861)
    if ( delegateCount && cur.nodeType && (!event.button || event.type !== "click") ) {

      /* jshint eqeqeq: false */
      for ( ; cur != this; cur = cur.parentNode || this ) {
        /* jshint eqeqeq: true */

        // Don't check non-elements (#13208)
        // Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
        if ( cur.nodeType === 1 && (cur.disabled !== true || event.type !== "click") ) {
          matches = [];
          for ( i = 0; i < delegateCount; i++ ) {
            handleObj = handlers[ i ];

            // Don't conflict with Object.prototype properties (#13203)
            sel = handleObj.selector + " ";

            if ( matches[ sel ] === undefined ) {
              matches[ sel ] = handleObj.needsContext ?
                jQuery( sel, this ).index( cur ) >= 0 :
                jQuery.find( sel, this, null, [ cur ] ).length;
            }
            if ( matches[ sel ] ) {
              matches.push( handleObj );
            }
          }
          if ( matches.length ) {
            handlerQueue.push({ elem: cur, handlers: matches });
          }
        }
      }
    }

    // Add the remaining (directly-bound) handlers
    if ( delegateCount < handlers.length ) {
      handlerQueue.push({ elem: this, handlers: handlers.slice( delegateCount ) });
    }

    return handlerQueue;
  },

  fix: function( event ) {
    if ( event[ jQuery.expando ] ) {
      return event;
    }

    // Create a writable copy of the event object and normalize some properties
    var i, prop, copy,
      type = event.type,
      originalEvent = event,
      fixHook = this.fixHooks[ type ];

    if ( !fixHook ) {
      this.fixHooks[ type ] = fixHook =
        rmouseEvent.test( type ) ? this.mouseHooks :
        rkeyEvent.test( type ) ? this.keyHooks :
        {};
    }
    copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

    event = new jQuery.Event( originalEvent );

    i = copy.length;
    while ( i-- ) {
      prop = copy[ i ];
      event[ prop ] = originalEvent[ prop ];
    }

    // Support: IE<9
    // Fix target property (#1925)
    if ( !event.target ) {
      event.target = originalEvent.srcElement || document;
    }

    // Support: Chrome 23+, Safari?
    // Target should not be a text node (#504, #13143)
    if ( event.target.nodeType === 3 ) {
      event.target = event.target.parentNode;
    }

    // Support: IE<9
    // For mouse/key events, metaKey==false if it's undefined (#3368, #11328)
    event.metaKey = !!event.metaKey;

    return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
  },

  // Includes some event props shared by KeyEvent and MouseEvent
  props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

  fixHooks: {},

  keyHooks: {
    props: "char charCode key keyCode".split(" "),
    filter: function( event, original ) {

      // Add which for key events
      if ( event.which == null ) {
        event.which = original.charCode != null ? original.charCode : original.keyCode;
      }

      return event;
    }
  },

  mouseHooks: {
    props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
    filter: function( event, original ) {
      var body, eventDoc, doc,
        button = original.button,
        fromElement = original.fromElement;

      // Calculate pageX/Y if missing and clientX/Y available
      if ( event.pageX == null && original.clientX != null ) {
        eventDoc = event.target.ownerDocument || document;
        doc = eventDoc.documentElement;
        body = eventDoc.body;

        event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
        event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
      }

      // Add relatedTarget, if necessary
      if ( !event.relatedTarget && fromElement ) {
        event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
      }

      // Add which for click: 1 === left; 2 === middle; 3 === right
      // Note: button is not normalized, so don't use it
      if ( !event.which && button !== undefined ) {
        event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
      }

      return event;
    }
  },

  special: {
    load: {
      // Prevent triggered image.load events from bubbling to window.load
      noBubble: true
    },
    focus: {
      // Fire native event if possible so blur/focus sequence is correct
      trigger: function() {
        if ( this !== safeActiveElement() && this.focus ) {
          try {
            this.focus();
            return false;
          } catch ( e ) {
            // Support: IE<9
            // If we error on focus to hidden element (#1486, #12518),
            // let .trigger() run the handlers
          }
        }
      },
      delegateType: "focusin"
    },
    blur: {
      trigger: function() {
        if ( this === safeActiveElement() && this.blur ) {
          this.blur();
          return false;
        }
      },
      delegateType: "focusout"
    },
    click: {
      // For checkbox, fire native event so checked state will be right
      trigger: function() {
        if ( jQuery.nodeName( this, "input" ) && this.type === "checkbox" && this.click ) {
          this.click();
          return false;
        }
      },

      // For cross-browser consistency, don't fire native .click() on links
      _default: function( event ) {
        return jQuery.nodeName( event.target, "a" );
      }
    },

    beforeunload: {
      postDispatch: function( event ) {

        // Even when returnValue equals to undefined Firefox will still show alert
        if ( event.result !== undefined ) {
          event.originalEvent.returnValue = event.result;
        }
      }
    }
  },

  simulate: function( type, elem, event, bubble ) {
    // Piggyback on a donor event to simulate a different one.
    // Fake originalEvent to avoid donor's stopPropagation, but if the
    // simulated event prevents default then we do the same on the donor.
    var e = jQuery.extend(
      new jQuery.Event(),
      event,
      {
        type: type,
        isSimulated: true,
        originalEvent: {}
      }
    );
    if ( bubble ) {
      jQuery.event.trigger( e, null, elem );
    } else {
      jQuery.event.dispatch.call( elem, e );
    }
    if ( e.isDefaultPrevented() ) {
      event.preventDefault();
    }
  }
};

jQuery.removeEvent = document.removeEventListener ?
  function( elem, type, handle ) {
    if ( elem.removeEventListener ) {
      elem.removeEventListener( type, handle, false );
    }
  } :
  function( elem, type, handle ) {
    var name = "on" + type;

    if ( elem.detachEvent ) {

      // #8545, #7054, preventing memory leaks for custom events in IE6-8
      // detachEvent needed property on element, by name of that event, to properly expose it to GC
      if ( typeof elem[ name ] === core_strundefined ) {
        elem[ name ] = null;
      }

      elem.detachEvent( name, handle );
    }
  };

jQuery.Event = function( src, props ) {
  // Allow instantiation without the 'new' keyword
  if ( !(this instanceof jQuery.Event) ) {
    return new jQuery.Event( src, props );
  }

  // Event object
  if ( src && src.type ) {
    this.originalEvent = src;
    this.type = src.type;

    // Events bubbling up the document may have been marked as prevented
    // by a handler lower down the tree; reflect the correct value.
    this.isDefaultPrevented = ( src.defaultPrevented || src.returnValue === false ||
      src.getPreventDefault && src.getPreventDefault() ) ? returnTrue : returnFalse;

  // Event type
  } else {
    this.type = src;
  }

  // Put explicitly provided properties onto the event object
  if ( props ) {
    jQuery.extend( this, props );
  }

  // Create a timestamp if incoming event doesn't have one
  this.timeStamp = src && src.timeStamp || jQuery.now();

  // Mark it as fixed
  this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
  isDefaultPrevented: returnFalse,
  isPropagationStopped: returnFalse,
  isImmediatePropagationStopped: returnFalse,

  preventDefault: function() {
    var e = this.originalEvent;

    this.isDefaultPrevented = returnTrue;
    if ( !e ) {
      return;
    }

    // If preventDefault exists, run it on the original event
    if ( e.preventDefault ) {
      e.preventDefault();

    // Support: IE
    // Otherwise set the returnValue property of the original event to false
    } else {
      e.returnValue = false;
    }
  },
  stopPropagation: function() {
    var e = this.originalEvent;

    this.isPropagationStopped = returnTrue;
    if ( !e ) {
      return;
    }
    // If stopPropagation exists, run it on the original event
    if ( e.stopPropagation ) {
      e.stopPropagation();
    }

    // Support: IE
    // Set the cancelBubble property of the original event to true
    e.cancelBubble = true;
  },
  stopImmediatePropagation: function() {
    this.isImmediatePropagationStopped = returnTrue;
    this.stopPropagation();
  }
};

// Create mouseenter/leave events using mouseover/out and event-time checks
jQuery.each({
  mouseenter: "mouseover",
  mouseleave: "mouseout"
}, function( orig, fix ) {
  jQuery.event.special[ orig ] = {
    delegateType: fix,
    bindType: fix,

    handle: function( event ) {
      var ret,
        target = this,
        related = event.relatedTarget,
        handleObj = event.handleObj;

      // For mousenter/leave call the handler if related is outside the target.
      // NB: No relatedTarget if the mouse left/entered the browser window
      if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
        event.type = handleObj.origType;
        ret = handleObj.handler.apply( this, arguments );
        event.type = fix;
      }
      return ret;
    }
  };
});

// IE submit delegation
if ( !jQuery.support.submitBubbles ) {

  jQuery.event.special.submit = {
    setup: function() {
      // Only need this for delegated form submit events
      if ( jQuery.nodeName( this, "form" ) ) {
        return false;
      }

      // Lazy-add a submit handler when a descendant form may potentially be submitted
      jQuery.event.add( this, "click._submit keypress._submit", function( e ) {
        // Node name check avoids a VML-related crash in IE (#9807)
        var elem = e.target,
          form = jQuery.nodeName( elem, "input" ) || jQuery.nodeName( elem, "button" ) ? elem.form : undefined;
        if ( form && !jQuery._data( form, "submitBubbles" ) ) {
          jQuery.event.add( form, "submit._submit", function( event ) {
            event._submit_bubble = true;
          });
          jQuery._data( form, "submitBubbles", true );
        }
      });
      // return undefined since we don't need an event listener
    },

    postDispatch: function( event ) {
      // If form was submitted by the user, bubble the event up the tree
      if ( event._submit_bubble ) {
        delete event._submit_bubble;
        if ( this.parentNode && !event.isTrigger ) {
          jQuery.event.simulate( "submit", this.parentNode, event, true );
        }
      }
    },

    teardown: function() {
      // Only need this for delegated form submit events
      if ( jQuery.nodeName( this, "form" ) ) {
        return false;
      }

      // Remove delegated handlers; cleanData eventually reaps submit handlers attached above
      jQuery.event.remove( this, "._submit" );
    }
  };
}

// IE change delegation and checkbox/radio fix
if ( !jQuery.support.changeBubbles ) {

  jQuery.event.special.change = {

    setup: function() {

      if ( rformElems.test( this.nodeName ) ) {
        // IE doesn't fire change on a check/radio until blur; trigger it on click
        // after a propertychange. Eat the blur-change in special.change.handle.
        // This still fires onchange a second time for check/radio after blur.
        if ( this.type === "checkbox" || this.type === "radio" ) {
          jQuery.event.add( this, "propertychange._change", function( event ) {
            if ( event.originalEvent.propertyName === "checked" ) {
              this._just_changed = true;
            }
          });
          jQuery.event.add( this, "click._change", function( event ) {
            if ( this._just_changed && !event.isTrigger ) {
              this._just_changed = false;
            }
            // Allow triggered, simulated change events (#11500)
            jQuery.event.simulate( "change", this, event, true );
          });
        }
        return false;
      }
      // Delegated event; lazy-add a change handler on descendant inputs
      jQuery.event.add( this, "beforeactivate._change", function( e ) {
        var elem = e.target;

        if ( rformElems.test( elem.nodeName ) && !jQuery._data( elem, "changeBubbles" ) ) {
          jQuery.event.add( elem, "change._change", function( event ) {
            if ( this.parentNode && !event.isSimulated && !event.isTrigger ) {
              jQuery.event.simulate( "change", this.parentNode, event, true );
            }
          });
          jQuery._data( elem, "changeBubbles", true );
        }
      });
    },

    handle: function( event ) {
      var elem = event.target;

      // Swallow native change events from checkbox/radio, we already triggered them above
      if ( this !== elem || event.isSimulated || event.isTrigger || (elem.type !== "radio" && elem.type !== "checkbox") ) {
        return event.handleObj.handler.apply( this, arguments );
      }
    },

    teardown: function() {
      jQuery.event.remove( this, "._change" );

      return !rformElems.test( this.nodeName );
    }
  };
}

// Create "bubbling" focus and blur events
if ( !jQuery.support.focusinBubbles ) {
  jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

    // Attach a single capturing handler while someone wants focusin/focusout
    var attaches = 0,
      handler = function( event ) {
        jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
      };

    jQuery.event.special[ fix ] = {
      setup: function() {
        if ( attaches++ === 0 ) {
          document.addEventListener( orig, handler, true );
        }
      },
      teardown: function() {
        if ( --attaches === 0 ) {
          document.removeEventListener( orig, handler, true );
        }
      }
    };
  });
}

jQuery.fn.extend({

  on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
    var type, origFn;

    // Types can be a map of types/handlers
    if ( typeof types === "object" ) {
      // ( types-Object, selector, data )
      if ( typeof selector !== "string" ) {
        // ( types-Object, data )
        data = data || selector;
        selector = undefined;
      }
      for ( type in types ) {
        this.on( type, selector, data, types[ type ], one );
      }
      return this;
    }

    if ( data == null && fn == null ) {
      // ( types, fn )
      fn = selector;
      data = selector = undefined;
    } else if ( fn == null ) {
      if ( typeof selector === "string" ) {
        // ( types, selector, fn )
        fn = data;
        data = undefined;
      } else {
        // ( types, data, fn )
        fn = data;
        data = selector;
        selector = undefined;
      }
    }
    if ( fn === false ) {
      fn = returnFalse;
    } else if ( !fn ) {
      return this;
    }

    if ( one === 1 ) {
      origFn = fn;
      fn = function( event ) {
        // Can use an empty set, since event contains the info
        jQuery().off( event );
        return origFn.apply( this, arguments );
      };
      // Use same guid so caller can remove using origFn
      fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
    }
    return this.each( function() {
      jQuery.event.add( this, types, fn, data, selector );
    });
  },
  one: function( types, selector, data, fn ) {
    return this.on( types, selector, data, fn, 1 );
  },
  off: function( types, selector, fn ) {
    var handleObj, type;
    if ( types && types.preventDefault && types.handleObj ) {
      // ( event )  dispatched jQuery.Event
      handleObj = types.handleObj;
      jQuery( types.delegateTarget ).off(
        handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
        handleObj.selector,
        handleObj.handler
      );
      return this;
    }
    if ( typeof types === "object" ) {
      // ( types-object [, selector] )
      for ( type in types ) {
        this.off( type, selector, types[ type ] );
      }
      return this;
    }
    if ( selector === false || typeof selector === "function" ) {
      // ( types [, fn] )
      fn = selector;
      selector = undefined;
    }
    if ( fn === false ) {
      fn = returnFalse;
    }
    return this.each(function() {
      jQuery.event.remove( this, types, fn, selector );
    });
  },

  trigger: function( type, data ) {
    return this.each(function() {
      jQuery.event.trigger( type, data, this );
    });
  },
  triggerHandler: function( type, data ) {
    var elem = this[0];
    if ( elem ) {
      return jQuery.event.trigger( type, data, elem, true );
    }
  }
});
var isSimple = /^.[^:#\[\.,]*$/,
  rparentsprev = /^(?:parents|prev(?:Until|All))/,
  rneedsContext = jQuery.expr.match.needsContext,
  // methods guaranteed to produce a unique set when starting from a unique set
  guaranteedUnique = {
    children: true,
    contents: true,
    next: true,
    prev: true
  };

jQuery.fn.extend({
  find: function( selector ) {
    var i,
      ret = [],
      self = this,
      len = self.length;

    if ( typeof selector !== "string" ) {
      return this.pushStack( jQuery( selector ).filter(function() {
        for ( i = 0; i < len; i++ ) {
          if ( jQuery.contains( self[ i ], this ) ) {
            return true;
          }
        }
      }) );
    }

    for ( i = 0; i < len; i++ ) {
      jQuery.find( selector, self[ i ], ret );
    }

    // Needed because $( selector, context ) becomes $( context ).find( selector )
    ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
    ret.selector = this.selector ? this.selector + " " + selector : selector;
    return ret;
  },

  has: function( target ) {
    var i,
      targets = jQuery( target, this ),
      len = targets.length;

    return this.filter(function() {
      for ( i = 0; i < len; i++ ) {
        if ( jQuery.contains( this, targets[i] ) ) {
          return true;
        }
      }
    });
  },

  not: function( selector ) {
    return this.pushStack( winnow(this, selector || [], true) );
  },

  filter: function( selector ) {
    return this.pushStack( winnow(this, selector || [], false) );
  },

  is: function( selector ) {
    return !!winnow(
      this,

      // If this is a positional/relative selector, check membership in the returned set
      // so $("p:first").is("p:last") won't return true for a doc with two "p".
      typeof selector === "string" && rneedsContext.test( selector ) ?
        jQuery( selector ) :
        selector || [],
      false
    ).length;
  },

  closest: function( selectors, context ) {
    var cur,
      i = 0,
      l = this.length,
      ret = [],
      pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
        jQuery( selectors, context || this.context ) :
        0;

    for ( ; i < l; i++ ) {
      for ( cur = this[i]; cur && cur !== context; cur = cur.parentNode ) {
        // Always skip document fragments
        if ( cur.nodeType < 11 && (pos ?
          pos.index(cur) > -1 :

          // Don't pass non-elements to Sizzle
          cur.nodeType === 1 &&
            jQuery.find.matchesSelector(cur, selectors)) ) {

          cur = ret.push( cur );
          break;
        }
      }
    }

    return this.pushStack( ret.length > 1 ? jQuery.unique( ret ) : ret );
  },

  // Determine the position of an element within
  // the matched set of elements
  index: function( elem ) {

    // No argument, return index in parent
    if ( !elem ) {
      return ( this[0] && this[0].parentNode ) ? this.first().prevAll().length : -1;
    }

    // index in selector
    if ( typeof elem === "string" ) {
      return jQuery.inArray( this[0], jQuery( elem ) );
    }

    // Locate the position of the desired element
    return jQuery.inArray(
      // If it receives a jQuery object, the first element is used
      elem.jquery ? elem[0] : elem, this );
  },

  add: function( selector, context ) {
    var set = typeof selector === "string" ?
        jQuery( selector, context ) :
        jQuery.makeArray( selector && selector.nodeType ? [ selector ] : selector ),
      all = jQuery.merge( this.get(), set );

    return this.pushStack( jQuery.unique(all) );
  },

  addBack: function( selector ) {
    return this.add( selector == null ?
      this.prevObject : this.prevObject.filter(selector)
    );
  }
});

function sibling( cur, dir ) {
  do {
    cur = cur[ dir ];
  } while ( cur && cur.nodeType !== 1 );

  return cur;
}

jQuery.each({
  parent: function( elem ) {
    var parent = elem.parentNode;
    return parent && parent.nodeType !== 11 ? parent : null;
  },
  parents: function( elem ) {
    return jQuery.dir( elem, "parentNode" );
  },
  parentsUntil: function( elem, i, until ) {
    return jQuery.dir( elem, "parentNode", until );
  },
  next: function( elem ) {
    return sibling( elem, "nextSibling" );
  },
  prev: function( elem ) {
    return sibling( elem, "previousSibling" );
  },
  nextAll: function( elem ) {
    return jQuery.dir( elem, "nextSibling" );
  },
  prevAll: function( elem ) {
    return jQuery.dir( elem, "previousSibling" );
  },
  nextUntil: function( elem, i, until ) {
    return jQuery.dir( elem, "nextSibling", until );
  },
  prevUntil: function( elem, i, until ) {
    return jQuery.dir( elem, "previousSibling", until );
  },
  siblings: function( elem ) {
    return jQuery.sibling( ( elem.parentNode || {} ).firstChild, elem );
  },
  children: function( elem ) {
    return jQuery.sibling( elem.firstChild );
  },
  contents: function( elem ) {
    return jQuery.nodeName( elem, "iframe" ) ?
      elem.contentDocument || elem.contentWindow.document :
      jQuery.merge( [], elem.childNodes );
  }
}, function( name, fn ) {
  jQuery.fn[ name ] = function( until, selector ) {
    var ret = jQuery.map( this, fn, until );

    if ( name.slice( -5 ) !== "Until" ) {
      selector = until;
    }

    if ( selector && typeof selector === "string" ) {
      ret = jQuery.filter( selector, ret );
    }

    if ( this.length > 1 ) {
      // Remove duplicates
      if ( !guaranteedUnique[ name ] ) {
        ret = jQuery.unique( ret );
      }

      // Reverse order for parents* and prev-derivatives
      if ( rparentsprev.test( name ) ) {
        ret = ret.reverse();
      }
    }

    return this.pushStack( ret );
  };
});

jQuery.extend({
  filter: function( expr, elems, not ) {
    var elem = elems[ 0 ];

    if ( not ) {
      expr = ":not(" + expr + ")";
    }

    return elems.length === 1 && elem.nodeType === 1 ?
      jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [] :
      jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
        return elem.nodeType === 1;
      }));
  },

  dir: function( elem, dir, until ) {
    var matched = [],
      cur = elem[ dir ];

    while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {
      if ( cur.nodeType === 1 ) {
        matched.push( cur );
      }
      cur = cur[dir];
    }
    return matched;
  },

  sibling: function( n, elem ) {
    var r = [];

    for ( ; n; n = n.nextSibling ) {
      if ( n.nodeType === 1 && n !== elem ) {
        r.push( n );
      }
    }

    return r;
  }
});

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
  if ( jQuery.isFunction( qualifier ) ) {
    return jQuery.grep( elements, function( elem, i ) {
      /* jshint -W018 */
      return !!qualifier.call( elem, i, elem ) !== not;
    });

  }

  if ( qualifier.nodeType ) {
    return jQuery.grep( elements, function( elem ) {
      return ( elem === qualifier ) !== not;
    });

  }

  if ( typeof qualifier === "string" ) {
    if ( isSimple.test( qualifier ) ) {
      return jQuery.filter( qualifier, elements, not );
    }

    qualifier = jQuery.filter( qualifier, elements );
  }

  return jQuery.grep( elements, function( elem ) {
    return ( jQuery.inArray( elem, qualifier ) >= 0 ) !== not;
  });
}
function createSafeFragment( document ) {
  var list = nodeNames.split( "|" ),
    safeFrag = document.createDocumentFragment();

  if ( safeFrag.createElement ) {
    while ( list.length ) {
      safeFrag.createElement(
        list.pop()
      );
    }
  }
  return safeFrag;
}

var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|" +
    "header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
  rinlinejQuery = / jQuery\d+="(?:null|\d+)"/g,
  rnoshimcache = new RegExp("<(?:" + nodeNames + ")[\\s/>]", "i"),
  rleadingWhitespace = /^\s+/,
  rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
  rtagName = /<([\w:]+)/,
  rtbody = /<tbody/i,
  rhtml = /<|&#?\w+;/,
  rnoInnerhtml = /<(?:script|style|link)/i,
  manipulation_rcheckableType = /^(?:checkbox|radio)$/i,
  // checked="checked" or checked
  rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
  rscriptType = /^$|\/(?:java|ecma)script/i,
  rscriptTypeMasked = /^true\/(.*)/,
  rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,

  // We have to close these tags to support XHTML (#13200)
  wrapMap = {
    option: [ 1, "<select multiple='multiple'>", "</select>" ],
    legend: [ 1, "<fieldset>", "</fieldset>" ],
    area: [ 1, "<map>", "</map>" ],
    param: [ 1, "<object>", "</object>" ],
    thead: [ 1, "<table>", "</table>" ],
    tr: [ 2, "<table><tbody>", "</tbody></table>" ],
    col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
    td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

    // IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,
    // unless wrapped in a div with non-breaking characters in front of it.
    _default: jQuery.support.htmlSerialize ? [ 0, "", "" ] : [ 1, "X<div>", "</div>"  ]
  },
  safeFragment = createSafeFragment( document ),
  fragmentDiv = safeFragment.appendChild( document.createElement("div") );

wrapMap.optgroup = wrapMap.option;
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

jQuery.fn.extend({
  text: function( value ) {
    return jQuery.access( this, function( value ) {
      return value === undefined ?
        jQuery.text( this ) :
        this.empty().append( ( this[0] && this[0].ownerDocument || document ).createTextNode( value ) );
    }, null, value, arguments.length );
  },

  append: function() {
    return this.domManip( arguments, function( elem ) {
      if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
        var target = manipulationTarget( this, elem );
        target.appendChild( elem );
      }
    });
  },

  prepend: function() {
    return this.domManip( arguments, function( elem ) {
      if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
        var target = manipulationTarget( this, elem );
        target.insertBefore( elem, target.firstChild );
      }
    });
  },

  before: function() {
    return this.domManip( arguments, function( elem ) {
      if ( this.parentNode ) {
        this.parentNode.insertBefore( elem, this );
      }
    });
  },

  after: function() {
    return this.domManip( arguments, function( elem ) {
      if ( this.parentNode ) {
        this.parentNode.insertBefore( elem, this.nextSibling );
      }
    });
  },

  // keepData is for internal use only--do not document
  remove: function( selector, keepData ) {
    var elem,
      elems = selector ? jQuery.filter( selector, this ) : this,
      i = 0;

    for ( ; (elem = elems[i]) != null; i++ ) {

      if ( !keepData && elem.nodeType === 1 ) {
        jQuery.cleanData( getAll( elem ) );
      }

      if ( elem.parentNode ) {
        if ( keepData && jQuery.contains( elem.ownerDocument, elem ) ) {
          setGlobalEval( getAll( elem, "script" ) );
        }
        elem.parentNode.removeChild( elem );
      }
    }

    return this;
  },

  empty: function() {
    var elem,
      i = 0;

    for ( ; (elem = this[i]) != null; i++ ) {
      // Remove element nodes and prevent memory leaks
      if ( elem.nodeType === 1 ) {
        jQuery.cleanData( getAll( elem, false ) );
      }

      // Remove any remaining nodes
      while ( elem.firstChild ) {
        elem.removeChild( elem.firstChild );
      }

      // If this is a select, ensure that it displays empty (#12336)
      // Support: IE<9
      if ( elem.options && jQuery.nodeName( elem, "select" ) ) {
        elem.options.length = 0;
      }
    }

    return this;
  },

  clone: function( dataAndEvents, deepDataAndEvents ) {
    dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
    deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

    return this.map( function () {
      return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
    });
  },

  html: function( value ) {
    return jQuery.access( this, function( value ) {
      var elem = this[0] || {},
        i = 0,
        l = this.length;

      if ( value === undefined ) {
        return elem.nodeType === 1 ?
          elem.innerHTML.replace( rinlinejQuery, "" ) :
          undefined;
      }

      // See if we can take a shortcut and just use innerHTML
      if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
        ( jQuery.support.htmlSerialize || !rnoshimcache.test( value )  ) &&
        ( jQuery.support.leadingWhitespace || !rleadingWhitespace.test( value ) ) &&
        !wrapMap[ ( rtagName.exec( value ) || ["", ""] )[1].toLowerCase() ] ) {

        value = value.replace( rxhtmlTag, "<$1></$2>" );

        try {
          for (; i < l; i++ ) {
            // Remove element nodes and prevent memory leaks
            elem = this[i] || {};
            if ( elem.nodeType === 1 ) {
              jQuery.cleanData( getAll( elem, false ) );
              elem.innerHTML = value;
            }
          }

          elem = 0;

        // If using innerHTML throws an exception, use the fallback method
        } catch(e) {}
      }

      if ( elem ) {
        this.empty().append( value );
      }
    }, null, value, arguments.length );
  },

  replaceWith: function() {
    var
      // Snapshot the DOM in case .domManip sweeps something relevant into its fragment
      args = jQuery.map( this, function( elem ) {
        return [ elem.nextSibling, elem.parentNode ];
      }),
      i = 0;

    // Make the changes, replacing each context element with the new content
    this.domManip( arguments, function( elem ) {
      var next = args[ i++ ],
        parent = args[ i++ ];

      if ( parent ) {
        // Don't use the snapshot next if it has moved (#13810)
        if ( next && next.parentNode !== parent ) {
          next = this.nextSibling;
        }
        jQuery( this ).remove();
        parent.insertBefore( elem, next );
      }
    // Allow new content to include elements from the context set
    }, true );

    // Force removal if there was no new content (e.g., from empty arguments)
    return i ? this : this.remove();
  },

  detach: function( selector ) {
    return this.remove( selector, true );
  },

  domManip: function( args, callback, allowIntersection ) {

    // Flatten any nested arrays
    args = core_concat.apply( [], args );

    var first, node, hasScripts,
      scripts, doc, fragment,
      i = 0,
      l = this.length,
      set = this,
      iNoClone = l - 1,
      value = args[0],
      isFunction = jQuery.isFunction( value );

    // We can't cloneNode fragments that contain checked, in WebKit
    if ( isFunction || !( l <= 1 || typeof value !== "string" || jQuery.support.checkClone || !rchecked.test( value ) ) ) {
      return this.each(function( index ) {
        var self = set.eq( index );
        if ( isFunction ) {
          args[0] = value.call( this, index, self.html() );
        }
        self.domManip( args, callback, allowIntersection );
      });
    }

    if ( l ) {
      fragment = jQuery.buildFragment( args, this[ 0 ].ownerDocument, false, !allowIntersection && this );
      first = fragment.firstChild;

      if ( fragment.childNodes.length === 1 ) {
        fragment = first;
      }

      if ( first ) {
        scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
        hasScripts = scripts.length;

        // Use the original fragment for the last item instead of the first because it can end up
        // being emptied incorrectly in certain situations (#8070).
        for ( ; i < l; i++ ) {
          node = fragment;

          if ( i !== iNoClone ) {
            node = jQuery.clone( node, true, true );

            // Keep references to cloned scripts for later restoration
            if ( hasScripts ) {
              jQuery.merge( scripts, getAll( node, "script" ) );
            }
          }

          callback.call( this[i], node, i );
        }

        if ( hasScripts ) {
          doc = scripts[ scripts.length - 1 ].ownerDocument;

          // Reenable scripts
          jQuery.map( scripts, restoreScript );

          // Evaluate executable scripts on first document insertion
          for ( i = 0; i < hasScripts; i++ ) {
            node = scripts[ i ];
            if ( rscriptType.test( node.type || "" ) &&
              !jQuery._data( node, "globalEval" ) && jQuery.contains( doc, node ) ) {

              if ( node.src ) {
                // Hope ajax is available...
                jQuery._evalUrl( node.src );
              } else {
                jQuery.globalEval( ( node.text || node.textContent || node.innerHTML || "" ).replace( rcleanScript, "" ) );
              }
            }
          }
        }

        // Fix #11809: Avoid leaking memory
        fragment = first = null;
      }
    }

    return this;
  }
});

// Support: IE<8
// Manipulating tables requires a tbody
function manipulationTarget( elem, content ) {
  return jQuery.nodeName( elem, "table" ) &&
    jQuery.nodeName( content.nodeType === 1 ? content : content.firstChild, "tr" ) ?

    elem.getElementsByTagName("tbody")[0] ||
      elem.appendChild( elem.ownerDocument.createElement("tbody") ) :
    elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
  elem.type = (jQuery.find.attr( elem, "type" ) !== null) + "/" + elem.type;
  return elem;
}
function restoreScript( elem ) {
  var match = rscriptTypeMasked.exec( elem.type );
  if ( match ) {
    elem.type = match[1];
  } else {
    elem.removeAttribute("type");
  }
  return elem;
}

// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
  var elem,
    i = 0;
  for ( ; (elem = elems[i]) != null; i++ ) {
    jQuery._data( elem, "globalEval", !refElements || jQuery._data( refElements[i], "globalEval" ) );
  }
}

function cloneCopyEvent( src, dest ) {

  if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
    return;
  }

  var type, i, l,
    oldData = jQuery._data( src ),
    curData = jQuery._data( dest, oldData ),
    events = oldData.events;

  if ( events ) {
    delete curData.handle;
    curData.events = {};

    for ( type in events ) {
      for ( i = 0, l = events[ type ].length; i < l; i++ ) {
        jQuery.event.add( dest, type, events[ type ][ i ] );
      }
    }
  }

  // make the cloned public data object a copy from the original
  if ( curData.data ) {
    curData.data = jQuery.extend( {}, curData.data );
  }
}

function fixCloneNodeIssues( src, dest ) {
  var nodeName, e, data;

  // We do not need to do anything for non-Elements
  if ( dest.nodeType !== 1 ) {
    return;
  }

  nodeName = dest.nodeName.toLowerCase();

  // IE6-8 copies events bound via attachEvent when using cloneNode.
  if ( !jQuery.support.noCloneEvent && dest[ jQuery.expando ] ) {
    data = jQuery._data( dest );

    for ( e in data.events ) {
      jQuery.removeEvent( dest, e, data.handle );
    }

    // Event data gets referenced instead of copied if the expando gets copied too
    dest.removeAttribute( jQuery.expando );
  }

  // IE blanks contents when cloning scripts, and tries to evaluate newly-set text
  if ( nodeName === "script" && dest.text !== src.text ) {
    disableScript( dest ).text = src.text;
    restoreScript( dest );

  // IE6-10 improperly clones children of object elements using classid.
  // IE10 throws NoModificationAllowedError if parent is null, #12132.
  } else if ( nodeName === "object" ) {
    if ( dest.parentNode ) {
      dest.outerHTML = src.outerHTML;
    }

    // This path appears unavoidable for IE9. When cloning an object
    // element in IE9, the outerHTML strategy above is not sufficient.
    // If the src has innerHTML and the destination does not,
    // copy the src.innerHTML into the dest.innerHTML. #10324
    if ( jQuery.support.html5Clone && ( src.innerHTML && !jQuery.trim(dest.innerHTML) ) ) {
      dest.innerHTML = src.innerHTML;
    }

  } else if ( nodeName === "input" && manipulation_rcheckableType.test( src.type ) ) {
    // IE6-8 fails to persist the checked state of a cloned checkbox
    // or radio button. Worse, IE6-7 fail to give the cloned element
    // a checked appearance if the defaultChecked value isn't also set

    dest.defaultChecked = dest.checked = src.checked;

    // IE6-7 get confused and end up setting the value of a cloned
    // checkbox/radio button to an empty string instead of "on"
    if ( dest.value !== src.value ) {
      dest.value = src.value;
    }

  // IE6-8 fails to return the selected option to the default selected
  // state when cloning options
  } else if ( nodeName === "option" ) {
    dest.defaultSelected = dest.selected = src.defaultSelected;

  // IE6-8 fails to set the defaultValue to the correct value when
  // cloning other types of input fields
  } else if ( nodeName === "input" || nodeName === "textarea" ) {
    dest.defaultValue = src.defaultValue;
  }
}

jQuery.each({
  appendTo: "append",
  prependTo: "prepend",
  insertBefore: "before",
  insertAfter: "after",
  replaceAll: "replaceWith"
}, function( name, original ) {
  jQuery.fn[ name ] = function( selector ) {
    var elems,
      i = 0,
      ret = [],
      insert = jQuery( selector ),
      last = insert.length - 1;

    for ( ; i <= last; i++ ) {
      elems = i === last ? this : this.clone(true);
      jQuery( insert[i] )[ original ]( elems );

      // Modern browsers can apply jQuery collections as arrays, but oldIE needs a .get()
      core_push.apply( ret, elems.get() );
    }

    return this.pushStack( ret );
  };
});

function getAll( context, tag ) {
  var elems, elem,
    i = 0,
    found = typeof context.getElementsByTagName !== core_strundefined ? context.getElementsByTagName( tag || "*" ) :
      typeof context.querySelectorAll !== core_strundefined ? context.querySelectorAll( tag || "*" ) :
      undefined;

  if ( !found ) {
    for ( found = [], elems = context.childNodes || context; (elem = elems[i]) != null; i++ ) {
      if ( !tag || jQuery.nodeName( elem, tag ) ) {
        found.push( elem );
      } else {
        jQuery.merge( found, getAll( elem, tag ) );
      }
    }
  }

  return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
    jQuery.merge( [ context ], found ) :
    found;
}

// Used in buildFragment, fixes the defaultChecked property
function fixDefaultChecked( elem ) {
  if ( manipulation_rcheckableType.test( elem.type ) ) {
    elem.defaultChecked = elem.checked;
  }
}

jQuery.extend({
  clone: function( elem, dataAndEvents, deepDataAndEvents ) {
    var destElements, node, clone, i, srcElements,
      inPage = jQuery.contains( elem.ownerDocument, elem );

    if ( jQuery.support.html5Clone || jQuery.isXMLDoc(elem) || !rnoshimcache.test( "<" + elem.nodeName + ">" ) ) {
      clone = elem.cloneNode( true );

    // IE<=8 does not properly clone detached, unknown element nodes
    } else {
      fragmentDiv.innerHTML = elem.outerHTML;
      fragmentDiv.removeChild( clone = fragmentDiv.firstChild );
    }

    if ( (!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) &&
        (elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem) ) {

      // We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
      destElements = getAll( clone );
      srcElements = getAll( elem );

      // Fix all IE cloning issues
      for ( i = 0; (node = srcElements[i]) != null; ++i ) {
        // Ensure that the destination node is not null; Fixes #9587
        if ( destElements[i] ) {
          fixCloneNodeIssues( node, destElements[i] );
        }
      }
    }

    // Copy the events from the original to the clone
    if ( dataAndEvents ) {
      if ( deepDataAndEvents ) {
        srcElements = srcElements || getAll( elem );
        destElements = destElements || getAll( clone );

        for ( i = 0; (node = srcElements[i]) != null; i++ ) {
          cloneCopyEvent( node, destElements[i] );
        }
      } else {
        cloneCopyEvent( elem, clone );
      }
    }

    // Preserve script evaluation history
    destElements = getAll( clone, "script" );
    if ( destElements.length > 0 ) {
      setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
    }

    destElements = srcElements = node = null;

    // Return the cloned set
    return clone;
  },

  buildFragment: function( elems, context, scripts, selection ) {
    var j, elem, contains,
      tmp, tag, tbody, wrap,
      l = elems.length,

      // Ensure a safe fragment
      safe = createSafeFragment( context ),

      nodes = [],
      i = 0;

    for ( ; i < l; i++ ) {
      elem = elems[ i ];

      if ( elem || elem === 0 ) {

        // Add nodes directly
        if ( jQuery.type( elem ) === "object" ) {
          jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

        // Convert non-html into a text node
        } else if ( !rhtml.test( elem ) ) {
          nodes.push( context.createTextNode( elem ) );

        // Convert html into DOM nodes
        } else {
          tmp = tmp || safe.appendChild( context.createElement("div") );

          // Deserialize a standard representation
          tag = ( rtagName.exec( elem ) || ["", ""] )[1].toLowerCase();
          wrap = wrapMap[ tag ] || wrapMap._default;

          tmp.innerHTML = wrap[1] + elem.replace( rxhtmlTag, "<$1></$2>" ) + wrap[2];

          // Descend through wrappers to the right content
          j = wrap[0];
          while ( j-- ) {
            tmp = tmp.lastChild;
          }

          // Manually add leading whitespace removed by IE
          if ( !jQuery.support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
            nodes.push( context.createTextNode( rleadingWhitespace.exec( elem )[0] ) );
          }

          // Remove IE's autoinserted <tbody> from table fragments
          if ( !jQuery.support.tbody ) {

            // String was a <table>, *may* have spurious <tbody>
            elem = tag === "table" && !rtbody.test( elem ) ?
              tmp.firstChild :

              // String was a bare <thead> or <tfoot>
              wrap[1] === "<table>" && !rtbody.test( elem ) ?
                tmp :
                0;

            j = elem && elem.childNodes.length;
            while ( j-- ) {
              if ( jQuery.nodeName( (tbody = elem.childNodes[j]), "tbody" ) && !tbody.childNodes.length ) {
                elem.removeChild( tbody );
              }
            }
          }

          jQuery.merge( nodes, tmp.childNodes );

          // Fix #12392 for WebKit and IE > 9
          tmp.textContent = "";

          // Fix #12392 for oldIE
          while ( tmp.firstChild ) {
            tmp.removeChild( tmp.firstChild );
          }

          // Remember the top-level container for proper cleanup
          tmp = safe.lastChild;
        }
      }
    }

    // Fix #11356: Clear elements from fragment
    if ( tmp ) {
      safe.removeChild( tmp );
    }

    // Reset defaultChecked for any radios and checkboxes
    // about to be appended to the DOM in IE 6/7 (#8060)
    if ( !jQuery.support.appendChecked ) {
      jQuery.grep( getAll( nodes, "input" ), fixDefaultChecked );
    }

    i = 0;
    while ( (elem = nodes[ i++ ]) ) {

      // #4087 - If origin and destination elements are the same, and this is
      // that element, do not do anything
      if ( selection && jQuery.inArray( elem, selection ) !== -1 ) {
        continue;
      }

      contains = jQuery.contains( elem.ownerDocument, elem );

      // Append to fragment
      tmp = getAll( safe.appendChild( elem ), "script" );

      // Preserve script evaluation history
      if ( contains ) {
        setGlobalEval( tmp );
      }

      // Capture executables
      if ( scripts ) {
        j = 0;
        while ( (elem = tmp[ j++ ]) ) {
          if ( rscriptType.test( elem.type || "" ) ) {
            scripts.push( elem );
          }
        }
      }
    }

    tmp = null;

    return safe;
  },

  cleanData: function( elems, /* internal */ acceptData ) {
    var elem, type, id, data,
      i = 0,
      internalKey = jQuery.expando,
      cache = jQuery.cache,
      deleteExpando = jQuery.support.deleteExpando,
      special = jQuery.event.special;

    for ( ; (elem = elems[i]) != null; i++ ) {

      if ( acceptData || jQuery.acceptData( elem ) ) {

        id = elem[ internalKey ];
        data = id && cache[ id ];

        if ( data ) {
          if ( data.events ) {
            for ( type in data.events ) {
              if ( special[ type ] ) {
                jQuery.event.remove( elem, type );

              // This is a shortcut to avoid jQuery.event.remove's overhead
              } else {
                jQuery.removeEvent( elem, type, data.handle );
              }
            }
          }

          // Remove cache only if it was not already removed by jQuery.event.remove
          if ( cache[ id ] ) {

            delete cache[ id ];

            // IE does not allow us to delete expando properties from nodes,
            // nor does it have a removeAttribute function on Document nodes;
            // we must handle all of these cases
            if ( deleteExpando ) {
              delete elem[ internalKey ];

            } else if ( typeof elem.removeAttribute !== core_strundefined ) {
              elem.removeAttribute( internalKey );

            } else {
              elem[ internalKey ] = null;
            }

            core_deletedIds.push( id );
          }
        }
      }
    }
  },

  _evalUrl: function( url ) {
    return jQuery.ajax({
      url: url,
      type: "GET",
      dataType: "script",
      async: false,
      global: false,
      "throws": true
    });
  }
});
jQuery.fn.extend({
  wrapAll: function( html ) {
    if ( jQuery.isFunction( html ) ) {
      return this.each(function(i) {
        jQuery(this).wrapAll( html.call(this, i) );
      });
    }

    if ( this[0] ) {
      // The elements to wrap the target around
      var wrap = jQuery( html, this[0].ownerDocument ).eq(0).clone(true);

      if ( this[0].parentNode ) {
        wrap.insertBefore( this[0] );
      }

      wrap.map(function() {
        var elem = this;

        while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
          elem = elem.firstChild;
        }

        return elem;
      }).append( this );
    }

    return this;
  },

  wrapInner: function( html ) {
    if ( jQuery.isFunction( html ) ) {
      return this.each(function(i) {
        jQuery(this).wrapInner( html.call(this, i) );
      });
    }

    return this.each(function() {
      var self = jQuery( this ),
        contents = self.contents();

      if ( contents.length ) {
        contents.wrapAll( html );

      } else {
        self.append( html );
      }
    });
  },

  wrap: function( html ) {
    var isFunction = jQuery.isFunction( html );

    return this.each(function(i) {
      jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );
    });
  },

  unwrap: function() {
    return this.parent().each(function() {
      if ( !jQuery.nodeName( this, "body" ) ) {
        jQuery( this ).replaceWith( this.childNodes );
      }
    }).end();
  }
});
var iframe, getStyles, curCSS,
  ralpha = /alpha\([^)]*\)/i,
  ropacity = /opacity\s*=\s*([^)]*)/,
  rposition = /^(top|right|bottom|left)$/,
  // swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
  // see here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
  rdisplayswap = /^(none|table(?!-c[ea]).+)/,
  rmargin = /^margin/,
  rnumsplit = new RegExp( "^(" + core_pnum + ")(.*)$", "i" ),
  rnumnonpx = new RegExp( "^(" + core_pnum + ")(?!px)[a-z%]+$", "i" ),
  rrelNum = new RegExp( "^([+-])=(" + core_pnum + ")", "i" ),
  elemdisplay = { BODY: "block" },

  cssShow = { position: "absolute", visibility: "hidden", display: "block" },
  cssNormalTransform = {
    letterSpacing: 0,
    fontWeight: 400
  },

  cssExpand = [ "Top", "Right", "Bottom", "Left" ],
  cssPrefixes = [ "Webkit", "O", "Moz", "ms" ];

// return a css property mapped to a potentially vendor prefixed property
function vendorPropName( style, name ) {

  // shortcut for names that are not vendor prefixed
  if ( name in style ) {
    return name;
  }

  // check for vendor prefixed names
  var capName = name.charAt(0).toUpperCase() + name.slice(1),
    origName = name,
    i = cssPrefixes.length;

  while ( i-- ) {
    name = cssPrefixes[ i ] + capName;
    if ( name in style ) {
      return name;
    }
  }

  return origName;
}

function isHidden( elem, el ) {
  // isHidden might be called from jQuery#filter function;
  // in that case, element will be second argument
  elem = el || elem;
  return jQuery.css( elem, "display" ) === "none" || !jQuery.contains( elem.ownerDocument, elem );
}

function showHide( elements, show ) {
  var display, elem, hidden,
    values = [],
    index = 0,
    length = elements.length;

  for ( ; index < length; index++ ) {
    elem = elements[ index ];
    if ( !elem.style ) {
      continue;
    }

    values[ index ] = jQuery._data( elem, "olddisplay" );
    display = elem.style.display;
    if ( show ) {
      // Reset the inline display of this element to learn if it is
      // being hidden by cascaded rules or not
      if ( !values[ index ] && display === "none" ) {
        elem.style.display = "";
      }

      // Set elements which have been overridden with display: none
      // in a stylesheet to whatever the default browser style is
      // for such an element
      if ( elem.style.display === "" && isHidden( elem ) ) {
        values[ index ] = jQuery._data( elem, "olddisplay", css_defaultDisplay(elem.nodeName) );
      }
    } else {

      if ( !values[ index ] ) {
        hidden = isHidden( elem );

        if ( display && display !== "none" || !hidden ) {
          jQuery._data( elem, "olddisplay", hidden ? display : jQuery.css( elem, "display" ) );
        }
      }
    }
  }

  // Set the display of most of the elements in a second loop
  // to avoid the constant reflow
  for ( index = 0; index < length; index++ ) {
    elem = elements[ index ];
    if ( !elem.style ) {
      continue;
    }
    if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
      elem.style.display = show ? values[ index ] || "" : "none";
    }
  }

  return elements;
}

jQuery.fn.extend({
  css: function( name, value ) {
    return jQuery.access( this, function( elem, name, value ) {
      var len, styles,
        map = {},
        i = 0;

      if ( jQuery.isArray( name ) ) {
        styles = getStyles( elem );
        len = name.length;

        for ( ; i < len; i++ ) {
          map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
        }

        return map;
      }

      return value !== undefined ?
        jQuery.style( elem, name, value ) :
        jQuery.css( elem, name );
    }, name, value, arguments.length > 1 );
  },
  show: function() {
    return showHide( this, true );
  },
  hide: function() {
    return showHide( this );
  },
  toggle: function( state ) {
    if ( typeof state === "boolean" ) {
      return state ? this.show() : this.hide();
    }

    return this.each(function() {
      if ( isHidden( this ) ) {
        jQuery( this ).show();
      } else {
        jQuery( this ).hide();
      }
    });
  }
});

jQuery.extend({
  // Add in style property hooks for overriding the default
  // behavior of getting and setting a style property
  cssHooks: {
    opacity: {
      get: function( elem, computed ) {
        if ( computed ) {
          // We should always get a number back from opacity
          var ret = curCSS( elem, "opacity" );
          return ret === "" ? "1" : ret;
        }
      }
    }
  },

  // Don't automatically add "px" to these possibly-unitless properties
  cssNumber: {
    "columnCount": true,
    "fillOpacity": true,
    "fontWeight": true,
    "lineHeight": true,
    "opacity": true,
    "order": true,
    "orphans": true,
    "widows": true,
    "zIndex": true,
    "zoom": true
  },

  // Add in properties whose names you wish to fix before
  // setting or getting the value
  cssProps: {
    // normalize float css property
    "float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat"
  },

  // Get and set the style property on a DOM Node
  style: function( elem, name, value, extra ) {
    // Don't set styles on text and comment nodes
    if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
      return;
    }

    // Make sure that we're working with the right name
    var ret, type, hooks,
      origName = jQuery.camelCase( name ),
      style = elem.style;

    name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( style, origName ) );

    // gets hook for the prefixed version
    // followed by the unprefixed version
    hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

    // Check if we're setting a value
    if ( value !== undefined ) {
      type = typeof value;

      // convert relative number strings (+= or -=) to relative numbers. #7345
      if ( type === "string" && (ret = rrelNum.exec( value )) ) {
        value = ( ret[1] + 1 ) * ret[2] + parseFloat( jQuery.css( elem, name ) );
        // Fixes bug #9237
        type = "number";
      }

      // Make sure that NaN and null values aren't set. See: #7116
      if ( value == null || type === "number" && isNaN( value ) ) {
        return;
      }

      // If a number was passed in, add 'px' to the (except for certain CSS properties)
      if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
        value += "px";
      }

      // Fixes #8908, it can be done more correctly by specifing setters in cssHooks,
      // but it would mean to define eight (for every problematic property) identical functions
      if ( !jQuery.support.clearCloneStyle && value === "" && name.indexOf("background") === 0 ) {
        style[ name ] = "inherit";
      }

      // If a hook was provided, use that value, otherwise just set the specified value
      if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value, extra )) !== undefined ) {

        // Wrapped to prevent IE from throwing errors when 'invalid' values are provided
        // Fixes bug #5509
        try {
          style[ name ] = value;
        } catch(e) {}
      }

    } else {
      // If a hook was provided get the non-computed value from there
      if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
        return ret;
      }

      // Otherwise just get the value from the style object
      return style[ name ];
    }
  },

  css: function( elem, name, extra, styles ) {
    var num, val, hooks,
      origName = jQuery.camelCase( name );

    // Make sure that we're working with the right name
    name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( elem.style, origName ) );

    // gets hook for the prefixed version
    // followed by the unprefixed version
    hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

    // If a hook was provided get the computed value from there
    if ( hooks && "get" in hooks ) {
      val = hooks.get( elem, true, extra );
    }

    // Otherwise, if a way to get the computed value exists, use that
    if ( val === undefined ) {
      val = curCSS( elem, name, styles );
    }

    //convert "normal" to computed value
    if ( val === "normal" && name in cssNormalTransform ) {
      val = cssNormalTransform[ name ];
    }

    // Return, converting to number if forced or a qualifier was provided and val looks numeric
    if ( extra === "" || extra ) {
      num = parseFloat( val );
      return extra === true || jQuery.isNumeric( num ) ? num || 0 : val;
    }
    return val;
  }
});

// NOTE: we've included the "window" in window.getComputedStyle
// because jsdom on node.js will break without it.
if ( window.getComputedStyle ) {
  getStyles = function( elem ) {
    return window.getComputedStyle( elem, null );
  };

  curCSS = function( elem, name, _computed ) {
    var width, minWidth, maxWidth,
      computed = _computed || getStyles( elem ),

      // getPropertyValue is only needed for .css('filter') in IE9, see #12537
      ret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined,
      style = elem.style;

    if ( computed ) {

      if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
        ret = jQuery.style( elem, name );
      }

      // A tribute to the "awesome hack by Dean Edwards"
      // Chrome < 17 and Safari 5.0 uses "computed value" instead of "used value" for margin-right
      // Safari 5.1.7 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
      // this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
      if ( rnumnonpx.test( ret ) && rmargin.test( name ) ) {

        // Remember the original values
        width = style.width;
        minWidth = style.minWidth;
        maxWidth = style.maxWidth;

        // Put in the new values to get a computed value out
        style.minWidth = style.maxWidth = style.width = ret;
        ret = computed.width;

        // Revert the changed values
        style.width = width;
        style.minWidth = minWidth;
        style.maxWidth = maxWidth;
      }
    }

    return ret;
  };
} else if ( document.documentElement.currentStyle ) {
  getStyles = function( elem ) {
    return elem.currentStyle;
  };

  curCSS = function( elem, name, _computed ) {
    var left, rs, rsLeft,
      computed = _computed || getStyles( elem ),
      ret = computed ? computed[ name ] : undefined,
      style = elem.style;

    // Avoid setting ret to empty string here
    // so we don't default to auto
    if ( ret == null && style && style[ name ] ) {
      ret = style[ name ];
    }

    // From the awesome hack by Dean Edwards
    // http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

    // If we're not dealing with a regular pixel number
    // but a number that has a weird ending, we need to convert it to pixels
    // but not position css attributes, as those are proportional to the parent element instead
    // and we can't measure the parent instead because it might trigger a "stacking dolls" problem
    if ( rnumnonpx.test( ret ) && !rposition.test( name ) ) {

      // Remember the original values
      left = style.left;
      rs = elem.runtimeStyle;
      rsLeft = rs && rs.left;

      // Put in the new values to get a computed value out
      if ( rsLeft ) {
        rs.left = elem.currentStyle.left;
      }
      style.left = name === "fontSize" ? "1em" : ret;
      ret = style.pixelLeft + "px";

      // Revert the changed values
      style.left = left;
      if ( rsLeft ) {
        rs.left = rsLeft;
      }
    }

    return ret === "" ? "auto" : ret;
  };
}

function setPositiveNumber( elem, value, subtract ) {
  var matches = rnumsplit.exec( value );
  return matches ?
    // Guard against undefined "subtract", e.g., when used as in cssHooks
    Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
    value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
  var i = extra === ( isBorderBox ? "border" : "content" ) ?
    // If we already have the right measurement, avoid augmentation
    4 :
    // Otherwise initialize for horizontal or vertical properties
    name === "width" ? 1 : 0,

    val = 0;

  for ( ; i < 4; i += 2 ) {
    // both box models exclude margin, so add it if we want it
    if ( extra === "margin" ) {
      val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
    }

    if ( isBorderBox ) {
      // border-box includes padding, so remove it if we want content
      if ( extra === "content" ) {
        val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
      }

      // at this point, extra isn't border nor margin, so remove border
      if ( extra !== "margin" ) {
        val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
      }
    } else {
      // at this point, extra isn't content, so add padding
      val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

      // at this point, extra isn't content nor padding, so add border
      if ( extra !== "padding" ) {
        val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
      }
    }
  }

  return val;
}

function getWidthOrHeight( elem, name, extra ) {

  // Start with offset property, which is equivalent to the border-box value
  var valueIsBorderBox = true,
    val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
    styles = getStyles( elem ),
    isBorderBox = jQuery.support.boxSizing && jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

  // some non-html elements return undefined for offsetWidth, so check for null/undefined
  // svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
  // MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
  if ( val <= 0 || val == null ) {
    // Fall back to computed then uncomputed css if necessary
    val = curCSS( elem, name, styles );
    if ( val < 0 || val == null ) {
      val = elem.style[ name ];
    }

    // Computed unit is not pixels. Stop here and return.
    if ( rnumnonpx.test(val) ) {
      return val;
    }

    // we need the check for style in case a browser which returns unreliable values
    // for getComputedStyle silently falls back to the reliable elem.style
    valueIsBorderBox = isBorderBox && ( jQuery.support.boxSizingReliable || val === elem.style[ name ] );

    // Normalize "", auto, and prepare for extra
    val = parseFloat( val ) || 0;
  }

  // use the active box-sizing model to add/subtract irrelevant styles
  return ( val +
    augmentWidthOrHeight(
      elem,
      name,
      extra || ( isBorderBox ? "border" : "content" ),
      valueIsBorderBox,
      styles
    )
  ) + "px";
}

// Try to determine the default display value of an element
function css_defaultDisplay( nodeName ) {
  var doc = document,
    display = elemdisplay[ nodeName ];

  if ( !display ) {
    display = actualDisplay( nodeName, doc );

    // If the simple way fails, read from inside an iframe
    if ( display === "none" || !display ) {
      // Use the already-created iframe if possible
      iframe = ( iframe ||
        jQuery("<iframe frameborder='0' width='0' height='0'/>")
        .css( "cssText", "display:block !important" )
      ).appendTo( doc.documentElement );

      // Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
      doc = ( iframe[0].contentWindow || iframe[0].contentDocument ).document;
      doc.write("<!doctype html><html><body>");
      doc.close();

      display = actualDisplay( nodeName, doc );
      iframe.detach();
    }

    // Store the correct default display
    elemdisplay[ nodeName ] = display;
  }

  return display;
}

// Called ONLY from within css_defaultDisplay
function actualDisplay( name, doc ) {
  var elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),
    display = jQuery.css( elem[0], "display" );
  elem.remove();
  return display;
}

jQuery.each([ "height", "width" ], function( i, name ) {
  jQuery.cssHooks[ name ] = {
    get: function( elem, computed, extra ) {
      if ( computed ) {
        // certain elements can have dimension info if we invisibly show them
        // however, it must have a current display style that would benefit from this
        return elem.offsetWidth === 0 && rdisplayswap.test( jQuery.css( elem, "display" ) ) ?
          jQuery.swap( elem, cssShow, function() {
            return getWidthOrHeight( elem, name, extra );
          }) :
          getWidthOrHeight( elem, name, extra );
      }
    },

    set: function( elem, value, extra ) {
      var styles = extra && getStyles( elem );
      return setPositiveNumber( elem, value, extra ?
        augmentWidthOrHeight(
          elem,
          name,
          extra,
          jQuery.support.boxSizing && jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
          styles
        ) : 0
      );
    }
  };
});

if ( !jQuery.support.opacity ) {
  jQuery.cssHooks.opacity = {
    get: function( elem, computed ) {
      // IE uses filters for opacity
      return ropacity.test( (computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "" ) ?
        ( 0.01 * parseFloat( RegExp.$1 ) ) + "" :
        computed ? "1" : "";
    },

    set: function( elem, value ) {
      var style = elem.style,
        currentStyle = elem.currentStyle,
        opacity = jQuery.isNumeric( value ) ? "alpha(opacity=" + value * 100 + ")" : "",
        filter = currentStyle && currentStyle.filter || style.filter || "";

      // IE has trouble with opacity if it does not have layout
      // Force it by setting the zoom level
      style.zoom = 1;

      // if setting opacity to 1, and no other filters exist - attempt to remove filter attribute #6652
      // if value === "", then remove inline opacity #12685
      if ( ( value >= 1 || value === "" ) &&
          jQuery.trim( filter.replace( ralpha, "" ) ) === "" &&
          style.removeAttribute ) {

        // Setting style.filter to null, "" & " " still leave "filter:" in the cssText
        // if "filter:" is present at all, clearType is disabled, we want to avoid this
        // style.removeAttribute is IE Only, but so apparently is this code path...
        style.removeAttribute( "filter" );

        // if there is no filter style applied in a css rule or unset inline opacity, we are done
        if ( value === "" || currentStyle && !currentStyle.filter ) {
          return;
        }
      }

      // otherwise, set new filter values
      style.filter = ralpha.test( filter ) ?
        filter.replace( ralpha, opacity ) :
        filter + " " + opacity;
    }
  };
}

// These hooks cannot be added until DOM ready because the support test
// for it is not run until after DOM ready
jQuery(function() {
  if ( !jQuery.support.reliableMarginRight ) {
    jQuery.cssHooks.marginRight = {
      get: function( elem, computed ) {
        if ( computed ) {
          // WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
          // Work around by temporarily setting element display to inline-block
          return jQuery.swap( elem, { "display": "inline-block" },
            curCSS, [ elem, "marginRight" ] );
        }
      }
    };
  }

  // Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
  // getComputedStyle returns percent when specified for top/left/bottom/right
  // rather than make the css module depend on the offset module, we just check for it here
  if ( !jQuery.support.pixelPosition && jQuery.fn.position ) {
    jQuery.each( [ "top", "left" ], function( i, prop ) {
      jQuery.cssHooks[ prop ] = {
        get: function( elem, computed ) {
          if ( computed ) {
            computed = curCSS( elem, prop );
            // if curCSS returns percentage, fallback to offset
            return rnumnonpx.test( computed ) ?
              jQuery( elem ).position()[ prop ] + "px" :
              computed;
          }
        }
      };
    });
  }

});

if ( jQuery.expr && jQuery.expr.filters ) {
  jQuery.expr.filters.hidden = function( elem ) {
    // Support: Opera <= 12.12
    // Opera reports offsetWidths and offsetHeights less than zero on some elements
    return elem.offsetWidth <= 0 && elem.offsetHeight <= 0 ||
      (!jQuery.support.reliableHiddenOffsets && ((elem.style && elem.style.display) || jQuery.css( elem, "display" )) === "none");
  };

  jQuery.expr.filters.visible = function( elem ) {
    return !jQuery.expr.filters.hidden( elem );
  };
}

// These hooks are used by animate to expand properties
jQuery.each({
  margin: "",
  padding: "",
  border: "Width"
}, function( prefix, suffix ) {
  jQuery.cssHooks[ prefix + suffix ] = {
    expand: function( value ) {
      var i = 0,
        expanded = {},

        // assumes a single number if not a string
        parts = typeof value === "string" ? value.split(" ") : [ value ];

      for ( ; i < 4; i++ ) {
        expanded[ prefix + cssExpand[ i ] + suffix ] =
          parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
      }

      return expanded;
    }
  };

  if ( !rmargin.test( prefix ) ) {
    jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
  }
});
var r20 = /%20/g,
  rbracket = /\[\]$/,
  rCRLF = /\r?\n/g,
  rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
  rsubmittable = /^(?:input|select|textarea|keygen)/i;

jQuery.fn.extend({
  serialize: function() {
    return jQuery.param( this.serializeArray() );
  },
  serializeArray: function() {
    return this.map(function(){
      // Can add propHook for "elements" to filter or add form elements
      var elements = jQuery.prop( this, "elements" );
      return elements ? jQuery.makeArray( elements ) : this;
    })
    .filter(function(){
      var type = this.type;
      // Use .is(":disabled") so that fieldset[disabled] works
      return this.name && !jQuery( this ).is( ":disabled" ) &&
        rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
        ( this.checked || !manipulation_rcheckableType.test( type ) );
    })
    .map(function( i, elem ){
      var val = jQuery( this ).val();

      return val == null ?
        null :
        jQuery.isArray( val ) ?
          jQuery.map( val, function( val ){
            return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
          }) :
          { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
    }).get();
  }
});

//Serialize an array of form elements or a set of
//key/values into a query string
jQuery.param = function( a, traditional ) {
  var prefix,
    s = [],
    add = function( key, value ) {
      // If value is a function, invoke it and return its value
      value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
      s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
    };

  // Set traditional to true for jQuery <= 1.3.2 behavior.
  if ( traditional === undefined ) {
    traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
  }

  // If an array was passed in, assume that it is an array of form elements.
  if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
    // Serialize the form elements
    jQuery.each( a, function() {
      add( this.name, this.value );
    });

  } else {
    // If traditional, encode the "old" way (the way 1.3.2 or older
    // did it), otherwise encode params recursively.
    for ( prefix in a ) {
      buildParams( prefix, a[ prefix ], traditional, add );
    }
  }

  // Return the resulting serialization
  return s.join( "&" ).replace( r20, "+" );
};

function buildParams( prefix, obj, traditional, add ) {
  var name;

  if ( jQuery.isArray( obj ) ) {
    // Serialize array item.
    jQuery.each( obj, function( i, v ) {
      if ( traditional || rbracket.test( prefix ) ) {
        // Treat each array item as a scalar.
        add( prefix, v );

      } else {
        // Item is non-scalar (array or object), encode its numeric index.
        buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add );
      }
    });

  } else if ( !traditional && jQuery.type( obj ) === "object" ) {
    // Serialize object item.
    for ( name in obj ) {
      buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
    }

  } else {
    // Serialize scalar item.
    add( prefix, obj );
  }
}
jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
  "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
  "change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

  // Handle event binding
  jQuery.fn[ name ] = function( data, fn ) {
    return arguments.length > 0 ?
      this.on( name, null, data, fn ) :
      this.trigger( name );
  };
});

jQuery.fn.extend({
  hover: function( fnOver, fnOut ) {
    return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
  },

  bind: function( types, data, fn ) {
    return this.on( types, null, data, fn );
  },
  unbind: function( types, fn ) {
    return this.off( types, null, fn );
  },

  delegate: function( selector, types, data, fn ) {
    return this.on( types, selector, data, fn );
  },
  undelegate: function( selector, types, fn ) {
    // ( namespace ) or ( selector, types [, fn] )
    return arguments.length === 1 ? this.off( selector, "**" ) : this.off( types, selector || "**", fn );
  }
});
var
  // Document location
  ajaxLocParts,
  ajaxLocation,
  ajax_nonce = jQuery.now(),

  ajax_rquery = /\?/,
  rhash = /#.*$/,
  rts = /([?&])_=[^&]*/,
  rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL
  // #7653, #8125, #8152: local protocol detection
  rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
  rnoContent = /^(?:GET|HEAD)$/,
  rprotocol = /^\/\//,
  rurl = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,

  // Keep a copy of the old load method
  _load = jQuery.fn.load,

  /* Prefilters
   * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
   * 2) These are called:
   *    - BEFORE asking for a transport
   *    - AFTER param serialization (s.data is a string if s.processData is true)
   * 3) key is the dataType
   * 4) the catchall symbol "*" can be used
   * 5) execution will start with transport dataType and THEN continue down to "*" if needed
   */
  prefilters = {},

  /* Transports bindings
   * 1) key is the dataType
   * 2) the catchall symbol "*" can be used
   * 3) selection will start with transport dataType and THEN go to "*" if needed
   */
  transports = {},

  // Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
  allTypes = "*/".concat("*");

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
try {
  ajaxLocation = location.href;
} catch( e ) {
  // Use the href attribute of an A element
  // since IE will modify it given document.location
  ajaxLocation = document.createElement( "a" );
  ajaxLocation.href = "";
  ajaxLocation = ajaxLocation.href;
}

// Segment location into parts
ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

  // dataTypeExpression is optional and defaults to "*"
  return function( dataTypeExpression, func ) {

    if ( typeof dataTypeExpression !== "string" ) {
      func = dataTypeExpression;
      dataTypeExpression = "*";
    }

    var dataType,
      i = 0,
      dataTypes = dataTypeExpression.toLowerCase().match( core_rnotwhite ) || [];

    if ( jQuery.isFunction( func ) ) {
      // For each dataType in the dataTypeExpression
      while ( (dataType = dataTypes[i++]) ) {
        // Prepend if requested
        if ( dataType[0] === "+" ) {
          dataType = dataType.slice( 1 ) || "*";
          (structure[ dataType ] = structure[ dataType ] || []).unshift( func );

        // Otherwise append
        } else {
          (structure[ dataType ] = structure[ dataType ] || []).push( func );
        }
      }
    }
  };
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

  var inspected = {},
    seekingTransport = ( structure === transports );

  function inspect( dataType ) {
    var selected;
    inspected[ dataType ] = true;
    jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
      var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
      if( typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[ dataTypeOrTransport ] ) {
        options.dataTypes.unshift( dataTypeOrTransport );
        inspect( dataTypeOrTransport );
        return false;
      } else if ( seekingTransport ) {
        return !( selected = dataTypeOrTransport );
      }
    });
    return selected;
  }

  return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
  var deep, key,
    flatOptions = jQuery.ajaxSettings.flatOptions || {};

  for ( key in src ) {
    if ( src[ key ] !== undefined ) {
      ( flatOptions[ key ] ? target : ( deep || (deep = {}) ) )[ key ] = src[ key ];
    }
  }
  if ( deep ) {
    jQuery.extend( true, target, deep );
  }

  return target;
}

jQuery.fn.load = function( url, params, callback ) {
  if ( typeof url !== "string" && _load ) {
    return _load.apply( this, arguments );
  }

  var selector, response, type,
    self = this,
    off = url.indexOf(" ");

  if ( off >= 0 ) {
    selector = url.slice( off, url.length );
    url = url.slice( 0, off );
  }

  // If it's a function
  if ( jQuery.isFunction( params ) ) {

    // We assume that it's the callback
    callback = params;
    params = undefined;

  // Otherwise, build a param string
  } else if ( params && typeof params === "object" ) {
    type = "POST";
  }

  // If we have elements to modify, make the request
  if ( self.length > 0 ) {
    jQuery.ajax({
      url: url,

      // if "type" variable is undefined, then "GET" method will be used
      type: type,
      dataType: "html",
      data: params
    }).done(function( responseText ) {

      // Save response for use in complete callback
      response = arguments;

      self.html( selector ?

        // If a selector was specified, locate the right elements in a dummy div
        // Exclude scripts to avoid IE 'Permission Denied' errors
        jQuery("<div>").append( jQuery.parseHTML( responseText ) ).find( selector ) :

        // Otherwise use the full result
        responseText );

    }).complete( callback && function( jqXHR, status ) {
      self.each( callback, response || [ jqXHR.responseText, status, jqXHR ] );
    });
  }

  return this;
};

// Attach a bunch of functions for handling common AJAX events
jQuery.each( [ "ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend" ], function( i, type ){
  jQuery.fn[ type ] = function( fn ){
    return this.on( type, fn );
  };
});

jQuery.extend({

  // Counter for holding the number of active queries
  active: 0,

  // Last-Modified header cache for next request
  lastModified: {},
  etag: {},

  ajaxSettings: {
    url: ajaxLocation,
    type: "GET",
    isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
    global: true,
    processData: true,
    async: true,
    contentType: "application/x-www-form-urlencoded; charset=UTF-8",
    /*
    timeout: 0,
    data: null,
    dataType: null,
    username: null,
    password: null,
    cache: null,
    throws: false,
    traditional: false,
    headers: {},
    */

    accepts: {
      "*": allTypes,
      text: "text/plain",
      html: "text/html",
      xml: "application/xml, text/xml",
      json: "application/json, text/javascript"
    },

    contents: {
      xml: /xml/,
      html: /html/,
      json: /json/
    },

    responseFields: {
      xml: "responseXML",
      text: "responseText",
      json: "responseJSON"
    },

    // Data converters
    // Keys separate source (or catchall "*") and destination types with a single space
    converters: {

      // Convert anything to text
      "* text": String,

      // Text to html (true = no transformation)
      "text html": true,

      // Evaluate text as a json expression
      "text json": jQuery.parseJSON,

      // Parse text as xml
      "text xml": jQuery.parseXML
    },

    // For options that shouldn't be deep extended:
    // you can add your own custom options here if
    // and when you create one that shouldn't be
    // deep extended (see ajaxExtend)
    flatOptions: {
      url: true,
      context: true
    }
  },

  // Creates a full fledged settings object into target
  // with both ajaxSettings and settings fields.
  // If target is omitted, writes into ajaxSettings.
  ajaxSetup: function( target, settings ) {
    return settings ?

      // Building a settings object
      ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

      // Extending ajaxSettings
      ajaxExtend( jQuery.ajaxSettings, target );
  },

  ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
  ajaxTransport: addToPrefiltersOrTransports( transports ),

  // Main method
  ajax: function( url, options ) {

    // If url is an object, simulate pre-1.5 signature
    if ( typeof url === "object" ) {
      options = url;
      url = undefined;
    }

    // Force options to be an object
    options = options || {};

    var // Cross-domain detection vars
      parts,
      // Loop variable
      i,
      // URL without anti-cache param
      cacheURL,
      // Response headers as string
      responseHeadersString,
      // timeout handle
      timeoutTimer,

      // To know if global events are to be dispatched
      fireGlobals,

      transport,
      // Response headers
      responseHeaders,
      // Create the final options object
      s = jQuery.ajaxSetup( {}, options ),
      // Callbacks context
      callbackContext = s.context || s,
      // Context for global events is callbackContext if it is a DOM node or jQuery collection
      globalEventContext = s.context && ( callbackContext.nodeType || callbackContext.jquery ) ?
        jQuery( callbackContext ) :
        jQuery.event,
      // Deferreds
      deferred = jQuery.Deferred(),
      completeDeferred = jQuery.Callbacks("once memory"),
      // Status-dependent callbacks
      statusCode = s.statusCode || {},
      // Headers (they are sent all at once)
      requestHeaders = {},
      requestHeadersNames = {},
      // The jqXHR state
      state = 0,
      // Default abort message
      strAbort = "canceled",
      // Fake xhr
      jqXHR = {
        readyState: 0,

        // Builds headers hashtable if needed
        getResponseHeader: function( key ) {
          var match;
          if ( state === 2 ) {
            if ( !responseHeaders ) {
              responseHeaders = {};
              while ( (match = rheaders.exec( responseHeadersString )) ) {
                responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
              }
            }
            match = responseHeaders[ key.toLowerCase() ];
          }
          return match == null ? null : match;
        },

        // Raw string
        getAllResponseHeaders: function() {
          return state === 2 ? responseHeadersString : null;
        },

        // Caches the header
        setRequestHeader: function( name, value ) {
          var lname = name.toLowerCase();
          if ( !state ) {
            name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
            requestHeaders[ name ] = value;
          }
          return this;
        },

        // Overrides response content-type header
        overrideMimeType: function( type ) {
          if ( !state ) {
            s.mimeType = type;
          }
          return this;
        },

        // Status-dependent callbacks
        statusCode: function( map ) {
          var code;
          if ( map ) {
            if ( state < 2 ) {
              for ( code in map ) {
                // Lazy-add the new callback in a way that preserves old ones
                statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
              }
            } else {
              // Execute the appropriate callbacks
              jqXHR.always( map[ jqXHR.status ] );
            }
          }
          return this;
        },

        // Cancel the request
        abort: function( statusText ) {
          var finalText = statusText || strAbort;
          if ( transport ) {
            transport.abort( finalText );
          }
          done( 0, finalText );
          return this;
        }
      };

    // Attach deferreds
    deferred.promise( jqXHR ).complete = completeDeferred.add;
    jqXHR.success = jqXHR.done;
    jqXHR.error = jqXHR.fail;

    // Remove hash character (#7531: and string promotion)
    // Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
    // Handle falsy url in the settings object (#10093: consistency with old signature)
    // We also use the url parameter if available
    s.url = ( ( url || s.url || ajaxLocation ) + "" ).replace( rhash, "" ).replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

    // Alias method option to type as per ticket #12004
    s.type = options.method || options.type || s.method || s.type;

    // Extract dataTypes list
    s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( core_rnotwhite ) || [""];

    // A cross-domain request is in order when we have a protocol:host:port mismatch
    if ( s.crossDomain == null ) {
      parts = rurl.exec( s.url.toLowerCase() );
      s.crossDomain = !!( parts &&
        ( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||
          ( parts[ 3 ] || ( parts[ 1 ] === "http:" ? "80" : "443" ) ) !==
            ( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? "80" : "443" ) ) )
      );
    }

    // Convert data if not already a string
    if ( s.data && s.processData && typeof s.data !== "string" ) {
      s.data = jQuery.param( s.data, s.traditional );
    }

    // Apply prefilters
    inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

    // If request was aborted inside a prefilter, stop there
    if ( state === 2 ) {
      return jqXHR;
    }

    // We can fire global events as of now if asked to
    fireGlobals = s.global;

    // Watch for a new set of requests
    if ( fireGlobals && jQuery.active++ === 0 ) {
      jQuery.event.trigger("ajaxStart");
    }

    // Uppercase the type
    s.type = s.type.toUpperCase();

    // Determine if request has content
    s.hasContent = !rnoContent.test( s.type );

    // Save the URL in case we're toying with the If-Modified-Since
    // and/or If-None-Match header later on
    cacheURL = s.url;

    // More options handling for requests with no content
    if ( !s.hasContent ) {

      // If data is available, append data to url
      if ( s.data ) {
        cacheURL = ( s.url += ( ajax_rquery.test( cacheURL ) ? "&" : "?" ) + s.data );
        // #9682: remove data so that it's not used in an eventual retry
        delete s.data;
      }

      // Add anti-cache in url if needed
      if ( s.cache === false ) {
        s.url = rts.test( cacheURL ) ?

          // If there is already a '_' parameter, set its value
          cacheURL.replace( rts, "$1_=" + ajax_nonce++ ) :

          // Otherwise add one to the end
          cacheURL + ( ajax_rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + ajax_nonce++;
      }
    }

    // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
    if ( s.ifModified ) {
      if ( jQuery.lastModified[ cacheURL ] ) {
        jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
      }
      if ( jQuery.etag[ cacheURL ] ) {
        jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
      }
    }

    // Set the correct header, if data is being sent
    if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
      jqXHR.setRequestHeader( "Content-Type", s.contentType );
    }

    // Set the Accepts header for the server, depending on the dataType
    jqXHR.setRequestHeader(
      "Accept",
      s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
        s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
        s.accepts[ "*" ]
    );

    // Check for headers option
    for ( i in s.headers ) {
      jqXHR.setRequestHeader( i, s.headers[ i ] );
    }

    // Allow custom headers/mimetypes and early abort
    if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
      // Abort if not done already and return
      return jqXHR.abort();
    }

    // aborting is no longer a cancellation
    strAbort = "abort";

    // Install callbacks on deferreds
    for ( i in { success: 1, error: 1, complete: 1 } ) {
      jqXHR[ i ]( s[ i ] );
    }

    // Get transport
    transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

    // If no transport, we auto-abort
    if ( !transport ) {
      done( -1, "No Transport" );
    } else {
      jqXHR.readyState = 1;

      // Send global event
      if ( fireGlobals ) {
        globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
      }
      // Timeout
      if ( s.async && s.timeout > 0 ) {
        timeoutTimer = setTimeout(function() {
          jqXHR.abort("timeout");
        }, s.timeout );
      }

      try {
        state = 1;
        transport.send( requestHeaders, done );
      } catch ( e ) {
        // Propagate exception as error if not done
        if ( state < 2 ) {
          done( -1, e );
        // Simply rethrow otherwise
        } else {
          throw e;
        }
      }
    }

    // Callback for when everything is done
    function done( status, nativeStatusText, responses, headers ) {
      var isSuccess, success, error, response, modified,
        statusText = nativeStatusText;

      // Called once
      if ( state === 2 ) {
        return;
      }

      // State is "done" now
      state = 2;

      // Clear timeout if it exists
      if ( timeoutTimer ) {
        clearTimeout( timeoutTimer );
      }

      // Dereference transport for early garbage collection
      // (no matter how long the jqXHR object will be used)
      transport = undefined;

      // Cache response headers
      responseHeadersString = headers || "";

      // Set readyState
      jqXHR.readyState = status > 0 ? 4 : 0;

      // Determine if successful
      isSuccess = status >= 200 && status < 300 || status === 304;

      // Get response data
      if ( responses ) {
        response = ajaxHandleResponses( s, jqXHR, responses );
      }

      // Convert no matter what (that way responseXXX fields are always set)
      response = ajaxConvert( s, response, jqXHR, isSuccess );

      // If successful, handle type chaining
      if ( isSuccess ) {

        // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
        if ( s.ifModified ) {
          modified = jqXHR.getResponseHeader("Last-Modified");
          if ( modified ) {
            jQuery.lastModified[ cacheURL ] = modified;
          }
          modified = jqXHR.getResponseHeader("etag");
          if ( modified ) {
            jQuery.etag[ cacheURL ] = modified;
          }
        }

        // if no content
        if ( status === 204 || s.type === "HEAD" ) {
          statusText = "nocontent";

        // if not modified
        } else if ( status === 304 ) {
          statusText = "notmodified";

        // If we have data, let's convert it
        } else {
          statusText = response.state;
          success = response.data;
          error = response.error;
          isSuccess = !error;
        }
      } else {
        // We extract error from statusText
        // then normalize statusText and status for non-aborts
        error = statusText;
        if ( status || !statusText ) {
          statusText = "error";
          if ( status < 0 ) {
            status = 0;
          }
        }
      }

      // Set data for the fake xhr object
      jqXHR.status = status;
      jqXHR.statusText = ( nativeStatusText || statusText ) + "";

      // Success/Error
      if ( isSuccess ) {
        deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
      } else {
        deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
      }

      // Status-dependent callbacks
      jqXHR.statusCode( statusCode );
      statusCode = undefined;

      if ( fireGlobals ) {
        globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
          [ jqXHR, s, isSuccess ? success : error ] );
      }

      // Complete
      completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

      if ( fireGlobals ) {
        globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
        // Handle the global AJAX counter
        if ( !( --jQuery.active ) ) {
          jQuery.event.trigger("ajaxStop");
        }
      }
    }

    return jqXHR;
  },

  getJSON: function( url, data, callback ) {
    return jQuery.get( url, data, callback, "json" );
  },

  getScript: function( url, callback ) {
    return jQuery.get( url, undefined, callback, "script" );
  }
});

jQuery.each( [ "get", "post" ], function( i, method ) {
  jQuery[ method ] = function( url, data, callback, type ) {
    // shift arguments if data argument was omitted
    if ( jQuery.isFunction( data ) ) {
      type = type || callback;
      callback = data;
      data = undefined;
    }

    return jQuery.ajax({
      url: url,
      type: method,
      dataType: type,
      data: data,
      success: callback
    });
  };
});

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {
  var firstDataType, ct, finalDataType, type,
    contents = s.contents,
    dataTypes = s.dataTypes;

  // Remove auto dataType and get content-type in the process
  while( dataTypes[ 0 ] === "*" ) {
    dataTypes.shift();
    if ( ct === undefined ) {
      ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
    }
  }

  // Check if we're dealing with a known content-type
  if ( ct ) {
    for ( type in contents ) {
      if ( contents[ type ] && contents[ type ].test( ct ) ) {
        dataTypes.unshift( type );
        break;
      }
    }
  }

  // Check to see if we have a response for the expected dataType
  if ( dataTypes[ 0 ] in responses ) {
    finalDataType = dataTypes[ 0 ];
  } else {
    // Try convertible dataTypes
    for ( type in responses ) {
      if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
        finalDataType = type;
        break;
      }
      if ( !firstDataType ) {
        firstDataType = type;
      }
    }
    // Or just use first one
    finalDataType = finalDataType || firstDataType;
  }

  // If we found a dataType
  // We add the dataType to the list if needed
  // and return the corresponding response
  if ( finalDataType ) {
    if ( finalDataType !== dataTypes[ 0 ] ) {
      dataTypes.unshift( finalDataType );
    }
    return responses[ finalDataType ];
  }
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
  var conv2, current, conv, tmp, prev,
    converters = {},
    // Work with a copy of dataTypes in case we need to modify it for conversion
    dataTypes = s.dataTypes.slice();

  // Create converters map with lowercased keys
  if ( dataTypes[ 1 ] ) {
    for ( conv in s.converters ) {
      converters[ conv.toLowerCase() ] = s.converters[ conv ];
    }
  }

  current = dataTypes.shift();

  // Convert to each sequential dataType
  while ( current ) {

    if ( s.responseFields[ current ] ) {
      jqXHR[ s.responseFields[ current ] ] = response;
    }

    // Apply the dataFilter if provided
    if ( !prev && isSuccess && s.dataFilter ) {
      response = s.dataFilter( response, s.dataType );
    }

    prev = current;
    current = dataTypes.shift();

    if ( current ) {

      // There's only work to do if current dataType is non-auto
      if ( current === "*" ) {

        current = prev;

      // Convert response if prev dataType is non-auto and differs from current
      } else if ( prev !== "*" && prev !== current ) {

        // Seek a direct converter
        conv = converters[ prev + " " + current ] || converters[ "* " + current ];

        // If none found, seek a pair
        if ( !conv ) {
          for ( conv2 in converters ) {

            // If conv2 outputs current
            tmp = conv2.split( " " );
            if ( tmp[ 1 ] === current ) {

              // If prev can be converted to accepted input
              conv = converters[ prev + " " + tmp[ 0 ] ] ||
                converters[ "* " + tmp[ 0 ] ];
              if ( conv ) {
                // Condense equivalence converters
                if ( conv === true ) {
                  conv = converters[ conv2 ];

                // Otherwise, insert the intermediate dataType
                } else if ( converters[ conv2 ] !== true ) {
                  current = tmp[ 0 ];
                  dataTypes.unshift( tmp[ 1 ] );
                }
                break;
              }
            }
          }
        }

        // Apply converter (if not an equivalence)
        if ( conv !== true ) {

          // Unless errors are allowed to bubble, catch and return them
          if ( conv && s[ "throws" ] ) {
            response = conv( response );
          } else {
            try {
              response = conv( response );
            } catch ( e ) {
              return { state: "parsererror", error: conv ? e : "No conversion from " + prev + " to " + current };
            }
          }
        }
      }
    }
  }

  return { state: "success", data: response };
}
// Install script dataType
jQuery.ajaxSetup({
  accepts: {
    script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
  },
  contents: {
    script: /(?:java|ecma)script/
  },
  converters: {
    "text script": function( text ) {
      jQuery.globalEval( text );
      return text;
    }
  }
});

// Handle cache's special case and global
jQuery.ajaxPrefilter( "script", function( s ) {
  if ( s.cache === undefined ) {
    s.cache = false;
  }
  if ( s.crossDomain ) {
    s.type = "GET";
    s.global = false;
  }
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function(s) {

  // This transport only deals with cross domain requests
  if ( s.crossDomain ) {

    var script,
      head = document.head || jQuery("head")[0] || document.documentElement;

    return {

      send: function( _, callback ) {

        script = document.createElement("script");

        script.async = true;

        if ( s.scriptCharset ) {
          script.charset = s.scriptCharset;
        }

        script.src = s.url;

        // Attach handlers for all browsers
        script.onload = script.onreadystatechange = function( _, isAbort ) {

          if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

            // Handle memory leak in IE
            script.onload = script.onreadystatechange = null;

            // Remove the script
            if ( script.parentNode ) {
              script.parentNode.removeChild( script );
            }

            // Dereference the script
            script = null;

            // Callback if not abort
            if ( !isAbort ) {
              callback( 200, "success" );
            }
          }
        };

        // Circumvent IE6 bugs with base elements (#2709 and #4378) by prepending
        // Use native DOM manipulation to avoid our domManip AJAX trickery
        head.insertBefore( script, head.firstChild );
      },

      abort: function() {
        if ( script ) {
          script.onload( undefined, true );
        }
      }
    };
  }
});
var oldCallbacks = [],
  rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup({
  jsonp: "callback",
  jsonpCallback: function() {
    var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( ajax_nonce++ ) );
    this[ callback ] = true;
    return callback;
  }
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

  var callbackName, overwritten, responseContainer,
    jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
      "url" :
      typeof s.data === "string" && !( s.contentType || "" ).indexOf("application/x-www-form-urlencoded") && rjsonp.test( s.data ) && "data"
    );

  // Handle iff the expected data type is "jsonp" or we have a parameter to set
  if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

    // Get callback name, remembering preexisting value associated with it
    callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
      s.jsonpCallback() :
      s.jsonpCallback;

    // Insert callback into url or form data
    if ( jsonProp ) {
      s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
    } else if ( s.jsonp !== false ) {
      s.url += ( ajax_rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
    }

    // Use data converter to retrieve json after script execution
    s.converters["script json"] = function() {
      if ( !responseContainer ) {
        jQuery.error( callbackName + " was not called" );
      }
      return responseContainer[ 0 ];
    };

    // force json dataType
    s.dataTypes[ 0 ] = "json";

    // Install callback
    overwritten = window[ callbackName ];
    window[ callbackName ] = function() {
      responseContainer = arguments;
    };

    // Clean-up function (fires after converters)
    jqXHR.always(function() {
      // Restore preexisting value
      window[ callbackName ] = overwritten;

      // Save back as free
      if ( s[ callbackName ] ) {
        // make sure that re-using the options doesn't screw things around
        s.jsonpCallback = originalSettings.jsonpCallback;

        // save the callback name for future use
        oldCallbacks.push( callbackName );
      }

      // Call if it was a function and we have a response
      if ( responseContainer && jQuery.isFunction( overwritten ) ) {
        overwritten( responseContainer[ 0 ] );
      }

      responseContainer = overwritten = undefined;
    });

    // Delegate to script
    return "script";
  }
});
var xhrCallbacks, xhrSupported,
  xhrId = 0,
  // #5280: Internet Explorer will keep connections alive if we don't abort on unload
  xhrOnUnloadAbort = window.ActiveXObject && function() {
    // Abort all pending requests
    var key;
    for ( key in xhrCallbacks ) {
      xhrCallbacks[ key ]( undefined, true );
    }
  };

// Functions to create xhrs
function createStandardXHR() {
  try {
    return new window.XMLHttpRequest();
  } catch( e ) {}
}

function createActiveXHR() {
  try {
    return new window.ActiveXObject("Microsoft.XMLHTTP");
  } catch( e ) {}
}

// Create the request object
// (This is still attached to ajaxSettings for backward compatibility)
jQuery.ajaxSettings.xhr = window.ActiveXObject ?
  /* Microsoft failed to properly
   * implement the XMLHttpRequest in IE7 (can't request local files),
   * so we use the ActiveXObject when it is available
   * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
   * we need a fallback.
   */
  function() {
    return !this.isLocal && createStandardXHR() || createActiveXHR();
  } :
  // For all other browsers, use the standard XMLHttpRequest object
  createStandardXHR;

// Determine support properties
xhrSupported = jQuery.ajaxSettings.xhr();
jQuery.support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
xhrSupported = jQuery.support.ajax = !!xhrSupported;

// Create transport if the browser can provide an xhr
if ( xhrSupported ) {

  jQuery.ajaxTransport(function( s ) {
    // Cross domain only allowed if supported through XMLHttpRequest
    if ( !s.crossDomain || jQuery.support.cors ) {

      var callback;

      return {
        send: function( headers, complete ) {

          // Get a new xhr
          var handle, i,
            xhr = s.xhr();

          // Open the socket
          // Passing null username, generates a login popup on Opera (#2865)
          if ( s.username ) {
            xhr.open( s.type, s.url, s.async, s.username, s.password );
          } else {
            xhr.open( s.type, s.url, s.async );
          }

          // Apply custom fields if provided
          if ( s.xhrFields ) {
            for ( i in s.xhrFields ) {
              xhr[ i ] = s.xhrFields[ i ];
            }
          }

          // Override mime type if needed
          if ( s.mimeType && xhr.overrideMimeType ) {
            xhr.overrideMimeType( s.mimeType );
          }

          // X-Requested-With header
          // For cross-domain requests, seeing as conditions for a preflight are
          // akin to a jigsaw puzzle, we simply never set it to be sure.
          // (it can always be set on a per-request basis or even using ajaxSetup)
          // For same-domain requests, won't change header if already provided.
          if ( !s.crossDomain && !headers["X-Requested-With"] ) {
            headers["X-Requested-With"] = "XMLHttpRequest";
          }

          // Need an extra try/catch for cross domain requests in Firefox 3
          try {
            for ( i in headers ) {
              xhr.setRequestHeader( i, headers[ i ] );
            }
          } catch( err ) {}

          // Do send the request
          // This may raise an exception which is actually
          // handled in jQuery.ajax (so no try/catch here)
          xhr.send( ( s.hasContent && s.data ) || null );

          // Listener
          callback = function( _, isAbort ) {
            var status, responseHeaders, statusText, responses;

            // Firefox throws exceptions when accessing properties
            // of an xhr when a network error occurred
            // http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
            try {

              // Was never called and is aborted or complete
              if ( callback && ( isAbort || xhr.readyState === 4 ) ) {

                // Only called once
                callback = undefined;

                // Do not keep as active anymore
                if ( handle ) {
                  xhr.onreadystatechange = jQuery.noop;
                  if ( xhrOnUnloadAbort ) {
                    delete xhrCallbacks[ handle ];
                  }
                }

                // If it's an abort
                if ( isAbort ) {
                  // Abort it manually if needed
                  if ( xhr.readyState !== 4 ) {
                    xhr.abort();
                  }
                } else {
                  responses = {};
                  status = xhr.status;
                  responseHeaders = xhr.getAllResponseHeaders();

                  // When requesting binary data, IE6-9 will throw an exception
                  // on any attempt to access responseText (#11426)
                  if ( typeof xhr.responseText === "string" ) {
                    responses.text = xhr.responseText;
                  }

                  // Firefox throws an exception when accessing
                  // statusText for faulty cross-domain requests
                  try {
                    statusText = xhr.statusText;
                  } catch( e ) {
                    // We normalize with Webkit giving an empty statusText
                    statusText = "";
                  }

                  // Filter status for non standard behaviors

                  // If the request is local and we have data: assume a success
                  // (success with no data won't get notified, that's the best we
                  // can do given current implementations)
                  if ( !status && s.isLocal && !s.crossDomain ) {
                    status = responses.text ? 200 : 404;
                  // IE - #1450: sometimes returns 1223 when it should be 204
                  } else if ( status === 1223 ) {
                    status = 204;
                  }
                }
              }
            } catch( firefoxAccessException ) {
              if ( !isAbort ) {
                complete( -1, firefoxAccessException );
              }
            }

            // Call complete if needed
            if ( responses ) {
              complete( status, statusText, responses, responseHeaders );
            }
          };

          if ( !s.async ) {
            // if we're in sync mode we fire the callback
            callback();
          } else if ( xhr.readyState === 4 ) {
            // (IE6 & IE7) if it's in cache and has been
            // retrieved directly we need to fire the callback
            setTimeout( callback );
          } else {
            handle = ++xhrId;
            if ( xhrOnUnloadAbort ) {
              // Create the active xhrs callbacks list if needed
              // and attach the unload handler
              if ( !xhrCallbacks ) {
                xhrCallbacks = {};
                jQuery( window ).unload( xhrOnUnloadAbort );
              }
              // Add to list of active xhrs callbacks
              xhrCallbacks[ handle ] = callback;
            }
            xhr.onreadystatechange = callback;
          }
        },

        abort: function() {
          if ( callback ) {
            callback( undefined, true );
          }
        }
      };
    }
  });
}
var fxNow, timerId,
  rfxtypes = /^(?:toggle|show|hide)$/,
  rfxnum = new RegExp( "^(?:([+-])=|)(" + core_pnum + ")([a-z%]*)$", "i" ),
  rrun = /queueHooks$/,
  animationPrefilters = [ defaultPrefilter ],
  tweeners = {
    "*": [function( prop, value ) {
      var tween = this.createTween( prop, value ),
        target = tween.cur(),
        parts = rfxnum.exec( value ),
        unit = parts && parts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

        // Starting value computation is required for potential unit mismatches
        start = ( jQuery.cssNumber[ prop ] || unit !== "px" && +target ) &&
          rfxnum.exec( jQuery.css( tween.elem, prop ) ),
        scale = 1,
        maxIterations = 20;

      if ( start && start[ 3 ] !== unit ) {
        // Trust units reported by jQuery.css
        unit = unit || start[ 3 ];

        // Make sure we update the tween properties later on
        parts = parts || [];

        // Iteratively approximate from a nonzero starting point
        start = +target || 1;

        do {
          // If previous iteration zeroed out, double until we get *something*
          // Use a string for doubling factor so we don't accidentally see scale as unchanged below
          scale = scale || ".5";

          // Adjust and apply
          start = start / scale;
          jQuery.style( tween.elem, prop, start + unit );

        // Update scale, tolerating zero or NaN from tween.cur()
        // And breaking the loop if scale is unchanged or perfect, or if we've just had enough
        } while ( scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations );
      }

      // Update tween properties
      if ( parts ) {
        start = tween.start = +start || +target || 0;
        tween.unit = unit;
        // If a +=/-= token was provided, we're doing a relative animation
        tween.end = parts[ 1 ] ?
          start + ( parts[ 1 ] + 1 ) * parts[ 2 ] :
          +parts[ 2 ];
      }

      return tween;
    }]
  };

// Animations created synchronously will run synchronously
function createFxNow() {
  setTimeout(function() {
    fxNow = undefined;
  });
  return ( fxNow = jQuery.now() );
}

function createTween( value, prop, animation ) {
  var tween,
    collection = ( tweeners[ prop ] || [] ).concat( tweeners[ "*" ] ),
    index = 0,
    length = collection.length;
  for ( ; index < length; index++ ) {
    if ( (tween = collection[ index ].call( animation, prop, value )) ) {

      // we're done with this property
      return tween;
    }
  }
}

function Animation( elem, properties, options ) {
  var result,
    stopped,
    index = 0,
    length = animationPrefilters.length,
    deferred = jQuery.Deferred().always( function() {
      // don't match elem in the :animated selector
      delete tick.elem;
    }),
    tick = function() {
      if ( stopped ) {
        return false;
      }
      var currentTime = fxNow || createFxNow(),
        remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),
        // archaic crash bug won't allow us to use 1 - ( 0.5 || 0 ) (#12497)
        temp = remaining / animation.duration || 0,
        percent = 1 - temp,
        index = 0,
        length = animation.tweens.length;

      for ( ; index < length ; index++ ) {
        animation.tweens[ index ].run( percent );
      }

      deferred.notifyWith( elem, [ animation, percent, remaining ]);

      if ( percent < 1 && length ) {
        return remaining;
      } else {
        deferred.resolveWith( elem, [ animation ] );
        return false;
      }
    },
    animation = deferred.promise({
      elem: elem,
      props: jQuery.extend( {}, properties ),
      opts: jQuery.extend( true, { specialEasing: {} }, options ),
      originalProperties: properties,
      originalOptions: options,
      startTime: fxNow || createFxNow(),
      duration: options.duration,
      tweens: [],
      createTween: function( prop, end ) {
        var tween = jQuery.Tween( elem, animation.opts, prop, end,
            animation.opts.specialEasing[ prop ] || animation.opts.easing );
        animation.tweens.push( tween );
        return tween;
      },
      stop: function( gotoEnd ) {
        var index = 0,
          // if we are going to the end, we want to run all the tweens
          // otherwise we skip this part
          length = gotoEnd ? animation.tweens.length : 0;
        if ( stopped ) {
          return this;
        }
        stopped = true;
        for ( ; index < length ; index++ ) {
          animation.tweens[ index ].run( 1 );
        }

        // resolve when we played the last frame
        // otherwise, reject
        if ( gotoEnd ) {
          deferred.resolveWith( elem, [ animation, gotoEnd ] );
        } else {
          deferred.rejectWith( elem, [ animation, gotoEnd ] );
        }
        return this;
      }
    }),
    props = animation.props;

  propFilter( props, animation.opts.specialEasing );

  for ( ; index < length ; index++ ) {
    result = animationPrefilters[ index ].call( animation, elem, props, animation.opts );
    if ( result ) {
      return result;
    }
  }

  jQuery.map( props, createTween, animation );

  if ( jQuery.isFunction( animation.opts.start ) ) {
    animation.opts.start.call( elem, animation );
  }

  jQuery.fx.timer(
    jQuery.extend( tick, {
      elem: elem,
      anim: animation,
      queue: animation.opts.queue
    })
  );

  // attach callbacks from options
  return animation.progress( animation.opts.progress )
    .done( animation.opts.done, animation.opts.complete )
    .fail( animation.opts.fail )
    .always( animation.opts.always );
}

function propFilter( props, specialEasing ) {
  var index, name, easing, value, hooks;

  // camelCase, specialEasing and expand cssHook pass
  for ( index in props ) {
    name = jQuery.camelCase( index );
    easing = specialEasing[ name ];
    value = props[ index ];
    if ( jQuery.isArray( value ) ) {
      easing = value[ 1 ];
      value = props[ index ] = value[ 0 ];
    }

    if ( index !== name ) {
      props[ name ] = value;
      delete props[ index ];
    }

    hooks = jQuery.cssHooks[ name ];
    if ( hooks && "expand" in hooks ) {
      value = hooks.expand( value );
      delete props[ name ];

      // not quite $.extend, this wont overwrite keys already present.
      // also - reusing 'index' from above because we have the correct "name"
      for ( index in value ) {
        if ( !( index in props ) ) {
          props[ index ] = value[ index ];
          specialEasing[ index ] = easing;
        }
      }
    } else {
      specialEasing[ name ] = easing;
    }
  }
}

jQuery.Animation = jQuery.extend( Animation, {

  tweener: function( props, callback ) {
    if ( jQuery.isFunction( props ) ) {
      callback = props;
      props = [ "*" ];
    } else {
      props = props.split(" ");
    }

    var prop,
      index = 0,
      length = props.length;

    for ( ; index < length ; index++ ) {
      prop = props[ index ];
      tweeners[ prop ] = tweeners[ prop ] || [];
      tweeners[ prop ].unshift( callback );
    }
  },

  prefilter: function( callback, prepend ) {
    if ( prepend ) {
      animationPrefilters.unshift( callback );
    } else {
      animationPrefilters.push( callback );
    }
  }
});

function defaultPrefilter( elem, props, opts ) {
  /* jshint validthis: true */
  var prop, value, toggle, tween, hooks, oldfire,
    anim = this,
    orig = {},
    style = elem.style,
    hidden = elem.nodeType && isHidden( elem ),
    dataShow = jQuery._data( elem, "fxshow" );

  // handle queue: false promises
  if ( !opts.queue ) {
    hooks = jQuery._queueHooks( elem, "fx" );
    if ( hooks.unqueued == null ) {
      hooks.unqueued = 0;
      oldfire = hooks.empty.fire;
      hooks.empty.fire = function() {
        if ( !hooks.unqueued ) {
          oldfire();
        }
      };
    }
    hooks.unqueued++;

    anim.always(function() {
      // doing this makes sure that the complete handler will be called
      // before this completes
      anim.always(function() {
        hooks.unqueued--;
        if ( !jQuery.queue( elem, "fx" ).length ) {
          hooks.empty.fire();
        }
      });
    });
  }

  // height/width overflow pass
  if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {
    // Make sure that nothing sneaks out
    // Record all 3 overflow attributes because IE does not
    // change the overflow attribute when overflowX and
    // overflowY are set to the same value
    opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

    // Set display property to inline-block for height/width
    // animations on inline elements that are having width/height animated
    if ( jQuery.css( elem, "display" ) === "inline" &&
        jQuery.css( elem, "float" ) === "none" ) {

      // inline-level elements accept inline-block;
      // block-level elements need to be inline with layout
      if ( !jQuery.support.inlineBlockNeedsLayout || css_defaultDisplay( elem.nodeName ) === "inline" ) {
        style.display = "inline-block";

      } else {
        style.zoom = 1;
      }
    }
  }

  if ( opts.overflow ) {
    style.overflow = "hidden";
    if ( !jQuery.support.shrinkWrapBlocks ) {
      anim.always(function() {
        style.overflow = opts.overflow[ 0 ];
        style.overflowX = opts.overflow[ 1 ];
        style.overflowY = opts.overflow[ 2 ];
      });
    }
  }


  // show/hide pass
  for ( prop in props ) {
    value = props[ prop ];
    if ( rfxtypes.exec( value ) ) {
      delete props[ prop ];
      toggle = toggle || value === "toggle";
      if ( value === ( hidden ? "hide" : "show" ) ) {
        continue;
      }
      orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );
    }
  }

  if ( !jQuery.isEmptyObject( orig ) ) {
    if ( dataShow ) {
      if ( "hidden" in dataShow ) {
        hidden = dataShow.hidden;
      }
    } else {
      dataShow = jQuery._data( elem, "fxshow", {} );
    }

    // store state if its toggle - enables .stop().toggle() to "reverse"
    if ( toggle ) {
      dataShow.hidden = !hidden;
    }
    if ( hidden ) {
      jQuery( elem ).show();
    } else {
      anim.done(function() {
        jQuery( elem ).hide();
      });
    }
    anim.done(function() {
      var prop;
      jQuery._removeData( elem, "fxshow" );
      for ( prop in orig ) {
        jQuery.style( elem, prop, orig[ prop ] );
      }
    });
    for ( prop in orig ) {
      tween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );

      if ( !( prop in dataShow ) ) {
        dataShow[ prop ] = tween.start;
        if ( hidden ) {
          tween.end = tween.start;
          tween.start = prop === "width" || prop === "height" ? 1 : 0;
        }
      }
    }
  }
}

function Tween( elem, options, prop, end, easing ) {
  return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
  constructor: Tween,
  init: function( elem, options, prop, end, easing, unit ) {
    this.elem = elem;
    this.prop = prop;
    this.easing = easing || "swing";
    this.options = options;
    this.start = this.now = this.cur();
    this.end = end;
    this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
  },
  cur: function() {
    var hooks = Tween.propHooks[ this.prop ];

    return hooks && hooks.get ?
      hooks.get( this ) :
      Tween.propHooks._default.get( this );
  },
  run: function( percent ) {
    var eased,
      hooks = Tween.propHooks[ this.prop ];

    if ( this.options.duration ) {
      this.pos = eased = jQuery.easing[ this.easing ](
        percent, this.options.duration * percent, 0, 1, this.options.duration
      );
    } else {
      this.pos = eased = percent;
    }
    this.now = ( this.end - this.start ) * eased + this.start;

    if ( this.options.step ) {
      this.options.step.call( this.elem, this.now, this );
    }

    if ( hooks && hooks.set ) {
      hooks.set( this );
    } else {
      Tween.propHooks._default.set( this );
    }
    return this;
  }
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
  _default: {
    get: function( tween ) {
      var result;

      if ( tween.elem[ tween.prop ] != null &&
        (!tween.elem.style || tween.elem.style[ tween.prop ] == null) ) {
        return tween.elem[ tween.prop ];
      }

      // passing an empty string as a 3rd parameter to .css will automatically
      // attempt a parseFloat and fallback to a string if the parse fails
      // so, simple values such as "10px" are parsed to Float.
      // complex values such as "rotate(1rad)" are returned as is.
      result = jQuery.css( tween.elem, tween.prop, "" );
      // Empty strings, null, undefined and "auto" are converted to 0.
      return !result || result === "auto" ? 0 : result;
    },
    set: function( tween ) {
      // use step hook for back compat - use cssHook if its there - use .style if its
      // available and use plain properties where available
      if ( jQuery.fx.step[ tween.prop ] ) {
        jQuery.fx.step[ tween.prop ]( tween );
      } else if ( tween.elem.style && ( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null || jQuery.cssHooks[ tween.prop ] ) ) {
        jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
      } else {
        tween.elem[ tween.prop ] = tween.now;
      }
    }
  }
};

// Support: IE <=9
// Panic based approach to setting things on disconnected nodes

Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
  set: function( tween ) {
    if ( tween.elem.nodeType && tween.elem.parentNode ) {
      tween.elem[ tween.prop ] = tween.now;
    }
  }
};

jQuery.each([ "toggle", "show", "hide" ], function( i, name ) {
  var cssFn = jQuery.fn[ name ];
  jQuery.fn[ name ] = function( speed, easing, callback ) {
    return speed == null || typeof speed === "boolean" ?
      cssFn.apply( this, arguments ) :
      this.animate( genFx( name, true ), speed, easing, callback );
  };
});

jQuery.fn.extend({
  fadeTo: function( speed, to, easing, callback ) {

    // show any hidden elements after setting opacity to 0
    return this.filter( isHidden ).css( "opacity", 0 ).show()

      // animate to the value specified
      .end().animate({ opacity: to }, speed, easing, callback );
  },
  animate: function( prop, speed, easing, callback ) {
    var empty = jQuery.isEmptyObject( prop ),
      optall = jQuery.speed( speed, easing, callback ),
      doAnimation = function() {
        // Operate on a copy of prop so per-property easing won't be lost
        var anim = Animation( this, jQuery.extend( {}, prop ), optall );

        // Empty animations, or finishing resolves immediately
        if ( empty || jQuery._data( this, "finish" ) ) {
          anim.stop( true );
        }
      };
      doAnimation.finish = doAnimation;

    return empty || optall.queue === false ?
      this.each( doAnimation ) :
      this.queue( optall.queue, doAnimation );
  },
  stop: function( type, clearQueue, gotoEnd ) {
    var stopQueue = function( hooks ) {
      var stop = hooks.stop;
      delete hooks.stop;
      stop( gotoEnd );
    };

    if ( typeof type !== "string" ) {
      gotoEnd = clearQueue;
      clearQueue = type;
      type = undefined;
    }
    if ( clearQueue && type !== false ) {
      this.queue( type || "fx", [] );
    }

    return this.each(function() {
      var dequeue = true,
        index = type != null && type + "queueHooks",
        timers = jQuery.timers,
        data = jQuery._data( this );

      if ( index ) {
        if ( data[ index ] && data[ index ].stop ) {
          stopQueue( data[ index ] );
        }
      } else {
        for ( index in data ) {
          if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
            stopQueue( data[ index ] );
          }
        }
      }

      for ( index = timers.length; index--; ) {
        if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
          timers[ index ].anim.stop( gotoEnd );
          dequeue = false;
          timers.splice( index, 1 );
        }
      }

      // start the next in the queue if the last step wasn't forced
      // timers currently will call their complete callbacks, which will dequeue
      // but only if they were gotoEnd
      if ( dequeue || !gotoEnd ) {
        jQuery.dequeue( this, type );
      }
    });
  },
  finish: function( type ) {
    if ( type !== false ) {
      type = type || "fx";
    }
    return this.each(function() {
      var index,
        data = jQuery._data( this ),
        queue = data[ type + "queue" ],
        hooks = data[ type + "queueHooks" ],
        timers = jQuery.timers,
        length = queue ? queue.length : 0;

      // enable finishing flag on private data
      data.finish = true;

      // empty the queue first
      jQuery.queue( this, type, [] );

      if ( hooks && hooks.stop ) {
        hooks.stop.call( this, true );
      }

      // look for any active animations, and finish them
      for ( index = timers.length; index--; ) {
        if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
          timers[ index ].anim.stop( true );
          timers.splice( index, 1 );
        }
      }

      // look for any animations in the old queue and finish them
      for ( index = 0; index < length; index++ ) {
        if ( queue[ index ] && queue[ index ].finish ) {
          queue[ index ].finish.call( this );
        }
      }

      // turn off finishing flag
      delete data.finish;
    });
  }
});

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
  var which,
    attrs = { height: type },
    i = 0;

  // if we include width, step value is 1 to do all cssExpand values,
  // if we don't include width, step value is 2 to skip over Left and Right
  includeWidth = includeWidth? 1 : 0;
  for( ; i < 4 ; i += 2 - includeWidth ) {
    which = cssExpand[ i ];
    attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
  }

  if ( includeWidth ) {
    attrs.opacity = attrs.width = type;
  }

  return attrs;
}

// Generate shortcuts for custom animations
jQuery.each({
  slideDown: genFx("show"),
  slideUp: genFx("hide"),
  slideToggle: genFx("toggle"),
  fadeIn: { opacity: "show" },
  fadeOut: { opacity: "hide" },
  fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
  jQuery.fn[ name ] = function( speed, easing, callback ) {
    return this.animate( props, speed, easing, callback );
  };
});

jQuery.speed = function( speed, easing, fn ) {
  var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
    complete: fn || !fn && easing ||
      jQuery.isFunction( speed ) && speed,
    duration: speed,
    easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
  };

  opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
    opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

  // normalize opt.queue - true/undefined/null -> "fx"
  if ( opt.queue == null || opt.queue === true ) {
    opt.queue = "fx";
  }

  // Queueing
  opt.old = opt.complete;

  opt.complete = function() {
    if ( jQuery.isFunction( opt.old ) ) {
      opt.old.call( this );
    }

    if ( opt.queue ) {
      jQuery.dequeue( this, opt.queue );
    }
  };

  return opt;
};

jQuery.easing = {
  linear: function( p ) {
    return p;
  },
  swing: function( p ) {
    return 0.5 - Math.cos( p*Math.PI ) / 2;
  }
};

jQuery.timers = [];
jQuery.fx = Tween.prototype.init;
jQuery.fx.tick = function() {
  var timer,
    timers = jQuery.timers,
    i = 0;

  fxNow = jQuery.now();

  for ( ; i < timers.length; i++ ) {
    timer = timers[ i ];
    // Checks the timer has not already been removed
    if ( !timer() && timers[ i ] === timer ) {
      timers.splice( i--, 1 );
    }
  }

  if ( !timers.length ) {
    jQuery.fx.stop();
  }
  fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
  if ( timer() && jQuery.timers.push( timer ) ) {
    jQuery.fx.start();
  }
};

jQuery.fx.interval = 13;

jQuery.fx.start = function() {
  if ( !timerId ) {
    timerId = setInterval( jQuery.fx.tick, jQuery.fx.interval );
  }
};

jQuery.fx.stop = function() {
  clearInterval( timerId );
  timerId = null;
};

jQuery.fx.speeds = {
  slow: 600,
  fast: 200,
  // Default speed
  _default: 400
};

// Back Compat <1.8 extension point
jQuery.fx.step = {};

if ( jQuery.expr && jQuery.expr.filters ) {
  jQuery.expr.filters.animated = function( elem ) {
    return jQuery.grep(jQuery.timers, function( fn ) {
      return elem === fn.elem;
    }).length;
  };
}
jQuery.fn.offset = function( options ) {
  if ( arguments.length ) {
    return options === undefined ?
      this :
      this.each(function( i ) {
        jQuery.offset.setOffset( this, options, i );
      });
  }

  var docElem, win,
    box = { top: 0, left: 0 },
    elem = this[ 0 ],
    doc = elem && elem.ownerDocument;

  if ( !doc ) {
    return;
  }

  docElem = doc.documentElement;

  // Make sure it's not a disconnected DOM node
  if ( !jQuery.contains( docElem, elem ) ) {
    return box;
  }

  // If we don't have gBCR, just use 0,0 rather than error
  // BlackBerry 5, iOS 3 (original iPhone)
  if ( typeof elem.getBoundingClientRect !== core_strundefined ) {
    box = elem.getBoundingClientRect();
  }
  win = getWindow( doc );
  return {
    top: box.top  + ( win.pageYOffset || docElem.scrollTop )  - ( docElem.clientTop  || 0 ),
    left: box.left + ( win.pageXOffset || docElem.scrollLeft ) - ( docElem.clientLeft || 0 )
  };
};

jQuery.offset = {

  setOffset: function( elem, options, i ) {
    var position = jQuery.css( elem, "position" );

    // set position first, in-case top/left are set even on static elem
    if ( position === "static" ) {
      elem.style.position = "relative";
    }

    var curElem = jQuery( elem ),
      curOffset = curElem.offset(),
      curCSSTop = jQuery.css( elem, "top" ),
      curCSSLeft = jQuery.css( elem, "left" ),
      calculatePosition = ( position === "absolute" || position === "fixed" ) && jQuery.inArray("auto", [curCSSTop, curCSSLeft]) > -1,
      props = {}, curPosition = {}, curTop, curLeft;

    // need to be able to calculate position if either top or left is auto and position is either absolute or fixed
    if ( calculatePosition ) {
      curPosition = curElem.position();
      curTop = curPosition.top;
      curLeft = curPosition.left;
    } else {
      curTop = parseFloat( curCSSTop ) || 0;
      curLeft = parseFloat( curCSSLeft ) || 0;
    }

    if ( jQuery.isFunction( options ) ) {
      options = options.call( elem, i, curOffset );
    }

    if ( options.top != null ) {
      props.top = ( options.top - curOffset.top ) + curTop;
    }
    if ( options.left != null ) {
      props.left = ( options.left - curOffset.left ) + curLeft;
    }

    if ( "using" in options ) {
      options.using.call( elem, props );
    } else {
      curElem.css( props );
    }
  }
};


jQuery.fn.extend({

  position: function() {
    if ( !this[ 0 ] ) {
      return;
    }

    var offsetParent, offset,
      parentOffset = { top: 0, left: 0 },
      elem = this[ 0 ];

    // fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is it's only offset parent
    if ( jQuery.css( elem, "position" ) === "fixed" ) {
      // we assume that getBoundingClientRect is available when computed position is fixed
      offset = elem.getBoundingClientRect();
    } else {
      // Get *real* offsetParent
      offsetParent = this.offsetParent();

      // Get correct offsets
      offset = this.offset();
      if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
        parentOffset = offsetParent.offset();
      }

      // Add offsetParent borders
      parentOffset.top  += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
      parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
    }

    // Subtract parent offsets and element margins
    // note: when an element has margin: auto the offsetLeft and marginLeft
    // are the same in Safari causing offset.left to incorrectly be 0
    return {
      top:  offset.top  - parentOffset.top - jQuery.css( elem, "marginTop", true ),
      left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true)
    };
  },

  offsetParent: function() {
    return this.map(function() {
      var offsetParent = this.offsetParent || docElem;
      while ( offsetParent && ( !jQuery.nodeName( offsetParent, "html" ) && jQuery.css( offsetParent, "position") === "static" ) ) {
        offsetParent = offsetParent.offsetParent;
      }
      return offsetParent || docElem;
    });
  }
});


// Create scrollLeft and scrollTop methods
jQuery.each( {scrollLeft: "pageXOffset", scrollTop: "pageYOffset"}, function( method, prop ) {
  var top = /Y/.test( prop );

  jQuery.fn[ method ] = function( val ) {
    return jQuery.access( this, function( elem, method, val ) {
      var win = getWindow( elem );

      if ( val === undefined ) {
        return win ? (prop in win) ? win[ prop ] :
          win.document.documentElement[ method ] :
          elem[ method ];
      }

      if ( win ) {
        win.scrollTo(
          !top ? val : jQuery( win ).scrollLeft(),
          top ? val : jQuery( win ).scrollTop()
        );

      } else {
        elem[ method ] = val;
      }
    }, method, val, arguments.length, null );
  };
});

function getWindow( elem ) {
  return jQuery.isWindow( elem ) ?
    elem :
    elem.nodeType === 9 ?
      elem.defaultView || elem.parentWindow :
      false;
}
// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
  jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name }, function( defaultExtra, funcName ) {
    // margin is only for outerHeight, outerWidth
    jQuery.fn[ funcName ] = function( margin, value ) {
      var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
        extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

      return jQuery.access( this, function( elem, type, value ) {
        var doc;

        if ( jQuery.isWindow( elem ) ) {
          // As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
          // isn't a whole lot we can do. See pull request at this URL for discussion:
          // https://github.com/jquery/jquery/pull/764
          return elem.document.documentElement[ "client" + name ];
        }

        // Get document width or height
        if ( elem.nodeType === 9 ) {
          doc = elem.documentElement;

          // Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height], whichever is greatest
          // unfortunately, this causes bug #3838 in IE6/8 only, but there is currently no good, small way to fix it.
          return Math.max(
            elem.body[ "scroll" + name ], doc[ "scroll" + name ],
            elem.body[ "offset" + name ], doc[ "offset" + name ],
            doc[ "client" + name ]
          );
        }

        return value === undefined ?
          // Get width or height on the element, requesting but not forcing parseFloat
          jQuery.css( elem, type, extra ) :

          // Set width or height on the element
          jQuery.style( elem, type, value, extra );
      }, type, chainable ? margin : undefined, chainable, null );
    };
  });
});
// Limit scope pollution from any deprecated API
// (function() {

// The number of elements contained in the matched element set
jQuery.fn.size = function() {
  return this.length;
};

jQuery.fn.andSelf = jQuery.fn.addBack;

// })();
if ( typeof module === "object" && module && typeof module.exports === "object" ) {
  // Expose jQuery as module.exports in loaders that implement the Node
  // module pattern (including browserify). Do not create the global, since
  // the user will be storing it themselves locally, and globals are frowned
  // upon in the Node module world.
  module.exports = jQuery;
} else {
  // Otherwise expose jQuery to the global object as usual
  window.jQuery = window.$ = jQuery;

  // Register as a named AMD module, since jQuery can be concatenated with other
  // files that may use define, but not via a proper concatenation script that
  // understands anonymous AMD modules. A named AMD is safest and most robust
  // way to register. Lowercase jquery is used because AMD module names are
  // derived from file names, and jQuery is normally delivered in a lowercase
  // file name. Do this after creating the global so that if an AMD module wants
  // to call noConflict to hide this version of jQuery, it will work.
  if ( typeof define === "function" && define.amd ) {
    define( "jquery", [], function () { return jQuery; } );
  }
}

})( window );
},{}],"jQuery":[function(require,module,exports){
module.exports=require('yMbvdo');
},{}],"sdUDu8":[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};(function browserifyShim(module, define) {

; global.jQuery = require("jQuery");
/**
 * Copyright (c) 2007-2013 Ariel Flesler - aflesler<a>gmail<d>com | http://flesler.blogspot.com
 * Dual licensed under MIT and GPL.
 * @author Ariel Flesler
 * @version 1.4.5
 */
;(function($){var h=$.scrollTo=function(a,b,c){$(window).scrollTo(a,b,c)};h.defaults={axis:'xy',duration:parseFloat($.fn.jquery)>=1.3?0:1,limit:true};h.window=function(a){return $(window)._scrollable()};$.fn._scrollable=function(){return this.map(function(){var a=this,isWin=!a.nodeName||$.inArray(a.nodeName.toLowerCase(),['iframe','#document','html','body'])!=-1;if(!isWin)return a;var b=(a.contentWindow||a).document||a.ownerDocument||a;return/webkit/i.test(navigator.userAgent)||b.compatMode=='BackCompat'?b.body:b.documentElement})};$.fn.scrollTo=function(e,f,g){if(typeof f=='object'){g=f;f=0}if(typeof g=='function')g={onAfter:g};if(e=='max')e=9e9;g=$.extend({},h.defaults,g);f=f||g.duration;g.queue=g.queue&&g.axis.length>1;if(g.queue)f/=2;g.offset=both(g.offset);g.over=both(g.over);return this._scrollable().each(function(){if(e==null)return;var d=this,$elem=$(d),targ=e,toff,attr={},win=$elem.is('html,body');switch(typeof targ){case'number':case'string':if(/^([+-]=?)?\d+(\.\d+)?(px|%)?$/.test(targ)){targ=both(targ);break}targ=$(targ,this);if(!targ.length)return;case'object':if(targ.is||targ.style)toff=(targ=$(targ)).offset()}$.each(g.axis.split(''),function(i,a){var b=a=='x'?'Left':'Top',pos=b.toLowerCase(),key='scroll'+b,old=d[key],max=h.max(d,a);if(toff){attr[key]=toff[pos]+(win?0:old-$elem.offset()[pos]);if(g.margin){attr[key]-=parseInt(targ.css('margin'+b))||0;attr[key]-=parseInt(targ.css('border'+b+'Width'))||0}attr[key]+=g.offset[pos]||0;if(g.over[pos])attr[key]+=targ[a=='x'?'width':'height']()*g.over[pos]}else{var c=targ[pos];attr[key]=c.slice&&c.slice(-1)=='%'?parseFloat(c)/100*max:c}if(g.limit&&/^\d+$/.test(attr[key]))attr[key]=attr[key]<=0?0:Math.min(attr[key],max);if(!i&&g.queue){if(old!=attr[key])animate(g.onAfterFirst);delete attr[key]}});animate(g.onAfter);function animate(a){$elem.animate(attr,f,g.easing,a&&function(){a.call(this,e,g)})}}).end()};h.max=function(a,b){var c=b=='x'?'Width':'Height',scroll='scroll'+c;if(!$(a).is('html,body'))return a[scroll]-$(a)[c.toLowerCase()]();var d='client'+c,html=a.ownerDocument.documentElement,body=a.ownerDocument.body;return Math.max(html[scroll],body[scroll])-Math.min(html[d],body[d])};function both(a){return typeof a=='object'?a:{top:a,left:a}}})(jQuery);
}).call(global, module, undefined);

},{"jQuery":"yMbvdo"}],"jQueryScrollTo":[function(require,module,exports){
module.exports=require('sdUDu8');
},{}],7:[function(require,module,exports){
/**
  @fileoverview entry point for vendor libraries
**/

'use strict';

require('bootstrap');

},{"bootstrap":"K5SPyQ"}]},{},[7])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvdmFzc2lsaXMvU2l0ZXMvQVNRLVVTSS9BU1EvY2xpZW50L2pzL3ZlbmRvci9ib290c3RyYXAuanMiLCIvVXNlcnMvdmFzc2lsaXMvU2l0ZXMvQVNRLVVTSS9BU1EvY2xpZW50L2pzL3ZlbmRvci9qcXVlcnktMS4xMC4yLmpzIiwiL1VzZXJzL3Zhc3NpbGlzL1NpdGVzL0FTUS1VU0kvQVNRL2NsaWVudC9qcy92ZW5kb3IvanF1ZXJ5LnNjcm9sbFRvLmpzIiwiL1VzZXJzL3Zhc3NpbGlzL1NpdGVzL0FTUS1VU0kvQVNRL2NsaWVudC9qcy92ZW5kb3IvdmVuZG9yLWVudHJ5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3A5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDNWpUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGdsb2JhbD10eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge307KGZ1bmN0aW9uIGJyb3dzZXJpZnlTaGltKG1vZHVsZSwgZGVmaW5lKSB7XG5cbjsgZ2xvYmFsLmpRdWVyeSA9IHJlcXVpcmUoXCJqUXVlcnlcIik7XG4vKipcbiogYm9vdHN0cmFwLmpzIHYzLjAuMCBieSBAZmF0IGFuZCBAbWRvXG4qIENvcHlyaWdodCAyMDEzIFR3aXR0ZXIgSW5jLlxuKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiovXG5pZiAoIWpRdWVyeSkgeyB0aHJvdyBuZXcgRXJyb3IoXCJCb290c3RyYXAgcmVxdWlyZXMgalF1ZXJ5XCIpIH1cblxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBCb290c3RyYXA6IHRyYW5zaXRpb24uanMgdjMuMC4wXG4gKiBodHRwOi8vdHdicy5naXRodWIuY29tL2Jvb3RzdHJhcC9qYXZhc2NyaXB0Lmh0bWwjdHJhbnNpdGlvbnNcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQ29weXJpZ2h0IDIwMTMgVHdpdHRlciwgSW5jLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cblxuK2Z1bmN0aW9uICgkKSB7IFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIENTUyBUUkFOU0lUSU9OIFNVUFBPUlQgKFNob3V0b3V0OiBodHRwOi8vd3d3Lm1vZGVybml6ci5jb20vKVxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICBmdW5jdGlvbiB0cmFuc2l0aW9uRW5kKCkge1xuICAgIHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2Jvb3RzdHJhcCcpXG5cbiAgICB2YXIgdHJhbnNFbmRFdmVudE5hbWVzID0ge1xuICAgICAgJ1dlYmtpdFRyYW5zaXRpb24nIDogJ3dlYmtpdFRyYW5zaXRpb25FbmQnXG4gICAgLCAnTW96VHJhbnNpdGlvbicgICAgOiAndHJhbnNpdGlvbmVuZCdcbiAgICAsICdPVHJhbnNpdGlvbicgICAgICA6ICdvVHJhbnNpdGlvbkVuZCBvdHJhbnNpdGlvbmVuZCdcbiAgICAsICd0cmFuc2l0aW9uJyAgICAgICA6ICd0cmFuc2l0aW9uZW5kJ1xuICAgIH1cblxuICAgIGZvciAodmFyIG5hbWUgaW4gdHJhbnNFbmRFdmVudE5hbWVzKSB7XG4gICAgICBpZiAoZWwuc3R5bGVbbmFtZV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4geyBlbmQ6IHRyYW5zRW5kRXZlbnROYW1lc1tuYW1lXSB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gaHR0cDovL2Jsb2cuYWxleG1hY2Nhdy5jb20vY3NzLXRyYW5zaXRpb25zXG4gICQuZm4uZW11bGF0ZVRyYW5zaXRpb25FbmQgPSBmdW5jdGlvbiAoZHVyYXRpb24pIHtcbiAgICB2YXIgY2FsbGVkID0gZmFsc2UsICRlbCA9IHRoaXNcbiAgICAkKHRoaXMpLm9uZSgkLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQsIGZ1bmN0aW9uICgpIHsgY2FsbGVkID0gdHJ1ZSB9KVxuICAgIHZhciBjYWxsYmFjayA9IGZ1bmN0aW9uICgpIHsgaWYgKCFjYWxsZWQpICQoJGVsKS50cmlnZ2VyKCQuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCkgfVxuICAgIHNldFRpbWVvdXQoY2FsbGJhY2ssIGR1cmF0aW9uKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAkKGZ1bmN0aW9uICgpIHtcbiAgICAkLnN1cHBvcnQudHJhbnNpdGlvbiA9IHRyYW5zaXRpb25FbmQoKVxuICB9KVxuXG59KHdpbmRvdy5qUXVlcnkpO1xuXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEJvb3RzdHJhcDogYWxlcnQuanMgdjMuMC4wXG4gKiBodHRwOi8vdHdicy5naXRodWIuY29tL2Jvb3RzdHJhcC9qYXZhc2NyaXB0Lmh0bWwjYWxlcnRzXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIENvcHlyaWdodCAyMDEzIFR3aXR0ZXIsIEluYy5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG5cbitmdW5jdGlvbiAoJCkgeyBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBBTEVSVCBDTEFTUyBERUZJTklUSU9OXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT1cblxuICB2YXIgZGlzbWlzcyA9ICdbZGF0YS1kaXNtaXNzPVwiYWxlcnRcIl0nXG4gIHZhciBBbGVydCAgID0gZnVuY3Rpb24gKGVsKSB7XG4gICAgJChlbCkub24oJ2NsaWNrJywgZGlzbWlzcywgdGhpcy5jbG9zZSlcbiAgfVxuXG4gIEFsZXJ0LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uIChlKSB7XG4gICAgdmFyICR0aGlzICAgID0gJCh0aGlzKVxuICAgIHZhciBzZWxlY3RvciA9ICR0aGlzLmF0dHIoJ2RhdGEtdGFyZ2V0JylcblxuICAgIGlmICghc2VsZWN0b3IpIHtcbiAgICAgIHNlbGVjdG9yID0gJHRoaXMuYXR0cignaHJlZicpXG4gICAgICBzZWxlY3RvciA9IHNlbGVjdG9yICYmIHNlbGVjdG9yLnJlcGxhY2UoLy4qKD89I1teXFxzXSokKS8sICcnKSAvLyBzdHJpcCBmb3IgaWU3XG4gICAgfVxuXG4gICAgdmFyICRwYXJlbnQgPSAkKHNlbGVjdG9yKVxuXG4gICAgaWYgKGUpIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgaWYgKCEkcGFyZW50Lmxlbmd0aCkge1xuICAgICAgJHBhcmVudCA9ICR0aGlzLmhhc0NsYXNzKCdhbGVydCcpID8gJHRoaXMgOiAkdGhpcy5wYXJlbnQoKVxuICAgIH1cblxuICAgICRwYXJlbnQudHJpZ2dlcihlID0gJC5FdmVudCgnY2xvc2UuYnMuYWxlcnQnKSlcblxuICAgIGlmIChlLmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm5cblxuICAgICRwYXJlbnQucmVtb3ZlQ2xhc3MoJ2luJylcblxuICAgIGZ1bmN0aW9uIHJlbW92ZUVsZW1lbnQoKSB7XG4gICAgICAkcGFyZW50LnRyaWdnZXIoJ2Nsb3NlZC5icy5hbGVydCcpLnJlbW92ZSgpXG4gICAgfVxuXG4gICAgJC5zdXBwb3J0LnRyYW5zaXRpb24gJiYgJHBhcmVudC5oYXNDbGFzcygnZmFkZScpID9cbiAgICAgICRwYXJlbnRcbiAgICAgICAgLm9uZSgkLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQsIHJlbW92ZUVsZW1lbnQpXG4gICAgICAgIC5lbXVsYXRlVHJhbnNpdGlvbkVuZCgxNTApIDpcbiAgICAgIHJlbW92ZUVsZW1lbnQoKVxuICB9XG5cblxuICAvLyBBTEVSVCBQTFVHSU4gREVGSU5JVElPTlxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIHZhciBvbGQgPSAkLmZuLmFsZXJ0XG5cbiAgJC5mbi5hbGVydCA9IGZ1bmN0aW9uIChvcHRpb24pIHtcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcylcbiAgICAgIHZhciBkYXRhICA9ICR0aGlzLmRhdGEoJ2JzLmFsZXJ0JylcblxuICAgICAgaWYgKCFkYXRhKSAkdGhpcy5kYXRhKCdicy5hbGVydCcsIChkYXRhID0gbmV3IEFsZXJ0KHRoaXMpKSlcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09ICdzdHJpbmcnKSBkYXRhW29wdGlvbl0uY2FsbCgkdGhpcylcbiAgICB9KVxuICB9XG5cbiAgJC5mbi5hbGVydC5Db25zdHJ1Y3RvciA9IEFsZXJ0XG5cblxuICAvLyBBTEVSVCBOTyBDT05GTElDVFxuICAvLyA9PT09PT09PT09PT09PT09PVxuXG4gICQuZm4uYWxlcnQubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAkLmZuLmFsZXJ0ID0gb2xkXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG5cbiAgLy8gQUxFUlQgREFUQS1BUElcbiAgLy8gPT09PT09PT09PT09PT1cblxuICAkKGRvY3VtZW50KS5vbignY2xpY2suYnMuYWxlcnQuZGF0YS1hcGknLCBkaXNtaXNzLCBBbGVydC5wcm90b3R5cGUuY2xvc2UpXG5cbn0od2luZG93LmpRdWVyeSk7XG5cbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQm9vdHN0cmFwOiBidXR0b24uanMgdjMuMC4wXG4gKiBodHRwOi8vdHdicy5naXRodWIuY29tL2Jvb3RzdHJhcC9qYXZhc2NyaXB0Lmh0bWwjYnV0dG9uc1xuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBDb3B5cmlnaHQgMjAxMyBUd2l0dGVyLCBJbmMuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuXG4rZnVuY3Rpb24gKCQpIHsgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgLy8gQlVUVE9OIFBVQkxJQyBDTEFTUyBERUZJTklUSU9OXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIHZhciBCdXR0b24gPSBmdW5jdGlvbiAoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuJGVsZW1lbnQgPSAkKGVsZW1lbnQpXG4gICAgdGhpcy5vcHRpb25zICA9ICQuZXh0ZW5kKHt9LCBCdXR0b24uREVGQVVMVFMsIG9wdGlvbnMpXG4gIH1cblxuICBCdXR0b24uREVGQVVMVFMgPSB7XG4gICAgbG9hZGluZ1RleHQ6ICdsb2FkaW5nLi4uJ1xuICB9XG5cbiAgQnV0dG9uLnByb3RvdHlwZS5zZXRTdGF0ZSA9IGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgIHZhciBkICAgID0gJ2Rpc2FibGVkJ1xuICAgIHZhciAkZWwgID0gdGhpcy4kZWxlbWVudFxuICAgIHZhciB2YWwgID0gJGVsLmlzKCdpbnB1dCcpID8gJ3ZhbCcgOiAnaHRtbCdcbiAgICB2YXIgZGF0YSA9ICRlbC5kYXRhKClcblxuICAgIHN0YXRlID0gc3RhdGUgKyAnVGV4dCdcblxuICAgIGlmICghZGF0YS5yZXNldFRleHQpICRlbC5kYXRhKCdyZXNldFRleHQnLCAkZWxbdmFsXSgpKVxuXG4gICAgJGVsW3ZhbF0oZGF0YVtzdGF0ZV0gfHwgdGhpcy5vcHRpb25zW3N0YXRlXSlcblxuICAgIC8vIHB1c2ggdG8gZXZlbnQgbG9vcCB0byBhbGxvdyBmb3JtcyB0byBzdWJtaXRcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIHN0YXRlID09ICdsb2FkaW5nVGV4dCcgP1xuICAgICAgICAkZWwuYWRkQ2xhc3MoZCkuYXR0cihkLCBkKSA6XG4gICAgICAgICRlbC5yZW1vdmVDbGFzcyhkKS5yZW1vdmVBdHRyKGQpO1xuICAgIH0sIDApXG4gIH1cblxuICBCdXR0b24ucHJvdG90eXBlLnRvZ2dsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgJHBhcmVudCA9IHRoaXMuJGVsZW1lbnQuY2xvc2VzdCgnW2RhdGEtdG9nZ2xlPVwiYnV0dG9uc1wiXScpXG5cbiAgICBpZiAoJHBhcmVudC5sZW5ndGgpIHtcbiAgICAgIHZhciAkaW5wdXQgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ2lucHV0JylcbiAgICAgICAgLnByb3AoJ2NoZWNrZWQnLCAhdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnYWN0aXZlJykpXG4gICAgICAgIC50cmlnZ2VyKCdjaGFuZ2UnKVxuICAgICAgaWYgKCRpbnB1dC5wcm9wKCd0eXBlJykgPT09ICdyYWRpbycpICRwYXJlbnQuZmluZCgnLmFjdGl2ZScpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxuICAgIH1cblxuICAgIHRoaXMuJGVsZW1lbnQudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScpXG4gIH1cblxuXG4gIC8vIEJVVFRPTiBQTFVHSU4gREVGSU5JVElPTlxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT1cblxuICB2YXIgb2xkID0gJC5mbi5idXR0b25cblxuICAkLmZuLmJ1dHRvbiA9IGZ1bmN0aW9uIChvcHRpb24pIHtcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciAkdGhpcyAgID0gJCh0aGlzKVxuICAgICAgdmFyIGRhdGEgICAgPSAkdGhpcy5kYXRhKCdicy5idXR0b24nKVxuICAgICAgdmFyIG9wdGlvbnMgPSB0eXBlb2Ygb3B0aW9uID09ICdvYmplY3QnICYmIG9wdGlvblxuXG4gICAgICBpZiAoIWRhdGEpICR0aGlzLmRhdGEoJ2JzLmJ1dHRvbicsIChkYXRhID0gbmV3IEJ1dHRvbih0aGlzLCBvcHRpb25zKSkpXG5cbiAgICAgIGlmIChvcHRpb24gPT0gJ3RvZ2dsZScpIGRhdGEudG9nZ2xlKClcbiAgICAgIGVsc2UgaWYgKG9wdGlvbikgZGF0YS5zZXRTdGF0ZShvcHRpb24pXG4gICAgfSlcbiAgfVxuXG4gICQuZm4uYnV0dG9uLkNvbnN0cnVjdG9yID0gQnV0dG9uXG5cblxuICAvLyBCVVRUT04gTk8gQ09ORkxJQ1RcbiAgLy8gPT09PT09PT09PT09PT09PT09XG5cbiAgJC5mbi5idXR0b24ubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAkLmZuLmJ1dHRvbiA9IG9sZFxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuXG4gIC8vIEJVVFRPTiBEQVRBLUFQSVxuICAvLyA9PT09PT09PT09PT09PT1cblxuICAkKGRvY3VtZW50KS5vbignY2xpY2suYnMuYnV0dG9uLmRhdGEtYXBpJywgJ1tkYXRhLXRvZ2dsZV49YnV0dG9uXScsIGZ1bmN0aW9uIChlKSB7XG4gICAgdmFyICRidG4gPSAkKGUudGFyZ2V0KVxuICAgIGlmICghJGJ0bi5oYXNDbGFzcygnYnRuJykpICRidG4gPSAkYnRuLmNsb3Nlc3QoJy5idG4nKVxuICAgICRidG4uYnV0dG9uKCd0b2dnbGUnKVxuICAgIGUucHJldmVudERlZmF1bHQoKVxuICB9KVxuXG59KHdpbmRvdy5qUXVlcnkpO1xuXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEJvb3RzdHJhcDogY2Fyb3VzZWwuanMgdjMuMC4wXG4gKiBodHRwOi8vdHdicy5naXRodWIuY29tL2Jvb3RzdHJhcC9qYXZhc2NyaXB0Lmh0bWwjY2Fyb3VzZWxcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQ29weXJpZ2h0IDIwMTIgVHdpdHRlciwgSW5jLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cblxuK2Z1bmN0aW9uICgkKSB7IFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIENBUk9VU0VMIENMQVNTIERFRklOSVRJT05cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIHZhciBDYXJvdXNlbCA9IGZ1bmN0aW9uIChlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy4kZWxlbWVudCAgICA9ICQoZWxlbWVudClcbiAgICB0aGlzLiRpbmRpY2F0b3JzID0gdGhpcy4kZWxlbWVudC5maW5kKCcuY2Fyb3VzZWwtaW5kaWNhdG9ycycpXG4gICAgdGhpcy5vcHRpb25zICAgICA9IG9wdGlvbnNcbiAgICB0aGlzLnBhdXNlZCAgICAgID1cbiAgICB0aGlzLnNsaWRpbmcgICAgID1cbiAgICB0aGlzLmludGVydmFsICAgID1cbiAgICB0aGlzLiRhY3RpdmUgICAgID1cbiAgICB0aGlzLiRpdGVtcyAgICAgID0gbnVsbFxuXG4gICAgdGhpcy5vcHRpb25zLnBhdXNlID09ICdob3ZlcicgJiYgdGhpcy4kZWxlbWVudFxuICAgICAgLm9uKCdtb3VzZWVudGVyJywgJC5wcm94eSh0aGlzLnBhdXNlLCB0aGlzKSlcbiAgICAgIC5vbignbW91c2VsZWF2ZScsICQucHJveHkodGhpcy5jeWNsZSwgdGhpcykpXG4gIH1cblxuICBDYXJvdXNlbC5ERUZBVUxUUyA9IHtcbiAgICBpbnRlcnZhbDogNTAwMFxuICAsIHBhdXNlOiAnaG92ZXInXG4gICwgd3JhcDogdHJ1ZVxuICB9XG5cbiAgQ2Fyb3VzZWwucHJvdG90eXBlLmN5Y2xlID0gIGZ1bmN0aW9uIChlKSB7XG4gICAgZSB8fCAodGhpcy5wYXVzZWQgPSBmYWxzZSlcblxuICAgIHRoaXMuaW50ZXJ2YWwgJiYgY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsKVxuXG4gICAgdGhpcy5vcHRpb25zLmludGVydmFsXG4gICAgICAmJiAhdGhpcy5wYXVzZWRcbiAgICAgICYmICh0aGlzLmludGVydmFsID0gc2V0SW50ZXJ2YWwoJC5wcm94eSh0aGlzLm5leHQsIHRoaXMpLCB0aGlzLm9wdGlvbnMuaW50ZXJ2YWwpKVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIENhcm91c2VsLnByb3RvdHlwZS5nZXRBY3RpdmVJbmRleCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLiRhY3RpdmUgPSB0aGlzLiRlbGVtZW50LmZpbmQoJy5pdGVtLmFjdGl2ZScpXG4gICAgdGhpcy4kaXRlbXMgID0gdGhpcy4kYWN0aXZlLnBhcmVudCgpLmNoaWxkcmVuKClcblxuICAgIHJldHVybiB0aGlzLiRpdGVtcy5pbmRleCh0aGlzLiRhY3RpdmUpXG4gIH1cblxuICBDYXJvdXNlbC5wcm90b3R5cGUudG8gPSBmdW5jdGlvbiAocG9zKSB7XG4gICAgdmFyIHRoYXQgICAgICAgID0gdGhpc1xuICAgIHZhciBhY3RpdmVJbmRleCA9IHRoaXMuZ2V0QWN0aXZlSW5kZXgoKVxuXG4gICAgaWYgKHBvcyA+ICh0aGlzLiRpdGVtcy5sZW5ndGggLSAxKSB8fCBwb3MgPCAwKSByZXR1cm5cblxuICAgIGlmICh0aGlzLnNsaWRpbmcpICAgICAgIHJldHVybiB0aGlzLiRlbGVtZW50Lm9uZSgnc2xpZCcsIGZ1bmN0aW9uICgpIHsgdGhhdC50byhwb3MpIH0pXG4gICAgaWYgKGFjdGl2ZUluZGV4ID09IHBvcykgcmV0dXJuIHRoaXMucGF1c2UoKS5jeWNsZSgpXG5cbiAgICByZXR1cm4gdGhpcy5zbGlkZShwb3MgPiBhY3RpdmVJbmRleCA/ICduZXh0JyA6ICdwcmV2JywgJCh0aGlzLiRpdGVtc1twb3NdKSlcbiAgfVxuXG4gIENhcm91c2VsLnByb3RvdHlwZS5wYXVzZSA9IGZ1bmN0aW9uIChlKSB7XG4gICAgZSB8fCAodGhpcy5wYXVzZWQgPSB0cnVlKVxuXG4gICAgaWYgKHRoaXMuJGVsZW1lbnQuZmluZCgnLm5leHQsIC5wcmV2JykubGVuZ3RoICYmICQuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCkge1xuICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCQuc3VwcG9ydC50cmFuc2l0aW9uLmVuZClcbiAgICAgIHRoaXMuY3ljbGUodHJ1ZSlcbiAgICB9XG5cbiAgICB0aGlzLmludGVydmFsID0gY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsKVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIENhcm91c2VsLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnNsaWRpbmcpIHJldHVyblxuICAgIHJldHVybiB0aGlzLnNsaWRlKCduZXh0JylcbiAgfVxuXG4gIENhcm91c2VsLnByb3RvdHlwZS5wcmV2ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnNsaWRpbmcpIHJldHVyblxuICAgIHJldHVybiB0aGlzLnNsaWRlKCdwcmV2JylcbiAgfVxuXG4gIENhcm91c2VsLnByb3RvdHlwZS5zbGlkZSA9IGZ1bmN0aW9uICh0eXBlLCBuZXh0KSB7XG4gICAgdmFyICRhY3RpdmUgICA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLml0ZW0uYWN0aXZlJylcbiAgICB2YXIgJG5leHQgICAgID0gbmV4dCB8fCAkYWN0aXZlW3R5cGVdKClcbiAgICB2YXIgaXNDeWNsaW5nID0gdGhpcy5pbnRlcnZhbFxuICAgIHZhciBkaXJlY3Rpb24gPSB0eXBlID09ICduZXh0JyA/ICdsZWZ0JyA6ICdyaWdodCdcbiAgICB2YXIgZmFsbGJhY2sgID0gdHlwZSA9PSAnbmV4dCcgPyAnZmlyc3QnIDogJ2xhc3QnXG4gICAgdmFyIHRoYXQgICAgICA9IHRoaXNcblxuICAgIGlmICghJG5leHQubGVuZ3RoKSB7XG4gICAgICBpZiAoIXRoaXMub3B0aW9ucy53cmFwKSByZXR1cm5cbiAgICAgICRuZXh0ID0gdGhpcy4kZWxlbWVudC5maW5kKCcuaXRlbScpW2ZhbGxiYWNrXSgpXG4gICAgfVxuXG4gICAgdGhpcy5zbGlkaW5nID0gdHJ1ZVxuXG4gICAgaXNDeWNsaW5nICYmIHRoaXMucGF1c2UoKVxuXG4gICAgdmFyIGUgPSAkLkV2ZW50KCdzbGlkZS5icy5jYXJvdXNlbCcsIHsgcmVsYXRlZFRhcmdldDogJG5leHRbMF0sIGRpcmVjdGlvbjogZGlyZWN0aW9uIH0pXG5cbiAgICBpZiAoJG5leHQuaGFzQ2xhc3MoJ2FjdGl2ZScpKSByZXR1cm5cblxuICAgIGlmICh0aGlzLiRpbmRpY2F0b3JzLmxlbmd0aCkge1xuICAgICAgdGhpcy4kaW5kaWNhdG9ycy5maW5kKCcuYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpXG4gICAgICB0aGlzLiRlbGVtZW50Lm9uZSgnc2xpZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyICRuZXh0SW5kaWNhdG9yID0gJCh0aGF0LiRpbmRpY2F0b3JzLmNoaWxkcmVuKClbdGhhdC5nZXRBY3RpdmVJbmRleCgpXSlcbiAgICAgICAgJG5leHRJbmRpY2F0b3IgJiYgJG5leHRJbmRpY2F0b3IuYWRkQ2xhc3MoJ2FjdGl2ZScpXG4gICAgICB9KVxuICAgIH1cblxuICAgIGlmICgkLnN1cHBvcnQudHJhbnNpdGlvbiAmJiB0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdzbGlkZScpKSB7XG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoZSlcbiAgICAgIGlmIChlLmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm5cbiAgICAgICRuZXh0LmFkZENsYXNzKHR5cGUpXG4gICAgICAkbmV4dFswXS5vZmZzZXRXaWR0aCAvLyBmb3JjZSByZWZsb3dcbiAgICAgICRhY3RpdmUuYWRkQ2xhc3MoZGlyZWN0aW9uKVxuICAgICAgJG5leHQuYWRkQ2xhc3MoZGlyZWN0aW9uKVxuICAgICAgJGFjdGl2ZVxuICAgICAgICAub25lKCQuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICRuZXh0LnJlbW92ZUNsYXNzKFt0eXBlLCBkaXJlY3Rpb25dLmpvaW4oJyAnKSkuYWRkQ2xhc3MoJ2FjdGl2ZScpXG4gICAgICAgICAgJGFjdGl2ZS5yZW1vdmVDbGFzcyhbJ2FjdGl2ZScsIGRpcmVjdGlvbl0uam9pbignICcpKVxuICAgICAgICAgIHRoYXQuc2xpZGluZyA9IGZhbHNlXG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IHRoYXQuJGVsZW1lbnQudHJpZ2dlcignc2xpZCcpIH0sIDApXG4gICAgICAgIH0pXG4gICAgICAgIC5lbXVsYXRlVHJhbnNpdGlvbkVuZCg2MDApXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihlKVxuICAgICAgaWYgKGUuaXNEZWZhdWx0UHJldmVudGVkKCkpIHJldHVyblxuICAgICAgJGFjdGl2ZS5yZW1vdmVDbGFzcygnYWN0aXZlJylcbiAgICAgICRuZXh0LmFkZENsYXNzKCdhY3RpdmUnKVxuICAgICAgdGhpcy5zbGlkaW5nID0gZmFsc2VcbiAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignc2xpZCcpXG4gICAgfVxuXG4gICAgaXNDeWNsaW5nICYmIHRoaXMuY3ljbGUoKVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG5cbiAgLy8gQ0FST1VTRUwgUExVR0lOIERFRklOSVRJT05cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICB2YXIgb2xkID0gJC5mbi5jYXJvdXNlbFxuXG4gICQuZm4uY2Fyb3VzZWwgPSBmdW5jdGlvbiAob3B0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgJHRoaXMgICA9ICQodGhpcylcbiAgICAgIHZhciBkYXRhICAgID0gJHRoaXMuZGF0YSgnYnMuY2Fyb3VzZWwnKVxuICAgICAgdmFyIG9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgQ2Fyb3VzZWwuREVGQVVMVFMsICR0aGlzLmRhdGEoKSwgdHlwZW9mIG9wdGlvbiA9PSAnb2JqZWN0JyAmJiBvcHRpb24pXG4gICAgICB2YXIgYWN0aW9uICA9IHR5cGVvZiBvcHRpb24gPT0gJ3N0cmluZycgPyBvcHRpb24gOiBvcHRpb25zLnNsaWRlXG5cbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgnYnMuY2Fyb3VzZWwnLCAoZGF0YSA9IG5ldyBDYXJvdXNlbCh0aGlzLCBvcHRpb25zKSkpXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PSAnbnVtYmVyJykgZGF0YS50byhvcHRpb24pXG4gICAgICBlbHNlIGlmIChhY3Rpb24pIGRhdGFbYWN0aW9uXSgpXG4gICAgICBlbHNlIGlmIChvcHRpb25zLmludGVydmFsKSBkYXRhLnBhdXNlKCkuY3ljbGUoKVxuICAgIH0pXG4gIH1cblxuICAkLmZuLmNhcm91c2VsLkNvbnN0cnVjdG9yID0gQ2Fyb3VzZWxcblxuXG4gIC8vIENBUk9VU0VMIE5PIENPTkZMSUNUXG4gIC8vID09PT09PT09PT09PT09PT09PT09XG5cbiAgJC5mbi5jYXJvdXNlbC5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICQuZm4uY2Fyb3VzZWwgPSBvbGRcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cblxuICAvLyBDQVJPVVNFTCBEQVRBLUFQSVxuICAvLyA9PT09PT09PT09PT09PT09PVxuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljay5icy5jYXJvdXNlbC5kYXRhLWFwaScsICdbZGF0YS1zbGlkZV0sIFtkYXRhLXNsaWRlLXRvXScsIGZ1bmN0aW9uIChlKSB7XG4gICAgdmFyICR0aGlzICAgPSAkKHRoaXMpLCBocmVmXG4gICAgdmFyICR0YXJnZXQgPSAkKCR0aGlzLmF0dHIoJ2RhdGEtdGFyZ2V0JykgfHwgKGhyZWYgPSAkdGhpcy5hdHRyKCdocmVmJykpICYmIGhyZWYucmVwbGFjZSgvLiooPz0jW15cXHNdKyQpLywgJycpKSAvL3N0cmlwIGZvciBpZTdcbiAgICB2YXIgb3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCAkdGFyZ2V0LmRhdGEoKSwgJHRoaXMuZGF0YSgpKVxuICAgIHZhciBzbGlkZUluZGV4ID0gJHRoaXMuYXR0cignZGF0YS1zbGlkZS10bycpXG4gICAgaWYgKHNsaWRlSW5kZXgpIG9wdGlvbnMuaW50ZXJ2YWwgPSBmYWxzZVxuXG4gICAgJHRhcmdldC5jYXJvdXNlbChvcHRpb25zKVxuXG4gICAgaWYgKHNsaWRlSW5kZXggPSAkdGhpcy5hdHRyKCdkYXRhLXNsaWRlLXRvJykpIHtcbiAgICAgICR0YXJnZXQuZGF0YSgnYnMuY2Fyb3VzZWwnKS50byhzbGlkZUluZGV4KVxuICAgIH1cblxuICAgIGUucHJldmVudERlZmF1bHQoKVxuICB9KVxuXG4gICQod2luZG93KS5vbignbG9hZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAkKCdbZGF0YS1yaWRlPVwiY2Fyb3VzZWxcIl0nKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciAkY2Fyb3VzZWwgPSAkKHRoaXMpXG4gICAgICAkY2Fyb3VzZWwuY2Fyb3VzZWwoJGNhcm91c2VsLmRhdGEoKSlcbiAgICB9KVxuICB9KVxuXG59KHdpbmRvdy5qUXVlcnkpO1xuXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEJvb3RzdHJhcDogY29sbGFwc2UuanMgdjMuMC4wXG4gKiBodHRwOi8vdHdicy5naXRodWIuY29tL2Jvb3RzdHJhcC9qYXZhc2NyaXB0Lmh0bWwjY29sbGFwc2VcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQ29weXJpZ2h0IDIwMTIgVHdpdHRlciwgSW5jLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cblxuK2Z1bmN0aW9uICgkKSB7IFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIENPTExBUFNFIFBVQkxJQyBDTEFTUyBERUZJTklUSU9OXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgdmFyIENvbGxhcHNlID0gZnVuY3Rpb24gKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLiRlbGVtZW50ICAgICAgPSAkKGVsZW1lbnQpXG4gICAgdGhpcy5vcHRpb25zICAgICAgID0gJC5leHRlbmQoe30sIENvbGxhcHNlLkRFRkFVTFRTLCBvcHRpb25zKVxuICAgIHRoaXMudHJhbnNpdGlvbmluZyA9IG51bGxcblxuICAgIGlmICh0aGlzLm9wdGlvbnMucGFyZW50KSB0aGlzLiRwYXJlbnQgPSAkKHRoaXMub3B0aW9ucy5wYXJlbnQpXG4gICAgaWYgKHRoaXMub3B0aW9ucy50b2dnbGUpIHRoaXMudG9nZ2xlKClcbiAgfVxuXG4gIENvbGxhcHNlLkRFRkFVTFRTID0ge1xuICAgIHRvZ2dsZTogdHJ1ZVxuICB9XG5cbiAgQ29sbGFwc2UucHJvdG90eXBlLmRpbWVuc2lvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaGFzV2lkdGggPSB0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCd3aWR0aCcpXG4gICAgcmV0dXJuIGhhc1dpZHRoID8gJ3dpZHRoJyA6ICdoZWlnaHQnXG4gIH1cblxuICBDb2xsYXBzZS5wcm90b3R5cGUuc2hvdyA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy50cmFuc2l0aW9uaW5nIHx8IHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2luJykpIHJldHVyblxuXG4gICAgdmFyIHN0YXJ0RXZlbnQgPSAkLkV2ZW50KCdzaG93LmJzLmNvbGxhcHNlJylcbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoc3RhcnRFdmVudClcbiAgICBpZiAoc3RhcnRFdmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuXG5cbiAgICB2YXIgYWN0aXZlcyA9IHRoaXMuJHBhcmVudCAmJiB0aGlzLiRwYXJlbnQuZmluZCgnPiAucGFuZWwgPiAuaW4nKVxuXG4gICAgaWYgKGFjdGl2ZXMgJiYgYWN0aXZlcy5sZW5ndGgpIHtcbiAgICAgIHZhciBoYXNEYXRhID0gYWN0aXZlcy5kYXRhKCdicy5jb2xsYXBzZScpXG4gICAgICBpZiAoaGFzRGF0YSAmJiBoYXNEYXRhLnRyYW5zaXRpb25pbmcpIHJldHVyblxuICAgICAgYWN0aXZlcy5jb2xsYXBzZSgnaGlkZScpXG4gICAgICBoYXNEYXRhIHx8IGFjdGl2ZXMuZGF0YSgnYnMuY29sbGFwc2UnLCBudWxsKVxuICAgIH1cblxuICAgIHZhciBkaW1lbnNpb24gPSB0aGlzLmRpbWVuc2lvbigpXG5cbiAgICB0aGlzLiRlbGVtZW50XG4gICAgICAucmVtb3ZlQ2xhc3MoJ2NvbGxhcHNlJylcbiAgICAgIC5hZGRDbGFzcygnY29sbGFwc2luZycpXG4gICAgICBbZGltZW5zaW9uXSgwKVxuXG4gICAgdGhpcy50cmFuc2l0aW9uaW5nID0gMVxuXG4gICAgdmFyIGNvbXBsZXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy4kZWxlbWVudFxuICAgICAgICAucmVtb3ZlQ2xhc3MoJ2NvbGxhcHNpbmcnKVxuICAgICAgICAuYWRkQ2xhc3MoJ2luJylcbiAgICAgICAgW2RpbWVuc2lvbl0oJ2F1dG8nKVxuICAgICAgdGhpcy50cmFuc2l0aW9uaW5nID0gMFxuICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdzaG93bi5icy5jb2xsYXBzZScpXG4gICAgfVxuXG4gICAgaWYgKCEkLnN1cHBvcnQudHJhbnNpdGlvbikgcmV0dXJuIGNvbXBsZXRlLmNhbGwodGhpcylcblxuICAgIHZhciBzY3JvbGxTaXplID0gJC5jYW1lbENhc2UoWydzY3JvbGwnLCBkaW1lbnNpb25dLmpvaW4oJy0nKSlcblxuICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgIC5vbmUoJC5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLCAkLnByb3h5KGNvbXBsZXRlLCB0aGlzKSlcbiAgICAgIC5lbXVsYXRlVHJhbnNpdGlvbkVuZCgzNTApXG4gICAgICBbZGltZW5zaW9uXSh0aGlzLiRlbGVtZW50WzBdW3Njcm9sbFNpemVdKVxuICB9XG5cbiAgQ29sbGFwc2UucHJvdG90eXBlLmhpZGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMudHJhbnNpdGlvbmluZyB8fCAhdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnaW4nKSkgcmV0dXJuXG5cbiAgICB2YXIgc3RhcnRFdmVudCA9ICQuRXZlbnQoJ2hpZGUuYnMuY29sbGFwc2UnKVxuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihzdGFydEV2ZW50KVxuICAgIGlmIChzdGFydEV2ZW50LmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm5cblxuICAgIHZhciBkaW1lbnNpb24gPSB0aGlzLmRpbWVuc2lvbigpXG5cbiAgICB0aGlzLiRlbGVtZW50XG4gICAgICBbZGltZW5zaW9uXSh0aGlzLiRlbGVtZW50W2RpbWVuc2lvbl0oKSlcbiAgICAgIFswXS5vZmZzZXRIZWlnaHRcblxuICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgIC5hZGRDbGFzcygnY29sbGFwc2luZycpXG4gICAgICAucmVtb3ZlQ2xhc3MoJ2NvbGxhcHNlJylcbiAgICAgIC5yZW1vdmVDbGFzcygnaW4nKVxuXG4gICAgdGhpcy50cmFuc2l0aW9uaW5nID0gMVxuXG4gICAgdmFyIGNvbXBsZXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy50cmFuc2l0aW9uaW5nID0gMFxuICAgICAgdGhpcy4kZWxlbWVudFxuICAgICAgICAudHJpZ2dlcignaGlkZGVuLmJzLmNvbGxhcHNlJylcbiAgICAgICAgLnJlbW92ZUNsYXNzKCdjb2xsYXBzaW5nJylcbiAgICAgICAgLmFkZENsYXNzKCdjb2xsYXBzZScpXG4gICAgfVxuXG4gICAgaWYgKCEkLnN1cHBvcnQudHJhbnNpdGlvbikgcmV0dXJuIGNvbXBsZXRlLmNhbGwodGhpcylcblxuICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgIFtkaW1lbnNpb25dKDApXG4gICAgICAub25lKCQuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCwgJC5wcm94eShjb21wbGV0ZSwgdGhpcykpXG4gICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoMzUwKVxuICB9XG5cbiAgQ29sbGFwc2UucHJvdG90eXBlLnRvZ2dsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzW3RoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2luJykgPyAnaGlkZScgOiAnc2hvdyddKClcbiAgfVxuXG5cbiAgLy8gQ09MTEFQU0UgUExVR0lOIERFRklOSVRJT05cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICB2YXIgb2xkID0gJC5mbi5jb2xsYXBzZVxuXG4gICQuZm4uY29sbGFwc2UgPSBmdW5jdGlvbiAob3B0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgJHRoaXMgICA9ICQodGhpcylcbiAgICAgIHZhciBkYXRhICAgID0gJHRoaXMuZGF0YSgnYnMuY29sbGFwc2UnKVxuICAgICAgdmFyIG9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgQ29sbGFwc2UuREVGQVVMVFMsICR0aGlzLmRhdGEoKSwgdHlwZW9mIG9wdGlvbiA9PSAnb2JqZWN0JyAmJiBvcHRpb24pXG5cbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgnYnMuY29sbGFwc2UnLCAoZGF0YSA9IG5ldyBDb2xsYXBzZSh0aGlzLCBvcHRpb25zKSkpXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PSAnc3RyaW5nJykgZGF0YVtvcHRpb25dKClcbiAgICB9KVxuICB9XG5cbiAgJC5mbi5jb2xsYXBzZS5Db25zdHJ1Y3RvciA9IENvbGxhcHNlXG5cblxuICAvLyBDT0xMQVBTRSBOTyBDT05GTElDVFxuICAvLyA9PT09PT09PT09PT09PT09PT09PVxuXG4gICQuZm4uY29sbGFwc2Uubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAkLmZuLmNvbGxhcHNlID0gb2xkXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG5cbiAgLy8gQ09MTEFQU0UgREFUQS1BUElcbiAgLy8gPT09PT09PT09PT09PT09PT1cblxuICAkKGRvY3VtZW50KS5vbignY2xpY2suYnMuY29sbGFwc2UuZGF0YS1hcGknLCAnW2RhdGEtdG9nZ2xlPWNvbGxhcHNlXScsIGZ1bmN0aW9uIChlKSB7XG4gICAgdmFyICR0aGlzICAgPSAkKHRoaXMpLCBocmVmXG4gICAgdmFyIHRhcmdldCAgPSAkdGhpcy5hdHRyKCdkYXRhLXRhcmdldCcpXG4gICAgICAgIHx8IGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICB8fCAoaHJlZiA9ICR0aGlzLmF0dHIoJ2hyZWYnKSkgJiYgaHJlZi5yZXBsYWNlKC8uKig/PSNbXlxcc10rJCkvLCAnJykgLy9zdHJpcCBmb3IgaWU3XG4gICAgdmFyICR0YXJnZXQgPSAkKHRhcmdldClcbiAgICB2YXIgZGF0YSAgICA9ICR0YXJnZXQuZGF0YSgnYnMuY29sbGFwc2UnKVxuICAgIHZhciBvcHRpb24gID0gZGF0YSA/ICd0b2dnbGUnIDogJHRoaXMuZGF0YSgpXG4gICAgdmFyIHBhcmVudCAgPSAkdGhpcy5hdHRyKCdkYXRhLXBhcmVudCcpXG4gICAgdmFyICRwYXJlbnQgPSBwYXJlbnQgJiYgJChwYXJlbnQpXG5cbiAgICBpZiAoIWRhdGEgfHwgIWRhdGEudHJhbnNpdGlvbmluZykge1xuICAgICAgaWYgKCRwYXJlbnQpICRwYXJlbnQuZmluZCgnW2RhdGEtdG9nZ2xlPWNvbGxhcHNlXVtkYXRhLXBhcmVudD1cIicgKyBwYXJlbnQgKyAnXCJdJykubm90KCR0aGlzKS5hZGRDbGFzcygnY29sbGFwc2VkJylcbiAgICAgICR0aGlzWyR0YXJnZXQuaGFzQ2xhc3MoJ2luJykgPyAnYWRkQ2xhc3MnIDogJ3JlbW92ZUNsYXNzJ10oJ2NvbGxhcHNlZCcpXG4gICAgfVxuXG4gICAgJHRhcmdldC5jb2xsYXBzZShvcHRpb24pXG4gIH0pXG5cbn0od2luZG93LmpRdWVyeSk7XG5cbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQm9vdHN0cmFwOiBkcm9wZG93bi5qcyB2My4wLjBcbiAqIGh0dHA6Ly90d2JzLmdpdGh1Yi5jb20vYm9vdHN0cmFwL2phdmFzY3JpcHQuaHRtbCNkcm9wZG93bnNcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQ29weXJpZ2h0IDIwMTIgVHdpdHRlciwgSW5jLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cblxuK2Z1bmN0aW9uICgkKSB7IFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIERST1BET1dOIENMQVNTIERFRklOSVRJT05cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIHZhciBiYWNrZHJvcCA9ICcuZHJvcGRvd24tYmFja2Ryb3AnXG4gIHZhciB0b2dnbGUgICA9ICdbZGF0YS10b2dnbGU9ZHJvcGRvd25dJ1xuICB2YXIgRHJvcGRvd24gPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIHZhciAkZWwgPSAkKGVsZW1lbnQpLm9uKCdjbGljay5icy5kcm9wZG93bicsIHRoaXMudG9nZ2xlKVxuICB9XG5cbiAgRHJvcGRvd24ucHJvdG90eXBlLnRvZ2dsZSA9IGZ1bmN0aW9uIChlKSB7XG4gICAgdmFyICR0aGlzID0gJCh0aGlzKVxuXG4gICAgaWYgKCR0aGlzLmlzKCcuZGlzYWJsZWQsIDpkaXNhYmxlZCcpKSByZXR1cm5cblxuICAgIHZhciAkcGFyZW50ICA9IGdldFBhcmVudCgkdGhpcylcbiAgICB2YXIgaXNBY3RpdmUgPSAkcGFyZW50Lmhhc0NsYXNzKCdvcGVuJylcblxuICAgIGNsZWFyTWVudXMoKVxuXG4gICAgaWYgKCFpc0FjdGl2ZSkge1xuICAgICAgaWYgKCdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiAhJHBhcmVudC5jbG9zZXN0KCcubmF2YmFyLW5hdicpLmxlbmd0aCkge1xuICAgICAgICAvLyBpZiBtb2JpbGUgd2Ugd2UgdXNlIGEgYmFja2Ryb3AgYmVjYXVzZSBjbGljayBldmVudHMgZG9uJ3QgZGVsZWdhdGVcbiAgICAgICAgJCgnPGRpdiBjbGFzcz1cImRyb3Bkb3duLWJhY2tkcm9wXCIvPicpLmluc2VydEFmdGVyKCQodGhpcykpLm9uKCdjbGljaycsIGNsZWFyTWVudXMpXG4gICAgICB9XG5cbiAgICAgICRwYXJlbnQudHJpZ2dlcihlID0gJC5FdmVudCgnc2hvdy5icy5kcm9wZG93bicpKVxuXG4gICAgICBpZiAoZS5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuXG5cbiAgICAgICRwYXJlbnRcbiAgICAgICAgLnRvZ2dsZUNsYXNzKCdvcGVuJylcbiAgICAgICAgLnRyaWdnZXIoJ3Nob3duLmJzLmRyb3Bkb3duJylcblxuICAgICAgJHRoaXMuZm9jdXMoKVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgRHJvcGRvd24ucHJvdG90eXBlLmtleWRvd24gPSBmdW5jdGlvbiAoZSkge1xuICAgIGlmICghLygzOHw0MHwyNykvLnRlc3QoZS5rZXlDb2RlKSkgcmV0dXJuXG5cbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpXG5cbiAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgICBpZiAoJHRoaXMuaXMoJy5kaXNhYmxlZCwgOmRpc2FibGVkJykpIHJldHVyblxuXG4gICAgdmFyICRwYXJlbnQgID0gZ2V0UGFyZW50KCR0aGlzKVxuICAgIHZhciBpc0FjdGl2ZSA9ICRwYXJlbnQuaGFzQ2xhc3MoJ29wZW4nKVxuXG4gICAgaWYgKCFpc0FjdGl2ZSB8fCAoaXNBY3RpdmUgJiYgZS5rZXlDb2RlID09IDI3KSkge1xuICAgICAgaWYgKGUud2hpY2ggPT0gMjcpICRwYXJlbnQuZmluZCh0b2dnbGUpLmZvY3VzKClcbiAgICAgIHJldHVybiAkdGhpcy5jbGljaygpXG4gICAgfVxuXG4gICAgdmFyICRpdGVtcyA9ICQoJ1tyb2xlPW1lbnVdIGxpOm5vdCguZGl2aWRlcik6dmlzaWJsZSBhJywgJHBhcmVudClcblxuICAgIGlmICghJGl0ZW1zLmxlbmd0aCkgcmV0dXJuXG5cbiAgICB2YXIgaW5kZXggPSAkaXRlbXMuaW5kZXgoJGl0ZW1zLmZpbHRlcignOmZvY3VzJykpXG5cbiAgICBpZiAoZS5rZXlDb2RlID09IDM4ICYmIGluZGV4ID4gMCkgICAgICAgICAgICAgICAgIGluZGV4LS0gICAgICAgICAgICAgICAgICAgICAgICAvLyB1cFxuICAgIGlmIChlLmtleUNvZGUgPT0gNDAgJiYgaW5kZXggPCAkaXRlbXMubGVuZ3RoIC0gMSkgaW5kZXgrKyAgICAgICAgICAgICAgICAgICAgICAgIC8vIGRvd25cbiAgICBpZiAoIX5pbmRleCkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4PTBcblxuICAgICRpdGVtcy5lcShpbmRleCkuZm9jdXMoKVxuICB9XG5cbiAgZnVuY3Rpb24gY2xlYXJNZW51cygpIHtcbiAgICAkKGJhY2tkcm9wKS5yZW1vdmUoKVxuICAgICQodG9nZ2xlKS5lYWNoKGZ1bmN0aW9uIChlKSB7XG4gICAgICB2YXIgJHBhcmVudCA9IGdldFBhcmVudCgkKHRoaXMpKVxuICAgICAgaWYgKCEkcGFyZW50Lmhhc0NsYXNzKCdvcGVuJykpIHJldHVyblxuICAgICAgJHBhcmVudC50cmlnZ2VyKGUgPSAkLkV2ZW50KCdoaWRlLmJzLmRyb3Bkb3duJykpXG4gICAgICBpZiAoZS5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuXG4gICAgICAkcGFyZW50LnJlbW92ZUNsYXNzKCdvcGVuJykudHJpZ2dlcignaGlkZGVuLmJzLmRyb3Bkb3duJylcbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0UGFyZW50KCR0aGlzKSB7XG4gICAgdmFyIHNlbGVjdG9yID0gJHRoaXMuYXR0cignZGF0YS10YXJnZXQnKVxuXG4gICAgaWYgKCFzZWxlY3Rvcikge1xuICAgICAgc2VsZWN0b3IgPSAkdGhpcy5hdHRyKCdocmVmJylcbiAgICAgIHNlbGVjdG9yID0gc2VsZWN0b3IgJiYgLyMvLnRlc3Qoc2VsZWN0b3IpICYmIHNlbGVjdG9yLnJlcGxhY2UoLy4qKD89I1teXFxzXSokKS8sICcnKSAvL3N0cmlwIGZvciBpZTdcbiAgICB9XG5cbiAgICB2YXIgJHBhcmVudCA9IHNlbGVjdG9yICYmICQoc2VsZWN0b3IpXG5cbiAgICByZXR1cm4gJHBhcmVudCAmJiAkcGFyZW50Lmxlbmd0aCA/ICRwYXJlbnQgOiAkdGhpcy5wYXJlbnQoKVxuICB9XG5cblxuICAvLyBEUk9QRE9XTiBQTFVHSU4gREVGSU5JVElPTlxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIHZhciBvbGQgPSAkLmZuLmRyb3Bkb3duXG5cbiAgJC5mbi5kcm9wZG93biA9IGZ1bmN0aW9uIChvcHRpb24pIHtcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcylcbiAgICAgIHZhciBkYXRhICA9ICR0aGlzLmRhdGEoJ2Ryb3Bkb3duJylcblxuICAgICAgaWYgKCFkYXRhKSAkdGhpcy5kYXRhKCdkcm9wZG93bicsIChkYXRhID0gbmV3IERyb3Bkb3duKHRoaXMpKSlcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09ICdzdHJpbmcnKSBkYXRhW29wdGlvbl0uY2FsbCgkdGhpcylcbiAgICB9KVxuICB9XG5cbiAgJC5mbi5kcm9wZG93bi5Db25zdHJ1Y3RvciA9IERyb3Bkb3duXG5cblxuICAvLyBEUk9QRE9XTiBOTyBDT05GTElDVFxuICAvLyA9PT09PT09PT09PT09PT09PT09PVxuXG4gICQuZm4uZHJvcGRvd24ubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAkLmZuLmRyb3Bkb3duID0gb2xkXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG5cbiAgLy8gQVBQTFkgVE8gU1RBTkRBUkQgRFJPUERPV04gRUxFTUVOVFNcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAkKGRvY3VtZW50KVxuICAgIC5vbignY2xpY2suYnMuZHJvcGRvd24uZGF0YS1hcGknLCBjbGVhck1lbnVzKVxuICAgIC5vbignY2xpY2suYnMuZHJvcGRvd24uZGF0YS1hcGknLCAnLmRyb3Bkb3duIGZvcm0nLCBmdW5jdGlvbiAoZSkgeyBlLnN0b3BQcm9wYWdhdGlvbigpIH0pXG4gICAgLm9uKCdjbGljay5icy5kcm9wZG93bi5kYXRhLWFwaScgICwgdG9nZ2xlLCBEcm9wZG93bi5wcm90b3R5cGUudG9nZ2xlKVxuICAgIC5vbigna2V5ZG93bi5icy5kcm9wZG93bi5kYXRhLWFwaScsIHRvZ2dsZSArICcsIFtyb2xlPW1lbnVdJyAsIERyb3Bkb3duLnByb3RvdHlwZS5rZXlkb3duKVxuXG59KHdpbmRvdy5qUXVlcnkpO1xuXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEJvb3RzdHJhcDogbW9kYWwuanMgdjMuMC4wXG4gKiBodHRwOi8vdHdicy5naXRodWIuY29tL2Jvb3RzdHJhcC9qYXZhc2NyaXB0Lmh0bWwjbW9kYWxzXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIENvcHlyaWdodCAyMDEyIFR3aXR0ZXIsIEluYy5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG5cbitmdW5jdGlvbiAoJCkgeyBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBNT0RBTCBDTEFTUyBERUZJTklUSU9OXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT1cblxuICB2YXIgTW9kYWwgPSBmdW5jdGlvbiAoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyAgID0gb3B0aW9uc1xuICAgIHRoaXMuJGVsZW1lbnQgID0gJChlbGVtZW50KVxuICAgIHRoaXMuJGJhY2tkcm9wID1cbiAgICB0aGlzLmlzU2hvd24gICA9IG51bGxcblxuICAgIGlmICh0aGlzLm9wdGlvbnMucmVtb3RlKSB0aGlzLiRlbGVtZW50LmxvYWQodGhpcy5vcHRpb25zLnJlbW90ZSlcbiAgfVxuXG4gIE1vZGFsLkRFRkFVTFRTID0ge1xuICAgICAgYmFja2Ryb3A6IHRydWVcbiAgICAsIGtleWJvYXJkOiB0cnVlXG4gICAgLCBzaG93OiB0cnVlXG4gIH1cblxuICBNb2RhbC5wcm90b3R5cGUudG9nZ2xlID0gZnVuY3Rpb24gKF9yZWxhdGVkVGFyZ2V0KSB7XG4gICAgcmV0dXJuIHRoaXNbIXRoaXMuaXNTaG93biA/ICdzaG93JyA6ICdoaWRlJ10oX3JlbGF0ZWRUYXJnZXQpXG4gIH1cblxuICBNb2RhbC5wcm90b3R5cGUuc2hvdyA9IGZ1bmN0aW9uIChfcmVsYXRlZFRhcmdldCkge1xuICAgIHZhciB0aGF0ID0gdGhpc1xuICAgIHZhciBlICAgID0gJC5FdmVudCgnc2hvdy5icy5tb2RhbCcsIHsgcmVsYXRlZFRhcmdldDogX3JlbGF0ZWRUYXJnZXQgfSlcblxuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihlKVxuXG4gICAgaWYgKHRoaXMuaXNTaG93biB8fCBlLmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm5cblxuICAgIHRoaXMuaXNTaG93biA9IHRydWVcblxuICAgIHRoaXMuZXNjYXBlKClcblxuICAgIHRoaXMuJGVsZW1lbnQub24oJ2NsaWNrLmRpc21pc3MubW9kYWwnLCAnW2RhdGEtZGlzbWlzcz1cIm1vZGFsXCJdJywgJC5wcm94eSh0aGlzLmhpZGUsIHRoaXMpKVxuXG4gICAgdGhpcy5iYWNrZHJvcChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgdHJhbnNpdGlvbiA9ICQuc3VwcG9ydC50cmFuc2l0aW9uICYmIHRoYXQuJGVsZW1lbnQuaGFzQ2xhc3MoJ2ZhZGUnKVxuXG4gICAgICBpZiAoIXRoYXQuJGVsZW1lbnQucGFyZW50KCkubGVuZ3RoKSB7XG4gICAgICAgIHRoYXQuJGVsZW1lbnQuYXBwZW5kVG8oZG9jdW1lbnQuYm9keSkgLy8gZG9uJ3QgbW92ZSBtb2RhbHMgZG9tIHBvc2l0aW9uXG4gICAgICB9XG5cbiAgICAgIHRoYXQuJGVsZW1lbnQuc2hvdygpXG5cbiAgICAgIGlmICh0cmFuc2l0aW9uKSB7XG4gICAgICAgIHRoYXQuJGVsZW1lbnRbMF0ub2Zmc2V0V2lkdGggLy8gZm9yY2UgcmVmbG93XG4gICAgICB9XG5cbiAgICAgIHRoYXQuJGVsZW1lbnRcbiAgICAgICAgLmFkZENsYXNzKCdpbicpXG4gICAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsIGZhbHNlKVxuXG4gICAgICB0aGF0LmVuZm9yY2VGb2N1cygpXG5cbiAgICAgIHZhciBlID0gJC5FdmVudCgnc2hvd24uYnMubW9kYWwnLCB7IHJlbGF0ZWRUYXJnZXQ6IF9yZWxhdGVkVGFyZ2V0IH0pXG5cbiAgICAgIHRyYW5zaXRpb24gP1xuICAgICAgICB0aGF0LiRlbGVtZW50LmZpbmQoJy5tb2RhbC1kaWFsb2cnKSAvLyB3YWl0IGZvciBtb2RhbCB0byBzbGlkZSBpblxuICAgICAgICAgIC5vbmUoJC5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGF0LiRlbGVtZW50LmZvY3VzKCkudHJpZ2dlcihlKVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLmVtdWxhdGVUcmFuc2l0aW9uRW5kKDMwMCkgOlxuICAgICAgICB0aGF0LiRlbGVtZW50LmZvY3VzKCkudHJpZ2dlcihlKVxuICAgIH0pXG4gIH1cblxuICBNb2RhbC5wcm90b3R5cGUuaGlkZSA9IGZ1bmN0aW9uIChlKSB7XG4gICAgaWYgKGUpIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgZSA9ICQuRXZlbnQoJ2hpZGUuYnMubW9kYWwnKVxuXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKGUpXG5cbiAgICBpZiAoIXRoaXMuaXNTaG93biB8fCBlLmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm5cblxuICAgIHRoaXMuaXNTaG93biA9IGZhbHNlXG5cbiAgICB0aGlzLmVzY2FwZSgpXG5cbiAgICAkKGRvY3VtZW50KS5vZmYoJ2ZvY3VzaW4uYnMubW9kYWwnKVxuXG4gICAgdGhpcy4kZWxlbWVudFxuICAgICAgLnJlbW92ZUNsYXNzKCdpbicpXG4gICAgICAuYXR0cignYXJpYS1oaWRkZW4nLCB0cnVlKVxuICAgICAgLm9mZignY2xpY2suZGlzbWlzcy5tb2RhbCcpXG5cbiAgICAkLnN1cHBvcnQudHJhbnNpdGlvbiAmJiB0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdmYWRlJykgP1xuICAgICAgdGhpcy4kZWxlbWVudFxuICAgICAgICAub25lKCQuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCwgJC5wcm94eSh0aGlzLmhpZGVNb2RhbCwgdGhpcykpXG4gICAgICAgIC5lbXVsYXRlVHJhbnNpdGlvbkVuZCgzMDApIDpcbiAgICAgIHRoaXMuaGlkZU1vZGFsKClcbiAgfVxuXG4gIE1vZGFsLnByb3RvdHlwZS5lbmZvcmNlRm9jdXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgJChkb2N1bWVudClcbiAgICAgIC5vZmYoJ2ZvY3VzaW4uYnMubW9kYWwnKSAvLyBndWFyZCBhZ2FpbnN0IGluZmluaXRlIGZvY3VzIGxvb3BcbiAgICAgIC5vbignZm9jdXNpbi5icy5tb2RhbCcsICQucHJveHkoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKHRoaXMuJGVsZW1lbnRbMF0gIT09IGUudGFyZ2V0ICYmICF0aGlzLiRlbGVtZW50LmhhcyhlLnRhcmdldCkubGVuZ3RoKSB7XG4gICAgICAgICAgdGhpcy4kZWxlbWVudC5mb2N1cygpXG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpKVxuICB9XG5cbiAgTW9kYWwucHJvdG90eXBlLmVzY2FwZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5pc1Nob3duICYmIHRoaXMub3B0aW9ucy5rZXlib2FyZCkge1xuICAgICAgdGhpcy4kZWxlbWVudC5vbigna2V5dXAuZGlzbWlzcy5icy5tb2RhbCcsICQucHJveHkoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZS53aGljaCA9PSAyNyAmJiB0aGlzLmhpZGUoKVxuICAgICAgfSwgdGhpcykpXG4gICAgfSBlbHNlIGlmICghdGhpcy5pc1Nob3duKSB7XG4gICAgICB0aGlzLiRlbGVtZW50Lm9mZigna2V5dXAuZGlzbWlzcy5icy5tb2RhbCcpXG4gICAgfVxuICB9XG5cbiAgTW9kYWwucHJvdG90eXBlLmhpZGVNb2RhbCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXNcbiAgICB0aGlzLiRlbGVtZW50LmhpZGUoKVxuICAgIHRoaXMuYmFja2Ryb3AoZnVuY3Rpb24gKCkge1xuICAgICAgdGhhdC5yZW1vdmVCYWNrZHJvcCgpXG4gICAgICB0aGF0LiRlbGVtZW50LnRyaWdnZXIoJ2hpZGRlbi5icy5tb2RhbCcpXG4gICAgfSlcbiAgfVxuXG4gIE1vZGFsLnByb3RvdHlwZS5yZW1vdmVCYWNrZHJvcCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLiRiYWNrZHJvcCAmJiB0aGlzLiRiYWNrZHJvcC5yZW1vdmUoKVxuICAgIHRoaXMuJGJhY2tkcm9wID0gbnVsbFxuICB9XG5cbiAgTW9kYWwucHJvdG90eXBlLmJhY2tkcm9wID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgdmFyIHRoYXQgICAgPSB0aGlzXG4gICAgdmFyIGFuaW1hdGUgPSB0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdmYWRlJykgPyAnZmFkZScgOiAnJ1xuXG4gICAgaWYgKHRoaXMuaXNTaG93biAmJiB0aGlzLm9wdGlvbnMuYmFja2Ryb3ApIHtcbiAgICAgIHZhciBkb0FuaW1hdGUgPSAkLnN1cHBvcnQudHJhbnNpdGlvbiAmJiBhbmltYXRlXG5cbiAgICAgIHRoaXMuJGJhY2tkcm9wID0gJCgnPGRpdiBjbGFzcz1cIm1vZGFsLWJhY2tkcm9wICcgKyBhbmltYXRlICsgJ1wiIC8+JylcbiAgICAgICAgLmFwcGVuZFRvKGRvY3VtZW50LmJvZHkpXG5cbiAgICAgIHRoaXMuJGVsZW1lbnQub24oJ2NsaWNrLmRpc21pc3MubW9kYWwnLCAkLnByb3h5KGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmIChlLnRhcmdldCAhPT0gZS5jdXJyZW50VGFyZ2V0KSByZXR1cm5cbiAgICAgICAgdGhpcy5vcHRpb25zLmJhY2tkcm9wID09ICdzdGF0aWMnXG4gICAgICAgICAgPyB0aGlzLiRlbGVtZW50WzBdLmZvY3VzLmNhbGwodGhpcy4kZWxlbWVudFswXSlcbiAgICAgICAgICA6IHRoaXMuaGlkZS5jYWxsKHRoaXMpXG4gICAgICB9LCB0aGlzKSlcblxuICAgICAgaWYgKGRvQW5pbWF0ZSkgdGhpcy4kYmFja2Ryb3BbMF0ub2Zmc2V0V2lkdGggLy8gZm9yY2UgcmVmbG93XG5cbiAgICAgIHRoaXMuJGJhY2tkcm9wLmFkZENsYXNzKCdpbicpXG5cbiAgICAgIGlmICghY2FsbGJhY2spIHJldHVyblxuXG4gICAgICBkb0FuaW1hdGUgP1xuICAgICAgICB0aGlzLiRiYWNrZHJvcFxuICAgICAgICAgIC5vbmUoJC5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLCBjYWxsYmFjaylcbiAgICAgICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoMTUwKSA6XG4gICAgICAgIGNhbGxiYWNrKClcblxuICAgIH0gZWxzZSBpZiAoIXRoaXMuaXNTaG93biAmJiB0aGlzLiRiYWNrZHJvcCkge1xuICAgICAgdGhpcy4kYmFja2Ryb3AucmVtb3ZlQ2xhc3MoJ2luJylcblxuICAgICAgJC5zdXBwb3J0LnRyYW5zaXRpb24gJiYgdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnZmFkZScpP1xuICAgICAgICB0aGlzLiRiYWNrZHJvcFxuICAgICAgICAgIC5vbmUoJC5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLCBjYWxsYmFjaylcbiAgICAgICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoMTUwKSA6XG4gICAgICAgIGNhbGxiYWNrKClcblxuICAgIH0gZWxzZSBpZiAoY2FsbGJhY2spIHtcbiAgICAgIGNhbGxiYWNrKClcbiAgICB9XG4gIH1cblxuXG4gIC8vIE1PREFMIFBMVUdJTiBERUZJTklUSU9OXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgdmFyIG9sZCA9ICQuZm4ubW9kYWxcblxuICAkLmZuLm1vZGFsID0gZnVuY3Rpb24gKG9wdGlvbiwgX3JlbGF0ZWRUYXJnZXQpIHtcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciAkdGhpcyAgID0gJCh0aGlzKVxuICAgICAgdmFyIGRhdGEgICAgPSAkdGhpcy5kYXRhKCdicy5tb2RhbCcpXG4gICAgICB2YXIgb3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBNb2RhbC5ERUZBVUxUUywgJHRoaXMuZGF0YSgpLCB0eXBlb2Ygb3B0aW9uID09ICdvYmplY3QnICYmIG9wdGlvbilcblxuICAgICAgaWYgKCFkYXRhKSAkdGhpcy5kYXRhKCdicy5tb2RhbCcsIChkYXRhID0gbmV3IE1vZGFsKHRoaXMsIG9wdGlvbnMpKSlcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09ICdzdHJpbmcnKSBkYXRhW29wdGlvbl0oX3JlbGF0ZWRUYXJnZXQpXG4gICAgICBlbHNlIGlmIChvcHRpb25zLnNob3cpIGRhdGEuc2hvdyhfcmVsYXRlZFRhcmdldClcbiAgICB9KVxuICB9XG5cbiAgJC5mbi5tb2RhbC5Db25zdHJ1Y3RvciA9IE1vZGFsXG5cblxuICAvLyBNT0RBTCBOTyBDT05GTElDVFxuICAvLyA9PT09PT09PT09PT09PT09PVxuXG4gICQuZm4ubW9kYWwubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAkLmZuLm1vZGFsID0gb2xkXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG5cbiAgLy8gTU9EQUwgREFUQS1BUElcbiAgLy8gPT09PT09PT09PT09PT1cblxuICAkKGRvY3VtZW50KS5vbignY2xpY2suYnMubW9kYWwuZGF0YS1hcGknLCAnW2RhdGEtdG9nZ2xlPVwibW9kYWxcIl0nLCBmdW5jdGlvbiAoZSkge1xuICAgIHZhciAkdGhpcyAgID0gJCh0aGlzKVxuICAgIHZhciBocmVmICAgID0gJHRoaXMuYXR0cignaHJlZicpXG4gICAgdmFyICR0YXJnZXQgPSAkKCR0aGlzLmF0dHIoJ2RhdGEtdGFyZ2V0JykgfHwgKGhyZWYgJiYgaHJlZi5yZXBsYWNlKC8uKig/PSNbXlxcc10rJCkvLCAnJykpKSAvL3N0cmlwIGZvciBpZTdcbiAgICB2YXIgb3B0aW9uICA9ICR0YXJnZXQuZGF0YSgnbW9kYWwnKSA/ICd0b2dnbGUnIDogJC5leHRlbmQoeyByZW1vdGU6ICEvIy8udGVzdChocmVmKSAmJiBocmVmIH0sICR0YXJnZXQuZGF0YSgpLCAkdGhpcy5kYXRhKCkpXG5cbiAgICBlLnByZXZlbnREZWZhdWx0KClcblxuICAgICR0YXJnZXRcbiAgICAgIC5tb2RhbChvcHRpb24sIHRoaXMpXG4gICAgICAub25lKCdoaWRlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAkdGhpcy5pcygnOnZpc2libGUnKSAmJiAkdGhpcy5mb2N1cygpXG4gICAgICB9KVxuICB9KVxuXG4gICQoZG9jdW1lbnQpXG4gICAgLm9uKCdzaG93LmJzLm1vZGFsJywgICcubW9kYWwnLCBmdW5jdGlvbiAoKSB7ICQoZG9jdW1lbnQuYm9keSkuYWRkQ2xhc3MoJ21vZGFsLW9wZW4nKSB9KVxuICAgIC5vbignaGlkZGVuLmJzLm1vZGFsJywgJy5tb2RhbCcsIGZ1bmN0aW9uICgpIHsgJChkb2N1bWVudC5ib2R5KS5yZW1vdmVDbGFzcygnbW9kYWwtb3BlbicpIH0pXG5cbn0od2luZG93LmpRdWVyeSk7XG5cbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQm9vdHN0cmFwOiB0b29sdGlwLmpzIHYzLjAuMFxuICogaHR0cDovL3R3YnMuZ2l0aHViLmNvbS9ib290c3RyYXAvamF2YXNjcmlwdC5odG1sI3Rvb2x0aXBcbiAqIEluc3BpcmVkIGJ5IHRoZSBvcmlnaW5hbCBqUXVlcnkudGlwc3kgYnkgSmFzb24gRnJhbWVcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQ29weXJpZ2h0IDIwMTIgVHdpdHRlciwgSW5jLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cblxuK2Z1bmN0aW9uICgkKSB7IFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIFRPT0xUSVAgUFVCTElDIENMQVNTIERFRklOSVRJT05cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIHZhciBUb29sdGlwID0gZnVuY3Rpb24gKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLnR5cGUgICAgICAgPVxuICAgIHRoaXMub3B0aW9ucyAgICA9XG4gICAgdGhpcy5lbmFibGVkICAgID1cbiAgICB0aGlzLnRpbWVvdXQgICAgPVxuICAgIHRoaXMuaG92ZXJTdGF0ZSA9XG4gICAgdGhpcy4kZWxlbWVudCAgID0gbnVsbFxuXG4gICAgdGhpcy5pbml0KCd0b29sdGlwJywgZWxlbWVudCwgb3B0aW9ucylcbiAgfVxuXG4gIFRvb2x0aXAuREVGQVVMVFMgPSB7XG4gICAgYW5pbWF0aW9uOiB0cnVlXG4gICwgcGxhY2VtZW50OiAndG9wJ1xuICAsIHNlbGVjdG9yOiBmYWxzZVxuICAsIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInRvb2x0aXBcIj48ZGl2IGNsYXNzPVwidG9vbHRpcC1hcnJvd1wiPjwvZGl2PjxkaXYgY2xhc3M9XCJ0b29sdGlwLWlubmVyXCI+PC9kaXY+PC9kaXY+J1xuICAsIHRyaWdnZXI6ICdob3ZlciBmb2N1cydcbiAgLCB0aXRsZTogJydcbiAgLCBkZWxheTogMFxuICAsIGh0bWw6IGZhbHNlXG4gICwgY29udGFpbmVyOiBmYWxzZVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICh0eXBlLCBlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy5lbmFibGVkICA9IHRydWVcbiAgICB0aGlzLnR5cGUgICAgID0gdHlwZVxuICAgIHRoaXMuJGVsZW1lbnQgPSAkKGVsZW1lbnQpXG4gICAgdGhpcy5vcHRpb25zICA9IHRoaXMuZ2V0T3B0aW9ucyhvcHRpb25zKVxuXG4gICAgdmFyIHRyaWdnZXJzID0gdGhpcy5vcHRpb25zLnRyaWdnZXIuc3BsaXQoJyAnKVxuXG4gICAgZm9yICh2YXIgaSA9IHRyaWdnZXJzLmxlbmd0aDsgaS0tOykge1xuICAgICAgdmFyIHRyaWdnZXIgPSB0cmlnZ2Vyc1tpXVxuXG4gICAgICBpZiAodHJpZ2dlciA9PSAnY2xpY2snKSB7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQub24oJ2NsaWNrLicgKyB0aGlzLnR5cGUsIHRoaXMub3B0aW9ucy5zZWxlY3RvciwgJC5wcm94eSh0aGlzLnRvZ2dsZSwgdGhpcykpXG4gICAgICB9IGVsc2UgaWYgKHRyaWdnZXIgIT0gJ21hbnVhbCcpIHtcbiAgICAgICAgdmFyIGV2ZW50SW4gID0gdHJpZ2dlciA9PSAnaG92ZXInID8gJ21vdXNlZW50ZXInIDogJ2ZvY3VzJ1xuICAgICAgICB2YXIgZXZlbnRPdXQgPSB0cmlnZ2VyID09ICdob3ZlcicgPyAnbW91c2VsZWF2ZScgOiAnYmx1cidcblxuICAgICAgICB0aGlzLiRlbGVtZW50Lm9uKGV2ZW50SW4gICsgJy4nICsgdGhpcy50eXBlLCB0aGlzLm9wdGlvbnMuc2VsZWN0b3IsICQucHJveHkodGhpcy5lbnRlciwgdGhpcykpXG4gICAgICAgIHRoaXMuJGVsZW1lbnQub24oZXZlbnRPdXQgKyAnLicgKyB0aGlzLnR5cGUsIHRoaXMub3B0aW9ucy5zZWxlY3RvciwgJC5wcm94eSh0aGlzLmxlYXZlLCB0aGlzKSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLm9wdGlvbnMuc2VsZWN0b3IgP1xuICAgICAgKHRoaXMuX29wdGlvbnMgPSAkLmV4dGVuZCh7fSwgdGhpcy5vcHRpb25zLCB7IHRyaWdnZXI6ICdtYW51YWwnLCBzZWxlY3RvcjogJycgfSkpIDpcbiAgICAgIHRoaXMuZml4VGl0bGUoKVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuZ2V0RGVmYXVsdHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFRvb2x0aXAuREVGQVVMVFNcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmdldE9wdGlvbnMgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgdGhpcy5nZXREZWZhdWx0cygpLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucylcblxuICAgIGlmIChvcHRpb25zLmRlbGF5ICYmIHR5cGVvZiBvcHRpb25zLmRlbGF5ID09ICdudW1iZXInKSB7XG4gICAgICBvcHRpb25zLmRlbGF5ID0ge1xuICAgICAgICBzaG93OiBvcHRpb25zLmRlbGF5XG4gICAgICAsIGhpZGU6IG9wdGlvbnMuZGVsYXlcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gb3B0aW9uc1xuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuZ2V0RGVsZWdhdGVPcHRpb25zID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBvcHRpb25zICA9IHt9XG4gICAgdmFyIGRlZmF1bHRzID0gdGhpcy5nZXREZWZhdWx0cygpXG5cbiAgICB0aGlzLl9vcHRpb25zICYmICQuZWFjaCh0aGlzLl9vcHRpb25zLCBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgaWYgKGRlZmF1bHRzW2tleV0gIT0gdmFsdWUpIG9wdGlvbnNba2V5XSA9IHZhbHVlXG4gICAgfSlcblxuICAgIHJldHVybiBvcHRpb25zXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5lbnRlciA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICB2YXIgc2VsZiA9IG9iaiBpbnN0YW5jZW9mIHRoaXMuY29uc3RydWN0b3IgP1xuICAgICAgb2JqIDogJChvYmouY3VycmVudFRhcmdldClbdGhpcy50eXBlXSh0aGlzLmdldERlbGVnYXRlT3B0aW9ucygpKS5kYXRhKCdicy4nICsgdGhpcy50eXBlKVxuXG4gICAgY2xlYXJUaW1lb3V0KHNlbGYudGltZW91dClcblxuICAgIHNlbGYuaG92ZXJTdGF0ZSA9ICdpbidcblxuICAgIGlmICghc2VsZi5vcHRpb25zLmRlbGF5IHx8ICFzZWxmLm9wdGlvbnMuZGVsYXkuc2hvdykgcmV0dXJuIHNlbGYuc2hvdygpXG5cbiAgICBzZWxmLnRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChzZWxmLmhvdmVyU3RhdGUgPT0gJ2luJykgc2VsZi5zaG93KClcbiAgICB9LCBzZWxmLm9wdGlvbnMuZGVsYXkuc2hvdylcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmxlYXZlID0gZnVuY3Rpb24gKG9iaikge1xuICAgIHZhciBzZWxmID0gb2JqIGluc3RhbmNlb2YgdGhpcy5jb25zdHJ1Y3RvciA/XG4gICAgICBvYmogOiAkKG9iai5jdXJyZW50VGFyZ2V0KVt0aGlzLnR5cGVdKHRoaXMuZ2V0RGVsZWdhdGVPcHRpb25zKCkpLmRhdGEoJ2JzLicgKyB0aGlzLnR5cGUpXG5cbiAgICBjbGVhclRpbWVvdXQoc2VsZi50aW1lb3V0KVxuXG4gICAgc2VsZi5ob3ZlclN0YXRlID0gJ291dCdcblxuICAgIGlmICghc2VsZi5vcHRpb25zLmRlbGF5IHx8ICFzZWxmLm9wdGlvbnMuZGVsYXkuaGlkZSkgcmV0dXJuIHNlbGYuaGlkZSgpXG5cbiAgICBzZWxmLnRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChzZWxmLmhvdmVyU3RhdGUgPT0gJ291dCcpIHNlbGYuaGlkZSgpXG4gICAgfSwgc2VsZi5vcHRpb25zLmRlbGF5LmhpZGUpXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBlID0gJC5FdmVudCgnc2hvdy5icy4nKyB0aGlzLnR5cGUpXG5cbiAgICBpZiAodGhpcy5oYXNDb250ZW50KCkgJiYgdGhpcy5lbmFibGVkKSB7XG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoZSlcblxuICAgICAgaWYgKGUuaXNEZWZhdWx0UHJldmVudGVkKCkpIHJldHVyblxuXG4gICAgICB2YXIgJHRpcCA9IHRoaXMudGlwKClcblxuICAgICAgdGhpcy5zZXRDb250ZW50KClcblxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5hbmltYXRpb24pICR0aXAuYWRkQ2xhc3MoJ2ZhZGUnKVxuXG4gICAgICB2YXIgcGxhY2VtZW50ID0gdHlwZW9mIHRoaXMub3B0aW9ucy5wbGFjZW1lbnQgPT0gJ2Z1bmN0aW9uJyA/XG4gICAgICAgIHRoaXMub3B0aW9ucy5wbGFjZW1lbnQuY2FsbCh0aGlzLCAkdGlwWzBdLCB0aGlzLiRlbGVtZW50WzBdKSA6XG4gICAgICAgIHRoaXMub3B0aW9ucy5wbGFjZW1lbnRcblxuICAgICAgdmFyIGF1dG9Ub2tlbiA9IC9cXHM/YXV0bz9cXHM/L2lcbiAgICAgIHZhciBhdXRvUGxhY2UgPSBhdXRvVG9rZW4udGVzdChwbGFjZW1lbnQpXG4gICAgICBpZiAoYXV0b1BsYWNlKSBwbGFjZW1lbnQgPSBwbGFjZW1lbnQucmVwbGFjZShhdXRvVG9rZW4sICcnKSB8fCAndG9wJ1xuXG4gICAgICAkdGlwXG4gICAgICAgIC5kZXRhY2goKVxuICAgICAgICAuY3NzKHsgdG9wOiAwLCBsZWZ0OiAwLCBkaXNwbGF5OiAnYmxvY2snIH0pXG4gICAgICAgIC5hZGRDbGFzcyhwbGFjZW1lbnQpXG5cbiAgICAgIHRoaXMub3B0aW9ucy5jb250YWluZXIgPyAkdGlwLmFwcGVuZFRvKHRoaXMub3B0aW9ucy5jb250YWluZXIpIDogJHRpcC5pbnNlcnRBZnRlcih0aGlzLiRlbGVtZW50KVxuXG4gICAgICB2YXIgcG9zICAgICAgICAgID0gdGhpcy5nZXRQb3NpdGlvbigpXG4gICAgICB2YXIgYWN0dWFsV2lkdGggID0gJHRpcFswXS5vZmZzZXRXaWR0aFxuICAgICAgdmFyIGFjdHVhbEhlaWdodCA9ICR0aXBbMF0ub2Zmc2V0SGVpZ2h0XG5cbiAgICAgIGlmIChhdXRvUGxhY2UpIHtcbiAgICAgICAgdmFyICRwYXJlbnQgPSB0aGlzLiRlbGVtZW50LnBhcmVudCgpXG5cbiAgICAgICAgdmFyIG9yZ1BsYWNlbWVudCA9IHBsYWNlbWVudFxuICAgICAgICB2YXIgZG9jU2Nyb2xsICAgID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCB8fCBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcFxuICAgICAgICB2YXIgcGFyZW50V2lkdGggID0gdGhpcy5vcHRpb25zLmNvbnRhaW5lciA9PSAnYm9keScgPyB3aW5kb3cuaW5uZXJXaWR0aCAgOiAkcGFyZW50Lm91dGVyV2lkdGgoKVxuICAgICAgICB2YXIgcGFyZW50SGVpZ2h0ID0gdGhpcy5vcHRpb25zLmNvbnRhaW5lciA9PSAnYm9keScgPyB3aW5kb3cuaW5uZXJIZWlnaHQgOiAkcGFyZW50Lm91dGVySGVpZ2h0KClcbiAgICAgICAgdmFyIHBhcmVudExlZnQgICA9IHRoaXMub3B0aW9ucy5jb250YWluZXIgPT0gJ2JvZHknID8gMCA6ICRwYXJlbnQub2Zmc2V0KCkubGVmdFxuXG4gICAgICAgIHBsYWNlbWVudCA9IHBsYWNlbWVudCA9PSAnYm90dG9tJyAmJiBwb3MudG9wICAgKyBwb3MuaGVpZ2h0ICArIGFjdHVhbEhlaWdodCAtIGRvY1Njcm9sbCA+IHBhcmVudEhlaWdodCAgPyAndG9wJyAgICA6XG4gICAgICAgICAgICAgICAgICAgIHBsYWNlbWVudCA9PSAndG9wJyAgICAmJiBwb3MudG9wICAgLSBkb2NTY3JvbGwgICAtIGFjdHVhbEhlaWdodCA8IDAgICAgICAgICAgICAgICAgICAgICAgICAgPyAnYm90dG9tJyA6XG4gICAgICAgICAgICAgICAgICAgIHBsYWNlbWVudCA9PSAncmlnaHQnICAmJiBwb3MucmlnaHQgKyBhY3R1YWxXaWR0aCA+IHBhcmVudFdpZHRoICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAnbGVmdCcgICA6XG4gICAgICAgICAgICAgICAgICAgIHBsYWNlbWVudCA9PSAnbGVmdCcgICAmJiBwb3MubGVmdCAgLSBhY3R1YWxXaWR0aCA8IHBhcmVudExlZnQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAncmlnaHQnICA6XG4gICAgICAgICAgICAgICAgICAgIHBsYWNlbWVudFxuXG4gICAgICAgICR0aXBcbiAgICAgICAgICAucmVtb3ZlQ2xhc3Mob3JnUGxhY2VtZW50KVxuICAgICAgICAgIC5hZGRDbGFzcyhwbGFjZW1lbnQpXG4gICAgICB9XG5cbiAgICAgIHZhciBjYWxjdWxhdGVkT2Zmc2V0ID0gdGhpcy5nZXRDYWxjdWxhdGVkT2Zmc2V0KHBsYWNlbWVudCwgcG9zLCBhY3R1YWxXaWR0aCwgYWN0dWFsSGVpZ2h0KVxuXG4gICAgICB0aGlzLmFwcGx5UGxhY2VtZW50KGNhbGN1bGF0ZWRPZmZzZXQsIHBsYWNlbWVudClcbiAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignc2hvd24uYnMuJyArIHRoaXMudHlwZSlcbiAgICB9XG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5hcHBseVBsYWNlbWVudCA9IGZ1bmN0aW9uKG9mZnNldCwgcGxhY2VtZW50KSB7XG4gICAgdmFyIHJlcGxhY2VcbiAgICB2YXIgJHRpcCAgID0gdGhpcy50aXAoKVxuICAgIHZhciB3aWR0aCAgPSAkdGlwWzBdLm9mZnNldFdpZHRoXG4gICAgdmFyIGhlaWdodCA9ICR0aXBbMF0ub2Zmc2V0SGVpZ2h0XG5cbiAgICAvLyBtYW51YWxseSByZWFkIG1hcmdpbnMgYmVjYXVzZSBnZXRCb3VuZGluZ0NsaWVudFJlY3QgaW5jbHVkZXMgZGlmZmVyZW5jZVxuICAgIHZhciBtYXJnaW5Ub3AgPSBwYXJzZUludCgkdGlwLmNzcygnbWFyZ2luLXRvcCcpLCAxMClcbiAgICB2YXIgbWFyZ2luTGVmdCA9IHBhcnNlSW50KCR0aXAuY3NzKCdtYXJnaW4tbGVmdCcpLCAxMClcblxuICAgIC8vIHdlIG11c3QgY2hlY2sgZm9yIE5hTiBmb3IgaWUgOC85XG4gICAgaWYgKGlzTmFOKG1hcmdpblRvcCkpICBtYXJnaW5Ub3AgID0gMFxuICAgIGlmIChpc05hTihtYXJnaW5MZWZ0KSkgbWFyZ2luTGVmdCA9IDBcblxuICAgIG9mZnNldC50b3AgID0gb2Zmc2V0LnRvcCAgKyBtYXJnaW5Ub3BcbiAgICBvZmZzZXQubGVmdCA9IG9mZnNldC5sZWZ0ICsgbWFyZ2luTGVmdFxuXG4gICAgJHRpcFxuICAgICAgLm9mZnNldChvZmZzZXQpXG4gICAgICAuYWRkQ2xhc3MoJ2luJylcblxuICAgIC8vIGNoZWNrIHRvIHNlZSBpZiBwbGFjaW5nIHRpcCBpbiBuZXcgb2Zmc2V0IGNhdXNlZCB0aGUgdGlwIHRvIHJlc2l6ZSBpdHNlbGZcbiAgICB2YXIgYWN0dWFsV2lkdGggID0gJHRpcFswXS5vZmZzZXRXaWR0aFxuICAgIHZhciBhY3R1YWxIZWlnaHQgPSAkdGlwWzBdLm9mZnNldEhlaWdodFxuXG4gICAgaWYgKHBsYWNlbWVudCA9PSAndG9wJyAmJiBhY3R1YWxIZWlnaHQgIT0gaGVpZ2h0KSB7XG4gICAgICByZXBsYWNlID0gdHJ1ZVxuICAgICAgb2Zmc2V0LnRvcCA9IG9mZnNldC50b3AgKyBoZWlnaHQgLSBhY3R1YWxIZWlnaHRcbiAgICB9XG5cbiAgICBpZiAoL2JvdHRvbXx0b3AvLnRlc3QocGxhY2VtZW50KSkge1xuICAgICAgdmFyIGRlbHRhID0gMFxuXG4gICAgICBpZiAob2Zmc2V0LmxlZnQgPCAwKSB7XG4gICAgICAgIGRlbHRhICAgICAgID0gb2Zmc2V0LmxlZnQgKiAtMlxuICAgICAgICBvZmZzZXQubGVmdCA9IDBcblxuICAgICAgICAkdGlwLm9mZnNldChvZmZzZXQpXG5cbiAgICAgICAgYWN0dWFsV2lkdGggID0gJHRpcFswXS5vZmZzZXRXaWR0aFxuICAgICAgICBhY3R1YWxIZWlnaHQgPSAkdGlwWzBdLm9mZnNldEhlaWdodFxuICAgICAgfVxuXG4gICAgICB0aGlzLnJlcGxhY2VBcnJvdyhkZWx0YSAtIHdpZHRoICsgYWN0dWFsV2lkdGgsIGFjdHVhbFdpZHRoLCAnbGVmdCcpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucmVwbGFjZUFycm93KGFjdHVhbEhlaWdodCAtIGhlaWdodCwgYWN0dWFsSGVpZ2h0LCAndG9wJylcbiAgICB9XG5cbiAgICBpZiAocmVwbGFjZSkgJHRpcC5vZmZzZXQob2Zmc2V0KVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUucmVwbGFjZUFycm93ID0gZnVuY3Rpb24oZGVsdGEsIGRpbWVuc2lvbiwgcG9zaXRpb24pIHtcbiAgICB0aGlzLmFycm93KCkuY3NzKHBvc2l0aW9uLCBkZWx0YSA/ICg1MCAqICgxIC0gZGVsdGEgLyBkaW1lbnNpb24pICsgXCIlXCIpIDogJycpXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5zZXRDb250ZW50ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciAkdGlwICA9IHRoaXMudGlwKClcbiAgICB2YXIgdGl0bGUgPSB0aGlzLmdldFRpdGxlKClcblxuICAgICR0aXAuZmluZCgnLnRvb2x0aXAtaW5uZXInKVt0aGlzLm9wdGlvbnMuaHRtbCA/ICdodG1sJyA6ICd0ZXh0J10odGl0bGUpXG4gICAgJHRpcC5yZW1vdmVDbGFzcygnZmFkZSBpbiB0b3AgYm90dG9tIGxlZnQgcmlnaHQnKVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuaGlkZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXNcbiAgICB2YXIgJHRpcCA9IHRoaXMudGlwKClcbiAgICB2YXIgZSAgICA9ICQuRXZlbnQoJ2hpZGUuYnMuJyArIHRoaXMudHlwZSlcblxuICAgIGZ1bmN0aW9uIGNvbXBsZXRlKCkge1xuICAgICAgaWYgKHRoYXQuaG92ZXJTdGF0ZSAhPSAnaW4nKSAkdGlwLmRldGFjaCgpXG4gICAgfVxuXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKGUpXG5cbiAgICBpZiAoZS5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuXG5cbiAgICAkdGlwLnJlbW92ZUNsYXNzKCdpbicpXG5cbiAgICAkLnN1cHBvcnQudHJhbnNpdGlvbiAmJiB0aGlzLiR0aXAuaGFzQ2xhc3MoJ2ZhZGUnKSA/XG4gICAgICAkdGlwXG4gICAgICAgIC5vbmUoJC5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLCBjb21wbGV0ZSlcbiAgICAgICAgLmVtdWxhdGVUcmFuc2l0aW9uRW5kKDE1MCkgOlxuICAgICAgY29tcGxldGUoKVxuXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdoaWRkZW4uYnMuJyArIHRoaXMudHlwZSlcblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5maXhUaXRsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgJGUgPSB0aGlzLiRlbGVtZW50XG4gICAgaWYgKCRlLmF0dHIoJ3RpdGxlJykgfHwgdHlwZW9mKCRlLmF0dHIoJ2RhdGEtb3JpZ2luYWwtdGl0bGUnKSkgIT0gJ3N0cmluZycpIHtcbiAgICAgICRlLmF0dHIoJ2RhdGEtb3JpZ2luYWwtdGl0bGUnLCAkZS5hdHRyKCd0aXRsZScpIHx8ICcnKS5hdHRyKCd0aXRsZScsICcnKVxuICAgIH1cbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmhhc0NvbnRlbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0VGl0bGUoKVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuZ2V0UG9zaXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGVsID0gdGhpcy4kZWxlbWVudFswXVxuICAgIHJldHVybiAkLmV4dGVuZCh7fSwgKHR5cGVvZiBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QgPT0gJ2Z1bmN0aW9uJykgPyBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSA6IHtcbiAgICAgIHdpZHRoOiBlbC5vZmZzZXRXaWR0aFxuICAgICwgaGVpZ2h0OiBlbC5vZmZzZXRIZWlnaHRcbiAgICB9LCB0aGlzLiRlbGVtZW50Lm9mZnNldCgpKVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuZ2V0Q2FsY3VsYXRlZE9mZnNldCA9IGZ1bmN0aW9uIChwbGFjZW1lbnQsIHBvcywgYWN0dWFsV2lkdGgsIGFjdHVhbEhlaWdodCkge1xuICAgIHJldHVybiBwbGFjZW1lbnQgPT0gJ2JvdHRvbScgPyB7IHRvcDogcG9zLnRvcCArIHBvcy5oZWlnaHQsICAgbGVmdDogcG9zLmxlZnQgKyBwb3Mud2lkdGggLyAyIC0gYWN0dWFsV2lkdGggLyAyICB9IDpcbiAgICAgICAgICAgcGxhY2VtZW50ID09ICd0b3AnICAgID8geyB0b3A6IHBvcy50b3AgLSBhY3R1YWxIZWlnaHQsIGxlZnQ6IHBvcy5sZWZ0ICsgcG9zLndpZHRoIC8gMiAtIGFjdHVhbFdpZHRoIC8gMiAgfSA6XG4gICAgICAgICAgIHBsYWNlbWVudCA9PSAnbGVmdCcgICA/IHsgdG9wOiBwb3MudG9wICsgcG9zLmhlaWdodCAvIDIgLSBhY3R1YWxIZWlnaHQgLyAyLCBsZWZ0OiBwb3MubGVmdCAtIGFjdHVhbFdpZHRoIH0gOlxuICAgICAgICAvKiBwbGFjZW1lbnQgPT0gJ3JpZ2h0JyAqLyB7IHRvcDogcG9zLnRvcCArIHBvcy5oZWlnaHQgLyAyIC0gYWN0dWFsSGVpZ2h0IC8gMiwgbGVmdDogcG9zLmxlZnQgKyBwb3Mud2lkdGggICB9XG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5nZXRUaXRsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGl0bGVcbiAgICB2YXIgJGUgPSB0aGlzLiRlbGVtZW50XG4gICAgdmFyIG8gID0gdGhpcy5vcHRpb25zXG5cbiAgICB0aXRsZSA9ICRlLmF0dHIoJ2RhdGEtb3JpZ2luYWwtdGl0bGUnKVxuICAgICAgfHwgKHR5cGVvZiBvLnRpdGxlID09ICdmdW5jdGlvbicgPyBvLnRpdGxlLmNhbGwoJGVbMF0pIDogIG8udGl0bGUpXG5cbiAgICByZXR1cm4gdGl0bGVcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLnRpcCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy4kdGlwID0gdGhpcy4kdGlwIHx8ICQodGhpcy5vcHRpb25zLnRlbXBsYXRlKVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuYXJyb3cgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuJGFycm93ID0gdGhpcy4kYXJyb3cgfHwgdGhpcy50aXAoKS5maW5kKCcudG9vbHRpcC1hcnJvdycpXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS52YWxpZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuJGVsZW1lbnRbMF0ucGFyZW50Tm9kZSkge1xuICAgICAgdGhpcy5oaWRlKClcbiAgICAgIHRoaXMuJGVsZW1lbnQgPSBudWxsXG4gICAgICB0aGlzLm9wdGlvbnMgID0gbnVsbFxuICAgIH1cbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmVuYWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmVuYWJsZWQgPSB0cnVlXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5kaXNhYmxlID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZW5hYmxlZCA9IGZhbHNlXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS50b2dnbGVFbmFibGVkID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZW5hYmxlZCA9ICF0aGlzLmVuYWJsZWRcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLnRvZ2dsZSA9IGZ1bmN0aW9uIChlKSB7XG4gICAgdmFyIHNlbGYgPSBlID8gJChlLmN1cnJlbnRUYXJnZXQpW3RoaXMudHlwZV0odGhpcy5nZXREZWxlZ2F0ZU9wdGlvbnMoKSkuZGF0YSgnYnMuJyArIHRoaXMudHlwZSkgOiB0aGlzXG4gICAgc2VsZi50aXAoKS5oYXNDbGFzcygnaW4nKSA/IHNlbGYubGVhdmUoc2VsZikgOiBzZWxmLmVudGVyKHNlbGYpXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuaGlkZSgpLiRlbGVtZW50Lm9mZignLicgKyB0aGlzLnR5cGUpLnJlbW92ZURhdGEoJ2JzLicgKyB0aGlzLnR5cGUpXG4gIH1cblxuXG4gIC8vIFRPT0xUSVAgUExVR0lOIERFRklOSVRJT05cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIHZhciBvbGQgPSAkLmZuLnRvb2x0aXBcblxuICAkLmZuLnRvb2x0aXAgPSBmdW5jdGlvbiAob3B0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgJHRoaXMgICA9ICQodGhpcylcbiAgICAgIHZhciBkYXRhICAgID0gJHRoaXMuZGF0YSgnYnMudG9vbHRpcCcpXG4gICAgICB2YXIgb3B0aW9ucyA9IHR5cGVvZiBvcHRpb24gPT0gJ29iamVjdCcgJiYgb3B0aW9uXG5cbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgnYnMudG9vbHRpcCcsIChkYXRhID0gbmV3IFRvb2x0aXAodGhpcywgb3B0aW9ucykpKVxuICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT0gJ3N0cmluZycpIGRhdGFbb3B0aW9uXSgpXG4gICAgfSlcbiAgfVxuXG4gICQuZm4udG9vbHRpcC5Db25zdHJ1Y3RvciA9IFRvb2x0aXBcblxuXG4gIC8vIFRPT0xUSVAgTk8gQ09ORkxJQ1RcbiAgLy8gPT09PT09PT09PT09PT09PT09PVxuXG4gICQuZm4udG9vbHRpcC5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICQuZm4udG9vbHRpcCA9IG9sZFxuICAgIHJldHVybiB0aGlzXG4gIH1cblxufSh3aW5kb3cualF1ZXJ5KTtcblxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBCb290c3RyYXA6IHBvcG92ZXIuanMgdjMuMC4wXG4gKiBodHRwOi8vdHdicy5naXRodWIuY29tL2Jvb3RzdHJhcC9qYXZhc2NyaXB0Lmh0bWwjcG9wb3ZlcnNcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQ29weXJpZ2h0IDIwMTIgVHdpdHRlciwgSW5jLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cblxuK2Z1bmN0aW9uICgkKSB7IFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIFBPUE9WRVIgUFVCTElDIENMQVNTIERFRklOSVRJT05cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIHZhciBQb3BvdmVyID0gZnVuY3Rpb24gKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLmluaXQoJ3BvcG92ZXInLCBlbGVtZW50LCBvcHRpb25zKVxuICB9XG5cbiAgaWYgKCEkLmZuLnRvb2x0aXApIHRocm93IG5ldyBFcnJvcignUG9wb3ZlciByZXF1aXJlcyB0b29sdGlwLmpzJylcblxuICBQb3BvdmVyLkRFRkFVTFRTID0gJC5leHRlbmQoe30gLCAkLmZuLnRvb2x0aXAuQ29uc3RydWN0b3IuREVGQVVMVFMsIHtcbiAgICBwbGFjZW1lbnQ6ICdyaWdodCdcbiAgLCB0cmlnZ2VyOiAnY2xpY2snXG4gICwgY29udGVudDogJydcbiAgLCB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJwb3BvdmVyXCI+PGRpdiBjbGFzcz1cImFycm93XCI+PC9kaXY+PGgzIGNsYXNzPVwicG9wb3Zlci10aXRsZVwiPjwvaDM+PGRpdiBjbGFzcz1cInBvcG92ZXItY29udGVudFwiPjwvZGl2PjwvZGl2PidcbiAgfSlcblxuXG4gIC8vIE5PVEU6IFBPUE9WRVIgRVhURU5EUyB0b29sdGlwLmpzXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgUG9wb3Zlci5wcm90b3R5cGUgPSAkLmV4dGVuZCh7fSwgJC5mbi50b29sdGlwLkNvbnN0cnVjdG9yLnByb3RvdHlwZSlcblxuICBQb3BvdmVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFBvcG92ZXJcblxuICBQb3BvdmVyLnByb3RvdHlwZS5nZXREZWZhdWx0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUG9wb3Zlci5ERUZBVUxUU1xuICB9XG5cbiAgUG9wb3Zlci5wcm90b3R5cGUuc2V0Q29udGVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgJHRpcCAgICA9IHRoaXMudGlwKClcbiAgICB2YXIgdGl0bGUgICA9IHRoaXMuZ2V0VGl0bGUoKVxuICAgIHZhciBjb250ZW50ID0gdGhpcy5nZXRDb250ZW50KClcblxuICAgICR0aXAuZmluZCgnLnBvcG92ZXItdGl0bGUnKVt0aGlzLm9wdGlvbnMuaHRtbCA/ICdodG1sJyA6ICd0ZXh0J10odGl0bGUpXG4gICAgJHRpcC5maW5kKCcucG9wb3Zlci1jb250ZW50JylbdGhpcy5vcHRpb25zLmh0bWwgPyAnaHRtbCcgOiAndGV4dCddKGNvbnRlbnQpXG5cbiAgICAkdGlwLnJlbW92ZUNsYXNzKCdmYWRlIHRvcCBib3R0b20gbGVmdCByaWdodCBpbicpXG5cbiAgICAvLyBJRTggZG9lc24ndCBhY2NlcHQgaGlkaW5nIHZpYSB0aGUgYDplbXB0eWAgcHNldWRvIHNlbGVjdG9yLCB3ZSBoYXZlIHRvIGRvXG4gICAgLy8gdGhpcyBtYW51YWxseSBieSBjaGVja2luZyB0aGUgY29udGVudHMuXG4gICAgaWYgKCEkdGlwLmZpbmQoJy5wb3BvdmVyLXRpdGxlJykuaHRtbCgpKSAkdGlwLmZpbmQoJy5wb3BvdmVyLXRpdGxlJykuaGlkZSgpXG4gIH1cblxuICBQb3BvdmVyLnByb3RvdHlwZS5oYXNDb250ZW50ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmdldFRpdGxlKCkgfHwgdGhpcy5nZXRDb250ZW50KClcbiAgfVxuXG4gIFBvcG92ZXIucHJvdG90eXBlLmdldENvbnRlbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyICRlID0gdGhpcy4kZWxlbWVudFxuICAgIHZhciBvICA9IHRoaXMub3B0aW9uc1xuXG4gICAgcmV0dXJuICRlLmF0dHIoJ2RhdGEtY29udGVudCcpXG4gICAgICB8fCAodHlwZW9mIG8uY29udGVudCA9PSAnZnVuY3Rpb24nID9cbiAgICAgICAgICAgIG8uY29udGVudC5jYWxsKCRlWzBdKSA6XG4gICAgICAgICAgICBvLmNvbnRlbnQpXG4gIH1cblxuICBQb3BvdmVyLnByb3RvdHlwZS5hcnJvdyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy4kYXJyb3cgPSB0aGlzLiRhcnJvdyB8fCB0aGlzLnRpcCgpLmZpbmQoJy5hcnJvdycpXG4gIH1cblxuICBQb3BvdmVyLnByb3RvdHlwZS50aXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLiR0aXApIHRoaXMuJHRpcCA9ICQodGhpcy5vcHRpb25zLnRlbXBsYXRlKVxuICAgIHJldHVybiB0aGlzLiR0aXBcbiAgfVxuXG5cbiAgLy8gUE9QT1ZFUiBQTFVHSU4gREVGSU5JVElPTlxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgdmFyIG9sZCA9ICQuZm4ucG9wb3ZlclxuXG4gICQuZm4ucG9wb3ZlciA9IGZ1bmN0aW9uIChvcHRpb24pIHtcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciAkdGhpcyAgID0gJCh0aGlzKVxuICAgICAgdmFyIGRhdGEgICAgPSAkdGhpcy5kYXRhKCdicy5wb3BvdmVyJylcbiAgICAgIHZhciBvcHRpb25zID0gdHlwZW9mIG9wdGlvbiA9PSAnb2JqZWN0JyAmJiBvcHRpb25cblxuICAgICAgaWYgKCFkYXRhKSAkdGhpcy5kYXRhKCdicy5wb3BvdmVyJywgKGRhdGEgPSBuZXcgUG9wb3Zlcih0aGlzLCBvcHRpb25zKSkpXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PSAnc3RyaW5nJykgZGF0YVtvcHRpb25dKClcbiAgICB9KVxuICB9XG5cbiAgJC5mbi5wb3BvdmVyLkNvbnN0cnVjdG9yID0gUG9wb3ZlclxuXG5cbiAgLy8gUE9QT1ZFUiBOTyBDT05GTElDVFxuICAvLyA9PT09PT09PT09PT09PT09PT09XG5cbiAgJC5mbi5wb3BvdmVyLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgJC5mbi5wb3BvdmVyID0gb2xkXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG59KHdpbmRvdy5qUXVlcnkpO1xuXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEJvb3RzdHJhcDogc2Nyb2xsc3B5LmpzIHYzLjAuMFxuICogaHR0cDovL3R3YnMuZ2l0aHViLmNvbS9ib290c3RyYXAvamF2YXNjcmlwdC5odG1sI3Njcm9sbHNweVxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBDb3B5cmlnaHQgMjAxMiBUd2l0dGVyLCBJbmMuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuXG4rZnVuY3Rpb24gKCQpIHsgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgLy8gU0NST0xMU1BZIENMQVNTIERFRklOSVRJT05cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICBmdW5jdGlvbiBTY3JvbGxTcHkoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHZhciBocmVmXG4gICAgdmFyIHByb2Nlc3MgID0gJC5wcm94eSh0aGlzLnByb2Nlc3MsIHRoaXMpXG5cbiAgICB0aGlzLiRlbGVtZW50ICAgICAgID0gJChlbGVtZW50KS5pcygnYm9keScpID8gJCh3aW5kb3cpIDogJChlbGVtZW50KVxuICAgIHRoaXMuJGJvZHkgICAgICAgICAgPSAkKCdib2R5JylcbiAgICB0aGlzLiRzY3JvbGxFbGVtZW50ID0gdGhpcy4kZWxlbWVudC5vbignc2Nyb2xsLmJzLnNjcm9sbC1zcHkuZGF0YS1hcGknLCBwcm9jZXNzKVxuICAgIHRoaXMub3B0aW9ucyAgICAgICAgPSAkLmV4dGVuZCh7fSwgU2Nyb2xsU3B5LkRFRkFVTFRTLCBvcHRpb25zKVxuICAgIHRoaXMuc2VsZWN0b3IgICAgICAgPSAodGhpcy5vcHRpb25zLnRhcmdldFxuICAgICAgfHwgKChocmVmID0gJChlbGVtZW50KS5hdHRyKCdocmVmJykpICYmIGhyZWYucmVwbGFjZSgvLiooPz0jW15cXHNdKyQpLywgJycpKSAvL3N0cmlwIGZvciBpZTdcbiAgICAgIHx8ICcnKSArICcgLm5hdiBsaSA+IGEnXG4gICAgdGhpcy5vZmZzZXRzICAgICAgICA9ICQoW10pXG4gICAgdGhpcy50YXJnZXRzICAgICAgICA9ICQoW10pXG4gICAgdGhpcy5hY3RpdmVUYXJnZXQgICA9IG51bGxcblxuICAgIHRoaXMucmVmcmVzaCgpXG4gICAgdGhpcy5wcm9jZXNzKClcbiAgfVxuXG4gIFNjcm9sbFNweS5ERUZBVUxUUyA9IHtcbiAgICBvZmZzZXQ6IDEwXG4gIH1cblxuICBTY3JvbGxTcHkucHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG9mZnNldE1ldGhvZCA9IHRoaXMuJGVsZW1lbnRbMF0gPT0gd2luZG93ID8gJ29mZnNldCcgOiAncG9zaXRpb24nXG5cbiAgICB0aGlzLm9mZnNldHMgPSAkKFtdKVxuICAgIHRoaXMudGFyZ2V0cyA9ICQoW10pXG5cbiAgICB2YXIgc2VsZiAgICAgPSB0aGlzXG4gICAgdmFyICR0YXJnZXRzID0gdGhpcy4kYm9keVxuICAgICAgLmZpbmQodGhpcy5zZWxlY3RvcilcbiAgICAgIC5tYXAoZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgJGVsICAgPSAkKHRoaXMpXG4gICAgICAgIHZhciBocmVmICA9ICRlbC5kYXRhKCd0YXJnZXQnKSB8fCAkZWwuYXR0cignaHJlZicpXG4gICAgICAgIHZhciAkaHJlZiA9IC9eI1xcdy8udGVzdChocmVmKSAmJiAkKGhyZWYpXG5cbiAgICAgICAgcmV0dXJuICgkaHJlZlxuICAgICAgICAgICYmICRocmVmLmxlbmd0aFxuICAgICAgICAgICYmIFtbICRocmVmW29mZnNldE1ldGhvZF0oKS50b3AgKyAoISQuaXNXaW5kb3coc2VsZi4kc2Nyb2xsRWxlbWVudC5nZXQoMCkpICYmIHNlbGYuJHNjcm9sbEVsZW1lbnQuc2Nyb2xsVG9wKCkpLCBocmVmIF1dKSB8fCBudWxsXG4gICAgICB9KVxuICAgICAgLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHsgcmV0dXJuIGFbMF0gLSBiWzBdIH0pXG4gICAgICAuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlbGYub2Zmc2V0cy5wdXNoKHRoaXNbMF0pXG4gICAgICAgIHNlbGYudGFyZ2V0cy5wdXNoKHRoaXNbMV0pXG4gICAgICB9KVxuICB9XG5cbiAgU2Nyb2xsU3B5LnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzY3JvbGxUb3AgICAgPSB0aGlzLiRzY3JvbGxFbGVtZW50LnNjcm9sbFRvcCgpICsgdGhpcy5vcHRpb25zLm9mZnNldFxuICAgIHZhciBzY3JvbGxIZWlnaHQgPSB0aGlzLiRzY3JvbGxFbGVtZW50WzBdLnNjcm9sbEhlaWdodCB8fCB0aGlzLiRib2R5WzBdLnNjcm9sbEhlaWdodFxuICAgIHZhciBtYXhTY3JvbGwgICAgPSBzY3JvbGxIZWlnaHQgLSB0aGlzLiRzY3JvbGxFbGVtZW50LmhlaWdodCgpXG4gICAgdmFyIG9mZnNldHMgICAgICA9IHRoaXMub2Zmc2V0c1xuICAgIHZhciB0YXJnZXRzICAgICAgPSB0aGlzLnRhcmdldHNcbiAgICB2YXIgYWN0aXZlVGFyZ2V0ID0gdGhpcy5hY3RpdmVUYXJnZXRcbiAgICB2YXIgaVxuXG4gICAgaWYgKHNjcm9sbFRvcCA+PSBtYXhTY3JvbGwpIHtcbiAgICAgIHJldHVybiBhY3RpdmVUYXJnZXQgIT0gKGkgPSB0YXJnZXRzLmxhc3QoKVswXSkgJiYgdGhpcy5hY3RpdmF0ZShpKVxuICAgIH1cblxuICAgIGZvciAoaSA9IG9mZnNldHMubGVuZ3RoOyBpLS07KSB7XG4gICAgICBhY3RpdmVUYXJnZXQgIT0gdGFyZ2V0c1tpXVxuICAgICAgICAmJiBzY3JvbGxUb3AgPj0gb2Zmc2V0c1tpXVxuICAgICAgICAmJiAoIW9mZnNldHNbaSArIDFdIHx8IHNjcm9sbFRvcCA8PSBvZmZzZXRzW2kgKyAxXSlcbiAgICAgICAgJiYgdGhpcy5hY3RpdmF0ZSggdGFyZ2V0c1tpXSApXG4gICAgfVxuICB9XG5cbiAgU2Nyb2xsU3B5LnByb3RvdHlwZS5hY3RpdmF0ZSA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICB0aGlzLmFjdGl2ZVRhcmdldCA9IHRhcmdldFxuXG4gICAgJCh0aGlzLnNlbGVjdG9yKVxuICAgICAgLnBhcmVudHMoJy5hY3RpdmUnKVxuICAgICAgLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxuXG4gICAgdmFyIHNlbGVjdG9yID0gdGhpcy5zZWxlY3RvclxuICAgICAgKyAnW2RhdGEtdGFyZ2V0PVwiJyArIHRhcmdldCArICdcIl0sJ1xuICAgICAgKyB0aGlzLnNlbGVjdG9yICsgJ1tocmVmPVwiJyArIHRhcmdldCArICdcIl0nXG5cbiAgICB2YXIgYWN0aXZlID0gJChzZWxlY3RvcilcbiAgICAgIC5wYXJlbnRzKCdsaScpXG4gICAgICAuYWRkQ2xhc3MoJ2FjdGl2ZScpXG5cbiAgICBpZiAoYWN0aXZlLnBhcmVudCgnLmRyb3Bkb3duLW1lbnUnKS5sZW5ndGgpICB7XG4gICAgICBhY3RpdmUgPSBhY3RpdmVcbiAgICAgICAgLmNsb3Nlc3QoJ2xpLmRyb3Bkb3duJylcbiAgICAgICAgLmFkZENsYXNzKCdhY3RpdmUnKVxuICAgIH1cblxuICAgIGFjdGl2ZS50cmlnZ2VyKCdhY3RpdmF0ZScpXG4gIH1cblxuXG4gIC8vIFNDUk9MTFNQWSBQTFVHSU4gREVGSU5JVElPTlxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICB2YXIgb2xkID0gJC5mbi5zY3JvbGxzcHlcblxuICAkLmZuLnNjcm9sbHNweSA9IGZ1bmN0aW9uIChvcHRpb24pIHtcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciAkdGhpcyAgID0gJCh0aGlzKVxuICAgICAgdmFyIGRhdGEgICAgPSAkdGhpcy5kYXRhKCdicy5zY3JvbGxzcHknKVxuICAgICAgdmFyIG9wdGlvbnMgPSB0eXBlb2Ygb3B0aW9uID09ICdvYmplY3QnICYmIG9wdGlvblxuXG4gICAgICBpZiAoIWRhdGEpICR0aGlzLmRhdGEoJ2JzLnNjcm9sbHNweScsIChkYXRhID0gbmV3IFNjcm9sbFNweSh0aGlzLCBvcHRpb25zKSkpXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PSAnc3RyaW5nJykgZGF0YVtvcHRpb25dKClcbiAgICB9KVxuICB9XG5cbiAgJC5mbi5zY3JvbGxzcHkuQ29uc3RydWN0b3IgPSBTY3JvbGxTcHlcblxuXG4gIC8vIFNDUk9MTFNQWSBOTyBDT05GTElDVFxuICAvLyA9PT09PT09PT09PT09PT09PT09PT1cblxuICAkLmZuLnNjcm9sbHNweS5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICQuZm4uc2Nyb2xsc3B5ID0gb2xkXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG5cbiAgLy8gU0NST0xMU1BZIERBVEEtQVBJXG4gIC8vID09PT09PT09PT09PT09PT09PVxuXG4gICQod2luZG93KS5vbignbG9hZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAkKCdbZGF0YS1zcHk9XCJzY3JvbGxcIl0nKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciAkc3B5ID0gJCh0aGlzKVxuICAgICAgJHNweS5zY3JvbGxzcHkoJHNweS5kYXRhKCkpXG4gICAgfSlcbiAgfSlcblxufSh3aW5kb3cualF1ZXJ5KTtcblxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBCb290c3RyYXA6IHRhYi5qcyB2My4wLjBcbiAqIGh0dHA6Ly90d2JzLmdpdGh1Yi5jb20vYm9vdHN0cmFwL2phdmFzY3JpcHQuaHRtbCN0YWJzXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIENvcHlyaWdodCAyMDEyIFR3aXR0ZXIsIEluYy5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG5cbitmdW5jdGlvbiAoJCkgeyBcInVzZSBzdHJpY3RcIjtcblxuICAvLyBUQUIgQ0xBU1MgREVGSU5JVElPTlxuICAvLyA9PT09PT09PT09PT09PT09PT09PVxuXG4gIHZhciBUYWIgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIHRoaXMuZWxlbWVudCA9ICQoZWxlbWVudClcbiAgfVxuXG4gIFRhYi5wcm90b3R5cGUuc2hvdyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgJHRoaXMgICAgPSB0aGlzLmVsZW1lbnRcbiAgICB2YXIgJHVsICAgICAgPSAkdGhpcy5jbG9zZXN0KCd1bDpub3QoLmRyb3Bkb3duLW1lbnUpJylcbiAgICB2YXIgc2VsZWN0b3IgPSAkdGhpcy5hdHRyKCdkYXRhLXRhcmdldCcpXG5cbiAgICBpZiAoIXNlbGVjdG9yKSB7XG4gICAgICBzZWxlY3RvciA9ICR0aGlzLmF0dHIoJ2hyZWYnKVxuICAgICAgc2VsZWN0b3IgPSBzZWxlY3RvciAmJiBzZWxlY3Rvci5yZXBsYWNlKC8uKig/PSNbXlxcc10qJCkvLCAnJykgLy9zdHJpcCBmb3IgaWU3XG4gICAgfVxuXG4gICAgaWYgKCR0aGlzLnBhcmVudCgnbGknKS5oYXNDbGFzcygnYWN0aXZlJykpIHJldHVyblxuXG4gICAgdmFyIHByZXZpb3VzID0gJHVsLmZpbmQoJy5hY3RpdmU6bGFzdCBhJylbMF1cbiAgICB2YXIgZSAgICAgICAgPSAkLkV2ZW50KCdzaG93LmJzLnRhYicsIHtcbiAgICAgIHJlbGF0ZWRUYXJnZXQ6IHByZXZpb3VzXG4gICAgfSlcblxuICAgICR0aGlzLnRyaWdnZXIoZSlcblxuICAgIGlmIChlLmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm5cblxuICAgIHZhciAkdGFyZ2V0ID0gJChzZWxlY3RvcilcblxuICAgIHRoaXMuYWN0aXZhdGUoJHRoaXMucGFyZW50KCdsaScpLCAkdWwpXG4gICAgdGhpcy5hY3RpdmF0ZSgkdGFyZ2V0LCAkdGFyZ2V0LnBhcmVudCgpLCBmdW5jdGlvbiAoKSB7XG4gICAgICAkdGhpcy50cmlnZ2VyKHtcbiAgICAgICAgdHlwZTogJ3Nob3duLmJzLnRhYidcbiAgICAgICwgcmVsYXRlZFRhcmdldDogcHJldmlvdXNcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIFRhYi5wcm90b3R5cGUuYWN0aXZhdGUgPSBmdW5jdGlvbiAoZWxlbWVudCwgY29udGFpbmVyLCBjYWxsYmFjaykge1xuICAgIHZhciAkYWN0aXZlICAgID0gY29udGFpbmVyLmZpbmQoJz4gLmFjdGl2ZScpXG4gICAgdmFyIHRyYW5zaXRpb24gPSBjYWxsYmFja1xuICAgICAgJiYgJC5zdXBwb3J0LnRyYW5zaXRpb25cbiAgICAgICYmICRhY3RpdmUuaGFzQ2xhc3MoJ2ZhZGUnKVxuXG4gICAgZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICRhY3RpdmVcbiAgICAgICAgLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxuICAgICAgICAuZmluZCgnPiAuZHJvcGRvd24tbWVudSA+IC5hY3RpdmUnKVxuICAgICAgICAucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpXG5cbiAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2FjdGl2ZScpXG5cbiAgICAgIGlmICh0cmFuc2l0aW9uKSB7XG4gICAgICAgIGVsZW1lbnRbMF0ub2Zmc2V0V2lkdGggLy8gcmVmbG93IGZvciB0cmFuc2l0aW9uXG4gICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2luJylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2ZhZGUnKVxuICAgICAgfVxuXG4gICAgICBpZiAoZWxlbWVudC5wYXJlbnQoJy5kcm9wZG93bi1tZW51JykpIHtcbiAgICAgICAgZWxlbWVudC5jbG9zZXN0KCdsaS5kcm9wZG93bicpLmFkZENsYXNzKCdhY3RpdmUnKVxuICAgICAgfVxuXG4gICAgICBjYWxsYmFjayAmJiBjYWxsYmFjaygpXG4gICAgfVxuXG4gICAgdHJhbnNpdGlvbiA/XG4gICAgICAkYWN0aXZlXG4gICAgICAgIC5vbmUoJC5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLCBuZXh0KVxuICAgICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoMTUwKSA6XG4gICAgICBuZXh0KClcblxuICAgICRhY3RpdmUucmVtb3ZlQ2xhc3MoJ2luJylcbiAgfVxuXG5cbiAgLy8gVEFCIFBMVUdJTiBERUZJTklUSU9OXG4gIC8vID09PT09PT09PT09PT09PT09PT09PVxuXG4gIHZhciBvbGQgPSAkLmZuLnRhYlxuXG4gICQuZm4udGFiID0gZnVuY3Rpb24gKCBvcHRpb24gKSB7XG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpXG4gICAgICB2YXIgZGF0YSAgPSAkdGhpcy5kYXRhKCdicy50YWInKVxuXG4gICAgICBpZiAoIWRhdGEpICR0aGlzLmRhdGEoJ2JzLnRhYicsIChkYXRhID0gbmV3IFRhYih0aGlzKSkpXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PSAnc3RyaW5nJykgZGF0YVtvcHRpb25dKClcbiAgICB9KVxuICB9XG5cbiAgJC5mbi50YWIuQ29uc3RydWN0b3IgPSBUYWJcblxuXG4gIC8vIFRBQiBOTyBDT05GTElDVFxuICAvLyA9PT09PT09PT09PT09PT1cblxuICAkLmZuLnRhYi5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICQuZm4udGFiID0gb2xkXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG5cbiAgLy8gVEFCIERBVEEtQVBJXG4gIC8vID09PT09PT09PT09PVxuXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljay5icy50YWIuZGF0YS1hcGknLCAnW2RhdGEtdG9nZ2xlPVwidGFiXCJdLCBbZGF0YS10b2dnbGU9XCJwaWxsXCJdJywgZnVuY3Rpb24gKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAkKHRoaXMpLnRhYignc2hvdycpXG4gIH0pXG5cbn0od2luZG93LmpRdWVyeSk7XG5cbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQm9vdHN0cmFwOiBhZmZpeC5qcyB2My4wLjBcbiAqIGh0dHA6Ly90d2JzLmdpdGh1Yi5jb20vYm9vdHN0cmFwL2phdmFzY3JpcHQuaHRtbCNhZmZpeFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBDb3B5cmlnaHQgMjAxMiBUd2l0dGVyLCBJbmMuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuXG4rZnVuY3Rpb24gKCQpIHsgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgLy8gQUZGSVggQ0xBU1MgREVGSU5JVElPTlxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09XG5cbiAgdmFyIEFmZml4ID0gZnVuY3Rpb24gKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgQWZmaXguREVGQVVMVFMsIG9wdGlvbnMpXG4gICAgdGhpcy4kd2luZG93ID0gJCh3aW5kb3cpXG4gICAgICAub24oJ3Njcm9sbC5icy5hZmZpeC5kYXRhLWFwaScsICQucHJveHkodGhpcy5jaGVja1Bvc2l0aW9uLCB0aGlzKSlcbiAgICAgIC5vbignY2xpY2suYnMuYWZmaXguZGF0YS1hcGknLCAgJC5wcm94eSh0aGlzLmNoZWNrUG9zaXRpb25XaXRoRXZlbnRMb29wLCB0aGlzKSlcblxuICAgIHRoaXMuJGVsZW1lbnQgPSAkKGVsZW1lbnQpXG4gICAgdGhpcy5hZmZpeGVkICA9XG4gICAgdGhpcy51bnBpbiAgICA9IG51bGxcblxuICAgIHRoaXMuY2hlY2tQb3NpdGlvbigpXG4gIH1cblxuICBBZmZpeC5SRVNFVCA9ICdhZmZpeCBhZmZpeC10b3AgYWZmaXgtYm90dG9tJ1xuXG4gIEFmZml4LkRFRkFVTFRTID0ge1xuICAgIG9mZnNldDogMFxuICB9XG5cbiAgQWZmaXgucHJvdG90eXBlLmNoZWNrUG9zaXRpb25XaXRoRXZlbnRMb29wID0gZnVuY3Rpb24gKCkge1xuICAgIHNldFRpbWVvdXQoJC5wcm94eSh0aGlzLmNoZWNrUG9zaXRpb24sIHRoaXMpLCAxKVxuICB9XG5cbiAgQWZmaXgucHJvdG90eXBlLmNoZWNrUG9zaXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLiRlbGVtZW50LmlzKCc6dmlzaWJsZScpKSByZXR1cm5cblxuICAgIHZhciBzY3JvbGxIZWlnaHQgPSAkKGRvY3VtZW50KS5oZWlnaHQoKVxuICAgIHZhciBzY3JvbGxUb3AgICAgPSB0aGlzLiR3aW5kb3cuc2Nyb2xsVG9wKClcbiAgICB2YXIgcG9zaXRpb24gICAgID0gdGhpcy4kZWxlbWVudC5vZmZzZXQoKVxuICAgIHZhciBvZmZzZXQgICAgICAgPSB0aGlzLm9wdGlvbnMub2Zmc2V0XG4gICAgdmFyIG9mZnNldFRvcCAgICA9IG9mZnNldC50b3BcbiAgICB2YXIgb2Zmc2V0Qm90dG9tID0gb2Zmc2V0LmJvdHRvbVxuXG4gICAgaWYgKHR5cGVvZiBvZmZzZXQgIT0gJ29iamVjdCcpICAgICAgICAgb2Zmc2V0Qm90dG9tID0gb2Zmc2V0VG9wID0gb2Zmc2V0XG4gICAgaWYgKHR5cGVvZiBvZmZzZXRUb3AgPT0gJ2Z1bmN0aW9uJykgICAgb2Zmc2V0VG9wICAgID0gb2Zmc2V0LnRvcCgpXG4gICAgaWYgKHR5cGVvZiBvZmZzZXRCb3R0b20gPT0gJ2Z1bmN0aW9uJykgb2Zmc2V0Qm90dG9tID0gb2Zmc2V0LmJvdHRvbSgpXG5cbiAgICB2YXIgYWZmaXggPSB0aGlzLnVucGluICAgIT0gbnVsbCAmJiAoc2Nyb2xsVG9wICsgdGhpcy51bnBpbiA8PSBwb3NpdGlvbi50b3ApID8gZmFsc2UgOlxuICAgICAgICAgICAgICAgIG9mZnNldEJvdHRvbSAhPSBudWxsICYmIChwb3NpdGlvbi50b3AgKyB0aGlzLiRlbGVtZW50LmhlaWdodCgpID49IHNjcm9sbEhlaWdodCAtIG9mZnNldEJvdHRvbSkgPyAnYm90dG9tJyA6XG4gICAgICAgICAgICAgICAgb2Zmc2V0VG9wICAgICE9IG51bGwgJiYgKHNjcm9sbFRvcCA8PSBvZmZzZXRUb3ApID8gJ3RvcCcgOiBmYWxzZVxuXG4gICAgaWYgKHRoaXMuYWZmaXhlZCA9PT0gYWZmaXgpIHJldHVyblxuICAgIGlmICh0aGlzLnVucGluKSB0aGlzLiRlbGVtZW50LmNzcygndG9wJywgJycpXG5cbiAgICB0aGlzLmFmZml4ZWQgPSBhZmZpeFxuICAgIHRoaXMudW5waW4gICA9IGFmZml4ID09ICdib3R0b20nID8gcG9zaXRpb24udG9wIC0gc2Nyb2xsVG9wIDogbnVsbFxuXG4gICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcyhBZmZpeC5SRVNFVCkuYWRkQ2xhc3MoJ2FmZml4JyArIChhZmZpeCA/ICctJyArIGFmZml4IDogJycpKVxuXG4gICAgaWYgKGFmZml4ID09ICdib3R0b20nKSB7XG4gICAgICB0aGlzLiRlbGVtZW50Lm9mZnNldCh7IHRvcDogZG9jdW1lbnQuYm9keS5vZmZzZXRIZWlnaHQgLSBvZmZzZXRCb3R0b20gLSB0aGlzLiRlbGVtZW50LmhlaWdodCgpIH0pXG4gICAgfVxuICB9XG5cblxuICAvLyBBRkZJWCBQTFVHSU4gREVGSU5JVElPTlxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIHZhciBvbGQgPSAkLmZuLmFmZml4XG5cbiAgJC5mbi5hZmZpeCA9IGZ1bmN0aW9uIChvcHRpb24pIHtcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciAkdGhpcyAgID0gJCh0aGlzKVxuICAgICAgdmFyIGRhdGEgICAgPSAkdGhpcy5kYXRhKCdicy5hZmZpeCcpXG4gICAgICB2YXIgb3B0aW9ucyA9IHR5cGVvZiBvcHRpb24gPT0gJ29iamVjdCcgJiYgb3B0aW9uXG5cbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgnYnMuYWZmaXgnLCAoZGF0YSA9IG5ldyBBZmZpeCh0aGlzLCBvcHRpb25zKSkpXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PSAnc3RyaW5nJykgZGF0YVtvcHRpb25dKClcbiAgICB9KVxuICB9XG5cbiAgJC5mbi5hZmZpeC5Db25zdHJ1Y3RvciA9IEFmZml4XG5cblxuICAvLyBBRkZJWCBOTyBDT05GTElDVFxuICAvLyA9PT09PT09PT09PT09PT09PVxuXG4gICQuZm4uYWZmaXgubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAkLmZuLmFmZml4ID0gb2xkXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG5cbiAgLy8gQUZGSVggREFUQS1BUElcbiAgLy8gPT09PT09PT09PT09PT1cblxuICAkKHdpbmRvdykub24oJ2xvYWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgJCgnW2RhdGEtc3B5PVwiYWZmaXhcIl0nKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciAkc3B5ID0gJCh0aGlzKVxuICAgICAgdmFyIGRhdGEgPSAkc3B5LmRhdGEoKVxuXG4gICAgICBkYXRhLm9mZnNldCA9IGRhdGEub2Zmc2V0IHx8IHt9XG5cbiAgICAgIGlmIChkYXRhLm9mZnNldEJvdHRvbSkgZGF0YS5vZmZzZXQuYm90dG9tID0gZGF0YS5vZmZzZXRCb3R0b21cbiAgICAgIGlmIChkYXRhLm9mZnNldFRvcCkgICAgZGF0YS5vZmZzZXQudG9wICAgID0gZGF0YS5vZmZzZXRUb3BcblxuICAgICAgJHNweS5hZmZpeChkYXRhKVxuICAgIH0pXG4gIH0pXG5cbn0od2luZG93LmpRdWVyeSk7XG5cbn0pLmNhbGwoZ2xvYmFsLCBtb2R1bGUsIHVuZGVmaW5lZCk7XG4iLCIvKiFcbiAqIGpRdWVyeSBKYXZhU2NyaXB0IExpYnJhcnkgdjEuMTAuMlxuICogaHR0cDovL2pxdWVyeS5jb20vXG4gKlxuICogSW5jbHVkZXMgU2l6emxlLmpzXG4gKiBodHRwOi8vc2l6emxlanMuY29tL1xuICpcbiAqIENvcHlyaWdodCAyMDA1LCAyMDEzIGpRdWVyeSBGb3VuZGF0aW9uLCBJbmMuIGFuZCBvdGhlciBjb250cmlidXRvcnNcbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxuICogaHR0cDovL2pxdWVyeS5vcmcvbGljZW5zZVxuICpcbiAqIERhdGU6IDIwMTMtMDctMDNUMTM6NDhaXG4gKi9cbihmdW5jdGlvbiggd2luZG93LCB1bmRlZmluZWQgKSB7XG5cbi8vIENhbid0IGRvIHRoaXMgYmVjYXVzZSBzZXZlcmFsIGFwcHMgaW5jbHVkaW5nIEFTUC5ORVQgdHJhY2Vcbi8vIHRoZSBzdGFjayB2aWEgYXJndW1lbnRzLmNhbGxlci5jYWxsZWUgYW5kIEZpcmVmb3ggZGllcyBpZlxuLy8geW91IHRyeSB0byB0cmFjZSB0aHJvdWdoIFwidXNlIHN0cmljdFwiIGNhbGwgY2hhaW5zLiAoIzEzMzM1KVxuLy8gU3VwcG9ydDogRmlyZWZveCAxOCtcbi8vXCJ1c2Ugc3RyaWN0XCI7XG52YXJcbiAgLy8gVGhlIGRlZmVycmVkIHVzZWQgb24gRE9NIHJlYWR5XG4gIHJlYWR5TGlzdCxcblxuICAvLyBBIGNlbnRyYWwgcmVmZXJlbmNlIHRvIHRoZSByb290IGpRdWVyeShkb2N1bWVudClcbiAgcm9vdGpRdWVyeSxcblxuICAvLyBTdXBwb3J0OiBJRTwxMFxuICAvLyBGb3IgYHR5cGVvZiB4bWxOb2RlLm1ldGhvZGAgaW5zdGVhZCBvZiBgeG1sTm9kZS5tZXRob2QgIT09IHVuZGVmaW5lZGBcbiAgY29yZV9zdHJ1bmRlZmluZWQgPSB0eXBlb2YgdW5kZWZpbmVkLFxuXG4gIC8vIFVzZSB0aGUgY29ycmVjdCBkb2N1bWVudCBhY2NvcmRpbmdseSB3aXRoIHdpbmRvdyBhcmd1bWVudCAoc2FuZGJveClcbiAgbG9jYXRpb24gPSB3aW5kb3cubG9jYXRpb24sXG4gIGRvY3VtZW50ID0gd2luZG93LmRvY3VtZW50LFxuICBkb2NFbGVtID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LFxuXG4gIC8vIE1hcCBvdmVyIGpRdWVyeSBpbiBjYXNlIG9mIG92ZXJ3cml0ZVxuICBfalF1ZXJ5ID0gd2luZG93LmpRdWVyeSxcblxuICAvLyBNYXAgb3ZlciB0aGUgJCBpbiBjYXNlIG9mIG92ZXJ3cml0ZVxuICBfJCA9IHdpbmRvdy4kLFxuXG4gIC8vIFtbQ2xhc3NdXSAtPiB0eXBlIHBhaXJzXG4gIGNsYXNzMnR5cGUgPSB7fSxcblxuICAvLyBMaXN0IG9mIGRlbGV0ZWQgZGF0YSBjYWNoZSBpZHMsIHNvIHdlIGNhbiByZXVzZSB0aGVtXG4gIGNvcmVfZGVsZXRlZElkcyA9IFtdLFxuXG4gIGNvcmVfdmVyc2lvbiA9IFwiMS4xMC4yXCIsXG5cbiAgLy8gU2F2ZSBhIHJlZmVyZW5jZSB0byBzb21lIGNvcmUgbWV0aG9kc1xuICBjb3JlX2NvbmNhdCA9IGNvcmVfZGVsZXRlZElkcy5jb25jYXQsXG4gIGNvcmVfcHVzaCA9IGNvcmVfZGVsZXRlZElkcy5wdXNoLFxuICBjb3JlX3NsaWNlID0gY29yZV9kZWxldGVkSWRzLnNsaWNlLFxuICBjb3JlX2luZGV4T2YgPSBjb3JlX2RlbGV0ZWRJZHMuaW5kZXhPZixcbiAgY29yZV90b1N0cmluZyA9IGNsYXNzMnR5cGUudG9TdHJpbmcsXG4gIGNvcmVfaGFzT3duID0gY2xhc3MydHlwZS5oYXNPd25Qcm9wZXJ0eSxcbiAgY29yZV90cmltID0gY29yZV92ZXJzaW9uLnRyaW0sXG5cbiAgLy8gRGVmaW5lIGEgbG9jYWwgY29weSBvZiBqUXVlcnlcbiAgalF1ZXJ5ID0gZnVuY3Rpb24oIHNlbGVjdG9yLCBjb250ZXh0ICkge1xuICAgIC8vIFRoZSBqUXVlcnkgb2JqZWN0IGlzIGFjdHVhbGx5IGp1c3QgdGhlIGluaXQgY29uc3RydWN0b3IgJ2VuaGFuY2VkJ1xuICAgIHJldHVybiBuZXcgalF1ZXJ5LmZuLmluaXQoIHNlbGVjdG9yLCBjb250ZXh0LCByb290alF1ZXJ5ICk7XG4gIH0sXG5cbiAgLy8gVXNlZCBmb3IgbWF0Y2hpbmcgbnVtYmVyc1xuICBjb3JlX3BudW0gPSAvWystXT8oPzpcXGQqXFwufClcXGQrKD86W2VFXVsrLV0/XFxkK3wpLy5zb3VyY2UsXG5cbiAgLy8gVXNlZCBmb3Igc3BsaXR0aW5nIG9uIHdoaXRlc3BhY2VcbiAgY29yZV9ybm90d2hpdGUgPSAvXFxTKy9nLFxuXG4gIC8vIE1ha2Ugc3VyZSB3ZSB0cmltIEJPTSBhbmQgTkJTUCAoaGVyZSdzIGxvb2tpbmcgYXQgeW91LCBTYWZhcmkgNS4wIGFuZCBJRSlcbiAgcnRyaW0gPSAvXltcXHNcXHVGRUZGXFx4QTBdK3xbXFxzXFx1RkVGRlxceEEwXSskL2csXG5cbiAgLy8gQSBzaW1wbGUgd2F5IHRvIGNoZWNrIGZvciBIVE1MIHN0cmluZ3NcbiAgLy8gUHJpb3JpdGl6ZSAjaWQgb3ZlciA8dGFnPiB0byBhdm9pZCBYU1MgdmlhIGxvY2F0aW9uLmhhc2ggKCM5NTIxKVxuICAvLyBTdHJpY3QgSFRNTCByZWNvZ25pdGlvbiAoIzExMjkwOiBtdXN0IHN0YXJ0IHdpdGggPClcbiAgcnF1aWNrRXhwciA9IC9eKD86XFxzKig8W1xcd1xcV10rPilbXj5dKnwjKFtcXHctXSopKSQvLFxuXG4gIC8vIE1hdGNoIGEgc3RhbmRhbG9uZSB0YWdcbiAgcnNpbmdsZVRhZyA9IC9ePChcXHcrKVxccypcXC8/Pig/OjxcXC9cXDE+fCkkLyxcblxuICAvLyBKU09OIFJlZ0V4cFxuICBydmFsaWRjaGFycyA9IC9eW1xcXSw6e31cXHNdKiQvLFxuICBydmFsaWRicmFjZXMgPSAvKD86Xnw6fCwpKD86XFxzKlxcWykrL2csXG4gIHJ2YWxpZGVzY2FwZSA9IC9cXFxcKD86W1wiXFxcXFxcL2JmbnJ0XXx1W1xcZGEtZkEtRl17NH0pL2csXG4gIHJ2YWxpZHRva2VucyA9IC9cIlteXCJcXFxcXFxyXFxuXSpcInx0cnVlfGZhbHNlfG51bGx8LT8oPzpcXGQrXFwufClcXGQrKD86W2VFXVsrLV0/XFxkK3wpL2csXG5cbiAgLy8gTWF0Y2hlcyBkYXNoZWQgc3RyaW5nIGZvciBjYW1lbGl6aW5nXG4gIHJtc1ByZWZpeCA9IC9eLW1zLS8sXG4gIHJkYXNoQWxwaGEgPSAvLShbXFxkYS16XSkvZ2ksXG5cbiAgLy8gVXNlZCBieSBqUXVlcnkuY2FtZWxDYXNlIGFzIGNhbGxiYWNrIHRvIHJlcGxhY2UoKVxuICBmY2FtZWxDYXNlID0gZnVuY3Rpb24oIGFsbCwgbGV0dGVyICkge1xuICAgIHJldHVybiBsZXR0ZXIudG9VcHBlckNhc2UoKTtcbiAgfSxcblxuICAvLyBUaGUgcmVhZHkgZXZlbnQgaGFuZGxlclxuICBjb21wbGV0ZWQgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG5cbiAgICAvLyByZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIgaXMgZ29vZCBlbm91Z2ggZm9yIHVzIHRvIGNhbGwgdGhlIGRvbSByZWFkeSBpbiBvbGRJRVxuICAgIGlmICggZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciB8fCBldmVudC50eXBlID09PSBcImxvYWRcIiB8fCBkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIgKSB7XG4gICAgICBkZXRhY2goKTtcbiAgICAgIGpRdWVyeS5yZWFkeSgpO1xuICAgIH1cbiAgfSxcbiAgLy8gQ2xlYW4tdXAgbWV0aG9kIGZvciBkb20gcmVhZHkgZXZlbnRzXG4gIGRldGFjaCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICggZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciApIHtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoIFwiRE9NQ29udGVudExvYWRlZFwiLCBjb21wbGV0ZWQsIGZhbHNlICk7XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggXCJsb2FkXCIsIGNvbXBsZXRlZCwgZmFsc2UgKTtcblxuICAgIH0gZWxzZSB7XG4gICAgICBkb2N1bWVudC5kZXRhY2hFdmVudCggXCJvbnJlYWR5c3RhdGVjaGFuZ2VcIiwgY29tcGxldGVkICk7XG4gICAgICB3aW5kb3cuZGV0YWNoRXZlbnQoIFwib25sb2FkXCIsIGNvbXBsZXRlZCApO1xuICAgIH1cbiAgfTtcblxualF1ZXJ5LmZuID0galF1ZXJ5LnByb3RvdHlwZSA9IHtcbiAgLy8gVGhlIGN1cnJlbnQgdmVyc2lvbiBvZiBqUXVlcnkgYmVpbmcgdXNlZFxuICBqcXVlcnk6IGNvcmVfdmVyc2lvbixcblxuICBjb25zdHJ1Y3RvcjogalF1ZXJ5LFxuICBpbml0OiBmdW5jdGlvbiggc2VsZWN0b3IsIGNvbnRleHQsIHJvb3RqUXVlcnkgKSB7XG4gICAgdmFyIG1hdGNoLCBlbGVtO1xuXG4gICAgLy8gSEFORExFOiAkKFwiXCIpLCAkKG51bGwpLCAkKHVuZGVmaW5lZCksICQoZmFsc2UpXG4gICAgaWYgKCAhc2VsZWN0b3IgKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgSFRNTCBzdHJpbmdzXG4gICAgaWYgKCB0eXBlb2Ygc2VsZWN0b3IgPT09IFwic3RyaW5nXCIgKSB7XG4gICAgICBpZiAoIHNlbGVjdG9yLmNoYXJBdCgwKSA9PT0gXCI8XCIgJiYgc2VsZWN0b3IuY2hhckF0KCBzZWxlY3Rvci5sZW5ndGggLSAxICkgPT09IFwiPlwiICYmIHNlbGVjdG9yLmxlbmd0aCA+PSAzICkge1xuICAgICAgICAvLyBBc3N1bWUgdGhhdCBzdHJpbmdzIHRoYXQgc3RhcnQgYW5kIGVuZCB3aXRoIDw+IGFyZSBIVE1MIGFuZCBza2lwIHRoZSByZWdleCBjaGVja1xuICAgICAgICBtYXRjaCA9IFsgbnVsbCwgc2VsZWN0b3IsIG51bGwgXTtcblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWF0Y2ggPSBycXVpY2tFeHByLmV4ZWMoIHNlbGVjdG9yICk7XG4gICAgICB9XG5cbiAgICAgIC8vIE1hdGNoIGh0bWwgb3IgbWFrZSBzdXJlIG5vIGNvbnRleHQgaXMgc3BlY2lmaWVkIGZvciAjaWRcbiAgICAgIGlmICggbWF0Y2ggJiYgKG1hdGNoWzFdIHx8ICFjb250ZXh0KSApIHtcblxuICAgICAgICAvLyBIQU5ETEU6ICQoaHRtbCkgLT4gJChhcnJheSlcbiAgICAgICAgaWYgKCBtYXRjaFsxXSApIHtcbiAgICAgICAgICBjb250ZXh0ID0gY29udGV4dCBpbnN0YW5jZW9mIGpRdWVyeSA/IGNvbnRleHRbMF0gOiBjb250ZXh0O1xuXG4gICAgICAgICAgLy8gc2NyaXB0cyBpcyB0cnVlIGZvciBiYWNrLWNvbXBhdFxuICAgICAgICAgIGpRdWVyeS5tZXJnZSggdGhpcywgalF1ZXJ5LnBhcnNlSFRNTChcbiAgICAgICAgICAgIG1hdGNoWzFdLFxuICAgICAgICAgICAgY29udGV4dCAmJiBjb250ZXh0Lm5vZGVUeXBlID8gY29udGV4dC5vd25lckRvY3VtZW50IHx8IGNvbnRleHQgOiBkb2N1bWVudCxcbiAgICAgICAgICAgIHRydWVcbiAgICAgICAgICApICk7XG5cbiAgICAgICAgICAvLyBIQU5ETEU6ICQoaHRtbCwgcHJvcHMpXG4gICAgICAgICAgaWYgKCByc2luZ2xlVGFnLnRlc3QoIG1hdGNoWzFdICkgJiYgalF1ZXJ5LmlzUGxhaW5PYmplY3QoIGNvbnRleHQgKSApIHtcbiAgICAgICAgICAgIGZvciAoIG1hdGNoIGluIGNvbnRleHQgKSB7XG4gICAgICAgICAgICAgIC8vIFByb3BlcnRpZXMgb2YgY29udGV4dCBhcmUgY2FsbGVkIGFzIG1ldGhvZHMgaWYgcG9zc2libGVcbiAgICAgICAgICAgICAgaWYgKCBqUXVlcnkuaXNGdW5jdGlvbiggdGhpc1sgbWF0Y2ggXSApICkge1xuICAgICAgICAgICAgICAgIHRoaXNbIG1hdGNoIF0oIGNvbnRleHRbIG1hdGNoIF0gKTtcblxuICAgICAgICAgICAgICAvLyAuLi5hbmQgb3RoZXJ3aXNlIHNldCBhcyBhdHRyaWJ1dGVzXG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hdHRyKCBtYXRjaCwgY29udGV4dFsgbWF0Y2ggXSApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICAgICAgLy8gSEFORExFOiAkKCNpZClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlbGVtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoIG1hdGNoWzJdICk7XG5cbiAgICAgICAgICAvLyBDaGVjayBwYXJlbnROb2RlIHRvIGNhdGNoIHdoZW4gQmxhY2tiZXJyeSA0LjYgcmV0dXJuc1xuICAgICAgICAgIC8vIG5vZGVzIHRoYXQgYXJlIG5vIGxvbmdlciBpbiB0aGUgZG9jdW1lbnQgIzY5NjNcbiAgICAgICAgICBpZiAoIGVsZW0gJiYgZWxlbS5wYXJlbnROb2RlICkge1xuICAgICAgICAgICAgLy8gSGFuZGxlIHRoZSBjYXNlIHdoZXJlIElFIGFuZCBPcGVyYSByZXR1cm4gaXRlbXNcbiAgICAgICAgICAgIC8vIGJ5IG5hbWUgaW5zdGVhZCBvZiBJRFxuICAgICAgICAgICAgaWYgKCBlbGVtLmlkICE9PSBtYXRjaFsyXSApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHJvb3RqUXVlcnkuZmluZCggc2VsZWN0b3IgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gT3RoZXJ3aXNlLCB3ZSBpbmplY3QgdGhlIGVsZW1lbnQgZGlyZWN0bHkgaW50byB0aGUgalF1ZXJ5IG9iamVjdFxuICAgICAgICAgICAgdGhpcy5sZW5ndGggPSAxO1xuICAgICAgICAgICAgdGhpc1swXSA9IGVsZW07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5jb250ZXh0ID0gZG9jdW1lbnQ7XG4gICAgICAgICAgdGhpcy5zZWxlY3RvciA9IHNlbGVjdG9yO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgIC8vIEhBTkRMRTogJChleHByLCAkKC4uLikpXG4gICAgICB9IGVsc2UgaWYgKCAhY29udGV4dCB8fCBjb250ZXh0LmpxdWVyeSApIHtcbiAgICAgICAgcmV0dXJuICggY29udGV4dCB8fCByb290alF1ZXJ5ICkuZmluZCggc2VsZWN0b3IgKTtcblxuICAgICAgLy8gSEFORExFOiAkKGV4cHIsIGNvbnRleHQpXG4gICAgICAvLyAod2hpY2ggaXMganVzdCBlcXVpdmFsZW50IHRvOiAkKGNvbnRleHQpLmZpbmQoZXhwcilcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yKCBjb250ZXh0ICkuZmluZCggc2VsZWN0b3IgKTtcbiAgICAgIH1cblxuICAgIC8vIEhBTkRMRTogJChET01FbGVtZW50KVxuICAgIH0gZWxzZSBpZiAoIHNlbGVjdG9yLm5vZGVUeXBlICkge1xuICAgICAgdGhpcy5jb250ZXh0ID0gdGhpc1swXSA9IHNlbGVjdG9yO1xuICAgICAgdGhpcy5sZW5ndGggPSAxO1xuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICAvLyBIQU5ETEU6ICQoZnVuY3Rpb24pXG4gICAgLy8gU2hvcnRjdXQgZm9yIGRvY3VtZW50IHJlYWR5XG4gICAgfSBlbHNlIGlmICggalF1ZXJ5LmlzRnVuY3Rpb24oIHNlbGVjdG9yICkgKSB7XG4gICAgICByZXR1cm4gcm9vdGpRdWVyeS5yZWFkeSggc2VsZWN0b3IgKTtcbiAgICB9XG5cbiAgICBpZiAoIHNlbGVjdG9yLnNlbGVjdG9yICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICB0aGlzLnNlbGVjdG9yID0gc2VsZWN0b3Iuc2VsZWN0b3I7XG4gICAgICB0aGlzLmNvbnRleHQgPSBzZWxlY3Rvci5jb250ZXh0O1xuICAgIH1cblxuICAgIHJldHVybiBqUXVlcnkubWFrZUFycmF5KCBzZWxlY3RvciwgdGhpcyApO1xuICB9LFxuXG4gIC8vIFN0YXJ0IHdpdGggYW4gZW1wdHkgc2VsZWN0b3JcbiAgc2VsZWN0b3I6IFwiXCIsXG5cbiAgLy8gVGhlIGRlZmF1bHQgbGVuZ3RoIG9mIGEgalF1ZXJ5IG9iamVjdCBpcyAwXG4gIGxlbmd0aDogMCxcblxuICB0b0FycmF5OiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gY29yZV9zbGljZS5jYWxsKCB0aGlzICk7XG4gIH0sXG5cbiAgLy8gR2V0IHRoZSBOdGggZWxlbWVudCBpbiB0aGUgbWF0Y2hlZCBlbGVtZW50IHNldCBPUlxuICAvLyBHZXQgdGhlIHdob2xlIG1hdGNoZWQgZWxlbWVudCBzZXQgYXMgYSBjbGVhbiBhcnJheVxuICBnZXQ6IGZ1bmN0aW9uKCBudW0gKSB7XG4gICAgcmV0dXJuIG51bSA9PSBudWxsID9cblxuICAgICAgLy8gUmV0dXJuIGEgJ2NsZWFuJyBhcnJheVxuICAgICAgdGhpcy50b0FycmF5KCkgOlxuXG4gICAgICAvLyBSZXR1cm4ganVzdCB0aGUgb2JqZWN0XG4gICAgICAoIG51bSA8IDAgPyB0aGlzWyB0aGlzLmxlbmd0aCArIG51bSBdIDogdGhpc1sgbnVtIF0gKTtcbiAgfSxcblxuICAvLyBUYWtlIGFuIGFycmF5IG9mIGVsZW1lbnRzIGFuZCBwdXNoIGl0IG9udG8gdGhlIHN0YWNrXG4gIC8vIChyZXR1cm5pbmcgdGhlIG5ldyBtYXRjaGVkIGVsZW1lbnQgc2V0KVxuICBwdXNoU3RhY2s6IGZ1bmN0aW9uKCBlbGVtcyApIHtcblxuICAgIC8vIEJ1aWxkIGEgbmV3IGpRdWVyeSBtYXRjaGVkIGVsZW1lbnQgc2V0XG4gICAgdmFyIHJldCA9IGpRdWVyeS5tZXJnZSggdGhpcy5jb25zdHJ1Y3RvcigpLCBlbGVtcyApO1xuXG4gICAgLy8gQWRkIHRoZSBvbGQgb2JqZWN0IG9udG8gdGhlIHN0YWNrIChhcyBhIHJlZmVyZW5jZSlcbiAgICByZXQucHJldk9iamVjdCA9IHRoaXM7XG4gICAgcmV0LmNvbnRleHQgPSB0aGlzLmNvbnRleHQ7XG5cbiAgICAvLyBSZXR1cm4gdGhlIG5ld2x5LWZvcm1lZCBlbGVtZW50IHNldFxuICAgIHJldHVybiByZXQ7XG4gIH0sXG5cbiAgLy8gRXhlY3V0ZSBhIGNhbGxiYWNrIGZvciBldmVyeSBlbGVtZW50IGluIHRoZSBtYXRjaGVkIHNldC5cbiAgLy8gKFlvdSBjYW4gc2VlZCB0aGUgYXJndW1lbnRzIHdpdGggYW4gYXJyYXkgb2YgYXJncywgYnV0IHRoaXMgaXNcbiAgLy8gb25seSB1c2VkIGludGVybmFsbHkuKVxuICBlYWNoOiBmdW5jdGlvbiggY2FsbGJhY2ssIGFyZ3MgKSB7XG4gICAgcmV0dXJuIGpRdWVyeS5lYWNoKCB0aGlzLCBjYWxsYmFjaywgYXJncyApO1xuICB9LFxuXG4gIHJlYWR5OiBmdW5jdGlvbiggZm4gKSB7XG4gICAgLy8gQWRkIHRoZSBjYWxsYmFja1xuICAgIGpRdWVyeS5yZWFkeS5wcm9taXNlKCkuZG9uZSggZm4gKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIHNsaWNlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5wdXNoU3RhY2soIGNvcmVfc2xpY2UuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApICk7XG4gIH0sXG5cbiAgZmlyc3Q6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmVxKCAwICk7XG4gIH0sXG5cbiAgbGFzdDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZXEoIC0xICk7XG4gIH0sXG5cbiAgZXE6IGZ1bmN0aW9uKCBpICkge1xuICAgIHZhciBsZW4gPSB0aGlzLmxlbmd0aCxcbiAgICAgIGogPSAraSArICggaSA8IDAgPyBsZW4gOiAwICk7XG4gICAgcmV0dXJuIHRoaXMucHVzaFN0YWNrKCBqID49IDAgJiYgaiA8IGxlbiA/IFsgdGhpc1tqXSBdIDogW10gKTtcbiAgfSxcblxuICBtYXA6IGZ1bmN0aW9uKCBjYWxsYmFjayApIHtcbiAgICByZXR1cm4gdGhpcy5wdXNoU3RhY2soIGpRdWVyeS5tYXAodGhpcywgZnVuY3Rpb24oIGVsZW0sIGkgKSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2suY2FsbCggZWxlbSwgaSwgZWxlbSApO1xuICAgIH0pKTtcbiAgfSxcblxuICBlbmQ6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnByZXZPYmplY3QgfHwgdGhpcy5jb25zdHJ1Y3RvcihudWxsKTtcbiAgfSxcblxuICAvLyBGb3IgaW50ZXJuYWwgdXNlIG9ubHkuXG4gIC8vIEJlaGF2ZXMgbGlrZSBhbiBBcnJheSdzIG1ldGhvZCwgbm90IGxpa2UgYSBqUXVlcnkgbWV0aG9kLlxuICBwdXNoOiBjb3JlX3B1c2gsXG4gIHNvcnQ6IFtdLnNvcnQsXG4gIHNwbGljZTogW10uc3BsaWNlXG59O1xuXG4vLyBHaXZlIHRoZSBpbml0IGZ1bmN0aW9uIHRoZSBqUXVlcnkgcHJvdG90eXBlIGZvciBsYXRlciBpbnN0YW50aWF0aW9uXG5qUXVlcnkuZm4uaW5pdC5wcm90b3R5cGUgPSBqUXVlcnkuZm47XG5cbmpRdWVyeS5leHRlbmQgPSBqUXVlcnkuZm4uZXh0ZW5kID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzcmMsIGNvcHlJc0FycmF5LCBjb3B5LCBuYW1lLCBvcHRpb25zLCBjbG9uZSxcbiAgICB0YXJnZXQgPSBhcmd1bWVudHNbMF0gfHwge30sXG4gICAgaSA9IDEsXG4gICAgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aCxcbiAgICBkZWVwID0gZmFsc2U7XG5cbiAgLy8gSGFuZGxlIGEgZGVlcCBjb3B5IHNpdHVhdGlvblxuICBpZiAoIHR5cGVvZiB0YXJnZXQgPT09IFwiYm9vbGVhblwiICkge1xuICAgIGRlZXAgPSB0YXJnZXQ7XG4gICAgdGFyZ2V0ID0gYXJndW1lbnRzWzFdIHx8IHt9O1xuICAgIC8vIHNraXAgdGhlIGJvb2xlYW4gYW5kIHRoZSB0YXJnZXRcbiAgICBpID0gMjtcbiAgfVxuXG4gIC8vIEhhbmRsZSBjYXNlIHdoZW4gdGFyZ2V0IGlzIGEgc3RyaW5nIG9yIHNvbWV0aGluZyAocG9zc2libGUgaW4gZGVlcCBjb3B5KVxuICBpZiAoIHR5cGVvZiB0YXJnZXQgIT09IFwib2JqZWN0XCIgJiYgIWpRdWVyeS5pc0Z1bmN0aW9uKHRhcmdldCkgKSB7XG4gICAgdGFyZ2V0ID0ge307XG4gIH1cblxuICAvLyBleHRlbmQgalF1ZXJ5IGl0c2VsZiBpZiBvbmx5IG9uZSBhcmd1bWVudCBpcyBwYXNzZWRcbiAgaWYgKCBsZW5ndGggPT09IGkgKSB7XG4gICAgdGFyZ2V0ID0gdGhpcztcbiAgICAtLWk7XG4gIH1cblxuICBmb3IgKCA7IGkgPCBsZW5ndGg7IGkrKyApIHtcbiAgICAvLyBPbmx5IGRlYWwgd2l0aCBub24tbnVsbC91bmRlZmluZWQgdmFsdWVzXG4gICAgaWYgKCAob3B0aW9ucyA9IGFyZ3VtZW50c1sgaSBdKSAhPSBudWxsICkge1xuICAgICAgLy8gRXh0ZW5kIHRoZSBiYXNlIG9iamVjdFxuICAgICAgZm9yICggbmFtZSBpbiBvcHRpb25zICkge1xuICAgICAgICBzcmMgPSB0YXJnZXRbIG5hbWUgXTtcbiAgICAgICAgY29weSA9IG9wdGlvbnNbIG5hbWUgXTtcblxuICAgICAgICAvLyBQcmV2ZW50IG5ldmVyLWVuZGluZyBsb29wXG4gICAgICAgIGlmICggdGFyZ2V0ID09PSBjb3B5ICkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVjdXJzZSBpZiB3ZSdyZSBtZXJnaW5nIHBsYWluIG9iamVjdHMgb3IgYXJyYXlzXG4gICAgICAgIGlmICggZGVlcCAmJiBjb3B5ICYmICggalF1ZXJ5LmlzUGxhaW5PYmplY3QoY29weSkgfHwgKGNvcHlJc0FycmF5ID0galF1ZXJ5LmlzQXJyYXkoY29weSkpICkgKSB7XG4gICAgICAgICAgaWYgKCBjb3B5SXNBcnJheSApIHtcbiAgICAgICAgICAgIGNvcHlJc0FycmF5ID0gZmFsc2U7XG4gICAgICAgICAgICBjbG9uZSA9IHNyYyAmJiBqUXVlcnkuaXNBcnJheShzcmMpID8gc3JjIDogW107XG5cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2xvbmUgPSBzcmMgJiYgalF1ZXJ5LmlzUGxhaW5PYmplY3Qoc3JjKSA/IHNyYyA6IHt9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIE5ldmVyIG1vdmUgb3JpZ2luYWwgb2JqZWN0cywgY2xvbmUgdGhlbVxuICAgICAgICAgIHRhcmdldFsgbmFtZSBdID0galF1ZXJ5LmV4dGVuZCggZGVlcCwgY2xvbmUsIGNvcHkgKTtcblxuICAgICAgICAvLyBEb24ndCBicmluZyBpbiB1bmRlZmluZWQgdmFsdWVzXG4gICAgICAgIH0gZWxzZSBpZiAoIGNvcHkgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICB0YXJnZXRbIG5hbWUgXSA9IGNvcHk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBSZXR1cm4gdGhlIG1vZGlmaWVkIG9iamVjdFxuICByZXR1cm4gdGFyZ2V0O1xufTtcblxualF1ZXJ5LmV4dGVuZCh7XG4gIC8vIFVuaXF1ZSBmb3IgZWFjaCBjb3B5IG9mIGpRdWVyeSBvbiB0aGUgcGFnZVxuICAvLyBOb24tZGlnaXRzIHJlbW92ZWQgdG8gbWF0Y2ggcmlubGluZWpRdWVyeVxuICBleHBhbmRvOiBcImpRdWVyeVwiICsgKCBjb3JlX3ZlcnNpb24gKyBNYXRoLnJhbmRvbSgpICkucmVwbGFjZSggL1xcRC9nLCBcIlwiICksXG5cbiAgbm9Db25mbGljdDogZnVuY3Rpb24oIGRlZXAgKSB7XG4gICAgaWYgKCB3aW5kb3cuJCA9PT0galF1ZXJ5ICkge1xuICAgICAgd2luZG93LiQgPSBfJDtcbiAgICB9XG5cbiAgICBpZiAoIGRlZXAgJiYgd2luZG93LmpRdWVyeSA9PT0galF1ZXJ5ICkge1xuICAgICAgd2luZG93LmpRdWVyeSA9IF9qUXVlcnk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGpRdWVyeTtcbiAgfSxcblxuICAvLyBJcyB0aGUgRE9NIHJlYWR5IHRvIGJlIHVzZWQ/IFNldCB0byB0cnVlIG9uY2UgaXQgb2NjdXJzLlxuICBpc1JlYWR5OiBmYWxzZSxcblxuICAvLyBBIGNvdW50ZXIgdG8gdHJhY2sgaG93IG1hbnkgaXRlbXMgdG8gd2FpdCBmb3IgYmVmb3JlXG4gIC8vIHRoZSByZWFkeSBldmVudCBmaXJlcy4gU2VlICM2NzgxXG4gIHJlYWR5V2FpdDogMSxcblxuICAvLyBIb2xkIChvciByZWxlYXNlKSB0aGUgcmVhZHkgZXZlbnRcbiAgaG9sZFJlYWR5OiBmdW5jdGlvbiggaG9sZCApIHtcbiAgICBpZiAoIGhvbGQgKSB7XG4gICAgICBqUXVlcnkucmVhZHlXYWl0Kys7XG4gICAgfSBlbHNlIHtcbiAgICAgIGpRdWVyeS5yZWFkeSggdHJ1ZSApO1xuICAgIH1cbiAgfSxcblxuICAvLyBIYW5kbGUgd2hlbiB0aGUgRE9NIGlzIHJlYWR5XG4gIHJlYWR5OiBmdW5jdGlvbiggd2FpdCApIHtcblxuICAgIC8vIEFib3J0IGlmIHRoZXJlIGFyZSBwZW5kaW5nIGhvbGRzIG9yIHdlJ3JlIGFscmVhZHkgcmVhZHlcbiAgICBpZiAoIHdhaXQgPT09IHRydWUgPyAtLWpRdWVyeS5yZWFkeVdhaXQgOiBqUXVlcnkuaXNSZWFkeSApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBNYWtlIHN1cmUgYm9keSBleGlzdHMsIGF0IGxlYXN0LCBpbiBjYXNlIElFIGdldHMgYSBsaXR0bGUgb3ZlcnplYWxvdXMgKHRpY2tldCAjNTQ0MykuXG4gICAgaWYgKCAhZG9jdW1lbnQuYm9keSApIHtcbiAgICAgIHJldHVybiBzZXRUaW1lb3V0KCBqUXVlcnkucmVhZHkgKTtcbiAgICB9XG5cbiAgICAvLyBSZW1lbWJlciB0aGF0IHRoZSBET00gaXMgcmVhZHlcbiAgICBqUXVlcnkuaXNSZWFkeSA9IHRydWU7XG5cbiAgICAvLyBJZiBhIG5vcm1hbCBET00gUmVhZHkgZXZlbnQgZmlyZWQsIGRlY3JlbWVudCwgYW5kIHdhaXQgaWYgbmVlZCBiZVxuICAgIGlmICggd2FpdCAhPT0gdHJ1ZSAmJiAtLWpRdWVyeS5yZWFkeVdhaXQgPiAwICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIElmIHRoZXJlIGFyZSBmdW5jdGlvbnMgYm91bmQsIHRvIGV4ZWN1dGVcbiAgICByZWFkeUxpc3QucmVzb2x2ZVdpdGgoIGRvY3VtZW50LCBbIGpRdWVyeSBdICk7XG5cbiAgICAvLyBUcmlnZ2VyIGFueSBib3VuZCByZWFkeSBldmVudHNcbiAgICBpZiAoIGpRdWVyeS5mbi50cmlnZ2VyICkge1xuICAgICAgalF1ZXJ5KCBkb2N1bWVudCApLnRyaWdnZXIoXCJyZWFkeVwiKS5vZmYoXCJyZWFkeVwiKTtcbiAgICB9XG4gIH0sXG5cbiAgLy8gU2VlIHRlc3QvdW5pdC9jb3JlLmpzIGZvciBkZXRhaWxzIGNvbmNlcm5pbmcgaXNGdW5jdGlvbi5cbiAgLy8gU2luY2UgdmVyc2lvbiAxLjMsIERPTSBtZXRob2RzIGFuZCBmdW5jdGlvbnMgbGlrZSBhbGVydFxuICAvLyBhcmVuJ3Qgc3VwcG9ydGVkLiBUaGV5IHJldHVybiBmYWxzZSBvbiBJRSAoIzI5NjgpLlxuICBpc0Z1bmN0aW9uOiBmdW5jdGlvbiggb2JqICkge1xuICAgIHJldHVybiBqUXVlcnkudHlwZShvYmopID09PSBcImZ1bmN0aW9uXCI7XG4gIH0sXG5cbiAgaXNBcnJheTogQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiggb2JqICkge1xuICAgIHJldHVybiBqUXVlcnkudHlwZShvYmopID09PSBcImFycmF5XCI7XG4gIH0sXG5cbiAgaXNXaW5kb3c6IGZ1bmN0aW9uKCBvYmogKSB7XG4gICAgLyoganNoaW50IGVxZXFlcTogZmFsc2UgKi9cbiAgICByZXR1cm4gb2JqICE9IG51bGwgJiYgb2JqID09IG9iai53aW5kb3c7XG4gIH0sXG5cbiAgaXNOdW1lcmljOiBmdW5jdGlvbiggb2JqICkge1xuICAgIHJldHVybiAhaXNOYU4oIHBhcnNlRmxvYXQob2JqKSApICYmIGlzRmluaXRlKCBvYmogKTtcbiAgfSxcblxuICB0eXBlOiBmdW5jdGlvbiggb2JqICkge1xuICAgIGlmICggb2JqID09IG51bGwgKSB7XG4gICAgICByZXR1cm4gU3RyaW5nKCBvYmogKTtcbiAgICB9XG4gICAgcmV0dXJuIHR5cGVvZiBvYmogPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIG9iaiA9PT0gXCJmdW5jdGlvblwiID9cbiAgICAgIGNsYXNzMnR5cGVbIGNvcmVfdG9TdHJpbmcuY2FsbChvYmopIF0gfHwgXCJvYmplY3RcIiA6XG4gICAgICB0eXBlb2Ygb2JqO1xuICB9LFxuXG4gIGlzUGxhaW5PYmplY3Q6IGZ1bmN0aW9uKCBvYmogKSB7XG4gICAgdmFyIGtleTtcblxuICAgIC8vIE11c3QgYmUgYW4gT2JqZWN0LlxuICAgIC8vIEJlY2F1c2Ugb2YgSUUsIHdlIGFsc28gaGF2ZSB0byBjaGVjayB0aGUgcHJlc2VuY2Ugb2YgdGhlIGNvbnN0cnVjdG9yIHByb3BlcnR5LlxuICAgIC8vIE1ha2Ugc3VyZSB0aGF0IERPTSBub2RlcyBhbmQgd2luZG93IG9iamVjdHMgZG9uJ3QgcGFzcyB0aHJvdWdoLCBhcyB3ZWxsXG4gICAgaWYgKCAhb2JqIHx8IGpRdWVyeS50eXBlKG9iaikgIT09IFwib2JqZWN0XCIgfHwgb2JqLm5vZGVUeXBlIHx8IGpRdWVyeS5pc1dpbmRvdyggb2JqICkgKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIC8vIE5vdCBvd24gY29uc3RydWN0b3IgcHJvcGVydHkgbXVzdCBiZSBPYmplY3RcbiAgICAgIGlmICggb2JqLmNvbnN0cnVjdG9yICYmXG4gICAgICAgICFjb3JlX2hhc093bi5jYWxsKG9iaiwgXCJjb25zdHJ1Y3RvclwiKSAmJlxuICAgICAgICAhY29yZV9oYXNPd24uY2FsbChvYmouY29uc3RydWN0b3IucHJvdG90eXBlLCBcImlzUHJvdG90eXBlT2ZcIikgKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9IGNhdGNoICggZSApIHtcbiAgICAgIC8vIElFOCw5IFdpbGwgdGhyb3cgZXhjZXB0aW9ucyBvbiBjZXJ0YWluIGhvc3Qgb2JqZWN0cyAjOTg5N1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIFN1cHBvcnQ6IElFPDlcbiAgICAvLyBIYW5kbGUgaXRlcmF0aW9uIG92ZXIgaW5oZXJpdGVkIHByb3BlcnRpZXMgYmVmb3JlIG93biBwcm9wZXJ0aWVzLlxuICAgIGlmICggalF1ZXJ5LnN1cHBvcnQub3duTGFzdCApIHtcbiAgICAgIGZvciAoIGtleSBpbiBvYmogKSB7XG4gICAgICAgIHJldHVybiBjb3JlX2hhc093bi5jYWxsKCBvYmosIGtleSApO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIE93biBwcm9wZXJ0aWVzIGFyZSBlbnVtZXJhdGVkIGZpcnN0bHksIHNvIHRvIHNwZWVkIHVwLFxuICAgIC8vIGlmIGxhc3Qgb25lIGlzIG93biwgdGhlbiBhbGwgcHJvcGVydGllcyBhcmUgb3duLlxuICAgIGZvciAoIGtleSBpbiBvYmogKSB7fVxuXG4gICAgcmV0dXJuIGtleSA9PT0gdW5kZWZpbmVkIHx8IGNvcmVfaGFzT3duLmNhbGwoIG9iaiwga2V5ICk7XG4gIH0sXG5cbiAgaXNFbXB0eU9iamVjdDogZnVuY3Rpb24oIG9iaiApIHtcbiAgICB2YXIgbmFtZTtcbiAgICBmb3IgKCBuYW1lIGluIG9iaiApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG5cbiAgZXJyb3I6IGZ1bmN0aW9uKCBtc2cgKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCBtc2cgKTtcbiAgfSxcblxuICAvLyBkYXRhOiBzdHJpbmcgb2YgaHRtbFxuICAvLyBjb250ZXh0IChvcHRpb25hbCk6IElmIHNwZWNpZmllZCwgdGhlIGZyYWdtZW50IHdpbGwgYmUgY3JlYXRlZCBpbiB0aGlzIGNvbnRleHQsIGRlZmF1bHRzIHRvIGRvY3VtZW50XG4gIC8vIGtlZXBTY3JpcHRzIChvcHRpb25hbCk6IElmIHRydWUsIHdpbGwgaW5jbHVkZSBzY3JpcHRzIHBhc3NlZCBpbiB0aGUgaHRtbCBzdHJpbmdcbiAgcGFyc2VIVE1MOiBmdW5jdGlvbiggZGF0YSwgY29udGV4dCwga2VlcFNjcmlwdHMgKSB7XG4gICAgaWYgKCAhZGF0YSB8fCB0eXBlb2YgZGF0YSAhPT0gXCJzdHJpbmdcIiApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAoIHR5cGVvZiBjb250ZXh0ID09PSBcImJvb2xlYW5cIiApIHtcbiAgICAgIGtlZXBTY3JpcHRzID0gY29udGV4dDtcbiAgICAgIGNvbnRleHQgPSBmYWxzZTtcbiAgICB9XG4gICAgY29udGV4dCA9IGNvbnRleHQgfHwgZG9jdW1lbnQ7XG5cbiAgICB2YXIgcGFyc2VkID0gcnNpbmdsZVRhZy5leGVjKCBkYXRhICksXG4gICAgICBzY3JpcHRzID0gIWtlZXBTY3JpcHRzICYmIFtdO1xuXG4gICAgLy8gU2luZ2xlIHRhZ1xuICAgIGlmICggcGFyc2VkICkge1xuICAgICAgcmV0dXJuIFsgY29udGV4dC5jcmVhdGVFbGVtZW50KCBwYXJzZWRbMV0gKSBdO1xuICAgIH1cblxuICAgIHBhcnNlZCA9IGpRdWVyeS5idWlsZEZyYWdtZW50KCBbIGRhdGEgXSwgY29udGV4dCwgc2NyaXB0cyApO1xuICAgIGlmICggc2NyaXB0cyApIHtcbiAgICAgIGpRdWVyeSggc2NyaXB0cyApLnJlbW92ZSgpO1xuICAgIH1cbiAgICByZXR1cm4galF1ZXJ5Lm1lcmdlKCBbXSwgcGFyc2VkLmNoaWxkTm9kZXMgKTtcbiAgfSxcblxuICBwYXJzZUpTT046IGZ1bmN0aW9uKCBkYXRhICkge1xuICAgIC8vIEF0dGVtcHQgdG8gcGFyc2UgdXNpbmcgdGhlIG5hdGl2ZSBKU09OIHBhcnNlciBmaXJzdFxuICAgIGlmICggd2luZG93LkpTT04gJiYgd2luZG93LkpTT04ucGFyc2UgKSB7XG4gICAgICByZXR1cm4gd2luZG93LkpTT04ucGFyc2UoIGRhdGEgKTtcbiAgICB9XG5cbiAgICBpZiAoIGRhdGEgPT09IG51bGwgKSB7XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG5cbiAgICBpZiAoIHR5cGVvZiBkYXRhID09PSBcInN0cmluZ1wiICkge1xuXG4gICAgICAvLyBNYWtlIHN1cmUgbGVhZGluZy90cmFpbGluZyB3aGl0ZXNwYWNlIGlzIHJlbW92ZWQgKElFIGNhbid0IGhhbmRsZSBpdClcbiAgICAgIGRhdGEgPSBqUXVlcnkudHJpbSggZGF0YSApO1xuXG4gICAgICBpZiAoIGRhdGEgKSB7XG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgaW5jb21pbmcgZGF0YSBpcyBhY3R1YWwgSlNPTlxuICAgICAgICAvLyBMb2dpYyBib3Jyb3dlZCBmcm9tIGh0dHA6Ly9qc29uLm9yZy9qc29uMi5qc1xuICAgICAgICBpZiAoIHJ2YWxpZGNoYXJzLnRlc3QoIGRhdGEucmVwbGFjZSggcnZhbGlkZXNjYXBlLCBcIkBcIiApXG4gICAgICAgICAgLnJlcGxhY2UoIHJ2YWxpZHRva2VucywgXCJdXCIgKVxuICAgICAgICAgIC5yZXBsYWNlKCBydmFsaWRicmFjZXMsIFwiXCIpKSApIHtcblxuICAgICAgICAgIHJldHVybiAoIG5ldyBGdW5jdGlvbiggXCJyZXR1cm4gXCIgKyBkYXRhICkgKSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgalF1ZXJ5LmVycm9yKCBcIkludmFsaWQgSlNPTjogXCIgKyBkYXRhICk7XG4gIH0sXG5cbiAgLy8gQ3Jvc3MtYnJvd3NlciB4bWwgcGFyc2luZ1xuICBwYXJzZVhNTDogZnVuY3Rpb24oIGRhdGEgKSB7XG4gICAgdmFyIHhtbCwgdG1wO1xuICAgIGlmICggIWRhdGEgfHwgdHlwZW9mIGRhdGEgIT09IFwic3RyaW5nXCIgKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIGlmICggd2luZG93LkRPTVBhcnNlciApIHsgLy8gU3RhbmRhcmRcbiAgICAgICAgdG1wID0gbmV3IERPTVBhcnNlcigpO1xuICAgICAgICB4bWwgPSB0bXAucGFyc2VGcm9tU3RyaW5nKCBkYXRhICwgXCJ0ZXh0L3htbFwiICk7XG4gICAgICB9IGVsc2UgeyAvLyBJRVxuICAgICAgICB4bWwgPSBuZXcgQWN0aXZlWE9iamVjdCggXCJNaWNyb3NvZnQuWE1MRE9NXCIgKTtcbiAgICAgICAgeG1sLmFzeW5jID0gXCJmYWxzZVwiO1xuICAgICAgICB4bWwubG9hZFhNTCggZGF0YSApO1xuICAgICAgfVxuICAgIH0gY2F0Y2goIGUgKSB7XG4gICAgICB4bWwgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGlmICggIXhtbCB8fCAheG1sLmRvY3VtZW50RWxlbWVudCB8fCB4bWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoIFwicGFyc2VyZXJyb3JcIiApLmxlbmd0aCApIHtcbiAgICAgIGpRdWVyeS5lcnJvciggXCJJbnZhbGlkIFhNTDogXCIgKyBkYXRhICk7XG4gICAgfVxuICAgIHJldHVybiB4bWw7XG4gIH0sXG5cbiAgbm9vcDogZnVuY3Rpb24oKSB7fSxcblxuICAvLyBFdmFsdWF0ZXMgYSBzY3JpcHQgaW4gYSBnbG9iYWwgY29udGV4dFxuICAvLyBXb3JrYXJvdW5kcyBiYXNlZCBvbiBmaW5kaW5ncyBieSBKaW0gRHJpc2NvbGxcbiAgLy8gaHR0cDovL3dlYmxvZ3MuamF2YS5uZXQvYmxvZy9kcmlzY29sbC9hcmNoaXZlLzIwMDkvMDkvMDgvZXZhbC1qYXZhc2NyaXB0LWdsb2JhbC1jb250ZXh0XG4gIGdsb2JhbEV2YWw6IGZ1bmN0aW9uKCBkYXRhICkge1xuICAgIGlmICggZGF0YSAmJiBqUXVlcnkudHJpbSggZGF0YSApICkge1xuICAgICAgLy8gV2UgdXNlIGV4ZWNTY3JpcHQgb24gSW50ZXJuZXQgRXhwbG9yZXJcbiAgICAgIC8vIFdlIHVzZSBhbiBhbm9ueW1vdXMgZnVuY3Rpb24gc28gdGhhdCBjb250ZXh0IGlzIHdpbmRvd1xuICAgICAgLy8gcmF0aGVyIHRoYW4galF1ZXJ5IGluIEZpcmVmb3hcbiAgICAgICggd2luZG93LmV4ZWNTY3JpcHQgfHwgZnVuY3Rpb24oIGRhdGEgKSB7XG4gICAgICAgIHdpbmRvd1sgXCJldmFsXCIgXS5jYWxsKCB3aW5kb3csIGRhdGEgKTtcbiAgICAgIH0gKSggZGF0YSApO1xuICAgIH1cbiAgfSxcblxuICAvLyBDb252ZXJ0IGRhc2hlZCB0byBjYW1lbENhc2U7IHVzZWQgYnkgdGhlIGNzcyBhbmQgZGF0YSBtb2R1bGVzXG4gIC8vIE1pY3Jvc29mdCBmb3Jnb3QgdG8gaHVtcCB0aGVpciB2ZW5kb3IgcHJlZml4ICgjOTU3MilcbiAgY2FtZWxDYXNlOiBmdW5jdGlvbiggc3RyaW5nICkge1xuICAgIHJldHVybiBzdHJpbmcucmVwbGFjZSggcm1zUHJlZml4LCBcIm1zLVwiICkucmVwbGFjZSggcmRhc2hBbHBoYSwgZmNhbWVsQ2FzZSApO1xuICB9LFxuXG4gIG5vZGVOYW1lOiBmdW5jdGlvbiggZWxlbSwgbmFtZSApIHtcbiAgICByZXR1cm4gZWxlbS5ub2RlTmFtZSAmJiBlbGVtLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgPT09IG5hbWUudG9Mb3dlckNhc2UoKTtcbiAgfSxcblxuICAvLyBhcmdzIGlzIGZvciBpbnRlcm5hbCB1c2FnZSBvbmx5XG4gIGVhY2g6IGZ1bmN0aW9uKCBvYmosIGNhbGxiYWNrLCBhcmdzICkge1xuICAgIHZhciB2YWx1ZSxcbiAgICAgIGkgPSAwLFxuICAgICAgbGVuZ3RoID0gb2JqLmxlbmd0aCxcbiAgICAgIGlzQXJyYXkgPSBpc0FycmF5bGlrZSggb2JqICk7XG5cbiAgICBpZiAoIGFyZ3MgKSB7XG4gICAgICBpZiAoIGlzQXJyYXkgKSB7XG4gICAgICAgIGZvciAoIDsgaSA8IGxlbmd0aDsgaSsrICkge1xuICAgICAgICAgIHZhbHVlID0gY2FsbGJhY2suYXBwbHkoIG9ialsgaSBdLCBhcmdzICk7XG5cbiAgICAgICAgICBpZiAoIHZhbHVlID09PSBmYWxzZSApIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9yICggaSBpbiBvYmogKSB7XG4gICAgICAgICAgdmFsdWUgPSBjYWxsYmFjay5hcHBseSggb2JqWyBpIF0sIGFyZ3MgKTtcblxuICAgICAgICAgIGlmICggdmFsdWUgPT09IGZhbHNlICkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAvLyBBIHNwZWNpYWwsIGZhc3QsIGNhc2UgZm9yIHRoZSBtb3N0IGNvbW1vbiB1c2Ugb2YgZWFjaFxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIGlzQXJyYXkgKSB7XG4gICAgICAgIGZvciAoIDsgaSA8IGxlbmd0aDsgaSsrICkge1xuICAgICAgICAgIHZhbHVlID0gY2FsbGJhY2suY2FsbCggb2JqWyBpIF0sIGksIG9ialsgaSBdICk7XG5cbiAgICAgICAgICBpZiAoIHZhbHVlID09PSBmYWxzZSApIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9yICggaSBpbiBvYmogKSB7XG4gICAgICAgICAgdmFsdWUgPSBjYWxsYmFjay5jYWxsKCBvYmpbIGkgXSwgaSwgb2JqWyBpIF0gKTtcblxuICAgICAgICAgIGlmICggdmFsdWUgPT09IGZhbHNlICkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG9iajtcbiAgfSxcblxuICAvLyBVc2UgbmF0aXZlIFN0cmluZy50cmltIGZ1bmN0aW9uIHdoZXJldmVyIHBvc3NpYmxlXG4gIHRyaW06IGNvcmVfdHJpbSAmJiAhY29yZV90cmltLmNhbGwoXCJcXHVGRUZGXFx4QTBcIikgP1xuICAgIGZ1bmN0aW9uKCB0ZXh0ICkge1xuICAgICAgcmV0dXJuIHRleHQgPT0gbnVsbCA/XG4gICAgICAgIFwiXCIgOlxuICAgICAgICBjb3JlX3RyaW0uY2FsbCggdGV4dCApO1xuICAgIH0gOlxuXG4gICAgLy8gT3RoZXJ3aXNlIHVzZSBvdXIgb3duIHRyaW1taW5nIGZ1bmN0aW9uYWxpdHlcbiAgICBmdW5jdGlvbiggdGV4dCApIHtcbiAgICAgIHJldHVybiB0ZXh0ID09IG51bGwgP1xuICAgICAgICBcIlwiIDpcbiAgICAgICAgKCB0ZXh0ICsgXCJcIiApLnJlcGxhY2UoIHJ0cmltLCBcIlwiICk7XG4gICAgfSxcblxuICAvLyByZXN1bHRzIGlzIGZvciBpbnRlcm5hbCB1c2FnZSBvbmx5XG4gIG1ha2VBcnJheTogZnVuY3Rpb24oIGFyciwgcmVzdWx0cyApIHtcbiAgICB2YXIgcmV0ID0gcmVzdWx0cyB8fCBbXTtcblxuICAgIGlmICggYXJyICE9IG51bGwgKSB7XG4gICAgICBpZiAoIGlzQXJyYXlsaWtlKCBPYmplY3QoYXJyKSApICkge1xuICAgICAgICBqUXVlcnkubWVyZ2UoIHJldCxcbiAgICAgICAgICB0eXBlb2YgYXJyID09PSBcInN0cmluZ1wiID9cbiAgICAgICAgICBbIGFyciBdIDogYXJyXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb3JlX3B1c2guY2FsbCggcmV0LCBhcnIgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmV0O1xuICB9LFxuXG4gIGluQXJyYXk6IGZ1bmN0aW9uKCBlbGVtLCBhcnIsIGkgKSB7XG4gICAgdmFyIGxlbjtcblxuICAgIGlmICggYXJyICkge1xuICAgICAgaWYgKCBjb3JlX2luZGV4T2YgKSB7XG4gICAgICAgIHJldHVybiBjb3JlX2luZGV4T2YuY2FsbCggYXJyLCBlbGVtLCBpICk7XG4gICAgICB9XG5cbiAgICAgIGxlbiA9IGFyci5sZW5ndGg7XG4gICAgICBpID0gaSA/IGkgPCAwID8gTWF0aC5tYXgoIDAsIGxlbiArIGkgKSA6IGkgOiAwO1xuXG4gICAgICBmb3IgKCA7IGkgPCBsZW47IGkrKyApIHtcbiAgICAgICAgLy8gU2tpcCBhY2Nlc3NpbmcgaW4gc3BhcnNlIGFycmF5c1xuICAgICAgICBpZiAoIGkgaW4gYXJyICYmIGFyclsgaSBdID09PSBlbGVtICkge1xuICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIC0xO1xuICB9LFxuXG4gIG1lcmdlOiBmdW5jdGlvbiggZmlyc3QsIHNlY29uZCApIHtcbiAgICB2YXIgbCA9IHNlY29uZC5sZW5ndGgsXG4gICAgICBpID0gZmlyc3QubGVuZ3RoLFxuICAgICAgaiA9IDA7XG5cbiAgICBpZiAoIHR5cGVvZiBsID09PSBcIm51bWJlclwiICkge1xuICAgICAgZm9yICggOyBqIDwgbDsgaisrICkge1xuICAgICAgICBmaXJzdFsgaSsrIF0gPSBzZWNvbmRbIGogXTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgd2hpbGUgKCBzZWNvbmRbal0gIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgZmlyc3RbIGkrKyBdID0gc2Vjb25kWyBqKysgXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmaXJzdC5sZW5ndGggPSBpO1xuXG4gICAgcmV0dXJuIGZpcnN0O1xuICB9LFxuXG4gIGdyZXA6IGZ1bmN0aW9uKCBlbGVtcywgY2FsbGJhY2ssIGludiApIHtcbiAgICB2YXIgcmV0VmFsLFxuICAgICAgcmV0ID0gW10sXG4gICAgICBpID0gMCxcbiAgICAgIGxlbmd0aCA9IGVsZW1zLmxlbmd0aDtcbiAgICBpbnYgPSAhIWludjtcblxuICAgIC8vIEdvIHRocm91Z2ggdGhlIGFycmF5LCBvbmx5IHNhdmluZyB0aGUgaXRlbXNcbiAgICAvLyB0aGF0IHBhc3MgdGhlIHZhbGlkYXRvciBmdW5jdGlvblxuICAgIGZvciAoIDsgaSA8IGxlbmd0aDsgaSsrICkge1xuICAgICAgcmV0VmFsID0gISFjYWxsYmFjayggZWxlbXNbIGkgXSwgaSApO1xuICAgICAgaWYgKCBpbnYgIT09IHJldFZhbCApIHtcbiAgICAgICAgcmV0LnB1c2goIGVsZW1zWyBpIF0gKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmV0O1xuICB9LFxuXG4gIC8vIGFyZyBpcyBmb3IgaW50ZXJuYWwgdXNhZ2Ugb25seVxuICBtYXA6IGZ1bmN0aW9uKCBlbGVtcywgY2FsbGJhY2ssIGFyZyApIHtcbiAgICB2YXIgdmFsdWUsXG4gICAgICBpID0gMCxcbiAgICAgIGxlbmd0aCA9IGVsZW1zLmxlbmd0aCxcbiAgICAgIGlzQXJyYXkgPSBpc0FycmF5bGlrZSggZWxlbXMgKSxcbiAgICAgIHJldCA9IFtdO1xuXG4gICAgLy8gR28gdGhyb3VnaCB0aGUgYXJyYXksIHRyYW5zbGF0aW5nIGVhY2ggb2YgdGhlIGl0ZW1zIHRvIHRoZWlyXG4gICAgaWYgKCBpc0FycmF5ICkge1xuICAgICAgZm9yICggOyBpIDwgbGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIHZhbHVlID0gY2FsbGJhY2soIGVsZW1zWyBpIF0sIGksIGFyZyApO1xuXG4gICAgICAgIGlmICggdmFsdWUgIT0gbnVsbCApIHtcbiAgICAgICAgICByZXRbIHJldC5sZW5ndGggXSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAvLyBHbyB0aHJvdWdoIGV2ZXJ5IGtleSBvbiB0aGUgb2JqZWN0LFxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKCBpIGluIGVsZW1zICkge1xuICAgICAgICB2YWx1ZSA9IGNhbGxiYWNrKCBlbGVtc1sgaSBdLCBpLCBhcmcgKTtcblxuICAgICAgICBpZiAoIHZhbHVlICE9IG51bGwgKSB7XG4gICAgICAgICAgcmV0WyByZXQubGVuZ3RoIF0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEZsYXR0ZW4gYW55IG5lc3RlZCBhcnJheXNcbiAgICByZXR1cm4gY29yZV9jb25jYXQuYXBwbHkoIFtdLCByZXQgKTtcbiAgfSxcblxuICAvLyBBIGdsb2JhbCBHVUlEIGNvdW50ZXIgZm9yIG9iamVjdHNcbiAgZ3VpZDogMSxcblxuICAvLyBCaW5kIGEgZnVuY3Rpb24gdG8gYSBjb250ZXh0LCBvcHRpb25hbGx5IHBhcnRpYWxseSBhcHBseWluZyBhbnlcbiAgLy8gYXJndW1lbnRzLlxuICBwcm94eTogZnVuY3Rpb24oIGZuLCBjb250ZXh0ICkge1xuICAgIHZhciBhcmdzLCBwcm94eSwgdG1wO1xuXG4gICAgaWYgKCB0eXBlb2YgY29udGV4dCA9PT0gXCJzdHJpbmdcIiApIHtcbiAgICAgIHRtcCA9IGZuWyBjb250ZXh0IF07XG4gICAgICBjb250ZXh0ID0gZm47XG4gICAgICBmbiA9IHRtcDtcbiAgICB9XG5cbiAgICAvLyBRdWljayBjaGVjayB0byBkZXRlcm1pbmUgaWYgdGFyZ2V0IGlzIGNhbGxhYmxlLCBpbiB0aGUgc3BlY1xuICAgIC8vIHRoaXMgdGhyb3dzIGEgVHlwZUVycm9yLCBidXQgd2Ugd2lsbCBqdXN0IHJldHVybiB1bmRlZmluZWQuXG4gICAgaWYgKCAhalF1ZXJ5LmlzRnVuY3Rpb24oIGZuICkgKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIC8vIFNpbXVsYXRlZCBiaW5kXG4gICAgYXJncyA9IGNvcmVfc2xpY2UuY2FsbCggYXJndW1lbnRzLCAyICk7XG4gICAgcHJveHkgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBmbi5hcHBseSggY29udGV4dCB8fCB0aGlzLCBhcmdzLmNvbmNhdCggY29yZV9zbGljZS5jYWxsKCBhcmd1bWVudHMgKSApICk7XG4gICAgfTtcblxuICAgIC8vIFNldCB0aGUgZ3VpZCBvZiB1bmlxdWUgaGFuZGxlciB0byB0aGUgc2FtZSBvZiBvcmlnaW5hbCBoYW5kbGVyLCBzbyBpdCBjYW4gYmUgcmVtb3ZlZFxuICAgIHByb3h5Lmd1aWQgPSBmbi5ndWlkID0gZm4uZ3VpZCB8fCBqUXVlcnkuZ3VpZCsrO1xuXG4gICAgcmV0dXJuIHByb3h5O1xuICB9LFxuXG4gIC8vIE11bHRpZnVuY3Rpb25hbCBtZXRob2QgdG8gZ2V0IGFuZCBzZXQgdmFsdWVzIG9mIGEgY29sbGVjdGlvblxuICAvLyBUaGUgdmFsdWUvcyBjYW4gb3B0aW9uYWxseSBiZSBleGVjdXRlZCBpZiBpdCdzIGEgZnVuY3Rpb25cbiAgYWNjZXNzOiBmdW5jdGlvbiggZWxlbXMsIGZuLCBrZXksIHZhbHVlLCBjaGFpbmFibGUsIGVtcHR5R2V0LCByYXcgKSB7XG4gICAgdmFyIGkgPSAwLFxuICAgICAgbGVuZ3RoID0gZWxlbXMubGVuZ3RoLFxuICAgICAgYnVsayA9IGtleSA9PSBudWxsO1xuXG4gICAgLy8gU2V0cyBtYW55IHZhbHVlc1xuICAgIGlmICggalF1ZXJ5LnR5cGUoIGtleSApID09PSBcIm9iamVjdFwiICkge1xuICAgICAgY2hhaW5hYmxlID0gdHJ1ZTtcbiAgICAgIGZvciAoIGkgaW4ga2V5ICkge1xuICAgICAgICBqUXVlcnkuYWNjZXNzKCBlbGVtcywgZm4sIGksIGtleVtpXSwgdHJ1ZSwgZW1wdHlHZXQsIHJhdyApO1xuICAgICAgfVxuXG4gICAgLy8gU2V0cyBvbmUgdmFsdWVcbiAgICB9IGVsc2UgaWYgKCB2YWx1ZSAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgY2hhaW5hYmxlID0gdHJ1ZTtcblxuICAgICAgaWYgKCAhalF1ZXJ5LmlzRnVuY3Rpb24oIHZhbHVlICkgKSB7XG4gICAgICAgIHJhdyA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGlmICggYnVsayApIHtcbiAgICAgICAgLy8gQnVsayBvcGVyYXRpb25zIHJ1biBhZ2FpbnN0IHRoZSBlbnRpcmUgc2V0XG4gICAgICAgIGlmICggcmF3ICkge1xuICAgICAgICAgIGZuLmNhbGwoIGVsZW1zLCB2YWx1ZSApO1xuICAgICAgICAgIGZuID0gbnVsbDtcblxuICAgICAgICAvLyAuLi5leGNlcHQgd2hlbiBleGVjdXRpbmcgZnVuY3Rpb24gdmFsdWVzXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYnVsayA9IGZuO1xuICAgICAgICAgIGZuID0gZnVuY3Rpb24oIGVsZW0sIGtleSwgdmFsdWUgKSB7XG4gICAgICAgICAgICByZXR1cm4gYnVsay5jYWxsKCBqUXVlcnkoIGVsZW0gKSwgdmFsdWUgKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICggZm4gKSB7XG4gICAgICAgIGZvciAoIDsgaSA8IGxlbmd0aDsgaSsrICkge1xuICAgICAgICAgIGZuKCBlbGVtc1tpXSwga2V5LCByYXcgPyB2YWx1ZSA6IHZhbHVlLmNhbGwoIGVsZW1zW2ldLCBpLCBmbiggZWxlbXNbaV0sIGtleSApICkgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBjaGFpbmFibGUgP1xuICAgICAgZWxlbXMgOlxuXG4gICAgICAvLyBHZXRzXG4gICAgICBidWxrID9cbiAgICAgICAgZm4uY2FsbCggZWxlbXMgKSA6XG4gICAgICAgIGxlbmd0aCA/IGZuKCBlbGVtc1swXSwga2V5ICkgOiBlbXB0eUdldDtcbiAgfSxcblxuICBub3c6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAoIG5ldyBEYXRlKCkgKS5nZXRUaW1lKCk7XG4gIH0sXG5cbiAgLy8gQSBtZXRob2QgZm9yIHF1aWNrbHkgc3dhcHBpbmcgaW4vb3V0IENTUyBwcm9wZXJ0aWVzIHRvIGdldCBjb3JyZWN0IGNhbGN1bGF0aW9ucy5cbiAgLy8gTm90ZTogdGhpcyBtZXRob2QgYmVsb25ncyB0byB0aGUgY3NzIG1vZHVsZSBidXQgaXQncyBuZWVkZWQgaGVyZSBmb3IgdGhlIHN1cHBvcnQgbW9kdWxlLlxuICAvLyBJZiBzdXBwb3J0IGdldHMgbW9kdWxhcml6ZWQsIHRoaXMgbWV0aG9kIHNob3VsZCBiZSBtb3ZlZCBiYWNrIHRvIHRoZSBjc3MgbW9kdWxlLlxuICBzd2FwOiBmdW5jdGlvbiggZWxlbSwgb3B0aW9ucywgY2FsbGJhY2ssIGFyZ3MgKSB7XG4gICAgdmFyIHJldCwgbmFtZSxcbiAgICAgIG9sZCA9IHt9O1xuXG4gICAgLy8gUmVtZW1iZXIgdGhlIG9sZCB2YWx1ZXMsIGFuZCBpbnNlcnQgdGhlIG5ldyBvbmVzXG4gICAgZm9yICggbmFtZSBpbiBvcHRpb25zICkge1xuICAgICAgb2xkWyBuYW1lIF0gPSBlbGVtLnN0eWxlWyBuYW1lIF07XG4gICAgICBlbGVtLnN0eWxlWyBuYW1lIF0gPSBvcHRpb25zWyBuYW1lIF07XG4gICAgfVxuXG4gICAgcmV0ID0gY2FsbGJhY2suYXBwbHkoIGVsZW0sIGFyZ3MgfHwgW10gKTtcblxuICAgIC8vIFJldmVydCB0aGUgb2xkIHZhbHVlc1xuICAgIGZvciAoIG5hbWUgaW4gb3B0aW9ucyApIHtcbiAgICAgIGVsZW0uc3R5bGVbIG5hbWUgXSA9IG9sZFsgbmFtZSBdO1xuICAgIH1cblxuICAgIHJldHVybiByZXQ7XG4gIH1cbn0pO1xuXG5qUXVlcnkucmVhZHkucHJvbWlzZSA9IGZ1bmN0aW9uKCBvYmogKSB7XG4gIGlmICggIXJlYWR5TGlzdCApIHtcblxuICAgIHJlYWR5TGlzdCA9IGpRdWVyeS5EZWZlcnJlZCgpO1xuXG4gICAgLy8gQ2F0Y2ggY2FzZXMgd2hlcmUgJChkb2N1bWVudCkucmVhZHkoKSBpcyBjYWxsZWQgYWZ0ZXIgdGhlIGJyb3dzZXIgZXZlbnQgaGFzIGFscmVhZHkgb2NjdXJyZWQuXG4gICAgLy8gd2Ugb25jZSB0cmllZCB0byB1c2UgcmVhZHlTdGF0ZSBcImludGVyYWN0aXZlXCIgaGVyZSwgYnV0IGl0IGNhdXNlZCBpc3N1ZXMgbGlrZSB0aGUgb25lXG4gICAgLy8gZGlzY292ZXJlZCBieSBDaHJpc1MgaGVyZTogaHR0cDovL2J1Z3MuanF1ZXJ5LmNvbS90aWNrZXQvMTIyODIjY29tbWVudDoxNVxuICAgIGlmICggZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJjb21wbGV0ZVwiICkge1xuICAgICAgLy8gSGFuZGxlIGl0IGFzeW5jaHJvbm91c2x5IHRvIGFsbG93IHNjcmlwdHMgdGhlIG9wcG9ydHVuaXR5IHRvIGRlbGF5IHJlYWR5XG4gICAgICBzZXRUaW1lb3V0KCBqUXVlcnkucmVhZHkgKTtcblxuICAgIC8vIFN0YW5kYXJkcy1iYXNlZCBicm93c2VycyBzdXBwb3J0IERPTUNvbnRlbnRMb2FkZWRcbiAgICB9IGVsc2UgaWYgKCBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyICkge1xuICAgICAgLy8gVXNlIHRoZSBoYW5keSBldmVudCBjYWxsYmFja1xuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggXCJET01Db250ZW50TG9hZGVkXCIsIGNvbXBsZXRlZCwgZmFsc2UgKTtcblxuICAgICAgLy8gQSBmYWxsYmFjayB0byB3aW5kb3cub25sb2FkLCB0aGF0IHdpbGwgYWx3YXlzIHdvcmtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCBcImxvYWRcIiwgY29tcGxldGVkLCBmYWxzZSApO1xuXG4gICAgLy8gSWYgSUUgZXZlbnQgbW9kZWwgaXMgdXNlZFxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBFbnN1cmUgZmlyaW5nIGJlZm9yZSBvbmxvYWQsIG1heWJlIGxhdGUgYnV0IHNhZmUgYWxzbyBmb3IgaWZyYW1lc1xuICAgICAgZG9jdW1lbnQuYXR0YWNoRXZlbnQoIFwib25yZWFkeXN0YXRlY2hhbmdlXCIsIGNvbXBsZXRlZCApO1xuXG4gICAgICAvLyBBIGZhbGxiYWNrIHRvIHdpbmRvdy5vbmxvYWQsIHRoYXQgd2lsbCBhbHdheXMgd29ya1xuICAgICAgd2luZG93LmF0dGFjaEV2ZW50KCBcIm9ubG9hZFwiLCBjb21wbGV0ZWQgKTtcblxuICAgICAgLy8gSWYgSUUgYW5kIG5vdCBhIGZyYW1lXG4gICAgICAvLyBjb250aW51YWxseSBjaGVjayB0byBzZWUgaWYgdGhlIGRvY3VtZW50IGlzIHJlYWR5XG4gICAgICB2YXIgdG9wID0gZmFsc2U7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIHRvcCA9IHdpbmRvdy5mcmFtZUVsZW1lbnQgPT0gbnVsbCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG4gICAgICB9IGNhdGNoKGUpIHt9XG5cbiAgICAgIGlmICggdG9wICYmIHRvcC5kb1Njcm9sbCApIHtcbiAgICAgICAgKGZ1bmN0aW9uIGRvU2Nyb2xsQ2hlY2soKSB7XG4gICAgICAgICAgaWYgKCAhalF1ZXJ5LmlzUmVhZHkgKSB7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIC8vIFVzZSB0aGUgdHJpY2sgYnkgRGllZ28gUGVyaW5pXG4gICAgICAgICAgICAgIC8vIGh0dHA6Ly9qYXZhc2NyaXB0Lm53Ym94LmNvbS9JRUNvbnRlbnRMb2FkZWQvXG4gICAgICAgICAgICAgIHRvcC5kb1Njcm9sbChcImxlZnRcIik7XG4gICAgICAgICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoIGRvU2Nyb2xsQ2hlY2ssIDUwICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGRldGFjaCBhbGwgZG9tIHJlYWR5IGV2ZW50c1xuICAgICAgICAgICAgZGV0YWNoKCk7XG5cbiAgICAgICAgICAgIC8vIGFuZCBleGVjdXRlIGFueSB3YWl0aW5nIGZ1bmN0aW9uc1xuICAgICAgICAgICAgalF1ZXJ5LnJlYWR5KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gcmVhZHlMaXN0LnByb21pc2UoIG9iaiApO1xufTtcblxuLy8gUG9wdWxhdGUgdGhlIGNsYXNzMnR5cGUgbWFwXG5qUXVlcnkuZWFjaChcIkJvb2xlYW4gTnVtYmVyIFN0cmluZyBGdW5jdGlvbiBBcnJheSBEYXRlIFJlZ0V4cCBPYmplY3QgRXJyb3JcIi5zcGxpdChcIiBcIiksIGZ1bmN0aW9uKGksIG5hbWUpIHtcbiAgY2xhc3MydHlwZVsgXCJbb2JqZWN0IFwiICsgbmFtZSArIFwiXVwiIF0gPSBuYW1lLnRvTG93ZXJDYXNlKCk7XG59KTtcblxuZnVuY3Rpb24gaXNBcnJheWxpa2UoIG9iaiApIHtcbiAgdmFyIGxlbmd0aCA9IG9iai5sZW5ndGgsXG4gICAgdHlwZSA9IGpRdWVyeS50eXBlKCBvYmogKTtcblxuICBpZiAoIGpRdWVyeS5pc1dpbmRvdyggb2JqICkgKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKCBvYmoubm9kZVR5cGUgPT09IDEgJiYgbGVuZ3RoICkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIHR5cGUgPT09IFwiYXJyYXlcIiB8fCB0eXBlICE9PSBcImZ1bmN0aW9uXCIgJiZcbiAgICAoIGxlbmd0aCA9PT0gMCB8fFxuICAgIHR5cGVvZiBsZW5ndGggPT09IFwibnVtYmVyXCIgJiYgbGVuZ3RoID4gMCAmJiAoIGxlbmd0aCAtIDEgKSBpbiBvYmogKTtcbn1cblxuLy8gQWxsIGpRdWVyeSBvYmplY3RzIHNob3VsZCBwb2ludCBiYWNrIHRvIHRoZXNlXG5yb290alF1ZXJ5ID0galF1ZXJ5KGRvY3VtZW50KTtcbi8qIVxuICogU2l6emxlIENTUyBTZWxlY3RvciBFbmdpbmUgdjEuMTAuMlxuICogaHR0cDovL3NpenpsZWpzLmNvbS9cbiAqXG4gKiBDb3B5cmlnaHQgMjAxMyBqUXVlcnkgRm91bmRhdGlvbiwgSW5jLiBhbmQgb3RoZXIgY29udHJpYnV0b3JzXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcbiAqIGh0dHA6Ly9qcXVlcnkub3JnL2xpY2Vuc2VcbiAqXG4gKiBEYXRlOiAyMDEzLTA3LTAzXG4gKi9cbihmdW5jdGlvbiggd2luZG93LCB1bmRlZmluZWQgKSB7XG5cbnZhciBpLFxuICBzdXBwb3J0LFxuICBjYWNoZWRydW5zLFxuICBFeHByLFxuICBnZXRUZXh0LFxuICBpc1hNTCxcbiAgY29tcGlsZSxcbiAgb3V0ZXJtb3N0Q29udGV4dCxcbiAgc29ydElucHV0LFxuXG4gIC8vIExvY2FsIGRvY3VtZW50IHZhcnNcbiAgc2V0RG9jdW1lbnQsXG4gIGRvY3VtZW50LFxuICBkb2NFbGVtLFxuICBkb2N1bWVudElzSFRNTCxcbiAgcmJ1Z2d5UVNBLFxuICByYnVnZ3lNYXRjaGVzLFxuICBtYXRjaGVzLFxuICBjb250YWlucyxcblxuICAvLyBJbnN0YW5jZS1zcGVjaWZpYyBkYXRhXG4gIGV4cGFuZG8gPSBcInNpenpsZVwiICsgLShuZXcgRGF0ZSgpKSxcbiAgcHJlZmVycmVkRG9jID0gd2luZG93LmRvY3VtZW50LFxuICBkaXJydW5zID0gMCxcbiAgZG9uZSA9IDAsXG4gIGNsYXNzQ2FjaGUgPSBjcmVhdGVDYWNoZSgpLFxuICB0b2tlbkNhY2hlID0gY3JlYXRlQ2FjaGUoKSxcbiAgY29tcGlsZXJDYWNoZSA9IGNyZWF0ZUNhY2hlKCksXG4gIGhhc0R1cGxpY2F0ZSA9IGZhbHNlLFxuICBzb3J0T3JkZXIgPSBmdW5jdGlvbiggYSwgYiApIHtcbiAgICBpZiAoIGEgPT09IGIgKSB7XG4gICAgICBoYXNEdXBsaWNhdGUgPSB0cnVlO1xuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIHJldHVybiAwO1xuICB9LFxuXG4gIC8vIEdlbmVyYWwtcHVycG9zZSBjb25zdGFudHNcbiAgc3RydW5kZWZpbmVkID0gdHlwZW9mIHVuZGVmaW5lZCxcbiAgTUFYX05FR0FUSVZFID0gMSA8PCAzMSxcblxuICAvLyBJbnN0YW5jZSBtZXRob2RzXG4gIGhhc093biA9ICh7fSkuaGFzT3duUHJvcGVydHksXG4gIGFyciA9IFtdLFxuICBwb3AgPSBhcnIucG9wLFxuICBwdXNoX25hdGl2ZSA9IGFyci5wdXNoLFxuICBwdXNoID0gYXJyLnB1c2gsXG4gIHNsaWNlID0gYXJyLnNsaWNlLFxuICAvLyBVc2UgYSBzdHJpcHBlZC1kb3duIGluZGV4T2YgaWYgd2UgY2FuJ3QgdXNlIGEgbmF0aXZlIG9uZVxuICBpbmRleE9mID0gYXJyLmluZGV4T2YgfHwgZnVuY3Rpb24oIGVsZW0gKSB7XG4gICAgdmFyIGkgPSAwLFxuICAgICAgbGVuID0gdGhpcy5sZW5ndGg7XG4gICAgZm9yICggOyBpIDwgbGVuOyBpKysgKSB7XG4gICAgICBpZiAoIHRoaXNbaV0gPT09IGVsZW0gKSB7XG4gICAgICAgIHJldHVybiBpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gLTE7XG4gIH0sXG5cbiAgYm9vbGVhbnMgPSBcImNoZWNrZWR8c2VsZWN0ZWR8YXN5bmN8YXV0b2ZvY3VzfGF1dG9wbGF5fGNvbnRyb2xzfGRlZmVyfGRpc2FibGVkfGhpZGRlbnxpc21hcHxsb29wfG11bHRpcGxlfG9wZW58cmVhZG9ubHl8cmVxdWlyZWR8c2NvcGVkXCIsXG5cbiAgLy8gUmVndWxhciBleHByZXNzaW9uc1xuXG4gIC8vIFdoaXRlc3BhY2UgY2hhcmFjdGVycyBodHRwOi8vd3d3LnczLm9yZy9UUi9jc3MzLXNlbGVjdG9ycy8jd2hpdGVzcGFjZVxuICB3aGl0ZXNwYWNlID0gXCJbXFxcXHgyMFxcXFx0XFxcXHJcXFxcblxcXFxmXVwiLFxuICAvLyBodHRwOi8vd3d3LnczLm9yZy9UUi9jc3MzLXN5bnRheC8jY2hhcmFjdGVyc1xuICBjaGFyYWN0ZXJFbmNvZGluZyA9IFwiKD86XFxcXFxcXFwufFtcXFxcdy1dfFteXFxcXHgwMC1cXFxceGEwXSkrXCIsXG5cbiAgLy8gTG9vc2VseSBtb2RlbGVkIG9uIENTUyBpZGVudGlmaWVyIGNoYXJhY3RlcnNcbiAgLy8gQW4gdW5xdW90ZWQgdmFsdWUgc2hvdWxkIGJlIGEgQ1NTIGlkZW50aWZpZXIgaHR0cDovL3d3dy53My5vcmcvVFIvY3NzMy1zZWxlY3RvcnMvI2F0dHJpYnV0ZS1zZWxlY3RvcnNcbiAgLy8gUHJvcGVyIHN5bnRheDogaHR0cDovL3d3dy53My5vcmcvVFIvQ1NTMjEvc3luZGF0YS5odG1sI3ZhbHVlLWRlZi1pZGVudGlmaWVyXG4gIGlkZW50aWZpZXIgPSBjaGFyYWN0ZXJFbmNvZGluZy5yZXBsYWNlKCBcIndcIiwgXCJ3I1wiICksXG5cbiAgLy8gQWNjZXB0YWJsZSBvcGVyYXRvcnMgaHR0cDovL3d3dy53My5vcmcvVFIvc2VsZWN0b3JzLyNhdHRyaWJ1dGUtc2VsZWN0b3JzXG4gIGF0dHJpYnV0ZXMgPSBcIlxcXFxbXCIgKyB3aGl0ZXNwYWNlICsgXCIqKFwiICsgY2hhcmFjdGVyRW5jb2RpbmcgKyBcIilcIiArIHdoaXRlc3BhY2UgK1xuICAgIFwiKig/OihbKl4kfCF+XT89KVwiICsgd2hpdGVzcGFjZSArIFwiKig/OihbJ1xcXCJdKSgoPzpcXFxcXFxcXC58W15cXFxcXFxcXF0pKj8pXFxcXDN8KFwiICsgaWRlbnRpZmllciArIFwiKXwpfClcIiArIHdoaXRlc3BhY2UgKyBcIipcXFxcXVwiLFxuXG4gIC8vIFByZWZlciBhcmd1bWVudHMgcXVvdGVkLFxuICAvLyAgIHRoZW4gbm90IGNvbnRhaW5pbmcgcHNldWRvcy9icmFja2V0cyxcbiAgLy8gICB0aGVuIGF0dHJpYnV0ZSBzZWxlY3RvcnMvbm9uLXBhcmVudGhldGljYWwgZXhwcmVzc2lvbnMsXG4gIC8vICAgdGhlbiBhbnl0aGluZyBlbHNlXG4gIC8vIFRoZXNlIHByZWZlcmVuY2VzIGFyZSBoZXJlIHRvIHJlZHVjZSB0aGUgbnVtYmVyIG9mIHNlbGVjdG9yc1xuICAvLyAgIG5lZWRpbmcgdG9rZW5pemUgaW4gdGhlIFBTRVVETyBwcmVGaWx0ZXJcbiAgcHNldWRvcyA9IFwiOihcIiArIGNoYXJhY3RlckVuY29kaW5nICsgXCIpKD86XFxcXCgoKFsnXFxcIl0pKCg/OlxcXFxcXFxcLnxbXlxcXFxcXFxcXSkqPylcXFxcM3woKD86XFxcXFxcXFwufFteXFxcXFxcXFwoKVtcXFxcXV18XCIgKyBhdHRyaWJ1dGVzLnJlcGxhY2UoIDMsIDggKSArIFwiKSopfC4qKVxcXFwpfClcIixcblxuICAvLyBMZWFkaW5nIGFuZCBub24tZXNjYXBlZCB0cmFpbGluZyB3aGl0ZXNwYWNlLCBjYXB0dXJpbmcgc29tZSBub24td2hpdGVzcGFjZSBjaGFyYWN0ZXJzIHByZWNlZGluZyB0aGUgbGF0dGVyXG4gIHJ0cmltID0gbmV3IFJlZ0V4cCggXCJeXCIgKyB3aGl0ZXNwYWNlICsgXCIrfCgoPzpefFteXFxcXFxcXFxdKSg/OlxcXFxcXFxcLikqKVwiICsgd2hpdGVzcGFjZSArIFwiKyRcIiwgXCJnXCIgKSxcblxuICByY29tbWEgPSBuZXcgUmVnRXhwKCBcIl5cIiArIHdoaXRlc3BhY2UgKyBcIiosXCIgKyB3aGl0ZXNwYWNlICsgXCIqXCIgKSxcbiAgcmNvbWJpbmF0b3JzID0gbmV3IFJlZ0V4cCggXCJeXCIgKyB3aGl0ZXNwYWNlICsgXCIqKFs+K35dfFwiICsgd2hpdGVzcGFjZSArIFwiKVwiICsgd2hpdGVzcGFjZSArIFwiKlwiICksXG5cbiAgcnNpYmxpbmcgPSBuZXcgUmVnRXhwKCB3aGl0ZXNwYWNlICsgXCIqWyt+XVwiICksXG4gIHJhdHRyaWJ1dGVRdW90ZXMgPSBuZXcgUmVnRXhwKCBcIj1cIiArIHdoaXRlc3BhY2UgKyBcIiooW15cXFxcXSdcXFwiXSopXCIgKyB3aGl0ZXNwYWNlICsgXCIqXFxcXF1cIiwgXCJnXCIgKSxcblxuICBycHNldWRvID0gbmV3IFJlZ0V4cCggcHNldWRvcyApLFxuICByaWRlbnRpZmllciA9IG5ldyBSZWdFeHAoIFwiXlwiICsgaWRlbnRpZmllciArIFwiJFwiICksXG5cbiAgbWF0Y2hFeHByID0ge1xuICAgIFwiSURcIjogbmV3IFJlZ0V4cCggXCJeIyhcIiArIGNoYXJhY3RlckVuY29kaW5nICsgXCIpXCIgKSxcbiAgICBcIkNMQVNTXCI6IG5ldyBSZWdFeHAoIFwiXlxcXFwuKFwiICsgY2hhcmFjdGVyRW5jb2RpbmcgKyBcIilcIiApLFxuICAgIFwiVEFHXCI6IG5ldyBSZWdFeHAoIFwiXihcIiArIGNoYXJhY3RlckVuY29kaW5nLnJlcGxhY2UoIFwid1wiLCBcIncqXCIgKSArIFwiKVwiICksXG4gICAgXCJBVFRSXCI6IG5ldyBSZWdFeHAoIFwiXlwiICsgYXR0cmlidXRlcyApLFxuICAgIFwiUFNFVURPXCI6IG5ldyBSZWdFeHAoIFwiXlwiICsgcHNldWRvcyApLFxuICAgIFwiQ0hJTERcIjogbmV3IFJlZ0V4cCggXCJeOihvbmx5fGZpcnN0fGxhc3R8bnRofG50aC1sYXN0KS0oY2hpbGR8b2YtdHlwZSkoPzpcXFxcKFwiICsgd2hpdGVzcGFjZSArXG4gICAgICBcIiooZXZlbnxvZGR8KChbKy1dfCkoXFxcXGQqKW58KVwiICsgd2hpdGVzcGFjZSArIFwiKig/OihbKy1dfClcIiArIHdoaXRlc3BhY2UgK1xuICAgICAgXCIqKFxcXFxkKyl8KSlcIiArIHdoaXRlc3BhY2UgKyBcIipcXFxcKXwpXCIsIFwiaVwiICksXG4gICAgXCJib29sXCI6IG5ldyBSZWdFeHAoIFwiXig/OlwiICsgYm9vbGVhbnMgKyBcIikkXCIsIFwiaVwiICksXG4gICAgLy8gRm9yIHVzZSBpbiBsaWJyYXJpZXMgaW1wbGVtZW50aW5nIC5pcygpXG4gICAgLy8gV2UgdXNlIHRoaXMgZm9yIFBPUyBtYXRjaGluZyBpbiBgc2VsZWN0YFxuICAgIFwibmVlZHNDb250ZXh0XCI6IG5ldyBSZWdFeHAoIFwiXlwiICsgd2hpdGVzcGFjZSArIFwiKls+K35dfDooZXZlbnxvZGR8ZXF8Z3R8bHR8bnRofGZpcnN0fGxhc3QpKD86XFxcXChcIiArXG4gICAgICB3aGl0ZXNwYWNlICsgXCIqKCg/Oi1cXFxcZCk/XFxcXGQqKVwiICsgd2hpdGVzcGFjZSArIFwiKlxcXFwpfCkoPz1bXi1dfCQpXCIsIFwiaVwiIClcbiAgfSxcblxuICBybmF0aXZlID0gL15bXntdK1xce1xccypcXFtuYXRpdmUgXFx3LyxcblxuICAvLyBFYXNpbHktcGFyc2VhYmxlL3JldHJpZXZhYmxlIElEIG9yIFRBRyBvciBDTEFTUyBzZWxlY3RvcnNcbiAgcnF1aWNrRXhwciA9IC9eKD86IyhbXFx3LV0rKXwoXFx3Kyl8XFwuKFtcXHctXSspKSQvLFxuXG4gIHJpbnB1dHMgPSAvXig/OmlucHV0fHNlbGVjdHx0ZXh0YXJlYXxidXR0b24pJC9pLFxuICByaGVhZGVyID0gL15oXFxkJC9pLFxuXG4gIHJlc2NhcGUgPSAvJ3xcXFxcL2csXG5cbiAgLy8gQ1NTIGVzY2FwZXMgaHR0cDovL3d3dy53My5vcmcvVFIvQ1NTMjEvc3luZGF0YS5odG1sI2VzY2FwZWQtY2hhcmFjdGVyc1xuICBydW5lc2NhcGUgPSBuZXcgUmVnRXhwKCBcIlxcXFxcXFxcKFtcXFxcZGEtZl17MSw2fVwiICsgd2hpdGVzcGFjZSArIFwiP3woXCIgKyB3aGl0ZXNwYWNlICsgXCIpfC4pXCIsIFwiaWdcIiApLFxuICBmdW5lc2NhcGUgPSBmdW5jdGlvbiggXywgZXNjYXBlZCwgZXNjYXBlZFdoaXRlc3BhY2UgKSB7XG4gICAgdmFyIGhpZ2ggPSBcIjB4XCIgKyBlc2NhcGVkIC0gMHgxMDAwMDtcbiAgICAvLyBOYU4gbWVhbnMgbm9uLWNvZGVwb2ludFxuICAgIC8vIFN1cHBvcnQ6IEZpcmVmb3hcbiAgICAvLyBXb3JrYXJvdW5kIGVycm9uZW91cyBudW1lcmljIGludGVycHJldGF0aW9uIG9mICtcIjB4XCJcbiAgICByZXR1cm4gaGlnaCAhPT0gaGlnaCB8fCBlc2NhcGVkV2hpdGVzcGFjZSA/XG4gICAgICBlc2NhcGVkIDpcbiAgICAgIC8vIEJNUCBjb2RlcG9pbnRcbiAgICAgIGhpZ2ggPCAwID9cbiAgICAgICAgU3RyaW5nLmZyb21DaGFyQ29kZSggaGlnaCArIDB4MTAwMDAgKSA6XG4gICAgICAgIC8vIFN1cHBsZW1lbnRhbCBQbGFuZSBjb2RlcG9pbnQgKHN1cnJvZ2F0ZSBwYWlyKVxuICAgICAgICBTdHJpbmcuZnJvbUNoYXJDb2RlKCBoaWdoID4+IDEwIHwgMHhEODAwLCBoaWdoICYgMHgzRkYgfCAweERDMDAgKTtcbiAgfTtcblxuLy8gT3B0aW1pemUgZm9yIHB1c2guYXBwbHkoIF8sIE5vZGVMaXN0IClcbnRyeSB7XG4gIHB1c2guYXBwbHkoXG4gICAgKGFyciA9IHNsaWNlLmNhbGwoIHByZWZlcnJlZERvYy5jaGlsZE5vZGVzICkpLFxuICAgIHByZWZlcnJlZERvYy5jaGlsZE5vZGVzXG4gICk7XG4gIC8vIFN1cHBvcnQ6IEFuZHJvaWQ8NC4wXG4gIC8vIERldGVjdCBzaWxlbnRseSBmYWlsaW5nIHB1c2guYXBwbHlcbiAgYXJyWyBwcmVmZXJyZWREb2MuY2hpbGROb2Rlcy5sZW5ndGggXS5ub2RlVHlwZTtcbn0gY2F0Y2ggKCBlICkge1xuICBwdXNoID0geyBhcHBseTogYXJyLmxlbmd0aCA/XG5cbiAgICAvLyBMZXZlcmFnZSBzbGljZSBpZiBwb3NzaWJsZVxuICAgIGZ1bmN0aW9uKCB0YXJnZXQsIGVscyApIHtcbiAgICAgIHB1c2hfbmF0aXZlLmFwcGx5KCB0YXJnZXQsIHNsaWNlLmNhbGwoZWxzKSApO1xuICAgIH0gOlxuXG4gICAgLy8gU3VwcG9ydDogSUU8OVxuICAgIC8vIE90aGVyd2lzZSBhcHBlbmQgZGlyZWN0bHlcbiAgICBmdW5jdGlvbiggdGFyZ2V0LCBlbHMgKSB7XG4gICAgICB2YXIgaiA9IHRhcmdldC5sZW5ndGgsXG4gICAgICAgIGkgPSAwO1xuICAgICAgLy8gQ2FuJ3QgdHJ1c3QgTm9kZUxpc3QubGVuZ3RoXG4gICAgICB3aGlsZSAoICh0YXJnZXRbaisrXSA9IGVsc1tpKytdKSApIHt9XG4gICAgICB0YXJnZXQubGVuZ3RoID0gaiAtIDE7XG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiBTaXp6bGUoIHNlbGVjdG9yLCBjb250ZXh0LCByZXN1bHRzLCBzZWVkICkge1xuICB2YXIgbWF0Y2gsIGVsZW0sIG0sIG5vZGVUeXBlLFxuICAgIC8vIFFTQSB2YXJzXG4gICAgaSwgZ3JvdXBzLCBvbGQsIG5pZCwgbmV3Q29udGV4dCwgbmV3U2VsZWN0b3I7XG5cbiAgaWYgKCAoIGNvbnRleHQgPyBjb250ZXh0Lm93bmVyRG9jdW1lbnQgfHwgY29udGV4dCA6IHByZWZlcnJlZERvYyApICE9PSBkb2N1bWVudCApIHtcbiAgICBzZXREb2N1bWVudCggY29udGV4dCApO1xuICB9XG5cbiAgY29udGV4dCA9IGNvbnRleHQgfHwgZG9jdW1lbnQ7XG4gIHJlc3VsdHMgPSByZXN1bHRzIHx8IFtdO1xuXG4gIGlmICggIXNlbGVjdG9yIHx8IHR5cGVvZiBzZWxlY3RvciAhPT0gXCJzdHJpbmdcIiApIHtcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfVxuXG4gIGlmICggKG5vZGVUeXBlID0gY29udGV4dC5ub2RlVHlwZSkgIT09IDEgJiYgbm9kZVR5cGUgIT09IDkgKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgaWYgKCBkb2N1bWVudElzSFRNTCAmJiAhc2VlZCApIHtcblxuICAgIC8vIFNob3J0Y3V0c1xuICAgIGlmICggKG1hdGNoID0gcnF1aWNrRXhwci5leGVjKCBzZWxlY3RvciApKSApIHtcbiAgICAgIC8vIFNwZWVkLXVwOiBTaXp6bGUoXCIjSURcIilcbiAgICAgIGlmICggKG0gPSBtYXRjaFsxXSkgKSB7XG4gICAgICAgIGlmICggbm9kZVR5cGUgPT09IDkgKSB7XG4gICAgICAgICAgZWxlbSA9IGNvbnRleHQuZ2V0RWxlbWVudEJ5SWQoIG0gKTtcbiAgICAgICAgICAvLyBDaGVjayBwYXJlbnROb2RlIHRvIGNhdGNoIHdoZW4gQmxhY2tiZXJyeSA0LjYgcmV0dXJuc1xuICAgICAgICAgIC8vIG5vZGVzIHRoYXQgYXJlIG5vIGxvbmdlciBpbiB0aGUgZG9jdW1lbnQgIzY5NjNcbiAgICAgICAgICBpZiAoIGVsZW0gJiYgZWxlbS5wYXJlbnROb2RlICkge1xuICAgICAgICAgICAgLy8gSGFuZGxlIHRoZSBjYXNlIHdoZXJlIElFLCBPcGVyYSwgYW5kIFdlYmtpdCByZXR1cm4gaXRlbXNcbiAgICAgICAgICAgIC8vIGJ5IG5hbWUgaW5zdGVhZCBvZiBJRFxuICAgICAgICAgICAgaWYgKCBlbGVtLmlkID09PSBtICkge1xuICAgICAgICAgICAgICByZXN1bHRzLnB1c2goIGVsZW0gKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBDb250ZXh0IGlzIG5vdCBhIGRvY3VtZW50XG4gICAgICAgICAgaWYgKCBjb250ZXh0Lm93bmVyRG9jdW1lbnQgJiYgKGVsZW0gPSBjb250ZXh0Lm93bmVyRG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoIG0gKSkgJiZcbiAgICAgICAgICAgIGNvbnRhaW5zKCBjb250ZXh0LCBlbGVtICkgJiYgZWxlbS5pZCA9PT0gbSApIHtcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaCggZWxlbSApO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgIC8vIFNwZWVkLXVwOiBTaXp6bGUoXCJUQUdcIilcbiAgICAgIH0gZWxzZSBpZiAoIG1hdGNoWzJdICkge1xuICAgICAgICBwdXNoLmFwcGx5KCByZXN1bHRzLCBjb250ZXh0LmdldEVsZW1lbnRzQnlUYWdOYW1lKCBzZWxlY3RvciApICk7XG4gICAgICAgIHJldHVybiByZXN1bHRzO1xuXG4gICAgICAvLyBTcGVlZC11cDogU2l6emxlKFwiLkNMQVNTXCIpXG4gICAgICB9IGVsc2UgaWYgKCAobSA9IG1hdGNoWzNdKSAmJiBzdXBwb3J0LmdldEVsZW1lbnRzQnlDbGFzc05hbWUgJiYgY29udGV4dC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lICkge1xuICAgICAgICBwdXNoLmFwcGx5KCByZXN1bHRzLCBjb250ZXh0LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoIG0gKSApO1xuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBRU0EgcGF0aFxuICAgIGlmICggc3VwcG9ydC5xc2EgJiYgKCFyYnVnZ3lRU0EgfHwgIXJidWdneVFTQS50ZXN0KCBzZWxlY3RvciApKSApIHtcbiAgICAgIG5pZCA9IG9sZCA9IGV4cGFuZG87XG4gICAgICBuZXdDb250ZXh0ID0gY29udGV4dDtcbiAgICAgIG5ld1NlbGVjdG9yID0gbm9kZVR5cGUgPT09IDkgJiYgc2VsZWN0b3I7XG5cbiAgICAgIC8vIHFTQSB3b3JrcyBzdHJhbmdlbHkgb24gRWxlbWVudC1yb290ZWQgcXVlcmllc1xuICAgICAgLy8gV2UgY2FuIHdvcmsgYXJvdW5kIHRoaXMgYnkgc3BlY2lmeWluZyBhbiBleHRyYSBJRCBvbiB0aGUgcm9vdFxuICAgICAgLy8gYW5kIHdvcmtpbmcgdXAgZnJvbSB0aGVyZSAoVGhhbmtzIHRvIEFuZHJldyBEdXBvbnQgZm9yIHRoZSB0ZWNobmlxdWUpXG4gICAgICAvLyBJRSA4IGRvZXNuJ3Qgd29yayBvbiBvYmplY3QgZWxlbWVudHNcbiAgICAgIGlmICggbm9kZVR5cGUgPT09IDEgJiYgY29udGV4dC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpICE9PSBcIm9iamVjdFwiICkge1xuICAgICAgICBncm91cHMgPSB0b2tlbml6ZSggc2VsZWN0b3IgKTtcblxuICAgICAgICBpZiAoIChvbGQgPSBjb250ZXh0LmdldEF0dHJpYnV0ZShcImlkXCIpKSApIHtcbiAgICAgICAgICBuaWQgPSBvbGQucmVwbGFjZSggcmVzY2FwZSwgXCJcXFxcJCZcIiApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnRleHQuc2V0QXR0cmlidXRlKCBcImlkXCIsIG5pZCApO1xuICAgICAgICB9XG4gICAgICAgIG5pZCA9IFwiW2lkPSdcIiArIG5pZCArIFwiJ10gXCI7XG5cbiAgICAgICAgaSA9IGdyb3Vwcy5sZW5ndGg7XG4gICAgICAgIHdoaWxlICggaS0tICkge1xuICAgICAgICAgIGdyb3Vwc1tpXSA9IG5pZCArIHRvU2VsZWN0b3IoIGdyb3Vwc1tpXSApO1xuICAgICAgICB9XG4gICAgICAgIG5ld0NvbnRleHQgPSByc2libGluZy50ZXN0KCBzZWxlY3RvciApICYmIGNvbnRleHQucGFyZW50Tm9kZSB8fCBjb250ZXh0O1xuICAgICAgICBuZXdTZWxlY3RvciA9IGdyb3Vwcy5qb2luKFwiLFwiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCBuZXdTZWxlY3RvciApIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBwdXNoLmFwcGx5KCByZXN1bHRzLFxuICAgICAgICAgICAgbmV3Q29udGV4dC5xdWVyeVNlbGVjdG9yQWxsKCBuZXdTZWxlY3RvciApXG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgfSBjYXRjaChxc2FFcnJvcikge1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIGlmICggIW9sZCApIHtcbiAgICAgICAgICAgIGNvbnRleHQucmVtb3ZlQXR0cmlidXRlKFwiaWRcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gQWxsIG90aGVyc1xuICByZXR1cm4gc2VsZWN0KCBzZWxlY3Rvci5yZXBsYWNlKCBydHJpbSwgXCIkMVwiICksIGNvbnRleHQsIHJlc3VsdHMsIHNlZWQgKTtcbn1cblxuLyoqXG4gKiBDcmVhdGUga2V5LXZhbHVlIGNhY2hlcyBvZiBsaW1pdGVkIHNpemVcbiAqIEByZXR1cm5zIHtGdW5jdGlvbihzdHJpbmcsIE9iamVjdCl9IFJldHVybnMgdGhlIE9iamVjdCBkYXRhIGFmdGVyIHN0b3JpbmcgaXQgb24gaXRzZWxmIHdpdGhcbiAqICBwcm9wZXJ0eSBuYW1lIHRoZSAoc3BhY2Utc3VmZml4ZWQpIHN0cmluZyBhbmQgKGlmIHRoZSBjYWNoZSBpcyBsYXJnZXIgdGhhbiBFeHByLmNhY2hlTGVuZ3RoKVxuICogIGRlbGV0aW5nIHRoZSBvbGRlc3QgZW50cnlcbiAqL1xuZnVuY3Rpb24gY3JlYXRlQ2FjaGUoKSB7XG4gIHZhciBrZXlzID0gW107XG5cbiAgZnVuY3Rpb24gY2FjaGUoIGtleSwgdmFsdWUgKSB7XG4gICAgLy8gVXNlIChrZXkgKyBcIiBcIikgdG8gYXZvaWQgY29sbGlzaW9uIHdpdGggbmF0aXZlIHByb3RvdHlwZSBwcm9wZXJ0aWVzIChzZWUgSXNzdWUgIzE1NylcbiAgICBpZiAoIGtleXMucHVzaCgga2V5ICs9IFwiIFwiICkgPiBFeHByLmNhY2hlTGVuZ3RoICkge1xuICAgICAgLy8gT25seSBrZWVwIHRoZSBtb3N0IHJlY2VudCBlbnRyaWVzXG4gICAgICBkZWxldGUgY2FjaGVbIGtleXMuc2hpZnQoKSBdO1xuICAgIH1cbiAgICByZXR1cm4gKGNhY2hlWyBrZXkgXSA9IHZhbHVlKTtcbiAgfVxuICByZXR1cm4gY2FjaGU7XG59XG5cbi8qKlxuICogTWFyayBhIGZ1bmN0aW9uIGZvciBzcGVjaWFsIHVzZSBieSBTaXp6bGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiB0byBtYXJrXG4gKi9cbmZ1bmN0aW9uIG1hcmtGdW5jdGlvbiggZm4gKSB7XG4gIGZuWyBleHBhbmRvIF0gPSB0cnVlO1xuICByZXR1cm4gZm47XG59XG5cbi8qKlxuICogU3VwcG9ydCB0ZXN0aW5nIHVzaW5nIGFuIGVsZW1lbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFBhc3NlZCB0aGUgY3JlYXRlZCBkaXYgYW5kIGV4cGVjdHMgYSBib29sZWFuIHJlc3VsdFxuICovXG5mdW5jdGlvbiBhc3NlcnQoIGZuICkge1xuICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcblxuICB0cnkge1xuICAgIHJldHVybiAhIWZuKCBkaXYgKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSBmaW5hbGx5IHtcbiAgICAvLyBSZW1vdmUgZnJvbSBpdHMgcGFyZW50IGJ5IGRlZmF1bHRcbiAgICBpZiAoIGRpdi5wYXJlbnROb2RlICkge1xuICAgICAgZGl2LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoIGRpdiApO1xuICAgIH1cbiAgICAvLyByZWxlYXNlIG1lbW9yeSBpbiBJRVxuICAgIGRpdiA9IG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiBBZGRzIHRoZSBzYW1lIGhhbmRsZXIgZm9yIGFsbCBvZiB0aGUgc3BlY2lmaWVkIGF0dHJzXG4gKiBAcGFyYW0ge1N0cmluZ30gYXR0cnMgUGlwZS1zZXBhcmF0ZWQgbGlzdCBvZiBhdHRyaWJ1dGVzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBoYW5kbGVyIFRoZSBtZXRob2QgdGhhdCB3aWxsIGJlIGFwcGxpZWRcbiAqL1xuZnVuY3Rpb24gYWRkSGFuZGxlKCBhdHRycywgaGFuZGxlciApIHtcbiAgdmFyIGFyciA9IGF0dHJzLnNwbGl0KFwifFwiKSxcbiAgICBpID0gYXR0cnMubGVuZ3RoO1xuXG4gIHdoaWxlICggaS0tICkge1xuICAgIEV4cHIuYXR0ckhhbmRsZVsgYXJyW2ldIF0gPSBoYW5kbGVyO1xuICB9XG59XG5cbi8qKlxuICogQ2hlY2tzIGRvY3VtZW50IG9yZGVyIG9mIHR3byBzaWJsaW5nc1xuICogQHBhcmFtIHtFbGVtZW50fSBhXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IFJldHVybnMgbGVzcyB0aGFuIDAgaWYgYSBwcmVjZWRlcyBiLCBncmVhdGVyIHRoYW4gMCBpZiBhIGZvbGxvd3MgYlxuICovXG5mdW5jdGlvbiBzaWJsaW5nQ2hlY2soIGEsIGIgKSB7XG4gIHZhciBjdXIgPSBiICYmIGEsXG4gICAgZGlmZiA9IGN1ciAmJiBhLm5vZGVUeXBlID09PSAxICYmIGIubm9kZVR5cGUgPT09IDEgJiZcbiAgICAgICggfmIuc291cmNlSW5kZXggfHwgTUFYX05FR0FUSVZFICkgLVxuICAgICAgKCB+YS5zb3VyY2VJbmRleCB8fCBNQVhfTkVHQVRJVkUgKTtcblxuICAvLyBVc2UgSUUgc291cmNlSW5kZXggaWYgYXZhaWxhYmxlIG9uIGJvdGggbm9kZXNcbiAgaWYgKCBkaWZmICkge1xuICAgIHJldHVybiBkaWZmO1xuICB9XG5cbiAgLy8gQ2hlY2sgaWYgYiBmb2xsb3dzIGFcbiAgaWYgKCBjdXIgKSB7XG4gICAgd2hpbGUgKCAoY3VyID0gY3VyLm5leHRTaWJsaW5nKSApIHtcbiAgICAgIGlmICggY3VyID09PSBiICkge1xuICAgICAgICByZXR1cm4gLTE7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGEgPyAxIDogLTE7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIGZ1bmN0aW9uIHRvIHVzZSBpbiBwc2V1ZG9zIGZvciBpbnB1dCB0eXBlc1xuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqL1xuZnVuY3Rpb24gY3JlYXRlSW5wdXRQc2V1ZG8oIHR5cGUgKSB7XG4gIHJldHVybiBmdW5jdGlvbiggZWxlbSApIHtcbiAgICB2YXIgbmFtZSA9IGVsZW0ubm9kZU5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICByZXR1cm4gbmFtZSA9PT0gXCJpbnB1dFwiICYmIGVsZW0udHlwZSA9PT0gdHlwZTtcbiAgfTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgZnVuY3Rpb24gdG8gdXNlIGluIHBzZXVkb3MgZm9yIGJ1dHRvbnNcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUJ1dHRvblBzZXVkbyggdHlwZSApIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCBlbGVtICkge1xuICAgIHZhciBuYW1lID0gZWxlbS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIHJldHVybiAobmFtZSA9PT0gXCJpbnB1dFwiIHx8IG5hbWUgPT09IFwiYnV0dG9uXCIpICYmIGVsZW0udHlwZSA9PT0gdHlwZTtcbiAgfTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgZnVuY3Rpb24gdG8gdXNlIGluIHBzZXVkb3MgZm9yIHBvc2l0aW9uYWxzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICovXG5mdW5jdGlvbiBjcmVhdGVQb3NpdGlvbmFsUHNldWRvKCBmbiApIHtcbiAgcmV0dXJuIG1hcmtGdW5jdGlvbihmdW5jdGlvbiggYXJndW1lbnQgKSB7XG4gICAgYXJndW1lbnQgPSArYXJndW1lbnQ7XG4gICAgcmV0dXJuIG1hcmtGdW5jdGlvbihmdW5jdGlvbiggc2VlZCwgbWF0Y2hlcyApIHtcbiAgICAgIHZhciBqLFxuICAgICAgICBtYXRjaEluZGV4ZXMgPSBmbiggW10sIHNlZWQubGVuZ3RoLCBhcmd1bWVudCApLFxuICAgICAgICBpID0gbWF0Y2hJbmRleGVzLmxlbmd0aDtcblxuICAgICAgLy8gTWF0Y2ggZWxlbWVudHMgZm91bmQgYXQgdGhlIHNwZWNpZmllZCBpbmRleGVzXG4gICAgICB3aGlsZSAoIGktLSApIHtcbiAgICAgICAgaWYgKCBzZWVkWyAoaiA9IG1hdGNoSW5kZXhlc1tpXSkgXSApIHtcbiAgICAgICAgICBzZWVkW2pdID0gIShtYXRjaGVzW2pdID0gc2VlZFtqXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59XG5cbi8qKlxuICogRGV0ZWN0IHhtbFxuICogQHBhcmFtIHtFbGVtZW50fE9iamVjdH0gZWxlbSBBbiBlbGVtZW50IG9yIGEgZG9jdW1lbnRcbiAqL1xuaXNYTUwgPSBTaXp6bGUuaXNYTUwgPSBmdW5jdGlvbiggZWxlbSApIHtcbiAgLy8gZG9jdW1lbnRFbGVtZW50IGlzIHZlcmlmaWVkIGZvciBjYXNlcyB3aGVyZSBpdCBkb2Vzbid0IHlldCBleGlzdFxuICAvLyAoc3VjaCBhcyBsb2FkaW5nIGlmcmFtZXMgaW4gSUUgLSAjNDgzMylcbiAgdmFyIGRvY3VtZW50RWxlbWVudCA9IGVsZW0gJiYgKGVsZW0ub3duZXJEb2N1bWVudCB8fCBlbGVtKS5kb2N1bWVudEVsZW1lbnQ7XG4gIHJldHVybiBkb2N1bWVudEVsZW1lbnQgPyBkb2N1bWVudEVsZW1lbnQubm9kZU5hbWUgIT09IFwiSFRNTFwiIDogZmFsc2U7XG59O1xuXG4vLyBFeHBvc2Ugc3VwcG9ydCB2YXJzIGZvciBjb252ZW5pZW5jZVxuc3VwcG9ydCA9IFNpenpsZS5zdXBwb3J0ID0ge307XG5cbi8qKlxuICogU2V0cyBkb2N1bWVudC1yZWxhdGVkIHZhcmlhYmxlcyBvbmNlIGJhc2VkIG9uIHRoZSBjdXJyZW50IGRvY3VtZW50XG4gKiBAcGFyYW0ge0VsZW1lbnR8T2JqZWN0fSBbZG9jXSBBbiBlbGVtZW50IG9yIGRvY3VtZW50IG9iamVjdCB0byB1c2UgdG8gc2V0IHRoZSBkb2N1bWVudFxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgY3VycmVudCBkb2N1bWVudFxuICovXG5zZXREb2N1bWVudCA9IFNpenpsZS5zZXREb2N1bWVudCA9IGZ1bmN0aW9uKCBub2RlICkge1xuICB2YXIgZG9jID0gbm9kZSA/IG5vZGUub3duZXJEb2N1bWVudCB8fCBub2RlIDogcHJlZmVycmVkRG9jLFxuICAgIHBhcmVudCA9IGRvYy5kZWZhdWx0VmlldztcblxuICAvLyBJZiBubyBkb2N1bWVudCBhbmQgZG9jdW1lbnRFbGVtZW50IGlzIGF2YWlsYWJsZSwgcmV0dXJuXG4gIGlmICggZG9jID09PSBkb2N1bWVudCB8fCBkb2Mubm9kZVR5cGUgIT09IDkgfHwgIWRvYy5kb2N1bWVudEVsZW1lbnQgKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50O1xuICB9XG5cbiAgLy8gU2V0IG91ciBkb2N1bWVudFxuICBkb2N1bWVudCA9IGRvYztcbiAgZG9jRWxlbSA9IGRvYy5kb2N1bWVudEVsZW1lbnQ7XG5cbiAgLy8gU3VwcG9ydCB0ZXN0c1xuICBkb2N1bWVudElzSFRNTCA9ICFpc1hNTCggZG9jICk7XG5cbiAgLy8gU3VwcG9ydDogSUU+OFxuICAvLyBJZiBpZnJhbWUgZG9jdW1lbnQgaXMgYXNzaWduZWQgdG8gXCJkb2N1bWVudFwiIHZhcmlhYmxlIGFuZCBpZiBpZnJhbWUgaGFzIGJlZW4gcmVsb2FkZWQsXG4gIC8vIElFIHdpbGwgdGhyb3cgXCJwZXJtaXNzaW9uIGRlbmllZFwiIGVycm9yIHdoZW4gYWNjZXNzaW5nIFwiZG9jdW1lbnRcIiB2YXJpYWJsZSwgc2VlIGpRdWVyeSAjMTM5MzZcbiAgLy8gSUU2LTggZG8gbm90IHN1cHBvcnQgdGhlIGRlZmF1bHRWaWV3IHByb3BlcnR5IHNvIHBhcmVudCB3aWxsIGJlIHVuZGVmaW5lZFxuICBpZiAoIHBhcmVudCAmJiBwYXJlbnQuYXR0YWNoRXZlbnQgJiYgcGFyZW50ICE9PSBwYXJlbnQudG9wICkge1xuICAgIHBhcmVudC5hdHRhY2hFdmVudCggXCJvbmJlZm9yZXVubG9hZFwiLCBmdW5jdGlvbigpIHtcbiAgICAgIHNldERvY3VtZW50KCk7XG4gICAgfSk7XG4gIH1cblxuICAvKiBBdHRyaWJ1dGVzXG4gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxuICAvLyBTdXBwb3J0OiBJRTw4XG4gIC8vIFZlcmlmeSB0aGF0IGdldEF0dHJpYnV0ZSByZWFsbHkgcmV0dXJucyBhdHRyaWJ1dGVzIGFuZCBub3QgcHJvcGVydGllcyAoZXhjZXB0aW5nIElFOCBib29sZWFucylcbiAgc3VwcG9ydC5hdHRyaWJ1dGVzID0gYXNzZXJ0KGZ1bmN0aW9uKCBkaXYgKSB7XG4gICAgZGl2LmNsYXNzTmFtZSA9IFwiaVwiO1xuICAgIHJldHVybiAhZGl2LmdldEF0dHJpYnV0ZShcImNsYXNzTmFtZVwiKTtcbiAgfSk7XG5cbiAgLyogZ2V0RWxlbWVudChzKUJ5KlxuICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cbiAgLy8gQ2hlY2sgaWYgZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCIqXCIpIHJldHVybnMgb25seSBlbGVtZW50c1xuICBzdXBwb3J0LmdldEVsZW1lbnRzQnlUYWdOYW1lID0gYXNzZXJ0KGZ1bmN0aW9uKCBkaXYgKSB7XG4gICAgZGl2LmFwcGVuZENoaWxkKCBkb2MuY3JlYXRlQ29tbWVudChcIlwiKSApO1xuICAgIHJldHVybiAhZGl2LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiKlwiKS5sZW5ndGg7XG4gIH0pO1xuXG4gIC8vIENoZWNrIGlmIGdldEVsZW1lbnRzQnlDbGFzc05hbWUgY2FuIGJlIHRydXN0ZWRcbiAgc3VwcG9ydC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lID0gYXNzZXJ0KGZ1bmN0aW9uKCBkaXYgKSB7XG4gICAgZGl2LmlubmVySFRNTCA9IFwiPGRpdiBjbGFzcz0nYSc+PC9kaXY+PGRpdiBjbGFzcz0nYSBpJz48L2Rpdj5cIjtcblxuICAgIC8vIFN1cHBvcnQ6IFNhZmFyaTw0XG4gICAgLy8gQ2F0Y2ggY2xhc3Mgb3Zlci1jYWNoaW5nXG4gICAgZGl2LmZpcnN0Q2hpbGQuY2xhc3NOYW1lID0gXCJpXCI7XG4gICAgLy8gU3VwcG9ydDogT3BlcmE8MTBcbiAgICAvLyBDYXRjaCBnRUJDTiBmYWlsdXJlIHRvIGZpbmQgbm9uLWxlYWRpbmcgY2xhc3Nlc1xuICAgIHJldHVybiBkaXYuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcImlcIikubGVuZ3RoID09PSAyO1xuICB9KTtcblxuICAvLyBTdXBwb3J0OiBJRTwxMFxuICAvLyBDaGVjayBpZiBnZXRFbGVtZW50QnlJZCByZXR1cm5zIGVsZW1lbnRzIGJ5IG5hbWVcbiAgLy8gVGhlIGJyb2tlbiBnZXRFbGVtZW50QnlJZCBtZXRob2RzIGRvbid0IHBpY2sgdXAgcHJvZ3JhbWF0aWNhbGx5LXNldCBuYW1lcyxcbiAgLy8gc28gdXNlIGEgcm91bmRhYm91dCBnZXRFbGVtZW50c0J5TmFtZSB0ZXN0XG4gIHN1cHBvcnQuZ2V0QnlJZCA9IGFzc2VydChmdW5jdGlvbiggZGl2ICkge1xuICAgIGRvY0VsZW0uYXBwZW5kQ2hpbGQoIGRpdiApLmlkID0gZXhwYW5kbztcbiAgICByZXR1cm4gIWRvYy5nZXRFbGVtZW50c0J5TmFtZSB8fCAhZG9jLmdldEVsZW1lbnRzQnlOYW1lKCBleHBhbmRvICkubGVuZ3RoO1xuICB9KTtcblxuICAvLyBJRCBmaW5kIGFuZCBmaWx0ZXJcbiAgaWYgKCBzdXBwb3J0LmdldEJ5SWQgKSB7XG4gICAgRXhwci5maW5kW1wiSURcIl0gPSBmdW5jdGlvbiggaWQsIGNvbnRleHQgKSB7XG4gICAgICBpZiAoIHR5cGVvZiBjb250ZXh0LmdldEVsZW1lbnRCeUlkICE9PSBzdHJ1bmRlZmluZWQgJiYgZG9jdW1lbnRJc0hUTUwgKSB7XG4gICAgICAgIHZhciBtID0gY29udGV4dC5nZXRFbGVtZW50QnlJZCggaWQgKTtcbiAgICAgICAgLy8gQ2hlY2sgcGFyZW50Tm9kZSB0byBjYXRjaCB3aGVuIEJsYWNrYmVycnkgNC42IHJldHVybnNcbiAgICAgICAgLy8gbm9kZXMgdGhhdCBhcmUgbm8gbG9uZ2VyIGluIHRoZSBkb2N1bWVudCAjNjk2M1xuICAgICAgICByZXR1cm4gbSAmJiBtLnBhcmVudE5vZGUgPyBbbV0gOiBbXTtcbiAgICAgIH1cbiAgICB9O1xuICAgIEV4cHIuZmlsdGVyW1wiSURcIl0gPSBmdW5jdGlvbiggaWQgKSB7XG4gICAgICB2YXIgYXR0cklkID0gaWQucmVwbGFjZSggcnVuZXNjYXBlLCBmdW5lc2NhcGUgKTtcbiAgICAgIHJldHVybiBmdW5jdGlvbiggZWxlbSApIHtcbiAgICAgICAgcmV0dXJuIGVsZW0uZ2V0QXR0cmlidXRlKFwiaWRcIikgPT09IGF0dHJJZDtcbiAgICAgIH07XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICAvLyBTdXBwb3J0OiBJRTYvN1xuICAgIC8vIGdldEVsZW1lbnRCeUlkIGlzIG5vdCByZWxpYWJsZSBhcyBhIGZpbmQgc2hvcnRjdXRcbiAgICBkZWxldGUgRXhwci5maW5kW1wiSURcIl07XG5cbiAgICBFeHByLmZpbHRlcltcIklEXCJdID0gIGZ1bmN0aW9uKCBpZCApIHtcbiAgICAgIHZhciBhdHRySWQgPSBpZC5yZXBsYWNlKCBydW5lc2NhcGUsIGZ1bmVzY2FwZSApO1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCBlbGVtICkge1xuICAgICAgICB2YXIgbm9kZSA9IHR5cGVvZiBlbGVtLmdldEF0dHJpYnV0ZU5vZGUgIT09IHN0cnVuZGVmaW5lZCAmJiBlbGVtLmdldEF0dHJpYnV0ZU5vZGUoXCJpZFwiKTtcbiAgICAgICAgcmV0dXJuIG5vZGUgJiYgbm9kZS52YWx1ZSA9PT0gYXR0cklkO1xuICAgICAgfTtcbiAgICB9O1xuICB9XG5cbiAgLy8gVGFnXG4gIEV4cHIuZmluZFtcIlRBR1wiXSA9IHN1cHBvcnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUgP1xuICAgIGZ1bmN0aW9uKCB0YWcsIGNvbnRleHQgKSB7XG4gICAgICBpZiAoIHR5cGVvZiBjb250ZXh0LmdldEVsZW1lbnRzQnlUYWdOYW1lICE9PSBzdHJ1bmRlZmluZWQgKSB7XG4gICAgICAgIHJldHVybiBjb250ZXh0LmdldEVsZW1lbnRzQnlUYWdOYW1lKCB0YWcgKTtcbiAgICAgIH1cbiAgICB9IDpcbiAgICBmdW5jdGlvbiggdGFnLCBjb250ZXh0ICkge1xuICAgICAgdmFyIGVsZW0sXG4gICAgICAgIHRtcCA9IFtdLFxuICAgICAgICBpID0gMCxcbiAgICAgICAgcmVzdWx0cyA9IGNvbnRleHQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoIHRhZyApO1xuXG4gICAgICAvLyBGaWx0ZXIgb3V0IHBvc3NpYmxlIGNvbW1lbnRzXG4gICAgICBpZiAoIHRhZyA9PT0gXCIqXCIgKSB7XG4gICAgICAgIHdoaWxlICggKGVsZW0gPSByZXN1bHRzW2krK10pICkge1xuICAgICAgICAgIGlmICggZWxlbS5ub2RlVHlwZSA9PT0gMSApIHtcbiAgICAgICAgICAgIHRtcC5wdXNoKCBlbGVtICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRtcDtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH07XG5cbiAgLy8gQ2xhc3NcbiAgRXhwci5maW5kW1wiQ0xBU1NcIl0gPSBzdXBwb3J0LmdldEVsZW1lbnRzQnlDbGFzc05hbWUgJiYgZnVuY3Rpb24oIGNsYXNzTmFtZSwgY29udGV4dCApIHtcbiAgICBpZiAoIHR5cGVvZiBjb250ZXh0LmdldEVsZW1lbnRzQnlDbGFzc05hbWUgIT09IHN0cnVuZGVmaW5lZCAmJiBkb2N1bWVudElzSFRNTCApIHtcbiAgICAgIHJldHVybiBjb250ZXh0LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoIGNsYXNzTmFtZSApO1xuICAgIH1cbiAgfTtcblxuICAvKiBRU0EvbWF0Y2hlc1NlbGVjdG9yXG4gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxuICAvLyBRU0EgYW5kIG1hdGNoZXNTZWxlY3RvciBzdXBwb3J0XG5cbiAgLy8gbWF0Y2hlc1NlbGVjdG9yKDphY3RpdmUpIHJlcG9ydHMgZmFsc2Ugd2hlbiB0cnVlIChJRTkvT3BlcmEgMTEuNSlcbiAgcmJ1Z2d5TWF0Y2hlcyA9IFtdO1xuXG4gIC8vIHFTYSg6Zm9jdXMpIHJlcG9ydHMgZmFsc2Ugd2hlbiB0cnVlIChDaHJvbWUgMjEpXG4gIC8vIFdlIGFsbG93IHRoaXMgYmVjYXVzZSBvZiBhIGJ1ZyBpbiBJRTgvOSB0aGF0IHRocm93cyBhbiBlcnJvclxuICAvLyB3aGVuZXZlciBgZG9jdW1lbnQuYWN0aXZlRWxlbWVudGAgaXMgYWNjZXNzZWQgb24gYW4gaWZyYW1lXG4gIC8vIFNvLCB3ZSBhbGxvdyA6Zm9jdXMgdG8gcGFzcyB0aHJvdWdoIFFTQSBhbGwgdGhlIHRpbWUgdG8gYXZvaWQgdGhlIElFIGVycm9yXG4gIC8vIFNlZSBodHRwOi8vYnVncy5qcXVlcnkuY29tL3RpY2tldC8xMzM3OFxuICByYnVnZ3lRU0EgPSBbXTtcblxuICBpZiAoIChzdXBwb3J0LnFzYSA9IHJuYXRpdmUudGVzdCggZG9jLnF1ZXJ5U2VsZWN0b3JBbGwgKSkgKSB7XG4gICAgLy8gQnVpbGQgUVNBIHJlZ2V4XG4gICAgLy8gUmVnZXggc3RyYXRlZ3kgYWRvcHRlZCBmcm9tIERpZWdvIFBlcmluaVxuICAgIGFzc2VydChmdW5jdGlvbiggZGl2ICkge1xuICAgICAgLy8gU2VsZWN0IGlzIHNldCB0byBlbXB0eSBzdHJpbmcgb24gcHVycG9zZVxuICAgICAgLy8gVGhpcyBpcyB0byB0ZXN0IElFJ3MgdHJlYXRtZW50IG9mIG5vdCBleHBsaWNpdGx5XG4gICAgICAvLyBzZXR0aW5nIGEgYm9vbGVhbiBjb250ZW50IGF0dHJpYnV0ZSxcbiAgICAgIC8vIHNpbmNlIGl0cyBwcmVzZW5jZSBzaG91bGQgYmUgZW5vdWdoXG4gICAgICAvLyBodHRwOi8vYnVncy5qcXVlcnkuY29tL3RpY2tldC8xMjM1OVxuICAgICAgZGl2LmlubmVySFRNTCA9IFwiPHNlbGVjdD48b3B0aW9uIHNlbGVjdGVkPScnPjwvb3B0aW9uPjwvc2VsZWN0PlwiO1xuXG4gICAgICAvLyBTdXBwb3J0OiBJRThcbiAgICAgIC8vIEJvb2xlYW4gYXR0cmlidXRlcyBhbmQgXCJ2YWx1ZVwiIGFyZSBub3QgdHJlYXRlZCBjb3JyZWN0bHlcbiAgICAgIGlmICggIWRpdi5xdWVyeVNlbGVjdG9yQWxsKFwiW3NlbGVjdGVkXVwiKS5sZW5ndGggKSB7XG4gICAgICAgIHJidWdneVFTQS5wdXNoKCBcIlxcXFxbXCIgKyB3aGl0ZXNwYWNlICsgXCIqKD86dmFsdWV8XCIgKyBib29sZWFucyArIFwiKVwiICk7XG4gICAgICB9XG5cbiAgICAgIC8vIFdlYmtpdC9PcGVyYSAtIDpjaGVja2VkIHNob3VsZCByZXR1cm4gc2VsZWN0ZWQgb3B0aW9uIGVsZW1lbnRzXG4gICAgICAvLyBodHRwOi8vd3d3LnczLm9yZy9UUi8yMDExL1JFQy1jc3MzLXNlbGVjdG9ycy0yMDExMDkyOS8jY2hlY2tlZFxuICAgICAgLy8gSUU4IHRocm93cyBlcnJvciBoZXJlIGFuZCB3aWxsIG5vdCBzZWUgbGF0ZXIgdGVzdHNcbiAgICAgIGlmICggIWRpdi5xdWVyeVNlbGVjdG9yQWxsKFwiOmNoZWNrZWRcIikubGVuZ3RoICkge1xuICAgICAgICByYnVnZ3lRU0EucHVzaChcIjpjaGVja2VkXCIpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgYXNzZXJ0KGZ1bmN0aW9uKCBkaXYgKSB7XG5cbiAgICAgIC8vIFN1cHBvcnQ6IE9wZXJhIDEwLTEyL0lFOFxuICAgICAgLy8gXj0gJD0gKj0gYW5kIGVtcHR5IHZhbHVlc1xuICAgICAgLy8gU2hvdWxkIG5vdCBzZWxlY3QgYW55dGhpbmdcbiAgICAgIC8vIFN1cHBvcnQ6IFdpbmRvd3MgOCBOYXRpdmUgQXBwc1xuICAgICAgLy8gVGhlIHR5cGUgYXR0cmlidXRlIGlzIHJlc3RyaWN0ZWQgZHVyaW5nIC5pbm5lckhUTUwgYXNzaWdubWVudFxuICAgICAgdmFyIGlucHV0ID0gZG9jLmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTtcbiAgICAgIGlucHV0LnNldEF0dHJpYnV0ZSggXCJ0eXBlXCIsIFwiaGlkZGVuXCIgKTtcbiAgICAgIGRpdi5hcHBlbmRDaGlsZCggaW5wdXQgKS5zZXRBdHRyaWJ1dGUoIFwidFwiLCBcIlwiICk7XG5cbiAgICAgIGlmICggZGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCJbdF49JyddXCIpLmxlbmd0aCApIHtcbiAgICAgICAgcmJ1Z2d5UVNBLnB1c2goIFwiWypeJF09XCIgKyB3aGl0ZXNwYWNlICsgXCIqKD86Jyd8XFxcIlxcXCIpXCIgKTtcbiAgICAgIH1cblxuICAgICAgLy8gRkYgMy41IC0gOmVuYWJsZWQvOmRpc2FibGVkIGFuZCBoaWRkZW4gZWxlbWVudHMgKGhpZGRlbiBlbGVtZW50cyBhcmUgc3RpbGwgZW5hYmxlZClcbiAgICAgIC8vIElFOCB0aHJvd3MgZXJyb3IgaGVyZSBhbmQgd2lsbCBub3Qgc2VlIGxhdGVyIHRlc3RzXG4gICAgICBpZiAoICFkaXYucXVlcnlTZWxlY3RvckFsbChcIjplbmFibGVkXCIpLmxlbmd0aCApIHtcbiAgICAgICAgcmJ1Z2d5UVNBLnB1c2goIFwiOmVuYWJsZWRcIiwgXCI6ZGlzYWJsZWRcIiApO1xuICAgICAgfVxuXG4gICAgICAvLyBPcGVyYSAxMC0xMSBkb2VzIG5vdCB0aHJvdyBvbiBwb3N0LWNvbW1hIGludmFsaWQgcHNldWRvc1xuICAgICAgZGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCIqLDp4XCIpO1xuICAgICAgcmJ1Z2d5UVNBLnB1c2goXCIsLio6XCIpO1xuICAgIH0pO1xuICB9XG5cbiAgaWYgKCAoc3VwcG9ydC5tYXRjaGVzU2VsZWN0b3IgPSBybmF0aXZlLnRlc3QoIChtYXRjaGVzID0gZG9jRWxlbS53ZWJraXRNYXRjaGVzU2VsZWN0b3IgfHxcbiAgICBkb2NFbGVtLm1vek1hdGNoZXNTZWxlY3RvciB8fFxuICAgIGRvY0VsZW0ub01hdGNoZXNTZWxlY3RvciB8fFxuICAgIGRvY0VsZW0ubXNNYXRjaGVzU2VsZWN0b3IpICkpICkge1xuXG4gICAgYXNzZXJ0KGZ1bmN0aW9uKCBkaXYgKSB7XG4gICAgICAvLyBDaGVjayB0byBzZWUgaWYgaXQncyBwb3NzaWJsZSB0byBkbyBtYXRjaGVzU2VsZWN0b3JcbiAgICAgIC8vIG9uIGEgZGlzY29ubmVjdGVkIG5vZGUgKElFIDkpXG4gICAgICBzdXBwb3J0LmRpc2Nvbm5lY3RlZE1hdGNoID0gbWF0Y2hlcy5jYWxsKCBkaXYsIFwiZGl2XCIgKTtcblxuICAgICAgLy8gVGhpcyBzaG91bGQgZmFpbCB3aXRoIGFuIGV4Y2VwdGlvblxuICAgICAgLy8gR2Vja28gZG9lcyBub3QgZXJyb3IsIHJldHVybnMgZmFsc2UgaW5zdGVhZFxuICAgICAgbWF0Y2hlcy5jYWxsKCBkaXYsIFwiW3MhPScnXTp4XCIgKTtcbiAgICAgIHJidWdneU1hdGNoZXMucHVzaCggXCIhPVwiLCBwc2V1ZG9zICk7XG4gICAgfSk7XG4gIH1cblxuICByYnVnZ3lRU0EgPSByYnVnZ3lRU0EubGVuZ3RoICYmIG5ldyBSZWdFeHAoIHJidWdneVFTQS5qb2luKFwifFwiKSApO1xuICByYnVnZ3lNYXRjaGVzID0gcmJ1Z2d5TWF0Y2hlcy5sZW5ndGggJiYgbmV3IFJlZ0V4cCggcmJ1Z2d5TWF0Y2hlcy5qb2luKFwifFwiKSApO1xuXG4gIC8qIENvbnRhaW5zXG4gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxuICAvLyBFbGVtZW50IGNvbnRhaW5zIGFub3RoZXJcbiAgLy8gUHVycG9zZWZ1bGx5IGRvZXMgbm90IGltcGxlbWVudCBpbmNsdXNpdmUgZGVzY2VuZGVudFxuICAvLyBBcyBpbiwgYW4gZWxlbWVudCBkb2VzIG5vdCBjb250YWluIGl0c2VsZlxuICBjb250YWlucyA9IHJuYXRpdmUudGVzdCggZG9jRWxlbS5jb250YWlucyApIHx8IGRvY0VsZW0uY29tcGFyZURvY3VtZW50UG9zaXRpb24gP1xuICAgIGZ1bmN0aW9uKCBhLCBiICkge1xuICAgICAgdmFyIGFkb3duID0gYS5ub2RlVHlwZSA9PT0gOSA/IGEuZG9jdW1lbnRFbGVtZW50IDogYSxcbiAgICAgICAgYnVwID0gYiAmJiBiLnBhcmVudE5vZGU7XG4gICAgICByZXR1cm4gYSA9PT0gYnVwIHx8ICEhKCBidXAgJiYgYnVwLm5vZGVUeXBlID09PSAxICYmIChcbiAgICAgICAgYWRvd24uY29udGFpbnMgP1xuICAgICAgICAgIGFkb3duLmNvbnRhaW5zKCBidXAgKSA6XG4gICAgICAgICAgYS5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbiAmJiBhLmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uKCBidXAgKSAmIDE2XG4gICAgICApKTtcbiAgICB9IDpcbiAgICBmdW5jdGlvbiggYSwgYiApIHtcbiAgICAgIGlmICggYiApIHtcbiAgICAgICAgd2hpbGUgKCAoYiA9IGIucGFyZW50Tm9kZSkgKSB7XG4gICAgICAgICAgaWYgKCBiID09PSBhICkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcblxuICAvKiBTb3J0aW5nXG4gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxuICAvLyBEb2N1bWVudCBvcmRlciBzb3J0aW5nXG4gIHNvcnRPcmRlciA9IGRvY0VsZW0uY29tcGFyZURvY3VtZW50UG9zaXRpb24gP1xuICBmdW5jdGlvbiggYSwgYiApIHtcblxuICAgIC8vIEZsYWcgZm9yIGR1cGxpY2F0ZSByZW1vdmFsXG4gICAgaWYgKCBhID09PSBiICkge1xuICAgICAgaGFzRHVwbGljYXRlID0gdHJ1ZTtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIHZhciBjb21wYXJlID0gYi5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbiAmJiBhLmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uICYmIGEuY29tcGFyZURvY3VtZW50UG9zaXRpb24oIGIgKTtcblxuICAgIGlmICggY29tcGFyZSApIHtcbiAgICAgIC8vIERpc2Nvbm5lY3RlZCBub2Rlc1xuICAgICAgaWYgKCBjb21wYXJlICYgMSB8fFxuICAgICAgICAoIXN1cHBvcnQuc29ydERldGFjaGVkICYmIGIuY29tcGFyZURvY3VtZW50UG9zaXRpb24oIGEgKSA9PT0gY29tcGFyZSkgKSB7XG5cbiAgICAgICAgLy8gQ2hvb3NlIHRoZSBmaXJzdCBlbGVtZW50IHRoYXQgaXMgcmVsYXRlZCB0byBvdXIgcHJlZmVycmVkIGRvY3VtZW50XG4gICAgICAgIGlmICggYSA9PT0gZG9jIHx8IGNvbnRhaW5zKHByZWZlcnJlZERvYywgYSkgKSB7XG4gICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9XG4gICAgICAgIGlmICggYiA9PT0gZG9jIHx8IGNvbnRhaW5zKHByZWZlcnJlZERvYywgYikgKSB7XG4gICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBNYWludGFpbiBvcmlnaW5hbCBvcmRlclxuICAgICAgICByZXR1cm4gc29ydElucHV0ID9cbiAgICAgICAgICAoIGluZGV4T2YuY2FsbCggc29ydElucHV0LCBhICkgLSBpbmRleE9mLmNhbGwoIHNvcnRJbnB1dCwgYiApICkgOlxuICAgICAgICAgIDA7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjb21wYXJlICYgNCA/IC0xIDogMTtcbiAgICB9XG5cbiAgICAvLyBOb3QgZGlyZWN0bHkgY29tcGFyYWJsZSwgc29ydCBvbiBleGlzdGVuY2Ugb2YgbWV0aG9kXG4gICAgcmV0dXJuIGEuY29tcGFyZURvY3VtZW50UG9zaXRpb24gPyAtMSA6IDE7XG4gIH0gOlxuICBmdW5jdGlvbiggYSwgYiApIHtcbiAgICB2YXIgY3VyLFxuICAgICAgaSA9IDAsXG4gICAgICBhdXAgPSBhLnBhcmVudE5vZGUsXG4gICAgICBidXAgPSBiLnBhcmVudE5vZGUsXG4gICAgICBhcCA9IFsgYSBdLFxuICAgICAgYnAgPSBbIGIgXTtcblxuICAgIC8vIEV4aXQgZWFybHkgaWYgdGhlIG5vZGVzIGFyZSBpZGVudGljYWxcbiAgICBpZiAoIGEgPT09IGIgKSB7XG4gICAgICBoYXNEdXBsaWNhdGUgPSB0cnVlO1xuICAgICAgcmV0dXJuIDA7XG5cbiAgICAvLyBQYXJlbnRsZXNzIG5vZGVzIGFyZSBlaXRoZXIgZG9jdW1lbnRzIG9yIGRpc2Nvbm5lY3RlZFxuICAgIH0gZWxzZSBpZiAoICFhdXAgfHwgIWJ1cCApIHtcbiAgICAgIHJldHVybiBhID09PSBkb2MgPyAtMSA6XG4gICAgICAgIGIgPT09IGRvYyA/IDEgOlxuICAgICAgICBhdXAgPyAtMSA6XG4gICAgICAgIGJ1cCA/IDEgOlxuICAgICAgICBzb3J0SW5wdXQgP1xuICAgICAgICAoIGluZGV4T2YuY2FsbCggc29ydElucHV0LCBhICkgLSBpbmRleE9mLmNhbGwoIHNvcnRJbnB1dCwgYiApICkgOlxuICAgICAgICAwO1xuXG4gICAgLy8gSWYgdGhlIG5vZGVzIGFyZSBzaWJsaW5ncywgd2UgY2FuIGRvIGEgcXVpY2sgY2hlY2tcbiAgICB9IGVsc2UgaWYgKCBhdXAgPT09IGJ1cCApIHtcbiAgICAgIHJldHVybiBzaWJsaW5nQ2hlY2soIGEsIGIgKTtcbiAgICB9XG5cbiAgICAvLyBPdGhlcndpc2Ugd2UgbmVlZCBmdWxsIGxpc3RzIG9mIHRoZWlyIGFuY2VzdG9ycyBmb3IgY29tcGFyaXNvblxuICAgIGN1ciA9IGE7XG4gICAgd2hpbGUgKCAoY3VyID0gY3VyLnBhcmVudE5vZGUpICkge1xuICAgICAgYXAudW5zaGlmdCggY3VyICk7XG4gICAgfVxuICAgIGN1ciA9IGI7XG4gICAgd2hpbGUgKCAoY3VyID0gY3VyLnBhcmVudE5vZGUpICkge1xuICAgICAgYnAudW5zaGlmdCggY3VyICk7XG4gICAgfVxuXG4gICAgLy8gV2FsayBkb3duIHRoZSB0cmVlIGxvb2tpbmcgZm9yIGEgZGlzY3JlcGFuY3lcbiAgICB3aGlsZSAoIGFwW2ldID09PSBicFtpXSApIHtcbiAgICAgIGkrKztcbiAgICB9XG5cbiAgICByZXR1cm4gaSA/XG4gICAgICAvLyBEbyBhIHNpYmxpbmcgY2hlY2sgaWYgdGhlIG5vZGVzIGhhdmUgYSBjb21tb24gYW5jZXN0b3JcbiAgICAgIHNpYmxpbmdDaGVjayggYXBbaV0sIGJwW2ldICkgOlxuXG4gICAgICAvLyBPdGhlcndpc2Ugbm9kZXMgaW4gb3VyIGRvY3VtZW50IHNvcnQgZmlyc3RcbiAgICAgIGFwW2ldID09PSBwcmVmZXJyZWREb2MgPyAtMSA6XG4gICAgICBicFtpXSA9PT0gcHJlZmVycmVkRG9jID8gMSA6XG4gICAgICAwO1xuICB9O1xuXG4gIHJldHVybiBkb2M7XG59O1xuXG5TaXp6bGUubWF0Y2hlcyA9IGZ1bmN0aW9uKCBleHByLCBlbGVtZW50cyApIHtcbiAgcmV0dXJuIFNpenpsZSggZXhwciwgbnVsbCwgbnVsbCwgZWxlbWVudHMgKTtcbn07XG5cblNpenpsZS5tYXRjaGVzU2VsZWN0b3IgPSBmdW5jdGlvbiggZWxlbSwgZXhwciApIHtcbiAgLy8gU2V0IGRvY3VtZW50IHZhcnMgaWYgbmVlZGVkXG4gIGlmICggKCBlbGVtLm93bmVyRG9jdW1lbnQgfHwgZWxlbSApICE9PSBkb2N1bWVudCApIHtcbiAgICBzZXREb2N1bWVudCggZWxlbSApO1xuICB9XG5cbiAgLy8gTWFrZSBzdXJlIHRoYXQgYXR0cmlidXRlIHNlbGVjdG9ycyBhcmUgcXVvdGVkXG4gIGV4cHIgPSBleHByLnJlcGxhY2UoIHJhdHRyaWJ1dGVRdW90ZXMsIFwiPSckMSddXCIgKTtcblxuICBpZiAoIHN1cHBvcnQubWF0Y2hlc1NlbGVjdG9yICYmIGRvY3VtZW50SXNIVE1MICYmXG4gICAgKCAhcmJ1Z2d5TWF0Y2hlcyB8fCAhcmJ1Z2d5TWF0Y2hlcy50ZXN0KCBleHByICkgKSAmJlxuICAgICggIXJidWdneVFTQSAgICAgfHwgIXJidWdneVFTQS50ZXN0KCBleHByICkgKSApIHtcblxuICAgIHRyeSB7XG4gICAgICB2YXIgcmV0ID0gbWF0Y2hlcy5jYWxsKCBlbGVtLCBleHByICk7XG5cbiAgICAgIC8vIElFIDkncyBtYXRjaGVzU2VsZWN0b3IgcmV0dXJucyBmYWxzZSBvbiBkaXNjb25uZWN0ZWQgbm9kZXNcbiAgICAgIGlmICggcmV0IHx8IHN1cHBvcnQuZGlzY29ubmVjdGVkTWF0Y2ggfHxcbiAgICAgICAgICAvLyBBcyB3ZWxsLCBkaXNjb25uZWN0ZWQgbm9kZXMgYXJlIHNhaWQgdG8gYmUgaW4gYSBkb2N1bWVudFxuICAgICAgICAgIC8vIGZyYWdtZW50IGluIElFIDlcbiAgICAgICAgICBlbGVtLmRvY3VtZW50ICYmIGVsZW0uZG9jdW1lbnQubm9kZVR5cGUgIT09IDExICkge1xuICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgfVxuICAgIH0gY2F0Y2goZSkge31cbiAgfVxuXG4gIHJldHVybiBTaXp6bGUoIGV4cHIsIGRvY3VtZW50LCBudWxsLCBbZWxlbV0gKS5sZW5ndGggPiAwO1xufTtcblxuU2l6emxlLmNvbnRhaW5zID0gZnVuY3Rpb24oIGNvbnRleHQsIGVsZW0gKSB7XG4gIC8vIFNldCBkb2N1bWVudCB2YXJzIGlmIG5lZWRlZFxuICBpZiAoICggY29udGV4dC5vd25lckRvY3VtZW50IHx8IGNvbnRleHQgKSAhPT0gZG9jdW1lbnQgKSB7XG4gICAgc2V0RG9jdW1lbnQoIGNvbnRleHQgKTtcbiAgfVxuICByZXR1cm4gY29udGFpbnMoIGNvbnRleHQsIGVsZW0gKTtcbn07XG5cblNpenpsZS5hdHRyID0gZnVuY3Rpb24oIGVsZW0sIG5hbWUgKSB7XG4gIC8vIFNldCBkb2N1bWVudCB2YXJzIGlmIG5lZWRlZFxuICBpZiAoICggZWxlbS5vd25lckRvY3VtZW50IHx8IGVsZW0gKSAhPT0gZG9jdW1lbnQgKSB7XG4gICAgc2V0RG9jdW1lbnQoIGVsZW0gKTtcbiAgfVxuXG4gIHZhciBmbiA9IEV4cHIuYXR0ckhhbmRsZVsgbmFtZS50b0xvd2VyQ2FzZSgpIF0sXG4gICAgLy8gRG9uJ3QgZ2V0IGZvb2xlZCBieSBPYmplY3QucHJvdG90eXBlIHByb3BlcnRpZXMgKGpRdWVyeSAjMTM4MDcpXG4gICAgdmFsID0gZm4gJiYgaGFzT3duLmNhbGwoIEV4cHIuYXR0ckhhbmRsZSwgbmFtZS50b0xvd2VyQ2FzZSgpICkgP1xuICAgICAgZm4oIGVsZW0sIG5hbWUsICFkb2N1bWVudElzSFRNTCApIDpcbiAgICAgIHVuZGVmaW5lZDtcblxuICByZXR1cm4gdmFsID09PSB1bmRlZmluZWQgP1xuICAgIHN1cHBvcnQuYXR0cmlidXRlcyB8fCAhZG9jdW1lbnRJc0hUTUwgP1xuICAgICAgZWxlbS5nZXRBdHRyaWJ1dGUoIG5hbWUgKSA6XG4gICAgICAodmFsID0gZWxlbS5nZXRBdHRyaWJ1dGVOb2RlKG5hbWUpKSAmJiB2YWwuc3BlY2lmaWVkID9cbiAgICAgICAgdmFsLnZhbHVlIDpcbiAgICAgICAgbnVsbCA6XG4gICAgdmFsO1xufTtcblxuU2l6emxlLmVycm9yID0gZnVuY3Rpb24oIG1zZyApIHtcbiAgdGhyb3cgbmV3IEVycm9yKCBcIlN5bnRheCBlcnJvciwgdW5yZWNvZ25pemVkIGV4cHJlc3Npb246IFwiICsgbXNnICk7XG59O1xuXG4vKipcbiAqIERvY3VtZW50IHNvcnRpbmcgYW5kIHJlbW92aW5nIGR1cGxpY2F0ZXNcbiAqIEBwYXJhbSB7QXJyYXlMaWtlfSByZXN1bHRzXG4gKi9cblNpenpsZS51bmlxdWVTb3J0ID0gZnVuY3Rpb24oIHJlc3VsdHMgKSB7XG4gIHZhciBlbGVtLFxuICAgIGR1cGxpY2F0ZXMgPSBbXSxcbiAgICBqID0gMCxcbiAgICBpID0gMDtcblxuICAvLyBVbmxlc3Mgd2UgKmtub3cqIHdlIGNhbiBkZXRlY3QgZHVwbGljYXRlcywgYXNzdW1lIHRoZWlyIHByZXNlbmNlXG4gIGhhc0R1cGxpY2F0ZSA9ICFzdXBwb3J0LmRldGVjdER1cGxpY2F0ZXM7XG4gIHNvcnRJbnB1dCA9ICFzdXBwb3J0LnNvcnRTdGFibGUgJiYgcmVzdWx0cy5zbGljZSggMCApO1xuICByZXN1bHRzLnNvcnQoIHNvcnRPcmRlciApO1xuXG4gIGlmICggaGFzRHVwbGljYXRlICkge1xuICAgIHdoaWxlICggKGVsZW0gPSByZXN1bHRzW2krK10pICkge1xuICAgICAgaWYgKCBlbGVtID09PSByZXN1bHRzWyBpIF0gKSB7XG4gICAgICAgIGogPSBkdXBsaWNhdGVzLnB1c2goIGkgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgd2hpbGUgKCBqLS0gKSB7XG4gICAgICByZXN1bHRzLnNwbGljZSggZHVwbGljYXRlc1sgaiBdLCAxICk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdHM7XG59O1xuXG4vKipcbiAqIFV0aWxpdHkgZnVuY3Rpb24gZm9yIHJldHJpZXZpbmcgdGhlIHRleHQgdmFsdWUgb2YgYW4gYXJyYXkgb2YgRE9NIG5vZGVzXG4gKiBAcGFyYW0ge0FycmF5fEVsZW1lbnR9IGVsZW1cbiAqL1xuZ2V0VGV4dCA9IFNpenpsZS5nZXRUZXh0ID0gZnVuY3Rpb24oIGVsZW0gKSB7XG4gIHZhciBub2RlLFxuICAgIHJldCA9IFwiXCIsXG4gICAgaSA9IDAsXG4gICAgbm9kZVR5cGUgPSBlbGVtLm5vZGVUeXBlO1xuXG4gIGlmICggIW5vZGVUeXBlICkge1xuICAgIC8vIElmIG5vIG5vZGVUeXBlLCB0aGlzIGlzIGV4cGVjdGVkIHRvIGJlIGFuIGFycmF5XG4gICAgZm9yICggOyAobm9kZSA9IGVsZW1baV0pOyBpKysgKSB7XG4gICAgICAvLyBEbyBub3QgdHJhdmVyc2UgY29tbWVudCBub2Rlc1xuICAgICAgcmV0ICs9IGdldFRleHQoIG5vZGUgKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoIG5vZGVUeXBlID09PSAxIHx8IG5vZGVUeXBlID09PSA5IHx8IG5vZGVUeXBlID09PSAxMSApIHtcbiAgICAvLyBVc2UgdGV4dENvbnRlbnQgZm9yIGVsZW1lbnRzXG4gICAgLy8gaW5uZXJUZXh0IHVzYWdlIHJlbW92ZWQgZm9yIGNvbnNpc3RlbmN5IG9mIG5ldyBsaW5lcyAoc2VlICMxMTE1MylcbiAgICBpZiAoIHR5cGVvZiBlbGVtLnRleHRDb250ZW50ID09PSBcInN0cmluZ1wiICkge1xuICAgICAgcmV0dXJuIGVsZW0udGV4dENvbnRlbnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRyYXZlcnNlIGl0cyBjaGlsZHJlblxuICAgICAgZm9yICggZWxlbSA9IGVsZW0uZmlyc3RDaGlsZDsgZWxlbTsgZWxlbSA9IGVsZW0ubmV4dFNpYmxpbmcgKSB7XG4gICAgICAgIHJldCArPSBnZXRUZXh0KCBlbGVtICk7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2UgaWYgKCBub2RlVHlwZSA9PT0gMyB8fCBub2RlVHlwZSA9PT0gNCApIHtcbiAgICByZXR1cm4gZWxlbS5ub2RlVmFsdWU7XG4gIH1cbiAgLy8gRG8gbm90IGluY2x1ZGUgY29tbWVudCBvciBwcm9jZXNzaW5nIGluc3RydWN0aW9uIG5vZGVzXG5cbiAgcmV0dXJuIHJldDtcbn07XG5cbkV4cHIgPSBTaXp6bGUuc2VsZWN0b3JzID0ge1xuXG4gIC8vIENhbiBiZSBhZGp1c3RlZCBieSB0aGUgdXNlclxuICBjYWNoZUxlbmd0aDogNTAsXG5cbiAgY3JlYXRlUHNldWRvOiBtYXJrRnVuY3Rpb24sXG5cbiAgbWF0Y2g6IG1hdGNoRXhwcixcblxuICBhdHRySGFuZGxlOiB7fSxcblxuICBmaW5kOiB7fSxcblxuICByZWxhdGl2ZToge1xuICAgIFwiPlwiOiB7IGRpcjogXCJwYXJlbnROb2RlXCIsIGZpcnN0OiB0cnVlIH0sXG4gICAgXCIgXCI6IHsgZGlyOiBcInBhcmVudE5vZGVcIiB9LFxuICAgIFwiK1wiOiB7IGRpcjogXCJwcmV2aW91c1NpYmxpbmdcIiwgZmlyc3Q6IHRydWUgfSxcbiAgICBcIn5cIjogeyBkaXI6IFwicHJldmlvdXNTaWJsaW5nXCIgfVxuICB9LFxuXG4gIHByZUZpbHRlcjoge1xuICAgIFwiQVRUUlwiOiBmdW5jdGlvbiggbWF0Y2ggKSB7XG4gICAgICBtYXRjaFsxXSA9IG1hdGNoWzFdLnJlcGxhY2UoIHJ1bmVzY2FwZSwgZnVuZXNjYXBlICk7XG5cbiAgICAgIC8vIE1vdmUgdGhlIGdpdmVuIHZhbHVlIHRvIG1hdGNoWzNdIHdoZXRoZXIgcXVvdGVkIG9yIHVucXVvdGVkXG4gICAgICBtYXRjaFszXSA9ICggbWF0Y2hbNF0gfHwgbWF0Y2hbNV0gfHwgXCJcIiApLnJlcGxhY2UoIHJ1bmVzY2FwZSwgZnVuZXNjYXBlICk7XG5cbiAgICAgIGlmICggbWF0Y2hbMl0gPT09IFwifj1cIiApIHtcbiAgICAgICAgbWF0Y2hbM10gPSBcIiBcIiArIG1hdGNoWzNdICsgXCIgXCI7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBtYXRjaC5zbGljZSggMCwgNCApO1xuICAgIH0sXG5cbiAgICBcIkNISUxEXCI6IGZ1bmN0aW9uKCBtYXRjaCApIHtcbiAgICAgIC8qIG1hdGNoZXMgZnJvbSBtYXRjaEV4cHJbXCJDSElMRFwiXVxuICAgICAgICAxIHR5cGUgKG9ubHl8bnRofC4uLilcbiAgICAgICAgMiB3aGF0IChjaGlsZHxvZi10eXBlKVxuICAgICAgICAzIGFyZ3VtZW50IChldmVufG9kZHxcXGQqfFxcZCpuKFsrLV1cXGQrKT98Li4uKVxuICAgICAgICA0IHhuLWNvbXBvbmVudCBvZiB4bit5IGFyZ3VtZW50IChbKy1dP1xcZCpufClcbiAgICAgICAgNSBzaWduIG9mIHhuLWNvbXBvbmVudFxuICAgICAgICA2IHggb2YgeG4tY29tcG9uZW50XG4gICAgICAgIDcgc2lnbiBvZiB5LWNvbXBvbmVudFxuICAgICAgICA4IHkgb2YgeS1jb21wb25lbnRcbiAgICAgICovXG4gICAgICBtYXRjaFsxXSA9IG1hdGNoWzFdLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgIGlmICggbWF0Y2hbMV0uc2xpY2UoIDAsIDMgKSA9PT0gXCJudGhcIiApIHtcbiAgICAgICAgLy8gbnRoLSogcmVxdWlyZXMgYXJndW1lbnRcbiAgICAgICAgaWYgKCAhbWF0Y2hbM10gKSB7XG4gICAgICAgICAgU2l6emxlLmVycm9yKCBtYXRjaFswXSApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbnVtZXJpYyB4IGFuZCB5IHBhcmFtZXRlcnMgZm9yIEV4cHIuZmlsdGVyLkNISUxEXG4gICAgICAgIC8vIHJlbWVtYmVyIHRoYXQgZmFsc2UvdHJ1ZSBjYXN0IHJlc3BlY3RpdmVseSB0byAwLzFcbiAgICAgICAgbWF0Y2hbNF0gPSArKCBtYXRjaFs0XSA/IG1hdGNoWzVdICsgKG1hdGNoWzZdIHx8IDEpIDogMiAqICggbWF0Y2hbM10gPT09IFwiZXZlblwiIHx8IG1hdGNoWzNdID09PSBcIm9kZFwiICkgKTtcbiAgICAgICAgbWF0Y2hbNV0gPSArKCAoIG1hdGNoWzddICsgbWF0Y2hbOF0gKSB8fCBtYXRjaFszXSA9PT0gXCJvZGRcIiApO1xuXG4gICAgICAvLyBvdGhlciB0eXBlcyBwcm9oaWJpdCBhcmd1bWVudHNcbiAgICAgIH0gZWxzZSBpZiAoIG1hdGNoWzNdICkge1xuICAgICAgICBTaXp6bGUuZXJyb3IoIG1hdGNoWzBdICk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBtYXRjaDtcbiAgICB9LFxuXG4gICAgXCJQU0VVRE9cIjogZnVuY3Rpb24oIG1hdGNoICkge1xuICAgICAgdmFyIGV4Y2VzcyxcbiAgICAgICAgdW5xdW90ZWQgPSAhbWF0Y2hbNV0gJiYgbWF0Y2hbMl07XG5cbiAgICAgIGlmICggbWF0Y2hFeHByW1wiQ0hJTERcIl0udGVzdCggbWF0Y2hbMF0gKSApIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIC8vIEFjY2VwdCBxdW90ZWQgYXJndW1lbnRzIGFzLWlzXG4gICAgICBpZiAoIG1hdGNoWzNdICYmIG1hdGNoWzRdICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgIG1hdGNoWzJdID0gbWF0Y2hbNF07XG5cbiAgICAgIC8vIFN0cmlwIGV4Y2VzcyBjaGFyYWN0ZXJzIGZyb20gdW5xdW90ZWQgYXJndW1lbnRzXG4gICAgICB9IGVsc2UgaWYgKCB1bnF1b3RlZCAmJiBycHNldWRvLnRlc3QoIHVucXVvdGVkICkgJiZcbiAgICAgICAgLy8gR2V0IGV4Y2VzcyBmcm9tIHRva2VuaXplIChyZWN1cnNpdmVseSlcbiAgICAgICAgKGV4Y2VzcyA9IHRva2VuaXplKCB1bnF1b3RlZCwgdHJ1ZSApKSAmJlxuICAgICAgICAvLyBhZHZhbmNlIHRvIHRoZSBuZXh0IGNsb3NpbmcgcGFyZW50aGVzaXNcbiAgICAgICAgKGV4Y2VzcyA9IHVucXVvdGVkLmluZGV4T2YoIFwiKVwiLCB1bnF1b3RlZC5sZW5ndGggLSBleGNlc3MgKSAtIHVucXVvdGVkLmxlbmd0aCkgKSB7XG5cbiAgICAgICAgLy8gZXhjZXNzIGlzIGEgbmVnYXRpdmUgaW5kZXhcbiAgICAgICAgbWF0Y2hbMF0gPSBtYXRjaFswXS5zbGljZSggMCwgZXhjZXNzICk7XG4gICAgICAgIG1hdGNoWzJdID0gdW5xdW90ZWQuc2xpY2UoIDAsIGV4Y2VzcyApO1xuICAgICAgfVxuXG4gICAgICAvLyBSZXR1cm4gb25seSBjYXB0dXJlcyBuZWVkZWQgYnkgdGhlIHBzZXVkbyBmaWx0ZXIgbWV0aG9kICh0eXBlIGFuZCBhcmd1bWVudClcbiAgICAgIHJldHVybiBtYXRjaC5zbGljZSggMCwgMyApO1xuICAgIH1cbiAgfSxcblxuICBmaWx0ZXI6IHtcblxuICAgIFwiVEFHXCI6IGZ1bmN0aW9uKCBub2RlTmFtZVNlbGVjdG9yICkge1xuICAgICAgdmFyIG5vZGVOYW1lID0gbm9kZU5hbWVTZWxlY3Rvci5yZXBsYWNlKCBydW5lc2NhcGUsIGZ1bmVzY2FwZSApLnRvTG93ZXJDYXNlKCk7XG4gICAgICByZXR1cm4gbm9kZU5hbWVTZWxlY3RvciA9PT0gXCIqXCIgP1xuICAgICAgICBmdW5jdGlvbigpIHsgcmV0dXJuIHRydWU7IH0gOlxuICAgICAgICBmdW5jdGlvbiggZWxlbSApIHtcbiAgICAgICAgICByZXR1cm4gZWxlbS5ub2RlTmFtZSAmJiBlbGVtLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgPT09IG5vZGVOYW1lO1xuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBcIkNMQVNTXCI6IGZ1bmN0aW9uKCBjbGFzc05hbWUgKSB7XG4gICAgICB2YXIgcGF0dGVybiA9IGNsYXNzQ2FjaGVbIGNsYXNzTmFtZSArIFwiIFwiIF07XG5cbiAgICAgIHJldHVybiBwYXR0ZXJuIHx8XG4gICAgICAgIChwYXR0ZXJuID0gbmV3IFJlZ0V4cCggXCIoXnxcIiArIHdoaXRlc3BhY2UgKyBcIilcIiArIGNsYXNzTmFtZSArIFwiKFwiICsgd2hpdGVzcGFjZSArIFwifCQpXCIgKSkgJiZcbiAgICAgICAgY2xhc3NDYWNoZSggY2xhc3NOYW1lLCBmdW5jdGlvbiggZWxlbSApIHtcbiAgICAgICAgICByZXR1cm4gcGF0dGVybi50ZXN0KCB0eXBlb2YgZWxlbS5jbGFzc05hbWUgPT09IFwic3RyaW5nXCIgJiYgZWxlbS5jbGFzc05hbWUgfHwgdHlwZW9mIGVsZW0uZ2V0QXR0cmlidXRlICE9PSBzdHJ1bmRlZmluZWQgJiYgZWxlbS5nZXRBdHRyaWJ1dGUoXCJjbGFzc1wiKSB8fCBcIlwiICk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBcIkFUVFJcIjogZnVuY3Rpb24oIG5hbWUsIG9wZXJhdG9yLCBjaGVjayApIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiggZWxlbSApIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IFNpenpsZS5hdHRyKCBlbGVtLCBuYW1lICk7XG5cbiAgICAgICAgaWYgKCByZXN1bHQgPT0gbnVsbCApIHtcbiAgICAgICAgICByZXR1cm4gb3BlcmF0b3IgPT09IFwiIT1cIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoICFvcGVyYXRvciApIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlc3VsdCArPSBcIlwiO1xuXG4gICAgICAgIHJldHVybiBvcGVyYXRvciA9PT0gXCI9XCIgPyByZXN1bHQgPT09IGNoZWNrIDpcbiAgICAgICAgICBvcGVyYXRvciA9PT0gXCIhPVwiID8gcmVzdWx0ICE9PSBjaGVjayA6XG4gICAgICAgICAgb3BlcmF0b3IgPT09IFwiXj1cIiA/IGNoZWNrICYmIHJlc3VsdC5pbmRleE9mKCBjaGVjayApID09PSAwIDpcbiAgICAgICAgICBvcGVyYXRvciA9PT0gXCIqPVwiID8gY2hlY2sgJiYgcmVzdWx0LmluZGV4T2YoIGNoZWNrICkgPiAtMSA6XG4gICAgICAgICAgb3BlcmF0b3IgPT09IFwiJD1cIiA/IGNoZWNrICYmIHJlc3VsdC5zbGljZSggLWNoZWNrLmxlbmd0aCApID09PSBjaGVjayA6XG4gICAgICAgICAgb3BlcmF0b3IgPT09IFwifj1cIiA/ICggXCIgXCIgKyByZXN1bHQgKyBcIiBcIiApLmluZGV4T2YoIGNoZWNrICkgPiAtMSA6XG4gICAgICAgICAgb3BlcmF0b3IgPT09IFwifD1cIiA/IHJlc3VsdCA9PT0gY2hlY2sgfHwgcmVzdWx0LnNsaWNlKCAwLCBjaGVjay5sZW5ndGggKyAxICkgPT09IGNoZWNrICsgXCItXCIgOlxuICAgICAgICAgIGZhbHNlO1xuICAgICAgfTtcbiAgICB9LFxuXG4gICAgXCJDSElMRFwiOiBmdW5jdGlvbiggdHlwZSwgd2hhdCwgYXJndW1lbnQsIGZpcnN0LCBsYXN0ICkge1xuICAgICAgdmFyIHNpbXBsZSA9IHR5cGUuc2xpY2UoIDAsIDMgKSAhPT0gXCJudGhcIixcbiAgICAgICAgZm9yd2FyZCA9IHR5cGUuc2xpY2UoIC00ICkgIT09IFwibGFzdFwiLFxuICAgICAgICBvZlR5cGUgPSB3aGF0ID09PSBcIm9mLXR5cGVcIjtcblxuICAgICAgcmV0dXJuIGZpcnN0ID09PSAxICYmIGxhc3QgPT09IDAgP1xuXG4gICAgICAgIC8vIFNob3J0Y3V0IGZvciA6bnRoLSoobilcbiAgICAgICAgZnVuY3Rpb24oIGVsZW0gKSB7XG4gICAgICAgICAgcmV0dXJuICEhZWxlbS5wYXJlbnROb2RlO1xuICAgICAgICB9IDpcblxuICAgICAgICBmdW5jdGlvbiggZWxlbSwgY29udGV4dCwgeG1sICkge1xuICAgICAgICAgIHZhciBjYWNoZSwgb3V0ZXJDYWNoZSwgbm9kZSwgZGlmZiwgbm9kZUluZGV4LCBzdGFydCxcbiAgICAgICAgICAgIGRpciA9IHNpbXBsZSAhPT0gZm9yd2FyZCA/IFwibmV4dFNpYmxpbmdcIiA6IFwicHJldmlvdXNTaWJsaW5nXCIsXG4gICAgICAgICAgICBwYXJlbnQgPSBlbGVtLnBhcmVudE5vZGUsXG4gICAgICAgICAgICBuYW1lID0gb2ZUeXBlICYmIGVsZW0ubm9kZU5hbWUudG9Mb3dlckNhc2UoKSxcbiAgICAgICAgICAgIHVzZUNhY2hlID0gIXhtbCAmJiAhb2ZUeXBlO1xuXG4gICAgICAgICAgaWYgKCBwYXJlbnQgKSB7XG5cbiAgICAgICAgICAgIC8vIDooZmlyc3R8bGFzdHxvbmx5KS0oY2hpbGR8b2YtdHlwZSlcbiAgICAgICAgICAgIGlmICggc2ltcGxlICkge1xuICAgICAgICAgICAgICB3aGlsZSAoIGRpciApIHtcbiAgICAgICAgICAgICAgICBub2RlID0gZWxlbTtcbiAgICAgICAgICAgICAgICB3aGlsZSAoIChub2RlID0gbm9kZVsgZGlyIF0pICkge1xuICAgICAgICAgICAgICAgICAgaWYgKCBvZlR5cGUgPyBub2RlLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgPT09IG5hbWUgOiBub2RlLm5vZGVUeXBlID09PSAxICkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIFJldmVyc2UgZGlyZWN0aW9uIGZvciA6b25seS0qIChpZiB3ZSBoYXZlbid0IHlldCBkb25lIHNvKVxuICAgICAgICAgICAgICAgIHN0YXJ0ID0gZGlyID0gdHlwZSA9PT0gXCJvbmx5XCIgJiYgIXN0YXJ0ICYmIFwibmV4dFNpYmxpbmdcIjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3RhcnQgPSBbIGZvcndhcmQgPyBwYXJlbnQuZmlyc3RDaGlsZCA6IHBhcmVudC5sYXN0Q2hpbGQgXTtcblxuICAgICAgICAgICAgLy8gbm9uLXhtbCA6bnRoLWNoaWxkKC4uLikgc3RvcmVzIGNhY2hlIGRhdGEgb24gYHBhcmVudGBcbiAgICAgICAgICAgIGlmICggZm9yd2FyZCAmJiB1c2VDYWNoZSApIHtcbiAgICAgICAgICAgICAgLy8gU2VlayBgZWxlbWAgZnJvbSBhIHByZXZpb3VzbHktY2FjaGVkIGluZGV4XG4gICAgICAgICAgICAgIG91dGVyQ2FjaGUgPSBwYXJlbnRbIGV4cGFuZG8gXSB8fCAocGFyZW50WyBleHBhbmRvIF0gPSB7fSk7XG4gICAgICAgICAgICAgIGNhY2hlID0gb3V0ZXJDYWNoZVsgdHlwZSBdIHx8IFtdO1xuICAgICAgICAgICAgICBub2RlSW5kZXggPSBjYWNoZVswXSA9PT0gZGlycnVucyAmJiBjYWNoZVsxXTtcbiAgICAgICAgICAgICAgZGlmZiA9IGNhY2hlWzBdID09PSBkaXJydW5zICYmIGNhY2hlWzJdO1xuICAgICAgICAgICAgICBub2RlID0gbm9kZUluZGV4ICYmIHBhcmVudC5jaGlsZE5vZGVzWyBub2RlSW5kZXggXTtcblxuICAgICAgICAgICAgICB3aGlsZSAoIChub2RlID0gKytub2RlSW5kZXggJiYgbm9kZSAmJiBub2RlWyBkaXIgXSB8fFxuXG4gICAgICAgICAgICAgICAgLy8gRmFsbGJhY2sgdG8gc2Vla2luZyBgZWxlbWAgZnJvbSB0aGUgc3RhcnRcbiAgICAgICAgICAgICAgICAoZGlmZiA9IG5vZGVJbmRleCA9IDApIHx8IHN0YXJ0LnBvcCgpKSApIHtcblxuICAgICAgICAgICAgICAgIC8vIFdoZW4gZm91bmQsIGNhY2hlIGluZGV4ZXMgb24gYHBhcmVudGAgYW5kIGJyZWFrXG4gICAgICAgICAgICAgICAgaWYgKCBub2RlLm5vZGVUeXBlID09PSAxICYmICsrZGlmZiAmJiBub2RlID09PSBlbGVtICkge1xuICAgICAgICAgICAgICAgICAgb3V0ZXJDYWNoZVsgdHlwZSBdID0gWyBkaXJydW5zLCBub2RlSW5kZXgsIGRpZmYgXTtcbiAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBVc2UgcHJldmlvdXNseS1jYWNoZWQgZWxlbWVudCBpbmRleCBpZiBhdmFpbGFibGVcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIHVzZUNhY2hlICYmIChjYWNoZSA9IChlbGVtWyBleHBhbmRvIF0gfHwgKGVsZW1bIGV4cGFuZG8gXSA9IHt9KSlbIHR5cGUgXSkgJiYgY2FjaGVbMF0gPT09IGRpcnJ1bnMgKSB7XG4gICAgICAgICAgICAgIGRpZmYgPSBjYWNoZVsxXTtcblxuICAgICAgICAgICAgLy8geG1sIDpudGgtY2hpbGQoLi4uKSBvciA6bnRoLWxhc3QtY2hpbGQoLi4uKSBvciA6bnRoKC1sYXN0KT8tb2YtdHlwZSguLi4pXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBVc2UgdGhlIHNhbWUgbG9vcCBhcyBhYm92ZSB0byBzZWVrIGBlbGVtYCBmcm9tIHRoZSBzdGFydFxuICAgICAgICAgICAgICB3aGlsZSAoIChub2RlID0gKytub2RlSW5kZXggJiYgbm9kZSAmJiBub2RlWyBkaXIgXSB8fFxuICAgICAgICAgICAgICAgIChkaWZmID0gbm9kZUluZGV4ID0gMCkgfHwgc3RhcnQucG9wKCkpICkge1xuXG4gICAgICAgICAgICAgICAgaWYgKCAoIG9mVHlwZSA/IG5vZGUubm9kZU5hbWUudG9Mb3dlckNhc2UoKSA9PT0gbmFtZSA6IG5vZGUubm9kZVR5cGUgPT09IDEgKSAmJiArK2RpZmYgKSB7XG4gICAgICAgICAgICAgICAgICAvLyBDYWNoZSB0aGUgaW5kZXggb2YgZWFjaCBlbmNvdW50ZXJlZCBlbGVtZW50XG4gICAgICAgICAgICAgICAgICBpZiAoIHVzZUNhY2hlICkge1xuICAgICAgICAgICAgICAgICAgICAobm9kZVsgZXhwYW5kbyBdIHx8IChub2RlWyBleHBhbmRvIF0gPSB7fSkpWyB0eXBlIF0gPSBbIGRpcnJ1bnMsIGRpZmYgXTtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgaWYgKCBub2RlID09PSBlbGVtICkge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSW5jb3Jwb3JhdGUgdGhlIG9mZnNldCwgdGhlbiBjaGVjayBhZ2FpbnN0IGN5Y2xlIHNpemVcbiAgICAgICAgICAgIGRpZmYgLT0gbGFzdDtcbiAgICAgICAgICAgIHJldHVybiBkaWZmID09PSBmaXJzdCB8fCAoIGRpZmYgJSBmaXJzdCA9PT0gMCAmJiBkaWZmIC8gZmlyc3QgPj0gMCApO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgXCJQU0VVRE9cIjogZnVuY3Rpb24oIHBzZXVkbywgYXJndW1lbnQgKSB7XG4gICAgICAvLyBwc2V1ZG8tY2xhc3MgbmFtZXMgYXJlIGNhc2UtaW5zZW5zaXRpdmVcbiAgICAgIC8vIGh0dHA6Ly93d3cudzMub3JnL1RSL3NlbGVjdG9ycy8jcHNldWRvLWNsYXNzZXNcbiAgICAgIC8vIFByaW9yaXRpemUgYnkgY2FzZSBzZW5zaXRpdml0eSBpbiBjYXNlIGN1c3RvbSBwc2V1ZG9zIGFyZSBhZGRlZCB3aXRoIHVwcGVyY2FzZSBsZXR0ZXJzXG4gICAgICAvLyBSZW1lbWJlciB0aGF0IHNldEZpbHRlcnMgaW5oZXJpdHMgZnJvbSBwc2V1ZG9zXG4gICAgICB2YXIgYXJncyxcbiAgICAgICAgZm4gPSBFeHByLnBzZXVkb3NbIHBzZXVkbyBdIHx8IEV4cHIuc2V0RmlsdGVyc1sgcHNldWRvLnRvTG93ZXJDYXNlKCkgXSB8fFxuICAgICAgICAgIFNpenpsZS5lcnJvciggXCJ1bnN1cHBvcnRlZCBwc2V1ZG86IFwiICsgcHNldWRvICk7XG5cbiAgICAgIC8vIFRoZSB1c2VyIG1heSB1c2UgY3JlYXRlUHNldWRvIHRvIGluZGljYXRlIHRoYXRcbiAgICAgIC8vIGFyZ3VtZW50cyBhcmUgbmVlZGVkIHRvIGNyZWF0ZSB0aGUgZmlsdGVyIGZ1bmN0aW9uXG4gICAgICAvLyBqdXN0IGFzIFNpenpsZSBkb2VzXG4gICAgICBpZiAoIGZuWyBleHBhbmRvIF0gKSB7XG4gICAgICAgIHJldHVybiBmbiggYXJndW1lbnQgKTtcbiAgICAgIH1cblxuICAgICAgLy8gQnV0IG1haW50YWluIHN1cHBvcnQgZm9yIG9sZCBzaWduYXR1cmVzXG4gICAgICBpZiAoIGZuLmxlbmd0aCA+IDEgKSB7XG4gICAgICAgIGFyZ3MgPSBbIHBzZXVkbywgcHNldWRvLCBcIlwiLCBhcmd1bWVudCBdO1xuICAgICAgICByZXR1cm4gRXhwci5zZXRGaWx0ZXJzLmhhc093blByb3BlcnR5KCBwc2V1ZG8udG9Mb3dlckNhc2UoKSApID9cbiAgICAgICAgICBtYXJrRnVuY3Rpb24oZnVuY3Rpb24oIHNlZWQsIG1hdGNoZXMgKSB7XG4gICAgICAgICAgICB2YXIgaWR4LFxuICAgICAgICAgICAgICBtYXRjaGVkID0gZm4oIHNlZWQsIGFyZ3VtZW50ICksXG4gICAgICAgICAgICAgIGkgPSBtYXRjaGVkLmxlbmd0aDtcbiAgICAgICAgICAgIHdoaWxlICggaS0tICkge1xuICAgICAgICAgICAgICBpZHggPSBpbmRleE9mLmNhbGwoIHNlZWQsIG1hdGNoZWRbaV0gKTtcbiAgICAgICAgICAgICAgc2VlZFsgaWR4IF0gPSAhKCBtYXRjaGVzWyBpZHggXSA9IG1hdGNoZWRbaV0gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KSA6XG4gICAgICAgICAgZnVuY3Rpb24oIGVsZW0gKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4oIGVsZW0sIDAsIGFyZ3MgKTtcbiAgICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZm47XG4gICAgfVxuICB9LFxuXG4gIHBzZXVkb3M6IHtcbiAgICAvLyBQb3RlbnRpYWxseSBjb21wbGV4IHBzZXVkb3NcbiAgICBcIm5vdFwiOiBtYXJrRnVuY3Rpb24oZnVuY3Rpb24oIHNlbGVjdG9yICkge1xuICAgICAgLy8gVHJpbSB0aGUgc2VsZWN0b3IgcGFzc2VkIHRvIGNvbXBpbGVcbiAgICAgIC8vIHRvIGF2b2lkIHRyZWF0aW5nIGxlYWRpbmcgYW5kIHRyYWlsaW5nXG4gICAgICAvLyBzcGFjZXMgYXMgY29tYmluYXRvcnNcbiAgICAgIHZhciBpbnB1dCA9IFtdLFxuICAgICAgICByZXN1bHRzID0gW10sXG4gICAgICAgIG1hdGNoZXIgPSBjb21waWxlKCBzZWxlY3Rvci5yZXBsYWNlKCBydHJpbSwgXCIkMVwiICkgKTtcblxuICAgICAgcmV0dXJuIG1hdGNoZXJbIGV4cGFuZG8gXSA/XG4gICAgICAgIG1hcmtGdW5jdGlvbihmdW5jdGlvbiggc2VlZCwgbWF0Y2hlcywgY29udGV4dCwgeG1sICkge1xuICAgICAgICAgIHZhciBlbGVtLFxuICAgICAgICAgICAgdW5tYXRjaGVkID0gbWF0Y2hlciggc2VlZCwgbnVsbCwgeG1sLCBbXSApLFxuICAgICAgICAgICAgaSA9IHNlZWQubGVuZ3RoO1xuXG4gICAgICAgICAgLy8gTWF0Y2ggZWxlbWVudHMgdW5tYXRjaGVkIGJ5IGBtYXRjaGVyYFxuICAgICAgICAgIHdoaWxlICggaS0tICkge1xuICAgICAgICAgICAgaWYgKCAoZWxlbSA9IHVubWF0Y2hlZFtpXSkgKSB7XG4gICAgICAgICAgICAgIHNlZWRbaV0gPSAhKG1hdGNoZXNbaV0gPSBlbGVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pIDpcbiAgICAgICAgZnVuY3Rpb24oIGVsZW0sIGNvbnRleHQsIHhtbCApIHtcbiAgICAgICAgICBpbnB1dFswXSA9IGVsZW07XG4gICAgICAgICAgbWF0Y2hlciggaW5wdXQsIG51bGwsIHhtbCwgcmVzdWx0cyApO1xuICAgICAgICAgIHJldHVybiAhcmVzdWx0cy5wb3AoKTtcbiAgICAgICAgfTtcbiAgICB9KSxcblxuICAgIFwiaGFzXCI6IG1hcmtGdW5jdGlvbihmdW5jdGlvbiggc2VsZWN0b3IgKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oIGVsZW0gKSB7XG4gICAgICAgIHJldHVybiBTaXp6bGUoIHNlbGVjdG9yLCBlbGVtICkubGVuZ3RoID4gMDtcbiAgICAgIH07XG4gICAgfSksXG5cbiAgICBcImNvbnRhaW5zXCI6IG1hcmtGdW5jdGlvbihmdW5jdGlvbiggdGV4dCApIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiggZWxlbSApIHtcbiAgICAgICAgcmV0dXJuICggZWxlbS50ZXh0Q29udGVudCB8fCBlbGVtLmlubmVyVGV4dCB8fCBnZXRUZXh0KCBlbGVtICkgKS5pbmRleE9mKCB0ZXh0ICkgPiAtMTtcbiAgICAgIH07XG4gICAgfSksXG5cbiAgICAvLyBcIldoZXRoZXIgYW4gZWxlbWVudCBpcyByZXByZXNlbnRlZCBieSBhIDpsYW5nKCkgc2VsZWN0b3JcbiAgICAvLyBpcyBiYXNlZCBzb2xlbHkgb24gdGhlIGVsZW1lbnQncyBsYW5ndWFnZSB2YWx1ZVxuICAgIC8vIGJlaW5nIGVxdWFsIHRvIHRoZSBpZGVudGlmaWVyIEMsXG4gICAgLy8gb3IgYmVnaW5uaW5nIHdpdGggdGhlIGlkZW50aWZpZXIgQyBpbW1lZGlhdGVseSBmb2xsb3dlZCBieSBcIi1cIi5cbiAgICAvLyBUaGUgbWF0Y2hpbmcgb2YgQyBhZ2FpbnN0IHRoZSBlbGVtZW50J3MgbGFuZ3VhZ2UgdmFsdWUgaXMgcGVyZm9ybWVkIGNhc2UtaW5zZW5zaXRpdmVseS5cbiAgICAvLyBUaGUgaWRlbnRpZmllciBDIGRvZXMgbm90IGhhdmUgdG8gYmUgYSB2YWxpZCBsYW5ndWFnZSBuYW1lLlwiXG4gICAgLy8gaHR0cDovL3d3dy53My5vcmcvVFIvc2VsZWN0b3JzLyNsYW5nLXBzZXVkb1xuICAgIFwibGFuZ1wiOiBtYXJrRnVuY3Rpb24oIGZ1bmN0aW9uKCBsYW5nICkge1xuICAgICAgLy8gbGFuZyB2YWx1ZSBtdXN0IGJlIGEgdmFsaWQgaWRlbnRpZmllclxuICAgICAgaWYgKCAhcmlkZW50aWZpZXIudGVzdChsYW5nIHx8IFwiXCIpICkge1xuICAgICAgICBTaXp6bGUuZXJyb3IoIFwidW5zdXBwb3J0ZWQgbGFuZzogXCIgKyBsYW5nICk7XG4gICAgICB9XG4gICAgICBsYW5nID0gbGFuZy5yZXBsYWNlKCBydW5lc2NhcGUsIGZ1bmVzY2FwZSApLnRvTG93ZXJDYXNlKCk7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oIGVsZW0gKSB7XG4gICAgICAgIHZhciBlbGVtTGFuZztcbiAgICAgICAgZG8ge1xuICAgICAgICAgIGlmICggKGVsZW1MYW5nID0gZG9jdW1lbnRJc0hUTUwgP1xuICAgICAgICAgICAgZWxlbS5sYW5nIDpcbiAgICAgICAgICAgIGVsZW0uZ2V0QXR0cmlidXRlKFwieG1sOmxhbmdcIikgfHwgZWxlbS5nZXRBdHRyaWJ1dGUoXCJsYW5nXCIpKSApIHtcblxuICAgICAgICAgICAgZWxlbUxhbmcgPSBlbGVtTGFuZy50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1MYW5nID09PSBsYW5nIHx8IGVsZW1MYW5nLmluZGV4T2YoIGxhbmcgKyBcIi1cIiApID09PSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgfSB3aGlsZSAoIChlbGVtID0gZWxlbS5wYXJlbnROb2RlKSAmJiBlbGVtLm5vZGVUeXBlID09PSAxICk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH07XG4gICAgfSksXG5cbiAgICAvLyBNaXNjZWxsYW5lb3VzXG4gICAgXCJ0YXJnZXRcIjogZnVuY3Rpb24oIGVsZW0gKSB7XG4gICAgICB2YXIgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbiAmJiB3aW5kb3cubG9jYXRpb24uaGFzaDtcbiAgICAgIHJldHVybiBoYXNoICYmIGhhc2guc2xpY2UoIDEgKSA9PT0gZWxlbS5pZDtcbiAgICB9LFxuXG4gICAgXCJyb290XCI6IGZ1bmN0aW9uKCBlbGVtICkge1xuICAgICAgcmV0dXJuIGVsZW0gPT09IGRvY0VsZW07XG4gICAgfSxcblxuICAgIFwiZm9jdXNcIjogZnVuY3Rpb24oIGVsZW0gKSB7XG4gICAgICByZXR1cm4gZWxlbSA9PT0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAmJiAoIWRvY3VtZW50Lmhhc0ZvY3VzIHx8IGRvY3VtZW50Lmhhc0ZvY3VzKCkpICYmICEhKGVsZW0udHlwZSB8fCBlbGVtLmhyZWYgfHwgfmVsZW0udGFiSW5kZXgpO1xuICAgIH0sXG5cbiAgICAvLyBCb29sZWFuIHByb3BlcnRpZXNcbiAgICBcImVuYWJsZWRcIjogZnVuY3Rpb24oIGVsZW0gKSB7XG4gICAgICByZXR1cm4gZWxlbS5kaXNhYmxlZCA9PT0gZmFsc2U7XG4gICAgfSxcblxuICAgIFwiZGlzYWJsZWRcIjogZnVuY3Rpb24oIGVsZW0gKSB7XG4gICAgICByZXR1cm4gZWxlbS5kaXNhYmxlZCA9PT0gdHJ1ZTtcbiAgICB9LFxuXG4gICAgXCJjaGVja2VkXCI6IGZ1bmN0aW9uKCBlbGVtICkge1xuICAgICAgLy8gSW4gQ1NTMywgOmNoZWNrZWQgc2hvdWxkIHJldHVybiBib3RoIGNoZWNrZWQgYW5kIHNlbGVjdGVkIGVsZW1lbnRzXG4gICAgICAvLyBodHRwOi8vd3d3LnczLm9yZy9UUi8yMDExL1JFQy1jc3MzLXNlbGVjdG9ycy0yMDExMDkyOS8jY2hlY2tlZFxuICAgICAgdmFyIG5vZGVOYW1lID0gZWxlbS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgcmV0dXJuIChub2RlTmFtZSA9PT0gXCJpbnB1dFwiICYmICEhZWxlbS5jaGVja2VkKSB8fCAobm9kZU5hbWUgPT09IFwib3B0aW9uXCIgJiYgISFlbGVtLnNlbGVjdGVkKTtcbiAgICB9LFxuXG4gICAgXCJzZWxlY3RlZFwiOiBmdW5jdGlvbiggZWxlbSApIHtcbiAgICAgIC8vIEFjY2Vzc2luZyB0aGlzIHByb3BlcnR5IG1ha2VzIHNlbGVjdGVkLWJ5LWRlZmF1bHRcbiAgICAgIC8vIG9wdGlvbnMgaW4gU2FmYXJpIHdvcmsgcHJvcGVybHlcbiAgICAgIGlmICggZWxlbS5wYXJlbnROb2RlICkge1xuICAgICAgICBlbGVtLnBhcmVudE5vZGUuc2VsZWN0ZWRJbmRleDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGVsZW0uc2VsZWN0ZWQgPT09IHRydWU7XG4gICAgfSxcblxuICAgIC8vIENvbnRlbnRzXG4gICAgXCJlbXB0eVwiOiBmdW5jdGlvbiggZWxlbSApIHtcbiAgICAgIC8vIGh0dHA6Ly93d3cudzMub3JnL1RSL3NlbGVjdG9ycy8jZW1wdHktcHNldWRvXG4gICAgICAvLyA6ZW1wdHkgaXMgb25seSBhZmZlY3RlZCBieSBlbGVtZW50IG5vZGVzIGFuZCBjb250ZW50IG5vZGVzKGluY2x1ZGluZyB0ZXh0KDMpLCBjZGF0YSg0KSksXG4gICAgICAvLyAgIG5vdCBjb21tZW50LCBwcm9jZXNzaW5nIGluc3RydWN0aW9ucywgb3Igb3RoZXJzXG4gICAgICAvLyBUaGFua3MgdG8gRGllZ28gUGVyaW5pIGZvciB0aGUgbm9kZU5hbWUgc2hvcnRjdXRcbiAgICAgIC8vICAgR3JlYXRlciB0aGFuIFwiQFwiIG1lYW5zIGFscGhhIGNoYXJhY3RlcnMgKHNwZWNpZmljYWxseSBub3Qgc3RhcnRpbmcgd2l0aCBcIiNcIiBvciBcIj9cIilcbiAgICAgIGZvciAoIGVsZW0gPSBlbGVtLmZpcnN0Q2hpbGQ7IGVsZW07IGVsZW0gPSBlbGVtLm5leHRTaWJsaW5nICkge1xuICAgICAgICBpZiAoIGVsZW0ubm9kZU5hbWUgPiBcIkBcIiB8fCBlbGVtLm5vZGVUeXBlID09PSAzIHx8IGVsZW0ubm9kZVR5cGUgPT09IDQgKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuXG4gICAgXCJwYXJlbnRcIjogZnVuY3Rpb24oIGVsZW0gKSB7XG4gICAgICByZXR1cm4gIUV4cHIucHNldWRvc1tcImVtcHR5XCJdKCBlbGVtICk7XG4gICAgfSxcblxuICAgIC8vIEVsZW1lbnQvaW5wdXQgdHlwZXNcbiAgICBcImhlYWRlclwiOiBmdW5jdGlvbiggZWxlbSApIHtcbiAgICAgIHJldHVybiByaGVhZGVyLnRlc3QoIGVsZW0ubm9kZU5hbWUgKTtcbiAgICB9LFxuXG4gICAgXCJpbnB1dFwiOiBmdW5jdGlvbiggZWxlbSApIHtcbiAgICAgIHJldHVybiByaW5wdXRzLnRlc3QoIGVsZW0ubm9kZU5hbWUgKTtcbiAgICB9LFxuXG4gICAgXCJidXR0b25cIjogZnVuY3Rpb24oIGVsZW0gKSB7XG4gICAgICB2YXIgbmFtZSA9IGVsZW0ubm9kZU5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgIHJldHVybiBuYW1lID09PSBcImlucHV0XCIgJiYgZWxlbS50eXBlID09PSBcImJ1dHRvblwiIHx8IG5hbWUgPT09IFwiYnV0dG9uXCI7XG4gICAgfSxcblxuICAgIFwidGV4dFwiOiBmdW5jdGlvbiggZWxlbSApIHtcbiAgICAgIHZhciBhdHRyO1xuICAgICAgLy8gSUU2IGFuZCA3IHdpbGwgbWFwIGVsZW0udHlwZSB0byAndGV4dCcgZm9yIG5ldyBIVE1MNSB0eXBlcyAoc2VhcmNoLCBldGMpXG4gICAgICAvLyB1c2UgZ2V0QXR0cmlidXRlIGluc3RlYWQgdG8gdGVzdCB0aGlzIGNhc2VcbiAgICAgIHJldHVybiBlbGVtLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgPT09IFwiaW5wdXRcIiAmJlxuICAgICAgICBlbGVtLnR5cGUgPT09IFwidGV4dFwiICYmXG4gICAgICAgICggKGF0dHIgPSBlbGVtLmdldEF0dHJpYnV0ZShcInR5cGVcIikpID09IG51bGwgfHwgYXR0ci50b0xvd2VyQ2FzZSgpID09PSBlbGVtLnR5cGUgKTtcbiAgICB9LFxuXG4gICAgLy8gUG9zaXRpb24taW4tY29sbGVjdGlvblxuICAgIFwiZmlyc3RcIjogY3JlYXRlUG9zaXRpb25hbFBzZXVkbyhmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBbIDAgXTtcbiAgICB9KSxcblxuICAgIFwibGFzdFwiOiBjcmVhdGVQb3NpdGlvbmFsUHNldWRvKGZ1bmN0aW9uKCBtYXRjaEluZGV4ZXMsIGxlbmd0aCApIHtcbiAgICAgIHJldHVybiBbIGxlbmd0aCAtIDEgXTtcbiAgICB9KSxcblxuICAgIFwiZXFcIjogY3JlYXRlUG9zaXRpb25hbFBzZXVkbyhmdW5jdGlvbiggbWF0Y2hJbmRleGVzLCBsZW5ndGgsIGFyZ3VtZW50ICkge1xuICAgICAgcmV0dXJuIFsgYXJndW1lbnQgPCAwID8gYXJndW1lbnQgKyBsZW5ndGggOiBhcmd1bWVudCBdO1xuICAgIH0pLFxuXG4gICAgXCJldmVuXCI6IGNyZWF0ZVBvc2l0aW9uYWxQc2V1ZG8oZnVuY3Rpb24oIG1hdGNoSW5kZXhlcywgbGVuZ3RoICkge1xuICAgICAgdmFyIGkgPSAwO1xuICAgICAgZm9yICggOyBpIDwgbGVuZ3RoOyBpICs9IDIgKSB7XG4gICAgICAgIG1hdGNoSW5kZXhlcy5wdXNoKCBpICk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbWF0Y2hJbmRleGVzO1xuICAgIH0pLFxuXG4gICAgXCJvZGRcIjogY3JlYXRlUG9zaXRpb25hbFBzZXVkbyhmdW5jdGlvbiggbWF0Y2hJbmRleGVzLCBsZW5ndGggKSB7XG4gICAgICB2YXIgaSA9IDE7XG4gICAgICBmb3IgKCA7IGkgPCBsZW5ndGg7IGkgKz0gMiApIHtcbiAgICAgICAgbWF0Y2hJbmRleGVzLnB1c2goIGkgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBtYXRjaEluZGV4ZXM7XG4gICAgfSksXG5cbiAgICBcImx0XCI6IGNyZWF0ZVBvc2l0aW9uYWxQc2V1ZG8oZnVuY3Rpb24oIG1hdGNoSW5kZXhlcywgbGVuZ3RoLCBhcmd1bWVudCApIHtcbiAgICAgIHZhciBpID0gYXJndW1lbnQgPCAwID8gYXJndW1lbnQgKyBsZW5ndGggOiBhcmd1bWVudDtcbiAgICAgIGZvciAoIDsgLS1pID49IDA7ICkge1xuICAgICAgICBtYXRjaEluZGV4ZXMucHVzaCggaSApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1hdGNoSW5kZXhlcztcbiAgICB9KSxcblxuICAgIFwiZ3RcIjogY3JlYXRlUG9zaXRpb25hbFBzZXVkbyhmdW5jdGlvbiggbWF0Y2hJbmRleGVzLCBsZW5ndGgsIGFyZ3VtZW50ICkge1xuICAgICAgdmFyIGkgPSBhcmd1bWVudCA8IDAgPyBhcmd1bWVudCArIGxlbmd0aCA6IGFyZ3VtZW50O1xuICAgICAgZm9yICggOyArK2kgPCBsZW5ndGg7ICkge1xuICAgICAgICBtYXRjaEluZGV4ZXMucHVzaCggaSApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1hdGNoSW5kZXhlcztcbiAgICB9KVxuICB9XG59O1xuXG5FeHByLnBzZXVkb3NbXCJudGhcIl0gPSBFeHByLnBzZXVkb3NbXCJlcVwiXTtcblxuLy8gQWRkIGJ1dHRvbi9pbnB1dCB0eXBlIHBzZXVkb3NcbmZvciAoIGkgaW4geyByYWRpbzogdHJ1ZSwgY2hlY2tib3g6IHRydWUsIGZpbGU6IHRydWUsIHBhc3N3b3JkOiB0cnVlLCBpbWFnZTogdHJ1ZSB9ICkge1xuICBFeHByLnBzZXVkb3NbIGkgXSA9IGNyZWF0ZUlucHV0UHNldWRvKCBpICk7XG59XG5mb3IgKCBpIGluIHsgc3VibWl0OiB0cnVlLCByZXNldDogdHJ1ZSB9ICkge1xuICBFeHByLnBzZXVkb3NbIGkgXSA9IGNyZWF0ZUJ1dHRvblBzZXVkbyggaSApO1xufVxuXG4vLyBFYXN5IEFQSSBmb3IgY3JlYXRpbmcgbmV3IHNldEZpbHRlcnNcbmZ1bmN0aW9uIHNldEZpbHRlcnMoKSB7fVxuc2V0RmlsdGVycy5wcm90b3R5cGUgPSBFeHByLmZpbHRlcnMgPSBFeHByLnBzZXVkb3M7XG5FeHByLnNldEZpbHRlcnMgPSBuZXcgc2V0RmlsdGVycygpO1xuXG5mdW5jdGlvbiB0b2tlbml6ZSggc2VsZWN0b3IsIHBhcnNlT25seSApIHtcbiAgdmFyIG1hdGNoZWQsIG1hdGNoLCB0b2tlbnMsIHR5cGUsXG4gICAgc29GYXIsIGdyb3VwcywgcHJlRmlsdGVycyxcbiAgICBjYWNoZWQgPSB0b2tlbkNhY2hlWyBzZWxlY3RvciArIFwiIFwiIF07XG5cbiAgaWYgKCBjYWNoZWQgKSB7XG4gICAgcmV0dXJuIHBhcnNlT25seSA/IDAgOiBjYWNoZWQuc2xpY2UoIDAgKTtcbiAgfVxuXG4gIHNvRmFyID0gc2VsZWN0b3I7XG4gIGdyb3VwcyA9IFtdO1xuICBwcmVGaWx0ZXJzID0gRXhwci5wcmVGaWx0ZXI7XG5cbiAgd2hpbGUgKCBzb0ZhciApIHtcblxuICAgIC8vIENvbW1hIGFuZCBmaXJzdCBydW5cbiAgICBpZiAoICFtYXRjaGVkIHx8IChtYXRjaCA9IHJjb21tYS5leGVjKCBzb0ZhciApKSApIHtcbiAgICAgIGlmICggbWF0Y2ggKSB7XG4gICAgICAgIC8vIERvbid0IGNvbnN1bWUgdHJhaWxpbmcgY29tbWFzIGFzIHZhbGlkXG4gICAgICAgIHNvRmFyID0gc29GYXIuc2xpY2UoIG1hdGNoWzBdLmxlbmd0aCApIHx8IHNvRmFyO1xuICAgICAgfVxuICAgICAgZ3JvdXBzLnB1c2goIHRva2VucyA9IFtdICk7XG4gICAgfVxuXG4gICAgbWF0Y2hlZCA9IGZhbHNlO1xuXG4gICAgLy8gQ29tYmluYXRvcnNcbiAgICBpZiAoIChtYXRjaCA9IHJjb21iaW5hdG9ycy5leGVjKCBzb0ZhciApKSApIHtcbiAgICAgIG1hdGNoZWQgPSBtYXRjaC5zaGlmdCgpO1xuICAgICAgdG9rZW5zLnB1c2goe1xuICAgICAgICB2YWx1ZTogbWF0Y2hlZCxcbiAgICAgICAgLy8gQ2FzdCBkZXNjZW5kYW50IGNvbWJpbmF0b3JzIHRvIHNwYWNlXG4gICAgICAgIHR5cGU6IG1hdGNoWzBdLnJlcGxhY2UoIHJ0cmltLCBcIiBcIiApXG4gICAgICB9KTtcbiAgICAgIHNvRmFyID0gc29GYXIuc2xpY2UoIG1hdGNoZWQubGVuZ3RoICk7XG4gICAgfVxuXG4gICAgLy8gRmlsdGVyc1xuICAgIGZvciAoIHR5cGUgaW4gRXhwci5maWx0ZXIgKSB7XG4gICAgICBpZiAoIChtYXRjaCA9IG1hdGNoRXhwclsgdHlwZSBdLmV4ZWMoIHNvRmFyICkpICYmICghcHJlRmlsdGVyc1sgdHlwZSBdIHx8XG4gICAgICAgIChtYXRjaCA9IHByZUZpbHRlcnNbIHR5cGUgXSggbWF0Y2ggKSkpICkge1xuICAgICAgICBtYXRjaGVkID0gbWF0Y2guc2hpZnQoKTtcbiAgICAgICAgdG9rZW5zLnB1c2goe1xuICAgICAgICAgIHZhbHVlOiBtYXRjaGVkLFxuICAgICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgICAgbWF0Y2hlczogbWF0Y2hcbiAgICAgICAgfSk7XG4gICAgICAgIHNvRmFyID0gc29GYXIuc2xpY2UoIG1hdGNoZWQubGVuZ3RoICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCAhbWF0Y2hlZCApIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8vIFJldHVybiB0aGUgbGVuZ3RoIG9mIHRoZSBpbnZhbGlkIGV4Y2Vzc1xuICAvLyBpZiB3ZSdyZSBqdXN0IHBhcnNpbmdcbiAgLy8gT3RoZXJ3aXNlLCB0aHJvdyBhbiBlcnJvciBvciByZXR1cm4gdG9rZW5zXG4gIHJldHVybiBwYXJzZU9ubHkgP1xuICAgIHNvRmFyLmxlbmd0aCA6XG4gICAgc29GYXIgP1xuICAgICAgU2l6emxlLmVycm9yKCBzZWxlY3RvciApIDpcbiAgICAgIC8vIENhY2hlIHRoZSB0b2tlbnNcbiAgICAgIHRva2VuQ2FjaGUoIHNlbGVjdG9yLCBncm91cHMgKS5zbGljZSggMCApO1xufVxuXG5mdW5jdGlvbiB0b1NlbGVjdG9yKCB0b2tlbnMgKSB7XG4gIHZhciBpID0gMCxcbiAgICBsZW4gPSB0b2tlbnMubGVuZ3RoLFxuICAgIHNlbGVjdG9yID0gXCJcIjtcbiAgZm9yICggOyBpIDwgbGVuOyBpKysgKSB7XG4gICAgc2VsZWN0b3IgKz0gdG9rZW5zW2ldLnZhbHVlO1xuICB9XG4gIHJldHVybiBzZWxlY3Rvcjtcbn1cblxuZnVuY3Rpb24gYWRkQ29tYmluYXRvciggbWF0Y2hlciwgY29tYmluYXRvciwgYmFzZSApIHtcbiAgdmFyIGRpciA9IGNvbWJpbmF0b3IuZGlyLFxuICAgIGNoZWNrTm9uRWxlbWVudHMgPSBiYXNlICYmIGRpciA9PT0gXCJwYXJlbnROb2RlXCIsXG4gICAgZG9uZU5hbWUgPSBkb25lKys7XG5cbiAgcmV0dXJuIGNvbWJpbmF0b3IuZmlyc3QgP1xuICAgIC8vIENoZWNrIGFnYWluc3QgY2xvc2VzdCBhbmNlc3Rvci9wcmVjZWRpbmcgZWxlbWVudFxuICAgIGZ1bmN0aW9uKCBlbGVtLCBjb250ZXh0LCB4bWwgKSB7XG4gICAgICB3aGlsZSAoIChlbGVtID0gZWxlbVsgZGlyIF0pICkge1xuICAgICAgICBpZiAoIGVsZW0ubm9kZVR5cGUgPT09IDEgfHwgY2hlY2tOb25FbGVtZW50cyApIHtcbiAgICAgICAgICByZXR1cm4gbWF0Y2hlciggZWxlbSwgY29udGV4dCwgeG1sICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IDpcblxuICAgIC8vIENoZWNrIGFnYWluc3QgYWxsIGFuY2VzdG9yL3ByZWNlZGluZyBlbGVtZW50c1xuICAgIGZ1bmN0aW9uKCBlbGVtLCBjb250ZXh0LCB4bWwgKSB7XG4gICAgICB2YXIgZGF0YSwgY2FjaGUsIG91dGVyQ2FjaGUsXG4gICAgICAgIGRpcmtleSA9IGRpcnJ1bnMgKyBcIiBcIiArIGRvbmVOYW1lO1xuXG4gICAgICAvLyBXZSBjYW4ndCBzZXQgYXJiaXRyYXJ5IGRhdGEgb24gWE1MIG5vZGVzLCBzbyB0aGV5IGRvbid0IGJlbmVmaXQgZnJvbSBkaXIgY2FjaGluZ1xuICAgICAgaWYgKCB4bWwgKSB7XG4gICAgICAgIHdoaWxlICggKGVsZW0gPSBlbGVtWyBkaXIgXSkgKSB7XG4gICAgICAgICAgaWYgKCBlbGVtLm5vZGVUeXBlID09PSAxIHx8IGNoZWNrTm9uRWxlbWVudHMgKSB7XG4gICAgICAgICAgICBpZiAoIG1hdGNoZXIoIGVsZW0sIGNvbnRleHQsIHhtbCApICkge1xuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdoaWxlICggKGVsZW0gPSBlbGVtWyBkaXIgXSkgKSB7XG4gICAgICAgICAgaWYgKCBlbGVtLm5vZGVUeXBlID09PSAxIHx8IGNoZWNrTm9uRWxlbWVudHMgKSB7XG4gICAgICAgICAgICBvdXRlckNhY2hlID0gZWxlbVsgZXhwYW5kbyBdIHx8IChlbGVtWyBleHBhbmRvIF0gPSB7fSk7XG4gICAgICAgICAgICBpZiAoIChjYWNoZSA9IG91dGVyQ2FjaGVbIGRpciBdKSAmJiBjYWNoZVswXSA9PT0gZGlya2V5ICkge1xuICAgICAgICAgICAgICBpZiAoIChkYXRhID0gY2FjaGVbMV0pID09PSB0cnVlIHx8IGRhdGEgPT09IGNhY2hlZHJ1bnMgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGEgPT09IHRydWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNhY2hlID0gb3V0ZXJDYWNoZVsgZGlyIF0gPSBbIGRpcmtleSBdO1xuICAgICAgICAgICAgICBjYWNoZVsxXSA9IG1hdGNoZXIoIGVsZW0sIGNvbnRleHQsIHhtbCApIHx8IGNhY2hlZHJ1bnM7XG4gICAgICAgICAgICAgIGlmICggY2FjaGVbMV0gPT09IHRydWUgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xufVxuXG5mdW5jdGlvbiBlbGVtZW50TWF0Y2hlciggbWF0Y2hlcnMgKSB7XG4gIHJldHVybiBtYXRjaGVycy5sZW5ndGggPiAxID9cbiAgICBmdW5jdGlvbiggZWxlbSwgY29udGV4dCwgeG1sICkge1xuICAgICAgdmFyIGkgPSBtYXRjaGVycy5sZW5ndGg7XG4gICAgICB3aGlsZSAoIGktLSApIHtcbiAgICAgICAgaWYgKCAhbWF0Y2hlcnNbaV0oIGVsZW0sIGNvbnRleHQsIHhtbCApICkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSA6XG4gICAgbWF0Y2hlcnNbMF07XG59XG5cbmZ1bmN0aW9uIGNvbmRlbnNlKCB1bm1hdGNoZWQsIG1hcCwgZmlsdGVyLCBjb250ZXh0LCB4bWwgKSB7XG4gIHZhciBlbGVtLFxuICAgIG5ld1VubWF0Y2hlZCA9IFtdLFxuICAgIGkgPSAwLFxuICAgIGxlbiA9IHVubWF0Y2hlZC5sZW5ndGgsXG4gICAgbWFwcGVkID0gbWFwICE9IG51bGw7XG5cbiAgZm9yICggOyBpIDwgbGVuOyBpKysgKSB7XG4gICAgaWYgKCAoZWxlbSA9IHVubWF0Y2hlZFtpXSkgKSB7XG4gICAgICBpZiAoICFmaWx0ZXIgfHwgZmlsdGVyKCBlbGVtLCBjb250ZXh0LCB4bWwgKSApIHtcbiAgICAgICAgbmV3VW5tYXRjaGVkLnB1c2goIGVsZW0gKTtcbiAgICAgICAgaWYgKCBtYXBwZWQgKSB7XG4gICAgICAgICAgbWFwLnB1c2goIGkgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXdVbm1hdGNoZWQ7XG59XG5cbmZ1bmN0aW9uIHNldE1hdGNoZXIoIHByZUZpbHRlciwgc2VsZWN0b3IsIG1hdGNoZXIsIHBvc3RGaWx0ZXIsIHBvc3RGaW5kZXIsIHBvc3RTZWxlY3RvciApIHtcbiAgaWYgKCBwb3N0RmlsdGVyICYmICFwb3N0RmlsdGVyWyBleHBhbmRvIF0gKSB7XG4gICAgcG9zdEZpbHRlciA9IHNldE1hdGNoZXIoIHBvc3RGaWx0ZXIgKTtcbiAgfVxuICBpZiAoIHBvc3RGaW5kZXIgJiYgIXBvc3RGaW5kZXJbIGV4cGFuZG8gXSApIHtcbiAgICBwb3N0RmluZGVyID0gc2V0TWF0Y2hlciggcG9zdEZpbmRlciwgcG9zdFNlbGVjdG9yICk7XG4gIH1cbiAgcmV0dXJuIG1hcmtGdW5jdGlvbihmdW5jdGlvbiggc2VlZCwgcmVzdWx0cywgY29udGV4dCwgeG1sICkge1xuICAgIHZhciB0ZW1wLCBpLCBlbGVtLFxuICAgICAgcHJlTWFwID0gW10sXG4gICAgICBwb3N0TWFwID0gW10sXG4gICAgICBwcmVleGlzdGluZyA9IHJlc3VsdHMubGVuZ3RoLFxuXG4gICAgICAvLyBHZXQgaW5pdGlhbCBlbGVtZW50cyBmcm9tIHNlZWQgb3IgY29udGV4dFxuICAgICAgZWxlbXMgPSBzZWVkIHx8IG11bHRpcGxlQ29udGV4dHMoIHNlbGVjdG9yIHx8IFwiKlwiLCBjb250ZXh0Lm5vZGVUeXBlID8gWyBjb250ZXh0IF0gOiBjb250ZXh0LCBbXSApLFxuXG4gICAgICAvLyBQcmVmaWx0ZXIgdG8gZ2V0IG1hdGNoZXIgaW5wdXQsIHByZXNlcnZpbmcgYSBtYXAgZm9yIHNlZWQtcmVzdWx0cyBzeW5jaHJvbml6YXRpb25cbiAgICAgIG1hdGNoZXJJbiA9IHByZUZpbHRlciAmJiAoIHNlZWQgfHwgIXNlbGVjdG9yICkgP1xuICAgICAgICBjb25kZW5zZSggZWxlbXMsIHByZU1hcCwgcHJlRmlsdGVyLCBjb250ZXh0LCB4bWwgKSA6XG4gICAgICAgIGVsZW1zLFxuXG4gICAgICBtYXRjaGVyT3V0ID0gbWF0Y2hlciA/XG4gICAgICAgIC8vIElmIHdlIGhhdmUgYSBwb3N0RmluZGVyLCBvciBmaWx0ZXJlZCBzZWVkLCBvciBub24tc2VlZCBwb3N0RmlsdGVyIG9yIHByZWV4aXN0aW5nIHJlc3VsdHMsXG4gICAgICAgIHBvc3RGaW5kZXIgfHwgKCBzZWVkID8gcHJlRmlsdGVyIDogcHJlZXhpc3RpbmcgfHwgcG9zdEZpbHRlciApID9cblxuICAgICAgICAgIC8vIC4uLmludGVybWVkaWF0ZSBwcm9jZXNzaW5nIGlzIG5lY2Vzc2FyeVxuICAgICAgICAgIFtdIDpcblxuICAgICAgICAgIC8vIC4uLm90aGVyd2lzZSB1c2UgcmVzdWx0cyBkaXJlY3RseVxuICAgICAgICAgIHJlc3VsdHMgOlxuICAgICAgICBtYXRjaGVySW47XG5cbiAgICAvLyBGaW5kIHByaW1hcnkgbWF0Y2hlc1xuICAgIGlmICggbWF0Y2hlciApIHtcbiAgICAgIG1hdGNoZXIoIG1hdGNoZXJJbiwgbWF0Y2hlck91dCwgY29udGV4dCwgeG1sICk7XG4gICAgfVxuXG4gICAgLy8gQXBwbHkgcG9zdEZpbHRlclxuICAgIGlmICggcG9zdEZpbHRlciApIHtcbiAgICAgIHRlbXAgPSBjb25kZW5zZSggbWF0Y2hlck91dCwgcG9zdE1hcCApO1xuICAgICAgcG9zdEZpbHRlciggdGVtcCwgW10sIGNvbnRleHQsIHhtbCApO1xuXG4gICAgICAvLyBVbi1tYXRjaCBmYWlsaW5nIGVsZW1lbnRzIGJ5IG1vdmluZyB0aGVtIGJhY2sgdG8gbWF0Y2hlckluXG4gICAgICBpID0gdGVtcC5sZW5ndGg7XG4gICAgICB3aGlsZSAoIGktLSApIHtcbiAgICAgICAgaWYgKCAoZWxlbSA9IHRlbXBbaV0pICkge1xuICAgICAgICAgIG1hdGNoZXJPdXRbIHBvc3RNYXBbaV0gXSA9ICEobWF0Y2hlckluWyBwb3N0TWFwW2ldIF0gPSBlbGVtKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICggc2VlZCApIHtcbiAgICAgIGlmICggcG9zdEZpbmRlciB8fCBwcmVGaWx0ZXIgKSB7XG4gICAgICAgIGlmICggcG9zdEZpbmRlciApIHtcbiAgICAgICAgICAvLyBHZXQgdGhlIGZpbmFsIG1hdGNoZXJPdXQgYnkgY29uZGVuc2luZyB0aGlzIGludGVybWVkaWF0ZSBpbnRvIHBvc3RGaW5kZXIgY29udGV4dHNcbiAgICAgICAgICB0ZW1wID0gW107XG4gICAgICAgICAgaSA9IG1hdGNoZXJPdXQubGVuZ3RoO1xuICAgICAgICAgIHdoaWxlICggaS0tICkge1xuICAgICAgICAgICAgaWYgKCAoZWxlbSA9IG1hdGNoZXJPdXRbaV0pICkge1xuICAgICAgICAgICAgICAvLyBSZXN0b3JlIG1hdGNoZXJJbiBzaW5jZSBlbGVtIGlzIG5vdCB5ZXQgYSBmaW5hbCBtYXRjaFxuICAgICAgICAgICAgICB0ZW1wLnB1c2goIChtYXRjaGVySW5baV0gPSBlbGVtKSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBwb3N0RmluZGVyKCBudWxsLCAobWF0Y2hlck91dCA9IFtdKSwgdGVtcCwgeG1sICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBNb3ZlIG1hdGNoZWQgZWxlbWVudHMgZnJvbSBzZWVkIHRvIHJlc3VsdHMgdG8ga2VlcCB0aGVtIHN5bmNocm9uaXplZFxuICAgICAgICBpID0gbWF0Y2hlck91dC5sZW5ndGg7XG4gICAgICAgIHdoaWxlICggaS0tICkge1xuICAgICAgICAgIGlmICggKGVsZW0gPSBtYXRjaGVyT3V0W2ldKSAmJlxuICAgICAgICAgICAgKHRlbXAgPSBwb3N0RmluZGVyID8gaW5kZXhPZi5jYWxsKCBzZWVkLCBlbGVtICkgOiBwcmVNYXBbaV0pID4gLTEgKSB7XG5cbiAgICAgICAgICAgIHNlZWRbdGVtcF0gPSAhKHJlc3VsdHNbdGVtcF0gPSBlbGVtKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgIC8vIEFkZCBlbGVtZW50cyB0byByZXN1bHRzLCB0aHJvdWdoIHBvc3RGaW5kZXIgaWYgZGVmaW5lZFxuICAgIH0gZWxzZSB7XG4gICAgICBtYXRjaGVyT3V0ID0gY29uZGVuc2UoXG4gICAgICAgIG1hdGNoZXJPdXQgPT09IHJlc3VsdHMgP1xuICAgICAgICAgIG1hdGNoZXJPdXQuc3BsaWNlKCBwcmVleGlzdGluZywgbWF0Y2hlck91dC5sZW5ndGggKSA6XG4gICAgICAgICAgbWF0Y2hlck91dFxuICAgICAgKTtcbiAgICAgIGlmICggcG9zdEZpbmRlciApIHtcbiAgICAgICAgcG9zdEZpbmRlciggbnVsbCwgcmVzdWx0cywgbWF0Y2hlck91dCwgeG1sICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwdXNoLmFwcGx5KCByZXN1bHRzLCBtYXRjaGVyT3V0ICk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gbWF0Y2hlckZyb21Ub2tlbnMoIHRva2VucyApIHtcbiAgdmFyIGNoZWNrQ29udGV4dCwgbWF0Y2hlciwgaixcbiAgICBsZW4gPSB0b2tlbnMubGVuZ3RoLFxuICAgIGxlYWRpbmdSZWxhdGl2ZSA9IEV4cHIucmVsYXRpdmVbIHRva2Vuc1swXS50eXBlIF0sXG4gICAgaW1wbGljaXRSZWxhdGl2ZSA9IGxlYWRpbmdSZWxhdGl2ZSB8fCBFeHByLnJlbGF0aXZlW1wiIFwiXSxcbiAgICBpID0gbGVhZGluZ1JlbGF0aXZlID8gMSA6IDAsXG5cbiAgICAvLyBUaGUgZm91bmRhdGlvbmFsIG1hdGNoZXIgZW5zdXJlcyB0aGF0IGVsZW1lbnRzIGFyZSByZWFjaGFibGUgZnJvbSB0b3AtbGV2ZWwgY29udGV4dChzKVxuICAgIG1hdGNoQ29udGV4dCA9IGFkZENvbWJpbmF0b3IoIGZ1bmN0aW9uKCBlbGVtICkge1xuICAgICAgcmV0dXJuIGVsZW0gPT09IGNoZWNrQ29udGV4dDtcbiAgICB9LCBpbXBsaWNpdFJlbGF0aXZlLCB0cnVlICksXG4gICAgbWF0Y2hBbnlDb250ZXh0ID0gYWRkQ29tYmluYXRvciggZnVuY3Rpb24oIGVsZW0gKSB7XG4gICAgICByZXR1cm4gaW5kZXhPZi5jYWxsKCBjaGVja0NvbnRleHQsIGVsZW0gKSA+IC0xO1xuICAgIH0sIGltcGxpY2l0UmVsYXRpdmUsIHRydWUgKSxcbiAgICBtYXRjaGVycyA9IFsgZnVuY3Rpb24oIGVsZW0sIGNvbnRleHQsIHhtbCApIHtcbiAgICAgIHJldHVybiAoICFsZWFkaW5nUmVsYXRpdmUgJiYgKCB4bWwgfHwgY29udGV4dCAhPT0gb3V0ZXJtb3N0Q29udGV4dCApICkgfHwgKFxuICAgICAgICAoY2hlY2tDb250ZXh0ID0gY29udGV4dCkubm9kZVR5cGUgP1xuICAgICAgICAgIG1hdGNoQ29udGV4dCggZWxlbSwgY29udGV4dCwgeG1sICkgOlxuICAgICAgICAgIG1hdGNoQW55Q29udGV4dCggZWxlbSwgY29udGV4dCwgeG1sICkgKTtcbiAgICB9IF07XG5cbiAgZm9yICggOyBpIDwgbGVuOyBpKysgKSB7XG4gICAgaWYgKCAobWF0Y2hlciA9IEV4cHIucmVsYXRpdmVbIHRva2Vuc1tpXS50eXBlIF0pICkge1xuICAgICAgbWF0Y2hlcnMgPSBbIGFkZENvbWJpbmF0b3IoZWxlbWVudE1hdGNoZXIoIG1hdGNoZXJzICksIG1hdGNoZXIpIF07XG4gICAgfSBlbHNlIHtcbiAgICAgIG1hdGNoZXIgPSBFeHByLmZpbHRlclsgdG9rZW5zW2ldLnR5cGUgXS5hcHBseSggbnVsbCwgdG9rZW5zW2ldLm1hdGNoZXMgKTtcblxuICAgICAgLy8gUmV0dXJuIHNwZWNpYWwgdXBvbiBzZWVpbmcgYSBwb3NpdGlvbmFsIG1hdGNoZXJcbiAgICAgIGlmICggbWF0Y2hlclsgZXhwYW5kbyBdICkge1xuICAgICAgICAvLyBGaW5kIHRoZSBuZXh0IHJlbGF0aXZlIG9wZXJhdG9yIChpZiBhbnkpIGZvciBwcm9wZXIgaGFuZGxpbmdcbiAgICAgICAgaiA9ICsraTtcbiAgICAgICAgZm9yICggOyBqIDwgbGVuOyBqKysgKSB7XG4gICAgICAgICAgaWYgKCBFeHByLnJlbGF0aXZlWyB0b2tlbnNbal0udHlwZSBdICkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzZXRNYXRjaGVyKFxuICAgICAgICAgIGkgPiAxICYmIGVsZW1lbnRNYXRjaGVyKCBtYXRjaGVycyApLFxuICAgICAgICAgIGkgPiAxICYmIHRvU2VsZWN0b3IoXG4gICAgICAgICAgICAvLyBJZiB0aGUgcHJlY2VkaW5nIHRva2VuIHdhcyBhIGRlc2NlbmRhbnQgY29tYmluYXRvciwgaW5zZXJ0IGFuIGltcGxpY2l0IGFueS1lbGVtZW50IGAqYFxuICAgICAgICAgICAgdG9rZW5zLnNsaWNlKCAwLCBpIC0gMSApLmNvbmNhdCh7IHZhbHVlOiB0b2tlbnNbIGkgLSAyIF0udHlwZSA9PT0gXCIgXCIgPyBcIipcIiA6IFwiXCIgfSlcbiAgICAgICAgICApLnJlcGxhY2UoIHJ0cmltLCBcIiQxXCIgKSxcbiAgICAgICAgICBtYXRjaGVyLFxuICAgICAgICAgIGkgPCBqICYmIG1hdGNoZXJGcm9tVG9rZW5zKCB0b2tlbnMuc2xpY2UoIGksIGogKSApLFxuICAgICAgICAgIGogPCBsZW4gJiYgbWF0Y2hlckZyb21Ub2tlbnMoICh0b2tlbnMgPSB0b2tlbnMuc2xpY2UoIGogKSkgKSxcbiAgICAgICAgICBqIDwgbGVuICYmIHRvU2VsZWN0b3IoIHRva2VucyApXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBtYXRjaGVycy5wdXNoKCBtYXRjaGVyICk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGVsZW1lbnRNYXRjaGVyKCBtYXRjaGVycyApO1xufVxuXG5mdW5jdGlvbiBtYXRjaGVyRnJvbUdyb3VwTWF0Y2hlcnMoIGVsZW1lbnRNYXRjaGVycywgc2V0TWF0Y2hlcnMgKSB7XG4gIC8vIEEgY291bnRlciB0byBzcGVjaWZ5IHdoaWNoIGVsZW1lbnQgaXMgY3VycmVudGx5IGJlaW5nIG1hdGNoZWRcbiAgdmFyIG1hdGNoZXJDYWNoZWRSdW5zID0gMCxcbiAgICBieVNldCA9IHNldE1hdGNoZXJzLmxlbmd0aCA+IDAsXG4gICAgYnlFbGVtZW50ID0gZWxlbWVudE1hdGNoZXJzLmxlbmd0aCA+IDAsXG4gICAgc3VwZXJNYXRjaGVyID0gZnVuY3Rpb24oIHNlZWQsIGNvbnRleHQsIHhtbCwgcmVzdWx0cywgZXhwYW5kQ29udGV4dCApIHtcbiAgICAgIHZhciBlbGVtLCBqLCBtYXRjaGVyLFxuICAgICAgICBzZXRNYXRjaGVkID0gW10sXG4gICAgICAgIG1hdGNoZWRDb3VudCA9IDAsXG4gICAgICAgIGkgPSBcIjBcIixcbiAgICAgICAgdW5tYXRjaGVkID0gc2VlZCAmJiBbXSxcbiAgICAgICAgb3V0ZXJtb3N0ID0gZXhwYW5kQ29udGV4dCAhPSBudWxsLFxuICAgICAgICBjb250ZXh0QmFja3VwID0gb3V0ZXJtb3N0Q29udGV4dCxcbiAgICAgICAgLy8gV2UgbXVzdCBhbHdheXMgaGF2ZSBlaXRoZXIgc2VlZCBlbGVtZW50cyBvciBjb250ZXh0XG4gICAgICAgIGVsZW1zID0gc2VlZCB8fCBieUVsZW1lbnQgJiYgRXhwci5maW5kW1wiVEFHXCJdKCBcIipcIiwgZXhwYW5kQ29udGV4dCAmJiBjb250ZXh0LnBhcmVudE5vZGUgfHwgY29udGV4dCApLFxuICAgICAgICAvLyBVc2UgaW50ZWdlciBkaXJydW5zIGlmZiB0aGlzIGlzIHRoZSBvdXRlcm1vc3QgbWF0Y2hlclxuICAgICAgICBkaXJydW5zVW5pcXVlID0gKGRpcnJ1bnMgKz0gY29udGV4dEJhY2t1cCA9PSBudWxsID8gMSA6IE1hdGgucmFuZG9tKCkgfHwgMC4xKTtcblxuICAgICAgaWYgKCBvdXRlcm1vc3QgKSB7XG4gICAgICAgIG91dGVybW9zdENvbnRleHQgPSBjb250ZXh0ICE9PSBkb2N1bWVudCAmJiBjb250ZXh0O1xuICAgICAgICBjYWNoZWRydW5zID0gbWF0Y2hlckNhY2hlZFJ1bnM7XG4gICAgICB9XG5cbiAgICAgIC8vIEFkZCBlbGVtZW50cyBwYXNzaW5nIGVsZW1lbnRNYXRjaGVycyBkaXJlY3RseSB0byByZXN1bHRzXG4gICAgICAvLyBLZWVwIGBpYCBhIHN0cmluZyBpZiB0aGVyZSBhcmUgbm8gZWxlbWVudHMgc28gYG1hdGNoZWRDb3VudGAgd2lsbCBiZSBcIjAwXCIgYmVsb3dcbiAgICAgIGZvciAoIDsgKGVsZW0gPSBlbGVtc1tpXSkgIT0gbnVsbDsgaSsrICkge1xuICAgICAgICBpZiAoIGJ5RWxlbWVudCAmJiBlbGVtICkge1xuICAgICAgICAgIGogPSAwO1xuICAgICAgICAgIHdoaWxlICggKG1hdGNoZXIgPSBlbGVtZW50TWF0Y2hlcnNbaisrXSkgKSB7XG4gICAgICAgICAgICBpZiAoIG1hdGNoZXIoIGVsZW0sIGNvbnRleHQsIHhtbCApICkge1xuICAgICAgICAgICAgICByZXN1bHRzLnB1c2goIGVsZW0gKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICggb3V0ZXJtb3N0ICkge1xuICAgICAgICAgICAgZGlycnVucyA9IGRpcnJ1bnNVbmlxdWU7XG4gICAgICAgICAgICBjYWNoZWRydW5zID0gKyttYXRjaGVyQ2FjaGVkUnVucztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUcmFjayB1bm1hdGNoZWQgZWxlbWVudHMgZm9yIHNldCBmaWx0ZXJzXG4gICAgICAgIGlmICggYnlTZXQgKSB7XG4gICAgICAgICAgLy8gVGhleSB3aWxsIGhhdmUgZ29uZSB0aHJvdWdoIGFsbCBwb3NzaWJsZSBtYXRjaGVyc1xuICAgICAgICAgIGlmICggKGVsZW0gPSAhbWF0Y2hlciAmJiBlbGVtKSApIHtcbiAgICAgICAgICAgIG1hdGNoZWRDb3VudC0tO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIExlbmd0aGVuIHRoZSBhcnJheSBmb3IgZXZlcnkgZWxlbWVudCwgbWF0Y2hlZCBvciBub3RcbiAgICAgICAgICBpZiAoIHNlZWQgKSB7XG4gICAgICAgICAgICB1bm1hdGNoZWQucHVzaCggZWxlbSApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBBcHBseSBzZXQgZmlsdGVycyB0byB1bm1hdGNoZWQgZWxlbWVudHNcbiAgICAgIG1hdGNoZWRDb3VudCArPSBpO1xuICAgICAgaWYgKCBieVNldCAmJiBpICE9PSBtYXRjaGVkQ291bnQgKSB7XG4gICAgICAgIGogPSAwO1xuICAgICAgICB3aGlsZSAoIChtYXRjaGVyID0gc2V0TWF0Y2hlcnNbaisrXSkgKSB7XG4gICAgICAgICAgbWF0Y2hlciggdW5tYXRjaGVkLCBzZXRNYXRjaGVkLCBjb250ZXh0LCB4bWwgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggc2VlZCApIHtcbiAgICAgICAgICAvLyBSZWludGVncmF0ZSBlbGVtZW50IG1hdGNoZXMgdG8gZWxpbWluYXRlIHRoZSBuZWVkIGZvciBzb3J0aW5nXG4gICAgICAgICAgaWYgKCBtYXRjaGVkQ291bnQgPiAwICkge1xuICAgICAgICAgICAgd2hpbGUgKCBpLS0gKSB7XG4gICAgICAgICAgICAgIGlmICggISh1bm1hdGNoZWRbaV0gfHwgc2V0TWF0Y2hlZFtpXSkgKSB7XG4gICAgICAgICAgICAgICAgc2V0TWF0Y2hlZFtpXSA9IHBvcC5jYWxsKCByZXN1bHRzICk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBEaXNjYXJkIGluZGV4IHBsYWNlaG9sZGVyIHZhbHVlcyB0byBnZXQgb25seSBhY3R1YWwgbWF0Y2hlc1xuICAgICAgICAgIHNldE1hdGNoZWQgPSBjb25kZW5zZSggc2V0TWF0Y2hlZCApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWRkIG1hdGNoZXMgdG8gcmVzdWx0c1xuICAgICAgICBwdXNoLmFwcGx5KCByZXN1bHRzLCBzZXRNYXRjaGVkICk7XG5cbiAgICAgICAgLy8gU2VlZGxlc3Mgc2V0IG1hdGNoZXMgc3VjY2VlZGluZyBtdWx0aXBsZSBzdWNjZXNzZnVsIG1hdGNoZXJzIHN0aXB1bGF0ZSBzb3J0aW5nXG4gICAgICAgIGlmICggb3V0ZXJtb3N0ICYmICFzZWVkICYmIHNldE1hdGNoZWQubGVuZ3RoID4gMCAmJlxuICAgICAgICAgICggbWF0Y2hlZENvdW50ICsgc2V0TWF0Y2hlcnMubGVuZ3RoICkgPiAxICkge1xuXG4gICAgICAgICAgU2l6emxlLnVuaXF1ZVNvcnQoIHJlc3VsdHMgKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBPdmVycmlkZSBtYW5pcHVsYXRpb24gb2YgZ2xvYmFscyBieSBuZXN0ZWQgbWF0Y2hlcnNcbiAgICAgIGlmICggb3V0ZXJtb3N0ICkge1xuICAgICAgICBkaXJydW5zID0gZGlycnVuc1VuaXF1ZTtcbiAgICAgICAgb3V0ZXJtb3N0Q29udGV4dCA9IGNvbnRleHRCYWNrdXA7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB1bm1hdGNoZWQ7XG4gICAgfTtcblxuICByZXR1cm4gYnlTZXQgP1xuICAgIG1hcmtGdW5jdGlvbiggc3VwZXJNYXRjaGVyICkgOlxuICAgIHN1cGVyTWF0Y2hlcjtcbn1cblxuY29tcGlsZSA9IFNpenpsZS5jb21waWxlID0gZnVuY3Rpb24oIHNlbGVjdG9yLCBncm91cCAvKiBJbnRlcm5hbCBVc2UgT25seSAqLyApIHtcbiAgdmFyIGksXG4gICAgc2V0TWF0Y2hlcnMgPSBbXSxcbiAgICBlbGVtZW50TWF0Y2hlcnMgPSBbXSxcbiAgICBjYWNoZWQgPSBjb21waWxlckNhY2hlWyBzZWxlY3RvciArIFwiIFwiIF07XG5cbiAgaWYgKCAhY2FjaGVkICkge1xuICAgIC8vIEdlbmVyYXRlIGEgZnVuY3Rpb24gb2YgcmVjdXJzaXZlIGZ1bmN0aW9ucyB0aGF0IGNhbiBiZSB1c2VkIHRvIGNoZWNrIGVhY2ggZWxlbWVudFxuICAgIGlmICggIWdyb3VwICkge1xuICAgICAgZ3JvdXAgPSB0b2tlbml6ZSggc2VsZWN0b3IgKTtcbiAgICB9XG4gICAgaSA9IGdyb3VwLmxlbmd0aDtcbiAgICB3aGlsZSAoIGktLSApIHtcbiAgICAgIGNhY2hlZCA9IG1hdGNoZXJGcm9tVG9rZW5zKCBncm91cFtpXSApO1xuICAgICAgaWYgKCBjYWNoZWRbIGV4cGFuZG8gXSApIHtcbiAgICAgICAgc2V0TWF0Y2hlcnMucHVzaCggY2FjaGVkICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbGVtZW50TWF0Y2hlcnMucHVzaCggY2FjaGVkICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ2FjaGUgdGhlIGNvbXBpbGVkIGZ1bmN0aW9uXG4gICAgY2FjaGVkID0gY29tcGlsZXJDYWNoZSggc2VsZWN0b3IsIG1hdGNoZXJGcm9tR3JvdXBNYXRjaGVycyggZWxlbWVudE1hdGNoZXJzLCBzZXRNYXRjaGVycyApICk7XG4gIH1cbiAgcmV0dXJuIGNhY2hlZDtcbn07XG5cbmZ1bmN0aW9uIG11bHRpcGxlQ29udGV4dHMoIHNlbGVjdG9yLCBjb250ZXh0cywgcmVzdWx0cyApIHtcbiAgdmFyIGkgPSAwLFxuICAgIGxlbiA9IGNvbnRleHRzLmxlbmd0aDtcbiAgZm9yICggOyBpIDwgbGVuOyBpKysgKSB7XG4gICAgU2l6emxlKCBzZWxlY3RvciwgY29udGV4dHNbaV0sIHJlc3VsdHMgKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0cztcbn1cblxuZnVuY3Rpb24gc2VsZWN0KCBzZWxlY3RvciwgY29udGV4dCwgcmVzdWx0cywgc2VlZCApIHtcbiAgdmFyIGksIHRva2VucywgdG9rZW4sIHR5cGUsIGZpbmQsXG4gICAgbWF0Y2ggPSB0b2tlbml6ZSggc2VsZWN0b3IgKTtcblxuICBpZiAoICFzZWVkICkge1xuICAgIC8vIFRyeSB0byBtaW5pbWl6ZSBvcGVyYXRpb25zIGlmIHRoZXJlIGlzIG9ubHkgb25lIGdyb3VwXG4gICAgaWYgKCBtYXRjaC5sZW5ndGggPT09IDEgKSB7XG5cbiAgICAgIC8vIFRha2UgYSBzaG9ydGN1dCBhbmQgc2V0IHRoZSBjb250ZXh0IGlmIHRoZSByb290IHNlbGVjdG9yIGlzIGFuIElEXG4gICAgICB0b2tlbnMgPSBtYXRjaFswXSA9IG1hdGNoWzBdLnNsaWNlKCAwICk7XG4gICAgICBpZiAoIHRva2Vucy5sZW5ndGggPiAyICYmICh0b2tlbiA9IHRva2Vuc1swXSkudHlwZSA9PT0gXCJJRFwiICYmXG4gICAgICAgICAgc3VwcG9ydC5nZXRCeUlkICYmIGNvbnRleHQubm9kZVR5cGUgPT09IDkgJiYgZG9jdW1lbnRJc0hUTUwgJiZcbiAgICAgICAgICBFeHByLnJlbGF0aXZlWyB0b2tlbnNbMV0udHlwZSBdICkge1xuXG4gICAgICAgIGNvbnRleHQgPSAoIEV4cHIuZmluZFtcIklEXCJdKCB0b2tlbi5tYXRjaGVzWzBdLnJlcGxhY2UocnVuZXNjYXBlLCBmdW5lc2NhcGUpLCBjb250ZXh0ICkgfHwgW10gKVswXTtcbiAgICAgICAgaWYgKCAhY29udGV4dCApIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgfVxuICAgICAgICBzZWxlY3RvciA9IHNlbGVjdG9yLnNsaWNlKCB0b2tlbnMuc2hpZnQoKS52YWx1ZS5sZW5ndGggKTtcbiAgICAgIH1cblxuICAgICAgLy8gRmV0Y2ggYSBzZWVkIHNldCBmb3IgcmlnaHQtdG8tbGVmdCBtYXRjaGluZ1xuICAgICAgaSA9IG1hdGNoRXhwcltcIm5lZWRzQ29udGV4dFwiXS50ZXN0KCBzZWxlY3RvciApID8gMCA6IHRva2Vucy5sZW5ndGg7XG4gICAgICB3aGlsZSAoIGktLSApIHtcbiAgICAgICAgdG9rZW4gPSB0b2tlbnNbaV07XG5cbiAgICAgICAgLy8gQWJvcnQgaWYgd2UgaGl0IGEgY29tYmluYXRvclxuICAgICAgICBpZiAoIEV4cHIucmVsYXRpdmVbICh0eXBlID0gdG9rZW4udHlwZSkgXSApIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBpZiAoIChmaW5kID0gRXhwci5maW5kWyB0eXBlIF0pICkge1xuICAgICAgICAgIC8vIFNlYXJjaCwgZXhwYW5kaW5nIGNvbnRleHQgZm9yIGxlYWRpbmcgc2libGluZyBjb21iaW5hdG9yc1xuICAgICAgICAgIGlmICggKHNlZWQgPSBmaW5kKFxuICAgICAgICAgICAgdG9rZW4ubWF0Y2hlc1swXS5yZXBsYWNlKCBydW5lc2NhcGUsIGZ1bmVzY2FwZSApLFxuICAgICAgICAgICAgcnNpYmxpbmcudGVzdCggdG9rZW5zWzBdLnR5cGUgKSAmJiBjb250ZXh0LnBhcmVudE5vZGUgfHwgY29udGV4dFxuICAgICAgICAgICkpICkge1xuXG4gICAgICAgICAgICAvLyBJZiBzZWVkIGlzIGVtcHR5IG9yIG5vIHRva2VucyByZW1haW4sIHdlIGNhbiByZXR1cm4gZWFybHlcbiAgICAgICAgICAgIHRva2Vucy5zcGxpY2UoIGksIDEgKTtcbiAgICAgICAgICAgIHNlbGVjdG9yID0gc2VlZC5sZW5ndGggJiYgdG9TZWxlY3RvciggdG9rZW5zICk7XG4gICAgICAgICAgICBpZiAoICFzZWxlY3RvciApIHtcbiAgICAgICAgICAgICAgcHVzaC5hcHBseSggcmVzdWx0cywgc2VlZCApO1xuICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gQ29tcGlsZSBhbmQgZXhlY3V0ZSBhIGZpbHRlcmluZyBmdW5jdGlvblxuICAvLyBQcm92aWRlIGBtYXRjaGAgdG8gYXZvaWQgcmV0b2tlbml6YXRpb24gaWYgd2UgbW9kaWZpZWQgdGhlIHNlbGVjdG9yIGFib3ZlXG4gIGNvbXBpbGUoIHNlbGVjdG9yLCBtYXRjaCApKFxuICAgIHNlZWQsXG4gICAgY29udGV4dCxcbiAgICAhZG9jdW1lbnRJc0hUTUwsXG4gICAgcmVzdWx0cyxcbiAgICByc2libGluZy50ZXN0KCBzZWxlY3RvciApXG4gICk7XG4gIHJldHVybiByZXN1bHRzO1xufVxuXG4vLyBPbmUtdGltZSBhc3NpZ25tZW50c1xuXG4vLyBTb3J0IHN0YWJpbGl0eVxuc3VwcG9ydC5zb3J0U3RhYmxlID0gZXhwYW5kby5zcGxpdChcIlwiKS5zb3J0KCBzb3J0T3JkZXIgKS5qb2luKFwiXCIpID09PSBleHBhbmRvO1xuXG4vLyBTdXBwb3J0OiBDaHJvbWU8MTRcbi8vIEFsd2F5cyBhc3N1bWUgZHVwbGljYXRlcyBpZiB0aGV5IGFyZW4ndCBwYXNzZWQgdG8gdGhlIGNvbXBhcmlzb24gZnVuY3Rpb25cbnN1cHBvcnQuZGV0ZWN0RHVwbGljYXRlcyA9IGhhc0R1cGxpY2F0ZTtcblxuLy8gSW5pdGlhbGl6ZSBhZ2FpbnN0IHRoZSBkZWZhdWx0IGRvY3VtZW50XG5zZXREb2N1bWVudCgpO1xuXG4vLyBTdXBwb3J0OiBXZWJraXQ8NTM3LjMyIC0gU2FmYXJpIDYuMC4zL0Nocm9tZSAyNSAoZml4ZWQgaW4gQ2hyb21lIDI3KVxuLy8gRGV0YWNoZWQgbm9kZXMgY29uZm91bmRpbmdseSBmb2xsb3cgKmVhY2ggb3RoZXIqXG5zdXBwb3J0LnNvcnREZXRhY2hlZCA9IGFzc2VydChmdW5jdGlvbiggZGl2MSApIHtcbiAgLy8gU2hvdWxkIHJldHVybiAxLCBidXQgcmV0dXJucyA0IChmb2xsb3dpbmcpXG4gIHJldHVybiBkaXYxLmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uKCBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpICkgJiAxO1xufSk7XG5cbi8vIFN1cHBvcnQ6IElFPDhcbi8vIFByZXZlbnQgYXR0cmlidXRlL3Byb3BlcnR5IFwiaW50ZXJwb2xhdGlvblwiXG4vLyBodHRwOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvbXM1MzY0MjklMjhWUy44NSUyOS5hc3B4XG5pZiAoICFhc3NlcnQoZnVuY3Rpb24oIGRpdiApIHtcbiAgZGl2LmlubmVySFRNTCA9IFwiPGEgaHJlZj0nIyc+PC9hPlwiO1xuICByZXR1cm4gZGl2LmZpcnN0Q2hpbGQuZ2V0QXR0cmlidXRlKFwiaHJlZlwiKSA9PT0gXCIjXCIgO1xufSkgKSB7XG4gIGFkZEhhbmRsZSggXCJ0eXBlfGhyZWZ8aGVpZ2h0fHdpZHRoXCIsIGZ1bmN0aW9uKCBlbGVtLCBuYW1lLCBpc1hNTCApIHtcbiAgICBpZiAoICFpc1hNTCApIHtcbiAgICAgIHJldHVybiBlbGVtLmdldEF0dHJpYnV0ZSggbmFtZSwgbmFtZS50b0xvd2VyQ2FzZSgpID09PSBcInR5cGVcIiA/IDEgOiAyICk7XG4gICAgfVxuICB9KTtcbn1cblxuLy8gU3VwcG9ydDogSUU8OVxuLy8gVXNlIGRlZmF1bHRWYWx1ZSBpbiBwbGFjZSBvZiBnZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiKVxuaWYgKCAhc3VwcG9ydC5hdHRyaWJ1dGVzIHx8ICFhc3NlcnQoZnVuY3Rpb24oIGRpdiApIHtcbiAgZGl2LmlubmVySFRNTCA9IFwiPGlucHV0Lz5cIjtcbiAgZGl2LmZpcnN0Q2hpbGQuc2V0QXR0cmlidXRlKCBcInZhbHVlXCIsIFwiXCIgKTtcbiAgcmV0dXJuIGRpdi5maXJzdENoaWxkLmdldEF0dHJpYnV0ZSggXCJ2YWx1ZVwiICkgPT09IFwiXCI7XG59KSApIHtcbiAgYWRkSGFuZGxlKCBcInZhbHVlXCIsIGZ1bmN0aW9uKCBlbGVtLCBuYW1lLCBpc1hNTCApIHtcbiAgICBpZiAoICFpc1hNTCAmJiBlbGVtLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgPT09IFwiaW5wdXRcIiApIHtcbiAgICAgIHJldHVybiBlbGVtLmRlZmF1bHRWYWx1ZTtcbiAgICB9XG4gIH0pO1xufVxuXG4vLyBTdXBwb3J0OiBJRTw5XG4vLyBVc2UgZ2V0QXR0cmlidXRlTm9kZSB0byBmZXRjaCBib29sZWFucyB3aGVuIGdldEF0dHJpYnV0ZSBsaWVzXG5pZiAoICFhc3NlcnQoZnVuY3Rpb24oIGRpdiApIHtcbiAgcmV0dXJuIGRpdi5nZXRBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiKSA9PSBudWxsO1xufSkgKSB7XG4gIGFkZEhhbmRsZSggYm9vbGVhbnMsIGZ1bmN0aW9uKCBlbGVtLCBuYW1lLCBpc1hNTCApIHtcbiAgICB2YXIgdmFsO1xuICAgIGlmICggIWlzWE1MICkge1xuICAgICAgcmV0dXJuICh2YWwgPSBlbGVtLmdldEF0dHJpYnV0ZU5vZGUoIG5hbWUgKSkgJiYgdmFsLnNwZWNpZmllZCA/XG4gICAgICAgIHZhbC52YWx1ZSA6XG4gICAgICAgIGVsZW1bIG5hbWUgXSA9PT0gdHJ1ZSA/IG5hbWUudG9Mb3dlckNhc2UoKSA6IG51bGw7XG4gICAgfVxuICB9KTtcbn1cblxualF1ZXJ5LmZpbmQgPSBTaXp6bGU7XG5qUXVlcnkuZXhwciA9IFNpenpsZS5zZWxlY3RvcnM7XG5qUXVlcnkuZXhwcltcIjpcIl0gPSBqUXVlcnkuZXhwci5wc2V1ZG9zO1xualF1ZXJ5LnVuaXF1ZSA9IFNpenpsZS51bmlxdWVTb3J0O1xualF1ZXJ5LnRleHQgPSBTaXp6bGUuZ2V0VGV4dDtcbmpRdWVyeS5pc1hNTERvYyA9IFNpenpsZS5pc1hNTDtcbmpRdWVyeS5jb250YWlucyA9IFNpenpsZS5jb250YWlucztcblxuXG59KSggd2luZG93ICk7XG4vLyBTdHJpbmcgdG8gT2JqZWN0IG9wdGlvbnMgZm9ybWF0IGNhY2hlXG52YXIgb3B0aW9uc0NhY2hlID0ge307XG5cbi8vIENvbnZlcnQgU3RyaW5nLWZvcm1hdHRlZCBvcHRpb25zIGludG8gT2JqZWN0LWZvcm1hdHRlZCBvbmVzIGFuZCBzdG9yZSBpbiBjYWNoZVxuZnVuY3Rpb24gY3JlYXRlT3B0aW9ucyggb3B0aW9ucyApIHtcbiAgdmFyIG9iamVjdCA9IG9wdGlvbnNDYWNoZVsgb3B0aW9ucyBdID0ge307XG4gIGpRdWVyeS5lYWNoKCBvcHRpb25zLm1hdGNoKCBjb3JlX3Jub3R3aGl0ZSApIHx8IFtdLCBmdW5jdGlvbiggXywgZmxhZyApIHtcbiAgICBvYmplY3RbIGZsYWcgXSA9IHRydWU7XG4gIH0pO1xuICByZXR1cm4gb2JqZWN0O1xufVxuXG4vKlxuICogQ3JlYXRlIGEgY2FsbGJhY2sgbGlzdCB1c2luZyB0aGUgZm9sbG93aW5nIHBhcmFtZXRlcnM6XG4gKlxuICogIG9wdGlvbnM6IGFuIG9wdGlvbmFsIGxpc3Qgb2Ygc3BhY2Utc2VwYXJhdGVkIG9wdGlvbnMgdGhhdCB3aWxsIGNoYW5nZSBob3dcbiAqICAgICAgdGhlIGNhbGxiYWNrIGxpc3QgYmVoYXZlcyBvciBhIG1vcmUgdHJhZGl0aW9uYWwgb3B0aW9uIG9iamVjdFxuICpcbiAqIEJ5IGRlZmF1bHQgYSBjYWxsYmFjayBsaXN0IHdpbGwgYWN0IGxpa2UgYW4gZXZlbnQgY2FsbGJhY2sgbGlzdCBhbmQgY2FuIGJlXG4gKiBcImZpcmVkXCIgbXVsdGlwbGUgdGltZXMuXG4gKlxuICogUG9zc2libGUgb3B0aW9uczpcbiAqXG4gKiAgb25jZTogICAgIHdpbGwgZW5zdXJlIHRoZSBjYWxsYmFjayBsaXN0IGNhbiBvbmx5IGJlIGZpcmVkIG9uY2UgKGxpa2UgYSBEZWZlcnJlZClcbiAqXG4gKiAgbWVtb3J5OiAgICAgd2lsbCBrZWVwIHRyYWNrIG9mIHByZXZpb3VzIHZhbHVlcyBhbmQgd2lsbCBjYWxsIGFueSBjYWxsYmFjayBhZGRlZFxuICogICAgICAgICAgYWZ0ZXIgdGhlIGxpc3QgaGFzIGJlZW4gZmlyZWQgcmlnaHQgYXdheSB3aXRoIHRoZSBsYXRlc3QgXCJtZW1vcml6ZWRcIlxuICogICAgICAgICAgdmFsdWVzIChsaWtlIGEgRGVmZXJyZWQpXG4gKlxuICogIHVuaXF1ZTogICAgIHdpbGwgZW5zdXJlIGEgY2FsbGJhY2sgY2FuIG9ubHkgYmUgYWRkZWQgb25jZSAobm8gZHVwbGljYXRlIGluIHRoZSBsaXN0KVxuICpcbiAqICBzdG9wT25GYWxzZTogIGludGVycnVwdCBjYWxsaW5ncyB3aGVuIGEgY2FsbGJhY2sgcmV0dXJucyBmYWxzZVxuICpcbiAqL1xualF1ZXJ5LkNhbGxiYWNrcyA9IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXG4gIC8vIENvbnZlcnQgb3B0aW9ucyBmcm9tIFN0cmluZy1mb3JtYXR0ZWQgdG8gT2JqZWN0LWZvcm1hdHRlZCBpZiBuZWVkZWRcbiAgLy8gKHdlIGNoZWNrIGluIGNhY2hlIGZpcnN0KVxuICBvcHRpb25zID0gdHlwZW9mIG9wdGlvbnMgPT09IFwic3RyaW5nXCIgP1xuICAgICggb3B0aW9uc0NhY2hlWyBvcHRpb25zIF0gfHwgY3JlYXRlT3B0aW9ucyggb3B0aW9ucyApICkgOlxuICAgIGpRdWVyeS5leHRlbmQoIHt9LCBvcHRpb25zICk7XG5cbiAgdmFyIC8vIEZsYWcgdG8ga25vdyBpZiBsaXN0IGlzIGN1cnJlbnRseSBmaXJpbmdcbiAgICBmaXJpbmcsXG4gICAgLy8gTGFzdCBmaXJlIHZhbHVlIChmb3Igbm9uLWZvcmdldHRhYmxlIGxpc3RzKVxuICAgIG1lbW9yeSxcbiAgICAvLyBGbGFnIHRvIGtub3cgaWYgbGlzdCB3YXMgYWxyZWFkeSBmaXJlZFxuICAgIGZpcmVkLFxuICAgIC8vIEVuZCBvZiB0aGUgbG9vcCB3aGVuIGZpcmluZ1xuICAgIGZpcmluZ0xlbmd0aCxcbiAgICAvLyBJbmRleCBvZiBjdXJyZW50bHkgZmlyaW5nIGNhbGxiYWNrIChtb2RpZmllZCBieSByZW1vdmUgaWYgbmVlZGVkKVxuICAgIGZpcmluZ0luZGV4LFxuICAgIC8vIEZpcnN0IGNhbGxiYWNrIHRvIGZpcmUgKHVzZWQgaW50ZXJuYWxseSBieSBhZGQgYW5kIGZpcmVXaXRoKVxuICAgIGZpcmluZ1N0YXJ0LFxuICAgIC8vIEFjdHVhbCBjYWxsYmFjayBsaXN0XG4gICAgbGlzdCA9IFtdLFxuICAgIC8vIFN0YWNrIG9mIGZpcmUgY2FsbHMgZm9yIHJlcGVhdGFibGUgbGlzdHNcbiAgICBzdGFjayA9ICFvcHRpb25zLm9uY2UgJiYgW10sXG4gICAgLy8gRmlyZSBjYWxsYmFja3NcbiAgICBmaXJlID0gZnVuY3Rpb24oIGRhdGEgKSB7XG4gICAgICBtZW1vcnkgPSBvcHRpb25zLm1lbW9yeSAmJiBkYXRhO1xuICAgICAgZmlyZWQgPSB0cnVlO1xuICAgICAgZmlyaW5nSW5kZXggPSBmaXJpbmdTdGFydCB8fCAwO1xuICAgICAgZmlyaW5nU3RhcnQgPSAwO1xuICAgICAgZmlyaW5nTGVuZ3RoID0gbGlzdC5sZW5ndGg7XG4gICAgICBmaXJpbmcgPSB0cnVlO1xuICAgICAgZm9yICggOyBsaXN0ICYmIGZpcmluZ0luZGV4IDwgZmlyaW5nTGVuZ3RoOyBmaXJpbmdJbmRleCsrICkge1xuICAgICAgICBpZiAoIGxpc3RbIGZpcmluZ0luZGV4IF0uYXBwbHkoIGRhdGFbIDAgXSwgZGF0YVsgMSBdICkgPT09IGZhbHNlICYmIG9wdGlvbnMuc3RvcE9uRmFsc2UgKSB7XG4gICAgICAgICAgbWVtb3J5ID0gZmFsc2U7IC8vIFRvIHByZXZlbnQgZnVydGhlciBjYWxscyB1c2luZyBhZGRcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZmlyaW5nID0gZmFsc2U7XG4gICAgICBpZiAoIGxpc3QgKSB7XG4gICAgICAgIGlmICggc3RhY2sgKSB7XG4gICAgICAgICAgaWYgKCBzdGFjay5sZW5ndGggKSB7XG4gICAgICAgICAgICBmaXJlKCBzdGFjay5zaGlmdCgpICk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKCBtZW1vcnkgKSB7XG4gICAgICAgICAgbGlzdCA9IFtdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlbGYuZGlzYWJsZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICAvLyBBY3R1YWwgQ2FsbGJhY2tzIG9iamVjdFxuICAgIHNlbGYgPSB7XG4gICAgICAvLyBBZGQgYSBjYWxsYmFjayBvciBhIGNvbGxlY3Rpb24gb2YgY2FsbGJhY2tzIHRvIHRoZSBsaXN0XG4gICAgICBhZGQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIGxpc3QgKSB7XG4gICAgICAgICAgLy8gRmlyc3QsIHdlIHNhdmUgdGhlIGN1cnJlbnQgbGVuZ3RoXG4gICAgICAgICAgdmFyIHN0YXJ0ID0gbGlzdC5sZW5ndGg7XG4gICAgICAgICAgKGZ1bmN0aW9uIGFkZCggYXJncyApIHtcbiAgICAgICAgICAgIGpRdWVyeS5lYWNoKCBhcmdzLCBmdW5jdGlvbiggXywgYXJnICkge1xuICAgICAgICAgICAgICB2YXIgdHlwZSA9IGpRdWVyeS50eXBlKCBhcmcgKTtcbiAgICAgICAgICAgICAgaWYgKCB0eXBlID09PSBcImZ1bmN0aW9uXCIgKSB7XG4gICAgICAgICAgICAgICAgaWYgKCAhb3B0aW9ucy51bmlxdWUgfHwgIXNlbGYuaGFzKCBhcmcgKSApIHtcbiAgICAgICAgICAgICAgICAgIGxpc3QucHVzaCggYXJnICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2UgaWYgKCBhcmcgJiYgYXJnLmxlbmd0aCAmJiB0eXBlICE9PSBcInN0cmluZ1wiICkge1xuICAgICAgICAgICAgICAgIC8vIEluc3BlY3QgcmVjdXJzaXZlbHlcbiAgICAgICAgICAgICAgICBhZGQoIGFyZyApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KSggYXJndW1lbnRzICk7XG4gICAgICAgICAgLy8gRG8gd2UgbmVlZCB0byBhZGQgdGhlIGNhbGxiYWNrcyB0byB0aGVcbiAgICAgICAgICAvLyBjdXJyZW50IGZpcmluZyBiYXRjaD9cbiAgICAgICAgICBpZiAoIGZpcmluZyApIHtcbiAgICAgICAgICAgIGZpcmluZ0xlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICAgICAgICAgIC8vIFdpdGggbWVtb3J5LCBpZiB3ZSdyZSBub3QgZmlyaW5nIHRoZW5cbiAgICAgICAgICAvLyB3ZSBzaG91bGQgY2FsbCByaWdodCBhd2F5XG4gICAgICAgICAgfSBlbHNlIGlmICggbWVtb3J5ICkge1xuICAgICAgICAgICAgZmlyaW5nU3RhcnQgPSBzdGFydDtcbiAgICAgICAgICAgIGZpcmUoIG1lbW9yeSApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sXG4gICAgICAvLyBSZW1vdmUgYSBjYWxsYmFjayBmcm9tIHRoZSBsaXN0XG4gICAgICByZW1vdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIGxpc3QgKSB7XG4gICAgICAgICAgalF1ZXJ5LmVhY2goIGFyZ3VtZW50cywgZnVuY3Rpb24oIF8sIGFyZyApIHtcbiAgICAgICAgICAgIHZhciBpbmRleDtcbiAgICAgICAgICAgIHdoaWxlKCAoIGluZGV4ID0galF1ZXJ5LmluQXJyYXkoIGFyZywgbGlzdCwgaW5kZXggKSApID4gLTEgKSB7XG4gICAgICAgICAgICAgIGxpc3Quc3BsaWNlKCBpbmRleCwgMSApO1xuICAgICAgICAgICAgICAvLyBIYW5kbGUgZmlyaW5nIGluZGV4ZXNcbiAgICAgICAgICAgICAgaWYgKCBmaXJpbmcgKSB7XG4gICAgICAgICAgICAgICAgaWYgKCBpbmRleCA8PSBmaXJpbmdMZW5ndGggKSB7XG4gICAgICAgICAgICAgICAgICBmaXJpbmdMZW5ndGgtLTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCBpbmRleCA8PSBmaXJpbmdJbmRleCApIHtcbiAgICAgICAgICAgICAgICAgIGZpcmluZ0luZGV4LS07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LFxuICAgICAgLy8gQ2hlY2sgaWYgYSBnaXZlbiBjYWxsYmFjayBpcyBpbiB0aGUgbGlzdC5cbiAgICAgIC8vIElmIG5vIGFyZ3VtZW50IGlzIGdpdmVuLCByZXR1cm4gd2hldGhlciBvciBub3QgbGlzdCBoYXMgY2FsbGJhY2tzIGF0dGFjaGVkLlxuICAgICAgaGFzOiBmdW5jdGlvbiggZm4gKSB7XG4gICAgICAgIHJldHVybiBmbiA/IGpRdWVyeS5pbkFycmF5KCBmbiwgbGlzdCApID4gLTEgOiAhISggbGlzdCAmJiBsaXN0Lmxlbmd0aCApO1xuICAgICAgfSxcbiAgICAgIC8vIFJlbW92ZSBhbGwgY2FsbGJhY2tzIGZyb20gdGhlIGxpc3RcbiAgICAgIGVtcHR5OiBmdW5jdGlvbigpIHtcbiAgICAgICAgbGlzdCA9IFtdO1xuICAgICAgICBmaXJpbmdMZW5ndGggPSAwO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sXG4gICAgICAvLyBIYXZlIHRoZSBsaXN0IGRvIG5vdGhpbmcgYW55bW9yZVxuICAgICAgZGlzYWJsZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGxpc3QgPSBzdGFjayA9IG1lbW9yeSA9IHVuZGVmaW5lZDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LFxuICAgICAgLy8gSXMgaXQgZGlzYWJsZWQ/XG4gICAgICBkaXNhYmxlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAhbGlzdDtcbiAgICAgIH0sXG4gICAgICAvLyBMb2NrIHRoZSBsaXN0IGluIGl0cyBjdXJyZW50IHN0YXRlXG4gICAgICBsb2NrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgc3RhY2sgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmICggIW1lbW9yeSApIHtcbiAgICAgICAgICBzZWxmLmRpc2FibGUoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sXG4gICAgICAvLyBJcyBpdCBsb2NrZWQ/XG4gICAgICBsb2NrZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gIXN0YWNrO1xuICAgICAgfSxcbiAgICAgIC8vIENhbGwgYWxsIGNhbGxiYWNrcyB3aXRoIHRoZSBnaXZlbiBjb250ZXh0IGFuZCBhcmd1bWVudHNcbiAgICAgIGZpcmVXaXRoOiBmdW5jdGlvbiggY29udGV4dCwgYXJncyApIHtcbiAgICAgICAgaWYgKCBsaXN0ICYmICggIWZpcmVkIHx8IHN0YWNrICkgKSB7XG4gICAgICAgICAgYXJncyA9IGFyZ3MgfHwgW107XG4gICAgICAgICAgYXJncyA9IFsgY29udGV4dCwgYXJncy5zbGljZSA/IGFyZ3Muc2xpY2UoKSA6IGFyZ3MgXTtcbiAgICAgICAgICBpZiAoIGZpcmluZyApIHtcbiAgICAgICAgICAgIHN0YWNrLnB1c2goIGFyZ3MgKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZmlyZSggYXJncyApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sXG4gICAgICAvLyBDYWxsIGFsbCB0aGUgY2FsbGJhY2tzIHdpdGggdGhlIGdpdmVuIGFyZ3VtZW50c1xuICAgICAgZmlyZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGYuZmlyZVdpdGgoIHRoaXMsIGFyZ3VtZW50cyApO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sXG4gICAgICAvLyBUbyBrbm93IGlmIHRoZSBjYWxsYmFja3MgaGF2ZSBhbHJlYWR5IGJlZW4gY2FsbGVkIGF0IGxlYXN0IG9uY2VcbiAgICAgIGZpcmVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuICEhZmlyZWQ7XG4gICAgICB9XG4gICAgfTtcblxuICByZXR1cm4gc2VsZjtcbn07XG5qUXVlcnkuZXh0ZW5kKHtcblxuICBEZWZlcnJlZDogZnVuY3Rpb24oIGZ1bmMgKSB7XG4gICAgdmFyIHR1cGxlcyA9IFtcbiAgICAgICAgLy8gYWN0aW9uLCBhZGQgbGlzdGVuZXIsIGxpc3RlbmVyIGxpc3QsIGZpbmFsIHN0YXRlXG4gICAgICAgIFsgXCJyZXNvbHZlXCIsIFwiZG9uZVwiLCBqUXVlcnkuQ2FsbGJhY2tzKFwib25jZSBtZW1vcnlcIiksIFwicmVzb2x2ZWRcIiBdLFxuICAgICAgICBbIFwicmVqZWN0XCIsIFwiZmFpbFwiLCBqUXVlcnkuQ2FsbGJhY2tzKFwib25jZSBtZW1vcnlcIiksIFwicmVqZWN0ZWRcIiBdLFxuICAgICAgICBbIFwibm90aWZ5XCIsIFwicHJvZ3Jlc3NcIiwgalF1ZXJ5LkNhbGxiYWNrcyhcIm1lbW9yeVwiKSBdXG4gICAgICBdLFxuICAgICAgc3RhdGUgPSBcInBlbmRpbmdcIixcbiAgICAgIHByb21pc2UgPSB7XG4gICAgICAgIHN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gc3RhdGU7XG4gICAgICAgIH0sXG4gICAgICAgIGFsd2F5czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgZGVmZXJyZWQuZG9uZSggYXJndW1lbnRzICkuZmFpbCggYXJndW1lbnRzICk7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG4gICAgICAgIHRoZW46IGZ1bmN0aW9uKCAvKiBmbkRvbmUsIGZuRmFpbCwgZm5Qcm9ncmVzcyAqLyApIHtcbiAgICAgICAgICB2YXIgZm5zID0gYXJndW1lbnRzO1xuICAgICAgICAgIHJldHVybiBqUXVlcnkuRGVmZXJyZWQoZnVuY3Rpb24oIG5ld0RlZmVyICkge1xuICAgICAgICAgICAgalF1ZXJ5LmVhY2goIHR1cGxlcywgZnVuY3Rpb24oIGksIHR1cGxlICkge1xuICAgICAgICAgICAgICB2YXIgYWN0aW9uID0gdHVwbGVbIDAgXSxcbiAgICAgICAgICAgICAgICBmbiA9IGpRdWVyeS5pc0Z1bmN0aW9uKCBmbnNbIGkgXSApICYmIGZuc1sgaSBdO1xuICAgICAgICAgICAgICAvLyBkZWZlcnJlZFsgZG9uZSB8IGZhaWwgfCBwcm9ncmVzcyBdIGZvciBmb3J3YXJkaW5nIGFjdGlvbnMgdG8gbmV3RGVmZXJcbiAgICAgICAgICAgICAgZGVmZXJyZWRbIHR1cGxlWzFdIF0oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJldHVybmVkID0gZm4gJiYgZm4uYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuICAgICAgICAgICAgICAgIGlmICggcmV0dXJuZWQgJiYgalF1ZXJ5LmlzRnVuY3Rpb24oIHJldHVybmVkLnByb21pc2UgKSApIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybmVkLnByb21pc2UoKVxuICAgICAgICAgICAgICAgICAgICAuZG9uZSggbmV3RGVmZXIucmVzb2x2ZSApXG4gICAgICAgICAgICAgICAgICAgIC5mYWlsKCBuZXdEZWZlci5yZWplY3QgKVxuICAgICAgICAgICAgICAgICAgICAucHJvZ3Jlc3MoIG5ld0RlZmVyLm5vdGlmeSApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBuZXdEZWZlclsgYWN0aW9uICsgXCJXaXRoXCIgXSggdGhpcyA9PT0gcHJvbWlzZSA/IG5ld0RlZmVyLnByb21pc2UoKSA6IHRoaXMsIGZuID8gWyByZXR1cm5lZCBdIDogYXJndW1lbnRzICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZm5zID0gbnVsbDtcbiAgICAgICAgICB9KS5wcm9taXNlKCk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIEdldCBhIHByb21pc2UgZm9yIHRoaXMgZGVmZXJyZWRcbiAgICAgICAgLy8gSWYgb2JqIGlzIHByb3ZpZGVkLCB0aGUgcHJvbWlzZSBhc3BlY3QgaXMgYWRkZWQgdG8gdGhlIG9iamVjdFxuICAgICAgICBwcm9taXNlOiBmdW5jdGlvbiggb2JqICkge1xuICAgICAgICAgIHJldHVybiBvYmogIT0gbnVsbCA/IGpRdWVyeS5leHRlbmQoIG9iaiwgcHJvbWlzZSApIDogcHJvbWlzZTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGRlZmVycmVkID0ge307XG5cbiAgICAvLyBLZWVwIHBpcGUgZm9yIGJhY2stY29tcGF0XG4gICAgcHJvbWlzZS5waXBlID0gcHJvbWlzZS50aGVuO1xuXG4gICAgLy8gQWRkIGxpc3Qtc3BlY2lmaWMgbWV0aG9kc1xuICAgIGpRdWVyeS5lYWNoKCB0dXBsZXMsIGZ1bmN0aW9uKCBpLCB0dXBsZSApIHtcbiAgICAgIHZhciBsaXN0ID0gdHVwbGVbIDIgXSxcbiAgICAgICAgc3RhdGVTdHJpbmcgPSB0dXBsZVsgMyBdO1xuXG4gICAgICAvLyBwcm9taXNlWyBkb25lIHwgZmFpbCB8IHByb2dyZXNzIF0gPSBsaXN0LmFkZFxuICAgICAgcHJvbWlzZVsgdHVwbGVbMV0gXSA9IGxpc3QuYWRkO1xuXG4gICAgICAvLyBIYW5kbGUgc3RhdGVcbiAgICAgIGlmICggc3RhdGVTdHJpbmcgKSB7XG4gICAgICAgIGxpc3QuYWRkKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIC8vIHN0YXRlID0gWyByZXNvbHZlZCB8IHJlamVjdGVkIF1cbiAgICAgICAgICBzdGF0ZSA9IHN0YXRlU3RyaW5nO1xuXG4gICAgICAgIC8vIFsgcmVqZWN0X2xpc3QgfCByZXNvbHZlX2xpc3QgXS5kaXNhYmxlOyBwcm9ncmVzc19saXN0LmxvY2tcbiAgICAgICAgfSwgdHVwbGVzWyBpIF4gMSBdWyAyIF0uZGlzYWJsZSwgdHVwbGVzWyAyIF1bIDIgXS5sb2NrICk7XG4gICAgICB9XG5cbiAgICAgIC8vIGRlZmVycmVkWyByZXNvbHZlIHwgcmVqZWN0IHwgbm90aWZ5IF1cbiAgICAgIGRlZmVycmVkWyB0dXBsZVswXSBdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGRlZmVycmVkWyB0dXBsZVswXSArIFwiV2l0aFwiIF0oIHRoaXMgPT09IGRlZmVycmVkID8gcHJvbWlzZSA6IHRoaXMsIGFyZ3VtZW50cyApO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH07XG4gICAgICBkZWZlcnJlZFsgdHVwbGVbMF0gKyBcIldpdGhcIiBdID0gbGlzdC5maXJlV2l0aDtcbiAgICB9KTtcblxuICAgIC8vIE1ha2UgdGhlIGRlZmVycmVkIGEgcHJvbWlzZVxuICAgIHByb21pc2UucHJvbWlzZSggZGVmZXJyZWQgKTtcblxuICAgIC8vIENhbGwgZ2l2ZW4gZnVuYyBpZiBhbnlcbiAgICBpZiAoIGZ1bmMgKSB7XG4gICAgICBmdW5jLmNhbGwoIGRlZmVycmVkLCBkZWZlcnJlZCApO1xuICAgIH1cblxuICAgIC8vIEFsbCBkb25lIVxuICAgIHJldHVybiBkZWZlcnJlZDtcbiAgfSxcblxuICAvLyBEZWZlcnJlZCBoZWxwZXJcbiAgd2hlbjogZnVuY3Rpb24oIHN1Ym9yZGluYXRlIC8qICwgLi4uLCBzdWJvcmRpbmF0ZU4gKi8gKSB7XG4gICAgdmFyIGkgPSAwLFxuICAgICAgcmVzb2x2ZVZhbHVlcyA9IGNvcmVfc2xpY2UuY2FsbCggYXJndW1lbnRzICksXG4gICAgICBsZW5ndGggPSByZXNvbHZlVmFsdWVzLmxlbmd0aCxcblxuICAgICAgLy8gdGhlIGNvdW50IG9mIHVuY29tcGxldGVkIHN1Ym9yZGluYXRlc1xuICAgICAgcmVtYWluaW5nID0gbGVuZ3RoICE9PSAxIHx8ICggc3Vib3JkaW5hdGUgJiYgalF1ZXJ5LmlzRnVuY3Rpb24oIHN1Ym9yZGluYXRlLnByb21pc2UgKSApID8gbGVuZ3RoIDogMCxcblxuICAgICAgLy8gdGhlIG1hc3RlciBEZWZlcnJlZC4gSWYgcmVzb2x2ZVZhbHVlcyBjb25zaXN0IG9mIG9ubHkgYSBzaW5nbGUgRGVmZXJyZWQsIGp1c3QgdXNlIHRoYXQuXG4gICAgICBkZWZlcnJlZCA9IHJlbWFpbmluZyA9PT0gMSA/IHN1Ym9yZGluYXRlIDogalF1ZXJ5LkRlZmVycmVkKCksXG5cbiAgICAgIC8vIFVwZGF0ZSBmdW5jdGlvbiBmb3IgYm90aCByZXNvbHZlIGFuZCBwcm9ncmVzcyB2YWx1ZXNcbiAgICAgIHVwZGF0ZUZ1bmMgPSBmdW5jdGlvbiggaSwgY29udGV4dHMsIHZhbHVlcyApIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCB2YWx1ZSApIHtcbiAgICAgICAgICBjb250ZXh0c1sgaSBdID0gdGhpcztcbiAgICAgICAgICB2YWx1ZXNbIGkgXSA9IGFyZ3VtZW50cy5sZW5ndGggPiAxID8gY29yZV9zbGljZS5jYWxsKCBhcmd1bWVudHMgKSA6IHZhbHVlO1xuICAgICAgICAgIGlmKCB2YWx1ZXMgPT09IHByb2dyZXNzVmFsdWVzICkge1xuICAgICAgICAgICAgZGVmZXJyZWQubm90aWZ5V2l0aCggY29udGV4dHMsIHZhbHVlcyApO1xuICAgICAgICAgIH0gZWxzZSBpZiAoICEoIC0tcmVtYWluaW5nICkgKSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlV2l0aCggY29udGV4dHMsIHZhbHVlcyApO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0sXG5cbiAgICAgIHByb2dyZXNzVmFsdWVzLCBwcm9ncmVzc0NvbnRleHRzLCByZXNvbHZlQ29udGV4dHM7XG5cbiAgICAvLyBhZGQgbGlzdGVuZXJzIHRvIERlZmVycmVkIHN1Ym9yZGluYXRlczsgdHJlYXQgb3RoZXJzIGFzIHJlc29sdmVkXG4gICAgaWYgKCBsZW5ndGggPiAxICkge1xuICAgICAgcHJvZ3Jlc3NWYWx1ZXMgPSBuZXcgQXJyYXkoIGxlbmd0aCApO1xuICAgICAgcHJvZ3Jlc3NDb250ZXh0cyA9IG5ldyBBcnJheSggbGVuZ3RoICk7XG4gICAgICByZXNvbHZlQ29udGV4dHMgPSBuZXcgQXJyYXkoIGxlbmd0aCApO1xuICAgICAgZm9yICggOyBpIDwgbGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIGlmICggcmVzb2x2ZVZhbHVlc1sgaSBdICYmIGpRdWVyeS5pc0Z1bmN0aW9uKCByZXNvbHZlVmFsdWVzWyBpIF0ucHJvbWlzZSApICkge1xuICAgICAgICAgIHJlc29sdmVWYWx1ZXNbIGkgXS5wcm9taXNlKClcbiAgICAgICAgICAgIC5kb25lKCB1cGRhdGVGdW5jKCBpLCByZXNvbHZlQ29udGV4dHMsIHJlc29sdmVWYWx1ZXMgKSApXG4gICAgICAgICAgICAuZmFpbCggZGVmZXJyZWQucmVqZWN0IClcbiAgICAgICAgICAgIC5wcm9ncmVzcyggdXBkYXRlRnVuYyggaSwgcHJvZ3Jlc3NDb250ZXh0cywgcHJvZ3Jlc3NWYWx1ZXMgKSApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC0tcmVtYWluaW5nO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gaWYgd2UncmUgbm90IHdhaXRpbmcgb24gYW55dGhpbmcsIHJlc29sdmUgdGhlIG1hc3RlclxuICAgIGlmICggIXJlbWFpbmluZyApIHtcbiAgICAgIGRlZmVycmVkLnJlc29sdmVXaXRoKCByZXNvbHZlQ29udGV4dHMsIHJlc29sdmVWYWx1ZXMgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZSgpO1xuICB9XG59KTtcbmpRdWVyeS5zdXBwb3J0ID0gKGZ1bmN0aW9uKCBzdXBwb3J0ICkge1xuXG4gIHZhciBhbGwsIGEsIGlucHV0LCBzZWxlY3QsIGZyYWdtZW50LCBvcHQsIGV2ZW50TmFtZSwgaXNTdXBwb3J0ZWQsIGksXG4gICAgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcblxuICAvLyBTZXR1cFxuICBkaXYuc2V0QXR0cmlidXRlKCBcImNsYXNzTmFtZVwiLCBcInRcIiApO1xuICBkaXYuaW5uZXJIVE1MID0gXCIgIDxsaW5rLz48dGFibGU+PC90YWJsZT48YSBocmVmPScvYSc+YTwvYT48aW5wdXQgdHlwZT0nY2hlY2tib3gnLz5cIjtcblxuICAvLyBGaW5pc2ggZWFybHkgaW4gbGltaXRlZCAobm9uLWJyb3dzZXIpIGVudmlyb25tZW50c1xuICBhbGwgPSBkaXYuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCIqXCIpIHx8IFtdO1xuICBhID0gZGl2LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiYVwiKVsgMCBdO1xuICBpZiAoICFhIHx8ICFhLnN0eWxlIHx8ICFhbGwubGVuZ3RoICkge1xuICAgIHJldHVybiBzdXBwb3J0O1xuICB9XG5cbiAgLy8gRmlyc3QgYmF0Y2ggb2YgdGVzdHNcbiAgc2VsZWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNlbGVjdFwiKTtcbiAgb3B0ID0gc2VsZWN0LmFwcGVuZENoaWxkKCBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib3B0aW9uXCIpICk7XG4gIGlucHV0ID0gZGl2LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaW5wdXRcIilbIDAgXTtcblxuICBhLnN0eWxlLmNzc1RleHQgPSBcInRvcDoxcHg7ZmxvYXQ6bGVmdDtvcGFjaXR5Oi41XCI7XG5cbiAgLy8gVGVzdCBzZXRBdHRyaWJ1dGUgb24gY2FtZWxDYXNlIGNsYXNzLiBJZiBpdCB3b3Jrcywgd2UgbmVlZCBhdHRyRml4ZXMgd2hlbiBkb2luZyBnZXQvc2V0QXR0cmlidXRlIChpZTYvNylcbiAgc3VwcG9ydC5nZXRTZXRBdHRyaWJ1dGUgPSBkaXYuY2xhc3NOYW1lICE9PSBcInRcIjtcblxuICAvLyBJRSBzdHJpcHMgbGVhZGluZyB3aGl0ZXNwYWNlIHdoZW4gLmlubmVySFRNTCBpcyB1c2VkXG4gIHN1cHBvcnQubGVhZGluZ1doaXRlc3BhY2UgPSBkaXYuZmlyc3RDaGlsZC5ub2RlVHlwZSA9PT0gMztcblxuICAvLyBNYWtlIHN1cmUgdGhhdCB0Ym9keSBlbGVtZW50cyBhcmVuJ3QgYXV0b21hdGljYWxseSBpbnNlcnRlZFxuICAvLyBJRSB3aWxsIGluc2VydCB0aGVtIGludG8gZW1wdHkgdGFibGVzXG4gIHN1cHBvcnQudGJvZHkgPSAhZGl2LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwidGJvZHlcIikubGVuZ3RoO1xuXG4gIC8vIE1ha2Ugc3VyZSB0aGF0IGxpbmsgZWxlbWVudHMgZ2V0IHNlcmlhbGl6ZWQgY29ycmVjdGx5IGJ5IGlubmVySFRNTFxuICAvLyBUaGlzIHJlcXVpcmVzIGEgd3JhcHBlciBlbGVtZW50IGluIElFXG4gIHN1cHBvcnQuaHRtbFNlcmlhbGl6ZSA9ICEhZGl2LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwibGlua1wiKS5sZW5ndGg7XG5cbiAgLy8gR2V0IHRoZSBzdHlsZSBpbmZvcm1hdGlvbiBmcm9tIGdldEF0dHJpYnV0ZVxuICAvLyAoSUUgdXNlcyAuY3NzVGV4dCBpbnN0ZWFkKVxuICBzdXBwb3J0LnN0eWxlID0gL3RvcC8udGVzdCggYS5nZXRBdHRyaWJ1dGUoXCJzdHlsZVwiKSApO1xuXG4gIC8vIE1ha2Ugc3VyZSB0aGF0IFVSTHMgYXJlbid0IG1hbmlwdWxhdGVkXG4gIC8vIChJRSBub3JtYWxpemVzIGl0IGJ5IGRlZmF1bHQpXG4gIHN1cHBvcnQuaHJlZk5vcm1hbGl6ZWQgPSBhLmdldEF0dHJpYnV0ZShcImhyZWZcIikgPT09IFwiL2FcIjtcblxuICAvLyBNYWtlIHN1cmUgdGhhdCBlbGVtZW50IG9wYWNpdHkgZXhpc3RzXG4gIC8vIChJRSB1c2VzIGZpbHRlciBpbnN0ZWFkKVxuICAvLyBVc2UgYSByZWdleCB0byB3b3JrIGFyb3VuZCBhIFdlYktpdCBpc3N1ZS4gU2VlICM1MTQ1XG4gIHN1cHBvcnQub3BhY2l0eSA9IC9eMC41Ly50ZXN0KCBhLnN0eWxlLm9wYWNpdHkgKTtcblxuICAvLyBWZXJpZnkgc3R5bGUgZmxvYXQgZXhpc3RlbmNlXG4gIC8vIChJRSB1c2VzIHN0eWxlRmxvYXQgaW5zdGVhZCBvZiBjc3NGbG9hdClcbiAgc3VwcG9ydC5jc3NGbG9hdCA9ICEhYS5zdHlsZS5jc3NGbG9hdDtcblxuICAvLyBDaGVjayB0aGUgZGVmYXVsdCBjaGVja2JveC9yYWRpbyB2YWx1ZSAoXCJcIiBvbiBXZWJLaXQ7IFwib25cIiBlbHNld2hlcmUpXG4gIHN1cHBvcnQuY2hlY2tPbiA9ICEhaW5wdXQudmFsdWU7XG5cbiAgLy8gTWFrZSBzdXJlIHRoYXQgYSBzZWxlY3RlZC1ieS1kZWZhdWx0IG9wdGlvbiBoYXMgYSB3b3JraW5nIHNlbGVjdGVkIHByb3BlcnR5LlxuICAvLyAoV2ViS2l0IGRlZmF1bHRzIHRvIGZhbHNlIGluc3RlYWQgb2YgdHJ1ZSwgSUUgdG9vLCBpZiBpdCdzIGluIGFuIG9wdGdyb3VwKVxuICBzdXBwb3J0Lm9wdFNlbGVjdGVkID0gb3B0LnNlbGVjdGVkO1xuXG4gIC8vIFRlc3RzIGZvciBlbmN0eXBlIHN1cHBvcnQgb24gYSBmb3JtICgjNjc0MylcbiAgc3VwcG9ydC5lbmN0eXBlID0gISFkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZm9ybVwiKS5lbmN0eXBlO1xuXG4gIC8vIE1ha2VzIHN1cmUgY2xvbmluZyBhbiBodG1sNSBlbGVtZW50IGRvZXMgbm90IGNhdXNlIHByb2JsZW1zXG4gIC8vIFdoZXJlIG91dGVySFRNTCBpcyB1bmRlZmluZWQsIHRoaXMgc3RpbGwgd29ya3NcbiAgc3VwcG9ydC5odG1sNUNsb25lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIm5hdlwiKS5jbG9uZU5vZGUoIHRydWUgKS5vdXRlckhUTUwgIT09IFwiPDpuYXY+PC86bmF2PlwiO1xuXG4gIC8vIFdpbGwgYmUgZGVmaW5lZCBsYXRlclxuICBzdXBwb3J0LmlubGluZUJsb2NrTmVlZHNMYXlvdXQgPSBmYWxzZTtcbiAgc3VwcG9ydC5zaHJpbmtXcmFwQmxvY2tzID0gZmFsc2U7XG4gIHN1cHBvcnQucGl4ZWxQb3NpdGlvbiA9IGZhbHNlO1xuICBzdXBwb3J0LmRlbGV0ZUV4cGFuZG8gPSB0cnVlO1xuICBzdXBwb3J0Lm5vQ2xvbmVFdmVudCA9IHRydWU7XG4gIHN1cHBvcnQucmVsaWFibGVNYXJnaW5SaWdodCA9IHRydWU7XG4gIHN1cHBvcnQuYm94U2l6aW5nUmVsaWFibGUgPSB0cnVlO1xuXG4gIC8vIE1ha2Ugc3VyZSBjaGVja2VkIHN0YXR1cyBpcyBwcm9wZXJseSBjbG9uZWRcbiAgaW5wdXQuY2hlY2tlZCA9IHRydWU7XG4gIHN1cHBvcnQubm9DbG9uZUNoZWNrZWQgPSBpbnB1dC5jbG9uZU5vZGUoIHRydWUgKS5jaGVja2VkO1xuXG4gIC8vIE1ha2Ugc3VyZSB0aGF0IHRoZSBvcHRpb25zIGluc2lkZSBkaXNhYmxlZCBzZWxlY3RzIGFyZW4ndCBtYXJrZWQgYXMgZGlzYWJsZWRcbiAgLy8gKFdlYktpdCBtYXJrcyB0aGVtIGFzIGRpc2FibGVkKVxuICBzZWxlY3QuZGlzYWJsZWQgPSB0cnVlO1xuICBzdXBwb3J0Lm9wdERpc2FibGVkID0gIW9wdC5kaXNhYmxlZDtcblxuICAvLyBTdXBwb3J0OiBJRTw5XG4gIHRyeSB7XG4gICAgZGVsZXRlIGRpdi50ZXN0O1xuICB9IGNhdGNoKCBlICkge1xuICAgIHN1cHBvcnQuZGVsZXRlRXhwYW5kbyA9IGZhbHNlO1xuICB9XG5cbiAgLy8gQ2hlY2sgaWYgd2UgY2FuIHRydXN0IGdldEF0dHJpYnV0ZShcInZhbHVlXCIpXG4gIGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xuICBpbnB1dC5zZXRBdHRyaWJ1dGUoIFwidmFsdWVcIiwgXCJcIiApO1xuICBzdXBwb3J0LmlucHV0ID0gaW5wdXQuZ2V0QXR0cmlidXRlKCBcInZhbHVlXCIgKSA9PT0gXCJcIjtcblxuICAvLyBDaGVjayBpZiBhbiBpbnB1dCBtYWludGFpbnMgaXRzIHZhbHVlIGFmdGVyIGJlY29taW5nIGEgcmFkaW9cbiAgaW5wdXQudmFsdWUgPSBcInRcIjtcbiAgaW5wdXQuc2V0QXR0cmlidXRlKCBcInR5cGVcIiwgXCJyYWRpb1wiICk7XG4gIHN1cHBvcnQucmFkaW9WYWx1ZSA9IGlucHV0LnZhbHVlID09PSBcInRcIjtcblxuICAvLyAjMTEyMTcgLSBXZWJLaXQgbG9zZXMgY2hlY2sgd2hlbiB0aGUgbmFtZSBpcyBhZnRlciB0aGUgY2hlY2tlZCBhdHRyaWJ1dGVcbiAgaW5wdXQuc2V0QXR0cmlidXRlKCBcImNoZWNrZWRcIiwgXCJ0XCIgKTtcbiAgaW5wdXQuc2V0QXR0cmlidXRlKCBcIm5hbWVcIiwgXCJ0XCIgKTtcblxuICBmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoIGlucHV0ICk7XG5cbiAgLy8gQ2hlY2sgaWYgYSBkaXNjb25uZWN0ZWQgY2hlY2tib3ggd2lsbCByZXRhaW4gaXRzIGNoZWNrZWRcbiAgLy8gdmFsdWUgb2YgdHJ1ZSBhZnRlciBhcHBlbmRlZCB0byB0aGUgRE9NIChJRTYvNylcbiAgc3VwcG9ydC5hcHBlbmRDaGVja2VkID0gaW5wdXQuY2hlY2tlZDtcblxuICAvLyBXZWJLaXQgZG9lc24ndCBjbG9uZSBjaGVja2VkIHN0YXRlIGNvcnJlY3RseSBpbiBmcmFnbWVudHNcbiAgc3VwcG9ydC5jaGVja0Nsb25lID0gZnJhZ21lbnQuY2xvbmVOb2RlKCB0cnVlICkuY2xvbmVOb2RlKCB0cnVlICkubGFzdENoaWxkLmNoZWNrZWQ7XG5cbiAgLy8gU3VwcG9ydDogSUU8OVxuICAvLyBPcGVyYSBkb2VzIG5vdCBjbG9uZSBldmVudHMgKGFuZCB0eXBlb2YgZGl2LmF0dGFjaEV2ZW50ID09PSB1bmRlZmluZWQpLlxuICAvLyBJRTktMTAgY2xvbmVzIGV2ZW50cyBib3VuZCB2aWEgYXR0YWNoRXZlbnQsIGJ1dCB0aGV5IGRvbid0IHRyaWdnZXIgd2l0aCAuY2xpY2soKVxuICBpZiAoIGRpdi5hdHRhY2hFdmVudCApIHtcbiAgICBkaXYuYXR0YWNoRXZlbnQoIFwib25jbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgIHN1cHBvcnQubm9DbG9uZUV2ZW50ID0gZmFsc2U7XG4gICAgfSk7XG5cbiAgICBkaXYuY2xvbmVOb2RlKCB0cnVlICkuY2xpY2soKTtcbiAgfVxuXG4gIC8vIFN1cHBvcnQ6IElFPDkgKGxhY2sgc3VibWl0L2NoYW5nZSBidWJibGUpLCBGaXJlZm94IDE3KyAobGFjayBmb2N1c2luIGV2ZW50KVxuICAvLyBCZXdhcmUgb2YgQ1NQIHJlc3RyaWN0aW9ucyAoaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4vU2VjdXJpdHkvQ1NQKVxuICBmb3IgKCBpIGluIHsgc3VibWl0OiB0cnVlLCBjaGFuZ2U6IHRydWUsIGZvY3VzaW46IHRydWUgfSkge1xuICAgIGRpdi5zZXRBdHRyaWJ1dGUoIGV2ZW50TmFtZSA9IFwib25cIiArIGksIFwidFwiICk7XG5cbiAgICBzdXBwb3J0WyBpICsgXCJCdWJibGVzXCIgXSA9IGV2ZW50TmFtZSBpbiB3aW5kb3cgfHwgZGl2LmF0dHJpYnV0ZXNbIGV2ZW50TmFtZSBdLmV4cGFuZG8gPT09IGZhbHNlO1xuICB9XG5cbiAgZGl2LnN0eWxlLmJhY2tncm91bmRDbGlwID0gXCJjb250ZW50LWJveFwiO1xuICBkaXYuY2xvbmVOb2RlKCB0cnVlICkuc3R5bGUuYmFja2dyb3VuZENsaXAgPSBcIlwiO1xuICBzdXBwb3J0LmNsZWFyQ2xvbmVTdHlsZSA9IGRpdi5zdHlsZS5iYWNrZ3JvdW5kQ2xpcCA9PT0gXCJjb250ZW50LWJveFwiO1xuXG4gIC8vIFN1cHBvcnQ6IElFPDlcbiAgLy8gSXRlcmF0aW9uIG92ZXIgb2JqZWN0J3MgaW5oZXJpdGVkIHByb3BlcnRpZXMgYmVmb3JlIGl0cyBvd24uXG4gIGZvciAoIGkgaW4galF1ZXJ5KCBzdXBwb3J0ICkgKSB7XG4gICAgYnJlYWs7XG4gIH1cbiAgc3VwcG9ydC5vd25MYXN0ID0gaSAhPT0gXCIwXCI7XG5cbiAgLy8gUnVuIHRlc3RzIHRoYXQgbmVlZCBhIGJvZHkgYXQgZG9jIHJlYWR5XG4gIGpRdWVyeShmdW5jdGlvbigpIHtcbiAgICB2YXIgY29udGFpbmVyLCBtYXJnaW5EaXYsIHRkcyxcbiAgICAgIGRpdlJlc2V0ID0gXCJwYWRkaW5nOjA7bWFyZ2luOjA7Ym9yZGVyOjA7ZGlzcGxheTpibG9jaztib3gtc2l6aW5nOmNvbnRlbnQtYm94Oy1tb3otYm94LXNpemluZzpjb250ZW50LWJveDstd2Via2l0LWJveC1zaXppbmc6Y29udGVudC1ib3g7XCIsXG4gICAgICBib2R5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJib2R5XCIpWzBdO1xuXG4gICAgaWYgKCAhYm9keSApIHtcbiAgICAgIC8vIFJldHVybiBmb3IgZnJhbWVzZXQgZG9jcyB0aGF0IGRvbid0IGhhdmUgYSBib2R5XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBjb250YWluZXIuc3R5bGUuY3NzVGV4dCA9IFwiYm9yZGVyOjA7d2lkdGg6MDtoZWlnaHQ6MDtwb3NpdGlvbjphYnNvbHV0ZTt0b3A6MDtsZWZ0Oi05OTk5cHg7bWFyZ2luLXRvcDoxcHhcIjtcblxuICAgIGJvZHkuYXBwZW5kQ2hpbGQoIGNvbnRhaW5lciApLmFwcGVuZENoaWxkKCBkaXYgKTtcblxuICAgIC8vIFN1cHBvcnQ6IElFOFxuICAgIC8vIENoZWNrIGlmIHRhYmxlIGNlbGxzIHN0aWxsIGhhdmUgb2Zmc2V0V2lkdGgvSGVpZ2h0IHdoZW4gdGhleSBhcmUgc2V0XG4gICAgLy8gdG8gZGlzcGxheTpub25lIGFuZCB0aGVyZSBhcmUgc3RpbGwgb3RoZXIgdmlzaWJsZSB0YWJsZSBjZWxscyBpbiBhXG4gICAgLy8gdGFibGUgcm93OyBpZiBzbywgb2Zmc2V0V2lkdGgvSGVpZ2h0IGFyZSBub3QgcmVsaWFibGUgZm9yIHVzZSB3aGVuXG4gICAgLy8gZGV0ZXJtaW5pbmcgaWYgYW4gZWxlbWVudCBoYXMgYmVlbiBoaWRkZW4gZGlyZWN0bHkgdXNpbmdcbiAgICAvLyBkaXNwbGF5Om5vbmUgKGl0IGlzIHN0aWxsIHNhZmUgdG8gdXNlIG9mZnNldHMgaWYgYSBwYXJlbnQgZWxlbWVudCBpc1xuICAgIC8vIGhpZGRlbjsgZG9uIHNhZmV0eSBnb2dnbGVzIGFuZCBzZWUgYnVnICM0NTEyIGZvciBtb3JlIGluZm9ybWF0aW9uKS5cbiAgICBkaXYuaW5uZXJIVE1MID0gXCI8dGFibGU+PHRyPjx0ZD48L3RkPjx0ZD50PC90ZD48L3RyPjwvdGFibGU+XCI7XG4gICAgdGRzID0gZGl2LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwidGRcIik7XG4gICAgdGRzWyAwIF0uc3R5bGUuY3NzVGV4dCA9IFwicGFkZGluZzowO21hcmdpbjowO2JvcmRlcjowO2Rpc3BsYXk6bm9uZVwiO1xuICAgIGlzU3VwcG9ydGVkID0gKCB0ZHNbIDAgXS5vZmZzZXRIZWlnaHQgPT09IDAgKTtcblxuICAgIHRkc1sgMCBdLnN0eWxlLmRpc3BsYXkgPSBcIlwiO1xuICAgIHRkc1sgMSBdLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcblxuICAgIC8vIFN1cHBvcnQ6IElFOFxuICAgIC8vIENoZWNrIGlmIGVtcHR5IHRhYmxlIGNlbGxzIHN0aWxsIGhhdmUgb2Zmc2V0V2lkdGgvSGVpZ2h0XG4gICAgc3VwcG9ydC5yZWxpYWJsZUhpZGRlbk9mZnNldHMgPSBpc1N1cHBvcnRlZCAmJiAoIHRkc1sgMCBdLm9mZnNldEhlaWdodCA9PT0gMCApO1xuXG4gICAgLy8gQ2hlY2sgYm94LXNpemluZyBhbmQgbWFyZ2luIGJlaGF2aW9yLlxuICAgIGRpdi5pbm5lckhUTUwgPSBcIlwiO1xuICAgIGRpdi5zdHlsZS5jc3NUZXh0ID0gXCJib3gtc2l6aW5nOmJvcmRlci1ib3g7LW1vei1ib3gtc2l6aW5nOmJvcmRlci1ib3g7LXdlYmtpdC1ib3gtc2l6aW5nOmJvcmRlci1ib3g7cGFkZGluZzoxcHg7Ym9yZGVyOjFweDtkaXNwbGF5OmJsb2NrO3dpZHRoOjRweDttYXJnaW4tdG9wOjElO3Bvc2l0aW9uOmFic29sdXRlO3RvcDoxJTtcIjtcblxuICAgIC8vIFdvcmthcm91bmQgZmFpbGluZyBib3hTaXppbmcgdGVzdCBkdWUgdG8gb2Zmc2V0V2lkdGggcmV0dXJuaW5nIHdyb25nIHZhbHVlXG4gICAgLy8gd2l0aCBzb21lIG5vbi0xIHZhbHVlcyBvZiBib2R5IHpvb20sIHRpY2tldCAjMTM1NDNcbiAgICBqUXVlcnkuc3dhcCggYm9keSwgYm9keS5zdHlsZS56b29tICE9IG51bGwgPyB7IHpvb206IDEgfSA6IHt9LCBmdW5jdGlvbigpIHtcbiAgICAgIHN1cHBvcnQuYm94U2l6aW5nID0gZGl2Lm9mZnNldFdpZHRoID09PSA0O1xuICAgIH0pO1xuXG4gICAgLy8gVXNlIHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlIGJlY2F1c2UganNkb20gb24gbm9kZS5qcyB3aWxsIGJyZWFrIHdpdGhvdXQgaXQuXG4gICAgaWYgKCB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSApIHtcbiAgICAgIHN1cHBvcnQucGl4ZWxQb3NpdGlvbiA9ICggd2luZG93LmdldENvbXB1dGVkU3R5bGUoIGRpdiwgbnVsbCApIHx8IHt9ICkudG9wICE9PSBcIjElXCI7XG4gICAgICBzdXBwb3J0LmJveFNpemluZ1JlbGlhYmxlID0gKCB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSggZGl2LCBudWxsICkgfHwgeyB3aWR0aDogXCI0cHhcIiB9ICkud2lkdGggPT09IFwiNHB4XCI7XG5cbiAgICAgIC8vIENoZWNrIGlmIGRpdiB3aXRoIGV4cGxpY2l0IHdpZHRoIGFuZCBubyBtYXJnaW4tcmlnaHQgaW5jb3JyZWN0bHlcbiAgICAgIC8vIGdldHMgY29tcHV0ZWQgbWFyZ2luLXJpZ2h0IGJhc2VkIG9uIHdpZHRoIG9mIGNvbnRhaW5lci4gKCMzMzMzKVxuICAgICAgLy8gRmFpbHMgaW4gV2ViS2l0IGJlZm9yZSBGZWIgMjAxMSBuaWdodGxpZXNcbiAgICAgIC8vIFdlYktpdCBCdWcgMTMzNDMgLSBnZXRDb21wdXRlZFN0eWxlIHJldHVybnMgd3JvbmcgdmFsdWUgZm9yIG1hcmdpbi1yaWdodFxuICAgICAgbWFyZ2luRGl2ID0gZGl2LmFwcGVuZENoaWxkKCBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpICk7XG4gICAgICBtYXJnaW5EaXYuc3R5bGUuY3NzVGV4dCA9IGRpdi5zdHlsZS5jc3NUZXh0ID0gZGl2UmVzZXQ7XG4gICAgICBtYXJnaW5EaXYuc3R5bGUubWFyZ2luUmlnaHQgPSBtYXJnaW5EaXYuc3R5bGUud2lkdGggPSBcIjBcIjtcbiAgICAgIGRpdi5zdHlsZS53aWR0aCA9IFwiMXB4XCI7XG5cbiAgICAgIHN1cHBvcnQucmVsaWFibGVNYXJnaW5SaWdodCA9XG4gICAgICAgICFwYXJzZUZsb2F0KCAoIHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKCBtYXJnaW5EaXYsIG51bGwgKSB8fCB7fSApLm1hcmdpblJpZ2h0ICk7XG4gICAgfVxuXG4gICAgaWYgKCB0eXBlb2YgZGl2LnN0eWxlLnpvb20gIT09IGNvcmVfc3RydW5kZWZpbmVkICkge1xuICAgICAgLy8gU3VwcG9ydDogSUU8OFxuICAgICAgLy8gQ2hlY2sgaWYgbmF0aXZlbHkgYmxvY2stbGV2ZWwgZWxlbWVudHMgYWN0IGxpa2UgaW5saW5lLWJsb2NrXG4gICAgICAvLyBlbGVtZW50cyB3aGVuIHNldHRpbmcgdGhlaXIgZGlzcGxheSB0byAnaW5saW5lJyBhbmQgZ2l2aW5nXG4gICAgICAvLyB0aGVtIGxheW91dFxuICAgICAgZGl2LmlubmVySFRNTCA9IFwiXCI7XG4gICAgICBkaXYuc3R5bGUuY3NzVGV4dCA9IGRpdlJlc2V0ICsgXCJ3aWR0aDoxcHg7cGFkZGluZzoxcHg7ZGlzcGxheTppbmxpbmU7em9vbToxXCI7XG4gICAgICBzdXBwb3J0LmlubGluZUJsb2NrTmVlZHNMYXlvdXQgPSAoIGRpdi5vZmZzZXRXaWR0aCA9PT0gMyApO1xuXG4gICAgICAvLyBTdXBwb3J0OiBJRTZcbiAgICAgIC8vIENoZWNrIGlmIGVsZW1lbnRzIHdpdGggbGF5b3V0IHNocmluay13cmFwIHRoZWlyIGNoaWxkcmVuXG4gICAgICBkaXYuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICAgIGRpdi5pbm5lckhUTUwgPSBcIjxkaXY+PC9kaXY+XCI7XG4gICAgICBkaXYuZmlyc3RDaGlsZC5zdHlsZS53aWR0aCA9IFwiNXB4XCI7XG4gICAgICBzdXBwb3J0LnNocmlua1dyYXBCbG9ja3MgPSAoIGRpdi5vZmZzZXRXaWR0aCAhPT0gMyApO1xuXG4gICAgICBpZiAoIHN1cHBvcnQuaW5saW5lQmxvY2tOZWVkc0xheW91dCApIHtcbiAgICAgICAgLy8gUHJldmVudCBJRSA2IGZyb20gYWZmZWN0aW5nIGxheW91dCBmb3IgcG9zaXRpb25lZCBlbGVtZW50cyAjMTEwNDhcbiAgICAgICAgLy8gUHJldmVudCBJRSBmcm9tIHNocmlua2luZyB0aGUgYm9keSBpbiBJRSA3IG1vZGUgIzEyODY5XG4gICAgICAgIC8vIFN1cHBvcnQ6IElFPDhcbiAgICAgICAgYm9keS5zdHlsZS56b29tID0gMTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBib2R5LnJlbW92ZUNoaWxkKCBjb250YWluZXIgKTtcblxuICAgIC8vIE51bGwgZWxlbWVudHMgdG8gYXZvaWQgbGVha3MgaW4gSUVcbiAgICBjb250YWluZXIgPSBkaXYgPSB0ZHMgPSBtYXJnaW5EaXYgPSBudWxsO1xuICB9KTtcblxuICAvLyBOdWxsIGVsZW1lbnRzIHRvIGF2b2lkIGxlYWtzIGluIElFXG4gIGFsbCA9IHNlbGVjdCA9IGZyYWdtZW50ID0gb3B0ID0gYSA9IGlucHV0ID0gbnVsbDtcblxuICByZXR1cm4gc3VwcG9ydDtcbn0pKHt9KTtcblxudmFyIHJicmFjZSA9IC8oPzpcXHtbXFxzXFxTXSpcXH18XFxbW1xcc1xcU10qXFxdKSQvLFxuICBybXVsdGlEYXNoID0gLyhbQS1aXSkvZztcblxuZnVuY3Rpb24gaW50ZXJuYWxEYXRhKCBlbGVtLCBuYW1lLCBkYXRhLCBwdnQgLyogSW50ZXJuYWwgVXNlIE9ubHkgKi8gKXtcbiAgaWYgKCAhalF1ZXJ5LmFjY2VwdERhdGEoIGVsZW0gKSApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgcmV0LCB0aGlzQ2FjaGUsXG4gICAgaW50ZXJuYWxLZXkgPSBqUXVlcnkuZXhwYW5kbyxcblxuICAgIC8vIFdlIGhhdmUgdG8gaGFuZGxlIERPTSBub2RlcyBhbmQgSlMgb2JqZWN0cyBkaWZmZXJlbnRseSBiZWNhdXNlIElFNi03XG4gICAgLy8gY2FuJ3QgR0Mgb2JqZWN0IHJlZmVyZW5jZXMgcHJvcGVybHkgYWNyb3NzIHRoZSBET00tSlMgYm91bmRhcnlcbiAgICBpc05vZGUgPSBlbGVtLm5vZGVUeXBlLFxuXG4gICAgLy8gT25seSBET00gbm9kZXMgbmVlZCB0aGUgZ2xvYmFsIGpRdWVyeSBjYWNoZTsgSlMgb2JqZWN0IGRhdGEgaXNcbiAgICAvLyBhdHRhY2hlZCBkaXJlY3RseSB0byB0aGUgb2JqZWN0IHNvIEdDIGNhbiBvY2N1ciBhdXRvbWF0aWNhbGx5XG4gICAgY2FjaGUgPSBpc05vZGUgPyBqUXVlcnkuY2FjaGUgOiBlbGVtLFxuXG4gICAgLy8gT25seSBkZWZpbmluZyBhbiBJRCBmb3IgSlMgb2JqZWN0cyBpZiBpdHMgY2FjaGUgYWxyZWFkeSBleGlzdHMgYWxsb3dzXG4gICAgLy8gdGhlIGNvZGUgdG8gc2hvcnRjdXQgb24gdGhlIHNhbWUgcGF0aCBhcyBhIERPTSBub2RlIHdpdGggbm8gY2FjaGVcbiAgICBpZCA9IGlzTm9kZSA/IGVsZW1bIGludGVybmFsS2V5IF0gOiBlbGVtWyBpbnRlcm5hbEtleSBdICYmIGludGVybmFsS2V5O1xuXG4gIC8vIEF2b2lkIGRvaW5nIGFueSBtb3JlIHdvcmsgdGhhbiB3ZSBuZWVkIHRvIHdoZW4gdHJ5aW5nIHRvIGdldCBkYXRhIG9uIGFuXG4gIC8vIG9iamVjdCB0aGF0IGhhcyBubyBkYXRhIGF0IGFsbFxuICBpZiAoICghaWQgfHwgIWNhY2hlW2lkXSB8fCAoIXB2dCAmJiAhY2FjaGVbaWRdLmRhdGEpKSAmJiBkYXRhID09PSB1bmRlZmluZWQgJiYgdHlwZW9mIG5hbWUgPT09IFwic3RyaW5nXCIgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKCAhaWQgKSB7XG4gICAgLy8gT25seSBET00gbm9kZXMgbmVlZCBhIG5ldyB1bmlxdWUgSUQgZm9yIGVhY2ggZWxlbWVudCBzaW5jZSB0aGVpciBkYXRhXG4gICAgLy8gZW5kcyB1cCBpbiB0aGUgZ2xvYmFsIGNhY2hlXG4gICAgaWYgKCBpc05vZGUgKSB7XG4gICAgICBpZCA9IGVsZW1bIGludGVybmFsS2V5IF0gPSBjb3JlX2RlbGV0ZWRJZHMucG9wKCkgfHwgalF1ZXJ5Lmd1aWQrKztcbiAgICB9IGVsc2Uge1xuICAgICAgaWQgPSBpbnRlcm5hbEtleTtcbiAgICB9XG4gIH1cblxuICBpZiAoICFjYWNoZVsgaWQgXSApIHtcbiAgICAvLyBBdm9pZCBleHBvc2luZyBqUXVlcnkgbWV0YWRhdGEgb24gcGxhaW4gSlMgb2JqZWN0cyB3aGVuIHRoZSBvYmplY3RcbiAgICAvLyBpcyBzZXJpYWxpemVkIHVzaW5nIEpTT04uc3RyaW5naWZ5XG4gICAgY2FjaGVbIGlkIF0gPSBpc05vZGUgPyB7fSA6IHsgdG9KU09OOiBqUXVlcnkubm9vcCB9O1xuICB9XG5cbiAgLy8gQW4gb2JqZWN0IGNhbiBiZSBwYXNzZWQgdG8galF1ZXJ5LmRhdGEgaW5zdGVhZCBvZiBhIGtleS92YWx1ZSBwYWlyOyB0aGlzIGdldHNcbiAgLy8gc2hhbGxvdyBjb3BpZWQgb3ZlciBvbnRvIHRoZSBleGlzdGluZyBjYWNoZVxuICBpZiAoIHR5cGVvZiBuYW1lID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBuYW1lID09PSBcImZ1bmN0aW9uXCIgKSB7XG4gICAgaWYgKCBwdnQgKSB7XG4gICAgICBjYWNoZVsgaWQgXSA9IGpRdWVyeS5leHRlbmQoIGNhY2hlWyBpZCBdLCBuYW1lICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNhY2hlWyBpZCBdLmRhdGEgPSBqUXVlcnkuZXh0ZW5kKCBjYWNoZVsgaWQgXS5kYXRhLCBuYW1lICk7XG4gICAgfVxuICB9XG5cbiAgdGhpc0NhY2hlID0gY2FjaGVbIGlkIF07XG5cbiAgLy8galF1ZXJ5IGRhdGEoKSBpcyBzdG9yZWQgaW4gYSBzZXBhcmF0ZSBvYmplY3QgaW5zaWRlIHRoZSBvYmplY3QncyBpbnRlcm5hbCBkYXRhXG4gIC8vIGNhY2hlIGluIG9yZGVyIHRvIGF2b2lkIGtleSBjb2xsaXNpb25zIGJldHdlZW4gaW50ZXJuYWwgZGF0YSBhbmQgdXNlci1kZWZpbmVkXG4gIC8vIGRhdGEuXG4gIGlmICggIXB2dCApIHtcbiAgICBpZiAoICF0aGlzQ2FjaGUuZGF0YSApIHtcbiAgICAgIHRoaXNDYWNoZS5kYXRhID0ge307XG4gICAgfVxuXG4gICAgdGhpc0NhY2hlID0gdGhpc0NhY2hlLmRhdGE7XG4gIH1cblxuICBpZiAoIGRhdGEgIT09IHVuZGVmaW5lZCApIHtcbiAgICB0aGlzQ2FjaGVbIGpRdWVyeS5jYW1lbENhc2UoIG5hbWUgKSBdID0gZGF0YTtcbiAgfVxuXG4gIC8vIENoZWNrIGZvciBib3RoIGNvbnZlcnRlZC10by1jYW1lbCBhbmQgbm9uLWNvbnZlcnRlZCBkYXRhIHByb3BlcnR5IG5hbWVzXG4gIC8vIElmIGEgZGF0YSBwcm9wZXJ0eSB3YXMgc3BlY2lmaWVkXG4gIGlmICggdHlwZW9mIG5hbWUgPT09IFwic3RyaW5nXCIgKSB7XG5cbiAgICAvLyBGaXJzdCBUcnkgdG8gZmluZCBhcy1pcyBwcm9wZXJ0eSBkYXRhXG4gICAgcmV0ID0gdGhpc0NhY2hlWyBuYW1lIF07XG5cbiAgICAvLyBUZXN0IGZvciBudWxsfHVuZGVmaW5lZCBwcm9wZXJ0eSBkYXRhXG4gICAgaWYgKCByZXQgPT0gbnVsbCApIHtcblxuICAgICAgLy8gVHJ5IHRvIGZpbmQgdGhlIGNhbWVsQ2FzZWQgcHJvcGVydHlcbiAgICAgIHJldCA9IHRoaXNDYWNoZVsgalF1ZXJ5LmNhbWVsQ2FzZSggbmFtZSApIF07XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJldCA9IHRoaXNDYWNoZTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59XG5cbmZ1bmN0aW9uIGludGVybmFsUmVtb3ZlRGF0YSggZWxlbSwgbmFtZSwgcHZ0ICkge1xuICBpZiAoICFqUXVlcnkuYWNjZXB0RGF0YSggZWxlbSApICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciB0aGlzQ2FjaGUsIGksXG4gICAgaXNOb2RlID0gZWxlbS5ub2RlVHlwZSxcblxuICAgIC8vIFNlZSBqUXVlcnkuZGF0YSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgIGNhY2hlID0gaXNOb2RlID8galF1ZXJ5LmNhY2hlIDogZWxlbSxcbiAgICBpZCA9IGlzTm9kZSA/IGVsZW1bIGpRdWVyeS5leHBhbmRvIF0gOiBqUXVlcnkuZXhwYW5kbztcblxuICAvLyBJZiB0aGVyZSBpcyBhbHJlYWR5IG5vIGNhY2hlIGVudHJ5IGZvciB0aGlzIG9iamVjdCwgdGhlcmUgaXMgbm9cbiAgLy8gcHVycG9zZSBpbiBjb250aW51aW5nXG4gIGlmICggIWNhY2hlWyBpZCBdICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmICggbmFtZSApIHtcblxuICAgIHRoaXNDYWNoZSA9IHB2dCA/IGNhY2hlWyBpZCBdIDogY2FjaGVbIGlkIF0uZGF0YTtcblxuICAgIGlmICggdGhpc0NhY2hlICkge1xuXG4gICAgICAvLyBTdXBwb3J0IGFycmF5IG9yIHNwYWNlIHNlcGFyYXRlZCBzdHJpbmcgbmFtZXMgZm9yIGRhdGEga2V5c1xuICAgICAgaWYgKCAhalF1ZXJ5LmlzQXJyYXkoIG5hbWUgKSApIHtcblxuICAgICAgICAvLyB0cnkgdGhlIHN0cmluZyBhcyBhIGtleSBiZWZvcmUgYW55IG1hbmlwdWxhdGlvblxuICAgICAgICBpZiAoIG5hbWUgaW4gdGhpc0NhY2hlICkge1xuICAgICAgICAgIG5hbWUgPSBbIG5hbWUgXTtcbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgIC8vIHNwbGl0IHRoZSBjYW1lbCBjYXNlZCB2ZXJzaW9uIGJ5IHNwYWNlcyB1bmxlc3MgYSBrZXkgd2l0aCB0aGUgc3BhY2VzIGV4aXN0c1xuICAgICAgICAgIG5hbWUgPSBqUXVlcnkuY2FtZWxDYXNlKCBuYW1lICk7XG4gICAgICAgICAgaWYgKCBuYW1lIGluIHRoaXNDYWNoZSApIHtcbiAgICAgICAgICAgIG5hbWUgPSBbIG5hbWUgXTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmFtZSA9IG5hbWUuc3BsaXQoXCIgXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gSWYgXCJuYW1lXCIgaXMgYW4gYXJyYXkgb2Yga2V5cy4uLlxuICAgICAgICAvLyBXaGVuIGRhdGEgaXMgaW5pdGlhbGx5IGNyZWF0ZWQsIHZpYSAoXCJrZXlcIiwgXCJ2YWxcIikgc2lnbmF0dXJlLFxuICAgICAgICAvLyBrZXlzIHdpbGwgYmUgY29udmVydGVkIHRvIGNhbWVsQ2FzZS5cbiAgICAgICAgLy8gU2luY2UgdGhlcmUgaXMgbm8gd2F5IHRvIHRlbGwgX2hvd18gYSBrZXkgd2FzIGFkZGVkLCByZW1vdmVcbiAgICAgICAgLy8gYm90aCBwbGFpbiBrZXkgYW5kIGNhbWVsQ2FzZSBrZXkuICMxMjc4NlxuICAgICAgICAvLyBUaGlzIHdpbGwgb25seSBwZW5hbGl6ZSB0aGUgYXJyYXkgYXJndW1lbnQgcGF0aC5cbiAgICAgICAgbmFtZSA9IG5hbWUuY29uY2F0KCBqUXVlcnkubWFwKCBuYW1lLCBqUXVlcnkuY2FtZWxDYXNlICkgKTtcbiAgICAgIH1cblxuICAgICAgaSA9IG5hbWUubGVuZ3RoO1xuICAgICAgd2hpbGUgKCBpLS0gKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzQ2FjaGVbIG5hbWVbaV0gXTtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgdGhlcmUgaXMgbm8gZGF0YSBsZWZ0IGluIHRoZSBjYWNoZSwgd2Ugd2FudCB0byBjb250aW51ZVxuICAgICAgLy8gYW5kIGxldCB0aGUgY2FjaGUgb2JqZWN0IGl0c2VsZiBnZXQgZGVzdHJveWVkXG4gICAgICBpZiAoIHB2dCA/ICFpc0VtcHR5RGF0YU9iamVjdCh0aGlzQ2FjaGUpIDogIWpRdWVyeS5pc0VtcHR5T2JqZWN0KHRoaXNDYWNoZSkgKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBTZWUgalF1ZXJ5LmRhdGEgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgaWYgKCAhcHZ0ICkge1xuICAgIGRlbGV0ZSBjYWNoZVsgaWQgXS5kYXRhO1xuXG4gICAgLy8gRG9uJ3QgZGVzdHJveSB0aGUgcGFyZW50IGNhY2hlIHVubGVzcyB0aGUgaW50ZXJuYWwgZGF0YSBvYmplY3RcbiAgICAvLyBoYWQgYmVlbiB0aGUgb25seSB0aGluZyBsZWZ0IGluIGl0XG4gICAgaWYgKCAhaXNFbXB0eURhdGFPYmplY3QoIGNhY2hlWyBpZCBdICkgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG5cbiAgLy8gRGVzdHJveSB0aGUgY2FjaGVcbiAgaWYgKCBpc05vZGUgKSB7XG4gICAgalF1ZXJ5LmNsZWFuRGF0YSggWyBlbGVtIF0sIHRydWUgKTtcblxuICAvLyBVc2UgZGVsZXRlIHdoZW4gc3VwcG9ydGVkIGZvciBleHBhbmRvcyBvciBgY2FjaGVgIGlzIG5vdCBhIHdpbmRvdyBwZXIgaXNXaW5kb3cgKCMxMDA4MClcbiAgLyoganNoaW50IGVxZXFlcTogZmFsc2UgKi9cbiAgfSBlbHNlIGlmICggalF1ZXJ5LnN1cHBvcnQuZGVsZXRlRXhwYW5kbyB8fCBjYWNoZSAhPSBjYWNoZS53aW5kb3cgKSB7XG4gICAgLyoganNoaW50IGVxZXFlcTogdHJ1ZSAqL1xuICAgIGRlbGV0ZSBjYWNoZVsgaWQgXTtcblxuICAvLyBXaGVuIGFsbCBlbHNlIGZhaWxzLCBudWxsXG4gIH0gZWxzZSB7XG4gICAgY2FjaGVbIGlkIF0gPSBudWxsO1xuICB9XG59XG5cbmpRdWVyeS5leHRlbmQoe1xuICBjYWNoZToge30sXG5cbiAgLy8gVGhlIGZvbGxvd2luZyBlbGVtZW50cyB0aHJvdyB1bmNhdGNoYWJsZSBleGNlcHRpb25zIGlmIHlvdVxuICAvLyBhdHRlbXB0IHRvIGFkZCBleHBhbmRvIHByb3BlcnRpZXMgdG8gdGhlbS5cbiAgbm9EYXRhOiB7XG4gICAgXCJhcHBsZXRcIjogdHJ1ZSxcbiAgICBcImVtYmVkXCI6IHRydWUsXG4gICAgLy8gQmFuIGFsbCBvYmplY3RzIGV4Y2VwdCBmb3IgRmxhc2ggKHdoaWNoIGhhbmRsZSBleHBhbmRvcylcbiAgICBcIm9iamVjdFwiOiBcImNsc2lkOkQyN0NEQjZFLUFFNkQtMTFjZi05NkI4LTQ0NDU1MzU0MDAwMFwiXG4gIH0sXG5cbiAgaGFzRGF0YTogZnVuY3Rpb24oIGVsZW0gKSB7XG4gICAgZWxlbSA9IGVsZW0ubm9kZVR5cGUgPyBqUXVlcnkuY2FjaGVbIGVsZW1balF1ZXJ5LmV4cGFuZG9dIF0gOiBlbGVtWyBqUXVlcnkuZXhwYW5kbyBdO1xuICAgIHJldHVybiAhIWVsZW0gJiYgIWlzRW1wdHlEYXRhT2JqZWN0KCBlbGVtICk7XG4gIH0sXG5cbiAgZGF0YTogZnVuY3Rpb24oIGVsZW0sIG5hbWUsIGRhdGEgKSB7XG4gICAgcmV0dXJuIGludGVybmFsRGF0YSggZWxlbSwgbmFtZSwgZGF0YSApO1xuICB9LFxuXG4gIHJlbW92ZURhdGE6IGZ1bmN0aW9uKCBlbGVtLCBuYW1lICkge1xuICAgIHJldHVybiBpbnRlcm5hbFJlbW92ZURhdGEoIGVsZW0sIG5hbWUgKTtcbiAgfSxcblxuICAvLyBGb3IgaW50ZXJuYWwgdXNlIG9ubHkuXG4gIF9kYXRhOiBmdW5jdGlvbiggZWxlbSwgbmFtZSwgZGF0YSApIHtcbiAgICByZXR1cm4gaW50ZXJuYWxEYXRhKCBlbGVtLCBuYW1lLCBkYXRhLCB0cnVlICk7XG4gIH0sXG5cbiAgX3JlbW92ZURhdGE6IGZ1bmN0aW9uKCBlbGVtLCBuYW1lICkge1xuICAgIHJldHVybiBpbnRlcm5hbFJlbW92ZURhdGEoIGVsZW0sIG5hbWUsIHRydWUgKTtcbiAgfSxcblxuICAvLyBBIG1ldGhvZCBmb3IgZGV0ZXJtaW5pbmcgaWYgYSBET00gbm9kZSBjYW4gaGFuZGxlIHRoZSBkYXRhIGV4cGFuZG9cbiAgYWNjZXB0RGF0YTogZnVuY3Rpb24oIGVsZW0gKSB7XG4gICAgLy8gRG8gbm90IHNldCBkYXRhIG9uIG5vbi1lbGVtZW50IGJlY2F1c2UgaXQgd2lsbCBub3QgYmUgY2xlYXJlZCAoIzgzMzUpLlxuICAgIGlmICggZWxlbS5ub2RlVHlwZSAmJiBlbGVtLm5vZGVUeXBlICE9PSAxICYmIGVsZW0ubm9kZVR5cGUgIT09IDkgKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIG5vRGF0YSA9IGVsZW0ubm9kZU5hbWUgJiYgalF1ZXJ5Lm5vRGF0YVsgZWxlbS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpIF07XG5cbiAgICAvLyBub2RlcyBhY2NlcHQgZGF0YSB1bmxlc3Mgb3RoZXJ3aXNlIHNwZWNpZmllZDsgcmVqZWN0aW9uIGNhbiBiZSBjb25kaXRpb25hbFxuICAgIHJldHVybiAhbm9EYXRhIHx8IG5vRGF0YSAhPT0gdHJ1ZSAmJiBlbGVtLmdldEF0dHJpYnV0ZShcImNsYXNzaWRcIikgPT09IG5vRGF0YTtcbiAgfVxufSk7XG5cbmpRdWVyeS5mbi5leHRlbmQoe1xuICBkYXRhOiBmdW5jdGlvbigga2V5LCB2YWx1ZSApIHtcbiAgICB2YXIgYXR0cnMsIG5hbWUsXG4gICAgICBkYXRhID0gbnVsbCxcbiAgICAgIGkgPSAwLFxuICAgICAgZWxlbSA9IHRoaXNbMF07XG5cbiAgICAvLyBTcGVjaWFsIGV4cGVjdGlvbnMgb2YgLmRhdGEgYmFzaWNhbGx5IHRod2FydCBqUXVlcnkuYWNjZXNzLFxuICAgIC8vIHNvIGltcGxlbWVudCB0aGUgcmVsZXZhbnQgYmVoYXZpb3Igb3Vyc2VsdmVzXG5cbiAgICAvLyBHZXRzIGFsbCB2YWx1ZXNcbiAgICBpZiAoIGtleSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgaWYgKCB0aGlzLmxlbmd0aCApIHtcbiAgICAgICAgZGF0YSA9IGpRdWVyeS5kYXRhKCBlbGVtICk7XG5cbiAgICAgICAgaWYgKCBlbGVtLm5vZGVUeXBlID09PSAxICYmICFqUXVlcnkuX2RhdGEoIGVsZW0sIFwicGFyc2VkQXR0cnNcIiApICkge1xuICAgICAgICAgIGF0dHJzID0gZWxlbS5hdHRyaWJ1dGVzO1xuICAgICAgICAgIGZvciAoIDsgaSA8IGF0dHJzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgbmFtZSA9IGF0dHJzW2ldLm5hbWU7XG5cbiAgICAgICAgICAgIGlmICggbmFtZS5pbmRleE9mKFwiZGF0YS1cIikgPT09IDAgKSB7XG4gICAgICAgICAgICAgIG5hbWUgPSBqUXVlcnkuY2FtZWxDYXNlKCBuYW1lLnNsaWNlKDUpICk7XG5cbiAgICAgICAgICAgICAgZGF0YUF0dHIoIGVsZW0sIG5hbWUsIGRhdGFbIG5hbWUgXSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBqUXVlcnkuX2RhdGEoIGVsZW0sIFwicGFyc2VkQXR0cnNcIiwgdHJ1ZSApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cblxuICAgIC8vIFNldHMgbXVsdGlwbGUgdmFsdWVzXG4gICAgaWYgKCB0eXBlb2Yga2V5ID09PSBcIm9iamVjdFwiICkge1xuICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgalF1ZXJ5LmRhdGEoIHRoaXMsIGtleSApO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPiAxID9cblxuICAgICAgLy8gU2V0cyBvbmUgdmFsdWVcbiAgICAgIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgalF1ZXJ5LmRhdGEoIHRoaXMsIGtleSwgdmFsdWUgKTtcbiAgICAgIH0pIDpcblxuICAgICAgLy8gR2V0cyBvbmUgdmFsdWVcbiAgICAgIC8vIFRyeSB0byBmZXRjaCBhbnkgaW50ZXJuYWxseSBzdG9yZWQgZGF0YSBmaXJzdFxuICAgICAgZWxlbSA/IGRhdGFBdHRyKCBlbGVtLCBrZXksIGpRdWVyeS5kYXRhKCBlbGVtLCBrZXkgKSApIDogbnVsbDtcbiAgfSxcblxuICByZW1vdmVEYXRhOiBmdW5jdGlvbigga2V5ICkge1xuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICBqUXVlcnkucmVtb3ZlRGF0YSggdGhpcywga2V5ICk7XG4gICAgfSk7XG4gIH1cbn0pO1xuXG5mdW5jdGlvbiBkYXRhQXR0ciggZWxlbSwga2V5LCBkYXRhICkge1xuICAvLyBJZiBub3RoaW5nIHdhcyBmb3VuZCBpbnRlcm5hbGx5LCB0cnkgdG8gZmV0Y2ggYW55XG4gIC8vIGRhdGEgZnJvbSB0aGUgSFRNTDUgZGF0YS0qIGF0dHJpYnV0ZVxuICBpZiAoIGRhdGEgPT09IHVuZGVmaW5lZCAmJiBlbGVtLm5vZGVUeXBlID09PSAxICkge1xuXG4gICAgdmFyIG5hbWUgPSBcImRhdGEtXCIgKyBrZXkucmVwbGFjZSggcm11bHRpRGFzaCwgXCItJDFcIiApLnRvTG93ZXJDYXNlKCk7XG5cbiAgICBkYXRhID0gZWxlbS5nZXRBdHRyaWJ1dGUoIG5hbWUgKTtcblxuICAgIGlmICggdHlwZW9mIGRhdGEgPT09IFwic3RyaW5nXCIgKSB7XG4gICAgICB0cnkge1xuICAgICAgICBkYXRhID0gZGF0YSA9PT0gXCJ0cnVlXCIgPyB0cnVlIDpcbiAgICAgICAgICBkYXRhID09PSBcImZhbHNlXCIgPyBmYWxzZSA6XG4gICAgICAgICAgZGF0YSA9PT0gXCJudWxsXCIgPyBudWxsIDpcbiAgICAgICAgICAvLyBPbmx5IGNvbnZlcnQgdG8gYSBudW1iZXIgaWYgaXQgZG9lc24ndCBjaGFuZ2UgdGhlIHN0cmluZ1xuICAgICAgICAgICtkYXRhICsgXCJcIiA9PT0gZGF0YSA/ICtkYXRhIDpcbiAgICAgICAgICByYnJhY2UudGVzdCggZGF0YSApID8galF1ZXJ5LnBhcnNlSlNPTiggZGF0YSApIDpcbiAgICAgICAgICAgIGRhdGE7XG4gICAgICB9IGNhdGNoKCBlICkge31cblxuICAgICAgLy8gTWFrZSBzdXJlIHdlIHNldCB0aGUgZGF0YSBzbyBpdCBpc24ndCBjaGFuZ2VkIGxhdGVyXG4gICAgICBqUXVlcnkuZGF0YSggZWxlbSwga2V5LCBkYXRhICk7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgZGF0YSA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZGF0YTtcbn1cblxuLy8gY2hlY2tzIGEgY2FjaGUgb2JqZWN0IGZvciBlbXB0aW5lc3NcbmZ1bmN0aW9uIGlzRW1wdHlEYXRhT2JqZWN0KCBvYmogKSB7XG4gIHZhciBuYW1lO1xuICBmb3IgKCBuYW1lIGluIG9iaiApIHtcblxuICAgIC8vIGlmIHRoZSBwdWJsaWMgZGF0YSBvYmplY3QgaXMgZW1wdHksIHRoZSBwcml2YXRlIGlzIHN0aWxsIGVtcHR5XG4gICAgaWYgKCBuYW1lID09PSBcImRhdGFcIiAmJiBqUXVlcnkuaXNFbXB0eU9iamVjdCggb2JqW25hbWVdICkgKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKCBuYW1lICE9PSBcInRvSlNPTlwiICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxualF1ZXJ5LmV4dGVuZCh7XG4gIHF1ZXVlOiBmdW5jdGlvbiggZWxlbSwgdHlwZSwgZGF0YSApIHtcbiAgICB2YXIgcXVldWU7XG5cbiAgICBpZiAoIGVsZW0gKSB7XG4gICAgICB0eXBlID0gKCB0eXBlIHx8IFwiZnhcIiApICsgXCJxdWV1ZVwiO1xuICAgICAgcXVldWUgPSBqUXVlcnkuX2RhdGEoIGVsZW0sIHR5cGUgKTtcblxuICAgICAgLy8gU3BlZWQgdXAgZGVxdWV1ZSBieSBnZXR0aW5nIG91dCBxdWlja2x5IGlmIHRoaXMgaXMganVzdCBhIGxvb2t1cFxuICAgICAgaWYgKCBkYXRhICkge1xuICAgICAgICBpZiAoICFxdWV1ZSB8fCBqUXVlcnkuaXNBcnJheShkYXRhKSApIHtcbiAgICAgICAgICBxdWV1ZSA9IGpRdWVyeS5fZGF0YSggZWxlbSwgdHlwZSwgalF1ZXJ5Lm1ha2VBcnJheShkYXRhKSApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHF1ZXVlLnB1c2goIGRhdGEgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHF1ZXVlIHx8IFtdO1xuICAgIH1cbiAgfSxcblxuICBkZXF1ZXVlOiBmdW5jdGlvbiggZWxlbSwgdHlwZSApIHtcbiAgICB0eXBlID0gdHlwZSB8fCBcImZ4XCI7XG5cbiAgICB2YXIgcXVldWUgPSBqUXVlcnkucXVldWUoIGVsZW0sIHR5cGUgKSxcbiAgICAgIHN0YXJ0TGVuZ3RoID0gcXVldWUubGVuZ3RoLFxuICAgICAgZm4gPSBxdWV1ZS5zaGlmdCgpLFxuICAgICAgaG9va3MgPSBqUXVlcnkuX3F1ZXVlSG9va3MoIGVsZW0sIHR5cGUgKSxcbiAgICAgIG5leHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgalF1ZXJ5LmRlcXVldWUoIGVsZW0sIHR5cGUgKTtcbiAgICAgIH07XG5cbiAgICAvLyBJZiB0aGUgZnggcXVldWUgaXMgZGVxdWV1ZWQsIGFsd2F5cyByZW1vdmUgdGhlIHByb2dyZXNzIHNlbnRpbmVsXG4gICAgaWYgKCBmbiA9PT0gXCJpbnByb2dyZXNzXCIgKSB7XG4gICAgICBmbiA9IHF1ZXVlLnNoaWZ0KCk7XG4gICAgICBzdGFydExlbmd0aC0tO1xuICAgIH1cblxuICAgIGlmICggZm4gKSB7XG5cbiAgICAgIC8vIEFkZCBhIHByb2dyZXNzIHNlbnRpbmVsIHRvIHByZXZlbnQgdGhlIGZ4IHF1ZXVlIGZyb20gYmVpbmdcbiAgICAgIC8vIGF1dG9tYXRpY2FsbHkgZGVxdWV1ZWRcbiAgICAgIGlmICggdHlwZSA9PT0gXCJmeFwiICkge1xuICAgICAgICBxdWV1ZS51bnNoaWZ0KCBcImlucHJvZ3Jlc3NcIiApO1xuICAgICAgfVxuXG4gICAgICAvLyBjbGVhciB1cCB0aGUgbGFzdCBxdWV1ZSBzdG9wIGZ1bmN0aW9uXG4gICAgICBkZWxldGUgaG9va3Muc3RvcDtcbiAgICAgIGZuLmNhbGwoIGVsZW0sIG5leHQsIGhvb2tzICk7XG4gICAgfVxuXG4gICAgaWYgKCAhc3RhcnRMZW5ndGggJiYgaG9va3MgKSB7XG4gICAgICBob29rcy5lbXB0eS5maXJlKCk7XG4gICAgfVxuICB9LFxuXG4gIC8vIG5vdCBpbnRlbmRlZCBmb3IgcHVibGljIGNvbnN1bXB0aW9uIC0gZ2VuZXJhdGVzIGEgcXVldWVIb29rcyBvYmplY3QsIG9yIHJldHVybnMgdGhlIGN1cnJlbnQgb25lXG4gIF9xdWV1ZUhvb2tzOiBmdW5jdGlvbiggZWxlbSwgdHlwZSApIHtcbiAgICB2YXIga2V5ID0gdHlwZSArIFwicXVldWVIb29rc1wiO1xuICAgIHJldHVybiBqUXVlcnkuX2RhdGEoIGVsZW0sIGtleSApIHx8IGpRdWVyeS5fZGF0YSggZWxlbSwga2V5LCB7XG4gICAgICBlbXB0eTogalF1ZXJ5LkNhbGxiYWNrcyhcIm9uY2UgbWVtb3J5XCIpLmFkZChmdW5jdGlvbigpIHtcbiAgICAgICAgalF1ZXJ5Ll9yZW1vdmVEYXRhKCBlbGVtLCB0eXBlICsgXCJxdWV1ZVwiICk7XG4gICAgICAgIGpRdWVyeS5fcmVtb3ZlRGF0YSggZWxlbSwga2V5ICk7XG4gICAgICB9KVxuICAgIH0pO1xuICB9XG59KTtcblxualF1ZXJ5LmZuLmV4dGVuZCh7XG4gIHF1ZXVlOiBmdW5jdGlvbiggdHlwZSwgZGF0YSApIHtcbiAgICB2YXIgc2V0dGVyID0gMjtcblxuICAgIGlmICggdHlwZW9mIHR5cGUgIT09IFwic3RyaW5nXCIgKSB7XG4gICAgICBkYXRhID0gdHlwZTtcbiAgICAgIHR5cGUgPSBcImZ4XCI7XG4gICAgICBzZXR0ZXItLTtcbiAgICB9XG5cbiAgICBpZiAoIGFyZ3VtZW50cy5sZW5ndGggPCBzZXR0ZXIgKSB7XG4gICAgICByZXR1cm4galF1ZXJ5LnF1ZXVlKCB0aGlzWzBdLCB0eXBlICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGEgPT09IHVuZGVmaW5lZCA/XG4gICAgICB0aGlzIDpcbiAgICAgIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHF1ZXVlID0galF1ZXJ5LnF1ZXVlKCB0aGlzLCB0eXBlLCBkYXRhICk7XG5cbiAgICAgICAgLy8gZW5zdXJlIGEgaG9va3MgZm9yIHRoaXMgcXVldWVcbiAgICAgICAgalF1ZXJ5Ll9xdWV1ZUhvb2tzKCB0aGlzLCB0eXBlICk7XG5cbiAgICAgICAgaWYgKCB0eXBlID09PSBcImZ4XCIgJiYgcXVldWVbMF0gIT09IFwiaW5wcm9ncmVzc1wiICkge1xuICAgICAgICAgIGpRdWVyeS5kZXF1ZXVlKCB0aGlzLCB0eXBlICk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9LFxuICBkZXF1ZXVlOiBmdW5jdGlvbiggdHlwZSApIHtcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgalF1ZXJ5LmRlcXVldWUoIHRoaXMsIHR5cGUgKTtcbiAgICB9KTtcbiAgfSxcbiAgLy8gQmFzZWQgb2ZmIG9mIHRoZSBwbHVnaW4gYnkgQ2xpbnQgSGVsZmVycywgd2l0aCBwZXJtaXNzaW9uLlxuICAvLyBodHRwOi8vYmxpbmRzaWduYWxzLmNvbS9pbmRleC5waHAvMjAwOS8wNy9qcXVlcnktZGVsYXkvXG4gIGRlbGF5OiBmdW5jdGlvbiggdGltZSwgdHlwZSApIHtcbiAgICB0aW1lID0galF1ZXJ5LmZ4ID8galF1ZXJ5LmZ4LnNwZWVkc1sgdGltZSBdIHx8IHRpbWUgOiB0aW1lO1xuICAgIHR5cGUgPSB0eXBlIHx8IFwiZnhcIjtcblxuICAgIHJldHVybiB0aGlzLnF1ZXVlKCB0eXBlLCBmdW5jdGlvbiggbmV4dCwgaG9va3MgKSB7XG4gICAgICB2YXIgdGltZW91dCA9IHNldFRpbWVvdXQoIG5leHQsIHRpbWUgKTtcbiAgICAgIGhvb2tzLnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KCB0aW1lb3V0ICk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9LFxuICBjbGVhclF1ZXVlOiBmdW5jdGlvbiggdHlwZSApIHtcbiAgICByZXR1cm4gdGhpcy5xdWV1ZSggdHlwZSB8fCBcImZ4XCIsIFtdICk7XG4gIH0sXG4gIC8vIEdldCBhIHByb21pc2UgcmVzb2x2ZWQgd2hlbiBxdWV1ZXMgb2YgYSBjZXJ0YWluIHR5cGVcbiAgLy8gYXJlIGVtcHRpZWQgKGZ4IGlzIHRoZSB0eXBlIGJ5IGRlZmF1bHQpXG4gIHByb21pc2U6IGZ1bmN0aW9uKCB0eXBlLCBvYmogKSB7XG4gICAgdmFyIHRtcCxcbiAgICAgIGNvdW50ID0gMSxcbiAgICAgIGRlZmVyID0galF1ZXJ5LkRlZmVycmVkKCksXG4gICAgICBlbGVtZW50cyA9IHRoaXMsXG4gICAgICBpID0gdGhpcy5sZW5ndGgsXG4gICAgICByZXNvbHZlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICggISggLS1jb3VudCApICkge1xuICAgICAgICAgIGRlZmVyLnJlc29sdmVXaXRoKCBlbGVtZW50cywgWyBlbGVtZW50cyBdICk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICBpZiAoIHR5cGVvZiB0eXBlICE9PSBcInN0cmluZ1wiICkge1xuICAgICAgb2JqID0gdHlwZTtcbiAgICAgIHR5cGUgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHR5cGUgPSB0eXBlIHx8IFwiZnhcIjtcblxuICAgIHdoaWxlKCBpLS0gKSB7XG4gICAgICB0bXAgPSBqUXVlcnkuX2RhdGEoIGVsZW1lbnRzWyBpIF0sIHR5cGUgKyBcInF1ZXVlSG9va3NcIiApO1xuICAgICAgaWYgKCB0bXAgJiYgdG1wLmVtcHR5ICkge1xuICAgICAgICBjb3VudCsrO1xuICAgICAgICB0bXAuZW1wdHkuYWRkKCByZXNvbHZlICk7XG4gICAgICB9XG4gICAgfVxuICAgIHJlc29sdmUoKTtcbiAgICByZXR1cm4gZGVmZXIucHJvbWlzZSggb2JqICk7XG4gIH1cbn0pO1xudmFyIG5vZGVIb29rLCBib29sSG9vayxcbiAgcmNsYXNzID0gL1tcXHRcXHJcXG5cXGZdL2csXG4gIHJyZXR1cm4gPSAvXFxyL2csXG4gIHJmb2N1c2FibGUgPSAvXig/OmlucHV0fHNlbGVjdHx0ZXh0YXJlYXxidXR0b258b2JqZWN0KSQvaSxcbiAgcmNsaWNrYWJsZSA9IC9eKD86YXxhcmVhKSQvaSxcbiAgcnVzZURlZmF1bHQgPSAvXig/OmNoZWNrZWR8c2VsZWN0ZWQpJC9pLFxuICBnZXRTZXRBdHRyaWJ1dGUgPSBqUXVlcnkuc3VwcG9ydC5nZXRTZXRBdHRyaWJ1dGUsXG4gIGdldFNldElucHV0ID0galF1ZXJ5LnN1cHBvcnQuaW5wdXQ7XG5cbmpRdWVyeS5mbi5leHRlbmQoe1xuICBhdHRyOiBmdW5jdGlvbiggbmFtZSwgdmFsdWUgKSB7XG4gICAgcmV0dXJuIGpRdWVyeS5hY2Nlc3MoIHRoaXMsIGpRdWVyeS5hdHRyLCBuYW1lLCB2YWx1ZSwgYXJndW1lbnRzLmxlbmd0aCA+IDEgKTtcbiAgfSxcblxuICByZW1vdmVBdHRyOiBmdW5jdGlvbiggbmFtZSApIHtcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgalF1ZXJ5LnJlbW92ZUF0dHIoIHRoaXMsIG5hbWUgKTtcbiAgICB9KTtcbiAgfSxcblxuICBwcm9wOiBmdW5jdGlvbiggbmFtZSwgdmFsdWUgKSB7XG4gICAgcmV0dXJuIGpRdWVyeS5hY2Nlc3MoIHRoaXMsIGpRdWVyeS5wcm9wLCBuYW1lLCB2YWx1ZSwgYXJndW1lbnRzLmxlbmd0aCA+IDEgKTtcbiAgfSxcblxuICByZW1vdmVQcm9wOiBmdW5jdGlvbiggbmFtZSApIHtcbiAgICBuYW1lID0galF1ZXJ5LnByb3BGaXhbIG5hbWUgXSB8fCBuYW1lO1xuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAvLyB0cnkvY2F0Y2ggaGFuZGxlcyBjYXNlcyB3aGVyZSBJRSBiYWxrcyAoc3VjaCBhcyByZW1vdmluZyBhIHByb3BlcnR5IG9uIHdpbmRvdylcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoaXNbIG5hbWUgXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgZGVsZXRlIHRoaXNbIG5hbWUgXTtcbiAgICAgIH0gY2F0Y2goIGUgKSB7fVxuICAgIH0pO1xuICB9LFxuXG4gIGFkZENsYXNzOiBmdW5jdGlvbiggdmFsdWUgKSB7XG4gICAgdmFyIGNsYXNzZXMsIGVsZW0sIGN1ciwgY2xhenosIGosXG4gICAgICBpID0gMCxcbiAgICAgIGxlbiA9IHRoaXMubGVuZ3RoLFxuICAgICAgcHJvY2VlZCA9IHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIiAmJiB2YWx1ZTtcblxuICAgIGlmICggalF1ZXJ5LmlzRnVuY3Rpb24oIHZhbHVlICkgKSB7XG4gICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCBqICkge1xuICAgICAgICBqUXVlcnkoIHRoaXMgKS5hZGRDbGFzcyggdmFsdWUuY2FsbCggdGhpcywgaiwgdGhpcy5jbGFzc05hbWUgKSApO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKCBwcm9jZWVkICkge1xuICAgICAgLy8gVGhlIGRpc2p1bmN0aW9uIGhlcmUgaXMgZm9yIGJldHRlciBjb21wcmVzc2liaWxpdHkgKHNlZSByZW1vdmVDbGFzcylcbiAgICAgIGNsYXNzZXMgPSAoIHZhbHVlIHx8IFwiXCIgKS5tYXRjaCggY29yZV9ybm90d2hpdGUgKSB8fCBbXTtcblxuICAgICAgZm9yICggOyBpIDwgbGVuOyBpKysgKSB7XG4gICAgICAgIGVsZW0gPSB0aGlzWyBpIF07XG4gICAgICAgIGN1ciA9IGVsZW0ubm9kZVR5cGUgPT09IDEgJiYgKCBlbGVtLmNsYXNzTmFtZSA/XG4gICAgICAgICAgKCBcIiBcIiArIGVsZW0uY2xhc3NOYW1lICsgXCIgXCIgKS5yZXBsYWNlKCByY2xhc3MsIFwiIFwiICkgOlxuICAgICAgICAgIFwiIFwiXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKCBjdXIgKSB7XG4gICAgICAgICAgaiA9IDA7XG4gICAgICAgICAgd2hpbGUgKCAoY2xhenogPSBjbGFzc2VzW2orK10pICkge1xuICAgICAgICAgICAgaWYgKCBjdXIuaW5kZXhPZiggXCIgXCIgKyBjbGF6eiArIFwiIFwiICkgPCAwICkge1xuICAgICAgICAgICAgICBjdXIgKz0gY2xhenogKyBcIiBcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgZWxlbS5jbGFzc05hbWUgPSBqUXVlcnkudHJpbSggY3VyICk7XG5cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIHJlbW92ZUNsYXNzOiBmdW5jdGlvbiggdmFsdWUgKSB7XG4gICAgdmFyIGNsYXNzZXMsIGVsZW0sIGN1ciwgY2xhenosIGosXG4gICAgICBpID0gMCxcbiAgICAgIGxlbiA9IHRoaXMubGVuZ3RoLFxuICAgICAgcHJvY2VlZCA9IGFyZ3VtZW50cy5sZW5ndGggPT09IDAgfHwgdHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiICYmIHZhbHVlO1xuXG4gICAgaWYgKCBqUXVlcnkuaXNGdW5jdGlvbiggdmFsdWUgKSApIHtcbiAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oIGogKSB7XG4gICAgICAgIGpRdWVyeSggdGhpcyApLnJlbW92ZUNsYXNzKCB2YWx1ZS5jYWxsKCB0aGlzLCBqLCB0aGlzLmNsYXNzTmFtZSApICk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKCBwcm9jZWVkICkge1xuICAgICAgY2xhc3NlcyA9ICggdmFsdWUgfHwgXCJcIiApLm1hdGNoKCBjb3JlX3Jub3R3aGl0ZSApIHx8IFtdO1xuXG4gICAgICBmb3IgKCA7IGkgPCBsZW47IGkrKyApIHtcbiAgICAgICAgZWxlbSA9IHRoaXNbIGkgXTtcbiAgICAgICAgLy8gVGhpcyBleHByZXNzaW9uIGlzIGhlcmUgZm9yIGJldHRlciBjb21wcmVzc2liaWxpdHkgKHNlZSBhZGRDbGFzcylcbiAgICAgICAgY3VyID0gZWxlbS5ub2RlVHlwZSA9PT0gMSAmJiAoIGVsZW0uY2xhc3NOYW1lID9cbiAgICAgICAgICAoIFwiIFwiICsgZWxlbS5jbGFzc05hbWUgKyBcIiBcIiApLnJlcGxhY2UoIHJjbGFzcywgXCIgXCIgKSA6XG4gICAgICAgICAgXCJcIlxuICAgICAgICApO1xuXG4gICAgICAgIGlmICggY3VyICkge1xuICAgICAgICAgIGogPSAwO1xuICAgICAgICAgIHdoaWxlICggKGNsYXp6ID0gY2xhc3Nlc1tqKytdKSApIHtcbiAgICAgICAgICAgIC8vIFJlbW92ZSAqYWxsKiBpbnN0YW5jZXNcbiAgICAgICAgICAgIHdoaWxlICggY3VyLmluZGV4T2YoIFwiIFwiICsgY2xhenogKyBcIiBcIiApID49IDAgKSB7XG4gICAgICAgICAgICAgIGN1ciA9IGN1ci5yZXBsYWNlKCBcIiBcIiArIGNsYXp6ICsgXCIgXCIsIFwiIFwiICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsZW0uY2xhc3NOYW1lID0gdmFsdWUgPyBqUXVlcnkudHJpbSggY3VyICkgOiBcIlwiO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgdG9nZ2xlQ2xhc3M6IGZ1bmN0aW9uKCB2YWx1ZSwgc3RhdGVWYWwgKSB7XG4gICAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG5cbiAgICBpZiAoIHR5cGVvZiBzdGF0ZVZhbCA9PT0gXCJib29sZWFuXCIgJiYgdHlwZSA9PT0gXCJzdHJpbmdcIiApIHtcbiAgICAgIHJldHVybiBzdGF0ZVZhbCA/IHRoaXMuYWRkQ2xhc3MoIHZhbHVlICkgOiB0aGlzLnJlbW92ZUNsYXNzKCB2YWx1ZSApO1xuICAgIH1cblxuICAgIGlmICggalF1ZXJ5LmlzRnVuY3Rpb24oIHZhbHVlICkgKSB7XG4gICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCBpICkge1xuICAgICAgICBqUXVlcnkoIHRoaXMgKS50b2dnbGVDbGFzcyggdmFsdWUuY2FsbCh0aGlzLCBpLCB0aGlzLmNsYXNzTmFtZSwgc3RhdGVWYWwpLCBzdGF0ZVZhbCApO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgIGlmICggdHlwZSA9PT0gXCJzdHJpbmdcIiApIHtcbiAgICAgICAgLy8gdG9nZ2xlIGluZGl2aWR1YWwgY2xhc3MgbmFtZXNcbiAgICAgICAgdmFyIGNsYXNzTmFtZSxcbiAgICAgICAgICBpID0gMCxcbiAgICAgICAgICBzZWxmID0galF1ZXJ5KCB0aGlzICksXG4gICAgICAgICAgY2xhc3NOYW1lcyA9IHZhbHVlLm1hdGNoKCBjb3JlX3Jub3R3aGl0ZSApIHx8IFtdO1xuXG4gICAgICAgIHdoaWxlICggKGNsYXNzTmFtZSA9IGNsYXNzTmFtZXNbIGkrKyBdKSApIHtcbiAgICAgICAgICAvLyBjaGVjayBlYWNoIGNsYXNzTmFtZSBnaXZlbiwgc3BhY2Ugc2VwYXJhdGVkIGxpc3RcbiAgICAgICAgICBpZiAoIHNlbGYuaGFzQ2xhc3MoIGNsYXNzTmFtZSApICkge1xuICAgICAgICAgICAgc2VsZi5yZW1vdmVDbGFzcyggY2xhc3NOYW1lICk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlbGYuYWRkQ2xhc3MoIGNsYXNzTmFtZSApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAvLyBUb2dnbGUgd2hvbGUgY2xhc3MgbmFtZVxuICAgICAgfSBlbHNlIGlmICggdHlwZSA9PT0gY29yZV9zdHJ1bmRlZmluZWQgfHwgdHlwZSA9PT0gXCJib29sZWFuXCIgKSB7XG4gICAgICAgIGlmICggdGhpcy5jbGFzc05hbWUgKSB7XG4gICAgICAgICAgLy8gc3RvcmUgY2xhc3NOYW1lIGlmIHNldFxuICAgICAgICAgIGpRdWVyeS5fZGF0YSggdGhpcywgXCJfX2NsYXNzTmFtZV9fXCIsIHRoaXMuY2xhc3NOYW1lICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiB0aGUgZWxlbWVudCBoYXMgYSBjbGFzcyBuYW1lIG9yIGlmIHdlJ3JlIHBhc3NlZCBcImZhbHNlXCIsXG4gICAgICAgIC8vIHRoZW4gcmVtb3ZlIHRoZSB3aG9sZSBjbGFzc25hbWUgKGlmIHRoZXJlIHdhcyBvbmUsIHRoZSBhYm92ZSBzYXZlZCBpdCkuXG4gICAgICAgIC8vIE90aGVyd2lzZSBicmluZyBiYWNrIHdoYXRldmVyIHdhcyBwcmV2aW91c2x5IHNhdmVkIChpZiBhbnl0aGluZyksXG4gICAgICAgIC8vIGZhbGxpbmcgYmFjayB0byB0aGUgZW1wdHkgc3RyaW5nIGlmIG5vdGhpbmcgd2FzIHN0b3JlZC5cbiAgICAgICAgdGhpcy5jbGFzc05hbWUgPSB0aGlzLmNsYXNzTmFtZSB8fCB2YWx1ZSA9PT0gZmFsc2UgPyBcIlwiIDogalF1ZXJ5Ll9kYXRhKCB0aGlzLCBcIl9fY2xhc3NOYW1lX19cIiApIHx8IFwiXCI7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cbiAgaGFzQ2xhc3M6IGZ1bmN0aW9uKCBzZWxlY3RvciApIHtcbiAgICB2YXIgY2xhc3NOYW1lID0gXCIgXCIgKyBzZWxlY3RvciArIFwiIFwiLFxuICAgICAgaSA9IDAsXG4gICAgICBsID0gdGhpcy5sZW5ndGg7XG4gICAgZm9yICggOyBpIDwgbDsgaSsrICkge1xuICAgICAgaWYgKCB0aGlzW2ldLm5vZGVUeXBlID09PSAxICYmIChcIiBcIiArIHRoaXNbaV0uY2xhc3NOYW1lICsgXCIgXCIpLnJlcGxhY2UocmNsYXNzLCBcIiBcIikuaW5kZXhPZiggY2xhc3NOYW1lICkgPj0gMCApIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuXG4gIHZhbDogZnVuY3Rpb24oIHZhbHVlICkge1xuICAgIHZhciByZXQsIGhvb2tzLCBpc0Z1bmN0aW9uLFxuICAgICAgZWxlbSA9IHRoaXNbMF07XG5cbiAgICBpZiAoICFhcmd1bWVudHMubGVuZ3RoICkge1xuICAgICAgaWYgKCBlbGVtICkge1xuICAgICAgICBob29rcyA9IGpRdWVyeS52YWxIb29rc1sgZWxlbS50eXBlIF0gfHwgalF1ZXJ5LnZhbEhvb2tzWyBlbGVtLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgXTtcblxuICAgICAgICBpZiAoIGhvb2tzICYmIFwiZ2V0XCIgaW4gaG9va3MgJiYgKHJldCA9IGhvb2tzLmdldCggZWxlbSwgXCJ2YWx1ZVwiICkpICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldCA9IGVsZW0udmFsdWU7XG5cbiAgICAgICAgcmV0dXJuIHR5cGVvZiByZXQgPT09IFwic3RyaW5nXCIgP1xuICAgICAgICAgIC8vIGhhbmRsZSBtb3N0IGNvbW1vbiBzdHJpbmcgY2FzZXNcbiAgICAgICAgICByZXQucmVwbGFjZShycmV0dXJuLCBcIlwiKSA6XG4gICAgICAgICAgLy8gaGFuZGxlIGNhc2VzIHdoZXJlIHZhbHVlIGlzIG51bGwvdW5kZWYgb3IgbnVtYmVyXG4gICAgICAgICAgcmV0ID09IG51bGwgPyBcIlwiIDogcmV0O1xuICAgICAgfVxuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaXNGdW5jdGlvbiA9IGpRdWVyeS5pc0Z1bmN0aW9uKCB2YWx1ZSApO1xuXG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiggaSApIHtcbiAgICAgIHZhciB2YWw7XG5cbiAgICAgIGlmICggdGhpcy5ub2RlVHlwZSAhPT0gMSApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoIGlzRnVuY3Rpb24gKSB7XG4gICAgICAgIHZhbCA9IHZhbHVlLmNhbGwoIHRoaXMsIGksIGpRdWVyeSggdGhpcyApLnZhbCgpICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWwgPSB2YWx1ZTtcbiAgICAgIH1cblxuICAgICAgLy8gVHJlYXQgbnVsbC91bmRlZmluZWQgYXMgXCJcIjsgY29udmVydCBudW1iZXJzIHRvIHN0cmluZ1xuICAgICAgaWYgKCB2YWwgPT0gbnVsbCApIHtcbiAgICAgICAgdmFsID0gXCJcIjtcbiAgICAgIH0gZWxzZSBpZiAoIHR5cGVvZiB2YWwgPT09IFwibnVtYmVyXCIgKSB7XG4gICAgICAgIHZhbCArPSBcIlwiO1xuICAgICAgfSBlbHNlIGlmICggalF1ZXJ5LmlzQXJyYXkoIHZhbCApICkge1xuICAgICAgICB2YWwgPSBqUXVlcnkubWFwKHZhbCwgZnVuY3Rpb24gKCB2YWx1ZSApIHtcbiAgICAgICAgICByZXR1cm4gdmFsdWUgPT0gbnVsbCA/IFwiXCIgOiB2YWx1ZSArIFwiXCI7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBob29rcyA9IGpRdWVyeS52YWxIb29rc1sgdGhpcy50eXBlIF0gfHwgalF1ZXJ5LnZhbEhvb2tzWyB0aGlzLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgXTtcblxuICAgICAgLy8gSWYgc2V0IHJldHVybnMgdW5kZWZpbmVkLCBmYWxsIGJhY2sgdG8gbm9ybWFsIHNldHRpbmdcbiAgICAgIGlmICggIWhvb2tzIHx8ICEoXCJzZXRcIiBpbiBob29rcykgfHwgaG9va3Muc2V0KCB0aGlzLCB2YWwsIFwidmFsdWVcIiApID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWw7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn0pO1xuXG5qUXVlcnkuZXh0ZW5kKHtcbiAgdmFsSG9va3M6IHtcbiAgICBvcHRpb246IHtcbiAgICAgIGdldDogZnVuY3Rpb24oIGVsZW0gKSB7XG4gICAgICAgIC8vIFVzZSBwcm9wZXIgYXR0cmlidXRlIHJldHJpZXZhbCgjNjkzMiwgIzEyMDcyKVxuICAgICAgICB2YXIgdmFsID0galF1ZXJ5LmZpbmQuYXR0ciggZWxlbSwgXCJ2YWx1ZVwiICk7XG4gICAgICAgIHJldHVybiB2YWwgIT0gbnVsbCA/XG4gICAgICAgICAgdmFsIDpcbiAgICAgICAgICBlbGVtLnRleHQ7XG4gICAgICB9XG4gICAgfSxcbiAgICBzZWxlY3Q6IHtcbiAgICAgIGdldDogZnVuY3Rpb24oIGVsZW0gKSB7XG4gICAgICAgIHZhciB2YWx1ZSwgb3B0aW9uLFxuICAgICAgICAgIG9wdGlvbnMgPSBlbGVtLm9wdGlvbnMsXG4gICAgICAgICAgaW5kZXggPSBlbGVtLnNlbGVjdGVkSW5kZXgsXG4gICAgICAgICAgb25lID0gZWxlbS50eXBlID09PSBcInNlbGVjdC1vbmVcIiB8fCBpbmRleCA8IDAsXG4gICAgICAgICAgdmFsdWVzID0gb25lID8gbnVsbCA6IFtdLFxuICAgICAgICAgIG1heCA9IG9uZSA/IGluZGV4ICsgMSA6IG9wdGlvbnMubGVuZ3RoLFxuICAgICAgICAgIGkgPSBpbmRleCA8IDAgP1xuICAgICAgICAgICAgbWF4IDpcbiAgICAgICAgICAgIG9uZSA/IGluZGV4IDogMDtcblxuICAgICAgICAvLyBMb29wIHRocm91Z2ggYWxsIHRoZSBzZWxlY3RlZCBvcHRpb25zXG4gICAgICAgIGZvciAoIDsgaSA8IG1heDsgaSsrICkge1xuICAgICAgICAgIG9wdGlvbiA9IG9wdGlvbnNbIGkgXTtcblxuICAgICAgICAgIC8vIG9sZElFIGRvZXNuJ3QgdXBkYXRlIHNlbGVjdGVkIGFmdGVyIGZvcm0gcmVzZXQgKCMyNTUxKVxuICAgICAgICAgIGlmICggKCBvcHRpb24uc2VsZWN0ZWQgfHwgaSA9PT0gaW5kZXggKSAmJlxuICAgICAgICAgICAgICAvLyBEb24ndCByZXR1cm4gb3B0aW9ucyB0aGF0IGFyZSBkaXNhYmxlZCBvciBpbiBhIGRpc2FibGVkIG9wdGdyb3VwXG4gICAgICAgICAgICAgICggalF1ZXJ5LnN1cHBvcnQub3B0RGlzYWJsZWQgPyAhb3B0aW9uLmRpc2FibGVkIDogb3B0aW9uLmdldEF0dHJpYnV0ZShcImRpc2FibGVkXCIpID09PSBudWxsICkgJiZcbiAgICAgICAgICAgICAgKCAhb3B0aW9uLnBhcmVudE5vZGUuZGlzYWJsZWQgfHwgIWpRdWVyeS5ub2RlTmFtZSggb3B0aW9uLnBhcmVudE5vZGUsIFwib3B0Z3JvdXBcIiApICkgKSB7XG5cbiAgICAgICAgICAgIC8vIEdldCB0aGUgc3BlY2lmaWMgdmFsdWUgZm9yIHRoZSBvcHRpb25cbiAgICAgICAgICAgIHZhbHVlID0galF1ZXJ5KCBvcHRpb24gKS52YWwoKTtcblxuICAgICAgICAgICAgLy8gV2UgZG9uJ3QgbmVlZCBhbiBhcnJheSBmb3Igb25lIHNlbGVjdHNcbiAgICAgICAgICAgIGlmICggb25lICkge1xuICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIE11bHRpLVNlbGVjdHMgcmV0dXJuIGFuIGFycmF5XG4gICAgICAgICAgICB2YWx1ZXMucHVzaCggdmFsdWUgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdmFsdWVzO1xuICAgICAgfSxcblxuICAgICAgc2V0OiBmdW5jdGlvbiggZWxlbSwgdmFsdWUgKSB7XG4gICAgICAgIHZhciBvcHRpb25TZXQsIG9wdGlvbixcbiAgICAgICAgICBvcHRpb25zID0gZWxlbS5vcHRpb25zLFxuICAgICAgICAgIHZhbHVlcyA9IGpRdWVyeS5tYWtlQXJyYXkoIHZhbHVlICksXG4gICAgICAgICAgaSA9IG9wdGlvbnMubGVuZ3RoO1xuXG4gICAgICAgIHdoaWxlICggaS0tICkge1xuICAgICAgICAgIG9wdGlvbiA9IG9wdGlvbnNbIGkgXTtcbiAgICAgICAgICBpZiAoIChvcHRpb24uc2VsZWN0ZWQgPSBqUXVlcnkuaW5BcnJheSggalF1ZXJ5KG9wdGlvbikudmFsKCksIHZhbHVlcyApID49IDApICkge1xuICAgICAgICAgICAgb3B0aW9uU2V0ID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBmb3JjZSBicm93c2VycyB0byBiZWhhdmUgY29uc2lzdGVudGx5IHdoZW4gbm9uLW1hdGNoaW5nIHZhbHVlIGlzIHNldFxuICAgICAgICBpZiAoICFvcHRpb25TZXQgKSB7XG4gICAgICAgICAgZWxlbS5zZWxlY3RlZEluZGV4ID0gLTE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbHVlcztcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgYXR0cjogZnVuY3Rpb24oIGVsZW0sIG5hbWUsIHZhbHVlICkge1xuICAgIHZhciBob29rcywgcmV0LFxuICAgICAgblR5cGUgPSBlbGVtLm5vZGVUeXBlO1xuXG4gICAgLy8gZG9uJ3QgZ2V0L3NldCBhdHRyaWJ1dGVzIG9uIHRleHQsIGNvbW1lbnQgYW5kIGF0dHJpYnV0ZSBub2Rlc1xuICAgIGlmICggIWVsZW0gfHwgblR5cGUgPT09IDMgfHwgblR5cGUgPT09IDggfHwgblR5cGUgPT09IDIgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gRmFsbGJhY2sgdG8gcHJvcCB3aGVuIGF0dHJpYnV0ZXMgYXJlIG5vdCBzdXBwb3J0ZWRcbiAgICBpZiAoIHR5cGVvZiBlbGVtLmdldEF0dHJpYnV0ZSA9PT0gY29yZV9zdHJ1bmRlZmluZWQgKSB7XG4gICAgICByZXR1cm4galF1ZXJ5LnByb3AoIGVsZW0sIG5hbWUsIHZhbHVlICk7XG4gICAgfVxuXG4gICAgLy8gQWxsIGF0dHJpYnV0ZXMgYXJlIGxvd2VyY2FzZVxuICAgIC8vIEdyYWIgbmVjZXNzYXJ5IGhvb2sgaWYgb25lIGlzIGRlZmluZWRcbiAgICBpZiAoIG5UeXBlICE9PSAxIHx8ICFqUXVlcnkuaXNYTUxEb2MoIGVsZW0gKSApIHtcbiAgICAgIG5hbWUgPSBuYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICBob29rcyA9IGpRdWVyeS5hdHRySG9va3NbIG5hbWUgXSB8fFxuICAgICAgICAoIGpRdWVyeS5leHByLm1hdGNoLmJvb2wudGVzdCggbmFtZSApID8gYm9vbEhvb2sgOiBub2RlSG9vayApO1xuICAgIH1cblxuICAgIGlmICggdmFsdWUgIT09IHVuZGVmaW5lZCApIHtcblxuICAgICAgaWYgKCB2YWx1ZSA9PT0gbnVsbCApIHtcbiAgICAgICAgalF1ZXJ5LnJlbW92ZUF0dHIoIGVsZW0sIG5hbWUgKTtcblxuICAgICAgfSBlbHNlIGlmICggaG9va3MgJiYgXCJzZXRcIiBpbiBob29rcyAmJiAocmV0ID0gaG9va3Muc2V0KCBlbGVtLCB2YWx1ZSwgbmFtZSApKSAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICByZXR1cm4gcmV0O1xuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbGVtLnNldEF0dHJpYnV0ZSggbmFtZSwgdmFsdWUgKyBcIlwiICk7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH1cblxuICAgIH0gZWxzZSBpZiAoIGhvb2tzICYmIFwiZ2V0XCIgaW4gaG9va3MgJiYgKHJldCA9IGhvb2tzLmdldCggZWxlbSwgbmFtZSApKSAhPT0gbnVsbCApIHtcbiAgICAgIHJldHVybiByZXQ7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0ID0galF1ZXJ5LmZpbmQuYXR0ciggZWxlbSwgbmFtZSApO1xuXG4gICAgICAvLyBOb24tZXhpc3RlbnQgYXR0cmlidXRlcyByZXR1cm4gbnVsbCwgd2Ugbm9ybWFsaXplIHRvIHVuZGVmaW5lZFxuICAgICAgcmV0dXJuIHJldCA9PSBudWxsID9cbiAgICAgICAgdW5kZWZpbmVkIDpcbiAgICAgICAgcmV0O1xuICAgIH1cbiAgfSxcblxuICByZW1vdmVBdHRyOiBmdW5jdGlvbiggZWxlbSwgdmFsdWUgKSB7XG4gICAgdmFyIG5hbWUsIHByb3BOYW1lLFxuICAgICAgaSA9IDAsXG4gICAgICBhdHRyTmFtZXMgPSB2YWx1ZSAmJiB2YWx1ZS5tYXRjaCggY29yZV9ybm90d2hpdGUgKTtcblxuICAgIGlmICggYXR0ck5hbWVzICYmIGVsZW0ubm9kZVR5cGUgPT09IDEgKSB7XG4gICAgICB3aGlsZSAoIChuYW1lID0gYXR0ck5hbWVzW2krK10pICkge1xuICAgICAgICBwcm9wTmFtZSA9IGpRdWVyeS5wcm9wRml4WyBuYW1lIF0gfHwgbmFtZTtcblxuICAgICAgICAvLyBCb29sZWFuIGF0dHJpYnV0ZXMgZ2V0IHNwZWNpYWwgdHJlYXRtZW50ICgjMTA4NzApXG4gICAgICAgIGlmICggalF1ZXJ5LmV4cHIubWF0Y2guYm9vbC50ZXN0KCBuYW1lICkgKSB7XG4gICAgICAgICAgLy8gU2V0IGNvcnJlc3BvbmRpbmcgcHJvcGVydHkgdG8gZmFsc2VcbiAgICAgICAgICBpZiAoIGdldFNldElucHV0ICYmIGdldFNldEF0dHJpYnV0ZSB8fCAhcnVzZURlZmF1bHQudGVzdCggbmFtZSApICkge1xuICAgICAgICAgICAgZWxlbVsgcHJvcE5hbWUgXSA9IGZhbHNlO1xuICAgICAgICAgIC8vIFN1cHBvcnQ6IElFPDlcbiAgICAgICAgICAvLyBBbHNvIGNsZWFyIGRlZmF1bHRDaGVja2VkL2RlZmF1bHRTZWxlY3RlZCAoaWYgYXBwcm9wcmlhdGUpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsZW1bIGpRdWVyeS5jYW1lbENhc2UoIFwiZGVmYXVsdC1cIiArIG5hbWUgKSBdID1cbiAgICAgICAgICAgICAgZWxlbVsgcHJvcE5hbWUgXSA9IGZhbHNlO1xuICAgICAgICAgIH1cblxuICAgICAgICAvLyBTZWUgIzk2OTkgZm9yIGV4cGxhbmF0aW9uIG9mIHRoaXMgYXBwcm9hY2ggKHNldHRpbmcgZmlyc3QsIHRoZW4gcmVtb3ZhbClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBqUXVlcnkuYXR0ciggZWxlbSwgbmFtZSwgXCJcIiApO1xuICAgICAgICB9XG5cbiAgICAgICAgZWxlbS5yZW1vdmVBdHRyaWJ1dGUoIGdldFNldEF0dHJpYnV0ZSA/IG5hbWUgOiBwcm9wTmFtZSApO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBhdHRySG9va3M6IHtcbiAgICB0eXBlOiB7XG4gICAgICBzZXQ6IGZ1bmN0aW9uKCBlbGVtLCB2YWx1ZSApIHtcbiAgICAgICAgaWYgKCAhalF1ZXJ5LnN1cHBvcnQucmFkaW9WYWx1ZSAmJiB2YWx1ZSA9PT0gXCJyYWRpb1wiICYmIGpRdWVyeS5ub2RlTmFtZShlbGVtLCBcImlucHV0XCIpICkge1xuICAgICAgICAgIC8vIFNldHRpbmcgdGhlIHR5cGUgb24gYSByYWRpbyBidXR0b24gYWZ0ZXIgdGhlIHZhbHVlIHJlc2V0cyB0aGUgdmFsdWUgaW4gSUU2LTlcbiAgICAgICAgICAvLyBSZXNldCB2YWx1ZSB0byBkZWZhdWx0IGluIGNhc2UgdHlwZSBpcyBzZXQgYWZ0ZXIgdmFsdWUgZHVyaW5nIGNyZWF0aW9uXG4gICAgICAgICAgdmFyIHZhbCA9IGVsZW0udmFsdWU7XG4gICAgICAgICAgZWxlbS5zZXRBdHRyaWJ1dGUoIFwidHlwZVwiLCB2YWx1ZSApO1xuICAgICAgICAgIGlmICggdmFsICkge1xuICAgICAgICAgICAgZWxlbS52YWx1ZSA9IHZhbDtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIHByb3BGaXg6IHtcbiAgICBcImZvclwiOiBcImh0bWxGb3JcIixcbiAgICBcImNsYXNzXCI6IFwiY2xhc3NOYW1lXCJcbiAgfSxcblxuICBwcm9wOiBmdW5jdGlvbiggZWxlbSwgbmFtZSwgdmFsdWUgKSB7XG4gICAgdmFyIHJldCwgaG9va3MsIG5vdHhtbCxcbiAgICAgIG5UeXBlID0gZWxlbS5ub2RlVHlwZTtcblxuICAgIC8vIGRvbid0IGdldC9zZXQgcHJvcGVydGllcyBvbiB0ZXh0LCBjb21tZW50IGFuZCBhdHRyaWJ1dGUgbm9kZXNcbiAgICBpZiAoICFlbGVtIHx8IG5UeXBlID09PSAzIHx8IG5UeXBlID09PSA4IHx8IG5UeXBlID09PSAyICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIG5vdHhtbCA9IG5UeXBlICE9PSAxIHx8ICFqUXVlcnkuaXNYTUxEb2MoIGVsZW0gKTtcblxuICAgIGlmICggbm90eG1sICkge1xuICAgICAgLy8gRml4IG5hbWUgYW5kIGF0dGFjaCBob29rc1xuICAgICAgbmFtZSA9IGpRdWVyeS5wcm9wRml4WyBuYW1lIF0gfHwgbmFtZTtcbiAgICAgIGhvb2tzID0galF1ZXJ5LnByb3BIb29rc1sgbmFtZSBdO1xuICAgIH1cblxuICAgIGlmICggdmFsdWUgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgIHJldHVybiBob29rcyAmJiBcInNldFwiIGluIGhvb2tzICYmIChyZXQgPSBob29rcy5zZXQoIGVsZW0sIHZhbHVlLCBuYW1lICkpICE9PSB1bmRlZmluZWQgP1xuICAgICAgICByZXQgOlxuICAgICAgICAoIGVsZW1bIG5hbWUgXSA9IHZhbHVlICk7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGhvb2tzICYmIFwiZ2V0XCIgaW4gaG9va3MgJiYgKHJldCA9IGhvb2tzLmdldCggZWxlbSwgbmFtZSApKSAhPT0gbnVsbCA/XG4gICAgICAgIHJldCA6XG4gICAgICAgIGVsZW1bIG5hbWUgXTtcbiAgICB9XG4gIH0sXG5cbiAgcHJvcEhvb2tzOiB7XG4gICAgdGFiSW5kZXg6IHtcbiAgICAgIGdldDogZnVuY3Rpb24oIGVsZW0gKSB7XG4gICAgICAgIC8vIGVsZW0udGFiSW5kZXggZG9lc24ndCBhbHdheXMgcmV0dXJuIHRoZSBjb3JyZWN0IHZhbHVlIHdoZW4gaXQgaGFzbid0IGJlZW4gZXhwbGljaXRseSBzZXRcbiAgICAgICAgLy8gaHR0cDovL2ZsdWlkcHJvamVjdC5vcmcvYmxvZy8yMDA4LzAxLzA5L2dldHRpbmctc2V0dGluZy1hbmQtcmVtb3ZpbmctdGFiaW5kZXgtdmFsdWVzLXdpdGgtamF2YXNjcmlwdC9cbiAgICAgICAgLy8gVXNlIHByb3BlciBhdHRyaWJ1dGUgcmV0cmlldmFsKCMxMjA3MilcbiAgICAgICAgdmFyIHRhYmluZGV4ID0galF1ZXJ5LmZpbmQuYXR0ciggZWxlbSwgXCJ0YWJpbmRleFwiICk7XG5cbiAgICAgICAgcmV0dXJuIHRhYmluZGV4ID9cbiAgICAgICAgICBwYXJzZUludCggdGFiaW5kZXgsIDEwICkgOlxuICAgICAgICAgIHJmb2N1c2FibGUudGVzdCggZWxlbS5ub2RlTmFtZSApIHx8IHJjbGlja2FibGUudGVzdCggZWxlbS5ub2RlTmFtZSApICYmIGVsZW0uaHJlZiA/XG4gICAgICAgICAgICAwIDpcbiAgICAgICAgICAgIC0xO1xuICAgICAgfVxuICAgIH1cbiAgfVxufSk7XG5cbi8vIEhvb2tzIGZvciBib29sZWFuIGF0dHJpYnV0ZXNcbmJvb2xIb29rID0ge1xuICBzZXQ6IGZ1bmN0aW9uKCBlbGVtLCB2YWx1ZSwgbmFtZSApIHtcbiAgICBpZiAoIHZhbHVlID09PSBmYWxzZSApIHtcbiAgICAgIC8vIFJlbW92ZSBib29sZWFuIGF0dHJpYnV0ZXMgd2hlbiBzZXQgdG8gZmFsc2VcbiAgICAgIGpRdWVyeS5yZW1vdmVBdHRyKCBlbGVtLCBuYW1lICk7XG4gICAgfSBlbHNlIGlmICggZ2V0U2V0SW5wdXQgJiYgZ2V0U2V0QXR0cmlidXRlIHx8ICFydXNlRGVmYXVsdC50ZXN0KCBuYW1lICkgKSB7XG4gICAgICAvLyBJRTw4IG5lZWRzIHRoZSAqcHJvcGVydHkqIG5hbWVcbiAgICAgIGVsZW0uc2V0QXR0cmlidXRlKCAhZ2V0U2V0QXR0cmlidXRlICYmIGpRdWVyeS5wcm9wRml4WyBuYW1lIF0gfHwgbmFtZSwgbmFtZSApO1xuXG4gICAgLy8gVXNlIGRlZmF1bHRDaGVja2VkIGFuZCBkZWZhdWx0U2VsZWN0ZWQgZm9yIG9sZElFXG4gICAgfSBlbHNlIHtcbiAgICAgIGVsZW1bIGpRdWVyeS5jYW1lbENhc2UoIFwiZGVmYXVsdC1cIiArIG5hbWUgKSBdID0gZWxlbVsgbmFtZSBdID0gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmFtZTtcbiAgfVxufTtcbmpRdWVyeS5lYWNoKCBqUXVlcnkuZXhwci5tYXRjaC5ib29sLnNvdXJjZS5tYXRjaCggL1xcdysvZyApLCBmdW5jdGlvbiggaSwgbmFtZSApIHtcbiAgdmFyIGdldHRlciA9IGpRdWVyeS5leHByLmF0dHJIYW5kbGVbIG5hbWUgXSB8fCBqUXVlcnkuZmluZC5hdHRyO1xuXG4gIGpRdWVyeS5leHByLmF0dHJIYW5kbGVbIG5hbWUgXSA9IGdldFNldElucHV0ICYmIGdldFNldEF0dHJpYnV0ZSB8fCAhcnVzZURlZmF1bHQudGVzdCggbmFtZSApID9cbiAgICBmdW5jdGlvbiggZWxlbSwgbmFtZSwgaXNYTUwgKSB7XG4gICAgICB2YXIgZm4gPSBqUXVlcnkuZXhwci5hdHRySGFuZGxlWyBuYW1lIF0sXG4gICAgICAgIHJldCA9IGlzWE1MID9cbiAgICAgICAgICB1bmRlZmluZWQgOlxuICAgICAgICAgIC8qIGpzaGludCBlcWVxZXE6IGZhbHNlICovXG4gICAgICAgICAgKGpRdWVyeS5leHByLmF0dHJIYW5kbGVbIG5hbWUgXSA9IHVuZGVmaW5lZCkgIT1cbiAgICAgICAgICAgIGdldHRlciggZWxlbSwgbmFtZSwgaXNYTUwgKSA/XG5cbiAgICAgICAgICAgIG5hbWUudG9Mb3dlckNhc2UoKSA6XG4gICAgICAgICAgICBudWxsO1xuICAgICAgalF1ZXJ5LmV4cHIuYXR0ckhhbmRsZVsgbmFtZSBdID0gZm47XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH0gOlxuICAgIGZ1bmN0aW9uKCBlbGVtLCBuYW1lLCBpc1hNTCApIHtcbiAgICAgIHJldHVybiBpc1hNTCA/XG4gICAgICAgIHVuZGVmaW5lZCA6XG4gICAgICAgIGVsZW1bIGpRdWVyeS5jYW1lbENhc2UoIFwiZGVmYXVsdC1cIiArIG5hbWUgKSBdID9cbiAgICAgICAgICBuYW1lLnRvTG93ZXJDYXNlKCkgOlxuICAgICAgICAgIG51bGw7XG4gICAgfTtcbn0pO1xuXG4vLyBmaXggb2xkSUUgYXR0cm9wZXJ0aWVzXG5pZiAoICFnZXRTZXRJbnB1dCB8fCAhZ2V0U2V0QXR0cmlidXRlICkge1xuICBqUXVlcnkuYXR0ckhvb2tzLnZhbHVlID0ge1xuICAgIHNldDogZnVuY3Rpb24oIGVsZW0sIHZhbHVlLCBuYW1lICkge1xuICAgICAgaWYgKCBqUXVlcnkubm9kZU5hbWUoIGVsZW0sIFwiaW5wdXRcIiApICkge1xuICAgICAgICAvLyBEb2VzIG5vdCByZXR1cm4gc28gdGhhdCBzZXRBdHRyaWJ1dGUgaXMgYWxzbyB1c2VkXG4gICAgICAgIGVsZW0uZGVmYXVsdFZhbHVlID0gdmFsdWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBVc2Ugbm9kZUhvb2sgaWYgZGVmaW5lZCAoIzE5NTQpOyBvdGhlcndpc2Ugc2V0QXR0cmlidXRlIGlzIGZpbmVcbiAgICAgICAgcmV0dXJuIG5vZGVIb29rICYmIG5vZGVIb29rLnNldCggZWxlbSwgdmFsdWUsIG5hbWUgKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59XG5cbi8vIElFNi83IGRvIG5vdCBzdXBwb3J0IGdldHRpbmcvc2V0dGluZyBzb21lIGF0dHJpYnV0ZXMgd2l0aCBnZXQvc2V0QXR0cmlidXRlXG5pZiAoICFnZXRTZXRBdHRyaWJ1dGUgKSB7XG5cbiAgLy8gVXNlIHRoaXMgZm9yIGFueSBhdHRyaWJ1dGUgaW4gSUU2LzdcbiAgLy8gVGhpcyBmaXhlcyBhbG1vc3QgZXZlcnkgSUU2LzcgaXNzdWVcbiAgbm9kZUhvb2sgPSB7XG4gICAgc2V0OiBmdW5jdGlvbiggZWxlbSwgdmFsdWUsIG5hbWUgKSB7XG4gICAgICAvLyBTZXQgdGhlIGV4aXN0aW5nIG9yIGNyZWF0ZSBhIG5ldyBhdHRyaWJ1dGUgbm9kZVxuICAgICAgdmFyIHJldCA9IGVsZW0uZ2V0QXR0cmlidXRlTm9kZSggbmFtZSApO1xuICAgICAgaWYgKCAhcmV0ICkge1xuICAgICAgICBlbGVtLnNldEF0dHJpYnV0ZU5vZGUoXG4gICAgICAgICAgKHJldCA9IGVsZW0ub3duZXJEb2N1bWVudC5jcmVhdGVBdHRyaWJ1dGUoIG5hbWUgKSlcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgcmV0LnZhbHVlID0gdmFsdWUgKz0gXCJcIjtcblxuICAgICAgLy8gQnJlYWsgYXNzb2NpYXRpb24gd2l0aCBjbG9uZWQgZWxlbWVudHMgYnkgYWxzbyB1c2luZyBzZXRBdHRyaWJ1dGUgKCM5NjQ2KVxuICAgICAgcmV0dXJuIG5hbWUgPT09IFwidmFsdWVcIiB8fCB2YWx1ZSA9PT0gZWxlbS5nZXRBdHRyaWJ1dGUoIG5hbWUgKSA/XG4gICAgICAgIHZhbHVlIDpcbiAgICAgICAgdW5kZWZpbmVkO1xuICAgIH1cbiAgfTtcbiAgalF1ZXJ5LmV4cHIuYXR0ckhhbmRsZS5pZCA9IGpRdWVyeS5leHByLmF0dHJIYW5kbGUubmFtZSA9IGpRdWVyeS5leHByLmF0dHJIYW5kbGUuY29vcmRzID1cbiAgICAvLyBTb21lIGF0dHJpYnV0ZXMgYXJlIGNvbnN0cnVjdGVkIHdpdGggZW1wdHktc3RyaW5nIHZhbHVlcyB3aGVuIG5vdCBkZWZpbmVkXG4gICAgZnVuY3Rpb24oIGVsZW0sIG5hbWUsIGlzWE1MICkge1xuICAgICAgdmFyIHJldDtcbiAgICAgIHJldHVybiBpc1hNTCA/XG4gICAgICAgIHVuZGVmaW5lZCA6XG4gICAgICAgIChyZXQgPSBlbGVtLmdldEF0dHJpYnV0ZU5vZGUoIG5hbWUgKSkgJiYgcmV0LnZhbHVlICE9PSBcIlwiID9cbiAgICAgICAgICByZXQudmFsdWUgOlxuICAgICAgICAgIG51bGw7XG4gICAgfTtcbiAgalF1ZXJ5LnZhbEhvb2tzLmJ1dHRvbiA9IHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCBlbGVtLCBuYW1lICkge1xuICAgICAgdmFyIHJldCA9IGVsZW0uZ2V0QXR0cmlidXRlTm9kZSggbmFtZSApO1xuICAgICAgcmV0dXJuIHJldCAmJiByZXQuc3BlY2lmaWVkID9cbiAgICAgICAgcmV0LnZhbHVlIDpcbiAgICAgICAgdW5kZWZpbmVkO1xuICAgIH0sXG4gICAgc2V0OiBub2RlSG9vay5zZXRcbiAgfTtcblxuICAvLyBTZXQgY29udGVudGVkaXRhYmxlIHRvIGZhbHNlIG9uIHJlbW92YWxzKCMxMDQyOSlcbiAgLy8gU2V0dGluZyB0byBlbXB0eSBzdHJpbmcgdGhyb3dzIGFuIGVycm9yIGFzIGFuIGludmFsaWQgdmFsdWVcbiAgalF1ZXJ5LmF0dHJIb29rcy5jb250ZW50ZWRpdGFibGUgPSB7XG4gICAgc2V0OiBmdW5jdGlvbiggZWxlbSwgdmFsdWUsIG5hbWUgKSB7XG4gICAgICBub2RlSG9vay5zZXQoIGVsZW0sIHZhbHVlID09PSBcIlwiID8gZmFsc2UgOiB2YWx1ZSwgbmFtZSApO1xuICAgIH1cbiAgfTtcblxuICAvLyBTZXQgd2lkdGggYW5kIGhlaWdodCB0byBhdXRvIGluc3RlYWQgb2YgMCBvbiBlbXB0eSBzdHJpbmcoIEJ1ZyAjODE1MCApXG4gIC8vIFRoaXMgaXMgZm9yIHJlbW92YWxzXG4gIGpRdWVyeS5lYWNoKFsgXCJ3aWR0aFwiLCBcImhlaWdodFwiIF0sIGZ1bmN0aW9uKCBpLCBuYW1lICkge1xuICAgIGpRdWVyeS5hdHRySG9va3NbIG5hbWUgXSA9IHtcbiAgICAgIHNldDogZnVuY3Rpb24oIGVsZW0sIHZhbHVlICkge1xuICAgICAgICBpZiAoIHZhbHVlID09PSBcIlwiICkge1xuICAgICAgICAgIGVsZW0uc2V0QXR0cmlidXRlKCBuYW1lLCBcImF1dG9cIiApO1xuICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH0pO1xufVxuXG5cbi8vIFNvbWUgYXR0cmlidXRlcyByZXF1aXJlIGEgc3BlY2lhbCBjYWxsIG9uIElFXG4vLyBodHRwOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvbXM1MzY0MjklMjhWUy44NSUyOS5hc3B4XG5pZiAoICFqUXVlcnkuc3VwcG9ydC5ocmVmTm9ybWFsaXplZCApIHtcbiAgLy8gaHJlZi9zcmMgcHJvcGVydHkgc2hvdWxkIGdldCB0aGUgZnVsbCBub3JtYWxpemVkIFVSTCAoIzEwMjk5LyMxMjkxNSlcbiAgalF1ZXJ5LmVhY2goWyBcImhyZWZcIiwgXCJzcmNcIiBdLCBmdW5jdGlvbiggaSwgbmFtZSApIHtcbiAgICBqUXVlcnkucHJvcEhvb2tzWyBuYW1lIF0gPSB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uKCBlbGVtICkge1xuICAgICAgICByZXR1cm4gZWxlbS5nZXRBdHRyaWJ1dGUoIG5hbWUsIDQgKTtcbiAgICAgIH1cbiAgICB9O1xuICB9KTtcbn1cblxuaWYgKCAhalF1ZXJ5LnN1cHBvcnQuc3R5bGUgKSB7XG4gIGpRdWVyeS5hdHRySG9va3Muc3R5bGUgPSB7XG4gICAgZ2V0OiBmdW5jdGlvbiggZWxlbSApIHtcbiAgICAgIC8vIFJldHVybiB1bmRlZmluZWQgaW4gdGhlIGNhc2Ugb2YgZW1wdHkgc3RyaW5nXG4gICAgICAvLyBOb3RlOiBJRSB1cHBlcmNhc2VzIGNzcyBwcm9wZXJ0eSBuYW1lcywgYnV0IGlmIHdlIHdlcmUgdG8gLnRvTG93ZXJDYXNlKClcbiAgICAgIC8vIC5jc3NUZXh0LCB0aGF0IHdvdWxkIGRlc3Ryb3kgY2FzZSBzZW5zdGl0aXZpdHkgaW4gVVJMJ3MsIGxpa2UgaW4gXCJiYWNrZ3JvdW5kXCJcbiAgICAgIHJldHVybiBlbGVtLnN0eWxlLmNzc1RleHQgfHwgdW5kZWZpbmVkO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiggZWxlbSwgdmFsdWUgKSB7XG4gICAgICByZXR1cm4gKCBlbGVtLnN0eWxlLmNzc1RleHQgPSB2YWx1ZSArIFwiXCIgKTtcbiAgICB9XG4gIH07XG59XG5cbi8vIFNhZmFyaSBtaXMtcmVwb3J0cyB0aGUgZGVmYXVsdCBzZWxlY3RlZCBwcm9wZXJ0eSBvZiBhbiBvcHRpb25cbi8vIEFjY2Vzc2luZyB0aGUgcGFyZW50J3Mgc2VsZWN0ZWRJbmRleCBwcm9wZXJ0eSBmaXhlcyBpdFxuaWYgKCAhalF1ZXJ5LnN1cHBvcnQub3B0U2VsZWN0ZWQgKSB7XG4gIGpRdWVyeS5wcm9wSG9va3Muc2VsZWN0ZWQgPSB7XG4gICAgZ2V0OiBmdW5jdGlvbiggZWxlbSApIHtcbiAgICAgIHZhciBwYXJlbnQgPSBlbGVtLnBhcmVudE5vZGU7XG5cbiAgICAgIGlmICggcGFyZW50ICkge1xuICAgICAgICBwYXJlbnQuc2VsZWN0ZWRJbmRleDtcblxuICAgICAgICAvLyBNYWtlIHN1cmUgdGhhdCBpdCBhbHNvIHdvcmtzIHdpdGggb3B0Z3JvdXBzLCBzZWUgIzU3MDFcbiAgICAgICAgaWYgKCBwYXJlbnQucGFyZW50Tm9kZSApIHtcbiAgICAgICAgICBwYXJlbnQucGFyZW50Tm9kZS5zZWxlY3RlZEluZGV4O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH07XG59XG5cbmpRdWVyeS5lYWNoKFtcbiAgXCJ0YWJJbmRleFwiLFxuICBcInJlYWRPbmx5XCIsXG4gIFwibWF4TGVuZ3RoXCIsXG4gIFwiY2VsbFNwYWNpbmdcIixcbiAgXCJjZWxsUGFkZGluZ1wiLFxuICBcInJvd1NwYW5cIixcbiAgXCJjb2xTcGFuXCIsXG4gIFwidXNlTWFwXCIsXG4gIFwiZnJhbWVCb3JkZXJcIixcbiAgXCJjb250ZW50RWRpdGFibGVcIlxuXSwgZnVuY3Rpb24oKSB7XG4gIGpRdWVyeS5wcm9wRml4WyB0aGlzLnRvTG93ZXJDYXNlKCkgXSA9IHRoaXM7XG59KTtcblxuLy8gSUU2LzcgY2FsbCBlbmN0eXBlIGVuY29kaW5nXG5pZiAoICFqUXVlcnkuc3VwcG9ydC5lbmN0eXBlICkge1xuICBqUXVlcnkucHJvcEZpeC5lbmN0eXBlID0gXCJlbmNvZGluZ1wiO1xufVxuXG4vLyBSYWRpb3MgYW5kIGNoZWNrYm94ZXMgZ2V0dGVyL3NldHRlclxualF1ZXJ5LmVhY2goWyBcInJhZGlvXCIsIFwiY2hlY2tib3hcIiBdLCBmdW5jdGlvbigpIHtcbiAgalF1ZXJ5LnZhbEhvb2tzWyB0aGlzIF0gPSB7XG4gICAgc2V0OiBmdW5jdGlvbiggZWxlbSwgdmFsdWUgKSB7XG4gICAgICBpZiAoIGpRdWVyeS5pc0FycmF5KCB2YWx1ZSApICkge1xuICAgICAgICByZXR1cm4gKCBlbGVtLmNoZWNrZWQgPSBqUXVlcnkuaW5BcnJheSggalF1ZXJ5KGVsZW0pLnZhbCgpLCB2YWx1ZSApID49IDAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIGlmICggIWpRdWVyeS5zdXBwb3J0LmNoZWNrT24gKSB7XG4gICAgalF1ZXJ5LnZhbEhvb2tzWyB0aGlzIF0uZ2V0ID0gZnVuY3Rpb24oIGVsZW0gKSB7XG4gICAgICAvLyBTdXBwb3J0OiBXZWJraXRcbiAgICAgIC8vIFwiXCIgaXMgcmV0dXJuZWQgaW5zdGVhZCBvZiBcIm9uXCIgaWYgYSB2YWx1ZSBpc24ndCBzcGVjaWZpZWRcbiAgICAgIHJldHVybiBlbGVtLmdldEF0dHJpYnV0ZShcInZhbHVlXCIpID09PSBudWxsID8gXCJvblwiIDogZWxlbS52YWx1ZTtcbiAgICB9O1xuICB9XG59KTtcbnZhciByZm9ybUVsZW1zID0gL14oPzppbnB1dHxzZWxlY3R8dGV4dGFyZWEpJC9pLFxuICBya2V5RXZlbnQgPSAvXmtleS8sXG4gIHJtb3VzZUV2ZW50ID0gL14oPzptb3VzZXxjb250ZXh0bWVudSl8Y2xpY2svLFxuICByZm9jdXNNb3JwaCA9IC9eKD86Zm9jdXNpbmZvY3VzfGZvY3Vzb3V0Ymx1cikkLyxcbiAgcnR5cGVuYW1lc3BhY2UgPSAvXihbXi5dKikoPzpcXC4oLispfCkkLztcblxuZnVuY3Rpb24gcmV0dXJuVHJ1ZSgpIHtcbiAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIHJldHVybkZhbHNlKCkge1xuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIHNhZmVBY3RpdmVFbGVtZW50KCkge1xuICB0cnkge1xuICAgIHJldHVybiBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuICB9IGNhdGNoICggZXJyICkgeyB9XG59XG5cbi8qXG4gKiBIZWxwZXIgZnVuY3Rpb25zIGZvciBtYW5hZ2luZyBldmVudHMgLS0gbm90IHBhcnQgb2YgdGhlIHB1YmxpYyBpbnRlcmZhY2UuXG4gKiBQcm9wcyB0byBEZWFuIEVkd2FyZHMnIGFkZEV2ZW50IGxpYnJhcnkgZm9yIG1hbnkgb2YgdGhlIGlkZWFzLlxuICovXG5qUXVlcnkuZXZlbnQgPSB7XG5cbiAgZ2xvYmFsOiB7fSxcblxuICBhZGQ6IGZ1bmN0aW9uKCBlbGVtLCB0eXBlcywgaGFuZGxlciwgZGF0YSwgc2VsZWN0b3IgKSB7XG4gICAgdmFyIHRtcCwgZXZlbnRzLCB0LCBoYW5kbGVPYmpJbixcbiAgICAgIHNwZWNpYWwsIGV2ZW50SGFuZGxlLCBoYW5kbGVPYmosXG4gICAgICBoYW5kbGVycywgdHlwZSwgbmFtZXNwYWNlcywgb3JpZ1R5cGUsXG4gICAgICBlbGVtRGF0YSA9IGpRdWVyeS5fZGF0YSggZWxlbSApO1xuXG4gICAgLy8gRG9uJ3QgYXR0YWNoIGV2ZW50cyB0byBub0RhdGEgb3IgdGV4dC9jb21tZW50IG5vZGVzIChidXQgYWxsb3cgcGxhaW4gb2JqZWN0cylcbiAgICBpZiAoICFlbGVtRGF0YSApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBDYWxsZXIgY2FuIHBhc3MgaW4gYW4gb2JqZWN0IG9mIGN1c3RvbSBkYXRhIGluIGxpZXUgb2YgdGhlIGhhbmRsZXJcbiAgICBpZiAoIGhhbmRsZXIuaGFuZGxlciApIHtcbiAgICAgIGhhbmRsZU9iakluID0gaGFuZGxlcjtcbiAgICAgIGhhbmRsZXIgPSBoYW5kbGVPYmpJbi5oYW5kbGVyO1xuICAgICAgc2VsZWN0b3IgPSBoYW5kbGVPYmpJbi5zZWxlY3RvcjtcbiAgICB9XG5cbiAgICAvLyBNYWtlIHN1cmUgdGhhdCB0aGUgaGFuZGxlciBoYXMgYSB1bmlxdWUgSUQsIHVzZWQgdG8gZmluZC9yZW1vdmUgaXQgbGF0ZXJcbiAgICBpZiAoICFoYW5kbGVyLmd1aWQgKSB7XG4gICAgICBoYW5kbGVyLmd1aWQgPSBqUXVlcnkuZ3VpZCsrO1xuICAgIH1cblxuICAgIC8vIEluaXQgdGhlIGVsZW1lbnQncyBldmVudCBzdHJ1Y3R1cmUgYW5kIG1haW4gaGFuZGxlciwgaWYgdGhpcyBpcyB0aGUgZmlyc3RcbiAgICBpZiAoICEoZXZlbnRzID0gZWxlbURhdGEuZXZlbnRzKSApIHtcbiAgICAgIGV2ZW50cyA9IGVsZW1EYXRhLmV2ZW50cyA9IHt9O1xuICAgIH1cbiAgICBpZiAoICEoZXZlbnRIYW5kbGUgPSBlbGVtRGF0YS5oYW5kbGUpICkge1xuICAgICAgZXZlbnRIYW5kbGUgPSBlbGVtRGF0YS5oYW5kbGUgPSBmdW5jdGlvbiggZSApIHtcbiAgICAgICAgLy8gRGlzY2FyZCB0aGUgc2Vjb25kIGV2ZW50IG9mIGEgalF1ZXJ5LmV2ZW50LnRyaWdnZXIoKSBhbmRcbiAgICAgICAgLy8gd2hlbiBhbiBldmVudCBpcyBjYWxsZWQgYWZ0ZXIgYSBwYWdlIGhhcyB1bmxvYWRlZFxuICAgICAgICByZXR1cm4gdHlwZW9mIGpRdWVyeSAhPT0gY29yZV9zdHJ1bmRlZmluZWQgJiYgKCFlIHx8IGpRdWVyeS5ldmVudC50cmlnZ2VyZWQgIT09IGUudHlwZSkgP1xuICAgICAgICAgIGpRdWVyeS5ldmVudC5kaXNwYXRjaC5hcHBseSggZXZlbnRIYW5kbGUuZWxlbSwgYXJndW1lbnRzICkgOlxuICAgICAgICAgIHVuZGVmaW5lZDtcbiAgICAgIH07XG4gICAgICAvLyBBZGQgZWxlbSBhcyBhIHByb3BlcnR5IG9mIHRoZSBoYW5kbGUgZm4gdG8gcHJldmVudCBhIG1lbW9yeSBsZWFrIHdpdGggSUUgbm9uLW5hdGl2ZSBldmVudHNcbiAgICAgIGV2ZW50SGFuZGxlLmVsZW0gPSBlbGVtO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBtdWx0aXBsZSBldmVudHMgc2VwYXJhdGVkIGJ5IGEgc3BhY2VcbiAgICB0eXBlcyA9ICggdHlwZXMgfHwgXCJcIiApLm1hdGNoKCBjb3JlX3Jub3R3aGl0ZSApIHx8IFtcIlwiXTtcbiAgICB0ID0gdHlwZXMubGVuZ3RoO1xuICAgIHdoaWxlICggdC0tICkge1xuICAgICAgdG1wID0gcnR5cGVuYW1lc3BhY2UuZXhlYyggdHlwZXNbdF0gKSB8fCBbXTtcbiAgICAgIHR5cGUgPSBvcmlnVHlwZSA9IHRtcFsxXTtcbiAgICAgIG5hbWVzcGFjZXMgPSAoIHRtcFsyXSB8fCBcIlwiICkuc3BsaXQoIFwiLlwiICkuc29ydCgpO1xuXG4gICAgICAvLyBUaGVyZSAqbXVzdCogYmUgYSB0eXBlLCBubyBhdHRhY2hpbmcgbmFtZXNwYWNlLW9ubHkgaGFuZGxlcnNcbiAgICAgIGlmICggIXR5cGUgKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiBldmVudCBjaGFuZ2VzIGl0cyB0eXBlLCB1c2UgdGhlIHNwZWNpYWwgZXZlbnQgaGFuZGxlcnMgZm9yIHRoZSBjaGFuZ2VkIHR5cGVcbiAgICAgIHNwZWNpYWwgPSBqUXVlcnkuZXZlbnQuc3BlY2lhbFsgdHlwZSBdIHx8IHt9O1xuXG4gICAgICAvLyBJZiBzZWxlY3RvciBkZWZpbmVkLCBkZXRlcm1pbmUgc3BlY2lhbCBldmVudCBhcGkgdHlwZSwgb3RoZXJ3aXNlIGdpdmVuIHR5cGVcbiAgICAgIHR5cGUgPSAoIHNlbGVjdG9yID8gc3BlY2lhbC5kZWxlZ2F0ZVR5cGUgOiBzcGVjaWFsLmJpbmRUeXBlICkgfHwgdHlwZTtcblxuICAgICAgLy8gVXBkYXRlIHNwZWNpYWwgYmFzZWQgb24gbmV3bHkgcmVzZXQgdHlwZVxuICAgICAgc3BlY2lhbCA9IGpRdWVyeS5ldmVudC5zcGVjaWFsWyB0eXBlIF0gfHwge307XG5cbiAgICAgIC8vIGhhbmRsZU9iaiBpcyBwYXNzZWQgdG8gYWxsIGV2ZW50IGhhbmRsZXJzXG4gICAgICBoYW5kbGVPYmogPSBqUXVlcnkuZXh0ZW5kKHtcbiAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgb3JpZ1R5cGU6IG9yaWdUeXBlLFxuICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICBoYW5kbGVyOiBoYW5kbGVyLFxuICAgICAgICBndWlkOiBoYW5kbGVyLmd1aWQsXG4gICAgICAgIHNlbGVjdG9yOiBzZWxlY3RvcixcbiAgICAgICAgbmVlZHNDb250ZXh0OiBzZWxlY3RvciAmJiBqUXVlcnkuZXhwci5tYXRjaC5uZWVkc0NvbnRleHQudGVzdCggc2VsZWN0b3IgKSxcbiAgICAgICAgbmFtZXNwYWNlOiBuYW1lc3BhY2VzLmpvaW4oXCIuXCIpXG4gICAgICB9LCBoYW5kbGVPYmpJbiApO1xuXG4gICAgICAvLyBJbml0IHRoZSBldmVudCBoYW5kbGVyIHF1ZXVlIGlmIHdlJ3JlIHRoZSBmaXJzdFxuICAgICAgaWYgKCAhKGhhbmRsZXJzID0gZXZlbnRzWyB0eXBlIF0pICkge1xuICAgICAgICBoYW5kbGVycyA9IGV2ZW50c1sgdHlwZSBdID0gW107XG4gICAgICAgIGhhbmRsZXJzLmRlbGVnYXRlQ291bnQgPSAwO1xuXG4gICAgICAgIC8vIE9ubHkgdXNlIGFkZEV2ZW50TGlzdGVuZXIvYXR0YWNoRXZlbnQgaWYgdGhlIHNwZWNpYWwgZXZlbnRzIGhhbmRsZXIgcmV0dXJucyBmYWxzZVxuICAgICAgICBpZiAoICFzcGVjaWFsLnNldHVwIHx8IHNwZWNpYWwuc2V0dXAuY2FsbCggZWxlbSwgZGF0YSwgbmFtZXNwYWNlcywgZXZlbnRIYW5kbGUgKSA9PT0gZmFsc2UgKSB7XG4gICAgICAgICAgLy8gQmluZCB0aGUgZ2xvYmFsIGV2ZW50IGhhbmRsZXIgdG8gdGhlIGVsZW1lbnRcbiAgICAgICAgICBpZiAoIGVsZW0uYWRkRXZlbnRMaXN0ZW5lciApIHtcbiAgICAgICAgICAgIGVsZW0uYWRkRXZlbnRMaXN0ZW5lciggdHlwZSwgZXZlbnRIYW5kbGUsIGZhbHNlICk7XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKCBlbGVtLmF0dGFjaEV2ZW50ICkge1xuICAgICAgICAgICAgZWxlbS5hdHRhY2hFdmVudCggXCJvblwiICsgdHlwZSwgZXZlbnRIYW5kbGUgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCBzcGVjaWFsLmFkZCApIHtcbiAgICAgICAgc3BlY2lhbC5hZGQuY2FsbCggZWxlbSwgaGFuZGxlT2JqICk7XG5cbiAgICAgICAgaWYgKCAhaGFuZGxlT2JqLmhhbmRsZXIuZ3VpZCApIHtcbiAgICAgICAgICBoYW5kbGVPYmouaGFuZGxlci5ndWlkID0gaGFuZGxlci5ndWlkO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIEFkZCB0byB0aGUgZWxlbWVudCdzIGhhbmRsZXIgbGlzdCwgZGVsZWdhdGVzIGluIGZyb250XG4gICAgICBpZiAoIHNlbGVjdG9yICkge1xuICAgICAgICBoYW5kbGVycy5zcGxpY2UoIGhhbmRsZXJzLmRlbGVnYXRlQ291bnQrKywgMCwgaGFuZGxlT2JqICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBoYW5kbGVycy5wdXNoKCBoYW5kbGVPYmogKTtcbiAgICAgIH1cblxuICAgICAgLy8gS2VlcCB0cmFjayBvZiB3aGljaCBldmVudHMgaGF2ZSBldmVyIGJlZW4gdXNlZCwgZm9yIGV2ZW50IG9wdGltaXphdGlvblxuICAgICAgalF1ZXJ5LmV2ZW50Lmdsb2JhbFsgdHlwZSBdID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBOdWxsaWZ5IGVsZW0gdG8gcHJldmVudCBtZW1vcnkgbGVha3MgaW4gSUVcbiAgICBlbGVtID0gbnVsbDtcbiAgfSxcblxuICAvLyBEZXRhY2ggYW4gZXZlbnQgb3Igc2V0IG9mIGV2ZW50cyBmcm9tIGFuIGVsZW1lbnRcbiAgcmVtb3ZlOiBmdW5jdGlvbiggZWxlbSwgdHlwZXMsIGhhbmRsZXIsIHNlbGVjdG9yLCBtYXBwZWRUeXBlcyApIHtcbiAgICB2YXIgaiwgaGFuZGxlT2JqLCB0bXAsXG4gICAgICBvcmlnQ291bnQsIHQsIGV2ZW50cyxcbiAgICAgIHNwZWNpYWwsIGhhbmRsZXJzLCB0eXBlLFxuICAgICAgbmFtZXNwYWNlcywgb3JpZ1R5cGUsXG4gICAgICBlbGVtRGF0YSA9IGpRdWVyeS5oYXNEYXRhKCBlbGVtICkgJiYgalF1ZXJ5Ll9kYXRhKCBlbGVtICk7XG5cbiAgICBpZiAoICFlbGVtRGF0YSB8fCAhKGV2ZW50cyA9IGVsZW1EYXRhLmV2ZW50cykgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gT25jZSBmb3IgZWFjaCB0eXBlLm5hbWVzcGFjZSBpbiB0eXBlczsgdHlwZSBtYXkgYmUgb21pdHRlZFxuICAgIHR5cGVzID0gKCB0eXBlcyB8fCBcIlwiICkubWF0Y2goIGNvcmVfcm5vdHdoaXRlICkgfHwgW1wiXCJdO1xuICAgIHQgPSB0eXBlcy5sZW5ndGg7XG4gICAgd2hpbGUgKCB0LS0gKSB7XG4gICAgICB0bXAgPSBydHlwZW5hbWVzcGFjZS5leGVjKCB0eXBlc1t0XSApIHx8IFtdO1xuICAgICAgdHlwZSA9IG9yaWdUeXBlID0gdG1wWzFdO1xuICAgICAgbmFtZXNwYWNlcyA9ICggdG1wWzJdIHx8IFwiXCIgKS5zcGxpdCggXCIuXCIgKS5zb3J0KCk7XG5cbiAgICAgIC8vIFVuYmluZCBhbGwgZXZlbnRzIChvbiB0aGlzIG5hbWVzcGFjZSwgaWYgcHJvdmlkZWQpIGZvciB0aGUgZWxlbWVudFxuICAgICAgaWYgKCAhdHlwZSApIHtcbiAgICAgICAgZm9yICggdHlwZSBpbiBldmVudHMgKSB7XG4gICAgICAgICAgalF1ZXJ5LmV2ZW50LnJlbW92ZSggZWxlbSwgdHlwZSArIHR5cGVzWyB0IF0sIGhhbmRsZXIsIHNlbGVjdG9yLCB0cnVlICk7XG4gICAgICAgIH1cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIHNwZWNpYWwgPSBqUXVlcnkuZXZlbnQuc3BlY2lhbFsgdHlwZSBdIHx8IHt9O1xuICAgICAgdHlwZSA9ICggc2VsZWN0b3IgPyBzcGVjaWFsLmRlbGVnYXRlVHlwZSA6IHNwZWNpYWwuYmluZFR5cGUgKSB8fCB0eXBlO1xuICAgICAgaGFuZGxlcnMgPSBldmVudHNbIHR5cGUgXSB8fCBbXTtcbiAgICAgIHRtcCA9IHRtcFsyXSAmJiBuZXcgUmVnRXhwKCBcIihefFxcXFwuKVwiICsgbmFtZXNwYWNlcy5qb2luKFwiXFxcXC4oPzouKlxcXFwufClcIikgKyBcIihcXFxcLnwkKVwiICk7XG5cbiAgICAgIC8vIFJlbW92ZSBtYXRjaGluZyBldmVudHNcbiAgICAgIG9yaWdDb3VudCA9IGogPSBoYW5kbGVycy5sZW5ndGg7XG4gICAgICB3aGlsZSAoIGotLSApIHtcbiAgICAgICAgaGFuZGxlT2JqID0gaGFuZGxlcnNbIGogXTtcblxuICAgICAgICBpZiAoICggbWFwcGVkVHlwZXMgfHwgb3JpZ1R5cGUgPT09IGhhbmRsZU9iai5vcmlnVHlwZSApICYmXG4gICAgICAgICAgKCAhaGFuZGxlciB8fCBoYW5kbGVyLmd1aWQgPT09IGhhbmRsZU9iai5ndWlkICkgJiZcbiAgICAgICAgICAoICF0bXAgfHwgdG1wLnRlc3QoIGhhbmRsZU9iai5uYW1lc3BhY2UgKSApICYmXG4gICAgICAgICAgKCAhc2VsZWN0b3IgfHwgc2VsZWN0b3IgPT09IGhhbmRsZU9iai5zZWxlY3RvciB8fCBzZWxlY3RvciA9PT0gXCIqKlwiICYmIGhhbmRsZU9iai5zZWxlY3RvciApICkge1xuICAgICAgICAgIGhhbmRsZXJzLnNwbGljZSggaiwgMSApO1xuXG4gICAgICAgICAgaWYgKCBoYW5kbGVPYmouc2VsZWN0b3IgKSB7XG4gICAgICAgICAgICBoYW5kbGVycy5kZWxlZ2F0ZUNvdW50LS07XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICggc3BlY2lhbC5yZW1vdmUgKSB7XG4gICAgICAgICAgICBzcGVjaWFsLnJlbW92ZS5jYWxsKCBlbGVtLCBoYW5kbGVPYmogKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gUmVtb3ZlIGdlbmVyaWMgZXZlbnQgaGFuZGxlciBpZiB3ZSByZW1vdmVkIHNvbWV0aGluZyBhbmQgbm8gbW9yZSBoYW5kbGVycyBleGlzdFxuICAgICAgLy8gKGF2b2lkcyBwb3RlbnRpYWwgZm9yIGVuZGxlc3MgcmVjdXJzaW9uIGR1cmluZyByZW1vdmFsIG9mIHNwZWNpYWwgZXZlbnQgaGFuZGxlcnMpXG4gICAgICBpZiAoIG9yaWdDb3VudCAmJiAhaGFuZGxlcnMubGVuZ3RoICkge1xuICAgICAgICBpZiAoICFzcGVjaWFsLnRlYXJkb3duIHx8IHNwZWNpYWwudGVhcmRvd24uY2FsbCggZWxlbSwgbmFtZXNwYWNlcywgZWxlbURhdGEuaGFuZGxlICkgPT09IGZhbHNlICkge1xuICAgICAgICAgIGpRdWVyeS5yZW1vdmVFdmVudCggZWxlbSwgdHlwZSwgZWxlbURhdGEuaGFuZGxlICk7XG4gICAgICAgIH1cblxuICAgICAgICBkZWxldGUgZXZlbnRzWyB0eXBlIF07XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIHRoZSBleHBhbmRvIGlmIGl0J3Mgbm8gbG9uZ2VyIHVzZWRcbiAgICBpZiAoIGpRdWVyeS5pc0VtcHR5T2JqZWN0KCBldmVudHMgKSApIHtcbiAgICAgIGRlbGV0ZSBlbGVtRGF0YS5oYW5kbGU7XG5cbiAgICAgIC8vIHJlbW92ZURhdGEgYWxzbyBjaGVja3MgZm9yIGVtcHRpbmVzcyBhbmQgY2xlYXJzIHRoZSBleHBhbmRvIGlmIGVtcHR5XG4gICAgICAvLyBzbyB1c2UgaXQgaW5zdGVhZCBvZiBkZWxldGVcbiAgICAgIGpRdWVyeS5fcmVtb3ZlRGF0YSggZWxlbSwgXCJldmVudHNcIiApO1xuICAgIH1cbiAgfSxcblxuICB0cmlnZ2VyOiBmdW5jdGlvbiggZXZlbnQsIGRhdGEsIGVsZW0sIG9ubHlIYW5kbGVycyApIHtcbiAgICB2YXIgaGFuZGxlLCBvbnR5cGUsIGN1cixcbiAgICAgIGJ1YmJsZVR5cGUsIHNwZWNpYWwsIHRtcCwgaSxcbiAgICAgIGV2ZW50UGF0aCA9IFsgZWxlbSB8fCBkb2N1bWVudCBdLFxuICAgICAgdHlwZSA9IGNvcmVfaGFzT3duLmNhbGwoIGV2ZW50LCBcInR5cGVcIiApID8gZXZlbnQudHlwZSA6IGV2ZW50LFxuICAgICAgbmFtZXNwYWNlcyA9IGNvcmVfaGFzT3duLmNhbGwoIGV2ZW50LCBcIm5hbWVzcGFjZVwiICkgPyBldmVudC5uYW1lc3BhY2Uuc3BsaXQoXCIuXCIpIDogW107XG5cbiAgICBjdXIgPSB0bXAgPSBlbGVtID0gZWxlbSB8fCBkb2N1bWVudDtcblxuICAgIC8vIERvbid0IGRvIGV2ZW50cyBvbiB0ZXh0IGFuZCBjb21tZW50IG5vZGVzXG4gICAgaWYgKCBlbGVtLm5vZGVUeXBlID09PSAzIHx8IGVsZW0ubm9kZVR5cGUgPT09IDggKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gZm9jdXMvYmx1ciBtb3JwaHMgdG8gZm9jdXNpbi9vdXQ7IGVuc3VyZSB3ZSdyZSBub3QgZmlyaW5nIHRoZW0gcmlnaHQgbm93XG4gICAgaWYgKCByZm9jdXNNb3JwaC50ZXN0KCB0eXBlICsgalF1ZXJ5LmV2ZW50LnRyaWdnZXJlZCApICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICggdHlwZS5pbmRleE9mKFwiLlwiKSA+PSAwICkge1xuICAgICAgLy8gTmFtZXNwYWNlZCB0cmlnZ2VyOyBjcmVhdGUgYSByZWdleHAgdG8gbWF0Y2ggZXZlbnQgdHlwZSBpbiBoYW5kbGUoKVxuICAgICAgbmFtZXNwYWNlcyA9IHR5cGUuc3BsaXQoXCIuXCIpO1xuICAgICAgdHlwZSA9IG5hbWVzcGFjZXMuc2hpZnQoKTtcbiAgICAgIG5hbWVzcGFjZXMuc29ydCgpO1xuICAgIH1cbiAgICBvbnR5cGUgPSB0eXBlLmluZGV4T2YoXCI6XCIpIDwgMCAmJiBcIm9uXCIgKyB0eXBlO1xuXG4gICAgLy8gQ2FsbGVyIGNhbiBwYXNzIGluIGEgalF1ZXJ5LkV2ZW50IG9iamVjdCwgT2JqZWN0LCBvciBqdXN0IGFuIGV2ZW50IHR5cGUgc3RyaW5nXG4gICAgZXZlbnQgPSBldmVudFsgalF1ZXJ5LmV4cGFuZG8gXSA/XG4gICAgICBldmVudCA6XG4gICAgICBuZXcgalF1ZXJ5LkV2ZW50KCB0eXBlLCB0eXBlb2YgZXZlbnQgPT09IFwib2JqZWN0XCIgJiYgZXZlbnQgKTtcblxuICAgIC8vIFRyaWdnZXIgYml0bWFzazogJiAxIGZvciBuYXRpdmUgaGFuZGxlcnM7ICYgMiBmb3IgalF1ZXJ5IChhbHdheXMgdHJ1ZSlcbiAgICBldmVudC5pc1RyaWdnZXIgPSBvbmx5SGFuZGxlcnMgPyAyIDogMztcbiAgICBldmVudC5uYW1lc3BhY2UgPSBuYW1lc3BhY2VzLmpvaW4oXCIuXCIpO1xuICAgIGV2ZW50Lm5hbWVzcGFjZV9yZSA9IGV2ZW50Lm5hbWVzcGFjZSA/XG4gICAgICBuZXcgUmVnRXhwKCBcIihefFxcXFwuKVwiICsgbmFtZXNwYWNlcy5qb2luKFwiXFxcXC4oPzouKlxcXFwufClcIikgKyBcIihcXFxcLnwkKVwiICkgOlxuICAgICAgbnVsbDtcblxuICAgIC8vIENsZWFuIHVwIHRoZSBldmVudCBpbiBjYXNlIGl0IGlzIGJlaW5nIHJldXNlZFxuICAgIGV2ZW50LnJlc3VsdCA9IHVuZGVmaW5lZDtcbiAgICBpZiAoICFldmVudC50YXJnZXQgKSB7XG4gICAgICBldmVudC50YXJnZXQgPSBlbGVtO1xuICAgIH1cblxuICAgIC8vIENsb25lIGFueSBpbmNvbWluZyBkYXRhIGFuZCBwcmVwZW5kIHRoZSBldmVudCwgY3JlYXRpbmcgdGhlIGhhbmRsZXIgYXJnIGxpc3RcbiAgICBkYXRhID0gZGF0YSA9PSBudWxsID9cbiAgICAgIFsgZXZlbnQgXSA6XG4gICAgICBqUXVlcnkubWFrZUFycmF5KCBkYXRhLCBbIGV2ZW50IF0gKTtcblxuICAgIC8vIEFsbG93IHNwZWNpYWwgZXZlbnRzIHRvIGRyYXcgb3V0c2lkZSB0aGUgbGluZXNcbiAgICBzcGVjaWFsID0galF1ZXJ5LmV2ZW50LnNwZWNpYWxbIHR5cGUgXSB8fCB7fTtcbiAgICBpZiAoICFvbmx5SGFuZGxlcnMgJiYgc3BlY2lhbC50cmlnZ2VyICYmIHNwZWNpYWwudHJpZ2dlci5hcHBseSggZWxlbSwgZGF0YSApID09PSBmYWxzZSApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBEZXRlcm1pbmUgZXZlbnQgcHJvcGFnYXRpb24gcGF0aCBpbiBhZHZhbmNlLCBwZXIgVzNDIGV2ZW50cyBzcGVjICgjOTk1MSlcbiAgICAvLyBCdWJibGUgdXAgdG8gZG9jdW1lbnQsIHRoZW4gdG8gd2luZG93OyB3YXRjaCBmb3IgYSBnbG9iYWwgb3duZXJEb2N1bWVudCB2YXIgKCM5NzI0KVxuICAgIGlmICggIW9ubHlIYW5kbGVycyAmJiAhc3BlY2lhbC5ub0J1YmJsZSAmJiAhalF1ZXJ5LmlzV2luZG93KCBlbGVtICkgKSB7XG5cbiAgICAgIGJ1YmJsZVR5cGUgPSBzcGVjaWFsLmRlbGVnYXRlVHlwZSB8fCB0eXBlO1xuICAgICAgaWYgKCAhcmZvY3VzTW9ycGgudGVzdCggYnViYmxlVHlwZSArIHR5cGUgKSApIHtcbiAgICAgICAgY3VyID0gY3VyLnBhcmVudE5vZGU7XG4gICAgICB9XG4gICAgICBmb3IgKCA7IGN1cjsgY3VyID0gY3VyLnBhcmVudE5vZGUgKSB7XG4gICAgICAgIGV2ZW50UGF0aC5wdXNoKCBjdXIgKTtcbiAgICAgICAgdG1wID0gY3VyO1xuICAgICAgfVxuXG4gICAgICAvLyBPbmx5IGFkZCB3aW5kb3cgaWYgd2UgZ290IHRvIGRvY3VtZW50IChlLmcuLCBub3QgcGxhaW4gb2JqIG9yIGRldGFjaGVkIERPTSlcbiAgICAgIGlmICggdG1wID09PSAoZWxlbS5vd25lckRvY3VtZW50IHx8IGRvY3VtZW50KSApIHtcbiAgICAgICAgZXZlbnRQYXRoLnB1c2goIHRtcC5kZWZhdWx0VmlldyB8fCB0bXAucGFyZW50V2luZG93IHx8IHdpbmRvdyApO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEZpcmUgaGFuZGxlcnMgb24gdGhlIGV2ZW50IHBhdGhcbiAgICBpID0gMDtcbiAgICB3aGlsZSAoIChjdXIgPSBldmVudFBhdGhbaSsrXSkgJiYgIWV2ZW50LmlzUHJvcGFnYXRpb25TdG9wcGVkKCkgKSB7XG5cbiAgICAgIGV2ZW50LnR5cGUgPSBpID4gMSA/XG4gICAgICAgIGJ1YmJsZVR5cGUgOlxuICAgICAgICBzcGVjaWFsLmJpbmRUeXBlIHx8IHR5cGU7XG5cbiAgICAgIC8vIGpRdWVyeSBoYW5kbGVyXG4gICAgICBoYW5kbGUgPSAoIGpRdWVyeS5fZGF0YSggY3VyLCBcImV2ZW50c1wiICkgfHwge30gKVsgZXZlbnQudHlwZSBdICYmIGpRdWVyeS5fZGF0YSggY3VyLCBcImhhbmRsZVwiICk7XG4gICAgICBpZiAoIGhhbmRsZSApIHtcbiAgICAgICAgaGFuZGxlLmFwcGx5KCBjdXIsIGRhdGEgKTtcbiAgICAgIH1cblxuICAgICAgLy8gTmF0aXZlIGhhbmRsZXJcbiAgICAgIGhhbmRsZSA9IG9udHlwZSAmJiBjdXJbIG9udHlwZSBdO1xuICAgICAgaWYgKCBoYW5kbGUgJiYgalF1ZXJ5LmFjY2VwdERhdGEoIGN1ciApICYmIGhhbmRsZS5hcHBseSAmJiBoYW5kbGUuYXBwbHkoIGN1ciwgZGF0YSApID09PSBmYWxzZSApIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZXZlbnQudHlwZSA9IHR5cGU7XG5cbiAgICAvLyBJZiBub2JvZHkgcHJldmVudGVkIHRoZSBkZWZhdWx0IGFjdGlvbiwgZG8gaXQgbm93XG4gICAgaWYgKCAhb25seUhhbmRsZXJzICYmICFldmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSApIHtcblxuICAgICAgaWYgKCAoIXNwZWNpYWwuX2RlZmF1bHQgfHwgc3BlY2lhbC5fZGVmYXVsdC5hcHBseSggZXZlbnRQYXRoLnBvcCgpLCBkYXRhICkgPT09IGZhbHNlKSAmJlxuICAgICAgICBqUXVlcnkuYWNjZXB0RGF0YSggZWxlbSApICkge1xuXG4gICAgICAgIC8vIENhbGwgYSBuYXRpdmUgRE9NIG1ldGhvZCBvbiB0aGUgdGFyZ2V0IHdpdGggdGhlIHNhbWUgbmFtZSBuYW1lIGFzIHRoZSBldmVudC5cbiAgICAgICAgLy8gQ2FuJ3QgdXNlIGFuIC5pc0Z1bmN0aW9uKCkgY2hlY2sgaGVyZSBiZWNhdXNlIElFNi83IGZhaWxzIHRoYXQgdGVzdC5cbiAgICAgICAgLy8gRG9uJ3QgZG8gZGVmYXVsdCBhY3Rpb25zIG9uIHdpbmRvdywgdGhhdCdzIHdoZXJlIGdsb2JhbCB2YXJpYWJsZXMgYmUgKCM2MTcwKVxuICAgICAgICBpZiAoIG9udHlwZSAmJiBlbGVtWyB0eXBlIF0gJiYgIWpRdWVyeS5pc1dpbmRvdyggZWxlbSApICkge1xuXG4gICAgICAgICAgLy8gRG9uJ3QgcmUtdHJpZ2dlciBhbiBvbkZPTyBldmVudCB3aGVuIHdlIGNhbGwgaXRzIEZPTygpIG1ldGhvZFxuICAgICAgICAgIHRtcCA9IGVsZW1bIG9udHlwZSBdO1xuXG4gICAgICAgICAgaWYgKCB0bXAgKSB7XG4gICAgICAgICAgICBlbGVtWyBvbnR5cGUgXSA9IG51bGw7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gUHJldmVudCByZS10cmlnZ2VyaW5nIG9mIHRoZSBzYW1lIGV2ZW50LCBzaW5jZSB3ZSBhbHJlYWR5IGJ1YmJsZWQgaXQgYWJvdmVcbiAgICAgICAgICBqUXVlcnkuZXZlbnQudHJpZ2dlcmVkID0gdHlwZTtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgZWxlbVsgdHlwZSBdKCk7XG4gICAgICAgICAgfSBjYXRjaCAoIGUgKSB7XG4gICAgICAgICAgICAvLyBJRTw5IGRpZXMgb24gZm9jdXMvYmx1ciB0byBoaWRkZW4gZWxlbWVudCAoIzE0ODYsIzEyNTE4KVxuICAgICAgICAgICAgLy8gb25seSByZXByb2R1Y2libGUgb24gd2luWFAgSUU4IG5hdGl2ZSwgbm90IElFOSBpbiBJRTggbW9kZVxuICAgICAgICAgIH1cbiAgICAgICAgICBqUXVlcnkuZXZlbnQudHJpZ2dlcmVkID0gdW5kZWZpbmVkO1xuXG4gICAgICAgICAgaWYgKCB0bXAgKSB7XG4gICAgICAgICAgICBlbGVtWyBvbnR5cGUgXSA9IHRtcDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZXZlbnQucmVzdWx0O1xuICB9LFxuXG4gIGRpc3BhdGNoOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cbiAgICAvLyBNYWtlIGEgd3JpdGFibGUgalF1ZXJ5LkV2ZW50IGZyb20gdGhlIG5hdGl2ZSBldmVudCBvYmplY3RcbiAgICBldmVudCA9IGpRdWVyeS5ldmVudC5maXgoIGV2ZW50ICk7XG5cbiAgICB2YXIgaSwgcmV0LCBoYW5kbGVPYmosIG1hdGNoZWQsIGosXG4gICAgICBoYW5kbGVyUXVldWUgPSBbXSxcbiAgICAgIGFyZ3MgPSBjb3JlX3NsaWNlLmNhbGwoIGFyZ3VtZW50cyApLFxuICAgICAgaGFuZGxlcnMgPSAoIGpRdWVyeS5fZGF0YSggdGhpcywgXCJldmVudHNcIiApIHx8IHt9IClbIGV2ZW50LnR5cGUgXSB8fCBbXSxcbiAgICAgIHNwZWNpYWwgPSBqUXVlcnkuZXZlbnQuc3BlY2lhbFsgZXZlbnQudHlwZSBdIHx8IHt9O1xuXG4gICAgLy8gVXNlIHRoZSBmaXgtZWQgalF1ZXJ5LkV2ZW50IHJhdGhlciB0aGFuIHRoZSAocmVhZC1vbmx5KSBuYXRpdmUgZXZlbnRcbiAgICBhcmdzWzBdID0gZXZlbnQ7XG4gICAgZXZlbnQuZGVsZWdhdGVUYXJnZXQgPSB0aGlzO1xuXG4gICAgLy8gQ2FsbCB0aGUgcHJlRGlzcGF0Y2ggaG9vayBmb3IgdGhlIG1hcHBlZCB0eXBlLCBhbmQgbGV0IGl0IGJhaWwgaWYgZGVzaXJlZFxuICAgIGlmICggc3BlY2lhbC5wcmVEaXNwYXRjaCAmJiBzcGVjaWFsLnByZURpc3BhdGNoLmNhbGwoIHRoaXMsIGV2ZW50ICkgPT09IGZhbHNlICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIERldGVybWluZSBoYW5kbGVyc1xuICAgIGhhbmRsZXJRdWV1ZSA9IGpRdWVyeS5ldmVudC5oYW5kbGVycy5jYWxsKCB0aGlzLCBldmVudCwgaGFuZGxlcnMgKTtcblxuICAgIC8vIFJ1biBkZWxlZ2F0ZXMgZmlyc3Q7IHRoZXkgbWF5IHdhbnQgdG8gc3RvcCBwcm9wYWdhdGlvbiBiZW5lYXRoIHVzXG4gICAgaSA9IDA7XG4gICAgd2hpbGUgKCAobWF0Y2hlZCA9IGhhbmRsZXJRdWV1ZVsgaSsrIF0pICYmICFldmVudC5pc1Byb3BhZ2F0aW9uU3RvcHBlZCgpICkge1xuICAgICAgZXZlbnQuY3VycmVudFRhcmdldCA9IG1hdGNoZWQuZWxlbTtcblxuICAgICAgaiA9IDA7XG4gICAgICB3aGlsZSAoIChoYW5kbGVPYmogPSBtYXRjaGVkLmhhbmRsZXJzWyBqKysgXSkgJiYgIWV2ZW50LmlzSW1tZWRpYXRlUHJvcGFnYXRpb25TdG9wcGVkKCkgKSB7XG5cbiAgICAgICAgLy8gVHJpZ2dlcmVkIGV2ZW50IG11c3QgZWl0aGVyIDEpIGhhdmUgbm8gbmFtZXNwYWNlLCBvclxuICAgICAgICAvLyAyKSBoYXZlIG5hbWVzcGFjZShzKSBhIHN1YnNldCBvciBlcXVhbCB0byB0aG9zZSBpbiB0aGUgYm91bmQgZXZlbnQgKGJvdGggY2FuIGhhdmUgbm8gbmFtZXNwYWNlKS5cbiAgICAgICAgaWYgKCAhZXZlbnQubmFtZXNwYWNlX3JlIHx8IGV2ZW50Lm5hbWVzcGFjZV9yZS50ZXN0KCBoYW5kbGVPYmoubmFtZXNwYWNlICkgKSB7XG5cbiAgICAgICAgICBldmVudC5oYW5kbGVPYmogPSBoYW5kbGVPYmo7XG4gICAgICAgICAgZXZlbnQuZGF0YSA9IGhhbmRsZU9iai5kYXRhO1xuXG4gICAgICAgICAgcmV0ID0gKCAoalF1ZXJ5LmV2ZW50LnNwZWNpYWxbIGhhbmRsZU9iai5vcmlnVHlwZSBdIHx8IHt9KS5oYW5kbGUgfHwgaGFuZGxlT2JqLmhhbmRsZXIgKVxuICAgICAgICAgICAgICAuYXBwbHkoIG1hdGNoZWQuZWxlbSwgYXJncyApO1xuXG4gICAgICAgICAgaWYgKCByZXQgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIGlmICggKGV2ZW50LnJlc3VsdCA9IHJldCkgPT09IGZhbHNlICkge1xuICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDYWxsIHRoZSBwb3N0RGlzcGF0Y2ggaG9vayBmb3IgdGhlIG1hcHBlZCB0eXBlXG4gICAgaWYgKCBzcGVjaWFsLnBvc3REaXNwYXRjaCApIHtcbiAgICAgIHNwZWNpYWwucG9zdERpc3BhdGNoLmNhbGwoIHRoaXMsIGV2ZW50ICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGV2ZW50LnJlc3VsdDtcbiAgfSxcblxuICBoYW5kbGVyczogZnVuY3Rpb24oIGV2ZW50LCBoYW5kbGVycyApIHtcbiAgICB2YXIgc2VsLCBoYW5kbGVPYmosIG1hdGNoZXMsIGksXG4gICAgICBoYW5kbGVyUXVldWUgPSBbXSxcbiAgICAgIGRlbGVnYXRlQ291bnQgPSBoYW5kbGVycy5kZWxlZ2F0ZUNvdW50LFxuICAgICAgY3VyID0gZXZlbnQudGFyZ2V0O1xuXG4gICAgLy8gRmluZCBkZWxlZ2F0ZSBoYW5kbGVyc1xuICAgIC8vIEJsYWNrLWhvbGUgU1ZHIDx1c2U+IGluc3RhbmNlIHRyZWVzICgjMTMxODApXG4gICAgLy8gQXZvaWQgbm9uLWxlZnQtY2xpY2sgYnViYmxpbmcgaW4gRmlyZWZveCAoIzM4NjEpXG4gICAgaWYgKCBkZWxlZ2F0ZUNvdW50ICYmIGN1ci5ub2RlVHlwZSAmJiAoIWV2ZW50LmJ1dHRvbiB8fCBldmVudC50eXBlICE9PSBcImNsaWNrXCIpICkge1xuXG4gICAgICAvKiBqc2hpbnQgZXFlcWVxOiBmYWxzZSAqL1xuICAgICAgZm9yICggOyBjdXIgIT0gdGhpczsgY3VyID0gY3VyLnBhcmVudE5vZGUgfHwgdGhpcyApIHtcbiAgICAgICAgLyoganNoaW50IGVxZXFlcTogdHJ1ZSAqL1xuXG4gICAgICAgIC8vIERvbid0IGNoZWNrIG5vbi1lbGVtZW50cyAoIzEzMjA4KVxuICAgICAgICAvLyBEb24ndCBwcm9jZXNzIGNsaWNrcyBvbiBkaXNhYmxlZCBlbGVtZW50cyAoIzY5MTEsICM4MTY1LCAjMTEzODIsICMxMTc2NClcbiAgICAgICAgaWYgKCBjdXIubm9kZVR5cGUgPT09IDEgJiYgKGN1ci5kaXNhYmxlZCAhPT0gdHJ1ZSB8fCBldmVudC50eXBlICE9PSBcImNsaWNrXCIpICkge1xuICAgICAgICAgIG1hdGNoZXMgPSBbXTtcbiAgICAgICAgICBmb3IgKCBpID0gMDsgaSA8IGRlbGVnYXRlQ291bnQ7IGkrKyApIHtcbiAgICAgICAgICAgIGhhbmRsZU9iaiA9IGhhbmRsZXJzWyBpIF07XG5cbiAgICAgICAgICAgIC8vIERvbid0IGNvbmZsaWN0IHdpdGggT2JqZWN0LnByb3RvdHlwZSBwcm9wZXJ0aWVzICgjMTMyMDMpXG4gICAgICAgICAgICBzZWwgPSBoYW5kbGVPYmouc2VsZWN0b3IgKyBcIiBcIjtcblxuICAgICAgICAgICAgaWYgKCBtYXRjaGVzWyBzZWwgXSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgICBtYXRjaGVzWyBzZWwgXSA9IGhhbmRsZU9iai5uZWVkc0NvbnRleHQgP1xuICAgICAgICAgICAgICAgIGpRdWVyeSggc2VsLCB0aGlzICkuaW5kZXgoIGN1ciApID49IDAgOlxuICAgICAgICAgICAgICAgIGpRdWVyeS5maW5kKCBzZWwsIHRoaXMsIG51bGwsIFsgY3VyIF0gKS5sZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIG1hdGNoZXNbIHNlbCBdICkge1xuICAgICAgICAgICAgICBtYXRjaGVzLnB1c2goIGhhbmRsZU9iaiApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIG1hdGNoZXMubGVuZ3RoICkge1xuICAgICAgICAgICAgaGFuZGxlclF1ZXVlLnB1c2goeyBlbGVtOiBjdXIsIGhhbmRsZXJzOiBtYXRjaGVzIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFkZCB0aGUgcmVtYWluaW5nIChkaXJlY3RseS1ib3VuZCkgaGFuZGxlcnNcbiAgICBpZiAoIGRlbGVnYXRlQ291bnQgPCBoYW5kbGVycy5sZW5ndGggKSB7XG4gICAgICBoYW5kbGVyUXVldWUucHVzaCh7IGVsZW06IHRoaXMsIGhhbmRsZXJzOiBoYW5kbGVycy5zbGljZSggZGVsZWdhdGVDb3VudCApIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBoYW5kbGVyUXVldWU7XG4gIH0sXG5cbiAgZml4OiBmdW5jdGlvbiggZXZlbnQgKSB7XG4gICAgaWYgKCBldmVudFsgalF1ZXJ5LmV4cGFuZG8gXSApIHtcbiAgICAgIHJldHVybiBldmVudDtcbiAgICB9XG5cbiAgICAvLyBDcmVhdGUgYSB3cml0YWJsZSBjb3B5IG9mIHRoZSBldmVudCBvYmplY3QgYW5kIG5vcm1hbGl6ZSBzb21lIHByb3BlcnRpZXNcbiAgICB2YXIgaSwgcHJvcCwgY29weSxcbiAgICAgIHR5cGUgPSBldmVudC50eXBlLFxuICAgICAgb3JpZ2luYWxFdmVudCA9IGV2ZW50LFxuICAgICAgZml4SG9vayA9IHRoaXMuZml4SG9va3NbIHR5cGUgXTtcblxuICAgIGlmICggIWZpeEhvb2sgKSB7XG4gICAgICB0aGlzLmZpeEhvb2tzWyB0eXBlIF0gPSBmaXhIb29rID1cbiAgICAgICAgcm1vdXNlRXZlbnQudGVzdCggdHlwZSApID8gdGhpcy5tb3VzZUhvb2tzIDpcbiAgICAgICAgcmtleUV2ZW50LnRlc3QoIHR5cGUgKSA/IHRoaXMua2V5SG9va3MgOlxuICAgICAgICB7fTtcbiAgICB9XG4gICAgY29weSA9IGZpeEhvb2sucHJvcHMgPyB0aGlzLnByb3BzLmNvbmNhdCggZml4SG9vay5wcm9wcyApIDogdGhpcy5wcm9wcztcblxuICAgIGV2ZW50ID0gbmV3IGpRdWVyeS5FdmVudCggb3JpZ2luYWxFdmVudCApO1xuXG4gICAgaSA9IGNvcHkubGVuZ3RoO1xuICAgIHdoaWxlICggaS0tICkge1xuICAgICAgcHJvcCA9IGNvcHlbIGkgXTtcbiAgICAgIGV2ZW50WyBwcm9wIF0gPSBvcmlnaW5hbEV2ZW50WyBwcm9wIF07XG4gICAgfVxuXG4gICAgLy8gU3VwcG9ydDogSUU8OVxuICAgIC8vIEZpeCB0YXJnZXQgcHJvcGVydHkgKCMxOTI1KVxuICAgIGlmICggIWV2ZW50LnRhcmdldCApIHtcbiAgICAgIGV2ZW50LnRhcmdldCA9IG9yaWdpbmFsRXZlbnQuc3JjRWxlbWVudCB8fCBkb2N1bWVudDtcbiAgICB9XG5cbiAgICAvLyBTdXBwb3J0OiBDaHJvbWUgMjMrLCBTYWZhcmk/XG4gICAgLy8gVGFyZ2V0IHNob3VsZCBub3QgYmUgYSB0ZXh0IG5vZGUgKCM1MDQsICMxMzE0MylcbiAgICBpZiAoIGV2ZW50LnRhcmdldC5ub2RlVHlwZSA9PT0gMyApIHtcbiAgICAgIGV2ZW50LnRhcmdldCA9IGV2ZW50LnRhcmdldC5wYXJlbnROb2RlO1xuICAgIH1cblxuICAgIC8vIFN1cHBvcnQ6IElFPDlcbiAgICAvLyBGb3IgbW91c2Uva2V5IGV2ZW50cywgbWV0YUtleT09ZmFsc2UgaWYgaXQncyB1bmRlZmluZWQgKCMzMzY4LCAjMTEzMjgpXG4gICAgZXZlbnQubWV0YUtleSA9ICEhZXZlbnQubWV0YUtleTtcblxuICAgIHJldHVybiBmaXhIb29rLmZpbHRlciA/IGZpeEhvb2suZmlsdGVyKCBldmVudCwgb3JpZ2luYWxFdmVudCApIDogZXZlbnQ7XG4gIH0sXG5cbiAgLy8gSW5jbHVkZXMgc29tZSBldmVudCBwcm9wcyBzaGFyZWQgYnkgS2V5RXZlbnQgYW5kIE1vdXNlRXZlbnRcbiAgcHJvcHM6IFwiYWx0S2V5IGJ1YmJsZXMgY2FuY2VsYWJsZSBjdHJsS2V5IGN1cnJlbnRUYXJnZXQgZXZlbnRQaGFzZSBtZXRhS2V5IHJlbGF0ZWRUYXJnZXQgc2hpZnRLZXkgdGFyZ2V0IHRpbWVTdGFtcCB2aWV3IHdoaWNoXCIuc3BsaXQoXCIgXCIpLFxuXG4gIGZpeEhvb2tzOiB7fSxcblxuICBrZXlIb29rczoge1xuICAgIHByb3BzOiBcImNoYXIgY2hhckNvZGUga2V5IGtleUNvZGVcIi5zcGxpdChcIiBcIiksXG4gICAgZmlsdGVyOiBmdW5jdGlvbiggZXZlbnQsIG9yaWdpbmFsICkge1xuXG4gICAgICAvLyBBZGQgd2hpY2ggZm9yIGtleSBldmVudHNcbiAgICAgIGlmICggZXZlbnQud2hpY2ggPT0gbnVsbCApIHtcbiAgICAgICAgZXZlbnQud2hpY2ggPSBvcmlnaW5hbC5jaGFyQ29kZSAhPSBudWxsID8gb3JpZ2luYWwuY2hhckNvZGUgOiBvcmlnaW5hbC5rZXlDb2RlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZXZlbnQ7XG4gICAgfVxuICB9LFxuXG4gIG1vdXNlSG9va3M6IHtcbiAgICBwcm9wczogXCJidXR0b24gYnV0dG9ucyBjbGllbnRYIGNsaWVudFkgZnJvbUVsZW1lbnQgb2Zmc2V0WCBvZmZzZXRZIHBhZ2VYIHBhZ2VZIHNjcmVlblggc2NyZWVuWSB0b0VsZW1lbnRcIi5zcGxpdChcIiBcIiksXG4gICAgZmlsdGVyOiBmdW5jdGlvbiggZXZlbnQsIG9yaWdpbmFsICkge1xuICAgICAgdmFyIGJvZHksIGV2ZW50RG9jLCBkb2MsXG4gICAgICAgIGJ1dHRvbiA9IG9yaWdpbmFsLmJ1dHRvbixcbiAgICAgICAgZnJvbUVsZW1lbnQgPSBvcmlnaW5hbC5mcm9tRWxlbWVudDtcblxuICAgICAgLy8gQ2FsY3VsYXRlIHBhZ2VYL1kgaWYgbWlzc2luZyBhbmQgY2xpZW50WC9ZIGF2YWlsYWJsZVxuICAgICAgaWYgKCBldmVudC5wYWdlWCA9PSBudWxsICYmIG9yaWdpbmFsLmNsaWVudFggIT0gbnVsbCApIHtcbiAgICAgICAgZXZlbnREb2MgPSBldmVudC50YXJnZXQub3duZXJEb2N1bWVudCB8fCBkb2N1bWVudDtcbiAgICAgICAgZG9jID0gZXZlbnREb2MuZG9jdW1lbnRFbGVtZW50O1xuICAgICAgICBib2R5ID0gZXZlbnREb2MuYm9keTtcblxuICAgICAgICBldmVudC5wYWdlWCA9IG9yaWdpbmFsLmNsaWVudFggKyAoIGRvYyAmJiBkb2Muc2Nyb2xsTGVmdCB8fCBib2R5ICYmIGJvZHkuc2Nyb2xsTGVmdCB8fCAwICkgLSAoIGRvYyAmJiBkb2MuY2xpZW50TGVmdCB8fCBib2R5ICYmIGJvZHkuY2xpZW50TGVmdCB8fCAwICk7XG4gICAgICAgIGV2ZW50LnBhZ2VZID0gb3JpZ2luYWwuY2xpZW50WSArICggZG9jICYmIGRvYy5zY3JvbGxUb3AgIHx8IGJvZHkgJiYgYm9keS5zY3JvbGxUb3AgIHx8IDAgKSAtICggZG9jICYmIGRvYy5jbGllbnRUb3AgIHx8IGJvZHkgJiYgYm9keS5jbGllbnRUb3AgIHx8IDAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gQWRkIHJlbGF0ZWRUYXJnZXQsIGlmIG5lY2Vzc2FyeVxuICAgICAgaWYgKCAhZXZlbnQucmVsYXRlZFRhcmdldCAmJiBmcm9tRWxlbWVudCApIHtcbiAgICAgICAgZXZlbnQucmVsYXRlZFRhcmdldCA9IGZyb21FbGVtZW50ID09PSBldmVudC50YXJnZXQgPyBvcmlnaW5hbC50b0VsZW1lbnQgOiBmcm9tRWxlbWVudDtcbiAgICAgIH1cblxuICAgICAgLy8gQWRkIHdoaWNoIGZvciBjbGljazogMSA9PT0gbGVmdDsgMiA9PT0gbWlkZGxlOyAzID09PSByaWdodFxuICAgICAgLy8gTm90ZTogYnV0dG9uIGlzIG5vdCBub3JtYWxpemVkLCBzbyBkb24ndCB1c2UgaXRcbiAgICAgIGlmICggIWV2ZW50LndoaWNoICYmIGJ1dHRvbiAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICBldmVudC53aGljaCA9ICggYnV0dG9uICYgMSA/IDEgOiAoIGJ1dHRvbiAmIDIgPyAzIDogKCBidXR0b24gJiA0ID8gMiA6IDAgKSApICk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBldmVudDtcbiAgICB9XG4gIH0sXG5cbiAgc3BlY2lhbDoge1xuICAgIGxvYWQ6IHtcbiAgICAgIC8vIFByZXZlbnQgdHJpZ2dlcmVkIGltYWdlLmxvYWQgZXZlbnRzIGZyb20gYnViYmxpbmcgdG8gd2luZG93LmxvYWRcbiAgICAgIG5vQnViYmxlOiB0cnVlXG4gICAgfSxcbiAgICBmb2N1czoge1xuICAgICAgLy8gRmlyZSBuYXRpdmUgZXZlbnQgaWYgcG9zc2libGUgc28gYmx1ci9mb2N1cyBzZXF1ZW5jZSBpcyBjb3JyZWN0XG4gICAgICB0cmlnZ2VyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCB0aGlzICE9PSBzYWZlQWN0aXZlRWxlbWVudCgpICYmIHRoaXMuZm9jdXMgKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMuZm9jdXMoKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9IGNhdGNoICggZSApIHtcbiAgICAgICAgICAgIC8vIFN1cHBvcnQ6IElFPDlcbiAgICAgICAgICAgIC8vIElmIHdlIGVycm9yIG9uIGZvY3VzIHRvIGhpZGRlbiBlbGVtZW50ICgjMTQ4NiwgIzEyNTE4KSxcbiAgICAgICAgICAgIC8vIGxldCAudHJpZ2dlcigpIHJ1biB0aGUgaGFuZGxlcnNcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBkZWxlZ2F0ZVR5cGU6IFwiZm9jdXNpblwiXG4gICAgfSxcbiAgICBibHVyOiB7XG4gICAgICB0cmlnZ2VyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCB0aGlzID09PSBzYWZlQWN0aXZlRWxlbWVudCgpICYmIHRoaXMuYmx1ciApIHtcbiAgICAgICAgICB0aGlzLmJsdXIoKTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBkZWxlZ2F0ZVR5cGU6IFwiZm9jdXNvdXRcIlxuICAgIH0sXG4gICAgY2xpY2s6IHtcbiAgICAgIC8vIEZvciBjaGVja2JveCwgZmlyZSBuYXRpdmUgZXZlbnQgc28gY2hlY2tlZCBzdGF0ZSB3aWxsIGJlIHJpZ2h0XG4gICAgICB0cmlnZ2VyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCBqUXVlcnkubm9kZU5hbWUoIHRoaXMsIFwiaW5wdXRcIiApICYmIHRoaXMudHlwZSA9PT0gXCJjaGVja2JveFwiICYmIHRoaXMuY2xpY2sgKSB7XG4gICAgICAgICAgdGhpcy5jbGljaygpO1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgLy8gRm9yIGNyb3NzLWJyb3dzZXIgY29uc2lzdGVuY3ksIGRvbid0IGZpcmUgbmF0aXZlIC5jbGljaygpIG9uIGxpbmtzXG4gICAgICBfZGVmYXVsdDogZnVuY3Rpb24oIGV2ZW50ICkge1xuICAgICAgICByZXR1cm4galF1ZXJ5Lm5vZGVOYW1lKCBldmVudC50YXJnZXQsIFwiYVwiICk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGJlZm9yZXVubG9hZDoge1xuICAgICAgcG9zdERpc3BhdGNoOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cbiAgICAgICAgLy8gRXZlbiB3aGVuIHJldHVyblZhbHVlIGVxdWFscyB0byB1bmRlZmluZWQgRmlyZWZveCB3aWxsIHN0aWxsIHNob3cgYWxlcnRcbiAgICAgICAgaWYgKCBldmVudC5yZXN1bHQgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICBldmVudC5vcmlnaW5hbEV2ZW50LnJldHVyblZhbHVlID0gZXZlbnQucmVzdWx0O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIHNpbXVsYXRlOiBmdW5jdGlvbiggdHlwZSwgZWxlbSwgZXZlbnQsIGJ1YmJsZSApIHtcbiAgICAvLyBQaWdneWJhY2sgb24gYSBkb25vciBldmVudCB0byBzaW11bGF0ZSBhIGRpZmZlcmVudCBvbmUuXG4gICAgLy8gRmFrZSBvcmlnaW5hbEV2ZW50IHRvIGF2b2lkIGRvbm9yJ3Mgc3RvcFByb3BhZ2F0aW9uLCBidXQgaWYgdGhlXG4gICAgLy8gc2ltdWxhdGVkIGV2ZW50IHByZXZlbnRzIGRlZmF1bHQgdGhlbiB3ZSBkbyB0aGUgc2FtZSBvbiB0aGUgZG9ub3IuXG4gICAgdmFyIGUgPSBqUXVlcnkuZXh0ZW5kKFxuICAgICAgbmV3IGpRdWVyeS5FdmVudCgpLFxuICAgICAgZXZlbnQsXG4gICAgICB7XG4gICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgIGlzU2ltdWxhdGVkOiB0cnVlLFxuICAgICAgICBvcmlnaW5hbEV2ZW50OiB7fVxuICAgICAgfVxuICAgICk7XG4gICAgaWYgKCBidWJibGUgKSB7XG4gICAgICBqUXVlcnkuZXZlbnQudHJpZ2dlciggZSwgbnVsbCwgZWxlbSApO1xuICAgIH0gZWxzZSB7XG4gICAgICBqUXVlcnkuZXZlbnQuZGlzcGF0Y2guY2FsbCggZWxlbSwgZSApO1xuICAgIH1cbiAgICBpZiAoIGUuaXNEZWZhdWx0UHJldmVudGVkKCkgKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbiAgfVxufTtcblxualF1ZXJ5LnJlbW92ZUV2ZW50ID0gZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciA/XG4gIGZ1bmN0aW9uKCBlbGVtLCB0eXBlLCBoYW5kbGUgKSB7XG4gICAgaWYgKCBlbGVtLnJlbW92ZUV2ZW50TGlzdGVuZXIgKSB7XG4gICAgICBlbGVtLnJlbW92ZUV2ZW50TGlzdGVuZXIoIHR5cGUsIGhhbmRsZSwgZmFsc2UgKTtcbiAgICB9XG4gIH0gOlxuICBmdW5jdGlvbiggZWxlbSwgdHlwZSwgaGFuZGxlICkge1xuICAgIHZhciBuYW1lID0gXCJvblwiICsgdHlwZTtcblxuICAgIGlmICggZWxlbS5kZXRhY2hFdmVudCApIHtcblxuICAgICAgLy8gIzg1NDUsICM3MDU0LCBwcmV2ZW50aW5nIG1lbW9yeSBsZWFrcyBmb3IgY3VzdG9tIGV2ZW50cyBpbiBJRTYtOFxuICAgICAgLy8gZGV0YWNoRXZlbnQgbmVlZGVkIHByb3BlcnR5IG9uIGVsZW1lbnQsIGJ5IG5hbWUgb2YgdGhhdCBldmVudCwgdG8gcHJvcGVybHkgZXhwb3NlIGl0IHRvIEdDXG4gICAgICBpZiAoIHR5cGVvZiBlbGVtWyBuYW1lIF0gPT09IGNvcmVfc3RydW5kZWZpbmVkICkge1xuICAgICAgICBlbGVtWyBuYW1lIF0gPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBlbGVtLmRldGFjaEV2ZW50KCBuYW1lLCBoYW5kbGUgKTtcbiAgICB9XG4gIH07XG5cbmpRdWVyeS5FdmVudCA9IGZ1bmN0aW9uKCBzcmMsIHByb3BzICkge1xuICAvLyBBbGxvdyBpbnN0YW50aWF0aW9uIHdpdGhvdXQgdGhlICduZXcnIGtleXdvcmRcbiAgaWYgKCAhKHRoaXMgaW5zdGFuY2VvZiBqUXVlcnkuRXZlbnQpICkge1xuICAgIHJldHVybiBuZXcgalF1ZXJ5LkV2ZW50KCBzcmMsIHByb3BzICk7XG4gIH1cblxuICAvLyBFdmVudCBvYmplY3RcbiAgaWYgKCBzcmMgJiYgc3JjLnR5cGUgKSB7XG4gICAgdGhpcy5vcmlnaW5hbEV2ZW50ID0gc3JjO1xuICAgIHRoaXMudHlwZSA9IHNyYy50eXBlO1xuXG4gICAgLy8gRXZlbnRzIGJ1YmJsaW5nIHVwIHRoZSBkb2N1bWVudCBtYXkgaGF2ZSBiZWVuIG1hcmtlZCBhcyBwcmV2ZW50ZWRcbiAgICAvLyBieSBhIGhhbmRsZXIgbG93ZXIgZG93biB0aGUgdHJlZTsgcmVmbGVjdCB0aGUgY29ycmVjdCB2YWx1ZS5cbiAgICB0aGlzLmlzRGVmYXVsdFByZXZlbnRlZCA9ICggc3JjLmRlZmF1bHRQcmV2ZW50ZWQgfHwgc3JjLnJldHVyblZhbHVlID09PSBmYWxzZSB8fFxuICAgICAgc3JjLmdldFByZXZlbnREZWZhdWx0ICYmIHNyYy5nZXRQcmV2ZW50RGVmYXVsdCgpICkgPyByZXR1cm5UcnVlIDogcmV0dXJuRmFsc2U7XG5cbiAgLy8gRXZlbnQgdHlwZVxuICB9IGVsc2Uge1xuICAgIHRoaXMudHlwZSA9IHNyYztcbiAgfVxuXG4gIC8vIFB1dCBleHBsaWNpdGx5IHByb3ZpZGVkIHByb3BlcnRpZXMgb250byB0aGUgZXZlbnQgb2JqZWN0XG4gIGlmICggcHJvcHMgKSB7XG4gICAgalF1ZXJ5LmV4dGVuZCggdGhpcywgcHJvcHMgKTtcbiAgfVxuXG4gIC8vIENyZWF0ZSBhIHRpbWVzdGFtcCBpZiBpbmNvbWluZyBldmVudCBkb2Vzbid0IGhhdmUgb25lXG4gIHRoaXMudGltZVN0YW1wID0gc3JjICYmIHNyYy50aW1lU3RhbXAgfHwgalF1ZXJ5Lm5vdygpO1xuXG4gIC8vIE1hcmsgaXQgYXMgZml4ZWRcbiAgdGhpc1sgalF1ZXJ5LmV4cGFuZG8gXSA9IHRydWU7XG59O1xuXG4vLyBqUXVlcnkuRXZlbnQgaXMgYmFzZWQgb24gRE9NMyBFdmVudHMgYXMgc3BlY2lmaWVkIGJ5IHRoZSBFQ01BU2NyaXB0IExhbmd1YWdlIEJpbmRpbmdcbi8vIGh0dHA6Ly93d3cudzMub3JnL1RSLzIwMDMvV0QtRE9NLUxldmVsLTMtRXZlbnRzLTIwMDMwMzMxL2VjbWEtc2NyaXB0LWJpbmRpbmcuaHRtbFxualF1ZXJ5LkV2ZW50LnByb3RvdHlwZSA9IHtcbiAgaXNEZWZhdWx0UHJldmVudGVkOiByZXR1cm5GYWxzZSxcbiAgaXNQcm9wYWdhdGlvblN0b3BwZWQ6IHJldHVybkZhbHNlLFxuICBpc0ltbWVkaWF0ZVByb3BhZ2F0aW9uU3RvcHBlZDogcmV0dXJuRmFsc2UsXG5cbiAgcHJldmVudERlZmF1bHQ6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBlID0gdGhpcy5vcmlnaW5hbEV2ZW50O1xuXG4gICAgdGhpcy5pc0RlZmF1bHRQcmV2ZW50ZWQgPSByZXR1cm5UcnVlO1xuICAgIGlmICggIWUgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gSWYgcHJldmVudERlZmF1bHQgZXhpc3RzLCBydW4gaXQgb24gdGhlIG9yaWdpbmFsIGV2ZW50XG4gICAgaWYgKCBlLnByZXZlbnREZWZhdWx0ICkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgLy8gU3VwcG9ydDogSUVcbiAgICAvLyBPdGhlcndpc2Ugc2V0IHRoZSByZXR1cm5WYWx1ZSBwcm9wZXJ0eSBvZiB0aGUgb3JpZ2luYWwgZXZlbnQgdG8gZmFsc2VcbiAgICB9IGVsc2Uge1xuICAgICAgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xuICAgIH1cbiAgfSxcbiAgc3RvcFByb3BhZ2F0aW9uOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgZSA9IHRoaXMub3JpZ2luYWxFdmVudDtcblxuICAgIHRoaXMuaXNQcm9wYWdhdGlvblN0b3BwZWQgPSByZXR1cm5UcnVlO1xuICAgIGlmICggIWUgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIElmIHN0b3BQcm9wYWdhdGlvbiBleGlzdHMsIHJ1biBpdCBvbiB0aGUgb3JpZ2luYWwgZXZlbnRcbiAgICBpZiAoIGUuc3RvcFByb3BhZ2F0aW9uICkge1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9XG5cbiAgICAvLyBTdXBwb3J0OiBJRVxuICAgIC8vIFNldCB0aGUgY2FuY2VsQnViYmxlIHByb3BlcnR5IG9mIHRoZSBvcmlnaW5hbCBldmVudCB0byB0cnVlXG4gICAgZS5jYW5jZWxCdWJibGUgPSB0cnVlO1xuICB9LFxuICBzdG9wSW1tZWRpYXRlUHJvcGFnYXRpb246IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuaXNJbW1lZGlhdGVQcm9wYWdhdGlvblN0b3BwZWQgPSByZXR1cm5UcnVlO1xuICAgIHRoaXMuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH1cbn07XG5cbi8vIENyZWF0ZSBtb3VzZWVudGVyL2xlYXZlIGV2ZW50cyB1c2luZyBtb3VzZW92ZXIvb3V0IGFuZCBldmVudC10aW1lIGNoZWNrc1xualF1ZXJ5LmVhY2goe1xuICBtb3VzZWVudGVyOiBcIm1vdXNlb3ZlclwiLFxuICBtb3VzZWxlYXZlOiBcIm1vdXNlb3V0XCJcbn0sIGZ1bmN0aW9uKCBvcmlnLCBmaXggKSB7XG4gIGpRdWVyeS5ldmVudC5zcGVjaWFsWyBvcmlnIF0gPSB7XG4gICAgZGVsZWdhdGVUeXBlOiBmaXgsXG4gICAgYmluZFR5cGU6IGZpeCxcblxuICAgIGhhbmRsZTogZnVuY3Rpb24oIGV2ZW50ICkge1xuICAgICAgdmFyIHJldCxcbiAgICAgICAgdGFyZ2V0ID0gdGhpcyxcbiAgICAgICAgcmVsYXRlZCA9IGV2ZW50LnJlbGF0ZWRUYXJnZXQsXG4gICAgICAgIGhhbmRsZU9iaiA9IGV2ZW50LmhhbmRsZU9iajtcblxuICAgICAgLy8gRm9yIG1vdXNlbnRlci9sZWF2ZSBjYWxsIHRoZSBoYW5kbGVyIGlmIHJlbGF0ZWQgaXMgb3V0c2lkZSB0aGUgdGFyZ2V0LlxuICAgICAgLy8gTkI6IE5vIHJlbGF0ZWRUYXJnZXQgaWYgdGhlIG1vdXNlIGxlZnQvZW50ZXJlZCB0aGUgYnJvd3NlciB3aW5kb3dcbiAgICAgIGlmICggIXJlbGF0ZWQgfHwgKHJlbGF0ZWQgIT09IHRhcmdldCAmJiAhalF1ZXJ5LmNvbnRhaW5zKCB0YXJnZXQsIHJlbGF0ZWQgKSkgKSB7XG4gICAgICAgIGV2ZW50LnR5cGUgPSBoYW5kbGVPYmoub3JpZ1R5cGU7XG4gICAgICAgIHJldCA9IGhhbmRsZU9iai5oYW5kbGVyLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcbiAgICAgICAgZXZlbnQudHlwZSA9IGZpeDtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICB9O1xufSk7XG5cbi8vIElFIHN1Ym1pdCBkZWxlZ2F0aW9uXG5pZiAoICFqUXVlcnkuc3VwcG9ydC5zdWJtaXRCdWJibGVzICkge1xuXG4gIGpRdWVyeS5ldmVudC5zcGVjaWFsLnN1Ym1pdCA9IHtcbiAgICBzZXR1cDogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBPbmx5IG5lZWQgdGhpcyBmb3IgZGVsZWdhdGVkIGZvcm0gc3VibWl0IGV2ZW50c1xuICAgICAgaWYgKCBqUXVlcnkubm9kZU5hbWUoIHRoaXMsIFwiZm9ybVwiICkgKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gTGF6eS1hZGQgYSBzdWJtaXQgaGFuZGxlciB3aGVuIGEgZGVzY2VuZGFudCBmb3JtIG1heSBwb3RlbnRpYWxseSBiZSBzdWJtaXR0ZWRcbiAgICAgIGpRdWVyeS5ldmVudC5hZGQoIHRoaXMsIFwiY2xpY2suX3N1Ym1pdCBrZXlwcmVzcy5fc3VibWl0XCIsIGZ1bmN0aW9uKCBlICkge1xuICAgICAgICAvLyBOb2RlIG5hbWUgY2hlY2sgYXZvaWRzIGEgVk1MLXJlbGF0ZWQgY3Jhc2ggaW4gSUUgKCM5ODA3KVxuICAgICAgICB2YXIgZWxlbSA9IGUudGFyZ2V0LFxuICAgICAgICAgIGZvcm0gPSBqUXVlcnkubm9kZU5hbWUoIGVsZW0sIFwiaW5wdXRcIiApIHx8IGpRdWVyeS5ub2RlTmFtZSggZWxlbSwgXCJidXR0b25cIiApID8gZWxlbS5mb3JtIDogdW5kZWZpbmVkO1xuICAgICAgICBpZiAoIGZvcm0gJiYgIWpRdWVyeS5fZGF0YSggZm9ybSwgXCJzdWJtaXRCdWJibGVzXCIgKSApIHtcbiAgICAgICAgICBqUXVlcnkuZXZlbnQuYWRkKCBmb3JtLCBcInN1Ym1pdC5fc3VibWl0XCIsIGZ1bmN0aW9uKCBldmVudCApIHtcbiAgICAgICAgICAgIGV2ZW50Ll9zdWJtaXRfYnViYmxlID0gdHJ1ZTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBqUXVlcnkuX2RhdGEoIGZvcm0sIFwic3VibWl0QnViYmxlc1wiLCB0cnVlICk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgLy8gcmV0dXJuIHVuZGVmaW5lZCBzaW5jZSB3ZSBkb24ndCBuZWVkIGFuIGV2ZW50IGxpc3RlbmVyXG4gICAgfSxcblxuICAgIHBvc3REaXNwYXRjaDogZnVuY3Rpb24oIGV2ZW50ICkge1xuICAgICAgLy8gSWYgZm9ybSB3YXMgc3VibWl0dGVkIGJ5IHRoZSB1c2VyLCBidWJibGUgdGhlIGV2ZW50IHVwIHRoZSB0cmVlXG4gICAgICBpZiAoIGV2ZW50Ll9zdWJtaXRfYnViYmxlICkge1xuICAgICAgICBkZWxldGUgZXZlbnQuX3N1Ym1pdF9idWJibGU7XG4gICAgICAgIGlmICggdGhpcy5wYXJlbnROb2RlICYmICFldmVudC5pc1RyaWdnZXIgKSB7XG4gICAgICAgICAgalF1ZXJ5LmV2ZW50LnNpbXVsYXRlKCBcInN1Ym1pdFwiLCB0aGlzLnBhcmVudE5vZGUsIGV2ZW50LCB0cnVlICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgdGVhcmRvd246IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gT25seSBuZWVkIHRoaXMgZm9yIGRlbGVnYXRlZCBmb3JtIHN1Ym1pdCBldmVudHNcbiAgICAgIGlmICggalF1ZXJ5Lm5vZGVOYW1lKCB0aGlzLCBcImZvcm1cIiApICkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIFJlbW92ZSBkZWxlZ2F0ZWQgaGFuZGxlcnM7IGNsZWFuRGF0YSBldmVudHVhbGx5IHJlYXBzIHN1Ym1pdCBoYW5kbGVycyBhdHRhY2hlZCBhYm92ZVxuICAgICAgalF1ZXJ5LmV2ZW50LnJlbW92ZSggdGhpcywgXCIuX3N1Ym1pdFwiICk7XG4gICAgfVxuICB9O1xufVxuXG4vLyBJRSBjaGFuZ2UgZGVsZWdhdGlvbiBhbmQgY2hlY2tib3gvcmFkaW8gZml4XG5pZiAoICFqUXVlcnkuc3VwcG9ydC5jaGFuZ2VCdWJibGVzICkge1xuXG4gIGpRdWVyeS5ldmVudC5zcGVjaWFsLmNoYW5nZSA9IHtcblxuICAgIHNldHVwOiBmdW5jdGlvbigpIHtcblxuICAgICAgaWYgKCByZm9ybUVsZW1zLnRlc3QoIHRoaXMubm9kZU5hbWUgKSApIHtcbiAgICAgICAgLy8gSUUgZG9lc24ndCBmaXJlIGNoYW5nZSBvbiBhIGNoZWNrL3JhZGlvIHVudGlsIGJsdXI7IHRyaWdnZXIgaXQgb24gY2xpY2tcbiAgICAgICAgLy8gYWZ0ZXIgYSBwcm9wZXJ0eWNoYW5nZS4gRWF0IHRoZSBibHVyLWNoYW5nZSBpbiBzcGVjaWFsLmNoYW5nZS5oYW5kbGUuXG4gICAgICAgIC8vIFRoaXMgc3RpbGwgZmlyZXMgb25jaGFuZ2UgYSBzZWNvbmQgdGltZSBmb3IgY2hlY2svcmFkaW8gYWZ0ZXIgYmx1ci5cbiAgICAgICAgaWYgKCB0aGlzLnR5cGUgPT09IFwiY2hlY2tib3hcIiB8fCB0aGlzLnR5cGUgPT09IFwicmFkaW9cIiApIHtcbiAgICAgICAgICBqUXVlcnkuZXZlbnQuYWRkKCB0aGlzLCBcInByb3BlcnR5Y2hhbmdlLl9jaGFuZ2VcIiwgZnVuY3Rpb24oIGV2ZW50ICkge1xuICAgICAgICAgICAgaWYgKCBldmVudC5vcmlnaW5hbEV2ZW50LnByb3BlcnR5TmFtZSA9PT0gXCJjaGVja2VkXCIgKSB7XG4gICAgICAgICAgICAgIHRoaXMuX2p1c3RfY2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgalF1ZXJ5LmV2ZW50LmFkZCggdGhpcywgXCJjbGljay5fY2hhbmdlXCIsIGZ1bmN0aW9uKCBldmVudCApIHtcbiAgICAgICAgICAgIGlmICggdGhpcy5fanVzdF9jaGFuZ2VkICYmICFldmVudC5pc1RyaWdnZXIgKSB7XG4gICAgICAgICAgICAgIHRoaXMuX2p1c3RfY2hhbmdlZCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQWxsb3cgdHJpZ2dlcmVkLCBzaW11bGF0ZWQgY2hhbmdlIGV2ZW50cyAoIzExNTAwKVxuICAgICAgICAgICAgalF1ZXJ5LmV2ZW50LnNpbXVsYXRlKCBcImNoYW5nZVwiLCB0aGlzLCBldmVudCwgdHJ1ZSApO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIC8vIERlbGVnYXRlZCBldmVudDsgbGF6eS1hZGQgYSBjaGFuZ2UgaGFuZGxlciBvbiBkZXNjZW5kYW50IGlucHV0c1xuICAgICAgalF1ZXJ5LmV2ZW50LmFkZCggdGhpcywgXCJiZWZvcmVhY3RpdmF0ZS5fY2hhbmdlXCIsIGZ1bmN0aW9uKCBlICkge1xuICAgICAgICB2YXIgZWxlbSA9IGUudGFyZ2V0O1xuXG4gICAgICAgIGlmICggcmZvcm1FbGVtcy50ZXN0KCBlbGVtLm5vZGVOYW1lICkgJiYgIWpRdWVyeS5fZGF0YSggZWxlbSwgXCJjaGFuZ2VCdWJibGVzXCIgKSApIHtcbiAgICAgICAgICBqUXVlcnkuZXZlbnQuYWRkKCBlbGVtLCBcImNoYW5nZS5fY2hhbmdlXCIsIGZ1bmN0aW9uKCBldmVudCApIHtcbiAgICAgICAgICAgIGlmICggdGhpcy5wYXJlbnROb2RlICYmICFldmVudC5pc1NpbXVsYXRlZCAmJiAhZXZlbnQuaXNUcmlnZ2VyICkge1xuICAgICAgICAgICAgICBqUXVlcnkuZXZlbnQuc2ltdWxhdGUoIFwiY2hhbmdlXCIsIHRoaXMucGFyZW50Tm9kZSwgZXZlbnQsIHRydWUgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICBqUXVlcnkuX2RhdGEoIGVsZW0sIFwiY2hhbmdlQnViYmxlc1wiLCB0cnVlICk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBoYW5kbGU6IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgICAgIHZhciBlbGVtID0gZXZlbnQudGFyZ2V0O1xuXG4gICAgICAvLyBTd2FsbG93IG5hdGl2ZSBjaGFuZ2UgZXZlbnRzIGZyb20gY2hlY2tib3gvcmFkaW8sIHdlIGFscmVhZHkgdHJpZ2dlcmVkIHRoZW0gYWJvdmVcbiAgICAgIGlmICggdGhpcyAhPT0gZWxlbSB8fCBldmVudC5pc1NpbXVsYXRlZCB8fCBldmVudC5pc1RyaWdnZXIgfHwgKGVsZW0udHlwZSAhPT0gXCJyYWRpb1wiICYmIGVsZW0udHlwZSAhPT0gXCJjaGVja2JveFwiKSApIHtcbiAgICAgICAgcmV0dXJuIGV2ZW50LmhhbmRsZU9iai5oYW5kbGVyLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgdGVhcmRvd246IGZ1bmN0aW9uKCkge1xuICAgICAgalF1ZXJ5LmV2ZW50LnJlbW92ZSggdGhpcywgXCIuX2NoYW5nZVwiICk7XG5cbiAgICAgIHJldHVybiAhcmZvcm1FbGVtcy50ZXN0KCB0aGlzLm5vZGVOYW1lICk7XG4gICAgfVxuICB9O1xufVxuXG4vLyBDcmVhdGUgXCJidWJibGluZ1wiIGZvY3VzIGFuZCBibHVyIGV2ZW50c1xuaWYgKCAhalF1ZXJ5LnN1cHBvcnQuZm9jdXNpbkJ1YmJsZXMgKSB7XG4gIGpRdWVyeS5lYWNoKHsgZm9jdXM6IFwiZm9jdXNpblwiLCBibHVyOiBcImZvY3Vzb3V0XCIgfSwgZnVuY3Rpb24oIG9yaWcsIGZpeCApIHtcblxuICAgIC8vIEF0dGFjaCBhIHNpbmdsZSBjYXB0dXJpbmcgaGFuZGxlciB3aGlsZSBzb21lb25lIHdhbnRzIGZvY3VzaW4vZm9jdXNvdXRcbiAgICB2YXIgYXR0YWNoZXMgPSAwLFxuICAgICAgaGFuZGxlciA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgICAgICAgalF1ZXJ5LmV2ZW50LnNpbXVsYXRlKCBmaXgsIGV2ZW50LnRhcmdldCwgalF1ZXJ5LmV2ZW50LmZpeCggZXZlbnQgKSwgdHJ1ZSApO1xuICAgICAgfTtcblxuICAgIGpRdWVyeS5ldmVudC5zcGVjaWFsWyBmaXggXSA9IHtcbiAgICAgIHNldHVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCBhdHRhY2hlcysrID09PSAwICkge1xuICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoIG9yaWcsIGhhbmRsZXIsIHRydWUgKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHRlYXJkb3duOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCAtLWF0dGFjaGVzID09PSAwICkge1xuICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoIG9yaWcsIGhhbmRsZXIsIHRydWUgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH0pO1xufVxuXG5qUXVlcnkuZm4uZXh0ZW5kKHtcblxuICBvbjogZnVuY3Rpb24oIHR5cGVzLCBzZWxlY3RvciwgZGF0YSwgZm4sIC8qSU5URVJOQUwqLyBvbmUgKSB7XG4gICAgdmFyIHR5cGUsIG9yaWdGbjtcblxuICAgIC8vIFR5cGVzIGNhbiBiZSBhIG1hcCBvZiB0eXBlcy9oYW5kbGVyc1xuICAgIGlmICggdHlwZW9mIHR5cGVzID09PSBcIm9iamVjdFwiICkge1xuICAgICAgLy8gKCB0eXBlcy1PYmplY3QsIHNlbGVjdG9yLCBkYXRhIClcbiAgICAgIGlmICggdHlwZW9mIHNlbGVjdG9yICE9PSBcInN0cmluZ1wiICkge1xuICAgICAgICAvLyAoIHR5cGVzLU9iamVjdCwgZGF0YSApXG4gICAgICAgIGRhdGEgPSBkYXRhIHx8IHNlbGVjdG9yO1xuICAgICAgICBzZWxlY3RvciA9IHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIGZvciAoIHR5cGUgaW4gdHlwZXMgKSB7XG4gICAgICAgIHRoaXMub24oIHR5cGUsIHNlbGVjdG9yLCBkYXRhLCB0eXBlc1sgdHlwZSBdLCBvbmUgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGlmICggZGF0YSA9PSBudWxsICYmIGZuID09IG51bGwgKSB7XG4gICAgICAvLyAoIHR5cGVzLCBmbiApXG4gICAgICBmbiA9IHNlbGVjdG9yO1xuICAgICAgZGF0YSA9IHNlbGVjdG9yID0gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSBpZiAoIGZuID09IG51bGwgKSB7XG4gICAgICBpZiAoIHR5cGVvZiBzZWxlY3RvciA9PT0gXCJzdHJpbmdcIiApIHtcbiAgICAgICAgLy8gKCB0eXBlcywgc2VsZWN0b3IsIGZuIClcbiAgICAgICAgZm4gPSBkYXRhO1xuICAgICAgICBkYXRhID0gdW5kZWZpbmVkO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gKCB0eXBlcywgZGF0YSwgZm4gKVxuICAgICAgICBmbiA9IGRhdGE7XG4gICAgICAgIGRhdGEgPSBzZWxlY3RvcjtcbiAgICAgICAgc2VsZWN0b3IgPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICggZm4gPT09IGZhbHNlICkge1xuICAgICAgZm4gPSByZXR1cm5GYWxzZTtcbiAgICB9IGVsc2UgaWYgKCAhZm4gKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBpZiAoIG9uZSA9PT0gMSApIHtcbiAgICAgIG9yaWdGbiA9IGZuO1xuICAgICAgZm4gPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gICAgICAgIC8vIENhbiB1c2UgYW4gZW1wdHkgc2V0LCBzaW5jZSBldmVudCBjb250YWlucyB0aGUgaW5mb1xuICAgICAgICBqUXVlcnkoKS5vZmYoIGV2ZW50ICk7XG4gICAgICAgIHJldHVybiBvcmlnRm4uYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuICAgICAgfTtcbiAgICAgIC8vIFVzZSBzYW1lIGd1aWQgc28gY2FsbGVyIGNhbiByZW1vdmUgdXNpbmcgb3JpZ0ZuXG4gICAgICBmbi5ndWlkID0gb3JpZ0ZuLmd1aWQgfHwgKCBvcmlnRm4uZ3VpZCA9IGpRdWVyeS5ndWlkKysgKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZWFjaCggZnVuY3Rpb24oKSB7XG4gICAgICBqUXVlcnkuZXZlbnQuYWRkKCB0aGlzLCB0eXBlcywgZm4sIGRhdGEsIHNlbGVjdG9yICk7XG4gICAgfSk7XG4gIH0sXG4gIG9uZTogZnVuY3Rpb24oIHR5cGVzLCBzZWxlY3RvciwgZGF0YSwgZm4gKSB7XG4gICAgcmV0dXJuIHRoaXMub24oIHR5cGVzLCBzZWxlY3RvciwgZGF0YSwgZm4sIDEgKTtcbiAgfSxcbiAgb2ZmOiBmdW5jdGlvbiggdHlwZXMsIHNlbGVjdG9yLCBmbiApIHtcbiAgICB2YXIgaGFuZGxlT2JqLCB0eXBlO1xuICAgIGlmICggdHlwZXMgJiYgdHlwZXMucHJldmVudERlZmF1bHQgJiYgdHlwZXMuaGFuZGxlT2JqICkge1xuICAgICAgLy8gKCBldmVudCApICBkaXNwYXRjaGVkIGpRdWVyeS5FdmVudFxuICAgICAgaGFuZGxlT2JqID0gdHlwZXMuaGFuZGxlT2JqO1xuICAgICAgalF1ZXJ5KCB0eXBlcy5kZWxlZ2F0ZVRhcmdldCApLm9mZihcbiAgICAgICAgaGFuZGxlT2JqLm5hbWVzcGFjZSA/IGhhbmRsZU9iai5vcmlnVHlwZSArIFwiLlwiICsgaGFuZGxlT2JqLm5hbWVzcGFjZSA6IGhhbmRsZU9iai5vcmlnVHlwZSxcbiAgICAgICAgaGFuZGxlT2JqLnNlbGVjdG9yLFxuICAgICAgICBoYW5kbGVPYmouaGFuZGxlclxuICAgICAgKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBpZiAoIHR5cGVvZiB0eXBlcyA9PT0gXCJvYmplY3RcIiApIHtcbiAgICAgIC8vICggdHlwZXMtb2JqZWN0IFssIHNlbGVjdG9yXSApXG4gICAgICBmb3IgKCB0eXBlIGluIHR5cGVzICkge1xuICAgICAgICB0aGlzLm9mZiggdHlwZSwgc2VsZWN0b3IsIHR5cGVzWyB0eXBlIF0gKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBpZiAoIHNlbGVjdG9yID09PSBmYWxzZSB8fCB0eXBlb2Ygc2VsZWN0b3IgPT09IFwiZnVuY3Rpb25cIiApIHtcbiAgICAgIC8vICggdHlwZXMgWywgZm5dIClcbiAgICAgIGZuID0gc2VsZWN0b3I7XG4gICAgICBzZWxlY3RvciA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgaWYgKCBmbiA9PT0gZmFsc2UgKSB7XG4gICAgICBmbiA9IHJldHVybkZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgalF1ZXJ5LmV2ZW50LnJlbW92ZSggdGhpcywgdHlwZXMsIGZuLCBzZWxlY3RvciApO1xuICAgIH0pO1xuICB9LFxuXG4gIHRyaWdnZXI6IGZ1bmN0aW9uKCB0eXBlLCBkYXRhICkge1xuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICBqUXVlcnkuZXZlbnQudHJpZ2dlciggdHlwZSwgZGF0YSwgdGhpcyApO1xuICAgIH0pO1xuICB9LFxuICB0cmlnZ2VySGFuZGxlcjogZnVuY3Rpb24oIHR5cGUsIGRhdGEgKSB7XG4gICAgdmFyIGVsZW0gPSB0aGlzWzBdO1xuICAgIGlmICggZWxlbSApIHtcbiAgICAgIHJldHVybiBqUXVlcnkuZXZlbnQudHJpZ2dlciggdHlwZSwgZGF0YSwgZWxlbSwgdHJ1ZSApO1xuICAgIH1cbiAgfVxufSk7XG52YXIgaXNTaW1wbGUgPSAvXi5bXjojXFxbXFwuLF0qJC8sXG4gIHJwYXJlbnRzcHJldiA9IC9eKD86cGFyZW50c3xwcmV2KD86VW50aWx8QWxsKSkvLFxuICBybmVlZHNDb250ZXh0ID0galF1ZXJ5LmV4cHIubWF0Y2gubmVlZHNDb250ZXh0LFxuICAvLyBtZXRob2RzIGd1YXJhbnRlZWQgdG8gcHJvZHVjZSBhIHVuaXF1ZSBzZXQgd2hlbiBzdGFydGluZyBmcm9tIGEgdW5pcXVlIHNldFxuICBndWFyYW50ZWVkVW5pcXVlID0ge1xuICAgIGNoaWxkcmVuOiB0cnVlLFxuICAgIGNvbnRlbnRzOiB0cnVlLFxuICAgIG5leHQ6IHRydWUsXG4gICAgcHJldjogdHJ1ZVxuICB9O1xuXG5qUXVlcnkuZm4uZXh0ZW5kKHtcbiAgZmluZDogZnVuY3Rpb24oIHNlbGVjdG9yICkge1xuICAgIHZhciBpLFxuICAgICAgcmV0ID0gW10sXG4gICAgICBzZWxmID0gdGhpcyxcbiAgICAgIGxlbiA9IHNlbGYubGVuZ3RoO1xuXG4gICAgaWYgKCB0eXBlb2Ygc2VsZWN0b3IgIT09IFwic3RyaW5nXCIgKSB7XG4gICAgICByZXR1cm4gdGhpcy5wdXNoU3RhY2soIGpRdWVyeSggc2VsZWN0b3IgKS5maWx0ZXIoZnVuY3Rpb24oKSB7XG4gICAgICAgIGZvciAoIGkgPSAwOyBpIDwgbGVuOyBpKysgKSB7XG4gICAgICAgICAgaWYgKCBqUXVlcnkuY29udGFpbnMoIHNlbGZbIGkgXSwgdGhpcyApICkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KSApO1xuICAgIH1cblxuICAgIGZvciAoIGkgPSAwOyBpIDwgbGVuOyBpKysgKSB7XG4gICAgICBqUXVlcnkuZmluZCggc2VsZWN0b3IsIHNlbGZbIGkgXSwgcmV0ICk7XG4gICAgfVxuXG4gICAgLy8gTmVlZGVkIGJlY2F1c2UgJCggc2VsZWN0b3IsIGNvbnRleHQgKSBiZWNvbWVzICQoIGNvbnRleHQgKS5maW5kKCBzZWxlY3RvciApXG4gICAgcmV0ID0gdGhpcy5wdXNoU3RhY2soIGxlbiA+IDEgPyBqUXVlcnkudW5pcXVlKCByZXQgKSA6IHJldCApO1xuICAgIHJldC5zZWxlY3RvciA9IHRoaXMuc2VsZWN0b3IgPyB0aGlzLnNlbGVjdG9yICsgXCIgXCIgKyBzZWxlY3RvciA6IHNlbGVjdG9yO1xuICAgIHJldHVybiByZXQ7XG4gIH0sXG5cbiAgaGFzOiBmdW5jdGlvbiggdGFyZ2V0ICkge1xuICAgIHZhciBpLFxuICAgICAgdGFyZ2V0cyA9IGpRdWVyeSggdGFyZ2V0LCB0aGlzICksXG4gICAgICBsZW4gPSB0YXJnZXRzLmxlbmd0aDtcblxuICAgIHJldHVybiB0aGlzLmZpbHRlcihmdW5jdGlvbigpIHtcbiAgICAgIGZvciAoIGkgPSAwOyBpIDwgbGVuOyBpKysgKSB7XG4gICAgICAgIGlmICggalF1ZXJ5LmNvbnRhaW5zKCB0aGlzLCB0YXJnZXRzW2ldICkgKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcblxuICBub3Q6IGZ1bmN0aW9uKCBzZWxlY3RvciApIHtcbiAgICByZXR1cm4gdGhpcy5wdXNoU3RhY2soIHdpbm5vdyh0aGlzLCBzZWxlY3RvciB8fCBbXSwgdHJ1ZSkgKTtcbiAgfSxcblxuICBmaWx0ZXI6IGZ1bmN0aW9uKCBzZWxlY3RvciApIHtcbiAgICByZXR1cm4gdGhpcy5wdXNoU3RhY2soIHdpbm5vdyh0aGlzLCBzZWxlY3RvciB8fCBbXSwgZmFsc2UpICk7XG4gIH0sXG5cbiAgaXM6IGZ1bmN0aW9uKCBzZWxlY3RvciApIHtcbiAgICByZXR1cm4gISF3aW5ub3coXG4gICAgICB0aGlzLFxuXG4gICAgICAvLyBJZiB0aGlzIGlzIGEgcG9zaXRpb25hbC9yZWxhdGl2ZSBzZWxlY3RvciwgY2hlY2sgbWVtYmVyc2hpcCBpbiB0aGUgcmV0dXJuZWQgc2V0XG4gICAgICAvLyBzbyAkKFwicDpmaXJzdFwiKS5pcyhcInA6bGFzdFwiKSB3b24ndCByZXR1cm4gdHJ1ZSBmb3IgYSBkb2Mgd2l0aCB0d28gXCJwXCIuXG4gICAgICB0eXBlb2Ygc2VsZWN0b3IgPT09IFwic3RyaW5nXCIgJiYgcm5lZWRzQ29udGV4dC50ZXN0KCBzZWxlY3RvciApID9cbiAgICAgICAgalF1ZXJ5KCBzZWxlY3RvciApIDpcbiAgICAgICAgc2VsZWN0b3IgfHwgW10sXG4gICAgICBmYWxzZVxuICAgICkubGVuZ3RoO1xuICB9LFxuXG4gIGNsb3Nlc3Q6IGZ1bmN0aW9uKCBzZWxlY3RvcnMsIGNvbnRleHQgKSB7XG4gICAgdmFyIGN1cixcbiAgICAgIGkgPSAwLFxuICAgICAgbCA9IHRoaXMubGVuZ3RoLFxuICAgICAgcmV0ID0gW10sXG4gICAgICBwb3MgPSBybmVlZHNDb250ZXh0LnRlc3QoIHNlbGVjdG9ycyApIHx8IHR5cGVvZiBzZWxlY3RvcnMgIT09IFwic3RyaW5nXCIgP1xuICAgICAgICBqUXVlcnkoIHNlbGVjdG9ycywgY29udGV4dCB8fCB0aGlzLmNvbnRleHQgKSA6XG4gICAgICAgIDA7XG5cbiAgICBmb3IgKCA7IGkgPCBsOyBpKysgKSB7XG4gICAgICBmb3IgKCBjdXIgPSB0aGlzW2ldOyBjdXIgJiYgY3VyICE9PSBjb250ZXh0OyBjdXIgPSBjdXIucGFyZW50Tm9kZSApIHtcbiAgICAgICAgLy8gQWx3YXlzIHNraXAgZG9jdW1lbnQgZnJhZ21lbnRzXG4gICAgICAgIGlmICggY3VyLm5vZGVUeXBlIDwgMTEgJiYgKHBvcyA/XG4gICAgICAgICAgcG9zLmluZGV4KGN1cikgPiAtMSA6XG5cbiAgICAgICAgICAvLyBEb24ndCBwYXNzIG5vbi1lbGVtZW50cyB0byBTaXp6bGVcbiAgICAgICAgICBjdXIubm9kZVR5cGUgPT09IDEgJiZcbiAgICAgICAgICAgIGpRdWVyeS5maW5kLm1hdGNoZXNTZWxlY3RvcihjdXIsIHNlbGVjdG9ycykpICkge1xuXG4gICAgICAgICAgY3VyID0gcmV0LnB1c2goIGN1ciApO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMucHVzaFN0YWNrKCByZXQubGVuZ3RoID4gMSA/IGpRdWVyeS51bmlxdWUoIHJldCApIDogcmV0ICk7XG4gIH0sXG5cbiAgLy8gRGV0ZXJtaW5lIHRoZSBwb3NpdGlvbiBvZiBhbiBlbGVtZW50IHdpdGhpblxuICAvLyB0aGUgbWF0Y2hlZCBzZXQgb2YgZWxlbWVudHNcbiAgaW5kZXg6IGZ1bmN0aW9uKCBlbGVtICkge1xuXG4gICAgLy8gTm8gYXJndW1lbnQsIHJldHVybiBpbmRleCBpbiBwYXJlbnRcbiAgICBpZiAoICFlbGVtICkge1xuICAgICAgcmV0dXJuICggdGhpc1swXSAmJiB0aGlzWzBdLnBhcmVudE5vZGUgKSA/IHRoaXMuZmlyc3QoKS5wcmV2QWxsKCkubGVuZ3RoIDogLTE7XG4gICAgfVxuXG4gICAgLy8gaW5kZXggaW4gc2VsZWN0b3JcbiAgICBpZiAoIHR5cGVvZiBlbGVtID09PSBcInN0cmluZ1wiICkge1xuICAgICAgcmV0dXJuIGpRdWVyeS5pbkFycmF5KCB0aGlzWzBdLCBqUXVlcnkoIGVsZW0gKSApO1xuICAgIH1cblxuICAgIC8vIExvY2F0ZSB0aGUgcG9zaXRpb24gb2YgdGhlIGRlc2lyZWQgZWxlbWVudFxuICAgIHJldHVybiBqUXVlcnkuaW5BcnJheShcbiAgICAgIC8vIElmIGl0IHJlY2VpdmVzIGEgalF1ZXJ5IG9iamVjdCwgdGhlIGZpcnN0IGVsZW1lbnQgaXMgdXNlZFxuICAgICAgZWxlbS5qcXVlcnkgPyBlbGVtWzBdIDogZWxlbSwgdGhpcyApO1xuICB9LFxuXG4gIGFkZDogZnVuY3Rpb24oIHNlbGVjdG9yLCBjb250ZXh0ICkge1xuICAgIHZhciBzZXQgPSB0eXBlb2Ygc2VsZWN0b3IgPT09IFwic3RyaW5nXCIgP1xuICAgICAgICBqUXVlcnkoIHNlbGVjdG9yLCBjb250ZXh0ICkgOlxuICAgICAgICBqUXVlcnkubWFrZUFycmF5KCBzZWxlY3RvciAmJiBzZWxlY3Rvci5ub2RlVHlwZSA/IFsgc2VsZWN0b3IgXSA6IHNlbGVjdG9yICksXG4gICAgICBhbGwgPSBqUXVlcnkubWVyZ2UoIHRoaXMuZ2V0KCksIHNldCApO1xuXG4gICAgcmV0dXJuIHRoaXMucHVzaFN0YWNrKCBqUXVlcnkudW5pcXVlKGFsbCkgKTtcbiAgfSxcblxuICBhZGRCYWNrOiBmdW5jdGlvbiggc2VsZWN0b3IgKSB7XG4gICAgcmV0dXJuIHRoaXMuYWRkKCBzZWxlY3RvciA9PSBudWxsID9cbiAgICAgIHRoaXMucHJldk9iamVjdCA6IHRoaXMucHJldk9iamVjdC5maWx0ZXIoc2VsZWN0b3IpXG4gICAgKTtcbiAgfVxufSk7XG5cbmZ1bmN0aW9uIHNpYmxpbmcoIGN1ciwgZGlyICkge1xuICBkbyB7XG4gICAgY3VyID0gY3VyWyBkaXIgXTtcbiAgfSB3aGlsZSAoIGN1ciAmJiBjdXIubm9kZVR5cGUgIT09IDEgKTtcblxuICByZXR1cm4gY3VyO1xufVxuXG5qUXVlcnkuZWFjaCh7XG4gIHBhcmVudDogZnVuY3Rpb24oIGVsZW0gKSB7XG4gICAgdmFyIHBhcmVudCA9IGVsZW0ucGFyZW50Tm9kZTtcbiAgICByZXR1cm4gcGFyZW50ICYmIHBhcmVudC5ub2RlVHlwZSAhPT0gMTEgPyBwYXJlbnQgOiBudWxsO1xuICB9LFxuICBwYXJlbnRzOiBmdW5jdGlvbiggZWxlbSApIHtcbiAgICByZXR1cm4galF1ZXJ5LmRpciggZWxlbSwgXCJwYXJlbnROb2RlXCIgKTtcbiAgfSxcbiAgcGFyZW50c1VudGlsOiBmdW5jdGlvbiggZWxlbSwgaSwgdW50aWwgKSB7XG4gICAgcmV0dXJuIGpRdWVyeS5kaXIoIGVsZW0sIFwicGFyZW50Tm9kZVwiLCB1bnRpbCApO1xuICB9LFxuICBuZXh0OiBmdW5jdGlvbiggZWxlbSApIHtcbiAgICByZXR1cm4gc2libGluZyggZWxlbSwgXCJuZXh0U2libGluZ1wiICk7XG4gIH0sXG4gIHByZXY6IGZ1bmN0aW9uKCBlbGVtICkge1xuICAgIHJldHVybiBzaWJsaW5nKCBlbGVtLCBcInByZXZpb3VzU2libGluZ1wiICk7XG4gIH0sXG4gIG5leHRBbGw6IGZ1bmN0aW9uKCBlbGVtICkge1xuICAgIHJldHVybiBqUXVlcnkuZGlyKCBlbGVtLCBcIm5leHRTaWJsaW5nXCIgKTtcbiAgfSxcbiAgcHJldkFsbDogZnVuY3Rpb24oIGVsZW0gKSB7XG4gICAgcmV0dXJuIGpRdWVyeS5kaXIoIGVsZW0sIFwicHJldmlvdXNTaWJsaW5nXCIgKTtcbiAgfSxcbiAgbmV4dFVudGlsOiBmdW5jdGlvbiggZWxlbSwgaSwgdW50aWwgKSB7XG4gICAgcmV0dXJuIGpRdWVyeS5kaXIoIGVsZW0sIFwibmV4dFNpYmxpbmdcIiwgdW50aWwgKTtcbiAgfSxcbiAgcHJldlVudGlsOiBmdW5jdGlvbiggZWxlbSwgaSwgdW50aWwgKSB7XG4gICAgcmV0dXJuIGpRdWVyeS5kaXIoIGVsZW0sIFwicHJldmlvdXNTaWJsaW5nXCIsIHVudGlsICk7XG4gIH0sXG4gIHNpYmxpbmdzOiBmdW5jdGlvbiggZWxlbSApIHtcbiAgICByZXR1cm4galF1ZXJ5LnNpYmxpbmcoICggZWxlbS5wYXJlbnROb2RlIHx8IHt9ICkuZmlyc3RDaGlsZCwgZWxlbSApO1xuICB9LFxuICBjaGlsZHJlbjogZnVuY3Rpb24oIGVsZW0gKSB7XG4gICAgcmV0dXJuIGpRdWVyeS5zaWJsaW5nKCBlbGVtLmZpcnN0Q2hpbGQgKTtcbiAgfSxcbiAgY29udGVudHM6IGZ1bmN0aW9uKCBlbGVtICkge1xuICAgIHJldHVybiBqUXVlcnkubm9kZU5hbWUoIGVsZW0sIFwiaWZyYW1lXCIgKSA/XG4gICAgICBlbGVtLmNvbnRlbnREb2N1bWVudCB8fCBlbGVtLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQgOlxuICAgICAgalF1ZXJ5Lm1lcmdlKCBbXSwgZWxlbS5jaGlsZE5vZGVzICk7XG4gIH1cbn0sIGZ1bmN0aW9uKCBuYW1lLCBmbiApIHtcbiAgalF1ZXJ5LmZuWyBuYW1lIF0gPSBmdW5jdGlvbiggdW50aWwsIHNlbGVjdG9yICkge1xuICAgIHZhciByZXQgPSBqUXVlcnkubWFwKCB0aGlzLCBmbiwgdW50aWwgKTtcblxuICAgIGlmICggbmFtZS5zbGljZSggLTUgKSAhPT0gXCJVbnRpbFwiICkge1xuICAgICAgc2VsZWN0b3IgPSB1bnRpbDtcbiAgICB9XG5cbiAgICBpZiAoIHNlbGVjdG9yICYmIHR5cGVvZiBzZWxlY3RvciA9PT0gXCJzdHJpbmdcIiApIHtcbiAgICAgIHJldCA9IGpRdWVyeS5maWx0ZXIoIHNlbGVjdG9yLCByZXQgKTtcbiAgICB9XG5cbiAgICBpZiAoIHRoaXMubGVuZ3RoID4gMSApIHtcbiAgICAgIC8vIFJlbW92ZSBkdXBsaWNhdGVzXG4gICAgICBpZiAoICFndWFyYW50ZWVkVW5pcXVlWyBuYW1lIF0gKSB7XG4gICAgICAgIHJldCA9IGpRdWVyeS51bmlxdWUoIHJldCApO1xuICAgICAgfVxuXG4gICAgICAvLyBSZXZlcnNlIG9yZGVyIGZvciBwYXJlbnRzKiBhbmQgcHJldi1kZXJpdmF0aXZlc1xuICAgICAgaWYgKCBycGFyZW50c3ByZXYudGVzdCggbmFtZSApICkge1xuICAgICAgICByZXQgPSByZXQucmV2ZXJzZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnB1c2hTdGFjayggcmV0ICk7XG4gIH07XG59KTtcblxualF1ZXJ5LmV4dGVuZCh7XG4gIGZpbHRlcjogZnVuY3Rpb24oIGV4cHIsIGVsZW1zLCBub3QgKSB7XG4gICAgdmFyIGVsZW0gPSBlbGVtc1sgMCBdO1xuXG4gICAgaWYgKCBub3QgKSB7XG4gICAgICBleHByID0gXCI6bm90KFwiICsgZXhwciArIFwiKVwiO1xuICAgIH1cblxuICAgIHJldHVybiBlbGVtcy5sZW5ndGggPT09IDEgJiYgZWxlbS5ub2RlVHlwZSA9PT0gMSA/XG4gICAgICBqUXVlcnkuZmluZC5tYXRjaGVzU2VsZWN0b3IoIGVsZW0sIGV4cHIgKSA/IFsgZWxlbSBdIDogW10gOlxuICAgICAgalF1ZXJ5LmZpbmQubWF0Y2hlcyggZXhwciwgalF1ZXJ5LmdyZXAoIGVsZW1zLCBmdW5jdGlvbiggZWxlbSApIHtcbiAgICAgICAgcmV0dXJuIGVsZW0ubm9kZVR5cGUgPT09IDE7XG4gICAgICB9KSk7XG4gIH0sXG5cbiAgZGlyOiBmdW5jdGlvbiggZWxlbSwgZGlyLCB1bnRpbCApIHtcbiAgICB2YXIgbWF0Y2hlZCA9IFtdLFxuICAgICAgY3VyID0gZWxlbVsgZGlyIF07XG5cbiAgICB3aGlsZSAoIGN1ciAmJiBjdXIubm9kZVR5cGUgIT09IDkgJiYgKHVudGlsID09PSB1bmRlZmluZWQgfHwgY3VyLm5vZGVUeXBlICE9PSAxIHx8ICFqUXVlcnkoIGN1ciApLmlzKCB1bnRpbCApKSApIHtcbiAgICAgIGlmICggY3VyLm5vZGVUeXBlID09PSAxICkge1xuICAgICAgICBtYXRjaGVkLnB1c2goIGN1ciApO1xuICAgICAgfVxuICAgICAgY3VyID0gY3VyW2Rpcl07XG4gICAgfVxuICAgIHJldHVybiBtYXRjaGVkO1xuICB9LFxuXG4gIHNpYmxpbmc6IGZ1bmN0aW9uKCBuLCBlbGVtICkge1xuICAgIHZhciByID0gW107XG5cbiAgICBmb3IgKCA7IG47IG4gPSBuLm5leHRTaWJsaW5nICkge1xuICAgICAgaWYgKCBuLm5vZGVUeXBlID09PSAxICYmIG4gIT09IGVsZW0gKSB7XG4gICAgICAgIHIucHVzaCggbiApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByO1xuICB9XG59KTtcblxuLy8gSW1wbGVtZW50IHRoZSBpZGVudGljYWwgZnVuY3Rpb25hbGl0eSBmb3IgZmlsdGVyIGFuZCBub3RcbmZ1bmN0aW9uIHdpbm5vdyggZWxlbWVudHMsIHF1YWxpZmllciwgbm90ICkge1xuICBpZiAoIGpRdWVyeS5pc0Z1bmN0aW9uKCBxdWFsaWZpZXIgKSApIHtcbiAgICByZXR1cm4galF1ZXJ5LmdyZXAoIGVsZW1lbnRzLCBmdW5jdGlvbiggZWxlbSwgaSApIHtcbiAgICAgIC8qIGpzaGludCAtVzAxOCAqL1xuICAgICAgcmV0dXJuICEhcXVhbGlmaWVyLmNhbGwoIGVsZW0sIGksIGVsZW0gKSAhPT0gbm90O1xuICAgIH0pO1xuXG4gIH1cblxuICBpZiAoIHF1YWxpZmllci5ub2RlVHlwZSApIHtcbiAgICByZXR1cm4galF1ZXJ5LmdyZXAoIGVsZW1lbnRzLCBmdW5jdGlvbiggZWxlbSApIHtcbiAgICAgIHJldHVybiAoIGVsZW0gPT09IHF1YWxpZmllciApICE9PSBub3Q7XG4gICAgfSk7XG5cbiAgfVxuXG4gIGlmICggdHlwZW9mIHF1YWxpZmllciA9PT0gXCJzdHJpbmdcIiApIHtcbiAgICBpZiAoIGlzU2ltcGxlLnRlc3QoIHF1YWxpZmllciApICkge1xuICAgICAgcmV0dXJuIGpRdWVyeS5maWx0ZXIoIHF1YWxpZmllciwgZWxlbWVudHMsIG5vdCApO1xuICAgIH1cblxuICAgIHF1YWxpZmllciA9IGpRdWVyeS5maWx0ZXIoIHF1YWxpZmllciwgZWxlbWVudHMgKTtcbiAgfVxuXG4gIHJldHVybiBqUXVlcnkuZ3JlcCggZWxlbWVudHMsIGZ1bmN0aW9uKCBlbGVtICkge1xuICAgIHJldHVybiAoIGpRdWVyeS5pbkFycmF5KCBlbGVtLCBxdWFsaWZpZXIgKSA+PSAwICkgIT09IG5vdDtcbiAgfSk7XG59XG5mdW5jdGlvbiBjcmVhdGVTYWZlRnJhZ21lbnQoIGRvY3VtZW50ICkge1xuICB2YXIgbGlzdCA9IG5vZGVOYW1lcy5zcGxpdCggXCJ8XCIgKSxcbiAgICBzYWZlRnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcblxuICBpZiAoIHNhZmVGcmFnLmNyZWF0ZUVsZW1lbnQgKSB7XG4gICAgd2hpbGUgKCBsaXN0Lmxlbmd0aCApIHtcbiAgICAgIHNhZmVGcmFnLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgIGxpc3QucG9wKClcbiAgICAgICk7XG4gICAgfVxuICB9XG4gIHJldHVybiBzYWZlRnJhZztcbn1cblxudmFyIG5vZGVOYW1lcyA9IFwiYWJicnxhcnRpY2xlfGFzaWRlfGF1ZGlvfGJkaXxjYW52YXN8ZGF0YXxkYXRhbGlzdHxkZXRhaWxzfGZpZ2NhcHRpb258ZmlndXJlfGZvb3RlcnxcIiArXG4gICAgXCJoZWFkZXJ8aGdyb3VwfG1hcmt8bWV0ZXJ8bmF2fG91dHB1dHxwcm9ncmVzc3xzZWN0aW9ufHN1bW1hcnl8dGltZXx2aWRlb1wiLFxuICByaW5saW5lalF1ZXJ5ID0gLyBqUXVlcnlcXGQrPVwiKD86bnVsbHxcXGQrKVwiL2csXG4gIHJub3NoaW1jYWNoZSA9IG5ldyBSZWdFeHAoXCI8KD86XCIgKyBub2RlTmFtZXMgKyBcIilbXFxcXHMvPl1cIiwgXCJpXCIpLFxuICBybGVhZGluZ1doaXRlc3BhY2UgPSAvXlxccysvLFxuICByeGh0bWxUYWcgPSAvPCg/IWFyZWF8YnJ8Y29sfGVtYmVkfGhyfGltZ3xpbnB1dHxsaW5rfG1ldGF8cGFyYW0pKChbXFx3Ol0rKVtePl0qKVxcLz4vZ2ksXG4gIHJ0YWdOYW1lID0gLzwoW1xcdzpdKykvLFxuICBydGJvZHkgPSAvPHRib2R5L2ksXG4gIHJodG1sID0gLzx8JiM/XFx3KzsvLFxuICBybm9Jbm5lcmh0bWwgPSAvPCg/OnNjcmlwdHxzdHlsZXxsaW5rKS9pLFxuICBtYW5pcHVsYXRpb25fcmNoZWNrYWJsZVR5cGUgPSAvXig/OmNoZWNrYm94fHJhZGlvKSQvaSxcbiAgLy8gY2hlY2tlZD1cImNoZWNrZWRcIiBvciBjaGVja2VkXG4gIHJjaGVja2VkID0gL2NoZWNrZWRcXHMqKD86W149XXw9XFxzKi5jaGVja2VkLikvaSxcbiAgcnNjcmlwdFR5cGUgPSAvXiR8XFwvKD86amF2YXxlY21hKXNjcmlwdC9pLFxuICByc2NyaXB0VHlwZU1hc2tlZCA9IC9edHJ1ZVxcLyguKikvLFxuICByY2xlYW5TY3JpcHQgPSAvXlxccyo8ISg/OlxcW0NEQVRBXFxbfC0tKXwoPzpcXF1cXF18LS0pPlxccyokL2csXG5cbiAgLy8gV2UgaGF2ZSB0byBjbG9zZSB0aGVzZSB0YWdzIHRvIHN1cHBvcnQgWEhUTUwgKCMxMzIwMClcbiAgd3JhcE1hcCA9IHtcbiAgICBvcHRpb246IFsgMSwgXCI8c2VsZWN0IG11bHRpcGxlPSdtdWx0aXBsZSc+XCIsIFwiPC9zZWxlY3Q+XCIgXSxcbiAgICBsZWdlbmQ6IFsgMSwgXCI8ZmllbGRzZXQ+XCIsIFwiPC9maWVsZHNldD5cIiBdLFxuICAgIGFyZWE6IFsgMSwgXCI8bWFwPlwiLCBcIjwvbWFwPlwiIF0sXG4gICAgcGFyYW06IFsgMSwgXCI8b2JqZWN0PlwiLCBcIjwvb2JqZWN0PlwiIF0sXG4gICAgdGhlYWQ6IFsgMSwgXCI8dGFibGU+XCIsIFwiPC90YWJsZT5cIiBdLFxuICAgIHRyOiBbIDIsIFwiPHRhYmxlPjx0Ym9keT5cIiwgXCI8L3Rib2R5PjwvdGFibGU+XCIgXSxcbiAgICBjb2w6IFsgMiwgXCI8dGFibGU+PHRib2R5PjwvdGJvZHk+PGNvbGdyb3VwPlwiLCBcIjwvY29sZ3JvdXA+PC90YWJsZT5cIiBdLFxuICAgIHRkOiBbIDMsIFwiPHRhYmxlPjx0Ym9keT48dHI+XCIsIFwiPC90cj48L3Rib2R5PjwvdGFibGU+XCIgXSxcblxuICAgIC8vIElFNi04IGNhbid0IHNlcmlhbGl6ZSBsaW5rLCBzY3JpcHQsIHN0eWxlLCBvciBhbnkgaHRtbDUgKE5vU2NvcGUpIHRhZ3MsXG4gICAgLy8gdW5sZXNzIHdyYXBwZWQgaW4gYSBkaXYgd2l0aCBub24tYnJlYWtpbmcgY2hhcmFjdGVycyBpbiBmcm9udCBvZiBpdC5cbiAgICBfZGVmYXVsdDogalF1ZXJ5LnN1cHBvcnQuaHRtbFNlcmlhbGl6ZSA/IFsgMCwgXCJcIiwgXCJcIiBdIDogWyAxLCBcIlg8ZGl2PlwiLCBcIjwvZGl2PlwiICBdXG4gIH0sXG4gIHNhZmVGcmFnbWVudCA9IGNyZWF0ZVNhZmVGcmFnbWVudCggZG9jdW1lbnQgKSxcbiAgZnJhZ21lbnREaXYgPSBzYWZlRnJhZ21lbnQuYXBwZW5kQ2hpbGQoIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIikgKTtcblxud3JhcE1hcC5vcHRncm91cCA9IHdyYXBNYXAub3B0aW9uO1xud3JhcE1hcC50Ym9keSA9IHdyYXBNYXAudGZvb3QgPSB3cmFwTWFwLmNvbGdyb3VwID0gd3JhcE1hcC5jYXB0aW9uID0gd3JhcE1hcC50aGVhZDtcbndyYXBNYXAudGggPSB3cmFwTWFwLnRkO1xuXG5qUXVlcnkuZm4uZXh0ZW5kKHtcbiAgdGV4dDogZnVuY3Rpb24oIHZhbHVlICkge1xuICAgIHJldHVybiBqUXVlcnkuYWNjZXNzKCB0aGlzLCBmdW5jdGlvbiggdmFsdWUgKSB7XG4gICAgICByZXR1cm4gdmFsdWUgPT09IHVuZGVmaW5lZCA/XG4gICAgICAgIGpRdWVyeS50ZXh0KCB0aGlzICkgOlxuICAgICAgICB0aGlzLmVtcHR5KCkuYXBwZW5kKCAoIHRoaXNbMF0gJiYgdGhpc1swXS5vd25lckRvY3VtZW50IHx8IGRvY3VtZW50ICkuY3JlYXRlVGV4dE5vZGUoIHZhbHVlICkgKTtcbiAgICB9LCBudWxsLCB2YWx1ZSwgYXJndW1lbnRzLmxlbmd0aCApO1xuICB9LFxuXG4gIGFwcGVuZDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZG9tTWFuaXAoIGFyZ3VtZW50cywgZnVuY3Rpb24oIGVsZW0gKSB7XG4gICAgICBpZiAoIHRoaXMubm9kZVR5cGUgPT09IDEgfHwgdGhpcy5ub2RlVHlwZSA9PT0gMTEgfHwgdGhpcy5ub2RlVHlwZSA9PT0gOSApIHtcbiAgICAgICAgdmFyIHRhcmdldCA9IG1hbmlwdWxhdGlvblRhcmdldCggdGhpcywgZWxlbSApO1xuICAgICAgICB0YXJnZXQuYXBwZW5kQ2hpbGQoIGVsZW0gKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcblxuICBwcmVwZW5kOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5kb21NYW5pcCggYXJndW1lbnRzLCBmdW5jdGlvbiggZWxlbSApIHtcbiAgICAgIGlmICggdGhpcy5ub2RlVHlwZSA9PT0gMSB8fCB0aGlzLm5vZGVUeXBlID09PSAxMSB8fCB0aGlzLm5vZGVUeXBlID09PSA5ICkge1xuICAgICAgICB2YXIgdGFyZ2V0ID0gbWFuaXB1bGF0aW9uVGFyZ2V0KCB0aGlzLCBlbGVtICk7XG4gICAgICAgIHRhcmdldC5pbnNlcnRCZWZvcmUoIGVsZW0sIHRhcmdldC5maXJzdENoaWxkICk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cbiAgYmVmb3JlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5kb21NYW5pcCggYXJndW1lbnRzLCBmdW5jdGlvbiggZWxlbSApIHtcbiAgICAgIGlmICggdGhpcy5wYXJlbnROb2RlICkge1xuICAgICAgICB0aGlzLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKCBlbGVtLCB0aGlzICk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cbiAgYWZ0ZXI6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmRvbU1hbmlwKCBhcmd1bWVudHMsIGZ1bmN0aW9uKCBlbGVtICkge1xuICAgICAgaWYgKCB0aGlzLnBhcmVudE5vZGUgKSB7XG4gICAgICAgIHRoaXMucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoIGVsZW0sIHRoaXMubmV4dFNpYmxpbmcgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcblxuICAvLyBrZWVwRGF0YSBpcyBmb3IgaW50ZXJuYWwgdXNlIG9ubHktLWRvIG5vdCBkb2N1bWVudFxuICByZW1vdmU6IGZ1bmN0aW9uKCBzZWxlY3Rvciwga2VlcERhdGEgKSB7XG4gICAgdmFyIGVsZW0sXG4gICAgICBlbGVtcyA9IHNlbGVjdG9yID8galF1ZXJ5LmZpbHRlciggc2VsZWN0b3IsIHRoaXMgKSA6IHRoaXMsXG4gICAgICBpID0gMDtcblxuICAgIGZvciAoIDsgKGVsZW0gPSBlbGVtc1tpXSkgIT0gbnVsbDsgaSsrICkge1xuXG4gICAgICBpZiAoICFrZWVwRGF0YSAmJiBlbGVtLm5vZGVUeXBlID09PSAxICkge1xuICAgICAgICBqUXVlcnkuY2xlYW5EYXRhKCBnZXRBbGwoIGVsZW0gKSApO1xuICAgICAgfVxuXG4gICAgICBpZiAoIGVsZW0ucGFyZW50Tm9kZSApIHtcbiAgICAgICAgaWYgKCBrZWVwRGF0YSAmJiBqUXVlcnkuY29udGFpbnMoIGVsZW0ub3duZXJEb2N1bWVudCwgZWxlbSApICkge1xuICAgICAgICAgIHNldEdsb2JhbEV2YWwoIGdldEFsbCggZWxlbSwgXCJzY3JpcHRcIiApICk7XG4gICAgICAgIH1cbiAgICAgICAgZWxlbS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKCBlbGVtICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgZW1wdHk6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBlbGVtLFxuICAgICAgaSA9IDA7XG5cbiAgICBmb3IgKCA7IChlbGVtID0gdGhpc1tpXSkgIT0gbnVsbDsgaSsrICkge1xuICAgICAgLy8gUmVtb3ZlIGVsZW1lbnQgbm9kZXMgYW5kIHByZXZlbnQgbWVtb3J5IGxlYWtzXG4gICAgICBpZiAoIGVsZW0ubm9kZVR5cGUgPT09IDEgKSB7XG4gICAgICAgIGpRdWVyeS5jbGVhbkRhdGEoIGdldEFsbCggZWxlbSwgZmFsc2UgKSApO1xuICAgICAgfVxuXG4gICAgICAvLyBSZW1vdmUgYW55IHJlbWFpbmluZyBub2Rlc1xuICAgICAgd2hpbGUgKCBlbGVtLmZpcnN0Q2hpbGQgKSB7XG4gICAgICAgIGVsZW0ucmVtb3ZlQ2hpbGQoIGVsZW0uZmlyc3RDaGlsZCApO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiB0aGlzIGlzIGEgc2VsZWN0LCBlbnN1cmUgdGhhdCBpdCBkaXNwbGF5cyBlbXB0eSAoIzEyMzM2KVxuICAgICAgLy8gU3VwcG9ydDogSUU8OVxuICAgICAgaWYgKCBlbGVtLm9wdGlvbnMgJiYgalF1ZXJ5Lm5vZGVOYW1lKCBlbGVtLCBcInNlbGVjdFwiICkgKSB7XG4gICAgICAgIGVsZW0ub3B0aW9ucy5sZW5ndGggPSAwO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIGNsb25lOiBmdW5jdGlvbiggZGF0YUFuZEV2ZW50cywgZGVlcERhdGFBbmRFdmVudHMgKSB7XG4gICAgZGF0YUFuZEV2ZW50cyA9IGRhdGFBbmRFdmVudHMgPT0gbnVsbCA/IGZhbHNlIDogZGF0YUFuZEV2ZW50cztcbiAgICBkZWVwRGF0YUFuZEV2ZW50cyA9IGRlZXBEYXRhQW5kRXZlbnRzID09IG51bGwgPyBkYXRhQW5kRXZlbnRzIDogZGVlcERhdGFBbmRFdmVudHM7XG5cbiAgICByZXR1cm4gdGhpcy5tYXAoIGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBqUXVlcnkuY2xvbmUoIHRoaXMsIGRhdGFBbmRFdmVudHMsIGRlZXBEYXRhQW5kRXZlbnRzICk7XG4gICAgfSk7XG4gIH0sXG5cbiAgaHRtbDogZnVuY3Rpb24oIHZhbHVlICkge1xuICAgIHJldHVybiBqUXVlcnkuYWNjZXNzKCB0aGlzLCBmdW5jdGlvbiggdmFsdWUgKSB7XG4gICAgICB2YXIgZWxlbSA9IHRoaXNbMF0gfHwge30sXG4gICAgICAgIGkgPSAwLFxuICAgICAgICBsID0gdGhpcy5sZW5ndGg7XG5cbiAgICAgIGlmICggdmFsdWUgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgcmV0dXJuIGVsZW0ubm9kZVR5cGUgPT09IDEgP1xuICAgICAgICAgIGVsZW0uaW5uZXJIVE1MLnJlcGxhY2UoIHJpbmxpbmVqUXVlcnksIFwiXCIgKSA6XG4gICAgICAgICAgdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgICAvLyBTZWUgaWYgd2UgY2FuIHRha2UgYSBzaG9ydGN1dCBhbmQganVzdCB1c2UgaW5uZXJIVE1MXG4gICAgICBpZiAoIHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIiAmJiAhcm5vSW5uZXJodG1sLnRlc3QoIHZhbHVlICkgJiZcbiAgICAgICAgKCBqUXVlcnkuc3VwcG9ydC5odG1sU2VyaWFsaXplIHx8ICFybm9zaGltY2FjaGUudGVzdCggdmFsdWUgKSAgKSAmJlxuICAgICAgICAoIGpRdWVyeS5zdXBwb3J0LmxlYWRpbmdXaGl0ZXNwYWNlIHx8ICFybGVhZGluZ1doaXRlc3BhY2UudGVzdCggdmFsdWUgKSApICYmXG4gICAgICAgICF3cmFwTWFwWyAoIHJ0YWdOYW1lLmV4ZWMoIHZhbHVlICkgfHwgW1wiXCIsIFwiXCJdIClbMV0udG9Mb3dlckNhc2UoKSBdICkge1xuXG4gICAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSggcnhodG1sVGFnLCBcIjwkMT48LyQyPlwiICk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBmb3IgKDsgaSA8IGw7IGkrKyApIHtcbiAgICAgICAgICAgIC8vIFJlbW92ZSBlbGVtZW50IG5vZGVzIGFuZCBwcmV2ZW50IG1lbW9yeSBsZWFrc1xuICAgICAgICAgICAgZWxlbSA9IHRoaXNbaV0gfHwge307XG4gICAgICAgICAgICBpZiAoIGVsZW0ubm9kZVR5cGUgPT09IDEgKSB7XG4gICAgICAgICAgICAgIGpRdWVyeS5jbGVhbkRhdGEoIGdldEFsbCggZWxlbSwgZmFsc2UgKSApO1xuICAgICAgICAgICAgICBlbGVtLmlubmVySFRNTCA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGVsZW0gPSAwO1xuXG4gICAgICAgIC8vIElmIHVzaW5nIGlubmVySFRNTCB0aHJvd3MgYW4gZXhjZXB0aW9uLCB1c2UgdGhlIGZhbGxiYWNrIG1ldGhvZFxuICAgICAgICB9IGNhdGNoKGUpIHt9XG4gICAgICB9XG5cbiAgICAgIGlmICggZWxlbSApIHtcbiAgICAgICAgdGhpcy5lbXB0eSgpLmFwcGVuZCggdmFsdWUgKTtcbiAgICAgIH1cbiAgICB9LCBudWxsLCB2YWx1ZSwgYXJndW1lbnRzLmxlbmd0aCApO1xuICB9LFxuXG4gIHJlcGxhY2VXaXRoOiBmdW5jdGlvbigpIHtcbiAgICB2YXJcbiAgICAgIC8vIFNuYXBzaG90IHRoZSBET00gaW4gY2FzZSAuZG9tTWFuaXAgc3dlZXBzIHNvbWV0aGluZyByZWxldmFudCBpbnRvIGl0cyBmcmFnbWVudFxuICAgICAgYXJncyA9IGpRdWVyeS5tYXAoIHRoaXMsIGZ1bmN0aW9uKCBlbGVtICkge1xuICAgICAgICByZXR1cm4gWyBlbGVtLm5leHRTaWJsaW5nLCBlbGVtLnBhcmVudE5vZGUgXTtcbiAgICAgIH0pLFxuICAgICAgaSA9IDA7XG5cbiAgICAvLyBNYWtlIHRoZSBjaGFuZ2VzLCByZXBsYWNpbmcgZWFjaCBjb250ZXh0IGVsZW1lbnQgd2l0aCB0aGUgbmV3IGNvbnRlbnRcbiAgICB0aGlzLmRvbU1hbmlwKCBhcmd1bWVudHMsIGZ1bmN0aW9uKCBlbGVtICkge1xuICAgICAgdmFyIG5leHQgPSBhcmdzWyBpKysgXSxcbiAgICAgICAgcGFyZW50ID0gYXJnc1sgaSsrIF07XG5cbiAgICAgIGlmICggcGFyZW50ICkge1xuICAgICAgICAvLyBEb24ndCB1c2UgdGhlIHNuYXBzaG90IG5leHQgaWYgaXQgaGFzIG1vdmVkICgjMTM4MTApXG4gICAgICAgIGlmICggbmV4dCAmJiBuZXh0LnBhcmVudE5vZGUgIT09IHBhcmVudCApIHtcbiAgICAgICAgICBuZXh0ID0gdGhpcy5uZXh0U2libGluZztcbiAgICAgICAgfVxuICAgICAgICBqUXVlcnkoIHRoaXMgKS5yZW1vdmUoKTtcbiAgICAgICAgcGFyZW50Lmluc2VydEJlZm9yZSggZWxlbSwgbmV4dCApO1xuICAgICAgfVxuICAgIC8vIEFsbG93IG5ldyBjb250ZW50IHRvIGluY2x1ZGUgZWxlbWVudHMgZnJvbSB0aGUgY29udGV4dCBzZXRcbiAgICB9LCB0cnVlICk7XG5cbiAgICAvLyBGb3JjZSByZW1vdmFsIGlmIHRoZXJlIHdhcyBubyBuZXcgY29udGVudCAoZS5nLiwgZnJvbSBlbXB0eSBhcmd1bWVudHMpXG4gICAgcmV0dXJuIGkgPyB0aGlzIDogdGhpcy5yZW1vdmUoKTtcbiAgfSxcblxuICBkZXRhY2g6IGZ1bmN0aW9uKCBzZWxlY3RvciApIHtcbiAgICByZXR1cm4gdGhpcy5yZW1vdmUoIHNlbGVjdG9yLCB0cnVlICk7XG4gIH0sXG5cbiAgZG9tTWFuaXA6IGZ1bmN0aW9uKCBhcmdzLCBjYWxsYmFjaywgYWxsb3dJbnRlcnNlY3Rpb24gKSB7XG5cbiAgICAvLyBGbGF0dGVuIGFueSBuZXN0ZWQgYXJyYXlzXG4gICAgYXJncyA9IGNvcmVfY29uY2F0LmFwcGx5KCBbXSwgYXJncyApO1xuXG4gICAgdmFyIGZpcnN0LCBub2RlLCBoYXNTY3JpcHRzLFxuICAgICAgc2NyaXB0cywgZG9jLCBmcmFnbWVudCxcbiAgICAgIGkgPSAwLFxuICAgICAgbCA9IHRoaXMubGVuZ3RoLFxuICAgICAgc2V0ID0gdGhpcyxcbiAgICAgIGlOb0Nsb25lID0gbCAtIDEsXG4gICAgICB2YWx1ZSA9IGFyZ3NbMF0sXG4gICAgICBpc0Z1bmN0aW9uID0galF1ZXJ5LmlzRnVuY3Rpb24oIHZhbHVlICk7XG5cbiAgICAvLyBXZSBjYW4ndCBjbG9uZU5vZGUgZnJhZ21lbnRzIHRoYXQgY29udGFpbiBjaGVja2VkLCBpbiBXZWJLaXRcbiAgICBpZiAoIGlzRnVuY3Rpb24gfHwgISggbCA8PSAxIHx8IHR5cGVvZiB2YWx1ZSAhPT0gXCJzdHJpbmdcIiB8fCBqUXVlcnkuc3VwcG9ydC5jaGVja0Nsb25lIHx8ICFyY2hlY2tlZC50ZXN0KCB2YWx1ZSApICkgKSB7XG4gICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCBpbmRleCApIHtcbiAgICAgICAgdmFyIHNlbGYgPSBzZXQuZXEoIGluZGV4ICk7XG4gICAgICAgIGlmICggaXNGdW5jdGlvbiApIHtcbiAgICAgICAgICBhcmdzWzBdID0gdmFsdWUuY2FsbCggdGhpcywgaW5kZXgsIHNlbGYuaHRtbCgpICk7XG4gICAgICAgIH1cbiAgICAgICAgc2VsZi5kb21NYW5pcCggYXJncywgY2FsbGJhY2ssIGFsbG93SW50ZXJzZWN0aW9uICk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoIGwgKSB7XG4gICAgICBmcmFnbWVudCA9IGpRdWVyeS5idWlsZEZyYWdtZW50KCBhcmdzLCB0aGlzWyAwIF0ub3duZXJEb2N1bWVudCwgZmFsc2UsICFhbGxvd0ludGVyc2VjdGlvbiAmJiB0aGlzICk7XG4gICAgICBmaXJzdCA9IGZyYWdtZW50LmZpcnN0Q2hpbGQ7XG5cbiAgICAgIGlmICggZnJhZ21lbnQuY2hpbGROb2Rlcy5sZW5ndGggPT09IDEgKSB7XG4gICAgICAgIGZyYWdtZW50ID0gZmlyc3Q7XG4gICAgICB9XG5cbiAgICAgIGlmICggZmlyc3QgKSB7XG4gICAgICAgIHNjcmlwdHMgPSBqUXVlcnkubWFwKCBnZXRBbGwoIGZyYWdtZW50LCBcInNjcmlwdFwiICksIGRpc2FibGVTY3JpcHQgKTtcbiAgICAgICAgaGFzU2NyaXB0cyA9IHNjcmlwdHMubGVuZ3RoO1xuXG4gICAgICAgIC8vIFVzZSB0aGUgb3JpZ2luYWwgZnJhZ21lbnQgZm9yIHRoZSBsYXN0IGl0ZW0gaW5zdGVhZCBvZiB0aGUgZmlyc3QgYmVjYXVzZSBpdCBjYW4gZW5kIHVwXG4gICAgICAgIC8vIGJlaW5nIGVtcHRpZWQgaW5jb3JyZWN0bHkgaW4gY2VydGFpbiBzaXR1YXRpb25zICgjODA3MCkuXG4gICAgICAgIGZvciAoIDsgaSA8IGw7IGkrKyApIHtcbiAgICAgICAgICBub2RlID0gZnJhZ21lbnQ7XG5cbiAgICAgICAgICBpZiAoIGkgIT09IGlOb0Nsb25lICkge1xuICAgICAgICAgICAgbm9kZSA9IGpRdWVyeS5jbG9uZSggbm9kZSwgdHJ1ZSwgdHJ1ZSApO1xuXG4gICAgICAgICAgICAvLyBLZWVwIHJlZmVyZW5jZXMgdG8gY2xvbmVkIHNjcmlwdHMgZm9yIGxhdGVyIHJlc3RvcmF0aW9uXG4gICAgICAgICAgICBpZiAoIGhhc1NjcmlwdHMgKSB7XG4gICAgICAgICAgICAgIGpRdWVyeS5tZXJnZSggc2NyaXB0cywgZ2V0QWxsKCBub2RlLCBcInNjcmlwdFwiICkgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjYWxsYmFjay5jYWxsKCB0aGlzW2ldLCBub2RlLCBpICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIGhhc1NjcmlwdHMgKSB7XG4gICAgICAgICAgZG9jID0gc2NyaXB0c1sgc2NyaXB0cy5sZW5ndGggLSAxIF0ub3duZXJEb2N1bWVudDtcblxuICAgICAgICAgIC8vIFJlZW5hYmxlIHNjcmlwdHNcbiAgICAgICAgICBqUXVlcnkubWFwKCBzY3JpcHRzLCByZXN0b3JlU2NyaXB0ICk7XG5cbiAgICAgICAgICAvLyBFdmFsdWF0ZSBleGVjdXRhYmxlIHNjcmlwdHMgb24gZmlyc3QgZG9jdW1lbnQgaW5zZXJ0aW9uXG4gICAgICAgICAgZm9yICggaSA9IDA7IGkgPCBoYXNTY3JpcHRzOyBpKysgKSB7XG4gICAgICAgICAgICBub2RlID0gc2NyaXB0c1sgaSBdO1xuICAgICAgICAgICAgaWYgKCByc2NyaXB0VHlwZS50ZXN0KCBub2RlLnR5cGUgfHwgXCJcIiApICYmXG4gICAgICAgICAgICAgICFqUXVlcnkuX2RhdGEoIG5vZGUsIFwiZ2xvYmFsRXZhbFwiICkgJiYgalF1ZXJ5LmNvbnRhaW5zKCBkb2MsIG5vZGUgKSApIHtcblxuICAgICAgICAgICAgICBpZiAoIG5vZGUuc3JjICkge1xuICAgICAgICAgICAgICAgIC8vIEhvcGUgYWpheCBpcyBhdmFpbGFibGUuLi5cbiAgICAgICAgICAgICAgICBqUXVlcnkuX2V2YWxVcmwoIG5vZGUuc3JjICk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgalF1ZXJ5Lmdsb2JhbEV2YWwoICggbm9kZS50ZXh0IHx8IG5vZGUudGV4dENvbnRlbnQgfHwgbm9kZS5pbm5lckhUTUwgfHwgXCJcIiApLnJlcGxhY2UoIHJjbGVhblNjcmlwdCwgXCJcIiApICk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGaXggIzExODA5OiBBdm9pZCBsZWFraW5nIG1lbW9yeVxuICAgICAgICBmcmFnbWVudCA9IGZpcnN0ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufSk7XG5cbi8vIFN1cHBvcnQ6IElFPDhcbi8vIE1hbmlwdWxhdGluZyB0YWJsZXMgcmVxdWlyZXMgYSB0Ym9keVxuZnVuY3Rpb24gbWFuaXB1bGF0aW9uVGFyZ2V0KCBlbGVtLCBjb250ZW50ICkge1xuICByZXR1cm4galF1ZXJ5Lm5vZGVOYW1lKCBlbGVtLCBcInRhYmxlXCIgKSAmJlxuICAgIGpRdWVyeS5ub2RlTmFtZSggY29udGVudC5ub2RlVHlwZSA9PT0gMSA/IGNvbnRlbnQgOiBjb250ZW50LmZpcnN0Q2hpbGQsIFwidHJcIiApID9cblxuICAgIGVsZW0uZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJ0Ym9keVwiKVswXSB8fFxuICAgICAgZWxlbS5hcHBlbmRDaGlsZCggZWxlbS5vd25lckRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0Ym9keVwiKSApIDpcbiAgICBlbGVtO1xufVxuXG4vLyBSZXBsYWNlL3Jlc3RvcmUgdGhlIHR5cGUgYXR0cmlidXRlIG9mIHNjcmlwdCBlbGVtZW50cyBmb3Igc2FmZSBET00gbWFuaXB1bGF0aW9uXG5mdW5jdGlvbiBkaXNhYmxlU2NyaXB0KCBlbGVtICkge1xuICBlbGVtLnR5cGUgPSAoalF1ZXJ5LmZpbmQuYXR0ciggZWxlbSwgXCJ0eXBlXCIgKSAhPT0gbnVsbCkgKyBcIi9cIiArIGVsZW0udHlwZTtcbiAgcmV0dXJuIGVsZW07XG59XG5mdW5jdGlvbiByZXN0b3JlU2NyaXB0KCBlbGVtICkge1xuICB2YXIgbWF0Y2ggPSByc2NyaXB0VHlwZU1hc2tlZC5leGVjKCBlbGVtLnR5cGUgKTtcbiAgaWYgKCBtYXRjaCApIHtcbiAgICBlbGVtLnR5cGUgPSBtYXRjaFsxXTtcbiAgfSBlbHNlIHtcbiAgICBlbGVtLnJlbW92ZUF0dHJpYnV0ZShcInR5cGVcIik7XG4gIH1cbiAgcmV0dXJuIGVsZW07XG59XG5cbi8vIE1hcmsgc2NyaXB0cyBhcyBoYXZpbmcgYWxyZWFkeSBiZWVuIGV2YWx1YXRlZFxuZnVuY3Rpb24gc2V0R2xvYmFsRXZhbCggZWxlbXMsIHJlZkVsZW1lbnRzICkge1xuICB2YXIgZWxlbSxcbiAgICBpID0gMDtcbiAgZm9yICggOyAoZWxlbSA9IGVsZW1zW2ldKSAhPSBudWxsOyBpKysgKSB7XG4gICAgalF1ZXJ5Ll9kYXRhKCBlbGVtLCBcImdsb2JhbEV2YWxcIiwgIXJlZkVsZW1lbnRzIHx8IGpRdWVyeS5fZGF0YSggcmVmRWxlbWVudHNbaV0sIFwiZ2xvYmFsRXZhbFwiICkgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjbG9uZUNvcHlFdmVudCggc3JjLCBkZXN0ICkge1xuXG4gIGlmICggZGVzdC5ub2RlVHlwZSAhPT0gMSB8fCAhalF1ZXJ5Lmhhc0RhdGEoIHNyYyApICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciB0eXBlLCBpLCBsLFxuICAgIG9sZERhdGEgPSBqUXVlcnkuX2RhdGEoIHNyYyApLFxuICAgIGN1ckRhdGEgPSBqUXVlcnkuX2RhdGEoIGRlc3QsIG9sZERhdGEgKSxcbiAgICBldmVudHMgPSBvbGREYXRhLmV2ZW50cztcblxuICBpZiAoIGV2ZW50cyApIHtcbiAgICBkZWxldGUgY3VyRGF0YS5oYW5kbGU7XG4gICAgY3VyRGF0YS5ldmVudHMgPSB7fTtcblxuICAgIGZvciAoIHR5cGUgaW4gZXZlbnRzICkge1xuICAgICAgZm9yICggaSA9IDAsIGwgPSBldmVudHNbIHR5cGUgXS5sZW5ndGg7IGkgPCBsOyBpKysgKSB7XG4gICAgICAgIGpRdWVyeS5ldmVudC5hZGQoIGRlc3QsIHR5cGUsIGV2ZW50c1sgdHlwZSBdWyBpIF0gKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBtYWtlIHRoZSBjbG9uZWQgcHVibGljIGRhdGEgb2JqZWN0IGEgY29weSBmcm9tIHRoZSBvcmlnaW5hbFxuICBpZiAoIGN1ckRhdGEuZGF0YSApIHtcbiAgICBjdXJEYXRhLmRhdGEgPSBqUXVlcnkuZXh0ZW5kKCB7fSwgY3VyRGF0YS5kYXRhICk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZml4Q2xvbmVOb2RlSXNzdWVzKCBzcmMsIGRlc3QgKSB7XG4gIHZhciBub2RlTmFtZSwgZSwgZGF0YTtcblxuICAvLyBXZSBkbyBub3QgbmVlZCB0byBkbyBhbnl0aGluZyBmb3Igbm9uLUVsZW1lbnRzXG4gIGlmICggZGVzdC5ub2RlVHlwZSAhPT0gMSApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBub2RlTmFtZSA9IGRlc3Qubm9kZU5hbWUudG9Mb3dlckNhc2UoKTtcblxuICAvLyBJRTYtOCBjb3BpZXMgZXZlbnRzIGJvdW5kIHZpYSBhdHRhY2hFdmVudCB3aGVuIHVzaW5nIGNsb25lTm9kZS5cbiAgaWYgKCAhalF1ZXJ5LnN1cHBvcnQubm9DbG9uZUV2ZW50ICYmIGRlc3RbIGpRdWVyeS5leHBhbmRvIF0gKSB7XG4gICAgZGF0YSA9IGpRdWVyeS5fZGF0YSggZGVzdCApO1xuXG4gICAgZm9yICggZSBpbiBkYXRhLmV2ZW50cyApIHtcbiAgICAgIGpRdWVyeS5yZW1vdmVFdmVudCggZGVzdCwgZSwgZGF0YS5oYW5kbGUgKTtcbiAgICB9XG5cbiAgICAvLyBFdmVudCBkYXRhIGdldHMgcmVmZXJlbmNlZCBpbnN0ZWFkIG9mIGNvcGllZCBpZiB0aGUgZXhwYW5kbyBnZXRzIGNvcGllZCB0b29cbiAgICBkZXN0LnJlbW92ZUF0dHJpYnV0ZSggalF1ZXJ5LmV4cGFuZG8gKTtcbiAgfVxuXG4gIC8vIElFIGJsYW5rcyBjb250ZW50cyB3aGVuIGNsb25pbmcgc2NyaXB0cywgYW5kIHRyaWVzIHRvIGV2YWx1YXRlIG5ld2x5LXNldCB0ZXh0XG4gIGlmICggbm9kZU5hbWUgPT09IFwic2NyaXB0XCIgJiYgZGVzdC50ZXh0ICE9PSBzcmMudGV4dCApIHtcbiAgICBkaXNhYmxlU2NyaXB0KCBkZXN0ICkudGV4dCA9IHNyYy50ZXh0O1xuICAgIHJlc3RvcmVTY3JpcHQoIGRlc3QgKTtcblxuICAvLyBJRTYtMTAgaW1wcm9wZXJseSBjbG9uZXMgY2hpbGRyZW4gb2Ygb2JqZWN0IGVsZW1lbnRzIHVzaW5nIGNsYXNzaWQuXG4gIC8vIElFMTAgdGhyb3dzIE5vTW9kaWZpY2F0aW9uQWxsb3dlZEVycm9yIGlmIHBhcmVudCBpcyBudWxsLCAjMTIxMzIuXG4gIH0gZWxzZSBpZiAoIG5vZGVOYW1lID09PSBcIm9iamVjdFwiICkge1xuICAgIGlmICggZGVzdC5wYXJlbnROb2RlICkge1xuICAgICAgZGVzdC5vdXRlckhUTUwgPSBzcmMub3V0ZXJIVE1MO1xuICAgIH1cblxuICAgIC8vIFRoaXMgcGF0aCBhcHBlYXJzIHVuYXZvaWRhYmxlIGZvciBJRTkuIFdoZW4gY2xvbmluZyBhbiBvYmplY3RcbiAgICAvLyBlbGVtZW50IGluIElFOSwgdGhlIG91dGVySFRNTCBzdHJhdGVneSBhYm92ZSBpcyBub3Qgc3VmZmljaWVudC5cbiAgICAvLyBJZiB0aGUgc3JjIGhhcyBpbm5lckhUTUwgYW5kIHRoZSBkZXN0aW5hdGlvbiBkb2VzIG5vdCxcbiAgICAvLyBjb3B5IHRoZSBzcmMuaW5uZXJIVE1MIGludG8gdGhlIGRlc3QuaW5uZXJIVE1MLiAjMTAzMjRcbiAgICBpZiAoIGpRdWVyeS5zdXBwb3J0Lmh0bWw1Q2xvbmUgJiYgKCBzcmMuaW5uZXJIVE1MICYmICFqUXVlcnkudHJpbShkZXN0LmlubmVySFRNTCkgKSApIHtcbiAgICAgIGRlc3QuaW5uZXJIVE1MID0gc3JjLmlubmVySFRNTDtcbiAgICB9XG5cbiAgfSBlbHNlIGlmICggbm9kZU5hbWUgPT09IFwiaW5wdXRcIiAmJiBtYW5pcHVsYXRpb25fcmNoZWNrYWJsZVR5cGUudGVzdCggc3JjLnR5cGUgKSApIHtcbiAgICAvLyBJRTYtOCBmYWlscyB0byBwZXJzaXN0IHRoZSBjaGVja2VkIHN0YXRlIG9mIGEgY2xvbmVkIGNoZWNrYm94XG4gICAgLy8gb3IgcmFkaW8gYnV0dG9uLiBXb3JzZSwgSUU2LTcgZmFpbCB0byBnaXZlIHRoZSBjbG9uZWQgZWxlbWVudFxuICAgIC8vIGEgY2hlY2tlZCBhcHBlYXJhbmNlIGlmIHRoZSBkZWZhdWx0Q2hlY2tlZCB2YWx1ZSBpc24ndCBhbHNvIHNldFxuXG4gICAgZGVzdC5kZWZhdWx0Q2hlY2tlZCA9IGRlc3QuY2hlY2tlZCA9IHNyYy5jaGVja2VkO1xuXG4gICAgLy8gSUU2LTcgZ2V0IGNvbmZ1c2VkIGFuZCBlbmQgdXAgc2V0dGluZyB0aGUgdmFsdWUgb2YgYSBjbG9uZWRcbiAgICAvLyBjaGVja2JveC9yYWRpbyBidXR0b24gdG8gYW4gZW1wdHkgc3RyaW5nIGluc3RlYWQgb2YgXCJvblwiXG4gICAgaWYgKCBkZXN0LnZhbHVlICE9PSBzcmMudmFsdWUgKSB7XG4gICAgICBkZXN0LnZhbHVlID0gc3JjLnZhbHVlO1xuICAgIH1cblxuICAvLyBJRTYtOCBmYWlscyB0byByZXR1cm4gdGhlIHNlbGVjdGVkIG9wdGlvbiB0byB0aGUgZGVmYXVsdCBzZWxlY3RlZFxuICAvLyBzdGF0ZSB3aGVuIGNsb25pbmcgb3B0aW9uc1xuICB9IGVsc2UgaWYgKCBub2RlTmFtZSA9PT0gXCJvcHRpb25cIiApIHtcbiAgICBkZXN0LmRlZmF1bHRTZWxlY3RlZCA9IGRlc3Quc2VsZWN0ZWQgPSBzcmMuZGVmYXVsdFNlbGVjdGVkO1xuXG4gIC8vIElFNi04IGZhaWxzIHRvIHNldCB0aGUgZGVmYXVsdFZhbHVlIHRvIHRoZSBjb3JyZWN0IHZhbHVlIHdoZW5cbiAgLy8gY2xvbmluZyBvdGhlciB0eXBlcyBvZiBpbnB1dCBmaWVsZHNcbiAgfSBlbHNlIGlmICggbm9kZU5hbWUgPT09IFwiaW5wdXRcIiB8fCBub2RlTmFtZSA9PT0gXCJ0ZXh0YXJlYVwiICkge1xuICAgIGRlc3QuZGVmYXVsdFZhbHVlID0gc3JjLmRlZmF1bHRWYWx1ZTtcbiAgfVxufVxuXG5qUXVlcnkuZWFjaCh7XG4gIGFwcGVuZFRvOiBcImFwcGVuZFwiLFxuICBwcmVwZW5kVG86IFwicHJlcGVuZFwiLFxuICBpbnNlcnRCZWZvcmU6IFwiYmVmb3JlXCIsXG4gIGluc2VydEFmdGVyOiBcImFmdGVyXCIsXG4gIHJlcGxhY2VBbGw6IFwicmVwbGFjZVdpdGhcIlxufSwgZnVuY3Rpb24oIG5hbWUsIG9yaWdpbmFsICkge1xuICBqUXVlcnkuZm5bIG5hbWUgXSA9IGZ1bmN0aW9uKCBzZWxlY3RvciApIHtcbiAgICB2YXIgZWxlbXMsXG4gICAgICBpID0gMCxcbiAgICAgIHJldCA9IFtdLFxuICAgICAgaW5zZXJ0ID0galF1ZXJ5KCBzZWxlY3RvciApLFxuICAgICAgbGFzdCA9IGluc2VydC5sZW5ndGggLSAxO1xuXG4gICAgZm9yICggOyBpIDw9IGxhc3Q7IGkrKyApIHtcbiAgICAgIGVsZW1zID0gaSA9PT0gbGFzdCA/IHRoaXMgOiB0aGlzLmNsb25lKHRydWUpO1xuICAgICAgalF1ZXJ5KCBpbnNlcnRbaV0gKVsgb3JpZ2luYWwgXSggZWxlbXMgKTtcblxuICAgICAgLy8gTW9kZXJuIGJyb3dzZXJzIGNhbiBhcHBseSBqUXVlcnkgY29sbGVjdGlvbnMgYXMgYXJyYXlzLCBidXQgb2xkSUUgbmVlZHMgYSAuZ2V0KClcbiAgICAgIGNvcmVfcHVzaC5hcHBseSggcmV0LCBlbGVtcy5nZXQoKSApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnB1c2hTdGFjayggcmV0ICk7XG4gIH07XG59KTtcblxuZnVuY3Rpb24gZ2V0QWxsKCBjb250ZXh0LCB0YWcgKSB7XG4gIHZhciBlbGVtcywgZWxlbSxcbiAgICBpID0gMCxcbiAgICBmb3VuZCA9IHR5cGVvZiBjb250ZXh0LmdldEVsZW1lbnRzQnlUYWdOYW1lICE9PSBjb3JlX3N0cnVuZGVmaW5lZCA/IGNvbnRleHQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoIHRhZyB8fCBcIipcIiApIDpcbiAgICAgIHR5cGVvZiBjb250ZXh0LnF1ZXJ5U2VsZWN0b3JBbGwgIT09IGNvcmVfc3RydW5kZWZpbmVkID8gY29udGV4dC5xdWVyeVNlbGVjdG9yQWxsKCB0YWcgfHwgXCIqXCIgKSA6XG4gICAgICB1bmRlZmluZWQ7XG5cbiAgaWYgKCAhZm91bmQgKSB7XG4gICAgZm9yICggZm91bmQgPSBbXSwgZWxlbXMgPSBjb250ZXh0LmNoaWxkTm9kZXMgfHwgY29udGV4dDsgKGVsZW0gPSBlbGVtc1tpXSkgIT0gbnVsbDsgaSsrICkge1xuICAgICAgaWYgKCAhdGFnIHx8IGpRdWVyeS5ub2RlTmFtZSggZWxlbSwgdGFnICkgKSB7XG4gICAgICAgIGZvdW5kLnB1c2goIGVsZW0gKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGpRdWVyeS5tZXJnZSggZm91bmQsIGdldEFsbCggZWxlbSwgdGFnICkgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGFnID09PSB1bmRlZmluZWQgfHwgdGFnICYmIGpRdWVyeS5ub2RlTmFtZSggY29udGV4dCwgdGFnICkgP1xuICAgIGpRdWVyeS5tZXJnZSggWyBjb250ZXh0IF0sIGZvdW5kICkgOlxuICAgIGZvdW5kO1xufVxuXG4vLyBVc2VkIGluIGJ1aWxkRnJhZ21lbnQsIGZpeGVzIHRoZSBkZWZhdWx0Q2hlY2tlZCBwcm9wZXJ0eVxuZnVuY3Rpb24gZml4RGVmYXVsdENoZWNrZWQoIGVsZW0gKSB7XG4gIGlmICggbWFuaXB1bGF0aW9uX3JjaGVja2FibGVUeXBlLnRlc3QoIGVsZW0udHlwZSApICkge1xuICAgIGVsZW0uZGVmYXVsdENoZWNrZWQgPSBlbGVtLmNoZWNrZWQ7XG4gIH1cbn1cblxualF1ZXJ5LmV4dGVuZCh7XG4gIGNsb25lOiBmdW5jdGlvbiggZWxlbSwgZGF0YUFuZEV2ZW50cywgZGVlcERhdGFBbmRFdmVudHMgKSB7XG4gICAgdmFyIGRlc3RFbGVtZW50cywgbm9kZSwgY2xvbmUsIGksIHNyY0VsZW1lbnRzLFxuICAgICAgaW5QYWdlID0galF1ZXJ5LmNvbnRhaW5zKCBlbGVtLm93bmVyRG9jdW1lbnQsIGVsZW0gKTtcblxuICAgIGlmICggalF1ZXJ5LnN1cHBvcnQuaHRtbDVDbG9uZSB8fCBqUXVlcnkuaXNYTUxEb2MoZWxlbSkgfHwgIXJub3NoaW1jYWNoZS50ZXN0KCBcIjxcIiArIGVsZW0ubm9kZU5hbWUgKyBcIj5cIiApICkge1xuICAgICAgY2xvbmUgPSBlbGVtLmNsb25lTm9kZSggdHJ1ZSApO1xuXG4gICAgLy8gSUU8PTggZG9lcyBub3QgcHJvcGVybHkgY2xvbmUgZGV0YWNoZWQsIHVua25vd24gZWxlbWVudCBub2Rlc1xuICAgIH0gZWxzZSB7XG4gICAgICBmcmFnbWVudERpdi5pbm5lckhUTUwgPSBlbGVtLm91dGVySFRNTDtcbiAgICAgIGZyYWdtZW50RGl2LnJlbW92ZUNoaWxkKCBjbG9uZSA9IGZyYWdtZW50RGl2LmZpcnN0Q2hpbGQgKTtcbiAgICB9XG5cbiAgICBpZiAoICghalF1ZXJ5LnN1cHBvcnQubm9DbG9uZUV2ZW50IHx8ICFqUXVlcnkuc3VwcG9ydC5ub0Nsb25lQ2hlY2tlZCkgJiZcbiAgICAgICAgKGVsZW0ubm9kZVR5cGUgPT09IDEgfHwgZWxlbS5ub2RlVHlwZSA9PT0gMTEpICYmICFqUXVlcnkuaXNYTUxEb2MoZWxlbSkgKSB7XG5cbiAgICAgIC8vIFdlIGVzY2hldyBTaXp6bGUgaGVyZSBmb3IgcGVyZm9ybWFuY2UgcmVhc29uczogaHR0cDovL2pzcGVyZi5jb20vZ2V0YWxsLXZzLXNpenpsZS8yXG4gICAgICBkZXN0RWxlbWVudHMgPSBnZXRBbGwoIGNsb25lICk7XG4gICAgICBzcmNFbGVtZW50cyA9IGdldEFsbCggZWxlbSApO1xuXG4gICAgICAvLyBGaXggYWxsIElFIGNsb25pbmcgaXNzdWVzXG4gICAgICBmb3IgKCBpID0gMDsgKG5vZGUgPSBzcmNFbGVtZW50c1tpXSkgIT0gbnVsbDsgKytpICkge1xuICAgICAgICAvLyBFbnN1cmUgdGhhdCB0aGUgZGVzdGluYXRpb24gbm9kZSBpcyBub3QgbnVsbDsgRml4ZXMgIzk1ODdcbiAgICAgICAgaWYgKCBkZXN0RWxlbWVudHNbaV0gKSB7XG4gICAgICAgICAgZml4Q2xvbmVOb2RlSXNzdWVzKCBub2RlLCBkZXN0RWxlbWVudHNbaV0gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIENvcHkgdGhlIGV2ZW50cyBmcm9tIHRoZSBvcmlnaW5hbCB0byB0aGUgY2xvbmVcbiAgICBpZiAoIGRhdGFBbmRFdmVudHMgKSB7XG4gICAgICBpZiAoIGRlZXBEYXRhQW5kRXZlbnRzICkge1xuICAgICAgICBzcmNFbGVtZW50cyA9IHNyY0VsZW1lbnRzIHx8IGdldEFsbCggZWxlbSApO1xuICAgICAgICBkZXN0RWxlbWVudHMgPSBkZXN0RWxlbWVudHMgfHwgZ2V0QWxsKCBjbG9uZSApO1xuXG4gICAgICAgIGZvciAoIGkgPSAwOyAobm9kZSA9IHNyY0VsZW1lbnRzW2ldKSAhPSBudWxsOyBpKysgKSB7XG4gICAgICAgICAgY2xvbmVDb3B5RXZlbnQoIG5vZGUsIGRlc3RFbGVtZW50c1tpXSApO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjbG9uZUNvcHlFdmVudCggZWxlbSwgY2xvbmUgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBQcmVzZXJ2ZSBzY3JpcHQgZXZhbHVhdGlvbiBoaXN0b3J5XG4gICAgZGVzdEVsZW1lbnRzID0gZ2V0QWxsKCBjbG9uZSwgXCJzY3JpcHRcIiApO1xuICAgIGlmICggZGVzdEVsZW1lbnRzLmxlbmd0aCA+IDAgKSB7XG4gICAgICBzZXRHbG9iYWxFdmFsKCBkZXN0RWxlbWVudHMsICFpblBhZ2UgJiYgZ2V0QWxsKCBlbGVtLCBcInNjcmlwdFwiICkgKTtcbiAgICB9XG5cbiAgICBkZXN0RWxlbWVudHMgPSBzcmNFbGVtZW50cyA9IG5vZGUgPSBudWxsO1xuXG4gICAgLy8gUmV0dXJuIHRoZSBjbG9uZWQgc2V0XG4gICAgcmV0dXJuIGNsb25lO1xuICB9LFxuXG4gIGJ1aWxkRnJhZ21lbnQ6IGZ1bmN0aW9uKCBlbGVtcywgY29udGV4dCwgc2NyaXB0cywgc2VsZWN0aW9uICkge1xuICAgIHZhciBqLCBlbGVtLCBjb250YWlucyxcbiAgICAgIHRtcCwgdGFnLCB0Ym9keSwgd3JhcCxcbiAgICAgIGwgPSBlbGVtcy5sZW5ndGgsXG5cbiAgICAgIC8vIEVuc3VyZSBhIHNhZmUgZnJhZ21lbnRcbiAgICAgIHNhZmUgPSBjcmVhdGVTYWZlRnJhZ21lbnQoIGNvbnRleHQgKSxcblxuICAgICAgbm9kZXMgPSBbXSxcbiAgICAgIGkgPSAwO1xuXG4gICAgZm9yICggOyBpIDwgbDsgaSsrICkge1xuICAgICAgZWxlbSA9IGVsZW1zWyBpIF07XG5cbiAgICAgIGlmICggZWxlbSB8fCBlbGVtID09PSAwICkge1xuXG4gICAgICAgIC8vIEFkZCBub2RlcyBkaXJlY3RseVxuICAgICAgICBpZiAoIGpRdWVyeS50eXBlKCBlbGVtICkgPT09IFwib2JqZWN0XCIgKSB7XG4gICAgICAgICAgalF1ZXJ5Lm1lcmdlKCBub2RlcywgZWxlbS5ub2RlVHlwZSA/IFsgZWxlbSBdIDogZWxlbSApO1xuXG4gICAgICAgIC8vIENvbnZlcnQgbm9uLWh0bWwgaW50byBhIHRleHQgbm9kZVxuICAgICAgICB9IGVsc2UgaWYgKCAhcmh0bWwudGVzdCggZWxlbSApICkge1xuICAgICAgICAgIG5vZGVzLnB1c2goIGNvbnRleHQuY3JlYXRlVGV4dE5vZGUoIGVsZW0gKSApO1xuXG4gICAgICAgIC8vIENvbnZlcnQgaHRtbCBpbnRvIERPTSBub2Rlc1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRtcCA9IHRtcCB8fCBzYWZlLmFwcGVuZENoaWxkKCBjb250ZXh0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIikgKTtcblxuICAgICAgICAgIC8vIERlc2VyaWFsaXplIGEgc3RhbmRhcmQgcmVwcmVzZW50YXRpb25cbiAgICAgICAgICB0YWcgPSAoIHJ0YWdOYW1lLmV4ZWMoIGVsZW0gKSB8fCBbXCJcIiwgXCJcIl0gKVsxXS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIHdyYXAgPSB3cmFwTWFwWyB0YWcgXSB8fCB3cmFwTWFwLl9kZWZhdWx0O1xuXG4gICAgICAgICAgdG1wLmlubmVySFRNTCA9IHdyYXBbMV0gKyBlbGVtLnJlcGxhY2UoIHJ4aHRtbFRhZywgXCI8JDE+PC8kMj5cIiApICsgd3JhcFsyXTtcblxuICAgICAgICAgIC8vIERlc2NlbmQgdGhyb3VnaCB3cmFwcGVycyB0byB0aGUgcmlnaHQgY29udGVudFxuICAgICAgICAgIGogPSB3cmFwWzBdO1xuICAgICAgICAgIHdoaWxlICggai0tICkge1xuICAgICAgICAgICAgdG1wID0gdG1wLmxhc3RDaGlsZDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBNYW51YWxseSBhZGQgbGVhZGluZyB3aGl0ZXNwYWNlIHJlbW92ZWQgYnkgSUVcbiAgICAgICAgICBpZiAoICFqUXVlcnkuc3VwcG9ydC5sZWFkaW5nV2hpdGVzcGFjZSAmJiBybGVhZGluZ1doaXRlc3BhY2UudGVzdCggZWxlbSApICkge1xuICAgICAgICAgICAgbm9kZXMucHVzaCggY29udGV4dC5jcmVhdGVUZXh0Tm9kZSggcmxlYWRpbmdXaGl0ZXNwYWNlLmV4ZWMoIGVsZW0gKVswXSApICk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gUmVtb3ZlIElFJ3MgYXV0b2luc2VydGVkIDx0Ym9keT4gZnJvbSB0YWJsZSBmcmFnbWVudHNcbiAgICAgICAgICBpZiAoICFqUXVlcnkuc3VwcG9ydC50Ym9keSApIHtcblxuICAgICAgICAgICAgLy8gU3RyaW5nIHdhcyBhIDx0YWJsZT4sICptYXkqIGhhdmUgc3B1cmlvdXMgPHRib2R5PlxuICAgICAgICAgICAgZWxlbSA9IHRhZyA9PT0gXCJ0YWJsZVwiICYmICFydGJvZHkudGVzdCggZWxlbSApID9cbiAgICAgICAgICAgICAgdG1wLmZpcnN0Q2hpbGQgOlxuXG4gICAgICAgICAgICAgIC8vIFN0cmluZyB3YXMgYSBiYXJlIDx0aGVhZD4gb3IgPHRmb290PlxuICAgICAgICAgICAgICB3cmFwWzFdID09PSBcIjx0YWJsZT5cIiAmJiAhcnRib2R5LnRlc3QoIGVsZW0gKSA/XG4gICAgICAgICAgICAgICAgdG1wIDpcbiAgICAgICAgICAgICAgICAwO1xuXG4gICAgICAgICAgICBqID0gZWxlbSAmJiBlbGVtLmNoaWxkTm9kZXMubGVuZ3RoO1xuICAgICAgICAgICAgd2hpbGUgKCBqLS0gKSB7XG4gICAgICAgICAgICAgIGlmICggalF1ZXJ5Lm5vZGVOYW1lKCAodGJvZHkgPSBlbGVtLmNoaWxkTm9kZXNbal0pLCBcInRib2R5XCIgKSAmJiAhdGJvZHkuY2hpbGROb2Rlcy5sZW5ndGggKSB7XG4gICAgICAgICAgICAgICAgZWxlbS5yZW1vdmVDaGlsZCggdGJvZHkgKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGpRdWVyeS5tZXJnZSggbm9kZXMsIHRtcC5jaGlsZE5vZGVzICk7XG5cbiAgICAgICAgICAvLyBGaXggIzEyMzkyIGZvciBXZWJLaXQgYW5kIElFID4gOVxuICAgICAgICAgIHRtcC50ZXh0Q29udGVudCA9IFwiXCI7XG5cbiAgICAgICAgICAvLyBGaXggIzEyMzkyIGZvciBvbGRJRVxuICAgICAgICAgIHdoaWxlICggdG1wLmZpcnN0Q2hpbGQgKSB7XG4gICAgICAgICAgICB0bXAucmVtb3ZlQ2hpbGQoIHRtcC5maXJzdENoaWxkICk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gUmVtZW1iZXIgdGhlIHRvcC1sZXZlbCBjb250YWluZXIgZm9yIHByb3BlciBjbGVhbnVwXG4gICAgICAgICAgdG1wID0gc2FmZS5sYXN0Q2hpbGQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBGaXggIzExMzU2OiBDbGVhciBlbGVtZW50cyBmcm9tIGZyYWdtZW50XG4gICAgaWYgKCB0bXAgKSB7XG4gICAgICBzYWZlLnJlbW92ZUNoaWxkKCB0bXAgKTtcbiAgICB9XG5cbiAgICAvLyBSZXNldCBkZWZhdWx0Q2hlY2tlZCBmb3IgYW55IHJhZGlvcyBhbmQgY2hlY2tib3hlc1xuICAgIC8vIGFib3V0IHRvIGJlIGFwcGVuZGVkIHRvIHRoZSBET00gaW4gSUUgNi83ICgjODA2MClcbiAgICBpZiAoICFqUXVlcnkuc3VwcG9ydC5hcHBlbmRDaGVja2VkICkge1xuICAgICAgalF1ZXJ5LmdyZXAoIGdldEFsbCggbm9kZXMsIFwiaW5wdXRcIiApLCBmaXhEZWZhdWx0Q2hlY2tlZCApO1xuICAgIH1cblxuICAgIGkgPSAwO1xuICAgIHdoaWxlICggKGVsZW0gPSBub2Rlc1sgaSsrIF0pICkge1xuXG4gICAgICAvLyAjNDA4NyAtIElmIG9yaWdpbiBhbmQgZGVzdGluYXRpb24gZWxlbWVudHMgYXJlIHRoZSBzYW1lLCBhbmQgdGhpcyBpc1xuICAgICAgLy8gdGhhdCBlbGVtZW50LCBkbyBub3QgZG8gYW55dGhpbmdcbiAgICAgIGlmICggc2VsZWN0aW9uICYmIGpRdWVyeS5pbkFycmF5KCBlbGVtLCBzZWxlY3Rpb24gKSAhPT0gLTEgKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBjb250YWlucyA9IGpRdWVyeS5jb250YWlucyggZWxlbS5vd25lckRvY3VtZW50LCBlbGVtICk7XG5cbiAgICAgIC8vIEFwcGVuZCB0byBmcmFnbWVudFxuICAgICAgdG1wID0gZ2V0QWxsKCBzYWZlLmFwcGVuZENoaWxkKCBlbGVtICksIFwic2NyaXB0XCIgKTtcblxuICAgICAgLy8gUHJlc2VydmUgc2NyaXB0IGV2YWx1YXRpb24gaGlzdG9yeVxuICAgICAgaWYgKCBjb250YWlucyApIHtcbiAgICAgICAgc2V0R2xvYmFsRXZhbCggdG1wICk7XG4gICAgICB9XG5cbiAgICAgIC8vIENhcHR1cmUgZXhlY3V0YWJsZXNcbiAgICAgIGlmICggc2NyaXB0cyApIHtcbiAgICAgICAgaiA9IDA7XG4gICAgICAgIHdoaWxlICggKGVsZW0gPSB0bXBbIGorKyBdKSApIHtcbiAgICAgICAgICBpZiAoIHJzY3JpcHRUeXBlLnRlc3QoIGVsZW0udHlwZSB8fCBcIlwiICkgKSB7XG4gICAgICAgICAgICBzY3JpcHRzLnB1c2goIGVsZW0gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0bXAgPSBudWxsO1xuXG4gICAgcmV0dXJuIHNhZmU7XG4gIH0sXG5cbiAgY2xlYW5EYXRhOiBmdW5jdGlvbiggZWxlbXMsIC8qIGludGVybmFsICovIGFjY2VwdERhdGEgKSB7XG4gICAgdmFyIGVsZW0sIHR5cGUsIGlkLCBkYXRhLFxuICAgICAgaSA9IDAsXG4gICAgICBpbnRlcm5hbEtleSA9IGpRdWVyeS5leHBhbmRvLFxuICAgICAgY2FjaGUgPSBqUXVlcnkuY2FjaGUsXG4gICAgICBkZWxldGVFeHBhbmRvID0galF1ZXJ5LnN1cHBvcnQuZGVsZXRlRXhwYW5kbyxcbiAgICAgIHNwZWNpYWwgPSBqUXVlcnkuZXZlbnQuc3BlY2lhbDtcblxuICAgIGZvciAoIDsgKGVsZW0gPSBlbGVtc1tpXSkgIT0gbnVsbDsgaSsrICkge1xuXG4gICAgICBpZiAoIGFjY2VwdERhdGEgfHwgalF1ZXJ5LmFjY2VwdERhdGEoIGVsZW0gKSApIHtcblxuICAgICAgICBpZCA9IGVsZW1bIGludGVybmFsS2V5IF07XG4gICAgICAgIGRhdGEgPSBpZCAmJiBjYWNoZVsgaWQgXTtcblxuICAgICAgICBpZiAoIGRhdGEgKSB7XG4gICAgICAgICAgaWYgKCBkYXRhLmV2ZW50cyApIHtcbiAgICAgICAgICAgIGZvciAoIHR5cGUgaW4gZGF0YS5ldmVudHMgKSB7XG4gICAgICAgICAgICAgIGlmICggc3BlY2lhbFsgdHlwZSBdICkge1xuICAgICAgICAgICAgICAgIGpRdWVyeS5ldmVudC5yZW1vdmUoIGVsZW0sIHR5cGUgKTtcblxuICAgICAgICAgICAgICAvLyBUaGlzIGlzIGEgc2hvcnRjdXQgdG8gYXZvaWQgalF1ZXJ5LmV2ZW50LnJlbW92ZSdzIG92ZXJoZWFkXG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgalF1ZXJ5LnJlbW92ZUV2ZW50KCBlbGVtLCB0eXBlLCBkYXRhLmhhbmRsZSApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gUmVtb3ZlIGNhY2hlIG9ubHkgaWYgaXQgd2FzIG5vdCBhbHJlYWR5IHJlbW92ZWQgYnkgalF1ZXJ5LmV2ZW50LnJlbW92ZVxuICAgICAgICAgIGlmICggY2FjaGVbIGlkIF0gKSB7XG5cbiAgICAgICAgICAgIGRlbGV0ZSBjYWNoZVsgaWQgXTtcblxuICAgICAgICAgICAgLy8gSUUgZG9lcyBub3QgYWxsb3cgdXMgdG8gZGVsZXRlIGV4cGFuZG8gcHJvcGVydGllcyBmcm9tIG5vZGVzLFxuICAgICAgICAgICAgLy8gbm9yIGRvZXMgaXQgaGF2ZSBhIHJlbW92ZUF0dHJpYnV0ZSBmdW5jdGlvbiBvbiBEb2N1bWVudCBub2RlcztcbiAgICAgICAgICAgIC8vIHdlIG11c3QgaGFuZGxlIGFsbCBvZiB0aGVzZSBjYXNlc1xuICAgICAgICAgICAgaWYgKCBkZWxldGVFeHBhbmRvICkge1xuICAgICAgICAgICAgICBkZWxldGUgZWxlbVsgaW50ZXJuYWxLZXkgXTtcblxuICAgICAgICAgICAgfSBlbHNlIGlmICggdHlwZW9mIGVsZW0ucmVtb3ZlQXR0cmlidXRlICE9PSBjb3JlX3N0cnVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgICAgZWxlbS5yZW1vdmVBdHRyaWJ1dGUoIGludGVybmFsS2V5ICk7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGVsZW1bIGludGVybmFsS2V5IF0gPSBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb3JlX2RlbGV0ZWRJZHMucHVzaCggaWQgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgX2V2YWxVcmw6IGZ1bmN0aW9uKCB1cmwgKSB7XG4gICAgcmV0dXJuIGpRdWVyeS5hamF4KHtcbiAgICAgIHVybDogdXJsLFxuICAgICAgdHlwZTogXCJHRVRcIixcbiAgICAgIGRhdGFUeXBlOiBcInNjcmlwdFwiLFxuICAgICAgYXN5bmM6IGZhbHNlLFxuICAgICAgZ2xvYmFsOiBmYWxzZSxcbiAgICAgIFwidGhyb3dzXCI6IHRydWVcbiAgICB9KTtcbiAgfVxufSk7XG5qUXVlcnkuZm4uZXh0ZW5kKHtcbiAgd3JhcEFsbDogZnVuY3Rpb24oIGh0bWwgKSB7XG4gICAgaWYgKCBqUXVlcnkuaXNGdW5jdGlvbiggaHRtbCApICkge1xuICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbihpKSB7XG4gICAgICAgIGpRdWVyeSh0aGlzKS53cmFwQWxsKCBodG1sLmNhbGwodGhpcywgaSkgKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICggdGhpc1swXSApIHtcbiAgICAgIC8vIFRoZSBlbGVtZW50cyB0byB3cmFwIHRoZSB0YXJnZXQgYXJvdW5kXG4gICAgICB2YXIgd3JhcCA9IGpRdWVyeSggaHRtbCwgdGhpc1swXS5vd25lckRvY3VtZW50ICkuZXEoMCkuY2xvbmUodHJ1ZSk7XG5cbiAgICAgIGlmICggdGhpc1swXS5wYXJlbnROb2RlICkge1xuICAgICAgICB3cmFwLmluc2VydEJlZm9yZSggdGhpc1swXSApO1xuICAgICAgfVxuXG4gICAgICB3cmFwLm1hcChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGVsZW0gPSB0aGlzO1xuXG4gICAgICAgIHdoaWxlICggZWxlbS5maXJzdENoaWxkICYmIGVsZW0uZmlyc3RDaGlsZC5ub2RlVHlwZSA9PT0gMSApIHtcbiAgICAgICAgICBlbGVtID0gZWxlbS5maXJzdENoaWxkO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGVsZW07XG4gICAgICB9KS5hcHBlbmQoIHRoaXMgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICB3cmFwSW5uZXI6IGZ1bmN0aW9uKCBodG1sICkge1xuICAgIGlmICggalF1ZXJ5LmlzRnVuY3Rpb24oIGh0bWwgKSApIHtcbiAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oaSkge1xuICAgICAgICBqUXVlcnkodGhpcykud3JhcElubmVyKCBodG1sLmNhbGwodGhpcywgaSkgKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IGpRdWVyeSggdGhpcyApLFxuICAgICAgICBjb250ZW50cyA9IHNlbGYuY29udGVudHMoKTtcblxuICAgICAgaWYgKCBjb250ZW50cy5sZW5ndGggKSB7XG4gICAgICAgIGNvbnRlbnRzLndyYXBBbGwoIGh0bWwgKTtcblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VsZi5hcHBlbmQoIGh0bWwgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcblxuICB3cmFwOiBmdW5jdGlvbiggaHRtbCApIHtcbiAgICB2YXIgaXNGdW5jdGlvbiA9IGpRdWVyeS5pc0Z1bmN0aW9uKCBodG1sICk7XG5cbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKGkpIHtcbiAgICAgIGpRdWVyeSggdGhpcyApLndyYXBBbGwoIGlzRnVuY3Rpb24gPyBodG1sLmNhbGwodGhpcywgaSkgOiBodG1sICk7XG4gICAgfSk7XG4gIH0sXG5cbiAgdW53cmFwOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5wYXJlbnQoKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCAhalF1ZXJ5Lm5vZGVOYW1lKCB0aGlzLCBcImJvZHlcIiApICkge1xuICAgICAgICBqUXVlcnkoIHRoaXMgKS5yZXBsYWNlV2l0aCggdGhpcy5jaGlsZE5vZGVzICk7XG4gICAgICB9XG4gICAgfSkuZW5kKCk7XG4gIH1cbn0pO1xudmFyIGlmcmFtZSwgZ2V0U3R5bGVzLCBjdXJDU1MsXG4gIHJhbHBoYSA9IC9hbHBoYVxcKFteKV0qXFwpL2ksXG4gIHJvcGFjaXR5ID0gL29wYWNpdHlcXHMqPVxccyooW14pXSopLyxcbiAgcnBvc2l0aW9uID0gL14odG9wfHJpZ2h0fGJvdHRvbXxsZWZ0KSQvLFxuICAvLyBzd2FwcGFibGUgaWYgZGlzcGxheSBpcyBub25lIG9yIHN0YXJ0cyB3aXRoIHRhYmxlIGV4Y2VwdCBcInRhYmxlXCIsIFwidGFibGUtY2VsbFwiLCBvciBcInRhYmxlLWNhcHRpb25cIlxuICAvLyBzZWUgaGVyZSBmb3IgZGlzcGxheSB2YWx1ZXM6IGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvQ1NTL2Rpc3BsYXlcbiAgcmRpc3BsYXlzd2FwID0gL14obm9uZXx0YWJsZSg/IS1jW2VhXSkuKykvLFxuICBybWFyZ2luID0gL15tYXJnaW4vLFxuICBybnVtc3BsaXQgPSBuZXcgUmVnRXhwKCBcIl4oXCIgKyBjb3JlX3BudW0gKyBcIikoLiopJFwiLCBcImlcIiApLFxuICBybnVtbm9ucHggPSBuZXcgUmVnRXhwKCBcIl4oXCIgKyBjb3JlX3BudW0gKyBcIikoPyFweClbYS16JV0rJFwiLCBcImlcIiApLFxuICBycmVsTnVtID0gbmV3IFJlZ0V4cCggXCJeKFsrLV0pPShcIiArIGNvcmVfcG51bSArIFwiKVwiLCBcImlcIiApLFxuICBlbGVtZGlzcGxheSA9IHsgQk9EWTogXCJibG9ja1wiIH0sXG5cbiAgY3NzU2hvdyA9IHsgcG9zaXRpb246IFwiYWJzb2x1dGVcIiwgdmlzaWJpbGl0eTogXCJoaWRkZW5cIiwgZGlzcGxheTogXCJibG9ja1wiIH0sXG4gIGNzc05vcm1hbFRyYW5zZm9ybSA9IHtcbiAgICBsZXR0ZXJTcGFjaW5nOiAwLFxuICAgIGZvbnRXZWlnaHQ6IDQwMFxuICB9LFxuXG4gIGNzc0V4cGFuZCA9IFsgXCJUb3BcIiwgXCJSaWdodFwiLCBcIkJvdHRvbVwiLCBcIkxlZnRcIiBdLFxuICBjc3NQcmVmaXhlcyA9IFsgXCJXZWJraXRcIiwgXCJPXCIsIFwiTW96XCIsIFwibXNcIiBdO1xuXG4vLyByZXR1cm4gYSBjc3MgcHJvcGVydHkgbWFwcGVkIHRvIGEgcG90ZW50aWFsbHkgdmVuZG9yIHByZWZpeGVkIHByb3BlcnR5XG5mdW5jdGlvbiB2ZW5kb3JQcm9wTmFtZSggc3R5bGUsIG5hbWUgKSB7XG5cbiAgLy8gc2hvcnRjdXQgZm9yIG5hbWVzIHRoYXQgYXJlIG5vdCB2ZW5kb3IgcHJlZml4ZWRcbiAgaWYgKCBuYW1lIGluIHN0eWxlICkge1xuICAgIHJldHVybiBuYW1lO1xuICB9XG5cbiAgLy8gY2hlY2sgZm9yIHZlbmRvciBwcmVmaXhlZCBuYW1lc1xuICB2YXIgY2FwTmFtZSA9IG5hbWUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBuYW1lLnNsaWNlKDEpLFxuICAgIG9yaWdOYW1lID0gbmFtZSxcbiAgICBpID0gY3NzUHJlZml4ZXMubGVuZ3RoO1xuXG4gIHdoaWxlICggaS0tICkge1xuICAgIG5hbWUgPSBjc3NQcmVmaXhlc1sgaSBdICsgY2FwTmFtZTtcbiAgICBpZiAoIG5hbWUgaW4gc3R5bGUgKSB7XG4gICAgICByZXR1cm4gbmFtZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gb3JpZ05hbWU7XG59XG5cbmZ1bmN0aW9uIGlzSGlkZGVuKCBlbGVtLCBlbCApIHtcbiAgLy8gaXNIaWRkZW4gbWlnaHQgYmUgY2FsbGVkIGZyb20galF1ZXJ5I2ZpbHRlciBmdW5jdGlvbjtcbiAgLy8gaW4gdGhhdCBjYXNlLCBlbGVtZW50IHdpbGwgYmUgc2Vjb25kIGFyZ3VtZW50XG4gIGVsZW0gPSBlbCB8fCBlbGVtO1xuICByZXR1cm4galF1ZXJ5LmNzcyggZWxlbSwgXCJkaXNwbGF5XCIgKSA9PT0gXCJub25lXCIgfHwgIWpRdWVyeS5jb250YWlucyggZWxlbS5vd25lckRvY3VtZW50LCBlbGVtICk7XG59XG5cbmZ1bmN0aW9uIHNob3dIaWRlKCBlbGVtZW50cywgc2hvdyApIHtcbiAgdmFyIGRpc3BsYXksIGVsZW0sIGhpZGRlbixcbiAgICB2YWx1ZXMgPSBbXSxcbiAgICBpbmRleCA9IDAsXG4gICAgbGVuZ3RoID0gZWxlbWVudHMubGVuZ3RoO1xuXG4gIGZvciAoIDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KysgKSB7XG4gICAgZWxlbSA9IGVsZW1lbnRzWyBpbmRleCBdO1xuICAgIGlmICggIWVsZW0uc3R5bGUgKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICB2YWx1ZXNbIGluZGV4IF0gPSBqUXVlcnkuX2RhdGEoIGVsZW0sIFwib2xkZGlzcGxheVwiICk7XG4gICAgZGlzcGxheSA9IGVsZW0uc3R5bGUuZGlzcGxheTtcbiAgICBpZiAoIHNob3cgKSB7XG4gICAgICAvLyBSZXNldCB0aGUgaW5saW5lIGRpc3BsYXkgb2YgdGhpcyBlbGVtZW50IHRvIGxlYXJuIGlmIGl0IGlzXG4gICAgICAvLyBiZWluZyBoaWRkZW4gYnkgY2FzY2FkZWQgcnVsZXMgb3Igbm90XG4gICAgICBpZiAoICF2YWx1ZXNbIGluZGV4IF0gJiYgZGlzcGxheSA9PT0gXCJub25lXCIgKSB7XG4gICAgICAgIGVsZW0uc3R5bGUuZGlzcGxheSA9IFwiXCI7XG4gICAgICB9XG5cbiAgICAgIC8vIFNldCBlbGVtZW50cyB3aGljaCBoYXZlIGJlZW4gb3ZlcnJpZGRlbiB3aXRoIGRpc3BsYXk6IG5vbmVcbiAgICAgIC8vIGluIGEgc3R5bGVzaGVldCB0byB3aGF0ZXZlciB0aGUgZGVmYXVsdCBicm93c2VyIHN0eWxlIGlzXG4gICAgICAvLyBmb3Igc3VjaCBhbiBlbGVtZW50XG4gICAgICBpZiAoIGVsZW0uc3R5bGUuZGlzcGxheSA9PT0gXCJcIiAmJiBpc0hpZGRlbiggZWxlbSApICkge1xuICAgICAgICB2YWx1ZXNbIGluZGV4IF0gPSBqUXVlcnkuX2RhdGEoIGVsZW0sIFwib2xkZGlzcGxheVwiLCBjc3NfZGVmYXVsdERpc3BsYXkoZWxlbS5ub2RlTmFtZSkgKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuXG4gICAgICBpZiAoICF2YWx1ZXNbIGluZGV4IF0gKSB7XG4gICAgICAgIGhpZGRlbiA9IGlzSGlkZGVuKCBlbGVtICk7XG5cbiAgICAgICAgaWYgKCBkaXNwbGF5ICYmIGRpc3BsYXkgIT09IFwibm9uZVwiIHx8ICFoaWRkZW4gKSB7XG4gICAgICAgICAgalF1ZXJ5Ll9kYXRhKCBlbGVtLCBcIm9sZGRpc3BsYXlcIiwgaGlkZGVuID8gZGlzcGxheSA6IGpRdWVyeS5jc3MoIGVsZW0sIFwiZGlzcGxheVwiICkgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFNldCB0aGUgZGlzcGxheSBvZiBtb3N0IG9mIHRoZSBlbGVtZW50cyBpbiBhIHNlY29uZCBsb29wXG4gIC8vIHRvIGF2b2lkIHRoZSBjb25zdGFudCByZWZsb3dcbiAgZm9yICggaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKyApIHtcbiAgICBlbGVtID0gZWxlbWVudHNbIGluZGV4IF07XG4gICAgaWYgKCAhZWxlbS5zdHlsZSApIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBpZiAoICFzaG93IHx8IGVsZW0uc3R5bGUuZGlzcGxheSA9PT0gXCJub25lXCIgfHwgZWxlbS5zdHlsZS5kaXNwbGF5ID09PSBcIlwiICkge1xuICAgICAgZWxlbS5zdHlsZS5kaXNwbGF5ID0gc2hvdyA/IHZhbHVlc1sgaW5kZXggXSB8fCBcIlwiIDogXCJub25lXCI7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGVsZW1lbnRzO1xufVxuXG5qUXVlcnkuZm4uZXh0ZW5kKHtcbiAgY3NzOiBmdW5jdGlvbiggbmFtZSwgdmFsdWUgKSB7XG4gICAgcmV0dXJuIGpRdWVyeS5hY2Nlc3MoIHRoaXMsIGZ1bmN0aW9uKCBlbGVtLCBuYW1lLCB2YWx1ZSApIHtcbiAgICAgIHZhciBsZW4sIHN0eWxlcyxcbiAgICAgICAgbWFwID0ge30sXG4gICAgICAgIGkgPSAwO1xuXG4gICAgICBpZiAoIGpRdWVyeS5pc0FycmF5KCBuYW1lICkgKSB7XG4gICAgICAgIHN0eWxlcyA9IGdldFN0eWxlcyggZWxlbSApO1xuICAgICAgICBsZW4gPSBuYW1lLmxlbmd0aDtcblxuICAgICAgICBmb3IgKCA7IGkgPCBsZW47IGkrKyApIHtcbiAgICAgICAgICBtYXBbIG5hbWVbIGkgXSBdID0galF1ZXJ5LmNzcyggZWxlbSwgbmFtZVsgaSBdLCBmYWxzZSwgc3R5bGVzICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbWFwO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdmFsdWUgIT09IHVuZGVmaW5lZCA/XG4gICAgICAgIGpRdWVyeS5zdHlsZSggZWxlbSwgbmFtZSwgdmFsdWUgKSA6XG4gICAgICAgIGpRdWVyeS5jc3MoIGVsZW0sIG5hbWUgKTtcbiAgICB9LCBuYW1lLCB2YWx1ZSwgYXJndW1lbnRzLmxlbmd0aCA+IDEgKTtcbiAgfSxcbiAgc2hvdzogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHNob3dIaWRlKCB0aGlzLCB0cnVlICk7XG4gIH0sXG4gIGhpZGU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBzaG93SGlkZSggdGhpcyApO1xuICB9LFxuICB0b2dnbGU6IGZ1bmN0aW9uKCBzdGF0ZSApIHtcbiAgICBpZiAoIHR5cGVvZiBzdGF0ZSA9PT0gXCJib29sZWFuXCIgKSB7XG4gICAgICByZXR1cm4gc3RhdGUgPyB0aGlzLnNob3coKSA6IHRoaXMuaGlkZSgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoIGlzSGlkZGVuKCB0aGlzICkgKSB7XG4gICAgICAgIGpRdWVyeSggdGhpcyApLnNob3coKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGpRdWVyeSggdGhpcyApLmhpZGUoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufSk7XG5cbmpRdWVyeS5leHRlbmQoe1xuICAvLyBBZGQgaW4gc3R5bGUgcHJvcGVydHkgaG9va3MgZm9yIG92ZXJyaWRpbmcgdGhlIGRlZmF1bHRcbiAgLy8gYmVoYXZpb3Igb2YgZ2V0dGluZyBhbmQgc2V0dGluZyBhIHN0eWxlIHByb3BlcnR5XG4gIGNzc0hvb2tzOiB7XG4gICAgb3BhY2l0eToge1xuICAgICAgZ2V0OiBmdW5jdGlvbiggZWxlbSwgY29tcHV0ZWQgKSB7XG4gICAgICAgIGlmICggY29tcHV0ZWQgKSB7XG4gICAgICAgICAgLy8gV2Ugc2hvdWxkIGFsd2F5cyBnZXQgYSBudW1iZXIgYmFjayBmcm9tIG9wYWNpdHlcbiAgICAgICAgICB2YXIgcmV0ID0gY3VyQ1NTKCBlbGVtLCBcIm9wYWNpdHlcIiApO1xuICAgICAgICAgIHJldHVybiByZXQgPT09IFwiXCIgPyBcIjFcIiA6IHJldDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBEb24ndCBhdXRvbWF0aWNhbGx5IGFkZCBcInB4XCIgdG8gdGhlc2UgcG9zc2libHktdW5pdGxlc3MgcHJvcGVydGllc1xuICBjc3NOdW1iZXI6IHtcbiAgICBcImNvbHVtbkNvdW50XCI6IHRydWUsXG4gICAgXCJmaWxsT3BhY2l0eVwiOiB0cnVlLFxuICAgIFwiZm9udFdlaWdodFwiOiB0cnVlLFxuICAgIFwibGluZUhlaWdodFwiOiB0cnVlLFxuICAgIFwib3BhY2l0eVwiOiB0cnVlLFxuICAgIFwib3JkZXJcIjogdHJ1ZSxcbiAgICBcIm9ycGhhbnNcIjogdHJ1ZSxcbiAgICBcIndpZG93c1wiOiB0cnVlLFxuICAgIFwiekluZGV4XCI6IHRydWUsXG4gICAgXCJ6b29tXCI6IHRydWVcbiAgfSxcblxuICAvLyBBZGQgaW4gcHJvcGVydGllcyB3aG9zZSBuYW1lcyB5b3Ugd2lzaCB0byBmaXggYmVmb3JlXG4gIC8vIHNldHRpbmcgb3IgZ2V0dGluZyB0aGUgdmFsdWVcbiAgY3NzUHJvcHM6IHtcbiAgICAvLyBub3JtYWxpemUgZmxvYXQgY3NzIHByb3BlcnR5XG4gICAgXCJmbG9hdFwiOiBqUXVlcnkuc3VwcG9ydC5jc3NGbG9hdCA/IFwiY3NzRmxvYXRcIiA6IFwic3R5bGVGbG9hdFwiXG4gIH0sXG5cbiAgLy8gR2V0IGFuZCBzZXQgdGhlIHN0eWxlIHByb3BlcnR5IG9uIGEgRE9NIE5vZGVcbiAgc3R5bGU6IGZ1bmN0aW9uKCBlbGVtLCBuYW1lLCB2YWx1ZSwgZXh0cmEgKSB7XG4gICAgLy8gRG9uJ3Qgc2V0IHN0eWxlcyBvbiB0ZXh0IGFuZCBjb21tZW50IG5vZGVzXG4gICAgaWYgKCAhZWxlbSB8fCBlbGVtLm5vZGVUeXBlID09PSAzIHx8IGVsZW0ubm9kZVR5cGUgPT09IDggfHwgIWVsZW0uc3R5bGUgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gTWFrZSBzdXJlIHRoYXQgd2UncmUgd29ya2luZyB3aXRoIHRoZSByaWdodCBuYW1lXG4gICAgdmFyIHJldCwgdHlwZSwgaG9va3MsXG4gICAgICBvcmlnTmFtZSA9IGpRdWVyeS5jYW1lbENhc2UoIG5hbWUgKSxcbiAgICAgIHN0eWxlID0gZWxlbS5zdHlsZTtcblxuICAgIG5hbWUgPSBqUXVlcnkuY3NzUHJvcHNbIG9yaWdOYW1lIF0gfHwgKCBqUXVlcnkuY3NzUHJvcHNbIG9yaWdOYW1lIF0gPSB2ZW5kb3JQcm9wTmFtZSggc3R5bGUsIG9yaWdOYW1lICkgKTtcblxuICAgIC8vIGdldHMgaG9vayBmb3IgdGhlIHByZWZpeGVkIHZlcnNpb25cbiAgICAvLyBmb2xsb3dlZCBieSB0aGUgdW5wcmVmaXhlZCB2ZXJzaW9uXG4gICAgaG9va3MgPSBqUXVlcnkuY3NzSG9va3NbIG5hbWUgXSB8fCBqUXVlcnkuY3NzSG9va3NbIG9yaWdOYW1lIF07XG5cbiAgICAvLyBDaGVjayBpZiB3ZSdyZSBzZXR0aW5nIGEgdmFsdWVcbiAgICBpZiAoIHZhbHVlICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICB0eXBlID0gdHlwZW9mIHZhbHVlO1xuXG4gICAgICAvLyBjb252ZXJ0IHJlbGF0aXZlIG51bWJlciBzdHJpbmdzICgrPSBvciAtPSkgdG8gcmVsYXRpdmUgbnVtYmVycy4gIzczNDVcbiAgICAgIGlmICggdHlwZSA9PT0gXCJzdHJpbmdcIiAmJiAocmV0ID0gcnJlbE51bS5leGVjKCB2YWx1ZSApKSApIHtcbiAgICAgICAgdmFsdWUgPSAoIHJldFsxXSArIDEgKSAqIHJldFsyXSArIHBhcnNlRmxvYXQoIGpRdWVyeS5jc3MoIGVsZW0sIG5hbWUgKSApO1xuICAgICAgICAvLyBGaXhlcyBidWcgIzkyMzdcbiAgICAgICAgdHlwZSA9IFwibnVtYmVyXCI7XG4gICAgICB9XG5cbiAgICAgIC8vIE1ha2Ugc3VyZSB0aGF0IE5hTiBhbmQgbnVsbCB2YWx1ZXMgYXJlbid0IHNldC4gU2VlOiAjNzExNlxuICAgICAgaWYgKCB2YWx1ZSA9PSBudWxsIHx8IHR5cGUgPT09IFwibnVtYmVyXCIgJiYgaXNOYU4oIHZhbHVlICkgKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgYSBudW1iZXIgd2FzIHBhc3NlZCBpbiwgYWRkICdweCcgdG8gdGhlIChleGNlcHQgZm9yIGNlcnRhaW4gQ1NTIHByb3BlcnRpZXMpXG4gICAgICBpZiAoIHR5cGUgPT09IFwibnVtYmVyXCIgJiYgIWpRdWVyeS5jc3NOdW1iZXJbIG9yaWdOYW1lIF0gKSB7XG4gICAgICAgIHZhbHVlICs9IFwicHhcIjtcbiAgICAgIH1cblxuICAgICAgLy8gRml4ZXMgIzg5MDgsIGl0IGNhbiBiZSBkb25lIG1vcmUgY29ycmVjdGx5IGJ5IHNwZWNpZmluZyBzZXR0ZXJzIGluIGNzc0hvb2tzLFxuICAgICAgLy8gYnV0IGl0IHdvdWxkIG1lYW4gdG8gZGVmaW5lIGVpZ2h0IChmb3IgZXZlcnkgcHJvYmxlbWF0aWMgcHJvcGVydHkpIGlkZW50aWNhbCBmdW5jdGlvbnNcbiAgICAgIGlmICggIWpRdWVyeS5zdXBwb3J0LmNsZWFyQ2xvbmVTdHlsZSAmJiB2YWx1ZSA9PT0gXCJcIiAmJiBuYW1lLmluZGV4T2YoXCJiYWNrZ3JvdW5kXCIpID09PSAwICkge1xuICAgICAgICBzdHlsZVsgbmFtZSBdID0gXCJpbmhlcml0XCI7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIGEgaG9vayB3YXMgcHJvdmlkZWQsIHVzZSB0aGF0IHZhbHVlLCBvdGhlcndpc2UganVzdCBzZXQgdGhlIHNwZWNpZmllZCB2YWx1ZVxuICAgICAgaWYgKCAhaG9va3MgfHwgIShcInNldFwiIGluIGhvb2tzKSB8fCAodmFsdWUgPSBob29rcy5zZXQoIGVsZW0sIHZhbHVlLCBleHRyYSApKSAhPT0gdW5kZWZpbmVkICkge1xuXG4gICAgICAgIC8vIFdyYXBwZWQgdG8gcHJldmVudCBJRSBmcm9tIHRocm93aW5nIGVycm9ycyB3aGVuICdpbnZhbGlkJyB2YWx1ZXMgYXJlIHByb3ZpZGVkXG4gICAgICAgIC8vIEZpeGVzIGJ1ZyAjNTUwOVxuICAgICAgICB0cnkge1xuICAgICAgICAgIHN0eWxlWyBuYW1lIF0gPSB2YWx1ZTtcbiAgICAgICAgfSBjYXRjaChlKSB7fVxuICAgICAgfVxuXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIElmIGEgaG9vayB3YXMgcHJvdmlkZWQgZ2V0IHRoZSBub24tY29tcHV0ZWQgdmFsdWUgZnJvbSB0aGVyZVxuICAgICAgaWYgKCBob29rcyAmJiBcImdldFwiIGluIGhvb2tzICYmIChyZXQgPSBob29rcy5nZXQoIGVsZW0sIGZhbHNlLCBleHRyYSApKSAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgfVxuXG4gICAgICAvLyBPdGhlcndpc2UganVzdCBnZXQgdGhlIHZhbHVlIGZyb20gdGhlIHN0eWxlIG9iamVjdFxuICAgICAgcmV0dXJuIHN0eWxlWyBuYW1lIF07XG4gICAgfVxuICB9LFxuXG4gIGNzczogZnVuY3Rpb24oIGVsZW0sIG5hbWUsIGV4dHJhLCBzdHlsZXMgKSB7XG4gICAgdmFyIG51bSwgdmFsLCBob29rcyxcbiAgICAgIG9yaWdOYW1lID0galF1ZXJ5LmNhbWVsQ2FzZSggbmFtZSApO1xuXG4gICAgLy8gTWFrZSBzdXJlIHRoYXQgd2UncmUgd29ya2luZyB3aXRoIHRoZSByaWdodCBuYW1lXG4gICAgbmFtZSA9IGpRdWVyeS5jc3NQcm9wc1sgb3JpZ05hbWUgXSB8fCAoIGpRdWVyeS5jc3NQcm9wc1sgb3JpZ05hbWUgXSA9IHZlbmRvclByb3BOYW1lKCBlbGVtLnN0eWxlLCBvcmlnTmFtZSApICk7XG5cbiAgICAvLyBnZXRzIGhvb2sgZm9yIHRoZSBwcmVmaXhlZCB2ZXJzaW9uXG4gICAgLy8gZm9sbG93ZWQgYnkgdGhlIHVucHJlZml4ZWQgdmVyc2lvblxuICAgIGhvb2tzID0galF1ZXJ5LmNzc0hvb2tzWyBuYW1lIF0gfHwgalF1ZXJ5LmNzc0hvb2tzWyBvcmlnTmFtZSBdO1xuXG4gICAgLy8gSWYgYSBob29rIHdhcyBwcm92aWRlZCBnZXQgdGhlIGNvbXB1dGVkIHZhbHVlIGZyb20gdGhlcmVcbiAgICBpZiAoIGhvb2tzICYmIFwiZ2V0XCIgaW4gaG9va3MgKSB7XG4gICAgICB2YWwgPSBob29rcy5nZXQoIGVsZW0sIHRydWUsIGV4dHJhICk7XG4gICAgfVxuXG4gICAgLy8gT3RoZXJ3aXNlLCBpZiBhIHdheSB0byBnZXQgdGhlIGNvbXB1dGVkIHZhbHVlIGV4aXN0cywgdXNlIHRoYXRcbiAgICBpZiAoIHZhbCA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgdmFsID0gY3VyQ1NTKCBlbGVtLCBuYW1lLCBzdHlsZXMgKTtcbiAgICB9XG5cbiAgICAvL2NvbnZlcnQgXCJub3JtYWxcIiB0byBjb21wdXRlZCB2YWx1ZVxuICAgIGlmICggdmFsID09PSBcIm5vcm1hbFwiICYmIG5hbWUgaW4gY3NzTm9ybWFsVHJhbnNmb3JtICkge1xuICAgICAgdmFsID0gY3NzTm9ybWFsVHJhbnNmb3JtWyBuYW1lIF07XG4gICAgfVxuXG4gICAgLy8gUmV0dXJuLCBjb252ZXJ0aW5nIHRvIG51bWJlciBpZiBmb3JjZWQgb3IgYSBxdWFsaWZpZXIgd2FzIHByb3ZpZGVkIGFuZCB2YWwgbG9va3MgbnVtZXJpY1xuICAgIGlmICggZXh0cmEgPT09IFwiXCIgfHwgZXh0cmEgKSB7XG4gICAgICBudW0gPSBwYXJzZUZsb2F0KCB2YWwgKTtcbiAgICAgIHJldHVybiBleHRyYSA9PT0gdHJ1ZSB8fCBqUXVlcnkuaXNOdW1lcmljKCBudW0gKSA/IG51bSB8fCAwIDogdmFsO1xuICAgIH1cbiAgICByZXR1cm4gdmFsO1xuICB9XG59KTtcblxuLy8gTk9URTogd2UndmUgaW5jbHVkZWQgdGhlIFwid2luZG93XCIgaW4gd2luZG93LmdldENvbXB1dGVkU3R5bGVcbi8vIGJlY2F1c2UganNkb20gb24gbm9kZS5qcyB3aWxsIGJyZWFrIHdpdGhvdXQgaXQuXG5pZiAoIHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlICkge1xuICBnZXRTdHlsZXMgPSBmdW5jdGlvbiggZWxlbSApIHtcbiAgICByZXR1cm4gd2luZG93LmdldENvbXB1dGVkU3R5bGUoIGVsZW0sIG51bGwgKTtcbiAgfTtcblxuICBjdXJDU1MgPSBmdW5jdGlvbiggZWxlbSwgbmFtZSwgX2NvbXB1dGVkICkge1xuICAgIHZhciB3aWR0aCwgbWluV2lkdGgsIG1heFdpZHRoLFxuICAgICAgY29tcHV0ZWQgPSBfY29tcHV0ZWQgfHwgZ2V0U3R5bGVzKCBlbGVtICksXG5cbiAgICAgIC8vIGdldFByb3BlcnR5VmFsdWUgaXMgb25seSBuZWVkZWQgZm9yIC5jc3MoJ2ZpbHRlcicpIGluIElFOSwgc2VlICMxMjUzN1xuICAgICAgcmV0ID0gY29tcHV0ZWQgPyBjb21wdXRlZC5nZXRQcm9wZXJ0eVZhbHVlKCBuYW1lICkgfHwgY29tcHV0ZWRbIG5hbWUgXSA6IHVuZGVmaW5lZCxcbiAgICAgIHN0eWxlID0gZWxlbS5zdHlsZTtcblxuICAgIGlmICggY29tcHV0ZWQgKSB7XG5cbiAgICAgIGlmICggcmV0ID09PSBcIlwiICYmICFqUXVlcnkuY29udGFpbnMoIGVsZW0ub3duZXJEb2N1bWVudCwgZWxlbSApICkge1xuICAgICAgICByZXQgPSBqUXVlcnkuc3R5bGUoIGVsZW0sIG5hbWUgKTtcbiAgICAgIH1cblxuICAgICAgLy8gQSB0cmlidXRlIHRvIHRoZSBcImF3ZXNvbWUgaGFjayBieSBEZWFuIEVkd2FyZHNcIlxuICAgICAgLy8gQ2hyb21lIDwgMTcgYW5kIFNhZmFyaSA1LjAgdXNlcyBcImNvbXB1dGVkIHZhbHVlXCIgaW5zdGVhZCBvZiBcInVzZWQgdmFsdWVcIiBmb3IgbWFyZ2luLXJpZ2h0XG4gICAgICAvLyBTYWZhcmkgNS4xLjcgKGF0IGxlYXN0KSByZXR1cm5zIHBlcmNlbnRhZ2UgZm9yIGEgbGFyZ2VyIHNldCBvZiB2YWx1ZXMsIGJ1dCB3aWR0aCBzZWVtcyB0byBiZSByZWxpYWJseSBwaXhlbHNcbiAgICAgIC8vIHRoaXMgaXMgYWdhaW5zdCB0aGUgQ1NTT00gZHJhZnQgc3BlYzogaHR0cDovL2Rldi53My5vcmcvY3Nzd2cvY3Nzb20vI3Jlc29sdmVkLXZhbHVlc1xuICAgICAgaWYgKCBybnVtbm9ucHgudGVzdCggcmV0ICkgJiYgcm1hcmdpbi50ZXN0KCBuYW1lICkgKSB7XG5cbiAgICAgICAgLy8gUmVtZW1iZXIgdGhlIG9yaWdpbmFsIHZhbHVlc1xuICAgICAgICB3aWR0aCA9IHN0eWxlLndpZHRoO1xuICAgICAgICBtaW5XaWR0aCA9IHN0eWxlLm1pbldpZHRoO1xuICAgICAgICBtYXhXaWR0aCA9IHN0eWxlLm1heFdpZHRoO1xuXG4gICAgICAgIC8vIFB1dCBpbiB0aGUgbmV3IHZhbHVlcyB0byBnZXQgYSBjb21wdXRlZCB2YWx1ZSBvdXRcbiAgICAgICAgc3R5bGUubWluV2lkdGggPSBzdHlsZS5tYXhXaWR0aCA9IHN0eWxlLndpZHRoID0gcmV0O1xuICAgICAgICByZXQgPSBjb21wdXRlZC53aWR0aDtcblxuICAgICAgICAvLyBSZXZlcnQgdGhlIGNoYW5nZWQgdmFsdWVzXG4gICAgICAgIHN0eWxlLndpZHRoID0gd2lkdGg7XG4gICAgICAgIHN0eWxlLm1pbldpZHRoID0gbWluV2lkdGg7XG4gICAgICAgIHN0eWxlLm1heFdpZHRoID0gbWF4V2lkdGg7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldDtcbiAgfTtcbn0gZWxzZSBpZiAoIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jdXJyZW50U3R5bGUgKSB7XG4gIGdldFN0eWxlcyA9IGZ1bmN0aW9uKCBlbGVtICkge1xuICAgIHJldHVybiBlbGVtLmN1cnJlbnRTdHlsZTtcbiAgfTtcblxuICBjdXJDU1MgPSBmdW5jdGlvbiggZWxlbSwgbmFtZSwgX2NvbXB1dGVkICkge1xuICAgIHZhciBsZWZ0LCBycywgcnNMZWZ0LFxuICAgICAgY29tcHV0ZWQgPSBfY29tcHV0ZWQgfHwgZ2V0U3R5bGVzKCBlbGVtICksXG4gICAgICByZXQgPSBjb21wdXRlZCA/IGNvbXB1dGVkWyBuYW1lIF0gOiB1bmRlZmluZWQsXG4gICAgICBzdHlsZSA9IGVsZW0uc3R5bGU7XG5cbiAgICAvLyBBdm9pZCBzZXR0aW5nIHJldCB0byBlbXB0eSBzdHJpbmcgaGVyZVxuICAgIC8vIHNvIHdlIGRvbid0IGRlZmF1bHQgdG8gYXV0b1xuICAgIGlmICggcmV0ID09IG51bGwgJiYgc3R5bGUgJiYgc3R5bGVbIG5hbWUgXSApIHtcbiAgICAgIHJldCA9IHN0eWxlWyBuYW1lIF07XG4gICAgfVxuXG4gICAgLy8gRnJvbSB0aGUgYXdlc29tZSBoYWNrIGJ5IERlYW4gRWR3YXJkc1xuICAgIC8vIGh0dHA6Ly9lcmlrLmVhZS5uZXQvYXJjaGl2ZXMvMjAwNy8wNy8yNy8xOC41NC4xNS8jY29tbWVudC0xMDIyOTFcblxuICAgIC8vIElmIHdlJ3JlIG5vdCBkZWFsaW5nIHdpdGggYSByZWd1bGFyIHBpeGVsIG51bWJlclxuICAgIC8vIGJ1dCBhIG51bWJlciB0aGF0IGhhcyBhIHdlaXJkIGVuZGluZywgd2UgbmVlZCB0byBjb252ZXJ0IGl0IHRvIHBpeGVsc1xuICAgIC8vIGJ1dCBub3QgcG9zaXRpb24gY3NzIGF0dHJpYnV0ZXMsIGFzIHRob3NlIGFyZSBwcm9wb3J0aW9uYWwgdG8gdGhlIHBhcmVudCBlbGVtZW50IGluc3RlYWRcbiAgICAvLyBhbmQgd2UgY2FuJ3QgbWVhc3VyZSB0aGUgcGFyZW50IGluc3RlYWQgYmVjYXVzZSBpdCBtaWdodCB0cmlnZ2VyIGEgXCJzdGFja2luZyBkb2xsc1wiIHByb2JsZW1cbiAgICBpZiAoIHJudW1ub25weC50ZXN0KCByZXQgKSAmJiAhcnBvc2l0aW9uLnRlc3QoIG5hbWUgKSApIHtcblxuICAgICAgLy8gUmVtZW1iZXIgdGhlIG9yaWdpbmFsIHZhbHVlc1xuICAgICAgbGVmdCA9IHN0eWxlLmxlZnQ7XG4gICAgICBycyA9IGVsZW0ucnVudGltZVN0eWxlO1xuICAgICAgcnNMZWZ0ID0gcnMgJiYgcnMubGVmdDtcblxuICAgICAgLy8gUHV0IGluIHRoZSBuZXcgdmFsdWVzIHRvIGdldCBhIGNvbXB1dGVkIHZhbHVlIG91dFxuICAgICAgaWYgKCByc0xlZnQgKSB7XG4gICAgICAgIHJzLmxlZnQgPSBlbGVtLmN1cnJlbnRTdHlsZS5sZWZ0O1xuICAgICAgfVxuICAgICAgc3R5bGUubGVmdCA9IG5hbWUgPT09IFwiZm9udFNpemVcIiA/IFwiMWVtXCIgOiByZXQ7XG4gICAgICByZXQgPSBzdHlsZS5waXhlbExlZnQgKyBcInB4XCI7XG5cbiAgICAgIC8vIFJldmVydCB0aGUgY2hhbmdlZCB2YWx1ZXNcbiAgICAgIHN0eWxlLmxlZnQgPSBsZWZ0O1xuICAgICAgaWYgKCByc0xlZnQgKSB7XG4gICAgICAgIHJzLmxlZnQgPSByc0xlZnQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldCA9PT0gXCJcIiA/IFwiYXV0b1wiIDogcmV0O1xuICB9O1xufVxuXG5mdW5jdGlvbiBzZXRQb3NpdGl2ZU51bWJlciggZWxlbSwgdmFsdWUsIHN1YnRyYWN0ICkge1xuICB2YXIgbWF0Y2hlcyA9IHJudW1zcGxpdC5leGVjKCB2YWx1ZSApO1xuICByZXR1cm4gbWF0Y2hlcyA/XG4gICAgLy8gR3VhcmQgYWdhaW5zdCB1bmRlZmluZWQgXCJzdWJ0cmFjdFwiLCBlLmcuLCB3aGVuIHVzZWQgYXMgaW4gY3NzSG9va3NcbiAgICBNYXRoLm1heCggMCwgbWF0Y2hlc1sgMSBdIC0gKCBzdWJ0cmFjdCB8fCAwICkgKSArICggbWF0Y2hlc1sgMiBdIHx8IFwicHhcIiApIDpcbiAgICB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gYXVnbWVudFdpZHRoT3JIZWlnaHQoIGVsZW0sIG5hbWUsIGV4dHJhLCBpc0JvcmRlckJveCwgc3R5bGVzICkge1xuICB2YXIgaSA9IGV4dHJhID09PSAoIGlzQm9yZGVyQm94ID8gXCJib3JkZXJcIiA6IFwiY29udGVudFwiICkgP1xuICAgIC8vIElmIHdlIGFscmVhZHkgaGF2ZSB0aGUgcmlnaHQgbWVhc3VyZW1lbnQsIGF2b2lkIGF1Z21lbnRhdGlvblxuICAgIDQgOlxuICAgIC8vIE90aGVyd2lzZSBpbml0aWFsaXplIGZvciBob3Jpem9udGFsIG9yIHZlcnRpY2FsIHByb3BlcnRpZXNcbiAgICBuYW1lID09PSBcIndpZHRoXCIgPyAxIDogMCxcblxuICAgIHZhbCA9IDA7XG5cbiAgZm9yICggOyBpIDwgNDsgaSArPSAyICkge1xuICAgIC8vIGJvdGggYm94IG1vZGVscyBleGNsdWRlIG1hcmdpbiwgc28gYWRkIGl0IGlmIHdlIHdhbnQgaXRcbiAgICBpZiAoIGV4dHJhID09PSBcIm1hcmdpblwiICkge1xuICAgICAgdmFsICs9IGpRdWVyeS5jc3MoIGVsZW0sIGV4dHJhICsgY3NzRXhwYW5kWyBpIF0sIHRydWUsIHN0eWxlcyApO1xuICAgIH1cblxuICAgIGlmICggaXNCb3JkZXJCb3ggKSB7XG4gICAgICAvLyBib3JkZXItYm94IGluY2x1ZGVzIHBhZGRpbmcsIHNvIHJlbW92ZSBpdCBpZiB3ZSB3YW50IGNvbnRlbnRcbiAgICAgIGlmICggZXh0cmEgPT09IFwiY29udGVudFwiICkge1xuICAgICAgICB2YWwgLT0galF1ZXJ5LmNzcyggZWxlbSwgXCJwYWRkaW5nXCIgKyBjc3NFeHBhbmRbIGkgXSwgdHJ1ZSwgc3R5bGVzICk7XG4gICAgICB9XG5cbiAgICAgIC8vIGF0IHRoaXMgcG9pbnQsIGV4dHJhIGlzbid0IGJvcmRlciBub3IgbWFyZ2luLCBzbyByZW1vdmUgYm9yZGVyXG4gICAgICBpZiAoIGV4dHJhICE9PSBcIm1hcmdpblwiICkge1xuICAgICAgICB2YWwgLT0galF1ZXJ5LmNzcyggZWxlbSwgXCJib3JkZXJcIiArIGNzc0V4cGFuZFsgaSBdICsgXCJXaWR0aFwiLCB0cnVlLCBzdHlsZXMgKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gYXQgdGhpcyBwb2ludCwgZXh0cmEgaXNuJ3QgY29udGVudCwgc28gYWRkIHBhZGRpbmdcbiAgICAgIHZhbCArPSBqUXVlcnkuY3NzKCBlbGVtLCBcInBhZGRpbmdcIiArIGNzc0V4cGFuZFsgaSBdLCB0cnVlLCBzdHlsZXMgKTtcblxuICAgICAgLy8gYXQgdGhpcyBwb2ludCwgZXh0cmEgaXNuJ3QgY29udGVudCBub3IgcGFkZGluZywgc28gYWRkIGJvcmRlclxuICAgICAgaWYgKCBleHRyYSAhPT0gXCJwYWRkaW5nXCIgKSB7XG4gICAgICAgIHZhbCArPSBqUXVlcnkuY3NzKCBlbGVtLCBcImJvcmRlclwiICsgY3NzRXhwYW5kWyBpIF0gKyBcIldpZHRoXCIsIHRydWUsIHN0eWxlcyApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB2YWw7XG59XG5cbmZ1bmN0aW9uIGdldFdpZHRoT3JIZWlnaHQoIGVsZW0sIG5hbWUsIGV4dHJhICkge1xuXG4gIC8vIFN0YXJ0IHdpdGggb2Zmc2V0IHByb3BlcnR5LCB3aGljaCBpcyBlcXVpdmFsZW50IHRvIHRoZSBib3JkZXItYm94IHZhbHVlXG4gIHZhciB2YWx1ZUlzQm9yZGVyQm94ID0gdHJ1ZSxcbiAgICB2YWwgPSBuYW1lID09PSBcIndpZHRoXCIgPyBlbGVtLm9mZnNldFdpZHRoIDogZWxlbS5vZmZzZXRIZWlnaHQsXG4gICAgc3R5bGVzID0gZ2V0U3R5bGVzKCBlbGVtICksXG4gICAgaXNCb3JkZXJCb3ggPSBqUXVlcnkuc3VwcG9ydC5ib3hTaXppbmcgJiYgalF1ZXJ5LmNzcyggZWxlbSwgXCJib3hTaXppbmdcIiwgZmFsc2UsIHN0eWxlcyApID09PSBcImJvcmRlci1ib3hcIjtcblxuICAvLyBzb21lIG5vbi1odG1sIGVsZW1lbnRzIHJldHVybiB1bmRlZmluZWQgZm9yIG9mZnNldFdpZHRoLCBzbyBjaGVjayBmb3IgbnVsbC91bmRlZmluZWRcbiAgLy8gc3ZnIC0gaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9NjQ5Mjg1XG4gIC8vIE1hdGhNTCAtIGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTQ5MTY2OFxuICBpZiAoIHZhbCA8PSAwIHx8IHZhbCA9PSBudWxsICkge1xuICAgIC8vIEZhbGwgYmFjayB0byBjb21wdXRlZCB0aGVuIHVuY29tcHV0ZWQgY3NzIGlmIG5lY2Vzc2FyeVxuICAgIHZhbCA9IGN1ckNTUyggZWxlbSwgbmFtZSwgc3R5bGVzICk7XG4gICAgaWYgKCB2YWwgPCAwIHx8IHZhbCA9PSBudWxsICkge1xuICAgICAgdmFsID0gZWxlbS5zdHlsZVsgbmFtZSBdO1xuICAgIH1cblxuICAgIC8vIENvbXB1dGVkIHVuaXQgaXMgbm90IHBpeGVscy4gU3RvcCBoZXJlIGFuZCByZXR1cm4uXG4gICAgaWYgKCBybnVtbm9ucHgudGVzdCh2YWwpICkge1xuICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG5cbiAgICAvLyB3ZSBuZWVkIHRoZSBjaGVjayBmb3Igc3R5bGUgaW4gY2FzZSBhIGJyb3dzZXIgd2hpY2ggcmV0dXJucyB1bnJlbGlhYmxlIHZhbHVlc1xuICAgIC8vIGZvciBnZXRDb21wdXRlZFN0eWxlIHNpbGVudGx5IGZhbGxzIGJhY2sgdG8gdGhlIHJlbGlhYmxlIGVsZW0uc3R5bGVcbiAgICB2YWx1ZUlzQm9yZGVyQm94ID0gaXNCb3JkZXJCb3ggJiYgKCBqUXVlcnkuc3VwcG9ydC5ib3hTaXppbmdSZWxpYWJsZSB8fCB2YWwgPT09IGVsZW0uc3R5bGVbIG5hbWUgXSApO1xuXG4gICAgLy8gTm9ybWFsaXplIFwiXCIsIGF1dG8sIGFuZCBwcmVwYXJlIGZvciBleHRyYVxuICAgIHZhbCA9IHBhcnNlRmxvYXQoIHZhbCApIHx8IDA7XG4gIH1cblxuICAvLyB1c2UgdGhlIGFjdGl2ZSBib3gtc2l6aW5nIG1vZGVsIHRvIGFkZC9zdWJ0cmFjdCBpcnJlbGV2YW50IHN0eWxlc1xuICByZXR1cm4gKCB2YWwgK1xuICAgIGF1Z21lbnRXaWR0aE9ySGVpZ2h0KFxuICAgICAgZWxlbSxcbiAgICAgIG5hbWUsXG4gICAgICBleHRyYSB8fCAoIGlzQm9yZGVyQm94ID8gXCJib3JkZXJcIiA6IFwiY29udGVudFwiICksXG4gICAgICB2YWx1ZUlzQm9yZGVyQm94LFxuICAgICAgc3R5bGVzXG4gICAgKVxuICApICsgXCJweFwiO1xufVxuXG4vLyBUcnkgdG8gZGV0ZXJtaW5lIHRoZSBkZWZhdWx0IGRpc3BsYXkgdmFsdWUgb2YgYW4gZWxlbWVudFxuZnVuY3Rpb24gY3NzX2RlZmF1bHREaXNwbGF5KCBub2RlTmFtZSApIHtcbiAgdmFyIGRvYyA9IGRvY3VtZW50LFxuICAgIGRpc3BsYXkgPSBlbGVtZGlzcGxheVsgbm9kZU5hbWUgXTtcblxuICBpZiAoICFkaXNwbGF5ICkge1xuICAgIGRpc3BsYXkgPSBhY3R1YWxEaXNwbGF5KCBub2RlTmFtZSwgZG9jICk7XG5cbiAgICAvLyBJZiB0aGUgc2ltcGxlIHdheSBmYWlscywgcmVhZCBmcm9tIGluc2lkZSBhbiBpZnJhbWVcbiAgICBpZiAoIGRpc3BsYXkgPT09IFwibm9uZVwiIHx8ICFkaXNwbGF5ICkge1xuICAgICAgLy8gVXNlIHRoZSBhbHJlYWR5LWNyZWF0ZWQgaWZyYW1lIGlmIHBvc3NpYmxlXG4gICAgICBpZnJhbWUgPSAoIGlmcmFtZSB8fFxuICAgICAgICBqUXVlcnkoXCI8aWZyYW1lIGZyYW1lYm9yZGVyPScwJyB3aWR0aD0nMCcgaGVpZ2h0PScwJy8+XCIpXG4gICAgICAgIC5jc3MoIFwiY3NzVGV4dFwiLCBcImRpc3BsYXk6YmxvY2sgIWltcG9ydGFudFwiIClcbiAgICAgICkuYXBwZW5kVG8oIGRvYy5kb2N1bWVudEVsZW1lbnQgKTtcblxuICAgICAgLy8gQWx3YXlzIHdyaXRlIGEgbmV3IEhUTUwgc2tlbGV0b24gc28gV2Via2l0IGFuZCBGaXJlZm94IGRvbid0IGNob2tlIG9uIHJldXNlXG4gICAgICBkb2MgPSAoIGlmcmFtZVswXS5jb250ZW50V2luZG93IHx8IGlmcmFtZVswXS5jb250ZW50RG9jdW1lbnQgKS5kb2N1bWVudDtcbiAgICAgIGRvYy53cml0ZShcIjwhZG9jdHlwZSBodG1sPjxodG1sPjxib2R5PlwiKTtcbiAgICAgIGRvYy5jbG9zZSgpO1xuXG4gICAgICBkaXNwbGF5ID0gYWN0dWFsRGlzcGxheSggbm9kZU5hbWUsIGRvYyApO1xuICAgICAgaWZyYW1lLmRldGFjaCgpO1xuICAgIH1cblxuICAgIC8vIFN0b3JlIHRoZSBjb3JyZWN0IGRlZmF1bHQgZGlzcGxheVxuICAgIGVsZW1kaXNwbGF5WyBub2RlTmFtZSBdID0gZGlzcGxheTtcbiAgfVxuXG4gIHJldHVybiBkaXNwbGF5O1xufVxuXG4vLyBDYWxsZWQgT05MWSBmcm9tIHdpdGhpbiBjc3NfZGVmYXVsdERpc3BsYXlcbmZ1bmN0aW9uIGFjdHVhbERpc3BsYXkoIG5hbWUsIGRvYyApIHtcbiAgdmFyIGVsZW0gPSBqUXVlcnkoIGRvYy5jcmVhdGVFbGVtZW50KCBuYW1lICkgKS5hcHBlbmRUbyggZG9jLmJvZHkgKSxcbiAgICBkaXNwbGF5ID0galF1ZXJ5LmNzcyggZWxlbVswXSwgXCJkaXNwbGF5XCIgKTtcbiAgZWxlbS5yZW1vdmUoKTtcbiAgcmV0dXJuIGRpc3BsYXk7XG59XG5cbmpRdWVyeS5lYWNoKFsgXCJoZWlnaHRcIiwgXCJ3aWR0aFwiIF0sIGZ1bmN0aW9uKCBpLCBuYW1lICkge1xuICBqUXVlcnkuY3NzSG9va3NbIG5hbWUgXSA9IHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCBlbGVtLCBjb21wdXRlZCwgZXh0cmEgKSB7XG4gICAgICBpZiAoIGNvbXB1dGVkICkge1xuICAgICAgICAvLyBjZXJ0YWluIGVsZW1lbnRzIGNhbiBoYXZlIGRpbWVuc2lvbiBpbmZvIGlmIHdlIGludmlzaWJseSBzaG93IHRoZW1cbiAgICAgICAgLy8gaG93ZXZlciwgaXQgbXVzdCBoYXZlIGEgY3VycmVudCBkaXNwbGF5IHN0eWxlIHRoYXQgd291bGQgYmVuZWZpdCBmcm9tIHRoaXNcbiAgICAgICAgcmV0dXJuIGVsZW0ub2Zmc2V0V2lkdGggPT09IDAgJiYgcmRpc3BsYXlzd2FwLnRlc3QoIGpRdWVyeS5jc3MoIGVsZW0sIFwiZGlzcGxheVwiICkgKSA/XG4gICAgICAgICAgalF1ZXJ5LnN3YXAoIGVsZW0sIGNzc1Nob3csIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGdldFdpZHRoT3JIZWlnaHQoIGVsZW0sIG5hbWUsIGV4dHJhICk7XG4gICAgICAgICAgfSkgOlxuICAgICAgICAgIGdldFdpZHRoT3JIZWlnaHQoIGVsZW0sIG5hbWUsIGV4dHJhICk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHNldDogZnVuY3Rpb24oIGVsZW0sIHZhbHVlLCBleHRyYSApIHtcbiAgICAgIHZhciBzdHlsZXMgPSBleHRyYSAmJiBnZXRTdHlsZXMoIGVsZW0gKTtcbiAgICAgIHJldHVybiBzZXRQb3NpdGl2ZU51bWJlciggZWxlbSwgdmFsdWUsIGV4dHJhID9cbiAgICAgICAgYXVnbWVudFdpZHRoT3JIZWlnaHQoXG4gICAgICAgICAgZWxlbSxcbiAgICAgICAgICBuYW1lLFxuICAgICAgICAgIGV4dHJhLFxuICAgICAgICAgIGpRdWVyeS5zdXBwb3J0LmJveFNpemluZyAmJiBqUXVlcnkuY3NzKCBlbGVtLCBcImJveFNpemluZ1wiLCBmYWxzZSwgc3R5bGVzICkgPT09IFwiYm9yZGVyLWJveFwiLFxuICAgICAgICAgIHN0eWxlc1xuICAgICAgICApIDogMFxuICAgICAgKTtcbiAgICB9XG4gIH07XG59KTtcblxuaWYgKCAhalF1ZXJ5LnN1cHBvcnQub3BhY2l0eSApIHtcbiAgalF1ZXJ5LmNzc0hvb2tzLm9wYWNpdHkgPSB7XG4gICAgZ2V0OiBmdW5jdGlvbiggZWxlbSwgY29tcHV0ZWQgKSB7XG4gICAgICAvLyBJRSB1c2VzIGZpbHRlcnMgZm9yIG9wYWNpdHlcbiAgICAgIHJldHVybiByb3BhY2l0eS50ZXN0KCAoY29tcHV0ZWQgJiYgZWxlbS5jdXJyZW50U3R5bGUgPyBlbGVtLmN1cnJlbnRTdHlsZS5maWx0ZXIgOiBlbGVtLnN0eWxlLmZpbHRlcikgfHwgXCJcIiApID9cbiAgICAgICAgKCAwLjAxICogcGFyc2VGbG9hdCggUmVnRXhwLiQxICkgKSArIFwiXCIgOlxuICAgICAgICBjb21wdXRlZCA/IFwiMVwiIDogXCJcIjtcbiAgICB9LFxuXG4gICAgc2V0OiBmdW5jdGlvbiggZWxlbSwgdmFsdWUgKSB7XG4gICAgICB2YXIgc3R5bGUgPSBlbGVtLnN0eWxlLFxuICAgICAgICBjdXJyZW50U3R5bGUgPSBlbGVtLmN1cnJlbnRTdHlsZSxcbiAgICAgICAgb3BhY2l0eSA9IGpRdWVyeS5pc051bWVyaWMoIHZhbHVlICkgPyBcImFscGhhKG9wYWNpdHk9XCIgKyB2YWx1ZSAqIDEwMCArIFwiKVwiIDogXCJcIixcbiAgICAgICAgZmlsdGVyID0gY3VycmVudFN0eWxlICYmIGN1cnJlbnRTdHlsZS5maWx0ZXIgfHwgc3R5bGUuZmlsdGVyIHx8IFwiXCI7XG5cbiAgICAgIC8vIElFIGhhcyB0cm91YmxlIHdpdGggb3BhY2l0eSBpZiBpdCBkb2VzIG5vdCBoYXZlIGxheW91dFxuICAgICAgLy8gRm9yY2UgaXQgYnkgc2V0dGluZyB0aGUgem9vbSBsZXZlbFxuICAgICAgc3R5bGUuem9vbSA9IDE7XG5cbiAgICAgIC8vIGlmIHNldHRpbmcgb3BhY2l0eSB0byAxLCBhbmQgbm8gb3RoZXIgZmlsdGVycyBleGlzdCAtIGF0dGVtcHQgdG8gcmVtb3ZlIGZpbHRlciBhdHRyaWJ1dGUgIzY2NTJcbiAgICAgIC8vIGlmIHZhbHVlID09PSBcIlwiLCB0aGVuIHJlbW92ZSBpbmxpbmUgb3BhY2l0eSAjMTI2ODVcbiAgICAgIGlmICggKCB2YWx1ZSA+PSAxIHx8IHZhbHVlID09PSBcIlwiICkgJiZcbiAgICAgICAgICBqUXVlcnkudHJpbSggZmlsdGVyLnJlcGxhY2UoIHJhbHBoYSwgXCJcIiApICkgPT09IFwiXCIgJiZcbiAgICAgICAgICBzdHlsZS5yZW1vdmVBdHRyaWJ1dGUgKSB7XG5cbiAgICAgICAgLy8gU2V0dGluZyBzdHlsZS5maWx0ZXIgdG8gbnVsbCwgXCJcIiAmIFwiIFwiIHN0aWxsIGxlYXZlIFwiZmlsdGVyOlwiIGluIHRoZSBjc3NUZXh0XG4gICAgICAgIC8vIGlmIFwiZmlsdGVyOlwiIGlzIHByZXNlbnQgYXQgYWxsLCBjbGVhclR5cGUgaXMgZGlzYWJsZWQsIHdlIHdhbnQgdG8gYXZvaWQgdGhpc1xuICAgICAgICAvLyBzdHlsZS5yZW1vdmVBdHRyaWJ1dGUgaXMgSUUgT25seSwgYnV0IHNvIGFwcGFyZW50bHkgaXMgdGhpcyBjb2RlIHBhdGguLi5cbiAgICAgICAgc3R5bGUucmVtb3ZlQXR0cmlidXRlKCBcImZpbHRlclwiICk7XG5cbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgbm8gZmlsdGVyIHN0eWxlIGFwcGxpZWQgaW4gYSBjc3MgcnVsZSBvciB1bnNldCBpbmxpbmUgb3BhY2l0eSwgd2UgYXJlIGRvbmVcbiAgICAgICAgaWYgKCB2YWx1ZSA9PT0gXCJcIiB8fCBjdXJyZW50U3R5bGUgJiYgIWN1cnJlbnRTdHlsZS5maWx0ZXIgKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIG90aGVyd2lzZSwgc2V0IG5ldyBmaWx0ZXIgdmFsdWVzXG4gICAgICBzdHlsZS5maWx0ZXIgPSByYWxwaGEudGVzdCggZmlsdGVyICkgP1xuICAgICAgICBmaWx0ZXIucmVwbGFjZSggcmFscGhhLCBvcGFjaXR5ICkgOlxuICAgICAgICBmaWx0ZXIgKyBcIiBcIiArIG9wYWNpdHk7XG4gICAgfVxuICB9O1xufVxuXG4vLyBUaGVzZSBob29rcyBjYW5ub3QgYmUgYWRkZWQgdW50aWwgRE9NIHJlYWR5IGJlY2F1c2UgdGhlIHN1cHBvcnQgdGVzdFxuLy8gZm9yIGl0IGlzIG5vdCBydW4gdW50aWwgYWZ0ZXIgRE9NIHJlYWR5XG5qUXVlcnkoZnVuY3Rpb24oKSB7XG4gIGlmICggIWpRdWVyeS5zdXBwb3J0LnJlbGlhYmxlTWFyZ2luUmlnaHQgKSB7XG4gICAgalF1ZXJ5LmNzc0hvb2tzLm1hcmdpblJpZ2h0ID0ge1xuICAgICAgZ2V0OiBmdW5jdGlvbiggZWxlbSwgY29tcHV0ZWQgKSB7XG4gICAgICAgIGlmICggY29tcHV0ZWQgKSB7XG4gICAgICAgICAgLy8gV2ViS2l0IEJ1ZyAxMzM0MyAtIGdldENvbXB1dGVkU3R5bGUgcmV0dXJucyB3cm9uZyB2YWx1ZSBmb3IgbWFyZ2luLXJpZ2h0XG4gICAgICAgICAgLy8gV29yayBhcm91bmQgYnkgdGVtcG9yYXJpbHkgc2V0dGluZyBlbGVtZW50IGRpc3BsYXkgdG8gaW5saW5lLWJsb2NrXG4gICAgICAgICAgcmV0dXJuIGpRdWVyeS5zd2FwKCBlbGVtLCB7IFwiZGlzcGxheVwiOiBcImlubGluZS1ibG9ja1wiIH0sXG4gICAgICAgICAgICBjdXJDU1MsIFsgZWxlbSwgXCJtYXJnaW5SaWdodFwiIF0gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvLyBXZWJraXQgYnVnOiBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MjkwODRcbiAgLy8gZ2V0Q29tcHV0ZWRTdHlsZSByZXR1cm5zIHBlcmNlbnQgd2hlbiBzcGVjaWZpZWQgZm9yIHRvcC9sZWZ0L2JvdHRvbS9yaWdodFxuICAvLyByYXRoZXIgdGhhbiBtYWtlIHRoZSBjc3MgbW9kdWxlIGRlcGVuZCBvbiB0aGUgb2Zmc2V0IG1vZHVsZSwgd2UganVzdCBjaGVjayBmb3IgaXQgaGVyZVxuICBpZiAoICFqUXVlcnkuc3VwcG9ydC5waXhlbFBvc2l0aW9uICYmIGpRdWVyeS5mbi5wb3NpdGlvbiApIHtcbiAgICBqUXVlcnkuZWFjaCggWyBcInRvcFwiLCBcImxlZnRcIiBdLCBmdW5jdGlvbiggaSwgcHJvcCApIHtcbiAgICAgIGpRdWVyeS5jc3NIb29rc1sgcHJvcCBdID0ge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCBlbGVtLCBjb21wdXRlZCApIHtcbiAgICAgICAgICBpZiAoIGNvbXB1dGVkICkge1xuICAgICAgICAgICAgY29tcHV0ZWQgPSBjdXJDU1MoIGVsZW0sIHByb3AgKTtcbiAgICAgICAgICAgIC8vIGlmIGN1ckNTUyByZXR1cm5zIHBlcmNlbnRhZ2UsIGZhbGxiYWNrIHRvIG9mZnNldFxuICAgICAgICAgICAgcmV0dXJuIHJudW1ub25weC50ZXN0KCBjb21wdXRlZCApID9cbiAgICAgICAgICAgICAgalF1ZXJ5KCBlbGVtICkucG9zaXRpb24oKVsgcHJvcCBdICsgXCJweFwiIDpcbiAgICAgICAgICAgICAgY29tcHV0ZWQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbn0pO1xuXG5pZiAoIGpRdWVyeS5leHByICYmIGpRdWVyeS5leHByLmZpbHRlcnMgKSB7XG4gIGpRdWVyeS5leHByLmZpbHRlcnMuaGlkZGVuID0gZnVuY3Rpb24oIGVsZW0gKSB7XG4gICAgLy8gU3VwcG9ydDogT3BlcmEgPD0gMTIuMTJcbiAgICAvLyBPcGVyYSByZXBvcnRzIG9mZnNldFdpZHRocyBhbmQgb2Zmc2V0SGVpZ2h0cyBsZXNzIHRoYW4gemVybyBvbiBzb21lIGVsZW1lbnRzXG4gICAgcmV0dXJuIGVsZW0ub2Zmc2V0V2lkdGggPD0gMCAmJiBlbGVtLm9mZnNldEhlaWdodCA8PSAwIHx8XG4gICAgICAoIWpRdWVyeS5zdXBwb3J0LnJlbGlhYmxlSGlkZGVuT2Zmc2V0cyAmJiAoKGVsZW0uc3R5bGUgJiYgZWxlbS5zdHlsZS5kaXNwbGF5KSB8fCBqUXVlcnkuY3NzKCBlbGVtLCBcImRpc3BsYXlcIiApKSA9PT0gXCJub25lXCIpO1xuICB9O1xuXG4gIGpRdWVyeS5leHByLmZpbHRlcnMudmlzaWJsZSA9IGZ1bmN0aW9uKCBlbGVtICkge1xuICAgIHJldHVybiAhalF1ZXJ5LmV4cHIuZmlsdGVycy5oaWRkZW4oIGVsZW0gKTtcbiAgfTtcbn1cblxuLy8gVGhlc2UgaG9va3MgYXJlIHVzZWQgYnkgYW5pbWF0ZSB0byBleHBhbmQgcHJvcGVydGllc1xualF1ZXJ5LmVhY2goe1xuICBtYXJnaW46IFwiXCIsXG4gIHBhZGRpbmc6IFwiXCIsXG4gIGJvcmRlcjogXCJXaWR0aFwiXG59LCBmdW5jdGlvbiggcHJlZml4LCBzdWZmaXggKSB7XG4gIGpRdWVyeS5jc3NIb29rc1sgcHJlZml4ICsgc3VmZml4IF0gPSB7XG4gICAgZXhwYW5kOiBmdW5jdGlvbiggdmFsdWUgKSB7XG4gICAgICB2YXIgaSA9IDAsXG4gICAgICAgIGV4cGFuZGVkID0ge30sXG5cbiAgICAgICAgLy8gYXNzdW1lcyBhIHNpbmdsZSBudW1iZXIgaWYgbm90IGEgc3RyaW5nXG4gICAgICAgIHBhcnRzID0gdHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiID8gdmFsdWUuc3BsaXQoXCIgXCIpIDogWyB2YWx1ZSBdO1xuXG4gICAgICBmb3IgKCA7IGkgPCA0OyBpKysgKSB7XG4gICAgICAgIGV4cGFuZGVkWyBwcmVmaXggKyBjc3NFeHBhbmRbIGkgXSArIHN1ZmZpeCBdID1cbiAgICAgICAgICBwYXJ0c1sgaSBdIHx8IHBhcnRzWyBpIC0gMiBdIHx8IHBhcnRzWyAwIF07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBleHBhbmRlZDtcbiAgICB9XG4gIH07XG5cbiAgaWYgKCAhcm1hcmdpbi50ZXN0KCBwcmVmaXggKSApIHtcbiAgICBqUXVlcnkuY3NzSG9va3NbIHByZWZpeCArIHN1ZmZpeCBdLnNldCA9IHNldFBvc2l0aXZlTnVtYmVyO1xuICB9XG59KTtcbnZhciByMjAgPSAvJTIwL2csXG4gIHJicmFja2V0ID0gL1xcW1xcXSQvLFxuICByQ1JMRiA9IC9cXHI/XFxuL2csXG4gIHJzdWJtaXR0ZXJUeXBlcyA9IC9eKD86c3VibWl0fGJ1dHRvbnxpbWFnZXxyZXNldHxmaWxlKSQvaSxcbiAgcnN1Ym1pdHRhYmxlID0gL14oPzppbnB1dHxzZWxlY3R8dGV4dGFyZWF8a2V5Z2VuKS9pO1xuXG5qUXVlcnkuZm4uZXh0ZW5kKHtcbiAgc2VyaWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4galF1ZXJ5LnBhcmFtKCB0aGlzLnNlcmlhbGl6ZUFycmF5KCkgKTtcbiAgfSxcbiAgc2VyaWFsaXplQXJyYXk6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLm1hcChmdW5jdGlvbigpe1xuICAgICAgLy8gQ2FuIGFkZCBwcm9wSG9vayBmb3IgXCJlbGVtZW50c1wiIHRvIGZpbHRlciBvciBhZGQgZm9ybSBlbGVtZW50c1xuICAgICAgdmFyIGVsZW1lbnRzID0galF1ZXJ5LnByb3AoIHRoaXMsIFwiZWxlbWVudHNcIiApO1xuICAgICAgcmV0dXJuIGVsZW1lbnRzID8galF1ZXJ5Lm1ha2VBcnJheSggZWxlbWVudHMgKSA6IHRoaXM7XG4gICAgfSlcbiAgICAuZmlsdGVyKGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgdHlwZSA9IHRoaXMudHlwZTtcbiAgICAgIC8vIFVzZSAuaXMoXCI6ZGlzYWJsZWRcIikgc28gdGhhdCBmaWVsZHNldFtkaXNhYmxlZF0gd29ya3NcbiAgICAgIHJldHVybiB0aGlzLm5hbWUgJiYgIWpRdWVyeSggdGhpcyApLmlzKCBcIjpkaXNhYmxlZFwiICkgJiZcbiAgICAgICAgcnN1Ym1pdHRhYmxlLnRlc3QoIHRoaXMubm9kZU5hbWUgKSAmJiAhcnN1Ym1pdHRlclR5cGVzLnRlc3QoIHR5cGUgKSAmJlxuICAgICAgICAoIHRoaXMuY2hlY2tlZCB8fCAhbWFuaXB1bGF0aW9uX3JjaGVja2FibGVUeXBlLnRlc3QoIHR5cGUgKSApO1xuICAgIH0pXG4gICAgLm1hcChmdW5jdGlvbiggaSwgZWxlbSApe1xuICAgICAgdmFyIHZhbCA9IGpRdWVyeSggdGhpcyApLnZhbCgpO1xuXG4gICAgICByZXR1cm4gdmFsID09IG51bGwgP1xuICAgICAgICBudWxsIDpcbiAgICAgICAgalF1ZXJ5LmlzQXJyYXkoIHZhbCApID9cbiAgICAgICAgICBqUXVlcnkubWFwKCB2YWwsIGZ1bmN0aW9uKCB2YWwgKXtcbiAgICAgICAgICAgIHJldHVybiB7IG5hbWU6IGVsZW0ubmFtZSwgdmFsdWU6IHZhbC5yZXBsYWNlKCByQ1JMRiwgXCJcXHJcXG5cIiApIH07XG4gICAgICAgICAgfSkgOlxuICAgICAgICAgIHsgbmFtZTogZWxlbS5uYW1lLCB2YWx1ZTogdmFsLnJlcGxhY2UoIHJDUkxGLCBcIlxcclxcblwiICkgfTtcbiAgICB9KS5nZXQoKTtcbiAgfVxufSk7XG5cbi8vU2VyaWFsaXplIGFuIGFycmF5IG9mIGZvcm0gZWxlbWVudHMgb3IgYSBzZXQgb2Zcbi8va2V5L3ZhbHVlcyBpbnRvIGEgcXVlcnkgc3RyaW5nXG5qUXVlcnkucGFyYW0gPSBmdW5jdGlvbiggYSwgdHJhZGl0aW9uYWwgKSB7XG4gIHZhciBwcmVmaXgsXG4gICAgcyA9IFtdLFxuICAgIGFkZCA9IGZ1bmN0aW9uKCBrZXksIHZhbHVlICkge1xuICAgICAgLy8gSWYgdmFsdWUgaXMgYSBmdW5jdGlvbiwgaW52b2tlIGl0IGFuZCByZXR1cm4gaXRzIHZhbHVlXG4gICAgICB2YWx1ZSA9IGpRdWVyeS5pc0Z1bmN0aW9uKCB2YWx1ZSApID8gdmFsdWUoKSA6ICggdmFsdWUgPT0gbnVsbCA/IFwiXCIgOiB2YWx1ZSApO1xuICAgICAgc1sgcy5sZW5ndGggXSA9IGVuY29kZVVSSUNvbXBvbmVudCgga2V5ICkgKyBcIj1cIiArIGVuY29kZVVSSUNvbXBvbmVudCggdmFsdWUgKTtcbiAgICB9O1xuXG4gIC8vIFNldCB0cmFkaXRpb25hbCB0byB0cnVlIGZvciBqUXVlcnkgPD0gMS4zLjIgYmVoYXZpb3IuXG4gIGlmICggdHJhZGl0aW9uYWwgPT09IHVuZGVmaW5lZCApIHtcbiAgICB0cmFkaXRpb25hbCA9IGpRdWVyeS5hamF4U2V0dGluZ3MgJiYgalF1ZXJ5LmFqYXhTZXR0aW5ncy50cmFkaXRpb25hbDtcbiAgfVxuXG4gIC8vIElmIGFuIGFycmF5IHdhcyBwYXNzZWQgaW4sIGFzc3VtZSB0aGF0IGl0IGlzIGFuIGFycmF5IG9mIGZvcm0gZWxlbWVudHMuXG4gIGlmICggalF1ZXJ5LmlzQXJyYXkoIGEgKSB8fCAoIGEuanF1ZXJ5ICYmICFqUXVlcnkuaXNQbGFpbk9iamVjdCggYSApICkgKSB7XG4gICAgLy8gU2VyaWFsaXplIHRoZSBmb3JtIGVsZW1lbnRzXG4gICAgalF1ZXJ5LmVhY2goIGEsIGZ1bmN0aW9uKCkge1xuICAgICAgYWRkKCB0aGlzLm5hbWUsIHRoaXMudmFsdWUgKTtcbiAgICB9KTtcblxuICB9IGVsc2Uge1xuICAgIC8vIElmIHRyYWRpdGlvbmFsLCBlbmNvZGUgdGhlIFwib2xkXCIgd2F5ICh0aGUgd2F5IDEuMy4yIG9yIG9sZGVyXG4gICAgLy8gZGlkIGl0KSwgb3RoZXJ3aXNlIGVuY29kZSBwYXJhbXMgcmVjdXJzaXZlbHkuXG4gICAgZm9yICggcHJlZml4IGluIGEgKSB7XG4gICAgICBidWlsZFBhcmFtcyggcHJlZml4LCBhWyBwcmVmaXggXSwgdHJhZGl0aW9uYWwsIGFkZCApO1xuICAgIH1cbiAgfVxuXG4gIC8vIFJldHVybiB0aGUgcmVzdWx0aW5nIHNlcmlhbGl6YXRpb25cbiAgcmV0dXJuIHMuam9pbiggXCImXCIgKS5yZXBsYWNlKCByMjAsIFwiK1wiICk7XG59O1xuXG5mdW5jdGlvbiBidWlsZFBhcmFtcyggcHJlZml4LCBvYmosIHRyYWRpdGlvbmFsLCBhZGQgKSB7XG4gIHZhciBuYW1lO1xuXG4gIGlmICggalF1ZXJ5LmlzQXJyYXkoIG9iaiApICkge1xuICAgIC8vIFNlcmlhbGl6ZSBhcnJheSBpdGVtLlxuICAgIGpRdWVyeS5lYWNoKCBvYmosIGZ1bmN0aW9uKCBpLCB2ICkge1xuICAgICAgaWYgKCB0cmFkaXRpb25hbCB8fCByYnJhY2tldC50ZXN0KCBwcmVmaXggKSApIHtcbiAgICAgICAgLy8gVHJlYXQgZWFjaCBhcnJheSBpdGVtIGFzIGEgc2NhbGFyLlxuICAgICAgICBhZGQoIHByZWZpeCwgdiApO1xuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBJdGVtIGlzIG5vbi1zY2FsYXIgKGFycmF5IG9yIG9iamVjdCksIGVuY29kZSBpdHMgbnVtZXJpYyBpbmRleC5cbiAgICAgICAgYnVpbGRQYXJhbXMoIHByZWZpeCArIFwiW1wiICsgKCB0eXBlb2YgdiA9PT0gXCJvYmplY3RcIiA/IGkgOiBcIlwiICkgKyBcIl1cIiwgdiwgdHJhZGl0aW9uYWwsIGFkZCApO1xuICAgICAgfVxuICAgIH0pO1xuXG4gIH0gZWxzZSBpZiAoICF0cmFkaXRpb25hbCAmJiBqUXVlcnkudHlwZSggb2JqICkgPT09IFwib2JqZWN0XCIgKSB7XG4gICAgLy8gU2VyaWFsaXplIG9iamVjdCBpdGVtLlxuICAgIGZvciAoIG5hbWUgaW4gb2JqICkge1xuICAgICAgYnVpbGRQYXJhbXMoIHByZWZpeCArIFwiW1wiICsgbmFtZSArIFwiXVwiLCBvYmpbIG5hbWUgXSwgdHJhZGl0aW9uYWwsIGFkZCApO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIC8vIFNlcmlhbGl6ZSBzY2FsYXIgaXRlbS5cbiAgICBhZGQoIHByZWZpeCwgb2JqICk7XG4gIH1cbn1cbmpRdWVyeS5lYWNoKCAoXCJibHVyIGZvY3VzIGZvY3VzaW4gZm9jdXNvdXQgbG9hZCByZXNpemUgc2Nyb2xsIHVubG9hZCBjbGljayBkYmxjbGljayBcIiArXG4gIFwibW91c2Vkb3duIG1vdXNldXAgbW91c2Vtb3ZlIG1vdXNlb3ZlciBtb3VzZW91dCBtb3VzZWVudGVyIG1vdXNlbGVhdmUgXCIgK1xuICBcImNoYW5nZSBzZWxlY3Qgc3VibWl0IGtleWRvd24ga2V5cHJlc3Mga2V5dXAgZXJyb3IgY29udGV4dG1lbnVcIikuc3BsaXQoXCIgXCIpLCBmdW5jdGlvbiggaSwgbmFtZSApIHtcblxuICAvLyBIYW5kbGUgZXZlbnQgYmluZGluZ1xuICBqUXVlcnkuZm5bIG5hbWUgXSA9IGZ1bmN0aW9uKCBkYXRhLCBmbiApIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA+IDAgP1xuICAgICAgdGhpcy5vbiggbmFtZSwgbnVsbCwgZGF0YSwgZm4gKSA6XG4gICAgICB0aGlzLnRyaWdnZXIoIG5hbWUgKTtcbiAgfTtcbn0pO1xuXG5qUXVlcnkuZm4uZXh0ZW5kKHtcbiAgaG92ZXI6IGZ1bmN0aW9uKCBmbk92ZXIsIGZuT3V0ICkge1xuICAgIHJldHVybiB0aGlzLm1vdXNlZW50ZXIoIGZuT3ZlciApLm1vdXNlbGVhdmUoIGZuT3V0IHx8IGZuT3ZlciApO1xuICB9LFxuXG4gIGJpbmQ6IGZ1bmN0aW9uKCB0eXBlcywgZGF0YSwgZm4gKSB7XG4gICAgcmV0dXJuIHRoaXMub24oIHR5cGVzLCBudWxsLCBkYXRhLCBmbiApO1xuICB9LFxuICB1bmJpbmQ6IGZ1bmN0aW9uKCB0eXBlcywgZm4gKSB7XG4gICAgcmV0dXJuIHRoaXMub2ZmKCB0eXBlcywgbnVsbCwgZm4gKTtcbiAgfSxcblxuICBkZWxlZ2F0ZTogZnVuY3Rpb24oIHNlbGVjdG9yLCB0eXBlcywgZGF0YSwgZm4gKSB7XG4gICAgcmV0dXJuIHRoaXMub24oIHR5cGVzLCBzZWxlY3RvciwgZGF0YSwgZm4gKTtcbiAgfSxcbiAgdW5kZWxlZ2F0ZTogZnVuY3Rpb24oIHNlbGVjdG9yLCB0eXBlcywgZm4gKSB7XG4gICAgLy8gKCBuYW1lc3BhY2UgKSBvciAoIHNlbGVjdG9yLCB0eXBlcyBbLCBmbl0gKVxuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID09PSAxID8gdGhpcy5vZmYoIHNlbGVjdG9yLCBcIioqXCIgKSA6IHRoaXMub2ZmKCB0eXBlcywgc2VsZWN0b3IgfHwgXCIqKlwiLCBmbiApO1xuICB9XG59KTtcbnZhclxuICAvLyBEb2N1bWVudCBsb2NhdGlvblxuICBhamF4TG9jUGFydHMsXG4gIGFqYXhMb2NhdGlvbixcbiAgYWpheF9ub25jZSA9IGpRdWVyeS5ub3coKSxcblxuICBhamF4X3JxdWVyeSA9IC9cXD8vLFxuICByaGFzaCA9IC8jLiokLyxcbiAgcnRzID0gLyhbPyZdKV89W14mXSovLFxuICByaGVhZGVycyA9IC9eKC4qPyk6WyBcXHRdKihbXlxcclxcbl0qKVxccj8kL21nLCAvLyBJRSBsZWF2ZXMgYW4gXFxyIGNoYXJhY3RlciBhdCBFT0xcbiAgLy8gIzc2NTMsICM4MTI1LCAjODE1MjogbG9jYWwgcHJvdG9jb2wgZGV0ZWN0aW9uXG4gIHJsb2NhbFByb3RvY29sID0gL14oPzphYm91dHxhcHB8YXBwLXN0b3JhZ2V8ListZXh0ZW5zaW9ufGZpbGV8cmVzfHdpZGdldCk6JC8sXG4gIHJub0NvbnRlbnQgPSAvXig/OkdFVHxIRUFEKSQvLFxuICBycHJvdG9jb2wgPSAvXlxcL1xcLy8sXG4gIHJ1cmwgPSAvXihbXFx3ListXSs6KSg/OlxcL1xcLyhbXlxcLz8jOl0qKSg/OjooXFxkKyl8KXwpLyxcblxuICAvLyBLZWVwIGEgY29weSBvZiB0aGUgb2xkIGxvYWQgbWV0aG9kXG4gIF9sb2FkID0galF1ZXJ5LmZuLmxvYWQsXG5cbiAgLyogUHJlZmlsdGVyc1xuICAgKiAxKSBUaGV5IGFyZSB1c2VmdWwgdG8gaW50cm9kdWNlIGN1c3RvbSBkYXRhVHlwZXMgKHNlZSBhamF4L2pzb25wLmpzIGZvciBhbiBleGFtcGxlKVxuICAgKiAyKSBUaGVzZSBhcmUgY2FsbGVkOlxuICAgKiAgICAtIEJFRk9SRSBhc2tpbmcgZm9yIGEgdHJhbnNwb3J0XG4gICAqICAgIC0gQUZURVIgcGFyYW0gc2VyaWFsaXphdGlvbiAocy5kYXRhIGlzIGEgc3RyaW5nIGlmIHMucHJvY2Vzc0RhdGEgaXMgdHJ1ZSlcbiAgICogMykga2V5IGlzIHRoZSBkYXRhVHlwZVxuICAgKiA0KSB0aGUgY2F0Y2hhbGwgc3ltYm9sIFwiKlwiIGNhbiBiZSB1c2VkXG4gICAqIDUpIGV4ZWN1dGlvbiB3aWxsIHN0YXJ0IHdpdGggdHJhbnNwb3J0IGRhdGFUeXBlIGFuZCBUSEVOIGNvbnRpbnVlIGRvd24gdG8gXCIqXCIgaWYgbmVlZGVkXG4gICAqL1xuICBwcmVmaWx0ZXJzID0ge30sXG5cbiAgLyogVHJhbnNwb3J0cyBiaW5kaW5nc1xuICAgKiAxKSBrZXkgaXMgdGhlIGRhdGFUeXBlXG4gICAqIDIpIHRoZSBjYXRjaGFsbCBzeW1ib2wgXCIqXCIgY2FuIGJlIHVzZWRcbiAgICogMykgc2VsZWN0aW9uIHdpbGwgc3RhcnQgd2l0aCB0cmFuc3BvcnQgZGF0YVR5cGUgYW5kIFRIRU4gZ28gdG8gXCIqXCIgaWYgbmVlZGVkXG4gICAqL1xuICB0cmFuc3BvcnRzID0ge30sXG5cbiAgLy8gQXZvaWQgY29tbWVudC1wcm9sb2cgY2hhciBzZXF1ZW5jZSAoIzEwMDk4KTsgbXVzdCBhcHBlYXNlIGxpbnQgYW5kIGV2YWRlIGNvbXByZXNzaW9uXG4gIGFsbFR5cGVzID0gXCIqL1wiLmNvbmNhdChcIipcIik7XG5cbi8vICM4MTM4LCBJRSBtYXkgdGhyb3cgYW4gZXhjZXB0aW9uIHdoZW4gYWNjZXNzaW5nXG4vLyBhIGZpZWxkIGZyb20gd2luZG93LmxvY2F0aW9uIGlmIGRvY3VtZW50LmRvbWFpbiBoYXMgYmVlbiBzZXRcbnRyeSB7XG4gIGFqYXhMb2NhdGlvbiA9IGxvY2F0aW9uLmhyZWY7XG59IGNhdGNoKCBlICkge1xuICAvLyBVc2UgdGhlIGhyZWYgYXR0cmlidXRlIG9mIGFuIEEgZWxlbWVudFxuICAvLyBzaW5jZSBJRSB3aWxsIG1vZGlmeSBpdCBnaXZlbiBkb2N1bWVudC5sb2NhdGlvblxuICBhamF4TG9jYXRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCBcImFcIiApO1xuICBhamF4TG9jYXRpb24uaHJlZiA9IFwiXCI7XG4gIGFqYXhMb2NhdGlvbiA9IGFqYXhMb2NhdGlvbi5ocmVmO1xufVxuXG4vLyBTZWdtZW50IGxvY2F0aW9uIGludG8gcGFydHNcbmFqYXhMb2NQYXJ0cyA9IHJ1cmwuZXhlYyggYWpheExvY2F0aW9uLnRvTG93ZXJDYXNlKCkgKSB8fCBbXTtcblxuLy8gQmFzZSBcImNvbnN0cnVjdG9yXCIgZm9yIGpRdWVyeS5hamF4UHJlZmlsdGVyIGFuZCBqUXVlcnkuYWpheFRyYW5zcG9ydFxuZnVuY3Rpb24gYWRkVG9QcmVmaWx0ZXJzT3JUcmFuc3BvcnRzKCBzdHJ1Y3R1cmUgKSB7XG5cbiAgLy8gZGF0YVR5cGVFeHByZXNzaW9uIGlzIG9wdGlvbmFsIGFuZCBkZWZhdWx0cyB0byBcIipcIlxuICByZXR1cm4gZnVuY3Rpb24oIGRhdGFUeXBlRXhwcmVzc2lvbiwgZnVuYyApIHtcblxuICAgIGlmICggdHlwZW9mIGRhdGFUeXBlRXhwcmVzc2lvbiAhPT0gXCJzdHJpbmdcIiApIHtcbiAgICAgIGZ1bmMgPSBkYXRhVHlwZUV4cHJlc3Npb247XG4gICAgICBkYXRhVHlwZUV4cHJlc3Npb24gPSBcIipcIjtcbiAgICB9XG5cbiAgICB2YXIgZGF0YVR5cGUsXG4gICAgICBpID0gMCxcbiAgICAgIGRhdGFUeXBlcyA9IGRhdGFUeXBlRXhwcmVzc2lvbi50b0xvd2VyQ2FzZSgpLm1hdGNoKCBjb3JlX3Jub3R3aGl0ZSApIHx8IFtdO1xuXG4gICAgaWYgKCBqUXVlcnkuaXNGdW5jdGlvbiggZnVuYyApICkge1xuICAgICAgLy8gRm9yIGVhY2ggZGF0YVR5cGUgaW4gdGhlIGRhdGFUeXBlRXhwcmVzc2lvblxuICAgICAgd2hpbGUgKCAoZGF0YVR5cGUgPSBkYXRhVHlwZXNbaSsrXSkgKSB7XG4gICAgICAgIC8vIFByZXBlbmQgaWYgcmVxdWVzdGVkXG4gICAgICAgIGlmICggZGF0YVR5cGVbMF0gPT09IFwiK1wiICkge1xuICAgICAgICAgIGRhdGFUeXBlID0gZGF0YVR5cGUuc2xpY2UoIDEgKSB8fCBcIipcIjtcbiAgICAgICAgICAoc3RydWN0dXJlWyBkYXRhVHlwZSBdID0gc3RydWN0dXJlWyBkYXRhVHlwZSBdIHx8IFtdKS51bnNoaWZ0KCBmdW5jICk7XG5cbiAgICAgICAgLy8gT3RoZXJ3aXNlIGFwcGVuZFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIChzdHJ1Y3R1cmVbIGRhdGFUeXBlIF0gPSBzdHJ1Y3R1cmVbIGRhdGFUeXBlIF0gfHwgW10pLnB1c2goIGZ1bmMgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcbn1cblxuLy8gQmFzZSBpbnNwZWN0aW9uIGZ1bmN0aW9uIGZvciBwcmVmaWx0ZXJzIGFuZCB0cmFuc3BvcnRzXG5mdW5jdGlvbiBpbnNwZWN0UHJlZmlsdGVyc09yVHJhbnNwb3J0cyggc3RydWN0dXJlLCBvcHRpb25zLCBvcmlnaW5hbE9wdGlvbnMsIGpxWEhSICkge1xuXG4gIHZhciBpbnNwZWN0ZWQgPSB7fSxcbiAgICBzZWVraW5nVHJhbnNwb3J0ID0gKCBzdHJ1Y3R1cmUgPT09IHRyYW5zcG9ydHMgKTtcblxuICBmdW5jdGlvbiBpbnNwZWN0KCBkYXRhVHlwZSApIHtcbiAgICB2YXIgc2VsZWN0ZWQ7XG4gICAgaW5zcGVjdGVkWyBkYXRhVHlwZSBdID0gdHJ1ZTtcbiAgICBqUXVlcnkuZWFjaCggc3RydWN0dXJlWyBkYXRhVHlwZSBdIHx8IFtdLCBmdW5jdGlvbiggXywgcHJlZmlsdGVyT3JGYWN0b3J5ICkge1xuICAgICAgdmFyIGRhdGFUeXBlT3JUcmFuc3BvcnQgPSBwcmVmaWx0ZXJPckZhY3RvcnkoIG9wdGlvbnMsIG9yaWdpbmFsT3B0aW9ucywganFYSFIgKTtcbiAgICAgIGlmKCB0eXBlb2YgZGF0YVR5cGVPclRyYW5zcG9ydCA9PT0gXCJzdHJpbmdcIiAmJiAhc2Vla2luZ1RyYW5zcG9ydCAmJiAhaW5zcGVjdGVkWyBkYXRhVHlwZU9yVHJhbnNwb3J0IF0gKSB7XG4gICAgICAgIG9wdGlvbnMuZGF0YVR5cGVzLnVuc2hpZnQoIGRhdGFUeXBlT3JUcmFuc3BvcnQgKTtcbiAgICAgICAgaW5zcGVjdCggZGF0YVR5cGVPclRyYW5zcG9ydCApO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9IGVsc2UgaWYgKCBzZWVraW5nVHJhbnNwb3J0ICkge1xuICAgICAgICByZXR1cm4gISggc2VsZWN0ZWQgPSBkYXRhVHlwZU9yVHJhbnNwb3J0ICk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHNlbGVjdGVkO1xuICB9XG5cbiAgcmV0dXJuIGluc3BlY3QoIG9wdGlvbnMuZGF0YVR5cGVzWyAwIF0gKSB8fCAhaW5zcGVjdGVkWyBcIipcIiBdICYmIGluc3BlY3QoIFwiKlwiICk7XG59XG5cbi8vIEEgc3BlY2lhbCBleHRlbmQgZm9yIGFqYXggb3B0aW9uc1xuLy8gdGhhdCB0YWtlcyBcImZsYXRcIiBvcHRpb25zIChub3QgdG8gYmUgZGVlcCBleHRlbmRlZClcbi8vIEZpeGVzICM5ODg3XG5mdW5jdGlvbiBhamF4RXh0ZW5kKCB0YXJnZXQsIHNyYyApIHtcbiAgdmFyIGRlZXAsIGtleSxcbiAgICBmbGF0T3B0aW9ucyA9IGpRdWVyeS5hamF4U2V0dGluZ3MuZmxhdE9wdGlvbnMgfHwge307XG5cbiAgZm9yICgga2V5IGluIHNyYyApIHtcbiAgICBpZiAoIHNyY1sga2V5IF0gIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICggZmxhdE9wdGlvbnNbIGtleSBdID8gdGFyZ2V0IDogKCBkZWVwIHx8IChkZWVwID0ge30pICkgKVsga2V5IF0gPSBzcmNbIGtleSBdO1xuICAgIH1cbiAgfVxuICBpZiAoIGRlZXAgKSB7XG4gICAgalF1ZXJ5LmV4dGVuZCggdHJ1ZSwgdGFyZ2V0LCBkZWVwICk7XG4gIH1cblxuICByZXR1cm4gdGFyZ2V0O1xufVxuXG5qUXVlcnkuZm4ubG9hZCA9IGZ1bmN0aW9uKCB1cmwsIHBhcmFtcywgY2FsbGJhY2sgKSB7XG4gIGlmICggdHlwZW9mIHVybCAhPT0gXCJzdHJpbmdcIiAmJiBfbG9hZCApIHtcbiAgICByZXR1cm4gX2xvYWQuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuICB9XG5cbiAgdmFyIHNlbGVjdG9yLCByZXNwb25zZSwgdHlwZSxcbiAgICBzZWxmID0gdGhpcyxcbiAgICBvZmYgPSB1cmwuaW5kZXhPZihcIiBcIik7XG5cbiAgaWYgKCBvZmYgPj0gMCApIHtcbiAgICBzZWxlY3RvciA9IHVybC5zbGljZSggb2ZmLCB1cmwubGVuZ3RoICk7XG4gICAgdXJsID0gdXJsLnNsaWNlKCAwLCBvZmYgKTtcbiAgfVxuXG4gIC8vIElmIGl0J3MgYSBmdW5jdGlvblxuICBpZiAoIGpRdWVyeS5pc0Z1bmN0aW9uKCBwYXJhbXMgKSApIHtcblxuICAgIC8vIFdlIGFzc3VtZSB0aGF0IGl0J3MgdGhlIGNhbGxiYWNrXG4gICAgY2FsbGJhY2sgPSBwYXJhbXM7XG4gICAgcGFyYW1zID0gdW5kZWZpbmVkO1xuXG4gIC8vIE90aGVyd2lzZSwgYnVpbGQgYSBwYXJhbSBzdHJpbmdcbiAgfSBlbHNlIGlmICggcGFyYW1zICYmIHR5cGVvZiBwYXJhbXMgPT09IFwib2JqZWN0XCIgKSB7XG4gICAgdHlwZSA9IFwiUE9TVFwiO1xuICB9XG5cbiAgLy8gSWYgd2UgaGF2ZSBlbGVtZW50cyB0byBtb2RpZnksIG1ha2UgdGhlIHJlcXVlc3RcbiAgaWYgKCBzZWxmLmxlbmd0aCA+IDAgKSB7XG4gICAgalF1ZXJ5LmFqYXgoe1xuICAgICAgdXJsOiB1cmwsXG5cbiAgICAgIC8vIGlmIFwidHlwZVwiIHZhcmlhYmxlIGlzIHVuZGVmaW5lZCwgdGhlbiBcIkdFVFwiIG1ldGhvZCB3aWxsIGJlIHVzZWRcbiAgICAgIHR5cGU6IHR5cGUsXG4gICAgICBkYXRhVHlwZTogXCJodG1sXCIsXG4gICAgICBkYXRhOiBwYXJhbXNcbiAgICB9KS5kb25lKGZ1bmN0aW9uKCByZXNwb25zZVRleHQgKSB7XG5cbiAgICAgIC8vIFNhdmUgcmVzcG9uc2UgZm9yIHVzZSBpbiBjb21wbGV0ZSBjYWxsYmFja1xuICAgICAgcmVzcG9uc2UgPSBhcmd1bWVudHM7XG5cbiAgICAgIHNlbGYuaHRtbCggc2VsZWN0b3IgP1xuXG4gICAgICAgIC8vIElmIGEgc2VsZWN0b3Igd2FzIHNwZWNpZmllZCwgbG9jYXRlIHRoZSByaWdodCBlbGVtZW50cyBpbiBhIGR1bW15IGRpdlxuICAgICAgICAvLyBFeGNsdWRlIHNjcmlwdHMgdG8gYXZvaWQgSUUgJ1Blcm1pc3Npb24gRGVuaWVkJyBlcnJvcnNcbiAgICAgICAgalF1ZXJ5KFwiPGRpdj5cIikuYXBwZW5kKCBqUXVlcnkucGFyc2VIVE1MKCByZXNwb25zZVRleHQgKSApLmZpbmQoIHNlbGVjdG9yICkgOlxuXG4gICAgICAgIC8vIE90aGVyd2lzZSB1c2UgdGhlIGZ1bGwgcmVzdWx0XG4gICAgICAgIHJlc3BvbnNlVGV4dCApO1xuXG4gICAgfSkuY29tcGxldGUoIGNhbGxiYWNrICYmIGZ1bmN0aW9uKCBqcVhIUiwgc3RhdHVzICkge1xuICAgICAgc2VsZi5lYWNoKCBjYWxsYmFjaywgcmVzcG9uc2UgfHwgWyBqcVhIUi5yZXNwb25zZVRleHQsIHN0YXR1cywganFYSFIgXSApO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBBdHRhY2ggYSBidW5jaCBvZiBmdW5jdGlvbnMgZm9yIGhhbmRsaW5nIGNvbW1vbiBBSkFYIGV2ZW50c1xualF1ZXJ5LmVhY2goIFsgXCJhamF4U3RhcnRcIiwgXCJhamF4U3RvcFwiLCBcImFqYXhDb21wbGV0ZVwiLCBcImFqYXhFcnJvclwiLCBcImFqYXhTdWNjZXNzXCIsIFwiYWpheFNlbmRcIiBdLCBmdW5jdGlvbiggaSwgdHlwZSApe1xuICBqUXVlcnkuZm5bIHR5cGUgXSA9IGZ1bmN0aW9uKCBmbiApe1xuICAgIHJldHVybiB0aGlzLm9uKCB0eXBlLCBmbiApO1xuICB9O1xufSk7XG5cbmpRdWVyeS5leHRlbmQoe1xuXG4gIC8vIENvdW50ZXIgZm9yIGhvbGRpbmcgdGhlIG51bWJlciBvZiBhY3RpdmUgcXVlcmllc1xuICBhY3RpdmU6IDAsXG5cbiAgLy8gTGFzdC1Nb2RpZmllZCBoZWFkZXIgY2FjaGUgZm9yIG5leHQgcmVxdWVzdFxuICBsYXN0TW9kaWZpZWQ6IHt9LFxuICBldGFnOiB7fSxcblxuICBhamF4U2V0dGluZ3M6IHtcbiAgICB1cmw6IGFqYXhMb2NhdGlvbixcbiAgICB0eXBlOiBcIkdFVFwiLFxuICAgIGlzTG9jYWw6IHJsb2NhbFByb3RvY29sLnRlc3QoIGFqYXhMb2NQYXJ0c1sgMSBdICksXG4gICAgZ2xvYmFsOiB0cnVlLFxuICAgIHByb2Nlc3NEYXRhOiB0cnVlLFxuICAgIGFzeW5jOiB0cnVlLFxuICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDsgY2hhcnNldD1VVEYtOFwiLFxuICAgIC8qXG4gICAgdGltZW91dDogMCxcbiAgICBkYXRhOiBudWxsLFxuICAgIGRhdGFUeXBlOiBudWxsLFxuICAgIHVzZXJuYW1lOiBudWxsLFxuICAgIHBhc3N3b3JkOiBudWxsLFxuICAgIGNhY2hlOiBudWxsLFxuICAgIHRocm93czogZmFsc2UsXG4gICAgdHJhZGl0aW9uYWw6IGZhbHNlLFxuICAgIGhlYWRlcnM6IHt9LFxuICAgICovXG5cbiAgICBhY2NlcHRzOiB7XG4gICAgICBcIipcIjogYWxsVHlwZXMsXG4gICAgICB0ZXh0OiBcInRleHQvcGxhaW5cIixcbiAgICAgIGh0bWw6IFwidGV4dC9odG1sXCIsXG4gICAgICB4bWw6IFwiYXBwbGljYXRpb24veG1sLCB0ZXh0L3htbFwiLFxuICAgICAganNvbjogXCJhcHBsaWNhdGlvbi9qc29uLCB0ZXh0L2phdmFzY3JpcHRcIlxuICAgIH0sXG5cbiAgICBjb250ZW50czoge1xuICAgICAgeG1sOiAveG1sLyxcbiAgICAgIGh0bWw6IC9odG1sLyxcbiAgICAgIGpzb246IC9qc29uL1xuICAgIH0sXG5cbiAgICByZXNwb25zZUZpZWxkczoge1xuICAgICAgeG1sOiBcInJlc3BvbnNlWE1MXCIsXG4gICAgICB0ZXh0OiBcInJlc3BvbnNlVGV4dFwiLFxuICAgICAganNvbjogXCJyZXNwb25zZUpTT05cIlxuICAgIH0sXG5cbiAgICAvLyBEYXRhIGNvbnZlcnRlcnNcbiAgICAvLyBLZXlzIHNlcGFyYXRlIHNvdXJjZSAob3IgY2F0Y2hhbGwgXCIqXCIpIGFuZCBkZXN0aW5hdGlvbiB0eXBlcyB3aXRoIGEgc2luZ2xlIHNwYWNlXG4gICAgY29udmVydGVyczoge1xuXG4gICAgICAvLyBDb252ZXJ0IGFueXRoaW5nIHRvIHRleHRcbiAgICAgIFwiKiB0ZXh0XCI6IFN0cmluZyxcblxuICAgICAgLy8gVGV4dCB0byBodG1sICh0cnVlID0gbm8gdHJhbnNmb3JtYXRpb24pXG4gICAgICBcInRleHQgaHRtbFwiOiB0cnVlLFxuXG4gICAgICAvLyBFdmFsdWF0ZSB0ZXh0IGFzIGEganNvbiBleHByZXNzaW9uXG4gICAgICBcInRleHQganNvblwiOiBqUXVlcnkucGFyc2VKU09OLFxuXG4gICAgICAvLyBQYXJzZSB0ZXh0IGFzIHhtbFxuICAgICAgXCJ0ZXh0IHhtbFwiOiBqUXVlcnkucGFyc2VYTUxcbiAgICB9LFxuXG4gICAgLy8gRm9yIG9wdGlvbnMgdGhhdCBzaG91bGRuJ3QgYmUgZGVlcCBleHRlbmRlZDpcbiAgICAvLyB5b3UgY2FuIGFkZCB5b3VyIG93biBjdXN0b20gb3B0aW9ucyBoZXJlIGlmXG4gICAgLy8gYW5kIHdoZW4geW91IGNyZWF0ZSBvbmUgdGhhdCBzaG91bGRuJ3QgYmVcbiAgICAvLyBkZWVwIGV4dGVuZGVkIChzZWUgYWpheEV4dGVuZClcbiAgICBmbGF0T3B0aW9uczoge1xuICAgICAgdXJsOiB0cnVlLFxuICAgICAgY29udGV4dDogdHJ1ZVxuICAgIH1cbiAgfSxcblxuICAvLyBDcmVhdGVzIGEgZnVsbCBmbGVkZ2VkIHNldHRpbmdzIG9iamVjdCBpbnRvIHRhcmdldFxuICAvLyB3aXRoIGJvdGggYWpheFNldHRpbmdzIGFuZCBzZXR0aW5ncyBmaWVsZHMuXG4gIC8vIElmIHRhcmdldCBpcyBvbWl0dGVkLCB3cml0ZXMgaW50byBhamF4U2V0dGluZ3MuXG4gIGFqYXhTZXR1cDogZnVuY3Rpb24oIHRhcmdldCwgc2V0dGluZ3MgKSB7XG4gICAgcmV0dXJuIHNldHRpbmdzID9cblxuICAgICAgLy8gQnVpbGRpbmcgYSBzZXR0aW5ncyBvYmplY3RcbiAgICAgIGFqYXhFeHRlbmQoIGFqYXhFeHRlbmQoIHRhcmdldCwgalF1ZXJ5LmFqYXhTZXR0aW5ncyApLCBzZXR0aW5ncyApIDpcblxuICAgICAgLy8gRXh0ZW5kaW5nIGFqYXhTZXR0aW5nc1xuICAgICAgYWpheEV4dGVuZCggalF1ZXJ5LmFqYXhTZXR0aW5ncywgdGFyZ2V0ICk7XG4gIH0sXG5cbiAgYWpheFByZWZpbHRlcjogYWRkVG9QcmVmaWx0ZXJzT3JUcmFuc3BvcnRzKCBwcmVmaWx0ZXJzICksXG4gIGFqYXhUcmFuc3BvcnQ6IGFkZFRvUHJlZmlsdGVyc09yVHJhbnNwb3J0cyggdHJhbnNwb3J0cyApLFxuXG4gIC8vIE1haW4gbWV0aG9kXG4gIGFqYXg6IGZ1bmN0aW9uKCB1cmwsIG9wdGlvbnMgKSB7XG5cbiAgICAvLyBJZiB1cmwgaXMgYW4gb2JqZWN0LCBzaW11bGF0ZSBwcmUtMS41IHNpZ25hdHVyZVxuICAgIGlmICggdHlwZW9mIHVybCA9PT0gXCJvYmplY3RcIiApIHtcbiAgICAgIG9wdGlvbnMgPSB1cmw7XG4gICAgICB1cmwgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgLy8gRm9yY2Ugb3B0aW9ucyB0byBiZSBhbiBvYmplY3RcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHZhciAvLyBDcm9zcy1kb21haW4gZGV0ZWN0aW9uIHZhcnNcbiAgICAgIHBhcnRzLFxuICAgICAgLy8gTG9vcCB2YXJpYWJsZVxuICAgICAgaSxcbiAgICAgIC8vIFVSTCB3aXRob3V0IGFudGktY2FjaGUgcGFyYW1cbiAgICAgIGNhY2hlVVJMLFxuICAgICAgLy8gUmVzcG9uc2UgaGVhZGVycyBhcyBzdHJpbmdcbiAgICAgIHJlc3BvbnNlSGVhZGVyc1N0cmluZyxcbiAgICAgIC8vIHRpbWVvdXQgaGFuZGxlXG4gICAgICB0aW1lb3V0VGltZXIsXG5cbiAgICAgIC8vIFRvIGtub3cgaWYgZ2xvYmFsIGV2ZW50cyBhcmUgdG8gYmUgZGlzcGF0Y2hlZFxuICAgICAgZmlyZUdsb2JhbHMsXG5cbiAgICAgIHRyYW5zcG9ydCxcbiAgICAgIC8vIFJlc3BvbnNlIGhlYWRlcnNcbiAgICAgIHJlc3BvbnNlSGVhZGVycyxcbiAgICAgIC8vIENyZWF0ZSB0aGUgZmluYWwgb3B0aW9ucyBvYmplY3RcbiAgICAgIHMgPSBqUXVlcnkuYWpheFNldHVwKCB7fSwgb3B0aW9ucyApLFxuICAgICAgLy8gQ2FsbGJhY2tzIGNvbnRleHRcbiAgICAgIGNhbGxiYWNrQ29udGV4dCA9IHMuY29udGV4dCB8fCBzLFxuICAgICAgLy8gQ29udGV4dCBmb3IgZ2xvYmFsIGV2ZW50cyBpcyBjYWxsYmFja0NvbnRleHQgaWYgaXQgaXMgYSBET00gbm9kZSBvciBqUXVlcnkgY29sbGVjdGlvblxuICAgICAgZ2xvYmFsRXZlbnRDb250ZXh0ID0gcy5jb250ZXh0ICYmICggY2FsbGJhY2tDb250ZXh0Lm5vZGVUeXBlIHx8IGNhbGxiYWNrQ29udGV4dC5qcXVlcnkgKSA/XG4gICAgICAgIGpRdWVyeSggY2FsbGJhY2tDb250ZXh0ICkgOlxuICAgICAgICBqUXVlcnkuZXZlbnQsXG4gICAgICAvLyBEZWZlcnJlZHNcbiAgICAgIGRlZmVycmVkID0galF1ZXJ5LkRlZmVycmVkKCksXG4gICAgICBjb21wbGV0ZURlZmVycmVkID0galF1ZXJ5LkNhbGxiYWNrcyhcIm9uY2UgbWVtb3J5XCIpLFxuICAgICAgLy8gU3RhdHVzLWRlcGVuZGVudCBjYWxsYmFja3NcbiAgICAgIHN0YXR1c0NvZGUgPSBzLnN0YXR1c0NvZGUgfHwge30sXG4gICAgICAvLyBIZWFkZXJzICh0aGV5IGFyZSBzZW50IGFsbCBhdCBvbmNlKVxuICAgICAgcmVxdWVzdEhlYWRlcnMgPSB7fSxcbiAgICAgIHJlcXVlc3RIZWFkZXJzTmFtZXMgPSB7fSxcbiAgICAgIC8vIFRoZSBqcVhIUiBzdGF0ZVxuICAgICAgc3RhdGUgPSAwLFxuICAgICAgLy8gRGVmYXVsdCBhYm9ydCBtZXNzYWdlXG4gICAgICBzdHJBYm9ydCA9IFwiY2FuY2VsZWRcIixcbiAgICAgIC8vIEZha2UgeGhyXG4gICAgICBqcVhIUiA9IHtcbiAgICAgICAgcmVhZHlTdGF0ZTogMCxcblxuICAgICAgICAvLyBCdWlsZHMgaGVhZGVycyBoYXNodGFibGUgaWYgbmVlZGVkXG4gICAgICAgIGdldFJlc3BvbnNlSGVhZGVyOiBmdW5jdGlvbigga2V5ICkge1xuICAgICAgICAgIHZhciBtYXRjaDtcbiAgICAgICAgICBpZiAoIHN0YXRlID09PSAyICkge1xuICAgICAgICAgICAgaWYgKCAhcmVzcG9uc2VIZWFkZXJzICkge1xuICAgICAgICAgICAgICByZXNwb25zZUhlYWRlcnMgPSB7fTtcbiAgICAgICAgICAgICAgd2hpbGUgKCAobWF0Y2ggPSByaGVhZGVycy5leGVjKCByZXNwb25zZUhlYWRlcnNTdHJpbmcgKSkgKSB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2VIZWFkZXJzWyBtYXRjaFsxXS50b0xvd2VyQ2FzZSgpIF0gPSBtYXRjaFsgMiBdO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtYXRjaCA9IHJlc3BvbnNlSGVhZGVyc1sga2V5LnRvTG93ZXJDYXNlKCkgXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG1hdGNoID09IG51bGwgPyBudWxsIDogbWF0Y2g7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gUmF3IHN0cmluZ1xuICAgICAgICBnZXRBbGxSZXNwb25zZUhlYWRlcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBzdGF0ZSA9PT0gMiA/IHJlc3BvbnNlSGVhZGVyc1N0cmluZyA6IG51bGw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gQ2FjaGVzIHRoZSBoZWFkZXJcbiAgICAgICAgc2V0UmVxdWVzdEhlYWRlcjogZnVuY3Rpb24oIG5hbWUsIHZhbHVlICkge1xuICAgICAgICAgIHZhciBsbmFtZSA9IG5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICBpZiAoICFzdGF0ZSApIHtcbiAgICAgICAgICAgIG5hbWUgPSByZXF1ZXN0SGVhZGVyc05hbWVzWyBsbmFtZSBdID0gcmVxdWVzdEhlYWRlcnNOYW1lc1sgbG5hbWUgXSB8fCBuYW1lO1xuICAgICAgICAgICAgcmVxdWVzdEhlYWRlcnNbIG5hbWUgXSA9IHZhbHVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBPdmVycmlkZXMgcmVzcG9uc2UgY29udGVudC10eXBlIGhlYWRlclxuICAgICAgICBvdmVycmlkZU1pbWVUeXBlOiBmdW5jdGlvbiggdHlwZSApIHtcbiAgICAgICAgICBpZiAoICFzdGF0ZSApIHtcbiAgICAgICAgICAgIHMubWltZVR5cGUgPSB0eXBlO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBTdGF0dXMtZGVwZW5kZW50IGNhbGxiYWNrc1xuICAgICAgICBzdGF0dXNDb2RlOiBmdW5jdGlvbiggbWFwICkge1xuICAgICAgICAgIHZhciBjb2RlO1xuICAgICAgICAgIGlmICggbWFwICkge1xuICAgICAgICAgICAgaWYgKCBzdGF0ZSA8IDIgKSB7XG4gICAgICAgICAgICAgIGZvciAoIGNvZGUgaW4gbWFwICkge1xuICAgICAgICAgICAgICAgIC8vIExhenktYWRkIHRoZSBuZXcgY2FsbGJhY2sgaW4gYSB3YXkgdGhhdCBwcmVzZXJ2ZXMgb2xkIG9uZXNcbiAgICAgICAgICAgICAgICBzdGF0dXNDb2RlWyBjb2RlIF0gPSBbIHN0YXR1c0NvZGVbIGNvZGUgXSwgbWFwWyBjb2RlIF0gXTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gRXhlY3V0ZSB0aGUgYXBwcm9wcmlhdGUgY2FsbGJhY2tzXG4gICAgICAgICAgICAgIGpxWEhSLmFsd2F5cyggbWFwWyBqcVhIUi5zdGF0dXMgXSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBDYW5jZWwgdGhlIHJlcXVlc3RcbiAgICAgICAgYWJvcnQ6IGZ1bmN0aW9uKCBzdGF0dXNUZXh0ICkge1xuICAgICAgICAgIHZhciBmaW5hbFRleHQgPSBzdGF0dXNUZXh0IHx8IHN0ckFib3J0O1xuICAgICAgICAgIGlmICggdHJhbnNwb3J0ICkge1xuICAgICAgICAgICAgdHJhbnNwb3J0LmFib3J0KCBmaW5hbFRleHQgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZG9uZSggMCwgZmluYWxUZXh0ICk7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAvLyBBdHRhY2ggZGVmZXJyZWRzXG4gICAgZGVmZXJyZWQucHJvbWlzZSgganFYSFIgKS5jb21wbGV0ZSA9IGNvbXBsZXRlRGVmZXJyZWQuYWRkO1xuICAgIGpxWEhSLnN1Y2Nlc3MgPSBqcVhIUi5kb25lO1xuICAgIGpxWEhSLmVycm9yID0ganFYSFIuZmFpbDtcblxuICAgIC8vIFJlbW92ZSBoYXNoIGNoYXJhY3RlciAoIzc1MzE6IGFuZCBzdHJpbmcgcHJvbW90aW9uKVxuICAgIC8vIEFkZCBwcm90b2NvbCBpZiBub3QgcHJvdmlkZWQgKCM1ODY2OiBJRTcgaXNzdWUgd2l0aCBwcm90b2NvbC1sZXNzIHVybHMpXG4gICAgLy8gSGFuZGxlIGZhbHN5IHVybCBpbiB0aGUgc2V0dGluZ3Mgb2JqZWN0ICgjMTAwOTM6IGNvbnNpc3RlbmN5IHdpdGggb2xkIHNpZ25hdHVyZSlcbiAgICAvLyBXZSBhbHNvIHVzZSB0aGUgdXJsIHBhcmFtZXRlciBpZiBhdmFpbGFibGVcbiAgICBzLnVybCA9ICggKCB1cmwgfHwgcy51cmwgfHwgYWpheExvY2F0aW9uICkgKyBcIlwiICkucmVwbGFjZSggcmhhc2gsIFwiXCIgKS5yZXBsYWNlKCBycHJvdG9jb2wsIGFqYXhMb2NQYXJ0c1sgMSBdICsgXCIvL1wiICk7XG5cbiAgICAvLyBBbGlhcyBtZXRob2Qgb3B0aW9uIHRvIHR5cGUgYXMgcGVyIHRpY2tldCAjMTIwMDRcbiAgICBzLnR5cGUgPSBvcHRpb25zLm1ldGhvZCB8fCBvcHRpb25zLnR5cGUgfHwgcy5tZXRob2QgfHwgcy50eXBlO1xuXG4gICAgLy8gRXh0cmFjdCBkYXRhVHlwZXMgbGlzdFxuICAgIHMuZGF0YVR5cGVzID0galF1ZXJ5LnRyaW0oIHMuZGF0YVR5cGUgfHwgXCIqXCIgKS50b0xvd2VyQ2FzZSgpLm1hdGNoKCBjb3JlX3Jub3R3aGl0ZSApIHx8IFtcIlwiXTtcblxuICAgIC8vIEEgY3Jvc3MtZG9tYWluIHJlcXVlc3QgaXMgaW4gb3JkZXIgd2hlbiB3ZSBoYXZlIGEgcHJvdG9jb2w6aG9zdDpwb3J0IG1pc21hdGNoXG4gICAgaWYgKCBzLmNyb3NzRG9tYWluID09IG51bGwgKSB7XG4gICAgICBwYXJ0cyA9IHJ1cmwuZXhlYyggcy51cmwudG9Mb3dlckNhc2UoKSApO1xuICAgICAgcy5jcm9zc0RvbWFpbiA9ICEhKCBwYXJ0cyAmJlxuICAgICAgICAoIHBhcnRzWyAxIF0gIT09IGFqYXhMb2NQYXJ0c1sgMSBdIHx8IHBhcnRzWyAyIF0gIT09IGFqYXhMb2NQYXJ0c1sgMiBdIHx8XG4gICAgICAgICAgKCBwYXJ0c1sgMyBdIHx8ICggcGFydHNbIDEgXSA9PT0gXCJodHRwOlwiID8gXCI4MFwiIDogXCI0NDNcIiApICkgIT09XG4gICAgICAgICAgICAoIGFqYXhMb2NQYXJ0c1sgMyBdIHx8ICggYWpheExvY1BhcnRzWyAxIF0gPT09IFwiaHR0cDpcIiA/IFwiODBcIiA6IFwiNDQzXCIgKSApIClcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gQ29udmVydCBkYXRhIGlmIG5vdCBhbHJlYWR5IGEgc3RyaW5nXG4gICAgaWYgKCBzLmRhdGEgJiYgcy5wcm9jZXNzRGF0YSAmJiB0eXBlb2Ygcy5kYXRhICE9PSBcInN0cmluZ1wiICkge1xuICAgICAgcy5kYXRhID0galF1ZXJ5LnBhcmFtKCBzLmRhdGEsIHMudHJhZGl0aW9uYWwgKTtcbiAgICB9XG5cbiAgICAvLyBBcHBseSBwcmVmaWx0ZXJzXG4gICAgaW5zcGVjdFByZWZpbHRlcnNPclRyYW5zcG9ydHMoIHByZWZpbHRlcnMsIHMsIG9wdGlvbnMsIGpxWEhSICk7XG5cbiAgICAvLyBJZiByZXF1ZXN0IHdhcyBhYm9ydGVkIGluc2lkZSBhIHByZWZpbHRlciwgc3RvcCB0aGVyZVxuICAgIGlmICggc3RhdGUgPT09IDIgKSB7XG4gICAgICByZXR1cm4ganFYSFI7XG4gICAgfVxuXG4gICAgLy8gV2UgY2FuIGZpcmUgZ2xvYmFsIGV2ZW50cyBhcyBvZiBub3cgaWYgYXNrZWQgdG9cbiAgICBmaXJlR2xvYmFscyA9IHMuZ2xvYmFsO1xuXG4gICAgLy8gV2F0Y2ggZm9yIGEgbmV3IHNldCBvZiByZXF1ZXN0c1xuICAgIGlmICggZmlyZUdsb2JhbHMgJiYgalF1ZXJ5LmFjdGl2ZSsrID09PSAwICkge1xuICAgICAgalF1ZXJ5LmV2ZW50LnRyaWdnZXIoXCJhamF4U3RhcnRcIik7XG4gICAgfVxuXG4gICAgLy8gVXBwZXJjYXNlIHRoZSB0eXBlXG4gICAgcy50eXBlID0gcy50eXBlLnRvVXBwZXJDYXNlKCk7XG5cbiAgICAvLyBEZXRlcm1pbmUgaWYgcmVxdWVzdCBoYXMgY29udGVudFxuICAgIHMuaGFzQ29udGVudCA9ICFybm9Db250ZW50LnRlc3QoIHMudHlwZSApO1xuXG4gICAgLy8gU2F2ZSB0aGUgVVJMIGluIGNhc2Ugd2UncmUgdG95aW5nIHdpdGggdGhlIElmLU1vZGlmaWVkLVNpbmNlXG4gICAgLy8gYW5kL29yIElmLU5vbmUtTWF0Y2ggaGVhZGVyIGxhdGVyIG9uXG4gICAgY2FjaGVVUkwgPSBzLnVybDtcblxuICAgIC8vIE1vcmUgb3B0aW9ucyBoYW5kbGluZyBmb3IgcmVxdWVzdHMgd2l0aCBubyBjb250ZW50XG4gICAgaWYgKCAhcy5oYXNDb250ZW50ICkge1xuXG4gICAgICAvLyBJZiBkYXRhIGlzIGF2YWlsYWJsZSwgYXBwZW5kIGRhdGEgdG8gdXJsXG4gICAgICBpZiAoIHMuZGF0YSApIHtcbiAgICAgICAgY2FjaGVVUkwgPSAoIHMudXJsICs9ICggYWpheF9ycXVlcnkudGVzdCggY2FjaGVVUkwgKSA/IFwiJlwiIDogXCI/XCIgKSArIHMuZGF0YSApO1xuICAgICAgICAvLyAjOTY4MjogcmVtb3ZlIGRhdGEgc28gdGhhdCBpdCdzIG5vdCB1c2VkIGluIGFuIGV2ZW50dWFsIHJldHJ5XG4gICAgICAgIGRlbGV0ZSBzLmRhdGE7XG4gICAgICB9XG5cbiAgICAgIC8vIEFkZCBhbnRpLWNhY2hlIGluIHVybCBpZiBuZWVkZWRcbiAgICAgIGlmICggcy5jYWNoZSA9PT0gZmFsc2UgKSB7XG4gICAgICAgIHMudXJsID0gcnRzLnRlc3QoIGNhY2hlVVJMICkgP1xuXG4gICAgICAgICAgLy8gSWYgdGhlcmUgaXMgYWxyZWFkeSBhICdfJyBwYXJhbWV0ZXIsIHNldCBpdHMgdmFsdWVcbiAgICAgICAgICBjYWNoZVVSTC5yZXBsYWNlKCBydHMsIFwiJDFfPVwiICsgYWpheF9ub25jZSsrICkgOlxuXG4gICAgICAgICAgLy8gT3RoZXJ3aXNlIGFkZCBvbmUgdG8gdGhlIGVuZFxuICAgICAgICAgIGNhY2hlVVJMICsgKCBhamF4X3JxdWVyeS50ZXN0KCBjYWNoZVVSTCApID8gXCImXCIgOiBcIj9cIiApICsgXCJfPVwiICsgYWpheF9ub25jZSsrO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFNldCB0aGUgSWYtTW9kaWZpZWQtU2luY2UgYW5kL29yIElmLU5vbmUtTWF0Y2ggaGVhZGVyLCBpZiBpbiBpZk1vZGlmaWVkIG1vZGUuXG4gICAgaWYgKCBzLmlmTW9kaWZpZWQgKSB7XG4gICAgICBpZiAoIGpRdWVyeS5sYXN0TW9kaWZpZWRbIGNhY2hlVVJMIF0gKSB7XG4gICAgICAgIGpxWEhSLnNldFJlcXVlc3RIZWFkZXIoIFwiSWYtTW9kaWZpZWQtU2luY2VcIiwgalF1ZXJ5Lmxhc3RNb2RpZmllZFsgY2FjaGVVUkwgXSApO1xuICAgICAgfVxuICAgICAgaWYgKCBqUXVlcnkuZXRhZ1sgY2FjaGVVUkwgXSApIHtcbiAgICAgICAganFYSFIuc2V0UmVxdWVzdEhlYWRlciggXCJJZi1Ob25lLU1hdGNoXCIsIGpRdWVyeS5ldGFnWyBjYWNoZVVSTCBdICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gU2V0IHRoZSBjb3JyZWN0IGhlYWRlciwgaWYgZGF0YSBpcyBiZWluZyBzZW50XG4gICAgaWYgKCBzLmRhdGEgJiYgcy5oYXNDb250ZW50ICYmIHMuY29udGVudFR5cGUgIT09IGZhbHNlIHx8IG9wdGlvbnMuY29udGVudFR5cGUgKSB7XG4gICAgICBqcVhIUi5zZXRSZXF1ZXN0SGVhZGVyKCBcIkNvbnRlbnQtVHlwZVwiLCBzLmNvbnRlbnRUeXBlICk7XG4gICAgfVxuXG4gICAgLy8gU2V0IHRoZSBBY2NlcHRzIGhlYWRlciBmb3IgdGhlIHNlcnZlciwgZGVwZW5kaW5nIG9uIHRoZSBkYXRhVHlwZVxuICAgIGpxWEhSLnNldFJlcXVlc3RIZWFkZXIoXG4gICAgICBcIkFjY2VwdFwiLFxuICAgICAgcy5kYXRhVHlwZXNbIDAgXSAmJiBzLmFjY2VwdHNbIHMuZGF0YVR5cGVzWzBdIF0gP1xuICAgICAgICBzLmFjY2VwdHNbIHMuZGF0YVR5cGVzWzBdIF0gKyAoIHMuZGF0YVR5cGVzWyAwIF0gIT09IFwiKlwiID8gXCIsIFwiICsgYWxsVHlwZXMgKyBcIjsgcT0wLjAxXCIgOiBcIlwiICkgOlxuICAgICAgICBzLmFjY2VwdHNbIFwiKlwiIF1cbiAgICApO1xuXG4gICAgLy8gQ2hlY2sgZm9yIGhlYWRlcnMgb3B0aW9uXG4gICAgZm9yICggaSBpbiBzLmhlYWRlcnMgKSB7XG4gICAgICBqcVhIUi5zZXRSZXF1ZXN0SGVhZGVyKCBpLCBzLmhlYWRlcnNbIGkgXSApO1xuICAgIH1cblxuICAgIC8vIEFsbG93IGN1c3RvbSBoZWFkZXJzL21pbWV0eXBlcyBhbmQgZWFybHkgYWJvcnRcbiAgICBpZiAoIHMuYmVmb3JlU2VuZCAmJiAoIHMuYmVmb3JlU2VuZC5jYWxsKCBjYWxsYmFja0NvbnRleHQsIGpxWEhSLCBzICkgPT09IGZhbHNlIHx8IHN0YXRlID09PSAyICkgKSB7XG4gICAgICAvLyBBYm9ydCBpZiBub3QgZG9uZSBhbHJlYWR5IGFuZCByZXR1cm5cbiAgICAgIHJldHVybiBqcVhIUi5hYm9ydCgpO1xuICAgIH1cblxuICAgIC8vIGFib3J0aW5nIGlzIG5vIGxvbmdlciBhIGNhbmNlbGxhdGlvblxuICAgIHN0ckFib3J0ID0gXCJhYm9ydFwiO1xuXG4gICAgLy8gSW5zdGFsbCBjYWxsYmFja3Mgb24gZGVmZXJyZWRzXG4gICAgZm9yICggaSBpbiB7IHN1Y2Nlc3M6IDEsIGVycm9yOiAxLCBjb21wbGV0ZTogMSB9ICkge1xuICAgICAganFYSFJbIGkgXSggc1sgaSBdICk7XG4gICAgfVxuXG4gICAgLy8gR2V0IHRyYW5zcG9ydFxuICAgIHRyYW5zcG9ydCA9IGluc3BlY3RQcmVmaWx0ZXJzT3JUcmFuc3BvcnRzKCB0cmFuc3BvcnRzLCBzLCBvcHRpb25zLCBqcVhIUiApO1xuXG4gICAgLy8gSWYgbm8gdHJhbnNwb3J0LCB3ZSBhdXRvLWFib3J0XG4gICAgaWYgKCAhdHJhbnNwb3J0ICkge1xuICAgICAgZG9uZSggLTEsIFwiTm8gVHJhbnNwb3J0XCIgKTtcbiAgICB9IGVsc2Uge1xuICAgICAganFYSFIucmVhZHlTdGF0ZSA9IDE7XG5cbiAgICAgIC8vIFNlbmQgZ2xvYmFsIGV2ZW50XG4gICAgICBpZiAoIGZpcmVHbG9iYWxzICkge1xuICAgICAgICBnbG9iYWxFdmVudENvbnRleHQudHJpZ2dlciggXCJhamF4U2VuZFwiLCBbIGpxWEhSLCBzIF0gKTtcbiAgICAgIH1cbiAgICAgIC8vIFRpbWVvdXRcbiAgICAgIGlmICggcy5hc3luYyAmJiBzLnRpbWVvdXQgPiAwICkge1xuICAgICAgICB0aW1lb3V0VGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGpxWEhSLmFib3J0KFwidGltZW91dFwiKTtcbiAgICAgICAgfSwgcy50aW1lb3V0ICk7XG4gICAgICB9XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIHN0YXRlID0gMTtcbiAgICAgICAgdHJhbnNwb3J0LnNlbmQoIHJlcXVlc3RIZWFkZXJzLCBkb25lICk7XG4gICAgICB9IGNhdGNoICggZSApIHtcbiAgICAgICAgLy8gUHJvcGFnYXRlIGV4Y2VwdGlvbiBhcyBlcnJvciBpZiBub3QgZG9uZVxuICAgICAgICBpZiAoIHN0YXRlIDwgMiApIHtcbiAgICAgICAgICBkb25lKCAtMSwgZSApO1xuICAgICAgICAvLyBTaW1wbHkgcmV0aHJvdyBvdGhlcndpc2VcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ2FsbGJhY2sgZm9yIHdoZW4gZXZlcnl0aGluZyBpcyBkb25lXG4gICAgZnVuY3Rpb24gZG9uZSggc3RhdHVzLCBuYXRpdmVTdGF0dXNUZXh0LCByZXNwb25zZXMsIGhlYWRlcnMgKSB7XG4gICAgICB2YXIgaXNTdWNjZXNzLCBzdWNjZXNzLCBlcnJvciwgcmVzcG9uc2UsIG1vZGlmaWVkLFxuICAgICAgICBzdGF0dXNUZXh0ID0gbmF0aXZlU3RhdHVzVGV4dDtcblxuICAgICAgLy8gQ2FsbGVkIG9uY2VcbiAgICAgIGlmICggc3RhdGUgPT09IDIgKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gU3RhdGUgaXMgXCJkb25lXCIgbm93XG4gICAgICBzdGF0ZSA9IDI7XG5cbiAgICAgIC8vIENsZWFyIHRpbWVvdXQgaWYgaXQgZXhpc3RzXG4gICAgICBpZiAoIHRpbWVvdXRUaW1lciApIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KCB0aW1lb3V0VGltZXIgKTtcbiAgICAgIH1cblxuICAgICAgLy8gRGVyZWZlcmVuY2UgdHJhbnNwb3J0IGZvciBlYXJseSBnYXJiYWdlIGNvbGxlY3Rpb25cbiAgICAgIC8vIChubyBtYXR0ZXIgaG93IGxvbmcgdGhlIGpxWEhSIG9iamVjdCB3aWxsIGJlIHVzZWQpXG4gICAgICB0cmFuc3BvcnQgPSB1bmRlZmluZWQ7XG5cbiAgICAgIC8vIENhY2hlIHJlc3BvbnNlIGhlYWRlcnNcbiAgICAgIHJlc3BvbnNlSGVhZGVyc1N0cmluZyA9IGhlYWRlcnMgfHwgXCJcIjtcblxuICAgICAgLy8gU2V0IHJlYWR5U3RhdGVcbiAgICAgIGpxWEhSLnJlYWR5U3RhdGUgPSBzdGF0dXMgPiAwID8gNCA6IDA7XG5cbiAgICAgIC8vIERldGVybWluZSBpZiBzdWNjZXNzZnVsXG4gICAgICBpc1N1Y2Nlc3MgPSBzdGF0dXMgPj0gMjAwICYmIHN0YXR1cyA8IDMwMCB8fCBzdGF0dXMgPT09IDMwNDtcblxuICAgICAgLy8gR2V0IHJlc3BvbnNlIGRhdGFcbiAgICAgIGlmICggcmVzcG9uc2VzICkge1xuICAgICAgICByZXNwb25zZSA9IGFqYXhIYW5kbGVSZXNwb25zZXMoIHMsIGpxWEhSLCByZXNwb25zZXMgKTtcbiAgICAgIH1cblxuICAgICAgLy8gQ29udmVydCBubyBtYXR0ZXIgd2hhdCAodGhhdCB3YXkgcmVzcG9uc2VYWFggZmllbGRzIGFyZSBhbHdheXMgc2V0KVxuICAgICAgcmVzcG9uc2UgPSBhamF4Q29udmVydCggcywgcmVzcG9uc2UsIGpxWEhSLCBpc1N1Y2Nlc3MgKTtcblxuICAgICAgLy8gSWYgc3VjY2Vzc2Z1bCwgaGFuZGxlIHR5cGUgY2hhaW5pbmdcbiAgICAgIGlmICggaXNTdWNjZXNzICkge1xuXG4gICAgICAgIC8vIFNldCB0aGUgSWYtTW9kaWZpZWQtU2luY2UgYW5kL29yIElmLU5vbmUtTWF0Y2ggaGVhZGVyLCBpZiBpbiBpZk1vZGlmaWVkIG1vZGUuXG4gICAgICAgIGlmICggcy5pZk1vZGlmaWVkICkge1xuICAgICAgICAgIG1vZGlmaWVkID0ganFYSFIuZ2V0UmVzcG9uc2VIZWFkZXIoXCJMYXN0LU1vZGlmaWVkXCIpO1xuICAgICAgICAgIGlmICggbW9kaWZpZWQgKSB7XG4gICAgICAgICAgICBqUXVlcnkubGFzdE1vZGlmaWVkWyBjYWNoZVVSTCBdID0gbW9kaWZpZWQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIG1vZGlmaWVkID0ganFYSFIuZ2V0UmVzcG9uc2VIZWFkZXIoXCJldGFnXCIpO1xuICAgICAgICAgIGlmICggbW9kaWZpZWQgKSB7XG4gICAgICAgICAgICBqUXVlcnkuZXRhZ1sgY2FjaGVVUkwgXSA9IG1vZGlmaWVkO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIG5vIGNvbnRlbnRcbiAgICAgICAgaWYgKCBzdGF0dXMgPT09IDIwNCB8fCBzLnR5cGUgPT09IFwiSEVBRFwiICkge1xuICAgICAgICAgIHN0YXR1c1RleHQgPSBcIm5vY29udGVudFwiO1xuXG4gICAgICAgIC8vIGlmIG5vdCBtb2RpZmllZFxuICAgICAgICB9IGVsc2UgaWYgKCBzdGF0dXMgPT09IDMwNCApIHtcbiAgICAgICAgICBzdGF0dXNUZXh0ID0gXCJub3Rtb2RpZmllZFwiO1xuXG4gICAgICAgIC8vIElmIHdlIGhhdmUgZGF0YSwgbGV0J3MgY29udmVydCBpdFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0YXR1c1RleHQgPSByZXNwb25zZS5zdGF0ZTtcbiAgICAgICAgICBzdWNjZXNzID0gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICBlcnJvciA9IHJlc3BvbnNlLmVycm9yO1xuICAgICAgICAgIGlzU3VjY2VzcyA9ICFlcnJvcjtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gV2UgZXh0cmFjdCBlcnJvciBmcm9tIHN0YXR1c1RleHRcbiAgICAgICAgLy8gdGhlbiBub3JtYWxpemUgc3RhdHVzVGV4dCBhbmQgc3RhdHVzIGZvciBub24tYWJvcnRzXG4gICAgICAgIGVycm9yID0gc3RhdHVzVGV4dDtcbiAgICAgICAgaWYgKCBzdGF0dXMgfHwgIXN0YXR1c1RleHQgKSB7XG4gICAgICAgICAgc3RhdHVzVGV4dCA9IFwiZXJyb3JcIjtcbiAgICAgICAgICBpZiAoIHN0YXR1cyA8IDAgKSB7XG4gICAgICAgICAgICBzdGF0dXMgPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBTZXQgZGF0YSBmb3IgdGhlIGZha2UgeGhyIG9iamVjdFxuICAgICAganFYSFIuc3RhdHVzID0gc3RhdHVzO1xuICAgICAganFYSFIuc3RhdHVzVGV4dCA9ICggbmF0aXZlU3RhdHVzVGV4dCB8fCBzdGF0dXNUZXh0ICkgKyBcIlwiO1xuXG4gICAgICAvLyBTdWNjZXNzL0Vycm9yXG4gICAgICBpZiAoIGlzU3VjY2VzcyApIHtcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZVdpdGgoIGNhbGxiYWNrQ29udGV4dCwgWyBzdWNjZXNzLCBzdGF0dXNUZXh0LCBqcVhIUiBdICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3RXaXRoKCBjYWxsYmFja0NvbnRleHQsIFsganFYSFIsIHN0YXR1c1RleHQsIGVycm9yIF0gKTtcbiAgICAgIH1cblxuICAgICAgLy8gU3RhdHVzLWRlcGVuZGVudCBjYWxsYmFja3NcbiAgICAgIGpxWEhSLnN0YXR1c0NvZGUoIHN0YXR1c0NvZGUgKTtcbiAgICAgIHN0YXR1c0NvZGUgPSB1bmRlZmluZWQ7XG5cbiAgICAgIGlmICggZmlyZUdsb2JhbHMgKSB7XG4gICAgICAgIGdsb2JhbEV2ZW50Q29udGV4dC50cmlnZ2VyKCBpc1N1Y2Nlc3MgPyBcImFqYXhTdWNjZXNzXCIgOiBcImFqYXhFcnJvclwiLFxuICAgICAgICAgIFsganFYSFIsIHMsIGlzU3VjY2VzcyA/IHN1Y2Nlc3MgOiBlcnJvciBdICk7XG4gICAgICB9XG5cbiAgICAgIC8vIENvbXBsZXRlXG4gICAgICBjb21wbGV0ZURlZmVycmVkLmZpcmVXaXRoKCBjYWxsYmFja0NvbnRleHQsIFsganFYSFIsIHN0YXR1c1RleHQgXSApO1xuXG4gICAgICBpZiAoIGZpcmVHbG9iYWxzICkge1xuICAgICAgICBnbG9iYWxFdmVudENvbnRleHQudHJpZ2dlciggXCJhamF4Q29tcGxldGVcIiwgWyBqcVhIUiwgcyBdICk7XG4gICAgICAgIC8vIEhhbmRsZSB0aGUgZ2xvYmFsIEFKQVggY291bnRlclxuICAgICAgICBpZiAoICEoIC0talF1ZXJ5LmFjdGl2ZSApICkge1xuICAgICAgICAgIGpRdWVyeS5ldmVudC50cmlnZ2VyKFwiYWpheFN0b3BcIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ganFYSFI7XG4gIH0sXG5cbiAgZ2V0SlNPTjogZnVuY3Rpb24oIHVybCwgZGF0YSwgY2FsbGJhY2sgKSB7XG4gICAgcmV0dXJuIGpRdWVyeS5nZXQoIHVybCwgZGF0YSwgY2FsbGJhY2ssIFwianNvblwiICk7XG4gIH0sXG5cbiAgZ2V0U2NyaXB0OiBmdW5jdGlvbiggdXJsLCBjYWxsYmFjayApIHtcbiAgICByZXR1cm4galF1ZXJ5LmdldCggdXJsLCB1bmRlZmluZWQsIGNhbGxiYWNrLCBcInNjcmlwdFwiICk7XG4gIH1cbn0pO1xuXG5qUXVlcnkuZWFjaCggWyBcImdldFwiLCBcInBvc3RcIiBdLCBmdW5jdGlvbiggaSwgbWV0aG9kICkge1xuICBqUXVlcnlbIG1ldGhvZCBdID0gZnVuY3Rpb24oIHVybCwgZGF0YSwgY2FsbGJhY2ssIHR5cGUgKSB7XG4gICAgLy8gc2hpZnQgYXJndW1lbnRzIGlmIGRhdGEgYXJndW1lbnQgd2FzIG9taXR0ZWRcbiAgICBpZiAoIGpRdWVyeS5pc0Z1bmN0aW9uKCBkYXRhICkgKSB7XG4gICAgICB0eXBlID0gdHlwZSB8fCBjYWxsYmFjaztcbiAgICAgIGNhbGxiYWNrID0gZGF0YTtcbiAgICAgIGRhdGEgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIGpRdWVyeS5hamF4KHtcbiAgICAgIHVybDogdXJsLFxuICAgICAgdHlwZTogbWV0aG9kLFxuICAgICAgZGF0YVR5cGU6IHR5cGUsXG4gICAgICBkYXRhOiBkYXRhLFxuICAgICAgc3VjY2VzczogY2FsbGJhY2tcbiAgICB9KTtcbiAgfTtcbn0pO1xuXG4vKiBIYW5kbGVzIHJlc3BvbnNlcyB0byBhbiBhamF4IHJlcXVlc3Q6XG4gKiAtIGZpbmRzIHRoZSByaWdodCBkYXRhVHlwZSAobWVkaWF0ZXMgYmV0d2VlbiBjb250ZW50LXR5cGUgYW5kIGV4cGVjdGVkIGRhdGFUeXBlKVxuICogLSByZXR1cm5zIHRoZSBjb3JyZXNwb25kaW5nIHJlc3BvbnNlXG4gKi9cbmZ1bmN0aW9uIGFqYXhIYW5kbGVSZXNwb25zZXMoIHMsIGpxWEhSLCByZXNwb25zZXMgKSB7XG4gIHZhciBmaXJzdERhdGFUeXBlLCBjdCwgZmluYWxEYXRhVHlwZSwgdHlwZSxcbiAgICBjb250ZW50cyA9IHMuY29udGVudHMsXG4gICAgZGF0YVR5cGVzID0gcy5kYXRhVHlwZXM7XG5cbiAgLy8gUmVtb3ZlIGF1dG8gZGF0YVR5cGUgYW5kIGdldCBjb250ZW50LXR5cGUgaW4gdGhlIHByb2Nlc3NcbiAgd2hpbGUoIGRhdGFUeXBlc1sgMCBdID09PSBcIipcIiApIHtcbiAgICBkYXRhVHlwZXMuc2hpZnQoKTtcbiAgICBpZiAoIGN0ID09PSB1bmRlZmluZWQgKSB7XG4gICAgICBjdCA9IHMubWltZVR5cGUgfHwganFYSFIuZ2V0UmVzcG9uc2VIZWFkZXIoXCJDb250ZW50LVR5cGVcIik7XG4gICAgfVxuICB9XG5cbiAgLy8gQ2hlY2sgaWYgd2UncmUgZGVhbGluZyB3aXRoIGEga25vd24gY29udGVudC10eXBlXG4gIGlmICggY3QgKSB7XG4gICAgZm9yICggdHlwZSBpbiBjb250ZW50cyApIHtcbiAgICAgIGlmICggY29udGVudHNbIHR5cGUgXSAmJiBjb250ZW50c1sgdHlwZSBdLnRlc3QoIGN0ICkgKSB7XG4gICAgICAgIGRhdGFUeXBlcy51bnNoaWZ0KCB0eXBlICk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIENoZWNrIHRvIHNlZSBpZiB3ZSBoYXZlIGEgcmVzcG9uc2UgZm9yIHRoZSBleHBlY3RlZCBkYXRhVHlwZVxuICBpZiAoIGRhdGFUeXBlc1sgMCBdIGluIHJlc3BvbnNlcyApIHtcbiAgICBmaW5hbERhdGFUeXBlID0gZGF0YVR5cGVzWyAwIF07XG4gIH0gZWxzZSB7XG4gICAgLy8gVHJ5IGNvbnZlcnRpYmxlIGRhdGFUeXBlc1xuICAgIGZvciAoIHR5cGUgaW4gcmVzcG9uc2VzICkge1xuICAgICAgaWYgKCAhZGF0YVR5cGVzWyAwIF0gfHwgcy5jb252ZXJ0ZXJzWyB0eXBlICsgXCIgXCIgKyBkYXRhVHlwZXNbMF0gXSApIHtcbiAgICAgICAgZmluYWxEYXRhVHlwZSA9IHR5cGU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgaWYgKCAhZmlyc3REYXRhVHlwZSApIHtcbiAgICAgICAgZmlyc3REYXRhVHlwZSA9IHR5cGU7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIE9yIGp1c3QgdXNlIGZpcnN0IG9uZVxuICAgIGZpbmFsRGF0YVR5cGUgPSBmaW5hbERhdGFUeXBlIHx8IGZpcnN0RGF0YVR5cGU7XG4gIH1cblxuICAvLyBJZiB3ZSBmb3VuZCBhIGRhdGFUeXBlXG4gIC8vIFdlIGFkZCB0aGUgZGF0YVR5cGUgdG8gdGhlIGxpc3QgaWYgbmVlZGVkXG4gIC8vIGFuZCByZXR1cm4gdGhlIGNvcnJlc3BvbmRpbmcgcmVzcG9uc2VcbiAgaWYgKCBmaW5hbERhdGFUeXBlICkge1xuICAgIGlmICggZmluYWxEYXRhVHlwZSAhPT0gZGF0YVR5cGVzWyAwIF0gKSB7XG4gICAgICBkYXRhVHlwZXMudW5zaGlmdCggZmluYWxEYXRhVHlwZSApO1xuICAgIH1cbiAgICByZXR1cm4gcmVzcG9uc2VzWyBmaW5hbERhdGFUeXBlIF07XG4gIH1cbn1cblxuLyogQ2hhaW4gY29udmVyc2lvbnMgZ2l2ZW4gdGhlIHJlcXVlc3QgYW5kIHRoZSBvcmlnaW5hbCByZXNwb25zZVxuICogQWxzbyBzZXRzIHRoZSByZXNwb25zZVhYWCBmaWVsZHMgb24gdGhlIGpxWEhSIGluc3RhbmNlXG4gKi9cbmZ1bmN0aW9uIGFqYXhDb252ZXJ0KCBzLCByZXNwb25zZSwganFYSFIsIGlzU3VjY2VzcyApIHtcbiAgdmFyIGNvbnYyLCBjdXJyZW50LCBjb252LCB0bXAsIHByZXYsXG4gICAgY29udmVydGVycyA9IHt9LFxuICAgIC8vIFdvcmsgd2l0aCBhIGNvcHkgb2YgZGF0YVR5cGVzIGluIGNhc2Ugd2UgbmVlZCB0byBtb2RpZnkgaXQgZm9yIGNvbnZlcnNpb25cbiAgICBkYXRhVHlwZXMgPSBzLmRhdGFUeXBlcy5zbGljZSgpO1xuXG4gIC8vIENyZWF0ZSBjb252ZXJ0ZXJzIG1hcCB3aXRoIGxvd2VyY2FzZWQga2V5c1xuICBpZiAoIGRhdGFUeXBlc1sgMSBdICkge1xuICAgIGZvciAoIGNvbnYgaW4gcy5jb252ZXJ0ZXJzICkge1xuICAgICAgY29udmVydGVyc1sgY29udi50b0xvd2VyQ2FzZSgpIF0gPSBzLmNvbnZlcnRlcnNbIGNvbnYgXTtcbiAgICB9XG4gIH1cblxuICBjdXJyZW50ID0gZGF0YVR5cGVzLnNoaWZ0KCk7XG5cbiAgLy8gQ29udmVydCB0byBlYWNoIHNlcXVlbnRpYWwgZGF0YVR5cGVcbiAgd2hpbGUgKCBjdXJyZW50ICkge1xuXG4gICAgaWYgKCBzLnJlc3BvbnNlRmllbGRzWyBjdXJyZW50IF0gKSB7XG4gICAgICBqcVhIUlsgcy5yZXNwb25zZUZpZWxkc1sgY3VycmVudCBdIF0gPSByZXNwb25zZTtcbiAgICB9XG5cbiAgICAvLyBBcHBseSB0aGUgZGF0YUZpbHRlciBpZiBwcm92aWRlZFxuICAgIGlmICggIXByZXYgJiYgaXNTdWNjZXNzICYmIHMuZGF0YUZpbHRlciApIHtcbiAgICAgIHJlc3BvbnNlID0gcy5kYXRhRmlsdGVyKCByZXNwb25zZSwgcy5kYXRhVHlwZSApO1xuICAgIH1cblxuICAgIHByZXYgPSBjdXJyZW50O1xuICAgIGN1cnJlbnQgPSBkYXRhVHlwZXMuc2hpZnQoKTtcblxuICAgIGlmICggY3VycmVudCApIHtcblxuICAgICAgLy8gVGhlcmUncyBvbmx5IHdvcmsgdG8gZG8gaWYgY3VycmVudCBkYXRhVHlwZSBpcyBub24tYXV0b1xuICAgICAgaWYgKCBjdXJyZW50ID09PSBcIipcIiApIHtcblxuICAgICAgICBjdXJyZW50ID0gcHJldjtcblxuICAgICAgLy8gQ29udmVydCByZXNwb25zZSBpZiBwcmV2IGRhdGFUeXBlIGlzIG5vbi1hdXRvIGFuZCBkaWZmZXJzIGZyb20gY3VycmVudFxuICAgICAgfSBlbHNlIGlmICggcHJldiAhPT0gXCIqXCIgJiYgcHJldiAhPT0gY3VycmVudCApIHtcblxuICAgICAgICAvLyBTZWVrIGEgZGlyZWN0IGNvbnZlcnRlclxuICAgICAgICBjb252ID0gY29udmVydGVyc1sgcHJldiArIFwiIFwiICsgY3VycmVudCBdIHx8IGNvbnZlcnRlcnNbIFwiKiBcIiArIGN1cnJlbnQgXTtcblxuICAgICAgICAvLyBJZiBub25lIGZvdW5kLCBzZWVrIGEgcGFpclxuICAgICAgICBpZiAoICFjb252ICkge1xuICAgICAgICAgIGZvciAoIGNvbnYyIGluIGNvbnZlcnRlcnMgKSB7XG5cbiAgICAgICAgICAgIC8vIElmIGNvbnYyIG91dHB1dHMgY3VycmVudFxuICAgICAgICAgICAgdG1wID0gY29udjIuc3BsaXQoIFwiIFwiICk7XG4gICAgICAgICAgICBpZiAoIHRtcFsgMSBdID09PSBjdXJyZW50ICkge1xuXG4gICAgICAgICAgICAgIC8vIElmIHByZXYgY2FuIGJlIGNvbnZlcnRlZCB0byBhY2NlcHRlZCBpbnB1dFxuICAgICAgICAgICAgICBjb252ID0gY29udmVydGVyc1sgcHJldiArIFwiIFwiICsgdG1wWyAwIF0gXSB8fFxuICAgICAgICAgICAgICAgIGNvbnZlcnRlcnNbIFwiKiBcIiArIHRtcFsgMCBdIF07XG4gICAgICAgICAgICAgIGlmICggY29udiApIHtcbiAgICAgICAgICAgICAgICAvLyBDb25kZW5zZSBlcXVpdmFsZW5jZSBjb252ZXJ0ZXJzXG4gICAgICAgICAgICAgICAgaWYgKCBjb252ID09PSB0cnVlICkge1xuICAgICAgICAgICAgICAgICAgY29udiA9IGNvbnZlcnRlcnNbIGNvbnYyIF07XG5cbiAgICAgICAgICAgICAgICAvLyBPdGhlcndpc2UsIGluc2VydCB0aGUgaW50ZXJtZWRpYXRlIGRhdGFUeXBlXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICggY29udmVydGVyc1sgY29udjIgXSAhPT0gdHJ1ZSApIHtcbiAgICAgICAgICAgICAgICAgIGN1cnJlbnQgPSB0bXBbIDAgXTtcbiAgICAgICAgICAgICAgICAgIGRhdGFUeXBlcy51bnNoaWZ0KCB0bXBbIDEgXSApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFwcGx5IGNvbnZlcnRlciAoaWYgbm90IGFuIGVxdWl2YWxlbmNlKVxuICAgICAgICBpZiAoIGNvbnYgIT09IHRydWUgKSB7XG5cbiAgICAgICAgICAvLyBVbmxlc3MgZXJyb3JzIGFyZSBhbGxvd2VkIHRvIGJ1YmJsZSwgY2F0Y2ggYW5kIHJldHVybiB0aGVtXG4gICAgICAgICAgaWYgKCBjb252ICYmIHNbIFwidGhyb3dzXCIgXSApIHtcbiAgICAgICAgICAgIHJlc3BvbnNlID0gY29udiggcmVzcG9uc2UgKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgcmVzcG9uc2UgPSBjb252KCByZXNwb25zZSApO1xuICAgICAgICAgICAgfSBjYXRjaCAoIGUgKSB7XG4gICAgICAgICAgICAgIHJldHVybiB7IHN0YXRlOiBcInBhcnNlcmVycm9yXCIsIGVycm9yOiBjb252ID8gZSA6IFwiTm8gY29udmVyc2lvbiBmcm9tIFwiICsgcHJldiArIFwiIHRvIFwiICsgY3VycmVudCB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7IHN0YXRlOiBcInN1Y2Nlc3NcIiwgZGF0YTogcmVzcG9uc2UgfTtcbn1cbi8vIEluc3RhbGwgc2NyaXB0IGRhdGFUeXBlXG5qUXVlcnkuYWpheFNldHVwKHtcbiAgYWNjZXB0czoge1xuICAgIHNjcmlwdDogXCJ0ZXh0L2phdmFzY3JpcHQsIGFwcGxpY2F0aW9uL2phdmFzY3JpcHQsIGFwcGxpY2F0aW9uL2VjbWFzY3JpcHQsIGFwcGxpY2F0aW9uL3gtZWNtYXNjcmlwdFwiXG4gIH0sXG4gIGNvbnRlbnRzOiB7XG4gICAgc2NyaXB0OiAvKD86amF2YXxlY21hKXNjcmlwdC9cbiAgfSxcbiAgY29udmVydGVyczoge1xuICAgIFwidGV4dCBzY3JpcHRcIjogZnVuY3Rpb24oIHRleHQgKSB7XG4gICAgICBqUXVlcnkuZ2xvYmFsRXZhbCggdGV4dCApO1xuICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuICB9XG59KTtcblxuLy8gSGFuZGxlIGNhY2hlJ3Mgc3BlY2lhbCBjYXNlIGFuZCBnbG9iYWxcbmpRdWVyeS5hamF4UHJlZmlsdGVyKCBcInNjcmlwdFwiLCBmdW5jdGlvbiggcyApIHtcbiAgaWYgKCBzLmNhY2hlID09PSB1bmRlZmluZWQgKSB7XG4gICAgcy5jYWNoZSA9IGZhbHNlO1xuICB9XG4gIGlmICggcy5jcm9zc0RvbWFpbiApIHtcbiAgICBzLnR5cGUgPSBcIkdFVFwiO1xuICAgIHMuZ2xvYmFsID0gZmFsc2U7XG4gIH1cbn0pO1xuXG4vLyBCaW5kIHNjcmlwdCB0YWcgaGFjayB0cmFuc3BvcnRcbmpRdWVyeS5hamF4VHJhbnNwb3J0KCBcInNjcmlwdFwiLCBmdW5jdGlvbihzKSB7XG5cbiAgLy8gVGhpcyB0cmFuc3BvcnQgb25seSBkZWFscyB3aXRoIGNyb3NzIGRvbWFpbiByZXF1ZXN0c1xuICBpZiAoIHMuY3Jvc3NEb21haW4gKSB7XG5cbiAgICB2YXIgc2NyaXB0LFxuICAgICAgaGVhZCA9IGRvY3VtZW50LmhlYWQgfHwgalF1ZXJ5KFwiaGVhZFwiKVswXSB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG5cbiAgICByZXR1cm4ge1xuXG4gICAgICBzZW5kOiBmdW5jdGlvbiggXywgY2FsbGJhY2sgKSB7XG5cbiAgICAgICAgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKTtcblxuICAgICAgICBzY3JpcHQuYXN5bmMgPSB0cnVlO1xuXG4gICAgICAgIGlmICggcy5zY3JpcHRDaGFyc2V0ICkge1xuICAgICAgICAgIHNjcmlwdC5jaGFyc2V0ID0gcy5zY3JpcHRDaGFyc2V0O1xuICAgICAgICB9XG5cbiAgICAgICAgc2NyaXB0LnNyYyA9IHMudXJsO1xuXG4gICAgICAgIC8vIEF0dGFjaCBoYW5kbGVycyBmb3IgYWxsIGJyb3dzZXJzXG4gICAgICAgIHNjcmlwdC5vbmxvYWQgPSBzY3JpcHQub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oIF8sIGlzQWJvcnQgKSB7XG5cbiAgICAgICAgICBpZiAoIGlzQWJvcnQgfHwgIXNjcmlwdC5yZWFkeVN0YXRlIHx8IC9sb2FkZWR8Y29tcGxldGUvLnRlc3QoIHNjcmlwdC5yZWFkeVN0YXRlICkgKSB7XG5cbiAgICAgICAgICAgIC8vIEhhbmRsZSBtZW1vcnkgbGVhayBpbiBJRVxuICAgICAgICAgICAgc2NyaXB0Lm9ubG9hZCA9IHNjcmlwdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBudWxsO1xuXG4gICAgICAgICAgICAvLyBSZW1vdmUgdGhlIHNjcmlwdFxuICAgICAgICAgICAgaWYgKCBzY3JpcHQucGFyZW50Tm9kZSApIHtcbiAgICAgICAgICAgICAgc2NyaXB0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoIHNjcmlwdCApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBEZXJlZmVyZW5jZSB0aGUgc2NyaXB0XG4gICAgICAgICAgICBzY3JpcHQgPSBudWxsO1xuXG4gICAgICAgICAgICAvLyBDYWxsYmFjayBpZiBub3QgYWJvcnRcbiAgICAgICAgICAgIGlmICggIWlzQWJvcnQgKSB7XG4gICAgICAgICAgICAgIGNhbGxiYWNrKCAyMDAsIFwic3VjY2Vzc1wiICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIENpcmN1bXZlbnQgSUU2IGJ1Z3Mgd2l0aCBiYXNlIGVsZW1lbnRzICgjMjcwOSBhbmQgIzQzNzgpIGJ5IHByZXBlbmRpbmdcbiAgICAgICAgLy8gVXNlIG5hdGl2ZSBET00gbWFuaXB1bGF0aW9uIHRvIGF2b2lkIG91ciBkb21NYW5pcCBBSkFYIHRyaWNrZXJ5XG4gICAgICAgIGhlYWQuaW5zZXJ0QmVmb3JlKCBzY3JpcHQsIGhlYWQuZmlyc3RDaGlsZCApO1xuICAgICAgfSxcblxuICAgICAgYWJvcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIHNjcmlwdCApIHtcbiAgICAgICAgICBzY3JpcHQub25sb2FkKCB1bmRlZmluZWQsIHRydWUgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cbn0pO1xudmFyIG9sZENhbGxiYWNrcyA9IFtdLFxuICByanNvbnAgPSAvKD0pXFw/KD89JnwkKXxcXD9cXD8vO1xuXG4vLyBEZWZhdWx0IGpzb25wIHNldHRpbmdzXG5qUXVlcnkuYWpheFNldHVwKHtcbiAganNvbnA6IFwiY2FsbGJhY2tcIixcbiAganNvbnBDYWxsYmFjazogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNhbGxiYWNrID0gb2xkQ2FsbGJhY2tzLnBvcCgpIHx8ICggalF1ZXJ5LmV4cGFuZG8gKyBcIl9cIiArICggYWpheF9ub25jZSsrICkgKTtcbiAgICB0aGlzWyBjYWxsYmFjayBdID0gdHJ1ZTtcbiAgICByZXR1cm4gY2FsbGJhY2s7XG4gIH1cbn0pO1xuXG4vLyBEZXRlY3QsIG5vcm1hbGl6ZSBvcHRpb25zIGFuZCBpbnN0YWxsIGNhbGxiYWNrcyBmb3IganNvbnAgcmVxdWVzdHNcbmpRdWVyeS5hamF4UHJlZmlsdGVyKCBcImpzb24ganNvbnBcIiwgZnVuY3Rpb24oIHMsIG9yaWdpbmFsU2V0dGluZ3MsIGpxWEhSICkge1xuXG4gIHZhciBjYWxsYmFja05hbWUsIG92ZXJ3cml0dGVuLCByZXNwb25zZUNvbnRhaW5lcixcbiAgICBqc29uUHJvcCA9IHMuanNvbnAgIT09IGZhbHNlICYmICggcmpzb25wLnRlc3QoIHMudXJsICkgP1xuICAgICAgXCJ1cmxcIiA6XG4gICAgICB0eXBlb2Ygcy5kYXRhID09PSBcInN0cmluZ1wiICYmICEoIHMuY29udGVudFR5cGUgfHwgXCJcIiApLmluZGV4T2YoXCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRcIikgJiYgcmpzb25wLnRlc3QoIHMuZGF0YSApICYmIFwiZGF0YVwiXG4gICAgKTtcblxuICAvLyBIYW5kbGUgaWZmIHRoZSBleHBlY3RlZCBkYXRhIHR5cGUgaXMgXCJqc29ucFwiIG9yIHdlIGhhdmUgYSBwYXJhbWV0ZXIgdG8gc2V0XG4gIGlmICgganNvblByb3AgfHwgcy5kYXRhVHlwZXNbIDAgXSA9PT0gXCJqc29ucFwiICkge1xuXG4gICAgLy8gR2V0IGNhbGxiYWNrIG5hbWUsIHJlbWVtYmVyaW5nIHByZWV4aXN0aW5nIHZhbHVlIGFzc29jaWF0ZWQgd2l0aCBpdFxuICAgIGNhbGxiYWNrTmFtZSA9IHMuanNvbnBDYWxsYmFjayA9IGpRdWVyeS5pc0Z1bmN0aW9uKCBzLmpzb25wQ2FsbGJhY2sgKSA/XG4gICAgICBzLmpzb25wQ2FsbGJhY2soKSA6XG4gICAgICBzLmpzb25wQ2FsbGJhY2s7XG5cbiAgICAvLyBJbnNlcnQgY2FsbGJhY2sgaW50byB1cmwgb3IgZm9ybSBkYXRhXG4gICAgaWYgKCBqc29uUHJvcCApIHtcbiAgICAgIHNbIGpzb25Qcm9wIF0gPSBzWyBqc29uUHJvcCBdLnJlcGxhY2UoIHJqc29ucCwgXCIkMVwiICsgY2FsbGJhY2tOYW1lICk7XG4gICAgfSBlbHNlIGlmICggcy5qc29ucCAhPT0gZmFsc2UgKSB7XG4gICAgICBzLnVybCArPSAoIGFqYXhfcnF1ZXJ5LnRlc3QoIHMudXJsICkgPyBcIiZcIiA6IFwiP1wiICkgKyBzLmpzb25wICsgXCI9XCIgKyBjYWxsYmFja05hbWU7XG4gICAgfVxuXG4gICAgLy8gVXNlIGRhdGEgY29udmVydGVyIHRvIHJldHJpZXZlIGpzb24gYWZ0ZXIgc2NyaXB0IGV4ZWN1dGlvblxuICAgIHMuY29udmVydGVyc1tcInNjcmlwdCBqc29uXCJdID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoICFyZXNwb25zZUNvbnRhaW5lciApIHtcbiAgICAgICAgalF1ZXJ5LmVycm9yKCBjYWxsYmFja05hbWUgKyBcIiB3YXMgbm90IGNhbGxlZFwiICk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzcG9uc2VDb250YWluZXJbIDAgXTtcbiAgICB9O1xuXG4gICAgLy8gZm9yY2UganNvbiBkYXRhVHlwZVxuICAgIHMuZGF0YVR5cGVzWyAwIF0gPSBcImpzb25cIjtcblxuICAgIC8vIEluc3RhbGwgY2FsbGJhY2tcbiAgICBvdmVyd3JpdHRlbiA9IHdpbmRvd1sgY2FsbGJhY2tOYW1lIF07XG4gICAgd2luZG93WyBjYWxsYmFja05hbWUgXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmVzcG9uc2VDb250YWluZXIgPSBhcmd1bWVudHM7XG4gICAgfTtcblxuICAgIC8vIENsZWFuLXVwIGZ1bmN0aW9uIChmaXJlcyBhZnRlciBjb252ZXJ0ZXJzKVxuICAgIGpxWEhSLmFsd2F5cyhmdW5jdGlvbigpIHtcbiAgICAgIC8vIFJlc3RvcmUgcHJlZXhpc3RpbmcgdmFsdWVcbiAgICAgIHdpbmRvd1sgY2FsbGJhY2tOYW1lIF0gPSBvdmVyd3JpdHRlbjtcblxuICAgICAgLy8gU2F2ZSBiYWNrIGFzIGZyZWVcbiAgICAgIGlmICggc1sgY2FsbGJhY2tOYW1lIF0gKSB7XG4gICAgICAgIC8vIG1ha2Ugc3VyZSB0aGF0IHJlLXVzaW5nIHRoZSBvcHRpb25zIGRvZXNuJ3Qgc2NyZXcgdGhpbmdzIGFyb3VuZFxuICAgICAgICBzLmpzb25wQ2FsbGJhY2sgPSBvcmlnaW5hbFNldHRpbmdzLmpzb25wQ2FsbGJhY2s7XG5cbiAgICAgICAgLy8gc2F2ZSB0aGUgY2FsbGJhY2sgbmFtZSBmb3IgZnV0dXJlIHVzZVxuICAgICAgICBvbGRDYWxsYmFja3MucHVzaCggY2FsbGJhY2tOYW1lICk7XG4gICAgICB9XG5cbiAgICAgIC8vIENhbGwgaWYgaXQgd2FzIGEgZnVuY3Rpb24gYW5kIHdlIGhhdmUgYSByZXNwb25zZVxuICAgICAgaWYgKCByZXNwb25zZUNvbnRhaW5lciAmJiBqUXVlcnkuaXNGdW5jdGlvbiggb3ZlcndyaXR0ZW4gKSApIHtcbiAgICAgICAgb3ZlcndyaXR0ZW4oIHJlc3BvbnNlQ29udGFpbmVyWyAwIF0gKTtcbiAgICAgIH1cblxuICAgICAgcmVzcG9uc2VDb250YWluZXIgPSBvdmVyd3JpdHRlbiA9IHVuZGVmaW5lZDtcbiAgICB9KTtcblxuICAgIC8vIERlbGVnYXRlIHRvIHNjcmlwdFxuICAgIHJldHVybiBcInNjcmlwdFwiO1xuICB9XG59KTtcbnZhciB4aHJDYWxsYmFja3MsIHhoclN1cHBvcnRlZCxcbiAgeGhySWQgPSAwLFxuICAvLyAjNTI4MDogSW50ZXJuZXQgRXhwbG9yZXIgd2lsbCBrZWVwIGNvbm5lY3Rpb25zIGFsaXZlIGlmIHdlIGRvbid0IGFib3J0IG9uIHVubG9hZFxuICB4aHJPblVubG9hZEFib3J0ID0gd2luZG93LkFjdGl2ZVhPYmplY3QgJiYgZnVuY3Rpb24oKSB7XG4gICAgLy8gQWJvcnQgYWxsIHBlbmRpbmcgcmVxdWVzdHNcbiAgICB2YXIga2V5O1xuICAgIGZvciAoIGtleSBpbiB4aHJDYWxsYmFja3MgKSB7XG4gICAgICB4aHJDYWxsYmFja3NbIGtleSBdKCB1bmRlZmluZWQsIHRydWUgKTtcbiAgICB9XG4gIH07XG5cbi8vIEZ1bmN0aW9ucyB0byBjcmVhdGUgeGhyc1xuZnVuY3Rpb24gY3JlYXRlU3RhbmRhcmRYSFIoKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIG5ldyB3aW5kb3cuWE1MSHR0cFJlcXVlc3QoKTtcbiAgfSBjYXRjaCggZSApIHt9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUFjdGl2ZVhIUigpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gbmV3IHdpbmRvdy5BY3RpdmVYT2JqZWN0KFwiTWljcm9zb2Z0LlhNTEhUVFBcIik7XG4gIH0gY2F0Y2goIGUgKSB7fVxufVxuXG4vLyBDcmVhdGUgdGhlIHJlcXVlc3Qgb2JqZWN0XG4vLyAoVGhpcyBpcyBzdGlsbCBhdHRhY2hlZCB0byBhamF4U2V0dGluZ3MgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHkpXG5qUXVlcnkuYWpheFNldHRpbmdzLnhociA9IHdpbmRvdy5BY3RpdmVYT2JqZWN0ID9cbiAgLyogTWljcm9zb2Z0IGZhaWxlZCB0byBwcm9wZXJseVxuICAgKiBpbXBsZW1lbnQgdGhlIFhNTEh0dHBSZXF1ZXN0IGluIElFNyAoY2FuJ3QgcmVxdWVzdCBsb2NhbCBmaWxlcyksXG4gICAqIHNvIHdlIHVzZSB0aGUgQWN0aXZlWE9iamVjdCB3aGVuIGl0IGlzIGF2YWlsYWJsZVxuICAgKiBBZGRpdGlvbmFsbHkgWE1MSHR0cFJlcXVlc3QgY2FuIGJlIGRpc2FibGVkIGluIElFNy9JRTggc29cbiAgICogd2UgbmVlZCBhIGZhbGxiYWNrLlxuICAgKi9cbiAgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICF0aGlzLmlzTG9jYWwgJiYgY3JlYXRlU3RhbmRhcmRYSFIoKSB8fCBjcmVhdGVBY3RpdmVYSFIoKTtcbiAgfSA6XG4gIC8vIEZvciBhbGwgb3RoZXIgYnJvd3NlcnMsIHVzZSB0aGUgc3RhbmRhcmQgWE1MSHR0cFJlcXVlc3Qgb2JqZWN0XG4gIGNyZWF0ZVN0YW5kYXJkWEhSO1xuXG4vLyBEZXRlcm1pbmUgc3VwcG9ydCBwcm9wZXJ0aWVzXG54aHJTdXBwb3J0ZWQgPSBqUXVlcnkuYWpheFNldHRpbmdzLnhocigpO1xualF1ZXJ5LnN1cHBvcnQuY29ycyA9ICEheGhyU3VwcG9ydGVkICYmICggXCJ3aXRoQ3JlZGVudGlhbHNcIiBpbiB4aHJTdXBwb3J0ZWQgKTtcbnhoclN1cHBvcnRlZCA9IGpRdWVyeS5zdXBwb3J0LmFqYXggPSAhIXhoclN1cHBvcnRlZDtcblxuLy8gQ3JlYXRlIHRyYW5zcG9ydCBpZiB0aGUgYnJvd3NlciBjYW4gcHJvdmlkZSBhbiB4aHJcbmlmICggeGhyU3VwcG9ydGVkICkge1xuXG4gIGpRdWVyeS5hamF4VHJhbnNwb3J0KGZ1bmN0aW9uKCBzICkge1xuICAgIC8vIENyb3NzIGRvbWFpbiBvbmx5IGFsbG93ZWQgaWYgc3VwcG9ydGVkIHRocm91Z2ggWE1MSHR0cFJlcXVlc3RcbiAgICBpZiAoICFzLmNyb3NzRG9tYWluIHx8IGpRdWVyeS5zdXBwb3J0LmNvcnMgKSB7XG5cbiAgICAgIHZhciBjYWxsYmFjaztcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc2VuZDogZnVuY3Rpb24oIGhlYWRlcnMsIGNvbXBsZXRlICkge1xuXG4gICAgICAgICAgLy8gR2V0IGEgbmV3IHhoclxuICAgICAgICAgIHZhciBoYW5kbGUsIGksXG4gICAgICAgICAgICB4aHIgPSBzLnhocigpO1xuXG4gICAgICAgICAgLy8gT3BlbiB0aGUgc29ja2V0XG4gICAgICAgICAgLy8gUGFzc2luZyBudWxsIHVzZXJuYW1lLCBnZW5lcmF0ZXMgYSBsb2dpbiBwb3B1cCBvbiBPcGVyYSAoIzI4NjUpXG4gICAgICAgICAgaWYgKCBzLnVzZXJuYW1lICkge1xuICAgICAgICAgICAgeGhyLm9wZW4oIHMudHlwZSwgcy51cmwsIHMuYXN5bmMsIHMudXNlcm5hbWUsIHMucGFzc3dvcmQgKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgeGhyLm9wZW4oIHMudHlwZSwgcy51cmwsIHMuYXN5bmMgKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBBcHBseSBjdXN0b20gZmllbGRzIGlmIHByb3ZpZGVkXG4gICAgICAgICAgaWYgKCBzLnhockZpZWxkcyApIHtcbiAgICAgICAgICAgIGZvciAoIGkgaW4gcy54aHJGaWVsZHMgKSB7XG4gICAgICAgICAgICAgIHhoclsgaSBdID0gcy54aHJGaWVsZHNbIGkgXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBPdmVycmlkZSBtaW1lIHR5cGUgaWYgbmVlZGVkXG4gICAgICAgICAgaWYgKCBzLm1pbWVUeXBlICYmIHhoci5vdmVycmlkZU1pbWVUeXBlICkge1xuICAgICAgICAgICAgeGhyLm92ZXJyaWRlTWltZVR5cGUoIHMubWltZVR5cGUgKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBYLVJlcXVlc3RlZC1XaXRoIGhlYWRlclxuICAgICAgICAgIC8vIEZvciBjcm9zcy1kb21haW4gcmVxdWVzdHMsIHNlZWluZyBhcyBjb25kaXRpb25zIGZvciBhIHByZWZsaWdodCBhcmVcbiAgICAgICAgICAvLyBha2luIHRvIGEgamlnc2F3IHB1enpsZSwgd2Ugc2ltcGx5IG5ldmVyIHNldCBpdCB0byBiZSBzdXJlLlxuICAgICAgICAgIC8vIChpdCBjYW4gYWx3YXlzIGJlIHNldCBvbiBhIHBlci1yZXF1ZXN0IGJhc2lzIG9yIGV2ZW4gdXNpbmcgYWpheFNldHVwKVxuICAgICAgICAgIC8vIEZvciBzYW1lLWRvbWFpbiByZXF1ZXN0cywgd29uJ3QgY2hhbmdlIGhlYWRlciBpZiBhbHJlYWR5IHByb3ZpZGVkLlxuICAgICAgICAgIGlmICggIXMuY3Jvc3NEb21haW4gJiYgIWhlYWRlcnNbXCJYLVJlcXVlc3RlZC1XaXRoXCJdICkge1xuICAgICAgICAgICAgaGVhZGVyc1tcIlgtUmVxdWVzdGVkLVdpdGhcIl0gPSBcIlhNTEh0dHBSZXF1ZXN0XCI7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gTmVlZCBhbiBleHRyYSB0cnkvY2F0Y2ggZm9yIGNyb3NzIGRvbWFpbiByZXF1ZXN0cyBpbiBGaXJlZm94IDNcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgZm9yICggaSBpbiBoZWFkZXJzICkge1xuICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlciggaSwgaGVhZGVyc1sgaSBdICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBjYXRjaCggZXJyICkge31cblxuICAgICAgICAgIC8vIERvIHNlbmQgdGhlIHJlcXVlc3RcbiAgICAgICAgICAvLyBUaGlzIG1heSByYWlzZSBhbiBleGNlcHRpb24gd2hpY2ggaXMgYWN0dWFsbHlcbiAgICAgICAgICAvLyBoYW5kbGVkIGluIGpRdWVyeS5hamF4IChzbyBubyB0cnkvY2F0Y2ggaGVyZSlcbiAgICAgICAgICB4aHIuc2VuZCggKCBzLmhhc0NvbnRlbnQgJiYgcy5kYXRhICkgfHwgbnVsbCApO1xuXG4gICAgICAgICAgLy8gTGlzdGVuZXJcbiAgICAgICAgICBjYWxsYmFjayA9IGZ1bmN0aW9uKCBfLCBpc0Fib3J0ICkge1xuICAgICAgICAgICAgdmFyIHN0YXR1cywgcmVzcG9uc2VIZWFkZXJzLCBzdGF0dXNUZXh0LCByZXNwb25zZXM7XG5cbiAgICAgICAgICAgIC8vIEZpcmVmb3ggdGhyb3dzIGV4Y2VwdGlvbnMgd2hlbiBhY2Nlc3NpbmcgcHJvcGVydGllc1xuICAgICAgICAgICAgLy8gb2YgYW4geGhyIHdoZW4gYSBuZXR3b3JrIGVycm9yIG9jY3VycmVkXG4gICAgICAgICAgICAvLyBodHRwOi8vaGVscGZ1bC5rbm9icy1kaWFscy5jb20vaW5kZXgucGhwL0NvbXBvbmVudF9yZXR1cm5lZF9mYWlsdXJlX2NvZGU6XzB4ODAwNDAxMTFfKE5TX0VSUk9SX05PVF9BVkFJTEFCTEUpXG4gICAgICAgICAgICB0cnkge1xuXG4gICAgICAgICAgICAgIC8vIFdhcyBuZXZlciBjYWxsZWQgYW5kIGlzIGFib3J0ZWQgb3IgY29tcGxldGVcbiAgICAgICAgICAgICAgaWYgKCBjYWxsYmFjayAmJiAoIGlzQWJvcnQgfHwgeGhyLnJlYWR5U3RhdGUgPT09IDQgKSApIHtcblxuICAgICAgICAgICAgICAgIC8vIE9ubHkgY2FsbGVkIG9uY2VcbiAgICAgICAgICAgICAgICBjYWxsYmFjayA9IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgICAgIC8vIERvIG5vdCBrZWVwIGFzIGFjdGl2ZSBhbnltb3JlXG4gICAgICAgICAgICAgICAgaWYgKCBoYW5kbGUgKSB7XG4gICAgICAgICAgICAgICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0galF1ZXJ5Lm5vb3A7XG4gICAgICAgICAgICAgICAgICBpZiAoIHhock9uVW5sb2FkQWJvcnQgKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB4aHJDYWxsYmFja3NbIGhhbmRsZSBdO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIElmIGl0J3MgYW4gYWJvcnRcbiAgICAgICAgICAgICAgICBpZiAoIGlzQWJvcnQgKSB7XG4gICAgICAgICAgICAgICAgICAvLyBBYm9ydCBpdCBtYW51YWxseSBpZiBuZWVkZWRcbiAgICAgICAgICAgICAgICAgIGlmICggeGhyLnJlYWR5U3RhdGUgIT09IDQgKSB7XG4gICAgICAgICAgICAgICAgICAgIHhoci5hYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICByZXNwb25zZXMgPSB7fTtcbiAgICAgICAgICAgICAgICAgIHN0YXR1cyA9IHhoci5zdGF0dXM7XG4gICAgICAgICAgICAgICAgICByZXNwb25zZUhlYWRlcnMgPSB4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCk7XG5cbiAgICAgICAgICAgICAgICAgIC8vIFdoZW4gcmVxdWVzdGluZyBiaW5hcnkgZGF0YSwgSUU2LTkgd2lsbCB0aHJvdyBhbiBleGNlcHRpb25cbiAgICAgICAgICAgICAgICAgIC8vIG9uIGFueSBhdHRlbXB0IHRvIGFjY2VzcyByZXNwb25zZVRleHQgKCMxMTQyNilcbiAgICAgICAgICAgICAgICAgIGlmICggdHlwZW9mIHhoci5yZXNwb25zZVRleHQgPT09IFwic3RyaW5nXCIgKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlcy50ZXh0ID0geGhyLnJlc3BvbnNlVGV4dDtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgLy8gRmlyZWZveCB0aHJvd3MgYW4gZXhjZXB0aW9uIHdoZW4gYWNjZXNzaW5nXG4gICAgICAgICAgICAgICAgICAvLyBzdGF0dXNUZXh0IGZvciBmYXVsdHkgY3Jvc3MtZG9tYWluIHJlcXVlc3RzXG4gICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXNUZXh0ID0geGhyLnN0YXR1c1RleHQ7XG4gICAgICAgICAgICAgICAgICB9IGNhdGNoKCBlICkge1xuICAgICAgICAgICAgICAgICAgICAvLyBXZSBub3JtYWxpemUgd2l0aCBXZWJraXQgZ2l2aW5nIGFuIGVtcHR5IHN0YXR1c1RleHRcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzVGV4dCA9IFwiXCI7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIC8vIEZpbHRlciBzdGF0dXMgZm9yIG5vbiBzdGFuZGFyZCBiZWhhdmlvcnNcblxuICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlIHJlcXVlc3QgaXMgbG9jYWwgYW5kIHdlIGhhdmUgZGF0YTogYXNzdW1lIGEgc3VjY2Vzc1xuICAgICAgICAgICAgICAgICAgLy8gKHN1Y2Nlc3Mgd2l0aCBubyBkYXRhIHdvbid0IGdldCBub3RpZmllZCwgdGhhdCdzIHRoZSBiZXN0IHdlXG4gICAgICAgICAgICAgICAgICAvLyBjYW4gZG8gZ2l2ZW4gY3VycmVudCBpbXBsZW1lbnRhdGlvbnMpXG4gICAgICAgICAgICAgICAgICBpZiAoICFzdGF0dXMgJiYgcy5pc0xvY2FsICYmICFzLmNyb3NzRG9tYWluICkge1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMgPSByZXNwb25zZXMudGV4dCA/IDIwMCA6IDQwNDtcbiAgICAgICAgICAgICAgICAgIC8vIElFIC0gIzE0NTA6IHNvbWV0aW1lcyByZXR1cm5zIDEyMjMgd2hlbiBpdCBzaG91bGQgYmUgMjA0XG4gICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCBzdGF0dXMgPT09IDEyMjMgKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cyA9IDIwNDtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2goIGZpcmVmb3hBY2Nlc3NFeGNlcHRpb24gKSB7XG4gICAgICAgICAgICAgIGlmICggIWlzQWJvcnQgKSB7XG4gICAgICAgICAgICAgICAgY29tcGxldGUoIC0xLCBmaXJlZm94QWNjZXNzRXhjZXB0aW9uICk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQ2FsbCBjb21wbGV0ZSBpZiBuZWVkZWRcbiAgICAgICAgICAgIGlmICggcmVzcG9uc2VzICkge1xuICAgICAgICAgICAgICBjb21wbGV0ZSggc3RhdHVzLCBzdGF0dXNUZXh0LCByZXNwb25zZXMsIHJlc3BvbnNlSGVhZGVycyApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG5cbiAgICAgICAgICBpZiAoICFzLmFzeW5jICkge1xuICAgICAgICAgICAgLy8gaWYgd2UncmUgaW4gc3luYyBtb2RlIHdlIGZpcmUgdGhlIGNhbGxiYWNrXG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoIHhoci5yZWFkeVN0YXRlID09PSA0ICkge1xuICAgICAgICAgICAgLy8gKElFNiAmIElFNykgaWYgaXQncyBpbiBjYWNoZSBhbmQgaGFzIGJlZW5cbiAgICAgICAgICAgIC8vIHJldHJpZXZlZCBkaXJlY3RseSB3ZSBuZWVkIHRvIGZpcmUgdGhlIGNhbGxiYWNrXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCBjYWxsYmFjayApO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBoYW5kbGUgPSArK3hocklkO1xuICAgICAgICAgICAgaWYgKCB4aHJPblVubG9hZEFib3J0ICkge1xuICAgICAgICAgICAgICAvLyBDcmVhdGUgdGhlIGFjdGl2ZSB4aHJzIGNhbGxiYWNrcyBsaXN0IGlmIG5lZWRlZFxuICAgICAgICAgICAgICAvLyBhbmQgYXR0YWNoIHRoZSB1bmxvYWQgaGFuZGxlclxuICAgICAgICAgICAgICBpZiAoICF4aHJDYWxsYmFja3MgKSB7XG4gICAgICAgICAgICAgICAgeGhyQ2FsbGJhY2tzID0ge307XG4gICAgICAgICAgICAgICAgalF1ZXJ5KCB3aW5kb3cgKS51bmxvYWQoIHhock9uVW5sb2FkQWJvcnQgKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAvLyBBZGQgdG8gbGlzdCBvZiBhY3RpdmUgeGhycyBjYWxsYmFja3NcbiAgICAgICAgICAgICAgeGhyQ2FsbGJhY2tzWyBoYW5kbGUgXSA9IGNhbGxiYWNrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGNhbGxiYWNrO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBhYm9ydDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKCBjYWxsYmFjayApIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKCB1bmRlZmluZWQsIHRydWUgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuICB9KTtcbn1cbnZhciBmeE5vdywgdGltZXJJZCxcbiAgcmZ4dHlwZXMgPSAvXig/OnRvZ2dsZXxzaG93fGhpZGUpJC8sXG4gIHJmeG51bSA9IG5ldyBSZWdFeHAoIFwiXig/OihbKy1dKT18KShcIiArIGNvcmVfcG51bSArIFwiKShbYS16JV0qKSRcIiwgXCJpXCIgKSxcbiAgcnJ1biA9IC9xdWV1ZUhvb2tzJC8sXG4gIGFuaW1hdGlvblByZWZpbHRlcnMgPSBbIGRlZmF1bHRQcmVmaWx0ZXIgXSxcbiAgdHdlZW5lcnMgPSB7XG4gICAgXCIqXCI6IFtmdW5jdGlvbiggcHJvcCwgdmFsdWUgKSB7XG4gICAgICB2YXIgdHdlZW4gPSB0aGlzLmNyZWF0ZVR3ZWVuKCBwcm9wLCB2YWx1ZSApLFxuICAgICAgICB0YXJnZXQgPSB0d2Vlbi5jdXIoKSxcbiAgICAgICAgcGFydHMgPSByZnhudW0uZXhlYyggdmFsdWUgKSxcbiAgICAgICAgdW5pdCA9IHBhcnRzICYmIHBhcnRzWyAzIF0gfHwgKCBqUXVlcnkuY3NzTnVtYmVyWyBwcm9wIF0gPyBcIlwiIDogXCJweFwiICksXG5cbiAgICAgICAgLy8gU3RhcnRpbmcgdmFsdWUgY29tcHV0YXRpb24gaXMgcmVxdWlyZWQgZm9yIHBvdGVudGlhbCB1bml0IG1pc21hdGNoZXNcbiAgICAgICAgc3RhcnQgPSAoIGpRdWVyeS5jc3NOdW1iZXJbIHByb3AgXSB8fCB1bml0ICE9PSBcInB4XCIgJiYgK3RhcmdldCApICYmXG4gICAgICAgICAgcmZ4bnVtLmV4ZWMoIGpRdWVyeS5jc3MoIHR3ZWVuLmVsZW0sIHByb3AgKSApLFxuICAgICAgICBzY2FsZSA9IDEsXG4gICAgICAgIG1heEl0ZXJhdGlvbnMgPSAyMDtcblxuICAgICAgaWYgKCBzdGFydCAmJiBzdGFydFsgMyBdICE9PSB1bml0ICkge1xuICAgICAgICAvLyBUcnVzdCB1bml0cyByZXBvcnRlZCBieSBqUXVlcnkuY3NzXG4gICAgICAgIHVuaXQgPSB1bml0IHx8IHN0YXJ0WyAzIF07XG5cbiAgICAgICAgLy8gTWFrZSBzdXJlIHdlIHVwZGF0ZSB0aGUgdHdlZW4gcHJvcGVydGllcyBsYXRlciBvblxuICAgICAgICBwYXJ0cyA9IHBhcnRzIHx8IFtdO1xuXG4gICAgICAgIC8vIEl0ZXJhdGl2ZWx5IGFwcHJveGltYXRlIGZyb20gYSBub256ZXJvIHN0YXJ0aW5nIHBvaW50XG4gICAgICAgIHN0YXJ0ID0gK3RhcmdldCB8fCAxO1xuXG4gICAgICAgIGRvIHtcbiAgICAgICAgICAvLyBJZiBwcmV2aW91cyBpdGVyYXRpb24gemVyb2VkIG91dCwgZG91YmxlIHVudGlsIHdlIGdldCAqc29tZXRoaW5nKlxuICAgICAgICAgIC8vIFVzZSBhIHN0cmluZyBmb3IgZG91YmxpbmcgZmFjdG9yIHNvIHdlIGRvbid0IGFjY2lkZW50YWxseSBzZWUgc2NhbGUgYXMgdW5jaGFuZ2VkIGJlbG93XG4gICAgICAgICAgc2NhbGUgPSBzY2FsZSB8fCBcIi41XCI7XG5cbiAgICAgICAgICAvLyBBZGp1c3QgYW5kIGFwcGx5XG4gICAgICAgICAgc3RhcnQgPSBzdGFydCAvIHNjYWxlO1xuICAgICAgICAgIGpRdWVyeS5zdHlsZSggdHdlZW4uZWxlbSwgcHJvcCwgc3RhcnQgKyB1bml0ICk7XG5cbiAgICAgICAgLy8gVXBkYXRlIHNjYWxlLCB0b2xlcmF0aW5nIHplcm8gb3IgTmFOIGZyb20gdHdlZW4uY3VyKClcbiAgICAgICAgLy8gQW5kIGJyZWFraW5nIHRoZSBsb29wIGlmIHNjYWxlIGlzIHVuY2hhbmdlZCBvciBwZXJmZWN0LCBvciBpZiB3ZSd2ZSBqdXN0IGhhZCBlbm91Z2hcbiAgICAgICAgfSB3aGlsZSAoIHNjYWxlICE9PSAoc2NhbGUgPSB0d2Vlbi5jdXIoKSAvIHRhcmdldCkgJiYgc2NhbGUgIT09IDEgJiYgLS1tYXhJdGVyYXRpb25zICk7XG4gICAgICB9XG5cbiAgICAgIC8vIFVwZGF0ZSB0d2VlbiBwcm9wZXJ0aWVzXG4gICAgICBpZiAoIHBhcnRzICkge1xuICAgICAgICBzdGFydCA9IHR3ZWVuLnN0YXJ0ID0gK3N0YXJ0IHx8ICt0YXJnZXQgfHwgMDtcbiAgICAgICAgdHdlZW4udW5pdCA9IHVuaXQ7XG4gICAgICAgIC8vIElmIGEgKz0vLT0gdG9rZW4gd2FzIHByb3ZpZGVkLCB3ZSdyZSBkb2luZyBhIHJlbGF0aXZlIGFuaW1hdGlvblxuICAgICAgICB0d2Vlbi5lbmQgPSBwYXJ0c1sgMSBdID9cbiAgICAgICAgICBzdGFydCArICggcGFydHNbIDEgXSArIDEgKSAqIHBhcnRzWyAyIF0gOlxuICAgICAgICAgICtwYXJ0c1sgMiBdO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHdlZW47XG4gICAgfV1cbiAgfTtcblxuLy8gQW5pbWF0aW9ucyBjcmVhdGVkIHN5bmNocm9ub3VzbHkgd2lsbCBydW4gc3luY2hyb25vdXNseVxuZnVuY3Rpb24gY3JlYXRlRnhOb3coKSB7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgZnhOb3cgPSB1bmRlZmluZWQ7XG4gIH0pO1xuICByZXR1cm4gKCBmeE5vdyA9IGpRdWVyeS5ub3coKSApO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVUd2VlbiggdmFsdWUsIHByb3AsIGFuaW1hdGlvbiApIHtcbiAgdmFyIHR3ZWVuLFxuICAgIGNvbGxlY3Rpb24gPSAoIHR3ZWVuZXJzWyBwcm9wIF0gfHwgW10gKS5jb25jYXQoIHR3ZWVuZXJzWyBcIipcIiBdICksXG4gICAgaW5kZXggPSAwLFxuICAgIGxlbmd0aCA9IGNvbGxlY3Rpb24ubGVuZ3RoO1xuICBmb3IgKCA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrICkge1xuICAgIGlmICggKHR3ZWVuID0gY29sbGVjdGlvblsgaW5kZXggXS5jYWxsKCBhbmltYXRpb24sIHByb3AsIHZhbHVlICkpICkge1xuXG4gICAgICAvLyB3ZSdyZSBkb25lIHdpdGggdGhpcyBwcm9wZXJ0eVxuICAgICAgcmV0dXJuIHR3ZWVuO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBBbmltYXRpb24oIGVsZW0sIHByb3BlcnRpZXMsIG9wdGlvbnMgKSB7XG4gIHZhciByZXN1bHQsXG4gICAgc3RvcHBlZCxcbiAgICBpbmRleCA9IDAsXG4gICAgbGVuZ3RoID0gYW5pbWF0aW9uUHJlZmlsdGVycy5sZW5ndGgsXG4gICAgZGVmZXJyZWQgPSBqUXVlcnkuRGVmZXJyZWQoKS5hbHdheXMoIGZ1bmN0aW9uKCkge1xuICAgICAgLy8gZG9uJ3QgbWF0Y2ggZWxlbSBpbiB0aGUgOmFuaW1hdGVkIHNlbGVjdG9yXG4gICAgICBkZWxldGUgdGljay5lbGVtO1xuICAgIH0pLFxuICAgIHRpY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICggc3RvcHBlZCApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgdmFyIGN1cnJlbnRUaW1lID0gZnhOb3cgfHwgY3JlYXRlRnhOb3coKSxcbiAgICAgICAgcmVtYWluaW5nID0gTWF0aC5tYXgoIDAsIGFuaW1hdGlvbi5zdGFydFRpbWUgKyBhbmltYXRpb24uZHVyYXRpb24gLSBjdXJyZW50VGltZSApLFxuICAgICAgICAvLyBhcmNoYWljIGNyYXNoIGJ1ZyB3b24ndCBhbGxvdyB1cyB0byB1c2UgMSAtICggMC41IHx8IDAgKSAoIzEyNDk3KVxuICAgICAgICB0ZW1wID0gcmVtYWluaW5nIC8gYW5pbWF0aW9uLmR1cmF0aW9uIHx8IDAsXG4gICAgICAgIHBlcmNlbnQgPSAxIC0gdGVtcCxcbiAgICAgICAgaW5kZXggPSAwLFxuICAgICAgICBsZW5ndGggPSBhbmltYXRpb24udHdlZW5zLmxlbmd0aDtcblxuICAgICAgZm9yICggOyBpbmRleCA8IGxlbmd0aCA7IGluZGV4KysgKSB7XG4gICAgICAgIGFuaW1hdGlvbi50d2VlbnNbIGluZGV4IF0ucnVuKCBwZXJjZW50ICk7XG4gICAgICB9XG5cbiAgICAgIGRlZmVycmVkLm5vdGlmeVdpdGgoIGVsZW0sIFsgYW5pbWF0aW9uLCBwZXJjZW50LCByZW1haW5pbmcgXSk7XG5cbiAgICAgIGlmICggcGVyY2VudCA8IDEgJiYgbGVuZ3RoICkge1xuICAgICAgICByZXR1cm4gcmVtYWluaW5nO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZVdpdGgoIGVsZW0sIFsgYW5pbWF0aW9uIF0gKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0sXG4gICAgYW5pbWF0aW9uID0gZGVmZXJyZWQucHJvbWlzZSh7XG4gICAgICBlbGVtOiBlbGVtLFxuICAgICAgcHJvcHM6IGpRdWVyeS5leHRlbmQoIHt9LCBwcm9wZXJ0aWVzICksXG4gICAgICBvcHRzOiBqUXVlcnkuZXh0ZW5kKCB0cnVlLCB7IHNwZWNpYWxFYXNpbmc6IHt9IH0sIG9wdGlvbnMgKSxcbiAgICAgIG9yaWdpbmFsUHJvcGVydGllczogcHJvcGVydGllcyxcbiAgICAgIG9yaWdpbmFsT3B0aW9uczogb3B0aW9ucyxcbiAgICAgIHN0YXJ0VGltZTogZnhOb3cgfHwgY3JlYXRlRnhOb3coKSxcbiAgICAgIGR1cmF0aW9uOiBvcHRpb25zLmR1cmF0aW9uLFxuICAgICAgdHdlZW5zOiBbXSxcbiAgICAgIGNyZWF0ZVR3ZWVuOiBmdW5jdGlvbiggcHJvcCwgZW5kICkge1xuICAgICAgICB2YXIgdHdlZW4gPSBqUXVlcnkuVHdlZW4oIGVsZW0sIGFuaW1hdGlvbi5vcHRzLCBwcm9wLCBlbmQsXG4gICAgICAgICAgICBhbmltYXRpb24ub3B0cy5zcGVjaWFsRWFzaW5nWyBwcm9wIF0gfHwgYW5pbWF0aW9uLm9wdHMuZWFzaW5nICk7XG4gICAgICAgIGFuaW1hdGlvbi50d2VlbnMucHVzaCggdHdlZW4gKTtcbiAgICAgICAgcmV0dXJuIHR3ZWVuO1xuICAgICAgfSxcbiAgICAgIHN0b3A6IGZ1bmN0aW9uKCBnb3RvRW5kICkge1xuICAgICAgICB2YXIgaW5kZXggPSAwLFxuICAgICAgICAgIC8vIGlmIHdlIGFyZSBnb2luZyB0byB0aGUgZW5kLCB3ZSB3YW50IHRvIHJ1biBhbGwgdGhlIHR3ZWVuc1xuICAgICAgICAgIC8vIG90aGVyd2lzZSB3ZSBza2lwIHRoaXMgcGFydFxuICAgICAgICAgIGxlbmd0aCA9IGdvdG9FbmQgPyBhbmltYXRpb24udHdlZW5zLmxlbmd0aCA6IDA7XG4gICAgICAgIGlmICggc3RvcHBlZCApIHtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBzdG9wcGVkID0gdHJ1ZTtcbiAgICAgICAgZm9yICggOyBpbmRleCA8IGxlbmd0aCA7IGluZGV4KysgKSB7XG4gICAgICAgICAgYW5pbWF0aW9uLnR3ZWVuc1sgaW5kZXggXS5ydW4oIDEgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHJlc29sdmUgd2hlbiB3ZSBwbGF5ZWQgdGhlIGxhc3QgZnJhbWVcbiAgICAgICAgLy8gb3RoZXJ3aXNlLCByZWplY3RcbiAgICAgICAgaWYgKCBnb3RvRW5kICkge1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmVXaXRoKCBlbGVtLCBbIGFuaW1hdGlvbiwgZ290b0VuZCBdICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0V2l0aCggZWxlbSwgWyBhbmltYXRpb24sIGdvdG9FbmQgXSApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgIH0pLFxuICAgIHByb3BzID0gYW5pbWF0aW9uLnByb3BzO1xuXG4gIHByb3BGaWx0ZXIoIHByb3BzLCBhbmltYXRpb24ub3B0cy5zcGVjaWFsRWFzaW5nICk7XG5cbiAgZm9yICggOyBpbmRleCA8IGxlbmd0aCA7IGluZGV4KysgKSB7XG4gICAgcmVzdWx0ID0gYW5pbWF0aW9uUHJlZmlsdGVyc1sgaW5kZXggXS5jYWxsKCBhbmltYXRpb24sIGVsZW0sIHByb3BzLCBhbmltYXRpb24ub3B0cyApO1xuICAgIGlmICggcmVzdWx0ICkge1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gIH1cblxuICBqUXVlcnkubWFwKCBwcm9wcywgY3JlYXRlVHdlZW4sIGFuaW1hdGlvbiApO1xuXG4gIGlmICggalF1ZXJ5LmlzRnVuY3Rpb24oIGFuaW1hdGlvbi5vcHRzLnN0YXJ0ICkgKSB7XG4gICAgYW5pbWF0aW9uLm9wdHMuc3RhcnQuY2FsbCggZWxlbSwgYW5pbWF0aW9uICk7XG4gIH1cblxuICBqUXVlcnkuZngudGltZXIoXG4gICAgalF1ZXJ5LmV4dGVuZCggdGljaywge1xuICAgICAgZWxlbTogZWxlbSxcbiAgICAgIGFuaW06IGFuaW1hdGlvbixcbiAgICAgIHF1ZXVlOiBhbmltYXRpb24ub3B0cy5xdWV1ZVxuICAgIH0pXG4gICk7XG5cbiAgLy8gYXR0YWNoIGNhbGxiYWNrcyBmcm9tIG9wdGlvbnNcbiAgcmV0dXJuIGFuaW1hdGlvbi5wcm9ncmVzcyggYW5pbWF0aW9uLm9wdHMucHJvZ3Jlc3MgKVxuICAgIC5kb25lKCBhbmltYXRpb24ub3B0cy5kb25lLCBhbmltYXRpb24ub3B0cy5jb21wbGV0ZSApXG4gICAgLmZhaWwoIGFuaW1hdGlvbi5vcHRzLmZhaWwgKVxuICAgIC5hbHdheXMoIGFuaW1hdGlvbi5vcHRzLmFsd2F5cyApO1xufVxuXG5mdW5jdGlvbiBwcm9wRmlsdGVyKCBwcm9wcywgc3BlY2lhbEVhc2luZyApIHtcbiAgdmFyIGluZGV4LCBuYW1lLCBlYXNpbmcsIHZhbHVlLCBob29rcztcblxuICAvLyBjYW1lbENhc2UsIHNwZWNpYWxFYXNpbmcgYW5kIGV4cGFuZCBjc3NIb29rIHBhc3NcbiAgZm9yICggaW5kZXggaW4gcHJvcHMgKSB7XG4gICAgbmFtZSA9IGpRdWVyeS5jYW1lbENhc2UoIGluZGV4ICk7XG4gICAgZWFzaW5nID0gc3BlY2lhbEVhc2luZ1sgbmFtZSBdO1xuICAgIHZhbHVlID0gcHJvcHNbIGluZGV4IF07XG4gICAgaWYgKCBqUXVlcnkuaXNBcnJheSggdmFsdWUgKSApIHtcbiAgICAgIGVhc2luZyA9IHZhbHVlWyAxIF07XG4gICAgICB2YWx1ZSA9IHByb3BzWyBpbmRleCBdID0gdmFsdWVbIDAgXTtcbiAgICB9XG5cbiAgICBpZiAoIGluZGV4ICE9PSBuYW1lICkge1xuICAgICAgcHJvcHNbIG5hbWUgXSA9IHZhbHVlO1xuICAgICAgZGVsZXRlIHByb3BzWyBpbmRleCBdO1xuICAgIH1cblxuICAgIGhvb2tzID0galF1ZXJ5LmNzc0hvb2tzWyBuYW1lIF07XG4gICAgaWYgKCBob29rcyAmJiBcImV4cGFuZFwiIGluIGhvb2tzICkge1xuICAgICAgdmFsdWUgPSBob29rcy5leHBhbmQoIHZhbHVlICk7XG4gICAgICBkZWxldGUgcHJvcHNbIG5hbWUgXTtcblxuICAgICAgLy8gbm90IHF1aXRlICQuZXh0ZW5kLCB0aGlzIHdvbnQgb3ZlcndyaXRlIGtleXMgYWxyZWFkeSBwcmVzZW50LlxuICAgICAgLy8gYWxzbyAtIHJldXNpbmcgJ2luZGV4JyBmcm9tIGFib3ZlIGJlY2F1c2Ugd2UgaGF2ZSB0aGUgY29ycmVjdCBcIm5hbWVcIlxuICAgICAgZm9yICggaW5kZXggaW4gdmFsdWUgKSB7XG4gICAgICAgIGlmICggISggaW5kZXggaW4gcHJvcHMgKSApIHtcbiAgICAgICAgICBwcm9wc1sgaW5kZXggXSA9IHZhbHVlWyBpbmRleCBdO1xuICAgICAgICAgIHNwZWNpYWxFYXNpbmdbIGluZGV4IF0gPSBlYXNpbmc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc3BlY2lhbEVhc2luZ1sgbmFtZSBdID0gZWFzaW5nO1xuICAgIH1cbiAgfVxufVxuXG5qUXVlcnkuQW5pbWF0aW9uID0galF1ZXJ5LmV4dGVuZCggQW5pbWF0aW9uLCB7XG5cbiAgdHdlZW5lcjogZnVuY3Rpb24oIHByb3BzLCBjYWxsYmFjayApIHtcbiAgICBpZiAoIGpRdWVyeS5pc0Z1bmN0aW9uKCBwcm9wcyApICkge1xuICAgICAgY2FsbGJhY2sgPSBwcm9wcztcbiAgICAgIHByb3BzID0gWyBcIipcIiBdO1xuICAgIH0gZWxzZSB7XG4gICAgICBwcm9wcyA9IHByb3BzLnNwbGl0KFwiIFwiKTtcbiAgICB9XG5cbiAgICB2YXIgcHJvcCxcbiAgICAgIGluZGV4ID0gMCxcbiAgICAgIGxlbmd0aCA9IHByb3BzLmxlbmd0aDtcblxuICAgIGZvciAoIDsgaW5kZXggPCBsZW5ndGggOyBpbmRleCsrICkge1xuICAgICAgcHJvcCA9IHByb3BzWyBpbmRleCBdO1xuICAgICAgdHdlZW5lcnNbIHByb3AgXSA9IHR3ZWVuZXJzWyBwcm9wIF0gfHwgW107XG4gICAgICB0d2VlbmVyc1sgcHJvcCBdLnVuc2hpZnQoIGNhbGxiYWNrICk7XG4gICAgfVxuICB9LFxuXG4gIHByZWZpbHRlcjogZnVuY3Rpb24oIGNhbGxiYWNrLCBwcmVwZW5kICkge1xuICAgIGlmICggcHJlcGVuZCApIHtcbiAgICAgIGFuaW1hdGlvblByZWZpbHRlcnMudW5zaGlmdCggY2FsbGJhY2sgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYW5pbWF0aW9uUHJlZmlsdGVycy5wdXNoKCBjYWxsYmFjayApO1xuICAgIH1cbiAgfVxufSk7XG5cbmZ1bmN0aW9uIGRlZmF1bHRQcmVmaWx0ZXIoIGVsZW0sIHByb3BzLCBvcHRzICkge1xuICAvKiBqc2hpbnQgdmFsaWR0aGlzOiB0cnVlICovXG4gIHZhciBwcm9wLCB2YWx1ZSwgdG9nZ2xlLCB0d2VlbiwgaG9va3MsIG9sZGZpcmUsXG4gICAgYW5pbSA9IHRoaXMsXG4gICAgb3JpZyA9IHt9LFxuICAgIHN0eWxlID0gZWxlbS5zdHlsZSxcbiAgICBoaWRkZW4gPSBlbGVtLm5vZGVUeXBlICYmIGlzSGlkZGVuKCBlbGVtICksXG4gICAgZGF0YVNob3cgPSBqUXVlcnkuX2RhdGEoIGVsZW0sIFwiZnhzaG93XCIgKTtcblxuICAvLyBoYW5kbGUgcXVldWU6IGZhbHNlIHByb21pc2VzXG4gIGlmICggIW9wdHMucXVldWUgKSB7XG4gICAgaG9va3MgPSBqUXVlcnkuX3F1ZXVlSG9va3MoIGVsZW0sIFwiZnhcIiApO1xuICAgIGlmICggaG9va3MudW5xdWV1ZWQgPT0gbnVsbCApIHtcbiAgICAgIGhvb2tzLnVucXVldWVkID0gMDtcbiAgICAgIG9sZGZpcmUgPSBob29rcy5lbXB0eS5maXJlO1xuICAgICAgaG9va3MuZW1wdHkuZmlyZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoICFob29rcy51bnF1ZXVlZCApIHtcbiAgICAgICAgICBvbGRmaXJlKCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuICAgIGhvb2tzLnVucXVldWVkKys7XG5cbiAgICBhbmltLmFsd2F5cyhmdW5jdGlvbigpIHtcbiAgICAgIC8vIGRvaW5nIHRoaXMgbWFrZXMgc3VyZSB0aGF0IHRoZSBjb21wbGV0ZSBoYW5kbGVyIHdpbGwgYmUgY2FsbGVkXG4gICAgICAvLyBiZWZvcmUgdGhpcyBjb21wbGV0ZXNcbiAgICAgIGFuaW0uYWx3YXlzKGZ1bmN0aW9uKCkge1xuICAgICAgICBob29rcy51bnF1ZXVlZC0tO1xuICAgICAgICBpZiAoICFqUXVlcnkucXVldWUoIGVsZW0sIFwiZnhcIiApLmxlbmd0aCApIHtcbiAgICAgICAgICBob29rcy5lbXB0eS5maXJlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gaGVpZ2h0L3dpZHRoIG92ZXJmbG93IHBhc3NcbiAgaWYgKCBlbGVtLm5vZGVUeXBlID09PSAxICYmICggXCJoZWlnaHRcIiBpbiBwcm9wcyB8fCBcIndpZHRoXCIgaW4gcHJvcHMgKSApIHtcbiAgICAvLyBNYWtlIHN1cmUgdGhhdCBub3RoaW5nIHNuZWFrcyBvdXRcbiAgICAvLyBSZWNvcmQgYWxsIDMgb3ZlcmZsb3cgYXR0cmlidXRlcyBiZWNhdXNlIElFIGRvZXMgbm90XG4gICAgLy8gY2hhbmdlIHRoZSBvdmVyZmxvdyBhdHRyaWJ1dGUgd2hlbiBvdmVyZmxvd1ggYW5kXG4gICAgLy8gb3ZlcmZsb3dZIGFyZSBzZXQgdG8gdGhlIHNhbWUgdmFsdWVcbiAgICBvcHRzLm92ZXJmbG93ID0gWyBzdHlsZS5vdmVyZmxvdywgc3R5bGUub3ZlcmZsb3dYLCBzdHlsZS5vdmVyZmxvd1kgXTtcblxuICAgIC8vIFNldCBkaXNwbGF5IHByb3BlcnR5IHRvIGlubGluZS1ibG9jayBmb3IgaGVpZ2h0L3dpZHRoXG4gICAgLy8gYW5pbWF0aW9ucyBvbiBpbmxpbmUgZWxlbWVudHMgdGhhdCBhcmUgaGF2aW5nIHdpZHRoL2hlaWdodCBhbmltYXRlZFxuICAgIGlmICggalF1ZXJ5LmNzcyggZWxlbSwgXCJkaXNwbGF5XCIgKSA9PT0gXCJpbmxpbmVcIiAmJlxuICAgICAgICBqUXVlcnkuY3NzKCBlbGVtLCBcImZsb2F0XCIgKSA9PT0gXCJub25lXCIgKSB7XG5cbiAgICAgIC8vIGlubGluZS1sZXZlbCBlbGVtZW50cyBhY2NlcHQgaW5saW5lLWJsb2NrO1xuICAgICAgLy8gYmxvY2stbGV2ZWwgZWxlbWVudHMgbmVlZCB0byBiZSBpbmxpbmUgd2l0aCBsYXlvdXRcbiAgICAgIGlmICggIWpRdWVyeS5zdXBwb3J0LmlubGluZUJsb2NrTmVlZHNMYXlvdXQgfHwgY3NzX2RlZmF1bHREaXNwbGF5KCBlbGVtLm5vZGVOYW1lICkgPT09IFwiaW5saW5lXCIgKSB7XG4gICAgICAgIHN0eWxlLmRpc3BsYXkgPSBcImlubGluZS1ibG9ja1wiO1xuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdHlsZS56b29tID0gMTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAoIG9wdHMub3ZlcmZsb3cgKSB7XG4gICAgc3R5bGUub3ZlcmZsb3cgPSBcImhpZGRlblwiO1xuICAgIGlmICggIWpRdWVyeS5zdXBwb3J0LnNocmlua1dyYXBCbG9ja3MgKSB7XG4gICAgICBhbmltLmFsd2F5cyhmdW5jdGlvbigpIHtcbiAgICAgICAgc3R5bGUub3ZlcmZsb3cgPSBvcHRzLm92ZXJmbG93WyAwIF07XG4gICAgICAgIHN0eWxlLm92ZXJmbG93WCA9IG9wdHMub3ZlcmZsb3dbIDEgXTtcbiAgICAgICAgc3R5bGUub3ZlcmZsb3dZID0gb3B0cy5vdmVyZmxvd1sgMiBdO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cblxuICAvLyBzaG93L2hpZGUgcGFzc1xuICBmb3IgKCBwcm9wIGluIHByb3BzICkge1xuICAgIHZhbHVlID0gcHJvcHNbIHByb3AgXTtcbiAgICBpZiAoIHJmeHR5cGVzLmV4ZWMoIHZhbHVlICkgKSB7XG4gICAgICBkZWxldGUgcHJvcHNbIHByb3AgXTtcbiAgICAgIHRvZ2dsZSA9IHRvZ2dsZSB8fCB2YWx1ZSA9PT0gXCJ0b2dnbGVcIjtcbiAgICAgIGlmICggdmFsdWUgPT09ICggaGlkZGVuID8gXCJoaWRlXCIgOiBcInNob3dcIiApICkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIG9yaWdbIHByb3AgXSA9IGRhdGFTaG93ICYmIGRhdGFTaG93WyBwcm9wIF0gfHwgalF1ZXJ5LnN0eWxlKCBlbGVtLCBwcm9wICk7XG4gICAgfVxuICB9XG5cbiAgaWYgKCAhalF1ZXJ5LmlzRW1wdHlPYmplY3QoIG9yaWcgKSApIHtcbiAgICBpZiAoIGRhdGFTaG93ICkge1xuICAgICAgaWYgKCBcImhpZGRlblwiIGluIGRhdGFTaG93ICkge1xuICAgICAgICBoaWRkZW4gPSBkYXRhU2hvdy5oaWRkZW47XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGRhdGFTaG93ID0galF1ZXJ5Ll9kYXRhKCBlbGVtLCBcImZ4c2hvd1wiLCB7fSApO1xuICAgIH1cblxuICAgIC8vIHN0b3JlIHN0YXRlIGlmIGl0cyB0b2dnbGUgLSBlbmFibGVzIC5zdG9wKCkudG9nZ2xlKCkgdG8gXCJyZXZlcnNlXCJcbiAgICBpZiAoIHRvZ2dsZSApIHtcbiAgICAgIGRhdGFTaG93LmhpZGRlbiA9ICFoaWRkZW47XG4gICAgfVxuICAgIGlmICggaGlkZGVuICkge1xuICAgICAgalF1ZXJ5KCBlbGVtICkuc2hvdygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhbmltLmRvbmUoZnVuY3Rpb24oKSB7XG4gICAgICAgIGpRdWVyeSggZWxlbSApLmhpZGUoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBhbmltLmRvbmUoZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcHJvcDtcbiAgICAgIGpRdWVyeS5fcmVtb3ZlRGF0YSggZWxlbSwgXCJmeHNob3dcIiApO1xuICAgICAgZm9yICggcHJvcCBpbiBvcmlnICkge1xuICAgICAgICBqUXVlcnkuc3R5bGUoIGVsZW0sIHByb3AsIG9yaWdbIHByb3AgXSApO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGZvciAoIHByb3AgaW4gb3JpZyApIHtcbiAgICAgIHR3ZWVuID0gY3JlYXRlVHdlZW4oIGhpZGRlbiA/IGRhdGFTaG93WyBwcm9wIF0gOiAwLCBwcm9wLCBhbmltICk7XG5cbiAgICAgIGlmICggISggcHJvcCBpbiBkYXRhU2hvdyApICkge1xuICAgICAgICBkYXRhU2hvd1sgcHJvcCBdID0gdHdlZW4uc3RhcnQ7XG4gICAgICAgIGlmICggaGlkZGVuICkge1xuICAgICAgICAgIHR3ZWVuLmVuZCA9IHR3ZWVuLnN0YXJ0O1xuICAgICAgICAgIHR3ZWVuLnN0YXJ0ID0gcHJvcCA9PT0gXCJ3aWR0aFwiIHx8IHByb3AgPT09IFwiaGVpZ2h0XCIgPyAxIDogMDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBUd2VlbiggZWxlbSwgb3B0aW9ucywgcHJvcCwgZW5kLCBlYXNpbmcgKSB7XG4gIHJldHVybiBuZXcgVHdlZW4ucHJvdG90eXBlLmluaXQoIGVsZW0sIG9wdGlvbnMsIHByb3AsIGVuZCwgZWFzaW5nICk7XG59XG5qUXVlcnkuVHdlZW4gPSBUd2VlbjtcblxuVHdlZW4ucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogVHdlZW4sXG4gIGluaXQ6IGZ1bmN0aW9uKCBlbGVtLCBvcHRpb25zLCBwcm9wLCBlbmQsIGVhc2luZywgdW5pdCApIHtcbiAgICB0aGlzLmVsZW0gPSBlbGVtO1xuICAgIHRoaXMucHJvcCA9IHByb3A7XG4gICAgdGhpcy5lYXNpbmcgPSBlYXNpbmcgfHwgXCJzd2luZ1wiO1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdGhpcy5zdGFydCA9IHRoaXMubm93ID0gdGhpcy5jdXIoKTtcbiAgICB0aGlzLmVuZCA9IGVuZDtcbiAgICB0aGlzLnVuaXQgPSB1bml0IHx8ICggalF1ZXJ5LmNzc051bWJlclsgcHJvcCBdID8gXCJcIiA6IFwicHhcIiApO1xuICB9LFxuICBjdXI6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBob29rcyA9IFR3ZWVuLnByb3BIb29rc1sgdGhpcy5wcm9wIF07XG5cbiAgICByZXR1cm4gaG9va3MgJiYgaG9va3MuZ2V0ID9cbiAgICAgIGhvb2tzLmdldCggdGhpcyApIDpcbiAgICAgIFR3ZWVuLnByb3BIb29rcy5fZGVmYXVsdC5nZXQoIHRoaXMgKTtcbiAgfSxcbiAgcnVuOiBmdW5jdGlvbiggcGVyY2VudCApIHtcbiAgICB2YXIgZWFzZWQsXG4gICAgICBob29rcyA9IFR3ZWVuLnByb3BIb29rc1sgdGhpcy5wcm9wIF07XG5cbiAgICBpZiAoIHRoaXMub3B0aW9ucy5kdXJhdGlvbiApIHtcbiAgICAgIHRoaXMucG9zID0gZWFzZWQgPSBqUXVlcnkuZWFzaW5nWyB0aGlzLmVhc2luZyBdKFxuICAgICAgICBwZXJjZW50LCB0aGlzLm9wdGlvbnMuZHVyYXRpb24gKiBwZXJjZW50LCAwLCAxLCB0aGlzLm9wdGlvbnMuZHVyYXRpb25cbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucG9zID0gZWFzZWQgPSBwZXJjZW50O1xuICAgIH1cbiAgICB0aGlzLm5vdyA9ICggdGhpcy5lbmQgLSB0aGlzLnN0YXJ0ICkgKiBlYXNlZCArIHRoaXMuc3RhcnQ7XG5cbiAgICBpZiAoIHRoaXMub3B0aW9ucy5zdGVwICkge1xuICAgICAgdGhpcy5vcHRpb25zLnN0ZXAuY2FsbCggdGhpcy5lbGVtLCB0aGlzLm5vdywgdGhpcyApO1xuICAgIH1cblxuICAgIGlmICggaG9va3MgJiYgaG9va3Muc2V0ICkge1xuICAgICAgaG9va3Muc2V0KCB0aGlzICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIFR3ZWVuLnByb3BIb29rcy5fZGVmYXVsdC5zZXQoIHRoaXMgKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn07XG5cblR3ZWVuLnByb3RvdHlwZS5pbml0LnByb3RvdHlwZSA9IFR3ZWVuLnByb3RvdHlwZTtcblxuVHdlZW4ucHJvcEhvb2tzID0ge1xuICBfZGVmYXVsdDoge1xuICAgIGdldDogZnVuY3Rpb24oIHR3ZWVuICkge1xuICAgICAgdmFyIHJlc3VsdDtcblxuICAgICAgaWYgKCB0d2Vlbi5lbGVtWyB0d2Vlbi5wcm9wIF0gIT0gbnVsbCAmJlxuICAgICAgICAoIXR3ZWVuLmVsZW0uc3R5bGUgfHwgdHdlZW4uZWxlbS5zdHlsZVsgdHdlZW4ucHJvcCBdID09IG51bGwpICkge1xuICAgICAgICByZXR1cm4gdHdlZW4uZWxlbVsgdHdlZW4ucHJvcCBdO1xuICAgICAgfVxuXG4gICAgICAvLyBwYXNzaW5nIGFuIGVtcHR5IHN0cmluZyBhcyBhIDNyZCBwYXJhbWV0ZXIgdG8gLmNzcyB3aWxsIGF1dG9tYXRpY2FsbHlcbiAgICAgIC8vIGF0dGVtcHQgYSBwYXJzZUZsb2F0IGFuZCBmYWxsYmFjayB0byBhIHN0cmluZyBpZiB0aGUgcGFyc2UgZmFpbHNcbiAgICAgIC8vIHNvLCBzaW1wbGUgdmFsdWVzIHN1Y2ggYXMgXCIxMHB4XCIgYXJlIHBhcnNlZCB0byBGbG9hdC5cbiAgICAgIC8vIGNvbXBsZXggdmFsdWVzIHN1Y2ggYXMgXCJyb3RhdGUoMXJhZClcIiBhcmUgcmV0dXJuZWQgYXMgaXMuXG4gICAgICByZXN1bHQgPSBqUXVlcnkuY3NzKCB0d2Vlbi5lbGVtLCB0d2Vlbi5wcm9wLCBcIlwiICk7XG4gICAgICAvLyBFbXB0eSBzdHJpbmdzLCBudWxsLCB1bmRlZmluZWQgYW5kIFwiYXV0b1wiIGFyZSBjb252ZXJ0ZWQgdG8gMC5cbiAgICAgIHJldHVybiAhcmVzdWx0IHx8IHJlc3VsdCA9PT0gXCJhdXRvXCIgPyAwIDogcmVzdWx0O1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiggdHdlZW4gKSB7XG4gICAgICAvLyB1c2Ugc3RlcCBob29rIGZvciBiYWNrIGNvbXBhdCAtIHVzZSBjc3NIb29rIGlmIGl0cyB0aGVyZSAtIHVzZSAuc3R5bGUgaWYgaXRzXG4gICAgICAvLyBhdmFpbGFibGUgYW5kIHVzZSBwbGFpbiBwcm9wZXJ0aWVzIHdoZXJlIGF2YWlsYWJsZVxuICAgICAgaWYgKCBqUXVlcnkuZnguc3RlcFsgdHdlZW4ucHJvcCBdICkge1xuICAgICAgICBqUXVlcnkuZnguc3RlcFsgdHdlZW4ucHJvcCBdKCB0d2VlbiApO1xuICAgICAgfSBlbHNlIGlmICggdHdlZW4uZWxlbS5zdHlsZSAmJiAoIHR3ZWVuLmVsZW0uc3R5bGVbIGpRdWVyeS5jc3NQcm9wc1sgdHdlZW4ucHJvcCBdIF0gIT0gbnVsbCB8fCBqUXVlcnkuY3NzSG9va3NbIHR3ZWVuLnByb3AgXSApICkge1xuICAgICAgICBqUXVlcnkuc3R5bGUoIHR3ZWVuLmVsZW0sIHR3ZWVuLnByb3AsIHR3ZWVuLm5vdyArIHR3ZWVuLnVuaXQgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHR3ZWVuLmVsZW1bIHR3ZWVuLnByb3AgXSA9IHR3ZWVuLm5vdztcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbi8vIFN1cHBvcnQ6IElFIDw9OVxuLy8gUGFuaWMgYmFzZWQgYXBwcm9hY2ggdG8gc2V0dGluZyB0aGluZ3Mgb24gZGlzY29ubmVjdGVkIG5vZGVzXG5cblR3ZWVuLnByb3BIb29rcy5zY3JvbGxUb3AgPSBUd2Vlbi5wcm9wSG9va3Muc2Nyb2xsTGVmdCA9IHtcbiAgc2V0OiBmdW5jdGlvbiggdHdlZW4gKSB7XG4gICAgaWYgKCB0d2Vlbi5lbGVtLm5vZGVUeXBlICYmIHR3ZWVuLmVsZW0ucGFyZW50Tm9kZSApIHtcbiAgICAgIHR3ZWVuLmVsZW1bIHR3ZWVuLnByb3AgXSA9IHR3ZWVuLm5vdztcbiAgICB9XG4gIH1cbn07XG5cbmpRdWVyeS5lYWNoKFsgXCJ0b2dnbGVcIiwgXCJzaG93XCIsIFwiaGlkZVwiIF0sIGZ1bmN0aW9uKCBpLCBuYW1lICkge1xuICB2YXIgY3NzRm4gPSBqUXVlcnkuZm5bIG5hbWUgXTtcbiAgalF1ZXJ5LmZuWyBuYW1lIF0gPSBmdW5jdGlvbiggc3BlZWQsIGVhc2luZywgY2FsbGJhY2sgKSB7XG4gICAgcmV0dXJuIHNwZWVkID09IG51bGwgfHwgdHlwZW9mIHNwZWVkID09PSBcImJvb2xlYW5cIiA/XG4gICAgICBjc3NGbi5hcHBseSggdGhpcywgYXJndW1lbnRzICkgOlxuICAgICAgdGhpcy5hbmltYXRlKCBnZW5GeCggbmFtZSwgdHJ1ZSApLCBzcGVlZCwgZWFzaW5nLCBjYWxsYmFjayApO1xuICB9O1xufSk7XG5cbmpRdWVyeS5mbi5leHRlbmQoe1xuICBmYWRlVG86IGZ1bmN0aW9uKCBzcGVlZCwgdG8sIGVhc2luZywgY2FsbGJhY2sgKSB7XG5cbiAgICAvLyBzaG93IGFueSBoaWRkZW4gZWxlbWVudHMgYWZ0ZXIgc2V0dGluZyBvcGFjaXR5IHRvIDBcbiAgICByZXR1cm4gdGhpcy5maWx0ZXIoIGlzSGlkZGVuICkuY3NzKCBcIm9wYWNpdHlcIiwgMCApLnNob3coKVxuXG4gICAgICAvLyBhbmltYXRlIHRvIHRoZSB2YWx1ZSBzcGVjaWZpZWRcbiAgICAgIC5lbmQoKS5hbmltYXRlKHsgb3BhY2l0eTogdG8gfSwgc3BlZWQsIGVhc2luZywgY2FsbGJhY2sgKTtcbiAgfSxcbiAgYW5pbWF0ZTogZnVuY3Rpb24oIHByb3AsIHNwZWVkLCBlYXNpbmcsIGNhbGxiYWNrICkge1xuICAgIHZhciBlbXB0eSA9IGpRdWVyeS5pc0VtcHR5T2JqZWN0KCBwcm9wICksXG4gICAgICBvcHRhbGwgPSBqUXVlcnkuc3BlZWQoIHNwZWVkLCBlYXNpbmcsIGNhbGxiYWNrICksXG4gICAgICBkb0FuaW1hdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBPcGVyYXRlIG9uIGEgY29weSBvZiBwcm9wIHNvIHBlci1wcm9wZXJ0eSBlYXNpbmcgd29uJ3QgYmUgbG9zdFxuICAgICAgICB2YXIgYW5pbSA9IEFuaW1hdGlvbiggdGhpcywgalF1ZXJ5LmV4dGVuZCgge30sIHByb3AgKSwgb3B0YWxsICk7XG5cbiAgICAgICAgLy8gRW1wdHkgYW5pbWF0aW9ucywgb3IgZmluaXNoaW5nIHJlc29sdmVzIGltbWVkaWF0ZWx5XG4gICAgICAgIGlmICggZW1wdHkgfHwgalF1ZXJ5Ll9kYXRhKCB0aGlzLCBcImZpbmlzaFwiICkgKSB7XG4gICAgICAgICAgYW5pbS5zdG9wKCB0cnVlICk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBkb0FuaW1hdGlvbi5maW5pc2ggPSBkb0FuaW1hdGlvbjtcblxuICAgIHJldHVybiBlbXB0eSB8fCBvcHRhbGwucXVldWUgPT09IGZhbHNlID9cbiAgICAgIHRoaXMuZWFjaCggZG9BbmltYXRpb24gKSA6XG4gICAgICB0aGlzLnF1ZXVlKCBvcHRhbGwucXVldWUsIGRvQW5pbWF0aW9uICk7XG4gIH0sXG4gIHN0b3A6IGZ1bmN0aW9uKCB0eXBlLCBjbGVhclF1ZXVlLCBnb3RvRW5kICkge1xuICAgIHZhciBzdG9wUXVldWUgPSBmdW5jdGlvbiggaG9va3MgKSB7XG4gICAgICB2YXIgc3RvcCA9IGhvb2tzLnN0b3A7XG4gICAgICBkZWxldGUgaG9va3Muc3RvcDtcbiAgICAgIHN0b3AoIGdvdG9FbmQgKTtcbiAgICB9O1xuXG4gICAgaWYgKCB0eXBlb2YgdHlwZSAhPT0gXCJzdHJpbmdcIiApIHtcbiAgICAgIGdvdG9FbmQgPSBjbGVhclF1ZXVlO1xuICAgICAgY2xlYXJRdWV1ZSA9IHR5cGU7XG4gICAgICB0eXBlID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBpZiAoIGNsZWFyUXVldWUgJiYgdHlwZSAhPT0gZmFsc2UgKSB7XG4gICAgICB0aGlzLnF1ZXVlKCB0eXBlIHx8IFwiZnhcIiwgW10gKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGRlcXVldWUgPSB0cnVlLFxuICAgICAgICBpbmRleCA9IHR5cGUgIT0gbnVsbCAmJiB0eXBlICsgXCJxdWV1ZUhvb2tzXCIsXG4gICAgICAgIHRpbWVycyA9IGpRdWVyeS50aW1lcnMsXG4gICAgICAgIGRhdGEgPSBqUXVlcnkuX2RhdGEoIHRoaXMgKTtcblxuICAgICAgaWYgKCBpbmRleCApIHtcbiAgICAgICAgaWYgKCBkYXRhWyBpbmRleCBdICYmIGRhdGFbIGluZGV4IF0uc3RvcCApIHtcbiAgICAgICAgICBzdG9wUXVldWUoIGRhdGFbIGluZGV4IF0gKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9yICggaW5kZXggaW4gZGF0YSApIHtcbiAgICAgICAgICBpZiAoIGRhdGFbIGluZGV4IF0gJiYgZGF0YVsgaW5kZXggXS5zdG9wICYmIHJydW4udGVzdCggaW5kZXggKSApIHtcbiAgICAgICAgICAgIHN0b3BRdWV1ZSggZGF0YVsgaW5kZXggXSApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmb3IgKCBpbmRleCA9IHRpbWVycy5sZW5ndGg7IGluZGV4LS07ICkge1xuICAgICAgICBpZiAoIHRpbWVyc1sgaW5kZXggXS5lbGVtID09PSB0aGlzICYmICh0eXBlID09IG51bGwgfHwgdGltZXJzWyBpbmRleCBdLnF1ZXVlID09PSB0eXBlKSApIHtcbiAgICAgICAgICB0aW1lcnNbIGluZGV4IF0uYW5pbS5zdG9wKCBnb3RvRW5kICk7XG4gICAgICAgICAgZGVxdWV1ZSA9IGZhbHNlO1xuICAgICAgICAgIHRpbWVycy5zcGxpY2UoIGluZGV4LCAxICk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gc3RhcnQgdGhlIG5leHQgaW4gdGhlIHF1ZXVlIGlmIHRoZSBsYXN0IHN0ZXAgd2Fzbid0IGZvcmNlZFxuICAgICAgLy8gdGltZXJzIGN1cnJlbnRseSB3aWxsIGNhbGwgdGhlaXIgY29tcGxldGUgY2FsbGJhY2tzLCB3aGljaCB3aWxsIGRlcXVldWVcbiAgICAgIC8vIGJ1dCBvbmx5IGlmIHRoZXkgd2VyZSBnb3RvRW5kXG4gICAgICBpZiAoIGRlcXVldWUgfHwgIWdvdG9FbmQgKSB7XG4gICAgICAgIGpRdWVyeS5kZXF1ZXVlKCB0aGlzLCB0eXBlICk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG4gIGZpbmlzaDogZnVuY3Rpb24oIHR5cGUgKSB7XG4gICAgaWYgKCB0eXBlICE9PSBmYWxzZSApIHtcbiAgICAgIHR5cGUgPSB0eXBlIHx8IFwiZnhcIjtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgIHZhciBpbmRleCxcbiAgICAgICAgZGF0YSA9IGpRdWVyeS5fZGF0YSggdGhpcyApLFxuICAgICAgICBxdWV1ZSA9IGRhdGFbIHR5cGUgKyBcInF1ZXVlXCIgXSxcbiAgICAgICAgaG9va3MgPSBkYXRhWyB0eXBlICsgXCJxdWV1ZUhvb2tzXCIgXSxcbiAgICAgICAgdGltZXJzID0galF1ZXJ5LnRpbWVycyxcbiAgICAgICAgbGVuZ3RoID0gcXVldWUgPyBxdWV1ZS5sZW5ndGggOiAwO1xuXG4gICAgICAvLyBlbmFibGUgZmluaXNoaW5nIGZsYWcgb24gcHJpdmF0ZSBkYXRhXG4gICAgICBkYXRhLmZpbmlzaCA9IHRydWU7XG5cbiAgICAgIC8vIGVtcHR5IHRoZSBxdWV1ZSBmaXJzdFxuICAgICAgalF1ZXJ5LnF1ZXVlKCB0aGlzLCB0eXBlLCBbXSApO1xuXG4gICAgICBpZiAoIGhvb2tzICYmIGhvb2tzLnN0b3AgKSB7XG4gICAgICAgIGhvb2tzLnN0b3AuY2FsbCggdGhpcywgdHJ1ZSApO1xuICAgICAgfVxuXG4gICAgICAvLyBsb29rIGZvciBhbnkgYWN0aXZlIGFuaW1hdGlvbnMsIGFuZCBmaW5pc2ggdGhlbVxuICAgICAgZm9yICggaW5kZXggPSB0aW1lcnMubGVuZ3RoOyBpbmRleC0tOyApIHtcbiAgICAgICAgaWYgKCB0aW1lcnNbIGluZGV4IF0uZWxlbSA9PT0gdGhpcyAmJiB0aW1lcnNbIGluZGV4IF0ucXVldWUgPT09IHR5cGUgKSB7XG4gICAgICAgICAgdGltZXJzWyBpbmRleCBdLmFuaW0uc3RvcCggdHJ1ZSApO1xuICAgICAgICAgIHRpbWVycy5zcGxpY2UoIGluZGV4LCAxICk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gbG9vayBmb3IgYW55IGFuaW1hdGlvbnMgaW4gdGhlIG9sZCBxdWV1ZSBhbmQgZmluaXNoIHRoZW1cbiAgICAgIGZvciAoIGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KysgKSB7XG4gICAgICAgIGlmICggcXVldWVbIGluZGV4IF0gJiYgcXVldWVbIGluZGV4IF0uZmluaXNoICkge1xuICAgICAgICAgIHF1ZXVlWyBpbmRleCBdLmZpbmlzaC5jYWxsKCB0aGlzICk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gdHVybiBvZmYgZmluaXNoaW5nIGZsYWdcbiAgICAgIGRlbGV0ZSBkYXRhLmZpbmlzaDtcbiAgICB9KTtcbiAgfVxufSk7XG5cbi8vIEdlbmVyYXRlIHBhcmFtZXRlcnMgdG8gY3JlYXRlIGEgc3RhbmRhcmQgYW5pbWF0aW9uXG5mdW5jdGlvbiBnZW5GeCggdHlwZSwgaW5jbHVkZVdpZHRoICkge1xuICB2YXIgd2hpY2gsXG4gICAgYXR0cnMgPSB7IGhlaWdodDogdHlwZSB9LFxuICAgIGkgPSAwO1xuXG4gIC8vIGlmIHdlIGluY2x1ZGUgd2lkdGgsIHN0ZXAgdmFsdWUgaXMgMSB0byBkbyBhbGwgY3NzRXhwYW5kIHZhbHVlcyxcbiAgLy8gaWYgd2UgZG9uJ3QgaW5jbHVkZSB3aWR0aCwgc3RlcCB2YWx1ZSBpcyAyIHRvIHNraXAgb3ZlciBMZWZ0IGFuZCBSaWdodFxuICBpbmNsdWRlV2lkdGggPSBpbmNsdWRlV2lkdGg/IDEgOiAwO1xuICBmb3IoIDsgaSA8IDQgOyBpICs9IDIgLSBpbmNsdWRlV2lkdGggKSB7XG4gICAgd2hpY2ggPSBjc3NFeHBhbmRbIGkgXTtcbiAgICBhdHRyc1sgXCJtYXJnaW5cIiArIHdoaWNoIF0gPSBhdHRyc1sgXCJwYWRkaW5nXCIgKyB3aGljaCBdID0gdHlwZTtcbiAgfVxuXG4gIGlmICggaW5jbHVkZVdpZHRoICkge1xuICAgIGF0dHJzLm9wYWNpdHkgPSBhdHRycy53aWR0aCA9IHR5cGU7XG4gIH1cblxuICByZXR1cm4gYXR0cnM7XG59XG5cbi8vIEdlbmVyYXRlIHNob3J0Y3V0cyBmb3IgY3VzdG9tIGFuaW1hdGlvbnNcbmpRdWVyeS5lYWNoKHtcbiAgc2xpZGVEb3duOiBnZW5GeChcInNob3dcIiksXG4gIHNsaWRlVXA6IGdlbkZ4KFwiaGlkZVwiKSxcbiAgc2xpZGVUb2dnbGU6IGdlbkZ4KFwidG9nZ2xlXCIpLFxuICBmYWRlSW46IHsgb3BhY2l0eTogXCJzaG93XCIgfSxcbiAgZmFkZU91dDogeyBvcGFjaXR5OiBcImhpZGVcIiB9LFxuICBmYWRlVG9nZ2xlOiB7IG9wYWNpdHk6IFwidG9nZ2xlXCIgfVxufSwgZnVuY3Rpb24oIG5hbWUsIHByb3BzICkge1xuICBqUXVlcnkuZm5bIG5hbWUgXSA9IGZ1bmN0aW9uKCBzcGVlZCwgZWFzaW5nLCBjYWxsYmFjayApIHtcbiAgICByZXR1cm4gdGhpcy5hbmltYXRlKCBwcm9wcywgc3BlZWQsIGVhc2luZywgY2FsbGJhY2sgKTtcbiAgfTtcbn0pO1xuXG5qUXVlcnkuc3BlZWQgPSBmdW5jdGlvbiggc3BlZWQsIGVhc2luZywgZm4gKSB7XG4gIHZhciBvcHQgPSBzcGVlZCAmJiB0eXBlb2Ygc3BlZWQgPT09IFwib2JqZWN0XCIgPyBqUXVlcnkuZXh0ZW5kKCB7fSwgc3BlZWQgKSA6IHtcbiAgICBjb21wbGV0ZTogZm4gfHwgIWZuICYmIGVhc2luZyB8fFxuICAgICAgalF1ZXJ5LmlzRnVuY3Rpb24oIHNwZWVkICkgJiYgc3BlZWQsXG4gICAgZHVyYXRpb246IHNwZWVkLFxuICAgIGVhc2luZzogZm4gJiYgZWFzaW5nIHx8IGVhc2luZyAmJiAhalF1ZXJ5LmlzRnVuY3Rpb24oIGVhc2luZyApICYmIGVhc2luZ1xuICB9O1xuXG4gIG9wdC5kdXJhdGlvbiA9IGpRdWVyeS5meC5vZmYgPyAwIDogdHlwZW9mIG9wdC5kdXJhdGlvbiA9PT0gXCJudW1iZXJcIiA/IG9wdC5kdXJhdGlvbiA6XG4gICAgb3B0LmR1cmF0aW9uIGluIGpRdWVyeS5meC5zcGVlZHMgPyBqUXVlcnkuZnguc3BlZWRzWyBvcHQuZHVyYXRpb24gXSA6IGpRdWVyeS5meC5zcGVlZHMuX2RlZmF1bHQ7XG5cbiAgLy8gbm9ybWFsaXplIG9wdC5xdWV1ZSAtIHRydWUvdW5kZWZpbmVkL251bGwgLT4gXCJmeFwiXG4gIGlmICggb3B0LnF1ZXVlID09IG51bGwgfHwgb3B0LnF1ZXVlID09PSB0cnVlICkge1xuICAgIG9wdC5xdWV1ZSA9IFwiZnhcIjtcbiAgfVxuXG4gIC8vIFF1ZXVlaW5nXG4gIG9wdC5vbGQgPSBvcHQuY29tcGxldGU7XG5cbiAgb3B0LmNvbXBsZXRlID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCBqUXVlcnkuaXNGdW5jdGlvbiggb3B0Lm9sZCApICkge1xuICAgICAgb3B0Lm9sZC5jYWxsKCB0aGlzICk7XG4gICAgfVxuXG4gICAgaWYgKCBvcHQucXVldWUgKSB7XG4gICAgICBqUXVlcnkuZGVxdWV1ZSggdGhpcywgb3B0LnF1ZXVlICk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBvcHQ7XG59O1xuXG5qUXVlcnkuZWFzaW5nID0ge1xuICBsaW5lYXI6IGZ1bmN0aW9uKCBwICkge1xuICAgIHJldHVybiBwO1xuICB9LFxuICBzd2luZzogZnVuY3Rpb24oIHAgKSB7XG4gICAgcmV0dXJuIDAuNSAtIE1hdGguY29zKCBwKk1hdGguUEkgKSAvIDI7XG4gIH1cbn07XG5cbmpRdWVyeS50aW1lcnMgPSBbXTtcbmpRdWVyeS5meCA9IFR3ZWVuLnByb3RvdHlwZS5pbml0O1xualF1ZXJ5LmZ4LnRpY2sgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHRpbWVyLFxuICAgIHRpbWVycyA9IGpRdWVyeS50aW1lcnMsXG4gICAgaSA9IDA7XG5cbiAgZnhOb3cgPSBqUXVlcnkubm93KCk7XG5cbiAgZm9yICggOyBpIDwgdGltZXJzLmxlbmd0aDsgaSsrICkge1xuICAgIHRpbWVyID0gdGltZXJzWyBpIF07XG4gICAgLy8gQ2hlY2tzIHRoZSB0aW1lciBoYXMgbm90IGFscmVhZHkgYmVlbiByZW1vdmVkXG4gICAgaWYgKCAhdGltZXIoKSAmJiB0aW1lcnNbIGkgXSA9PT0gdGltZXIgKSB7XG4gICAgICB0aW1lcnMuc3BsaWNlKCBpLS0sIDEgKTtcbiAgICB9XG4gIH1cblxuICBpZiAoICF0aW1lcnMubGVuZ3RoICkge1xuICAgIGpRdWVyeS5meC5zdG9wKCk7XG4gIH1cbiAgZnhOb3cgPSB1bmRlZmluZWQ7XG59O1xuXG5qUXVlcnkuZngudGltZXIgPSBmdW5jdGlvbiggdGltZXIgKSB7XG4gIGlmICggdGltZXIoKSAmJiBqUXVlcnkudGltZXJzLnB1c2goIHRpbWVyICkgKSB7XG4gICAgalF1ZXJ5LmZ4LnN0YXJ0KCk7XG4gIH1cbn07XG5cbmpRdWVyeS5meC5pbnRlcnZhbCA9IDEzO1xuXG5qUXVlcnkuZnguc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCAhdGltZXJJZCApIHtcbiAgICB0aW1lcklkID0gc2V0SW50ZXJ2YWwoIGpRdWVyeS5meC50aWNrLCBqUXVlcnkuZnguaW50ZXJ2YWwgKTtcbiAgfVxufTtcblxualF1ZXJ5LmZ4LnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgY2xlYXJJbnRlcnZhbCggdGltZXJJZCApO1xuICB0aW1lcklkID0gbnVsbDtcbn07XG5cbmpRdWVyeS5meC5zcGVlZHMgPSB7XG4gIHNsb3c6IDYwMCxcbiAgZmFzdDogMjAwLFxuICAvLyBEZWZhdWx0IHNwZWVkXG4gIF9kZWZhdWx0OiA0MDBcbn07XG5cbi8vIEJhY2sgQ29tcGF0IDwxLjggZXh0ZW5zaW9uIHBvaW50XG5qUXVlcnkuZnguc3RlcCA9IHt9O1xuXG5pZiAoIGpRdWVyeS5leHByICYmIGpRdWVyeS5leHByLmZpbHRlcnMgKSB7XG4gIGpRdWVyeS5leHByLmZpbHRlcnMuYW5pbWF0ZWQgPSBmdW5jdGlvbiggZWxlbSApIHtcbiAgICByZXR1cm4galF1ZXJ5LmdyZXAoalF1ZXJ5LnRpbWVycywgZnVuY3Rpb24oIGZuICkge1xuICAgICAgcmV0dXJuIGVsZW0gPT09IGZuLmVsZW07XG4gICAgfSkubGVuZ3RoO1xuICB9O1xufVxualF1ZXJ5LmZuLm9mZnNldCA9IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuICBpZiAoIGFyZ3VtZW50cy5sZW5ndGggKSB7XG4gICAgcmV0dXJuIG9wdGlvbnMgPT09IHVuZGVmaW5lZCA/XG4gICAgICB0aGlzIDpcbiAgICAgIHRoaXMuZWFjaChmdW5jdGlvbiggaSApIHtcbiAgICAgICAgalF1ZXJ5Lm9mZnNldC5zZXRPZmZzZXQoIHRoaXMsIG9wdGlvbnMsIGkgKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgdmFyIGRvY0VsZW0sIHdpbixcbiAgICBib3ggPSB7IHRvcDogMCwgbGVmdDogMCB9LFxuICAgIGVsZW0gPSB0aGlzWyAwIF0sXG4gICAgZG9jID0gZWxlbSAmJiBlbGVtLm93bmVyRG9jdW1lbnQ7XG5cbiAgaWYgKCAhZG9jICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGRvY0VsZW0gPSBkb2MuZG9jdW1lbnRFbGVtZW50O1xuXG4gIC8vIE1ha2Ugc3VyZSBpdCdzIG5vdCBhIGRpc2Nvbm5lY3RlZCBET00gbm9kZVxuICBpZiAoICFqUXVlcnkuY29udGFpbnMoIGRvY0VsZW0sIGVsZW0gKSApIHtcbiAgICByZXR1cm4gYm94O1xuICB9XG5cbiAgLy8gSWYgd2UgZG9uJ3QgaGF2ZSBnQkNSLCBqdXN0IHVzZSAwLDAgcmF0aGVyIHRoYW4gZXJyb3JcbiAgLy8gQmxhY2tCZXJyeSA1LCBpT1MgMyAob3JpZ2luYWwgaVBob25lKVxuICBpZiAoIHR5cGVvZiBlbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCAhPT0gY29yZV9zdHJ1bmRlZmluZWQgKSB7XG4gICAgYm94ID0gZWxlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgfVxuICB3aW4gPSBnZXRXaW5kb3coIGRvYyApO1xuICByZXR1cm4ge1xuICAgIHRvcDogYm94LnRvcCAgKyAoIHdpbi5wYWdlWU9mZnNldCB8fCBkb2NFbGVtLnNjcm9sbFRvcCApICAtICggZG9jRWxlbS5jbGllbnRUb3AgIHx8IDAgKSxcbiAgICBsZWZ0OiBib3gubGVmdCArICggd2luLnBhZ2VYT2Zmc2V0IHx8IGRvY0VsZW0uc2Nyb2xsTGVmdCApIC0gKCBkb2NFbGVtLmNsaWVudExlZnQgfHwgMCApXG4gIH07XG59O1xuXG5qUXVlcnkub2Zmc2V0ID0ge1xuXG4gIHNldE9mZnNldDogZnVuY3Rpb24oIGVsZW0sIG9wdGlvbnMsIGkgKSB7XG4gICAgdmFyIHBvc2l0aW9uID0galF1ZXJ5LmNzcyggZWxlbSwgXCJwb3NpdGlvblwiICk7XG5cbiAgICAvLyBzZXQgcG9zaXRpb24gZmlyc3QsIGluLWNhc2UgdG9wL2xlZnQgYXJlIHNldCBldmVuIG9uIHN0YXRpYyBlbGVtXG4gICAgaWYgKCBwb3NpdGlvbiA9PT0gXCJzdGF0aWNcIiApIHtcbiAgICAgIGVsZW0uc3R5bGUucG9zaXRpb24gPSBcInJlbGF0aXZlXCI7XG4gICAgfVxuXG4gICAgdmFyIGN1ckVsZW0gPSBqUXVlcnkoIGVsZW0gKSxcbiAgICAgIGN1ck9mZnNldCA9IGN1ckVsZW0ub2Zmc2V0KCksXG4gICAgICBjdXJDU1NUb3AgPSBqUXVlcnkuY3NzKCBlbGVtLCBcInRvcFwiICksXG4gICAgICBjdXJDU1NMZWZ0ID0galF1ZXJ5LmNzcyggZWxlbSwgXCJsZWZ0XCIgKSxcbiAgICAgIGNhbGN1bGF0ZVBvc2l0aW9uID0gKCBwb3NpdGlvbiA9PT0gXCJhYnNvbHV0ZVwiIHx8IHBvc2l0aW9uID09PSBcImZpeGVkXCIgKSAmJiBqUXVlcnkuaW5BcnJheShcImF1dG9cIiwgW2N1ckNTU1RvcCwgY3VyQ1NTTGVmdF0pID4gLTEsXG4gICAgICBwcm9wcyA9IHt9LCBjdXJQb3NpdGlvbiA9IHt9LCBjdXJUb3AsIGN1ckxlZnQ7XG5cbiAgICAvLyBuZWVkIHRvIGJlIGFibGUgdG8gY2FsY3VsYXRlIHBvc2l0aW9uIGlmIGVpdGhlciB0b3Agb3IgbGVmdCBpcyBhdXRvIGFuZCBwb3NpdGlvbiBpcyBlaXRoZXIgYWJzb2x1dGUgb3IgZml4ZWRcbiAgICBpZiAoIGNhbGN1bGF0ZVBvc2l0aW9uICkge1xuICAgICAgY3VyUG9zaXRpb24gPSBjdXJFbGVtLnBvc2l0aW9uKCk7XG4gICAgICBjdXJUb3AgPSBjdXJQb3NpdGlvbi50b3A7XG4gICAgICBjdXJMZWZ0ID0gY3VyUG9zaXRpb24ubGVmdDtcbiAgICB9IGVsc2Uge1xuICAgICAgY3VyVG9wID0gcGFyc2VGbG9hdCggY3VyQ1NTVG9wICkgfHwgMDtcbiAgICAgIGN1ckxlZnQgPSBwYXJzZUZsb2F0KCBjdXJDU1NMZWZ0ICkgfHwgMDtcbiAgICB9XG5cbiAgICBpZiAoIGpRdWVyeS5pc0Z1bmN0aW9uKCBvcHRpb25zICkgKSB7XG4gICAgICBvcHRpb25zID0gb3B0aW9ucy5jYWxsKCBlbGVtLCBpLCBjdXJPZmZzZXQgKTtcbiAgICB9XG5cbiAgICBpZiAoIG9wdGlvbnMudG9wICE9IG51bGwgKSB7XG4gICAgICBwcm9wcy50b3AgPSAoIG9wdGlvbnMudG9wIC0gY3VyT2Zmc2V0LnRvcCApICsgY3VyVG9wO1xuICAgIH1cbiAgICBpZiAoIG9wdGlvbnMubGVmdCAhPSBudWxsICkge1xuICAgICAgcHJvcHMubGVmdCA9ICggb3B0aW9ucy5sZWZ0IC0gY3VyT2Zmc2V0LmxlZnQgKSArIGN1ckxlZnQ7XG4gICAgfVxuXG4gICAgaWYgKCBcInVzaW5nXCIgaW4gb3B0aW9ucyApIHtcbiAgICAgIG9wdGlvbnMudXNpbmcuY2FsbCggZWxlbSwgcHJvcHMgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY3VyRWxlbS5jc3MoIHByb3BzICk7XG4gICAgfVxuICB9XG59O1xuXG5cbmpRdWVyeS5mbi5leHRlbmQoe1xuXG4gIHBvc2l0aW9uOiBmdW5jdGlvbigpIHtcbiAgICBpZiAoICF0aGlzWyAwIF0gKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIG9mZnNldFBhcmVudCwgb2Zmc2V0LFxuICAgICAgcGFyZW50T2Zmc2V0ID0geyB0b3A6IDAsIGxlZnQ6IDAgfSxcbiAgICAgIGVsZW0gPSB0aGlzWyAwIF07XG5cbiAgICAvLyBmaXhlZCBlbGVtZW50cyBhcmUgb2Zmc2V0IGZyb20gd2luZG93IChwYXJlbnRPZmZzZXQgPSB7dG9wOjAsIGxlZnQ6IDB9LCBiZWNhdXNlIGl0IGlzIGl0J3Mgb25seSBvZmZzZXQgcGFyZW50XG4gICAgaWYgKCBqUXVlcnkuY3NzKCBlbGVtLCBcInBvc2l0aW9uXCIgKSA9PT0gXCJmaXhlZFwiICkge1xuICAgICAgLy8gd2UgYXNzdW1lIHRoYXQgZ2V0Qm91bmRpbmdDbGllbnRSZWN0IGlzIGF2YWlsYWJsZSB3aGVuIGNvbXB1dGVkIHBvc2l0aW9uIGlzIGZpeGVkXG4gICAgICBvZmZzZXQgPSBlbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBHZXQgKnJlYWwqIG9mZnNldFBhcmVudFxuICAgICAgb2Zmc2V0UGFyZW50ID0gdGhpcy5vZmZzZXRQYXJlbnQoKTtcblxuICAgICAgLy8gR2V0IGNvcnJlY3Qgb2Zmc2V0c1xuICAgICAgb2Zmc2V0ID0gdGhpcy5vZmZzZXQoKTtcbiAgICAgIGlmICggIWpRdWVyeS5ub2RlTmFtZSggb2Zmc2V0UGFyZW50WyAwIF0sIFwiaHRtbFwiICkgKSB7XG4gICAgICAgIHBhcmVudE9mZnNldCA9IG9mZnNldFBhcmVudC5vZmZzZXQoKTtcbiAgICAgIH1cblxuICAgICAgLy8gQWRkIG9mZnNldFBhcmVudCBib3JkZXJzXG4gICAgICBwYXJlbnRPZmZzZXQudG9wICArPSBqUXVlcnkuY3NzKCBvZmZzZXRQYXJlbnRbIDAgXSwgXCJib3JkZXJUb3BXaWR0aFwiLCB0cnVlICk7XG4gICAgICBwYXJlbnRPZmZzZXQubGVmdCArPSBqUXVlcnkuY3NzKCBvZmZzZXRQYXJlbnRbIDAgXSwgXCJib3JkZXJMZWZ0V2lkdGhcIiwgdHJ1ZSApO1xuICAgIH1cblxuICAgIC8vIFN1YnRyYWN0IHBhcmVudCBvZmZzZXRzIGFuZCBlbGVtZW50IG1hcmdpbnNcbiAgICAvLyBub3RlOiB3aGVuIGFuIGVsZW1lbnQgaGFzIG1hcmdpbjogYXV0byB0aGUgb2Zmc2V0TGVmdCBhbmQgbWFyZ2luTGVmdFxuICAgIC8vIGFyZSB0aGUgc2FtZSBpbiBTYWZhcmkgY2F1c2luZyBvZmZzZXQubGVmdCB0byBpbmNvcnJlY3RseSBiZSAwXG4gICAgcmV0dXJuIHtcbiAgICAgIHRvcDogIG9mZnNldC50b3AgIC0gcGFyZW50T2Zmc2V0LnRvcCAtIGpRdWVyeS5jc3MoIGVsZW0sIFwibWFyZ2luVG9wXCIsIHRydWUgKSxcbiAgICAgIGxlZnQ6IG9mZnNldC5sZWZ0IC0gcGFyZW50T2Zmc2V0LmxlZnQgLSBqUXVlcnkuY3NzKCBlbGVtLCBcIm1hcmdpbkxlZnRcIiwgdHJ1ZSlcbiAgICB9O1xuICB9LFxuXG4gIG9mZnNldFBhcmVudDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG9mZnNldFBhcmVudCA9IHRoaXMub2Zmc2V0UGFyZW50IHx8IGRvY0VsZW07XG4gICAgICB3aGlsZSAoIG9mZnNldFBhcmVudCAmJiAoICFqUXVlcnkubm9kZU5hbWUoIG9mZnNldFBhcmVudCwgXCJodG1sXCIgKSAmJiBqUXVlcnkuY3NzKCBvZmZzZXRQYXJlbnQsIFwicG9zaXRpb25cIikgPT09IFwic3RhdGljXCIgKSApIHtcbiAgICAgICAgb2Zmc2V0UGFyZW50ID0gb2Zmc2V0UGFyZW50Lm9mZnNldFBhcmVudDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvZmZzZXRQYXJlbnQgfHwgZG9jRWxlbTtcbiAgICB9KTtcbiAgfVxufSk7XG5cblxuLy8gQ3JlYXRlIHNjcm9sbExlZnQgYW5kIHNjcm9sbFRvcCBtZXRob2RzXG5qUXVlcnkuZWFjaCgge3Njcm9sbExlZnQ6IFwicGFnZVhPZmZzZXRcIiwgc2Nyb2xsVG9wOiBcInBhZ2VZT2Zmc2V0XCJ9LCBmdW5jdGlvbiggbWV0aG9kLCBwcm9wICkge1xuICB2YXIgdG9wID0gL1kvLnRlc3QoIHByb3AgKTtcblxuICBqUXVlcnkuZm5bIG1ldGhvZCBdID0gZnVuY3Rpb24oIHZhbCApIHtcbiAgICByZXR1cm4galF1ZXJ5LmFjY2VzcyggdGhpcywgZnVuY3Rpb24oIGVsZW0sIG1ldGhvZCwgdmFsICkge1xuICAgICAgdmFyIHdpbiA9IGdldFdpbmRvdyggZWxlbSApO1xuXG4gICAgICBpZiAoIHZhbCA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICByZXR1cm4gd2luID8gKHByb3AgaW4gd2luKSA/IHdpblsgcHJvcCBdIDpcbiAgICAgICAgICB3aW4uZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50WyBtZXRob2QgXSA6XG4gICAgICAgICAgZWxlbVsgbWV0aG9kIF07XG4gICAgICB9XG5cbiAgICAgIGlmICggd2luICkge1xuICAgICAgICB3aW4uc2Nyb2xsVG8oXG4gICAgICAgICAgIXRvcCA/IHZhbCA6IGpRdWVyeSggd2luICkuc2Nyb2xsTGVmdCgpLFxuICAgICAgICAgIHRvcCA/IHZhbCA6IGpRdWVyeSggd2luICkuc2Nyb2xsVG9wKClcbiAgICAgICAgKTtcblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZWxlbVsgbWV0aG9kIF0gPSB2YWw7XG4gICAgICB9XG4gICAgfSwgbWV0aG9kLCB2YWwsIGFyZ3VtZW50cy5sZW5ndGgsIG51bGwgKTtcbiAgfTtcbn0pO1xuXG5mdW5jdGlvbiBnZXRXaW5kb3coIGVsZW0gKSB7XG4gIHJldHVybiBqUXVlcnkuaXNXaW5kb3coIGVsZW0gKSA/XG4gICAgZWxlbSA6XG4gICAgZWxlbS5ub2RlVHlwZSA9PT0gOSA/XG4gICAgICBlbGVtLmRlZmF1bHRWaWV3IHx8IGVsZW0ucGFyZW50V2luZG93IDpcbiAgICAgIGZhbHNlO1xufVxuLy8gQ3JlYXRlIGlubmVySGVpZ2h0LCBpbm5lcldpZHRoLCBoZWlnaHQsIHdpZHRoLCBvdXRlckhlaWdodCBhbmQgb3V0ZXJXaWR0aCBtZXRob2RzXG5qUXVlcnkuZWFjaCggeyBIZWlnaHQ6IFwiaGVpZ2h0XCIsIFdpZHRoOiBcIndpZHRoXCIgfSwgZnVuY3Rpb24oIG5hbWUsIHR5cGUgKSB7XG4gIGpRdWVyeS5lYWNoKCB7IHBhZGRpbmc6IFwiaW5uZXJcIiArIG5hbWUsIGNvbnRlbnQ6IHR5cGUsIFwiXCI6IFwib3V0ZXJcIiArIG5hbWUgfSwgZnVuY3Rpb24oIGRlZmF1bHRFeHRyYSwgZnVuY05hbWUgKSB7XG4gICAgLy8gbWFyZ2luIGlzIG9ubHkgZm9yIG91dGVySGVpZ2h0LCBvdXRlcldpZHRoXG4gICAgalF1ZXJ5LmZuWyBmdW5jTmFtZSBdID0gZnVuY3Rpb24oIG1hcmdpbiwgdmFsdWUgKSB7XG4gICAgICB2YXIgY2hhaW5hYmxlID0gYXJndW1lbnRzLmxlbmd0aCAmJiAoIGRlZmF1bHRFeHRyYSB8fCB0eXBlb2YgbWFyZ2luICE9PSBcImJvb2xlYW5cIiApLFxuICAgICAgICBleHRyYSA9IGRlZmF1bHRFeHRyYSB8fCAoIG1hcmdpbiA9PT0gdHJ1ZSB8fCB2YWx1ZSA9PT0gdHJ1ZSA/IFwibWFyZ2luXCIgOiBcImJvcmRlclwiICk7XG5cbiAgICAgIHJldHVybiBqUXVlcnkuYWNjZXNzKCB0aGlzLCBmdW5jdGlvbiggZWxlbSwgdHlwZSwgdmFsdWUgKSB7XG4gICAgICAgIHZhciBkb2M7XG5cbiAgICAgICAgaWYgKCBqUXVlcnkuaXNXaW5kb3coIGVsZW0gKSApIHtcbiAgICAgICAgICAvLyBBcyBvZiA1LzgvMjAxMiB0aGlzIHdpbGwgeWllbGQgaW5jb3JyZWN0IHJlc3VsdHMgZm9yIE1vYmlsZSBTYWZhcmksIGJ1dCB0aGVyZVxuICAgICAgICAgIC8vIGlzbid0IGEgd2hvbGUgbG90IHdlIGNhbiBkby4gU2VlIHB1bGwgcmVxdWVzdCBhdCB0aGlzIFVSTCBmb3IgZGlzY3Vzc2lvbjpcbiAgICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vanF1ZXJ5L2pxdWVyeS9wdWxsLzc2NFxuICAgICAgICAgIHJldHVybiBlbGVtLmRvY3VtZW50LmRvY3VtZW50RWxlbWVudFsgXCJjbGllbnRcIiArIG5hbWUgXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdldCBkb2N1bWVudCB3aWR0aCBvciBoZWlnaHRcbiAgICAgICAgaWYgKCBlbGVtLm5vZGVUeXBlID09PSA5ICkge1xuICAgICAgICAgIGRvYyA9IGVsZW0uZG9jdW1lbnRFbGVtZW50O1xuXG4gICAgICAgICAgLy8gRWl0aGVyIHNjcm9sbFtXaWR0aC9IZWlnaHRdIG9yIG9mZnNldFtXaWR0aC9IZWlnaHRdIG9yIGNsaWVudFtXaWR0aC9IZWlnaHRdLCB3aGljaGV2ZXIgaXMgZ3JlYXRlc3RcbiAgICAgICAgICAvLyB1bmZvcnR1bmF0ZWx5LCB0aGlzIGNhdXNlcyBidWcgIzM4MzggaW4gSUU2Lzggb25seSwgYnV0IHRoZXJlIGlzIGN1cnJlbnRseSBubyBnb29kLCBzbWFsbCB3YXkgdG8gZml4IGl0LlxuICAgICAgICAgIHJldHVybiBNYXRoLm1heChcbiAgICAgICAgICAgIGVsZW0uYm9keVsgXCJzY3JvbGxcIiArIG5hbWUgXSwgZG9jWyBcInNjcm9sbFwiICsgbmFtZSBdLFxuICAgICAgICAgICAgZWxlbS5ib2R5WyBcIm9mZnNldFwiICsgbmFtZSBdLCBkb2NbIFwib2Zmc2V0XCIgKyBuYW1lIF0sXG4gICAgICAgICAgICBkb2NbIFwiY2xpZW50XCIgKyBuYW1lIF1cbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHZhbHVlID09PSB1bmRlZmluZWQgP1xuICAgICAgICAgIC8vIEdldCB3aWR0aCBvciBoZWlnaHQgb24gdGhlIGVsZW1lbnQsIHJlcXVlc3RpbmcgYnV0IG5vdCBmb3JjaW5nIHBhcnNlRmxvYXRcbiAgICAgICAgICBqUXVlcnkuY3NzKCBlbGVtLCB0eXBlLCBleHRyYSApIDpcblxuICAgICAgICAgIC8vIFNldCB3aWR0aCBvciBoZWlnaHQgb24gdGhlIGVsZW1lbnRcbiAgICAgICAgICBqUXVlcnkuc3R5bGUoIGVsZW0sIHR5cGUsIHZhbHVlLCBleHRyYSApO1xuICAgICAgfSwgdHlwZSwgY2hhaW5hYmxlID8gbWFyZ2luIDogdW5kZWZpbmVkLCBjaGFpbmFibGUsIG51bGwgKTtcbiAgICB9O1xuICB9KTtcbn0pO1xuLy8gTGltaXQgc2NvcGUgcG9sbHV0aW9uIGZyb20gYW55IGRlcHJlY2F0ZWQgQVBJXG4vLyAoZnVuY3Rpb24oKSB7XG5cbi8vIFRoZSBudW1iZXIgb2YgZWxlbWVudHMgY29udGFpbmVkIGluIHRoZSBtYXRjaGVkIGVsZW1lbnQgc2V0XG5qUXVlcnkuZm4uc2l6ZSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5sZW5ndGg7XG59O1xuXG5qUXVlcnkuZm4uYW5kU2VsZiA9IGpRdWVyeS5mbi5hZGRCYWNrO1xuXG4vLyB9KSgpO1xuaWYgKCB0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIG1vZHVsZSAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwib2JqZWN0XCIgKSB7XG4gIC8vIEV4cG9zZSBqUXVlcnkgYXMgbW9kdWxlLmV4cG9ydHMgaW4gbG9hZGVycyB0aGF0IGltcGxlbWVudCB0aGUgTm9kZVxuICAvLyBtb2R1bGUgcGF0dGVybiAoaW5jbHVkaW5nIGJyb3dzZXJpZnkpLiBEbyBub3QgY3JlYXRlIHRoZSBnbG9iYWwsIHNpbmNlXG4gIC8vIHRoZSB1c2VyIHdpbGwgYmUgc3RvcmluZyBpdCB0aGVtc2VsdmVzIGxvY2FsbHksIGFuZCBnbG9iYWxzIGFyZSBmcm93bmVkXG4gIC8vIHVwb24gaW4gdGhlIE5vZGUgbW9kdWxlIHdvcmxkLlxuICBtb2R1bGUuZXhwb3J0cyA9IGpRdWVyeTtcbn0gZWxzZSB7XG4gIC8vIE90aGVyd2lzZSBleHBvc2UgalF1ZXJ5IHRvIHRoZSBnbG9iYWwgb2JqZWN0IGFzIHVzdWFsXG4gIHdpbmRvdy5qUXVlcnkgPSB3aW5kb3cuJCA9IGpRdWVyeTtcblxuICAvLyBSZWdpc3RlciBhcyBhIG5hbWVkIEFNRCBtb2R1bGUsIHNpbmNlIGpRdWVyeSBjYW4gYmUgY29uY2F0ZW5hdGVkIHdpdGggb3RoZXJcbiAgLy8gZmlsZXMgdGhhdCBtYXkgdXNlIGRlZmluZSwgYnV0IG5vdCB2aWEgYSBwcm9wZXIgY29uY2F0ZW5hdGlvbiBzY3JpcHQgdGhhdFxuICAvLyB1bmRlcnN0YW5kcyBhbm9ueW1vdXMgQU1EIG1vZHVsZXMuIEEgbmFtZWQgQU1EIGlzIHNhZmVzdCBhbmQgbW9zdCByb2J1c3RcbiAgLy8gd2F5IHRvIHJlZ2lzdGVyLiBMb3dlcmNhc2UganF1ZXJ5IGlzIHVzZWQgYmVjYXVzZSBBTUQgbW9kdWxlIG5hbWVzIGFyZVxuICAvLyBkZXJpdmVkIGZyb20gZmlsZSBuYW1lcywgYW5kIGpRdWVyeSBpcyBub3JtYWxseSBkZWxpdmVyZWQgaW4gYSBsb3dlcmNhc2VcbiAgLy8gZmlsZSBuYW1lLiBEbyB0aGlzIGFmdGVyIGNyZWF0aW5nIHRoZSBnbG9iYWwgc28gdGhhdCBpZiBhbiBBTUQgbW9kdWxlIHdhbnRzXG4gIC8vIHRvIGNhbGwgbm9Db25mbGljdCB0byBoaWRlIHRoaXMgdmVyc2lvbiBvZiBqUXVlcnksIGl0IHdpbGwgd29yay5cbiAgaWYgKCB0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCApIHtcbiAgICBkZWZpbmUoIFwianF1ZXJ5XCIsIFtdLCBmdW5jdGlvbiAoKSB7IHJldHVybiBqUXVlcnk7IH0gKTtcbiAgfVxufVxuXG59KSggd2luZG93ICk7IiwidmFyIGdsb2JhbD10eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge307KGZ1bmN0aW9uIGJyb3dzZXJpZnlTaGltKG1vZHVsZSwgZGVmaW5lKSB7XG5cbjsgZ2xvYmFsLmpRdWVyeSA9IHJlcXVpcmUoXCJqUXVlcnlcIik7XG4vKipcbiAqIENvcHlyaWdodCAoYykgMjAwNy0yMDEzIEFyaWVsIEZsZXNsZXIgLSBhZmxlc2xlcjxhPmdtYWlsPGQ+Y29tIHwgaHR0cDovL2ZsZXNsZXIuYmxvZ3Nwb3QuY29tXG4gKiBEdWFsIGxpY2Vuc2VkIHVuZGVyIE1JVCBhbmQgR1BMLlxuICogQGF1dGhvciBBcmllbCBGbGVzbGVyXG4gKiBAdmVyc2lvbiAxLjQuNVxuICovXG47KGZ1bmN0aW9uKCQpe3ZhciBoPSQuc2Nyb2xsVG89ZnVuY3Rpb24oYSxiLGMpeyQod2luZG93KS5zY3JvbGxUbyhhLGIsYyl9O2guZGVmYXVsdHM9e2F4aXM6J3h5JyxkdXJhdGlvbjpwYXJzZUZsb2F0KCQuZm4uanF1ZXJ5KT49MS4zPzA6MSxsaW1pdDp0cnVlfTtoLndpbmRvdz1mdW5jdGlvbihhKXtyZXR1cm4gJCh3aW5kb3cpLl9zY3JvbGxhYmxlKCl9OyQuZm4uX3Njcm9sbGFibGU9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24oKXt2YXIgYT10aGlzLGlzV2luPSFhLm5vZGVOYW1lfHwkLmluQXJyYXkoYS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpLFsnaWZyYW1lJywnI2RvY3VtZW50JywnaHRtbCcsJ2JvZHknXSkhPS0xO2lmKCFpc1dpbilyZXR1cm4gYTt2YXIgYj0oYS5jb250ZW50V2luZG93fHxhKS5kb2N1bWVudHx8YS5vd25lckRvY3VtZW50fHxhO3JldHVybi93ZWJraXQvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpfHxiLmNvbXBhdE1vZGU9PSdCYWNrQ29tcGF0Jz9iLmJvZHk6Yi5kb2N1bWVudEVsZW1lbnR9KX07JC5mbi5zY3JvbGxUbz1mdW5jdGlvbihlLGYsZyl7aWYodHlwZW9mIGY9PSdvYmplY3QnKXtnPWY7Zj0wfWlmKHR5cGVvZiBnPT0nZnVuY3Rpb24nKWc9e29uQWZ0ZXI6Z307aWYoZT09J21heCcpZT05ZTk7Zz0kLmV4dGVuZCh7fSxoLmRlZmF1bHRzLGcpO2Y9Znx8Zy5kdXJhdGlvbjtnLnF1ZXVlPWcucXVldWUmJmcuYXhpcy5sZW5ndGg+MTtpZihnLnF1ZXVlKWYvPTI7Zy5vZmZzZXQ9Ym90aChnLm9mZnNldCk7Zy5vdmVyPWJvdGgoZy5vdmVyKTtyZXR1cm4gdGhpcy5fc2Nyb2xsYWJsZSgpLmVhY2goZnVuY3Rpb24oKXtpZihlPT1udWxsKXJldHVybjt2YXIgZD10aGlzLCRlbGVtPSQoZCksdGFyZz1lLHRvZmYsYXR0cj17fSx3aW49JGVsZW0uaXMoJ2h0bWwsYm9keScpO3N3aXRjaCh0eXBlb2YgdGFyZyl7Y2FzZSdudW1iZXInOmNhc2Unc3RyaW5nJzppZigvXihbKy1dPT8pP1xcZCsoXFwuXFxkKyk/KHB4fCUpPyQvLnRlc3QodGFyZykpe3Rhcmc9Ym90aCh0YXJnKTticmVha310YXJnPSQodGFyZyx0aGlzKTtpZighdGFyZy5sZW5ndGgpcmV0dXJuO2Nhc2Unb2JqZWN0JzppZih0YXJnLmlzfHx0YXJnLnN0eWxlKXRvZmY9KHRhcmc9JCh0YXJnKSkub2Zmc2V0KCl9JC5lYWNoKGcuYXhpcy5zcGxpdCgnJyksZnVuY3Rpb24oaSxhKXt2YXIgYj1hPT0neCc/J0xlZnQnOidUb3AnLHBvcz1iLnRvTG93ZXJDYXNlKCksa2V5PSdzY3JvbGwnK2Isb2xkPWRba2V5XSxtYXg9aC5tYXgoZCxhKTtpZih0b2ZmKXthdHRyW2tleV09dG9mZltwb3NdKyh3aW4/MDpvbGQtJGVsZW0ub2Zmc2V0KClbcG9zXSk7aWYoZy5tYXJnaW4pe2F0dHJba2V5XS09cGFyc2VJbnQodGFyZy5jc3MoJ21hcmdpbicrYikpfHwwO2F0dHJba2V5XS09cGFyc2VJbnQodGFyZy5jc3MoJ2JvcmRlcicrYisnV2lkdGgnKSl8fDB9YXR0cltrZXldKz1nLm9mZnNldFtwb3NdfHwwO2lmKGcub3Zlcltwb3NdKWF0dHJba2V5XSs9dGFyZ1thPT0neCc/J3dpZHRoJzonaGVpZ2h0J10oKSpnLm92ZXJbcG9zXX1lbHNle3ZhciBjPXRhcmdbcG9zXTthdHRyW2tleV09Yy5zbGljZSYmYy5zbGljZSgtMSk9PSclJz9wYXJzZUZsb2F0KGMpLzEwMCptYXg6Y31pZihnLmxpbWl0JiYvXlxcZCskLy50ZXN0KGF0dHJba2V5XSkpYXR0cltrZXldPWF0dHJba2V5XTw9MD8wOk1hdGgubWluKGF0dHJba2V5XSxtYXgpO2lmKCFpJiZnLnF1ZXVlKXtpZihvbGQhPWF0dHJba2V5XSlhbmltYXRlKGcub25BZnRlckZpcnN0KTtkZWxldGUgYXR0cltrZXldfX0pO2FuaW1hdGUoZy5vbkFmdGVyKTtmdW5jdGlvbiBhbmltYXRlKGEpeyRlbGVtLmFuaW1hdGUoYXR0cixmLGcuZWFzaW5nLGEmJmZ1bmN0aW9uKCl7YS5jYWxsKHRoaXMsZSxnKX0pfX0pLmVuZCgpfTtoLm1heD1mdW5jdGlvbihhLGIpe3ZhciBjPWI9PSd4Jz8nV2lkdGgnOidIZWlnaHQnLHNjcm9sbD0nc2Nyb2xsJytjO2lmKCEkKGEpLmlzKCdodG1sLGJvZHknKSlyZXR1cm4gYVtzY3JvbGxdLSQoYSlbYy50b0xvd2VyQ2FzZSgpXSgpO3ZhciBkPSdjbGllbnQnK2MsaHRtbD1hLm93bmVyRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LGJvZHk9YS5vd25lckRvY3VtZW50LmJvZHk7cmV0dXJuIE1hdGgubWF4KGh0bWxbc2Nyb2xsXSxib2R5W3Njcm9sbF0pLU1hdGgubWluKGh0bWxbZF0sYm9keVtkXSl9O2Z1bmN0aW9uIGJvdGgoYSl7cmV0dXJuIHR5cGVvZiBhPT0nb2JqZWN0Jz9hOnt0b3A6YSxsZWZ0OmF9fX0pKGpRdWVyeSk7XG59KS5jYWxsKGdsb2JhbCwgbW9kdWxlLCB1bmRlZmluZWQpO1xuIiwiLyoqXG4gIEBmaWxlb3ZlcnZpZXcgZW50cnkgcG9pbnQgZm9yIHZlbmRvciBsaWJyYXJpZXNcbioqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnJlcXVpcmUoJ2Jvb3RzdHJhcCcpO1xuIl19
;