var mouseLocX, mouseLocY,curr_Img = -1,nativeColumns;
var drawCanvas = null, context = null;
var tool = '';

var ruler = null,rect = null, oval = null, angle = null, probe = null, cobb = null;
var selectedShape = null, selectedHandle = -1;
var startCoords = [];

var xPxl = null, yPxl = null,measure_Unit="cm";

var rulerMap = new Map();
var rectMap = new Map();
var ovalMap = new Map();
var angleMap = new Map();
var probeMap = new Map();
var cobbMap = new Map();

function init(iNo) {
	if(xPxl==null) {
		/*var tagPxlSpacing = jQuery('#pixelSpacing').html();
		if(tagPxlSpacing==='') {
			loadInstanceText();
			tagPxlSpacing = jQuery('#pixelSpacing').html();
		}*/
		
		var tagPxlSpacing = '1\\1';
		
		if(jQuery("#imgPixelSpacing").html().length>0) {
			tagPxlSpacing = jQuery("#imgPixelSpacing").html();
		} else if(jQuery("#pixelSpacing").html().length>0) {
			tagPxlSpacing = jQuery('#pixelSpacing').html();
		} else {
			measure_Unit = "pix";
		}
			
		
		var pxlSpacing = tagPxlSpacing.split('\\');
		
		xPxl = pxlSpacing.length>0?pxlSpacing[1]:1;
		yPxl = pxlSpacing.length>1?pxlSpacing[0]:1;
	}	
	
	if(curr_Img==-1 || curr_Img!=iNo) {
		clearMeasurements();
		curr_Img = iNo;
	}
	if (tool != 'cobb')
		deactivateCobb();
}

function initializeMeasureCanvas(toolClicked) {
	drawCanvas = document.getElementById("canvasLayer2");
	this.context = drawCanvas.getContext('2d');				
	jQuery('#loadingView',window.parent.document).hide();
	if (toolClicked) {
		addMouseEvents(drawCanvas);
	}
}

function activateRuler(iNo,columns,toolClicked) {
	tool = "ruler";
	init(iNo);
	var data = jQuery(drawCanvas).data('events');
	if(data==undefined || (data!=undefined && data.mousedown==undefined)) {
		initializeMeasureCanvas(toolClicked);
	}
	jQuery('#huDisplayPanel').hide();
	nativeColumns = columns;
	if(ruler==null) {
		ruler = new ovm.shape.ruler(xPxl,yPxl,measure_Unit);
	}
	if (!toolClicked && rulerMap.has(iNo)) {
		ruler.setLines(rulerMap.get(iNo));
	}
}

function activateRect(iNo,columns,toolClicked) {
	tool = "rectangle";
	init(iNo);
	var data = jQuery(drawCanvas).data('events');
	if(data==undefined || (data!=undefined && data.mousedown==undefined)) {
		initializeMeasureCanvas(toolClicked);		
	}
	jQuery('#huDisplayPanel').show();		
	nativeColumns = columns;
	if(rect==null) {
		rect = new ovm.shape.rect(xPxl,yPxl,measure_Unit);
	}
	if (!toolClicked && rectMap.has(iNo)) {
		rect.setRectangles(rectMap.get(iNo));
	}
}

function activateOval(iNo,columns,toolClicked) {
	tool = "oval";
	init(iNo);
	var data = jQuery(drawCanvas).data('events');
	if(data==undefined || (data!=undefined && data.mousedown==undefined)) {
		initializeMeasureCanvas(toolClicked);	
	}
	jQuery('#huDisplayPanel').show();		
	nativeColumns = columns;
	if(oval==null) {
		oval = new ovm.shape.oval(xPxl,yPxl,measure_Unit);
	}
	if (!toolClicked && ovalMap.has(iNo)) {
		oval.setOvals(ovalMap.get(iNo));
	}
}

function activateAngle(iNo,columns,toolClicked) {
	tool = "angle";
	init(iNo);
	var data = jQuery(drawCanvas).data('events');
	if(data==undefined || (data!=undefined && data.mousedown==undefined)) {
		initializeMeasureCanvas(toolClicked);	
	}
	jQuery('#huDisplayPanel').hide();		
	nativeColumns = columns;
	if(angle==null) {
		angle = new ovm.shape.angle(xPxl,yPxl);
	}
	if (!toolClicked && angleMap.has(iNo)) {
		angle.setAngles(angleMap.get(iNo));
	}
}

/**
 * Enables Probe
 * @param iNo Image index
 * @param columns Image height 
 */
