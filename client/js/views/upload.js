/** @module client/js/views/upload
    @description front-end logic for upload.dust
*/
'use strict';
var debug = require('bows')("js/views/upload");
var menuDOMBinder = require('./menu');

module.exports = {
  init: function(){
    //init main menu
    menuDOMBinder();

    //disable no-touch classes
    if ('ontouchstart' in document) {
      $('body').removeClass('no-touch');
    }

    $(function(){
      $(document).on('change', '.btn-file :file', function() {
        var input = $(this),
            numFiles = input.get(0).files ? input.get(0).files.length : 1,
            label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
        input.trigger('fileselect', [numFiles, label]);
      });

      $('.btn-file :file').on('fileselect', function(event, numFiles, label) {
          
          var input = $(this).parents('.input-group').find(':text'),
              log = numFiles > 1 ? numFiles + ' files selected' : label;
          
          if( input.length ) {
              input.val(log);
          } else {
              if( log ) alert(log);
          }
      });
    });
  }
}
