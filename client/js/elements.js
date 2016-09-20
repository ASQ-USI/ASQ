'use strict';

module.exports = {
  setRole: function(role) {
    var allAsqElements = this.getASQElements();
    allAsqElements.forEach(function(elem, index) {
      elem.role = role;
    });
  },

  getASQElements: function() {
    var allAsqElements = document.querySelectorAll('*');
    allAsqElements = Array.prototype.slice.call(allAsqElements).filter(function(el) {
      return this.isASQEl(el);
    }.bind(this));

    return allAsqElements;
  },

   isASQEl: function(el) {
    return (el.isASQElement === true)
  } 
}
