/**
 * @namespace shape
 * Represents shape
 */
ovm.shape = ovm.shape || {};

/**
 * Creates new shape probe
 * @constructor
 * @param xPixelSpacing Horizontal pixel spacing
 * @param yPixelSpacing Vertical pixel spacing
 * @returns {ovm.shape.probe}
 */
ovm.shape.probe = function (xPixelSpacing, yPixelSpacing, mult_cmp, measure_Unit) {
	var handle = 5;
	var probe = [];
	var curr_probe = null;
	var huValue = null;
	var valid = false;

	var xPxlSpcing = xPixelSpacing;
	var yPxlSpcing = yPixelSpacing;
	var multComp = mult_cmp;
	var measureUnit = measure_Unit;
	var isCurrentDrawingLine = false;

	/**
	 * Creates new line
	 * @param x1 Starting x coordinate
	 * @param y1 Starting y coordinate
	 * @param x2 Ending x coordinate
	 * @param y2 Ending y coordinate
	 */
	this.createNewProbe = function (x1, y1, x2, y2) {
		if (curr_probe != undefined) {
			curr_probe.setCoords(x1, y1, x2, y2, false);
			if (parseInt(curr_probe.len) <= 0 && curr_probe.huValue != null) {
				probe.push(curr_probe);
				curr_probe = undefined;
			}
		}
	};

	/**
	 * Initializes the line
	 */
	this.initNewProbe = function (huValue) {
		curr_probe = new ovm.probe(xPxlSpcing, yPxlSpcing, multComp, measureUnit, 0, 0, 0, 0, 0, huValue);
	};

	/**
	 * getter for probe for the image Shown
	 * @returns {Array} List of probe drawn 
	 */
	this.getProbe = function () {
		return probe;
	};

	/**
	 *  Setter for probe for the image Shown
	 * @param probe
	 */
	this.setProbe = function (probes) {
		probe = probes;
	};

	this.fillText = function (graphic, ctx, textX, textY) {
		ctx.strokeStyle = ctx.fillStyle = 'orange';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(graphic.x1, graphic.y1);
		ctx.lineTo(graphic.x1 + 1, graphic.y1 + 1);
		//ctx.lineTo(textX, textY);
		ctx.stroke();
		ctx.closePath();
		ctx.fillStyle = 'white';
		ctx.fillText(graphic.huValue, textX, textY);
		ctx.restore();
	};

	/**
	 * Draws the line
	 * @param graphic viewport graphic
	 * @param ctx canvas context reference
	 */
	this.draw = function (graphic, ctx) {
		ctx.strokeStyle = ctx.fillStyle = 'orange';
		ctx.beginPath();
		ctx.moveTo(graphic.x1, graphic.y1);
		ctx.lineTo(graphic.x2, graphic.y2);
		ctx.stroke();
		ctx.closePath();
		// Handles		
		ctx.strokeStyle = ctx.fillStyle = '#ff8a00';
		ctx.beginPath();
		ctx.arc(graphic.x1, graphic.y1, 2, 0, 2 * Math.PI);
		ctx.fillStyle = "#ff8a00";
		ctx.fill();
		ctx.stroke();
		ctx.closePath();
		
		// Text
		ctx.fillStyle = "maroon";
		ctx.globalAlpha = 0.7;
		ctx.font = "14px Arial";
		var text = ctx.measureText(graphic.huValue);

		ctx.fillRect(graphic.textX, graphic.textY, Math.ceil(text.width) + 5, 20);
		ctx.globalAlpha = 0.9;
		ctx.fillStyle = "white";
		//ctx.fillText(graphic.len+ " " + measureUnit,graphic.textX+2,graphic.textY+14);

		if (state.hflip && !state.vflip && !state.rotate != 0 && !this.isCurrentDrawingLine) {
			ctx.save();
			ctx.translate(drawCanvas.width, 0);
			ctx.scale(-1, 1);
			let textX = (drawCanvas.width - graphic.textX) - 60;
			let textY = graphic.textY + 14;
			this.fillText(graphic, ctx, textX, textY);
		}

		if (state.vflip && !state.hflip && !state.rotate != 0 && !this.isCurrentDrawingLine) {
			ctx.save();
			ctx.translate(0, drawCanvas.height);
			ctx.scale(1, -1);
			let textX = graphic.textX;
			let textY = (drawCanvas.height - graphic.textY);
			this.fillText(graphic, ctx, textX, textY);
		}

		if (!state.vflip && state.hflip && (state.rotate === 90 || state.rotate === 180 || state.rotate === 270) && !this.isCurrentDrawingLine) {
			if (state.rotate === 90 || state.rotate === 180 || state.rotate === 270) {
				ctx.save();
				ctx.translate(0, drawCanvas.height);
				ctx.scale(1, -1);
				let textX = graphic.textX;
				let textY = (drawCanvas.height - graphic.textY);
				this.fillText(graphic, ctx, textX, textY);
			}
		}

		if (state.vflip && !state.hflip && (state.rotate === 90 || state.rotate === 180 || state.rotate === 270) && !this.isCurrentDrawingLine) {
			if (state.rotate === 90 || state.rotate === 180 || state.rotate === 270) {
				ctx.save();
				ctx.translate(drawCanvas.width, 0);
				ctx.scale(-1, 1);
				let textX = (drawCanvas.width - graphic.textX) - 60;
				let textY = graphic.textY + 14;
				this.fillText(graphic, ctx, textX, textY);
			}
		}

		if (state.rotate != 0 && !state.vflip && !state.hflip && !this.isCurrentDrawingLine) {
			if (state.rotate === 180) {
				ctx.save();
				ctx.translate(drawCanvas.width / 2, drawCanvas.height / 2);
				ctx.rotate(Math.PI);
				ctx.translate(-drawCanvas.width / 2, -drawCanvas.height / 2);
				let textX = (drawCanvas.width - graphic.textX) - 60;
				let textY = (drawCanvas.height - graphic.textY);
				this.fillText(graphic, ctx, textX, textY);
			}
			else {
				let textX = graphic.textX + 2;
				let textY = graphic.textY + 14;
				this.fillText(graphic, ctx, textX, textY);
			}
		}

		if ((state.rotate === 0 || state.rotate === 90 || state.rotate === 180 || state.rotate === 270) && state.vflip && state.hflip && !this.isCurrentDrawingLine) {
			if (state.rotate === 0) {
				ctx.save();
				ctx.translate(drawCanvas.width, drawCanvas.height);
				ctx.scale(-1, -1);
				let textX = (drawCanvas.width - graphic.textX) - 60;
				let textY = (drawCanvas.height - graphic.textY);
				this.fillText(graphic, ctx, textX, textY);
			} else {
				let textX = graphic.textX + 2;
				let textY = graphic.textY + 14;
				this.fillText(graphic, ctx, textX, textY);
			}
		}

		if (!state.hflip && !state.vflip && !state.rotate != 0) {
			let textX = graphic.textX + 2;
			let textY = graphic.textY + 14;
			this.fillText(graphic, ctx, textX, textY);
		}

		if (this.isCurrentDrawingLine) {
			let textX = graphic.textX + 2;
			let textY = graphic.textY + 14;
			ctx.strokeStyle = ctx.fillStyle = 'orange';
			this.fillText(graphic, ctx, textX, textY);
		}

		// Reference probe
		if (graphic.x1 != graphic.textX) {
			ctx.save();
			ctx.beginPath();
			ctx.globalAlpha = 0.5;
			ctx.strokeStyle = "yellow";
			ctx.setLineDash([10, 7]);
			var closestPt = this.getClosestAnchor([{ x: graphic.textX, y: graphic.textY }, { x: graphic.textX + Math.ceil(text.width + 5), y: graphic.textY }, { x: graphic.textX, y: graphic.textY + 20 }, { x: graphic.textX + Math.ceil(text.width + 5), y: graphic.textY + 20 }], { x: graphic.refX, y: graphic.refY });
			ctx.moveTo(closestPt.x, closestPt.y);
			ctx.lineTo(graphic.refX, graphic.refY);
			ctx.stroke();
			ctx.closePath();
			ctx.restore();
		}
	};

	/**
	 * Draws all the probe
	 * @param ctx Canvas context reference
	 */
	this.drawData = function (ctx) {
		ctx.save();
		ctx.lineWidth = '2';

		for (var i = 0; i < probe.length; i++) {
			this.draw(this.viewPortGraphic(probe[i]), ctx);
		}
		ctx.restore();
	};

	/**
	 * Draws a probe for which the initialization is in progress
	 * @param canvasCtx Canvas context reference
	 * @param x1 Starting x coordinate 
	 * @param y1 Starting y coordinate
	 * @param x2 Ending x coordinate
	 * @param y2 Ending y coordinate
	 */
	this.drawProbe = function (canvasCtx, x1, y1, x2, y2) {
		curr_probe.setCoords(x1, y1, x2, y2, true);
		this.isCurrentDrawingLine = true;
		canvasCtx.save();
		canvasCtx.lineWidth = '2';
		this.draw(this.viewPortGraphic(curr_probe), canvasCtx);
		this.isCurrentDrawingLine = false;
		canvasCtx.restore();
	};

	/**
	 * Gives the selected line
	 * @param canvasCtx canvasCtx Canvas context reference
	 * @param x Starting x coordinate 
	 * @param y Starting y coordinate 
	 * @returns Selected line
	 */
	this.getActiveLine = function (canvasCtx, x, y) {
		for (var i = 0; i < probe.length; i++) {
			var line = probe[i];
			if (line.isActiveShape(canvasCtx, x, y)) {
				return line;
			}
		}
		return null;
	};

	/**
	 * Converts actual shape's coordinated to view port coordinates
	 * @param shape Actual line object
	 * @returns View port line
	 */
	this.viewPortGraphic = function (shape) {
		return {
			x1: shape.x1 * state.scale + state.translationX,
			y1: shape.y1 * state.scale + state.translationY,
			x2: shape.x2 * state.scale + state.translationX,
			y2: shape.y2 * state.scale + state.translationY,
			textX: shape.textX * state.scale + state.translationX,
			textY: shape.textY * state.scale + state.translationY,
			refX: shape.refX * state.scale + state.translationX,
			refY: shape.refY * state.scale + state.translationY,
			active: shape.active,
			txtActive: shape.txtActive,
			huValue: shape.huValue
		};
	};

	/**
	 * Converts view port coordinates to actual coordinates
	 * @param point View port points
	 * @returns Actual coordinates
	 */
	this.canvasToImgCoordinates = function (point) {
		return { x: (point.x - state.translationX) / state.scale, y: (point.y - state.translationY) / state.scale };
	};

	/**
	 * Removes selected line
	 * @param shape Line to be removed
	 */
	this.removeShape = function (shape) {
		probe.splice(probe.indexOf(shape), 1);
	};

	/**
	 * Disposes all the probe
	 */
	this.clearAll = function () {
		probe = [];
	};

	/**
	 * Gives closest anchor for the reference point
	 * @param points Anchor points
	 * @param refPt Reference point
	 * @returns Closes anchor coordinates
	 */
	this.getClosestAnchor = function (points, refPt) {
		var dist1 = Math.round(Math.sqrt(Math.pow(points[0].x - refPt.x, 2) + Math.pow(points[0].y - refPt.y, 2)));
		var dist2 = Math.round(Math.sqrt(Math.pow(points[1].x - refPt.x, 2) + Math.pow(points[1].y - refPt.y, 2)));
		var dist3 = Math.round(Math.sqrt(Math.pow(points[2].x - refPt.x, 2) + Math.pow(points[2].y - refPt.y, 2)));
		var dist4 = Math.round(Math.sqrt(Math.pow(points[3].x - refPt.x, 2) + Math.pow(points[3].y - refPt.y, 2)));
		var min = Math.min(dist1, dist2, dist3, dist4);

		switch (min) {
			case dist1:
				return points[0];
			case dist2:
				return points[1];
			case dist3:
				return points[2];
			case dist4:
				return points[3];
			default:
				return points[0];
		}
	};
};

