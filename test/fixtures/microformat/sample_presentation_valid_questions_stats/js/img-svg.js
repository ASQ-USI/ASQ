//hack to move the svg referenced from an img.svg into the dom of the document.
//this will help to apply the css of the document to the image and achieve substep animations
//however since it will pollute the dom and we do not want animations on paper
// it should only be used in presentation mode

if (!(window.location.search.match(/edit/) || window.location.search.match(/print/))) {

jQuery(document).ready(function() {
	/*
	 * Replace all SVG images with inline SVG
	 */
	jQuery('img.svg').each(function() {
		var $img = jQuery(this);
		var imgID = $img.attr('id');
		var imgClass = $img.attr('class');
		var imgStyle = $img.attr('style');
		var imgURL = $img.attr('src');
	//	var imgWidth = $img.attr('width');

		jQuery.get(imgURL, function(data) {
			// Get the SVG tag, ignore the rest
			var $svg = jQuery(data).find('svg');

			// Add replaced image's ID to the new SVG
			if ( typeof imgID !== 'undefined') {
				$svg = $svg.attr('id', imgID);
			}
			// Add replaced image's classes to the new SVG
			if ( typeof imgClass !== 'undefined') {
				$svg = $svg.attr('class', imgClass + ' replaced-svg');
			}
			
			// Add replaced image's styles to the new SVG
			if ( typeof imgStyle !== 'undefined') {
				$svg = $svg.attr('style', $svg.attr('style') ? imgStyle + ' ' + $svg.attr('style') : imgStyle);
			}

            $svg = $svg.attr('viewBox', '0 0 '+$svg.attr('width')+' '+$svg.attr('height'));
   //         $svg = $svg.attr('width', "100%");
  //          $svg = $svg.attr('height', "100%");
//            if ( typeof imgWidth !== 'undefined') {
 //           	$svg = $svg.attr('width', imgWidth);
  //          }
 //           $svg = $svg.attr('height', '100%');
            $svg = $svg.attr('preserveAspectRatio', 'xMinYMin meet');
			$svg = $svg.attr('img-src', imgURL);

			// Remove any invalid XML tags as per http://validator.w3.org
			$svg = $svg.removeAttr('xmlns:a');

			// Replace image with new SVG
			$img.replaceWith($svg);
		});

	});
});

}