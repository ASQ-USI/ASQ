(function () {
    'use strict';

var iAPI = impress();

  if ( !window.location.search.match(/print/) ) {
iAPI.init();
} else {
	var substeps = document.querySelectorAll(".substep");
	Array.prototype.forEach.call(substeps,function(dom, index) {
		dom.classList.add("active");
	})
}
  
	 
	if ( window.location.search.match(/edit/) ) {

builder.init({
  "goto":iAPI['goto'], //it makes me feel better this way
  creationFunction:iAPI.newStep, //future API method that adds a new step
  redrawFunction:iAPI.initStep, //future API method that (re)draws the step
  setTransformationCallback:iAPI.setTransformationCallback //future API method that lets me know when transformations change
});
}
else {
	if ( !window.location.search.match(/print/) ) {
	if (hljs) {
    	 hljs.initHighlightingOnLoad();
	}
	//impressConsole().init();
	
}

if ( !window.location.search.match(/preview/) ) {
	iAPI.showMenu();
}
	

	document.addEventListener("keydown", function ( event ) {
        if ( event.keyCode == 27 ) {
            
            iAPI.goto("overview");
            
            event.preventDefault();
        }
    }, false);
    
    //Add slide counters
    var forEach = Array.prototype.forEach
      , keys = Object.keys
      , steps = document.querySelectorAll("div.step")

    forEach.call(steps, function (dom, index) {
        if (dom.id !== 'overview') {
            var wrap = document.createElement("div");
            wrap.className = 'wrap';
            while (dom.firstChild) {
                wrap.appendChild(dom.firstChild);
            }
            dom.appendChild(wrap);
            var counter = wrap.appendChild(document.createElement('div'));
            counter.className = "counter";
            counter.innerHTML = (index + 1) + " / " + steps.length;
        }
    });
}


    var start = Date.now();
    var timerDom = document.getElementById('timer')
      , log = window.TIMELOG = [];

    var durationToStr = function () {
        var now = Date.now()
          , min = String(Math.floor((now - start)/(1000*60)))
          , sec = String(Math.floor((now - start)/(1000))%60);
        return ((min.length > 1) ? min : ('0' + min)) + ':' +
            ((sec.length > 1) ? sec : ('0' + sec));
    };
    // setInterval(function () {
    //     timerDom.innerHTML = durationToStr();
    // }, 1000);


if ("ontouchstart" in document.documentElement) { 
    document.querySelector(".hint").innerHTML = "<p>Tap on the left or right to navigate</p>";
}


if ( window.location.search.match(/print/) ) {
	window.print();
} 

}());
