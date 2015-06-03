/** @module client/js/views/menu
    @description front-end logic for menu.dust
*/
'use strict';

module.exports = function menuDOMBinder(){
  $(function(){
    $('#logoutAnchor').on('click.asq.logout', function(){
      $('#logoutForm').submit()
    })
  })
}