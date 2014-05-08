var ctx;
var activeCanvas = false;

if ((document.location.href).indexOf("?edit/") === -1) {

	function createCanvas(parent, width, height) {
		var canvas = {};
		canvas.node = document.createElement('canvas');
		canvas.context = canvas.node.getContext('2d');
		canvas.node.width = width || 100;
		canvas.node.height = height || 100;
		parent.appendChild(canvas.node);
		canvas.lastX = 0;
		canvas.lastY = 0;
		return canvas;
	}

	function init(container, width, height, fillColor) {
		var canvas = createCanvas(container, width, height);
		ctx = canvas.context;

		// define a custom fillCircle method
		ctx.fillCircle = function(x1, y1, x2, y2, lineThickness) {
			//this.fillStyle = fillColor;

			var steep = (Math.abs(y2 - y1) > Math.abs(x2 - x1));
			if (steep) {
				var x = x1;
				x1 = y1;
				y1 = x;

				var y = y2;
				y2 = x2;
				x2 = y;
			}
			if (x1 > x2) {
				var x = x1;
				x1 = x2;
				x2 = x;

				var y = y1;
				y1 = y2;
				y2 = y;
			}

			var dx = x2 - x1, dy = Math.abs(y2 - y1), error = 0, de = dy / dx, yStep = -1, y = y1;

			if (y1 < y2) {
				yStep = 1;
			}

			for (var x = x1; x < x2; x++) {
				if (steep) {
					this.fillRect(y, x, lineThickness, lineThickness);
				} else {
					this.fillRect(x, y, lineThickness, lineThickness);
				}

				error += de;
				if (error >= 0.5) {
					y += yStep;
					error -= 1.0;
				}
			}
		};

		ctx.clearTo = function() {
			ctx.clearRect(0, 0, width, height);
		};

		// bind mouse events
		canvas.node.onmousemove = function(e) {
			if (!canvas.isDrawing) {
				return;
			}
			mouseX = e.pageX - this.offsetLeft;
			mouseY = e.pageY - this.offsetTop;

			ctx.fillCircle(mouseX, mouseY, canvas.lastX, canvas.lastY, 6);

			canvas.lastX = mouseX;
			canvas.lastY = mouseY;

		};
		canvas.node.onmousedown = function(e) {
			canvas.isDrawing = true;
			canvas.lastX = e.pageX - this.offsetLeft;
			canvas.lastY = e.pageY - this.offsetTop;
		};
		canvas.node.onmouseup = function(e) {
			canvas.isDrawing = false;
		};
		canvas.node.onmousewheel = function(e) {
			var delta = e.detail ? e.detail * (-120) : e.wheelDelta;
			ctx.fillStyle = "rgb(" + delta + ",0,0)";
		}
	}

	var _width = $(window).width();
	var _height = $(window).height();
	var container = document.getElementById('canvas');

	document.addEventListener("keyup", function(event) {
		if (event.keyCode === 67) {
			if (activeCanvas) {
				ctx.clearTo();
				$('#canvas').hide();
				activeCanvas = !activeCanvas;
			} else {
				if (ctx === undefined) {
					init(container, _width, _height, '#ddd');
				}
				$('#canvas').show();
				activeCanvas = !activeCanvas;
			}
		}

	}, false);

}