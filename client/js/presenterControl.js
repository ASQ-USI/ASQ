/**
 @fileoverview Socket code for the presentercontrol client.
 *
 */

function presenterControlDOMBinder(){
	'use strict';

	var debug = require('bows')("presenterControl")
	, io      = require('socket.io-browserify')
	, $       = require('jquery')
	, impress
	, adapter;

	$(function(){
	  var $body   = $('body')
	  , host      =  $body.attr('data-asq-host')
	  , port      = parseInt($body.attr('data-asq-port'))
	  , sessionId = $body.attr('data-asq-session-id')
	  , mode      = $body.attr('data-asq-socket-mode')
	  , token     = $body.attr('data-asq-token')
	  , slidesTree = $body.attr('data-asq-slide-tree')

	  connect(host, port, sessionId, mode, token, slidesTree);
	})

	/** Connect back to the server with a websocket */

	function connect(host, port, session, mode, token, slidesTree) {
	  debug('Connecting to socket server');
	  var socket = io.connect(window.location.protocol + '//' + host + ':' + port + '/ctrl?sid=' + session)
	  //+ '&token=' + token ); TODO use token for socket auth.

	  socket.on('connect', function(event) {
	    // socket.emit('asq:admin', { //unused
	    //  session : session
	    // });
	    

	    // comes from the thumbnail manager
  	  document.addEventListener('thumbnailClicked', function(evt){
  			adapter.goto($(evt.detail).find('.thumb-step').attr('data-references'))
	    })

	    //init presentation adapter
	    try{
	      if("undefined" !== typeof slidesTree){
	       slidesTree = JSON.parse(slidesTree) 
	      }
	      var asi = require('./presentationAdapter/adapterSocketInterface')(socket);
	      adapter = require('./presentationAdapter/adapters').impress(asi, slidesTree);
	    }catch(err){
	      debug(err.toString + err.stack)
	    }
	    

	    $('.connected-viewers-number').text("0 viewers connected");

	    /**
	     * Update the viewers count when users connect or disconnect.
	     */
	    socket.on('asq:folo-connected', onASQFoloConnected);

	    /**
	     Handle socket event 'new'
	     Notifies the admin of a new connection to the presentation.
	     */
	    socket.on('asq:submitted', function(evt) {
	      updateProgress(evt.progress);
	    });

	    socket.on('asq:goto', function(evt) {
	      debug('asq:goto received');
	      if (mode == 'control') {
	        $('.controlThumbs .thumbsWrapper .active').removeClass('active');
	        $('.controlThumbs').scrollTo('.' + evt.slide, 500, {
	          offset : -150
	        });
	        $('.controlThumbs .thumbsWrapper .' + evt.slide).addClass("active");

	        var next = $('#' + evt.slide).next().attr('id');
	        $('#nextSlideFrame').attr('src', '/slidesRender/' + slidesId + '/#/' + next);
	      }
	    });

	    socket.on('asq:gotosub', function(event) {
	      impress().gotoSub(event.substepIndex);
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

	  document.addEventListener('asq:close', function(event) {
	    socket.emit('asq:goto', {
	      session : session
	    });
	  });
	}

	function onASQFoloConnected(event){
	  updateViewersCount(event);
	}

	function updateViewersCount(event) {
	  console.log('viewer count update')
	  if (typeof event.connectedClients !== 'number') { return; }
	  var connectedViewers = event.connectedClients;
	  // Draw icons for the first 50 viewers
	  var lim = connectedViewers < 50 ? connectedViewers : 50;
	  $('.connected-viewers-icons').empty();
	  for (var i = 0; i < lim; i++) {
	    if (i % 10 === 0) {
	      $('.connected-viewers-icons').append('<br />');
	    } else if (i % 5 === 0) {
	      $('.connected-viewers-icons').append('<span>&nbsp;&nbsp;</span>');
	    }
	    $('.connected-viewers-icons').append('<i class="glyphicon glyphicon-user"> </i> ');
	  }

	  //update viewers count
	  $(".connected-viewers-number").text(connectedViewers + " viewers");
	  // New viewer connected.
	  if (event.screenName && event.token) {
	    console.info('Viewer ' + event.screenName + ' connected');
	  }
	}

	//next prev button
	$('#prev-btn').click(function onPrevButton(evt){
		adapter.prev();
	});
	$('#next-btn').click(function onNextButton(evt){
		adapter.next();
	});


	//check if we have last session stored
	var lastSession = $('body').attr('data-asq-last-session')
	  , sessionStart = lastSession == "" ? new Date() : new Date(lastSession);

	/* Hide thumbnails if page height is less than 1000px */
	if (window.innerHeight < 860) {
		$('.controlBottom').addClass('hiddenThumbs');
		$('.controlBottom').css('bottom', '-260px');
		$('#controlToggle a').html('<span class="glyphicon glyphicon-chevron-up"> </span> Show thumbnails <span class="glyphicon glyphicon-chevron-up"> </span>');
	}

	//check when the presentation on the iframe is ready
	var $iframe = $('#thisSlideFrame')
	$iframe.load(function(){
		var $iframebody = $iframe.contents().eq(0);
		$iframebody.on('impress:init', onIframeLoad)
	});

	function onIframeLoad(){
		var ThumbnailManager = require('./ThumbnailManager');
		var thumbMgr = new ThumbnailManager({ 
			impressEl : $iframe.contents().get(0),
      sels : {
        thumbsBarId: "#control-thumbs",
        thumbsHolderId    : "#thumbs-wrapper",
        thumbContainerClass  : "thumb",
        slideThumbClass : "thumb-step",
        dragBarId: "#thumbs-bar #dragbar",
      }
    }, $);
		thumbMgr.init();
	}



	/*  Add thumbnails and adjust size */
	$(function() {
		var width = 0;

		/* Add space for every thumbnail */
		$('.controlThumbs .thumb').each(function() {
			width += $(this).outerWidth(true);
		});

		/* Add extra space for bigger active thumbnail */
		width = width + 80;

		$('.thumbsWrapper').css('width', width + "px");
	});

	/* Click handler for thumbnails */
	// $('.thumbsWrapper .thumb').click(function() {
	// 	var go = $(".thumb").index(this);
	// 	impress().emitGoto(go);
	// 	//console.log(go);
	// });

	/* Show or hide thumbnails on mobile devices depending on orientation */
	function updateOrientation() {
		if(screen.width < 500 || screen.height < 500 ){
			switch(window.orientation) {
				case 0:
				case 180:
					$(".controls").removeClass("hidden-phone");
					$(".controlBottom")
						.addClass("hidden-phone")
						.css("top", "inherit")
						.css("height", "inherit");
					$(".thisSlideFrame").addClass("hidden-phone");
					break;

				case -90:
				case 90:
				$(".thisSlideFrame").addClass("hidden-phone");
					$(".controls").addClass("hidden-phone");
					$(".controlBottom")
						.removeClass("hidden-phone")
						.css("top", "0")
						.css("height", "100%");
					break;
			}
		}else{}
	}
	/*Hide iframes on tablest and phones */
	var userAgent = navigator.userAgent.toLowerCase();
	if(navigator.userAgent.match(/(iPhone)/g) ? true : false ){
		$("iframe").remove();
	}


	updateOrientation();

	/* Manually toggle thumbnails */
	$('#controlToggle').click(function(e) {
		if( $('.controlBottom').hasClass('hiddenThumbs') ) {
			$('.controlBottom')
				.removeClass('hiddenThumbs')
				.css('bottom', '0px');
			$('#controlToggle a').html('<span class="glyphicon glyphicon-chevron-down"> </span> Hide thumbnails <span class="glyphicon glyphicon-chevron-down"> </span>');
		}else{
			$('.controlBottom')
				.addClass('hiddenThumbs')
				.css('bottom', '-260px');
			$('#controlToggle a').html('<span class="glyphicon glyphicon-chevron-up"> </span> Show thumbnails <span class="glyphicon glyphicon-chevron-up"> </span>');
		}
	});

	/* Clock */
	setInterval(function() {

		var newDate = Math.abs(new Date() - sessionStart);

		var hours = Math.floor(((newDate / 1000) / 60 ) / 60);
		var minutes = Math.floor(((newDate / 1000) / 60) % 60);
		var seconds = Math.floor((newDate / 1000) % 60);

		$("#hours").html((hours < 10 ? "0" : "" ) + hours);
		$("#min").html((minutes < 10 ? "0" : "" ) + minutes);
		$("#sec").html((seconds < 10 ? "0" : "" ) + seconds);
	}, 1000);

	/* Reset Clock */

	$('#resetClock').click(function() {
		sessionStart = new Date();
	});
}

var presenterControl = module.exports = {
	presenterControlDOMBinder : presenterControlDOMBinder
}
