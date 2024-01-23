/**
 * Definition of shape Oval
*/

ovm.shape.oval = function(xPixelSpacing,yPixelSpacing,measure_Unit) {
	var handle = 5;
	var ovals = [];
	var curr_oval = null;
	var xPxlSpcing = xPixelSpacing;
	var yPxlSpcing = yPixelSpacing;
	var measureUnit = measure_Unit;
	this.isCurrentDrawingOval = false; 
	
	this.createNewOval = function(x1,y1,x2,y2) {
		if(curr_oval!=undefined) {
			curr_oval.setCoords(x1,y1,x2,y2,false);
		//	if(parseFloat(curr_oval.area)>0.0) { // To avoid oval in negative area 
				curr_oval.meanOfOval();
				curr_oval.stdDevOfOval();
				ovals.push(curr_oval);
				curr_oval = undefined;
		//	}
		}
	};
	
	this.initNewOval = function() {
		curr_oval = new ovm.oval(xPxlSpcing, yPxlSpcing,measureUnit, 0, 0, 0, 0, 0);
	};
	
	/**
	 * getter for ovals for the image Shown
	 * @returns {Array} List of ovals drawn 
	 */
	this.getOvals = function () {
		return ovals;
	};

	/**
	 *  Setter for Ovals for the image Shown
	 * @param oval
	 */
	this.setOvals = function (oval) {
		ovals = oval;
	};
	
	this.draw = function(graphic,canvasCtx) {
		// Draw Shape		
		canvasCtx.lineWidth='2';
		canvasCtx.strokeStyle=canvasCtx.fillStyle='orange';		
		canvasCtx.save();
		var radX = graphic.endX-graphic.centerX;
		var radY = graphic.endY-graphic.centerY;
		canvasCtx.beginPath();
		canvasCtx.translate(graphic.centerX-radX,graphic.centerY-radY);
		//canvasCtx.translate(graphic.centerX,graphic.centerY);
		canvasCtx.scale(radX,radY);
		canvasCtx.arc(1,1,1,0,2*Math.PI,false);
		canvasCtx.restore();
		canvasCtx.stroke();
		
		// Handles
		if(graphic.active) {	
			canvasCtx.strokeStyle = canvasCtx.fillStyle = 'white';		
			canvasCtx.strokeRect(graphic.centerX-radX,graphic.centerY-radY-handle,handle*2, handle*2);
			canvasCtx.strokeRect(graphic.centerX,graphic.centerY-radY-handle,handle*2, handle*2);
			canvasCtx.strokeRect(graphic.centerX+radX,graphic.centerY-radY-handle,handle*2,handle*2);
			canvasCtx.strokeRect(graphic.centerX-radX-handle,graphic.centerY,handle*2,handle*2);
			canvasCtx.strokeRect(graphic.centerX+radX-handle,graphic.centerY,handle*2,handle*2);
			canvasCtx.strokeRect(graphic.centerX-radX-handle,graphic.centerY+radY,handle*2,handle*2);
			canvasCtx.strokeRect(graphic.centerX,graphic.centerY+radY-handle,handle*2,handle*2);
			canvasCtx.strokeRect(graphic.centerX+radX-handle,graphic.centerY+radY,handle*2,handle*2);
		}
		
		// Text
		canvasCtx.fillStyle = graphic.txtActive? "blue" : "maroon";
		canvasCtx.globalAlpha = 0.5;	
		canvasCtx.font = "14px Arial";	

		var text = canvasCtx.measureText(graphic.stdDev.length>graphic.area.length? graphic.stdDev : graphic.area);			
		canvasCtx.fillRect(graphic.textX,graphic.textY,Math.ceil(text.width)+20,60); 
		canvasCtx.globalAlpha = 0.9; 
		canvasCtx.fillStyle = "white";			
		//canvasCtx.fillText(graphic.area,graphic.textX+2,graphic.textY+15); 
		//canvasCtx.fillText(graphic.mean,graphic.textX+2,graphic.textY+35); 
		//canvasCtx.fillText(graphic.stdDev,graphic.textX+2,graphic.textY+55); 

		if(state.hflip && !state.vflip &&  !state.rotate!=0 && !this.isCurrentDrawingOval){
			canvasCtx.save();
			canvasCtx.translate(drawCanvas.width,0);
			canvasCtx.scale(-1,1);			
			canvasCtx.fillText(graphic.area,(drawCanvas.width -graphic.textX+2)-135,graphic.textY+15);
			canvasCtx.fillText(graphic.mean,(drawCanvas.width -graphic.textX+2)-135,graphic.textY+35); 
			canvasCtx.fillText(graphic.stdDev,(drawCanvas.width -graphic.textX+2)-135,graphic.textY+55); 
			canvasCtx.restore();
		}
		if(state.vflip &&  !state.hflip &&  !state.rotate!=0 && !this.isCurrentDrawingOval){
			canvasCtx.save();
			canvasCtx.translate(0,drawCanvas.height);
			canvasCtx.scale(1,-1);	
			canvasCtx.fillText(graphic.area,  graphic.textX+2,(drawCanvas.height -graphic.textY)-48); 
			canvasCtx.fillText(graphic.mean,  graphic.textX+2,(drawCanvas.height -graphic.textY)-28); 
			canvasCtx.fillText(graphic.stdDev,  graphic.textX+2,(drawCanvas.height -graphic.textY)-8); 
			canvasCtx.restore();	
		}

		if(!state.vflip && state.hflip && (state.rotate===90 || state.rotate===180 || state.rotate===270) && !this.isCurrentDrawingOval){		
		if(state.rotate===90 || state.rotate===180 || state.rotate===270) {
		canvasCtx.save();
		canvasCtx.translate(0,drawCanvas.height);
		canvasCtx.scale(1,-1);	

		canvasCtx.fillText(graphic.area,graphic.textX+2,(drawCanvas.height -graphic.textY)-50);
		canvasCtx.fillText(graphic.mean,graphic.textX+2,(drawCanvas.height -graphic.textY)-30);
		canvasCtx.fillText(graphic.stdDev,graphic.textX+2,(drawCanvas.height -graphic.textY)-10);
		canvasCtx.restore();
		}
		}

	if(state.vflip && !state.hflip && (state.rotate===90 || state.rotate===180 || state.rotate===270) && !this.isCurrentDrawingOval){
	if(state.rotate===90 || state.rotate===180 || state.rotate===270) { 
		canvasCtx.save(); 
		canvasCtx.translate(drawCanvas.width,0); 
		canvasCtx.scale(-1,1);
	
		canvasCtx.fillText(graphic.area,(drawCanvas.width -graphic.textX+2)-130,graphic.textY+15);
		canvasCtx.fillText(graphic.mean,(drawCanvas.width -graphic.textX+2)-130,graphic.textY+35);
		canvasCtx.fillText(graphic.stdDev,(drawCanvas.width -graphic.textX+2)-130,graphic.textY+55);

		canvasCtx.restore();
		}	
	}

		
	if(state.rotate!=0  && !state.vflip &&  !state.hflip && !this.isCurrentDrawingOval) {
	if(state.rotate===180) {
		canvasCtx.save();
		canvasCtx.translate(drawCanvas.width/2,drawCanvas.height/2);
		canvasCtx.rotate(Math.PI);			
		canvasCtx.translate(-drawCanvas.width/2,-drawCanvas.height/2);	
		
		canvasCtx.fillText(graphic.area,(drawCanvas.width -graphic.textX)-130, (drawCanvas.height -graphic.textY)-50); //, 
		canvasCtx.fillText(graphic.mean, (drawCanvas.width -graphic.textX)-130, (drawCanvas.height -graphic.textY)-30); //
		canvasCtx.fillText(graphic.stdDev, (drawCanvas.width -graphic.textX)-130, (drawCanvas.height -graphic.textY)-10);// 
		canvasCtx.restore();
		} 
		
		else { 
		canvasCtx.fillText(graphic.area,graphic.textX+2,graphic.textY+15);
		canvasCtx.fillText(graphic.mean,graphic.textX+2,graphic.textY+35);
		canvasCtx.fillText(graphic.stdDev,graphic.textX+2,graphic.textY+55);
		}
		}
		
		if((state.rotate===0 || state.rotate===90 || state.rotate===180 || state.rotate===270) && state.vflip && state.hflip && !this.isCurrentDrawingOval) { 		
		if(state.rotate===0) {
		canvasCtx.save();
		canvasCtx.translate(drawCanvas.width,drawCanvas.height);
		canvasCtx.scale(-1,-1);	

		canvasCtx.fillText(graphic.area,(drawCanvas.width -graphic.textX+2)-135,(drawCanvas.height -graphic.textY)-50);
		canvasCtx.fillText(graphic.mean,(drawCanvas.width -graphic.textX+2)-135,(drawCanvas.height -graphic.textY)-30); 
		canvasCtx.fillText(graphic.stdDev,(drawCanvas.width -graphic.textX+2)-135,(drawCanvas.height -graphic.textY)-10); 
		canvasCtx.restore();	
		}
		else {
		canvasCtx.fillText(graphic.area,graphic.textX+2,graphic.textY+15);
		canvasCtx.fillText(graphic.mean,graphic.textX+2,graphic.textY+35);
		canvasCtx.fillText(graphic.stdDev,graphic.textX+2,graphic.textY+55);
		}
		}

		if((!state.rotate===0 || !state.rotate===90 || !state.rotate===180 || !state.rotate===270) && state.hflip && state.vflip && !this.isCurrentDrawingOval) {
		canvasCtx.save();
		canvasCtx.translate(drawCanvas.width,drawCanvas.height);
		canvasCtx.scale(-1,-1);	

		canvasCtx.fillText(graphic.area,(drawCanvas.width -graphic.textX+2)-135,(drawCanvas.height -graphic.textY)-50);
		canvasCtx.fillText(graphic.mean,(drawCanvas.width -graphic.textX+2)-135,(drawCanvas.height -graphic.textY)-30); 
		canvasCtx.fillText(graphic.stdDev,(drawCanvas.width -graphic.textX+2)-135,(drawCanvas.height -graphic.textY)-10); 
		canvasCtx.restore();	
		}
		
		if(!state.hflip && !state.vflip && !state.rotate!=0) {
		//canvasCtx.save();
		canvasCtx.fillText(graphic.area,graphic.textX+2,graphic.textY+15);
		canvasCtx.fillText(graphic.mean,graphic.textX+2,graphic.textY+35);
		canvasCtx.fillText(graphic.stdDev,graphic.textX+2,graphic.textY+55);
		//canvasCtx.restore();
		}			
		
		if(this.isCurrentDrawingOval) {
			canvasCtx.fillText(graphic.area,graphic.textX+2,graphic.textY+15);
			canvasCtx.fillText(graphic.mean,graphic.textX+2,graphic.textY+35);
			canvasCtx.fillText(graphic.stdDev,graphic.textX+2,graphic.textY+55);
		}
		
		// Reference Lines
		if(graphic.centerX!=graphic.textX) {
			canvasCtx.save();
			canvasCtx.beginPath();
			canvasCtx.strokeStyle = "yellow";
			canvasCtx.setLineDash([10,7]);			
			var closestPt = this.getClosestAnchor([{x:graphic.textX,y:graphic.textY},{x:graphic.textX+Math.ceil(text.width+10),y:graphic.textY},{x:graphic.textX,y:graphic.textY+60},{x:graphic.textX+Math.ceil(text.width+10),y:graphic.textY+60}],{x:graphic.refX,y:graphic.refY});			
			canvasCtx.moveTo(closestPt.x,closestPt.y);			
			canvasCtx.lineTo(graphic.refX,graphic.refY);	
			canvasCtx.stroke();
			canvasCtx.closePath();
			canvasCtx.restore();
		}
	};
	
	this.drawData = function(ctx) {
		ctx.save();
		
		for(var i=0;i<ovals.length;i++) {
			this.draw(this.viewPortGraphic(ovals[i]),ctx);
		}
		ctx.restore();
	};
	
	this.drawOval = function(canvasCtx,x1,y1,x2,y2) {
		curr_oval.setCoords(x1,y1,x2,y2,true);
		this.isCurrentDrawingOval = true; 
		canvasCtx.strokeStyle=canvasCtx.fillStyle='orange';
		canvasCtx.lineWidth='2';
		this.draw(this.viewPortGraphic(curr_oval),canvasCtx);
		this.isCurrentDrawingOval = false; 
	};
	
	this.getActiveOval = function(canvasCtx,x,y) {
		for(var i=0;i<ovals.length;i++) {
			var oval = ovals[i];
			if(oval.isShapeSelection(canvasCtx,x,y)) {				
				return oval;
			}
		}
		return null;
	};
	
	this.viewPortGraphic = function(shape) {
		return {	
					centerX:shape.centerX*state.scale+state.translationX,
					centerY:shape.centerY*state.scale+state.translationY,
					endX:shape.endX*state.scale+state.translationX,
					endY:shape.endY*state.scale+state.translationY,
					textX:shape.textX*state.scale+state.translationX,
					textY:shape.textY*state.scale+state.translationY,
					refX:shape.refX*state.scale+state.translationX,
					refY:shape.refY*state.scale+state.translationY,
					active:shape.active,
					txtActive:shape.txtActive,
					area:shape.txtArea,					
					mean:shape.txtMean,
					stdDev:shape.txtStdDev
			};
	};
	
	this.canvasToImgCoordinates = function(point) {
		return {x:(point.x-state.translationX)/state.scale,y:(point.y-state.translationY)/state.scale};
	};
	
	this.removeShape = function(shape) {
		ovals.splice(ovals.indexOf(shape), 1);
	};
	
	this.clearAll = function() {
		ovals = [];
	};
	
	this.getClosestAnchor = function(points,refPt) {		
		var dist1 = Math.round(Math.sqrt(Math.pow(points[0].x-refPt.x,2) + Math.pow(points[0].y-refPt.y,2)));
		var dist2 = Math.round(Math.sqrt(Math.pow(points[1].x-refPt.x,2) + Math.pow(points[1].y-refPt.y,2)));
		var dist3 = Math.round(Math.sqrt(Math.pow(points[2].x-refPt.x,2) + Math.pow(points[2].y-refPt.y,2)));
		var dist4 = Math.round(Math.sqrt(Math.pow(points[3].x-refPt.x,2) + Math.pow(points[3].y-refPt.y,2)));
		var min = Math.min(dist1,dist2,dist3,dist4); 
		if(min==dist1) {
			return points[0];
		} else if(min==dist2) {
			return points[1];
		} else if(min==dist3) {
			return points[2];
		} else {
			return points[3];
		}
	};
};