function activateProbe(iNo, columns, mult_cmp, toolClicked) {
	if (toolClicked) {
		tool = "probe";
	}
	init(iNo);
	multComp = mult_cmp;
	var data = jQuery(drawCanvas).data('events');
	if (data == undefined || (data != undefined && data.mousedown == undefined)) {
		initializeMeasureCanvas(toolClicked);
	}
	jQuery('#huDisplayPanel').hide();
	nativeColumns = columns;
	if (probe == null) {
		probe = new ovm.shape.probe(xPxl, yPxl, multComp, measure_Unit);
	}
	if (!toolClicked && probeMap.has(iNo)) {
		probe.setProbe(probeMap.get(iNo));
	}
}

/**
 * Activates Cobb's Angle shape
 * @param iNo Image index
 * @param columns Image height
 */
function activateCobb(iNo, columns, toolClicked) {
	if (toolClicked) {
		tool = "cobb";
		// if (toolId === 'cobb'){
			// $('.toggleOff').removeClass('toggleOff');
			// jQuery('#measure', parent.document).removeClass('toggleOff');
			// $('#measure').disableContextMenu();  
			// console.log("dsfffffffffff" + toolId);
		// }
	}
	init(iNo);
	var data = jQuery(drawCanvas).data('events');
	initializeCobbCanvas(toolClicked);
	jQuery('#huDisplayPanel').hide();
	nativeColumns = columns;
	if (cobb == null) {
		cobb = new ovm.shape.cobb();
		jQuery('#measure', parent.document).removeClass('toggleOff');
                    $('#measure').disableContextMenu();
	}
	if (!toolClicked && cobbMap.has(iNo)) {
		cobb.setCobbList(cobbMap.get(iNo));
	}
}

function initializeCobbCanvas(toolClicked) {
	drawCanvas = document.getElementById("canvasLayer2");
	context = drawCanvas.getContext('2d');
	jQuery('#loadingView', window.parent.document).hide();

	if (toolClicked) {
		count = 0;
		drawCanvas.addEventListener('mousedown', cobbMouseDown);
		drawCanvas.addEventListener('mouseup', cobbMouseUp);
	}
}

function deactivateCobb() {
	if (drawCanvas != undefined) {
		drawCanvas.removeEventListener('mousedown', cobbMouseDown);
		drawCanvas.removeEventListener('mouseup', cobbMouseUp);
		drawCanvas.removeEventListener('mousemove', cobbMouseMove);
		if (tool === 'cobb') 
        	selectedShape = null;
	}
}

function cobbMouseDown(e) {
	mouseEvent = e;
	drawCanvas.addEventListener('mousemove', cobbMouseMove);
	count = count === 2 ? 0 : count;

	if (count === 0) {
		selectedShape = cobb.getCurrentShape(context, e.pageX, e.pageY);
		initLineOne = e;
		if (selectedShape.newLine) {
			selectedShape.setFirstLine(initLineOne, initLineOne);
		}
	}
	if (!selectedShape.newLine) {
		if (selectedShape.firstLine) {
			selectedShape.changeFirstLine(e);
		} else {
			selectedShape.changeSecondLine(e);
		}
		count--;
	}
	e.target.style.cursor = 'crosshair';
	drawAllShapes();
}

function cobbMouseMove(e) {
	let context = drawCanvas.getContext('2d');
	context.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
	finalMouse = e;
	if (selectedShape.newLine) {
		if (count === 1) {
			selectedShape.setSecondLine(mouseEvent, finalMouse);
			selectedShape.drawFirstLine();
		} else {
			selectedShape.setFirstLine(mouseEvent, finalMouse);
		}
	} else {
		if (selectedShape.firstLine) {
			selectedShape.changeFirstLine(e);
		} else {
			selectedShape.changeSecondLine(e);
		}
	}
	drawAllShapes();
}

function cobbMouseUp(e) {
	drawCanvas.removeEventListener('mousemove', cobbMouseMove);
	count++;
	if (selectedShape.newLine) {
		if (count === 2) {
			selectedShape.processAngle();
		} else {
			finalLineOne = e;
		}
	}
	var inst_text = jQuery("#totalImages").text().split("/");
	var iNo = parseInt(inst_text[0].split(":")[1]);
	var seriesUid = jQuery('#serId').text().split('_')[0];
	cobbMap.set(iNo, cobb.getCobbList());
	window.parent.cobbMap.set(seriesUid, cobbMap);
	e.target.style.cursor = 'default';
	drawAllShapes();
}


