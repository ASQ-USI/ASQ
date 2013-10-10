'use strict';
var $ = require('jQuery');

function presenterControlDOMBinder(){
	//check if we have last session stored
	var lastSession = $('body').attr('data-asq-last-session')
	  , sessionStart = lastSession == "" ? new Date() : new Date(lastSession);

	/* Hide thumbnails if page height is less than 1000px */
	if (window.innerHeight < 860) {
		$('.controlBottom').addClass('hiddenThumbs');
		$('.controlBottom').css('bottom', '-260px');
		$('#controlToggle a').html('<span class="glyphicon glyphicon-chevron-up"> </span> Show thumbnails <span class="glyphicon glyphicon-chevron-up"> </span>');
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
	$('.thumbsWrapper .thumb').click(function() {
		var go = $(".thumb").index(this);
		impress().emitGoto(go);
		//console.log(go);
	});

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
	if(navigator.userAgent.match(/(iPhone|iPad)/g) ? true : false ){
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
