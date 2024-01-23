ovm.shape = ovm.shape || {};

ovm.shape.cobb = function () {
    let cobb = [];
    this.current = null;
    this.canvas = document.getElementById('canvasLayer2');
    this.isCurrentDrawingAngle = false;

    this.initCobb = function () {
        this.current = new ovm.cobb();
    };

    this.cobbStarted = function () {
        return this.current != null;
    };

    this.drawCobb = function (context) {
        context.save();
        // this.draw(context, this.current);
        context.restore();
    };

    this.getCurrentShape = function (context, x, y) {
    	x = (x - state.translationX) / state.scale;
        y = (y - state.translationY) / state.scale;
        this.current = null;
        this.getActiveLine(context, x, y);

        if (this.current == null) {
            this.initCobb();
            cobb.push(this.current);
        }
        return this.current;
    };

    this.getCobbList = function () {
        return cobb;
    };

    this.setCobbList = function (cobbList) {
        cobb = cobbList;
    };

    this.getActiveLine = function (context, x, y) {
        cobb.forEach(measure => {
            if (measure.isActiveAngle(context, x, y)) {
                this.current = measure;
            }
        });
    };

    this.deleteLast = function () {
        cobb.pop();
        this.clear();
    };

    this.drawAll = function () {
    	let context = this.canvas.getContext('2d');
        cobb.forEach(measure => {
        	 if (measure.line1 !== null && measure.line2 !== null) {
                 this.draw(measure, this.viewPortGraphics(measure), context);
             } else if (measure.line1 !== null) {
                 let line = this.getScaledLine(measure.line1);
                 measure.drawHandle(line);
                 measure.drawLine(line, [], 'orange');
             }
        });
        context.restore();
    };

    this.clear = function () {
        let context = this.canvas.getContext('2d');
        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        context.restore();
    };
    
    this.clearAll = function () {
        cobb = [];
    };
    
    this.draw = function (shape, graphics, context) {
    	shape.setContext(context);
    	shape.drawLine(graphics.line1, [], 'orange');
        shape.drawLine(graphics.line2, [], 'orange');
        shape.drawHandle(graphics.line1);
        shape.drawHandle(graphics.line2);
        shape.processPerpendicular(graphics.line1, graphics.line2);
        context.setLineDash([]);
        context.font = "14px Arial";
        context.fillStyle = 'maroon';
        context.textAlign = 'center';
        context.globalAlpha = 0.9;
        let text = context.measureText(graphics.angle.toString());
        context.fillRect(graphics.textX, graphics.textY, Math.ceil(text.width) + 5, 20);
        context.fillStyle = "white";
        if (state.hflip && !state.vflip && !state.rotate != 0 && !this.isCurrentDrawingLine) {
            context.save();
            context.translate(drawCanvas.width, 0);
            context.scale(-1, 1);
            context.fillText(graphics.angle, ((drawCanvas.width - graphics.textX) - 60) + (text.width * 0.5), graphics.textY + 14);
        }

        if (state.vflip && !state.hflip && !state.rotate != 0) {
            context.save();
            context.translate(0, drawCanvas.height);
            context.scale(1, -1);
            context.fillText(graphics.angle, graphics.textX, (drawCanvas.height - graphics.textY) + (text.width * 0.5));
        }

        if (!state.vflip && state.hflip && (state.rotate === 90 || state.rotate === 180 || state.rotate === 270)) {
            if (state.rotate === 90 || state.rotate === 180 || state.rotate === 270) {
                context.save();
                context.translate(0, drawCanvas.height);
                context.scale(1, -1);
                context.fillText(graphics.angle, graphics.textX, (drawCanvas.height - graphics.textY) + (text.width * 0.5));
            }
        }

        if (state.vflip && !state.hflip && (state.rotate === 90 || state.rotate === 180 || state.rotate === 270)) {
            if (state.rotate === 90 || state.rotate === 180 || state.rotate === 270) {
                context.save();
                context.translate(drawCanvas.width, 0);
                context.scale(-1, 1);
                context.fillText(graphics.angle, ((drawCanvas.width - graphics.textX) - 60) + (text.width * 0.5), graphics.textY + 14);
            }
        }

        if (state.rotate != 0 && !state.vflip && !state.hflip) {
            if (state.rotate === 180) {
                context.save();
                context.translate(drawCanvas.width / 2, drawCanvas.height / 2);
                context.rotate(Math.PI);
                context.translate(-drawCanvas.width / 2, -drawCanvas.height / 2);
                context.fillText(graphics.angle, ((drawCanvas.width - graphics.textX) - 60) + (text.width * 0.5), (drawCanvas.height - graphics.textY) + (text.width * 0.5));
            }
            else {
                context.fillText(graphics.angle, (graphics.textX + 2) + (text.width * 0.5), graphics.textY + 14);
            }
        }

        if ((state.rotate === 0 || state.rotate === 90 || state.rotate === 180 || state.rotate === 270) && state.vflip && state.hflip) {
            if (state.rotate === 0) {
                context.save();
                context.translate(drawCanvas.width, drawCanvas.height);
                context.scale(-1, -1);
                context.fillText(graphics.angle, ((drawCanvas.width - graphics.textX) - 60) + (text.width * 0.5), (drawCanvas.height - graphics.textY) + (text.width * 0.5));
            } else {
                context.fillText(graphics.angle, (graphics.textX + 2) + (text.width * 0.5), graphics.textY + 14);
            }
        }

        if (!state.hflip && !state.vflip && !state.rotate != 0) {
            context.fillText(graphics.angle, (graphics.textX + 2) + (text.width * 0.5), graphics.textY + 14);
        }
    };
    
    this.viewPortGraphics = function(shape) {
    	return {
            line1: this.getScaledLine(shape.line1),
            line2: this.getScaledLine(shape.line2),
            textX: shape.textX,
            textY: shape.textY,
            angle: shape.angle + '\u00B0'
        };
    };
    
    this.getScaledLine = function (line) {
        return {
            x1: line.x1 * state.scale + state.translationX,
            y1: line.y1 * state.scale + state.translationY,
            x2: line.x2 * state.scale + state.translationX,
            y2: line.y2 * state.scale + state.translationY,
        };
    };
};


