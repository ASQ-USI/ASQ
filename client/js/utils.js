/** @module client/js/utils
    @description Various front-end utilities
*/

'use strict';

module.exports = {
  selectText: function(el) {
    if(!el) throw new Error("selectText(): expecting non empty element");

    var range, selection;

    if (document.body.createTextRange) {
      range = document.body.createTextRange();
      range.moveToElementText(el);
      range.select();
    } else if (window.getSelection) {
      selection = window.getSelection();        
      range = document.createRange();
      range.selectNodeContents(el);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  },

  showIOSInstallAsApp: function(){
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
      document.removeEventListener("touchstart", hidePopover, false);
    };
  },

  hide: function (el){
    if(!el) throw Error("hide: expects a DOM Element as an argument ")
    el.style.display = 'none';
  },

  show: function (el){
    if(!el) throw Error("show: expects a DOM Element as an argument ")
    el.style.display = 'block';
  },

  matches: function(el, selector) {
    return (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector).call(el, selector);
  },

  /**
   * Get the closest DOM element up the tree that matches the selector
   * @param  {Node} elem The base element
   * @param  {String} selector The class, id, data attribute, or tag to look for
   * @return {Node} Null if no match
   */
  prependHtml : function(val, parent) {
    var div = document.createElement("div");
    div.innerHTML = val;

    if(! parent.childNodes.length){
      return Array.prototype.forEach.call(div.childNodes, function(node, index){
       parent.append(node);
     });
    }

    Array.prototype.forEach.call(div.childNodes, function(node, index){
      parent.insertBefore(node, parent.childNodes[index])
    });
  },

  /**
   * Get the closest DOM element up the tree that matches the selector
   * @param  {Node} elem The base element
   * @param  {String} selector The class, id, data attribute, or tag to look for
   * @return {Node} Null if no match
   */
  getClosest : function(element, selector) {
    for (; element && element !== document; element = element.parentNode) {
      if (this.matches(element, selector)) {
        return element;
      }
    }

    return false;
  },

  /**
   * Get all DOM elements up that match the selector
   * @param  {Node} elem The base element
   * @param  {String} the css selector to look for
   * @return {Array} Null if no match
   * taken from: http://gomakethings.com/climbing-up-and-down-the-dom-tree-with-vanilla-javascript/
   */
  getParents : function(element, selector) {
    var parents = [];

    for (; element && element !== document; element = element.parentNode) {
      if (!selector || (selector && this.matches(element, selector))) {
        parents.push(element);
      }
    }

    if (parents.length) {
      return parents;
    }

    return null;
  },

  on : function(element, eventName, selector, fn) {

    element.addEventListener(eventName, function(event) {
      var possibleTargets = element.querySelectorAll(selector);
      var target = event.target;

      for (var i = 0, l = possibleTargets.length; i < l; i++) {
          var el = target;
          var p = possibleTargets[i];

          while(el && el !== element) {
            if (el === p) {
              return fn.call(p, event);
            }

            el = el.parentNode;
          }
      }
    });
  }
}