require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"++fus9":[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};(function browserifyShim(module, exports, define, browserify_shim__define__module__export__) {
/**
 * impress.js
 *
 * impress.js is a presentation tool based on the power of CSS3 transforms and transitions
 * in modern browsers and inspired by the idea behind prezi.com.
 *
 *
 * Copyright 2011-2012 Bartek Szopka (@bartaz)
 *
 * Released under the MIT and GPL Licenses.
 *
 * ------------------------------------------------
 *  author:  Bartek Szopka
 *  version: 0.5.3
 *  url:     http://bartaz.github.com/impress.js/
 *  source:  http://github.com/bartaz/impress.js/
 */

/*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, latedef:true, newcap:true,
         noarg:true, noempty:true, undef:true, strict:true, browser:true */

// You are one of those who like to know how thing work inside?
// Let me show you the cogs that make impress.js run...


//Changes by Max: Removed blacklisting of iOS and Android. They are said not to work actually they do.

(function ( document, window ) {
    'use strict';
    
    // HELPER FUNCTIONS
    
    // `pfx` is a function that takes a standard CSS property name as a parameter
    // and returns it's prefixed version valid for current browser it runs in.
    // The code is heavily inspired by Modernizr http://www.modernizr.com/
    var pfx = (function () {
        
        var style = document.createElement('dummy').style,
            prefixes = 'Webkit Moz O ms Khtml'.split(' '),
            memory = {};
        
        return function ( prop ) {
            if ( typeof memory[ prop ] === "undefined" ) {
                
                var ucProp  = prop.charAt(0).toUpperCase() + prop.substr(1),
                    props   = (prop + ' ' + prefixes.join(ucProp + ' ') + ucProp).split(' ');
                
                memory[ prop ] = null;
                for ( var i in props ) {
                    if ( style[ props[i] ] !== undefined ) {
                        memory[ prop ] = props[i];
                        break;
                    }
                }
            
            }
            
            return memory[ prop ];
        };
    
    })();
    
    // `arraify` takes an array-like object and turns it into real Array
    // to make all the Array.prototype goodness available.
    var arrayify = function ( a ) {
        return [].slice.call( a );
    };
    
    // `css` function applies the styles given in `props` object to the element
    // given as `el`. It runs all property names through `pfx` function to make
    // sure proper prefixed version of the property is used.
    var css = function ( el, props ) {
        var key, pkey;
        for ( key in props ) {
            if ( props.hasOwnProperty(key) ) {
                pkey = pfx(key);
                if ( pkey !== null ) {
                    el.style[pkey] = props[key];
                }
            }
        }
        return el;
    };
    
    // `toNumber` takes a value given as `numeric` parameter and tries to turn
    // it into a number. If it is not possible it returns 0 (or other value
    // given as `fallback`).
    var toNumber = function (numeric, fallback) {
        return isNaN(numeric) ? (fallback || 0) : Number(numeric);
    };
    
    // `byId` returns element with given `id` - you probably have guessed that ;)
    var byId = function ( id ) {
        return document.getElementById(id);
    };
    
    // `$` returns first element for given CSS `selector` in the `context` of
    // the given element or whole document.
    var $ = function ( selector, context ) {
        context = context || document;
        return context.querySelector(selector);
    };
    
    // `$$` return an array of elements for given CSS `selector` in the `context` of
    // the given element or whole document.
    var $$ = function ( selector, context ) {
        context = context || document;
        return arrayify( context.querySelectorAll(selector) );
    };
    
    // `triggerEvent` builds a custom DOM event with given `eventName` and `detail` data
    // and triggers it on element given as `el`.
    var triggerEvent = function (el, eventName, detail) {
        var event = document.createEvent("CustomEvent");
        event.initCustomEvent(eventName, true, true, detail);
        el.dispatchEvent(event);
    };
    
    // `translate` builds a translate transform string for given data.
    var translate = function ( t ) {
        return " translate3d(" + t.x + "px," + t.y + "px," + t.z + "px) ";
    };
    
    // `rotate` builds a rotate transform string for given data.
    // By default the rotations are in X Y Z order that can be reverted by passing `true`
    // as second parameter.
    var rotate = function ( r, revert ) {
        var rX = " rotateX(" + r.x + "deg) ",
            rY = " rotateY(" + r.y + "deg) ",
            rZ = " rotateZ(" + r.z + "deg) ";
        
        return revert ? rZ+rY+rX : rX+rY+rZ;
    };
    
    // `scale` builds a scale transform string for given data.
    var scale = function ( s ) {
        return " scale(" + s + ") ";
    };
    
    // `perspective` builds a perspective transform string for given data.
    var perspective = function ( p ) {
        return " perspective(" + p + "px) ";
    };
    
    // `getElementFromHash` returns an element located by id from hash part of
    // window location.
    var getElementFromHash = function () {
        // get id from url # by removing `#` or `#/` from the beginning,
        // so both "fallback" `#slide-id` and "enhanced" `#/slide-id` will work
        return byId( window.location.hash.replace(/^#\/?/,"") );
    };
    
    // `computeWindowScale` counts the scale factor between window size and size
    // defined for the presentation in the config.
    var computeWindowScale = function ( config ) {
        var hScale = window.innerHeight / config.height,
            wScale = window.innerWidth / config.width,
            scale = hScale > wScale ? wScale : hScale;
        
        if (config.maxScale && scale > config.maxScale) {
            scale = config.maxScale;
        }
        
        if (config.minScale && scale < config.minScale) {
            scale = config.minScale;
        }
        
        return scale;
    };
    
    // CHECK SUPPORT
    var body = document.body;
    
    var ua = navigator.userAgent.toLowerCase();
    var impressSupported = 
                          // browser should support CSS 3D transtorms 
                           ( pfx("perspective") !== null ) &&
                           
                          // and `classList` and `dataset` APIs
                           ( body.classList ) &&
                           ( body.dataset );// &&
                           
                          // but some mobile devices need to be blacklisted,
                          // because their CSS 3D support or hardware is not
                          // good enough to run impress.js properly, sorry...
                          // ( ua.search(/(iphone)|(ipod)|(android)/) === -1 );
    
    if (!impressSupported) {
        // we can't be sure that `classList` is supported
        body.className += " impress-not-supported ";
    } else {
        body.classList.remove("impress-not-supported");
        body.classList.add("impress-supported");
    }
    
    // GLOBALS AND DEFAULTS
    
    // This is were the root elements of all impress.js instances will be kept.
    // Yes, this means you can have more than one instance on a page, but I'm not
    // sure if it makes any sense in practice ;)
    var roots = {};
    
    // some default config values.
    var defaults = {
        width: 1024,
        height: 768,
        maxScale: 1,
        minScale: 0,
        
        perspective: 1000,
        
        transitionDuration: 1000
    };
    
    // it's just an empty function ... and a useless comment.
    var empty = function () { return false; };
    
    // IMPRESS.JS API
    
    // And that's where interesting things will start to happen.
    // It's the core `impress` function that returns the impress.js API
    // for a presentation based on the element with given id ('impress'
    // by default).
    var impress = window.impress = function ( rootId ) {
        
        // If impress.js is not supported by the browser return a dummy API
        // it may not be a perfect solution but we return early and avoid
        // running code that may use features not implemented in the browser.
        if (!impressSupported) {
            return {
                init: empty,
                start: empty,
                goto: empty,
                gotoSub: empty,
                emitGoto: empty,
                emitGotoSub: empty,
                prev: empty,
                next: empty
            };
        }
        
        rootId = rootId || "impress";
        
        // if given root is already initialized just return the API
        if (roots["impress-root-" + rootId]) {
            return roots["impress-root-" + rootId];
        }
        
        // data of all presentation steps
        var stepsData = {};
        
        // element of currently active step
        var activeStep = null;
        
        // current state (position, rotation and scale) of the presentation
        var currentState = null;
        
        // array of step elements
        var steps = null;
        
        // configuration options
        var config = null;
        
        // scale factor of the browser window
        var windowScale = null;        
        
        // root presentation elements
        var root = byId( rootId );
        var canvas = document.createElement("div");
        
        var initialized = false;
        var started = false;
        
        // STEP EVENTS
        //
        // There are currently two step events triggered by impress.js
        // `impress:stepenter` is triggered when the step is shown on the 
        // screen (the transition from the previous one is finished) and
        // `impress:stepleave` is triggered when the step is left (the
        // transition to next step just starts).
        
        // reference to last entered step
        var lastEntered = null;
        
        // `onStepEnter` is called whenever the step element is entered
        // but the event is triggered only if the step is different than
        // last entered step.
        var onStepEnter = function (step) {
            if (lastEntered !== step) {
                triggerEvent(step, "impress:stepenter");
                lastEntered = step;
            }
        };
        
        // Custom Event called at the same time as StepLeave but gives the next
        // step.
        var onStepGoto = function (step) {
            if (lastEntered !== step) {
                triggerEvent(step, "impress:stepgoto");
            }
        };

        // `onStepLeave` is called whenever the step element is left
        // but the event is triggered only if the step is the same as
        // last entered step.
        var onStepLeave = function (step) {
            if (lastEntered === step) {
                triggerEvent(step, "impress:stepleave");
                lastEntered = null;
            }
        };
        
        // `initStep` initializes given step element by reading data from its
        // data attributes and setting correct styles.
        var initStep = function ( el, idx ) {
            var data = el.dataset,
                step = {
                    translate: {
                        x: toNumber(data.x),
                        y: toNumber(data.y),
                        z: toNumber(data.z)
                    },
                    rotate: {
                        x: toNumber(data.rotateX),
                        y: toNumber(data.rotateY),
                        z: toNumber(data.rotateZ || data.rotate)
                    },
                    scale: toNumber(data.scale, 1),
                    el: el
                };
            
            if ( !el.id ) {
                el.id = "step-" + (idx + 1);
            }
            
            stepsData["impress-" + el.id] = step;
            
            css(el, {
                position: "absolute",
                transform: "translate(-50%,-50%)" +
                           translate(step.translate) +
                           rotate(step.rotate) +
                           scale(step.scale),
                transformStyle: "preserve-3d"
            });
        };
        
        // `init` API function that initializes (and runs) the presentation.
        var init = function () {
            if (initialized) { return; }
            
            // First we set up the viewport for mobile devices.
            // For some reason iPad goes nuts when it is not done properly.
            var meta = $("meta[name='viewport']") || document.createElement("meta");
            meta.content = "width=device-width, minimum-scale=1, maximum-scale=1, user-scalable=no";
            if (meta.parentNode !== document.head) {
                meta.name = 'viewport';
                document.head.appendChild(meta);
            }
            
            // initialize configuration object
            var rootData = root.dataset;
            config = {
                width: toNumber( rootData.width, defaults.width ),
                height: toNumber( rootData.height, defaults.height ),
                maxScale: toNumber( rootData.maxScale, defaults.maxScale ),
                minScale: toNumber( rootData.minScale, defaults.minScale ),                
                perspective: toNumber( rootData.perspective, defaults.perspective ),
                transitionDuration: toNumber( rootData.transitionDuration, defaults.transitionDuration )
            };
            
            windowScale = computeWindowScale( config );
            
            // wrap steps with "canvas" element
            arrayify( root.childNodes ).forEach(function ( el ) {
                canvas.appendChild( el );
            });
            root.appendChild(canvas);
            
            // set initial styles
            document.documentElement.style.height = "100%";
            
            css(body, {
                height: "100%",
                overflow: "hidden"
            });
            
            var rootStyles = {
                position: "absolute",
                transformOrigin: "top left",
                transition: "all 0s ease-in-out",
                transformStyle: "preserve-3d"
            };
            
            css(root, rootStyles);
            css(root, {
                top: "50%",
                left: "50%",
                transform: perspective( config.perspective/windowScale ) + scale( windowScale )
            });
            css(canvas, rootStyles);
            
            body.classList.remove("impress-disabled");
            body.classList.add("impress-enabled");
            
            // get and init steps
            steps = $$(".step", root);
            steps.forEach( initStep );
            
            // set a default initial state of the canvas
            currentState = {
                translate: { x: 0, y: 0, z: 0 },
                rotate:    { x: 0, y: 0, z: 0 },
                scale:     1
            };
            
            initialized = true;
            
            triggerEvent(root, "impress:init", { api: roots[ "impress-root-" + rootId ] });
        };
        
        var start = function() {
            if (!initialized || started) return;
            triggerEvent(root, "impress:start", { api: roots[ "impress-root-" + rootId ] });
            started = true;
        };

        // `getStep` is a helper function that returns a step element defined by parameter.
        // If a number is given, step with index given by the number is returned, if a string
        // is given step element with such id is returned, if DOM element is given it is returned
        // if it is a correct step element.
        var getStep = function ( step ) {
            if (typeof step === "number") {
                step = step < 0 ? steps[ steps.length + step] : steps[ step ];
            } else if (typeof step === "string") {
                step = byId(step);
            }
            return (step && step.id && stepsData["impress-" + step.id]) ? step : null;
        };
        
        // used to reset timeout for `impress:stepenter` event
        var stepEnterTimeout = null;

        
        var emitGoto = function( el, duration ) {
            if ( !initialized || !(el = getStep(el)) ) {
                // presentation not initialized or given element is not a step
                return false;
            }

            // trigger leave of currently active element (if it's not the same step again)
            if (activeStep && activeStep !== el) {
                onStepGoto(el);
                onStepLeave(activeStep);
            }

            return el;
        }

        // `goto` API function that moves to step given with `el` parameter (by index, id or element),
        // with a transition `duration` optionally given as second parameter.
        var goto = function ( el, duration ) {
            
            if ( !initialized || !(el = getStep(el)) ) {
                // presentation not initialized or given element is not a step
                return false;
            }
            
            // Sometimes it's possible to trigger focus on first link with some keyboard action.
            // Browser in such a case tries to scroll the page to make this element visible
            // (even that body overflow is set to hidden) and it breaks our careful positioning.
            //
            // So, as a lousy (and lazy) workaround we will make the page scroll back to the top
            // whenever slide is selected
            //
            // If you are reading this and know any better way to handle it, I'll be glad to hear about it!
            window.scrollTo(0, 0);
            
            var step = stepsData["impress-" + el.id];
            
            if ( activeStep ) {
                activeStep.classList.remove("active");
                body.classList.remove("impress-on-" + activeStep.id);
            }
            el.classList.add("active");
            
            body.classList.add("impress-on-" + el.id);
            
            // compute target state of the canvas based on given step
            var target = {
                rotate: {
                    x: -step.rotate.x,
                    y: -step.rotate.y,
                    z: -step.rotate.z
                },
                translate: {
                    x: -step.translate.x,
                    y: -step.translate.y,
                    z: -step.translate.z
                },
                scale: 1 / step.scale
            };
            
            // Check if the transition is zooming in or not.
            //
            // This information is used to alter the transition style:
            // when we are zooming in - we start with move and rotate transition
            // and the scaling is delayed, but when we are zooming out we start
            // with scaling down and move and rotation are delayed.
            var zoomin = target.scale >= currentState.scale;
            
            duration = toNumber(duration, config.transitionDuration);
            var delay = (duration / 2);
            
            // if the same step is re-selected, force computing window scaling,
            // because it is likely to be caused by window resize
            if (el === activeStep) {
                windowScale = computeWindowScale(config);
            }
            
            var targetScale = target.scale * windowScale;
            
            //// trigger leave of currently active element (if it's not the same step again)
            //if (activeStep && activeStep !== el) {
            //    onStepGoto(el);
            //    onStepLeave(activeStep);
            //}
            
            // Now we alter transforms of `root` and `canvas` to trigger transitions.
            //
            // And here is why there are two elements: `root` and `canvas` - they are
            // being animated separately:
            // `root` is used for scaling and `canvas` for translate and rotations.
            // Transitions on them are triggered with different delays (to make
            // visually nice and 'natural' looking transitions), so we need to know
            // that both of them are finished.
            css(root, {
                // to keep the perspective look similar for different scales
                // we need to 'scale' the perspective, too
                transform: perspective( config.perspective / targetScale ) + scale( targetScale ),
                transitionDuration: duration + "ms",
                transitionDelay: (zoomin ? delay : 0) + "ms"
            });
            
            css(canvas, {
                transform: rotate(target.rotate, true) + translate(target.translate),
                transitionDuration: duration + "ms",
                transitionDelay: (zoomin ? 0 : delay) + "ms"
            });
            
            // Here is a tricky part...
            //
            // If there is no change in scale or no change in rotation and translation, it means there was actually
            // no delay - because there was no transition on `root` or `canvas` elements.
            // We want to trigger `impress:stepenter` event in the correct moment, so here we compare the current
            // and target values to check if delay should be taken into account.
            //
            // I know that this `if` statement looks scary, but it's pretty simple when you know what is going on
            // - it's simply comparing all the values.
            if ( currentState.scale === target.scale ||
                (currentState.rotate.x === target.rotate.x && currentState.rotate.y === target.rotate.y &&
                 currentState.rotate.z === target.rotate.z && currentState.translate.x === target.translate.x &&
                 currentState.translate.y === target.translate.y && currentState.translate.z === target.translate.z) ) {
                delay = 0;
            }
            
            // store current state
            currentState = target;
            activeStep = el;
            
            // And here is where we trigger `impress:stepenter` event.
            // We simply set up a timeout to fire it taking transition duration (and possible delay) into account.
            //
            // I really wanted to make it in more elegant way. The `transitionend` event seemed to be the best way
            // to do it, but the fact that I'm using transitions on two separate elements and that the `transitionend`
            // event is only triggered when there was a transition (change in the values) caused some bugs and 
            // made the code really complicated, cause I had to handle all the conditions separately. And it still
            // needed a `setTimeout` fallback for the situations when there is no transition at all.
            // So I decided that I'd rather make the code simpler than use shiny new `transitionend`.
            //
            // If you want learn something interesting and see how it was done with `transitionend` go back to
            // version 0.5.2 of impress.js: http://github.com/bartaz/impress.js/blob/0.5.2/js/impress.js
            window.clearTimeout(stepEnterTimeout);
            stepEnterTimeout = window.setTimeout(function() {
                onStepEnter(activeStep);
            }, duration + delay);
            
            return el;
        };

        //PATCH for SUBSTEPS
    var forEach = Array.prototype.forEach,
        slice = Array.prototype.slice,
        isArray = Array.isArray;
        
    var removeClass = function (elm, className) {
    if (elm.classList) {
            elm.classList.remove(className);
    } else {
            if (!elm || !elm.className) {
                return false;
            }
            var regexp = new RegExp("(^|\\s)" + className + "(\\s|$)", "g");
            elm.className = elm.className.replace(regexp, "$2");
    }
    }
    
 
    var setPrevious = function (data) {
        if (isArray(data)) {
            data.forEach(setPrevious);
            return;
        }
        //removeClass(data,'active');
        //data.className = data.className + ' previous';
        data.classList.remove('active');
        data.classList.add('previous');
    };

    var setActive = function (data) {
        if (isArray(data)) {
            data.forEach(setActive);
            return;
        }
        //removeClass(data,'previous');
        //data.className = data.className + ' active';
        data.classList.remove('previous');
        data.classList.add('active');
    };

    var clearSub = function (data) {
        if (isArray(data)) {
            data.forEach(clearSub);
            return;
        }
        //removeClass(data,'previous');
        //removeClass(data,'active');
        data.classList.remove('active');
        data.classList.remove('previous');
    };


    var onStepGotoSub = function (index) {
        triggerEvent(activeStep, "impress:stepgotosub", {"index": index});
    };

    var emitGotoSub = function(index) {
        //TODO: check if index is valid
            if ( !initialized ) {
                // presentation not initialized 
                return false;
            }

            //TODO: check if we need a similar check for substeps
            // trigger leave of currently active element (if it's not the same step again)
            // if (activeStep && activeStep !== el) {
            //     onStepGoto(el);
            //     onStepLeave(activeStep);
            // }

            onStepGotoSub(index)
        }


    // `gotoSub` API function that moves to substep given with `index` parameter.
    var gotoSub = function(index){

        var active = activeStep;
        
        var subactive, subSteps;
        
        if (!active.subSteps) {
            setSubSteps(active);
        }

        subSteps = active.subSteps;

        //if index is null then we got this from a prev action
        // and we have to prepare the previous step
        if(index === null){
            prev = steps.indexOf( active ) - 1;
            prev = prev >= 0 ? steps[ prev ] : steps[ steps.length-1 ];
            if (!prev.subSteps) {
                setSubSteps(prev);
            }
            if (prev.subSteps.length &&
                (prev.subSteps.active !== (prev.subSteps.length - 1))) {
                slice.call(prev.subSteps, 0, -1).forEach(setPrevious);
                setActive(prev.subSteps[prev.subSteps.length - 1]);
                prev.subSteps.active = prev.subSteps.length - 1;
            }

        }

        if (subSteps.length && (index >= 0) && (index <= (subSteps.length - 1))) {

            //set previous substeps to have the class 'previous'
            if(index){
                slice.call(subSteps, 0, index).forEach(setPrevious);
            }

            //clear next subSteps
            if(index < (subSteps.length - 1) ){
                slice.call(subSteps, index).forEach(clearSub);
            }

            //if we are on the last substep we have to prepare the next step
            if(index == (subSteps.length - 1)){
                next = steps.indexOf( active ) + 1;
                next = next < steps.length ? steps[ next ] : steps[ 0 ];
                if (!next.subSteps) {
                    setSubSteps(next);
                }
                if (next.subSteps.active != null) {
                    forEach.call(next.subSteps, clearSub);
                    next.subSteps.active = null;
                }
            }
            
            //set active
            if(index != null ){
                setActive(subSteps[index]);
            }
            subSteps.active = index;
        }

    };

 
    var next = function () {
        var active = activeStep;
        
        var subactive, next, subSteps;
        
        if (!active.subSteps) {
            setSubSteps(active);
        }
        subSteps = active.subSteps;

        //if we have substeps deal with them first
        if (subSteps.length && ((subactive = subSteps.active) !== (subSteps.length - 1))) {
            if(isNaN(subactive) || (subactive==null)){
                subactive = -1;
            }
            //return gotoSub(++subactive)
            return emitGotoSub(++subactive);
        }

        next = steps.indexOf( active ) + 1;
        next = next < steps.length ? steps[ next ] : steps[ 0 ];
       
        //return goto(next);
        return emitGoto(next);
    };
 
    var prev = function () {
        var active = activeStep;
        
        var subactive, next, subSteps;
        if (!active.subSteps) {
            setSubSteps(active);
        }
        subSteps = active.subSteps;
        //if we have substeps deal with them first
        if (subSteps.length && ((subactive = subSteps.active) || (subactive === 0))) {
            if (subactive) {
                --subactive;
            } else {
                subactive = null;
            }
            return emitGotoSub(subactive);
            //return gotoSub(subactive);
        }

        prev = steps.indexOf( active ) - 1;
        prev = prev >= 0 ? steps[ prev ] : steps[ steps.length-1 ];

        //return goto(prev);
        return emitGoto(prev);
    };
 
     var setSubSteps = function (el) {
        var steps = el.querySelectorAll(".substep"),
        order = [], unordered = [];
        forEach.call(steps, function (el) {
            if (el.dataset) {
                var index = Number(el.dataset.order);
                
                if (!isNaN(index)) {
                    if (!order[index]) {
                        order[index] = el;
                    } else if (Array.isArray(order[index])) {
                        order[index].push(el);
                    } else {
                        order[index] = [order[index], el];
                    }
                } else {
                    unordered.push(el);
                } 
            } else {
               unordered.push(el);
                
            }
        });
        el.subSteps = order.filter(Boolean).concat(unordered);
    };
 
 //END PATCH       
        
        // Adding some useful classes to step elements.
        //
        // All the steps that have not been shown yet are given `future` class.
        // When the step is entered the `future` class is removed and the `present`
        // class is given. When the step is left `present` class is replaced with
        // `past` class.
        //
        // So every step element is always in one of three possible states:
        // `future`, `present` and `past`.
        //
        // There classes can be used in CSS to style different types of steps.
        // For example the `present` class can be used to trigger some custom
        // animations when step is shown.
        root.addEventListener("impress:init", function(){
            // STEP CLASSES
            steps.forEach(function (step) {
                step.classList.add("future");
            });
            
            root.addEventListener("impress:stepenter", function (event) {
                event.target.classList.remove("past");
                event.target.classList.remove("future");
                event.target.classList.add("present");
            }, false);
            
            root.addEventListener("impress:stepleave", function (event) {
                event.target.classList.remove("present");
                event.target.classList.add("past");
            }, false);
            
        }, false);
        
        // Adding hash change support.
        root.addEventListener("impress:init", function(){
            
            // last hash detected
            var lastHash = "";
            
            // `#/step-id` is used instead of `#step-id` to prevent default browser
            // scrolling to element in hash.
            //
            // And it has to be set after animation finishes, because in Chrome it
            // makes transtion laggy.
            // BUG: http://code.google.com/p/chromium/issues/detail?id=62820
            root.addEventListener("impress:stepenter", function (event) {
                window.location.hash = lastHash = "#/" + event.target.id;
            }, false);
            
            window.addEventListener("hashchange", function () {
                // When the step is entered hash in the location is updated
                // (just few lines above from here), so the hash change is 
                // triggered and we would call `goto` again on the same element.
                //
                // To avoid this we store last entered hash and compare.
                if (window.location.hash !== lastHash) {
                    emitGoto( getElementFromHash() );
                    //goto( getElementFromHash() );
                }
            }, false);
            
            // START 
            // by selecting step defined in url or first step of the presentation
            goto(getElementFromHash() || steps[0], 0);
        }, false);
        
        body.classList.add("impress-disabled");
        
        // store and return API for given impress.js root element
        return (roots[ "impress-root-" + rootId ] = {
            init: init,
            start: start,
            goto: goto,
            gotoSub: gotoSub,
            emitGotoSub: emitGotoSub,
            emitGoto: emitGoto,
            next: next,
            prev: prev
        });

    };
    
    // flag that can be used in JS to check if browser have passed the support test
    impress.supported = impressSupported;
    
})(document, window);

// NAVIGATION EVENTS

// As you can see this part is separate from the impress.js core code.
// It's because these navigation actions only need what impress.js provides with
// its simple API.
//
// In future I think about moving it to make them optional, move to separate files
// and treat more like a 'plugins'.
(function ( document, window ) {
    'use strict';
    
    // throttling function calls, by Remy Sharp
    // http://remysharp.com/2010/07/21/throttling-function-calls/
    var throttle = function (fn, delay) {
        var timer = null;
        return function () {
            var context = this, args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
                fn.apply(context, args);
            }, delay);
        };
    };
    
    // wait for impress.js to be initialized
    document.addEventListener("impress:start", function (event) {
        // Getting API from event data.
        // So you don't event need to know what is the id of the root element
        // or anything. `impress:init` event data gives you everything you 
        // need to control the presentation that was just initialized.
        var api = event.detail.api;
        
        // KEYBOARD NAVIGATION HANDLERS

        // Prevent default keydown action when one of supported key is pressed.
        document.addEventListener("keydown", function ( event ) {
            if ( event.keyCode === 9 || ( event.keyCode >= 32 && event.keyCode <= 34 ) || (event.keyCode >= 37 && event.keyCode <= 40) ) {
                event.preventDefault();
            }
        }, false);

        // Trigger impress action (next or prev) on keyup.
        
        // Supported keys are:
        // [space] - quite common in presentation software to move forward
        // [up] [right] / [down] [left] - again common and natural addition,
        // [pgdown] / [pgup] - often triggered by remote controllers,
        // [tab] - this one is quite controversial, but the reason it ended up on
        //   this list is quite an interesting story... Remember that strange part
        //   in the impress.js code where window is scrolled to 0,0 on every presentation
        //   step, because sometimes browser scrolls viewport because of the focused element?
        //   Well, the [tab] key by default navigates around focusable elements, so clicking
        //   it very often caused scrolling to focused element and breaking impress.js
        //   positioning. I didn't want to just prevent this default action, so I used [tab]
        //   as another way to moving to next step... And yes, I know that for the sake of
        //   consistency I should add [shift+tab] as opposite action...
        document.addEventListener("keyup", function ( event ) {
            if ( event.keyCode === 9 || ( event.keyCode >= 32 && event.keyCode <= 34 ) || (event.keyCode >= 37 && event.keyCode <= 40) ) {
                switch( event.keyCode ) {
                    case 33: // pg up
                    case 37: // left
                    case 38: // up
                             api.prev();
                             break;
                    case 9:  // tab
                    case 32: // space
                    case 34: // pg down
                    case 39: // right
                    case 40: // down
                             api.next();
                             break;
                }
                
                event.preventDefault();
            }
        }, false);
        
        // delegated handler for clicking on the links to presentation steps
        document.addEventListener("click", function ( event ) {
            // event delegation with "bubbling"
            // check if event target (or any of its parents is a link)
            var target = event.target;
            while ( (target.tagName !== "A") &&
                    (target !== document.documentElement) ) {
                target = target.parentNode;
            }
            
            if ( target.tagName === "A" ) {
                var href = target.getAttribute("href");
                
                // if it's a link to presentation step, target this step
                if ( href && href[0] === '#' ) {
                    target = document.getElementById( href.slice(1) );
                }
            }
            if ( api.emitGoto(target) ) {
                event.stopImmediatePropagation();
                event.preventDefault();
            }
        }, false);
        
        // delegated handler for clicking on step elements
        document.addEventListener("click", function ( event ) {
            var target = event.target;
            // find closest step element that is not active
            while ( !(target.classList.contains("step") && !target.classList.contains("active")) &&
                    (target !== document.documentElement) ) {
                target = target.parentNode;
            }
            if ( api.emitGoto(target) ) {
                event.preventDefault();
            }
        }, false);
        
        // touch handler to detect taps on the left and right side of the screen
        // based on awesome work of @hakimel: https://github.com/hakimel/reveal.js
        document.addEventListener("touchstart", function ( event ) {
        	var isLandscape = window.innerWidth > window.innerHeight;
        	
        	//window.alert(mode != "controll");
        	if(isLandscape && mode == "controll"){
        		
        	}else if (event.touches.length === 1 ) {
                var x = event.touches[0].clientX,
                	y = event.touches[0].clientY,
                    width = window.innerWidth * 0.3,
                    result = null;
                    
                if ( x < width && y > 100) {
                    result = api.prev();
                } else if ( x > window.innerWidth - width && y > 100) {
                    result = api.next();
                }
                
                if (result) {
                    event.preventDefault();
                }
            }
        }, false);

        // rescale presentation when window is resized
        window.addEventListener("resize", throttle(function () {
            // force going to active step again, to trigger rescaling
            api.goto( document.querySelector(".active"), 500 );
        }, 250), false);

    }, false);
        
})(document, window);

// THAT'S ALL FOLKS!
//
// Thanks for reading it all.
// Or thanks for scrolling down and reading the last part.
//
// I've learnt a lot when building impress.js and I hope this code and comments
// will help somebody learn at least some part of it.
; browserify_shim__define__module__export__(typeof impress != "undefined" ? impress : window.impress);

}).call(global, undefined, undefined, undefined, function defineExport(ex) { module.exports = ex; });

},{}],"impressPresenter":[function(require,module,exports){
module.exports=require('++fus9');
},{}],3:[function(require,module,exports){
/**
 @fileoverview Socket code for the presenter client.
 * 
 */

'use strict'

var impress = require('impressPresenter')
, io = require('socket.io-browserify')
, $ = window.jQuery || require('jQuery')

$(function(){
	var $body = $('body')
		, host 			=  $body.attr('asq-host')
    , port  		= parseInt($body.attr('asq-port'))
    , sessionId = $body.attr('asq-session-id')
    , mode 			= $body.attr('asq-socket-mode')

	impress().init();
	connect(host, port, sessionId, mode)
	impress().start();
})

/** Connect back to the server with a websocket */

var connect = function(host, port, session, mode) {
	var started = false;
	var socket = io.connect('http://' + host + ':' + port + '/ctrl?sid=' + session);

	var updateViewersCount = function(event) {
		if (!event.connectedClients)
			return;
		var connectedViewers = event.connectedClients;
		// Draw icons for the first 50 viewers
		var lim = connectedViewers < 50 ? connectedViewers : 50;
		$('.connected-viewers-icons').empty();
		for (var i = 0; i < lim; i++) {
			if (i % 10 == 0) {
				$('.connected-viewers-icons').append('<br />');
			} else if (i % 5 == 0) {
				$('.connected-viewers-icons').append('<span>&nbsp;&nbsp;</span>');
			}
			$('.connected-viewers-icons').append('<i class="icon-user"> </i> ');
		}

		//update viewers count
		$(".connected-viewers-number").text(connectedViewers + " viewers");
		//$('#numConnectedViewers').text(connectedViewers + '');
		console.log('New viewer connected');
	}
	socket.on('connect', function(event) {
		socket.emit('asq:admin', {
			session : session
		});

		$('.connected-viewers-number').text("0 viewers connected")

		/**
		 Handle socket event 'new'
		 Notifies the admin of a new connection to the presentation.
		 */
		socket.on('asq:submitted', function(event) {
			console.log("You've got an answer!");
			console.log(event);
			updateParticipation(event.submittedViewers, event.totalViewers, event.questionId);
		});

		/**
		 * Update the viewers count when users connect or disconnect.
		 */
		socket.on('asq:folo-connected', updateViewersCount);

		socket.on('asq:start', function(event) {
			if (!started) {
				impress().start();
				$('#welcomeScreen').modal('hide');
				$('#waitingScreen').hide();
				$('#slidesControll').show();

				started = true;
			}
		});

		socket.on('asq:goto', function(event) {
			console.log('GOTO received');
			if (mode == 'control') {
				$('.controlThumbs .thumbsWrapper .active').removeClass('active');
				$('.controlThumbs').scrollTo('.' + event.slide, 500, {
					offset : -150
				});
				$('.controlThumbs .thumbsWrapper .' + event.slide).addClass("active");

				var next = $('#' + event.slide).next().attr('id');
				$('#nextSlideFrame').attr('src', '/slidesRender/' + slidesId + '/#/' + next);
			}
			impress().goto(event.slide);
		});

		socket.on('asq:gotosub', function(event) {
			impress().gotoSub(event.substepIndex);
		});

		socket.on('asq:question', function(event) {
			window.alert("Question");
			showQuestion(event.question);
		});

		socket.on('asq:answer', function(event) {
			console.log(event.stats)
			showAnswer(event.question, event.stats);
			//Question contains the answer.
		});

		socket.on('asq:hide-answer', function(event) {
			$('#answer').modal('hide');
		});
		socket.on('asq:session-terminated', function(event) {
			console.log('session terminated')
			$('body').append('<div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.8);"><h2 style="color: white; text-align: center; margin-top: 100px">This presentation was terminated.</h2><p style="color: white; text-align: center;">To reconnect try refreshing your browser window.</p><p style="text-align: center;"><a href="/user">Return to presentations.</a></p></div>');
		});
	});

	/**
	 Handle impress:stepgoto event
	 Send a socket event to notify which slide to go to.
	 */
	document.addEventListener("impress:stepgoto", function(event) {
		socket.emit('asq:goto', {
			slide : event.target.id,
			session : session
		});
	});

	/**
	 Handle impress:stepgotosub event
	 sSend a socket event to notify which slide subtest to go to.
	 */
	document.addEventListener("impress:stepgotosub", function(event) {
		socket.emit('asq:gotosub', {
			substepIndex : event.detail.index,
			session : session
		});
	});

	/**
	 Handle impress:stepgoto event
	 sSend a socket event to notify which slide to go to.
	 */
	document.addEventListener("impress:start", function(event) {
		socket.emit('asq:start', {
			session : session,
			slide : $('#impress .active').attr('id')
		});
	});

	document.addEventListener('asq:close', function(event) {
		socket.emit('asq:goto', {
			session : session
		});
	});

	//Shows stasts/answers
	document.addEventListener('local:show-stats', function(event) {
		socket.emit('asq:show-stats', {});
	});
	$('#stopSessionBtn').click(function() {
		socket.emit('asq:terminate-session', {
			session : session
		});
	});
}
function updateParticipation(submittedViewers, totalViewers, questionId) {
	var maxViewers = -1;
	if (maxViewers < totalViewers) {
		maxViewers = totalViewers;
	}

	if (maxViewers == submittedViewers) {
		$('[question-id="' + questionId + '"] .progressNum').text('All answers received (' + submittedViewers + '/' + maxViewers + '). ');
		$('[question-id="' + questionId + '"] .show-stats').attr("class", "btn btn-success");
	} else {
		$('[question-id="' + questionId + '"] .progressNum').text(submittedViewers + '/' + maxViewers + ' answers received.');
	}
	var width = (submittedViewers / maxViewers) * 100;
	$('[question-id="' + questionId + '"] .progress .bar').css('width', width + "%");
}

var showStats = function() {
	var myEvent = new CustomEvent('local:show-stats', {});
	document.dispatchEvent(myEvent);
}
var showQuestion = function(question) {
	$('.progessbar').css('width', "0%");
	$('#progressNum').text('Waiting for answers!');
	$('#question').modal('show');
	$('#questionText').html('<h3>' + question.questionText + '</h3>');
	var optionsstring = '';
	if (question.questionType == "Multiple choice") {
		optionsstring = '<span class="help-block">Please select all correct answers.</span>';
		for (var i = 0; i < question.answeroptions.length; i++) {
			optionsstring += '<label class="checkbox"><input type="checkbox">' + question.answeroptions[i].optionText + '</label>';
		}

	} else {
		optionsstring = '<span class="help-block">Please enter your solution. Capitalisation will be ignored.</span>';
		optionsstring += '<input type="text" placeholder="Your solution...">';
	}

	$('#answeroptions').html(optionsstring);

}
var showAnswer = function(question, stats) {
	console.log(stats.correct + "STATS!");
	var correct = stats.correct || null;
	var countedMcOptions = stats.countedMcOptions || null;
	var equalAnswers = stats.equalAnswers || null;
	google.load("visualization", "1", {
		packages : ["corechart"],
		callback : drawChart
	});

	//Google chart drawing for stats
	function drawChart() {
		console.log('GOOGLE CHART');
		if (question.questionType === "Multiple choice") {
			var mscstatData = google.visualization.arrayToDataTable(countedMcOptions);
		}
		var rvswData = google.visualization.arrayToDataTable(correct);
		var diffAnsData = google.visualization.arrayToDataTable(equalAnswers);

		var rvswOpt = {
			title : 'Correct vs. Wrong',
			'width' : 760,
			'height' : 400,
			chartArea : {
				left : 0,
				top : 0,
				width : "600px",
				height : "350px"
			}
		};

		var mscstatOpt = {
			animation : {
				duration : 1000
			},
			hAxis : {
				allowContainerBoundaryTextCufoff : true,
				slantedTextAngle : 50
			},
			'width' : 760,

			'legend' : {
				position : 'top',
				textStyle : {
					fontSize : 16
				}
			}
		};

		var chart3 = new google.visualization.PieChart(document.getElementById('rvswChart'));
		chart3.draw(rvswData, rvswOpt);

		if (question.questionType === "Multiple choice") {
			var chart = new google.visualization.ColumnChart(document.getElementById('mscstatChart'));
			chart.draw(mscstatData, mscstatOpt);
		} else {
			$('#mscstats').css("display", 'none');
			$('#mscstats').removeAttr('style');
			$('#mscstatsBtn').remove();
		}

		var chart = new google.visualization.ColumnChart(document.getElementById('diffAnsChart'));
		chart.draw(diffAnsData, mscstatOpt);
	}


	$('#answerText').html('<h3>Statistics for "' + question.questionText + '"</h3>');
	var optionsstring = '<h5>Correct answer:</h5>';
	if (question.questionType == "Multiple choice") {
		for (var i = 0; i < question.answeroptions.length; i++) {
			optionsstring += '<label class="checkbox" >';
			if (question.answeroptions[i].correct == true) {
				optionsstring += '<i class="icon-ok"> </i> ';
			} else {
				optionsstring += '<i class="icon-remove"> </i> ';
			}
			optionsstring += question.answeroptions[i].optionText + '</label>';
		}
	} else {
		optionsstring = '<span class="help-block">Correct answer.</span>';
		optionsstring += '<p>' + +'</p>';
		optionsstring += '<span class="help-block">Your answer.</span>';
		optionsstring += '<input type="text" value="Norway" readonly>';
	}
	//google.setOnLoadCallback(drawChart);
	//drawChart();
	//update modal content
	$('#answersolutions').html(optionsstring);
	$('#question').modal('hide');
	$('#answer').modal('show');
};

google.load("visualization", "1", {
	packages : ["corechart"]
});

google.setOnLoadCallback(drawChart);

var statsTypes = {

	rightVsWrong : {
		metric : "rightVsWrong",
		data : [],
		chart : [],
		options : {
			width : 800,
		}
	},

	distinctOptions : {
		metric : "distinctOptions",
		data : [],
		chart : [],
		options : {
			title : 'How often was a group of options selected',
			width : 800,
			isStacked : true,
			legend : {
				position : 'top',
				alignment : 'center'
			}
		}
	},

	distinctAnswers : {
		metric : "distinctAnswers",
		data : [],
		chart : [],
		options : {
			title : 'How often was an option selected',
			isStacked : true,
			width : 800,
			legend : {
				position : 'top',
				alignment : 'center'
			}
		}
	}
};

function drawChart() {
	$('.stats').each(function(el) {
		var questionId = $(this).attr('target-assessment-id');
		statsTypes.rightVsWrong.chart[questionId] = new google.visualization.PieChart($(this).find(".rvswChart")[0]);
		statsTypes.distinctOptions.chart[questionId] = new google.visualization.ColumnChart($(this).find(".distinctOptions")[0]);
		statsTypes.distinctAnswers.chart[questionId] = new google.visualization.ColumnChart($(this).find(".distinctAnswers")[0]);
	})
}


$('a[data-toggle="tab"]').on('shown', function(e) {
	var questionId = $(this).parents().find(".stats").attr('target-assessment-id');
	requestDistinct(questionId)
	// for (var key in statsTypes) {
	// 	requestStats(questionId, statsTypes[key])
	// }
});

function requestDistinct(questionId, obj) {
	$.getJSON('/stats/getStats?question=' + questionId + '&metric=distinctOptions', function(data) {
		console.log(data);
		var list = '<ul class="different-options">'
		for (var i=1; i<data.length; i++){
			var times =  data[i][2] > 1 ? '<span class="times">&nbsp;(' + data[i][2] +')</span>' : ''
			list += '<li>' + data[i][0]  + times + '</li>'
		}
		list+='</ul>'
		$('.stats[target-assessment-id=' + questionId+']').find('.tab-pane').eq(1).html(list);
	});
}

function requestStats(questionId, obj) {
	$.getJSON('/stats/getStats?question=' + questionId + '&metric=' + obj.metric, function(data) {
		console.log(data);
		obj.data[questionId] = google.visualization.arrayToDataTable(data);
		obj.chart[questionId].draw(obj.data[questionId], obj.options);
	});
}


$(".mobileNext").click(function() {
	impress().next();
})

$(".mobilePrev").click(function() {
	impress().prev();
})

module.exports={
	connect: connect
}


},{"impressPresenter":"++fus9","socket.io-browserify":4}],4:[function(require,module,exports){
(function () {var io = module.exports;/*! Socket.IO.js build:0.8.6, development. Copyright(c) 2011 LearnBoost <dev@learnboost.com> MIT Licensed */

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, global) {

  /**
   * IO namespace.
   *
   * @namespace
   */

  var io = exports;

  /**
   * Socket.IO version
   *
   * @api public
   */

  io.version = '0.8.6';

  /**
   * Protocol implemented.
   *
   * @api public
   */

  io.protocol = 1;

  /**
   * Available transports, these will be populated with the available transports
   *
   * @api public
   */

  io.transports = [];

  /**
   * Keep track of jsonp callbacks.
   *
   * @api private
   */

  io.j = [];

  /**
   * Keep track of our io.Sockets
   *
   * @api private
   */
  io.sockets = {};


  /**
   * Manages connections to hosts.
   *
   * @param {String} uri
   * @Param {Boolean} force creation of new socket (defaults to false)
   * @api public
   */

  io.connect = function (host, details) {
    var uri = io.util.parseUri(host)
      , uuri
      , socket;

    if (global && global.location) {
      uri.protocol = uri.protocol || global.location.protocol.slice(0, -1);
      uri.host = uri.host || (global.document
        ? global.document.domain : global.location.hostname);
      uri.port = uri.port || global.location.port;
    }

    uuri = io.util.uniqueUri(uri);

    var options = {
        host: uri.host
      , secure: 'https' == uri.protocol
      , port: uri.port || ('https' == uri.protocol ? 443 : 80)
      , query: uri.query || ''
    };

    io.util.merge(options, details);

    if (options['force new connection'] || !io.sockets[uuri]) {
      socket = new io.Socket(options);
    }

    if (!options['force new connection'] && socket) {
      io.sockets[uuri] = socket;
    }

    socket = socket || io.sockets[uuri];

    // if path is different from '' or /
    return socket.of(uri.path.length > 1 ? uri.path : '');
  };

})('object' === typeof module ? module.exports : (this.io = {}), this);

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, global) {

  /**
   * Utilities namespace.
   *
   * @namespace
   */

  var util = exports.util = {};

  /**
   * Parses an URI
   *
   * @author Steven Levithan <stevenlevithan.com> (MIT license)
   * @api public
   */

  var re = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

  var parts = ['source', 'protocol', 'authority', 'userInfo', 'user', 'password',
               'host', 'port', 'relative', 'path', 'directory', 'file', 'query',
               'anchor'];

  util.parseUri = function (str) {
    var m = re.exec(str || '')
      , uri = {}
      , i = 14;

    while (i--) {
      uri[parts[i]] = m[i] || '';
    }

    return uri;
  };

  /**
   * Produces a unique url that identifies a Socket.IO connection.
   *
   * @param {Object} uri
   * @api public
   */

  util.uniqueUri = function (uri) {
    var protocol = uri.protocol
      , host = uri.host
      , port = uri.port;

    if ('document' in global) {
      host = host || document.domain;
      port = port || (protocol == 'https'
        && document.location.protocol !== 'https:' ? 443 : document.location.port);
    } else {
      host = host || 'localhost';

      if (!port && protocol == 'https') {
        port = 443;
      }
    }

    return (protocol || 'http') + '://' + host + ':' + (port || 80);
  };

  /**
   * Mergest 2 query strings in to once unique query string
   *
   * @param {String} base
   * @param {String} addition
   * @api public
   */

  util.query = function (base, addition) {
    var query = util.chunkQuery(base || '')
      , components = [];

    util.merge(query, util.chunkQuery(addition || ''));
    for (var part in query) {
      if (query.hasOwnProperty(part)) {
        components.push(part + '=' + query[part]);
      }
    }

    return components.length ? '?' + components.join('&') : '';
  };

  /**
   * Transforms a querystring in to an object
   *
   * @param {String} qs
   * @api public
   */

  util.chunkQuery = function (qs) {
    var query = {}
      , params = qs.split('&')
      , i = 0
      , l = params.length
      , kv;

    for (; i < l; ++i) {
      kv = params[i].split('=');
      if (kv[0]) {
        query[kv[0]] = decodeURIComponent(kv[1]);
      }
    }

    return query;
  };

  /**
   * Executes the given function when the page is loaded.
   *
   *     io.util.load(function () { console.log('page loaded'); });
   *
   * @param {Function} fn
   * @api public
   */

  var pageLoaded = false;

  util.load = function (fn) {
    if ('document' in global && document.readyState === 'complete' || pageLoaded) {
      return fn();
    }

    util.on(global, 'load', fn, false);
  };

  /**
   * Adds an event.
   *
   * @api private
   */

  util.on = function (element, event, fn, capture) {
    if (element.attachEvent) {
      element.attachEvent('on' + event, fn);
    } else if (element.addEventListener) {
      element.addEventListener(event, fn, capture);
    }
  };

  /**
   * Generates the correct `XMLHttpRequest` for regular and cross domain requests.
   *
   * @param {Boolean} [xdomain] Create a request that can be used cross domain.
   * @returns {XMLHttpRequest|false} If we can create a XMLHttpRequest.
   * @api private
   */

  util.request = function (xdomain) {

    if (xdomain && 'undefined' != typeof XDomainRequest) {
      return new XDomainRequest();
    }

    if ('undefined' != typeof XMLHttpRequest && (!xdomain || util.ua.hasCORS)) {
      return new XMLHttpRequest();
    }

    if (!xdomain) {
      try {
        return new ActiveXObject('Microsoft.XMLHTTP');
      } catch(e) { }
    }

    return null;
  };

  /**
   * XHR based transport constructor.
   *
   * @constructor
   * @api public
   */

  /**
   * Change the internal pageLoaded value.
   */

  if ('undefined' != typeof window) {
    util.load(function () {
      pageLoaded = true;
    });
  }

  /**
   * Defers a function to ensure a spinner is not displayed by the browser
   *
   * @param {Function} fn
   * @api public
   */

  util.defer = function (fn) {
    if (!util.ua.webkit || 'undefined' != typeof importScripts) {
      return fn();
    }

    util.load(function () {
      setTimeout(fn, 100);
    });
  };

  /**
   * Merges two objects.
   *
   * @api public
   */
  
  util.merge = function merge (target, additional, deep, lastseen) {
    var seen = lastseen || []
      , depth = typeof deep == 'undefined' ? 2 : deep
      , prop;

    for (prop in additional) {
      if (additional.hasOwnProperty(prop) && util.indexOf(seen, prop) < 0) {
        if (typeof target[prop] !== 'object' || !depth) {
          target[prop] = additional[prop];
          seen.push(additional[prop]);
        } else {
          util.merge(target[prop], additional[prop], depth - 1, seen);
        }
      }
    }

    return target;
  };

  /**
   * Merges prototypes from objects
   *
   * @api public
   */
  
  util.mixin = function (ctor, ctor2) {
    util.merge(ctor.prototype, ctor2.prototype);
  };

  /**
   * Shortcut for prototypical and static inheritance.
   *
   * @api private
   */

  util.inherit = function (ctor, ctor2) {
    function f() {};
    f.prototype = ctor2.prototype;
    ctor.prototype = new f;
  };

  /**
   * Checks if the given object is an Array.
   *
   *     io.util.isArray([]); // true
   *     io.util.isArray({}); // false
   *
   * @param Object obj
   * @api public
   */

  util.isArray = Array.isArray || function (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  };

  /**
   * Intersects values of two arrays into a third
   *
   * @api public
   */

  util.intersect = function (arr, arr2) {
    var ret = []
      , longest = arr.length > arr2.length ? arr : arr2
      , shortest = arr.length > arr2.length ? arr2 : arr;

    for (var i = 0, l = shortest.length; i < l; i++) {
      if (~util.indexOf(longest, shortest[i]))
        ret.push(shortest[i]);
    }

    return ret;
  }

  /**
   * Array indexOf compatibility.
   *
   * @see bit.ly/a5Dxa2
   * @api public
   */

  util.indexOf = function (arr, o, i) {
    if (Array.prototype.indexOf) {
      return Array.prototype.indexOf.call(arr, o, i);
    }

    for (var j = arr.length, i = i < 0 ? i + j < 0 ? 0 : i + j : i || 0; 
         i < j && arr[i] !== o; i++) {}

    return j <= i ? -1 : i;
  };

  /**
   * Converts enumerables to array.
   *
   * @api public
   */

  util.toArray = function (enu) {
    var arr = [];

    for (var i = 0, l = enu.length; i < l; i++)
      arr.push(enu[i]);

    return arr;
  };

  /**
   * UA / engines detection namespace.
   *
   * @namespace
   */

  util.ua = {};

  /**
   * Whether the UA supports CORS for XHR.
   *
   * @api public
   */

  util.ua.hasCORS = 'undefined' != typeof XMLHttpRequest && (function () {
    try {
      var a = new XMLHttpRequest();
    } catch (e) {
      return false;
    }

    return a.withCredentials != undefined;
  })();

  /**
   * Detect webkit.
   *
   * @api public
   */

  util.ua.webkit = 'undefined' != typeof navigator
    && /webkit/i.test(navigator.userAgent);

})('undefined' != typeof io ? io : module.exports, this);

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io) {

  /**
   * Expose constructor.
   */

  exports.EventEmitter = EventEmitter;

  /**
   * Event emitter constructor.
   *
   * @api public.
   */

  function EventEmitter () {};

  /**
   * Adds a listener
   *
   * @api public
   */

  EventEmitter.prototype.on = function (name, fn) {
    if (!this.$events) {
      this.$events = {};
    }

    if (!this.$events[name]) {
      this.$events[name] = fn;
    } else if (io.util.isArray(this.$events[name])) {
      this.$events[name].push(fn);
    } else {
      this.$events[name] = [this.$events[name], fn];
    }

    return this;
  };

  EventEmitter.prototype.addListener = EventEmitter.prototype.on;

  /**
   * Adds a volatile listener.
   *
   * @api public
   */

  EventEmitter.prototype.once = function (name, fn) {
    var self = this;

    function on () {
      self.removeListener(name, on);
      fn.apply(this, arguments);
    };

    on.listener = fn;
    this.on(name, on);

    return this;
  };

  /**
   * Removes a listener.
   *
   * @api public
   */

  EventEmitter.prototype.removeListener = function (name, fn) {
    if (this.$events && this.$events[name]) {
      var list = this.$events[name];

      if (io.util.isArray(list)) {
        var pos = -1;

        for (var i = 0, l = list.length; i < l; i++) {
          if (list[i] === fn || (list[i].listener && list[i].listener === fn)) {
            pos = i;
            break;
          }
        }

        if (pos < 0) {
          return this;
        }

        list.splice(pos, 1);

        if (!list.length) {
          delete this.$events[name];
        }
      } else if (list === fn || (list.listener && list.listener === fn)) {
        delete this.$events[name];
      }
    }

    return this;
  };

  /**
   * Removes all listeners for an event.
   *
   * @api public
   */

  EventEmitter.prototype.removeAllListeners = function (name) {
    // TODO: enable this when node 0.5 is stable
    //if (name === undefined) {
      //this.$events = {};
      //return this;
    //}

    if (this.$events && this.$events[name]) {
      this.$events[name] = null;
    }

    return this;
  };

  /**
   * Gets all listeners for a certain event.
   *
   * @api publci
   */

  EventEmitter.prototype.listeners = function (name) {
    if (!this.$events) {
      this.$events = {};
    }

    if (!this.$events[name]) {
      this.$events[name] = [];
    }

    if (!io.util.isArray(this.$events[name])) {
      this.$events[name] = [this.$events[name]];
    }

    return this.$events[name];
  };

  /**
   * Emits an event.
   *
   * @api public
   */

  EventEmitter.prototype.emit = function (name) {
    if (!this.$events) {
      return false;
    }

    var handler = this.$events[name];

    if (!handler) {
      return false;
    }

    var args = Array.prototype.slice.call(arguments, 1);

    if ('function' == typeof handler) {
      handler.apply(this, args);
    } else if (io.util.isArray(handler)) {
      var listeners = handler.slice();

      for (var i = 0, l = listeners.length; i < l; i++) {
        listeners[i].apply(this, args);
      }
    } else {
      return false;
    }

    return true;
  };

})(
    'undefined' != typeof io ? io : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
);

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Based on JSON2 (http://www.JSON.org/js.html).
 */

(function (exports, nativeJSON) {
  "use strict";

  // use native JSON if it's available
  if (nativeJSON && nativeJSON.parse){
    return exports.JSON = {
      parse: nativeJSON.parse
    , stringify: nativeJSON.stringify
    }
  }

  var JSON = exports.JSON = {};

  function f(n) {
      // Format integers to have at least two digits.
      return n < 10 ? '0' + n : n;
  }

  function date(d, key) {
    return isFinite(d.valueOf()) ?
        d.getUTCFullYear()     + '-' +
        f(d.getUTCMonth() + 1) + '-' +
        f(d.getUTCDate())      + 'T' +
        f(d.getUTCHours())     + ':' +
        f(d.getUTCMinutes())   + ':' +
        f(d.getUTCSeconds())   + 'Z' : null;
  };

  var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
      escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
      gap,
      indent,
      meta = {    // table of character substitutions
          '\b': '\\b',
          '\t': '\\t',
          '\n': '\\n',
          '\f': '\\f',
          '\r': '\\r',
          '"' : '\\"',
          '\\': '\\\\'
      },
      rep;


  function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

      escapable.lastIndex = 0;
      return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
          var c = meta[a];
          return typeof c === 'string' ? c :
              '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
      }) + '"' : '"' + string + '"';
  }


  function str(key, holder) {

// Produce a string from holder[key].

      var i,          // The loop counter.
          k,          // The member key.
          v,          // The member value.
          length,
          mind = gap,
          partial,
          value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

      if (value instanceof Date) {
          value = date(key);
      }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

      if (typeof rep === 'function') {
          value = rep.call(holder, key, value);
      }

// What happens next depends on the value's type.

      switch (typeof value) {
      case 'string':
          return quote(value);

      case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

          return isFinite(value) ? String(value) : 'null';

      case 'boolean':
      case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

          return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

      case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

          if (!value) {
              return 'null';
          }

// Make an array to hold the partial results of stringifying this object value.

          gap += indent;
          partial = [];

// Is the value an array?

          if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

              length = value.length;
              for (i = 0; i < length; i += 1) {
                  partial[i] = str(i, value) || 'null';
              }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

              v = partial.length === 0 ? '[]' : gap ?
                  '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                  '[' + partial.join(',') + ']';
              gap = mind;
              return v;
          }

// If the replacer is an array, use it to select the members to be stringified.

          if (rep && typeof rep === 'object') {
              length = rep.length;
              for (i = 0; i < length; i += 1) {
                  if (typeof rep[i] === 'string') {
                      k = rep[i];
                      v = str(k, value);
                      if (v) {
                          partial.push(quote(k) + (gap ? ': ' : ':') + v);
                      }
                  }
              }
          } else {

// Otherwise, iterate through all of the keys in the object.

              for (k in value) {
                  if (Object.prototype.hasOwnProperty.call(value, k)) {
                      v = str(k, value);
                      if (v) {
                          partial.push(quote(k) + (gap ? ': ' : ':') + v);
                      }
                  }
              }
          }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

          v = partial.length === 0 ? '{}' : gap ?
              '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
              '{' + partial.join(',') + '}';
          gap = mind;
          return v;
      }
  }

// If the JSON object does not yet have a stringify method, give it one.

  JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

      var i;
      gap = '';
      indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

      if (typeof space === 'number') {
          for (i = 0; i < space; i += 1) {
              indent += ' ';
          }

// If the space parameter is a string, it will be used as the indent string.

      } else if (typeof space === 'string') {
          indent = space;
      }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

      rep = replacer;
      if (replacer && typeof replacer !== 'function' &&
              (typeof replacer !== 'object' ||
              typeof replacer.length !== 'number')) {
          throw new Error('JSON.stringify');
      }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

      return str('', {'': value});
  };

// If the JSON object does not yet have a parse method, give it one.

  JSON.parse = function (text, reviver) {
  // The parse method takes a text and an optional reviver function, and returns
  // a JavaScript value if the text is a valid JSON text.

      var j;

      function walk(holder, key) {

  // The walk method is used to recursively walk the resulting structure so
  // that modifications can be made.

          var k, v, value = holder[key];
          if (value && typeof value === 'object') {
              for (k in value) {
                  if (Object.prototype.hasOwnProperty.call(value, k)) {
                      v = walk(value, k);
                      if (v !== undefined) {
                          value[k] = v;
                      } else {
                          delete value[k];
                      }
                  }
              }
          }
          return reviver.call(holder, key, value);
      }


  // Parsing happens in four stages. In the first stage, we replace certain
  // Unicode characters with escape sequences. JavaScript handles many characters
  // incorrectly, either silently deleting them, or treating them as line endings.

      text = String(text);
      cx.lastIndex = 0;
      if (cx.test(text)) {
          text = text.replace(cx, function (a) {
              return '\\u' +
                  ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
          });
      }

  // In the second stage, we run the text against regular expressions that look
  // for non-JSON patterns. We are especially concerned with '()' and 'new'
  // because they can cause invocation, and '=' because it can cause mutation.
  // But just to be safe, we want to reject all unexpected forms.

  // We split the second stage into 4 regexp operations in order to work around
  // crippling inefficiencies in IE's and Safari's regexp engines. First we
  // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
  // replace all simple value tokens with ']' characters. Third, we delete all
  // open brackets that follow a colon or comma or that begin the text. Finally,
  // we look to see that the remaining characters are only whitespace or ']' or
  // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

      if (/^[\],:{}\s]*$/
              .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                  .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                  .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

  // In the third stage we use the eval function to compile the text into a
  // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
  // in JavaScript: it can begin a block or an object literal. We wrap the text
  // in parens to eliminate the ambiguity.

          j = eval('(' + text + ')');

  // In the optional fourth stage, we recursively walk the new structure, passing
  // each name/value pair to a reviver function for possible transformation.

          return typeof reviver === 'function' ?
              walk({'': j}, '') : j;
      }

  // If the text is not JSON parseable, then a SyntaxError is thrown.

      throw new SyntaxError('JSON.parse');
  };

})(
    'undefined' != typeof io ? io : module.exports
  , typeof JSON !== 'undefined' ? JSON : undefined
);

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io) {

  /**
   * Parser namespace.
   *
   * @namespace
   */

  var parser = exports.parser = {};

  /**
   * Packet types.
   */

  var packets = parser.packets = [
      'disconnect'
    , 'connect'
    , 'heartbeat'
    , 'message'
    , 'json'
    , 'event'
    , 'ack'
    , 'error'
    , 'noop'
  ];

  /**
   * Errors reasons.
   */

  var reasons = parser.reasons = [
      'transport not supported'
    , 'client not handshaken'
    , 'unauthorized'
  ];

  /**
   * Errors advice.
   */

  var advice = parser.advice = [
      'reconnect'
  ];

  /**
   * Shortcuts.
   */

  var JSON = io.JSON
    , indexOf = io.util.indexOf;

  /**
   * Encodes a packet.
   *
   * @api private
   */

  parser.encodePacket = function (packet) {
    var type = indexOf(packets, packet.type)
      , id = packet.id || ''
      , endpoint = packet.endpoint || ''
      , ack = packet.ack
      , data = null;

    switch (packet.type) {
      case 'error':
        var reason = packet.reason ? indexOf(reasons, packet.reason) : ''
          , adv = packet.advice ? indexOf(advice, packet.advice) : '';

        if (reason !== '' || adv !== '')
          data = reason + (adv !== '' ? ('+' + adv) : '');

        break;

      case 'message':
        if (packet.data !== '')
          data = packet.data;
        break;

      case 'event':
        var ev = { name: packet.name };

        if (packet.args && packet.args.length) {
          ev.args = packet.args;
        }

        data = JSON.stringify(ev);
        break;

      case 'json':
        data = JSON.stringify(packet.data);
        break;

      case 'connect':
        if (packet.qs)
          data = packet.qs;
        break;

      case 'ack':
        data = packet.ackId
          + (packet.args && packet.args.length
              ? '+' + JSON.stringify(packet.args) : '');
        break;
    }

    // construct packet with required fragments
    var encoded = [
        type
      , id + (ack == 'data' ? '+' : '')
      , endpoint
    ];

    // data fragment is optional
    if (data !== null && data !== undefined)
      encoded.push(data);

    return encoded.join(':');
  };

  /**
   * Encodes multiple messages (payload).
   *
   * @param {Array} messages
   * @api private
   */

  parser.encodePayload = function (packets) {
    var decoded = '';

    if (packets.length == 1)
      return packets[0];

    for (var i = 0, l = packets.length; i < l; i++) {
      var packet = packets[i];
      decoded += '\ufffd' + packet.length + '\ufffd' + packets[i];
    }

    return decoded;
  };

  /**
   * Decodes a packet
   *
   * @api private
   */

  var regexp = /([^:]+):([0-9]+)?(\+)?:([^:]+)?:?([\s\S]*)?/;

  parser.decodePacket = function (data) {
    var pieces = data.match(regexp);

    if (!pieces) return {};

    var id = pieces[2] || ''
      , data = pieces[5] || ''
      , packet = {
            type: packets[pieces[1]]
          , endpoint: pieces[4] || ''
        };

    // whether we need to acknowledge the packet
    if (id) {
      packet.id = id;
      if (pieces[3])
        packet.ack = 'data';
      else
        packet.ack = true;
    }

    // handle different packet types
    switch (packet.type) {
      case 'error':
        var pieces = data.split('+');
        packet.reason = reasons[pieces[0]] || '';
        packet.advice = advice[pieces[1]] || '';
        break;

      case 'message':
        packet.data = data || '';
        break;

      case 'event':
        try {
          var opts = JSON.parse(data);
          packet.name = opts.name;
          packet.args = opts.args;
        } catch (e) { }

        packet.args = packet.args || [];
        break;

      case 'json':
        try {
          packet.data = JSON.parse(data);
        } catch (e) { }
        break;

      case 'connect':
        packet.qs = data || '';
        break;

      case 'ack':
        var pieces = data.match(/^([0-9]+)(\+)?(.*)/);
        if (pieces) {
          packet.ackId = pieces[1];
          packet.args = [];

          if (pieces[3]) {
            try {
              packet.args = pieces[3] ? JSON.parse(pieces[3]) : [];
            } catch (e) { }
          }
        }
        break;

      case 'disconnect':
      case 'heartbeat':
        break;
    };

    return packet;
  };

  /**
   * Decodes data payload. Detects multiple messages
   *
   * @return {Array} messages
   * @api public
   */

  parser.decodePayload = function (data) {
    // IE doesn't like data[i] for unicode chars, charAt works fine
    if (data.charAt(0) == '\ufffd') {
      var ret = [];

      for (var i = 1, length = ''; i < data.length; i++) {
        if (data.charAt(i) == '\ufffd') {
          ret.push(parser.decodePacket(data.substr(i + 1).substr(0, length)));
          i += Number(length) + 1;
          length = '';
        } else {
          length += data.charAt(i);
        }
      }

      return ret;
    } else {
      return [parser.decodePacket(data)];
    }
  };

})(
    'undefined' != typeof io ? io : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
);
/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io) {

  /**
   * Expose constructor.
   */

  exports.Transport = Transport;

  /**
   * This is the transport template for all supported transport methods.
   *
   * @constructor
   * @api public
   */

  function Transport (socket, sessid) {
    this.socket = socket;
    this.sessid = sessid;
  };

  /**
   * Apply EventEmitter mixin.
   */

  io.util.mixin(Transport, io.EventEmitter);

  /**
   * Handles the response from the server. When a new response is received
   * it will automatically update the timeout, decode the message and
   * forwards the response to the onMessage function for further processing.
   *
   * @param {String} data Response from the server.
   * @api private
   */

  Transport.prototype.onData = function (data) {
    this.clearCloseTimeout();
    
    // If the connection in currently open (or in a reopening state) reset the close 
    // timeout since we have just received data. This check is necessary so
    // that we don't reset the timeout on an explicitly disconnected connection.
    if (this.connected || this.connecting || this.reconnecting) {
      this.setCloseTimeout();
    }

    if (data !== '') {
      // todo: we should only do decodePayload for xhr transports
      var msgs = io.parser.decodePayload(data);

      if (msgs && msgs.length) {
        for (var i = 0, l = msgs.length; i < l; i++) {
          this.onPacket(msgs[i]);
        }
      }
    }

    return this;
  };

  /**
   * Handles packets.
   *
   * @api private
   */

  Transport.prototype.onPacket = function (packet) {
    if (packet.type == 'heartbeat') {
      return this.onHeartbeat();
    }

    if (packet.type == 'connect' && packet.endpoint == '') {
      this.onConnect();
    }

    this.socket.onPacket(packet);

    return this;
  };

  /**
   * Sets close timeout
   *
   * @api private
   */
  
  Transport.prototype.setCloseTimeout = function () {
    if (!this.closeTimeout) {
      var self = this;

      this.closeTimeout = setTimeout(function () {
        self.onDisconnect();
      }, this.socket.closeTimeout);
    }
  };

  /**
   * Called when transport disconnects.
   *
   * @api private
   */

  Transport.prototype.onDisconnect = function () {
    if (this.close && this.open) this.close();
    this.clearTimeouts();
    this.socket.onDisconnect();
    return this;
  };

  /**
   * Called when transport connects
   *
   * @api private
   */

  Transport.prototype.onConnect = function () {
    this.socket.onConnect();
    return this;
  }

  /**
   * Clears close timeout
   *
   * @api private
   */

  Transport.prototype.clearCloseTimeout = function () {
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = null;
    }
  };

  /**
   * Clear timeouts
   *
   * @api private
   */

  Transport.prototype.clearTimeouts = function () {
    this.clearCloseTimeout();

    if (this.reopenTimeout) {
      clearTimeout(this.reopenTimeout);
    }
  };

  /**
   * Sends a packet
   *
   * @param {Object} packet object.
   * @api private
   */

  Transport.prototype.packet = function (packet) {
    this.send(io.parser.encodePacket(packet));
  };

  /**
   * Send the received heartbeat message back to server. So the server
   * knows we are still connected.
   *
   * @param {String} heartbeat Heartbeat response from the server.
   * @api private
   */

  Transport.prototype.onHeartbeat = function (heartbeat) {
    this.packet({ type: 'heartbeat' });
  };
 
  /**
   * Called when the transport opens.
   *
   * @api private
   */

  Transport.prototype.onOpen = function () {
    this.open = true;
    this.clearCloseTimeout();
    this.socket.onOpen();
  };

  /**
   * Notifies the base when the connection with the Socket.IO server
   * has been disconnected.
   *
   * @api private
   */

  Transport.prototype.onClose = function () {
    var self = this;

    /* FIXME: reopen delay causing a infinit loop
    this.reopenTimeout = setTimeout(function () {
      self.open();
    }, this.socket.options['reopen delay']);*/

    this.open = false;
    this.socket.onClose();
    this.onDisconnect();
  };

  /**
   * Generates a connection url based on the Socket.IO URL Protocol.
   * See <https://github.com/learnboost/socket.io-node/> for more details.
   *
   * @returns {String} Connection url
   * @api private
   */

  Transport.prototype.prepareUrl = function () {
    var options = this.socket.options;

    return this.scheme() + '://'
      + options.host + ':' + options.port + '/'
      + options.resource + '/' + io.protocol
      + '/' + this.name + '/' + this.sessid;
  };

  /**
   * Checks if the transport is ready to start a connection.
   *
   * @param {Socket} socket The socket instance that needs a transport
   * @param {Function} fn The callback
   * @api private
   */

  Transport.prototype.ready = function (socket, fn) {
    fn.call(this);
  };
})(
    'undefined' != typeof io ? io : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
);

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io, global) {

  /**
   * Expose constructor.
   */

  exports.Socket = Socket;

  /**
   * Create a new `Socket.IO client` which can establish a persistent
   * connection with a Socket.IO enabled server.
   *
   * @api public
   */

  function Socket (options) {
    this.options = {
        port: 80
      , secure: false
      , document: 'document' in global ? document : false
      , resource: 'socket.io'
      , transports: io.transports
      , 'connect timeout': 10000
      , 'try multiple transports': true
      , 'reconnect': true
      , 'reconnection delay': 500
      , 'reconnection limit': Infinity
      , 'reopen delay': 3000
      , 'max reconnection attempts': 10
      , 'sync disconnect on unload': true
      , 'auto connect': true
      , 'flash policy port': 10843
    };

    io.util.merge(this.options, options);

    this.connected = false;
    this.open = false;
    this.connecting = false;
    this.reconnecting = false;
    this.namespaces = {};
    this.buffer = [];
    this.doBuffer = false;

    if (this.options['sync disconnect on unload'] &&
        (!this.isXDomain() || io.util.ua.hasCORS)) {
      var self = this;

      io.util.on(global, 'beforeunload', function () {
        self.disconnectSync();
      }, false);
    }

    if (this.options['auto connect']) {
      this.connect();
    }
};

  /**
   * Apply EventEmitter mixin.
   */

  io.util.mixin(Socket, io.EventEmitter);

  /**
   * Returns a namespace listener/emitter for this socket
   *
   * @api public
   */

  Socket.prototype.of = function (name) {
    if (!this.namespaces[name]) {
      this.namespaces[name] = new io.SocketNamespace(this, name);

      if (name !== '') {
        this.namespaces[name].packet({ type: 'connect' });
      }
    }

    return this.namespaces[name];
  };

  /**
   * Emits the given event to the Socket and all namespaces
   *
   * @api private
   */

  Socket.prototype.publish = function () {
    this.emit.apply(this, arguments);

    var nsp;

    for (var i in this.namespaces) {
      if (this.namespaces.hasOwnProperty(i)) {
        nsp = this.of(i);
        nsp.$emit.apply(nsp, arguments);
      }
    }
  };

  /**
   * Performs the handshake
   *
   * @api private
   */

  function empty () { };

  Socket.prototype.handshake = function (fn) {
    var self = this
      , options = this.options;

    function complete (data) {
      if (data instanceof Error) {
        self.onError(data.message);
      } else {
        fn.apply(null, data.split(':'));
      }
    };

    var url = [
          'http' + (options.secure ? 's' : '') + ':/'
        , options.host + ':' + options.port
        , options.resource
        , io.protocol
        , io.util.query(this.options.query, 't=' + +new Date)
      ].join('/');

    if (this.isXDomain() && !io.util.ua.hasCORS) {
      var insertAt = document.getElementsByTagName('script')[0]
        , script = document.createElement('script');

      script.src = url + '&jsonp=' + io.j.length;
      insertAt.parentNode.insertBefore(script, insertAt);

      io.j.push(function (data) {
        complete(data);
        script.parentNode.removeChild(script);
      });
    } else {
      var xhr = io.util.request();

      xhr.open('GET', url, true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          xhr.onreadystatechange = empty;

          if (xhr.status == 200) {
            complete(xhr.responseText);
          } else {
            !self.reconnecting && self.onError(xhr.responseText);
          }
        }
      };
      xhr.send(null);
    }
  };

  /**
   * Find an available transport based on the options supplied in the constructor.
   *
   * @api private
   */

  Socket.prototype.getTransport = function (override) {
    var transports = override || this.transports, match;

    for (var i = 0, transport; transport = transports[i]; i++) {
      if (io.Transport[transport]
        && io.Transport[transport].check(this)
        && (!this.isXDomain() || io.Transport[transport].xdomainCheck())) {
        return new io.Transport[transport](this, this.sessionid);
      }
    }

    return null;
  };

  /**
   * Connects to the server.
   *
   * @param {Function} [fn] Callback.
   * @returns {io.Socket}
   * @api public
   */

  Socket.prototype.connect = function (fn) {
    if (this.connecting) {
      return this;
    }

    var self = this;

    this.handshake(function (sid, heartbeat, close, transports) {
      self.sessionid = sid;
      self.closeTimeout = close * 1000;
      self.heartbeatTimeout = heartbeat * 1000;
      self.transports = io.util.intersect(
          transports.split(',')
        , self.options.transports
      );

      function connect (transports){
        if (self.transport) self.transport.clearTimeouts();

        self.transport = self.getTransport(transports);
        if (!self.transport) return self.publish('connect_failed');

        // once the transport is ready
        self.transport.ready(self, function () {
          self.connecting = true;
          self.publish('connecting', self.transport.name);
          self.transport.open();

          if (self.options['connect timeout']) {
            self.connectTimeoutTimer = setTimeout(function () {
              if (!self.connected) {
                self.connecting = false;

                if (self.options['try multiple transports']) {
                  if (!self.remainingTransports) {
                    self.remainingTransports = self.transports.slice(0);
                  }

                  var remaining = self.remainingTransports;

                  while (remaining.length > 0 && remaining.splice(0,1)[0] !=
                         self.transport.name) {}

                    if (remaining.length){
                      connect(remaining);
                    } else {
                      self.publish('connect_failed');
                    }
                }
              }
            }, self.options['connect timeout']);
          }
        });
      }

      connect();

      self.once('connect', function (){
        clearTimeout(self.connectTimeoutTimer);

        fn && typeof fn == 'function' && fn();
      });
    });

    return this;
  };

  /**
   * Sends a message.
   *
   * @param {Object} data packet.
   * @returns {io.Socket}
   * @api public
   */

  Socket.prototype.packet = function (data) {
    if (this.connected && !this.doBuffer) {
      this.transport.packet(data);
    } else {
      this.buffer.push(data);
    }

    return this;
  };

  /**
   * Sets buffer state
   *
   * @api private
   */

  Socket.prototype.setBuffer = function (v) {
    this.doBuffer = v;

    if (!v && this.connected && this.buffer.length) {
      this.transport.payload(this.buffer);
      this.buffer = [];
    }
  };

  /**
   * Disconnect the established connect.
   *
   * @returns {io.Socket}
   * @api public
   */

  Socket.prototype.disconnect = function () {
    if (this.connected) {
      if (this.open) {
        this.of('').packet({ type: 'disconnect' });
      }

      // handle disconnection immediately
      this.onDisconnect('booted');
    }

    return this;
  };

  /**
   * Disconnects the socket with a sync XHR.
   *
   * @api private
   */

  Socket.prototype.disconnectSync = function () {
    // ensure disconnection
    var xhr = io.util.request()
      , uri = this.resource + '/' + io.protocol + '/' + this.sessionid;

    xhr.open('GET', uri, true);

    // handle disconnection immediately
    this.onDisconnect('booted');
  };

  /**
   * Check if we need to use cross domain enabled transports. Cross domain would
   * be a different port or different domain name.
   *
   * @returns {Boolean}
   * @api private
   */

  Socket.prototype.isXDomain = function () {

    var port = global.location.port ||
      ('https:' == global.location.protocol ? 443 : 80);

    return this.options.host !== global.location.hostname 
      || this.options.port != port;
  };

  /**
   * Called upon handshake.
   *
   * @api private
   */

  Socket.prototype.onConnect = function () {
    if (!this.connected) {
      this.connected = true;
      this.connecting = false;
      if (!this.doBuffer) {
        // make sure to flush the buffer
        this.setBuffer(false);
      }
      this.emit('connect');
    }
  };

  /**
   * Called when the transport opens
   *
   * @api private
   */

  Socket.prototype.onOpen = function () {
    this.open = true;
  };

  /**
   * Called when the transport closes.
   *
   * @api private
   */

  Socket.prototype.onClose = function () {
    this.open = false;
  };

  /**
   * Called when the transport first opens a connection
   *
   * @param text
   */

  Socket.prototype.onPacket = function (packet) {
    this.of(packet.endpoint).onPacket(packet);
  };

  /**
   * Handles an error.
   *
   * @api private
   */

  Socket.prototype.onError = function (err) {
    if (err && err.advice) {
      if (err.advice === 'reconnect' && this.connected) {
        this.disconnect();
        this.reconnect();
      }
    }

    this.publish('error', err && err.reason ? err.reason : err);
  };

  /**
   * Called when the transport disconnects.
   *
   * @api private
   */

  Socket.prototype.onDisconnect = function (reason) {
    var wasConnected = this.connected;

    this.connected = false;
    this.connecting = false;
    this.open = false;

    if (wasConnected) {
      this.transport.close();
      this.transport.clearTimeouts();
      this.publish('disconnect', reason);

      if ('booted' != reason && this.options.reconnect && !this.reconnecting) {
        this.reconnect();
      }
    }
  };

  /**
   * Called upon reconnection.
   *
   * @api private
   */

  Socket.prototype.reconnect = function () {
    this.reconnecting = true;
    this.reconnectionAttempts = 0;
    this.reconnectionDelay = this.options['reconnection delay'];

    var self = this
      , maxAttempts = this.options['max reconnection attempts']
      , tryMultiple = this.options['try multiple transports']
      , limit = this.options['reconnection limit'];

    function reset () {
      if (self.connected) {
        for (var i in self.namespaces) {
          if (self.namespaces.hasOwnProperty(i) && '' !== i) {
              self.namespaces[i].packet({ type: 'connect' });
          }
        }
        self.publish('reconnect', self.transport.name, self.reconnectionAttempts);
      }

      self.removeListener('connect_failed', maybeReconnect);
      self.removeListener('connect', maybeReconnect);

      self.reconnecting = false;

      delete self.reconnectionAttempts;
      delete self.reconnectionDelay;
      delete self.reconnectionTimer;
      delete self.redoTransports;

      self.options['try multiple transports'] = tryMultiple;
    };

    function maybeReconnect () {
      if (!self.reconnecting) {
        return;
      }

      if (self.connected) {
        return reset();
      };

      if (self.connecting && self.reconnecting) {
        return self.reconnectionTimer = setTimeout(maybeReconnect, 1000);
      }

      if (self.reconnectionAttempts++ >= maxAttempts) {
        if (!self.redoTransports) {
          self.on('connect_failed', maybeReconnect);
          self.options['try multiple transports'] = true;
          self.transport = self.getTransport();
          self.redoTransports = true;
          self.connect();
        } else {
          self.publish('reconnect_failed');
          reset();
        }
      } else {
        if (self.reconnectionDelay < limit) {
          self.reconnectionDelay *= 2; // exponential back off
        }

        self.connect();
        self.publish('reconnecting', self.reconnectionDelay, self.reconnectionAttempts);
        self.reconnectionTimer = setTimeout(maybeReconnect, self.reconnectionDelay);
      }
    };

    this.options['try multiple transports'] = false;
    this.reconnectionTimer = setTimeout(maybeReconnect, this.reconnectionDelay);

    this.on('connect', maybeReconnect);
  };

})(
    'undefined' != typeof io ? io : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
  , this
);
/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io) {

  /**
   * Expose constructor.
   */

  exports.SocketNamespace = SocketNamespace;

  /**
   * Socket namespace constructor.
   *
   * @constructor
   * @api public
   */

  function SocketNamespace (socket, name) {
    this.socket = socket;
    this.name = name || '';
    this.flags = {};
    this.json = new Flag(this, 'json');
    this.ackPackets = 0;
    this.acks = {};
  };

  /**
   * Apply EventEmitter mixin.
   */

  io.util.mixin(SocketNamespace, io.EventEmitter);

  /**
   * Copies emit since we override it
   *
   * @api private
   */

  SocketNamespace.prototype.$emit = io.EventEmitter.prototype.emit;

  /**
   * Creates a new namespace, by proxying the request to the socket. This
   * allows us to use the synax as we do on the server.
   *
   * @api public
   */

  SocketNamespace.prototype.of = function () {
    return this.socket.of.apply(this.socket, arguments);
  };

  /**
   * Sends a packet.
   *
   * @api private
   */

  SocketNamespace.prototype.packet = function (packet) {
    packet.endpoint = this.name;
    this.socket.packet(packet);
    this.flags = {};
    return this;
  };

  /**
   * Sends a message
   *
   * @api public
   */

  SocketNamespace.prototype.send = function (data, fn) {
    var packet = {
        type: this.flags.json ? 'json' : 'message'
      , data: data
    };

    if ('function' == typeof fn) {
      packet.id = ++this.ackPackets;
      packet.ack = true;
      this.acks[packet.id] = fn;
    }

    return this.packet(packet);
  };

  /**
   * Emits an event
   *
   * @api public
   */
  
  SocketNamespace.prototype.emit = function (name) {
    var args = Array.prototype.slice.call(arguments, 1)
      , lastArg = args[args.length - 1]
      , packet = {
            type: 'event'
          , name: name
        };

    if ('function' == typeof lastArg) {
      packet.id = ++this.ackPackets;
      packet.ack = 'data';
      this.acks[packet.id] = lastArg;
      args = args.slice(0, args.length - 1);
    }

    packet.args = args;

    return this.packet(packet);
  };

  /**
   * Disconnects the namespace
   *
   * @api private
   */

  SocketNamespace.prototype.disconnect = function () {
    if (this.name === '') {
      this.socket.disconnect();
    } else {
      this.packet({ type: 'disconnect' });
      this.$emit('disconnect');
    }

    return this;
  };

  /**
   * Handles a packet
   *
   * @api private
   */

  SocketNamespace.prototype.onPacket = function (packet) {
    var self = this;

    function ack () {
      self.packet({
          type: 'ack'
        , args: io.util.toArray(arguments)
        , ackId: packet.id
      });
    };

    switch (packet.type) {
      case 'connect':
        this.$emit('connect');
        break;

      case 'disconnect':
        if (this.name === '') {
          this.socket.onDisconnect(packet.reason || 'booted');
        } else {
          this.$emit('disconnect', packet.reason);
        }
        break;

      case 'message':
      case 'json':
        var params = ['message', packet.data];

        if (packet.ack == 'data') {
          params.push(ack);
        } else if (packet.ack) {
          this.packet({ type: 'ack', ackId: packet.id });
        }

        this.$emit.apply(this, params);
        break;

      case 'event':
        var params = [packet.name].concat(packet.args);

        if (packet.ack == 'data')
          params.push(ack);

        this.$emit.apply(this, params);
        break;

      case 'ack':
        if (this.acks[packet.ackId]) {
          this.acks[packet.ackId].apply(this, packet.args);
          delete this.acks[packet.ackId];
        }
        break;

      case 'error':
        if (packet.advice){
          this.socket.onError(packet);
        } else {
          if (packet.reason == 'unauthorized') {
            this.$emit('connect_failed', packet.reason);
          } else {
            this.$emit('error', packet.reason);
          }
        }
        break;
    }
  };

  /**
   * Flag interface.
   *
   * @api private
   */

  function Flag (nsp, name) {
    this.namespace = nsp;
    this.name = name;
  };

  /**
   * Send a message
   *
   * @api public
   */

  Flag.prototype.send = function () {
    this.namespace.flags[this.name] = true;
    this.namespace.send.apply(this.namespace, arguments);
  };

  /**
   * Emit an event
   *
   * @api public
   */

  Flag.prototype.emit = function () {
    this.namespace.flags[this.name] = true;
    this.namespace.emit.apply(this.namespace, arguments);
  };

})(
    'undefined' != typeof io ? io : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
);

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io, global) {

  /**
   * Expose constructor.
   */

  exports.websocket = WS;

  /**
   * The WebSocket transport uses the HTML5 WebSocket API to establish an
   * persistent connection with the Socket.IO server. This transport will also
   * be inherited by the FlashSocket fallback as it provides a API compatible
   * polyfill for the WebSockets.
   *
   * @constructor
   * @extends {io.Transport}
   * @api public
   */

  function WS (socket) {
    io.Transport.apply(this, arguments);
  };

  /**
   * Inherits from Transport.
   */

  io.util.inherit(WS, io.Transport);

  /**
   * Transport name
   *
   * @api public
   */

  WS.prototype.name = 'websocket';

  /**
   * Initializes a new `WebSocket` connection with the Socket.IO server. We attach
   * all the appropriate listeners to handle the responses from the server.
   *
   * @returns {Transport}
   * @api public
   */

  WS.prototype.open = function () {
    var query = io.util.query(this.socket.options.query)
      , self = this
      , Socket


    if (!Socket) {
      Socket = global.MozWebSocket || global.WebSocket;
    }

    this.websocket = new Socket(this.prepareUrl() + query);

    this.websocket.onopen = function () {
      self.onOpen();
      self.socket.setBuffer(false);
    };
    this.websocket.onmessage = function (ev) {
      self.onData(ev.data);
    };
    this.websocket.onclose = function () {
      self.onClose();
      self.socket.setBuffer(true);
    };
    this.websocket.onerror = function (e) {
      self.onError(e);
    };

    return this;
  };

  /**
   * Send a message to the Socket.IO server. The message will automatically be
   * encoded in the correct message format.
   *
   * @returns {Transport}
   * @api public
   */

  WS.prototype.send = function (data) {
    this.websocket.send(data);
    return this;
  };

  /**
   * Payload
   *
   * @api private
   */

  WS.prototype.payload = function (arr) {
    for (var i = 0, l = arr.length; i < l; i++) {
      this.packet(arr[i]);
    }
    return this;
  };

  /**
   * Disconnect the established `WebSocket` connection.
   *
   * @returns {Transport}
   * @api public
   */

  WS.prototype.close = function () {
    this.websocket.close();
    return this;
  };

  /**
   * Handle the errors that `WebSocket` might be giving when we
   * are attempting to connect or send messages.
   *
   * @param {Error} e The error.
   * @api private
   */

  WS.prototype.onError = function (e) {
    this.socket.onError(e);
  };

  /**
   * Returns the appropriate scheme for the URI generation.
   *
   * @api private
   */
  WS.prototype.scheme = function () {
    return this.socket.options.secure ? 'wss' : 'ws';
  };

  /**
   * Checks if the browser has support for native `WebSockets` and that
   * it's not the polyfill created for the FlashSocket transport.
   *
   * @return {Boolean}
   * @api public
   */

  WS.check = function () {
    return ('WebSocket' in global && !('__addTask' in WebSocket))
          || 'MozWebSocket' in global;
  };

  /**
   * Check if the `WebSocket` transport support cross domain communications.
   *
   * @returns {Boolean}
   * @api public
   */

  WS.xdomainCheck = function () {
    return true;
  };

  /**
   * Add the transport to your public io.transports array.
   *
   * @api private
   */

  io.transports.push('websocket');

})(
    'undefined' != typeof io ? io.Transport : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
  , this
);

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io) {

  /**
   * Expose constructor.
   */

  exports.flashsocket = Flashsocket;

  /**
   * The FlashSocket transport. This is a API wrapper for the HTML5 WebSocket
   * specification. It uses a .swf file to communicate with the server. If you want
   * to serve the .swf file from a other server than where the Socket.IO script is
   * coming from you need to use the insecure version of the .swf. More information
   * about this can be found on the github page.
   *
   * @constructor
   * @extends {io.Transport.websocket}
   * @api public
   */

  function Flashsocket () {
    io.Transport.websocket.apply(this, arguments);
  };

  /**
   * Inherits from Transport.
   */

  io.util.inherit(Flashsocket, io.Transport.websocket);

  /**
   * Transport name
   *
   * @api public
   */

  Flashsocket.prototype.name = 'flashsocket';

  /**
   * Disconnect the established `FlashSocket` connection. This is done by adding a 
   * new task to the FlashSocket. The rest will be handled off by the `WebSocket` 
   * transport.
   *
   * @returns {Transport}
   * @api public
   */

  Flashsocket.prototype.open = function () {
    var self = this
      , args = arguments;

    WebSocket.__addTask(function () {
      io.Transport.websocket.prototype.open.apply(self, args);
    });
    return this;
  };
  
  /**
   * Sends a message to the Socket.IO server. This is done by adding a new
   * task to the FlashSocket. The rest will be handled off by the `WebSocket` 
   * transport.
   *
   * @returns {Transport}
   * @api public
   */

  Flashsocket.prototype.send = function () {
    var self = this, args = arguments;
    WebSocket.__addTask(function () {
      io.Transport.websocket.prototype.send.apply(self, args);
    });
    return this;
  };

  /**
   * Disconnects the established `FlashSocket` connection.
   *
   * @returns {Transport}
   * @api public
   */

  Flashsocket.prototype.close = function () {
    WebSocket.__tasks.length = 0;
    io.Transport.websocket.prototype.close.call(this);
    return this;
  };

  /**
   * The WebSocket fall back needs to append the flash container to the body
   * element, so we need to make sure we have access to it. Or defer the call
   * until we are sure there is a body element.
   *
   * @param {Socket} socket The socket instance that needs a transport
   * @param {Function} fn The callback
   * @api private
   */

  Flashsocket.prototype.ready = function (socket, fn) {
    function init () {
      var options = socket.options
        , port = options['flash policy port']
        , path = [
              'http' + (options.secure ? 's' : '') + ':/'
            , options.host + ':' + options.port
            , options.resource
            , 'static/flashsocket'
            , 'WebSocketMain' + (socket.isXDomain() ? 'Insecure' : '') + '.swf'
          ];

      // Only start downloading the swf file when the checked that this browser
      // actually supports it
      if (!Flashsocket.loaded) {
        if (typeof WEB_SOCKET_SWF_LOCATION === 'undefined') {
          // Set the correct file based on the XDomain settings
          WEB_SOCKET_SWF_LOCATION = path.join('/');
        }

        if (port !== 843) {
          WebSocket.loadFlashPolicyFile('xmlsocket://' + options.host + ':' + port);
        }

        WebSocket.__initialize();
        Flashsocket.loaded = true;
      }

      fn.call(self);
    }

    var self = this;
    if (document.body) return init();

    io.util.load(init);
  };

  /**
   * Check if the FlashSocket transport is supported as it requires that the Adobe
   * Flash Player plug-in version `10.0.0` or greater is installed. And also check if
   * the polyfill is correctly loaded.
   *
   * @returns {Boolean}
   * @api public
   */

  Flashsocket.check = function () {
    if (
        typeof WebSocket == 'undefined'
      || !('__initialize' in WebSocket) || !swfobject
    ) return false;

    return swfobject.getFlashPlayerVersion().major >= 10;
  };

  /**
   * Check if the FlashSocket transport can be used as cross domain / cross origin 
   * transport. Because we can't see which type (secure or insecure) of .swf is used
   * we will just return true.
   *
   * @returns {Boolean}
   * @api public
   */

  Flashsocket.xdomainCheck = function () {
    return true;
  };

  /**
   * Disable AUTO_INITIALIZATION
   */

  if (typeof window != 'undefined') {
    WEB_SOCKET_DISABLE_AUTO_INITIALIZATION = true;
  }

  /**
   * Add the transport to your public io.transports array.
   *
   * @api private
   */

  io.transports.push('flashsocket');
})(
    'undefined' != typeof io ? io.Transport : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
);
/*	SWFObject v2.2 <http://code.google.com/p/swfobject/> 
	is released under the MIT License <http://www.opensource.org/licenses/mit-license.php> 
*/
if ('undefined' != typeof window) {
var swfobject=function(){var D="undefined",r="object",S="Shockwave Flash",W="ShockwaveFlash.ShockwaveFlash",q="application/x-shockwave-flash",R="SWFObjectExprInst",x="onreadystatechange",O=window,j=document,t=navigator,T=false,U=[h],o=[],N=[],I=[],l,Q,E,B,J=false,a=false,n,G,m=true,M=function(){var aa=typeof j.getElementById!=D&&typeof j.getElementsByTagName!=D&&typeof j.createElement!=D,ah=t.userAgent.toLowerCase(),Y=t.platform.toLowerCase(),ae=Y?/win/.test(Y):/win/.test(ah),ac=Y?/mac/.test(Y):/mac/.test(ah),af=/webkit/.test(ah)?parseFloat(ah.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):false,X=!+"\v1",ag=[0,0,0],ab=null;if(typeof t.plugins!=D&&typeof t.plugins[S]==r){ab=t.plugins[S].description;if(ab&&!(typeof t.mimeTypes!=D&&t.mimeTypes[q]&&!t.mimeTypes[q].enabledPlugin)){T=true;X=false;ab=ab.replace(/^.*\s+(\S+\s+\S+$)/,"$1");ag[0]=parseInt(ab.replace(/^(.*)\..*$/,"$1"),10);ag[1]=parseInt(ab.replace(/^.*\.(.*)\s.*$/,"$1"),10);ag[2]=/[a-zA-Z]/.test(ab)?parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/,"$1"),10):0}}else{if(typeof O.ActiveXObject!=D){try{var ad=new ActiveXObject(W);if(ad){ab=ad.GetVariable("$version");if(ab){X=true;ab=ab.split(" ")[1].split(",");ag=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}}catch(Z){}}}return{w3:aa,pv:ag,wk:af,ie:X,win:ae,mac:ac}}(),k=function(){if(!M.w3){return}if((typeof j.readyState!=D&&j.readyState=="complete")||(typeof j.readyState==D&&(j.getElementsByTagName("body")[0]||j.body))){f()}if(!J){if(typeof j.addEventListener!=D){j.addEventListener("DOMContentLoaded",f,false)}if(M.ie&&M.win){j.attachEvent(x,function(){if(j.readyState=="complete"){j.detachEvent(x,arguments.callee);f()}});if(O==top){(function(){if(J){return}try{j.documentElement.doScroll("left")}catch(X){setTimeout(arguments.callee,0);return}f()})()}}if(M.wk){(function(){if(J){return}if(!/loaded|complete/.test(j.readyState)){setTimeout(arguments.callee,0);return}f()})()}s(f)}}();function f(){if(J){return}try{var Z=j.getElementsByTagName("body")[0].appendChild(C("span"));Z.parentNode.removeChild(Z)}catch(aa){return}J=true;var X=U.length;for(var Y=0;Y<X;Y++){U[Y]()}}function K(X){if(J){X()}else{U[U.length]=X}}function s(Y){if(typeof O.addEventListener!=D){O.addEventListener("load",Y,false)}else{if(typeof j.addEventListener!=D){j.addEventListener("load",Y,false)}else{if(typeof O.attachEvent!=D){i(O,"onload",Y)}else{if(typeof O.onload=="function"){var X=O.onload;O.onload=function(){X();Y()}}else{O.onload=Y}}}}}function h(){if(T){V()}else{H()}}function V(){var X=j.getElementsByTagName("body")[0];var aa=C(r);aa.setAttribute("type",q);var Z=X.appendChild(aa);if(Z){var Y=0;(function(){if(typeof Z.GetVariable!=D){var ab=Z.GetVariable("$version");if(ab){ab=ab.split(" ")[1].split(",");M.pv=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}else{if(Y<10){Y++;setTimeout(arguments.callee,10);return}}X.removeChild(aa);Z=null;H()})()}else{H()}}function H(){var ag=o.length;if(ag>0){for(var af=0;af<ag;af++){var Y=o[af].id;var ab=o[af].callbackFn;var aa={success:false,id:Y};if(M.pv[0]>0){var ae=c(Y);if(ae){if(F(o[af].swfVersion)&&!(M.wk&&M.wk<312)){w(Y,true);if(ab){aa.success=true;aa.ref=z(Y);ab(aa)}}else{if(o[af].expressInstall&&A()){var ai={};ai.data=o[af].expressInstall;ai.width=ae.getAttribute("width")||"0";ai.height=ae.getAttribute("height")||"0";if(ae.getAttribute("class")){ai.styleclass=ae.getAttribute("class")}if(ae.getAttribute("align")){ai.align=ae.getAttribute("align")}var ah={};var X=ae.getElementsByTagName("param");var ac=X.length;for(var ad=0;ad<ac;ad++){if(X[ad].getAttribute("name").toLowerCase()!="movie"){ah[X[ad].getAttribute("name")]=X[ad].getAttribute("value")}}P(ai,ah,Y,ab)}else{p(ae);if(ab){ab(aa)}}}}}else{w(Y,true);if(ab){var Z=z(Y);if(Z&&typeof Z.SetVariable!=D){aa.success=true;aa.ref=Z}ab(aa)}}}}}function z(aa){var X=null;var Y=c(aa);if(Y&&Y.nodeName=="OBJECT"){if(typeof Y.SetVariable!=D){X=Y}else{var Z=Y.getElementsByTagName(r)[0];if(Z){X=Z}}}return X}function A(){return !a&&F("6.0.65")&&(M.win||M.mac)&&!(M.wk&&M.wk<312)}function P(aa,ab,X,Z){a=true;E=Z||null;B={success:false,id:X};var ae=c(X);if(ae){if(ae.nodeName=="OBJECT"){l=g(ae);Q=null}else{l=ae;Q=X}aa.id=R;if(typeof aa.width==D||(!/%$/.test(aa.width)&&parseInt(aa.width,10)<310)){aa.width="310"}if(typeof aa.height==D||(!/%$/.test(aa.height)&&parseInt(aa.height,10)<137)){aa.height="137"}j.title=j.title.slice(0,47)+" - Flash Player Installation";var ad=M.ie&&M.win?"ActiveX":"PlugIn",ac="MMredirectURL="+O.location.toString().replace(/&/g,"%26")+"&MMplayerType="+ad+"&MMdoctitle="+j.title;if(typeof ab.flashvars!=D){ab.flashvars+="&"+ac}else{ab.flashvars=ac}if(M.ie&&M.win&&ae.readyState!=4){var Y=C("div");X+="SWFObjectNew";Y.setAttribute("id",X);ae.parentNode.insertBefore(Y,ae);ae.style.display="none";(function(){if(ae.readyState==4){ae.parentNode.removeChild(ae)}else{setTimeout(arguments.callee,10)}})()}u(aa,ab,X)}}function p(Y){if(M.ie&&M.win&&Y.readyState!=4){var X=C("div");Y.parentNode.insertBefore(X,Y);X.parentNode.replaceChild(g(Y),X);Y.style.display="none";(function(){if(Y.readyState==4){Y.parentNode.removeChild(Y)}else{setTimeout(arguments.callee,10)}})()}else{Y.parentNode.replaceChild(g(Y),Y)}}function g(ab){var aa=C("div");if(M.win&&M.ie){aa.innerHTML=ab.innerHTML}else{var Y=ab.getElementsByTagName(r)[0];if(Y){var ad=Y.childNodes;if(ad){var X=ad.length;for(var Z=0;Z<X;Z++){if(!(ad[Z].nodeType==1&&ad[Z].nodeName=="PARAM")&&!(ad[Z].nodeType==8)){aa.appendChild(ad[Z].cloneNode(true))}}}}}return aa}function u(ai,ag,Y){var X,aa=c(Y);if(M.wk&&M.wk<312){return X}if(aa){if(typeof ai.id==D){ai.id=Y}if(M.ie&&M.win){var ah="";for(var ae in ai){if(ai[ae]!=Object.prototype[ae]){if(ae.toLowerCase()=="data"){ag.movie=ai[ae]}else{if(ae.toLowerCase()=="styleclass"){ah+=' class="'+ai[ae]+'"'}else{if(ae.toLowerCase()!="classid"){ah+=" "+ae+'="'+ai[ae]+'"'}}}}}var af="";for(var ad in ag){if(ag[ad]!=Object.prototype[ad]){af+='<param name="'+ad+'" value="'+ag[ad]+'" />'}}aa.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+ah+">"+af+"</object>";N[N.length]=ai.id;X=c(ai.id)}else{var Z=C(r);Z.setAttribute("type",q);for(var ac in ai){if(ai[ac]!=Object.prototype[ac]){if(ac.toLowerCase()=="styleclass"){Z.setAttribute("class",ai[ac])}else{if(ac.toLowerCase()!="classid"){Z.setAttribute(ac,ai[ac])}}}}for(var ab in ag){if(ag[ab]!=Object.prototype[ab]&&ab.toLowerCase()!="movie"){e(Z,ab,ag[ab])}}aa.parentNode.replaceChild(Z,aa);X=Z}}return X}function e(Z,X,Y){var aa=C("param");aa.setAttribute("name",X);aa.setAttribute("value",Y);Z.appendChild(aa)}function y(Y){var X=c(Y);if(X&&X.nodeName=="OBJECT"){if(M.ie&&M.win){X.style.display="none";(function(){if(X.readyState==4){b(Y)}else{setTimeout(arguments.callee,10)}})()}else{X.parentNode.removeChild(X)}}}function b(Z){var Y=c(Z);if(Y){for(var X in Y){if(typeof Y[X]=="function"){Y[X]=null}}Y.parentNode.removeChild(Y)}}function c(Z){var X=null;try{X=j.getElementById(Z)}catch(Y){}return X}function C(X){return j.createElement(X)}function i(Z,X,Y){Z.attachEvent(X,Y);I[I.length]=[Z,X,Y]}function F(Z){var Y=M.pv,X=Z.split(".");X[0]=parseInt(X[0],10);X[1]=parseInt(X[1],10)||0;X[2]=parseInt(X[2],10)||0;return(Y[0]>X[0]||(Y[0]==X[0]&&Y[1]>X[1])||(Y[0]==X[0]&&Y[1]==X[1]&&Y[2]>=X[2]))?true:false}function v(ac,Y,ad,ab){if(M.ie&&M.mac){return}var aa=j.getElementsByTagName("head")[0];if(!aa){return}var X=(ad&&typeof ad=="string")?ad:"screen";if(ab){n=null;G=null}if(!n||G!=X){var Z=C("style");Z.setAttribute("type","text/css");Z.setAttribute("media",X);n=aa.appendChild(Z);if(M.ie&&M.win&&typeof j.styleSheets!=D&&j.styleSheets.length>0){n=j.styleSheets[j.styleSheets.length-1]}G=X}if(M.ie&&M.win){if(n&&typeof n.addRule==r){n.addRule(ac,Y)}}else{if(n&&typeof j.createTextNode!=D){n.appendChild(j.createTextNode(ac+" {"+Y+"}"))}}}function w(Z,X){if(!m){return}var Y=X?"visible":"hidden";if(J&&c(Z)){c(Z).style.visibility=Y}else{v("#"+Z,"visibility:"+Y)}}function L(Y){var Z=/[\\\"<>\.;]/;var X=Z.exec(Y)!=null;return X&&typeof encodeURIComponent!=D?encodeURIComponent(Y):Y}var d=function(){if(M.ie&&M.win){window.attachEvent("onunload",function(){var ac=I.length;for(var ab=0;ab<ac;ab++){I[ab][0].detachEvent(I[ab][1],I[ab][2])}var Z=N.length;for(var aa=0;aa<Z;aa++){y(N[aa])}for(var Y in M){M[Y]=null}M=null;for(var X in swfobject){swfobject[X]=null}swfobject=null})}}();return{registerObject:function(ab,X,aa,Z){if(M.w3&&ab&&X){var Y={};Y.id=ab;Y.swfVersion=X;Y.expressInstall=aa;Y.callbackFn=Z;o[o.length]=Y;w(ab,false)}else{if(Z){Z({success:false,id:ab})}}},getObjectById:function(X){if(M.w3){return z(X)}},embedSWF:function(ab,ah,ae,ag,Y,aa,Z,ad,af,ac){var X={success:false,id:ah};if(M.w3&&!(M.wk&&M.wk<312)&&ab&&ah&&ae&&ag&&Y){w(ah,false);K(function(){ae+="";ag+="";var aj={};if(af&&typeof af===r){for(var al in af){aj[al]=af[al]}}aj.data=ab;aj.width=ae;aj.height=ag;var am={};if(ad&&typeof ad===r){for(var ak in ad){am[ak]=ad[ak]}}if(Z&&typeof Z===r){for(var ai in Z){if(typeof am.flashvars!=D){am.flashvars+="&"+ai+"="+Z[ai]}else{am.flashvars=ai+"="+Z[ai]}}}if(F(Y)){var an=u(aj,am,ah);if(aj.id==ah){w(ah,true)}X.success=true;X.ref=an}else{if(aa&&A()){aj.data=aa;P(aj,am,ah,ac);return}else{w(ah,true)}}if(ac){ac(X)}})}else{if(ac){ac(X)}}},switchOffAutoHideShow:function(){m=false},ua:M,getFlashPlayerVersion:function(){return{major:M.pv[0],minor:M.pv[1],release:M.pv[2]}},hasFlashPlayerVersion:F,createSWF:function(Z,Y,X){if(M.w3){return u(Z,Y,X)}else{return undefined}},showExpressInstall:function(Z,aa,X,Y){if(M.w3&&A()){P(Z,aa,X,Y)}},removeSWF:function(X){if(M.w3){y(X)}},createCSS:function(aa,Z,Y,X){if(M.w3){v(aa,Z,Y,X)}},addDomLoadEvent:K,addLoadEvent:s,getQueryParamValue:function(aa){var Z=j.location.search||j.location.hash;if(Z){if(/\?/.test(Z)){Z=Z.split("?")[1]}if(aa==null){return L(Z)}var Y=Z.split("&");for(var X=0;X<Y.length;X++){if(Y[X].substring(0,Y[X].indexOf("="))==aa){return L(Y[X].substring((Y[X].indexOf("=")+1)))}}}return""},expressInstallCallback:function(){if(a){var X=c(R);if(X&&l){X.parentNode.replaceChild(l,X);if(Q){w(Q,true);if(M.ie&&M.win){l.style.display="block"}}if(E){E(B)}}a=false}}}}();
}
// Copyright: Hiroshi Ichikawa <http://gimite.net/en/>
// License: New BSD License
// Reference: http://dev.w3.org/html5/websockets/
// Reference: http://tools.ietf.org/html/draft-hixie-thewebsocketprotocol

(function() {
  
  if ('undefined' == typeof window || window.WebSocket) return;

  var console = window.console;
  if (!console || !console.log || !console.error) {
    console = {log: function(){ }, error: function(){ }};
  }
  
  if (!swfobject.hasFlashPlayerVersion("10.0.0")) {
    console.error("Flash Player >= 10.0.0 is required.");
    return;
  }
  if (location.protocol == "file:") {
    console.error(
      "WARNING: web-socket-js doesn't work in file:///... URL " +
      "unless you set Flash Security Settings properly. " +
      "Open the page via Web server i.e. http://...");
  }

  /**
   * This class represents a faux web socket.
   * @param {string} url
   * @param {array or string} protocols
   * @param {string} proxyHost
   * @param {int} proxyPort
   * @param {string} headers
   */
  WebSocket = function(url, protocols, proxyHost, proxyPort, headers) {
    var self = this;
    self.__id = WebSocket.__nextId++;
    WebSocket.__instances[self.__id] = self;
    self.readyState = WebSocket.CONNECTING;
    self.bufferedAmount = 0;
    self.__events = {};
    if (!protocols) {
      protocols = [];
    } else if (typeof protocols == "string") {
      protocols = [protocols];
    }
    // Uses setTimeout() to make sure __createFlash() runs after the caller sets ws.onopen etc.
    // Otherwise, when onopen fires immediately, onopen is called before it is set.
    setTimeout(function() {
      WebSocket.__addTask(function() {
        WebSocket.__flash.create(
            self.__id, url, protocols, proxyHost || null, proxyPort || 0, headers || null);
      });
    }, 0);
  };

  /**
   * Send data to the web socket.
   * @param {string} data  The data to send to the socket.
   * @return {boolean}  True for success, false for failure.
   */
  WebSocket.prototype.send = function(data) {
    if (this.readyState == WebSocket.CONNECTING) {
      throw "INVALID_STATE_ERR: Web Socket connection has not been established";
    }
    // We use encodeURIComponent() here, because FABridge doesn't work if
    // the argument includes some characters. We don't use escape() here
    // because of this:
    // https://developer.mozilla.org/en/Core_JavaScript_1.5_Guide/Functions#escape_and_unescape_Functions
    // But it looks decodeURIComponent(encodeURIComponent(s)) doesn't
    // preserve all Unicode characters either e.g. "\uffff" in Firefox.
    // Note by wtritch: Hopefully this will not be necessary using ExternalInterface.  Will require
    // additional testing.
    var result = WebSocket.__flash.send(this.__id, encodeURIComponent(data));
    if (result < 0) { // success
      return true;
    } else {
      this.bufferedAmount += result;
      return false;
    }
  };

  /**
   * Close this web socket gracefully.
   */
  WebSocket.prototype.close = function() {
    if (this.readyState == WebSocket.CLOSED || this.readyState == WebSocket.CLOSING) {
      return;
    }
    this.readyState = WebSocket.CLOSING;
    WebSocket.__flash.close(this.__id);
  };

  /**
   * Implementation of {@link <a href="http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-registration">DOM 2 EventTarget Interface</a>}
   *
   * @param {string} type
   * @param {function} listener
   * @param {boolean} useCapture
   * @return void
   */
  WebSocket.prototype.addEventListener = function(type, listener, useCapture) {
    if (!(type in this.__events)) {
      this.__events[type] = [];
    }
    this.__events[type].push(listener);
  };

  /**
   * Implementation of {@link <a href="http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-registration">DOM 2 EventTarget Interface</a>}
   *
   * @param {string} type
   * @param {function} listener
   * @param {boolean} useCapture
   * @return void
   */
  WebSocket.prototype.removeEventListener = function(type, listener, useCapture) {
    if (!(type in this.__events)) return;
    var events = this.__events[type];
    for (var i = events.length - 1; i >= 0; --i) {
      if (events[i] === listener) {
        events.splice(i, 1);
        break;
      }
    }
  };

  /**
   * Implementation of {@link <a href="http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-registration">DOM 2 EventTarget Interface</a>}
   *
   * @param {Event} event
   * @return void
   */
  WebSocket.prototype.dispatchEvent = function(event) {
    var events = this.__events[event.type] || [];
    for (var i = 0; i < events.length; ++i) {
      events[i](event);
    }
    var handler = this["on" + event.type];
    if (handler) handler(event);
  };

  /**
   * Handles an event from Flash.
   * @param {Object} flashEvent
   */
  WebSocket.prototype.__handleEvent = function(flashEvent) {
    if ("readyState" in flashEvent) {
      this.readyState = flashEvent.readyState;
    }
    if ("protocol" in flashEvent) {
      this.protocol = flashEvent.protocol;
    }
    
    var jsEvent;
    if (flashEvent.type == "open" || flashEvent.type == "error") {
      jsEvent = this.__createSimpleEvent(flashEvent.type);
    } else if (flashEvent.type == "close") {
      // TODO implement jsEvent.wasClean
      jsEvent = this.__createSimpleEvent("close");
    } else if (flashEvent.type == "message") {
      var data = decodeURIComponent(flashEvent.message);
      jsEvent = this.__createMessageEvent("message", data);
    } else {
      throw "unknown event type: " + flashEvent.type;
    }
    
    this.dispatchEvent(jsEvent);
  };
  
  WebSocket.prototype.__createSimpleEvent = function(type) {
    if (document.createEvent && window.Event) {
      var event = document.createEvent("Event");
      event.initEvent(type, false, false);
      return event;
    } else {
      return {type: type, bubbles: false, cancelable: false};
    }
  };
  
  WebSocket.prototype.__createMessageEvent = function(type, data) {
    if (document.createEvent && window.MessageEvent && !window.opera) {
      var event = document.createEvent("MessageEvent");
      event.initMessageEvent("message", false, false, data, null, null, window, null);
      return event;
    } else {
      // IE and Opera, the latter one truncates the data parameter after any 0x00 bytes.
      return {type: type, data: data, bubbles: false, cancelable: false};
    }
  };
  
  /**
   * Define the WebSocket readyState enumeration.
   */
  WebSocket.CONNECTING = 0;
  WebSocket.OPEN = 1;
  WebSocket.CLOSING = 2;
  WebSocket.CLOSED = 3;

  WebSocket.__flash = null;
  WebSocket.__instances = {};
  WebSocket.__tasks = [];
  WebSocket.__nextId = 0;
  
  /**
   * Load a new flash security policy file.
   * @param {string} url
   */
  WebSocket.loadFlashPolicyFile = function(url){
    WebSocket.__addTask(function() {
      WebSocket.__flash.loadManualPolicyFile(url);
    });
  };

  /**
   * Loads WebSocketMain.swf and creates WebSocketMain object in Flash.
   */
  WebSocket.__initialize = function() {
    if (WebSocket.__flash) return;
    
    if (WebSocket.__swfLocation) {
      // For backword compatibility.
      window.WEB_SOCKET_SWF_LOCATION = WebSocket.__swfLocation;
    }
    if (!window.WEB_SOCKET_SWF_LOCATION) {
      console.error("[WebSocket] set WEB_SOCKET_SWF_LOCATION to location of WebSocketMain.swf");
      return;
    }
    var container = document.createElement("div");
    container.id = "webSocketContainer";
    // Hides Flash box. We cannot use display: none or visibility: hidden because it prevents
    // Flash from loading at least in IE. So we move it out of the screen at (-100, -100).
    // But this even doesn't work with Flash Lite (e.g. in Droid Incredible). So with Flash
    // Lite, we put it at (0, 0). This shows 1x1 box visible at left-top corner but this is
    // the best we can do as far as we know now.
    container.style.position = "absolute";
    if (WebSocket.__isFlashLite()) {
      container.style.left = "0px";
      container.style.top = "0px";
    } else {
      container.style.left = "-100px";
      container.style.top = "-100px";
    }
    var holder = document.createElement("div");
    holder.id = "webSocketFlash";
    container.appendChild(holder);
    document.body.appendChild(container);
    // See this article for hasPriority:
    // http://help.adobe.com/en_US/as3/mobile/WS4bebcd66a74275c36cfb8137124318eebc6-7ffd.html
    swfobject.embedSWF(
      WEB_SOCKET_SWF_LOCATION,
      "webSocketFlash",
      "1" /* width */,
      "1" /* height */,
      "10.0.0" /* SWF version */,
      null,
      null,
      {hasPriority: true, swliveconnect : true, allowScriptAccess: "always"},
      null,
      function(e) {
        if (!e.success) {
          console.error("[WebSocket] swfobject.embedSWF failed");
        }
      });
  };
  
  /**
   * Called by Flash to notify JS that it's fully loaded and ready
   * for communication.
   */
  WebSocket.__onFlashInitialized = function() {
    // We need to set a timeout here to avoid round-trip calls
    // to flash during the initialization process.
    setTimeout(function() {
      WebSocket.__flash = document.getElementById("webSocketFlash");
      WebSocket.__flash.setCallerUrl(location.href);
      WebSocket.__flash.setDebug(!!window.WEB_SOCKET_DEBUG);
      for (var i = 0; i < WebSocket.__tasks.length; ++i) {
        WebSocket.__tasks[i]();
      }
      WebSocket.__tasks = [];
    }, 0);
  };
  
  /**
   * Called by Flash to notify WebSockets events are fired.
   */
  WebSocket.__onFlashEvent = function() {
    setTimeout(function() {
      try {
        // Gets events using receiveEvents() instead of getting it from event object
        // of Flash event. This is to make sure to keep message order.
        // It seems sometimes Flash events don't arrive in the same order as they are sent.
        var events = WebSocket.__flash.receiveEvents();
        for (var i = 0; i < events.length; ++i) {
          WebSocket.__instances[events[i].webSocketId].__handleEvent(events[i]);
        }
      } catch (e) {
        console.error(e);
      }
    }, 0);
    return true;
  };
  
  // Called by Flash.
  WebSocket.__log = function(message) {
    console.log(decodeURIComponent(message));
  };
  
  // Called by Flash.
  WebSocket.__error = function(message) {
    console.error(decodeURIComponent(message));
  };
  
  WebSocket.__addTask = function(task) {
    if (WebSocket.__flash) {
      task();
    } else {
      WebSocket.__tasks.push(task);
    }
  };
  
  /**
   * Test if the browser is running flash lite.
   * @return {boolean} True if flash lite is running, false otherwise.
   */
  WebSocket.__isFlashLite = function() {
    if (!window.navigator || !window.navigator.mimeTypes) {
      return false;
    }
    var mimeType = window.navigator.mimeTypes["application/x-shockwave-flash"];
    if (!mimeType || !mimeType.enabledPlugin || !mimeType.enabledPlugin.filename) {
      return false;
    }
    return mimeType.enabledPlugin.filename.match(/flashlite/i) ? true : false;
  };
  
  if (!window.WEB_SOCKET_DISABLE_AUTO_INITIALIZATION) {
    if (window.addEventListener) {
      window.addEventListener("load", function(){
        WebSocket.__initialize();
      }, false);
    } else {
      window.attachEvent("onload", function(){
        WebSocket.__initialize();
      });
    }
  }
  
})();

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io, global) {

  /**
   * Expose constructor.
   *
   * @api public
   */
  
  exports.XHR = XHR;

  /**
   * XHR constructor
   *
   * @costructor
   * @api public
   */

  function XHR (socket) {
    if (!socket) return;

    io.Transport.apply(this, arguments);
    this.sendBuffer = [];
  };

  /**
   * Inherits from Transport.
   */

  io.util.inherit(XHR, io.Transport);

  /**
   * Establish a connection
   *
   * @returns {Transport}
   * @api public
   */

  XHR.prototype.open = function () {
    this.socket.setBuffer(false);
    this.onOpen();
    this.get();

    // we need to make sure the request succeeds since we have no indication
    // whether the request opened or not until it succeeded.
    this.setCloseTimeout();

    return this;
  };

  /**
   * Check if we need to send data to the Socket.IO server, if we have data in our
   * buffer we encode it and forward it to the `post` method.
   *
   * @api private
   */

  XHR.prototype.payload = function (payload) {
    var msgs = [];

    for (var i = 0, l = payload.length; i < l; i++) {
      msgs.push(io.parser.encodePacket(payload[i]));
    }

    this.send(io.parser.encodePayload(msgs));
  };

  /**
   * Send data to the Socket.IO server.
   *
   * @param data The message
   * @returns {Transport}
   * @api public
   */

  XHR.prototype.send = function (data) {
    this.post(data);
    return this;
  };

  /**
   * Posts a encoded message to the Socket.IO server.
   *
   * @param {String} data A encoded message.
   * @api private
   */

  function empty () { };

  XHR.prototype.post = function (data) {
    var self = this;
    this.socket.setBuffer(true);

    function stateChange () {
      if (this.readyState == 4) {
        this.onreadystatechange = empty;
        self.posting = false;

        if (this.status == 200){
          self.socket.setBuffer(false);
        } else {
          self.onClose();
        }
      }
    }

    function onload () {
      this.onload = empty;
      self.socket.setBuffer(false);
    };

    this.sendXHR = this.request('POST');

    if (global.XDomainRequest && this.sendXHR instanceof XDomainRequest) {
      this.sendXHR.onload = this.sendXHR.onerror = onload;
    } else {
      this.sendXHR.onreadystatechange = stateChange;
    }

    this.sendXHR.send(data);
  };

  /**
   * Disconnects the established `XHR` connection.
   *
   * @returns {Transport} 
   * @api public
   */

  XHR.prototype.close = function () {
    this.onClose();
    return this;
  };

  /**
   * Generates a configured XHR request
   *
   * @param {String} url The url that needs to be requested.
   * @param {String} method The method the request should use.
   * @returns {XMLHttpRequest}
   * @api private
   */

  XHR.prototype.request = function (method) {
    var req = io.util.request(this.socket.isXDomain())
      , query = io.util.query(this.socket.options.query, 't=' + +new Date);

    req.open(method || 'GET', this.prepareUrl() + query, true);

    if (method == 'POST') {
      try {
        if (req.setRequestHeader) {
          req.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
        } else {
          // XDomainRequest
          req.contentType = 'text/plain';
        }
      } catch (e) {}
    }

    return req;
  };

  /**
   * Returns the scheme to use for the transport URLs.
   *
   * @api private
   */

  XHR.prototype.scheme = function () {
    return this.socket.options.secure ? 'https' : 'http';
  };

  /**
   * Check if the XHR transports are supported
   *
   * @param {Boolean} xdomain Check if we support cross domain requests.
   * @returns {Boolean}
   * @api public
   */

  XHR.check = function (socket, xdomain) {
    try {
      if (io.util.request(xdomain)) {
        return true;
      }
    } catch(e) {}

    return false;
  };

  /**
   * Check if the XHR transport supports corss domain requests.
   * 
   * @returns {Boolean}
   * @api public
   */

  XHR.xdomainCheck = function () {
    return XHR.check(null, true);
  };

})(
    'undefined' != typeof io ? io.Transport : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
  , this
);

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io) {

  /**
   * Expose constructor.
   */

  exports.htmlfile = HTMLFile;

  /**
   * The HTMLFile transport creates a `forever iframe` based transport
   * for Internet Explorer. Regular forever iframe implementations will 
   * continuously trigger the browsers buzy indicators. If the forever iframe
   * is created inside a `htmlfile` these indicators will not be trigged.
   *
   * @constructor
   * @extends {io.Transport.XHR}
   * @api public
   */

  function HTMLFile (socket) {
    io.Transport.XHR.apply(this, arguments);
  };

  /**
   * Inherits from XHR transport.
   */

  io.util.inherit(HTMLFile, io.Transport.XHR);

  /**
   * Transport name
   *
   * @api public
   */

  HTMLFile.prototype.name = 'htmlfile';

  /**
   * Creates a new ActiveX `htmlfile` with a forever loading iframe
   * that can be used to listen to messages. Inside the generated
   * `htmlfile` a reference will be made to the HTMLFile transport.
   *
   * @api private
   */

  HTMLFile.prototype.get = function () {
    this.doc = new ActiveXObject('htmlfile');
    this.doc.open();
    this.doc.write('<html></html>');
    this.doc.close();
    this.doc.parentWindow.s = this;

    var iframeC = this.doc.createElement('div');
    iframeC.className = 'socketio';

    this.doc.body.appendChild(iframeC);
    this.iframe = this.doc.createElement('iframe');

    iframeC.appendChild(this.iframe);

    var self = this
      , query = io.util.query(this.socket.options.query, 't='+ +new Date);

    this.iframe.src = this.prepareUrl() + query;

    io.util.on(window, 'unload', function () {
      self.destroy();
    });
  };

  /**
   * The Socket.IO server will write script tags inside the forever
   * iframe, this function will be used as callback for the incoming
   * information.
   *
   * @param {String} data The message
   * @param {document} doc Reference to the context
   * @api private
   */

  HTMLFile.prototype._ = function (data, doc) {
    this.onData(data);
    try {
      var script = doc.getElementsByTagName('script')[0];
      script.parentNode.removeChild(script);
    } catch (e) { }
  };

  /**
   * Destroy the established connection, iframe and `htmlfile`.
   * And calls the `CollectGarbage` function of Internet Explorer
   * to release the memory.
   *
   * @api private
   */

  HTMLFile.prototype.destroy = function () {
    if (this.iframe){
      try {
        this.iframe.src = 'about:blank';
      } catch(e){}

      this.doc = null;
      this.iframe.parentNode.removeChild(this.iframe);
      this.iframe = null;

      CollectGarbage();
    }
  };

  /**
   * Disconnects the established connection.
   *
   * @returns {Transport} Chaining.
   * @api public
   */

  HTMLFile.prototype.close = function () {
    this.destroy();
    return io.Transport.XHR.prototype.close.call(this);
  };

  /**
   * Checks if the browser supports this transport. The browser
   * must have an `ActiveXObject` implementation.
   *
   * @return {Boolean}
   * @api public
   */

  HTMLFile.check = function () {
    if ('ActiveXObject' in window){
      try {
        var a = new ActiveXObject('htmlfile');
        return a && io.Transport.XHR.check();
      } catch(e){}
    }
    return false;
  };

  /**
   * Check if cross domain requests are supported.
   *
   * @returns {Boolean}
   * @api public
   */

  HTMLFile.xdomainCheck = function () {
    // we can probably do handling for sub-domains, we should
    // test that it's cross domain but a subdomain here
    return false;
  };

  /**
   * Add the transport to your public io.transports array.
   *
   * @api private
   */

  io.transports.push('htmlfile');

})(
    'undefined' != typeof io ? io.Transport : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
);

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io, global) {

  /**
   * Expose constructor.
   */

  exports['xhr-polling'] = XHRPolling;

  /**
   * The XHR-polling transport uses long polling XHR requests to create a
   * "persistent" connection with the server.
   *
   * @constructor
   * @api public
   */

  function XHRPolling () {
    io.Transport.XHR.apply(this, arguments);
  };

  /**
   * Inherits from XHR transport.
   */

  io.util.inherit(XHRPolling, io.Transport.XHR);

  /**
   * Merge the properties from XHR transport
   */

  io.util.merge(XHRPolling, io.Transport.XHR);

  /**
   * Transport name
   *
   * @api public
   */

  XHRPolling.prototype.name = 'xhr-polling';

  /** 
   * Establish a connection, for iPhone and Android this will be done once the page
   * is loaded.
   *
   * @returns {Transport} Chaining.
   * @api public
   */

  XHRPolling.prototype.open = function () {
    var self = this;

    io.Transport.XHR.prototype.open.call(self);
    return false;
  };

  /**
   * Starts a XHR request to wait for incoming messages.
   *
   * @api private
   */

  function empty () {};

  XHRPolling.prototype.get = function () {
    if (!this.open) return;

    var self = this;

    function stateChange () {
      if (this.readyState == 4) {
        this.onreadystatechange = empty;

        if (this.status == 200) {
          self.onData(this.responseText);
          self.get();
        } else {
          self.onClose();
        }
      }
    };

    function onload () {
      this.onload = empty;
      self.onData(this.responseText);
      self.get();
    };

    this.xhr = this.request();

    if (global.XDomainRequest && this.xhr instanceof XDomainRequest) {
      this.xhr.onload = this.xhr.onerror = onload;
    } else {
      this.xhr.onreadystatechange = stateChange;
    }

    this.xhr.send(null);
  };

  /**
   * Handle the unclean close behavior.
   *
   * @api private
   */

  XHRPolling.prototype.onClose = function () {
    io.Transport.XHR.prototype.onClose.call(this);

    if (this.xhr) {
      this.xhr.onreadystatechange = this.xhr.onload = empty;
      try {
        this.xhr.abort();
      } catch(e){}
      this.xhr = null;
    }
  };

  /**
   * Webkit based browsers show a infinit spinner when you start a XHR request
   * before the browsers onload event is called so we need to defer opening of
   * the transport until the onload event is called. Wrapping the cb in our
   * defer method solve this.
   *
   * @param {Socket} socket The socket instance that needs a transport
   * @param {Function} fn The callback
   * @api private
   */

  XHRPolling.prototype.ready = function (socket, fn) {
    var self = this;

    io.util.defer(function () {
      fn.call(self);
    });
  };

  /**
   * Add the transport to your public io.transports array.
   *
   * @api private
   */

  io.transports.push('xhr-polling');

})(
    'undefined' != typeof io ? io.Transport : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
  , this
);

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io, global) {
  /**
   * There is a way to hide the loading indicator in Firefox. If you create and
   * remove a iframe it will stop showing the current loading indicator.
   * Unfortunately we can't feature detect that and UA sniffing is evil.
   *
   * @api private
   */

  var indicator = global.document && "MozAppearance" in
    global.document.documentElement.style;

  /**
   * Expose constructor.
   */

  exports['jsonp-polling'] = JSONPPolling;

  /**
   * The JSONP transport creates an persistent connection by dynamically
   * inserting a script tag in the page. This script tag will receive the
   * information of the Socket.IO server. When new information is received
   * it creates a new script tag for the new data stream.
   *
   * @constructor
   * @extends {io.Transport.xhr-polling}
   * @api public
   */

  function JSONPPolling (socket) {
    io.Transport['xhr-polling'].apply(this, arguments);

    this.index = io.j.length;

    var self = this;

    io.j.push(function (msg) {
      self._(msg);
    });
  };

  /**
   * Inherits from XHR polling transport.
   */

  io.util.inherit(JSONPPolling, io.Transport['xhr-polling']);

  /**
   * Transport name
   *
   * @api public
   */

  JSONPPolling.prototype.name = 'jsonp-polling';

  /**
   * Posts a encoded message to the Socket.IO server using an iframe.
   * The iframe is used because script tags can create POST based requests.
   * The iframe is positioned outside of the view so the user does not
   * notice it's existence.
   *
   * @param {String} data A encoded message.
   * @api private
   */

  JSONPPolling.prototype.post = function (data) {
    var self = this
      , query = io.util.query(
             this.socket.options.query
          , 't='+ (+new Date) + '&i=' + this.index
        );

    if (!this.form) {
      var form = document.createElement('form')
        , area = document.createElement('textarea')
        , id = this.iframeId = 'socketio_iframe_' + this.index
        , iframe;

      form.className = 'socketio';
      form.style.position = 'absolute';
      form.style.top = '-1000px';
      form.style.left = '-1000px';
      form.target = id;
      form.method = 'POST';
      form.setAttribute('accept-charset', 'utf-8');
      area.name = 'd';
      form.appendChild(area);
      document.body.appendChild(form);

      this.form = form;
      this.area = area;
    }

    this.form.action = this.prepareUrl() + query;

    function complete () {
      initIframe();
      self.socket.setBuffer(false);
    };

    function initIframe () {
      if (self.iframe) {
        self.form.removeChild(self.iframe);
      }

      try {
        // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
        iframe = document.createElement('<iframe name="'+ self.iframeId +'">');
      } catch (e) {
        iframe = document.createElement('iframe');
        iframe.name = self.iframeId;
      }

      iframe.id = self.iframeId;

      self.form.appendChild(iframe);
      self.iframe = iframe;
    };

    initIframe();

    // we temporarily stringify until we figure out how to prevent
    // browsers from turning `\n` into `\r\n` in form inputs
    this.area.value = io.JSON.stringify(data);

    try {
      this.form.submit();
    } catch(e) {}

    if (this.iframe.attachEvent) {
      iframe.onreadystatechange = function () {
        if (self.iframe.readyState == 'complete') {
          complete();
        }
      };
    } else {
      this.iframe.onload = complete;
    }

    this.socket.setBuffer(true);
  };
  
  /**
   * Creates a new JSONP poll that can be used to listen
   * for messages from the Socket.IO server.
   *
   * @api private
   */

  JSONPPolling.prototype.get = function () {
    var self = this
      , script = document.createElement('script')
      , query = io.util.query(
             this.socket.options.query
          , 't='+ (+new Date) + '&i=' + this.index
        );

    if (this.script) {
      this.script.parentNode.removeChild(this.script);
      this.script = null;
    }

    script.async = true;
    script.src = this.prepareUrl() + query;
    script.onerror = function () {
      self.onClose();
    };

    var insertAt = document.getElementsByTagName('script')[0]
    insertAt.parentNode.insertBefore(script, insertAt);
    this.script = script;

    if (indicator) {
      setTimeout(function () {
        var iframe = document.createElement('iframe');
        document.body.appendChild(iframe);
        document.body.removeChild(iframe);
      }, 100);
    }
  };

  /**
   * Callback function for the incoming message stream from the Socket.IO server.
   *
   * @param {String} data The message
   * @api private
   */

  JSONPPolling.prototype._ = function (msg) {
    this.onData(msg);
    if (this.open) {
      this.get();
    }
    return this;
  };

  /**
   * The indicator hack only works after onload
   *
   * @param {Socket} socket The socket instance that needs a transport
   * @param {Function} fn The callback
   * @api private
   */

  JSONPPolling.prototype.ready = function (socket, fn) {
    var self = this;
    if (!indicator) return fn.call(this);

    io.util.load(function () {
      fn.call(self);
    });
  };

  /**
   * Checks if browser supports this transport.
   *
   * @return {Boolean}
   * @api public
   */

  JSONPPolling.check = function () {
    return 'document' in global;
  };

  /**
   * Check if cross domain requests are supported
   *
   * @returns {Boolean}
   * @api public
   */

  JSONPPolling.xdomainCheck = function () {
    return true;
  };

  /**
   * Add the transport to your public io.transports array.
   *
   * @api private
   */

  io.transports.push('jsonp-polling');

})(
    'undefined' != typeof io ? io.Transport : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
  , this
);
}).call(window)
},{}]},{},[3])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvdmFzc2lsaXMvU2l0ZXMvQVNRLVVTSS9BU1EvY2xpZW50L2pzL2ltcHJlc3MtcHJlc2VudGVyLmpzIiwiL1VzZXJzL3Zhc3NpbGlzL1NpdGVzL0FTUS1VU0kvQVNRL2NsaWVudC9qcy9wcmVzZW50ZXIuanMiLCIvVXNlcnMvdmFzc2lsaXMvU2l0ZXMvQVNRLVVTSS9BU1Evbm9kZV9tb2R1bGVzL3NvY2tldC5pby1icm93c2VyaWZ5L2Rpc3QvYnJvd3NlcmlmeS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNoaUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGdsb2JhbD10eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge307KGZ1bmN0aW9uIGJyb3dzZXJpZnlTaGltKG1vZHVsZSwgZXhwb3J0cywgZGVmaW5lLCBicm93c2VyaWZ5X3NoaW1fX2RlZmluZV9fbW9kdWxlX19leHBvcnRfXykge1xuLyoqXG4gKiBpbXByZXNzLmpzXG4gKlxuICogaW1wcmVzcy5qcyBpcyBhIHByZXNlbnRhdGlvbiB0b29sIGJhc2VkIG9uIHRoZSBwb3dlciBvZiBDU1MzIHRyYW5zZm9ybXMgYW5kIHRyYW5zaXRpb25zXG4gKiBpbiBtb2Rlcm4gYnJvd3NlcnMgYW5kIGluc3BpcmVkIGJ5IHRoZSBpZGVhIGJlaGluZCBwcmV6aS5jb20uXG4gKlxuICpcbiAqIENvcHlyaWdodCAyMDExLTIwMTIgQmFydGVrIFN6b3BrYSAoQGJhcnRheilcbiAqXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGFuZCBHUEwgTGljZW5zZXMuXG4gKlxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKiAgYXV0aG9yOiAgQmFydGVrIFN6b3BrYVxuICogIHZlcnNpb246IDAuNS4zXG4gKiAgdXJsOiAgICAgaHR0cDovL2JhcnRhei5naXRodWIuY29tL2ltcHJlc3MuanMvXG4gKiAgc291cmNlOiAgaHR0cDovL2dpdGh1Yi5jb20vYmFydGF6L2ltcHJlc3MuanMvXG4gKi9cblxuLypqc2hpbnQgYml0d2lzZTp0cnVlLCBjdXJseTp0cnVlLCBlcWVxZXE6dHJ1ZSwgZm9yaW46dHJ1ZSwgbGF0ZWRlZjp0cnVlLCBuZXdjYXA6dHJ1ZSxcbiAgICAgICAgIG5vYXJnOnRydWUsIG5vZW1wdHk6dHJ1ZSwgdW5kZWY6dHJ1ZSwgc3RyaWN0OnRydWUsIGJyb3dzZXI6dHJ1ZSAqL1xuXG4vLyBZb3UgYXJlIG9uZSBvZiB0aG9zZSB3aG8gbGlrZSB0byBrbm93IGhvdyB0aGluZyB3b3JrIGluc2lkZT9cbi8vIExldCBtZSBzaG93IHlvdSB0aGUgY29ncyB0aGF0IG1ha2UgaW1wcmVzcy5qcyBydW4uLi5cblxuXG4vL0NoYW5nZXMgYnkgTWF4OiBSZW1vdmVkIGJsYWNrbGlzdGluZyBvZiBpT1MgYW5kIEFuZHJvaWQuIFRoZXkgYXJlIHNhaWQgbm90IHRvIHdvcmsgYWN0dWFsbHkgdGhleSBkby5cblxuKGZ1bmN0aW9uICggZG9jdW1lbnQsIHdpbmRvdyApIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgXG4gICAgLy8gSEVMUEVSIEZVTkNUSU9OU1xuICAgIFxuICAgIC8vIGBwZnhgIGlzIGEgZnVuY3Rpb24gdGhhdCB0YWtlcyBhIHN0YW5kYXJkIENTUyBwcm9wZXJ0eSBuYW1lIGFzIGEgcGFyYW1ldGVyXG4gICAgLy8gYW5kIHJldHVybnMgaXQncyBwcmVmaXhlZCB2ZXJzaW9uIHZhbGlkIGZvciBjdXJyZW50IGJyb3dzZXIgaXQgcnVucyBpbi5cbiAgICAvLyBUaGUgY29kZSBpcyBoZWF2aWx5IGluc3BpcmVkIGJ5IE1vZGVybml6ciBodHRwOi8vd3d3Lm1vZGVybml6ci5jb20vXG4gICAgdmFyIHBmeCA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgIFxuICAgICAgICB2YXIgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkdW1teScpLnN0eWxlLFxuICAgICAgICAgICAgcHJlZml4ZXMgPSAnV2Via2l0IE1veiBPIG1zIEtodG1sJy5zcGxpdCgnICcpLFxuICAgICAgICAgICAgbWVtb3J5ID0ge307XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCBwcm9wICkge1xuICAgICAgICAgICAgaWYgKCB0eXBlb2YgbWVtb3J5WyBwcm9wIF0gPT09IFwidW5kZWZpbmVkXCIgKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdmFyIHVjUHJvcCAgPSBwcm9wLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcHJvcC5zdWJzdHIoMSksXG4gICAgICAgICAgICAgICAgICAgIHByb3BzICAgPSAocHJvcCArICcgJyArIHByZWZpeGVzLmpvaW4odWNQcm9wICsgJyAnKSArIHVjUHJvcCkuc3BsaXQoJyAnKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBtZW1vcnlbIHByb3AgXSA9IG51bGw7XG4gICAgICAgICAgICAgICAgZm9yICggdmFyIGkgaW4gcHJvcHMgKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICggc3R5bGVbIHByb3BzW2ldIF0gIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbW9yeVsgcHJvcCBdID0gcHJvcHNbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gbWVtb3J5WyBwcm9wIF07XG4gICAgICAgIH07XG4gICAgXG4gICAgfSkoKTtcbiAgICBcbiAgICAvLyBgYXJyYWlmeWAgdGFrZXMgYW4gYXJyYXktbGlrZSBvYmplY3QgYW5kIHR1cm5zIGl0IGludG8gcmVhbCBBcnJheVxuICAgIC8vIHRvIG1ha2UgYWxsIHRoZSBBcnJheS5wcm90b3R5cGUgZ29vZG5lc3MgYXZhaWxhYmxlLlxuICAgIHZhciBhcnJheWlmeSA9IGZ1bmN0aW9uICggYSApIHtcbiAgICAgICAgcmV0dXJuIFtdLnNsaWNlLmNhbGwoIGEgKTtcbiAgICB9O1xuICAgIFxuICAgIC8vIGBjc3NgIGZ1bmN0aW9uIGFwcGxpZXMgdGhlIHN0eWxlcyBnaXZlbiBpbiBgcHJvcHNgIG9iamVjdCB0byB0aGUgZWxlbWVudFxuICAgIC8vIGdpdmVuIGFzIGBlbGAuIEl0IHJ1bnMgYWxsIHByb3BlcnR5IG5hbWVzIHRocm91Z2ggYHBmeGAgZnVuY3Rpb24gdG8gbWFrZVxuICAgIC8vIHN1cmUgcHJvcGVyIHByZWZpeGVkIHZlcnNpb24gb2YgdGhlIHByb3BlcnR5IGlzIHVzZWQuXG4gICAgdmFyIGNzcyA9IGZ1bmN0aW9uICggZWwsIHByb3BzICkge1xuICAgICAgICB2YXIga2V5LCBwa2V5O1xuICAgICAgICBmb3IgKCBrZXkgaW4gcHJvcHMgKSB7XG4gICAgICAgICAgICBpZiAoIHByb3BzLmhhc093blByb3BlcnR5KGtleSkgKSB7XG4gICAgICAgICAgICAgICAgcGtleSA9IHBmeChrZXkpO1xuICAgICAgICAgICAgICAgIGlmICggcGtleSAhPT0gbnVsbCApIHtcbiAgICAgICAgICAgICAgICAgICAgZWwuc3R5bGVbcGtleV0gPSBwcm9wc1trZXldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZWw7XG4gICAgfTtcbiAgICBcbiAgICAvLyBgdG9OdW1iZXJgIHRha2VzIGEgdmFsdWUgZ2l2ZW4gYXMgYG51bWVyaWNgIHBhcmFtZXRlciBhbmQgdHJpZXMgdG8gdHVyblxuICAgIC8vIGl0IGludG8gYSBudW1iZXIuIElmIGl0IGlzIG5vdCBwb3NzaWJsZSBpdCByZXR1cm5zIDAgKG9yIG90aGVyIHZhbHVlXG4gICAgLy8gZ2l2ZW4gYXMgYGZhbGxiYWNrYCkuXG4gICAgdmFyIHRvTnVtYmVyID0gZnVuY3Rpb24gKG51bWVyaWMsIGZhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBpc05hTihudW1lcmljKSA/IChmYWxsYmFjayB8fCAwKSA6IE51bWJlcihudW1lcmljKTtcbiAgICB9O1xuICAgIFxuICAgIC8vIGBieUlkYCByZXR1cm5zIGVsZW1lbnQgd2l0aCBnaXZlbiBgaWRgIC0geW91IHByb2JhYmx5IGhhdmUgZ3Vlc3NlZCB0aGF0IDspXG4gICAgdmFyIGJ5SWQgPSBmdW5jdGlvbiAoIGlkICkge1xuICAgICAgICByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuICAgIH07XG4gICAgXG4gICAgLy8gYCRgIHJldHVybnMgZmlyc3QgZWxlbWVudCBmb3IgZ2l2ZW4gQ1NTIGBzZWxlY3RvcmAgaW4gdGhlIGBjb250ZXh0YCBvZlxuICAgIC8vIHRoZSBnaXZlbiBlbGVtZW50IG9yIHdob2xlIGRvY3VtZW50LlxuICAgIHZhciAkID0gZnVuY3Rpb24gKCBzZWxlY3RvciwgY29udGV4dCApIHtcbiAgICAgICAgY29udGV4dCA9IGNvbnRleHQgfHwgZG9jdW1lbnQ7XG4gICAgICAgIHJldHVybiBjb250ZXh0LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgIH07XG4gICAgXG4gICAgLy8gYCQkYCByZXR1cm4gYW4gYXJyYXkgb2YgZWxlbWVudHMgZm9yIGdpdmVuIENTUyBgc2VsZWN0b3JgIGluIHRoZSBgY29udGV4dGAgb2ZcbiAgICAvLyB0aGUgZ2l2ZW4gZWxlbWVudCBvciB3aG9sZSBkb2N1bWVudC5cbiAgICB2YXIgJCQgPSBmdW5jdGlvbiAoIHNlbGVjdG9yLCBjb250ZXh0ICkge1xuICAgICAgICBjb250ZXh0ID0gY29udGV4dCB8fCBkb2N1bWVudDtcbiAgICAgICAgcmV0dXJuIGFycmF5aWZ5KCBjb250ZXh0LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpICk7XG4gICAgfTtcbiAgICBcbiAgICAvLyBgdHJpZ2dlckV2ZW50YCBidWlsZHMgYSBjdXN0b20gRE9NIGV2ZW50IHdpdGggZ2l2ZW4gYGV2ZW50TmFtZWAgYW5kIGBkZXRhaWxgIGRhdGFcbiAgICAvLyBhbmQgdHJpZ2dlcnMgaXQgb24gZWxlbWVudCBnaXZlbiBhcyBgZWxgLlxuICAgIHZhciB0cmlnZ2VyRXZlbnQgPSBmdW5jdGlvbiAoZWwsIGV2ZW50TmFtZSwgZGV0YWlsKSB7XG4gICAgICAgIHZhciBldmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiQ3VzdG9tRXZlbnRcIik7XG4gICAgICAgIGV2ZW50LmluaXRDdXN0b21FdmVudChldmVudE5hbWUsIHRydWUsIHRydWUsIGRldGFpbCk7XG4gICAgICAgIGVsLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgIH07XG4gICAgXG4gICAgLy8gYHRyYW5zbGF0ZWAgYnVpbGRzIGEgdHJhbnNsYXRlIHRyYW5zZm9ybSBzdHJpbmcgZm9yIGdpdmVuIGRhdGEuXG4gICAgdmFyIHRyYW5zbGF0ZSA9IGZ1bmN0aW9uICggdCApIHtcbiAgICAgICAgcmV0dXJuIFwiIHRyYW5zbGF0ZTNkKFwiICsgdC54ICsgXCJweCxcIiArIHQueSArIFwicHgsXCIgKyB0LnogKyBcInB4KSBcIjtcbiAgICB9O1xuICAgIFxuICAgIC8vIGByb3RhdGVgIGJ1aWxkcyBhIHJvdGF0ZSB0cmFuc2Zvcm0gc3RyaW5nIGZvciBnaXZlbiBkYXRhLlxuICAgIC8vIEJ5IGRlZmF1bHQgdGhlIHJvdGF0aW9ucyBhcmUgaW4gWCBZIFogb3JkZXIgdGhhdCBjYW4gYmUgcmV2ZXJ0ZWQgYnkgcGFzc2luZyBgdHJ1ZWBcbiAgICAvLyBhcyBzZWNvbmQgcGFyYW1ldGVyLlxuICAgIHZhciByb3RhdGUgPSBmdW5jdGlvbiAoIHIsIHJldmVydCApIHtcbiAgICAgICAgdmFyIHJYID0gXCIgcm90YXRlWChcIiArIHIueCArIFwiZGVnKSBcIixcbiAgICAgICAgICAgIHJZID0gXCIgcm90YXRlWShcIiArIHIueSArIFwiZGVnKSBcIixcbiAgICAgICAgICAgIHJaID0gXCIgcm90YXRlWihcIiArIHIueiArIFwiZGVnKSBcIjtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiByZXZlcnQgPyByWityWStyWCA6IHJYK3JZK3JaO1xuICAgIH07XG4gICAgXG4gICAgLy8gYHNjYWxlYCBidWlsZHMgYSBzY2FsZSB0cmFuc2Zvcm0gc3RyaW5nIGZvciBnaXZlbiBkYXRhLlxuICAgIHZhciBzY2FsZSA9IGZ1bmN0aW9uICggcyApIHtcbiAgICAgICAgcmV0dXJuIFwiIHNjYWxlKFwiICsgcyArIFwiKSBcIjtcbiAgICB9O1xuICAgIFxuICAgIC8vIGBwZXJzcGVjdGl2ZWAgYnVpbGRzIGEgcGVyc3BlY3RpdmUgdHJhbnNmb3JtIHN0cmluZyBmb3IgZ2l2ZW4gZGF0YS5cbiAgICB2YXIgcGVyc3BlY3RpdmUgPSBmdW5jdGlvbiAoIHAgKSB7XG4gICAgICAgIHJldHVybiBcIiBwZXJzcGVjdGl2ZShcIiArIHAgKyBcInB4KSBcIjtcbiAgICB9O1xuICAgIFxuICAgIC8vIGBnZXRFbGVtZW50RnJvbUhhc2hgIHJldHVybnMgYW4gZWxlbWVudCBsb2NhdGVkIGJ5IGlkIGZyb20gaGFzaCBwYXJ0IG9mXG4gICAgLy8gd2luZG93IGxvY2F0aW9uLlxuICAgIHZhciBnZXRFbGVtZW50RnJvbUhhc2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIGdldCBpZCBmcm9tIHVybCAjIGJ5IHJlbW92aW5nIGAjYCBvciBgIy9gIGZyb20gdGhlIGJlZ2lubmluZyxcbiAgICAgICAgLy8gc28gYm90aCBcImZhbGxiYWNrXCIgYCNzbGlkZS1pZGAgYW5kIFwiZW5oYW5jZWRcIiBgIy9zbGlkZS1pZGAgd2lsbCB3b3JrXG4gICAgICAgIHJldHVybiBieUlkKCB3aW5kb3cubG9jYXRpb24uaGFzaC5yZXBsYWNlKC9eI1xcLz8vLFwiXCIpICk7XG4gICAgfTtcbiAgICBcbiAgICAvLyBgY29tcHV0ZVdpbmRvd1NjYWxlYCBjb3VudHMgdGhlIHNjYWxlIGZhY3RvciBiZXR3ZWVuIHdpbmRvdyBzaXplIGFuZCBzaXplXG4gICAgLy8gZGVmaW5lZCBmb3IgdGhlIHByZXNlbnRhdGlvbiBpbiB0aGUgY29uZmlnLlxuICAgIHZhciBjb21wdXRlV2luZG93U2NhbGUgPSBmdW5jdGlvbiAoIGNvbmZpZyApIHtcbiAgICAgICAgdmFyIGhTY2FsZSA9IHdpbmRvdy5pbm5lckhlaWdodCAvIGNvbmZpZy5oZWlnaHQsXG4gICAgICAgICAgICB3U2NhbGUgPSB3aW5kb3cuaW5uZXJXaWR0aCAvIGNvbmZpZy53aWR0aCxcbiAgICAgICAgICAgIHNjYWxlID0gaFNjYWxlID4gd1NjYWxlID8gd1NjYWxlIDogaFNjYWxlO1xuICAgICAgICBcbiAgICAgICAgaWYgKGNvbmZpZy5tYXhTY2FsZSAmJiBzY2FsZSA+IGNvbmZpZy5tYXhTY2FsZSkge1xuICAgICAgICAgICAgc2NhbGUgPSBjb25maWcubWF4U2NhbGU7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmIChjb25maWcubWluU2NhbGUgJiYgc2NhbGUgPCBjb25maWcubWluU2NhbGUpIHtcbiAgICAgICAgICAgIHNjYWxlID0gY29uZmlnLm1pblNjYWxlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gc2NhbGU7XG4gICAgfTtcbiAgICBcbiAgICAvLyBDSEVDSyBTVVBQT1JUXG4gICAgdmFyIGJvZHkgPSBkb2N1bWVudC5ib2R5O1xuICAgIFxuICAgIHZhciB1YSA9IG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKTtcbiAgICB2YXIgaW1wcmVzc1N1cHBvcnRlZCA9IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBicm93c2VyIHNob3VsZCBzdXBwb3J0IENTUyAzRCB0cmFuc3Rvcm1zIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBwZngoXCJwZXJzcGVjdGl2ZVwiKSAhPT0gbnVsbCApICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYW5kIGBjbGFzc0xpc3RgIGFuZCBgZGF0YXNldGAgQVBJc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBib2R5LmNsYXNzTGlzdCApICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAoIGJvZHkuZGF0YXNldCApOy8vICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYnV0IHNvbWUgbW9iaWxlIGRldmljZXMgbmVlZCB0byBiZSBibGFja2xpc3RlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYmVjYXVzZSB0aGVpciBDU1MgM0Qgc3VwcG9ydCBvciBoYXJkd2FyZSBpcyBub3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZ29vZCBlbm91Z2ggdG8gcnVuIGltcHJlc3MuanMgcHJvcGVybHksIHNvcnJ5Li4uXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC8vICggdWEuc2VhcmNoKC8oaXBob25lKXwoaXBvZCl8KGFuZHJvaWQpLykgPT09IC0xICk7XG4gICAgXG4gICAgaWYgKCFpbXByZXNzU3VwcG9ydGVkKSB7XG4gICAgICAgIC8vIHdlIGNhbid0IGJlIHN1cmUgdGhhdCBgY2xhc3NMaXN0YCBpcyBzdXBwb3J0ZWRcbiAgICAgICAgYm9keS5jbGFzc05hbWUgKz0gXCIgaW1wcmVzcy1ub3Qtc3VwcG9ydGVkIFwiO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGJvZHkuY2xhc3NMaXN0LnJlbW92ZShcImltcHJlc3Mtbm90LXN1cHBvcnRlZFwiKTtcbiAgICAgICAgYm9keS5jbGFzc0xpc3QuYWRkKFwiaW1wcmVzcy1zdXBwb3J0ZWRcIik7XG4gICAgfVxuICAgIFxuICAgIC8vIEdMT0JBTFMgQU5EIERFRkFVTFRTXG4gICAgXG4gICAgLy8gVGhpcyBpcyB3ZXJlIHRoZSByb290IGVsZW1lbnRzIG9mIGFsbCBpbXByZXNzLmpzIGluc3RhbmNlcyB3aWxsIGJlIGtlcHQuXG4gICAgLy8gWWVzLCB0aGlzIG1lYW5zIHlvdSBjYW4gaGF2ZSBtb3JlIHRoYW4gb25lIGluc3RhbmNlIG9uIGEgcGFnZSwgYnV0IEknbSBub3RcbiAgICAvLyBzdXJlIGlmIGl0IG1ha2VzIGFueSBzZW5zZSBpbiBwcmFjdGljZSA7KVxuICAgIHZhciByb290cyA9IHt9O1xuICAgIFxuICAgIC8vIHNvbWUgZGVmYXVsdCBjb25maWcgdmFsdWVzLlxuICAgIHZhciBkZWZhdWx0cyA9IHtcbiAgICAgICAgd2lkdGg6IDEwMjQsXG4gICAgICAgIGhlaWdodDogNzY4LFxuICAgICAgICBtYXhTY2FsZTogMSxcbiAgICAgICAgbWluU2NhbGU6IDAsXG4gICAgICAgIFxuICAgICAgICBwZXJzcGVjdGl2ZTogMTAwMCxcbiAgICAgICAgXG4gICAgICAgIHRyYW5zaXRpb25EdXJhdGlvbjogMTAwMFxuICAgIH07XG4gICAgXG4gICAgLy8gaXQncyBqdXN0IGFuIGVtcHR5IGZ1bmN0aW9uIC4uLiBhbmQgYSB1c2VsZXNzIGNvbW1lbnQuXG4gICAgdmFyIGVtcHR5ID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gZmFsc2U7IH07XG4gICAgXG4gICAgLy8gSU1QUkVTUy5KUyBBUElcbiAgICBcbiAgICAvLyBBbmQgdGhhdCdzIHdoZXJlIGludGVyZXN0aW5nIHRoaW5ncyB3aWxsIHN0YXJ0IHRvIGhhcHBlbi5cbiAgICAvLyBJdCdzIHRoZSBjb3JlIGBpbXByZXNzYCBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIGltcHJlc3MuanMgQVBJXG4gICAgLy8gZm9yIGEgcHJlc2VudGF0aW9uIGJhc2VkIG9uIHRoZSBlbGVtZW50IHdpdGggZ2l2ZW4gaWQgKCdpbXByZXNzJ1xuICAgIC8vIGJ5IGRlZmF1bHQpLlxuICAgIHZhciBpbXByZXNzID0gd2luZG93LmltcHJlc3MgPSBmdW5jdGlvbiAoIHJvb3RJZCApIHtcbiAgICAgICAgXG4gICAgICAgIC8vIElmIGltcHJlc3MuanMgaXMgbm90IHN1cHBvcnRlZCBieSB0aGUgYnJvd3NlciByZXR1cm4gYSBkdW1teSBBUElcbiAgICAgICAgLy8gaXQgbWF5IG5vdCBiZSBhIHBlcmZlY3Qgc29sdXRpb24gYnV0IHdlIHJldHVybiBlYXJseSBhbmQgYXZvaWRcbiAgICAgICAgLy8gcnVubmluZyBjb2RlIHRoYXQgbWF5IHVzZSBmZWF0dXJlcyBub3QgaW1wbGVtZW50ZWQgaW4gdGhlIGJyb3dzZXIuXG4gICAgICAgIGlmICghaW1wcmVzc1N1cHBvcnRlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBpbml0OiBlbXB0eSxcbiAgICAgICAgICAgICAgICBzdGFydDogZW1wdHksXG4gICAgICAgICAgICAgICAgZ290bzogZW1wdHksXG4gICAgICAgICAgICAgICAgZ290b1N1YjogZW1wdHksXG4gICAgICAgICAgICAgICAgZW1pdEdvdG86IGVtcHR5LFxuICAgICAgICAgICAgICAgIGVtaXRHb3RvU3ViOiBlbXB0eSxcbiAgICAgICAgICAgICAgICBwcmV2OiBlbXB0eSxcbiAgICAgICAgICAgICAgICBuZXh0OiBlbXB0eVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcm9vdElkID0gcm9vdElkIHx8IFwiaW1wcmVzc1wiO1xuICAgICAgICBcbiAgICAgICAgLy8gaWYgZ2l2ZW4gcm9vdCBpcyBhbHJlYWR5IGluaXRpYWxpemVkIGp1c3QgcmV0dXJuIHRoZSBBUElcbiAgICAgICAgaWYgKHJvb3RzW1wiaW1wcmVzcy1yb290LVwiICsgcm9vdElkXSkge1xuICAgICAgICAgICAgcmV0dXJuIHJvb3RzW1wiaW1wcmVzcy1yb290LVwiICsgcm9vdElkXTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gZGF0YSBvZiBhbGwgcHJlc2VudGF0aW9uIHN0ZXBzXG4gICAgICAgIHZhciBzdGVwc0RhdGEgPSB7fTtcbiAgICAgICAgXG4gICAgICAgIC8vIGVsZW1lbnQgb2YgY3VycmVudGx5IGFjdGl2ZSBzdGVwXG4gICAgICAgIHZhciBhY3RpdmVTdGVwID0gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIC8vIGN1cnJlbnQgc3RhdGUgKHBvc2l0aW9uLCByb3RhdGlvbiBhbmQgc2NhbGUpIG9mIHRoZSBwcmVzZW50YXRpb25cbiAgICAgICAgdmFyIGN1cnJlbnRTdGF0ZSA9IG51bGw7XG4gICAgICAgIFxuICAgICAgICAvLyBhcnJheSBvZiBzdGVwIGVsZW1lbnRzXG4gICAgICAgIHZhciBzdGVwcyA9IG51bGw7XG4gICAgICAgIFxuICAgICAgICAvLyBjb25maWd1cmF0aW9uIG9wdGlvbnNcbiAgICAgICAgdmFyIGNvbmZpZyA9IG51bGw7XG4gICAgICAgIFxuICAgICAgICAvLyBzY2FsZSBmYWN0b3Igb2YgdGhlIGJyb3dzZXIgd2luZG93XG4gICAgICAgIHZhciB3aW5kb3dTY2FsZSA9IG51bGw7ICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8vIHJvb3QgcHJlc2VudGF0aW9uIGVsZW1lbnRzXG4gICAgICAgIHZhciByb290ID0gYnlJZCggcm9vdElkICk7XG4gICAgICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBcbiAgICAgICAgdmFyIGluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgICAgIHZhciBzdGFydGVkID0gZmFsc2U7XG4gICAgICAgIFxuICAgICAgICAvLyBTVEVQIEVWRU5UU1xuICAgICAgICAvL1xuICAgICAgICAvLyBUaGVyZSBhcmUgY3VycmVudGx5IHR3byBzdGVwIGV2ZW50cyB0cmlnZ2VyZWQgYnkgaW1wcmVzcy5qc1xuICAgICAgICAvLyBgaW1wcmVzczpzdGVwZW50ZXJgIGlzIHRyaWdnZXJlZCB3aGVuIHRoZSBzdGVwIGlzIHNob3duIG9uIHRoZSBcbiAgICAgICAgLy8gc2NyZWVuICh0aGUgdHJhbnNpdGlvbiBmcm9tIHRoZSBwcmV2aW91cyBvbmUgaXMgZmluaXNoZWQpIGFuZFxuICAgICAgICAvLyBgaW1wcmVzczpzdGVwbGVhdmVgIGlzIHRyaWdnZXJlZCB3aGVuIHRoZSBzdGVwIGlzIGxlZnQgKHRoZVxuICAgICAgICAvLyB0cmFuc2l0aW9uIHRvIG5leHQgc3RlcCBqdXN0IHN0YXJ0cykuXG4gICAgICAgIFxuICAgICAgICAvLyByZWZlcmVuY2UgdG8gbGFzdCBlbnRlcmVkIHN0ZXBcbiAgICAgICAgdmFyIGxhc3RFbnRlcmVkID0gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIC8vIGBvblN0ZXBFbnRlcmAgaXMgY2FsbGVkIHdoZW5ldmVyIHRoZSBzdGVwIGVsZW1lbnQgaXMgZW50ZXJlZFxuICAgICAgICAvLyBidXQgdGhlIGV2ZW50IGlzIHRyaWdnZXJlZCBvbmx5IGlmIHRoZSBzdGVwIGlzIGRpZmZlcmVudCB0aGFuXG4gICAgICAgIC8vIGxhc3QgZW50ZXJlZCBzdGVwLlxuICAgICAgICB2YXIgb25TdGVwRW50ZXIgPSBmdW5jdGlvbiAoc3RlcCkge1xuICAgICAgICAgICAgaWYgKGxhc3RFbnRlcmVkICE9PSBzdGVwKSB7XG4gICAgICAgICAgICAgICAgdHJpZ2dlckV2ZW50KHN0ZXAsIFwiaW1wcmVzczpzdGVwZW50ZXJcIik7XG4gICAgICAgICAgICAgICAgbGFzdEVudGVyZWQgPSBzdGVwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLy8gQ3VzdG9tIEV2ZW50IGNhbGxlZCBhdCB0aGUgc2FtZSB0aW1lIGFzIFN0ZXBMZWF2ZSBidXQgZ2l2ZXMgdGhlIG5leHRcbiAgICAgICAgLy8gc3RlcC5cbiAgICAgICAgdmFyIG9uU3RlcEdvdG8gPSBmdW5jdGlvbiAoc3RlcCkge1xuICAgICAgICAgICAgaWYgKGxhc3RFbnRlcmVkICE9PSBzdGVwKSB7XG4gICAgICAgICAgICAgICAgdHJpZ2dlckV2ZW50KHN0ZXAsIFwiaW1wcmVzczpzdGVwZ290b1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvLyBgb25TdGVwTGVhdmVgIGlzIGNhbGxlZCB3aGVuZXZlciB0aGUgc3RlcCBlbGVtZW50IGlzIGxlZnRcbiAgICAgICAgLy8gYnV0IHRoZSBldmVudCBpcyB0cmlnZ2VyZWQgb25seSBpZiB0aGUgc3RlcCBpcyB0aGUgc2FtZSBhc1xuICAgICAgICAvLyBsYXN0IGVudGVyZWQgc3RlcC5cbiAgICAgICAgdmFyIG9uU3RlcExlYXZlID0gZnVuY3Rpb24gKHN0ZXApIHtcbiAgICAgICAgICAgIGlmIChsYXN0RW50ZXJlZCA9PT0gc3RlcCkge1xuICAgICAgICAgICAgICAgIHRyaWdnZXJFdmVudChzdGVwLCBcImltcHJlc3M6c3RlcGxlYXZlXCIpO1xuICAgICAgICAgICAgICAgIGxhc3RFbnRlcmVkID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8vIGBpbml0U3RlcGAgaW5pdGlhbGl6ZXMgZ2l2ZW4gc3RlcCBlbGVtZW50IGJ5IHJlYWRpbmcgZGF0YSBmcm9tIGl0c1xuICAgICAgICAvLyBkYXRhIGF0dHJpYnV0ZXMgYW5kIHNldHRpbmcgY29ycmVjdCBzdHlsZXMuXG4gICAgICAgIHZhciBpbml0U3RlcCA9IGZ1bmN0aW9uICggZWwsIGlkeCApIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gZWwuZGF0YXNldCxcbiAgICAgICAgICAgICAgICBzdGVwID0ge1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IHRvTnVtYmVyKGRhdGEueCksXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiB0b051bWJlcihkYXRhLnkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgejogdG9OdW1iZXIoZGF0YS56KVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICByb3RhdGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IHRvTnVtYmVyKGRhdGEucm90YXRlWCksXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiB0b051bWJlcihkYXRhLnJvdGF0ZVkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgejogdG9OdW1iZXIoZGF0YS5yb3RhdGVaIHx8IGRhdGEucm90YXRlKVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBzY2FsZTogdG9OdW1iZXIoZGF0YS5zY2FsZSwgMSksXG4gICAgICAgICAgICAgICAgICAgIGVsOiBlbFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICggIWVsLmlkICkge1xuICAgICAgICAgICAgICAgIGVsLmlkID0gXCJzdGVwLVwiICsgKGlkeCArIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBzdGVwc0RhdGFbXCJpbXByZXNzLVwiICsgZWwuaWRdID0gc3RlcDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY3NzKGVsLCB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb246IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm06IFwidHJhbnNsYXRlKC01MCUsLTUwJSlcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGUoc3RlcC50cmFuc2xhdGUpICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdGF0ZShzdGVwLnJvdGF0ZSkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NhbGUoc3RlcC5zY2FsZSksXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtU3R5bGU6IFwicHJlc2VydmUtM2RcIlxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvLyBgaW5pdGAgQVBJIGZ1bmN0aW9uIHRoYXQgaW5pdGlhbGl6ZXMgKGFuZCBydW5zKSB0aGUgcHJlc2VudGF0aW9uLlxuICAgICAgICB2YXIgaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChpbml0aWFsaXplZCkgeyByZXR1cm47IH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gRmlyc3Qgd2Ugc2V0IHVwIHRoZSB2aWV3cG9ydCBmb3IgbW9iaWxlIGRldmljZXMuXG4gICAgICAgICAgICAvLyBGb3Igc29tZSByZWFzb24gaVBhZCBnb2VzIG51dHMgd2hlbiBpdCBpcyBub3QgZG9uZSBwcm9wZXJseS5cbiAgICAgICAgICAgIHZhciBtZXRhID0gJChcIm1ldGFbbmFtZT0ndmlld3BvcnQnXVwiKSB8fCBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibWV0YVwiKTtcbiAgICAgICAgICAgIG1ldGEuY29udGVudCA9IFwid2lkdGg9ZGV2aWNlLXdpZHRoLCBtaW5pbXVtLXNjYWxlPTEsIG1heGltdW0tc2NhbGU9MSwgdXNlci1zY2FsYWJsZT1ub1wiO1xuICAgICAgICAgICAgaWYgKG1ldGEucGFyZW50Tm9kZSAhPT0gZG9jdW1lbnQuaGVhZCkge1xuICAgICAgICAgICAgICAgIG1ldGEubmFtZSA9ICd2aWV3cG9ydCc7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChtZXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gaW5pdGlhbGl6ZSBjb25maWd1cmF0aW9uIG9iamVjdFxuICAgICAgICAgICAgdmFyIHJvb3REYXRhID0gcm9vdC5kYXRhc2V0O1xuICAgICAgICAgICAgY29uZmlnID0ge1xuICAgICAgICAgICAgICAgIHdpZHRoOiB0b051bWJlciggcm9vdERhdGEud2lkdGgsIGRlZmF1bHRzLndpZHRoICksXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiB0b051bWJlciggcm9vdERhdGEuaGVpZ2h0LCBkZWZhdWx0cy5oZWlnaHQgKSxcbiAgICAgICAgICAgICAgICBtYXhTY2FsZTogdG9OdW1iZXIoIHJvb3REYXRhLm1heFNjYWxlLCBkZWZhdWx0cy5tYXhTY2FsZSApLFxuICAgICAgICAgICAgICAgIG1pblNjYWxlOiB0b051bWJlciggcm9vdERhdGEubWluU2NhbGUsIGRlZmF1bHRzLm1pblNjYWxlICksICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHBlcnNwZWN0aXZlOiB0b051bWJlciggcm9vdERhdGEucGVyc3BlY3RpdmUsIGRlZmF1bHRzLnBlcnNwZWN0aXZlICksXG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbkR1cmF0aW9uOiB0b051bWJlciggcm9vdERhdGEudHJhbnNpdGlvbkR1cmF0aW9uLCBkZWZhdWx0cy50cmFuc2l0aW9uRHVyYXRpb24gKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgd2luZG93U2NhbGUgPSBjb21wdXRlV2luZG93U2NhbGUoIGNvbmZpZyApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyB3cmFwIHN0ZXBzIHdpdGggXCJjYW52YXNcIiBlbGVtZW50XG4gICAgICAgICAgICBhcnJheWlmeSggcm9vdC5jaGlsZE5vZGVzICkuZm9yRWFjaChmdW5jdGlvbiAoIGVsICkge1xuICAgICAgICAgICAgICAgIGNhbnZhcy5hcHBlbmRDaGlsZCggZWwgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcm9vdC5hcHBlbmRDaGlsZChjYW52YXMpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBzZXQgaW5pdGlhbCBzdHlsZXNcbiAgICAgICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZS5oZWlnaHQgPSBcIjEwMCVcIjtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY3NzKGJvZHksIHtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IFwiMTAwJVwiLFxuICAgICAgICAgICAgICAgIG92ZXJmbG93OiBcImhpZGRlblwiXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIHJvb3RTdHlsZXMgPSB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb246IFwiYWJzb2x1dGVcIixcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1PcmlnaW46IFwidG9wIGxlZnRcIixcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiBcImFsbCAwcyBlYXNlLWluLW91dFwiLFxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybVN0eWxlOiBcInByZXNlcnZlLTNkXCJcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNzcyhyb290LCByb290U3R5bGVzKTtcbiAgICAgICAgICAgIGNzcyhyb290LCB7XG4gICAgICAgICAgICAgICAgdG9wOiBcIjUwJVwiLFxuICAgICAgICAgICAgICAgIGxlZnQ6IFwiNTAlXCIsXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtOiBwZXJzcGVjdGl2ZSggY29uZmlnLnBlcnNwZWN0aXZlL3dpbmRvd1NjYWxlICkgKyBzY2FsZSggd2luZG93U2NhbGUgKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjc3MoY2FudmFzLCByb290U3R5bGVzKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYm9keS5jbGFzc0xpc3QucmVtb3ZlKFwiaW1wcmVzcy1kaXNhYmxlZFwiKTtcbiAgICAgICAgICAgIGJvZHkuY2xhc3NMaXN0LmFkZChcImltcHJlc3MtZW5hYmxlZFwiKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gZ2V0IGFuZCBpbml0IHN0ZXBzXG4gICAgICAgICAgICBzdGVwcyA9ICQkKFwiLnN0ZXBcIiwgcm9vdCk7XG4gICAgICAgICAgICBzdGVwcy5mb3JFYWNoKCBpbml0U3RlcCApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBzZXQgYSBkZWZhdWx0IGluaXRpYWwgc3RhdGUgb2YgdGhlIGNhbnZhc1xuICAgICAgICAgICAgY3VycmVudFN0YXRlID0ge1xuICAgICAgICAgICAgICAgIHRyYW5zbGF0ZTogeyB4OiAwLCB5OiAwLCB6OiAwIH0sXG4gICAgICAgICAgICAgICAgcm90YXRlOiAgICB7IHg6IDAsIHk6IDAsIHo6IDAgfSxcbiAgICAgICAgICAgICAgICBzY2FsZTogICAgIDFcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdHJpZ2dlckV2ZW50KHJvb3QsIFwiaW1wcmVzczppbml0XCIsIHsgYXBpOiByb290c1sgXCJpbXByZXNzLXJvb3QtXCIgKyByb290SWQgXSB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIHZhciBzdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKCFpbml0aWFsaXplZCB8fCBzdGFydGVkKSByZXR1cm47XG4gICAgICAgICAgICB0cmlnZ2VyRXZlbnQocm9vdCwgXCJpbXByZXNzOnN0YXJ0XCIsIHsgYXBpOiByb290c1sgXCJpbXByZXNzLXJvb3QtXCIgKyByb290SWQgXSB9KTtcbiAgICAgICAgICAgIHN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIGBnZXRTdGVwYCBpcyBhIGhlbHBlciBmdW5jdGlvbiB0aGF0IHJldHVybnMgYSBzdGVwIGVsZW1lbnQgZGVmaW5lZCBieSBwYXJhbWV0ZXIuXG4gICAgICAgIC8vIElmIGEgbnVtYmVyIGlzIGdpdmVuLCBzdGVwIHdpdGggaW5kZXggZ2l2ZW4gYnkgdGhlIG51bWJlciBpcyByZXR1cm5lZCwgaWYgYSBzdHJpbmdcbiAgICAgICAgLy8gaXMgZ2l2ZW4gc3RlcCBlbGVtZW50IHdpdGggc3VjaCBpZCBpcyByZXR1cm5lZCwgaWYgRE9NIGVsZW1lbnQgaXMgZ2l2ZW4gaXQgaXMgcmV0dXJuZWRcbiAgICAgICAgLy8gaWYgaXQgaXMgYSBjb3JyZWN0IHN0ZXAgZWxlbWVudC5cbiAgICAgICAgdmFyIGdldFN0ZXAgPSBmdW5jdGlvbiAoIHN0ZXAgKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHN0ZXAgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgICAgICBzdGVwID0gc3RlcCA8IDAgPyBzdGVwc1sgc3RlcHMubGVuZ3RoICsgc3RlcF0gOiBzdGVwc1sgc3RlcCBdO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygc3RlcCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIHN0ZXAgPSBieUlkKHN0ZXApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIChzdGVwICYmIHN0ZXAuaWQgJiYgc3RlcHNEYXRhW1wiaW1wcmVzcy1cIiArIHN0ZXAuaWRdKSA/IHN0ZXAgOiBudWxsO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLy8gdXNlZCB0byByZXNldCB0aW1lb3V0IGZvciBgaW1wcmVzczpzdGVwZW50ZXJgIGV2ZW50XG4gICAgICAgIHZhciBzdGVwRW50ZXJUaW1lb3V0ID0gbnVsbDtcblxuICAgICAgICBcbiAgICAgICAgdmFyIGVtaXRHb3RvID0gZnVuY3Rpb24oIGVsLCBkdXJhdGlvbiApIHtcbiAgICAgICAgICAgIGlmICggIWluaXRpYWxpemVkIHx8ICEoZWwgPSBnZXRTdGVwKGVsKSkgKSB7XG4gICAgICAgICAgICAgICAgLy8gcHJlc2VudGF0aW9uIG5vdCBpbml0aWFsaXplZCBvciBnaXZlbiBlbGVtZW50IGlzIG5vdCBhIHN0ZXBcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHRyaWdnZXIgbGVhdmUgb2YgY3VycmVudGx5IGFjdGl2ZSBlbGVtZW50IChpZiBpdCdzIG5vdCB0aGUgc2FtZSBzdGVwIGFnYWluKVxuICAgICAgICAgICAgaWYgKGFjdGl2ZVN0ZXAgJiYgYWN0aXZlU3RlcCAhPT0gZWwpIHtcbiAgICAgICAgICAgICAgICBvblN0ZXBHb3RvKGVsKTtcbiAgICAgICAgICAgICAgICBvblN0ZXBMZWF2ZShhY3RpdmVTdGVwKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGVsO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYGdvdG9gIEFQSSBmdW5jdGlvbiB0aGF0IG1vdmVzIHRvIHN0ZXAgZ2l2ZW4gd2l0aCBgZWxgIHBhcmFtZXRlciAoYnkgaW5kZXgsIGlkIG9yIGVsZW1lbnQpLFxuICAgICAgICAvLyB3aXRoIGEgdHJhbnNpdGlvbiBgZHVyYXRpb25gIG9wdGlvbmFsbHkgZ2l2ZW4gYXMgc2Vjb25kIHBhcmFtZXRlci5cbiAgICAgICAgdmFyIGdvdG8gPSBmdW5jdGlvbiAoIGVsLCBkdXJhdGlvbiApIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKCAhaW5pdGlhbGl6ZWQgfHwgIShlbCA9IGdldFN0ZXAoZWwpKSApIHtcbiAgICAgICAgICAgICAgICAvLyBwcmVzZW50YXRpb24gbm90IGluaXRpYWxpemVkIG9yIGdpdmVuIGVsZW1lbnQgaXMgbm90IGEgc3RlcFxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gU29tZXRpbWVzIGl0J3MgcG9zc2libGUgdG8gdHJpZ2dlciBmb2N1cyBvbiBmaXJzdCBsaW5rIHdpdGggc29tZSBrZXlib2FyZCBhY3Rpb24uXG4gICAgICAgICAgICAvLyBCcm93c2VyIGluIHN1Y2ggYSBjYXNlIHRyaWVzIHRvIHNjcm9sbCB0aGUgcGFnZSB0byBtYWtlIHRoaXMgZWxlbWVudCB2aXNpYmxlXG4gICAgICAgICAgICAvLyAoZXZlbiB0aGF0IGJvZHkgb3ZlcmZsb3cgaXMgc2V0IHRvIGhpZGRlbikgYW5kIGl0IGJyZWFrcyBvdXIgY2FyZWZ1bCBwb3NpdGlvbmluZy5cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBTbywgYXMgYSBsb3VzeSAoYW5kIGxhenkpIHdvcmthcm91bmQgd2Ugd2lsbCBtYWtlIHRoZSBwYWdlIHNjcm9sbCBiYWNrIHRvIHRoZSB0b3BcbiAgICAgICAgICAgIC8vIHdoZW5ldmVyIHNsaWRlIGlzIHNlbGVjdGVkXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gSWYgeW91IGFyZSByZWFkaW5nIHRoaXMgYW5kIGtub3cgYW55IGJldHRlciB3YXkgdG8gaGFuZGxlIGl0LCBJJ2xsIGJlIGdsYWQgdG8gaGVhciBhYm91dCBpdCFcbiAgICAgICAgICAgIHdpbmRvdy5zY3JvbGxUbygwLCAwKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIHN0ZXAgPSBzdGVwc0RhdGFbXCJpbXByZXNzLVwiICsgZWwuaWRdO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoIGFjdGl2ZVN0ZXAgKSB7XG4gICAgICAgICAgICAgICAgYWN0aXZlU3RlcC5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xuICAgICAgICAgICAgICAgIGJvZHkuY2xhc3NMaXN0LnJlbW92ZShcImltcHJlc3Mtb24tXCIgKyBhY3RpdmVTdGVwLmlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoXCJhY3RpdmVcIik7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGJvZHkuY2xhc3NMaXN0LmFkZChcImltcHJlc3Mtb24tXCIgKyBlbC5pZCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIGNvbXB1dGUgdGFyZ2V0IHN0YXRlIG9mIHRoZSBjYW52YXMgYmFzZWQgb24gZ2l2ZW4gc3RlcFxuICAgICAgICAgICAgdmFyIHRhcmdldCA9IHtcbiAgICAgICAgICAgICAgICByb3RhdGU6IHtcbiAgICAgICAgICAgICAgICAgICAgeDogLXN0ZXAucm90YXRlLngsXG4gICAgICAgICAgICAgICAgICAgIHk6IC1zdGVwLnJvdGF0ZS55LFxuICAgICAgICAgICAgICAgICAgICB6OiAtc3RlcC5yb3RhdGUuelxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdHJhbnNsYXRlOiB7XG4gICAgICAgICAgICAgICAgICAgIHg6IC1zdGVwLnRyYW5zbGF0ZS54LFxuICAgICAgICAgICAgICAgICAgICB5OiAtc3RlcC50cmFuc2xhdGUueSxcbiAgICAgICAgICAgICAgICAgICAgejogLXN0ZXAudHJhbnNsYXRlLnpcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNjYWxlOiAxIC8gc3RlcC5zY2FsZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIHRyYW5zaXRpb24gaXMgem9vbWluZyBpbiBvciBub3QuXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gVGhpcyBpbmZvcm1hdGlvbiBpcyB1c2VkIHRvIGFsdGVyIHRoZSB0cmFuc2l0aW9uIHN0eWxlOlxuICAgICAgICAgICAgLy8gd2hlbiB3ZSBhcmUgem9vbWluZyBpbiAtIHdlIHN0YXJ0IHdpdGggbW92ZSBhbmQgcm90YXRlIHRyYW5zaXRpb25cbiAgICAgICAgICAgIC8vIGFuZCB0aGUgc2NhbGluZyBpcyBkZWxheWVkLCBidXQgd2hlbiB3ZSBhcmUgem9vbWluZyBvdXQgd2Ugc3RhcnRcbiAgICAgICAgICAgIC8vIHdpdGggc2NhbGluZyBkb3duIGFuZCBtb3ZlIGFuZCByb3RhdGlvbiBhcmUgZGVsYXllZC5cbiAgICAgICAgICAgIHZhciB6b29taW4gPSB0YXJnZXQuc2NhbGUgPj0gY3VycmVudFN0YXRlLnNjYWxlO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBkdXJhdGlvbiA9IHRvTnVtYmVyKGR1cmF0aW9uLCBjb25maWcudHJhbnNpdGlvbkR1cmF0aW9uKTtcbiAgICAgICAgICAgIHZhciBkZWxheSA9IChkdXJhdGlvbiAvIDIpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBpZiB0aGUgc2FtZSBzdGVwIGlzIHJlLXNlbGVjdGVkLCBmb3JjZSBjb21wdXRpbmcgd2luZG93IHNjYWxpbmcsXG4gICAgICAgICAgICAvLyBiZWNhdXNlIGl0IGlzIGxpa2VseSB0byBiZSBjYXVzZWQgYnkgd2luZG93IHJlc2l6ZVxuICAgICAgICAgICAgaWYgKGVsID09PSBhY3RpdmVTdGVwKSB7XG4gICAgICAgICAgICAgICAgd2luZG93U2NhbGUgPSBjb21wdXRlV2luZG93U2NhbGUoY29uZmlnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIHRhcmdldFNjYWxlID0gdGFyZ2V0LnNjYWxlICogd2luZG93U2NhbGU7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vLy8gdHJpZ2dlciBsZWF2ZSBvZiBjdXJyZW50bHkgYWN0aXZlIGVsZW1lbnQgKGlmIGl0J3Mgbm90IHRoZSBzYW1lIHN0ZXAgYWdhaW4pXG4gICAgICAgICAgICAvL2lmIChhY3RpdmVTdGVwICYmIGFjdGl2ZVN0ZXAgIT09IGVsKSB7XG4gICAgICAgICAgICAvLyAgICBvblN0ZXBHb3RvKGVsKTtcbiAgICAgICAgICAgIC8vICAgIG9uU3RlcExlYXZlKGFjdGl2ZVN0ZXApO1xuICAgICAgICAgICAgLy99XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIE5vdyB3ZSBhbHRlciB0cmFuc2Zvcm1zIG9mIGByb290YCBhbmQgYGNhbnZhc2AgdG8gdHJpZ2dlciB0cmFuc2l0aW9ucy5cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBBbmQgaGVyZSBpcyB3aHkgdGhlcmUgYXJlIHR3byBlbGVtZW50czogYHJvb3RgIGFuZCBgY2FudmFzYCAtIHRoZXkgYXJlXG4gICAgICAgICAgICAvLyBiZWluZyBhbmltYXRlZCBzZXBhcmF0ZWx5OlxuICAgICAgICAgICAgLy8gYHJvb3RgIGlzIHVzZWQgZm9yIHNjYWxpbmcgYW5kIGBjYW52YXNgIGZvciB0cmFuc2xhdGUgYW5kIHJvdGF0aW9ucy5cbiAgICAgICAgICAgIC8vIFRyYW5zaXRpb25zIG9uIHRoZW0gYXJlIHRyaWdnZXJlZCB3aXRoIGRpZmZlcmVudCBkZWxheXMgKHRvIG1ha2VcbiAgICAgICAgICAgIC8vIHZpc3VhbGx5IG5pY2UgYW5kICduYXR1cmFsJyBsb29raW5nIHRyYW5zaXRpb25zKSwgc28gd2UgbmVlZCB0byBrbm93XG4gICAgICAgICAgICAvLyB0aGF0IGJvdGggb2YgdGhlbSBhcmUgZmluaXNoZWQuXG4gICAgICAgICAgICBjc3Mocm9vdCwge1xuICAgICAgICAgICAgICAgIC8vIHRvIGtlZXAgdGhlIHBlcnNwZWN0aXZlIGxvb2sgc2ltaWxhciBmb3IgZGlmZmVyZW50IHNjYWxlc1xuICAgICAgICAgICAgICAgIC8vIHdlIG5lZWQgdG8gJ3NjYWxlJyB0aGUgcGVyc3BlY3RpdmUsIHRvb1xuICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogcGVyc3BlY3RpdmUoIGNvbmZpZy5wZXJzcGVjdGl2ZSAvIHRhcmdldFNjYWxlICkgKyBzY2FsZSggdGFyZ2V0U2NhbGUgKSxcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uRHVyYXRpb246IGR1cmF0aW9uICsgXCJtc1wiLFxuICAgICAgICAgICAgICAgIHRyYW5zaXRpb25EZWxheTogKHpvb21pbiA/IGRlbGF5IDogMCkgKyBcIm1zXCJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjc3MoY2FudmFzLCB7XG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUodGFyZ2V0LnJvdGF0ZSwgdHJ1ZSkgKyB0cmFuc2xhdGUodGFyZ2V0LnRyYW5zbGF0ZSksXG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbkR1cmF0aW9uOiBkdXJhdGlvbiArIFwibXNcIixcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uRGVsYXk6ICh6b29taW4gPyAwIDogZGVsYXkpICsgXCJtc1wiXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gSGVyZSBpcyBhIHRyaWNreSBwYXJ0Li4uXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gSWYgdGhlcmUgaXMgbm8gY2hhbmdlIGluIHNjYWxlIG9yIG5vIGNoYW5nZSBpbiByb3RhdGlvbiBhbmQgdHJhbnNsYXRpb24sIGl0IG1lYW5zIHRoZXJlIHdhcyBhY3R1YWxseVxuICAgICAgICAgICAgLy8gbm8gZGVsYXkgLSBiZWNhdXNlIHRoZXJlIHdhcyBubyB0cmFuc2l0aW9uIG9uIGByb290YCBvciBgY2FudmFzYCBlbGVtZW50cy5cbiAgICAgICAgICAgIC8vIFdlIHdhbnQgdG8gdHJpZ2dlciBgaW1wcmVzczpzdGVwZW50ZXJgIGV2ZW50IGluIHRoZSBjb3JyZWN0IG1vbWVudCwgc28gaGVyZSB3ZSBjb21wYXJlIHRoZSBjdXJyZW50XG4gICAgICAgICAgICAvLyBhbmQgdGFyZ2V0IHZhbHVlcyB0byBjaGVjayBpZiBkZWxheSBzaG91bGQgYmUgdGFrZW4gaW50byBhY2NvdW50LlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIEkga25vdyB0aGF0IHRoaXMgYGlmYCBzdGF0ZW1lbnQgbG9va3Mgc2NhcnksIGJ1dCBpdCdzIHByZXR0eSBzaW1wbGUgd2hlbiB5b3Uga25vdyB3aGF0IGlzIGdvaW5nIG9uXG4gICAgICAgICAgICAvLyAtIGl0J3Mgc2ltcGx5IGNvbXBhcmluZyBhbGwgdGhlIHZhbHVlcy5cbiAgICAgICAgICAgIGlmICggY3VycmVudFN0YXRlLnNjYWxlID09PSB0YXJnZXQuc2NhbGUgfHxcbiAgICAgICAgICAgICAgICAoY3VycmVudFN0YXRlLnJvdGF0ZS54ID09PSB0YXJnZXQucm90YXRlLnggJiYgY3VycmVudFN0YXRlLnJvdGF0ZS55ID09PSB0YXJnZXQucm90YXRlLnkgJiZcbiAgICAgICAgICAgICAgICAgY3VycmVudFN0YXRlLnJvdGF0ZS56ID09PSB0YXJnZXQucm90YXRlLnogJiYgY3VycmVudFN0YXRlLnRyYW5zbGF0ZS54ID09PSB0YXJnZXQudHJhbnNsYXRlLnggJiZcbiAgICAgICAgICAgICAgICAgY3VycmVudFN0YXRlLnRyYW5zbGF0ZS55ID09PSB0YXJnZXQudHJhbnNsYXRlLnkgJiYgY3VycmVudFN0YXRlLnRyYW5zbGF0ZS56ID09PSB0YXJnZXQudHJhbnNsYXRlLnopICkge1xuICAgICAgICAgICAgICAgIGRlbGF5ID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gc3RvcmUgY3VycmVudCBzdGF0ZVxuICAgICAgICAgICAgY3VycmVudFN0YXRlID0gdGFyZ2V0O1xuICAgICAgICAgICAgYWN0aXZlU3RlcCA9IGVsO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBBbmQgaGVyZSBpcyB3aGVyZSB3ZSB0cmlnZ2VyIGBpbXByZXNzOnN0ZXBlbnRlcmAgZXZlbnQuXG4gICAgICAgICAgICAvLyBXZSBzaW1wbHkgc2V0IHVwIGEgdGltZW91dCB0byBmaXJlIGl0IHRha2luZyB0cmFuc2l0aW9uIGR1cmF0aW9uIChhbmQgcG9zc2libGUgZGVsYXkpIGludG8gYWNjb3VudC5cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBJIHJlYWxseSB3YW50ZWQgdG8gbWFrZSBpdCBpbiBtb3JlIGVsZWdhbnQgd2F5LiBUaGUgYHRyYW5zaXRpb25lbmRgIGV2ZW50IHNlZW1lZCB0byBiZSB0aGUgYmVzdCB3YXlcbiAgICAgICAgICAgIC8vIHRvIGRvIGl0LCBidXQgdGhlIGZhY3QgdGhhdCBJJ20gdXNpbmcgdHJhbnNpdGlvbnMgb24gdHdvIHNlcGFyYXRlIGVsZW1lbnRzIGFuZCB0aGF0IHRoZSBgdHJhbnNpdGlvbmVuZGBcbiAgICAgICAgICAgIC8vIGV2ZW50IGlzIG9ubHkgdHJpZ2dlcmVkIHdoZW4gdGhlcmUgd2FzIGEgdHJhbnNpdGlvbiAoY2hhbmdlIGluIHRoZSB2YWx1ZXMpIGNhdXNlZCBzb21lIGJ1Z3MgYW5kIFxuICAgICAgICAgICAgLy8gbWFkZSB0aGUgY29kZSByZWFsbHkgY29tcGxpY2F0ZWQsIGNhdXNlIEkgaGFkIHRvIGhhbmRsZSBhbGwgdGhlIGNvbmRpdGlvbnMgc2VwYXJhdGVseS4gQW5kIGl0IHN0aWxsXG4gICAgICAgICAgICAvLyBuZWVkZWQgYSBgc2V0VGltZW91dGAgZmFsbGJhY2sgZm9yIHRoZSBzaXR1YXRpb25zIHdoZW4gdGhlcmUgaXMgbm8gdHJhbnNpdGlvbiBhdCBhbGwuXG4gICAgICAgICAgICAvLyBTbyBJIGRlY2lkZWQgdGhhdCBJJ2QgcmF0aGVyIG1ha2UgdGhlIGNvZGUgc2ltcGxlciB0aGFuIHVzZSBzaGlueSBuZXcgYHRyYW5zaXRpb25lbmRgLlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIElmIHlvdSB3YW50IGxlYXJuIHNvbWV0aGluZyBpbnRlcmVzdGluZyBhbmQgc2VlIGhvdyBpdCB3YXMgZG9uZSB3aXRoIGB0cmFuc2l0aW9uZW5kYCBnbyBiYWNrIHRvXG4gICAgICAgICAgICAvLyB2ZXJzaW9uIDAuNS4yIG9mIGltcHJlc3MuanM6IGh0dHA6Ly9naXRodWIuY29tL2JhcnRhei9pbXByZXNzLmpzL2Jsb2IvMC41LjIvanMvaW1wcmVzcy5qc1xuICAgICAgICAgICAgd2luZG93LmNsZWFyVGltZW91dChzdGVwRW50ZXJUaW1lb3V0KTtcbiAgICAgICAgICAgIHN0ZXBFbnRlclRpbWVvdXQgPSB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBvblN0ZXBFbnRlcihhY3RpdmVTdGVwKTtcbiAgICAgICAgICAgIH0sIGR1cmF0aW9uICsgZGVsYXkpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gZWw7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy9QQVRDSCBmb3IgU1VCU1RFUFNcbiAgICB2YXIgZm9yRWFjaCA9IEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLFxuICAgICAgICBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZSxcbiAgICAgICAgaXNBcnJheSA9IEFycmF5LmlzQXJyYXk7XG4gICAgICAgIFxuICAgIHZhciByZW1vdmVDbGFzcyA9IGZ1bmN0aW9uIChlbG0sIGNsYXNzTmFtZSkge1xuICAgIGlmIChlbG0uY2xhc3NMaXN0KSB7XG4gICAgICAgICAgICBlbG0uY2xhc3NMaXN0LnJlbW92ZShjbGFzc05hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoIWVsbSB8fCAhZWxtLmNsYXNzTmFtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciByZWdleHAgPSBuZXcgUmVnRXhwKFwiKF58XFxcXHMpXCIgKyBjbGFzc05hbWUgKyBcIihcXFxcc3wkKVwiLCBcImdcIik7XG4gICAgICAgICAgICBlbG0uY2xhc3NOYW1lID0gZWxtLmNsYXNzTmFtZS5yZXBsYWNlKHJlZ2V4cCwgXCIkMlwiKTtcbiAgICB9XG4gICAgfVxuICAgIFxuIFxuICAgIHZhciBzZXRQcmV2aW91cyA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIGlmIChpc0FycmF5KGRhdGEpKSB7XG4gICAgICAgICAgICBkYXRhLmZvckVhY2goc2V0UHJldmlvdXMpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vcmVtb3ZlQ2xhc3MoZGF0YSwnYWN0aXZlJyk7XG4gICAgICAgIC8vZGF0YS5jbGFzc05hbWUgPSBkYXRhLmNsYXNzTmFtZSArICcgcHJldmlvdXMnO1xuICAgICAgICBkYXRhLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgICAgICBkYXRhLmNsYXNzTGlzdC5hZGQoJ3ByZXZpb3VzJyk7XG4gICAgfTtcblxuICAgIHZhciBzZXRBY3RpdmUgPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICBpZiAoaXNBcnJheShkYXRhKSkge1xuICAgICAgICAgICAgZGF0YS5mb3JFYWNoKHNldEFjdGl2ZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy9yZW1vdmVDbGFzcyhkYXRhLCdwcmV2aW91cycpO1xuICAgICAgICAvL2RhdGEuY2xhc3NOYW1lID0gZGF0YS5jbGFzc05hbWUgKyAnIGFjdGl2ZSc7XG4gICAgICAgIGRhdGEuY2xhc3NMaXN0LnJlbW92ZSgncHJldmlvdXMnKTtcbiAgICAgICAgZGF0YS5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICB9O1xuXG4gICAgdmFyIGNsZWFyU3ViID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgaWYgKGlzQXJyYXkoZGF0YSkpIHtcbiAgICAgICAgICAgIGRhdGEuZm9yRWFjaChjbGVhclN1Yik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy9yZW1vdmVDbGFzcyhkYXRhLCdwcmV2aW91cycpO1xuICAgICAgICAvL3JlbW92ZUNsYXNzKGRhdGEsJ2FjdGl2ZScpO1xuICAgICAgICBkYXRhLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgICAgICBkYXRhLmNsYXNzTGlzdC5yZW1vdmUoJ3ByZXZpb3VzJyk7XG4gICAgfTtcblxuXG4gICAgdmFyIG9uU3RlcEdvdG9TdWIgPSBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgdHJpZ2dlckV2ZW50KGFjdGl2ZVN0ZXAsIFwiaW1wcmVzczpzdGVwZ290b3N1YlwiLCB7XCJpbmRleFwiOiBpbmRleH0pO1xuICAgIH07XG5cbiAgICB2YXIgZW1pdEdvdG9TdWIgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAvL1RPRE86IGNoZWNrIGlmIGluZGV4IGlzIHZhbGlkXG4gICAgICAgICAgICBpZiAoICFpbml0aWFsaXplZCApIHtcbiAgICAgICAgICAgICAgICAvLyBwcmVzZW50YXRpb24gbm90IGluaXRpYWxpemVkIFxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy9UT0RPOiBjaGVjayBpZiB3ZSBuZWVkIGEgc2ltaWxhciBjaGVjayBmb3Igc3Vic3RlcHNcbiAgICAgICAgICAgIC8vIHRyaWdnZXIgbGVhdmUgb2YgY3VycmVudGx5IGFjdGl2ZSBlbGVtZW50IChpZiBpdCdzIG5vdCB0aGUgc2FtZSBzdGVwIGFnYWluKVxuICAgICAgICAgICAgLy8gaWYgKGFjdGl2ZVN0ZXAgJiYgYWN0aXZlU3RlcCAhPT0gZWwpIHtcbiAgICAgICAgICAgIC8vICAgICBvblN0ZXBHb3RvKGVsKTtcbiAgICAgICAgICAgIC8vICAgICBvblN0ZXBMZWF2ZShhY3RpdmVTdGVwKTtcbiAgICAgICAgICAgIC8vIH1cblxuICAgICAgICAgICAgb25TdGVwR290b1N1YihpbmRleClcbiAgICAgICAgfVxuXG5cbiAgICAvLyBgZ290b1N1YmAgQVBJIGZ1bmN0aW9uIHRoYXQgbW92ZXMgdG8gc3Vic3RlcCBnaXZlbiB3aXRoIGBpbmRleGAgcGFyYW1ldGVyLlxuICAgIHZhciBnb3RvU3ViID0gZnVuY3Rpb24oaW5kZXgpe1xuXG4gICAgICAgIHZhciBhY3RpdmUgPSBhY3RpdmVTdGVwO1xuICAgICAgICBcbiAgICAgICAgdmFyIHN1YmFjdGl2ZSwgc3ViU3RlcHM7XG4gICAgICAgIFxuICAgICAgICBpZiAoIWFjdGl2ZS5zdWJTdGVwcykge1xuICAgICAgICAgICAgc2V0U3ViU3RlcHMoYWN0aXZlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN1YlN0ZXBzID0gYWN0aXZlLnN1YlN0ZXBzO1xuXG4gICAgICAgIC8vaWYgaW5kZXggaXMgbnVsbCB0aGVuIHdlIGdvdCB0aGlzIGZyb20gYSBwcmV2IGFjdGlvblxuICAgICAgICAvLyBhbmQgd2UgaGF2ZSB0byBwcmVwYXJlIHRoZSBwcmV2aW91cyBzdGVwXG4gICAgICAgIGlmKGluZGV4ID09PSBudWxsKXtcbiAgICAgICAgICAgIHByZXYgPSBzdGVwcy5pbmRleE9mKCBhY3RpdmUgKSAtIDE7XG4gICAgICAgICAgICBwcmV2ID0gcHJldiA+PSAwID8gc3RlcHNbIHByZXYgXSA6IHN0ZXBzWyBzdGVwcy5sZW5ndGgtMSBdO1xuICAgICAgICAgICAgaWYgKCFwcmV2LnN1YlN0ZXBzKSB7XG4gICAgICAgICAgICAgICAgc2V0U3ViU3RlcHMocHJldik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocHJldi5zdWJTdGVwcy5sZW5ndGggJiZcbiAgICAgICAgICAgICAgICAocHJldi5zdWJTdGVwcy5hY3RpdmUgIT09IChwcmV2LnN1YlN0ZXBzLmxlbmd0aCAtIDEpKSkge1xuICAgICAgICAgICAgICAgIHNsaWNlLmNhbGwocHJldi5zdWJTdGVwcywgMCwgLTEpLmZvckVhY2goc2V0UHJldmlvdXMpO1xuICAgICAgICAgICAgICAgIHNldEFjdGl2ZShwcmV2LnN1YlN0ZXBzW3ByZXYuc3ViU3RlcHMubGVuZ3RoIC0gMV0pO1xuICAgICAgICAgICAgICAgIHByZXYuc3ViU3RlcHMuYWN0aXZlID0gcHJldi5zdWJTdGVwcy5sZW5ndGggLSAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3ViU3RlcHMubGVuZ3RoICYmIChpbmRleCA+PSAwKSAmJiAoaW5kZXggPD0gKHN1YlN0ZXBzLmxlbmd0aCAtIDEpKSkge1xuXG4gICAgICAgICAgICAvL3NldCBwcmV2aW91cyBzdWJzdGVwcyB0byBoYXZlIHRoZSBjbGFzcyAncHJldmlvdXMnXG4gICAgICAgICAgICBpZihpbmRleCl7XG4gICAgICAgICAgICAgICAgc2xpY2UuY2FsbChzdWJTdGVwcywgMCwgaW5kZXgpLmZvckVhY2goc2V0UHJldmlvdXMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL2NsZWFyIG5leHQgc3ViU3RlcHNcbiAgICAgICAgICAgIGlmKGluZGV4IDwgKHN1YlN0ZXBzLmxlbmd0aCAtIDEpICl7XG4gICAgICAgICAgICAgICAgc2xpY2UuY2FsbChzdWJTdGVwcywgaW5kZXgpLmZvckVhY2goY2xlYXJTdWIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL2lmIHdlIGFyZSBvbiB0aGUgbGFzdCBzdWJzdGVwIHdlIGhhdmUgdG8gcHJlcGFyZSB0aGUgbmV4dCBzdGVwXG4gICAgICAgICAgICBpZihpbmRleCA9PSAoc3ViU3RlcHMubGVuZ3RoIC0gMSkpe1xuICAgICAgICAgICAgICAgIG5leHQgPSBzdGVwcy5pbmRleE9mKCBhY3RpdmUgKSArIDE7XG4gICAgICAgICAgICAgICAgbmV4dCA9IG5leHQgPCBzdGVwcy5sZW5ndGggPyBzdGVwc1sgbmV4dCBdIDogc3RlcHNbIDAgXTtcbiAgICAgICAgICAgICAgICBpZiAoIW5leHQuc3ViU3RlcHMpIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0U3ViU3RlcHMobmV4dCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChuZXh0LnN1YlN0ZXBzLmFjdGl2ZSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvckVhY2guY2FsbChuZXh0LnN1YlN0ZXBzLCBjbGVhclN1Yik7XG4gICAgICAgICAgICAgICAgICAgIG5leHQuc3ViU3RlcHMuYWN0aXZlID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vc2V0IGFjdGl2ZVxuICAgICAgICAgICAgaWYoaW5kZXggIT0gbnVsbCApe1xuICAgICAgICAgICAgICAgIHNldEFjdGl2ZShzdWJTdGVwc1tpbmRleF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3ViU3RlcHMuYWN0aXZlID0gaW5kZXg7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiBcbiAgICB2YXIgbmV4dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGFjdGl2ZSA9IGFjdGl2ZVN0ZXA7XG4gICAgICAgIFxuICAgICAgICB2YXIgc3ViYWN0aXZlLCBuZXh0LCBzdWJTdGVwcztcbiAgICAgICAgXG4gICAgICAgIGlmICghYWN0aXZlLnN1YlN0ZXBzKSB7XG4gICAgICAgICAgICBzZXRTdWJTdGVwcyhhY3RpdmUpO1xuICAgICAgICB9XG4gICAgICAgIHN1YlN0ZXBzID0gYWN0aXZlLnN1YlN0ZXBzO1xuXG4gICAgICAgIC8vaWYgd2UgaGF2ZSBzdWJzdGVwcyBkZWFsIHdpdGggdGhlbSBmaXJzdFxuICAgICAgICBpZiAoc3ViU3RlcHMubGVuZ3RoICYmICgoc3ViYWN0aXZlID0gc3ViU3RlcHMuYWN0aXZlKSAhPT0gKHN1YlN0ZXBzLmxlbmd0aCAtIDEpKSkge1xuICAgICAgICAgICAgaWYoaXNOYU4oc3ViYWN0aXZlKSB8fCAoc3ViYWN0aXZlPT1udWxsKSl7XG4gICAgICAgICAgICAgICAgc3ViYWN0aXZlID0gLTE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL3JldHVybiBnb3RvU3ViKCsrc3ViYWN0aXZlKVxuICAgICAgICAgICAgcmV0dXJuIGVtaXRHb3RvU3ViKCsrc3ViYWN0aXZlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG5leHQgPSBzdGVwcy5pbmRleE9mKCBhY3RpdmUgKSArIDE7XG4gICAgICAgIG5leHQgPSBuZXh0IDwgc3RlcHMubGVuZ3RoID8gc3RlcHNbIG5leHQgXSA6IHN0ZXBzWyAwIF07XG4gICAgICAgXG4gICAgICAgIC8vcmV0dXJuIGdvdG8obmV4dCk7XG4gICAgICAgIHJldHVybiBlbWl0R290byhuZXh0KTtcbiAgICB9O1xuIFxuICAgIHZhciBwcmV2ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgYWN0aXZlID0gYWN0aXZlU3RlcDtcbiAgICAgICAgXG4gICAgICAgIHZhciBzdWJhY3RpdmUsIG5leHQsIHN1YlN0ZXBzO1xuICAgICAgICBpZiAoIWFjdGl2ZS5zdWJTdGVwcykge1xuICAgICAgICAgICAgc2V0U3ViU3RlcHMoYWN0aXZlKTtcbiAgICAgICAgfVxuICAgICAgICBzdWJTdGVwcyA9IGFjdGl2ZS5zdWJTdGVwcztcbiAgICAgICAgLy9pZiB3ZSBoYXZlIHN1YnN0ZXBzIGRlYWwgd2l0aCB0aGVtIGZpcnN0XG4gICAgICAgIGlmIChzdWJTdGVwcy5sZW5ndGggJiYgKChzdWJhY3RpdmUgPSBzdWJTdGVwcy5hY3RpdmUpIHx8IChzdWJhY3RpdmUgPT09IDApKSkge1xuICAgICAgICAgICAgaWYgKHN1YmFjdGl2ZSkge1xuICAgICAgICAgICAgICAgIC0tc3ViYWN0aXZlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzdWJhY3RpdmUgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGVtaXRHb3RvU3ViKHN1YmFjdGl2ZSk7XG4gICAgICAgICAgICAvL3JldHVybiBnb3RvU3ViKHN1YmFjdGl2ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcmV2ID0gc3RlcHMuaW5kZXhPZiggYWN0aXZlICkgLSAxO1xuICAgICAgICBwcmV2ID0gcHJldiA+PSAwID8gc3RlcHNbIHByZXYgXSA6IHN0ZXBzWyBzdGVwcy5sZW5ndGgtMSBdO1xuXG4gICAgICAgIC8vcmV0dXJuIGdvdG8ocHJldik7XG4gICAgICAgIHJldHVybiBlbWl0R290byhwcmV2KTtcbiAgICB9O1xuIFxuICAgICB2YXIgc2V0U3ViU3RlcHMgPSBmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgdmFyIHN0ZXBzID0gZWwucXVlcnlTZWxlY3RvckFsbChcIi5zdWJzdGVwXCIpLFxuICAgICAgICBvcmRlciA9IFtdLCB1bm9yZGVyZWQgPSBbXTtcbiAgICAgICAgZm9yRWFjaC5jYWxsKHN0ZXBzLCBmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgIGlmIChlbC5kYXRhc2V0KSB7XG4gICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gTnVtYmVyKGVsLmRhdGFzZXQub3JkZXIpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmICghaXNOYU4oaW5kZXgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghb3JkZXJbaW5kZXhdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcmRlcltpbmRleF0gPSBlbDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KG9yZGVyW2luZGV4XSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9yZGVyW2luZGV4XS5wdXNoKGVsKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9yZGVyW2luZGV4XSA9IFtvcmRlcltpbmRleF0sIGVsXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHVub3JkZXJlZC5wdXNoKGVsKTtcbiAgICAgICAgICAgICAgICB9IFxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgIHVub3JkZXJlZC5wdXNoKGVsKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGVsLnN1YlN0ZXBzID0gb3JkZXIuZmlsdGVyKEJvb2xlYW4pLmNvbmNhdCh1bm9yZGVyZWQpO1xuICAgIH07XG4gXG4gLy9FTkQgUEFUQ0ggICAgICAgXG4gICAgICAgIFxuICAgICAgICAvLyBBZGRpbmcgc29tZSB1c2VmdWwgY2xhc3NlcyB0byBzdGVwIGVsZW1lbnRzLlxuICAgICAgICAvL1xuICAgICAgICAvLyBBbGwgdGhlIHN0ZXBzIHRoYXQgaGF2ZSBub3QgYmVlbiBzaG93biB5ZXQgYXJlIGdpdmVuIGBmdXR1cmVgIGNsYXNzLlxuICAgICAgICAvLyBXaGVuIHRoZSBzdGVwIGlzIGVudGVyZWQgdGhlIGBmdXR1cmVgIGNsYXNzIGlzIHJlbW92ZWQgYW5kIHRoZSBgcHJlc2VudGBcbiAgICAgICAgLy8gY2xhc3MgaXMgZ2l2ZW4uIFdoZW4gdGhlIHN0ZXAgaXMgbGVmdCBgcHJlc2VudGAgY2xhc3MgaXMgcmVwbGFjZWQgd2l0aFxuICAgICAgICAvLyBgcGFzdGAgY2xhc3MuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFNvIGV2ZXJ5IHN0ZXAgZWxlbWVudCBpcyBhbHdheXMgaW4gb25lIG9mIHRocmVlIHBvc3NpYmxlIHN0YXRlczpcbiAgICAgICAgLy8gYGZ1dHVyZWAsIGBwcmVzZW50YCBhbmQgYHBhc3RgLlxuICAgICAgICAvL1xuICAgICAgICAvLyBUaGVyZSBjbGFzc2VzIGNhbiBiZSB1c2VkIGluIENTUyB0byBzdHlsZSBkaWZmZXJlbnQgdHlwZXMgb2Ygc3RlcHMuXG4gICAgICAgIC8vIEZvciBleGFtcGxlIHRoZSBgcHJlc2VudGAgY2xhc3MgY2FuIGJlIHVzZWQgdG8gdHJpZ2dlciBzb21lIGN1c3RvbVxuICAgICAgICAvLyBhbmltYXRpb25zIHdoZW4gc3RlcCBpcyBzaG93bi5cbiAgICAgICAgcm9vdC5hZGRFdmVudExpc3RlbmVyKFwiaW1wcmVzczppbml0XCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAvLyBTVEVQIENMQVNTRVNcbiAgICAgICAgICAgIHN0ZXBzLmZvckVhY2goZnVuY3Rpb24gKHN0ZXApIHtcbiAgICAgICAgICAgICAgICBzdGVwLmNsYXNzTGlzdC5hZGQoXCJmdXR1cmVcIik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcm9vdC5hZGRFdmVudExpc3RlbmVyKFwiaW1wcmVzczpzdGVwZW50ZXJcIiwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUoXCJwYXN0XCIpO1xuICAgICAgICAgICAgICAgIGV2ZW50LnRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKFwiZnV0dXJlXCIpO1xuICAgICAgICAgICAgICAgIGV2ZW50LnRhcmdldC5jbGFzc0xpc3QuYWRkKFwicHJlc2VudFwiKTtcbiAgICAgICAgICAgIH0sIGZhbHNlKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcm9vdC5hZGRFdmVudExpc3RlbmVyKFwiaW1wcmVzczpzdGVwbGVhdmVcIiwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUoXCJwcmVzZW50XCIpO1xuICAgICAgICAgICAgICAgIGV2ZW50LnRhcmdldC5jbGFzc0xpc3QuYWRkKFwicGFzdFwiKTtcbiAgICAgICAgICAgIH0sIGZhbHNlKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9LCBmYWxzZSk7XG4gICAgICAgIFxuICAgICAgICAvLyBBZGRpbmcgaGFzaCBjaGFuZ2Ugc3VwcG9ydC5cbiAgICAgICAgcm9vdC5hZGRFdmVudExpc3RlbmVyKFwiaW1wcmVzczppbml0XCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIGxhc3QgaGFzaCBkZXRlY3RlZFxuICAgICAgICAgICAgdmFyIGxhc3RIYXNoID0gXCJcIjtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gYCMvc3RlcC1pZGAgaXMgdXNlZCBpbnN0ZWFkIG9mIGAjc3RlcC1pZGAgdG8gcHJldmVudCBkZWZhdWx0IGJyb3dzZXJcbiAgICAgICAgICAgIC8vIHNjcm9sbGluZyB0byBlbGVtZW50IGluIGhhc2guXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gQW5kIGl0IGhhcyB0byBiZSBzZXQgYWZ0ZXIgYW5pbWF0aW9uIGZpbmlzaGVzLCBiZWNhdXNlIGluIENocm9tZSBpdFxuICAgICAgICAgICAgLy8gbWFrZXMgdHJhbnN0aW9uIGxhZ2d5LlxuICAgICAgICAgICAgLy8gQlVHOiBodHRwOi8vY29kZS5nb29nbGUuY29tL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD02MjgyMFxuICAgICAgICAgICAgcm9vdC5hZGRFdmVudExpc3RlbmVyKFwiaW1wcmVzczpzdGVwZW50ZXJcIiwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSBsYXN0SGFzaCA9IFwiIy9cIiArIGV2ZW50LnRhcmdldC5pZDtcbiAgICAgICAgICAgIH0sIGZhbHNlKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJoYXNoY2hhbmdlXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAvLyBXaGVuIHRoZSBzdGVwIGlzIGVudGVyZWQgaGFzaCBpbiB0aGUgbG9jYXRpb24gaXMgdXBkYXRlZFxuICAgICAgICAgICAgICAgIC8vIChqdXN0IGZldyBsaW5lcyBhYm92ZSBmcm9tIGhlcmUpLCBzbyB0aGUgaGFzaCBjaGFuZ2UgaXMgXG4gICAgICAgICAgICAgICAgLy8gdHJpZ2dlcmVkIGFuZCB3ZSB3b3VsZCBjYWxsIGBnb3RvYCBhZ2FpbiBvbiB0aGUgc2FtZSBlbGVtZW50LlxuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgLy8gVG8gYXZvaWQgdGhpcyB3ZSBzdG9yZSBsYXN0IGVudGVyZWQgaGFzaCBhbmQgY29tcGFyZS5cbiAgICAgICAgICAgICAgICBpZiAod2luZG93LmxvY2F0aW9uLmhhc2ggIT09IGxhc3RIYXNoKSB7XG4gICAgICAgICAgICAgICAgICAgIGVtaXRHb3RvKCBnZXRFbGVtZW50RnJvbUhhc2goKSApO1xuICAgICAgICAgICAgICAgICAgICAvL2dvdG8oIGdldEVsZW1lbnRGcm9tSGFzaCgpICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgZmFsc2UpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBTVEFSVCBcbiAgICAgICAgICAgIC8vIGJ5IHNlbGVjdGluZyBzdGVwIGRlZmluZWQgaW4gdXJsIG9yIGZpcnN0IHN0ZXAgb2YgdGhlIHByZXNlbnRhdGlvblxuICAgICAgICAgICAgZ290byhnZXRFbGVtZW50RnJvbUhhc2goKSB8fCBzdGVwc1swXSwgMCk7XG4gICAgICAgIH0sIGZhbHNlKTtcbiAgICAgICAgXG4gICAgICAgIGJvZHkuY2xhc3NMaXN0LmFkZChcImltcHJlc3MtZGlzYWJsZWRcIik7XG4gICAgICAgIFxuICAgICAgICAvLyBzdG9yZSBhbmQgcmV0dXJuIEFQSSBmb3IgZ2l2ZW4gaW1wcmVzcy5qcyByb290IGVsZW1lbnRcbiAgICAgICAgcmV0dXJuIChyb290c1sgXCJpbXByZXNzLXJvb3QtXCIgKyByb290SWQgXSA9IHtcbiAgICAgICAgICAgIGluaXQ6IGluaXQsXG4gICAgICAgICAgICBzdGFydDogc3RhcnQsXG4gICAgICAgICAgICBnb3RvOiBnb3RvLFxuICAgICAgICAgICAgZ290b1N1YjogZ290b1N1YixcbiAgICAgICAgICAgIGVtaXRHb3RvU3ViOiBlbWl0R290b1N1YixcbiAgICAgICAgICAgIGVtaXRHb3RvOiBlbWl0R290byxcbiAgICAgICAgICAgIG5leHQ6IG5leHQsXG4gICAgICAgICAgICBwcmV2OiBwcmV2XG4gICAgICAgIH0pO1xuXG4gICAgfTtcbiAgICBcbiAgICAvLyBmbGFnIHRoYXQgY2FuIGJlIHVzZWQgaW4gSlMgdG8gY2hlY2sgaWYgYnJvd3NlciBoYXZlIHBhc3NlZCB0aGUgc3VwcG9ydCB0ZXN0XG4gICAgaW1wcmVzcy5zdXBwb3J0ZWQgPSBpbXByZXNzU3VwcG9ydGVkO1xuICAgIFxufSkoZG9jdW1lbnQsIHdpbmRvdyk7XG5cbi8vIE5BVklHQVRJT04gRVZFTlRTXG5cbi8vIEFzIHlvdSBjYW4gc2VlIHRoaXMgcGFydCBpcyBzZXBhcmF0ZSBmcm9tIHRoZSBpbXByZXNzLmpzIGNvcmUgY29kZS5cbi8vIEl0J3MgYmVjYXVzZSB0aGVzZSBuYXZpZ2F0aW9uIGFjdGlvbnMgb25seSBuZWVkIHdoYXQgaW1wcmVzcy5qcyBwcm92aWRlcyB3aXRoXG4vLyBpdHMgc2ltcGxlIEFQSS5cbi8vXG4vLyBJbiBmdXR1cmUgSSB0aGluayBhYm91dCBtb3ZpbmcgaXQgdG8gbWFrZSB0aGVtIG9wdGlvbmFsLCBtb3ZlIHRvIHNlcGFyYXRlIGZpbGVzXG4vLyBhbmQgdHJlYXQgbW9yZSBsaWtlIGEgJ3BsdWdpbnMnLlxuKGZ1bmN0aW9uICggZG9jdW1lbnQsIHdpbmRvdyApIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgXG4gICAgLy8gdGhyb3R0bGluZyBmdW5jdGlvbiBjYWxscywgYnkgUmVteSBTaGFycFxuICAgIC8vIGh0dHA6Ly9yZW15c2hhcnAuY29tLzIwMTAvMDcvMjEvdGhyb3R0bGluZy1mdW5jdGlvbi1jYWxscy9cbiAgICB2YXIgdGhyb3R0bGUgPSBmdW5jdGlvbiAoZm4sIGRlbGF5KSB7XG4gICAgICAgIHZhciB0aW1lciA9IG51bGw7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgY29udGV4dCA9IHRoaXMsIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBmbi5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICAgIH0sIGRlbGF5KTtcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIFxuICAgIC8vIHdhaXQgZm9yIGltcHJlc3MuanMgdG8gYmUgaW5pdGlhbGl6ZWRcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiaW1wcmVzczpzdGFydFwiLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgLy8gR2V0dGluZyBBUEkgZnJvbSBldmVudCBkYXRhLlxuICAgICAgICAvLyBTbyB5b3UgZG9uJ3QgZXZlbnQgbmVlZCB0byBrbm93IHdoYXQgaXMgdGhlIGlkIG9mIHRoZSByb290IGVsZW1lbnRcbiAgICAgICAgLy8gb3IgYW55dGhpbmcuIGBpbXByZXNzOmluaXRgIGV2ZW50IGRhdGEgZ2l2ZXMgeW91IGV2ZXJ5dGhpbmcgeW91IFxuICAgICAgICAvLyBuZWVkIHRvIGNvbnRyb2wgdGhlIHByZXNlbnRhdGlvbiB0aGF0IHdhcyBqdXN0IGluaXRpYWxpemVkLlxuICAgICAgICB2YXIgYXBpID0gZXZlbnQuZGV0YWlsLmFwaTtcbiAgICAgICAgXG4gICAgICAgIC8vIEtFWUJPQVJEIE5BVklHQVRJT04gSEFORExFUlNcblxuICAgICAgICAvLyBQcmV2ZW50IGRlZmF1bHQga2V5ZG93biBhY3Rpb24gd2hlbiBvbmUgb2Ygc3VwcG9ydGVkIGtleSBpcyBwcmVzc2VkLlxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBmdW5jdGlvbiAoIGV2ZW50ICkge1xuICAgICAgICAgICAgaWYgKCBldmVudC5rZXlDb2RlID09PSA5IHx8ICggZXZlbnQua2V5Q29kZSA+PSAzMiAmJiBldmVudC5rZXlDb2RlIDw9IDM0ICkgfHwgKGV2ZW50LmtleUNvZGUgPj0gMzcgJiYgZXZlbnQua2V5Q29kZSA8PSA0MCkgKSB7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgZmFsc2UpO1xuXG4gICAgICAgIC8vIFRyaWdnZXIgaW1wcmVzcyBhY3Rpb24gKG5leHQgb3IgcHJldikgb24ga2V5dXAuXG4gICAgICAgIFxuICAgICAgICAvLyBTdXBwb3J0ZWQga2V5cyBhcmU6XG4gICAgICAgIC8vIFtzcGFjZV0gLSBxdWl0ZSBjb21tb24gaW4gcHJlc2VudGF0aW9uIHNvZnR3YXJlIHRvIG1vdmUgZm9yd2FyZFxuICAgICAgICAvLyBbdXBdIFtyaWdodF0gLyBbZG93bl0gW2xlZnRdIC0gYWdhaW4gY29tbW9uIGFuZCBuYXR1cmFsIGFkZGl0aW9uLFxuICAgICAgICAvLyBbcGdkb3duXSAvIFtwZ3VwXSAtIG9mdGVuIHRyaWdnZXJlZCBieSByZW1vdGUgY29udHJvbGxlcnMsXG4gICAgICAgIC8vIFt0YWJdIC0gdGhpcyBvbmUgaXMgcXVpdGUgY29udHJvdmVyc2lhbCwgYnV0IHRoZSByZWFzb24gaXQgZW5kZWQgdXAgb25cbiAgICAgICAgLy8gICB0aGlzIGxpc3QgaXMgcXVpdGUgYW4gaW50ZXJlc3Rpbmcgc3RvcnkuLi4gUmVtZW1iZXIgdGhhdCBzdHJhbmdlIHBhcnRcbiAgICAgICAgLy8gICBpbiB0aGUgaW1wcmVzcy5qcyBjb2RlIHdoZXJlIHdpbmRvdyBpcyBzY3JvbGxlZCB0byAwLDAgb24gZXZlcnkgcHJlc2VudGF0aW9uXG4gICAgICAgIC8vICAgc3RlcCwgYmVjYXVzZSBzb21ldGltZXMgYnJvd3NlciBzY3JvbGxzIHZpZXdwb3J0IGJlY2F1c2Ugb2YgdGhlIGZvY3VzZWQgZWxlbWVudD9cbiAgICAgICAgLy8gICBXZWxsLCB0aGUgW3RhYl0ga2V5IGJ5IGRlZmF1bHQgbmF2aWdhdGVzIGFyb3VuZCBmb2N1c2FibGUgZWxlbWVudHMsIHNvIGNsaWNraW5nXG4gICAgICAgIC8vICAgaXQgdmVyeSBvZnRlbiBjYXVzZWQgc2Nyb2xsaW5nIHRvIGZvY3VzZWQgZWxlbWVudCBhbmQgYnJlYWtpbmcgaW1wcmVzcy5qc1xuICAgICAgICAvLyAgIHBvc2l0aW9uaW5nLiBJIGRpZG4ndCB3YW50IHRvIGp1c3QgcHJldmVudCB0aGlzIGRlZmF1bHQgYWN0aW9uLCBzbyBJIHVzZWQgW3RhYl1cbiAgICAgICAgLy8gICBhcyBhbm90aGVyIHdheSB0byBtb3ZpbmcgdG8gbmV4dCBzdGVwLi4uIEFuZCB5ZXMsIEkga25vdyB0aGF0IGZvciB0aGUgc2FrZSBvZlxuICAgICAgICAvLyAgIGNvbnNpc3RlbmN5IEkgc2hvdWxkIGFkZCBbc2hpZnQrdGFiXSBhcyBvcHBvc2l0ZSBhY3Rpb24uLi5cbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsIGZ1bmN0aW9uICggZXZlbnQgKSB7XG4gICAgICAgICAgICBpZiAoIGV2ZW50LmtleUNvZGUgPT09IDkgfHwgKCBldmVudC5rZXlDb2RlID49IDMyICYmIGV2ZW50LmtleUNvZGUgPD0gMzQgKSB8fCAoZXZlbnQua2V5Q29kZSA+PSAzNyAmJiBldmVudC5rZXlDb2RlIDw9IDQwKSApIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2goIGV2ZW50LmtleUNvZGUgKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzM6IC8vIHBnIHVwXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzc6IC8vIGxlZnRcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzODogLy8gdXBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBpLnByZXYoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgOTogIC8vIHRhYlxuICAgICAgICAgICAgICAgICAgICBjYXNlIDMyOiAvLyBzcGFjZVxuICAgICAgICAgICAgICAgICAgICBjYXNlIDM0OiAvLyBwZyBkb3duXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzk6IC8vIHJpZ2h0XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgNDA6IC8vIGRvd25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBpLm5leHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIGZhbHNlKTtcbiAgICAgICAgXG4gICAgICAgIC8vIGRlbGVnYXRlZCBoYW5kbGVyIGZvciBjbGlja2luZyBvbiB0aGUgbGlua3MgdG8gcHJlc2VudGF0aW9uIHN0ZXBzXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoIGV2ZW50ICkge1xuICAgICAgICAgICAgLy8gZXZlbnQgZGVsZWdhdGlvbiB3aXRoIFwiYnViYmxpbmdcIlxuICAgICAgICAgICAgLy8gY2hlY2sgaWYgZXZlbnQgdGFyZ2V0IChvciBhbnkgb2YgaXRzIHBhcmVudHMgaXMgYSBsaW5rKVxuICAgICAgICAgICAgdmFyIHRhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgICAgIHdoaWxlICggKHRhcmdldC50YWdOYW1lICE9PSBcIkFcIikgJiZcbiAgICAgICAgICAgICAgICAgICAgKHRhcmdldCAhPT0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KSApIHtcbiAgICAgICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQucGFyZW50Tm9kZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKCB0YXJnZXQudGFnTmFtZSA9PT0gXCJBXCIgKSB7XG4gICAgICAgICAgICAgICAgdmFyIGhyZWYgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKFwiaHJlZlwiKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyBpZiBpdCdzIGEgbGluayB0byBwcmVzZW50YXRpb24gc3RlcCwgdGFyZ2V0IHRoaXMgc3RlcFxuICAgICAgICAgICAgICAgIGlmICggaHJlZiAmJiBocmVmWzBdID09PSAnIycgKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCBocmVmLnNsaWNlKDEpICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCBhcGkuZW1pdEdvdG8odGFyZ2V0KSApIHtcbiAgICAgICAgICAgICAgICBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBmYWxzZSk7XG4gICAgICAgIFxuICAgICAgICAvLyBkZWxlZ2F0ZWQgaGFuZGxlciBmb3IgY2xpY2tpbmcgb24gc3RlcCBlbGVtZW50c1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24gKCBldmVudCApIHtcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSBldmVudC50YXJnZXQ7XG4gICAgICAgICAgICAvLyBmaW5kIGNsb3Nlc3Qgc3RlcCBlbGVtZW50IHRoYXQgaXMgbm90IGFjdGl2ZVxuICAgICAgICAgICAgd2hpbGUgKCAhKHRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoXCJzdGVwXCIpICYmICF0YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiYWN0aXZlXCIpKSAmJlxuICAgICAgICAgICAgICAgICAgICAodGFyZ2V0ICE9PSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpICkge1xuICAgICAgICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5wYXJlbnROb2RlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCBhcGkuZW1pdEdvdG8odGFyZ2V0KSApIHtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBmYWxzZSk7XG4gICAgICAgIFxuICAgICAgICAvLyB0b3VjaCBoYW5kbGVyIHRvIGRldGVjdCB0YXBzIG9uIHRoZSBsZWZ0IGFuZCByaWdodCBzaWRlIG9mIHRoZSBzY3JlZW5cbiAgICAgICAgLy8gYmFzZWQgb24gYXdlc29tZSB3b3JrIG9mIEBoYWtpbWVsOiBodHRwczovL2dpdGh1Yi5jb20vaGFraW1lbC9yZXZlYWwuanNcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNoc3RhcnRcIiwgZnVuY3Rpb24gKCBldmVudCApIHtcbiAgICAgICAgXHR2YXIgaXNMYW5kc2NhcGUgPSB3aW5kb3cuaW5uZXJXaWR0aCA+IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICAgICAgXHRcbiAgICAgICAgXHQvL3dpbmRvdy5hbGVydChtb2RlICE9IFwiY29udHJvbGxcIik7XG4gICAgICAgIFx0aWYoaXNMYW5kc2NhcGUgJiYgbW9kZSA9PSBcImNvbnRyb2xsXCIpe1xuICAgICAgICBcdFx0XG4gICAgICAgIFx0fWVsc2UgaWYgKGV2ZW50LnRvdWNoZXMubGVuZ3RoID09PSAxICkge1xuICAgICAgICAgICAgICAgIHZhciB4ID0gZXZlbnQudG91Y2hlc1swXS5jbGllbnRYLFxuICAgICAgICAgICAgICAgIFx0eSA9IGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WSxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCAqIDAuMyxcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKCB4IDwgd2lkdGggJiYgeSA+IDEwMCkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBhcGkucHJldigpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIHggPiB3aW5kb3cuaW5uZXJXaWR0aCAtIHdpZHRoICYmIHkgPiAxMDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gYXBpLm5leHQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgZmFsc2UpO1xuXG4gICAgICAgIC8vIHJlc2NhbGUgcHJlc2VudGF0aW9uIHdoZW4gd2luZG93IGlzIHJlc2l6ZWRcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgdGhyb3R0bGUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gZm9yY2UgZ29pbmcgdG8gYWN0aXZlIHN0ZXAgYWdhaW4sIHRvIHRyaWdnZXIgcmVzY2FsaW5nXG4gICAgICAgICAgICBhcGkuZ290byggZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5hY3RpdmVcIiksIDUwMCApO1xuICAgICAgICB9LCAyNTApLCBmYWxzZSk7XG5cbiAgICB9LCBmYWxzZSk7XG4gICAgICAgIFxufSkoZG9jdW1lbnQsIHdpbmRvdyk7XG5cbi8vIFRIQVQnUyBBTEwgRk9MS1MhXG4vL1xuLy8gVGhhbmtzIGZvciByZWFkaW5nIGl0IGFsbC5cbi8vIE9yIHRoYW5rcyBmb3Igc2Nyb2xsaW5nIGRvd24gYW5kIHJlYWRpbmcgdGhlIGxhc3QgcGFydC5cbi8vXG4vLyBJJ3ZlIGxlYXJudCBhIGxvdCB3aGVuIGJ1aWxkaW5nIGltcHJlc3MuanMgYW5kIEkgaG9wZSB0aGlzIGNvZGUgYW5kIGNvbW1lbnRzXG4vLyB3aWxsIGhlbHAgc29tZWJvZHkgbGVhcm4gYXQgbGVhc3Qgc29tZSBwYXJ0IG9mIGl0LlxuOyBicm93c2VyaWZ5X3NoaW1fX2RlZmluZV9fbW9kdWxlX19leHBvcnRfXyh0eXBlb2YgaW1wcmVzcyAhPSBcInVuZGVmaW5lZFwiID8gaW1wcmVzcyA6IHdpbmRvdy5pbXByZXNzKTtcblxufSkuY2FsbChnbG9iYWwsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGZ1bmN0aW9uIGRlZmluZUV4cG9ydChleCkgeyBtb2R1bGUuZXhwb3J0cyA9IGV4OyB9KTtcbiIsIi8qKlxuIEBmaWxlb3ZlcnZpZXcgU29ja2V0IGNvZGUgZm9yIHRoZSBwcmVzZW50ZXIgY2xpZW50LlxuICogXG4gKi9cblxuJ3VzZSBzdHJpY3QnXG5cbnZhciBpbXByZXNzID0gcmVxdWlyZSgnaW1wcmVzc1ByZXNlbnRlcicpXG4sIGlvID0gcmVxdWlyZSgnc29ja2V0LmlvLWJyb3dzZXJpZnknKVxuLCAkID0gd2luZG93LmpRdWVyeSB8fCByZXF1aXJlKCdqUXVlcnknKVxuXG4kKGZ1bmN0aW9uKCl7XG5cdHZhciAkYm9keSA9ICQoJ2JvZHknKVxuXHRcdCwgaG9zdCBcdFx0XHQ9ICAkYm9keS5hdHRyKCdhc3EtaG9zdCcpXG4gICAgLCBwb3J0ICBcdFx0PSBwYXJzZUludCgkYm9keS5hdHRyKCdhc3EtcG9ydCcpKVxuICAgICwgc2Vzc2lvbklkID0gJGJvZHkuYXR0cignYXNxLXNlc3Npb24taWQnKVxuICAgICwgbW9kZSBcdFx0XHQ9ICRib2R5LmF0dHIoJ2FzcS1zb2NrZXQtbW9kZScpXG5cblx0aW1wcmVzcygpLmluaXQoKTtcblx0Y29ubmVjdChob3N0LCBwb3J0LCBzZXNzaW9uSWQsIG1vZGUpXG5cdGltcHJlc3MoKS5zdGFydCgpO1xufSlcblxuLyoqIENvbm5lY3QgYmFjayB0byB0aGUgc2VydmVyIHdpdGggYSB3ZWJzb2NrZXQgKi9cblxudmFyIGNvbm5lY3QgPSBmdW5jdGlvbihob3N0LCBwb3J0LCBzZXNzaW9uLCBtb2RlKSB7XG5cdHZhciBzdGFydGVkID0gZmFsc2U7XG5cdHZhciBzb2NrZXQgPSBpby5jb25uZWN0KCdodHRwOi8vJyArIGhvc3QgKyAnOicgKyBwb3J0ICsgJy9jdHJsP3NpZD0nICsgc2Vzc2lvbik7XG5cblx0dmFyIHVwZGF0ZVZpZXdlcnNDb3VudCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0aWYgKCFldmVudC5jb25uZWN0ZWRDbGllbnRzKVxuXHRcdFx0cmV0dXJuO1xuXHRcdHZhciBjb25uZWN0ZWRWaWV3ZXJzID0gZXZlbnQuY29ubmVjdGVkQ2xpZW50cztcblx0XHQvLyBEcmF3IGljb25zIGZvciB0aGUgZmlyc3QgNTAgdmlld2Vyc1xuXHRcdHZhciBsaW0gPSBjb25uZWN0ZWRWaWV3ZXJzIDwgNTAgPyBjb25uZWN0ZWRWaWV3ZXJzIDogNTA7XG5cdFx0JCgnLmNvbm5lY3RlZC12aWV3ZXJzLWljb25zJykuZW1wdHkoKTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxpbTsgaSsrKSB7XG5cdFx0XHRpZiAoaSAlIDEwID09IDApIHtcblx0XHRcdFx0JCgnLmNvbm5lY3RlZC12aWV3ZXJzLWljb25zJykuYXBwZW5kKCc8YnIgLz4nKTtcblx0XHRcdH0gZWxzZSBpZiAoaSAlIDUgPT0gMCkge1xuXHRcdFx0XHQkKCcuY29ubmVjdGVkLXZpZXdlcnMtaWNvbnMnKS5hcHBlbmQoJzxzcGFuPiZuYnNwOyZuYnNwOzwvc3Bhbj4nKTtcblx0XHRcdH1cblx0XHRcdCQoJy5jb25uZWN0ZWQtdmlld2Vycy1pY29ucycpLmFwcGVuZCgnPGkgY2xhc3M9XCJpY29uLXVzZXJcIj4gPC9pPiAnKTtcblx0XHR9XG5cblx0XHQvL3VwZGF0ZSB2aWV3ZXJzIGNvdW50XG5cdFx0JChcIi5jb25uZWN0ZWQtdmlld2Vycy1udW1iZXJcIikudGV4dChjb25uZWN0ZWRWaWV3ZXJzICsgXCIgdmlld2Vyc1wiKTtcblx0XHQvLyQoJyNudW1Db25uZWN0ZWRWaWV3ZXJzJykudGV4dChjb25uZWN0ZWRWaWV3ZXJzICsgJycpO1xuXHRcdGNvbnNvbGUubG9nKCdOZXcgdmlld2VyIGNvbm5lY3RlZCcpO1xuXHR9XG5cdHNvY2tldC5vbignY29ubmVjdCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0c29ja2V0LmVtaXQoJ2FzcTphZG1pbicsIHtcblx0XHRcdHNlc3Npb24gOiBzZXNzaW9uXG5cdFx0fSk7XG5cblx0XHQkKCcuY29ubmVjdGVkLXZpZXdlcnMtbnVtYmVyJykudGV4dChcIjAgdmlld2VycyBjb25uZWN0ZWRcIilcblxuXHRcdC8qKlxuXHRcdCBIYW5kbGUgc29ja2V0IGV2ZW50ICduZXcnXG5cdFx0IE5vdGlmaWVzIHRoZSBhZG1pbiBvZiBhIG5ldyBjb25uZWN0aW9uIHRvIHRoZSBwcmVzZW50YXRpb24uXG5cdFx0ICovXG5cdFx0c29ja2V0Lm9uKCdhc3E6c3VibWl0dGVkJywgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGNvbnNvbGUubG9nKFwiWW91J3ZlIGdvdCBhbiBhbnN3ZXIhXCIpO1xuXHRcdFx0Y29uc29sZS5sb2coZXZlbnQpO1xuXHRcdFx0dXBkYXRlUGFydGljaXBhdGlvbihldmVudC5zdWJtaXR0ZWRWaWV3ZXJzLCBldmVudC50b3RhbFZpZXdlcnMsIGV2ZW50LnF1ZXN0aW9uSWQpO1xuXHRcdH0pO1xuXG5cdFx0LyoqXG5cdFx0ICogVXBkYXRlIHRoZSB2aWV3ZXJzIGNvdW50IHdoZW4gdXNlcnMgY29ubmVjdCBvciBkaXNjb25uZWN0LlxuXHRcdCAqL1xuXHRcdHNvY2tldC5vbignYXNxOmZvbG8tY29ubmVjdGVkJywgdXBkYXRlVmlld2Vyc0NvdW50KTtcblxuXHRcdHNvY2tldC5vbignYXNxOnN0YXJ0JywgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGlmICghc3RhcnRlZCkge1xuXHRcdFx0XHRpbXByZXNzKCkuc3RhcnQoKTtcblx0XHRcdFx0JCgnI3dlbGNvbWVTY3JlZW4nKS5tb2RhbCgnaGlkZScpO1xuXHRcdFx0XHQkKCcjd2FpdGluZ1NjcmVlbicpLmhpZGUoKTtcblx0XHRcdFx0JCgnI3NsaWRlc0NvbnRyb2xsJykuc2hvdygpO1xuXG5cdFx0XHRcdHN0YXJ0ZWQgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0c29ja2V0Lm9uKCdhc3E6Z290bycsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRjb25zb2xlLmxvZygnR09UTyByZWNlaXZlZCcpO1xuXHRcdFx0aWYgKG1vZGUgPT0gJ2NvbnRyb2wnKSB7XG5cdFx0XHRcdCQoJy5jb250cm9sVGh1bWJzIC50aHVtYnNXcmFwcGVyIC5hY3RpdmUnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG5cdFx0XHRcdCQoJy5jb250cm9sVGh1bWJzJykuc2Nyb2xsVG8oJy4nICsgZXZlbnQuc2xpZGUsIDUwMCwge1xuXHRcdFx0XHRcdG9mZnNldCA6IC0xNTBcblx0XHRcdFx0fSk7XG5cdFx0XHRcdCQoJy5jb250cm9sVGh1bWJzIC50aHVtYnNXcmFwcGVyIC4nICsgZXZlbnQuc2xpZGUpLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xuXG5cdFx0XHRcdHZhciBuZXh0ID0gJCgnIycgKyBldmVudC5zbGlkZSkubmV4dCgpLmF0dHIoJ2lkJyk7XG5cdFx0XHRcdCQoJyNuZXh0U2xpZGVGcmFtZScpLmF0dHIoJ3NyYycsICcvc2xpZGVzUmVuZGVyLycgKyBzbGlkZXNJZCArICcvIy8nICsgbmV4dCk7XG5cdFx0XHR9XG5cdFx0XHRpbXByZXNzKCkuZ290byhldmVudC5zbGlkZSk7XG5cdFx0fSk7XG5cblx0XHRzb2NrZXQub24oJ2FzcTpnb3Rvc3ViJywgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGltcHJlc3MoKS5nb3RvU3ViKGV2ZW50LnN1YnN0ZXBJbmRleCk7XG5cdFx0fSk7XG5cblx0XHRzb2NrZXQub24oJ2FzcTpxdWVzdGlvbicsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHR3aW5kb3cuYWxlcnQoXCJRdWVzdGlvblwiKTtcblx0XHRcdHNob3dRdWVzdGlvbihldmVudC5xdWVzdGlvbik7XG5cdFx0fSk7XG5cblx0XHRzb2NrZXQub24oJ2FzcTphbnN3ZXInLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0Y29uc29sZS5sb2coZXZlbnQuc3RhdHMpXG5cdFx0XHRzaG93QW5zd2VyKGV2ZW50LnF1ZXN0aW9uLCBldmVudC5zdGF0cyk7XG5cdFx0XHQvL1F1ZXN0aW9uIGNvbnRhaW5zIHRoZSBhbnN3ZXIuXG5cdFx0fSk7XG5cblx0XHRzb2NrZXQub24oJ2FzcTpoaWRlLWFuc3dlcicsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHQkKCcjYW5zd2VyJykubW9kYWwoJ2hpZGUnKTtcblx0XHR9KTtcblx0XHRzb2NrZXQub24oJ2FzcTpzZXNzaW9uLXRlcm1pbmF0ZWQnLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0Y29uc29sZS5sb2coJ3Nlc3Npb24gdGVybWluYXRlZCcpXG5cdFx0XHQkKCdib2R5JykuYXBwZW5kKCc8ZGl2IHN0eWxlPVwicG9zaXRpb246IGZpeGVkOyB0b3A6IDA7IGxlZnQ6IDA7IHJpZ2h0OiAwOyBib3R0b206IDA7IGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwwLDAsMC44KTtcIj48aDIgc3R5bGU9XCJjb2xvcjogd2hpdGU7IHRleHQtYWxpZ246IGNlbnRlcjsgbWFyZ2luLXRvcDogMTAwcHhcIj5UaGlzIHByZXNlbnRhdGlvbiB3YXMgdGVybWluYXRlZC48L2gyPjxwIHN0eWxlPVwiY29sb3I6IHdoaXRlOyB0ZXh0LWFsaWduOiBjZW50ZXI7XCI+VG8gcmVjb25uZWN0IHRyeSByZWZyZXNoaW5nIHlvdXIgYnJvd3NlciB3aW5kb3cuPC9wPjxwIHN0eWxlPVwidGV4dC1hbGlnbjogY2VudGVyO1wiPjxhIGhyZWY9XCIvdXNlclwiPlJldHVybiB0byBwcmVzZW50YXRpb25zLjwvYT48L3A+PC9kaXY+Jyk7XG5cdFx0fSk7XG5cdH0pO1xuXG5cdC8qKlxuXHQgSGFuZGxlIGltcHJlc3M6c3RlcGdvdG8gZXZlbnRcblx0IFNlbmQgYSBzb2NrZXQgZXZlbnQgdG8gbm90aWZ5IHdoaWNoIHNsaWRlIHRvIGdvIHRvLlxuXHQgKi9cblx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImltcHJlc3M6c3RlcGdvdG9cIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRzb2NrZXQuZW1pdCgnYXNxOmdvdG8nLCB7XG5cdFx0XHRzbGlkZSA6IGV2ZW50LnRhcmdldC5pZCxcblx0XHRcdHNlc3Npb24gOiBzZXNzaW9uXG5cdFx0fSk7XG5cdH0pO1xuXG5cdC8qKlxuXHQgSGFuZGxlIGltcHJlc3M6c3RlcGdvdG9zdWIgZXZlbnRcblx0IHNTZW5kIGEgc29ja2V0IGV2ZW50IHRvIG5vdGlmeSB3aGljaCBzbGlkZSBzdWJ0ZXN0IHRvIGdvIHRvLlxuXHQgKi9cblx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImltcHJlc3M6c3RlcGdvdG9zdWJcIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRzb2NrZXQuZW1pdCgnYXNxOmdvdG9zdWInLCB7XG5cdFx0XHRzdWJzdGVwSW5kZXggOiBldmVudC5kZXRhaWwuaW5kZXgsXG5cdFx0XHRzZXNzaW9uIDogc2Vzc2lvblxuXHRcdH0pO1xuXHR9KTtcblxuXHQvKipcblx0IEhhbmRsZSBpbXByZXNzOnN0ZXBnb3RvIGV2ZW50XG5cdCBzU2VuZCBhIHNvY2tldCBldmVudCB0byBub3RpZnkgd2hpY2ggc2xpZGUgdG8gZ28gdG8uXG5cdCAqL1xuXHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiaW1wcmVzczpzdGFydFwiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdHNvY2tldC5lbWl0KCdhc3E6c3RhcnQnLCB7XG5cdFx0XHRzZXNzaW9uIDogc2Vzc2lvbixcblx0XHRcdHNsaWRlIDogJCgnI2ltcHJlc3MgLmFjdGl2ZScpLmF0dHIoJ2lkJylcblx0XHR9KTtcblx0fSk7XG5cblx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignYXNxOmNsb3NlJywgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRzb2NrZXQuZW1pdCgnYXNxOmdvdG8nLCB7XG5cdFx0XHRzZXNzaW9uIDogc2Vzc2lvblxuXHRcdH0pO1xuXHR9KTtcblxuXHQvL1Nob3dzIHN0YXN0cy9hbnN3ZXJzXG5cdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2xvY2FsOnNob3ctc3RhdHMnLCBmdW5jdGlvbihldmVudCkge1xuXHRcdHNvY2tldC5lbWl0KCdhc3E6c2hvdy1zdGF0cycsIHt9KTtcblx0fSk7XG5cdCQoJyNzdG9wU2Vzc2lvbkJ0bicpLmNsaWNrKGZ1bmN0aW9uKCkge1xuXHRcdHNvY2tldC5lbWl0KCdhc3E6dGVybWluYXRlLXNlc3Npb24nLCB7XG5cdFx0XHRzZXNzaW9uIDogc2Vzc2lvblxuXHRcdH0pO1xuXHR9KTtcbn1cbmZ1bmN0aW9uIHVwZGF0ZVBhcnRpY2lwYXRpb24oc3VibWl0dGVkVmlld2VycywgdG90YWxWaWV3ZXJzLCBxdWVzdGlvbklkKSB7XG5cdHZhciBtYXhWaWV3ZXJzID0gLTE7XG5cdGlmIChtYXhWaWV3ZXJzIDwgdG90YWxWaWV3ZXJzKSB7XG5cdFx0bWF4Vmlld2VycyA9IHRvdGFsVmlld2Vycztcblx0fVxuXG5cdGlmIChtYXhWaWV3ZXJzID09IHN1Ym1pdHRlZFZpZXdlcnMpIHtcblx0XHQkKCdbcXVlc3Rpb24taWQ9XCInICsgcXVlc3Rpb25JZCArICdcIl0gLnByb2dyZXNzTnVtJykudGV4dCgnQWxsIGFuc3dlcnMgcmVjZWl2ZWQgKCcgKyBzdWJtaXR0ZWRWaWV3ZXJzICsgJy8nICsgbWF4Vmlld2VycyArICcpLiAnKTtcblx0XHQkKCdbcXVlc3Rpb24taWQ9XCInICsgcXVlc3Rpb25JZCArICdcIl0gLnNob3ctc3RhdHMnKS5hdHRyKFwiY2xhc3NcIiwgXCJidG4gYnRuLXN1Y2Nlc3NcIik7XG5cdH0gZWxzZSB7XG5cdFx0JCgnW3F1ZXN0aW9uLWlkPVwiJyArIHF1ZXN0aW9uSWQgKyAnXCJdIC5wcm9ncmVzc051bScpLnRleHQoc3VibWl0dGVkVmlld2VycyArICcvJyArIG1heFZpZXdlcnMgKyAnIGFuc3dlcnMgcmVjZWl2ZWQuJyk7XG5cdH1cblx0dmFyIHdpZHRoID0gKHN1Ym1pdHRlZFZpZXdlcnMgLyBtYXhWaWV3ZXJzKSAqIDEwMDtcblx0JCgnW3F1ZXN0aW9uLWlkPVwiJyArIHF1ZXN0aW9uSWQgKyAnXCJdIC5wcm9ncmVzcyAuYmFyJykuY3NzKCd3aWR0aCcsIHdpZHRoICsgXCIlXCIpO1xufVxuXG52YXIgc2hvd1N0YXRzID0gZnVuY3Rpb24oKSB7XG5cdHZhciBteUV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KCdsb2NhbDpzaG93LXN0YXRzJywge30pO1xuXHRkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG15RXZlbnQpO1xufVxudmFyIHNob3dRdWVzdGlvbiA9IGZ1bmN0aW9uKHF1ZXN0aW9uKSB7XG5cdCQoJy5wcm9nZXNzYmFyJykuY3NzKCd3aWR0aCcsIFwiMCVcIik7XG5cdCQoJyNwcm9ncmVzc051bScpLnRleHQoJ1dhaXRpbmcgZm9yIGFuc3dlcnMhJyk7XG5cdCQoJyNxdWVzdGlvbicpLm1vZGFsKCdzaG93Jyk7XG5cdCQoJyNxdWVzdGlvblRleHQnKS5odG1sKCc8aDM+JyArIHF1ZXN0aW9uLnF1ZXN0aW9uVGV4dCArICc8L2gzPicpO1xuXHR2YXIgb3B0aW9uc3N0cmluZyA9ICcnO1xuXHRpZiAocXVlc3Rpb24ucXVlc3Rpb25UeXBlID09IFwiTXVsdGlwbGUgY2hvaWNlXCIpIHtcblx0XHRvcHRpb25zc3RyaW5nID0gJzxzcGFuIGNsYXNzPVwiaGVscC1ibG9ja1wiPlBsZWFzZSBzZWxlY3QgYWxsIGNvcnJlY3QgYW5zd2Vycy48L3NwYW4+Jztcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHF1ZXN0aW9uLmFuc3dlcm9wdGlvbnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdG9wdGlvbnNzdHJpbmcgKz0gJzxsYWJlbCBjbGFzcz1cImNoZWNrYm94XCI+PGlucHV0IHR5cGU9XCJjaGVja2JveFwiPicgKyBxdWVzdGlvbi5hbnN3ZXJvcHRpb25zW2ldLm9wdGlvblRleHQgKyAnPC9sYWJlbD4nO1xuXHRcdH1cblxuXHR9IGVsc2Uge1xuXHRcdG9wdGlvbnNzdHJpbmcgPSAnPHNwYW4gY2xhc3M9XCJoZWxwLWJsb2NrXCI+UGxlYXNlIGVudGVyIHlvdXIgc29sdXRpb24uIENhcGl0YWxpc2F0aW9uIHdpbGwgYmUgaWdub3JlZC48L3NwYW4+Jztcblx0XHRvcHRpb25zc3RyaW5nICs9ICc8aW5wdXQgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cIllvdXIgc29sdXRpb24uLi5cIj4nO1xuXHR9XG5cblx0JCgnI2Fuc3dlcm9wdGlvbnMnKS5odG1sKG9wdGlvbnNzdHJpbmcpO1xuXG59XG52YXIgc2hvd0Fuc3dlciA9IGZ1bmN0aW9uKHF1ZXN0aW9uLCBzdGF0cykge1xuXHRjb25zb2xlLmxvZyhzdGF0cy5jb3JyZWN0ICsgXCJTVEFUUyFcIik7XG5cdHZhciBjb3JyZWN0ID0gc3RhdHMuY29ycmVjdCB8fCBudWxsO1xuXHR2YXIgY291bnRlZE1jT3B0aW9ucyA9IHN0YXRzLmNvdW50ZWRNY09wdGlvbnMgfHwgbnVsbDtcblx0dmFyIGVxdWFsQW5zd2VycyA9IHN0YXRzLmVxdWFsQW5zd2VycyB8fCBudWxsO1xuXHRnb29nbGUubG9hZChcInZpc3VhbGl6YXRpb25cIiwgXCIxXCIsIHtcblx0XHRwYWNrYWdlcyA6IFtcImNvcmVjaGFydFwiXSxcblx0XHRjYWxsYmFjayA6IGRyYXdDaGFydFxuXHR9KTtcblxuXHQvL0dvb2dsZSBjaGFydCBkcmF3aW5nIGZvciBzdGF0c1xuXHRmdW5jdGlvbiBkcmF3Q2hhcnQoKSB7XG5cdFx0Y29uc29sZS5sb2coJ0dPT0dMRSBDSEFSVCcpO1xuXHRcdGlmIChxdWVzdGlvbi5xdWVzdGlvblR5cGUgPT09IFwiTXVsdGlwbGUgY2hvaWNlXCIpIHtcblx0XHRcdHZhciBtc2NzdGF0RGF0YSA9IGdvb2dsZS52aXN1YWxpemF0aW9uLmFycmF5VG9EYXRhVGFibGUoY291bnRlZE1jT3B0aW9ucyk7XG5cdFx0fVxuXHRcdHZhciBydnN3RGF0YSA9IGdvb2dsZS52aXN1YWxpemF0aW9uLmFycmF5VG9EYXRhVGFibGUoY29ycmVjdCk7XG5cdFx0dmFyIGRpZmZBbnNEYXRhID0gZ29vZ2xlLnZpc3VhbGl6YXRpb24uYXJyYXlUb0RhdGFUYWJsZShlcXVhbEFuc3dlcnMpO1xuXG5cdFx0dmFyIHJ2c3dPcHQgPSB7XG5cdFx0XHR0aXRsZSA6ICdDb3JyZWN0IHZzLiBXcm9uZycsXG5cdFx0XHQnd2lkdGgnIDogNzYwLFxuXHRcdFx0J2hlaWdodCcgOiA0MDAsXG5cdFx0XHRjaGFydEFyZWEgOiB7XG5cdFx0XHRcdGxlZnQgOiAwLFxuXHRcdFx0XHR0b3AgOiAwLFxuXHRcdFx0XHR3aWR0aCA6IFwiNjAwcHhcIixcblx0XHRcdFx0aGVpZ2h0IDogXCIzNTBweFwiXG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHZhciBtc2NzdGF0T3B0ID0ge1xuXHRcdFx0YW5pbWF0aW9uIDoge1xuXHRcdFx0XHRkdXJhdGlvbiA6IDEwMDBcblx0XHRcdH0sXG5cdFx0XHRoQXhpcyA6IHtcblx0XHRcdFx0YWxsb3dDb250YWluZXJCb3VuZGFyeVRleHRDdWZvZmYgOiB0cnVlLFxuXHRcdFx0XHRzbGFudGVkVGV4dEFuZ2xlIDogNTBcblx0XHRcdH0sXG5cdFx0XHQnd2lkdGgnIDogNzYwLFxuXG5cdFx0XHQnbGVnZW5kJyA6IHtcblx0XHRcdFx0cG9zaXRpb24gOiAndG9wJyxcblx0XHRcdFx0dGV4dFN0eWxlIDoge1xuXHRcdFx0XHRcdGZvbnRTaXplIDogMTZcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cblx0XHR2YXIgY2hhcnQzID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLlBpZUNoYXJ0KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdydnN3Q2hhcnQnKSk7XG5cdFx0Y2hhcnQzLmRyYXcocnZzd0RhdGEsIHJ2c3dPcHQpO1xuXG5cdFx0aWYgKHF1ZXN0aW9uLnF1ZXN0aW9uVHlwZSA9PT0gXCJNdWx0aXBsZSBjaG9pY2VcIikge1xuXHRcdFx0dmFyIGNoYXJ0ID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkNvbHVtbkNoYXJ0KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtc2NzdGF0Q2hhcnQnKSk7XG5cdFx0XHRjaGFydC5kcmF3KG1zY3N0YXREYXRhLCBtc2NzdGF0T3B0KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0JCgnI21zY3N0YXRzJykuY3NzKFwiZGlzcGxheVwiLCAnbm9uZScpO1xuXHRcdFx0JCgnI21zY3N0YXRzJykucmVtb3ZlQXR0cignc3R5bGUnKTtcblx0XHRcdCQoJyNtc2NzdGF0c0J0bicpLnJlbW92ZSgpO1xuXHRcdH1cblxuXHRcdHZhciBjaGFydCA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5Db2x1bW5DaGFydChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGlmZkFuc0NoYXJ0JykpO1xuXHRcdGNoYXJ0LmRyYXcoZGlmZkFuc0RhdGEsIG1zY3N0YXRPcHQpO1xuXHR9XG5cblxuXHQkKCcjYW5zd2VyVGV4dCcpLmh0bWwoJzxoMz5TdGF0aXN0aWNzIGZvciBcIicgKyBxdWVzdGlvbi5xdWVzdGlvblRleHQgKyAnXCI8L2gzPicpO1xuXHR2YXIgb3B0aW9uc3N0cmluZyA9ICc8aDU+Q29ycmVjdCBhbnN3ZXI6PC9oNT4nO1xuXHRpZiAocXVlc3Rpb24ucXVlc3Rpb25UeXBlID09IFwiTXVsdGlwbGUgY2hvaWNlXCIpIHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHF1ZXN0aW9uLmFuc3dlcm9wdGlvbnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdG9wdGlvbnNzdHJpbmcgKz0gJzxsYWJlbCBjbGFzcz1cImNoZWNrYm94XCIgPic7XG5cdFx0XHRpZiAocXVlc3Rpb24uYW5zd2Vyb3B0aW9uc1tpXS5jb3JyZWN0ID09IHRydWUpIHtcblx0XHRcdFx0b3B0aW9uc3N0cmluZyArPSAnPGkgY2xhc3M9XCJpY29uLW9rXCI+IDwvaT4gJztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG9wdGlvbnNzdHJpbmcgKz0gJzxpIGNsYXNzPVwiaWNvbi1yZW1vdmVcIj4gPC9pPiAnO1xuXHRcdFx0fVxuXHRcdFx0b3B0aW9uc3N0cmluZyArPSBxdWVzdGlvbi5hbnN3ZXJvcHRpb25zW2ldLm9wdGlvblRleHQgKyAnPC9sYWJlbD4nO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRvcHRpb25zc3RyaW5nID0gJzxzcGFuIGNsYXNzPVwiaGVscC1ibG9ja1wiPkNvcnJlY3QgYW5zd2VyLjwvc3Bhbj4nO1xuXHRcdG9wdGlvbnNzdHJpbmcgKz0gJzxwPicgKyArJzwvcD4nO1xuXHRcdG9wdGlvbnNzdHJpbmcgKz0gJzxzcGFuIGNsYXNzPVwiaGVscC1ibG9ja1wiPllvdXIgYW5zd2VyLjwvc3Bhbj4nO1xuXHRcdG9wdGlvbnNzdHJpbmcgKz0gJzxpbnB1dCB0eXBlPVwidGV4dFwiIHZhbHVlPVwiTm9yd2F5XCIgcmVhZG9ubHk+Jztcblx0fVxuXHQvL2dvb2dsZS5zZXRPbkxvYWRDYWxsYmFjayhkcmF3Q2hhcnQpO1xuXHQvL2RyYXdDaGFydCgpO1xuXHQvL3VwZGF0ZSBtb2RhbCBjb250ZW50XG5cdCQoJyNhbnN3ZXJzb2x1dGlvbnMnKS5odG1sKG9wdGlvbnNzdHJpbmcpO1xuXHQkKCcjcXVlc3Rpb24nKS5tb2RhbCgnaGlkZScpO1xuXHQkKCcjYW5zd2VyJykubW9kYWwoJ3Nob3cnKTtcbn07XG5cbmdvb2dsZS5sb2FkKFwidmlzdWFsaXphdGlvblwiLCBcIjFcIiwge1xuXHRwYWNrYWdlcyA6IFtcImNvcmVjaGFydFwiXVxufSk7XG5cbmdvb2dsZS5zZXRPbkxvYWRDYWxsYmFjayhkcmF3Q2hhcnQpO1xuXG52YXIgc3RhdHNUeXBlcyA9IHtcblxuXHRyaWdodFZzV3JvbmcgOiB7XG5cdFx0bWV0cmljIDogXCJyaWdodFZzV3JvbmdcIixcblx0XHRkYXRhIDogW10sXG5cdFx0Y2hhcnQgOiBbXSxcblx0XHRvcHRpb25zIDoge1xuXHRcdFx0d2lkdGggOiA4MDAsXG5cdFx0fVxuXHR9LFxuXG5cdGRpc3RpbmN0T3B0aW9ucyA6IHtcblx0XHRtZXRyaWMgOiBcImRpc3RpbmN0T3B0aW9uc1wiLFxuXHRcdGRhdGEgOiBbXSxcblx0XHRjaGFydCA6IFtdLFxuXHRcdG9wdGlvbnMgOiB7XG5cdFx0XHR0aXRsZSA6ICdIb3cgb2Z0ZW4gd2FzIGEgZ3JvdXAgb2Ygb3B0aW9ucyBzZWxlY3RlZCcsXG5cdFx0XHR3aWR0aCA6IDgwMCxcblx0XHRcdGlzU3RhY2tlZCA6IHRydWUsXG5cdFx0XHRsZWdlbmQgOiB7XG5cdFx0XHRcdHBvc2l0aW9uIDogJ3RvcCcsXG5cdFx0XHRcdGFsaWdubWVudCA6ICdjZW50ZXInXG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdGRpc3RpbmN0QW5zd2VycyA6IHtcblx0XHRtZXRyaWMgOiBcImRpc3RpbmN0QW5zd2Vyc1wiLFxuXHRcdGRhdGEgOiBbXSxcblx0XHRjaGFydCA6IFtdLFxuXHRcdG9wdGlvbnMgOiB7XG5cdFx0XHR0aXRsZSA6ICdIb3cgb2Z0ZW4gd2FzIGFuIG9wdGlvbiBzZWxlY3RlZCcsXG5cdFx0XHRpc1N0YWNrZWQgOiB0cnVlLFxuXHRcdFx0d2lkdGggOiA4MDAsXG5cdFx0XHRsZWdlbmQgOiB7XG5cdFx0XHRcdHBvc2l0aW9uIDogJ3RvcCcsXG5cdFx0XHRcdGFsaWdubWVudCA6ICdjZW50ZXInXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59O1xuXG5mdW5jdGlvbiBkcmF3Q2hhcnQoKSB7XG5cdCQoJy5zdGF0cycpLmVhY2goZnVuY3Rpb24oZWwpIHtcblx0XHR2YXIgcXVlc3Rpb25JZCA9ICQodGhpcykuYXR0cigndGFyZ2V0LWFzc2Vzc21lbnQtaWQnKTtcblx0XHRzdGF0c1R5cGVzLnJpZ2h0VnNXcm9uZy5jaGFydFtxdWVzdGlvbklkXSA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5QaWVDaGFydCgkKHRoaXMpLmZpbmQoXCIucnZzd0NoYXJ0XCIpWzBdKTtcblx0XHRzdGF0c1R5cGVzLmRpc3RpbmN0T3B0aW9ucy5jaGFydFtxdWVzdGlvbklkXSA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5Db2x1bW5DaGFydCgkKHRoaXMpLmZpbmQoXCIuZGlzdGluY3RPcHRpb25zXCIpWzBdKTtcblx0XHRzdGF0c1R5cGVzLmRpc3RpbmN0QW5zd2Vycy5jaGFydFtxdWVzdGlvbklkXSA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5Db2x1bW5DaGFydCgkKHRoaXMpLmZpbmQoXCIuZGlzdGluY3RBbnN3ZXJzXCIpWzBdKTtcblx0fSlcbn1cblxuXG4kKCdhW2RhdGEtdG9nZ2xlPVwidGFiXCJdJykub24oJ3Nob3duJywgZnVuY3Rpb24oZSkge1xuXHR2YXIgcXVlc3Rpb25JZCA9ICQodGhpcykucGFyZW50cygpLmZpbmQoXCIuc3RhdHNcIikuYXR0cigndGFyZ2V0LWFzc2Vzc21lbnQtaWQnKTtcblx0cmVxdWVzdERpc3RpbmN0KHF1ZXN0aW9uSWQpXG5cdC8vIGZvciAodmFyIGtleSBpbiBzdGF0c1R5cGVzKSB7XG5cdC8vIFx0cmVxdWVzdFN0YXRzKHF1ZXN0aW9uSWQsIHN0YXRzVHlwZXNba2V5XSlcblx0Ly8gfVxufSk7XG5cbmZ1bmN0aW9uIHJlcXVlc3REaXN0aW5jdChxdWVzdGlvbklkLCBvYmopIHtcblx0JC5nZXRKU09OKCcvc3RhdHMvZ2V0U3RhdHM/cXVlc3Rpb249JyArIHF1ZXN0aW9uSWQgKyAnJm1ldHJpYz1kaXN0aW5jdE9wdGlvbnMnLCBmdW5jdGlvbihkYXRhKSB7XG5cdFx0Y29uc29sZS5sb2coZGF0YSk7XG5cdFx0dmFyIGxpc3QgPSAnPHVsIGNsYXNzPVwiZGlmZmVyZW50LW9wdGlvbnNcIj4nXG5cdFx0Zm9yICh2YXIgaT0xOyBpPGRhdGEubGVuZ3RoOyBpKyspe1xuXHRcdFx0dmFyIHRpbWVzID0gIGRhdGFbaV1bMl0gPiAxID8gJzxzcGFuIGNsYXNzPVwidGltZXNcIj4mbmJzcDsoJyArIGRhdGFbaV1bMl0gKycpPC9zcGFuPicgOiAnJ1xuXHRcdFx0bGlzdCArPSAnPGxpPicgKyBkYXRhW2ldWzBdICArIHRpbWVzICsgJzwvbGk+J1xuXHRcdH1cblx0XHRsaXN0Kz0nPC91bD4nXG5cdFx0JCgnLnN0YXRzW3RhcmdldC1hc3Nlc3NtZW50LWlkPScgKyBxdWVzdGlvbklkKyddJykuZmluZCgnLnRhYi1wYW5lJykuZXEoMSkuaHRtbChsaXN0KTtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIHJlcXVlc3RTdGF0cyhxdWVzdGlvbklkLCBvYmopIHtcblx0JC5nZXRKU09OKCcvc3RhdHMvZ2V0U3RhdHM/cXVlc3Rpb249JyArIHF1ZXN0aW9uSWQgKyAnJm1ldHJpYz0nICsgb2JqLm1ldHJpYywgZnVuY3Rpb24oZGF0YSkge1xuXHRcdGNvbnNvbGUubG9nKGRhdGEpO1xuXHRcdG9iai5kYXRhW3F1ZXN0aW9uSWRdID0gZ29vZ2xlLnZpc3VhbGl6YXRpb24uYXJyYXlUb0RhdGFUYWJsZShkYXRhKTtcblx0XHRvYmouY2hhcnRbcXVlc3Rpb25JZF0uZHJhdyhvYmouZGF0YVtxdWVzdGlvbklkXSwgb2JqLm9wdGlvbnMpO1xuXHR9KTtcbn1cblxuXG4kKFwiLm1vYmlsZU5leHRcIikuY2xpY2soZnVuY3Rpb24oKSB7XG5cdGltcHJlc3MoKS5uZXh0KCk7XG59KVxuXG4kKFwiLm1vYmlsZVByZXZcIikuY2xpY2soZnVuY3Rpb24oKSB7XG5cdGltcHJlc3MoKS5wcmV2KCk7XG59KVxuXG5tb2R1bGUuZXhwb3J0cz17XG5cdGNvbm5lY3Q6IGNvbm5lY3Rcbn1cblxuIiwiKGZ1bmN0aW9uICgpIHt2YXIgaW8gPSBtb2R1bGUuZXhwb3J0czsvKiEgU29ja2V0LklPLmpzIGJ1aWxkOjAuOC42LCBkZXZlbG9wbWVudC4gQ29weXJpZ2h0KGMpIDIwMTEgTGVhcm5Cb29zdCA8ZGV2QGxlYXJuYm9vc3QuY29tPiBNSVQgTGljZW5zZWQgKi9cblxuLyoqXG4gKiBzb2NrZXQuaW9cbiAqIENvcHlyaWdodChjKSAyMDExIExlYXJuQm9vc3QgPGRldkBsZWFybmJvb3N0LmNvbT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbihmdW5jdGlvbiAoZXhwb3J0cywgZ2xvYmFsKSB7XG5cbiAgLyoqXG4gICAqIElPIG5hbWVzcGFjZS5cbiAgICpcbiAgICogQG5hbWVzcGFjZVxuICAgKi9cblxuICB2YXIgaW8gPSBleHBvcnRzO1xuXG4gIC8qKlxuICAgKiBTb2NrZXQuSU8gdmVyc2lvblxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBpby52ZXJzaW9uID0gJzAuOC42JztcblxuICAvKipcbiAgICogUHJvdG9jb2wgaW1wbGVtZW50ZWQuXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGlvLnByb3RvY29sID0gMTtcblxuICAvKipcbiAgICogQXZhaWxhYmxlIHRyYW5zcG9ydHMsIHRoZXNlIHdpbGwgYmUgcG9wdWxhdGVkIHdpdGggdGhlIGF2YWlsYWJsZSB0cmFuc3BvcnRzXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGlvLnRyYW5zcG9ydHMgPSBbXTtcblxuICAvKipcbiAgICogS2VlcCB0cmFjayBvZiBqc29ucCBjYWxsYmFja3MuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBpby5qID0gW107XG5cbiAgLyoqXG4gICAqIEtlZXAgdHJhY2sgb2Ygb3VyIGlvLlNvY2tldHNcbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuICBpby5zb2NrZXRzID0ge307XG5cblxuICAvKipcbiAgICogTWFuYWdlcyBjb25uZWN0aW9ucyB0byBob3N0cy5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHVyaVxuICAgKiBAUGFyYW0ge0Jvb2xlYW59IGZvcmNlIGNyZWF0aW9uIG9mIG5ldyBzb2NrZXQgKGRlZmF1bHRzIHRvIGZhbHNlKVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBpby5jb25uZWN0ID0gZnVuY3Rpb24gKGhvc3QsIGRldGFpbHMpIHtcbiAgICB2YXIgdXJpID0gaW8udXRpbC5wYXJzZVVyaShob3N0KVxuICAgICAgLCB1dXJpXG4gICAgICAsIHNvY2tldDtcblxuICAgIGlmIChnbG9iYWwgJiYgZ2xvYmFsLmxvY2F0aW9uKSB7XG4gICAgICB1cmkucHJvdG9jb2wgPSB1cmkucHJvdG9jb2wgfHwgZ2xvYmFsLmxvY2F0aW9uLnByb3RvY29sLnNsaWNlKDAsIC0xKTtcbiAgICAgIHVyaS5ob3N0ID0gdXJpLmhvc3QgfHwgKGdsb2JhbC5kb2N1bWVudFxuICAgICAgICA/IGdsb2JhbC5kb2N1bWVudC5kb21haW4gOiBnbG9iYWwubG9jYXRpb24uaG9zdG5hbWUpO1xuICAgICAgdXJpLnBvcnQgPSB1cmkucG9ydCB8fCBnbG9iYWwubG9jYXRpb24ucG9ydDtcbiAgICB9XG5cbiAgICB1dXJpID0gaW8udXRpbC51bmlxdWVVcmkodXJpKTtcblxuICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgICBob3N0OiB1cmkuaG9zdFxuICAgICAgLCBzZWN1cmU6ICdodHRwcycgPT0gdXJpLnByb3RvY29sXG4gICAgICAsIHBvcnQ6IHVyaS5wb3J0IHx8ICgnaHR0cHMnID09IHVyaS5wcm90b2NvbCA/IDQ0MyA6IDgwKVxuICAgICAgLCBxdWVyeTogdXJpLnF1ZXJ5IHx8ICcnXG4gICAgfTtcblxuICAgIGlvLnV0aWwubWVyZ2Uob3B0aW9ucywgZGV0YWlscyk7XG5cbiAgICBpZiAob3B0aW9uc1snZm9yY2UgbmV3IGNvbm5lY3Rpb24nXSB8fCAhaW8uc29ja2V0c1t1dXJpXSkge1xuICAgICAgc29ja2V0ID0gbmV3IGlvLlNvY2tldChvcHRpb25zKTtcbiAgICB9XG5cbiAgICBpZiAoIW9wdGlvbnNbJ2ZvcmNlIG5ldyBjb25uZWN0aW9uJ10gJiYgc29ja2V0KSB7XG4gICAgICBpby5zb2NrZXRzW3V1cmldID0gc29ja2V0O1xuICAgIH1cblxuICAgIHNvY2tldCA9IHNvY2tldCB8fCBpby5zb2NrZXRzW3V1cmldO1xuXG4gICAgLy8gaWYgcGF0aCBpcyBkaWZmZXJlbnQgZnJvbSAnJyBvciAvXG4gICAgcmV0dXJuIHNvY2tldC5vZih1cmkucGF0aC5sZW5ndGggPiAxID8gdXJpLnBhdGggOiAnJyk7XG4gIH07XG5cbn0pKCdvYmplY3QnID09PSB0eXBlb2YgbW9kdWxlID8gbW9kdWxlLmV4cG9ydHMgOiAodGhpcy5pbyA9IHt9KSwgdGhpcyk7XG5cbi8qKlxuICogc29ja2V0LmlvXG4gKiBDb3B5cmlnaHQoYykgMjAxMSBMZWFybkJvb3N0IDxkZXZAbGVhcm5ib29zdC5jb20+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG4oZnVuY3Rpb24gKGV4cG9ydHMsIGdsb2JhbCkge1xuXG4gIC8qKlxuICAgKiBVdGlsaXRpZXMgbmFtZXNwYWNlLlxuICAgKlxuICAgKiBAbmFtZXNwYWNlXG4gICAqL1xuXG4gIHZhciB1dGlsID0gZXhwb3J0cy51dGlsID0ge307XG5cbiAgLyoqXG4gICAqIFBhcnNlcyBhbiBVUklcbiAgICpcbiAgICogQGF1dGhvciBTdGV2ZW4gTGV2aXRoYW4gPHN0ZXZlbmxldml0aGFuLmNvbT4gKE1JVCBsaWNlbnNlKVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICB2YXIgcmUgPSAvXig/Oig/IVteOkBdKzpbXjpAXFwvXSpAKShbXjpcXC8/Iy5dKyk6KT8oPzpcXC9cXC8pPygoPzooKFteOkBdKikoPzo6KFteOkBdKikpPyk/QCk/KFteOlxcLz8jXSopKD86OihcXGQqKSk/KSgoKFxcLyg/OltePyNdKD8hW14/I1xcL10qXFwuW14/I1xcLy5dKyg/Ols/I118JCkpKSpcXC8/KT8oW14/I1xcL10qKSkoPzpcXD8oW14jXSopKT8oPzojKC4qKSk/KS87XG5cbiAgdmFyIHBhcnRzID0gWydzb3VyY2UnLCAncHJvdG9jb2wnLCAnYXV0aG9yaXR5JywgJ3VzZXJJbmZvJywgJ3VzZXInLCAncGFzc3dvcmQnLFxuICAgICAgICAgICAgICAgJ2hvc3QnLCAncG9ydCcsICdyZWxhdGl2ZScsICdwYXRoJywgJ2RpcmVjdG9yeScsICdmaWxlJywgJ3F1ZXJ5JyxcbiAgICAgICAgICAgICAgICdhbmNob3InXTtcblxuICB1dGlsLnBhcnNlVXJpID0gZnVuY3Rpb24gKHN0cikge1xuICAgIHZhciBtID0gcmUuZXhlYyhzdHIgfHwgJycpXG4gICAgICAsIHVyaSA9IHt9XG4gICAgICAsIGkgPSAxNDtcblxuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIHVyaVtwYXJ0c1tpXV0gPSBtW2ldIHx8ICcnO1xuICAgIH1cblxuICAgIHJldHVybiB1cmk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFByb2R1Y2VzIGEgdW5pcXVlIHVybCB0aGF0IGlkZW50aWZpZXMgYSBTb2NrZXQuSU8gY29ubmVjdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHVyaVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICB1dGlsLnVuaXF1ZVVyaSA9IGZ1bmN0aW9uICh1cmkpIHtcbiAgICB2YXIgcHJvdG9jb2wgPSB1cmkucHJvdG9jb2xcbiAgICAgICwgaG9zdCA9IHVyaS5ob3N0XG4gICAgICAsIHBvcnQgPSB1cmkucG9ydDtcblxuICAgIGlmICgnZG9jdW1lbnQnIGluIGdsb2JhbCkge1xuICAgICAgaG9zdCA9IGhvc3QgfHwgZG9jdW1lbnQuZG9tYWluO1xuICAgICAgcG9ydCA9IHBvcnQgfHwgKHByb3RvY29sID09ICdodHRwcydcbiAgICAgICAgJiYgZG9jdW1lbnQubG9jYXRpb24ucHJvdG9jb2wgIT09ICdodHRwczonID8gNDQzIDogZG9jdW1lbnQubG9jYXRpb24ucG9ydCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGhvc3QgPSBob3N0IHx8ICdsb2NhbGhvc3QnO1xuXG4gICAgICBpZiAoIXBvcnQgJiYgcHJvdG9jb2wgPT0gJ2h0dHBzJykge1xuICAgICAgICBwb3J0ID0gNDQzO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAocHJvdG9jb2wgfHwgJ2h0dHAnKSArICc6Ly8nICsgaG9zdCArICc6JyArIChwb3J0IHx8IDgwKTtcbiAgfTtcblxuICAvKipcbiAgICogTWVyZ2VzdCAyIHF1ZXJ5IHN0cmluZ3MgaW4gdG8gb25jZSB1bmlxdWUgcXVlcnkgc3RyaW5nXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBiYXNlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBhZGRpdGlvblxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICB1dGlsLnF1ZXJ5ID0gZnVuY3Rpb24gKGJhc2UsIGFkZGl0aW9uKSB7XG4gICAgdmFyIHF1ZXJ5ID0gdXRpbC5jaHVua1F1ZXJ5KGJhc2UgfHwgJycpXG4gICAgICAsIGNvbXBvbmVudHMgPSBbXTtcblxuICAgIHV0aWwubWVyZ2UocXVlcnksIHV0aWwuY2h1bmtRdWVyeShhZGRpdGlvbiB8fCAnJykpO1xuICAgIGZvciAodmFyIHBhcnQgaW4gcXVlcnkpIHtcbiAgICAgIGlmIChxdWVyeS5oYXNPd25Qcm9wZXJ0eShwYXJ0KSkge1xuICAgICAgICBjb21wb25lbnRzLnB1c2gocGFydCArICc9JyArIHF1ZXJ5W3BhcnRdKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY29tcG9uZW50cy5sZW5ndGggPyAnPycgKyBjb21wb25lbnRzLmpvaW4oJyYnKSA6ICcnO1xuICB9O1xuXG4gIC8qKlxuICAgKiBUcmFuc2Zvcm1zIGEgcXVlcnlzdHJpbmcgaW4gdG8gYW4gb2JqZWN0XG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBxc1xuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICB1dGlsLmNodW5rUXVlcnkgPSBmdW5jdGlvbiAocXMpIHtcbiAgICB2YXIgcXVlcnkgPSB7fVxuICAgICAgLCBwYXJhbXMgPSBxcy5zcGxpdCgnJicpXG4gICAgICAsIGkgPSAwXG4gICAgICAsIGwgPSBwYXJhbXMubGVuZ3RoXG4gICAgICAsIGt2O1xuXG4gICAgZm9yICg7IGkgPCBsOyArK2kpIHtcbiAgICAgIGt2ID0gcGFyYW1zW2ldLnNwbGl0KCc9Jyk7XG4gICAgICBpZiAoa3ZbMF0pIHtcbiAgICAgICAgcXVlcnlba3ZbMF1dID0gZGVjb2RlVVJJQ29tcG9uZW50KGt2WzFdKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcXVlcnk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEV4ZWN1dGVzIHRoZSBnaXZlbiBmdW5jdGlvbiB3aGVuIHRoZSBwYWdlIGlzIGxvYWRlZC5cbiAgICpcbiAgICogICAgIGlvLnV0aWwubG9hZChmdW5jdGlvbiAoKSB7IGNvbnNvbGUubG9nKCdwYWdlIGxvYWRlZCcpOyB9KTtcbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgdmFyIHBhZ2VMb2FkZWQgPSBmYWxzZTtcblxuICB1dGlsLmxvYWQgPSBmdW5jdGlvbiAoZm4pIHtcbiAgICBpZiAoJ2RvY3VtZW50JyBpbiBnbG9iYWwgJiYgZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJyB8fCBwYWdlTG9hZGVkKSB7XG4gICAgICByZXR1cm4gZm4oKTtcbiAgICB9XG5cbiAgICB1dGlsLm9uKGdsb2JhbCwgJ2xvYWQnLCBmbiwgZmFsc2UpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBZGRzIGFuIGV2ZW50LlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgdXRpbC5vbiA9IGZ1bmN0aW9uIChlbGVtZW50LCBldmVudCwgZm4sIGNhcHR1cmUpIHtcbiAgICBpZiAoZWxlbWVudC5hdHRhY2hFdmVudCkge1xuICAgICAgZWxlbWVudC5hdHRhY2hFdmVudCgnb24nICsgZXZlbnQsIGZuKTtcbiAgICB9IGVsc2UgaWYgKGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBmbiwgY2FwdHVyZSk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZXMgdGhlIGNvcnJlY3QgYFhNTEh0dHBSZXF1ZXN0YCBmb3IgcmVndWxhciBhbmQgY3Jvc3MgZG9tYWluIHJlcXVlc3RzLlxuICAgKlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IFt4ZG9tYWluXSBDcmVhdGUgYSByZXF1ZXN0IHRoYXQgY2FuIGJlIHVzZWQgY3Jvc3MgZG9tYWluLlxuICAgKiBAcmV0dXJucyB7WE1MSHR0cFJlcXVlc3R8ZmFsc2V9IElmIHdlIGNhbiBjcmVhdGUgYSBYTUxIdHRwUmVxdWVzdC5cbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIHV0aWwucmVxdWVzdCA9IGZ1bmN0aW9uICh4ZG9tYWluKSB7XG5cbiAgICBpZiAoeGRvbWFpbiAmJiAndW5kZWZpbmVkJyAhPSB0eXBlb2YgWERvbWFpblJlcXVlc3QpIHtcbiAgICAgIHJldHVybiBuZXcgWERvbWFpblJlcXVlc3QoKTtcbiAgICB9XG5cbiAgICBpZiAoJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIFhNTEh0dHBSZXF1ZXN0ICYmICgheGRvbWFpbiB8fCB1dGlsLnVhLmhhc0NPUlMpKSB7XG4gICAgICByZXR1cm4gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgfVxuXG4gICAgaWYgKCF4ZG9tYWluKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01pY3Jvc29mdC5YTUxIVFRQJyk7XG4gICAgICB9IGNhdGNoKGUpIHsgfVxuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9O1xuXG4gIC8qKlxuICAgKiBYSFIgYmFzZWQgdHJhbnNwb3J0IGNvbnN0cnVjdG9yLlxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgLyoqXG4gICAqIENoYW5nZSB0aGUgaW50ZXJuYWwgcGFnZUxvYWRlZCB2YWx1ZS5cbiAgICovXG5cbiAgaWYgKCd1bmRlZmluZWQnICE9IHR5cGVvZiB3aW5kb3cpIHtcbiAgICB1dGlsLmxvYWQoZnVuY3Rpb24gKCkge1xuICAgICAgcGFnZUxvYWRlZCA9IHRydWU7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRGVmZXJzIGEgZnVuY3Rpb24gdG8gZW5zdXJlIGEgc3Bpbm5lciBpcyBub3QgZGlzcGxheWVkIGJ5IHRoZSBicm93c2VyXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIHV0aWwuZGVmZXIgPSBmdW5jdGlvbiAoZm4pIHtcbiAgICBpZiAoIXV0aWwudWEud2Via2l0IHx8ICd1bmRlZmluZWQnICE9IHR5cGVvZiBpbXBvcnRTY3JpcHRzKSB7XG4gICAgICByZXR1cm4gZm4oKTtcbiAgICB9XG5cbiAgICB1dGlsLmxvYWQoZnVuY3Rpb24gKCkge1xuICAgICAgc2V0VGltZW91dChmbiwgMTAwKTtcbiAgICB9KTtcbiAgfTtcblxuICAvKipcbiAgICogTWVyZ2VzIHR3byBvYmplY3RzLlxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgXG4gIHV0aWwubWVyZ2UgPSBmdW5jdGlvbiBtZXJnZSAodGFyZ2V0LCBhZGRpdGlvbmFsLCBkZWVwLCBsYXN0c2Vlbikge1xuICAgIHZhciBzZWVuID0gbGFzdHNlZW4gfHwgW11cbiAgICAgICwgZGVwdGggPSB0eXBlb2YgZGVlcCA9PSAndW5kZWZpbmVkJyA/IDIgOiBkZWVwXG4gICAgICAsIHByb3A7XG5cbiAgICBmb3IgKHByb3AgaW4gYWRkaXRpb25hbCkge1xuICAgICAgaWYgKGFkZGl0aW9uYWwuaGFzT3duUHJvcGVydHkocHJvcCkgJiYgdXRpbC5pbmRleE9mKHNlZW4sIHByb3ApIDwgMCkge1xuICAgICAgICBpZiAodHlwZW9mIHRhcmdldFtwcm9wXSAhPT0gJ29iamVjdCcgfHwgIWRlcHRoKSB7XG4gICAgICAgICAgdGFyZ2V0W3Byb3BdID0gYWRkaXRpb25hbFtwcm9wXTtcbiAgICAgICAgICBzZWVuLnB1c2goYWRkaXRpb25hbFtwcm9wXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdXRpbC5tZXJnZSh0YXJnZXRbcHJvcF0sIGFkZGl0aW9uYWxbcHJvcF0sIGRlcHRoIC0gMSwgc2Vlbik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGFyZ2V0O1xuICB9O1xuXG4gIC8qKlxuICAgKiBNZXJnZXMgcHJvdG90eXBlcyBmcm9tIG9iamVjdHNcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIFxuICB1dGlsLm1peGluID0gZnVuY3Rpb24gKGN0b3IsIGN0b3IyKSB7XG4gICAgdXRpbC5tZXJnZShjdG9yLnByb3RvdHlwZSwgY3RvcjIucHJvdG90eXBlKTtcbiAgfTtcblxuICAvKipcbiAgICogU2hvcnRjdXQgZm9yIHByb3RvdHlwaWNhbCBhbmQgc3RhdGljIGluaGVyaXRhbmNlLlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgdXRpbC5pbmhlcml0ID0gZnVuY3Rpb24gKGN0b3IsIGN0b3IyKSB7XG4gICAgZnVuY3Rpb24gZigpIHt9O1xuICAgIGYucHJvdG90eXBlID0gY3RvcjIucHJvdG90eXBlO1xuICAgIGN0b3IucHJvdG90eXBlID0gbmV3IGY7XG4gIH07XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgZ2l2ZW4gb2JqZWN0IGlzIGFuIEFycmF5LlxuICAgKlxuICAgKiAgICAgaW8udXRpbC5pc0FycmF5KFtdKTsgLy8gdHJ1ZVxuICAgKiAgICAgaW8udXRpbC5pc0FycmF5KHt9KTsgLy8gZmFsc2VcbiAgICpcbiAgICogQHBhcmFtIE9iamVjdCBvYmpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgdXRpbC5pc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAob2JqKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBBcnJheV0nO1xuICB9O1xuXG4gIC8qKlxuICAgKiBJbnRlcnNlY3RzIHZhbHVlcyBvZiB0d28gYXJyYXlzIGludG8gYSB0aGlyZFxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICB1dGlsLmludGVyc2VjdCA9IGZ1bmN0aW9uIChhcnIsIGFycjIpIHtcbiAgICB2YXIgcmV0ID0gW11cbiAgICAgICwgbG9uZ2VzdCA9IGFyci5sZW5ndGggPiBhcnIyLmxlbmd0aCA/IGFyciA6IGFycjJcbiAgICAgICwgc2hvcnRlc3QgPSBhcnIubGVuZ3RoID4gYXJyMi5sZW5ndGggPyBhcnIyIDogYXJyO1xuXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBzaG9ydGVzdC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGlmICh+dXRpbC5pbmRleE9mKGxvbmdlc3QsIHNob3J0ZXN0W2ldKSlcbiAgICAgICAgcmV0LnB1c2goc2hvcnRlc3RbaV0pO1xuICAgIH1cblxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICAvKipcbiAgICogQXJyYXkgaW5kZXhPZiBjb21wYXRpYmlsaXR5LlxuICAgKlxuICAgKiBAc2VlIGJpdC5seS9hNUR4YTJcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgdXRpbC5pbmRleE9mID0gZnVuY3Rpb24gKGFyciwgbywgaSkge1xuICAgIGlmIChBcnJheS5wcm90b3R5cGUuaW5kZXhPZikge1xuICAgICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5pbmRleE9mLmNhbGwoYXJyLCBvLCBpKTtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBqID0gYXJyLmxlbmd0aCwgaSA9IGkgPCAwID8gaSArIGogPCAwID8gMCA6IGkgKyBqIDogaSB8fCAwOyBcbiAgICAgICAgIGkgPCBqICYmIGFycltpXSAhPT0gbzsgaSsrKSB7fVxuXG4gICAgcmV0dXJuIGogPD0gaSA/IC0xIDogaTtcbiAgfTtcblxuICAvKipcbiAgICogQ29udmVydHMgZW51bWVyYWJsZXMgdG8gYXJyYXkuXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIHV0aWwudG9BcnJheSA9IGZ1bmN0aW9uIChlbnUpIHtcbiAgICB2YXIgYXJyID0gW107XG5cbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGVudS5sZW5ndGg7IGkgPCBsOyBpKyspXG4gICAgICBhcnIucHVzaChlbnVbaV0pO1xuXG4gICAgcmV0dXJuIGFycjtcbiAgfTtcblxuICAvKipcbiAgICogVUEgLyBlbmdpbmVzIGRldGVjdGlvbiBuYW1lc3BhY2UuXG4gICAqXG4gICAqIEBuYW1lc3BhY2VcbiAgICovXG5cbiAgdXRpbC51YSA9IHt9O1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBVQSBzdXBwb3J0cyBDT1JTIGZvciBYSFIuXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIHV0aWwudWEuaGFzQ09SUyA9ICd1bmRlZmluZWQnICE9IHR5cGVvZiBYTUxIdHRwUmVxdWVzdCAmJiAoZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICB2YXIgYSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gYS53aXRoQ3JlZGVudGlhbHMgIT0gdW5kZWZpbmVkO1xuICB9KSgpO1xuXG4gIC8qKlxuICAgKiBEZXRlY3Qgd2Via2l0LlxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICB1dGlsLnVhLndlYmtpdCA9ICd1bmRlZmluZWQnICE9IHR5cGVvZiBuYXZpZ2F0b3JcbiAgICAmJiAvd2Via2l0L2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcblxufSkoJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGlvID8gaW8gOiBtb2R1bGUuZXhwb3J0cywgdGhpcyk7XG5cbi8qKlxuICogc29ja2V0LmlvXG4gKiBDb3B5cmlnaHQoYykgMjAxMSBMZWFybkJvb3N0IDxkZXZAbGVhcm5ib29zdC5jb20+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG4oZnVuY3Rpb24gKGV4cG9ydHMsIGlvKSB7XG5cbiAgLyoqXG4gICAqIEV4cG9zZSBjb25zdHJ1Y3Rvci5cbiAgICovXG5cbiAgZXhwb3J0cy5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbiAgLyoqXG4gICAqIEV2ZW50IGVtaXR0ZXIgY29uc3RydWN0b3IuXG4gICAqXG4gICAqIEBhcGkgcHVibGljLlxuICAgKi9cblxuICBmdW5jdGlvbiBFdmVudEVtaXR0ZXIgKCkge307XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBsaXN0ZW5lclxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gKG5hbWUsIGZuKSB7XG4gICAgaWYgKCF0aGlzLiRldmVudHMpIHtcbiAgICAgIHRoaXMuJGV2ZW50cyA9IHt9O1xuICAgIH1cblxuICAgIGlmICghdGhpcy4kZXZlbnRzW25hbWVdKSB7XG4gICAgICB0aGlzLiRldmVudHNbbmFtZV0gPSBmbjtcbiAgICB9IGVsc2UgaWYgKGlvLnV0aWwuaXNBcnJheSh0aGlzLiRldmVudHNbbmFtZV0pKSB7XG4gICAgICB0aGlzLiRldmVudHNbbmFtZV0ucHVzaChmbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuJGV2ZW50c1tuYW1lXSA9IFt0aGlzLiRldmVudHNbbmFtZV0sIGZuXTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbjtcblxuICAvKipcbiAgICogQWRkcyBhIHZvbGF0aWxlIGxpc3RlbmVyLlxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbiAobmFtZSwgZm4pIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBmdW5jdGlvbiBvbiAoKSB7XG4gICAgICBzZWxmLnJlbW92ZUxpc3RlbmVyKG5hbWUsIG9uKTtcbiAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIG9uLmxpc3RlbmVyID0gZm47XG4gICAgdGhpcy5vbihuYW1lLCBvbik7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogUmVtb3ZlcyBhIGxpc3RlbmVyLlxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24gKG5hbWUsIGZuKSB7XG4gICAgaWYgKHRoaXMuJGV2ZW50cyAmJiB0aGlzLiRldmVudHNbbmFtZV0pIHtcbiAgICAgIHZhciBsaXN0ID0gdGhpcy4kZXZlbnRzW25hbWVdO1xuXG4gICAgICBpZiAoaW8udXRpbC5pc0FycmF5KGxpc3QpKSB7XG4gICAgICAgIHZhciBwb3MgPSAtMTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGxpc3QubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgaWYgKGxpc3RbaV0gPT09IGZuIHx8IChsaXN0W2ldLmxpc3RlbmVyICYmIGxpc3RbaV0ubGlzdGVuZXIgPT09IGZuKSkge1xuICAgICAgICAgICAgcG9zID0gaTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwb3MgPCAwKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBsaXN0LnNwbGljZShwb3MsIDEpO1xuXG4gICAgICAgIGlmICghbGlzdC5sZW5ndGgpIHtcbiAgICAgICAgICBkZWxldGUgdGhpcy4kZXZlbnRzW25hbWVdO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGxpc3QgPT09IGZuIHx8IChsaXN0Lmxpc3RlbmVyICYmIGxpc3QubGlzdGVuZXIgPT09IGZuKSkge1xuICAgICAgICBkZWxldGUgdGhpcy4kZXZlbnRzW25hbWVdO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGFsbCBsaXN0ZW5lcnMgZm9yIGFuIGV2ZW50LlxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgLy8gVE9ETzogZW5hYmxlIHRoaXMgd2hlbiBub2RlIDAuNSBpcyBzdGFibGVcbiAgICAvL2lmIChuYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vdGhpcy4kZXZlbnRzID0ge307XG4gICAgICAvL3JldHVybiB0aGlzO1xuICAgIC8vfVxuXG4gICAgaWYgKHRoaXMuJGV2ZW50cyAmJiB0aGlzLiRldmVudHNbbmFtZV0pIHtcbiAgICAgIHRoaXMuJGV2ZW50c1tuYW1lXSA9IG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIEdldHMgYWxsIGxpc3RlbmVycyBmb3IgYSBjZXJ0YWluIGV2ZW50LlxuICAgKlxuICAgKiBAYXBpIHB1YmxjaVxuICAgKi9cblxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgaWYgKCF0aGlzLiRldmVudHMpIHtcbiAgICAgIHRoaXMuJGV2ZW50cyA9IHt9O1xuICAgIH1cblxuICAgIGlmICghdGhpcy4kZXZlbnRzW25hbWVdKSB7XG4gICAgICB0aGlzLiRldmVudHNbbmFtZV0gPSBbXTtcbiAgICB9XG5cbiAgICBpZiAoIWlvLnV0aWwuaXNBcnJheSh0aGlzLiRldmVudHNbbmFtZV0pKSB7XG4gICAgICB0aGlzLiRldmVudHNbbmFtZV0gPSBbdGhpcy4kZXZlbnRzW25hbWVdXTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy4kZXZlbnRzW25hbWVdO1xuICB9O1xuXG4gIC8qKlxuICAgKiBFbWl0cyBhbiBldmVudC5cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICBpZiAoIXRoaXMuJGV2ZW50cykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBoYW5kbGVyID0gdGhpcy4kZXZlbnRzW25hbWVdO1xuXG4gICAgaWYgKCFoYW5kbGVyKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXG4gICAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGhhbmRsZXIpIHtcbiAgICAgIGhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfSBlbHNlIGlmIChpby51dGlsLmlzQXJyYXkoaGFuZGxlcikpIHtcbiAgICAgIHZhciBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gbGlzdGVuZXJzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxufSkoXG4gICAgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGlvID8gaW8gOiBtb2R1bGUuZXhwb3J0c1xuICAsICd1bmRlZmluZWQnICE9IHR5cGVvZiBpbyA/IGlvIDogbW9kdWxlLnBhcmVudC5leHBvcnRzXG4pO1xuXG4vKipcbiAqIHNvY2tldC5pb1xuICogQ29weXJpZ2h0KGMpIDIwMTEgTGVhcm5Cb29zdCA8ZGV2QGxlYXJuYm9vc3QuY29tPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxuLyoqXG4gKiBCYXNlZCBvbiBKU09OMiAoaHR0cDovL3d3dy5KU09OLm9yZy9qcy5odG1sKS5cbiAqL1xuXG4oZnVuY3Rpb24gKGV4cG9ydHMsIG5hdGl2ZUpTT04pIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgLy8gdXNlIG5hdGl2ZSBKU09OIGlmIGl0J3MgYXZhaWxhYmxlXG4gIGlmIChuYXRpdmVKU09OICYmIG5hdGl2ZUpTT04ucGFyc2Upe1xuICAgIHJldHVybiBleHBvcnRzLkpTT04gPSB7XG4gICAgICBwYXJzZTogbmF0aXZlSlNPTi5wYXJzZVxuICAgICwgc3RyaW5naWZ5OiBuYXRpdmVKU09OLnN0cmluZ2lmeVxuICAgIH1cbiAgfVxuXG4gIHZhciBKU09OID0gZXhwb3J0cy5KU09OID0ge307XG5cbiAgZnVuY3Rpb24gZihuKSB7XG4gICAgICAvLyBGb3JtYXQgaW50ZWdlcnMgdG8gaGF2ZSBhdCBsZWFzdCB0d28gZGlnaXRzLlxuICAgICAgcmV0dXJuIG4gPCAxMCA/ICcwJyArIG4gOiBuO1xuICB9XG5cbiAgZnVuY3Rpb24gZGF0ZShkLCBrZXkpIHtcbiAgICByZXR1cm4gaXNGaW5pdGUoZC52YWx1ZU9mKCkpID9cbiAgICAgICAgZC5nZXRVVENGdWxsWWVhcigpICAgICArICctJyArXG4gICAgICAgIGYoZC5nZXRVVENNb250aCgpICsgMSkgKyAnLScgK1xuICAgICAgICBmKGQuZ2V0VVRDRGF0ZSgpKSAgICAgICsgJ1QnICtcbiAgICAgICAgZihkLmdldFVUQ0hvdXJzKCkpICAgICArICc6JyArXG4gICAgICAgIGYoZC5nZXRVVENNaW51dGVzKCkpICAgKyAnOicgK1xuICAgICAgICBmKGQuZ2V0VVRDU2Vjb25kcygpKSAgICsgJ1onIDogbnVsbDtcbiAgfTtcblxuICB2YXIgY3ggPSAvW1xcdTAwMDBcXHUwMGFkXFx1MDYwMC1cXHUwNjA0XFx1MDcwZlxcdTE3YjRcXHUxN2I1XFx1MjAwYy1cXHUyMDBmXFx1MjAyOC1cXHUyMDJmXFx1MjA2MC1cXHUyMDZmXFx1ZmVmZlxcdWZmZjAtXFx1ZmZmZl0vZyxcbiAgICAgIGVzY2FwYWJsZSA9IC9bXFxcXFxcXCJcXHgwMC1cXHgxZlxceDdmLVxceDlmXFx1MDBhZFxcdTA2MDAtXFx1MDYwNFxcdTA3MGZcXHUxN2I0XFx1MTdiNVxcdTIwMGMtXFx1MjAwZlxcdTIwMjgtXFx1MjAyZlxcdTIwNjAtXFx1MjA2ZlxcdWZlZmZcXHVmZmYwLVxcdWZmZmZdL2csXG4gICAgICBnYXAsXG4gICAgICBpbmRlbnQsXG4gICAgICBtZXRhID0geyAgICAvLyB0YWJsZSBvZiBjaGFyYWN0ZXIgc3Vic3RpdHV0aW9uc1xuICAgICAgICAgICdcXGInOiAnXFxcXGInLFxuICAgICAgICAgICdcXHQnOiAnXFxcXHQnLFxuICAgICAgICAgICdcXG4nOiAnXFxcXG4nLFxuICAgICAgICAgICdcXGYnOiAnXFxcXGYnLFxuICAgICAgICAgICdcXHInOiAnXFxcXHInLFxuICAgICAgICAgICdcIicgOiAnXFxcXFwiJyxcbiAgICAgICAgICAnXFxcXCc6ICdcXFxcXFxcXCdcbiAgICAgIH0sXG4gICAgICByZXA7XG5cblxuICBmdW5jdGlvbiBxdW90ZShzdHJpbmcpIHtcblxuLy8gSWYgdGhlIHN0cmluZyBjb250YWlucyBubyBjb250cm9sIGNoYXJhY3RlcnMsIG5vIHF1b3RlIGNoYXJhY3RlcnMsIGFuZCBub1xuLy8gYmFja3NsYXNoIGNoYXJhY3RlcnMsIHRoZW4gd2UgY2FuIHNhZmVseSBzbGFwIHNvbWUgcXVvdGVzIGFyb3VuZCBpdC5cbi8vIE90aGVyd2lzZSB3ZSBtdXN0IGFsc28gcmVwbGFjZSB0aGUgb2ZmZW5kaW5nIGNoYXJhY3RlcnMgd2l0aCBzYWZlIGVzY2FwZVxuLy8gc2VxdWVuY2VzLlxuXG4gICAgICBlc2NhcGFibGUubGFzdEluZGV4ID0gMDtcbiAgICAgIHJldHVybiBlc2NhcGFibGUudGVzdChzdHJpbmcpID8gJ1wiJyArIHN0cmluZy5yZXBsYWNlKGVzY2FwYWJsZSwgZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICB2YXIgYyA9IG1ldGFbYV07XG4gICAgICAgICAgcmV0dXJuIHR5cGVvZiBjID09PSAnc3RyaW5nJyA/IGMgOlxuICAgICAgICAgICAgICAnXFxcXHUnICsgKCcwMDAwJyArIGEuY2hhckNvZGVBdCgwKS50b1N0cmluZygxNikpLnNsaWNlKC00KTtcbiAgICAgIH0pICsgJ1wiJyA6ICdcIicgKyBzdHJpbmcgKyAnXCInO1xuICB9XG5cblxuICBmdW5jdGlvbiBzdHIoa2V5LCBob2xkZXIpIHtcblxuLy8gUHJvZHVjZSBhIHN0cmluZyBmcm9tIGhvbGRlcltrZXldLlxuXG4gICAgICB2YXIgaSwgICAgICAgICAgLy8gVGhlIGxvb3AgY291bnRlci5cbiAgICAgICAgICBrLCAgICAgICAgICAvLyBUaGUgbWVtYmVyIGtleS5cbiAgICAgICAgICB2LCAgICAgICAgICAvLyBUaGUgbWVtYmVyIHZhbHVlLlxuICAgICAgICAgIGxlbmd0aCxcbiAgICAgICAgICBtaW5kID0gZ2FwLFxuICAgICAgICAgIHBhcnRpYWwsXG4gICAgICAgICAgdmFsdWUgPSBob2xkZXJba2V5XTtcblxuLy8gSWYgdGhlIHZhbHVlIGhhcyBhIHRvSlNPTiBtZXRob2QsIGNhbGwgaXQgdG8gb2J0YWluIGEgcmVwbGFjZW1lbnQgdmFsdWUuXG5cbiAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICAgICAgICB2YWx1ZSA9IGRhdGUoa2V5KTtcbiAgICAgIH1cblxuLy8gSWYgd2Ugd2VyZSBjYWxsZWQgd2l0aCBhIHJlcGxhY2VyIGZ1bmN0aW9uLCB0aGVuIGNhbGwgdGhlIHJlcGxhY2VyIHRvXG4vLyBvYnRhaW4gYSByZXBsYWNlbWVudCB2YWx1ZS5cblxuICAgICAgaWYgKHR5cGVvZiByZXAgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICB2YWx1ZSA9IHJlcC5jYWxsKGhvbGRlciwga2V5LCB2YWx1ZSk7XG4gICAgICB9XG5cbi8vIFdoYXQgaGFwcGVucyBuZXh0IGRlcGVuZHMgb24gdGhlIHZhbHVlJ3MgdHlwZS5cblxuICAgICAgc3dpdGNoICh0eXBlb2YgdmFsdWUpIHtcbiAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgICAgcmV0dXJuIHF1b3RlKHZhbHVlKTtcblxuICAgICAgY2FzZSAnbnVtYmVyJzpcblxuLy8gSlNPTiBudW1iZXJzIG11c3QgYmUgZmluaXRlLiBFbmNvZGUgbm9uLWZpbml0ZSBudW1iZXJzIGFzIG51bGwuXG5cbiAgICAgICAgICByZXR1cm4gaXNGaW5pdGUodmFsdWUpID8gU3RyaW5nKHZhbHVlKSA6ICdudWxsJztcblxuICAgICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICBjYXNlICdudWxsJzpcblxuLy8gSWYgdGhlIHZhbHVlIGlzIGEgYm9vbGVhbiBvciBudWxsLCBjb252ZXJ0IGl0IHRvIGEgc3RyaW5nLiBOb3RlOlxuLy8gdHlwZW9mIG51bGwgZG9lcyBub3QgcHJvZHVjZSAnbnVsbCcuIFRoZSBjYXNlIGlzIGluY2x1ZGVkIGhlcmUgaW5cbi8vIHRoZSByZW1vdGUgY2hhbmNlIHRoYXQgdGhpcyBnZXRzIGZpeGVkIHNvbWVkYXkuXG5cbiAgICAgICAgICByZXR1cm4gU3RyaW5nKHZhbHVlKTtcblxuLy8gSWYgdGhlIHR5cGUgaXMgJ29iamVjdCcsIHdlIG1pZ2h0IGJlIGRlYWxpbmcgd2l0aCBhbiBvYmplY3Qgb3IgYW4gYXJyYXkgb3Jcbi8vIG51bGwuXG5cbiAgICAgIGNhc2UgJ29iamVjdCc6XG5cbi8vIER1ZSB0byBhIHNwZWNpZmljYXRpb24gYmx1bmRlciBpbiBFQ01BU2NyaXB0LCB0eXBlb2YgbnVsbCBpcyAnb2JqZWN0Jyxcbi8vIHNvIHdhdGNoIG91dCBmb3IgdGhhdCBjYXNlLlxuXG4gICAgICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ251bGwnO1xuICAgICAgICAgIH1cblxuLy8gTWFrZSBhbiBhcnJheSB0byBob2xkIHRoZSBwYXJ0aWFsIHJlc3VsdHMgb2Ygc3RyaW5naWZ5aW5nIHRoaXMgb2JqZWN0IHZhbHVlLlxuXG4gICAgICAgICAgZ2FwICs9IGluZGVudDtcbiAgICAgICAgICBwYXJ0aWFsID0gW107XG5cbi8vIElzIHRoZSB2YWx1ZSBhbiBhcnJheT9cblxuICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmFwcGx5KHZhbHVlKSA9PT0gJ1tvYmplY3QgQXJyYXldJykge1xuXG4vLyBUaGUgdmFsdWUgaXMgYW4gYXJyYXkuIFN0cmluZ2lmeSBldmVyeSBlbGVtZW50LiBVc2UgbnVsbCBhcyBhIHBsYWNlaG9sZGVyXG4vLyBmb3Igbm9uLUpTT04gdmFsdWVzLlxuXG4gICAgICAgICAgICAgIGxlbmd0aCA9IHZhbHVlLmxlbmd0aDtcbiAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICBwYXJ0aWFsW2ldID0gc3RyKGksIHZhbHVlKSB8fCAnbnVsbCc7XG4gICAgICAgICAgICAgIH1cblxuLy8gSm9pbiBhbGwgb2YgdGhlIGVsZW1lbnRzIHRvZ2V0aGVyLCBzZXBhcmF0ZWQgd2l0aCBjb21tYXMsIGFuZCB3cmFwIHRoZW0gaW5cbi8vIGJyYWNrZXRzLlxuXG4gICAgICAgICAgICAgIHYgPSBwYXJ0aWFsLmxlbmd0aCA9PT0gMCA/ICdbXScgOiBnYXAgP1xuICAgICAgICAgICAgICAgICAgJ1tcXG4nICsgZ2FwICsgcGFydGlhbC5qb2luKCcsXFxuJyArIGdhcCkgKyAnXFxuJyArIG1pbmQgKyAnXScgOlxuICAgICAgICAgICAgICAgICAgJ1snICsgcGFydGlhbC5qb2luKCcsJykgKyAnXSc7XG4gICAgICAgICAgICAgIGdhcCA9IG1pbmQ7XG4gICAgICAgICAgICAgIHJldHVybiB2O1xuICAgICAgICAgIH1cblxuLy8gSWYgdGhlIHJlcGxhY2VyIGlzIGFuIGFycmF5LCB1c2UgaXQgdG8gc2VsZWN0IHRoZSBtZW1iZXJzIHRvIGJlIHN0cmluZ2lmaWVkLlxuXG4gICAgICAgICAgaWYgKHJlcCAmJiB0eXBlb2YgcmVwID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICBsZW5ndGggPSByZXAubGVuZ3RoO1xuICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcmVwW2ldID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICAgIGsgPSByZXBbaV07XG4gICAgICAgICAgICAgICAgICAgICAgdiA9IHN0cihrLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKHYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydGlhbC5wdXNoKHF1b3RlKGspICsgKGdhcCA/ICc6ICcgOiAnOicpICsgdik7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcblxuLy8gT3RoZXJ3aXNlLCBpdGVyYXRlIHRocm91Z2ggYWxsIG9mIHRoZSBrZXlzIGluIHRoZSBvYmplY3QuXG5cbiAgICAgICAgICAgICAgZm9yIChrIGluIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCBrKSkge1xuICAgICAgICAgICAgICAgICAgICAgIHYgPSBzdHIoaywgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgIGlmICh2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpYWwucHVzaChxdW90ZShrKSArIChnYXAgPyAnOiAnIDogJzonKSArIHYpO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuLy8gSm9pbiBhbGwgb2YgdGhlIG1lbWJlciB0ZXh0cyB0b2dldGhlciwgc2VwYXJhdGVkIHdpdGggY29tbWFzLFxuLy8gYW5kIHdyYXAgdGhlbSBpbiBicmFjZXMuXG5cbiAgICAgICAgICB2ID0gcGFydGlhbC5sZW5ndGggPT09IDAgPyAne30nIDogZ2FwID9cbiAgICAgICAgICAgICAgJ3tcXG4nICsgZ2FwICsgcGFydGlhbC5qb2luKCcsXFxuJyArIGdhcCkgKyAnXFxuJyArIG1pbmQgKyAnfScgOlxuICAgICAgICAgICAgICAneycgKyBwYXJ0aWFsLmpvaW4oJywnKSArICd9JztcbiAgICAgICAgICBnYXAgPSBtaW5kO1xuICAgICAgICAgIHJldHVybiB2O1xuICAgICAgfVxuICB9XG5cbi8vIElmIHRoZSBKU09OIG9iamVjdCBkb2VzIG5vdCB5ZXQgaGF2ZSBhIHN0cmluZ2lmeSBtZXRob2QsIGdpdmUgaXQgb25lLlxuXG4gIEpTT04uc3RyaW5naWZ5ID0gZnVuY3Rpb24gKHZhbHVlLCByZXBsYWNlciwgc3BhY2UpIHtcblxuLy8gVGhlIHN0cmluZ2lmeSBtZXRob2QgdGFrZXMgYSB2YWx1ZSBhbmQgYW4gb3B0aW9uYWwgcmVwbGFjZXIsIGFuZCBhbiBvcHRpb25hbFxuLy8gc3BhY2UgcGFyYW1ldGVyLCBhbmQgcmV0dXJucyBhIEpTT04gdGV4dC4gVGhlIHJlcGxhY2VyIGNhbiBiZSBhIGZ1bmN0aW9uXG4vLyB0aGF0IGNhbiByZXBsYWNlIHZhbHVlcywgb3IgYW4gYXJyYXkgb2Ygc3RyaW5ncyB0aGF0IHdpbGwgc2VsZWN0IHRoZSBrZXlzLlxuLy8gQSBkZWZhdWx0IHJlcGxhY2VyIG1ldGhvZCBjYW4gYmUgcHJvdmlkZWQuIFVzZSBvZiB0aGUgc3BhY2UgcGFyYW1ldGVyIGNhblxuLy8gcHJvZHVjZSB0ZXh0IHRoYXQgaXMgbW9yZSBlYXNpbHkgcmVhZGFibGUuXG5cbiAgICAgIHZhciBpO1xuICAgICAgZ2FwID0gJyc7XG4gICAgICBpbmRlbnQgPSAnJztcblxuLy8gSWYgdGhlIHNwYWNlIHBhcmFtZXRlciBpcyBhIG51bWJlciwgbWFrZSBhbiBpbmRlbnQgc3RyaW5nIGNvbnRhaW5pbmcgdGhhdFxuLy8gbWFueSBzcGFjZXMuXG5cbiAgICAgIGlmICh0eXBlb2Ygc3BhY2UgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgZm9yIChpID0gMDsgaSA8IHNwYWNlOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgaW5kZW50ICs9ICcgJztcbiAgICAgICAgICB9XG5cbi8vIElmIHRoZSBzcGFjZSBwYXJhbWV0ZXIgaXMgYSBzdHJpbmcsIGl0IHdpbGwgYmUgdXNlZCBhcyB0aGUgaW5kZW50IHN0cmluZy5cblxuICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygc3BhY2UgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgaW5kZW50ID0gc3BhY2U7XG4gICAgICB9XG5cbi8vIElmIHRoZXJlIGlzIGEgcmVwbGFjZXIsIGl0IG11c3QgYmUgYSBmdW5jdGlvbiBvciBhbiBhcnJheS5cbi8vIE90aGVyd2lzZSwgdGhyb3cgYW4gZXJyb3IuXG5cbiAgICAgIHJlcCA9IHJlcGxhY2VyO1xuICAgICAgaWYgKHJlcGxhY2VyICYmIHR5cGVvZiByZXBsYWNlciAhPT0gJ2Z1bmN0aW9uJyAmJlxuICAgICAgICAgICAgICAodHlwZW9mIHJlcGxhY2VyICE9PSAnb2JqZWN0JyB8fFxuICAgICAgICAgICAgICB0eXBlb2YgcmVwbGFjZXIubGVuZ3RoICE9PSAnbnVtYmVyJykpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0pTT04uc3RyaW5naWZ5Jyk7XG4gICAgICB9XG5cbi8vIE1ha2UgYSBmYWtlIHJvb3Qgb2JqZWN0IGNvbnRhaW5pbmcgb3VyIHZhbHVlIHVuZGVyIHRoZSBrZXkgb2YgJycuXG4vLyBSZXR1cm4gdGhlIHJlc3VsdCBvZiBzdHJpbmdpZnlpbmcgdGhlIHZhbHVlLlxuXG4gICAgICByZXR1cm4gc3RyKCcnLCB7Jyc6IHZhbHVlfSk7XG4gIH07XG5cbi8vIElmIHRoZSBKU09OIG9iamVjdCBkb2VzIG5vdCB5ZXQgaGF2ZSBhIHBhcnNlIG1ldGhvZCwgZ2l2ZSBpdCBvbmUuXG5cbiAgSlNPTi5wYXJzZSA9IGZ1bmN0aW9uICh0ZXh0LCByZXZpdmVyKSB7XG4gIC8vIFRoZSBwYXJzZSBtZXRob2QgdGFrZXMgYSB0ZXh0IGFuZCBhbiBvcHRpb25hbCByZXZpdmVyIGZ1bmN0aW9uLCBhbmQgcmV0dXJuc1xuICAvLyBhIEphdmFTY3JpcHQgdmFsdWUgaWYgdGhlIHRleHQgaXMgYSB2YWxpZCBKU09OIHRleHQuXG5cbiAgICAgIHZhciBqO1xuXG4gICAgICBmdW5jdGlvbiB3YWxrKGhvbGRlciwga2V5KSB7XG5cbiAgLy8gVGhlIHdhbGsgbWV0aG9kIGlzIHVzZWQgdG8gcmVjdXJzaXZlbHkgd2FsayB0aGUgcmVzdWx0aW5nIHN0cnVjdHVyZSBzb1xuICAvLyB0aGF0IG1vZGlmaWNhdGlvbnMgY2FuIGJlIG1hZGUuXG5cbiAgICAgICAgICB2YXIgaywgdiwgdmFsdWUgPSBob2xkZXJba2V5XTtcbiAgICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICBmb3IgKGsgaW4gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodmFsdWUsIGspKSB7XG4gICAgICAgICAgICAgICAgICAgICAgdiA9IHdhbGsodmFsdWUsIGspO1xuICAgICAgICAgICAgICAgICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVba10gPSB2O1xuICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB2YWx1ZVtrXTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJldml2ZXIuY2FsbChob2xkZXIsIGtleSwgdmFsdWUpO1xuICAgICAgfVxuXG5cbiAgLy8gUGFyc2luZyBoYXBwZW5zIGluIGZvdXIgc3RhZ2VzLiBJbiB0aGUgZmlyc3Qgc3RhZ2UsIHdlIHJlcGxhY2UgY2VydGFpblxuICAvLyBVbmljb2RlIGNoYXJhY3RlcnMgd2l0aCBlc2NhcGUgc2VxdWVuY2VzLiBKYXZhU2NyaXB0IGhhbmRsZXMgbWFueSBjaGFyYWN0ZXJzXG4gIC8vIGluY29ycmVjdGx5LCBlaXRoZXIgc2lsZW50bHkgZGVsZXRpbmcgdGhlbSwgb3IgdHJlYXRpbmcgdGhlbSBhcyBsaW5lIGVuZGluZ3MuXG5cbiAgICAgIHRleHQgPSBTdHJpbmcodGV4dCk7XG4gICAgICBjeC5sYXN0SW5kZXggPSAwO1xuICAgICAgaWYgKGN4LnRlc3QodGV4dCkpIHtcbiAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKGN4LCBmdW5jdGlvbiAoYSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ1xcXFx1JyArXG4gICAgICAgICAgICAgICAgICAoJzAwMDAnICsgYS5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KSkuc2xpY2UoLTQpO1xuICAgICAgICAgIH0pO1xuICAgICAgfVxuXG4gIC8vIEluIHRoZSBzZWNvbmQgc3RhZ2UsIHdlIHJ1biB0aGUgdGV4dCBhZ2FpbnN0IHJlZ3VsYXIgZXhwcmVzc2lvbnMgdGhhdCBsb29rXG4gIC8vIGZvciBub24tSlNPTiBwYXR0ZXJucy4gV2UgYXJlIGVzcGVjaWFsbHkgY29uY2VybmVkIHdpdGggJygpJyBhbmQgJ25ldydcbiAgLy8gYmVjYXVzZSB0aGV5IGNhbiBjYXVzZSBpbnZvY2F0aW9uLCBhbmQgJz0nIGJlY2F1c2UgaXQgY2FuIGNhdXNlIG11dGF0aW9uLlxuICAvLyBCdXQganVzdCB0byBiZSBzYWZlLCB3ZSB3YW50IHRvIHJlamVjdCBhbGwgdW5leHBlY3RlZCBmb3Jtcy5cblxuICAvLyBXZSBzcGxpdCB0aGUgc2Vjb25kIHN0YWdlIGludG8gNCByZWdleHAgb3BlcmF0aW9ucyBpbiBvcmRlciB0byB3b3JrIGFyb3VuZFxuICAvLyBjcmlwcGxpbmcgaW5lZmZpY2llbmNpZXMgaW4gSUUncyBhbmQgU2FmYXJpJ3MgcmVnZXhwIGVuZ2luZXMuIEZpcnN0IHdlXG4gIC8vIHJlcGxhY2UgdGhlIEpTT04gYmFja3NsYXNoIHBhaXJzIHdpdGggJ0AnIChhIG5vbi1KU09OIGNoYXJhY3RlcikuIFNlY29uZCwgd2VcbiAgLy8gcmVwbGFjZSBhbGwgc2ltcGxlIHZhbHVlIHRva2VucyB3aXRoICddJyBjaGFyYWN0ZXJzLiBUaGlyZCwgd2UgZGVsZXRlIGFsbFxuICAvLyBvcGVuIGJyYWNrZXRzIHRoYXQgZm9sbG93IGEgY29sb24gb3IgY29tbWEgb3IgdGhhdCBiZWdpbiB0aGUgdGV4dC4gRmluYWxseSxcbiAgLy8gd2UgbG9vayB0byBzZWUgdGhhdCB0aGUgcmVtYWluaW5nIGNoYXJhY3RlcnMgYXJlIG9ubHkgd2hpdGVzcGFjZSBvciAnXScgb3JcbiAgLy8gJywnIG9yICc6JyBvciAneycgb3IgJ30nLiBJZiB0aGF0IGlzIHNvLCB0aGVuIHRoZSB0ZXh0IGlzIHNhZmUgZm9yIGV2YWwuXG5cbiAgICAgIGlmICgvXltcXF0sOnt9XFxzXSokL1xuICAgICAgICAgICAgICAudGVzdCh0ZXh0LnJlcGxhY2UoL1xcXFwoPzpbXCJcXFxcXFwvYmZucnRdfHVbMC05YS1mQS1GXXs0fSkvZywgJ0AnKVxuICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1wiW15cIlxcXFxcXG5cXHJdKlwifHRydWV8ZmFsc2V8bnVsbHwtP1xcZCsoPzpcXC5cXGQqKT8oPzpbZUVdWytcXC1dP1xcZCspPy9nLCAnXScpXG4gICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKD86Xnw6fCwpKD86XFxzKlxcWykrL2csICcnKSkpIHtcblxuICAvLyBJbiB0aGUgdGhpcmQgc3RhZ2Ugd2UgdXNlIHRoZSBldmFsIGZ1bmN0aW9uIHRvIGNvbXBpbGUgdGhlIHRleHQgaW50byBhXG4gIC8vIEphdmFTY3JpcHQgc3RydWN0dXJlLiBUaGUgJ3snIG9wZXJhdG9yIGlzIHN1YmplY3QgdG8gYSBzeW50YWN0aWMgYW1iaWd1aXR5XG4gIC8vIGluIEphdmFTY3JpcHQ6IGl0IGNhbiBiZWdpbiBhIGJsb2NrIG9yIGFuIG9iamVjdCBsaXRlcmFsLiBXZSB3cmFwIHRoZSB0ZXh0XG4gIC8vIGluIHBhcmVucyB0byBlbGltaW5hdGUgdGhlIGFtYmlndWl0eS5cblxuICAgICAgICAgIGogPSBldmFsKCcoJyArIHRleHQgKyAnKScpO1xuXG4gIC8vIEluIHRoZSBvcHRpb25hbCBmb3VydGggc3RhZ2UsIHdlIHJlY3Vyc2l2ZWx5IHdhbGsgdGhlIG5ldyBzdHJ1Y3R1cmUsIHBhc3NpbmdcbiAgLy8gZWFjaCBuYW1lL3ZhbHVlIHBhaXIgdG8gYSByZXZpdmVyIGZ1bmN0aW9uIGZvciBwb3NzaWJsZSB0cmFuc2Zvcm1hdGlvbi5cblxuICAgICAgICAgIHJldHVybiB0eXBlb2YgcmV2aXZlciA9PT0gJ2Z1bmN0aW9uJyA/XG4gICAgICAgICAgICAgIHdhbGsoeycnOiBqfSwgJycpIDogajtcbiAgICAgIH1cblxuICAvLyBJZiB0aGUgdGV4dCBpcyBub3QgSlNPTiBwYXJzZWFibGUsIHRoZW4gYSBTeW50YXhFcnJvciBpcyB0aHJvd24uXG5cbiAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcignSlNPTi5wYXJzZScpO1xuICB9O1xuXG59KShcbiAgICAndW5kZWZpbmVkJyAhPSB0eXBlb2YgaW8gPyBpbyA6IG1vZHVsZS5leHBvcnRzXG4gICwgdHlwZW9mIEpTT04gIT09ICd1bmRlZmluZWQnID8gSlNPTiA6IHVuZGVmaW5lZFxuKTtcblxuLyoqXG4gKiBzb2NrZXQuaW9cbiAqIENvcHlyaWdodChjKSAyMDExIExlYXJuQm9vc3QgPGRldkBsZWFybmJvb3N0LmNvbT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbihmdW5jdGlvbiAoZXhwb3J0cywgaW8pIHtcblxuICAvKipcbiAgICogUGFyc2VyIG5hbWVzcGFjZS5cbiAgICpcbiAgICogQG5hbWVzcGFjZVxuICAgKi9cblxuICB2YXIgcGFyc2VyID0gZXhwb3J0cy5wYXJzZXIgPSB7fTtcblxuICAvKipcbiAgICogUGFja2V0IHR5cGVzLlxuICAgKi9cblxuICB2YXIgcGFja2V0cyA9IHBhcnNlci5wYWNrZXRzID0gW1xuICAgICAgJ2Rpc2Nvbm5lY3QnXG4gICAgLCAnY29ubmVjdCdcbiAgICAsICdoZWFydGJlYXQnXG4gICAgLCAnbWVzc2FnZSdcbiAgICAsICdqc29uJ1xuICAgICwgJ2V2ZW50J1xuICAgICwgJ2FjaydcbiAgICAsICdlcnJvcidcbiAgICAsICdub29wJ1xuICBdO1xuXG4gIC8qKlxuICAgKiBFcnJvcnMgcmVhc29ucy5cbiAgICovXG5cbiAgdmFyIHJlYXNvbnMgPSBwYXJzZXIucmVhc29ucyA9IFtcbiAgICAgICd0cmFuc3BvcnQgbm90IHN1cHBvcnRlZCdcbiAgICAsICdjbGllbnQgbm90IGhhbmRzaGFrZW4nXG4gICAgLCAndW5hdXRob3JpemVkJ1xuICBdO1xuXG4gIC8qKlxuICAgKiBFcnJvcnMgYWR2aWNlLlxuICAgKi9cblxuICB2YXIgYWR2aWNlID0gcGFyc2VyLmFkdmljZSA9IFtcbiAgICAgICdyZWNvbm5lY3QnXG4gIF07XG5cbiAgLyoqXG4gICAqIFNob3J0Y3V0cy5cbiAgICovXG5cbiAgdmFyIEpTT04gPSBpby5KU09OXG4gICAgLCBpbmRleE9mID0gaW8udXRpbC5pbmRleE9mO1xuXG4gIC8qKlxuICAgKiBFbmNvZGVzIGEgcGFja2V0LlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgcGFyc2VyLmVuY29kZVBhY2tldCA9IGZ1bmN0aW9uIChwYWNrZXQpIHtcbiAgICB2YXIgdHlwZSA9IGluZGV4T2YocGFja2V0cywgcGFja2V0LnR5cGUpXG4gICAgICAsIGlkID0gcGFja2V0LmlkIHx8ICcnXG4gICAgICAsIGVuZHBvaW50ID0gcGFja2V0LmVuZHBvaW50IHx8ICcnXG4gICAgICAsIGFjayA9IHBhY2tldC5hY2tcbiAgICAgICwgZGF0YSA9IG51bGw7XG5cbiAgICBzd2l0Y2ggKHBhY2tldC50eXBlKSB7XG4gICAgICBjYXNlICdlcnJvcic6XG4gICAgICAgIHZhciByZWFzb24gPSBwYWNrZXQucmVhc29uID8gaW5kZXhPZihyZWFzb25zLCBwYWNrZXQucmVhc29uKSA6ICcnXG4gICAgICAgICAgLCBhZHYgPSBwYWNrZXQuYWR2aWNlID8gaW5kZXhPZihhZHZpY2UsIHBhY2tldC5hZHZpY2UpIDogJyc7XG5cbiAgICAgICAgaWYgKHJlYXNvbiAhPT0gJycgfHwgYWR2ICE9PSAnJylcbiAgICAgICAgICBkYXRhID0gcmVhc29uICsgKGFkdiAhPT0gJycgPyAoJysnICsgYWR2KSA6ICcnKTtcblxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnbWVzc2FnZSc6XG4gICAgICAgIGlmIChwYWNrZXQuZGF0YSAhPT0gJycpXG4gICAgICAgICAgZGF0YSA9IHBhY2tldC5kYXRhO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnZXZlbnQnOlxuICAgICAgICB2YXIgZXYgPSB7IG5hbWU6IHBhY2tldC5uYW1lIH07XG5cbiAgICAgICAgaWYgKHBhY2tldC5hcmdzICYmIHBhY2tldC5hcmdzLmxlbmd0aCkge1xuICAgICAgICAgIGV2LmFyZ3MgPSBwYWNrZXQuYXJncztcbiAgICAgICAgfVxuXG4gICAgICAgIGRhdGEgPSBKU09OLnN0cmluZ2lmeShldik7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdqc29uJzpcbiAgICAgICAgZGF0YSA9IEpTT04uc3RyaW5naWZ5KHBhY2tldC5kYXRhKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2Nvbm5lY3QnOlxuICAgICAgICBpZiAocGFja2V0LnFzKVxuICAgICAgICAgIGRhdGEgPSBwYWNrZXQucXM7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdhY2snOlxuICAgICAgICBkYXRhID0gcGFja2V0LmFja0lkXG4gICAgICAgICAgKyAocGFja2V0LmFyZ3MgJiYgcGFja2V0LmFyZ3MubGVuZ3RoXG4gICAgICAgICAgICAgID8gJysnICsgSlNPTi5zdHJpbmdpZnkocGFja2V0LmFyZ3MpIDogJycpO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICAvLyBjb25zdHJ1Y3QgcGFja2V0IHdpdGggcmVxdWlyZWQgZnJhZ21lbnRzXG4gICAgdmFyIGVuY29kZWQgPSBbXG4gICAgICAgIHR5cGVcbiAgICAgICwgaWQgKyAoYWNrID09ICdkYXRhJyA/ICcrJyA6ICcnKVxuICAgICAgLCBlbmRwb2ludFxuICAgIF07XG5cbiAgICAvLyBkYXRhIGZyYWdtZW50IGlzIG9wdGlvbmFsXG4gICAgaWYgKGRhdGEgIT09IG51bGwgJiYgZGF0YSAhPT0gdW5kZWZpbmVkKVxuICAgICAgZW5jb2RlZC5wdXNoKGRhdGEpO1xuXG4gICAgcmV0dXJuIGVuY29kZWQuam9pbignOicpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBFbmNvZGVzIG11bHRpcGxlIG1lc3NhZ2VzIChwYXlsb2FkKS5cbiAgICpcbiAgICogQHBhcmFtIHtBcnJheX0gbWVzc2FnZXNcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIHBhcnNlci5lbmNvZGVQYXlsb2FkID0gZnVuY3Rpb24gKHBhY2tldHMpIHtcbiAgICB2YXIgZGVjb2RlZCA9ICcnO1xuXG4gICAgaWYgKHBhY2tldHMubGVuZ3RoID09IDEpXG4gICAgICByZXR1cm4gcGFja2V0c1swXTtcblxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gcGFja2V0cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIHZhciBwYWNrZXQgPSBwYWNrZXRzW2ldO1xuICAgICAgZGVjb2RlZCArPSAnXFx1ZmZmZCcgKyBwYWNrZXQubGVuZ3RoICsgJ1xcdWZmZmQnICsgcGFja2V0c1tpXTtcbiAgICB9XG5cbiAgICByZXR1cm4gZGVjb2RlZDtcbiAgfTtcblxuICAvKipcbiAgICogRGVjb2RlcyBhIHBhY2tldFxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgdmFyIHJlZ2V4cCA9IC8oW146XSspOihbMC05XSspPyhcXCspPzooW146XSspPzo/KFtcXHNcXFNdKik/LztcblxuICBwYXJzZXIuZGVjb2RlUGFja2V0ID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICB2YXIgcGllY2VzID0gZGF0YS5tYXRjaChyZWdleHApO1xuXG4gICAgaWYgKCFwaWVjZXMpIHJldHVybiB7fTtcblxuICAgIHZhciBpZCA9IHBpZWNlc1syXSB8fCAnJ1xuICAgICAgLCBkYXRhID0gcGllY2VzWzVdIHx8ICcnXG4gICAgICAsIHBhY2tldCA9IHtcbiAgICAgICAgICAgIHR5cGU6IHBhY2tldHNbcGllY2VzWzFdXVxuICAgICAgICAgICwgZW5kcG9pbnQ6IHBpZWNlc1s0XSB8fCAnJ1xuICAgICAgICB9O1xuXG4gICAgLy8gd2hldGhlciB3ZSBuZWVkIHRvIGFja25vd2xlZGdlIHRoZSBwYWNrZXRcbiAgICBpZiAoaWQpIHtcbiAgICAgIHBhY2tldC5pZCA9IGlkO1xuICAgICAgaWYgKHBpZWNlc1szXSlcbiAgICAgICAgcGFja2V0LmFjayA9ICdkYXRhJztcbiAgICAgIGVsc2VcbiAgICAgICAgcGFja2V0LmFjayA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gaGFuZGxlIGRpZmZlcmVudCBwYWNrZXQgdHlwZXNcbiAgICBzd2l0Y2ggKHBhY2tldC50eXBlKSB7XG4gICAgICBjYXNlICdlcnJvcic6XG4gICAgICAgIHZhciBwaWVjZXMgPSBkYXRhLnNwbGl0KCcrJyk7XG4gICAgICAgIHBhY2tldC5yZWFzb24gPSByZWFzb25zW3BpZWNlc1swXV0gfHwgJyc7XG4gICAgICAgIHBhY2tldC5hZHZpY2UgPSBhZHZpY2VbcGllY2VzWzFdXSB8fCAnJztcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ21lc3NhZ2UnOlxuICAgICAgICBwYWNrZXQuZGF0YSA9IGRhdGEgfHwgJyc7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdldmVudCc6XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdmFyIG9wdHMgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgICAgIHBhY2tldC5uYW1lID0gb3B0cy5uYW1lO1xuICAgICAgICAgIHBhY2tldC5hcmdzID0gb3B0cy5hcmdzO1xuICAgICAgICB9IGNhdGNoIChlKSB7IH1cblxuICAgICAgICBwYWNrZXQuYXJncyA9IHBhY2tldC5hcmdzIHx8IFtdO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnanNvbic6XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcGFja2V0LmRhdGEgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgICB9IGNhdGNoIChlKSB7IH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2Nvbm5lY3QnOlxuICAgICAgICBwYWNrZXQucXMgPSBkYXRhIHx8ICcnO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnYWNrJzpcbiAgICAgICAgdmFyIHBpZWNlcyA9IGRhdGEubWF0Y2goL14oWzAtOV0rKShcXCspPyguKikvKTtcbiAgICAgICAgaWYgKHBpZWNlcykge1xuICAgICAgICAgIHBhY2tldC5hY2tJZCA9IHBpZWNlc1sxXTtcbiAgICAgICAgICBwYWNrZXQuYXJncyA9IFtdO1xuXG4gICAgICAgICAgaWYgKHBpZWNlc1szXSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgcGFja2V0LmFyZ3MgPSBwaWVjZXNbM10gPyBKU09OLnBhcnNlKHBpZWNlc1szXSkgOiBbXTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHsgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnZGlzY29ubmVjdCc6XG4gICAgICBjYXNlICdoZWFydGJlYXQnOlxuICAgICAgICBicmVhaztcbiAgICB9O1xuXG4gICAgcmV0dXJuIHBhY2tldDtcbiAgfTtcblxuICAvKipcbiAgICogRGVjb2RlcyBkYXRhIHBheWxvYWQuIERldGVjdHMgbXVsdGlwbGUgbWVzc2FnZXNcbiAgICpcbiAgICogQHJldHVybiB7QXJyYXl9IG1lc3NhZ2VzXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIHBhcnNlci5kZWNvZGVQYXlsb2FkID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAvLyBJRSBkb2Vzbid0IGxpa2UgZGF0YVtpXSBmb3IgdW5pY29kZSBjaGFycywgY2hhckF0IHdvcmtzIGZpbmVcbiAgICBpZiAoZGF0YS5jaGFyQXQoMCkgPT0gJ1xcdWZmZmQnKSB7XG4gICAgICB2YXIgcmV0ID0gW107XG5cbiAgICAgIGZvciAodmFyIGkgPSAxLCBsZW5ndGggPSAnJzsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGRhdGEuY2hhckF0KGkpID09ICdcXHVmZmZkJykge1xuICAgICAgICAgIHJldC5wdXNoKHBhcnNlci5kZWNvZGVQYWNrZXQoZGF0YS5zdWJzdHIoaSArIDEpLnN1YnN0cigwLCBsZW5ndGgpKSk7XG4gICAgICAgICAgaSArPSBOdW1iZXIobGVuZ3RoKSArIDE7XG4gICAgICAgICAgbGVuZ3RoID0gJyc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGVuZ3RoICs9IGRhdGEuY2hhckF0KGkpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBbcGFyc2VyLmRlY29kZVBhY2tldChkYXRhKV07XG4gICAgfVxuICB9O1xuXG59KShcbiAgICAndW5kZWZpbmVkJyAhPSB0eXBlb2YgaW8gPyBpbyA6IG1vZHVsZS5leHBvcnRzXG4gICwgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGlvID8gaW8gOiBtb2R1bGUucGFyZW50LmV4cG9ydHNcbik7XG4vKipcbiAqIHNvY2tldC5pb1xuICogQ29weXJpZ2h0KGMpIDIwMTEgTGVhcm5Cb29zdCA8ZGV2QGxlYXJuYm9vc3QuY29tPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxuKGZ1bmN0aW9uIChleHBvcnRzLCBpbykge1xuXG4gIC8qKlxuICAgKiBFeHBvc2UgY29uc3RydWN0b3IuXG4gICAqL1xuXG4gIGV4cG9ydHMuVHJhbnNwb3J0ID0gVHJhbnNwb3J0O1xuXG4gIC8qKlxuICAgKiBUaGlzIGlzIHRoZSB0cmFuc3BvcnQgdGVtcGxhdGUgZm9yIGFsbCBzdXBwb3J0ZWQgdHJhbnNwb3J0IG1ldGhvZHMuXG4gICAqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBmdW5jdGlvbiBUcmFuc3BvcnQgKHNvY2tldCwgc2Vzc2lkKSB7XG4gICAgdGhpcy5zb2NrZXQgPSBzb2NrZXQ7XG4gICAgdGhpcy5zZXNzaWQgPSBzZXNzaWQ7XG4gIH07XG5cbiAgLyoqXG4gICAqIEFwcGx5IEV2ZW50RW1pdHRlciBtaXhpbi5cbiAgICovXG5cbiAgaW8udXRpbC5taXhpbihUcmFuc3BvcnQsIGlvLkV2ZW50RW1pdHRlcik7XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgdGhlIHJlc3BvbnNlIGZyb20gdGhlIHNlcnZlci4gV2hlbiBhIG5ldyByZXNwb25zZSBpcyByZWNlaXZlZFxuICAgKiBpdCB3aWxsIGF1dG9tYXRpY2FsbHkgdXBkYXRlIHRoZSB0aW1lb3V0LCBkZWNvZGUgdGhlIG1lc3NhZ2UgYW5kXG4gICAqIGZvcndhcmRzIHRoZSByZXNwb25zZSB0byB0aGUgb25NZXNzYWdlIGZ1bmN0aW9uIGZvciBmdXJ0aGVyIHByb2Nlc3NpbmcuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBkYXRhIFJlc3BvbnNlIGZyb20gdGhlIHNlcnZlci5cbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFRyYW5zcG9ydC5wcm90b3R5cGUub25EYXRhID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICB0aGlzLmNsZWFyQ2xvc2VUaW1lb3V0KCk7XG4gICAgXG4gICAgLy8gSWYgdGhlIGNvbm5lY3Rpb24gaW4gY3VycmVudGx5IG9wZW4gKG9yIGluIGEgcmVvcGVuaW5nIHN0YXRlKSByZXNldCB0aGUgY2xvc2UgXG4gICAgLy8gdGltZW91dCBzaW5jZSB3ZSBoYXZlIGp1c3QgcmVjZWl2ZWQgZGF0YS4gVGhpcyBjaGVjayBpcyBuZWNlc3Nhcnkgc29cbiAgICAvLyB0aGF0IHdlIGRvbid0IHJlc2V0IHRoZSB0aW1lb3V0IG9uIGFuIGV4cGxpY2l0bHkgZGlzY29ubmVjdGVkIGNvbm5lY3Rpb24uXG4gICAgaWYgKHRoaXMuY29ubmVjdGVkIHx8IHRoaXMuY29ubmVjdGluZyB8fCB0aGlzLnJlY29ubmVjdGluZykge1xuICAgICAgdGhpcy5zZXRDbG9zZVRpbWVvdXQoKTtcbiAgICB9XG5cbiAgICBpZiAoZGF0YSAhPT0gJycpIHtcbiAgICAgIC8vIHRvZG86IHdlIHNob3VsZCBvbmx5IGRvIGRlY29kZVBheWxvYWQgZm9yIHhociB0cmFuc3BvcnRzXG4gICAgICB2YXIgbXNncyA9IGlvLnBhcnNlci5kZWNvZGVQYXlsb2FkKGRhdGEpO1xuXG4gICAgICBpZiAobXNncyAmJiBtc2dzLmxlbmd0aCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IG1zZ3MubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgdGhpcy5vblBhY2tldChtc2dzW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBIYW5kbGVzIHBhY2tldHMuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBUcmFuc3BvcnQucHJvdG90eXBlLm9uUGFja2V0ID0gZnVuY3Rpb24gKHBhY2tldCkge1xuICAgIGlmIChwYWNrZXQudHlwZSA9PSAnaGVhcnRiZWF0Jykge1xuICAgICAgcmV0dXJuIHRoaXMub25IZWFydGJlYXQoKTtcbiAgICB9XG5cbiAgICBpZiAocGFja2V0LnR5cGUgPT0gJ2Nvbm5lY3QnICYmIHBhY2tldC5lbmRwb2ludCA9PSAnJykge1xuICAgICAgdGhpcy5vbkNvbm5lY3QoKTtcbiAgICB9XG5cbiAgICB0aGlzLnNvY2tldC5vblBhY2tldChwYWNrZXQpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNldHMgY2xvc2UgdGltZW91dFxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG4gIFxuICBUcmFuc3BvcnQucHJvdG90eXBlLnNldENsb3NlVGltZW91dCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuY2xvc2VUaW1lb3V0KSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIHRoaXMuY2xvc2VUaW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlbGYub25EaXNjb25uZWN0KCk7XG4gICAgICB9LCB0aGlzLnNvY2tldC5jbG9zZVRpbWVvdXQpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdHJhbnNwb3J0IGRpc2Nvbm5lY3RzLlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgVHJhbnNwb3J0LnByb3RvdHlwZS5vbkRpc2Nvbm5lY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuY2xvc2UgJiYgdGhpcy5vcGVuKSB0aGlzLmNsb3NlKCk7XG4gICAgdGhpcy5jbGVhclRpbWVvdXRzKCk7XG4gICAgdGhpcy5zb2NrZXQub25EaXNjb25uZWN0KCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRyYW5zcG9ydCBjb25uZWN0c1xuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgVHJhbnNwb3J0LnByb3RvdHlwZS5vbkNvbm5lY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zb2NrZXQub25Db25uZWN0KCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQ2xlYXJzIGNsb3NlIHRpbWVvdXRcbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFRyYW5zcG9ydC5wcm90b3R5cGUuY2xlYXJDbG9zZVRpbWVvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuY2xvc2VUaW1lb3V0KSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5jbG9zZVRpbWVvdXQpO1xuICAgICAgdGhpcy5jbG9zZVRpbWVvdXQgPSBudWxsO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogQ2xlYXIgdGltZW91dHNcbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFRyYW5zcG9ydC5wcm90b3R5cGUuY2xlYXJUaW1lb3V0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmNsZWFyQ2xvc2VUaW1lb3V0KCk7XG5cbiAgICBpZiAodGhpcy5yZW9wZW5UaW1lb3V0KSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5yZW9wZW5UaW1lb3V0KTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIFNlbmRzIGEgcGFja2V0XG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwYWNrZXQgb2JqZWN0LlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgVHJhbnNwb3J0LnByb3RvdHlwZS5wYWNrZXQgPSBmdW5jdGlvbiAocGFja2V0KSB7XG4gICAgdGhpcy5zZW5kKGlvLnBhcnNlci5lbmNvZGVQYWNrZXQocGFja2V0KSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNlbmQgdGhlIHJlY2VpdmVkIGhlYXJ0YmVhdCBtZXNzYWdlIGJhY2sgdG8gc2VydmVyLiBTbyB0aGUgc2VydmVyXG4gICAqIGtub3dzIHdlIGFyZSBzdGlsbCBjb25uZWN0ZWQuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBoZWFydGJlYXQgSGVhcnRiZWF0IHJlc3BvbnNlIGZyb20gdGhlIHNlcnZlci5cbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFRyYW5zcG9ydC5wcm90b3R5cGUub25IZWFydGJlYXQgPSBmdW5jdGlvbiAoaGVhcnRiZWF0KSB7XG4gICAgdGhpcy5wYWNrZXQoeyB0eXBlOiAnaGVhcnRiZWF0JyB9KTtcbiAgfTtcbiBcbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSB0cmFuc3BvcnQgb3BlbnMuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBUcmFuc3BvcnQucHJvdG90eXBlLm9uT3BlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLm9wZW4gPSB0cnVlO1xuICAgIHRoaXMuY2xlYXJDbG9zZVRpbWVvdXQoKTtcbiAgICB0aGlzLnNvY2tldC5vbk9wZW4oKTtcbiAgfTtcblxuICAvKipcbiAgICogTm90aWZpZXMgdGhlIGJhc2Ugd2hlbiB0aGUgY29ubmVjdGlvbiB3aXRoIHRoZSBTb2NrZXQuSU8gc2VydmVyXG4gICAqIGhhcyBiZWVuIGRpc2Nvbm5lY3RlZC5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFRyYW5zcG9ydC5wcm90b3R5cGUub25DbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAvKiBGSVhNRTogcmVvcGVuIGRlbGF5IGNhdXNpbmcgYSBpbmZpbml0IGxvb3BcbiAgICB0aGlzLnJlb3BlblRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIHNlbGYub3BlbigpO1xuICAgIH0sIHRoaXMuc29ja2V0Lm9wdGlvbnNbJ3Jlb3BlbiBkZWxheSddKTsqL1xuXG4gICAgdGhpcy5vcGVuID0gZmFsc2U7XG4gICAgdGhpcy5zb2NrZXQub25DbG9zZSgpO1xuICAgIHRoaXMub25EaXNjb25uZWN0KCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlcyBhIGNvbm5lY3Rpb24gdXJsIGJhc2VkIG9uIHRoZSBTb2NrZXQuSU8gVVJMIFByb3RvY29sLlxuICAgKiBTZWUgPGh0dHBzOi8vZ2l0aHViLmNvbS9sZWFybmJvb3N0L3NvY2tldC5pby1ub2RlLz4gZm9yIG1vcmUgZGV0YWlscy5cbiAgICpcbiAgICogQHJldHVybnMge1N0cmluZ30gQ29ubmVjdGlvbiB1cmxcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFRyYW5zcG9ydC5wcm90b3R5cGUucHJlcGFyZVVybCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHRoaXMuc29ja2V0Lm9wdGlvbnM7XG5cbiAgICByZXR1cm4gdGhpcy5zY2hlbWUoKSArICc6Ly8nXG4gICAgICArIG9wdGlvbnMuaG9zdCArICc6JyArIG9wdGlvbnMucG9ydCArICcvJ1xuICAgICAgKyBvcHRpb25zLnJlc291cmNlICsgJy8nICsgaW8ucHJvdG9jb2xcbiAgICAgICsgJy8nICsgdGhpcy5uYW1lICsgJy8nICsgdGhpcy5zZXNzaWQ7XG4gIH07XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgdHJhbnNwb3J0IGlzIHJlYWR5IHRvIHN0YXJ0IGEgY29ubmVjdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIHtTb2NrZXR9IHNvY2tldCBUaGUgc29ja2V0IGluc3RhbmNlIHRoYXQgbmVlZHMgYSB0cmFuc3BvcnRcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGNhbGxiYWNrXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBUcmFuc3BvcnQucHJvdG90eXBlLnJlYWR5ID0gZnVuY3Rpb24gKHNvY2tldCwgZm4pIHtcbiAgICBmbi5jYWxsKHRoaXMpO1xuICB9O1xufSkoXG4gICAgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGlvID8gaW8gOiBtb2R1bGUuZXhwb3J0c1xuICAsICd1bmRlZmluZWQnICE9IHR5cGVvZiBpbyA/IGlvIDogbW9kdWxlLnBhcmVudC5leHBvcnRzXG4pO1xuXG4vKipcbiAqIHNvY2tldC5pb1xuICogQ29weXJpZ2h0KGMpIDIwMTEgTGVhcm5Cb29zdCA8ZGV2QGxlYXJuYm9vc3QuY29tPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxuKGZ1bmN0aW9uIChleHBvcnRzLCBpbywgZ2xvYmFsKSB7XG5cbiAgLyoqXG4gICAqIEV4cG9zZSBjb25zdHJ1Y3Rvci5cbiAgICovXG5cbiAgZXhwb3J0cy5Tb2NrZXQgPSBTb2NrZXQ7XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBgU29ja2V0LklPIGNsaWVudGAgd2hpY2ggY2FuIGVzdGFibGlzaCBhIHBlcnNpc3RlbnRcbiAgICogY29ubmVjdGlvbiB3aXRoIGEgU29ja2V0LklPIGVuYWJsZWQgc2VydmVyLlxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBmdW5jdGlvbiBTb2NrZXQgKG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSB7XG4gICAgICAgIHBvcnQ6IDgwXG4gICAgICAsIHNlY3VyZTogZmFsc2VcbiAgICAgICwgZG9jdW1lbnQ6ICdkb2N1bWVudCcgaW4gZ2xvYmFsID8gZG9jdW1lbnQgOiBmYWxzZVxuICAgICAgLCByZXNvdXJjZTogJ3NvY2tldC5pbydcbiAgICAgICwgdHJhbnNwb3J0czogaW8udHJhbnNwb3J0c1xuICAgICAgLCAnY29ubmVjdCB0aW1lb3V0JzogMTAwMDBcbiAgICAgICwgJ3RyeSBtdWx0aXBsZSB0cmFuc3BvcnRzJzogdHJ1ZVxuICAgICAgLCAncmVjb25uZWN0JzogdHJ1ZVxuICAgICAgLCAncmVjb25uZWN0aW9uIGRlbGF5JzogNTAwXG4gICAgICAsICdyZWNvbm5lY3Rpb24gbGltaXQnOiBJbmZpbml0eVxuICAgICAgLCAncmVvcGVuIGRlbGF5JzogMzAwMFxuICAgICAgLCAnbWF4IHJlY29ubmVjdGlvbiBhdHRlbXB0cyc6IDEwXG4gICAgICAsICdzeW5jIGRpc2Nvbm5lY3Qgb24gdW5sb2FkJzogdHJ1ZVxuICAgICAgLCAnYXV0byBjb25uZWN0JzogdHJ1ZVxuICAgICAgLCAnZmxhc2ggcG9saWN5IHBvcnQnOiAxMDg0M1xuICAgIH07XG5cbiAgICBpby51dGlsLm1lcmdlKHRoaXMub3B0aW9ucywgb3B0aW9ucyk7XG5cbiAgICB0aGlzLmNvbm5lY3RlZCA9IGZhbHNlO1xuICAgIHRoaXMub3BlbiA9IGZhbHNlO1xuICAgIHRoaXMuY29ubmVjdGluZyA9IGZhbHNlO1xuICAgIHRoaXMucmVjb25uZWN0aW5nID0gZmFsc2U7XG4gICAgdGhpcy5uYW1lc3BhY2VzID0ge307XG4gICAgdGhpcy5idWZmZXIgPSBbXTtcbiAgICB0aGlzLmRvQnVmZmVyID0gZmFsc2U7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zWydzeW5jIGRpc2Nvbm5lY3Qgb24gdW5sb2FkJ10gJiZcbiAgICAgICAgKCF0aGlzLmlzWERvbWFpbigpIHx8IGlvLnV0aWwudWEuaGFzQ09SUykpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgaW8udXRpbC5vbihnbG9iYWwsICdiZWZvcmV1bmxvYWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlbGYuZGlzY29ubmVjdFN5bmMoKTtcbiAgICAgIH0sIGZhbHNlKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zWydhdXRvIGNvbm5lY3QnXSkge1xuICAgICAgdGhpcy5jb25uZWN0KCk7XG4gICAgfVxufTtcblxuICAvKipcbiAgICogQXBwbHkgRXZlbnRFbWl0dGVyIG1peGluLlxuICAgKi9cblxuICBpby51dGlsLm1peGluKFNvY2tldCwgaW8uRXZlbnRFbWl0dGVyKTtcblxuICAvKipcbiAgICogUmV0dXJucyBhIG5hbWVzcGFjZSBsaXN0ZW5lci9lbWl0dGVyIGZvciB0aGlzIHNvY2tldFxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBTb2NrZXQucHJvdG90eXBlLm9mID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICBpZiAoIXRoaXMubmFtZXNwYWNlc1tuYW1lXSkge1xuICAgICAgdGhpcy5uYW1lc3BhY2VzW25hbWVdID0gbmV3IGlvLlNvY2tldE5hbWVzcGFjZSh0aGlzLCBuYW1lKTtcblxuICAgICAgaWYgKG5hbWUgIT09ICcnKSB7XG4gICAgICAgIHRoaXMubmFtZXNwYWNlc1tuYW1lXS5wYWNrZXQoeyB0eXBlOiAnY29ubmVjdCcgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMubmFtZXNwYWNlc1tuYW1lXTtcbiAgfTtcblxuICAvKipcbiAgICogRW1pdHMgdGhlIGdpdmVuIGV2ZW50IHRvIHRoZSBTb2NrZXQgYW5kIGFsbCBuYW1lc3BhY2VzXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBTb2NrZXQucHJvdG90eXBlLnB1Ymxpc2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5lbWl0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICB2YXIgbnNwO1xuXG4gICAgZm9yICh2YXIgaSBpbiB0aGlzLm5hbWVzcGFjZXMpIHtcbiAgICAgIGlmICh0aGlzLm5hbWVzcGFjZXMuaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgbnNwID0gdGhpcy5vZihpKTtcbiAgICAgICAgbnNwLiRlbWl0LmFwcGx5KG5zcCwgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIFBlcmZvcm1zIHRoZSBoYW5kc2hha2VcbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGVtcHR5ICgpIHsgfTtcblxuICBTb2NrZXQucHJvdG90eXBlLmhhbmRzaGFrZSA9IGZ1bmN0aW9uIChmbikge1xuICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgLCBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuXG4gICAgZnVuY3Rpb24gY29tcGxldGUgKGRhdGEpIHtcbiAgICAgIGlmIChkYXRhIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgc2VsZi5vbkVycm9yKGRhdGEubWVzc2FnZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmbi5hcHBseShudWxsLCBkYXRhLnNwbGl0KCc6JykpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgdXJsID0gW1xuICAgICAgICAgICdodHRwJyArIChvcHRpb25zLnNlY3VyZSA/ICdzJyA6ICcnKSArICc6LydcbiAgICAgICAgLCBvcHRpb25zLmhvc3QgKyAnOicgKyBvcHRpb25zLnBvcnRcbiAgICAgICAgLCBvcHRpb25zLnJlc291cmNlXG4gICAgICAgICwgaW8ucHJvdG9jb2xcbiAgICAgICAgLCBpby51dGlsLnF1ZXJ5KHRoaXMub3B0aW9ucy5xdWVyeSwgJ3Q9JyArICtuZXcgRGF0ZSlcbiAgICAgIF0uam9pbignLycpO1xuXG4gICAgaWYgKHRoaXMuaXNYRG9tYWluKCkgJiYgIWlvLnV0aWwudWEuaGFzQ09SUykge1xuICAgICAgdmFyIGluc2VydEF0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpWzBdXG4gICAgICAgICwgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG5cbiAgICAgIHNjcmlwdC5zcmMgPSB1cmwgKyAnJmpzb25wPScgKyBpby5qLmxlbmd0aDtcbiAgICAgIGluc2VydEF0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHNjcmlwdCwgaW5zZXJ0QXQpO1xuXG4gICAgICBpby5qLnB1c2goZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgY29tcGxldGUoZGF0YSk7XG4gICAgICAgIHNjcmlwdC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHNjcmlwdCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHhociA9IGlvLnV0aWwucmVxdWVzdCgpO1xuXG4gICAgICB4aHIub3BlbignR0VUJywgdXJsLCB0cnVlKTtcbiAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PSA0KSB7XG4gICAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGVtcHR5O1xuXG4gICAgICAgICAgaWYgKHhoci5zdGF0dXMgPT0gMjAwKSB7XG4gICAgICAgICAgICBjb21wbGV0ZSh4aHIucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgIXNlbGYucmVjb25uZWN0aW5nICYmIHNlbGYub25FcnJvcih4aHIucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICB4aHIuc2VuZChudWxsKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIEZpbmQgYW4gYXZhaWxhYmxlIHRyYW5zcG9ydCBiYXNlZCBvbiB0aGUgb3B0aW9ucyBzdXBwbGllZCBpbiB0aGUgY29uc3RydWN0b3IuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBTb2NrZXQucHJvdG90eXBlLmdldFRyYW5zcG9ydCA9IGZ1bmN0aW9uIChvdmVycmlkZSkge1xuICAgIHZhciB0cmFuc3BvcnRzID0gb3ZlcnJpZGUgfHwgdGhpcy50cmFuc3BvcnRzLCBtYXRjaDtcblxuICAgIGZvciAodmFyIGkgPSAwLCB0cmFuc3BvcnQ7IHRyYW5zcG9ydCA9IHRyYW5zcG9ydHNbaV07IGkrKykge1xuICAgICAgaWYgKGlvLlRyYW5zcG9ydFt0cmFuc3BvcnRdXG4gICAgICAgICYmIGlvLlRyYW5zcG9ydFt0cmFuc3BvcnRdLmNoZWNrKHRoaXMpXG4gICAgICAgICYmICghdGhpcy5pc1hEb21haW4oKSB8fCBpby5UcmFuc3BvcnRbdHJhbnNwb3J0XS54ZG9tYWluQ2hlY2soKSkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBpby5UcmFuc3BvcnRbdHJhbnNwb3J0XSh0aGlzLCB0aGlzLnNlc3Npb25pZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG5cbiAgLyoqXG4gICAqIENvbm5lY3RzIHRvIHRoZSBzZXJ2ZXIuXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IFtmbl0gQ2FsbGJhY2suXG4gICAqIEByZXR1cm5zIHtpby5Tb2NrZXR9XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIFNvY2tldC5wcm90b3R5cGUuY29ubmVjdCA9IGZ1bmN0aW9uIChmbikge1xuICAgIGlmICh0aGlzLmNvbm5lY3RpbmcpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuaGFuZHNoYWtlKGZ1bmN0aW9uIChzaWQsIGhlYXJ0YmVhdCwgY2xvc2UsIHRyYW5zcG9ydHMpIHtcbiAgICAgIHNlbGYuc2Vzc2lvbmlkID0gc2lkO1xuICAgICAgc2VsZi5jbG9zZVRpbWVvdXQgPSBjbG9zZSAqIDEwMDA7XG4gICAgICBzZWxmLmhlYXJ0YmVhdFRpbWVvdXQgPSBoZWFydGJlYXQgKiAxMDAwO1xuICAgICAgc2VsZi50cmFuc3BvcnRzID0gaW8udXRpbC5pbnRlcnNlY3QoXG4gICAgICAgICAgdHJhbnNwb3J0cy5zcGxpdCgnLCcpXG4gICAgICAgICwgc2VsZi5vcHRpb25zLnRyYW5zcG9ydHNcbiAgICAgICk7XG5cbiAgICAgIGZ1bmN0aW9uIGNvbm5lY3QgKHRyYW5zcG9ydHMpe1xuICAgICAgICBpZiAoc2VsZi50cmFuc3BvcnQpIHNlbGYudHJhbnNwb3J0LmNsZWFyVGltZW91dHMoKTtcblxuICAgICAgICBzZWxmLnRyYW5zcG9ydCA9IHNlbGYuZ2V0VHJhbnNwb3J0KHRyYW5zcG9ydHMpO1xuICAgICAgICBpZiAoIXNlbGYudHJhbnNwb3J0KSByZXR1cm4gc2VsZi5wdWJsaXNoKCdjb25uZWN0X2ZhaWxlZCcpO1xuXG4gICAgICAgIC8vIG9uY2UgdGhlIHRyYW5zcG9ydCBpcyByZWFkeVxuICAgICAgICBzZWxmLnRyYW5zcG9ydC5yZWFkeShzZWxmLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgc2VsZi5jb25uZWN0aW5nID0gdHJ1ZTtcbiAgICAgICAgICBzZWxmLnB1Ymxpc2goJ2Nvbm5lY3RpbmcnLCBzZWxmLnRyYW5zcG9ydC5uYW1lKTtcbiAgICAgICAgICBzZWxmLnRyYW5zcG9ydC5vcGVuKCk7XG5cbiAgICAgICAgICBpZiAoc2VsZi5vcHRpb25zWydjb25uZWN0IHRpbWVvdXQnXSkge1xuICAgICAgICAgICAgc2VsZi5jb25uZWN0VGltZW91dFRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIGlmICghc2VsZi5jb25uZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmNvbm5lY3RpbmcgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgIGlmIChzZWxmLm9wdGlvbnNbJ3RyeSBtdWx0aXBsZSB0cmFuc3BvcnRzJ10pIHtcbiAgICAgICAgICAgICAgICAgIGlmICghc2VsZi5yZW1haW5pbmdUcmFuc3BvcnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYucmVtYWluaW5nVHJhbnNwb3J0cyA9IHNlbGYudHJhbnNwb3J0cy5zbGljZSgwKTtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgdmFyIHJlbWFpbmluZyA9IHNlbGYucmVtYWluaW5nVHJhbnNwb3J0cztcblxuICAgICAgICAgICAgICAgICAgd2hpbGUgKHJlbWFpbmluZy5sZW5ndGggPiAwICYmIHJlbWFpbmluZy5zcGxpY2UoMCwxKVswXSAhPVxuICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudHJhbnNwb3J0Lm5hbWUpIHt9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlbWFpbmluZy5sZW5ndGgpe1xuICAgICAgICAgICAgICAgICAgICAgIGNvbm5lY3QocmVtYWluaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICBzZWxmLnB1Ymxpc2goJ2Nvbm5lY3RfZmFpbGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHNlbGYub3B0aW9uc1snY29ubmVjdCB0aW1lb3V0J10pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGNvbm5lY3QoKTtcblxuICAgICAgc2VsZi5vbmNlKCdjb25uZWN0JywgZnVuY3Rpb24gKCl7XG4gICAgICAgIGNsZWFyVGltZW91dChzZWxmLmNvbm5lY3RUaW1lb3V0VGltZXIpO1xuXG4gICAgICAgIGZuICYmIHR5cGVvZiBmbiA9PSAnZnVuY3Rpb24nICYmIGZuKCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTZW5kcyBhIG1lc3NhZ2UuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIHBhY2tldC5cbiAgICogQHJldHVybnMge2lvLlNvY2tldH1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgU29ja2V0LnByb3RvdHlwZS5wYWNrZXQgPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgIGlmICh0aGlzLmNvbm5lY3RlZCAmJiAhdGhpcy5kb0J1ZmZlcikge1xuICAgICAgdGhpcy50cmFuc3BvcnQucGFja2V0KGRhdGEpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmJ1ZmZlci5wdXNoKGRhdGEpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTZXRzIGJ1ZmZlciBzdGF0ZVxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgU29ja2V0LnByb3RvdHlwZS5zZXRCdWZmZXIgPSBmdW5jdGlvbiAodikge1xuICAgIHRoaXMuZG9CdWZmZXIgPSB2O1xuXG4gICAgaWYgKCF2ICYmIHRoaXMuY29ubmVjdGVkICYmIHRoaXMuYnVmZmVyLmxlbmd0aCkge1xuICAgICAgdGhpcy50cmFuc3BvcnQucGF5bG9hZCh0aGlzLmJ1ZmZlcik7XG4gICAgICB0aGlzLmJ1ZmZlciA9IFtdO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogRGlzY29ubmVjdCB0aGUgZXN0YWJsaXNoZWQgY29ubmVjdC5cbiAgICpcbiAgICogQHJldHVybnMge2lvLlNvY2tldH1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgU29ja2V0LnByb3RvdHlwZS5kaXNjb25uZWN0ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmNvbm5lY3RlZCkge1xuICAgICAgaWYgKHRoaXMub3Blbikge1xuICAgICAgICB0aGlzLm9mKCcnKS5wYWNrZXQoeyB0eXBlOiAnZGlzY29ubmVjdCcgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIGhhbmRsZSBkaXNjb25uZWN0aW9uIGltbWVkaWF0ZWx5XG4gICAgICB0aGlzLm9uRGlzY29ubmVjdCgnYm9vdGVkJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIERpc2Nvbm5lY3RzIHRoZSBzb2NrZXQgd2l0aCBhIHN5bmMgWEhSLlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgU29ja2V0LnByb3RvdHlwZS5kaXNjb25uZWN0U3luYyA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBlbnN1cmUgZGlzY29ubmVjdGlvblxuICAgIHZhciB4aHIgPSBpby51dGlsLnJlcXVlc3QoKVxuICAgICAgLCB1cmkgPSB0aGlzLnJlc291cmNlICsgJy8nICsgaW8ucHJvdG9jb2wgKyAnLycgKyB0aGlzLnNlc3Npb25pZDtcblxuICAgIHhoci5vcGVuKCdHRVQnLCB1cmksIHRydWUpO1xuXG4gICAgLy8gaGFuZGxlIGRpc2Nvbm5lY3Rpb24gaW1tZWRpYXRlbHlcbiAgICB0aGlzLm9uRGlzY29ubmVjdCgnYm9vdGVkJyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHdlIG5lZWQgdG8gdXNlIGNyb3NzIGRvbWFpbiBlbmFibGVkIHRyYW5zcG9ydHMuIENyb3NzIGRvbWFpbiB3b3VsZFxuICAgKiBiZSBhIGRpZmZlcmVudCBwb3J0IG9yIGRpZmZlcmVudCBkb21haW4gbmFtZS5cbiAgICpcbiAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBTb2NrZXQucHJvdG90eXBlLmlzWERvbWFpbiA9IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBwb3J0ID0gZ2xvYmFsLmxvY2F0aW9uLnBvcnQgfHxcbiAgICAgICgnaHR0cHM6JyA9PSBnbG9iYWwubG9jYXRpb24ucHJvdG9jb2wgPyA0NDMgOiA4MCk7XG5cbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLmhvc3QgIT09IGdsb2JhbC5sb2NhdGlvbi5ob3N0bmFtZSBcbiAgICAgIHx8IHRoaXMub3B0aW9ucy5wb3J0ICE9IHBvcnQ7XG4gIH07XG5cbiAgLyoqXG4gICAqIENhbGxlZCB1cG9uIGhhbmRzaGFrZS5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFNvY2tldC5wcm90b3R5cGUub25Db25uZWN0ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5jb25uZWN0ZWQpIHtcbiAgICAgIHRoaXMuY29ubmVjdGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuY29ubmVjdGluZyA9IGZhbHNlO1xuICAgICAgaWYgKCF0aGlzLmRvQnVmZmVyKSB7XG4gICAgICAgIC8vIG1ha2Ugc3VyZSB0byBmbHVzaCB0aGUgYnVmZmVyXG4gICAgICAgIHRoaXMuc2V0QnVmZmVyKGZhbHNlKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZW1pdCgnY29ubmVjdCcpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIHRyYW5zcG9ydCBvcGVuc1xuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgU29ja2V0LnByb3RvdHlwZS5vbk9wZW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5vcGVuID0gdHJ1ZTtcbiAgfTtcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIHRyYW5zcG9ydCBjbG9zZXMuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBTb2NrZXQucHJvdG90eXBlLm9uQ2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5vcGVuID0gZmFsc2U7XG4gIH07XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSB0cmFuc3BvcnQgZmlyc3Qgb3BlbnMgYSBjb25uZWN0aW9uXG4gICAqXG4gICAqIEBwYXJhbSB0ZXh0XG4gICAqL1xuXG4gIFNvY2tldC5wcm90b3R5cGUub25QYWNrZXQgPSBmdW5jdGlvbiAocGFja2V0KSB7XG4gICAgdGhpcy5vZihwYWNrZXQuZW5kcG9pbnQpLm9uUGFja2V0KHBhY2tldCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgYW4gZXJyb3IuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBTb2NrZXQucHJvdG90eXBlLm9uRXJyb3IgPSBmdW5jdGlvbiAoZXJyKSB7XG4gICAgaWYgKGVyciAmJiBlcnIuYWR2aWNlKSB7XG4gICAgICBpZiAoZXJyLmFkdmljZSA9PT0gJ3JlY29ubmVjdCcgJiYgdGhpcy5jb25uZWN0ZWQpIHtcbiAgICAgICAgdGhpcy5kaXNjb25uZWN0KCk7XG4gICAgICAgIHRoaXMucmVjb25uZWN0KCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5wdWJsaXNoKCdlcnJvcicsIGVyciAmJiBlcnIucmVhc29uID8gZXJyLnJlYXNvbiA6IGVycik7XG4gIH07XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSB0cmFuc3BvcnQgZGlzY29ubmVjdHMuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBTb2NrZXQucHJvdG90eXBlLm9uRGlzY29ubmVjdCA9IGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICB2YXIgd2FzQ29ubmVjdGVkID0gdGhpcy5jb25uZWN0ZWQ7XG5cbiAgICB0aGlzLmNvbm5lY3RlZCA9IGZhbHNlO1xuICAgIHRoaXMuY29ubmVjdGluZyA9IGZhbHNlO1xuICAgIHRoaXMub3BlbiA9IGZhbHNlO1xuXG4gICAgaWYgKHdhc0Nvbm5lY3RlZCkge1xuICAgICAgdGhpcy50cmFuc3BvcnQuY2xvc2UoKTtcbiAgICAgIHRoaXMudHJhbnNwb3J0LmNsZWFyVGltZW91dHMoKTtcbiAgICAgIHRoaXMucHVibGlzaCgnZGlzY29ubmVjdCcsIHJlYXNvbik7XG5cbiAgICAgIGlmICgnYm9vdGVkJyAhPSByZWFzb24gJiYgdGhpcy5vcHRpb25zLnJlY29ubmVjdCAmJiAhdGhpcy5yZWNvbm5lY3RpbmcpIHtcbiAgICAgICAgdGhpcy5yZWNvbm5lY3QoKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIENhbGxlZCB1cG9uIHJlY29ubmVjdGlvbi5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFNvY2tldC5wcm90b3R5cGUucmVjb25uZWN0ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucmVjb25uZWN0aW5nID0gdHJ1ZTtcbiAgICB0aGlzLnJlY29ubmVjdGlvbkF0dGVtcHRzID0gMDtcbiAgICB0aGlzLnJlY29ubmVjdGlvbkRlbGF5ID0gdGhpcy5vcHRpb25zWydyZWNvbm5lY3Rpb24gZGVsYXknXTtcblxuICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgLCBtYXhBdHRlbXB0cyA9IHRoaXMub3B0aW9uc1snbWF4IHJlY29ubmVjdGlvbiBhdHRlbXB0cyddXG4gICAgICAsIHRyeU11bHRpcGxlID0gdGhpcy5vcHRpb25zWyd0cnkgbXVsdGlwbGUgdHJhbnNwb3J0cyddXG4gICAgICAsIGxpbWl0ID0gdGhpcy5vcHRpb25zWydyZWNvbm5lY3Rpb24gbGltaXQnXTtcblxuICAgIGZ1bmN0aW9uIHJlc2V0ICgpIHtcbiAgICAgIGlmIChzZWxmLmNvbm5lY3RlZCkge1xuICAgICAgICBmb3IgKHZhciBpIGluIHNlbGYubmFtZXNwYWNlcykge1xuICAgICAgICAgIGlmIChzZWxmLm5hbWVzcGFjZXMuaGFzT3duUHJvcGVydHkoaSkgJiYgJycgIT09IGkpIHtcbiAgICAgICAgICAgICAgc2VsZi5uYW1lc3BhY2VzW2ldLnBhY2tldCh7IHR5cGU6ICdjb25uZWN0JyB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc2VsZi5wdWJsaXNoKCdyZWNvbm5lY3QnLCBzZWxmLnRyYW5zcG9ydC5uYW1lLCBzZWxmLnJlY29ubmVjdGlvbkF0dGVtcHRzKTtcbiAgICAgIH1cblxuICAgICAgc2VsZi5yZW1vdmVMaXN0ZW5lcignY29ubmVjdF9mYWlsZWQnLCBtYXliZVJlY29ubmVjdCk7XG4gICAgICBzZWxmLnJlbW92ZUxpc3RlbmVyKCdjb25uZWN0JywgbWF5YmVSZWNvbm5lY3QpO1xuXG4gICAgICBzZWxmLnJlY29ubmVjdGluZyA9IGZhbHNlO1xuXG4gICAgICBkZWxldGUgc2VsZi5yZWNvbm5lY3Rpb25BdHRlbXB0cztcbiAgICAgIGRlbGV0ZSBzZWxmLnJlY29ubmVjdGlvbkRlbGF5O1xuICAgICAgZGVsZXRlIHNlbGYucmVjb25uZWN0aW9uVGltZXI7XG4gICAgICBkZWxldGUgc2VsZi5yZWRvVHJhbnNwb3J0cztcblxuICAgICAgc2VsZi5vcHRpb25zWyd0cnkgbXVsdGlwbGUgdHJhbnNwb3J0cyddID0gdHJ5TXVsdGlwbGU7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIG1heWJlUmVjb25uZWN0ICgpIHtcbiAgICAgIGlmICghc2VsZi5yZWNvbm5lY3RpbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoc2VsZi5jb25uZWN0ZWQpIHtcbiAgICAgICAgcmV0dXJuIHJlc2V0KCk7XG4gICAgICB9O1xuXG4gICAgICBpZiAoc2VsZi5jb25uZWN0aW5nICYmIHNlbGYucmVjb25uZWN0aW5nKSB7XG4gICAgICAgIHJldHVybiBzZWxmLnJlY29ubmVjdGlvblRpbWVyID0gc2V0VGltZW91dChtYXliZVJlY29ubmVjdCwgMTAwMCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChzZWxmLnJlY29ubmVjdGlvbkF0dGVtcHRzKysgPj0gbWF4QXR0ZW1wdHMpIHtcbiAgICAgICAgaWYgKCFzZWxmLnJlZG9UcmFuc3BvcnRzKSB7XG4gICAgICAgICAgc2VsZi5vbignY29ubmVjdF9mYWlsZWQnLCBtYXliZVJlY29ubmVjdCk7XG4gICAgICAgICAgc2VsZi5vcHRpb25zWyd0cnkgbXVsdGlwbGUgdHJhbnNwb3J0cyddID0gdHJ1ZTtcbiAgICAgICAgICBzZWxmLnRyYW5zcG9ydCA9IHNlbGYuZ2V0VHJhbnNwb3J0KCk7XG4gICAgICAgICAgc2VsZi5yZWRvVHJhbnNwb3J0cyA9IHRydWU7XG4gICAgICAgICAgc2VsZi5jb25uZWN0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2VsZi5wdWJsaXNoKCdyZWNvbm5lY3RfZmFpbGVkJyk7XG4gICAgICAgICAgcmVzZXQoKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHNlbGYucmVjb25uZWN0aW9uRGVsYXkgPCBsaW1pdCkge1xuICAgICAgICAgIHNlbGYucmVjb25uZWN0aW9uRGVsYXkgKj0gMjsgLy8gZXhwb25lbnRpYWwgYmFjayBvZmZcbiAgICAgICAgfVxuXG4gICAgICAgIHNlbGYuY29ubmVjdCgpO1xuICAgICAgICBzZWxmLnB1Ymxpc2goJ3JlY29ubmVjdGluZycsIHNlbGYucmVjb25uZWN0aW9uRGVsYXksIHNlbGYucmVjb25uZWN0aW9uQXR0ZW1wdHMpO1xuICAgICAgICBzZWxmLnJlY29ubmVjdGlvblRpbWVyID0gc2V0VGltZW91dChtYXliZVJlY29ubmVjdCwgc2VsZi5yZWNvbm5lY3Rpb25EZWxheSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMub3B0aW9uc1sndHJ5IG11bHRpcGxlIHRyYW5zcG9ydHMnXSA9IGZhbHNlO1xuICAgIHRoaXMucmVjb25uZWN0aW9uVGltZXIgPSBzZXRUaW1lb3V0KG1heWJlUmVjb25uZWN0LCB0aGlzLnJlY29ubmVjdGlvbkRlbGF5KTtcblxuICAgIHRoaXMub24oJ2Nvbm5lY3QnLCBtYXliZVJlY29ubmVjdCk7XG4gIH07XG5cbn0pKFxuICAgICd1bmRlZmluZWQnICE9IHR5cGVvZiBpbyA/IGlvIDogbW9kdWxlLmV4cG9ydHNcbiAgLCAndW5kZWZpbmVkJyAhPSB0eXBlb2YgaW8gPyBpbyA6IG1vZHVsZS5wYXJlbnQuZXhwb3J0c1xuICAsIHRoaXNcbik7XG4vKipcbiAqIHNvY2tldC5pb1xuICogQ29weXJpZ2h0KGMpIDIwMTEgTGVhcm5Cb29zdCA8ZGV2QGxlYXJuYm9vc3QuY29tPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxuKGZ1bmN0aW9uIChleHBvcnRzLCBpbykge1xuXG4gIC8qKlxuICAgKiBFeHBvc2UgY29uc3RydWN0b3IuXG4gICAqL1xuXG4gIGV4cG9ydHMuU29ja2V0TmFtZXNwYWNlID0gU29ja2V0TmFtZXNwYWNlO1xuXG4gIC8qKlxuICAgKiBTb2NrZXQgbmFtZXNwYWNlIGNvbnN0cnVjdG9yLlxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgZnVuY3Rpb24gU29ja2V0TmFtZXNwYWNlIChzb2NrZXQsIG5hbWUpIHtcbiAgICB0aGlzLnNvY2tldCA9IHNvY2tldDtcbiAgICB0aGlzLm5hbWUgPSBuYW1lIHx8ICcnO1xuICAgIHRoaXMuZmxhZ3MgPSB7fTtcbiAgICB0aGlzLmpzb24gPSBuZXcgRmxhZyh0aGlzLCAnanNvbicpO1xuICAgIHRoaXMuYWNrUGFja2V0cyA9IDA7XG4gICAgdGhpcy5hY2tzID0ge307XG4gIH07XG5cbiAgLyoqXG4gICAqIEFwcGx5IEV2ZW50RW1pdHRlciBtaXhpbi5cbiAgICovXG5cbiAgaW8udXRpbC5taXhpbihTb2NrZXROYW1lc3BhY2UsIGlvLkV2ZW50RW1pdHRlcik7XG5cbiAgLyoqXG4gICAqIENvcGllcyBlbWl0IHNpbmNlIHdlIG92ZXJyaWRlIGl0XG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBTb2NrZXROYW1lc3BhY2UucHJvdG90eXBlLiRlbWl0ID0gaW8uRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0O1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IG5hbWVzcGFjZSwgYnkgcHJveHlpbmcgdGhlIHJlcXVlc3QgdG8gdGhlIHNvY2tldC4gVGhpc1xuICAgKiBhbGxvd3MgdXMgdG8gdXNlIHRoZSBzeW5heCBhcyB3ZSBkbyBvbiB0aGUgc2VydmVyLlxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBTb2NrZXROYW1lc3BhY2UucHJvdG90eXBlLm9mID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnNvY2tldC5vZi5hcHBseSh0aGlzLnNvY2tldCwgYXJndW1lbnRzKTtcbiAgfTtcblxuICAvKipcbiAgICogU2VuZHMgYSBwYWNrZXQuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBTb2NrZXROYW1lc3BhY2UucHJvdG90eXBlLnBhY2tldCA9IGZ1bmN0aW9uIChwYWNrZXQpIHtcbiAgICBwYWNrZXQuZW5kcG9pbnQgPSB0aGlzLm5hbWU7XG4gICAgdGhpcy5zb2NrZXQucGFja2V0KHBhY2tldCk7XG4gICAgdGhpcy5mbGFncyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTZW5kcyBhIG1lc3NhZ2VcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgU29ja2V0TmFtZXNwYWNlLnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24gKGRhdGEsIGZuKSB7XG4gICAgdmFyIHBhY2tldCA9IHtcbiAgICAgICAgdHlwZTogdGhpcy5mbGFncy5qc29uID8gJ2pzb24nIDogJ21lc3NhZ2UnXG4gICAgICAsIGRhdGE6IGRhdGFcbiAgICB9O1xuXG4gICAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGZuKSB7XG4gICAgICBwYWNrZXQuaWQgPSArK3RoaXMuYWNrUGFja2V0cztcbiAgICAgIHBhY2tldC5hY2sgPSB0cnVlO1xuICAgICAgdGhpcy5hY2tzW3BhY2tldC5pZF0gPSBmbjtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5wYWNrZXQocGFja2V0KTtcbiAgfTtcblxuICAvKipcbiAgICogRW1pdHMgYW4gZXZlbnRcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIFxuICBTb2NrZXROYW1lc3BhY2UucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKVxuICAgICAgLCBsYXN0QXJnID0gYXJnc1thcmdzLmxlbmd0aCAtIDFdXG4gICAgICAsIHBhY2tldCA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdldmVudCdcbiAgICAgICAgICAsIG5hbWU6IG5hbWVcbiAgICAgICAgfTtcblxuICAgIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBsYXN0QXJnKSB7XG4gICAgICBwYWNrZXQuaWQgPSArK3RoaXMuYWNrUGFja2V0cztcbiAgICAgIHBhY2tldC5hY2sgPSAnZGF0YSc7XG4gICAgICB0aGlzLmFja3NbcGFja2V0LmlkXSA9IGxhc3RBcmc7XG4gICAgICBhcmdzID0gYXJncy5zbGljZSgwLCBhcmdzLmxlbmd0aCAtIDEpO1xuICAgIH1cblxuICAgIHBhY2tldC5hcmdzID0gYXJncztcblxuICAgIHJldHVybiB0aGlzLnBhY2tldChwYWNrZXQpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBEaXNjb25uZWN0cyB0aGUgbmFtZXNwYWNlXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBTb2NrZXROYW1lc3BhY2UucHJvdG90eXBlLmRpc2Nvbm5lY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMubmFtZSA9PT0gJycpIHtcbiAgICAgIHRoaXMuc29ja2V0LmRpc2Nvbm5lY3QoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wYWNrZXQoeyB0eXBlOiAnZGlzY29ubmVjdCcgfSk7XG4gICAgICB0aGlzLiRlbWl0KCdkaXNjb25uZWN0Jyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgYSBwYWNrZXRcbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFNvY2tldE5hbWVzcGFjZS5wcm90b3R5cGUub25QYWNrZXQgPSBmdW5jdGlvbiAocGFja2V0KSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgZnVuY3Rpb24gYWNrICgpIHtcbiAgICAgIHNlbGYucGFja2V0KHtcbiAgICAgICAgICB0eXBlOiAnYWNrJ1xuICAgICAgICAsIGFyZ3M6IGlvLnV0aWwudG9BcnJheShhcmd1bWVudHMpXG4gICAgICAgICwgYWNrSWQ6IHBhY2tldC5pZFxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHN3aXRjaCAocGFja2V0LnR5cGUpIHtcbiAgICAgIGNhc2UgJ2Nvbm5lY3QnOlxuICAgICAgICB0aGlzLiRlbWl0KCdjb25uZWN0Jyk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdkaXNjb25uZWN0JzpcbiAgICAgICAgaWYgKHRoaXMubmFtZSA9PT0gJycpIHtcbiAgICAgICAgICB0aGlzLnNvY2tldC5vbkRpc2Nvbm5lY3QocGFja2V0LnJlYXNvbiB8fCAnYm9vdGVkJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy4kZW1pdCgnZGlzY29ubmVjdCcsIHBhY2tldC5yZWFzb24pO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdtZXNzYWdlJzpcbiAgICAgIGNhc2UgJ2pzb24nOlxuICAgICAgICB2YXIgcGFyYW1zID0gWydtZXNzYWdlJywgcGFja2V0LmRhdGFdO1xuXG4gICAgICAgIGlmIChwYWNrZXQuYWNrID09ICdkYXRhJykge1xuICAgICAgICAgIHBhcmFtcy5wdXNoKGFjayk7XG4gICAgICAgIH0gZWxzZSBpZiAocGFja2V0LmFjaykge1xuICAgICAgICAgIHRoaXMucGFja2V0KHsgdHlwZTogJ2FjaycsIGFja0lkOiBwYWNrZXQuaWQgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLiRlbWl0LmFwcGx5KHRoaXMsIHBhcmFtcyk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdldmVudCc6XG4gICAgICAgIHZhciBwYXJhbXMgPSBbcGFja2V0Lm5hbWVdLmNvbmNhdChwYWNrZXQuYXJncyk7XG5cbiAgICAgICAgaWYgKHBhY2tldC5hY2sgPT0gJ2RhdGEnKVxuICAgICAgICAgIHBhcmFtcy5wdXNoKGFjayk7XG5cbiAgICAgICAgdGhpcy4kZW1pdC5hcHBseSh0aGlzLCBwYXJhbXMpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnYWNrJzpcbiAgICAgICAgaWYgKHRoaXMuYWNrc1twYWNrZXQuYWNrSWRdKSB7XG4gICAgICAgICAgdGhpcy5hY2tzW3BhY2tldC5hY2tJZF0uYXBwbHkodGhpcywgcGFja2V0LmFyZ3MpO1xuICAgICAgICAgIGRlbGV0ZSB0aGlzLmFja3NbcGFja2V0LmFja0lkXTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnZXJyb3InOlxuICAgICAgICBpZiAocGFja2V0LmFkdmljZSl7XG4gICAgICAgICAgdGhpcy5zb2NrZXQub25FcnJvcihwYWNrZXQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChwYWNrZXQucmVhc29uID09ICd1bmF1dGhvcml6ZWQnKSB7XG4gICAgICAgICAgICB0aGlzLiRlbWl0KCdjb25uZWN0X2ZhaWxlZCcsIHBhY2tldC5yZWFzb24pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLiRlbWl0KCdlcnJvcicsIHBhY2tldC5yZWFzb24pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIEZsYWcgaW50ZXJmYWNlLlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgZnVuY3Rpb24gRmxhZyAobnNwLCBuYW1lKSB7XG4gICAgdGhpcy5uYW1lc3BhY2UgPSBuc3A7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgfTtcblxuICAvKipcbiAgICogU2VuZCBhIG1lc3NhZ2VcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgRmxhZy5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLm5hbWVzcGFjZS5mbGFnc1t0aGlzLm5hbWVdID0gdHJ1ZTtcbiAgICB0aGlzLm5hbWVzcGFjZS5zZW5kLmFwcGx5KHRoaXMubmFtZXNwYWNlLCBhcmd1bWVudHMpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBFbWl0IGFuIGV2ZW50XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIEZsYWcucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5uYW1lc3BhY2UuZmxhZ3NbdGhpcy5uYW1lXSA9IHRydWU7XG4gICAgdGhpcy5uYW1lc3BhY2UuZW1pdC5hcHBseSh0aGlzLm5hbWVzcGFjZSwgYXJndW1lbnRzKTtcbiAgfTtcblxufSkoXG4gICAgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGlvID8gaW8gOiBtb2R1bGUuZXhwb3J0c1xuICAsICd1bmRlZmluZWQnICE9IHR5cGVvZiBpbyA/IGlvIDogbW9kdWxlLnBhcmVudC5leHBvcnRzXG4pO1xuXG4vKipcbiAqIHNvY2tldC5pb1xuICogQ29weXJpZ2h0KGMpIDIwMTEgTGVhcm5Cb29zdCA8ZGV2QGxlYXJuYm9vc3QuY29tPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxuKGZ1bmN0aW9uIChleHBvcnRzLCBpbywgZ2xvYmFsKSB7XG5cbiAgLyoqXG4gICAqIEV4cG9zZSBjb25zdHJ1Y3Rvci5cbiAgICovXG5cbiAgZXhwb3J0cy53ZWJzb2NrZXQgPSBXUztcblxuICAvKipcbiAgICogVGhlIFdlYlNvY2tldCB0cmFuc3BvcnQgdXNlcyB0aGUgSFRNTDUgV2ViU29ja2V0IEFQSSB0byBlc3RhYmxpc2ggYW5cbiAgICogcGVyc2lzdGVudCBjb25uZWN0aW9uIHdpdGggdGhlIFNvY2tldC5JTyBzZXJ2ZXIuIFRoaXMgdHJhbnNwb3J0IHdpbGwgYWxzb1xuICAgKiBiZSBpbmhlcml0ZWQgYnkgdGhlIEZsYXNoU29ja2V0IGZhbGxiYWNrIGFzIGl0IHByb3ZpZGVzIGEgQVBJIGNvbXBhdGlibGVcbiAgICogcG9seWZpbGwgZm9yIHRoZSBXZWJTb2NrZXRzLlxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQGV4dGVuZHMge2lvLlRyYW5zcG9ydH1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgZnVuY3Rpb24gV1MgKHNvY2tldCkge1xuICAgIGlvLlRyYW5zcG9ydC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBJbmhlcml0cyBmcm9tIFRyYW5zcG9ydC5cbiAgICovXG5cbiAgaW8udXRpbC5pbmhlcml0KFdTLCBpby5UcmFuc3BvcnQpO1xuXG4gIC8qKlxuICAgKiBUcmFuc3BvcnQgbmFtZVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBXUy5wcm90b3R5cGUubmFtZSA9ICd3ZWJzb2NrZXQnO1xuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyBhIG5ldyBgV2ViU29ja2V0YCBjb25uZWN0aW9uIHdpdGggdGhlIFNvY2tldC5JTyBzZXJ2ZXIuIFdlIGF0dGFjaFxuICAgKiBhbGwgdGhlIGFwcHJvcHJpYXRlIGxpc3RlbmVycyB0byBoYW5kbGUgdGhlIHJlc3BvbnNlcyBmcm9tIHRoZSBzZXJ2ZXIuXG4gICAqXG4gICAqIEByZXR1cm5zIHtUcmFuc3BvcnR9XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIFdTLnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBxdWVyeSA9IGlvLnV0aWwucXVlcnkodGhpcy5zb2NrZXQub3B0aW9ucy5xdWVyeSlcbiAgICAgICwgc2VsZiA9IHRoaXNcbiAgICAgICwgU29ja2V0XG5cblxuICAgIGlmICghU29ja2V0KSB7XG4gICAgICBTb2NrZXQgPSBnbG9iYWwuTW96V2ViU29ja2V0IHx8IGdsb2JhbC5XZWJTb2NrZXQ7XG4gICAgfVxuXG4gICAgdGhpcy53ZWJzb2NrZXQgPSBuZXcgU29ja2V0KHRoaXMucHJlcGFyZVVybCgpICsgcXVlcnkpO1xuXG4gICAgdGhpcy53ZWJzb2NrZXQub25vcGVuID0gZnVuY3Rpb24gKCkge1xuICAgICAgc2VsZi5vbk9wZW4oKTtcbiAgICAgIHNlbGYuc29ja2V0LnNldEJ1ZmZlcihmYWxzZSk7XG4gICAgfTtcbiAgICB0aGlzLndlYnNvY2tldC5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAoZXYpIHtcbiAgICAgIHNlbGYub25EYXRhKGV2LmRhdGEpO1xuICAgIH07XG4gICAgdGhpcy53ZWJzb2NrZXQub25jbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHNlbGYub25DbG9zZSgpO1xuICAgICAgc2VsZi5zb2NrZXQuc2V0QnVmZmVyKHRydWUpO1xuICAgIH07XG4gICAgdGhpcy53ZWJzb2NrZXQub25lcnJvciA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICBzZWxmLm9uRXJyb3IoZSk7XG4gICAgfTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTZW5kIGEgbWVzc2FnZSB0byB0aGUgU29ja2V0LklPIHNlcnZlci4gVGhlIG1lc3NhZ2Ugd2lsbCBhdXRvbWF0aWNhbGx5IGJlXG4gICAqIGVuY29kZWQgaW4gdGhlIGNvcnJlY3QgbWVzc2FnZSBmb3JtYXQuXG4gICAqXG4gICAqIEByZXR1cm5zIHtUcmFuc3BvcnR9XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIFdTLnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICB0aGlzLndlYnNvY2tldC5zZW5kKGRhdGEpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBQYXlsb2FkXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBXUy5wcm90b3R5cGUucGF5bG9hZCA9IGZ1bmN0aW9uIChhcnIpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGFyci5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIHRoaXMucGFja2V0KGFycltpXSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBEaXNjb25uZWN0IHRoZSBlc3RhYmxpc2hlZCBgV2ViU29ja2V0YCBjb25uZWN0aW9uLlxuICAgKlxuICAgKiBAcmV0dXJucyB7VHJhbnNwb3J0fVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBXUy5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy53ZWJzb2NrZXQuY2xvc2UoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogSGFuZGxlIHRoZSBlcnJvcnMgdGhhdCBgV2ViU29ja2V0YCBtaWdodCBiZSBnaXZpbmcgd2hlbiB3ZVxuICAgKiBhcmUgYXR0ZW1wdGluZyB0byBjb25uZWN0IG9yIHNlbmQgbWVzc2FnZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7RXJyb3J9IGUgVGhlIGVycm9yLlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgV1MucHJvdG90eXBlLm9uRXJyb3IgPSBmdW5jdGlvbiAoZSkge1xuICAgIHRoaXMuc29ja2V0Lm9uRXJyb3IoZSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGFwcHJvcHJpYXRlIHNjaGVtZSBmb3IgdGhlIFVSSSBnZW5lcmF0aW9uLlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG4gIFdTLnByb3RvdHlwZS5zY2hlbWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuc29ja2V0Lm9wdGlvbnMuc2VjdXJlID8gJ3dzcycgOiAnd3MnO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgdGhlIGJyb3dzZXIgaGFzIHN1cHBvcnQgZm9yIG5hdGl2ZSBgV2ViU29ja2V0c2AgYW5kIHRoYXRcbiAgICogaXQncyBub3QgdGhlIHBvbHlmaWxsIGNyZWF0ZWQgZm9yIHRoZSBGbGFzaFNvY2tldCB0cmFuc3BvcnQuXG4gICAqXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIFdTLmNoZWNrID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAoJ1dlYlNvY2tldCcgaW4gZ2xvYmFsICYmICEoJ19fYWRkVGFzaycgaW4gV2ViU29ja2V0KSlcbiAgICAgICAgICB8fCAnTW96V2ViU29ja2V0JyBpbiBnbG9iYWw7XG4gIH07XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRoZSBgV2ViU29ja2V0YCB0cmFuc3BvcnQgc3VwcG9ydCBjcm9zcyBkb21haW4gY29tbXVuaWNhdGlvbnMuXG4gICAqXG4gICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBXUy54ZG9tYWluQ2hlY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgLyoqXG4gICAqIEFkZCB0aGUgdHJhbnNwb3J0IHRvIHlvdXIgcHVibGljIGlvLnRyYW5zcG9ydHMgYXJyYXkuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBpby50cmFuc3BvcnRzLnB1c2goJ3dlYnNvY2tldCcpO1xuXG59KShcbiAgICAndW5kZWZpbmVkJyAhPSB0eXBlb2YgaW8gPyBpby5UcmFuc3BvcnQgOiBtb2R1bGUuZXhwb3J0c1xuICAsICd1bmRlZmluZWQnICE9IHR5cGVvZiBpbyA/IGlvIDogbW9kdWxlLnBhcmVudC5leHBvcnRzXG4gICwgdGhpc1xuKTtcblxuLyoqXG4gKiBzb2NrZXQuaW9cbiAqIENvcHlyaWdodChjKSAyMDExIExlYXJuQm9vc3QgPGRldkBsZWFybmJvb3N0LmNvbT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbihmdW5jdGlvbiAoZXhwb3J0cywgaW8pIHtcblxuICAvKipcbiAgICogRXhwb3NlIGNvbnN0cnVjdG9yLlxuICAgKi9cblxuICBleHBvcnRzLmZsYXNoc29ja2V0ID0gRmxhc2hzb2NrZXQ7XG5cbiAgLyoqXG4gICAqIFRoZSBGbGFzaFNvY2tldCB0cmFuc3BvcnQuIFRoaXMgaXMgYSBBUEkgd3JhcHBlciBmb3IgdGhlIEhUTUw1IFdlYlNvY2tldFxuICAgKiBzcGVjaWZpY2F0aW9uLiBJdCB1c2VzIGEgLnN3ZiBmaWxlIHRvIGNvbW11bmljYXRlIHdpdGggdGhlIHNlcnZlci4gSWYgeW91IHdhbnRcbiAgICogdG8gc2VydmUgdGhlIC5zd2YgZmlsZSBmcm9tIGEgb3RoZXIgc2VydmVyIHRoYW4gd2hlcmUgdGhlIFNvY2tldC5JTyBzY3JpcHQgaXNcbiAgICogY29taW5nIGZyb20geW91IG5lZWQgdG8gdXNlIHRoZSBpbnNlY3VyZSB2ZXJzaW9uIG9mIHRoZSAuc3dmLiBNb3JlIGluZm9ybWF0aW9uXG4gICAqIGFib3V0IHRoaXMgY2FuIGJlIGZvdW5kIG9uIHRoZSBnaXRodWIgcGFnZS5cbiAgICpcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBleHRlbmRzIHtpby5UcmFuc3BvcnQud2Vic29ja2V0fVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBmdW5jdGlvbiBGbGFzaHNvY2tldCAoKSB7XG4gICAgaW8uVHJhbnNwb3J0LndlYnNvY2tldC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBJbmhlcml0cyBmcm9tIFRyYW5zcG9ydC5cbiAgICovXG5cbiAgaW8udXRpbC5pbmhlcml0KEZsYXNoc29ja2V0LCBpby5UcmFuc3BvcnQud2Vic29ja2V0KTtcblxuICAvKipcbiAgICogVHJhbnNwb3J0IG5hbWVcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgRmxhc2hzb2NrZXQucHJvdG90eXBlLm5hbWUgPSAnZmxhc2hzb2NrZXQnO1xuXG4gIC8qKlxuICAgKiBEaXNjb25uZWN0IHRoZSBlc3RhYmxpc2hlZCBgRmxhc2hTb2NrZXRgIGNvbm5lY3Rpb24uIFRoaXMgaXMgZG9uZSBieSBhZGRpbmcgYSBcbiAgICogbmV3IHRhc2sgdG8gdGhlIEZsYXNoU29ja2V0LiBUaGUgcmVzdCB3aWxsIGJlIGhhbmRsZWQgb2ZmIGJ5IHRoZSBgV2ViU29ja2V0YCBcbiAgICogdHJhbnNwb3J0LlxuICAgKlxuICAgKiBAcmV0dXJucyB7VHJhbnNwb3J0fVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBGbGFzaHNvY2tldC5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICwgYXJncyA9IGFyZ3VtZW50cztcblxuICAgIFdlYlNvY2tldC5fX2FkZFRhc2soZnVuY3Rpb24gKCkge1xuICAgICAgaW8uVHJhbnNwb3J0LndlYnNvY2tldC5wcm90b3R5cGUub3Blbi5hcHBseShzZWxmLCBhcmdzKTtcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgXG4gIC8qKlxuICAgKiBTZW5kcyBhIG1lc3NhZ2UgdG8gdGhlIFNvY2tldC5JTyBzZXJ2ZXIuIFRoaXMgaXMgZG9uZSBieSBhZGRpbmcgYSBuZXdcbiAgICogdGFzayB0byB0aGUgRmxhc2hTb2NrZXQuIFRoZSByZXN0IHdpbGwgYmUgaGFuZGxlZCBvZmYgYnkgdGhlIGBXZWJTb2NrZXRgIFxuICAgKiB0cmFuc3BvcnQuXG4gICAqXG4gICAqIEByZXR1cm5zIHtUcmFuc3BvcnR9XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIEZsYXNoc29ja2V0LnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcywgYXJncyA9IGFyZ3VtZW50cztcbiAgICBXZWJTb2NrZXQuX19hZGRUYXNrKGZ1bmN0aW9uICgpIHtcbiAgICAgIGlvLlRyYW5zcG9ydC53ZWJzb2NrZXQucHJvdG90eXBlLnNlbmQuYXBwbHkoc2VsZiwgYXJncyk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIERpc2Nvbm5lY3RzIHRoZSBlc3RhYmxpc2hlZCBgRmxhc2hTb2NrZXRgIGNvbm5lY3Rpb24uXG4gICAqXG4gICAqIEByZXR1cm5zIHtUcmFuc3BvcnR9XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIEZsYXNoc29ja2V0LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBXZWJTb2NrZXQuX190YXNrcy5sZW5ndGggPSAwO1xuICAgIGlvLlRyYW5zcG9ydC53ZWJzb2NrZXQucHJvdG90eXBlLmNsb3NlLmNhbGwodGhpcyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIFRoZSBXZWJTb2NrZXQgZmFsbCBiYWNrIG5lZWRzIHRvIGFwcGVuZCB0aGUgZmxhc2ggY29udGFpbmVyIHRvIHRoZSBib2R5XG4gICAqIGVsZW1lbnQsIHNvIHdlIG5lZWQgdG8gbWFrZSBzdXJlIHdlIGhhdmUgYWNjZXNzIHRvIGl0LiBPciBkZWZlciB0aGUgY2FsbFxuICAgKiB1bnRpbCB3ZSBhcmUgc3VyZSB0aGVyZSBpcyBhIGJvZHkgZWxlbWVudC5cbiAgICpcbiAgICogQHBhcmFtIHtTb2NrZXR9IHNvY2tldCBUaGUgc29ja2V0IGluc3RhbmNlIHRoYXQgbmVlZHMgYSB0cmFuc3BvcnRcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGNhbGxiYWNrXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBGbGFzaHNvY2tldC5wcm90b3R5cGUucmVhZHkgPSBmdW5jdGlvbiAoc29ja2V0LCBmbikge1xuICAgIGZ1bmN0aW9uIGluaXQgKCkge1xuICAgICAgdmFyIG9wdGlvbnMgPSBzb2NrZXQub3B0aW9uc1xuICAgICAgICAsIHBvcnQgPSBvcHRpb25zWydmbGFzaCBwb2xpY3kgcG9ydCddXG4gICAgICAgICwgcGF0aCA9IFtcbiAgICAgICAgICAgICAgJ2h0dHAnICsgKG9wdGlvbnMuc2VjdXJlID8gJ3MnIDogJycpICsgJzovJ1xuICAgICAgICAgICAgLCBvcHRpb25zLmhvc3QgKyAnOicgKyBvcHRpb25zLnBvcnRcbiAgICAgICAgICAgICwgb3B0aW9ucy5yZXNvdXJjZVxuICAgICAgICAgICAgLCAnc3RhdGljL2ZsYXNoc29ja2V0J1xuICAgICAgICAgICAgLCAnV2ViU29ja2V0TWFpbicgKyAoc29ja2V0LmlzWERvbWFpbigpID8gJ0luc2VjdXJlJyA6ICcnKSArICcuc3dmJ1xuICAgICAgICAgIF07XG5cbiAgICAgIC8vIE9ubHkgc3RhcnQgZG93bmxvYWRpbmcgdGhlIHN3ZiBmaWxlIHdoZW4gdGhlIGNoZWNrZWQgdGhhdCB0aGlzIGJyb3dzZXJcbiAgICAgIC8vIGFjdHVhbGx5IHN1cHBvcnRzIGl0XG4gICAgICBpZiAoIUZsYXNoc29ja2V0LmxvYWRlZCkge1xuICAgICAgICBpZiAodHlwZW9mIFdFQl9TT0NLRVRfU1dGX0xPQ0FUSU9OID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIC8vIFNldCB0aGUgY29ycmVjdCBmaWxlIGJhc2VkIG9uIHRoZSBYRG9tYWluIHNldHRpbmdzXG4gICAgICAgICAgV0VCX1NPQ0tFVF9TV0ZfTE9DQVRJT04gPSBwYXRoLmpvaW4oJy8nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwb3J0ICE9PSA4NDMpIHtcbiAgICAgICAgICBXZWJTb2NrZXQubG9hZEZsYXNoUG9saWN5RmlsZSgneG1sc29ja2V0Oi8vJyArIG9wdGlvbnMuaG9zdCArICc6JyArIHBvcnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgV2ViU29ja2V0Ll9faW5pdGlhbGl6ZSgpO1xuICAgICAgICBGbGFzaHNvY2tldC5sb2FkZWQgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICBmbi5jYWxsKHNlbGYpO1xuICAgIH1cblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAoZG9jdW1lbnQuYm9keSkgcmV0dXJuIGluaXQoKTtcblxuICAgIGlvLnV0aWwubG9hZChpbml0KTtcbiAgfTtcblxuICAvKipcbiAgICogQ2hlY2sgaWYgdGhlIEZsYXNoU29ja2V0IHRyYW5zcG9ydCBpcyBzdXBwb3J0ZWQgYXMgaXQgcmVxdWlyZXMgdGhhdCB0aGUgQWRvYmVcbiAgICogRmxhc2ggUGxheWVyIHBsdWctaW4gdmVyc2lvbiBgMTAuMC4wYCBvciBncmVhdGVyIGlzIGluc3RhbGxlZC4gQW5kIGFsc28gY2hlY2sgaWZcbiAgICogdGhlIHBvbHlmaWxsIGlzIGNvcnJlY3RseSBsb2FkZWQuXG4gICAqXG4gICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBGbGFzaHNvY2tldC5jaGVjayA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoXG4gICAgICAgIHR5cGVvZiBXZWJTb2NrZXQgPT0gJ3VuZGVmaW5lZCdcbiAgICAgIHx8ICEoJ19faW5pdGlhbGl6ZScgaW4gV2ViU29ja2V0KSB8fCAhc3dmb2JqZWN0XG4gICAgKSByZXR1cm4gZmFsc2U7XG5cbiAgICByZXR1cm4gc3dmb2JqZWN0LmdldEZsYXNoUGxheWVyVmVyc2lvbigpLm1ham9yID49IDEwO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGVjayBpZiB0aGUgRmxhc2hTb2NrZXQgdHJhbnNwb3J0IGNhbiBiZSB1c2VkIGFzIGNyb3NzIGRvbWFpbiAvIGNyb3NzIG9yaWdpbiBcbiAgICogdHJhbnNwb3J0LiBCZWNhdXNlIHdlIGNhbid0IHNlZSB3aGljaCB0eXBlIChzZWN1cmUgb3IgaW5zZWN1cmUpIG9mIC5zd2YgaXMgdXNlZFxuICAgKiB3ZSB3aWxsIGp1c3QgcmV0dXJuIHRydWUuXG4gICAqXG4gICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBGbGFzaHNvY2tldC54ZG9tYWluQ2hlY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgLyoqXG4gICAqIERpc2FibGUgQVVUT19JTklUSUFMSVpBVElPTlxuICAgKi9cblxuICBpZiAodHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJykge1xuICAgIFdFQl9TT0NLRVRfRElTQUJMRV9BVVRPX0lOSVRJQUxJWkFUSU9OID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgdGhlIHRyYW5zcG9ydCB0byB5b3VyIHB1YmxpYyBpby50cmFuc3BvcnRzIGFycmF5LlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgaW8udHJhbnNwb3J0cy5wdXNoKCdmbGFzaHNvY2tldCcpO1xufSkoXG4gICAgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGlvID8gaW8uVHJhbnNwb3J0IDogbW9kdWxlLmV4cG9ydHNcbiAgLCAndW5kZWZpbmVkJyAhPSB0eXBlb2YgaW8gPyBpbyA6IG1vZHVsZS5wYXJlbnQuZXhwb3J0c1xuKTtcbi8qXHRTV0ZPYmplY3QgdjIuMiA8aHR0cDovL2NvZGUuZ29vZ2xlLmNvbS9wL3N3Zm9iamVjdC8+IFxuXHRpcyByZWxlYXNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UgPGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwPiBcbiovXG5pZiAoJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIHdpbmRvdykge1xudmFyIHN3Zm9iamVjdD1mdW5jdGlvbigpe3ZhciBEPVwidW5kZWZpbmVkXCIscj1cIm9iamVjdFwiLFM9XCJTaG9ja3dhdmUgRmxhc2hcIixXPVwiU2hvY2t3YXZlRmxhc2guU2hvY2t3YXZlRmxhc2hcIixxPVwiYXBwbGljYXRpb24veC1zaG9ja3dhdmUtZmxhc2hcIixSPVwiU1dGT2JqZWN0RXhwckluc3RcIix4PVwib25yZWFkeXN0YXRlY2hhbmdlXCIsTz13aW5kb3csaj1kb2N1bWVudCx0PW5hdmlnYXRvcixUPWZhbHNlLFU9W2hdLG89W10sTj1bXSxJPVtdLGwsUSxFLEIsSj1mYWxzZSxhPWZhbHNlLG4sRyxtPXRydWUsTT1mdW5jdGlvbigpe3ZhciBhYT10eXBlb2Ygai5nZXRFbGVtZW50QnlJZCE9RCYmdHlwZW9mIGouZ2V0RWxlbWVudHNCeVRhZ05hbWUhPUQmJnR5cGVvZiBqLmNyZWF0ZUVsZW1lbnQhPUQsYWg9dC51c2VyQWdlbnQudG9Mb3dlckNhc2UoKSxZPXQucGxhdGZvcm0udG9Mb3dlckNhc2UoKSxhZT1ZPy93aW4vLnRlc3QoWSk6L3dpbi8udGVzdChhaCksYWM9WT8vbWFjLy50ZXN0KFkpOi9tYWMvLnRlc3QoYWgpLGFmPS93ZWJraXQvLnRlc3QoYWgpP3BhcnNlRmxvYXQoYWgucmVwbGFjZSgvXi4qd2Via2l0XFwvKFxcZCsoXFwuXFxkKyk/KS4qJC8sXCIkMVwiKSk6ZmFsc2UsWD0hK1wiXFx2MVwiLGFnPVswLDAsMF0sYWI9bnVsbDtpZih0eXBlb2YgdC5wbHVnaW5zIT1EJiZ0eXBlb2YgdC5wbHVnaW5zW1NdPT1yKXthYj10LnBsdWdpbnNbU10uZGVzY3JpcHRpb247aWYoYWImJiEodHlwZW9mIHQubWltZVR5cGVzIT1EJiZ0Lm1pbWVUeXBlc1txXSYmIXQubWltZVR5cGVzW3FdLmVuYWJsZWRQbHVnaW4pKXtUPXRydWU7WD1mYWxzZTthYj1hYi5yZXBsYWNlKC9eLipcXHMrKFxcUytcXHMrXFxTKyQpLyxcIiQxXCIpO2FnWzBdPXBhcnNlSW50KGFiLnJlcGxhY2UoL14oLiopXFwuLiokLyxcIiQxXCIpLDEwKTthZ1sxXT1wYXJzZUludChhYi5yZXBsYWNlKC9eLipcXC4oLiopXFxzLiokLyxcIiQxXCIpLDEwKTthZ1syXT0vW2EtekEtWl0vLnRlc3QoYWIpP3BhcnNlSW50KGFiLnJlcGxhY2UoL14uKlthLXpBLVpdKyguKikkLyxcIiQxXCIpLDEwKTowfX1lbHNle2lmKHR5cGVvZiBPLkFjdGl2ZVhPYmplY3QhPUQpe3RyeXt2YXIgYWQ9bmV3IEFjdGl2ZVhPYmplY3QoVyk7aWYoYWQpe2FiPWFkLkdldFZhcmlhYmxlKFwiJHZlcnNpb25cIik7aWYoYWIpe1g9dHJ1ZTthYj1hYi5zcGxpdChcIiBcIilbMV0uc3BsaXQoXCIsXCIpO2FnPVtwYXJzZUludChhYlswXSwxMCkscGFyc2VJbnQoYWJbMV0sMTApLHBhcnNlSW50KGFiWzJdLDEwKV19fX1jYXRjaChaKXt9fX1yZXR1cm57dzM6YWEscHY6YWcsd2s6YWYsaWU6WCx3aW46YWUsbWFjOmFjfX0oKSxrPWZ1bmN0aW9uKCl7aWYoIU0udzMpe3JldHVybn1pZigodHlwZW9mIGoucmVhZHlTdGF0ZSE9RCYmai5yZWFkeVN0YXRlPT1cImNvbXBsZXRlXCIpfHwodHlwZW9mIGoucmVhZHlTdGF0ZT09RCYmKGouZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJib2R5XCIpWzBdfHxqLmJvZHkpKSl7ZigpfWlmKCFKKXtpZih0eXBlb2Ygai5hZGRFdmVudExpc3RlbmVyIT1EKXtqLmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsZixmYWxzZSl9aWYoTS5pZSYmTS53aW4pe2ouYXR0YWNoRXZlbnQoeCxmdW5jdGlvbigpe2lmKGoucmVhZHlTdGF0ZT09XCJjb21wbGV0ZVwiKXtqLmRldGFjaEV2ZW50KHgsYXJndW1lbnRzLmNhbGxlZSk7ZigpfX0pO2lmKE89PXRvcCl7KGZ1bmN0aW9uKCl7aWYoSil7cmV0dXJufXRyeXtqLmRvY3VtZW50RWxlbWVudC5kb1Njcm9sbChcImxlZnRcIil9Y2F0Y2goWCl7c2V0VGltZW91dChhcmd1bWVudHMuY2FsbGVlLDApO3JldHVybn1mKCl9KSgpfX1pZihNLndrKXsoZnVuY3Rpb24oKXtpZihKKXtyZXR1cm59aWYoIS9sb2FkZWR8Y29tcGxldGUvLnRlc3Qoai5yZWFkeVN0YXRlKSl7c2V0VGltZW91dChhcmd1bWVudHMuY2FsbGVlLDApO3JldHVybn1mKCl9KSgpfXMoZil9fSgpO2Z1bmN0aW9uIGYoKXtpZihKKXtyZXR1cm59dHJ5e3ZhciBaPWouZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJib2R5XCIpWzBdLmFwcGVuZENoaWxkKEMoXCJzcGFuXCIpKTtaLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoWil9Y2F0Y2goYWEpe3JldHVybn1KPXRydWU7dmFyIFg9VS5sZW5ndGg7Zm9yKHZhciBZPTA7WTxYO1krKyl7VVtZXSgpfX1mdW5jdGlvbiBLKFgpe2lmKEope1goKX1lbHNle1VbVS5sZW5ndGhdPVh9fWZ1bmN0aW9uIHMoWSl7aWYodHlwZW9mIE8uYWRkRXZlbnRMaXN0ZW5lciE9RCl7Ty5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLFksZmFsc2UpfWVsc2V7aWYodHlwZW9mIGouYWRkRXZlbnRMaXN0ZW5lciE9RCl7ai5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLFksZmFsc2UpfWVsc2V7aWYodHlwZW9mIE8uYXR0YWNoRXZlbnQhPUQpe2koTyxcIm9ubG9hZFwiLFkpfWVsc2V7aWYodHlwZW9mIE8ub25sb2FkPT1cImZ1bmN0aW9uXCIpe3ZhciBYPU8ub25sb2FkO08ub25sb2FkPWZ1bmN0aW9uKCl7WCgpO1koKX19ZWxzZXtPLm9ubG9hZD1ZfX19fX1mdW5jdGlvbiBoKCl7aWYoVCl7VigpfWVsc2V7SCgpfX1mdW5jdGlvbiBWKCl7dmFyIFg9ai5nZXRFbGVtZW50c0J5VGFnTmFtZShcImJvZHlcIilbMF07dmFyIGFhPUMocik7YWEuc2V0QXR0cmlidXRlKFwidHlwZVwiLHEpO3ZhciBaPVguYXBwZW5kQ2hpbGQoYWEpO2lmKFope3ZhciBZPTA7KGZ1bmN0aW9uKCl7aWYodHlwZW9mIFouR2V0VmFyaWFibGUhPUQpe3ZhciBhYj1aLkdldFZhcmlhYmxlKFwiJHZlcnNpb25cIik7aWYoYWIpe2FiPWFiLnNwbGl0KFwiIFwiKVsxXS5zcGxpdChcIixcIik7TS5wdj1bcGFyc2VJbnQoYWJbMF0sMTApLHBhcnNlSW50KGFiWzFdLDEwKSxwYXJzZUludChhYlsyXSwxMCldfX1lbHNle2lmKFk8MTApe1krKztzZXRUaW1lb3V0KGFyZ3VtZW50cy5jYWxsZWUsMTApO3JldHVybn19WC5yZW1vdmVDaGlsZChhYSk7Wj1udWxsO0goKX0pKCl9ZWxzZXtIKCl9fWZ1bmN0aW9uIEgoKXt2YXIgYWc9by5sZW5ndGg7aWYoYWc+MCl7Zm9yKHZhciBhZj0wO2FmPGFnO2FmKyspe3ZhciBZPW9bYWZdLmlkO3ZhciBhYj1vW2FmXS5jYWxsYmFja0ZuO3ZhciBhYT17c3VjY2VzczpmYWxzZSxpZDpZfTtpZihNLnB2WzBdPjApe3ZhciBhZT1jKFkpO2lmKGFlKXtpZihGKG9bYWZdLnN3ZlZlcnNpb24pJiYhKE0ud2smJk0ud2s8MzEyKSl7dyhZLHRydWUpO2lmKGFiKXthYS5zdWNjZXNzPXRydWU7YWEucmVmPXooWSk7YWIoYWEpfX1lbHNle2lmKG9bYWZdLmV4cHJlc3NJbnN0YWxsJiZBKCkpe3ZhciBhaT17fTthaS5kYXRhPW9bYWZdLmV4cHJlc3NJbnN0YWxsO2FpLndpZHRoPWFlLmdldEF0dHJpYnV0ZShcIndpZHRoXCIpfHxcIjBcIjthaS5oZWlnaHQ9YWUuZ2V0QXR0cmlidXRlKFwiaGVpZ2h0XCIpfHxcIjBcIjtpZihhZS5nZXRBdHRyaWJ1dGUoXCJjbGFzc1wiKSl7YWkuc3R5bGVjbGFzcz1hZS5nZXRBdHRyaWJ1dGUoXCJjbGFzc1wiKX1pZihhZS5nZXRBdHRyaWJ1dGUoXCJhbGlnblwiKSl7YWkuYWxpZ249YWUuZ2V0QXR0cmlidXRlKFwiYWxpZ25cIil9dmFyIGFoPXt9O3ZhciBYPWFlLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwicGFyYW1cIik7dmFyIGFjPVgubGVuZ3RoO2Zvcih2YXIgYWQ9MDthZDxhYzthZCsrKXtpZihYW2FkXS5nZXRBdHRyaWJ1dGUoXCJuYW1lXCIpLnRvTG93ZXJDYXNlKCkhPVwibW92aWVcIil7YWhbWFthZF0uZ2V0QXR0cmlidXRlKFwibmFtZVwiKV09WFthZF0uZ2V0QXR0cmlidXRlKFwidmFsdWVcIil9fVAoYWksYWgsWSxhYil9ZWxzZXtwKGFlKTtpZihhYil7YWIoYWEpfX19fX1lbHNle3coWSx0cnVlKTtpZihhYil7dmFyIFo9eihZKTtpZihaJiZ0eXBlb2YgWi5TZXRWYXJpYWJsZSE9RCl7YWEuc3VjY2Vzcz10cnVlO2FhLnJlZj1afWFiKGFhKX19fX19ZnVuY3Rpb24geihhYSl7dmFyIFg9bnVsbDt2YXIgWT1jKGFhKTtpZihZJiZZLm5vZGVOYW1lPT1cIk9CSkVDVFwiKXtpZih0eXBlb2YgWS5TZXRWYXJpYWJsZSE9RCl7WD1ZfWVsc2V7dmFyIFo9WS5nZXRFbGVtZW50c0J5VGFnTmFtZShyKVswXTtpZihaKXtYPVp9fX1yZXR1cm4gWH1mdW5jdGlvbiBBKCl7cmV0dXJuICFhJiZGKFwiNi4wLjY1XCIpJiYoTS53aW58fE0ubWFjKSYmIShNLndrJiZNLndrPDMxMil9ZnVuY3Rpb24gUChhYSxhYixYLFope2E9dHJ1ZTtFPVp8fG51bGw7Qj17c3VjY2VzczpmYWxzZSxpZDpYfTt2YXIgYWU9YyhYKTtpZihhZSl7aWYoYWUubm9kZU5hbWU9PVwiT0JKRUNUXCIpe2w9ZyhhZSk7UT1udWxsfWVsc2V7bD1hZTtRPVh9YWEuaWQ9UjtpZih0eXBlb2YgYWEud2lkdGg9PUR8fCghLyUkLy50ZXN0KGFhLndpZHRoKSYmcGFyc2VJbnQoYWEud2lkdGgsMTApPDMxMCkpe2FhLndpZHRoPVwiMzEwXCJ9aWYodHlwZW9mIGFhLmhlaWdodD09RHx8KCEvJSQvLnRlc3QoYWEuaGVpZ2h0KSYmcGFyc2VJbnQoYWEuaGVpZ2h0LDEwKTwxMzcpKXthYS5oZWlnaHQ9XCIxMzdcIn1qLnRpdGxlPWoudGl0bGUuc2xpY2UoMCw0NykrXCIgLSBGbGFzaCBQbGF5ZXIgSW5zdGFsbGF0aW9uXCI7dmFyIGFkPU0uaWUmJk0ud2luP1wiQWN0aXZlWFwiOlwiUGx1Z0luXCIsYWM9XCJNTXJlZGlyZWN0VVJMPVwiK08ubG9jYXRpb24udG9TdHJpbmcoKS5yZXBsYWNlKC8mL2csXCIlMjZcIikrXCImTU1wbGF5ZXJUeXBlPVwiK2FkK1wiJk1NZG9jdGl0bGU9XCIrai50aXRsZTtpZih0eXBlb2YgYWIuZmxhc2h2YXJzIT1EKXthYi5mbGFzaHZhcnMrPVwiJlwiK2FjfWVsc2V7YWIuZmxhc2h2YXJzPWFjfWlmKE0uaWUmJk0ud2luJiZhZS5yZWFkeVN0YXRlIT00KXt2YXIgWT1DKFwiZGl2XCIpO1grPVwiU1dGT2JqZWN0TmV3XCI7WS5zZXRBdHRyaWJ1dGUoXCJpZFwiLFgpO2FlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKFksYWUpO2FlLnN0eWxlLmRpc3BsYXk9XCJub25lXCI7KGZ1bmN0aW9uKCl7aWYoYWUucmVhZHlTdGF0ZT09NCl7YWUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChhZSl9ZWxzZXtzZXRUaW1lb3V0KGFyZ3VtZW50cy5jYWxsZWUsMTApfX0pKCl9dShhYSxhYixYKX19ZnVuY3Rpb24gcChZKXtpZihNLmllJiZNLndpbiYmWS5yZWFkeVN0YXRlIT00KXt2YXIgWD1DKFwiZGl2XCIpO1kucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoWCxZKTtYLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKGcoWSksWCk7WS5zdHlsZS5kaXNwbGF5PVwibm9uZVwiOyhmdW5jdGlvbigpe2lmKFkucmVhZHlTdGF0ZT09NCl7WS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKFkpfWVsc2V7c2V0VGltZW91dChhcmd1bWVudHMuY2FsbGVlLDEwKX19KSgpfWVsc2V7WS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChnKFkpLFkpfX1mdW5jdGlvbiBnKGFiKXt2YXIgYWE9QyhcImRpdlwiKTtpZihNLndpbiYmTS5pZSl7YWEuaW5uZXJIVE1MPWFiLmlubmVySFRNTH1lbHNle3ZhciBZPWFiLmdldEVsZW1lbnRzQnlUYWdOYW1lKHIpWzBdO2lmKFkpe3ZhciBhZD1ZLmNoaWxkTm9kZXM7aWYoYWQpe3ZhciBYPWFkLmxlbmd0aDtmb3IodmFyIFo9MDtaPFg7WisrKXtpZighKGFkW1pdLm5vZGVUeXBlPT0xJiZhZFtaXS5ub2RlTmFtZT09XCJQQVJBTVwiKSYmIShhZFtaXS5ub2RlVHlwZT09OCkpe2FhLmFwcGVuZENoaWxkKGFkW1pdLmNsb25lTm9kZSh0cnVlKSl9fX19fXJldHVybiBhYX1mdW5jdGlvbiB1KGFpLGFnLFkpe3ZhciBYLGFhPWMoWSk7aWYoTS53ayYmTS53azwzMTIpe3JldHVybiBYfWlmKGFhKXtpZih0eXBlb2YgYWkuaWQ9PUQpe2FpLmlkPVl9aWYoTS5pZSYmTS53aW4pe3ZhciBhaD1cIlwiO2Zvcih2YXIgYWUgaW4gYWkpe2lmKGFpW2FlXSE9T2JqZWN0LnByb3RvdHlwZVthZV0pe2lmKGFlLnRvTG93ZXJDYXNlKCk9PVwiZGF0YVwiKXthZy5tb3ZpZT1haVthZV19ZWxzZXtpZihhZS50b0xvd2VyQ2FzZSgpPT1cInN0eWxlY2xhc3NcIil7YWgrPScgY2xhc3M9XCInK2FpW2FlXSsnXCInfWVsc2V7aWYoYWUudG9Mb3dlckNhc2UoKSE9XCJjbGFzc2lkXCIpe2FoKz1cIiBcIithZSsnPVwiJythaVthZV0rJ1wiJ319fX19dmFyIGFmPVwiXCI7Zm9yKHZhciBhZCBpbiBhZyl7aWYoYWdbYWRdIT1PYmplY3QucHJvdG90eXBlW2FkXSl7YWYrPSc8cGFyYW0gbmFtZT1cIicrYWQrJ1wiIHZhbHVlPVwiJythZ1thZF0rJ1wiIC8+J319YWEub3V0ZXJIVE1MPSc8b2JqZWN0IGNsYXNzaWQ9XCJjbHNpZDpEMjdDREI2RS1BRTZELTExY2YtOTZCOC00NDQ1NTM1NDAwMDBcIicrYWgrXCI+XCIrYWYrXCI8L29iamVjdD5cIjtOW04ubGVuZ3RoXT1haS5pZDtYPWMoYWkuaWQpfWVsc2V7dmFyIFo9QyhyKTtaLnNldEF0dHJpYnV0ZShcInR5cGVcIixxKTtmb3IodmFyIGFjIGluIGFpKXtpZihhaVthY10hPU9iamVjdC5wcm90b3R5cGVbYWNdKXtpZihhYy50b0xvd2VyQ2FzZSgpPT1cInN0eWxlY2xhc3NcIil7Wi5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLGFpW2FjXSl9ZWxzZXtpZihhYy50b0xvd2VyQ2FzZSgpIT1cImNsYXNzaWRcIil7Wi5zZXRBdHRyaWJ1dGUoYWMsYWlbYWNdKX19fX1mb3IodmFyIGFiIGluIGFnKXtpZihhZ1thYl0hPU9iamVjdC5wcm90b3R5cGVbYWJdJiZhYi50b0xvd2VyQ2FzZSgpIT1cIm1vdmllXCIpe2UoWixhYixhZ1thYl0pfX1hYS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChaLGFhKTtYPVp9fXJldHVybiBYfWZ1bmN0aW9uIGUoWixYLFkpe3ZhciBhYT1DKFwicGFyYW1cIik7YWEuc2V0QXR0cmlidXRlKFwibmFtZVwiLFgpO2FhLnNldEF0dHJpYnV0ZShcInZhbHVlXCIsWSk7Wi5hcHBlbmRDaGlsZChhYSl9ZnVuY3Rpb24geShZKXt2YXIgWD1jKFkpO2lmKFgmJlgubm9kZU5hbWU9PVwiT0JKRUNUXCIpe2lmKE0uaWUmJk0ud2luKXtYLnN0eWxlLmRpc3BsYXk9XCJub25lXCI7KGZ1bmN0aW9uKCl7aWYoWC5yZWFkeVN0YXRlPT00KXtiKFkpfWVsc2V7c2V0VGltZW91dChhcmd1bWVudHMuY2FsbGVlLDEwKX19KSgpfWVsc2V7WC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKFgpfX19ZnVuY3Rpb24gYihaKXt2YXIgWT1jKFopO2lmKFkpe2Zvcih2YXIgWCBpbiBZKXtpZih0eXBlb2YgWVtYXT09XCJmdW5jdGlvblwiKXtZW1hdPW51bGx9fVkucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChZKX19ZnVuY3Rpb24gYyhaKXt2YXIgWD1udWxsO3RyeXtYPWouZ2V0RWxlbWVudEJ5SWQoWil9Y2F0Y2goWSl7fXJldHVybiBYfWZ1bmN0aW9uIEMoWCl7cmV0dXJuIGouY3JlYXRlRWxlbWVudChYKX1mdW5jdGlvbiBpKFosWCxZKXtaLmF0dGFjaEV2ZW50KFgsWSk7SVtJLmxlbmd0aF09W1osWCxZXX1mdW5jdGlvbiBGKFope3ZhciBZPU0ucHYsWD1aLnNwbGl0KFwiLlwiKTtYWzBdPXBhcnNlSW50KFhbMF0sMTApO1hbMV09cGFyc2VJbnQoWFsxXSwxMCl8fDA7WFsyXT1wYXJzZUludChYWzJdLDEwKXx8MDtyZXR1cm4oWVswXT5YWzBdfHwoWVswXT09WFswXSYmWVsxXT5YWzFdKXx8KFlbMF09PVhbMF0mJllbMV09PVhbMV0mJllbMl0+PVhbMl0pKT90cnVlOmZhbHNlfWZ1bmN0aW9uIHYoYWMsWSxhZCxhYil7aWYoTS5pZSYmTS5tYWMpe3JldHVybn12YXIgYWE9ai5nZXRFbGVtZW50c0J5VGFnTmFtZShcImhlYWRcIilbMF07aWYoIWFhKXtyZXR1cm59dmFyIFg9KGFkJiZ0eXBlb2YgYWQ9PVwic3RyaW5nXCIpP2FkOlwic2NyZWVuXCI7aWYoYWIpe249bnVsbDtHPW51bGx9aWYoIW58fEchPVgpe3ZhciBaPUMoXCJzdHlsZVwiKTtaLnNldEF0dHJpYnV0ZShcInR5cGVcIixcInRleHQvY3NzXCIpO1ouc2V0QXR0cmlidXRlKFwibWVkaWFcIixYKTtuPWFhLmFwcGVuZENoaWxkKFopO2lmKE0uaWUmJk0ud2luJiZ0eXBlb2Ygai5zdHlsZVNoZWV0cyE9RCYmai5zdHlsZVNoZWV0cy5sZW5ndGg+MCl7bj1qLnN0eWxlU2hlZXRzW2ouc3R5bGVTaGVldHMubGVuZ3RoLTFdfUc9WH1pZihNLmllJiZNLndpbil7aWYobiYmdHlwZW9mIG4uYWRkUnVsZT09cil7bi5hZGRSdWxlKGFjLFkpfX1lbHNle2lmKG4mJnR5cGVvZiBqLmNyZWF0ZVRleHROb2RlIT1EKXtuLmFwcGVuZENoaWxkKGouY3JlYXRlVGV4dE5vZGUoYWMrXCIge1wiK1krXCJ9XCIpKX19fWZ1bmN0aW9uIHcoWixYKXtpZighbSl7cmV0dXJufXZhciBZPVg/XCJ2aXNpYmxlXCI6XCJoaWRkZW5cIjtpZihKJiZjKFopKXtjKFopLnN0eWxlLnZpc2liaWxpdHk9WX1lbHNle3YoXCIjXCIrWixcInZpc2liaWxpdHk6XCIrWSl9fWZ1bmN0aW9uIEwoWSl7dmFyIFo9L1tcXFxcXFxcIjw+XFwuO10vO3ZhciBYPVouZXhlYyhZKSE9bnVsbDtyZXR1cm4gWCYmdHlwZW9mIGVuY29kZVVSSUNvbXBvbmVudCE9RD9lbmNvZGVVUklDb21wb25lbnQoWSk6WX12YXIgZD1mdW5jdGlvbigpe2lmKE0uaWUmJk0ud2luKXt3aW5kb3cuYXR0YWNoRXZlbnQoXCJvbnVubG9hZFwiLGZ1bmN0aW9uKCl7dmFyIGFjPUkubGVuZ3RoO2Zvcih2YXIgYWI9MDthYjxhYzthYisrKXtJW2FiXVswXS5kZXRhY2hFdmVudChJW2FiXVsxXSxJW2FiXVsyXSl9dmFyIFo9Ti5sZW5ndGg7Zm9yKHZhciBhYT0wO2FhPFo7YWErKyl7eShOW2FhXSl9Zm9yKHZhciBZIGluIE0pe01bWV09bnVsbH1NPW51bGw7Zm9yKHZhciBYIGluIHN3Zm9iamVjdCl7c3dmb2JqZWN0W1hdPW51bGx9c3dmb2JqZWN0PW51bGx9KX19KCk7cmV0dXJue3JlZ2lzdGVyT2JqZWN0OmZ1bmN0aW9uKGFiLFgsYWEsWil7aWYoTS53MyYmYWImJlgpe3ZhciBZPXt9O1kuaWQ9YWI7WS5zd2ZWZXJzaW9uPVg7WS5leHByZXNzSW5zdGFsbD1hYTtZLmNhbGxiYWNrRm49WjtvW28ubGVuZ3RoXT1ZO3coYWIsZmFsc2UpfWVsc2V7aWYoWil7Wih7c3VjY2VzczpmYWxzZSxpZDphYn0pfX19LGdldE9iamVjdEJ5SWQ6ZnVuY3Rpb24oWCl7aWYoTS53Myl7cmV0dXJuIHooWCl9fSxlbWJlZFNXRjpmdW5jdGlvbihhYixhaCxhZSxhZyxZLGFhLFosYWQsYWYsYWMpe3ZhciBYPXtzdWNjZXNzOmZhbHNlLGlkOmFofTtpZihNLnczJiYhKE0ud2smJk0ud2s8MzEyKSYmYWImJmFoJiZhZSYmYWcmJlkpe3coYWgsZmFsc2UpO0soZnVuY3Rpb24oKXthZSs9XCJcIjthZys9XCJcIjt2YXIgYWo9e307aWYoYWYmJnR5cGVvZiBhZj09PXIpe2Zvcih2YXIgYWwgaW4gYWYpe2FqW2FsXT1hZlthbF19fWFqLmRhdGE9YWI7YWoud2lkdGg9YWU7YWouaGVpZ2h0PWFnO3ZhciBhbT17fTtpZihhZCYmdHlwZW9mIGFkPT09cil7Zm9yKHZhciBhayBpbiBhZCl7YW1bYWtdPWFkW2FrXX19aWYoWiYmdHlwZW9mIFo9PT1yKXtmb3IodmFyIGFpIGluIFope2lmKHR5cGVvZiBhbS5mbGFzaHZhcnMhPUQpe2FtLmZsYXNodmFycys9XCImXCIrYWkrXCI9XCIrWlthaV19ZWxzZXthbS5mbGFzaHZhcnM9YWkrXCI9XCIrWlthaV19fX1pZihGKFkpKXt2YXIgYW49dShhaixhbSxhaCk7aWYoYWouaWQ9PWFoKXt3KGFoLHRydWUpfVguc3VjY2Vzcz10cnVlO1gucmVmPWFufWVsc2V7aWYoYWEmJkEoKSl7YWouZGF0YT1hYTtQKGFqLGFtLGFoLGFjKTtyZXR1cm59ZWxzZXt3KGFoLHRydWUpfX1pZihhYyl7YWMoWCl9fSl9ZWxzZXtpZihhYyl7YWMoWCl9fX0sc3dpdGNoT2ZmQXV0b0hpZGVTaG93OmZ1bmN0aW9uKCl7bT1mYWxzZX0sdWE6TSxnZXRGbGFzaFBsYXllclZlcnNpb246ZnVuY3Rpb24oKXtyZXR1cm57bWFqb3I6TS5wdlswXSxtaW5vcjpNLnB2WzFdLHJlbGVhc2U6TS5wdlsyXX19LGhhc0ZsYXNoUGxheWVyVmVyc2lvbjpGLGNyZWF0ZVNXRjpmdW5jdGlvbihaLFksWCl7aWYoTS53Myl7cmV0dXJuIHUoWixZLFgpfWVsc2V7cmV0dXJuIHVuZGVmaW5lZH19LHNob3dFeHByZXNzSW5zdGFsbDpmdW5jdGlvbihaLGFhLFgsWSl7aWYoTS53MyYmQSgpKXtQKFosYWEsWCxZKX19LHJlbW92ZVNXRjpmdW5jdGlvbihYKXtpZihNLnczKXt5KFgpfX0sY3JlYXRlQ1NTOmZ1bmN0aW9uKGFhLFosWSxYKXtpZihNLnczKXt2KGFhLFosWSxYKX19LGFkZERvbUxvYWRFdmVudDpLLGFkZExvYWRFdmVudDpzLGdldFF1ZXJ5UGFyYW1WYWx1ZTpmdW5jdGlvbihhYSl7dmFyIFo9ai5sb2NhdGlvbi5zZWFyY2h8fGoubG9jYXRpb24uaGFzaDtpZihaKXtpZigvXFw/Ly50ZXN0KFopKXtaPVouc3BsaXQoXCI/XCIpWzFdfWlmKGFhPT1udWxsKXtyZXR1cm4gTChaKX12YXIgWT1aLnNwbGl0KFwiJlwiKTtmb3IodmFyIFg9MDtYPFkubGVuZ3RoO1grKyl7aWYoWVtYXS5zdWJzdHJpbmcoMCxZW1hdLmluZGV4T2YoXCI9XCIpKT09YWEpe3JldHVybiBMKFlbWF0uc3Vic3RyaW5nKChZW1hdLmluZGV4T2YoXCI9XCIpKzEpKSl9fX1yZXR1cm5cIlwifSxleHByZXNzSW5zdGFsbENhbGxiYWNrOmZ1bmN0aW9uKCl7aWYoYSl7dmFyIFg9YyhSKTtpZihYJiZsKXtYLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKGwsWCk7aWYoUSl7dyhRLHRydWUpO2lmKE0uaWUmJk0ud2luKXtsLnN0eWxlLmRpc3BsYXk9XCJibG9ja1wifX1pZihFKXtFKEIpfX1hPWZhbHNlfX19fSgpO1xufVxuLy8gQ29weXJpZ2h0OiBIaXJvc2hpIEljaGlrYXdhIDxodHRwOi8vZ2ltaXRlLm5ldC9lbi8+XG4vLyBMaWNlbnNlOiBOZXcgQlNEIExpY2Vuc2Vcbi8vIFJlZmVyZW5jZTogaHR0cDovL2Rldi53My5vcmcvaHRtbDUvd2Vic29ja2V0cy9cbi8vIFJlZmVyZW5jZTogaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvZHJhZnQtaGl4aWUtdGhld2Vic29ja2V0cHJvdG9jb2xcblxuKGZ1bmN0aW9uKCkge1xuICBcbiAgaWYgKCd1bmRlZmluZWQnID09IHR5cGVvZiB3aW5kb3cgfHwgd2luZG93LldlYlNvY2tldCkgcmV0dXJuO1xuXG4gIHZhciBjb25zb2xlID0gd2luZG93LmNvbnNvbGU7XG4gIGlmICghY29uc29sZSB8fCAhY29uc29sZS5sb2cgfHwgIWNvbnNvbGUuZXJyb3IpIHtcbiAgICBjb25zb2xlID0ge2xvZzogZnVuY3Rpb24oKXsgfSwgZXJyb3I6IGZ1bmN0aW9uKCl7IH19O1xuICB9XG4gIFxuICBpZiAoIXN3Zm9iamVjdC5oYXNGbGFzaFBsYXllclZlcnNpb24oXCIxMC4wLjBcIikpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiRmxhc2ggUGxheWVyID49IDEwLjAuMCBpcyByZXF1aXJlZC5cIik7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChsb2NhdGlvbi5wcm90b2NvbCA9PSBcImZpbGU6XCIpIHtcbiAgICBjb25zb2xlLmVycm9yKFxuICAgICAgXCJXQVJOSU5HOiB3ZWItc29ja2V0LWpzIGRvZXNuJ3Qgd29yayBpbiBmaWxlOi8vLy4uLiBVUkwgXCIgK1xuICAgICAgXCJ1bmxlc3MgeW91IHNldCBGbGFzaCBTZWN1cml0eSBTZXR0aW5ncyBwcm9wZXJseS4gXCIgK1xuICAgICAgXCJPcGVuIHRoZSBwYWdlIHZpYSBXZWIgc2VydmVyIGkuZS4gaHR0cDovLy4uLlwiKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGNsYXNzIHJlcHJlc2VudHMgYSBmYXV4IHdlYiBzb2NrZXQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgICogQHBhcmFtIHthcnJheSBvciBzdHJpbmd9IHByb3RvY29sc1xuICAgKiBAcGFyYW0ge3N0cmluZ30gcHJveHlIb3N0XG4gICAqIEBwYXJhbSB7aW50fSBwcm94eVBvcnRcbiAgICogQHBhcmFtIHtzdHJpbmd9IGhlYWRlcnNcbiAgICovXG4gIFdlYlNvY2tldCA9IGZ1bmN0aW9uKHVybCwgcHJvdG9jb2xzLCBwcm94eUhvc3QsIHByb3h5UG9ydCwgaGVhZGVycykge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBzZWxmLl9faWQgPSBXZWJTb2NrZXQuX19uZXh0SWQrKztcbiAgICBXZWJTb2NrZXQuX19pbnN0YW5jZXNbc2VsZi5fX2lkXSA9IHNlbGY7XG4gICAgc2VsZi5yZWFkeVN0YXRlID0gV2ViU29ja2V0LkNPTk5FQ1RJTkc7XG4gICAgc2VsZi5idWZmZXJlZEFtb3VudCA9IDA7XG4gICAgc2VsZi5fX2V2ZW50cyA9IHt9O1xuICAgIGlmICghcHJvdG9jb2xzKSB7XG4gICAgICBwcm90b2NvbHMgPSBbXTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBwcm90b2NvbHMgPT0gXCJzdHJpbmdcIikge1xuICAgICAgcHJvdG9jb2xzID0gW3Byb3RvY29sc107XG4gICAgfVxuICAgIC8vIFVzZXMgc2V0VGltZW91dCgpIHRvIG1ha2Ugc3VyZSBfX2NyZWF0ZUZsYXNoKCkgcnVucyBhZnRlciB0aGUgY2FsbGVyIHNldHMgd3Mub25vcGVuIGV0Yy5cbiAgICAvLyBPdGhlcndpc2UsIHdoZW4gb25vcGVuIGZpcmVzIGltbWVkaWF0ZWx5LCBvbm9wZW4gaXMgY2FsbGVkIGJlZm9yZSBpdCBpcyBzZXQuXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIFdlYlNvY2tldC5fX2FkZFRhc2soZnVuY3Rpb24oKSB7XG4gICAgICAgIFdlYlNvY2tldC5fX2ZsYXNoLmNyZWF0ZShcbiAgICAgICAgICAgIHNlbGYuX19pZCwgdXJsLCBwcm90b2NvbHMsIHByb3h5SG9zdCB8fCBudWxsLCBwcm94eVBvcnQgfHwgMCwgaGVhZGVycyB8fCBudWxsKTtcbiAgICAgIH0pO1xuICAgIH0sIDApO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTZW5kIGRhdGEgdG8gdGhlIHdlYiBzb2NrZXQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBkYXRhICBUaGUgZGF0YSB0byBzZW5kIHRvIHRoZSBzb2NrZXQuXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59ICBUcnVlIGZvciBzdWNjZXNzLCBmYWxzZSBmb3IgZmFpbHVyZS5cbiAgICovXG4gIFdlYlNvY2tldC5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBpZiAodGhpcy5yZWFkeVN0YXRlID09IFdlYlNvY2tldC5DT05ORUNUSU5HKSB7XG4gICAgICB0aHJvdyBcIklOVkFMSURfU1RBVEVfRVJSOiBXZWIgU29ja2V0IGNvbm5lY3Rpb24gaGFzIG5vdCBiZWVuIGVzdGFibGlzaGVkXCI7XG4gICAgfVxuICAgIC8vIFdlIHVzZSBlbmNvZGVVUklDb21wb25lbnQoKSBoZXJlLCBiZWNhdXNlIEZBQnJpZGdlIGRvZXNuJ3Qgd29yayBpZlxuICAgIC8vIHRoZSBhcmd1bWVudCBpbmNsdWRlcyBzb21lIGNoYXJhY3RlcnMuIFdlIGRvbid0IHVzZSBlc2NhcGUoKSBoZXJlXG4gICAgLy8gYmVjYXVzZSBvZiB0aGlzOlxuICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuL0NvcmVfSmF2YVNjcmlwdF8xLjVfR3VpZGUvRnVuY3Rpb25zI2VzY2FwZV9hbmRfdW5lc2NhcGVfRnVuY3Rpb25zXG4gICAgLy8gQnV0IGl0IGxvb2tzIGRlY29kZVVSSUNvbXBvbmVudChlbmNvZGVVUklDb21wb25lbnQocykpIGRvZXNuJ3RcbiAgICAvLyBwcmVzZXJ2ZSBhbGwgVW5pY29kZSBjaGFyYWN0ZXJzIGVpdGhlciBlLmcuIFwiXFx1ZmZmZlwiIGluIEZpcmVmb3guXG4gICAgLy8gTm90ZSBieSB3dHJpdGNoOiBIb3BlZnVsbHkgdGhpcyB3aWxsIG5vdCBiZSBuZWNlc3NhcnkgdXNpbmcgRXh0ZXJuYWxJbnRlcmZhY2UuICBXaWxsIHJlcXVpcmVcbiAgICAvLyBhZGRpdGlvbmFsIHRlc3RpbmcuXG4gICAgdmFyIHJlc3VsdCA9IFdlYlNvY2tldC5fX2ZsYXNoLnNlbmQodGhpcy5fX2lkLCBlbmNvZGVVUklDb21wb25lbnQoZGF0YSkpO1xuICAgIGlmIChyZXN1bHQgPCAwKSB7IC8vIHN1Y2Nlc3NcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmJ1ZmZlcmVkQW1vdW50ICs9IHJlc3VsdDtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIENsb3NlIHRoaXMgd2ViIHNvY2tldCBncmFjZWZ1bGx5LlxuICAgKi9cbiAgV2ViU29ja2V0LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT0gV2ViU29ja2V0LkNMT1NFRCB8fCB0aGlzLnJlYWR5U3RhdGUgPT0gV2ViU29ja2V0LkNMT1NJTkcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5yZWFkeVN0YXRlID0gV2ViU29ja2V0LkNMT1NJTkc7XG4gICAgV2ViU29ja2V0Ll9fZmxhc2guY2xvc2UodGhpcy5fX2lkKTtcbiAgfTtcblxuICAvKipcbiAgICogSW1wbGVtZW50YXRpb24gb2Yge0BsaW5rIDxhIGhyZWY9XCJodHRwOi8vd3d3LnczLm9yZy9UUi9ET00tTGV2ZWwtMi1FdmVudHMvZXZlbnRzLmh0bWwjRXZlbnRzLXJlZ2lzdHJhdGlvblwiPkRPTSAyIEV2ZW50VGFyZ2V0IEludGVyZmFjZTwvYT59XG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGxpc3RlbmVyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gdXNlQ2FwdHVyZVxuICAgKiBAcmV0dXJuIHZvaWRcbiAgICovXG4gIFdlYlNvY2tldC5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyLCB1c2VDYXB0dXJlKSB7XG4gICAgaWYgKCEodHlwZSBpbiB0aGlzLl9fZXZlbnRzKSkge1xuICAgICAgdGhpcy5fX2V2ZW50c1t0eXBlXSA9IFtdO1xuICAgIH1cbiAgICB0aGlzLl9fZXZlbnRzW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBJbXBsZW1lbnRhdGlvbiBvZiB7QGxpbmsgPGEgaHJlZj1cImh0dHA6Ly93d3cudzMub3JnL1RSL0RPTS1MZXZlbC0yLUV2ZW50cy9ldmVudHMuaHRtbCNFdmVudHMtcmVnaXN0cmF0aW9uXCI+RE9NIDIgRXZlbnRUYXJnZXQgSW50ZXJmYWNlPC9hPn1cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGVcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gbGlzdGVuZXJcbiAgICogQHBhcmFtIHtib29sZWFufSB1c2VDYXB0dXJlXG4gICAqIEByZXR1cm4gdm9pZFxuICAgKi9cbiAgV2ViU29ja2V0LnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIsIHVzZUNhcHR1cmUpIHtcbiAgICBpZiAoISh0eXBlIGluIHRoaXMuX19ldmVudHMpKSByZXR1cm47XG4gICAgdmFyIGV2ZW50cyA9IHRoaXMuX19ldmVudHNbdHlwZV07XG4gICAgZm9yICh2YXIgaSA9IGV2ZW50cy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgaWYgKGV2ZW50c1tpXSA9PT0gbGlzdGVuZXIpIHtcbiAgICAgICAgZXZlbnRzLnNwbGljZShpLCAxKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBJbXBsZW1lbnRhdGlvbiBvZiB7QGxpbmsgPGEgaHJlZj1cImh0dHA6Ly93d3cudzMub3JnL1RSL0RPTS1MZXZlbC0yLUV2ZW50cy9ldmVudHMuaHRtbCNFdmVudHMtcmVnaXN0cmF0aW9uXCI+RE9NIDIgRXZlbnRUYXJnZXQgSW50ZXJmYWNlPC9hPn1cbiAgICpcbiAgICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAgICogQHJldHVybiB2b2lkXG4gICAqL1xuICBXZWJTb2NrZXQucHJvdG90eXBlLmRpc3BhdGNoRXZlbnQgPSBmdW5jdGlvbihldmVudCkge1xuICAgIHZhciBldmVudHMgPSB0aGlzLl9fZXZlbnRzW2V2ZW50LnR5cGVdIHx8IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZXZlbnRzLmxlbmd0aDsgKytpKSB7XG4gICAgICBldmVudHNbaV0oZXZlbnQpO1xuICAgIH1cbiAgICB2YXIgaGFuZGxlciA9IHRoaXNbXCJvblwiICsgZXZlbnQudHlwZV07XG4gICAgaWYgKGhhbmRsZXIpIGhhbmRsZXIoZXZlbnQpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGFuIGV2ZW50IGZyb20gRmxhc2guXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBmbGFzaEV2ZW50XG4gICAqL1xuICBXZWJTb2NrZXQucHJvdG90eXBlLl9faGFuZGxlRXZlbnQgPSBmdW5jdGlvbihmbGFzaEV2ZW50KSB7XG4gICAgaWYgKFwicmVhZHlTdGF0ZVwiIGluIGZsYXNoRXZlbnQpIHtcbiAgICAgIHRoaXMucmVhZHlTdGF0ZSA9IGZsYXNoRXZlbnQucmVhZHlTdGF0ZTtcbiAgICB9XG4gICAgaWYgKFwicHJvdG9jb2xcIiBpbiBmbGFzaEV2ZW50KSB7XG4gICAgICB0aGlzLnByb3RvY29sID0gZmxhc2hFdmVudC5wcm90b2NvbDtcbiAgICB9XG4gICAgXG4gICAgdmFyIGpzRXZlbnQ7XG4gICAgaWYgKGZsYXNoRXZlbnQudHlwZSA9PSBcIm9wZW5cIiB8fCBmbGFzaEV2ZW50LnR5cGUgPT0gXCJlcnJvclwiKSB7XG4gICAgICBqc0V2ZW50ID0gdGhpcy5fX2NyZWF0ZVNpbXBsZUV2ZW50KGZsYXNoRXZlbnQudHlwZSk7XG4gICAgfSBlbHNlIGlmIChmbGFzaEV2ZW50LnR5cGUgPT0gXCJjbG9zZVwiKSB7XG4gICAgICAvLyBUT0RPIGltcGxlbWVudCBqc0V2ZW50Lndhc0NsZWFuXG4gICAgICBqc0V2ZW50ID0gdGhpcy5fX2NyZWF0ZVNpbXBsZUV2ZW50KFwiY2xvc2VcIik7XG4gICAgfSBlbHNlIGlmIChmbGFzaEV2ZW50LnR5cGUgPT0gXCJtZXNzYWdlXCIpIHtcbiAgICAgIHZhciBkYXRhID0gZGVjb2RlVVJJQ29tcG9uZW50KGZsYXNoRXZlbnQubWVzc2FnZSk7XG4gICAgICBqc0V2ZW50ID0gdGhpcy5fX2NyZWF0ZU1lc3NhZ2VFdmVudChcIm1lc3NhZ2VcIiwgZGF0YSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IFwidW5rbm93biBldmVudCB0eXBlOiBcIiArIGZsYXNoRXZlbnQudHlwZTtcbiAgICB9XG4gICAgXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KGpzRXZlbnQpO1xuICB9O1xuICBcbiAgV2ViU29ja2V0LnByb3RvdHlwZS5fX2NyZWF0ZVNpbXBsZUV2ZW50ID0gZnVuY3Rpb24odHlwZSkge1xuICAgIGlmIChkb2N1bWVudC5jcmVhdGVFdmVudCAmJiB3aW5kb3cuRXZlbnQpIHtcbiAgICAgIHZhciBldmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiRXZlbnRcIik7XG4gICAgICBldmVudC5pbml0RXZlbnQodHlwZSwgZmFsc2UsIGZhbHNlKTtcbiAgICAgIHJldHVybiBldmVudDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHt0eXBlOiB0eXBlLCBidWJibGVzOiBmYWxzZSwgY2FuY2VsYWJsZTogZmFsc2V9O1xuICAgIH1cbiAgfTtcbiAgXG4gIFdlYlNvY2tldC5wcm90b3R5cGUuX19jcmVhdGVNZXNzYWdlRXZlbnQgPSBmdW5jdGlvbih0eXBlLCBkYXRhKSB7XG4gICAgaWYgKGRvY3VtZW50LmNyZWF0ZUV2ZW50ICYmIHdpbmRvdy5NZXNzYWdlRXZlbnQgJiYgIXdpbmRvdy5vcGVyYSkge1xuICAgICAgdmFyIGV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoXCJNZXNzYWdlRXZlbnRcIik7XG4gICAgICBldmVudC5pbml0TWVzc2FnZUV2ZW50KFwibWVzc2FnZVwiLCBmYWxzZSwgZmFsc2UsIGRhdGEsIG51bGwsIG51bGwsIHdpbmRvdywgbnVsbCk7XG4gICAgICByZXR1cm4gZXZlbnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIElFIGFuZCBPcGVyYSwgdGhlIGxhdHRlciBvbmUgdHJ1bmNhdGVzIHRoZSBkYXRhIHBhcmFtZXRlciBhZnRlciBhbnkgMHgwMCBieXRlcy5cbiAgICAgIHJldHVybiB7dHlwZTogdHlwZSwgZGF0YTogZGF0YSwgYnViYmxlczogZmFsc2UsIGNhbmNlbGFibGU6IGZhbHNlfTtcbiAgICB9XG4gIH07XG4gIFxuICAvKipcbiAgICogRGVmaW5lIHRoZSBXZWJTb2NrZXQgcmVhZHlTdGF0ZSBlbnVtZXJhdGlvbi5cbiAgICovXG4gIFdlYlNvY2tldC5DT05ORUNUSU5HID0gMDtcbiAgV2ViU29ja2V0Lk9QRU4gPSAxO1xuICBXZWJTb2NrZXQuQ0xPU0lORyA9IDI7XG4gIFdlYlNvY2tldC5DTE9TRUQgPSAzO1xuXG4gIFdlYlNvY2tldC5fX2ZsYXNoID0gbnVsbDtcbiAgV2ViU29ja2V0Ll9faW5zdGFuY2VzID0ge307XG4gIFdlYlNvY2tldC5fX3Rhc2tzID0gW107XG4gIFdlYlNvY2tldC5fX25leHRJZCA9IDA7XG4gIFxuICAvKipcbiAgICogTG9hZCBhIG5ldyBmbGFzaCBzZWN1cml0eSBwb2xpY3kgZmlsZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICAgKi9cbiAgV2ViU29ja2V0LmxvYWRGbGFzaFBvbGljeUZpbGUgPSBmdW5jdGlvbih1cmwpe1xuICAgIFdlYlNvY2tldC5fX2FkZFRhc2soZnVuY3Rpb24oKSB7XG4gICAgICBXZWJTb2NrZXQuX19mbGFzaC5sb2FkTWFudWFsUG9saWN5RmlsZSh1cmwpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBMb2FkcyBXZWJTb2NrZXRNYWluLnN3ZiBhbmQgY3JlYXRlcyBXZWJTb2NrZXRNYWluIG9iamVjdCBpbiBGbGFzaC5cbiAgICovXG4gIFdlYlNvY2tldC5fX2luaXRpYWxpemUgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoV2ViU29ja2V0Ll9fZmxhc2gpIHJldHVybjtcbiAgICBcbiAgICBpZiAoV2ViU29ja2V0Ll9fc3dmTG9jYXRpb24pIHtcbiAgICAgIC8vIEZvciBiYWNrd29yZCBjb21wYXRpYmlsaXR5LlxuICAgICAgd2luZG93LldFQl9TT0NLRVRfU1dGX0xPQ0FUSU9OID0gV2ViU29ja2V0Ll9fc3dmTG9jYXRpb247XG4gICAgfVxuICAgIGlmICghd2luZG93LldFQl9TT0NLRVRfU1dGX0xPQ0FUSU9OKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiW1dlYlNvY2tldF0gc2V0IFdFQl9TT0NLRVRfU1dGX0xPQ0FUSU9OIHRvIGxvY2F0aW9uIG9mIFdlYlNvY2tldE1haW4uc3dmXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBjb250YWluZXIuaWQgPSBcIndlYlNvY2tldENvbnRhaW5lclwiO1xuICAgIC8vIEhpZGVzIEZsYXNoIGJveC4gV2UgY2Fubm90IHVzZSBkaXNwbGF5OiBub25lIG9yIHZpc2liaWxpdHk6IGhpZGRlbiBiZWNhdXNlIGl0IHByZXZlbnRzXG4gICAgLy8gRmxhc2ggZnJvbSBsb2FkaW5nIGF0IGxlYXN0IGluIElFLiBTbyB3ZSBtb3ZlIGl0IG91dCBvZiB0aGUgc2NyZWVuIGF0ICgtMTAwLCAtMTAwKS5cbiAgICAvLyBCdXQgdGhpcyBldmVuIGRvZXNuJ3Qgd29yayB3aXRoIEZsYXNoIExpdGUgKGUuZy4gaW4gRHJvaWQgSW5jcmVkaWJsZSkuIFNvIHdpdGggRmxhc2hcbiAgICAvLyBMaXRlLCB3ZSBwdXQgaXQgYXQgKDAsIDApLiBUaGlzIHNob3dzIDF4MSBib3ggdmlzaWJsZSBhdCBsZWZ0LXRvcCBjb3JuZXIgYnV0IHRoaXMgaXNcbiAgICAvLyB0aGUgYmVzdCB3ZSBjYW4gZG8gYXMgZmFyIGFzIHdlIGtub3cgbm93LlxuICAgIGNvbnRhaW5lci5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcbiAgICBpZiAoV2ViU29ja2V0Ll9faXNGbGFzaExpdGUoKSkge1xuICAgICAgY29udGFpbmVyLnN0eWxlLmxlZnQgPSBcIjBweFwiO1xuICAgICAgY29udGFpbmVyLnN0eWxlLnRvcCA9IFwiMHB4XCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnRhaW5lci5zdHlsZS5sZWZ0ID0gXCItMTAwcHhcIjtcbiAgICAgIGNvbnRhaW5lci5zdHlsZS50b3AgPSBcIi0xMDBweFwiO1xuICAgIH1cbiAgICB2YXIgaG9sZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBob2xkZXIuaWQgPSBcIndlYlNvY2tldEZsYXNoXCI7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGhvbGRlcik7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjb250YWluZXIpO1xuICAgIC8vIFNlZSB0aGlzIGFydGljbGUgZm9yIGhhc1ByaW9yaXR5OlxuICAgIC8vIGh0dHA6Ly9oZWxwLmFkb2JlLmNvbS9lbl9VUy9hczMvbW9iaWxlL1dTNGJlYmNkNjZhNzQyNzVjMzZjZmI4MTM3MTI0MzE4ZWViYzYtN2ZmZC5odG1sXG4gICAgc3dmb2JqZWN0LmVtYmVkU1dGKFxuICAgICAgV0VCX1NPQ0tFVF9TV0ZfTE9DQVRJT04sXG4gICAgICBcIndlYlNvY2tldEZsYXNoXCIsXG4gICAgICBcIjFcIiAvKiB3aWR0aCAqLyxcbiAgICAgIFwiMVwiIC8qIGhlaWdodCAqLyxcbiAgICAgIFwiMTAuMC4wXCIgLyogU1dGIHZlcnNpb24gKi8sXG4gICAgICBudWxsLFxuICAgICAgbnVsbCxcbiAgICAgIHtoYXNQcmlvcml0eTogdHJ1ZSwgc3dsaXZlY29ubmVjdCA6IHRydWUsIGFsbG93U2NyaXB0QWNjZXNzOiBcImFsd2F5c1wifSxcbiAgICAgIG51bGwsXG4gICAgICBmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmICghZS5zdWNjZXNzKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihcIltXZWJTb2NrZXRdIHN3Zm9iamVjdC5lbWJlZFNXRiBmYWlsZWRcIik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9O1xuICBcbiAgLyoqXG4gICAqIENhbGxlZCBieSBGbGFzaCB0byBub3RpZnkgSlMgdGhhdCBpdCdzIGZ1bGx5IGxvYWRlZCBhbmQgcmVhZHlcbiAgICogZm9yIGNvbW11bmljYXRpb24uXG4gICAqL1xuICBXZWJTb2NrZXQuX19vbkZsYXNoSW5pdGlhbGl6ZWQgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBXZSBuZWVkIHRvIHNldCBhIHRpbWVvdXQgaGVyZSB0byBhdm9pZCByb3VuZC10cmlwIGNhbGxzXG4gICAgLy8gdG8gZmxhc2ggZHVyaW5nIHRoZSBpbml0aWFsaXphdGlvbiBwcm9jZXNzLlxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICBXZWJTb2NrZXQuX19mbGFzaCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwid2ViU29ja2V0Rmxhc2hcIik7XG4gICAgICBXZWJTb2NrZXQuX19mbGFzaC5zZXRDYWxsZXJVcmwobG9jYXRpb24uaHJlZik7XG4gICAgICBXZWJTb2NrZXQuX19mbGFzaC5zZXREZWJ1ZyghIXdpbmRvdy5XRUJfU09DS0VUX0RFQlVHKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgV2ViU29ja2V0Ll9fdGFza3MubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgV2ViU29ja2V0Ll9fdGFza3NbaV0oKTtcbiAgICAgIH1cbiAgICAgIFdlYlNvY2tldC5fX3Rhc2tzID0gW107XG4gICAgfSwgMCk7XG4gIH07XG4gIFxuICAvKipcbiAgICogQ2FsbGVkIGJ5IEZsYXNoIHRvIG5vdGlmeSBXZWJTb2NrZXRzIGV2ZW50cyBhcmUgZmlyZWQuXG4gICAqL1xuICBXZWJTb2NrZXQuX19vbkZsYXNoRXZlbnQgPSBmdW5jdGlvbigpIHtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gR2V0cyBldmVudHMgdXNpbmcgcmVjZWl2ZUV2ZW50cygpIGluc3RlYWQgb2YgZ2V0dGluZyBpdCBmcm9tIGV2ZW50IG9iamVjdFxuICAgICAgICAvLyBvZiBGbGFzaCBldmVudC4gVGhpcyBpcyB0byBtYWtlIHN1cmUgdG8ga2VlcCBtZXNzYWdlIG9yZGVyLlxuICAgICAgICAvLyBJdCBzZWVtcyBzb21ldGltZXMgRmxhc2ggZXZlbnRzIGRvbid0IGFycml2ZSBpbiB0aGUgc2FtZSBvcmRlciBhcyB0aGV5IGFyZSBzZW50LlxuICAgICAgICB2YXIgZXZlbnRzID0gV2ViU29ja2V0Ll9fZmxhc2gucmVjZWl2ZUV2ZW50cygpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV2ZW50cy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgIFdlYlNvY2tldC5fX2luc3RhbmNlc1tldmVudHNbaV0ud2ViU29ja2V0SWRdLl9faGFuZGxlRXZlbnQoZXZlbnRzW2ldKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgfVxuICAgIH0sIDApO1xuICAgIHJldHVybiB0cnVlO1xuICB9O1xuICBcbiAgLy8gQ2FsbGVkIGJ5IEZsYXNoLlxuICBXZWJTb2NrZXQuX19sb2cgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgY29uc29sZS5sb2coZGVjb2RlVVJJQ29tcG9uZW50KG1lc3NhZ2UpKTtcbiAgfTtcbiAgXG4gIC8vIENhbGxlZCBieSBGbGFzaC5cbiAgV2ViU29ja2V0Ll9fZXJyb3IgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgY29uc29sZS5lcnJvcihkZWNvZGVVUklDb21wb25lbnQobWVzc2FnZSkpO1xuICB9O1xuICBcbiAgV2ViU29ja2V0Ll9fYWRkVGFzayA9IGZ1bmN0aW9uKHRhc2spIHtcbiAgICBpZiAoV2ViU29ja2V0Ll9fZmxhc2gpIHtcbiAgICAgIHRhc2soKTtcbiAgICB9IGVsc2Uge1xuICAgICAgV2ViU29ja2V0Ll9fdGFza3MucHVzaCh0YXNrKTtcbiAgICB9XG4gIH07XG4gIFxuICAvKipcbiAgICogVGVzdCBpZiB0aGUgYnJvd3NlciBpcyBydW5uaW5nIGZsYXNoIGxpdGUuXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgZmxhc2ggbGl0ZSBpcyBydW5uaW5nLCBmYWxzZSBvdGhlcndpc2UuXG4gICAqL1xuICBXZWJTb2NrZXQuX19pc0ZsYXNoTGl0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICghd2luZG93Lm5hdmlnYXRvciB8fCAhd2luZG93Lm5hdmlnYXRvci5taW1lVHlwZXMpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdmFyIG1pbWVUeXBlID0gd2luZG93Lm5hdmlnYXRvci5taW1lVHlwZXNbXCJhcHBsaWNhdGlvbi94LXNob2Nrd2F2ZS1mbGFzaFwiXTtcbiAgICBpZiAoIW1pbWVUeXBlIHx8ICFtaW1lVHlwZS5lbmFibGVkUGx1Z2luIHx8ICFtaW1lVHlwZS5lbmFibGVkUGx1Z2luLmZpbGVuYW1lKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBtaW1lVHlwZS5lbmFibGVkUGx1Z2luLmZpbGVuYW1lLm1hdGNoKC9mbGFzaGxpdGUvaSkgPyB0cnVlIDogZmFsc2U7XG4gIH07XG4gIFxuICBpZiAoIXdpbmRvdy5XRUJfU09DS0VUX0RJU0FCTEVfQVVUT19JTklUSUFMSVpBVElPTikge1xuICAgIGlmICh3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgIFdlYlNvY2tldC5fX2luaXRpYWxpemUoKTtcbiAgICAgIH0sIGZhbHNlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgd2luZG93LmF0dGFjaEV2ZW50KFwib25sb2FkXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgIFdlYlNvY2tldC5fX2luaXRpYWxpemUoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICBcbn0pKCk7XG5cbi8qKlxuICogc29ja2V0LmlvXG4gKiBDb3B5cmlnaHQoYykgMjAxMSBMZWFybkJvb3N0IDxkZXZAbGVhcm5ib29zdC5jb20+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG4oZnVuY3Rpb24gKGV4cG9ydHMsIGlvLCBnbG9iYWwpIHtcblxuICAvKipcbiAgICogRXhwb3NlIGNvbnN0cnVjdG9yLlxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cbiAgXG4gIGV4cG9ydHMuWEhSID0gWEhSO1xuXG4gIC8qKlxuICAgKiBYSFIgY29uc3RydWN0b3JcbiAgICpcbiAgICogQGNvc3RydWN0b3JcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgZnVuY3Rpb24gWEhSIChzb2NrZXQpIHtcbiAgICBpZiAoIXNvY2tldCkgcmV0dXJuO1xuXG4gICAgaW8uVHJhbnNwb3J0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5zZW5kQnVmZmVyID0gW107XG4gIH07XG5cbiAgLyoqXG4gICAqIEluaGVyaXRzIGZyb20gVHJhbnNwb3J0LlxuICAgKi9cblxuICBpby51dGlsLmluaGVyaXQoWEhSLCBpby5UcmFuc3BvcnQpO1xuXG4gIC8qKlxuICAgKiBFc3RhYmxpc2ggYSBjb25uZWN0aW9uXG4gICAqXG4gICAqIEByZXR1cm5zIHtUcmFuc3BvcnR9XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIFhIUi5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnNvY2tldC5zZXRCdWZmZXIoZmFsc2UpO1xuICAgIHRoaXMub25PcGVuKCk7XG4gICAgdGhpcy5nZXQoKTtcblxuICAgIC8vIHdlIG5lZWQgdG8gbWFrZSBzdXJlIHRoZSByZXF1ZXN0IHN1Y2NlZWRzIHNpbmNlIHdlIGhhdmUgbm8gaW5kaWNhdGlvblxuICAgIC8vIHdoZXRoZXIgdGhlIHJlcXVlc3Qgb3BlbmVkIG9yIG5vdCB1bnRpbCBpdCBzdWNjZWVkZWQuXG4gICAgdGhpcy5zZXRDbG9zZVRpbWVvdXQoKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGVjayBpZiB3ZSBuZWVkIHRvIHNlbmQgZGF0YSB0byB0aGUgU29ja2V0LklPIHNlcnZlciwgaWYgd2UgaGF2ZSBkYXRhIGluIG91clxuICAgKiBidWZmZXIgd2UgZW5jb2RlIGl0IGFuZCBmb3J3YXJkIGl0IHRvIHRoZSBgcG9zdGAgbWV0aG9kLlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgWEhSLnByb3RvdHlwZS5wYXlsb2FkID0gZnVuY3Rpb24gKHBheWxvYWQpIHtcbiAgICB2YXIgbXNncyA9IFtdO1xuXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBwYXlsb2FkLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgbXNncy5wdXNoKGlvLnBhcnNlci5lbmNvZGVQYWNrZXQocGF5bG9hZFtpXSkpO1xuICAgIH1cblxuICAgIHRoaXMuc2VuZChpby5wYXJzZXIuZW5jb2RlUGF5bG9hZChtc2dzKSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNlbmQgZGF0YSB0byB0aGUgU29ja2V0LklPIHNlcnZlci5cbiAgICpcbiAgICogQHBhcmFtIGRhdGEgVGhlIG1lc3NhZ2VcbiAgICogQHJldHVybnMge1RyYW5zcG9ydH1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgWEhSLnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICB0aGlzLnBvc3QoZGF0YSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIFBvc3RzIGEgZW5jb2RlZCBtZXNzYWdlIHRvIHRoZSBTb2NrZXQuSU8gc2VydmVyLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gZGF0YSBBIGVuY29kZWQgbWVzc2FnZS5cbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGVtcHR5ICgpIHsgfTtcblxuICBYSFIucHJvdG90eXBlLnBvc3QgPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLnNvY2tldC5zZXRCdWZmZXIodHJ1ZSk7XG5cbiAgICBmdW5jdGlvbiBzdGF0ZUNoYW5nZSAoKSB7XG4gICAgICBpZiAodGhpcy5yZWFkeVN0YXRlID09IDQpIHtcbiAgICAgICAgdGhpcy5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBlbXB0eTtcbiAgICAgICAgc2VsZi5wb3N0aW5nID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKHRoaXMuc3RhdHVzID09IDIwMCl7XG4gICAgICAgICAgc2VsZi5zb2NrZXQuc2V0QnVmZmVyKGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZWxmLm9uQ2xvc2UoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9ubG9hZCAoKSB7XG4gICAgICB0aGlzLm9ubG9hZCA9IGVtcHR5O1xuICAgICAgc2VsZi5zb2NrZXQuc2V0QnVmZmVyKGZhbHNlKTtcbiAgICB9O1xuXG4gICAgdGhpcy5zZW5kWEhSID0gdGhpcy5yZXF1ZXN0KCdQT1NUJyk7XG5cbiAgICBpZiAoZ2xvYmFsLlhEb21haW5SZXF1ZXN0ICYmIHRoaXMuc2VuZFhIUiBpbnN0YW5jZW9mIFhEb21haW5SZXF1ZXN0KSB7XG4gICAgICB0aGlzLnNlbmRYSFIub25sb2FkID0gdGhpcy5zZW5kWEhSLm9uZXJyb3IgPSBvbmxvYWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2VuZFhIUi5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBzdGF0ZUNoYW5nZTtcbiAgICB9XG5cbiAgICB0aGlzLnNlbmRYSFIuc2VuZChkYXRhKTtcbiAgfTtcblxuICAvKipcbiAgICogRGlzY29ubmVjdHMgdGhlIGVzdGFibGlzaGVkIGBYSFJgIGNvbm5lY3Rpb24uXG4gICAqXG4gICAqIEByZXR1cm5zIHtUcmFuc3BvcnR9IFxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBYSFIucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMub25DbG9zZSgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZXMgYSBjb25maWd1cmVkIFhIUiByZXF1ZXN0XG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB1cmwgVGhlIHVybCB0aGF0IG5lZWRzIHRvIGJlIHJlcXVlc3RlZC5cbiAgICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZCBUaGUgbWV0aG9kIHRoZSByZXF1ZXN0IHNob3VsZCB1c2UuXG4gICAqIEByZXR1cm5zIHtYTUxIdHRwUmVxdWVzdH1cbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFhIUi5wcm90b3R5cGUucmVxdWVzdCA9IGZ1bmN0aW9uIChtZXRob2QpIHtcbiAgICB2YXIgcmVxID0gaW8udXRpbC5yZXF1ZXN0KHRoaXMuc29ja2V0LmlzWERvbWFpbigpKVxuICAgICAgLCBxdWVyeSA9IGlvLnV0aWwucXVlcnkodGhpcy5zb2NrZXQub3B0aW9ucy5xdWVyeSwgJ3Q9JyArICtuZXcgRGF0ZSk7XG5cbiAgICByZXEub3BlbihtZXRob2QgfHwgJ0dFVCcsIHRoaXMucHJlcGFyZVVybCgpICsgcXVlcnksIHRydWUpO1xuXG4gICAgaWYgKG1ldGhvZCA9PSAnUE9TVCcpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChyZXEuc2V0UmVxdWVzdEhlYWRlcikge1xuICAgICAgICAgIHJlcS5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LXR5cGUnLCAndGV4dC9wbGFpbjtjaGFyc2V0PVVURi04Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gWERvbWFpblJlcXVlc3RcbiAgICAgICAgICByZXEuY29udGVudFR5cGUgPSAndGV4dC9wbGFpbic7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlcTtcbiAgfTtcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgc2NoZW1lIHRvIHVzZSBmb3IgdGhlIHRyYW5zcG9ydCBVUkxzLlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgWEhSLnByb3RvdHlwZS5zY2hlbWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuc29ja2V0Lm9wdGlvbnMuc2VjdXJlID8gJ2h0dHBzJyA6ICdodHRwJztcbiAgfTtcblxuICAvKipcbiAgICogQ2hlY2sgaWYgdGhlIFhIUiB0cmFuc3BvcnRzIGFyZSBzdXBwb3J0ZWRcbiAgICpcbiAgICogQHBhcmFtIHtCb29sZWFufSB4ZG9tYWluIENoZWNrIGlmIHdlIHN1cHBvcnQgY3Jvc3MgZG9tYWluIHJlcXVlc3RzLlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgWEhSLmNoZWNrID0gZnVuY3Rpb24gKHNvY2tldCwgeGRvbWFpbikge1xuICAgIHRyeSB7XG4gICAgICBpZiAoaW8udXRpbC5yZXF1ZXN0KHhkb21haW4pKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH0gY2F0Y2goZSkge31cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcblxuICAvKipcbiAgICogQ2hlY2sgaWYgdGhlIFhIUiB0cmFuc3BvcnQgc3VwcG9ydHMgY29yc3MgZG9tYWluIHJlcXVlc3RzLlxuICAgKiBcbiAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIFhIUi54ZG9tYWluQ2hlY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFhIUi5jaGVjayhudWxsLCB0cnVlKTtcbiAgfTtcblxufSkoXG4gICAgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGlvID8gaW8uVHJhbnNwb3J0IDogbW9kdWxlLmV4cG9ydHNcbiAgLCAndW5kZWZpbmVkJyAhPSB0eXBlb2YgaW8gPyBpbyA6IG1vZHVsZS5wYXJlbnQuZXhwb3J0c1xuICAsIHRoaXNcbik7XG5cbi8qKlxuICogc29ja2V0LmlvXG4gKiBDb3B5cmlnaHQoYykgMjAxMSBMZWFybkJvb3N0IDxkZXZAbGVhcm5ib29zdC5jb20+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG4oZnVuY3Rpb24gKGV4cG9ydHMsIGlvKSB7XG5cbiAgLyoqXG4gICAqIEV4cG9zZSBjb25zdHJ1Y3Rvci5cbiAgICovXG5cbiAgZXhwb3J0cy5odG1sZmlsZSA9IEhUTUxGaWxlO1xuXG4gIC8qKlxuICAgKiBUaGUgSFRNTEZpbGUgdHJhbnNwb3J0IGNyZWF0ZXMgYSBgZm9yZXZlciBpZnJhbWVgIGJhc2VkIHRyYW5zcG9ydFxuICAgKiBmb3IgSW50ZXJuZXQgRXhwbG9yZXIuIFJlZ3VsYXIgZm9yZXZlciBpZnJhbWUgaW1wbGVtZW50YXRpb25zIHdpbGwgXG4gICAqIGNvbnRpbnVvdXNseSB0cmlnZ2VyIHRoZSBicm93c2VycyBidXp5IGluZGljYXRvcnMuIElmIHRoZSBmb3JldmVyIGlmcmFtZVxuICAgKiBpcyBjcmVhdGVkIGluc2lkZSBhIGBodG1sZmlsZWAgdGhlc2UgaW5kaWNhdG9ycyB3aWxsIG5vdCBiZSB0cmlnZ2VkLlxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQGV4dGVuZHMge2lvLlRyYW5zcG9ydC5YSFJ9XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGZ1bmN0aW9uIEhUTUxGaWxlIChzb2NrZXQpIHtcbiAgICBpby5UcmFuc3BvcnQuWEhSLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEluaGVyaXRzIGZyb20gWEhSIHRyYW5zcG9ydC5cbiAgICovXG5cbiAgaW8udXRpbC5pbmhlcml0KEhUTUxGaWxlLCBpby5UcmFuc3BvcnQuWEhSKTtcblxuICAvKipcbiAgICogVHJhbnNwb3J0IG5hbWVcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgSFRNTEZpbGUucHJvdG90eXBlLm5hbWUgPSAnaHRtbGZpbGUnO1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IEFjdGl2ZVggYGh0bWxmaWxlYCB3aXRoIGEgZm9yZXZlciBsb2FkaW5nIGlmcmFtZVxuICAgKiB0aGF0IGNhbiBiZSB1c2VkIHRvIGxpc3RlbiB0byBtZXNzYWdlcy4gSW5zaWRlIHRoZSBnZW5lcmF0ZWRcbiAgICogYGh0bWxmaWxlYCBhIHJlZmVyZW5jZSB3aWxsIGJlIG1hZGUgdG8gdGhlIEhUTUxGaWxlIHRyYW5zcG9ydC5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIEhUTUxGaWxlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5kb2MgPSBuZXcgQWN0aXZlWE9iamVjdCgnaHRtbGZpbGUnKTtcbiAgICB0aGlzLmRvYy5vcGVuKCk7XG4gICAgdGhpcy5kb2Mud3JpdGUoJzxodG1sPjwvaHRtbD4nKTtcbiAgICB0aGlzLmRvYy5jbG9zZSgpO1xuICAgIHRoaXMuZG9jLnBhcmVudFdpbmRvdy5zID0gdGhpcztcblxuICAgIHZhciBpZnJhbWVDID0gdGhpcy5kb2MuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgaWZyYW1lQy5jbGFzc05hbWUgPSAnc29ja2V0aW8nO1xuXG4gICAgdGhpcy5kb2MuYm9keS5hcHBlbmRDaGlsZChpZnJhbWVDKTtcbiAgICB0aGlzLmlmcmFtZSA9IHRoaXMuZG9jLmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xuXG4gICAgaWZyYW1lQy5hcHBlbmRDaGlsZCh0aGlzLmlmcmFtZSk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICwgcXVlcnkgPSBpby51dGlsLnF1ZXJ5KHRoaXMuc29ja2V0Lm9wdGlvbnMucXVlcnksICd0PScrICtuZXcgRGF0ZSk7XG5cbiAgICB0aGlzLmlmcmFtZS5zcmMgPSB0aGlzLnByZXBhcmVVcmwoKSArIHF1ZXJ5O1xuXG4gICAgaW8udXRpbC5vbih3aW5kb3csICd1bmxvYWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBzZWxmLmRlc3Ryb3koKTtcbiAgICB9KTtcbiAgfTtcblxuICAvKipcbiAgICogVGhlIFNvY2tldC5JTyBzZXJ2ZXIgd2lsbCB3cml0ZSBzY3JpcHQgdGFncyBpbnNpZGUgdGhlIGZvcmV2ZXJcbiAgICogaWZyYW1lLCB0aGlzIGZ1bmN0aW9uIHdpbGwgYmUgdXNlZCBhcyBjYWxsYmFjayBmb3IgdGhlIGluY29taW5nXG4gICAqIGluZm9ybWF0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gZGF0YSBUaGUgbWVzc2FnZVxuICAgKiBAcGFyYW0ge2RvY3VtZW50fSBkb2MgUmVmZXJlbmNlIHRvIHRoZSBjb250ZXh0XG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBIVE1MRmlsZS5wcm90b3R5cGUuXyA9IGZ1bmN0aW9uIChkYXRhLCBkb2MpIHtcbiAgICB0aGlzLm9uRGF0YShkYXRhKTtcbiAgICB0cnkge1xuICAgICAgdmFyIHNjcmlwdCA9IGRvYy5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JylbMF07XG4gICAgICBzY3JpcHQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzY3JpcHQpO1xuICAgIH0gY2F0Y2ggKGUpIHsgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBEZXN0cm95IHRoZSBlc3RhYmxpc2hlZCBjb25uZWN0aW9uLCBpZnJhbWUgYW5kIGBodG1sZmlsZWAuXG4gICAqIEFuZCBjYWxscyB0aGUgYENvbGxlY3RHYXJiYWdlYCBmdW5jdGlvbiBvZiBJbnRlcm5ldCBFeHBsb3JlclxuICAgKiB0byByZWxlYXNlIHRoZSBtZW1vcnkuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBIVE1MRmlsZS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5pZnJhbWUpe1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5pZnJhbWUuc3JjID0gJ2Fib3V0OmJsYW5rJztcbiAgICAgIH0gY2F0Y2goZSl7fVxuXG4gICAgICB0aGlzLmRvYyA9IG51bGw7XG4gICAgICB0aGlzLmlmcmFtZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuaWZyYW1lKTtcbiAgICAgIHRoaXMuaWZyYW1lID0gbnVsbDtcblxuICAgICAgQ29sbGVjdEdhcmJhZ2UoKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIERpc2Nvbm5lY3RzIHRoZSBlc3RhYmxpc2hlZCBjb25uZWN0aW9uLlxuICAgKlxuICAgKiBAcmV0dXJucyB7VHJhbnNwb3J0fSBDaGFpbmluZy5cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgSFRNTEZpbGUucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZGVzdHJveSgpO1xuICAgIHJldHVybiBpby5UcmFuc3BvcnQuWEhSLnByb3RvdHlwZS5jbG9zZS5jYWxsKHRoaXMpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgdGhlIGJyb3dzZXIgc3VwcG9ydHMgdGhpcyB0cmFuc3BvcnQuIFRoZSBicm93c2VyXG4gICAqIG11c3QgaGF2ZSBhbiBgQWN0aXZlWE9iamVjdGAgaW1wbGVtZW50YXRpb24uXG4gICAqXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIEhUTUxGaWxlLmNoZWNrID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICgnQWN0aXZlWE9iamVjdCcgaW4gd2luZG93KXtcbiAgICAgIHRyeSB7XG4gICAgICAgIHZhciBhID0gbmV3IEFjdGl2ZVhPYmplY3QoJ2h0bWxmaWxlJyk7XG4gICAgICAgIHJldHVybiBhICYmIGlvLlRyYW5zcG9ydC5YSFIuY2hlY2soKTtcbiAgICAgIH0gY2F0Y2goZSl7fVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGNyb3NzIGRvbWFpbiByZXF1ZXN0cyBhcmUgc3VwcG9ydGVkLlxuICAgKlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgSFRNTEZpbGUueGRvbWFpbkNoZWNrID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIHdlIGNhbiBwcm9iYWJseSBkbyBoYW5kbGluZyBmb3Igc3ViLWRvbWFpbnMsIHdlIHNob3VsZFxuICAgIC8vIHRlc3QgdGhhdCBpdCdzIGNyb3NzIGRvbWFpbiBidXQgYSBzdWJkb21haW4gaGVyZVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcblxuICAvKipcbiAgICogQWRkIHRoZSB0cmFuc3BvcnQgdG8geW91ciBwdWJsaWMgaW8udHJhbnNwb3J0cyBhcnJheS5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIGlvLnRyYW5zcG9ydHMucHVzaCgnaHRtbGZpbGUnKTtcblxufSkoXG4gICAgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGlvID8gaW8uVHJhbnNwb3J0IDogbW9kdWxlLmV4cG9ydHNcbiAgLCAndW5kZWZpbmVkJyAhPSB0eXBlb2YgaW8gPyBpbyA6IG1vZHVsZS5wYXJlbnQuZXhwb3J0c1xuKTtcblxuLyoqXG4gKiBzb2NrZXQuaW9cbiAqIENvcHlyaWdodChjKSAyMDExIExlYXJuQm9vc3QgPGRldkBsZWFybmJvb3N0LmNvbT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbihmdW5jdGlvbiAoZXhwb3J0cywgaW8sIGdsb2JhbCkge1xuXG4gIC8qKlxuICAgKiBFeHBvc2UgY29uc3RydWN0b3IuXG4gICAqL1xuXG4gIGV4cG9ydHNbJ3hoci1wb2xsaW5nJ10gPSBYSFJQb2xsaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgWEhSLXBvbGxpbmcgdHJhbnNwb3J0IHVzZXMgbG9uZyBwb2xsaW5nIFhIUiByZXF1ZXN0cyB0byBjcmVhdGUgYVxuICAgKiBcInBlcnNpc3RlbnRcIiBjb25uZWN0aW9uIHdpdGggdGhlIHNlcnZlci5cbiAgICpcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGZ1bmN0aW9uIFhIUlBvbGxpbmcgKCkge1xuICAgIGlvLlRyYW5zcG9ydC5YSFIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfTtcblxuICAvKipcbiAgICogSW5oZXJpdHMgZnJvbSBYSFIgdHJhbnNwb3J0LlxuICAgKi9cblxuICBpby51dGlsLmluaGVyaXQoWEhSUG9sbGluZywgaW8uVHJhbnNwb3J0LlhIUik7XG5cbiAgLyoqXG4gICAqIE1lcmdlIHRoZSBwcm9wZXJ0aWVzIGZyb20gWEhSIHRyYW5zcG9ydFxuICAgKi9cblxuICBpby51dGlsLm1lcmdlKFhIUlBvbGxpbmcsIGlvLlRyYW5zcG9ydC5YSFIpO1xuXG4gIC8qKlxuICAgKiBUcmFuc3BvcnQgbmFtZVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBYSFJQb2xsaW5nLnByb3RvdHlwZS5uYW1lID0gJ3hoci1wb2xsaW5nJztcblxuICAvKiogXG4gICAqIEVzdGFibGlzaCBhIGNvbm5lY3Rpb24sIGZvciBpUGhvbmUgYW5kIEFuZHJvaWQgdGhpcyB3aWxsIGJlIGRvbmUgb25jZSB0aGUgcGFnZVxuICAgKiBpcyBsb2FkZWQuXG4gICAqXG4gICAqIEByZXR1cm5zIHtUcmFuc3BvcnR9IENoYWluaW5nLlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBYSFJQb2xsaW5nLnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlvLlRyYW5zcG9ydC5YSFIucHJvdG90eXBlLm9wZW4uY2FsbChzZWxmKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgLyoqXG4gICAqIFN0YXJ0cyBhIFhIUiByZXF1ZXN0IHRvIHdhaXQgZm9yIGluY29taW5nIG1lc3NhZ2VzLlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgZnVuY3Rpb24gZW1wdHkgKCkge307XG5cbiAgWEhSUG9sbGluZy5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5vcGVuKSByZXR1cm47XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBmdW5jdGlvbiBzdGF0ZUNoYW5nZSAoKSB7XG4gICAgICBpZiAodGhpcy5yZWFkeVN0YXRlID09IDQpIHtcbiAgICAgICAgdGhpcy5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBlbXB0eTtcblxuICAgICAgICBpZiAodGhpcy5zdGF0dXMgPT0gMjAwKSB7XG4gICAgICAgICAgc2VsZi5vbkRhdGEodGhpcy5yZXNwb25zZVRleHQpO1xuICAgICAgICAgIHNlbGYuZ2V0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2VsZi5vbkNsb3NlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gb25sb2FkICgpIHtcbiAgICAgIHRoaXMub25sb2FkID0gZW1wdHk7XG4gICAgICBzZWxmLm9uRGF0YSh0aGlzLnJlc3BvbnNlVGV4dCk7XG4gICAgICBzZWxmLmdldCgpO1xuICAgIH07XG5cbiAgICB0aGlzLnhociA9IHRoaXMucmVxdWVzdCgpO1xuXG4gICAgaWYgKGdsb2JhbC5YRG9tYWluUmVxdWVzdCAmJiB0aGlzLnhociBpbnN0YW5jZW9mIFhEb21haW5SZXF1ZXN0KSB7XG4gICAgICB0aGlzLnhoci5vbmxvYWQgPSB0aGlzLnhoci5vbmVycm9yID0gb25sb2FkO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBzdGF0ZUNoYW5nZTtcbiAgICB9XG5cbiAgICB0aGlzLnhoci5zZW5kKG51bGwpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBIYW5kbGUgdGhlIHVuY2xlYW4gY2xvc2UgYmVoYXZpb3IuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBYSFJQb2xsaW5nLnByb3RvdHlwZS5vbkNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgIGlvLlRyYW5zcG9ydC5YSFIucHJvdG90eXBlLm9uQ2xvc2UuY2FsbCh0aGlzKTtcblxuICAgIGlmICh0aGlzLnhocikge1xuICAgICAgdGhpcy54aHIub25yZWFkeXN0YXRlY2hhbmdlID0gdGhpcy54aHIub25sb2FkID0gZW1wdHk7XG4gICAgICB0cnkge1xuICAgICAgICB0aGlzLnhoci5hYm9ydCgpO1xuICAgICAgfSBjYXRjaChlKXt9XG4gICAgICB0aGlzLnhociA9IG51bGw7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBXZWJraXQgYmFzZWQgYnJvd3NlcnMgc2hvdyBhIGluZmluaXQgc3Bpbm5lciB3aGVuIHlvdSBzdGFydCBhIFhIUiByZXF1ZXN0XG4gICAqIGJlZm9yZSB0aGUgYnJvd3NlcnMgb25sb2FkIGV2ZW50IGlzIGNhbGxlZCBzbyB3ZSBuZWVkIHRvIGRlZmVyIG9wZW5pbmcgb2ZcbiAgICogdGhlIHRyYW5zcG9ydCB1bnRpbCB0aGUgb25sb2FkIGV2ZW50IGlzIGNhbGxlZC4gV3JhcHBpbmcgdGhlIGNiIGluIG91clxuICAgKiBkZWZlciBtZXRob2Qgc29sdmUgdGhpcy5cbiAgICpcbiAgICogQHBhcmFtIHtTb2NrZXR9IHNvY2tldCBUaGUgc29ja2V0IGluc3RhbmNlIHRoYXQgbmVlZHMgYSB0cmFuc3BvcnRcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGNhbGxiYWNrXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBYSFJQb2xsaW5nLnByb3RvdHlwZS5yZWFkeSA9IGZ1bmN0aW9uIChzb2NrZXQsIGZuKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaW8udXRpbC5kZWZlcihmdW5jdGlvbiAoKSB7XG4gICAgICBmbi5jYWxsKHNlbGYpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBZGQgdGhlIHRyYW5zcG9ydCB0byB5b3VyIHB1YmxpYyBpby50cmFuc3BvcnRzIGFycmF5LlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgaW8udHJhbnNwb3J0cy5wdXNoKCd4aHItcG9sbGluZycpO1xuXG59KShcbiAgICAndW5kZWZpbmVkJyAhPSB0eXBlb2YgaW8gPyBpby5UcmFuc3BvcnQgOiBtb2R1bGUuZXhwb3J0c1xuICAsICd1bmRlZmluZWQnICE9IHR5cGVvZiBpbyA/IGlvIDogbW9kdWxlLnBhcmVudC5leHBvcnRzXG4gICwgdGhpc1xuKTtcblxuLyoqXG4gKiBzb2NrZXQuaW9cbiAqIENvcHlyaWdodChjKSAyMDExIExlYXJuQm9vc3QgPGRldkBsZWFybmJvb3N0LmNvbT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbihmdW5jdGlvbiAoZXhwb3J0cywgaW8sIGdsb2JhbCkge1xuICAvKipcbiAgICogVGhlcmUgaXMgYSB3YXkgdG8gaGlkZSB0aGUgbG9hZGluZyBpbmRpY2F0b3IgaW4gRmlyZWZveC4gSWYgeW91IGNyZWF0ZSBhbmRcbiAgICogcmVtb3ZlIGEgaWZyYW1lIGl0IHdpbGwgc3RvcCBzaG93aW5nIHRoZSBjdXJyZW50IGxvYWRpbmcgaW5kaWNhdG9yLlxuICAgKiBVbmZvcnR1bmF0ZWx5IHdlIGNhbid0IGZlYXR1cmUgZGV0ZWN0IHRoYXQgYW5kIFVBIHNuaWZmaW5nIGlzIGV2aWwuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICB2YXIgaW5kaWNhdG9yID0gZ2xvYmFsLmRvY3VtZW50ICYmIFwiTW96QXBwZWFyYW5jZVwiIGluXG4gICAgZ2xvYmFsLmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZTtcblxuICAvKipcbiAgICogRXhwb3NlIGNvbnN0cnVjdG9yLlxuICAgKi9cblxuICBleHBvcnRzWydqc29ucC1wb2xsaW5nJ10gPSBKU09OUFBvbGxpbmc7XG5cbiAgLyoqXG4gICAqIFRoZSBKU09OUCB0cmFuc3BvcnQgY3JlYXRlcyBhbiBwZXJzaXN0ZW50IGNvbm5lY3Rpb24gYnkgZHluYW1pY2FsbHlcbiAgICogaW5zZXJ0aW5nIGEgc2NyaXB0IHRhZyBpbiB0aGUgcGFnZS4gVGhpcyBzY3JpcHQgdGFnIHdpbGwgcmVjZWl2ZSB0aGVcbiAgICogaW5mb3JtYXRpb24gb2YgdGhlIFNvY2tldC5JTyBzZXJ2ZXIuIFdoZW4gbmV3IGluZm9ybWF0aW9uIGlzIHJlY2VpdmVkXG4gICAqIGl0IGNyZWF0ZXMgYSBuZXcgc2NyaXB0IHRhZyBmb3IgdGhlIG5ldyBkYXRhIHN0cmVhbS5cbiAgICpcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBleHRlbmRzIHtpby5UcmFuc3BvcnQueGhyLXBvbGxpbmd9XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGZ1bmN0aW9uIEpTT05QUG9sbGluZyAoc29ja2V0KSB7XG4gICAgaW8uVHJhbnNwb3J0Wyd4aHItcG9sbGluZyddLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICB0aGlzLmluZGV4ID0gaW8uai5sZW5ndGg7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpby5qLnB1c2goZnVuY3Rpb24gKG1zZykge1xuICAgICAgc2VsZi5fKG1zZyk7XG4gICAgfSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEluaGVyaXRzIGZyb20gWEhSIHBvbGxpbmcgdHJhbnNwb3J0LlxuICAgKi9cblxuICBpby51dGlsLmluaGVyaXQoSlNPTlBQb2xsaW5nLCBpby5UcmFuc3BvcnRbJ3hoci1wb2xsaW5nJ10pO1xuXG4gIC8qKlxuICAgKiBUcmFuc3BvcnQgbmFtZVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBKU09OUFBvbGxpbmcucHJvdG90eXBlLm5hbWUgPSAnanNvbnAtcG9sbGluZyc7XG5cbiAgLyoqXG4gICAqIFBvc3RzIGEgZW5jb2RlZCBtZXNzYWdlIHRvIHRoZSBTb2NrZXQuSU8gc2VydmVyIHVzaW5nIGFuIGlmcmFtZS5cbiAgICogVGhlIGlmcmFtZSBpcyB1c2VkIGJlY2F1c2Ugc2NyaXB0IHRhZ3MgY2FuIGNyZWF0ZSBQT1NUIGJhc2VkIHJlcXVlc3RzLlxuICAgKiBUaGUgaWZyYW1lIGlzIHBvc2l0aW9uZWQgb3V0c2lkZSBvZiB0aGUgdmlldyBzbyB0aGUgdXNlciBkb2VzIG5vdFxuICAgKiBub3RpY2UgaXQncyBleGlzdGVuY2UuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBkYXRhIEEgZW5jb2RlZCBtZXNzYWdlLlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgSlNPTlBQb2xsaW5nLnByb3RvdHlwZS5wb3N0ID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICwgcXVlcnkgPSBpby51dGlsLnF1ZXJ5KFxuICAgICAgICAgICAgIHRoaXMuc29ja2V0Lm9wdGlvbnMucXVlcnlcbiAgICAgICAgICAsICd0PScrICgrbmV3IERhdGUpICsgJyZpPScgKyB0aGlzLmluZGV4XG4gICAgICAgICk7XG5cbiAgICBpZiAoIXRoaXMuZm9ybSkge1xuICAgICAgdmFyIGZvcm0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdmb3JtJylcbiAgICAgICAgLCBhcmVhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKVxuICAgICAgICAsIGlkID0gdGhpcy5pZnJhbWVJZCA9ICdzb2NrZXRpb19pZnJhbWVfJyArIHRoaXMuaW5kZXhcbiAgICAgICAgLCBpZnJhbWU7XG5cbiAgICAgIGZvcm0uY2xhc3NOYW1lID0gJ3NvY2tldGlvJztcbiAgICAgIGZvcm0uc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgZm9ybS5zdHlsZS50b3AgPSAnLTEwMDBweCc7XG4gICAgICBmb3JtLnN0eWxlLmxlZnQgPSAnLTEwMDBweCc7XG4gICAgICBmb3JtLnRhcmdldCA9IGlkO1xuICAgICAgZm9ybS5tZXRob2QgPSAnUE9TVCc7XG4gICAgICBmb3JtLnNldEF0dHJpYnV0ZSgnYWNjZXB0LWNoYXJzZXQnLCAndXRmLTgnKTtcbiAgICAgIGFyZWEubmFtZSA9ICdkJztcbiAgICAgIGZvcm0uYXBwZW5kQ2hpbGQoYXJlYSk7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGZvcm0pO1xuXG4gICAgICB0aGlzLmZvcm0gPSBmb3JtO1xuICAgICAgdGhpcy5hcmVhID0gYXJlYTtcbiAgICB9XG5cbiAgICB0aGlzLmZvcm0uYWN0aW9uID0gdGhpcy5wcmVwYXJlVXJsKCkgKyBxdWVyeTtcblxuICAgIGZ1bmN0aW9uIGNvbXBsZXRlICgpIHtcbiAgICAgIGluaXRJZnJhbWUoKTtcbiAgICAgIHNlbGYuc29ja2V0LnNldEJ1ZmZlcihmYWxzZSk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGluaXRJZnJhbWUgKCkge1xuICAgICAgaWYgKHNlbGYuaWZyYW1lKSB7XG4gICAgICAgIHNlbGYuZm9ybS5yZW1vdmVDaGlsZChzZWxmLmlmcmFtZSk7XG4gICAgICB9XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIGllNiBkeW5hbWljIGlmcmFtZXMgd2l0aCB0YXJnZXQ9XCJcIiBzdXBwb3J0ICh0aGFua3MgQ2hyaXMgTGFtYmFjaGVyKVxuICAgICAgICBpZnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCc8aWZyYW1lIG5hbWU9XCInKyBzZWxmLmlmcmFtZUlkICsnXCI+Jyk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xuICAgICAgICBpZnJhbWUubmFtZSA9IHNlbGYuaWZyYW1lSWQ7XG4gICAgICB9XG5cbiAgICAgIGlmcmFtZS5pZCA9IHNlbGYuaWZyYW1lSWQ7XG5cbiAgICAgIHNlbGYuZm9ybS5hcHBlbmRDaGlsZChpZnJhbWUpO1xuICAgICAgc2VsZi5pZnJhbWUgPSBpZnJhbWU7XG4gICAgfTtcblxuICAgIGluaXRJZnJhbWUoKTtcblxuICAgIC8vIHdlIHRlbXBvcmFyaWx5IHN0cmluZ2lmeSB1bnRpbCB3ZSBmaWd1cmUgb3V0IGhvdyB0byBwcmV2ZW50XG4gICAgLy8gYnJvd3NlcnMgZnJvbSB0dXJuaW5nIGBcXG5gIGludG8gYFxcclxcbmAgaW4gZm9ybSBpbnB1dHNcbiAgICB0aGlzLmFyZWEudmFsdWUgPSBpby5KU09OLnN0cmluZ2lmeShkYXRhKTtcblxuICAgIHRyeSB7XG4gICAgICB0aGlzLmZvcm0uc3VibWl0KCk7XG4gICAgfSBjYXRjaChlKSB7fVxuXG4gICAgaWYgKHRoaXMuaWZyYW1lLmF0dGFjaEV2ZW50KSB7XG4gICAgICBpZnJhbWUub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoc2VsZi5pZnJhbWUucmVhZHlTdGF0ZSA9PSAnY29tcGxldGUnKSB7XG4gICAgICAgICAgY29tcGxldGUoKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5pZnJhbWUub25sb2FkID0gY29tcGxldGU7XG4gICAgfVxuXG4gICAgdGhpcy5zb2NrZXQuc2V0QnVmZmVyKHRydWUpO1xuICB9O1xuICBcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgSlNPTlAgcG9sbCB0aGF0IGNhbiBiZSB1c2VkIHRvIGxpc3RlblxuICAgKiBmb3IgbWVzc2FnZXMgZnJvbSB0aGUgU29ja2V0LklPIHNlcnZlci5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIEpTT05QUG9sbGluZy5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgLCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKVxuICAgICAgLCBxdWVyeSA9IGlvLnV0aWwucXVlcnkoXG4gICAgICAgICAgICAgdGhpcy5zb2NrZXQub3B0aW9ucy5xdWVyeVxuICAgICAgICAgICwgJ3Q9JysgKCtuZXcgRGF0ZSkgKyAnJmk9JyArIHRoaXMuaW5kZXhcbiAgICAgICAgKTtcblxuICAgIGlmICh0aGlzLnNjcmlwdCkge1xuICAgICAgdGhpcy5zY3JpcHQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLnNjcmlwdCk7XG4gICAgICB0aGlzLnNjcmlwdCA9IG51bGw7XG4gICAgfVxuXG4gICAgc2NyaXB0LmFzeW5jID0gdHJ1ZTtcbiAgICBzY3JpcHQuc3JjID0gdGhpcy5wcmVwYXJlVXJsKCkgKyBxdWVyeTtcbiAgICBzY3JpcHQub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHNlbGYub25DbG9zZSgpO1xuICAgIH07XG5cbiAgICB2YXIgaW5zZXJ0QXQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JylbMF1cbiAgICBpbnNlcnRBdC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShzY3JpcHQsIGluc2VydEF0KTtcbiAgICB0aGlzLnNjcmlwdCA9IHNjcmlwdDtcblxuICAgIGlmIChpbmRpY2F0b3IpIHtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgaWZyYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaWZyYW1lKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChpZnJhbWUpO1xuICAgICAgfSwgMTAwKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIGZ1bmN0aW9uIGZvciB0aGUgaW5jb21pbmcgbWVzc2FnZSBzdHJlYW0gZnJvbSB0aGUgU29ja2V0LklPIHNlcnZlci5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGRhdGEgVGhlIG1lc3NhZ2VcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIEpTT05QUG9sbGluZy5wcm90b3R5cGUuXyA9IGZ1bmN0aW9uIChtc2cpIHtcbiAgICB0aGlzLm9uRGF0YShtc2cpO1xuICAgIGlmICh0aGlzLm9wZW4pIHtcbiAgICAgIHRoaXMuZ2V0KCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBUaGUgaW5kaWNhdG9yIGhhY2sgb25seSB3b3JrcyBhZnRlciBvbmxvYWRcbiAgICpcbiAgICogQHBhcmFtIHtTb2NrZXR9IHNvY2tldCBUaGUgc29ja2V0IGluc3RhbmNlIHRoYXQgbmVlZHMgYSB0cmFuc3BvcnRcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGNhbGxiYWNrXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBKU09OUFBvbGxpbmcucHJvdG90eXBlLnJlYWR5ID0gZnVuY3Rpb24gKHNvY2tldCwgZm4pIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKCFpbmRpY2F0b3IpIHJldHVybiBmbi5jYWxsKHRoaXMpO1xuXG4gICAgaW8udXRpbC5sb2FkKGZ1bmN0aW9uICgpIHtcbiAgICAgIGZuLmNhbGwoc2VsZik7XG4gICAgfSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiBicm93c2VyIHN1cHBvcnRzIHRoaXMgdHJhbnNwb3J0LlxuICAgKlxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBKU09OUFBvbGxpbmcuY2hlY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdkb2N1bWVudCcgaW4gZ2xvYmFsO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBjcm9zcyBkb21haW4gcmVxdWVzdHMgYXJlIHN1cHBvcnRlZFxuICAgKlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgSlNPTlBQb2xsaW5nLnhkb21haW5DaGVjayA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvKipcbiAgICogQWRkIHRoZSB0cmFuc3BvcnQgdG8geW91ciBwdWJsaWMgaW8udHJhbnNwb3J0cyBhcnJheS5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIGlvLnRyYW5zcG9ydHMucHVzaCgnanNvbnAtcG9sbGluZycpO1xuXG59KShcbiAgICAndW5kZWZpbmVkJyAhPSB0eXBlb2YgaW8gPyBpby5UcmFuc3BvcnQgOiBtb2R1bGUuZXhwb3J0c1xuICAsICd1bmRlZmluZWQnICE9IHR5cGVvZiBpbyA/IGlvIDogbW9kdWxlLnBhcmVudC5leHBvcnRzXG4gICwgdGhpc1xuKTtcbn0pLmNhbGwod2luZG93KSJdfQ==
;