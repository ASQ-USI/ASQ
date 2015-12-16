'use strict';

var debug = require('bows')("asqRevealAdapter");

var asqRevealAdapter = module.exports = function(asqSocket, slidesTree, standalone, offset) {
  standalone = standalone || false;
  offset = offset || 0;
  slidesTree = slidesTree || getSlidesTree();

  console.log('asqRevealAdapter', slidesTree);

  var steps = slidesTree.steps
  var allSubsteps = slidesTree.allSubsteps;

  if (! standalone) {
    // patch reveal.js when it's ready
    patchReveal();
  } else {
    // var firstStep = getStep(getElementFromHash()) || steps[0];
    // goto(firstStep, null, 0);
    // TOOD
  }

  var revealPatched = false;
  var last_indices = undefined;

  asqSocket.onGoto(onAsqSocketGoto);

  return {
    goto: goto
  }

  // `patchReveal` patches the reveal.js api so that external scripts
  // that use goto to go through the adapter.
  function patchReveal(){
    if ( revealPatched ) return;
    
    // TODO reveal:ready
    if (typeof window.Reveal === 'undefined' || window.Reveal == null 
        || typeof window.Reveal.isReady != 'function' || !window.Reveal.isReady() ) {
      document.addEventListener("ready", patchReveal);
      return;
    }
    var Reveal = window.Reveal;

    document.removeEventListener("ready", patchReveal);

    Reveal.goto = goto;
    Reveal.indices2Id = indices2Id;
    Reveal.id2Indices = id2Indices;

    // The reveal:slide event is fired whenver 
    // the active slide has been changed.
    Reveal.addEventListener('reveal:slide', function(evt) {
      var indices = evt.detail;
      if ( isDuplicated(indices) ) return;

      // The code below is to filter some duplicated or 
      // meaningless events triggered by Reveal.JS.
      var fragments = getAvailableFragmentsByIndices(indices);
      if ( !fragments.prev && !fragments.next  ) {
        if ( typeof indices.f != 'undefined' ) return;
      } else {
        if ( typeof indices.f == 'undefined' ) return;
      }
      
      var id = Reveal.indices2Id(indices.h, indices.v, indices.f);

      console.log("goto #" + id + ' ( ' + evt.detail.h + ', ' + evt.detail.v + ', ' + evt.detail.f + ' )');
      asqSocket.emitGoto({
        id: id,
        indices: indices
      });

      last_indices = indices;
      return { id: id, indices: indices };
    });

    revealPatched = true;

    // goto(0, 0, 0)
  }

  function getAvailableFragmentsByIndices(indices) {
    var slide = Reveal.getSlide(indices.h, indices.v, indices.f);
    var fragments = slide.querySelectorAll( '.fragment' );
    var hiddenFragments = slide.querySelectorAll( '.fragment:not(.visible)' );

    return {
      prev: fragments.length - hiddenFragments.length > 0,
      next: !!hiddenFragments.length
    }; 
  }

  // This function is used to check if the 
  // given indices is equal with `last_indices` (defined in this package)
  function isDuplicated(indices) {
    var isEqual = function(a, b) {
      return ( a == b || typeof(a) == typeof(b) == 'undefined' )
    }

    if ( typeof last_indices ==  'undefined' ) return false;

    if ( isEqual(indices.h, last_indices.h) &&
         isEqual(indices.v, last_indices.v) &&
         isEqual(indices.f, last_indices.f) ) {
      return true
    }
    return false
  }

  function onAsqSocketGoto(data){
    console.log('@@ onAsqSocketGoto @@', data);
    if("undefined" === typeof data || data === null){
      debug("data is undefined or null");
      return;
    }
    Reveal.goto(data.indices)
  };

  function getSlidesTree() {
    var slidesTree = {};
    slidesTree.allSubsteps={};

    var sections = toArray(document.querySelectorAll('.reveal .slides > section'));
    var steps = [];

    // original steps array
    sections.forEach(function(section, index){
        if ( section.querySelector('section') ) {
            toArray(section.querySelectorAll('section')).forEach(function(slide){
                steps.push(slide)
            });
        } else {
            steps.push(section)
        }
    });

    
    steps.forEach(function(slide, index){
        if ( typeof slide.id == 'undefined' || slide.id.trim() == '') {
            slide.id = 'step-' + (index + 1)
        }

        // generate substeps Object
        var elSubs = slidesTree.allSubsteps[slide.id] = Object.create(null);
        elSubs.substeps = getSubSteps(slide);
        elSubs.active = -1;
    });


    slidesTree.steps = steps.map(function(slide) {
        return slide.id
    });

    return slidesTree;
  }

  function getSubSteps(el) {
    var substeps = toArray(el.querySelectorAll('.fragment'));
    return substeps.map(function() {
        return ''
    });
  }

  function toArray( o ) {
    return Array.prototype.slice.call( o );
  }

  /**
   * A wrapper function used to navigate the slde.
   * The arguments can be either a ID of slide, indices 
   * or an indices object.
   */
  function goto ( h, v, f ) {
    if ( typeof h == 'string' ) {
      var steps = getSlidesTree().steps;
      if ( steps.indexOf(h) < 0 ) return;
      var indices = window.Reveal.id2Indices(h);
      if ( indices == null ) return;
      window.Reveal.slide(indices.h, indices.v, indices.f);
    } 
    else if ( typeof h == 'number' ) {
      window.Reveal.slide(h, v, f);
    } 
    else if ( typeof h == 'object' && typeof h.h == 'number' ) {
      f = h.f;
      v = h.v;
      h = h.h;
      window.Reveal.slide(h, v, f);
    } 
  }


  // Helper function that translates slides indices 
  // into ID.
  function indices2Id(h, v, f) {
    if ( typeof h == 'object' ) {
      f = h.f;
      v = h.v;
      h = h.h;
    }

    v = typeof v == 'undefined' ? 0 : v;

    var slide = Reveal.getSlide(h, v, f);
    if ( typeof slide  == 'undefined' || slide == null ) {
      return undefined
    }

    return slide.id
  }

  function id2Indices(id) {
    var slide = document.querySelector('#'+id);
    if ( typeof slide  == 'undefined' || slide == null ) {
      return undefined
    }
    return Reveal.getIndices(slide);

  }
}

