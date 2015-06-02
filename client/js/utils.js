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
  }
}