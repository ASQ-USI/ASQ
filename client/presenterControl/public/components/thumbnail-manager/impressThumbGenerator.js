var debug = require('bows')("impressThumbGenerator")
module.exports = function(opts){
  var impressEl = null
    , options = opts
    , thumbs = [];


  var resizeConf = {
    width: "360",
    height: "240"
  }

  // sels for thumbs and containers
  sels = {
    thumbContainerClass  : "thumb",
    slideThumbClass : "thumb-step"
  };

  /** @function _validateAndSetOptions
  *   @description: validates external options and, if valid, overrides defaults
  */
  function _validateAndSetOptions(options){
    if(!options){return;}

    if(options.impressEl){
      impressEl = options.impressEl
    }else{
      impressEl = document;
    }

    if(options.resize){
      if("undefined" === typeof options.resize.width && "undefined" === typeof options.resize.width){
        debug("options.resize object needs at least one of the following properties: width, height");
      }else if("undefined" !== typeof options.resize.width && isNaN(parseInt(options.resize.width))){
        debug("options.resize.width should be a number");
      }else if("undefined" !== typeof options.resize.height && isNaN(parseInt(options.resize.height))){
        debug("options.resize.height should be a number");
      }else{
        resizeConf = options.resize
      }
    }

    if(options.sels){
      for (var key in sels){
        if( options.sels[key]){
          if(!(typeof options.sels[key] == "string")){
            console.log("_validateAndSetOptions(): options.sels." + key + " should be a string")
            return;
          }else{
            sels[key] = options.sels[key];
          }
        } 
      }
    }
  }

  /** @function createThumb
  *   @description: creates a clone of the original element,
  *   appends '-clone' to the original id and removes any
  *   classes for the cloned element and its children.
  *   iIt also adds a data-references attribute to the referenced
  *   step and sets the transform-origin css property.
  */
  function createThumb(slide){

    var slide_classes = slide.classList;
    var saved_slide_classes = [];

    for (var i = 0; i< slide_classes.length; i++) {
      var c = slide_classes[i];
      if (c.match("(^future|^past|^present|^active)")) {
        saved_slide_classes.push(c);
      }
    }

    //remove classes
    saved_slide_classes.forEach(function removeClasses(saved_slide_class){
      slide.classList.remove(saved_slide_class)
    });
    // make every slide look like its the current one
    slide.classList.add("active");
    slide.classList.add("present");

    var clone = slide.cloneNode(true)
    , cloneId = clone.id

    , styles = {
        "-webkit-touch-callout" : "",
        "-webkit-user-select" : "",
        "-khtml-user-select" : "",
        "-moz-user-select" : "",
        "-ms-user-select" : "",
        "user-select" : "",
        "pointer-events" : "none",
        "opacity": "1"
    };

    //change id only if not empty
    clone.id = (cloneId === undefined || cloneId == '') 
      ? '' 
      : cloneId + "-clone";
    clone.classList.add(sels.slideThumbClass);

    //copy original computed style
    setStylesFromObject(clone, _css(slide));
    setStylesFromObject(clone, styles);

    //add reference to original slide
    clone.dataset.references = slide.id;
    
    //set transform orign property
    clone.style["-webkit-transform-origin"] = "0 0";

    var cloneChildren = clone.querySelectorAll('*').array();
    //copy original computed style for children
    slide.querySelectorAll('*').array().forEach(function copyComputedStyleForChildren(el , index){

      var child = cloneChildren[index];
      var id = child.id;
      child.removeAttribute('id');
      child.removeAttribute('class');

       //copy original computed style
      setStylesFromObject(child, _css(el));
      setStylesFromObject(child, styles)

    });

    //revert style to original slide
    saved_slide_classes.forEach(function revertStyles(saved_slide_class){

    });   

    return clone;
  }

  /** @function resizeThumb
  *   @description: resizes a thumbs to fit specified width and height (in pixels) or both
  */
  function resizeThumb(thumb, options){
    //copy resizeConf
    var strategy = JSON.parse(JSON.stringify(resizeConf))
    if("undefined" !== typeof options){
      if("undefined" === typeof options.width && "undefined" === typeof options.height){
        debug("options object needs at least one of the following properties: width, height")
      }else if("undefined" !== typeof options.width && isNaN(parseInt(options.width))){
        debug("options.width should be a number")
      }else if("undefined" !== typeof options.height && isNaN(parseInt(options.height))){
        debug("options.height should be a number")
      }else{
        strategy = options
      }
    }
 
    var scaleFactor= 1.0
      , fixedWrapper = false;

    //need to fit to the exact size
    if("undefined" !== typeof strategy.width 
      && "undefined" !== typeof strategy.height)
    {
      fixedWrapper = true;
      var thumbContentWidth = parseInt(strategy.width)
        , thumbContentHeight = parseInt(strategy.height)
        , contentRatio = thumbContentWidth / thumbContentHeight
        , thumbRatio = thumb.offsetWidth / thumb.offsetHeight;

      //thumb wrapper has defined dimensions from the strategy
      setStylesFromObject(thumb.parentNode, {
        "width"  : thumbContentWidth + "px",
        "height" : thumbContentHeight + "px" 
      });

      // fit on height
      if (contentRatio > thumbRatio){
        delete strategy.width
      }// fit on width
      else{
        delete strategy.height
      }
    }

    //resize based on width
    if("undefined" !== typeof strategy.width 
      && "undefined" === typeof strategy.height)
    {
      var thumbContentWidth = parseInt(strategy.width);
      scaleFactor =  thumbContentWidth / thumb.offsetWidth;
    }//resize based on height
    else {
      var thumbContentHeight = parseInt(strategy.height);
      scaleFactor =  thumbContentHeight / thumb.offsetHeight;
    }

    thumb.style["-webkit-transform"] = "scale("+scaleFactor+")";
    thumb.style["transform"] = "scale("+scaleFactor+")";
    

    if(fixedWrapper){
      setStylesFromObject(thumb.parentNode, {
        "position" : "relative",
        "overflow" : "hidden"
      })

      var top = (thumb.parentNode.clientHeight - (thumb.offsetHeight* scaleFactor))/ 2 + "px";
      var left = (thumb.parentNode.clientWidth - (thumb.offsetWidth* scaleFactor ))/ 2 + "px";

      setStylesFromObject(thumb, {
        "position" : "absolute",
        "top" : top,
        "left" : left
      })
    }else{ //adjust thumb wrapper to match thumb
      setStylesFromObject(thumb.parentNode, {
        "width"  : parseInt(thumb.offsetWidth * scaleFactor) + "px",
        "height" : parseInt(thumb.offsetHeight * scaleFactor) + "px" 
      });
      setStylesFromObject(thumb, {
        "position" : "relative",
        "top" : "0px",
        "left" : "0px"
      })
    }



  }

  /** @function setStylesFromObject
  *   @description: Sets style properties in an element as defined in an object
  *   with key-value pairs of rules (compatible with jQuery)
  */
  function setStylesFromObject(el, cssObj){
    Object.keys(cssObj).forEach(function setStyleFromObject(key){
      el.style[key] = cssObj[key];
    });
  }

  /** @function _css
  *   @description: Gets the computed styles of an element and returns
  *   key-value pairs of rules (compatible with jQuery)
  */
  function _css(el){
      var rules = window.getComputedStyle(el);
      return _css2json(rules);
  }

  /** @function _css2json
  *   @description: Converts CSSStyleDeclaration objects or css rules
  *   in string format to key-value pairs (compatible with jQuery)
  */
  function _css2json(css){
      var s = {};
      if(!css) return s;
      if(css instanceof CSSStyleDeclaration) {
          for(var i in css) {
            if(!css[i]) {break;}
              if((css[i]).toLowerCase) {
                  s[(css[i]).toLowerCase()] = (css[css[i]]);
              }
          }
      } 
      else if(typeof css == "string") {
          css = css.split("; ");          
          for (var i in css) {
              var l = css[i].split(": ");
              s[l[0].toLowerCase()] = (l[1]);
          };
      }
      return s;
  }

  // Public API
  return {
    createThumb : createThumb,
    resizeThumb : resizeThumb
  }
}