ovm.cobb = function () {
    this.line1 = null;
    this.line2 = null;
    this.angleLine = null;
    this.angle = null;
    this.active = false;
    this.newLine = true;
    this.firstLine = false;
    this.canvas = null;
    this.context = null;
    this.handle = 2;
    this.textX = null;
    this.textY = null;
    
    /**
	 * Gives the shape's name
	 * @returns {String} shape's name
	 */
	this.getType = function() {
		return "cobb";
	};
	
	this.setContext = function (context) {
        this.context = context;
    };

    this.setFirstLine = function (startPoint, endPoint) {
        this.canvas = document.getElementById('canvasLayer2');
        this.context = this.canvas.getContext('2d');
        this.clearCanvas();
        let line = this.coordinatesInOrder(this.getLineOneCordinates(startPoint, endPoint));
        this.line1 = this.coordinatesInOrder(this.getCoordinates(startPoint, endPoint));
        this.drawLine(line, [], 'orange');
        this.drawHandle(line);
        if (this.line2 != null) {
            this.drawLine(this.line2, [], 'orange');
        }
    };

    this.setSecondLine = function (startPoint, endPoint) {
        this.line2 = this.coordinatesInOrder(this.getCoordinates(startPoint, endPoint));
        this.drawLine(this.line2, [], 'orange');
        this.drawHandle(this.line2);
    };

    this.changeFirstLine = function (mousePoint) {
        this.line1 = this.changeLine(this.line1, mousePoint);
    };

    this.changeSecondLine = function (mousePoint) {
        this.line2 = this.changeLine(this.line2, mousePoint);
    };

    this.changeLine = function (line, mousePoint) {
        let point = this.getPosition(mousePoint);
        if (this.detectHandle(line, point)) {
            line.x1 = point.x;
            line.y1 = point.y;
        } else {
            line.x2 = point.x;
            line.y2 = point.y;
        }
        return line;
    };
    
    this.getLineOneCordinates = function (startPoint, endPoint) {
        let firstCoordinate = this.getLineOnePosition(startPoint);
        let secondCoordinate = this.getLineOnePosition(endPoint);
        return {
            x1: firstCoordinate.x,
            y1: firstCoordinate.y,
            x2: secondCoordinate.x,
            y2: secondCoordinate.y
        };
    }

    this.getLineOnePosition = function (mousePoint) {
        return {
            x: mousePoint.pageX - zoom.offsetLeft,
            y: mousePoint.pageY - zoom.offsetTop
        };
    };


    this.getCoordinates = function (startPoint, endPoint) {
        let firstCoordinate = this.getPosition(startPoint);
        let secondCoordinate = this.getPosition(endPoint);
        return {
            x1: firstCoordinate.x,
            y1: firstCoordinate.y,
            x2: secondCoordinate.x,
            y2: secondCoordinate.y
        };
    };

    this.getPosition = function (mousePoint) {
    	return {
            x: (mousePoint.pageX - state.translationX) / state.scale,
            y: (mousePoint.pageY - state.translationY) / state.scale
        };
    };

    this.drawFirstLine = function () {
        this.drawLine(this.line1, [], 'orange');
        this.drawHandle(this.line1);
    };

    this.drawLine = function (line, dasher, color) {
        this.context.beginPath();
        this.context.setLineDash(dasher);
        this.context.moveTo(line.x1, line.y1);
        this.context.lineTo(line.x2, line.y2);
        this.context.lineWidth = 1.5;
        this.context.strokeStyle = color;
        this.context.stroke();
    };

    this.drawHandle = function (line) {
    	this.context.strokeStyle = 'white';
        this.context.fillStyle = "white";
        this.context.beginPath();
        this.context.arc(line.x1, line.y1, this.handle, 0, 2 * Math.PI);
        this.context.fill();
        this.context.stroke();
        this.context.closePath();
        this.context.beginPath();
        this.context.arc(line.x2, line.y2, this.handle, 0, 2 * Math.PI);
        this.context.fill();
        this.context.stroke();
        this.context.closePath();
    };

    this.processAngle = function () {
    	if(this.line1 != null && this.line2 != null) {
	        let distance = this.getNearDistance(this.line1, this.line2);
	        let x, y;
	
	        if (distance.first < distance.second) {
	            x = this.line1.x1 - this.line2.x1;
	            y = this.line1.y1 - this.line2.y1;
	            this.angleLine = {
	                x1: this.line1.x1,
	                y1: this.line1.y1,
	                x2: this.line2.x2 + x,
	                y2: this.line2.y2 + y
	            };
	
	        } else {
	            x = this.line2.x2 - this.line1.x2;
	            y = this.line2.y2 - this.line1.y2;
	            this.angleLine = {
	                x1: this.line1.x2,
	                y1: this.line1.y2,
	                x2: this.line2.x1 - x,
	                y2: this.line2.y1 - y
	            };
	        }
        	this.newLine = false;
    	}
    };

    this.coordinatesInOrder = function (line) {
        if (line.x1 > line.x2) {
            line = this.interchangeCoordinates(line);
        }
        return line;
    };

    this.interchangeCoordinates = function (line) {
        let x1 = line.x1;
        let y1 = line.y1;
        line.x1 = line.x2;
        line.y1 = line.y2;
        line.x2 = x1;
        line.y2 = y1;
        return line;
    };

    this.getNearDistance = function (line1, line2) {
        let distance1 = this.getDistance(line1.x1, line1.y1, line2.x1, line2.y1);
        let distance2 = this.getDistance(line1.x2, line1.y2, line2.x2, line2.y2);
        return {
            first: distance1,
            second: distance2
        };
    };

    this.getDistance = function (x1, y1, x2, y2) {
        let a = x1 - x2;
        let b = y1 - y2;
        return Math.hypot(a, b);
    };

    this.getAngle = function (line1, line2) {
        const dAx = line1.x2 - line1.x1;
        const dAy = line1.y2 - line1.y1;
        const dBx = line2.x2 - line2.x1;
        const dBy = line2.y2 - line2.y1;
        let angle = Math.atan2(dAx * dBy - dAy * dBx, dAx * dBx + dAy * dBy);
        if (angle < 0) {
            angle = angle * -1;
        }
        angle = (angle * (180 / Math.PI));
        if (angle > 90) {
            angle = angle % 90;
            return Math.round(90 - angle);
        }
        return Math.round(angle);
    };

    this.isActiveAngle = function (context, x, y) {
        this.firstLine = this.getActive(this.line1, x, y);
        let second = this.getActive(this.line2, x, y);
        this.active = this.firstLine || second;
        return this.active;
    };

    this.getActive = function (line, x, y) {
        let linePoint = this.nearestPoint(line, x, y);
        let dx = x - linePoint.x;
        let dy = y - linePoint.y;
        let distance = Math.abs(Math.sqrt(dx * dx + dy * dy));
        return distance < 5;
    };

    this.clearCanvas = function () {
        this.context.save();
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.restore();
    };

    this.nearestPoint = function (line, x, y) {
        let lerp = function (a, b, x) {
            return (a + x * (b - a));
        };
        const dx = line.x2 - line.x1;
        const dy = line.y2 - line.y1;
        const t = ((x - line.x1) * dx + (y - line.y1) * dy) / (dx * dx + dy * dy);
        const lineX = lerp(line.x1, line.x2, t);
        const lineY = lerp(line.y1, line.y2, t);
        return {
        	x: lineX, 
        	y: lineY
        };
    };

    this.detectHandle = function (line, point) {
        let distance1 = this.getDistance(line.x1, line.y1, point.x, point.y);
        let distance2 = this.getDistance(line.x2, line.y2, point.x, point.y);
        return distance1 < distance2;
    };

    this.intersectionLine = function (line1, line2) {
        let x1 = (line1.x1 + line1.x2) / 2;
        let y1 = (line1.y1 + line1.y2) / 2;
        let x2 = (line2.x1 + line2.x2) / 2;
        let y2 = (line2.y1 + line2.y2) / 2;
        let intersection = {
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2
        };
        this.drawLine(intersection, [5, 2], 'white');
    };

    this.draw = function () {
        if (this.line1 != null && this.line2 != null) {
            let color = 'orange';
            if (this.active) {
                color = 'yellow';
            }
            this.drawLine(this.line1, [], color);
            this.drawLine(this.line2, [], color);
            this.drawHandle(this.line1);
            this.drawHandle(this.line2);
            this.drawPerpendicular();
            this.context.setLineDash([]);
        }
    };
    
    this.drawPerpendicular = function () {
        this.processPerpendicular(this.line1, this.line2);
    };

    this.processPerpendicular = function (line1, line2) {
        this.getPerpendicular(line1, line2);
        let intersectionPoint = this.checkLineIntersection(this.perpendicularOne.x1, this.perpendicularOne.y1, this.perpendicularOne.x2, this.perpendicularOne.y2,
            this.perpendicularTwo.x1, this.perpendicularTwo.y1, this.perpendicularTwo.x2, this.perpendicularTwo.y2);

        let distanceOne = 30;
        let distanceTwo = 30;

        let lengthOne = this.perpendicularLength(this.line1, distanceOne);
        let lengthTwo = this.perpendicularLength(this.line2, distanceTwo);

        if (intersectionPoint.x <= 0
                || intersectionPoint.y <= 0
                || intersectionPoint.x >= this.canvas.width
                || intersectionPoint.y >= this.canvas.height) {
                this.textX = line1.x1 + 15;
                this.textY = line1.y1 + 15;
            } else {
                this.textX = intersectionPoint.x + 15;
                this.textY = intersectionPoint.y + 15;
            }

        let lineP1 = {
            x1: this.perpendicularOne.x1,
            y1: this.perpendicularOne.y1,
            x2: intersectionPoint.x,
            y2: intersectionPoint.y
        };

        let lineP2 = {
            x1: intersectionPoint.x,
            y1: intersectionPoint.y,
            x2: this.perpendicularTwo.x2,
            y2: this.perpendicularTwo.y2
        };

        // let angle = this.getAngle(lineP1, lineP2);
        if (this.intersects(this.line1, lineP2)) {
            this.OnIntersection(this.line1, lineP1, lineP2);
        }
        if (this.intersects(this.line2, lineP1)) {
            this.OnIntersection(this.line2, lineP2, lineP1);
        }

        lineP1 = {
            x1: this.perpendicularOne.x1,
            y1: this.perpendicularOne.y1,
            x2: intersectionPoint.x - lengthOne.pX,
            y2: intersectionPoint.y - lengthOne.pY
        };
        lineP2 = {
            x1: this.perpendicularTwo.x1,
            y1: this.perpendicularTwo.y1,
            x2: intersectionPoint.x + lengthTwo.pX,
            y2: intersectionPoint.y + lengthTwo.pY
        };
        if (!this.intersects(lineP1, lineP2)) {
            lineP2 = {
                x1: this.perpendicularTwo.x1,
                y1: this.perpendicularTwo.y1,
                x2: intersectionPoint.x - lengthTwo.pX,
                y2: intersectionPoint.y - lengthTwo.pY
            };
        }
        if (!this.intersects(lineP1, lineP2)) {
            lineP1 = {
                x1: this.perpendicularOne.x1,
                y1: this.perpendicularOne.y1,
                x2: intersectionPoint.x + lengthOne.pX,
                y2: intersectionPoint.y + lengthOne.pY
            };
        }

        if (!this.intersects(lineP1, lineP2)) {
            lineP2 = {
                x1: this.perpendicularTwo.x1,
                y1: this.perpendicularTwo.y1,
                x2: intersectionPoint.x + lengthTwo.pX,
                y2: intersectionPoint.y + lengthTwo.pY
            };
        }

        let angleLine1 = {
            x1: this.perpendicularOne.x1,
            y1: this.perpendicularOne.y1,
            x2: intersectionPoint.x,
            y2: intersectionPoint.y
        };
        let angleLine2 = {
            x1: intersectionPoint.x,
            y1: intersectionPoint.y,
            x2: lineP2.x2,
            y2: lineP2.y2
        };
        this.angle = this.getAngle(angleLine1, angleLine2);
        this.drawLine(lineP1, [5, 2], 'white');
        this.drawLine(lineP2, [5, 2], 'white');
    };

    this.getPerpendicular = function (line1, line2) {
        let one = this.perpendicular(line1);
        let two = this.perpendicular(line2);

        if ((line1.y1 > line2.y1 && line1.y2 > line2.y2) || (line1.x1 > line2.x1 && line1.x2 > line2.x2)) {
            this.perpendicularOne = {
                x1: one.x1,
                y1: one.y1,
                x2: one.x1 + one.pX,
                y2: one.y1 + one.pY,
            };
            this.perpendicularTwo = {
                x1: two.x1,
                y1: two.y1,
                x2: two.x1 - two.pX,
                y2: two.y1 - two.pY,
            };
        } else {
            this.perpendicularOne = {
                x1: one.x1,
                y1: one.y1,
                x2: one.x1 - one.pX,
                y2: one.y1 - one.pY,
            };
            this.perpendicularTwo = {
                x1: two.x1,
                y1: two.y1,
                x2: two.x1 + two.pX,
                y2: two.y1 + two.pY,
            };
        }
    };

    this.OnIntersection = function (line, perpendicularLine, anotherPerpendicularLine) {
        let x1 = (line.x1 + line.x2) / 2;
        let y1 = (line.y1 + line.y2) / 2;
        let lX = x1 - line.x2;
        let lY = y1 - line.y2;
        x1 = line.x2 - lX;
        y1 = line.y2 - lY;
    };

    this.intersects = function (line1, line2) {
        let det, gamma, lambda;
        det = (line1.x2 - line1.x1) * (line2.y2 - line2.y1) - (line2.x2 - line2.x1) * (line1.y2 - line1.y1);
        if (det === 0) {
            return false;
        } else {
            lambda = ((line2.y2 - line2.y1) * (line2.x2 - line1.x1) + (line2.x1 - line2.x2) * (line2.y2 - line1.y1)) / det;
            gamma = ((line1.y1 - line1.y2) * (line2.x2 - line1.x1) + (line1.x2 - line1.x1) * (line2.y2 - line1.y1)) / det;
            return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
        }
    };

    this.checkLineIntersection = function (line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
        let denominator, a, b, numerator1, numerator2, result = {
            x: null,
            y: null,
            onLine1: false,
            onLine2: false
        };
        denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
        if (denominator === 0) {
            return result;
        }
        a = line1StartY - line2StartY;
        b = line1StartX - line2StartX;
        numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
        numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
        a = numerator1 / denominator;
        b = numerator2 / denominator;

        result.x = line1StartX + (a * (line1EndX - line1StartX));
        result.y = line1StartY + (a * (line1EndY - line1StartY));
        if (a > 0 && a < 1) {
            result.onLine1 = true;
        }

        if (b > 0 && b < 1) {
            result.onLine2 = true;
        }
        return result;
    };

    this.perpendicularLength = function (line, distance) {
        let px, py;
        px = line.y2 - line.y1;
        py = line.x1 - line.x2;
        distance = distance || Math.hypot(py, px);
        const len = distance / Math.hypot(px, py);
        px *= len;
        py *= len;
        return {
            pX: px,
            pY: py
        };
    };

    this.perpendicular = function (line) {
        let px, py;
        px = line.y2 - line.y1;
        py = line.x1 - line.x2;
        let endLen = Math.hypot(py, px);
        let length = this.perpendicularLength(line, endLen);
        let x1 = (line.x1 + line.x2) / 2;
        let y1 = (line.y1 + line.y2) / 2;
        return {
            x1: x1,
            y1: y1,
            pX: length.pX,
            pY: length.pY
        };
    };
};