/**
 * @namespace oval
*/

ovm.oval = function(xPixelSpacing,yPixelSpacing,measure_Unit,a,b,c,d,e) {
	// Variables
	var handle = 5;
	this.xPxlSpcing = xPixelSpacing;
	this.yPxlSpcing = yPixelSpacing;
	this.measureUnit = measure_Unit;
	if(this.measureUnit=="mm") {
		this.measureUnit = this.measureUnit + String.fromCharCode(178);
	}
	this.centerX=a;
	this.centerY=b;
	this.endX=c;
	this.endY=d;
	this.radiusX;
	this.radiusY;
	this.active = false;
	this.area = e;
	this.mean = "";
	this.stdDev = "";
	
	// Text
	this.textX = a;
	this.textY = b-50;
	this.txtActive = false;
	this.txtArea = "Area     : " + this.area + " " +  this.measureUnit;
	this.txtMean = "Mean    : ";
	this.txtStdDev = "StdDev : ";
	this.refX = 0;
	this.refY = 0;
	
	// Functions
	this.setCoords = function(a,b,c,d,active) {
		this.centerX = Math.round((a-state.translationX)/state.scale);
		this.centerY = Math.round((b-state.translationY)/state.scale);
		this.endX = Math.round((c-state.translationX)/state.scale);
		this.endY = Math.round((d-state.translationY)/state.scale);
		this.radiusX = Math.round((this.endX-this.centerX)*this.xPxlSpcing);
		this.radiusY = Math.round((this.endY-this.centerY)*this.yPxlSpcing);		
		this.active = active;		
		this.area = ((Math.PI * this.radiusX*this.radiusY)/100).toFixed(3);
		this.area = (this.area<0) ? Math.abs(this.area) : this.area; //change (-)ve to (+)ve
		this.txtArea = "Area     : " + this.area + " " + this.measureUnit;
		this.textX = this.centerX;
		this.textY = this.centerY - (this.endY-this.centerY) - (100/state.scale);
		this.findClosestPointOnOval();
	};
	
	this.getType = function() {
		return "oval";
	};
	
	this.isShapeSelection = function(canvasCtx,x,y) {
		var point = this.canvasToImgcoordinates({x:x,y:y});		
		this.active = (((Math.pow(point.x-this.centerX,2)/Math.pow(this.endX-this.centerX,2))+(Math.pow(point.y-this.centerY,2)/Math.pow(this.endY-this.centerY,2))).toFixed(0)==1) ? true : false;
		return this.active || this.isTextSelection(canvasCtx,x,y);
	};	
	
	this.isActiveShape = function(canvasCtx,x,y) {		
		var point = this.canvasToImgcoordinates({x:x,y:y});		
		this.active = ((Math.pow(point.x-this.centerX,2)/Math.pow(this.radiusX,2))+(Math.pow(point.y-this.centerY,2)/Math.pow(this.radiusY,2))).toFixed(0)<=1 ? true : false;
		return this.active || this.isTextSelection(canvasCtx,x,y);
	};
		
	this.detectHandle = function(x,y,target) {
		var point = this.canvasToImgcoordinates({x:x,y:y});
		var radX = this.endX-this.centerX;
		var radY = this.endY-this.centerY;

		if(point.x>=(this.centerX-radX-handle) && point.x<=(this.centerX-radX+handle) && point.y>=(this.centerY-radY-handle) && point.y<=(this.centerY-radY+handle)) {
			target.style.cursor = 'nw-resize';
			return 0;			
		} else if(point.x>=(this.centerX-handle) && point.x<=(this.centerX+handle) && point.y>=(this.centerY-radY-handle) && point.y<=(this.centerY-radY+handle)) {
			target.style.cursor = 'n-resize';
			return 1;			
		} else if(point.x>=(this.centerX+radX-handle) && point.x<=(this.centerX+this.radX+handle) && point.y>=(this.centerY-radY-handle) && point.y<=(this.centerY-radY+handle)) {
			target.style.cursor = 'ne-resize';
			return 2;			
		} else if(point.x>=(this.centerX-radX-handle) && point.x<=(this.centerX-radX+handle) && point.y>=(this.centerY-handle) && point.y<=(this.centerY+handle)) {
			target.style.cursor = 'w-resize';
			return 3;			
		} else if(point.x>=(this.centerX+radX-handle) && point.x<=(this.centerX+radX+handle) && point.y>=(this.centerY-handle) && point.y<=(this.centerY+handle)) {
			target.style.cursor = 'e-resize';
			return 4;			
		} else if(point.x>=(this.centerX-radX-handle) && point.x<=(this.centerX-radX+handle) && point.y>=(this.centerY+radY-handle) && point.y<=(this.centerY+radY+handle)) {
			target.style.cursor = 'sw-resize';
			return 5;			
		} else if(point.x>=(this.centerX-handle) && point.x<=(this.centerX+handle) && point.y>=(this.centerY+radY-handle) && point.y<=(this.centerY+radY+handle)) {
			target.style.cursor = 's-resize';
			return 6;			
		} else if(point.x>=(this.centerX+radX-handle) && point.x<=(this.centerX+radX+handle) && point.y>=(this.centerY+radY-handle) && point.y<=(this.centerY+radY+handle)) {
			target.style.cursor = 'se-resize';
			return 7;			
		} else {
			target.style.cursor = 'default';
			return -1;
		}			
	};
	
	this.moveShape = function(deltaX,deltaY) {
		if(this.active) {
			this.centerX+=deltaX;
			this.centerY+=deltaY;
			this.endX+=deltaX;		
			this.endY+=deltaY;
			this.radiusX = Math.round((this.endX-this.centerX)*this.xPxlSpcing);
			this.radiusY = Math.round((this.endY-this.centerY)*this.yPxlSpcing);		
			this.txtMean = "Mean    : ";
			this.txtStdDev = "StdDev : ";
		}
		this.textX+=deltaX;
		this.textY+=deltaY;		
		this.findClosestPointOnOval();
	};
	
	this.resizeShape = function(deltaX,deltaY,handle) {		
		switch(handle) {
			case 0:				
				this.centerX+=deltaX;
				this.centerY+=deltaY;
				break;
			case 1:
				this.centerY+=deltaY;
				break;
			case 2:
				this.endX+=deltaX;
				this.centerY+=deltaY;
				break;
			case 3:
				this.centerX+=deltaX;
				break;
			case 4:
				this.endX+=deltaX*2;				
				this.centerX+=deltaX;
				break;
			case 5:		
				this.centerX+=deltaX;
				this.endY+=deltaY;
				break;
			case 6:
				this.endY+=deltaY*2;
				this.centerY+=deltaY;
				break;				
			case 7:
				this.endX+=deltaX;
				this.endY+=deltaY;
				break;
		}
		this.radiusX = Math.round((this.endX-this.centerX)*this.xPxlSpcing);
		this.radiusY = Math.round((this.endY-this.centerY)*this.yPxlSpcing);		
		this.area = ((Math.PI * this.radiusX*this.radiusY)/100).toFixed(3);
		this.txtArea = "Area     : " + this.area + " " + this.measureUnit;
		this.txtMean = "Mean    : ";
		this.txtStdDev = "StdDev : ";
		this.findClosestPointOnOval();

	};
	
	this.meanOfOval = function() {

	var tempX,tempY,tempX2,tempY2,xAxisDifference = false,yAxisDifference =false,xyAxisDifference = false;
 	if (this.centerX>this.endX && this.centerY < this.endY) {	
	tempX = this.centerX;
	this.centerX = this.endX;
	this.endX = tempX;
	xAxisDifference = true;
	} 

	if(this.centerX < this.endX && this.centerY > this.endY) {	
	tempY = this.centerY; 
	this.centerY = this.endY; 
	this.endY = tempY;
	yAxisDifference = true;	
	}
	if(this.centerX>this.endX && this.centerY > this.endY){
	tempX2 = this.centerX;
	tempY2 = this.centerY;
	this.centerX = this.endX;
	this.centerY = this.endY;	
	this.endX = tempX2;
	this.endY = tempY2;
	xyAxisDifference = true;
	}

		var sum = 0, pixelCount = 0;
		for(var i = this.centerX;i<this.endX;i++) {
			for(var j = this.centerY;j<this.endY;j++) {
				if(this.pointInsideOval(i,j)) {
					++pixelCount;
					var pixel = getPixelValAt(i,j);				
					if(pixel!=undefined) {				
						sum+=pixel;
					}
				}
			}
		}

		if(xAxisDifference == true) {
			tempX = this.centerX;
			this.centerX = this.endX;
			this.endX = tempX;
			xAxisDifference =	false;
		}
		if(yAxisDifference == true) {
			tempY = this.centerY; 
			this.centerY = this.endY; 
			this.endY = tempY; 
			yAxisDifference = false;
		}
		if(xyAxisDifference == true) {
			tempX2 = this.centerX; 
			tempY2 = this.centerY;
			this.centerX = this.endX; 
			this.centerY = this.endY; 	 
			this.endX = tempX2; 
			this.endY = tempY2;
			xyAxisDifference = false;
		} 
		
		if(pixelCount==0) {
			return 0;
		}
		
		this.mean = (sum/pixelCount).toFixed(3);
		this.txtMean = "Mean    : " + this.mean;
	};
	
	this.stdDevOfOval = function() {

		var tempX,tempY,tempX2,tempY2,xAxisDifference = false,yAxisDifference =false,xyAxisDifference = false;
		if ( this.centerX>this.endX && this.centerY < this.endY) {		
			tempX = this.centerX;
			this.centerX = this.endX;
			this.endX = tempX;
			xAxisDifference = true;
		} 
		if(this.centerX < this.endX && this.centerY > this.endY) {	
			tempY = this.centerY; 
			this.centerY = this.endY; 
			this.endY = tempY;
			yAxisDifference = true;
		}
		if(this.centerX>this.endX && this.centerY > this.endY){
			tempX2 = this.centerX;
			tempY2 = this.centerY;
			this.centerX = this.endX;
			this.centerY = this.endY;	
			this.endX = tempX2;
			this.endY = tempY2;
			xyAxisDifference = true;
		}
	
		var sum = 0,pixelCount = 0;
		for(var i = this.centerX;i<this.endX;i++) {
			for(var j = this.centerY;j<this.endY;j++) {
				if(this.pointInsideOval(i,j)) {
					++pixelCount;
					var value = getPixelValAt(i,j);
					if(value!="undefined") {
						var deviation = value - this.mean;
						sum+=deviation * deviation;
					}
				}				
			}
		}

		if(xAxisDifference == true) {
			tempX = this.centerX;
			this.centerX = this.endX;
			this.endX = tempX;
			xAxisDifference =	false;
		}
		if(yAxisDifference == true) {
			tempY = this.centerY; 
			this.centerY = this.endY; 
			this.endY = tempY;
			yAxisDifference = false;
		}
		if(xyAxisDifference == true) {
			tempX2 = this.centerX; 
			tempY2 = this.centerY; 
			this.centerX = this.endX; 
			this.centerY = this.endY; 
			this.endX = tempX2; 
			this.endY = tempY2; 
			xyAxisDifference = false;
		} 
	
		if(pixelCount==0) {
			return 0;
		}
		this.stdDev = Math.sqrt(sum/pixelCount).toFixed(3);
		this.txtStdDev = "StdDev : " + this.stdDev;
	};
	
	this.measure = function() {
		this.meanOfOval();
		this.stdDevOfOval();
	};
	
	this.pointInsideOval = function(pointX,pointY) {
		return ((Math.pow(pointX-this.centerX,2)/Math.pow(this.endX,2))+(Math.pow(pointY-this.centerY,2)/Math.pow(this.endY,2))).toFixed(0)<=1;
	};
	
	this.canvasToImgcoordinates = function(point) {	
		return {x:((point.x-state.translationX)/state.scale),y:((point.y-state.translationY)/state.scale)};
	};
	
	this.ImgTocanvascoordinates = function(point) {
		return {x:point.x*state.scale+state.translationX,y:point.y*state.scale+state.translationY};
	};
	
	this.isTextSelection = function(canvasCtx,mouseX,mouseY) {
		var point = this.canvasToImgcoordinates({x:mouseX,y:mouseY});
		
		var text = canvasCtx.measureText(this.txtStdDev.length>this.txtArea.length? this.txtStdDev : this.txtArea);			
		this.txtActive = (point.x>=this.textX && point.x<=this.textX+(Math.ceil((text.width+state.translationX)/state.scale)) && point.y>=this.textY && point.y<=(this.textY+(60/state.scale)));
		return this.txtActive;	
	};
	
	this.findClosestPointOnOval = function(ex,ey,ea,eb,x,y) {	
		var angle = Math.atan2(this.centerY-this.textY,this.centerX-this.textX) * 180 / Math.PI;					
		this.refX = this.centerX - (this.endX-this.centerX) * Math.cos(angle*Math.PI/180);
		this.refY = this.centerY - (this.endY-this.centerY) * Math.sin(angle*Math.PI/180);
	};
};