function addMouseEvents(canvas) {
	jQuery(canvas).mousedown(function(e){
		mouseDownHandler(e);
	}).mousemove(function(e1){
		mouseMoveHandler(e1);
	}).mouseup(function (e2){
		mouseUpHandler(e2);
	});
}

function mouseDownHandler(evt) {
	console.log(evt.which + '***********');
	if(evt.which==1) {
		jQuery('.contextMenu',window.parent.dcoument).hide();
		state.drag = true;
		
		mouseLocX = evt.pageX - drawCanvas.offsetLeft;
		mouseLocY = evt.pageY - drawCanvas.offsetTop;
		
		this.startCoords = [
	        (evt.pageX - state.translationX)/state.scale,
    	    (evt.pageY - state.translationY)/state.scale
        ];
		
		if(selectedShape!=null) {			
			detectHandle(evt);
	
			if(selectedHandle==-1 && !selectedShape.isActiveShape(context,mouseLocX,mouseLocY)) {
				if(selectedShape.getType()!="ruler" && selectedShape.getType()!="angle") {
					selectedShape.measure(selectedShape);
				}
				selectedShape.active = false;				
				selectedShape = null;
				drawAllShapes();
			}
		} 
		else {
			detectSelectedShape();			
			
			if(selectedShape==null) {
				if(tool=="ruler") {
					ruler.initNewLine();
				} else if(tool=="rectangle") {
					rect.initNewRect();
				} else if(tool=="oval") {
					oval.initNewOval();
				} else if(tool=="angle") {
					if(angle.angleStarted()) {
						if(angle.curr_angle.setIntersectionPt(mouseLocX, mouseLocY)) {
							state.drag = false;				
						}			
					} else {
						angle.initAngle();
						state.drag = true;
					}
				}  else if (tool == 'probe' && jQuery('#tool').text() == 'probe' && probe.valid) {
					probe.huValue = huValue;
					probe.initNewProbe(huValue);
				}
				
			}
		}
		
		// evt.stopPropagation();
		// evt.preventDefault();
		evt.target.style.cursor = selectedShape!=null? 'move' : 'crosshair';
	}
}

function mouseMoveHandler(evt) {
	var x = evt.pageX-drawCanvas.offsetLeft;
	var y = evt.pageY-drawCanvas.offsetTop;
	
	var imgX = parseInt((x-state.translationX)/state.scale);
	var imgY = parseInt((y-state.translationY)/state.scale);
	
	if(tool=="rectangle" || tool=="oval") {
		jQuery('#huDisplayPanel').html("X :"+imgX+" Y :"+imgY+" HU :"+getPixelValAt(imgX,imgY));
	}
	
	if(state.drag) {
		drawAllShapes();
		
		if(selectedShape==null ) { // New Shape
			switch(tool) { 
				case 'ruler':		
					ruler.drawRuler(context,mouseLocX,mouseLocY,x,y);
					break;
				case 'rectangle':									
					rect.drawRect(context,mouseLocX,mouseLocY,x,y);
					break;
				case 'oval':								
					oval.drawOval(context,mouseLocX,mouseLocY,x,y);
					break;
				case 'angle':
					if(angle.angleStarted()) {
						angle.setOAorOB(context, mouseLocX, mouseLocY, x, y);
					}
					break;
			}
		} else if(selectedHandle==-1) { // Move a shape
			if (tool != 'cobb') {
				selectedShape.moveShape(Math.round(imgX-this.startCoords[0]),Math.round(imgY-this.startCoords[1]));
				this.startCoords = [imgX,imgY];
				evt.target.style.cursor = 'move';
			}
		} else if(selectedShape.active) { // Resizing a shape
			if (tool != 'cobb') {
				selectedShape.resizeShape(Math.round(imgX-this.startCoords[0]),Math.round(imgY-this.startCoords[1]),selectedHandle);
				this.startCoords = [imgX,imgY];
			}
		}
	} else if(selectedShape!=null && selectedShape.active) {		
			detectHandle(evt);			
	}
}