/**
 * @namespace line
 * Represents name space line
 * @param xPixelSpacing Horizontal pixel spacing
 * @param yPixelSpacing Vertical pixel spacing
 * @param a Starting x coordinate
 * @param b Starting y coordinate
 * @param c Ending x coordinate
 * @param d Ending y coordinate
 */
ovm.probe = function (xPixelSpacing, yPixelSpacing, mult_cmp, measure_Unit, a, b, c, d, e, huValue) {
	// Variables
	var handle = 5;
	this.xPxlSpcing = xPixelSpacing;
	this.yPxlSpcing = yPixelSpacing;
	this.multComp = mult_cmp;
	this.measureUnit = measure_Unit;
	this.x1 = a;
	this.y1 = b;
	this.x2 = c;
	this.y2 = d;
	this.active = false;
	this.len = e;
	this.huValue = huValue;

	// Text
	this.textX = a;
	this.textY = b - 25;
	this.txtActive = false;
	this.refX = 0;
	this.refY = 0;

	/**
	 * Sets line coordinates
	 * @param a Starting x coordinate
	 * @param b Starting y coordinate
	 * @param c Ending x coordinate
	 * @param d Ending y coordinate
	 * @param Selection status of the line
	 */
	this.setCoords = function (a, b, c, d, active) {
		this.x1 = (a - state.translationX) / state.scale;
		this.y1 = (b - state.translationY) / state.scale;
		this.x2 = (c - state.translationX) / state.scale;
		this.y2 = (d - state.translationY) / state.scale;
		this.active = active;
		this.len = this.calculateLength(this.x2 - this.x1, this.y2 - this.y1).toFixed(1);
		this.textX = this.x1;
		this.textY = this.y1 - (25 / state.scale);
		this.findClosestPointOnLine();
	};

	/**
	 * Gives the shape's name
	 * @returns {String} shape's name
	 */
	this.getType = function () {
		return "probe";
	};

	/**
	 * Gives line's selection status
	 * @param canvasCtx Canvas context reference
	 * @param x Horizontal mouse coordinate 
	 * @param y Vertical mouse coordinate
	 * @returns {Boolean} True if the line is active, false otherwise
	 */
	this.isActiveShape = function (canvasCtx, x, y) {
		var start = this.ImgTocanvascoordinates({ x: this.x1, y: this.y1 });
		var end = this.ImgTocanvascoordinates({ x: this.x2, y: this.y2 });
		var a = Math.round(Math.sqrt(Math.pow((end.x + handle) - (start.x + handle), 2) + Math.pow((end.y + handle) - (start.y + handle), 2)));
		var b = Math.round(Math.sqrt(Math.pow(x - (start.x + handle), 2) + Math.pow(y - (start.y + handle), 2)));
		var c = Math.round(Math.sqrt(Math.pow((end.x + handle) - x, 2) + Math.pow((end.y + handle) - y, 2)));
		this.active = (a == b + c);
		return this.active || this.isTextSelection(canvasCtx, x, y);
	};

	/**
	 * Detects selected anchor
	 * @param x Horizontal mouse coordinate 
	 * @param y Vertical mouse coordinate
	 * @param target Canvas
	 * @returns {Number} Selected anchor index
	 */
	this.detectHandle = function (x, y, target) {
		var start = this.ImgTocanvascoordinates({ x: this.x1, y: this.y1 });
		var end = this.ImgTocanvascoordinates({ x: this.x2, y: this.y2 });

		if (x >= start.x - handle && x <= start.x + handle && y >= start.y - handle && y <= start.y + handle) {
			target.style.cursor = "pointer";
			return 0;
		} else if (x >= end.x - handle && x <= end.x + handle && y >= end.y - handle && y <= end.y + handle) {
			target.style.cursor = "pointer";
			return 1;
		} else {
			return -1;
		}
	};

	/**
	 * Moves the selected line based on mouse coordinates
	 * @param deltaX Amount of distance to move line in horizontal direction
	 * @param deltaY Amount of distance to move line in vertical direction
	 */
	this.moveShape = function (deltaX, deltaY) {
		if (this.active) {
			this.x1 += deltaX;
			this.y1 += deltaY;
			this.x2 += deltaX;
			this.y2 += deltaY;
		}
		this.textX += deltaX;
		this.textY += deltaY;
		this.findClosestPointOnLine();
	};

	/**
	 * Resizes the line
	 * @param deltaX Amount of distance to move line in horizontal direction
	 * @param deltaY Amount of distance to move line in vertical direction
	 * @param handleIndex Selected anchor of the line which decides resize direction
	 */
	this.resizeShape = function (deltaX, deltaY, handle) {
		switch (handle) {
			case 0:
				this.x1 += deltaX;
				this.y1 += deltaY;
				this.len = this.calculateLength(this.x2 - this.x1, this.y2 - this.y1).toFixed(1);
				break;
			case 1:
				this.x2 += deltaX;
				this.y2 += deltaY;
				this.len = this.calculateLength(this.x2 - this.x1, this.y2 - this.y1).toFixed(1);
				break;
		}
		this.findClosestPointOnLine();
	};

	/**
	 * Calculates length of the line
	 * @param xDiff Difference between horizontal coordinates 
	 * @param yDiff Difference between vertical coordinates
	 * @returns {Number} Length
	 */
	this.calculateLength = function (xDiff, yDiff) {
		var mult = Math.max(this.getFloatShift(this.xPxlSpcing), this.getFloatShift(this.yPxlSpcing));
		var xDist = mult * this.xPxlSpcing * xDiff;
		var yDist = mult * this.yPxlSpcing * yDiff;
		var mult_factor = 1;

		if (this.xPxlSpcing < this.yPxlSpcing) {
			mult_factor = this.yPxlSpcing / this.xPxlSpcing;
		} else if (this.yPxlSpcing < this.xPxlSpcing) {
			mult_factor = this.xPxlSpcing / this.yPxlSpcing;
		}
		if (mult_cmp == "vertical") {
			yDist *= mult_factor;
		} else if (mult_cmp == "horizontal") {
			xDist *= mult_factor;
		}
		return (Math.sqrt((Math.pow(xDist, 2) + Math.pow(yDist, 2)) / Math.pow(mult, 2)));
	};

	/**
	 * Gives floating point shift
	 * @param floatNum - Float number
	 * @returns Float shift
	 */
	this.getFloatShift = function (floatNum) {
		var decimalLen = 0;
		var floatElements = floatNum.toString().split('\.');
		if (floatElements.length == 2) {
			decimalLen = floatElements[1].length;
		}
		mult = Math.pow(10, decimalLen);
		return mult;
	};

	/**
	 * Converts view port coordinates to actual coordinates
	 * @param point View port points
	 * @returns Actual coordinates
	 */
	this.canvasToImgcoordinates = function (point) {
		return { x: ((point.x - state.translationX) / state.scale), y: ((point.y - state.translationY) / state.scale) };
	};

	/**
	 * Converts actual coordinates to view port coordinates
	 * @param point Actual points
	 * @returns View port coordinates
	 */
	this.ImgTocanvascoordinates = function (point) {
		return { x: point.x * state.scale + state.translationX, y: point.y * state.scale + state.translationY };
	};

	/**
	 * Tracks text selection of the line
	 * @param canvasCtx Context of the canvas
	 * @param mouseX Horizontal mouse coordinate
	 * @param mouseY Vertical mouse coordinate
	 * @returns {Boolean} True if text of an line has been selected, false otherwise
	 */
	this.isTextSelection = function (canvasCtx, mouseX, mouseY) {
		var x = (mouseX - state.translationX) / state.scale;
		var y = (mouseY - state.translationY) / state.scale;

		var textWid = Math.ceil(canvasCtx.measureText(this.len + " " + this.measureUnit).width) + 5;
		this.txtActive = (x >= this.textX && x <= this.textX + (textWid / state.scale) && y >= this.textY && y <= (this.textY + (20 / state.scale)));
		return this.txtActive;
	};

	/**
	 * Finds closest point in a line from the specified point
	 * @param A Point A
	 * @param B Point B
	 * @param P Point C
	 */
	this.findClosestPointOnLine = function () {
		var ptWithinLine = true;

		var dotproduct = (this.textX - this.x1) * (this.x2 - this.x1) + (this.textY - this.y1) * (this.y2 - this.y1);
		if (dotproduct < 0) {
			ptWithinLine = false;
		}

		var squaredlengthBA = (this.x2 - this.x1) * (this.x2 - this.x1) + (this.y2 - this.y1) * (this.y2 - this.y1);

		if (dotproduct > squaredlengthBA) {
			ptWithinLine = false;
		}

		if (ptWithinLine) {
			var a_to_p = [this.textX - this.x1, this.textY - this.y1]; // Vector A to P
			var a_to_b = [this.x2 - this.x1, this.y2 - this.y1]; // Vector A to B

			// Find squared magnitude of a_to_b
			var atb2 = Math.pow(a_to_b[0], 2) + Math.pow(a_to_b[1], 2);

			// Find dot product of a_to_p and a_to_b
			var atp_dot_atb = a_to_p[0] * a_to_b[0] + a_to_p[1] * a_to_b[1];

			// Normalized distance from a to closest point
			var t = atp_dot_atb / atb2;

			// Add the distance to A, moving towards B
			this.refX = this.x1 + a_to_b[0] * t;
			this.refY = this.y1 + a_to_b[1] * t;
		} else {
			var p_to_a = Math.sqrt(Math.pow(this.textX - this.x1, 2) + Math.pow(this.textY - this.y1, 2));	// Distance from Point to A
			var p_to_b = Math.sqrt(Math.pow(this.textX - this.x2, 2) + Math.pow(this.textY - this.y2, 2));	// Distance from Point to B

			if (p_to_b > p_to_a) {
				this.refX = this.x1;
				this.refY = this.y1;
			} else {
				this.refX = this.x2;
				this.refY = this.y2;
			}
		}
	};
};
