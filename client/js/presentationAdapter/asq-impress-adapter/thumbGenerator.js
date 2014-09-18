var debug = require('bows')("thumbGenerator")
module.exports = function(opts, $){
  var impressEl = null
    , options = opts
    , $thumbs = $([]);


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
  function createThumb($slide){

    var slide_classes = $slide[0].classList;
    var saved_slide_classes = [];

    for (var i = 0; i< slide_classes.length; i++) {
      var c = slide_classes[i];
      if (c.match("(^future|^past|^present|^active)")) {
        saved_slide_classes.push(c);
      }
    }

    //remove classes
    saved_slide_classes.forEach(function(saved_slide_class){
      $slide.removeClass(saved_slide_class)
    });
    // make every slide look like its the current one
    $slide.addClass("active present")


    var $clone = $slide.clone()
    , cloneId = $clone.attr("id")

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

    $clone
      //change id only if not empty
      .attr("id", (cloneId === undefined || cloneId == '') ? '' : cloneId + "-clone")
      .attr("class",sels.slideThumbClass)
      //copy original computed style
      .css(_css($slide))
      .css(styles)
      //add reference to original slide
      .attr('data-references', $slide.attr('id'))
    
    //set transform orign property
    $clone[0].style["-webkit-transform-origin"] = "0 0";

    var $cloneChildren = $clone.find('*');
    //copy original computed style for children
    $slide.find('*').each(function(index){
      var id = $cloneChildren.eq(index).attr("id");
      $cloneChildren.eq(index)
        .removeAttr("id")
        .removeAttr("class")
        //copy original computed style
        .css(_css($(this)))
        //add custom styles
        .css(styles);
    });

    //revert style to original slide
    //$slide.removeClass("active present")
    saved_slide_classes.forEach(function(saved_slide_class){
     // $slide.addClass(saved_slide_class)
    });   

    return $clone;
  }

  /** @function resizeThumb
  *   @description: resizes a thumbs to fit specified width and height (in pixels) or both
  */
  function resizeThumb($thumb, options){
    var strategy = jQuery.extend({},resizeConf);
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
        , thumbRatio = $thumb.outerWidth() / $thumb.outerHeight();

      //thumb wrapper has defined dimensions from the strategy
      $thumb.parent().css({
        "width"  : thumbContentWidth + "px",
        "height" : thumbContentHeight + "px" 
      });

      // fit on width
      if (contentRatio > thumbRatio){
        delete strategy.height
      }// fit on height
      else{
        delete strategy.width
      }
    }

    //resize based on width
    if("undefined" !== typeof strategy.width 
      && "undefined" === typeof strategy.height)
    {
      var thumbContentWidth = parseInt(strategy.width);
      scaleFactor =  thumbContentWidth / $thumb.outerWidth();
    }//resize based on height
    else {
      var thumbContentHeight = parseInt(strategy.height);
      scaleFactor =  thumbContentHeight / $thumb.outerHeight();
    }

    $thumb[0].style["-webkit-transform"] = "scale("+scaleFactor+")";
    $thumb[0].style["transform"] = "scale("+scaleFactor+")";
    

    if(fixedWrapper){
      $thumb.parent().css({
        "position" : "relative",
        "overflow" : "hidden"
      })

      var left = ($thumb.parent().innerWidth() - ($thumb.outerWidth()* scaleFactor ))/ 2 + "px";
      var right = ($thumb.parent().innerHeight() - ($thumb.outerHeight()* scaleFactor))/ 2 + "px";

      $thumb.css({
        "position" : "absolute",
        "left" : left,
        "right" : right
      })
    }else{ //adjust thumb wrapper to match thumb
      $thumb.parent().css({
        "width"  : parseInt($thumb.outerWidth() * scaleFactor) + "px",
        "height" : parseInt($thumb.outerHeight() * scaleFactor) + "px" 
      });
      $thumb.css({
        "position" : "relative",
        "left" : "0px",
        "right" : "0px"
      })
    }



  }

  /** @function _css
  *   @description: Gets the computed styles of an element and returns
  *   key value pair of rules (compatible with jQuery)
  */
  function _css(a){
      var rules = window.getComputedStyle(a.get(0));
      return _css2json(rules);
  }

  /** @function _css2json
  *   @description: Converts CSSStyleDeclaration objects or css rules
  *   in string format to key value pairs (compatible with jQuery)
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

