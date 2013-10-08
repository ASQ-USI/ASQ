module.exports = {
  isBrowser : function() {
    var types=['[object global]', '[object Window]'];
    return ( typeof window !== 'undefined' 
            && types.indexOf(({}).toString.call(window)) != -1);
  } 
}