function mouseUpHandler(evt) {
	console.log('*************' + evt.which);
	if(selectedShape==null) { // New Shape
		var inst_text = jQuery("#totalImages").text().split("/");
		var iNo = parseInt(inst_text[0].split(":")[1]);
		var seriesUid = jQuery('#serId').text().split('_')[0];
		switch(tool) {
			case 'ruler':
			    //ruler.createNewLine(mouseLocX, mouseLocY, (evt.pageX-drawCanvas.offsetLeft), (evt.pageY-drawCanvas.offsetTop)); 
				var newLocation = changeMouseCoordinate(mouseLocX,mouseLocY,(evt.pageX-drawCanvas.offsetLeft), (evt.pageY-drawCanvas.offsetTop)); 
			    ruler.createNewLine(newLocation.mouseLocX, newLocation.mouseLocY, newLocation.pageX, newLocation.pageY);
			    rulerMap.set(iNo, ruler.getLines());
				window.parent.rulerMap.set(seriesUid, rulerMap);
				break;
			case 'rectangle':
				//rect.createNewRect(mouseLocX, mouseLocY, (evt.pageX-drawCanvas.offsetLeft), (evt.pageY-drawCanvas.offsetTop));
				var newLocation = changeMouseCoordinate(mouseLocX,mouseLocY,(evt.pageX-drawCanvas.offsetLeft),(evt.pageY-drawCanvas.offsetTop)); 
				rect.createNewRect(newLocation.mouseLocX, newLocation.mouseLocY, newLocation.pageX, newLocation.pageY);
				rectMap.set(iNo, rect.getRectangles());
				window.parent.rectMap.set(seriesUid, rectMap);
				break;
			case 'oval':
				//oval.createNewOval(mouseLocX, mouseLocY, (evt.pageX-drawCanvas.offsetLeft), (evt.pageY-drawCanvas.offsetTop)); 
				var newLocation = changeMouseCoordinate(mouseLocX,mouseLocY,(evt.pageX-drawCanvas.offsetLeft),(evt.pageY-drawCanvas.offsetTop));
				oval.createNewOval(newLocation.mouseLocX, newLocation.mouseLocY, newLocation.pageX, newLocation.pageY);
				ovalMap.set(iNo, oval.getOvals());
				window.parent.ovalMap.set(seriesUid, ovalMap);
				break;
			case 'angle':
				if(angle.angleStarted() && angle.curr_angle.lineOAValid() && angle.curr_angle.lineOBValid()) {
					angle.createNewAngle();
				}
				angleMap.set(iNo, angle.getAngles());
				window.parent.angleMap.set(seriesUid, angleMap);
				break;
			case 'probe':
				var newLocation = changeMouseCoordinate(mouseLocX, mouseLocY, (evt.pageX - drawCanvas.offsetLeft), (evt.pageY - drawCanvas.offsetTop));
				probe.createNewProbe(newLocation.mouseLocX, newLocation.mouseLocY, newLocation.pageX, newLocation.pageY);
				probeMap.set(iNo, probe.getProbe());
				window.parent.probeMap.set(seriesUid, probeMap);
		}
		drawAllShapes();
		if(tool!="angle") {
			state.drag = false;					
		}				
	} else {
		state.drag = false;
	}
}

function changeMouseCoordinate(mouseLocX,mouseLocY,pageX,pageY) {
	if(state.hflip){
	mouseLocX = drawCanvas.width - mouseLocX;	
	pageX = drawCanvas.width - pageX;		
	}
	if(state.vflip){
		mouseLocY  = drawCanvas.height - mouseLocY;	
		pageY = drawCanvas.height - pageY;			
	}
	if(state.rotate!=0) {	
		var tempMouseLocX,tempMouseLocY,tempPageX,tempPageY; // These variable is necessary otherwise it will subtract from original(mouseLocX,evt.pageY)	
	if(state.rotate===90) {
	var	newWidth = drawCanvas.width - drawCanvas.height;	
		newWidth = newWidth/2;
	tempMouseLocX = mouseLocY + newWidth; 
	tempMouseLocY = (drawCanvas.width - newWidth) - mouseLocX;   
	tempPageX =pageY + newWidth; 
	tempPageY = (drawCanvas.width-newWidth) - pageX;	
	mouseLocX = tempMouseLocX;
	mouseLocY = tempMouseLocY;
	pageX = tempPageX;
	pageY = tempPageY; 
		
	} else if(state.rotate===180) {
		tempMouseLocX = drawCanvas.width - mouseLocX;
	    tempMouseLocY =	drawCanvas.height - mouseLocY;
		tempPageX = drawCanvas.width - pageX;
		tempPageY = drawCanvas.height - pageY;
				
		mouseLocX = tempMouseLocX;
		mouseLocY = tempMouseLocY;
		pageX = tempPageX;
		pageY = tempPageY; 
		
		}

	else { //270
	var	newWidth = drawCanvas.width - drawCanvas.height;	
	newWidth = newWidth/2;
	tempMouseLocX = (drawCanvas.width - newWidth) - mouseLocY; 
	tempMouseLocY = mouseLocX - newWidth;   
	tempPageX = (drawCanvas.width - newWidth) - pageY;  
	tempPageY = pageX - newWidth;	
		
	mouseLocX = tempMouseLocX;
	mouseLocY = tempMouseLocY;
	pageX = tempPageX;
	pageY = tempPageY; 
	}
	}

	return {mouseLocX:mouseLocX, mouseLocY:mouseLocY, pageX:pageX, pageY:pageY};
	} 


function setShape(shape) {
	tool = shape;
	jQuery('.selectedshape',window.parent.document).removeClass('selectedshape');
}	

function detectSelectedShape() {
	if(ruler!=null && (selectedShape = ruler.getActiveLine(context,mouseLocX,mouseLocY))!=null || rect!=null && (selectedShape = rect.getActiveRect(context,mouseLocX,mouseLocY))!=null || oval!=null && (selectedShape = oval.getActiveOval(context,mouseLocX,mouseLocY))!=null || angle!=null && (selectedShape = angle.getActiveAngle(context,mouseLocX,mouseLocY))!=null) {
		drawAllShapes();
		return;
	}
}

function detectHandle(e) {	
	selectedHandle = selectedShape.detectHandle(e.pageX-drawCanvas.offsetLeft,e.pageY-drawCanvas.offsetTop,e.target);	
}

function clearMeasurements() {
	curr_Img = -1;
	if(ruler!=null) {
		ruler.clearAll();
	}
	if(rect!=null) {
		rect.clearAll();
	}
	if(oval!=null) {
		oval.clearAll();
	}
	if(angle!=null) {
		angle.clearAll();
	}
	if (probe != null) {
		probe.clearAll();
	}
	if (cobb != null) {
		cobb.clearAll();
	}
	if(context!=null) {
		context.clearRect(0,0,drawCanvas.width,drawCanvas.height);
	}
}

function resetAnnotation() {
	clearMeasurements();
	tool = "";
	jQuery('.selectedshape',window.parent.document).removeClass('selectedshape');
	jQuery('#line',window.parent.document).addClass('selectedshape');
	this.context = null;
}

function deleteSelectedMeasurement() {
	if(selectedShape!=null) {
		if(selectedShape.getType()=="ruler") {
			ruler.removeShape(selectedShape);
			rulerMap.set(iNo, ruler.getLines());
			window.parent.rulerMap.set(seriesUid, rulerMap);
		} else if(selectedShape.getType()=="rect") {
			rect.removeShape(selectedShape);
			rectMap.set(iNo, rect.getRectangles());
			window.parent.rectMap.set(seriesUid, rectMap);
		} else if(selectedShape.getType()=="oval") {
			oval.removeShape(selectedShape);
			ovalMap.set(iNo, oval.getOvals());
			window.parent.ovalMap.set(seriesUid, ovalMap);
		} else if(selectedShape.getType()=="angle") {
			angle.removeShape(selectedShape);
			angleMap.set(iNo, angle.getAngles());
			window.parent.angleMap.set(seriesUid, angleMap);
		} else if(selectedShape.getType()=="probe") {
			probe.removeShape(selectedShape);
			probeMap.set(iNo, probe.getProbe());
			window.parent.probeMap.set(seriesUid, probeMap);
		}
		selectedShape = null;
		drawAllShapes();
	}
}

function drawAllShapes() {
	if(this.context!=null) {
		this.context.save();
		this.context.setTransform(1,0,0,1,0,0);		
		this.context.clearRect(0,0,drawCanvas.width,drawCanvas.height);	
		if(state.vflip) {
			this.context.translate(0,drawCanvas.height);
			this.context.scale(1,-1);
		}
	
		if(state.hflip) {
			this.context.translate(drawCanvas.width,0);
			this.context.scale(-1,1);
		}
	
		if(state.rotate!=0) {
			this.context.translate(drawCanvas.width/2,drawCanvas.height/2);
			this.context.rotate(state.rotate===90 ? Math.PI/2 : state.rotate===180? Math.PI : (Math.PI*3)/2);
			this.context.translate(-drawCanvas.width/2,-drawCanvas.height/2);	   
		}		
		if(ruler!=null) ruler.drawData(context);
		if(rect!=null) rect.drawData(context);
		if(oval!=null) oval.drawData(context);
		if(angle!=null) angle.drawData(context);
		if (probe != null) probe.drawData(context);
		if (cobb != null) cobb.drawAll();
		this.context.restore();
	}
}
