var firstTry = true;
var currentEvent, prevEvent;
var probeEnabled = false, loadingPixelData = false, windowingChanged = false;
var huValue;
var speed;
var preview = true;

function enableTool(tool) {
	jQuery('#tool').text(tool);
	jQuery('.toggleOff', window.parent.document).not('#scoutLine').removeClass('toggleOff');
	jQuery('#'+tool,window.parent.document).addClass('toggleOff');
}

function disableTool(tool) {
	jQuery('#tool').html('');
	jQuery('#' + tool, parent.document).removeClass('toggleOff');
	jQuery('#canvasDiv').css('cursor',"default");
	sessionStorage["tools"] = "";
}

function disableOtherTools(tool) {
	if(tool!='zoom') { // Deactivates Zoom
		stopZoom();
	}
	if(tool!='move') {	// Deactivates Move
		stopMove(document.getElementById('canvasLayer2'));
	}
	if(tool!='windowing') { //Deactivates windowing
		unbindWindowing('windowing');
	}
	if(tool!='measure') { // Deactivates Measure
		deactivateMeasure('measure');
	}
	if (tool != 'magnify') {
		deactivateMagnify();
	}
	if(tool!='probe') {
		disableProbe();
	}
}

function onToolSelection(e) {
	if(e.detail.tool==="txtOverlay") {
		if (jQuery('#textOverlay').hasClass('active')) {
            jQuery('#textOverlay').removeClass('active');
            
            var iNo = 0;
       	 	var src = jQuery('#frameSrc').text();
       	 	iNo = getParameter(src, 'frameNumber');
       	 	total = parseInt(getParameter(src, 'numberOfFrames'));
       	 	if (!iNo) {
       	 		iNo = getParameter(src, 'instanceNumber');
       	 		total = parseInt(getParameter(src, 'images'));
       	 	}
            
	        if (total > iNo) {
	        	jQuery('.textOverlay').show();
	        	jQuery('#huDisplayPanel').hide();
           }            
        } else {
            jQuery('#textOverlay').addClass('active');
            jQuery('.textOverlay').hide();
        }
		//jQuery('.textOverlay:not(#huDisplayPanel)').toggle();
	} else if(e.detail.tool==="loop") {
		doLoop(e.detail.isLoop);
	}

	if(document!=undefined && document.body.style.border==='1px solid rgb(255, 138, 0)') { // Determines whether this is a Selected Tile
		switch(e.detail.tool) {
			case 'windowing':
				activateTools(e.detail.tool, activateWindowing);
				break;
			case 'zoom':
				activateTools(e.detail.tool, activateZoom);
				break;
			case 'move':
				activateTools(e.detail.tool, activateMove);
				break;
			case 'stackImage':
				activatestack(e.detail.tool);
				break;
			case 'vflip':
				activateTools(e.detail.tool, activateVFlip);
				break;
			case 'hflip':
				activateTools(e.detail.tool, activateHFlip);
				break;
			case 'rotateLeft':
				activateTools(e.detail.tool, activateLeftRotation);
				break;
			case 'rotateRight':
				activateTools(e.detail.tool, activateRightRotation);
				break;
			case 'metaData':
				window.parent.showMetaData(jQuery('#frameSrc').html());
				break;
			case 'reset':
				activateTools(tool, doReset);
				break;
			case 'invert':
				doInvert(tool);
				break;
			case 'fullScreen':
				window.parent.doFullScreen(window.parent.document);
				break;
			case 'scoutLine':
				doScout(e.detail.tool);
				break;
			case 'measure':
				activateMeasure(e.detail.tool);
				break;
			case 'ruler':
				doRuler(true);
				break;
			case 'rectangle':
				doRect(true);
				break;
			case 'oval':
				doOval(true);
				break;
			case 'angle':
				doAngle(true);
				break;
			case 'probe':
				doProbe(e.detail.tool, true);				
				break;
			case 'cobb':
				doCobb(true);
				break;
			case 'preset':
				applyPreset(e.detail.wc,e.detail.ww);
				break;
			case 'clearAll':
				clearMeasurements();
				resetMap();
				init(jQuery('#totalImages').html().indexOf('Frame')<0 ? imgInc : frameInc);
				break;
			case 'magnify':
				activateTools(e.detail.tool, activateMagnify);
				break;
			case 'mouseup':
				if(jQuery('.selectedshape',window.parent.document).attr('id')!="angle") {
					state.drag = false;
				}
				break;
			case 'delete':
				deleteSelectedMeasurement();
				break;
			case 'close':
				setImageOnToggle();
				break;
			case 'hide': 
				doShowHidePreview(this);
				break;
		}
	}
}

function resetMap() {
	var inst_text = jQuery("#totalImages").text().split("/");
	var iNo = parseInt(inst_text[0].split(":")[1]);
	if(rulerMap.has(iNo)){
		rulerMap.delete(iNo);
	}
	if(rectMap.has(iNo)){
		rectMap.delete(iNo);
	}
	if(ovalMap.has(iNo)){
		ovalMap.delete(iNo);
	}
	if(angleMap.has(iNo)){
		angleMap.delete(iNo);
	}
	if(probeMap.has(iNo)){
		probeMap.delete(iNo);
	}
	if(cobbMap.has(iNo)){
		cobbMap.delete(iNo);
	}

	var seriesUid = jQuery('#serId').text().split('_')[0];
	window.parent.rulerMap.set(seriesUid, rulerMap);
	window.parent.rectMap.set(seriesUid, rectMap);
	window.parent.ovalMap.set(seriesUid, ovalMap);
	window.parent.angleMap.set(seriesUid, angleMap);
	window.parent.probeMap.set(seriesUid, probeMap);
	window.parent.cobbMap.set(seriesUid, cobbMap);
}

/**
 * Activate particular tool to do the function
 * @param {string} toolid Tool to be activated
 * @param {Function} callingFunction function which has to be called
 */
function activateTools(toolid, callingFunction) {
    var iframe = window.parent.document.getElementsByTagName('iframe');
    if (iframe.length > 1 && iframe[0].src.indexOf('TileContent.html') >= 0 ||
        toolid == 'zoom' || toolid == 'move' || toolid == 'windowing'
        	|| toolid == 'magnify') {
        for (var i = 0; i < iframe.length; i++) {
        	firstTry = true;
            var tmpWindow = iframe[i].contentWindow;
            if (tmpWindow.document.body.style.border === '1px solid rgb(255, 138, 0)') {
              var frameSrc = jQuery('#frameSrc', tmpWindow.document).text();
              var total = 0;
              var iNo = 0;
              total = getParameter(frameSrc, 'numberOfFrames');
              iNo = total ? getParameter(frameSrc, 'frameNumber') : getParameter(frameSrc, 'instanceNumber');
              total = total ? total : getParameter(frameSrc, 'images');
              iNo = parseInt(iNo);
              total = parseInt(total);
              if (total > iNo || toolid == 'vflip' || toolid == 'hflip' || toolid == 'rotateLeft' || toolid == 'rotateRight' || toolid == 'reset') {
                 callingFunction(toolid, tmpWindow);
              } else if(tmpWindow.location.href.indexOf('frameContent') >= 0 &&(toolid == 'zoom'
            	|| toolid == 'move' || toolid == 'windowing' || toolid == 'magnify')){
				callingFunction(toolid, tmpWindow);
			  }
              break;
          }
        }
    } else {
    	firstTry = true;
        callingFunction(toolid, window);
    }
}

/**
 * Activates/Deactivates zoom tool
 * @param toolid 
 * @param {Window} tmpWindow
 */
function activateZoom(toolid, tmpWindow) {
	try{
		if(jQuery('#tool', tmpWindow.document).html()!=toolid) {
			tmpWindow.disableOtherTools(toolid);
			tmpWindow.enableTool(toolid);
			doLoop(false);
			window.parent.document.getElementById('loopChkBox').checked = false;
			tmpWindow.doZoom();
			sessionStorage["tools"] = toolid;
		} else {
			tmpWindow.disableTool(toolid);
		}
	}catch (e) {
        console.error(e);
        console.log('Dicom Image NOT AVAILABLE');
    }
}

/**
 * Activates/Deactivates move tool
 * @param toolid 
 * @param {Window} tmpWindow 
 */
function activateMove(toolid, tmpWindow) {
	try{
	if(jQuery('#tool',tmpWindow.document).html()!=toolid) {
		tmpWindow.disableOtherTools(toolid);
		tmpWindow.enableTool(toolid);
		doLoop(false);
		window.parent.document.getElementById('loopChkBox').checked = false;
		tmpWindow.doMove();
		sessionStorage["tools"] = toolid;
	} else {
		tmpWindow.disableTool(toolid);
		tmpWindow.stopMove();
	}
	}catch (e) {
        console.log('Dicom Image NOT AVAILABLE');
    }
}

/**
 * Activates/Deactivates Magnify tool
 * @param toolid 
 * @param {Window} tmpWindow 
 */
function activateMagnify(toolid, tmpWindow) {
	try {
		if (jQuery('#tool', tmpWindow.document).html() != toolid) {
			tmpWindow.disableOtherTools(toolid);
			tmpWindow.enableTool(toolid);
			doLoop(false);
			tmpWindow.doMagnify();
			sessionStorage["tools"] = toolid;
		} else {
			tmpWindow.disableTool(toolid);
			tmpWindow.deactivateMagnify();
			tmpWindow.unbindCanvas();
			
		}
	} catch (e) {
		console.log('Dicom Image NOT AVAILABLE');
	}
}

/**
 * Deactivates Magnify tool
 */
function deactivateMagnify() {
	let canvas = document.getElementById('canvasLayer2');
	let zoom = document.getElementById('zoom');
	canvas.removeEventListener('mousedown', activateMagnifier);
	canvas.removeEventListener('mousemove', magnify);
	zoom.removeEventListener('mousemove', magnify);
}

function doProbe(tool, toolClicked) {
	if(!probeEnabled) {
		probeEnabled = toolClicked;
		var imageData = null;
		if(sessionStorage[seriesUid]) {
			imageData = JSON.parse(sessionStorage[seriesUid])[imgInc-1];
		} else {
			imageData = getImageData();
		}
		if (toolClicked) {
			disableOtherTools(tool);
			enableTool(tool);
			getDICOM();
			sessionStorage["tools"] = tool;
		}
		var inst_text = jQuery("#totalImages").text().split("/");
		var iNo = parseInt(inst_text[0].split(":")[1]);
		var canvasLayer2 = document.getElementById('canvasLayer2');
		
		var rows = parseInt(imageData['nativeRows']);
		var cols = parseInt(imageData['nativeColumns']);

		var mult_comp = "none";
		if (rows < cols) {
			mult_comp = "horizontal";
		} else if (cols < rows) {
			mult_comp = "vertical";
		}

		activateProbe(iNo, imageData['nativeColumns'], mult_comp, toolClicked);
		if (toolClicked) {
			canvasLayer2.onmousemove = function (e) {
				activateHu(imageData, e);
			};
		} else {
			unbindProbe();
		}
	} else {
		disableProbe();
		if(toolClicked) {
			unbindProbe();
			sessionStorage["tools"] = "";
		}
	}
}

function unbindProbe() {
	jQuery('#canvasLayer2').unbind('mousedown').unbind('mousemove').unbind('mouseup');
}

function disableProbe(){
	jQuery('#huVal').hide();
	if (jQuery('#tool').text() == 'probe') {
		jQuery('#tool').html('');
	}
	jQuery('#probe', parent.document).removeClass('toggleOff');
	jQuery('#canvasLayer2').css('cursor', "default");
	probeEnabled = false;
}

function clearPixelBuffer() {
	pixelBuffer = [];
	jQuery('#huVal').hide();
}

function activateHu(imageData, e) {
	if(probeEnabled){
		var pageY = state.vflip ? canvas.height - e.pageY : e.pageY;
		var pageX = state.hflip ? canvas.width - e.pageX : e.pageX;

		var x = parseInt((pageX - state.translationX) / state.scale);
		var y = parseInt((pageY - state.translationY) / state.scale);
		var pX = e.pageX + 15;
		var pY = e.pageY + 15;
		try {
			if ((pixelBuffer == null || pixelBuffer.length == 0) && !loadingPixelData) {
				loadingPixelData = true;
				getDICOM();
			}
			let rows = imageData['nativeRows'];
			let columns = imageData['nativeColumns'];
			let index = (y * columns) + x;
			probe.valid  = false;
			jQuery('#huVal').hide();
			if (x >= 0 && x <= columns
					&& y >= 0 && y <= rows && !loadingPixelData) {
				probe.valid  = true;
				huValue = "HU: " + lookupObj.getPixelAt(pixelBuffer[index]);
				jQuery('#huVal').text(huValue).css({
					"left": pX + 'px',
					"top": pY + 'px',
					"z-index": "2147483647",
					"display": "block"
				});
			}
		} catch (e) {
			console.log(e);
		}
	}
}

function activatestack(tool) {
	if(jQuery('#tool').html()!=tool) {
		disableOtherTools(tool);
		enableTool(tool);
		doLoop(false);
		window.parent.document.getElementById('loopChkBox').checked = false;
		doMouseWheel = true;
		sessionStorage["tools"] = tool;
	} else {
		disableTool(tool);
		//window.focus();
	}
}

/**
 * Performs vertical flip
 * @param tool
 * @param {Window} tmpWindow 
 */
function activateVFlip(tool, tmpWindow) {
	var stateVal = tmpWindow.state;
	stateVal.vflip = stateVal.vflip? false : true;
	tmpWindow.oneTimeTool();
	tmpWindow.flipOrientationToVertical();
	window.focus();	 
}

function flipOrientationToVertical() {
	var tmpTop = jQuery('#imgOriTop').text();

	jQuery('#imgOriTop').text(jQuery('#imgOriBottom').text());
	jQuery('#imgOriBottom').text(tmpTop);
}

/**
 * Performs horizontal flip
 * @param tool
 * @param {Window} tmpWindow
 */
function activateHFlip(tool, tmpWindow) {
	var stateVal = tmpWindow.state;
	stateVal.hflip = stateVal.hflip? false : true;
	tmpWindow.oneTimeTool();
	tmpWindow.flipOrientationToHorizontal();
	window.focus();
}

function flipOrientationToHorizontal() {
	var tmpLeft = jQuery('#imgOriLeft').text();

	jQuery('#imgOriLeft').text(jQuery('#imgOriRight').text());
	jQuery('#imgOriRight').text(tmpLeft);
}

/**
 * Performs left rotation
 * @param tool
 * @param tmpWindow
 */
function activateLeftRotation(tool, tmpWindow) {
	var stateVal = tmpWindow.state;
	stateVal.rotate-=90;
	switch(stateVal.rotate) {
		case -90:
			stateVal.rotate = 270;
			break;
		case -180:
			stateVal.rotate = 180;
		case -270:
			stateVal.rotate = 90;
			break;
	}
	tmpWindow.oneTimeTool();
	tmpWindow.rotateLeftTextOverlay();
	window.focus();
}

function rotateLeftTextOverlay() {
	var tmpLeft = jQuery('#imgOriLeft').text();
	var tmpTop = jQuery('#imgOriTop').text();

	jQuery('#imgOriTop').text(jQuery('#imgOriRight').text());
	jQuery('#imgOriRight').text(jQuery('#imgOriBottom').text());
	jQuery('#imgOriBottom').text(tmpLeft);
	jQuery('#imgOriLeft').text(tmpTop);
}

/**
 * Performs right rotation
 * @param tool
 * @param tmpWindow
 */
function activateRightRotation(tool, tmpWindow) {
	var stateVal = tmpWindow.state;
	stateVal.rotate+=90;
	if(stateVal.rotate>=360) {
		stateVal.rotate=0;
	}
	tmpWindow.oneTimeTool();
	tmpWindow.rotateRightTextOverlay();
	window.focus();
}

function rotateRightTextOverlay() {
	var tmpTop = jQuery('#imgOriTop').text();
	var tmpBottom = jQuery('#imgOriBottom').text();

	jQuery('#imgOriTop').text(jQuery('#imgOriLeft').text());
	jQuery('#imgOriBottom').text(jQuery('#imgOriRight').text());
	jQuery('#imgOriRight').text(tmpTop);
	jQuery('#imgOriLeft').text(tmpBottom);
}

/**
 * Resets all the changes
 * @param toolid
 * @param {Window} tmpWindow
 */
function doReset(toolid, tmpWindow) {
	  var src = jQuery('#frameSrc', tmpWindow.document).html();
	  var seriesUid = getParameter(src, 'series');
	  if (seriesUid != null && (!seriesUid.indexOf("null") >= 0)) {
	   try{
		if(jQuery('#tool', tmpWindow.document).html()!='') {
			jQuery('#' + jQuery('#tool', tmpWindow.document).html(), window.parent.document).removeClass('toggleOff');
			jQuery('#tool', tmpWindow.document).html('');
		}

        var inst_text = jQuery("#totalImages").text().split("/");
        var iNo = parseInt(inst_text[0].split(":")[1]);
        var isMultiframe = inst_text[0].indexOf("Frame") >= 0;
        var object;
        if (isMultiframe) {
            tmpWindow.frameInc = parseInt(iNo);
            var src = jQuery('#frameSrc', tmpWindow.document).text();
            object = getParameter(src, 'object');
        } else {
            tmpWindow.imgInc = parseInt(iNo);
        }

		tmpWindow.modifiedWC = undefined;
		tmpWindow.modifiedWW = undefined;
		tmpWindow.doMouseWheel = true;
		tmpWindow.disableOtherTools(toolid);
		resetAnnotation();
		tmpWindow.state = {translationX : 0,translationY: 0,scale: 0,vflip: false,hflip: false,rotate: 0};
		tmpWindow.brightnessVal = 0;
        tmpWindow.contrastVal = 0;
		tmpWindow.loadInstanceText(false,false);
		tmpWindow.drawoutline();
		doLoop(false);
		window.parent.document.getElementById('loopChkBox').checked = false;
		if (isMultiframe) {
	        tmpWindow.showImage(object + "_" + frameInc);
	    } else {
	        tmpWindow.showImage(seriesUid + "_" + imgInc);
	    }
		
		if (tmpWindow.loadInit) {
	        tmpWindow.loadInit();
	    }
		
		if (firstTry) {
			firstTry = false;
			doReset(toolid, tmpWindow);
		} else {
			   activateTools("windowing", activateWindowing);
		}
		activateTools("windowing", activateWindowing);
	 } catch (error) {
		console.error(error);
		console.log('Dicom Image NOT AVAILABLE');
	 }
	 resetMap();
	 reloadSeriesImgs();
  }
}

function doInvert(toolid) {
	 var iframe = window.parent.document.getElementsByTagName('iframe');
	 if (iframe.length > 1 && iframe[0].src.indexOf('TileContent.html') >= 0) {
	     for (var i = 0; i < iframe.length; i++) {
	         activateInvert(iframe[i].contentWindow);
	     }
	 } else {
	     activateInvert(window);
	 }
}

/**
 * do invert for all the images in the tiling
 * @param {Window} tmpWindow 
 */
function activateInvert(tmpWindow) {
	var inst_text = jQuery("#totalImages").text().split("/");
    var iNo = parseInt(inst_text[0].split(":")[1]);
    var isMultiframe = inst_text[0].indexOf("Frame") >= 0;
    
    imageData = sessionStorage.getItem(seriesUid);
    tmpWindow.oneTimeTool();

    imageData = JSON.parse(imageData);
    if (isMultiframe) {
        imageData = imageData[0];
    } else {
        imageData = imageData[imgInc - 1];
    }
	
    var stateVal = tmpWindow.state;
    stateVal.invert = stateVal.invert ? false : true;
    
    if (!(imageData['photometric'].indexOf('MONOCHROME') >= 0)) {
        invertImage(tmpWindow);
        var tool = jQuery('#tool', tmpWindow.document).text();

        if (tool.indexOf('windowing') >= 0) {
            doWindowing1(true);
        }
    } else {
    //window.parent.doInvert(jQuery('#imageCanvas').get(0),jQuery('#tool').html()==='windowing');
    	if (tmpWindow.modifiedWC != undefined && tmpWindow.modifiedWW != undefined &&
    		(tmpWindow.modifiedWC != tmpWindow.windowCenter || tmpWindow.modifiedWW != tmpWindow.windowWidth) ||
        	(tmpWindow.modifiedWC == tmpWindow.windowCenter || tmpWindow.modifiedWW == tmpWindow.windowWidth)) {
        	tmpWindow.iterateOverPixels();
        	tmpWindow.renderImg();
    	} else {
        	window.parent.doInvert(jQuery('#imageCanvas', tmpWindow.document).get(0), jQuery('#tool', tmpWindow.document).html() === 'windowing');
    	}
    }
}


/**
 * 
 * @param {Window} tmpWindow 
 */
function invertImage(tmpWindow) {

    var tmpCanvas = tmpWindow.document.getElementById('imageCanvas');
    var tmpCtx = tmpCanvas.getContext('2d');

    var pixelData1 = tmpCtx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height);

    for (var i = 0; i < pixelData1.data.length; i += 4) {
        pixelData1.data[i] = 255 - pixelData1.data[i];
        pixelData1.data[i + 1] = 255 - pixelData1.data[i + 1];
        pixelData1.data[i + 2] = 255 - pixelData1.data[i + 2];

    }
    tmpCtx.putImageData(pixelData1, 0, 0);
}

function doMove() {
	var img = null;
	var canvasLayer2 = document.getElementById('canvasLayer2');

	var startCoords = [];
	oneTimeTool();
	canvasLayer2.onmousedown = function(e) {
		if(e.which==1) {
			state.drag = true;
			img = getCurrentImage();

	        startCoords = [
	        e.pageX - state.translationX,
	        e.pageY - state.translationY
	        ];
			
			window.focus();
	        e.preventDefault();
	        e.stopPropagation();
	        e.target.style.cursor = "url(images/move.png), auto";
		}
	};

	 canvasLayer2.onmouseup = function(e) {
        state.drag = false;
        e.target.style.cursor = "default";
        var iframe = window.parent.document.getElementsByTagName('iframe');
        if (iframe.length > 1 && iframe[0].src.indexOf('TileContent.html') >= 0) {
            for (var i = 0; i < iframe.length; i++) {
                var tmpWindow = iframe[i].contentWindow;
                var iFState = tmpWindow.state;
                iFState.scale = state.scale;
                iFState.translationX = state.translationX;
                iFState.translationY = state.translationY;
                var image = tmpWindow.getCurrentImage();

                tmpWindow.showImg(null, image);
                tmpWindow.drawoutline();
            }
        }
    };

    canvasLayer2.onmousemove = function(e) {
        if(!state.drag) return;
        var x = e.pageX;
        var y = e.pageY;

        state.translationX = x-startCoords[0];
        state.translationY = y-startCoords[1];

		showImg(null,img);
		drawoutline();
		drawAllShapes();
    };
}

function stopMove() {
	var canvasLayer2 = document.getElementById('canvasLayer2');
		
	canvasLayer2.onmousedown = function(e) {
		 if(e.preventDefault) {			 
			window.focus();
        	e.preventDefault();
    	}
    };

    canvasLayer2.onmouseup = function(e) {
		 if(e.preventDefault) {
			window.focus();
        	e.preventDefault();
    	}
    };

    canvasLayer2.onmousemove = function(e) {
		 if(e.preventDefault) {
			window.focus();
        	e.preventDefault();
    	}
    };
}

function doLoop(loop) {
	clearInterval(loopTimer);
	if(loop && document.body.style.border==='1px solid rgb(255, 138, 0)') { // Determines whether this is a Selected Tile)
		loopTimer = setInterval(function() {
			nextImage();
		}, parent.loopSpeed);
	}
}

function loadSlider() {
	if(total>1) {
		if(jQuery('#multiframe').css('visibility')==="hidden") {
			setSliderRange(imgInc, total);
		} else {
			setSliderRange(frameInc, total);
		}
		jQuery('#footer').show();
		jQuery("#trackbar1").css("display","block");
		jQuery("#imgOriRight").css("right","35px");
		jQuery('#trackbar1').css("visibility", "visible");
	} else {
		jQuery('#footer').hide();
		jQuery("#imgOriRight").css("right","10px");
	}
	jQuery(jQuery("#trackbar1").children().get(0)).removeAttr("href");
}

function setSliderRange(val,maxVal) {
	jQuery('#trackbar1').slider({
		orientation:"vertical",
		value: maxVal,
		min: 1,
		max: maxVal,
		slide: onTick
	});
	jQuery("#start").html(1);
	jQuery("#end").html(maxVal);
}

function onTick(event, ui) {
	if(jQuery('#multiframe').css('visibility')==="hidden") {
		imgInc = (total-ui.value)+1;
		loadImg(false,imgInc);
	} else {
		frameInc = (total-ui.value)+1;
		loadImg(true,frameInc);
	}
	imgLoaded();
	if(jQuery("#tool").html()=="measure") {
		deactivateMeasure(jQuery("#tool").html());
	}
}

function setSliderValue() {
	var inst_text = jQuery("#totalImages").text().split("/");
	var iNo = parseInt(inst_text[0].split(":")[1]);
	jQuery('#trackbar1').slider("option","value",(parseInt(inst_text[1])-iNo)+1);
	jQuery(jQuery("#trackbar1").children().get(0)).text(iNo);
}

function convertSplChars(str)
{
	if(typeof str!="undefined") {
		str = str.replace(/&/g, "&amp;");
		str = str.replace(/>/g, "&gt;");
		str = str.replace(/</g, "&lt;");
		str = str.replace(/"/g, "&quot;");
		str = str.replace(/'/g, "&#039;");
    }
    return str;
}

function getOppositeOrientation(str) {
    var strTmp = '';
    for(i=0; i<str.length; i++) {
        switch(str.charAt(i)) {
            case 'P':
                strTmp += 'A';
                break;
            case 'A':
                strTmp += 'P';
                break;
            case 'I':
                strTmp += 'S';
                break;
            case 'S':
                strTmp += 'I';
                break;
            case 'F':
                strTmp += 'H';
                break;
            case 'H':
                strTmp += 'F';
                break;
            case 'L':
                strTmp += 'R';
                break;
            case 'R':
                strTmp += 'L';
                break;
        }
    }

    return strTmp;
}

function getFromToLoc() {
	var selThickLoc = jQuery('#thickLocationPanel').text();

	if(selThickLoc==null || selThickLoc.length == 0) {
        return {from:undefined, to:undefined,sliceLoc:undefined};
	}

	var selThick = selThickLoc.match("Thick:(.*)mm Loc");
	if(selThick!=null) {
		selThick = selThick[1];
	} else {
		selThick = "";
	}
	
	var selLoc = selThickLoc.match("Loc:(.*)mm");
    if (selLoc != null) {
        selLoc = selLoc[1];
    } else {
        selLoc = "";
    }
	
	return {from:parseFloat(selLoc) - parseFloat(selThick), to:parseFloat(selLoc) + parseFloat(selThick),sliceLoc:parseFloat(selLoc)};
}

function synchronize(e) {
	if(document.body.style.border.indexOf("255, 138, 0")<0 && e.detail.forUid===jQuery('#forUIDPanel').html()) {
		var fromTo = e.detail.fromTo;
		var data = sessionStorage!=null ? sessionStorage[seriesUid] : false;
		if(data) {
			data = JSON.parse(data);

			if(data!=null) {
				for(var i=0;i<data.length;i++) {
					var sliceLoc = (data[i])['sliceLocation'];

					if(sliceLoc>=fromTo['from'] && sliceLoc<=fromTo['to'] && parseFloat(sliceLoc)-parseFloat(fromTo['sliceLoc'])<128) {
						imgInc = (i+1);
						showImg(seriesUid+ '_' + imgInc);
						loadInstanceText(false,false);
						loadMeasurement(imgInc);
						break;
					}
				}
			}
		}
	}
}

function loadMeasurement(imageNo) {
	clearMeasurements();
	if (rulerMap.has(imageNo)) {
		doRuler(false);
	}

	if (rectMap.has(imageNo)) {
		doRect(false);
	}

	if (ovalMap.has(imageNo)) {
		doOval(false);
	}

	if (angleMap.has(imageNo)) {
		doAngle(false);
	}
	if (probeMap.has(imageNo)) {
		if (probe) {
			probe.setProbe(probeMap.get(imageNo));
		} else {
			doProbe('probe', false);
		}
	}
	
	if (cobbMap.has(imageNo)) {
		doCobb(false);
	}
	drawAllShapes();
}

function doScout(toolId) {
	var modality = jQuery('#modalityDiv').html();
	if(jQuery(window.parent.document).find('iframe').length>1 && (modality.indexOf('CT')>=0 || modality.indexOf('MR')>=0)) {
		if(!window.parent.displayScout) {
			window.parent.displayScout = true;
			jQuery('#scoutLine', window.parent.document).addClass('toggleOff');
			Localizer.drawScout();
		} else {
			window.parent.displayScout = false;
			jQuery('#scoutLine', window.parent.document).removeClass('toggleOff');
			Localizer.hideScoutLine();
		}
	}
}

function getPixelData(firstTime) {
	setTimeout(function() {
		var imageData = null;
		var isMultiframe = jQuery('#totalImages').html().indexOf('Frame')>=0;
		var inst_text = jQuery("#totalImages").text().split("/");
//		var iNo = isMultiframe ? this.frameInc : this.imgInc;
		var iNo = inst_text[0].split(":")[1];
		
		try {
			if(sessionStorage[seriesUid]) {
				if(isMultiframe){
	                imageData = JSON.parse(sessionStorage[seriesUid])[0];
	            }else{
	            	imageData = JSON.parse(sessionStorage[seriesUid])[iNo - 1];
	            }
			} else {
				imageData = getImageData();
			}

		  if (imageData['photometric'].indexOf('MONOCHROME') >= 0) {
			var url = "pixel.do?requestType=WADO&contentType=application/dicom&study=" + window.parent.pat.studyUID + "&series=" + seriesUid + "&object=" + imageData['SopUID'] + "&transferSyntax=1.2.840.10008.1.2.1" + "&serverURL=" + window.parent.pat.serverURL;

			if(jQuery('#multiframe').css('visibility')!="hidden") { // Multiframe
				url+="&frameNumber=" + (frameInc-1);
			}

			var xhr = new XMLHttpRequest();
			xhr.open("POST", url, true);
			xhr.responseType = "arraybuffer";

			xhr.onload = function(e) {
				if (this.status == 200) {
					if(imageData['PixelRepresentation']==0 && imageData['BitsStored']==8) {
						pixelBuffer = new Uint8Array(this.response);
					} else if(imageData['PixelRepresentation']==0 && imageData['BitsStored']>8) {
						pixelBuffer = new Uint16Array(this.response);
					} else if(imageData['PixelRepresentation']==1 && imageData['BitsStored']>8) {
						pixelBuffer = new Int16Array(this.response);
					} else {
						pixelBuffer = this.response;
					}

					for(var i=0;i<pixelBuffer.length;i++) {
						var pix = pixelBuffer[i];
						minPix = Math.min(minPix,pix);
						maxPix = Math.max(maxPix,pix);
					}

					lookupObj = new LookupTable();
					lookupObj.setPixelInfo(minPix,maxPix,imageData['monochrome1']);
					columns = imageData['nativeColumns'];
					state.winPtr = iNo;
					doWindowing(imageData,jQuery('#huDisplayPanel'),jQuery('#windowLevel'),firstTime);
					if (modifiedWW && modifiedWC && state.windowing) {
						state.windowing = false;
						if (state.mouseDown) {
							state.drag = true;
						}
						var rescaleSlope, rescaleIntercept;
						rescaleSlope = parseFloat(imageData['rescaleSlope']);
						rescaleIntercept = parseFloat(imageData['rescaleIntercept']);
						lookupObj.setData(modifiedWC, modifiedWW, rescaleSlope, rescaleIntercept, imageData['BitsStored'],imageData['monochrome1']);
						lookupObj.setWindowingdata(modifiedWC, modifiedWW);
						iterateOverPixels();
						renderImg();
					}
				}
			};

			// Progress
			xhr.onreadystatechange = function(evt) {
				if(xhr.readyState==4) {
					jQuery('#progressbar').progressbar("value",100);
					jQuery('#progressbar').hide();
					jQuery('#progresslbl').hide();
				}

				if(xhr.readyState==2) {
					jQuery('#progressbar').progressbar({
						value: false,
						change: function() {
							jQuery('#progresslbl').text("Retrieving pixel data : " + Math.round(winProgress) + "%" );
						},
					});
					jQuery('#progressbar').show();
					jQuery('#progresslbl').show();
				}
			};

			 xhr.addEventListener("progress", function(evt){
			      if (evt.lengthComputable) {
			    	  winProgress = 100*evt.loaded/evt.total;
			        jQuery('#progressbar').progressbar("value",winProgress);
			      }
			    }, true);

			 if(winProgress==100) { // Prevents multiple requests to server
				 winProgress = 0;
				 xhr.send();
			 }
		  } else {
              var canvas = document.getElementById('imageCanvas');
              var context = canvas.getContext('2d');
              // var imgdata = context.getImageData(0, 0, canvas.width, canvas.height);
              doWindowing1(true);
          }

		} catch(exception) {
			var imgSrc = jQuery('#' + (seriesUid + "_" + imgInc).replace(/\./g,'_'),window.parent.document).attr('src');
			if (!imgSrc) {
	            imgSrc = jQuery('#frameSrc').text();
	        }
			imageData = parseDicom(null,getParameter(imgSrc,'object'));
			state.winPtr = iNo;
			doWindowing(imageData,jQuery('#huDisplayPanel'),jQuery('#windowLevel'),firstTime);
		}
	},1);
}

function activateWindowing(toolId, tmpWindow) {
	try{
		if(jQuery('#tool', tmpWindow.document).html()!=toolId) {
			tmpWindow.disableOtherTools(toolId);
			tmpWindow.enableTool(toolId);
			tmpWindow.doMouseWheel = (window.parent.pat.serverURL.indexOf("wado")>0);

			jQuery('#thickLocationPanel', tmpWindow.document).hide();
			
			if(jQuery('#multiframe').css('visibility') === "hidden") {
				doLoop(false);
				window.parent.document.getElementById('loopChkBox').checked = false;
			}
			
			tmpWindow.getPixelData(true);
			sessionStorage["tools"] = "windowing";
		} else {
			sessionStorage["tools"] = "";
			tmpWindow.unbindWindowing(toolId);
		}
	} catch (e) {
		console.log('Dicom Image NOT AVAILABLE');
	}
	// loadContextMenu();
}

function unbindWindowing(toolId) {
	var iframe = window.parent.document.getElementsByTagName('iframe');
	var inst_text = '';
	var isMultiframe;
	var iNo;
	var totalImages;
	if ($(iframe[0]).attr('src').indexOf('TileContent.html') >= 0) {
		for (var i = 0; i < iframe.length; i++) {
			var tmpWindow = iframe[i].contentWindow;
			var src = jQuery('#frameSrc', tmpWindow.document).text();
			inst_text = jQuery("#totalImages").text().split("/");
			isMultiframe = inst_text[0].indexOf("Frame") >= 0;
			totalImages = inst_text[1];
			if (isMultiframe) {
				iNo = parseInt(getParameter(src, 'frameNumber'));
			} else {
				iNo = parseInt(getParameter(src, 'instanceNumber'));
			}
			iNo++;
			doUnbindWindowing(toolId, isMultiframe, iNo, totalImages, tmpWindow);
	    }
	} else {
	    inst_text = jQuery("#totalImages").text().split("/");
	    isMultiframe = inst_text[0].indexOf("Frame") >= 0;
	    iNo = inst_text[0].split(":")[1];
	    totalImages = inst_text[1];
	    doUnbindWindowing(toolId, isMultiframe, iNo, totalImages, window);
	}
	// loadContextMenu();
}

function doUnbindWindowing(toolId, isMultiframe, iNo, totalImages, tmpWindow) {
    tmpWindow.disableTool(toolId);
    jQuery('#huDisplayPanel', tmpWindow.document).hide();
    if (jQuery("#patID", tmpWindow.document).css("display").indexOf('none') < 0) {
        jQuery('#thickLocationPanel', tmpWindow.document).show();
    }
    jQuery('#canvasLayer2', tmpWindow.document).unbind('mousemove').unbind('mousedown').unbind('mouseup');
    window.parent.disableWindowingContext();
    tmpWindow.doMouseWheel = true;
    tmpWindow.state.winPtr = -1;
    tmpWindow.winProgress = 100;
    if (tmpWindow.modifiedWC != tmpWindow.windowCenter && tmpWindow.modifiedWW != tmpWindow.windowWidth) {
        if (totalImages > iNo) {
            tmpWindow.loadImg(isMultiframe, iNo);
        }
    }
	// loadContextMenu();
}

function activateMeasure(toolId) {
	if(jQuery('#tool').html()!=toolId) {
		disableOtherTools(toolId);
		enableTool(toolId);
		doMouseWheel = false;
		
		//jQuery('#' + tool, parent.document).removeClass('toggleOff');
		jQuery('#thickLocationPanel').hide();
		jQuery('#loadingView', window.parent.document).show();
		doLoop(false);
		window.parent.document.getElementById('loopChkBox').checked = false;

		var shape = jQuery('.selectedshape',window.parent.document).attr('id');

		switch(shape) {
			case "line":
				doRuler(true);
				break;
			case "rectangle":
				doRect(true);
				break;
			case "oval":
				doOval(true);
				break;
			case "angle":
				doAngle(true);
				break;
			case "cobb":
				doCobb(true);
				break;
		}
		window.parent.enableMeasureContext();
	} else {
		sessionStorage["tools"] = "";
		deactivateMeasure(toolId);
		doMouseWheel = true;
	}
}

function doRuler(toolClicked) {
	var imageData = null;
	try {
		if(sessionStorage[seriesUid]) {
			imageData = JSON.parse(sessionStorage[seriesUid])[imgInc-1];
		} else {
			imageData = getImageData();
		}
		activateRuler(jQuery('#totalImages').html().indexOf('Frame')<0 ? imgInc : frameInc,imageData['nativeColumns'], toolClicked);
	} catch(e) {
		console.error(e);
		console.log("DICOM DATA NOT AVAILABLE.");
		jQuery("#loadingView",window.parent.document).hide();
	}
}

function doRect(toolClicked) {
	var imageData = null;
	try {
		if(sessionStorage[seriesUid]) {
			imageData = JSON.parse(sessionStorage[seriesUid])[imgInc-1];
		} else {
			imageData = getImageData();
		}
		if(toolClicked)
			getDICOM();
		activateRect(jQuery('#totalImages').html().indexOf('Frame')<0 ? imgInc : frameInc,imageData['nativeColumns'], toolClicked);
	} catch(e) {
		console.error(e);
		console.log("DICOM DATA NOT AVAILABLE.");
		jQuery("#loadingView",window.parent.document).hide();
	}
}

function doOval(toolClicked) {
	var imageData = null;
	try {
		if(sessionStorage[seriesUid]) {
			imageData = JSON.parse(sessionStorage[seriesUid])[imgInc-1];
		} else {
			imageData = getImageData();
		}
		if(toolClicked)
			getDICOM();
		activateOval(jQuery('#totalImages').html().indexOf('Frame')<0 ? imgInc : frameInc,imageData['nativeColumns'], toolClicked);
	} catch(e) {
		console.error(e);
		console.log("DICOM DATA NOT AVAILABLE.");
		jQuery("#loadingView",window.parent.document).hide();
	}
}

function doAngle(toolClicked) {
	var imageData = null;
	try {
		if(sessionStorage[seriesUid]) {
			imageData = JSON.parse(sessionStorage[seriesUid])[imgInc-1];
		} else {
			imageData = getImageData();
		}
		activateAngle(jQuery('#totalImages').html().indexOf('Frame')<0 ? imgInc : frameInc,imageData['nativeColumns'], toolClicked);
	} catch(e) {
		console.error(e);
		console.log("DICOM DATA NOT AVAILABLE.");
		jQuery("#loadingView",window.parent.document).hide();
	}
}

/**
 * Eables Cobb's angle tool
 */
function doCobb(toolClicked) {
	var imageData = null;
	framePtr = 1;
	try {
		var inst_text = jQuery("#totalImages").text().split("/");
		var iNo = parseInt(inst_text[0].split(":")[1]);
		var src = jQuery('#frameSrc').text();
		if (src.indexOf('MIPContent.html') >= 0) {
			imageData = JSON.parse(sessionStorage[seriesUid]);
		} else {
			try {
				if(inst_text[0].indexOf("Frame")<0) {
					imageData = JSON.parse(sessionStorage[seriesUid])[iNo-1];
				} else {			
					imageData = JSON.parse(sessionStorage[seriesUid])[framePtr-1];
				}
			} catch(e){
				imageData = imageData ? imageData : getImageData();	
			}
		}
		activateCobb(iNo, imageData['nativeColumns'], toolClicked);
	} catch (e) {
		console.error(e);
	}
	
}

function getDICOM() {
	var imageData = null;
	try {
		if(sessionStorage[seriesUid]) {
			imageData = JSON.parse(sessionStorage[seriesUid])[imgInc-1];
		} else {
			imageData = getImageData();
		}
		var url = "pixel.do?requestType=WADO&contentType=application/dicom&study=" + window.parent.pat.studyUID + "&series=" + seriesUid + "&object=" + imageData['SopUID'] + "&transferSyntax=1.2.840.10008.1.2.1" + "&serverURL=" + window.parent.pat.serverURL;
		if(jQuery('#multiframe').css('visibility')!="hidden") { // Multiframe
			url+="&frameNumber=" + (frameInc-1);
		}
		var progress = 0;

		var xhr = new XMLHttpRequest();
		xhr.open("POST", url, true);
		xhr.responseType = "arraybuffer";

		xhr.onload = function(e) {
			if (this.status == 200) {
				if(imageData['PixelRepresentation']==0 && imageData['BitsStored']==8) {
					pixelBuffer = new Uint8Array(this.response);
				} else if(imageData['PixelRepresentation']==0 && imageData['BitsStored']>8) {
					pixelBuffer = new Uint16Array(this.response);
				} else if(imageData['PixelRepresentation']==1 && imageData['BitsStored']>8) {
					pixelBuffer = new Int16Array(this.response);
				} else {
					pixelBuffer = this.response;
				}

				for(var i=0;i<pixelBuffer.length;i++) {
					var pix = pixelBuffer[i];
					minPix = Math.min(minPix,pix);
					maxPix = Math.max(maxPix,pix);
				}

				lookupObj = new LookupTable();
				lookupObj.setPixelInfo(minPix,maxPix,imageData['monochrome1']);
				columns = imageData['nativeColumns'];
				loadLookUp(imageData);
				loadingPixelData = false;
			}
		};

		// Progress
		xhr.onreadystatechange = function(evt) {
			if(xhr.readyState==4) {
				jQuery('#progressbar').progressbar("value",100);
				jQuery('#progressbar').hide();
				jQuery('#progresslbl').hide();
			}

			if(xhr.readyState==2) {
				jQuery('#progressbar').progressbar({
					value: false,
					change: function() {
						jQuery('#progresslbl').text("Retrieving pixel data : " + Math.round(progress) + "%" );
					},
				});
				jQuery('#progressbar').show();
				jQuery('#progresslbl').show();
			}
		};

		 xhr.addEventListener("progress", function(evt){
		      if (evt.lengthComputable) {
		        progress = 100*evt.loaded/evt.total;
		        jQuery('#progressbar').progressbar("value",progress);
		      }
		    }, true);

		xhr.send();
	} catch(exception) {
		var imgSrc = jQuery('#' + (seriesUid + "_" + imgInc).replace(/\./g,'_'),window.parent.document).attr('src');
		imageData = parseDicom(null,getParameter(imgSrc,'object'));
		if(imageData['pixelSpacing']!=undefined) {
//			jQuery('#pixelSpacing').html((imageData['pixelSpacing'].length>1) ?  imageData['pixelSpacing'][0]+"\\"+imageData['pixelSpacing'][1] : imageData['pixelSpacing']);
			jQuery('#pixelSpacing').html(imageData['pixelSpacing']);
		} else {
			jQuery('#pixelSpacing').html("");
		}
		if(imageData["imagerPixelSpacing"]!=undefined && imageData["imagerPixelSpacing"].length>0) {
			jQuery("imgPixelSpacing").html();
		} else {
			jQuery("imgPixelSpacing").html("");
		}
		columns = imageData['nativeColumns'];
		loadLookUp(imageData);
	}
}

function deactivateMeasure(toolId) {
	disableTool(toolId);
	jQuery('#huDisplayPanel').hide();
	if(jQuery("#patID").css("display").indexOf('none')<0) {
		jQuery('#thickLocationPanel').show();
	}
	deactivateCobb();
	jQuery('#canvasLayer2').unbind('mousedown').unbind('mousemove').unbind('mouseup');
	document.getElementById("canvasLayer2").style.cursor = 'default';
	window.parent.disableMeasureContext();
}

var differX, differY;
var initial = true;

function doWindowing1(firstTime) {
    var tmpCanvas = document.getElementById('imageCanvas');
    var tmpCtx = tmpCanvas.getContext('2d');

    this.pixelData = tmpCtx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height);

    if (firstTime) {
        jQuery('#canvasLayer2').mouseup(function(evt) {
            if (evt.which == 1) {
                state.drag = false;
                evt.target.style.cursor = "default";
            }
        }).mousedown(function(evt) {
            this.pixelData = tmpCtx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height);
            windowingChanged = true;
            state.drag = true;
            mouseLocX = evt.pageX;
            mouseLocY = evt.pageY;
            evt.target.style.cursor = "url(images/wincursor.png), auto";
            evt.preventDefault();
            evt.stopPropagation();
        }).mousemove(function(evt) {
            var inst_text = jQuery("#totalImages").text().split("/");
            iNo = inst_text[0].split(":")[1].trim();
            var isMultiframe = (inst_text[0].indexOf("Frame") >= 0);
            if (isMultiframe) {
                frameInc = iNo;
            } else {
                imgInc = iNo;
            }

            if (state.drag) {
                jQuery('.selected', window.parent.document).removeClass('selected');
                var diffX = parseInt(evt.pageX - mouseLocX);
                var diffY = parseInt(evt.pageY - mouseLocY);

                currentEvent = evt;

                var data = pixelData.data;
                mouseLocX = evt.pageX;
                mouseLocY = evt.pageY;

                var brightnessMul = 5;
                var i;
                var bRed, bGreen, bBlue;
                var red, green, blue;

                if (differY != diffY) {
                    for (i = 0; i < data.length; i += 4) {
                        red = data[i];
                        green = data[i + 1];
                        blue = data[i + 2];

                        if (diffY < 0) {
                            brightnessVal = i == 0 ? (brightnessMul + brightnessVal) : brightnessVal;
                            bRed = brightnessMul + red;
                            bGreen = brightnessMul + green;
                            bBlue = brightnessMul + blue;
                        } else {
                            brightnessVal = i == 0 ? (brightnessMul - brightnessVal) : brightnessVal;
                            bRed = red - brightnessMul;
                            bGreen = green - brightnessMul;
                            bBlue = blue - brightnessMul;
                        }

                        data[i] = bRed; //RED
                        data[i + 1] = bGreen; //GREEN
                        data[i + 2] = bBlue; //BLUE

                    }
                    initial = false;
                }

                if (differX != diffX) {
                    var contrast = 5;

                    contrast = (contrast / 100) + 1; //convert to decimal & shift range: [0..2]
                    var intercept = 128 * (1 - contrast);
                    if (diffX < 0) {
                        contrastVal--;
                        for (i = 0; i < data.length; i += 4) { //r,g,b,a
                            data[i] = data[i] / contrast - intercept;
                            data[i + 1] = data[i + 1] / contrast - intercept;
                            data[i + 2] = data[i + 2] / contrast - intercept;
                        }
                    } else {
                        contrastVal++;
                        for (i = 0; i < data.length; i += 4) { //r,g,b,a
                            data[i] = data[i] * contrast + intercept;
                            data[i + 1] = data[i + 1] * contrast + intercept;
                            data[i + 2] = data[i + 2] * contrast + intercept;
                        }
                    }
                }
                tmpCanvas.getContext('2d').putImageData(pixelData, 0, 0);
                differX = diffX;
                differY = diffY;
            }
        });
        window.parent.enableWindowingContext();
    }
}


function doWindowing(imageData,huDisplay,wlDisplay, firstTime) {

    if (imageData['SopUID'] === undefined) {
        return;
    }

	var rescaleSlope = parseFloat(imageData['rescaleSlope']), rescaleIntercept = parseFloat(imageData['rescaleIntercept']);
	windowCenter = imageData['windowCenter'],windowWidth = imageData['windowWidth'];

	if(windowCenter!=undefined && windowCenter.length>0) {
		if(windowCenter && windowCenter.indexOf('|') >=0) {
   	 		windowCenter = parseInt(windowCenter.substring(0, windowCenter.indexOf('|')));
		}
		if(windowWidth && windowWidth.indexOf('|') >=0) {
		    windowWidth = parseInt(windowWidth.substring(0, windowWidth.indexOf('|')));
		}
	} else {
		var maxVoi = maxPix * rescaleSlope + rescaleIntercept;
		var minVoi = minPix * rescaleSlope + rescaleIntercept;
		windowCenter = (maxVoi+minVoi) /2;
		windowWidth = maxVoi - minVoi;
		wlDisplay.html("WL: "+modifiedWC+" / WW: "+modifiedWW);
	}

	if(modifiedWC==undefined) {
		modifiedWC = windowCenter;
		modifiedWW = windowWidth;
		wlDisplay.html("WL: "+modifiedWC+" / WW: "+modifiedWW);
	}

	lookupObj.setData(modifiedWC, modifiedWW, rescaleSlope, rescaleIntercept, imageData['BitsStored'],imageData['monochrome1']);
	this.tmpCanvas = document.createElement('canvas');
	tmpCanvas.width = tmpCanvas.style.width = imageData['nativeColumns'];
	tmpCanvas.height = tmpCanvas.style.height = imageData['nativeRows'];
	var tmpCtx = tmpCanvas.getContext('2d');
	tmpCtx.fillStyle = 'white';
	tmpCtx.fillRect(0, 0, tmpCanvas.width, tmpCanvas.height);
	this.pixelData = tmpCtx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height);
	this.numPixels = tmpCanvas.width*tmpCanvas.height;
	iterateOverPixels();
	renderImg();
	jQuery('#loadingView', window.parent.document).hide();
	huDisplay.show();

	if(firstTime) {
		jQuery('#canvasLayer2').mousedown(function(evt) {
			window.parent.seriesImgsLoadedAgain = false;
			evt.target.style.cursor = "default";
			if(evt.which==1) {
				windowingChanged = true;
				var inst_text = jQuery("#totalImages").text().split("/");
                var iNo = inst_text[0].split(":")[1];

                if(state.winPtr!=iNo || (isNaN(modifiedWC) && isNaN(modifiedWW))) {
                	state.windowing = true;
					getPixelData(false);
				} else {
					state.drag = true;
				}
                state.mouseDown = true;
				evt.target.style.cursor = "url(images/wincursor.png), auto";
			}
						
			mouseLocX = evt.pageX;
			mouseLocY = evt.pageY;
	       			
			jQuery('#canvasLayer2').mouseup(function(evt) {
			
				if(evt.which==1) {
					state.drag = false;
					state.mouseDown = false;
					jQuery('.contextMenu').hide();
					evt.target.style.cursor = "default";
					var iframe = window.parent.document.getElementsByTagName('iframe');
		            if (iframe.length > 1 && iframe[0].src.indexOf('TileContent.html') >= 0) {
		                for (var i = 0; i < iframe.length; i++) {
		                    tmpWindow = iframe[i].contentWindow;
                            if (tmpWindow.document.body.style.border === '1px solid rgb(255, 138, 0)') {
		                        tmpWindow.modifiedWC = modifiedWC;
		                        tmpWindow.modifiedWW = modifiedWW;
                                break;
                            }
		                }
		            } else {
		            	reloadSeriesImgs();
		            }
				}
			});
				        	        
			return false;
		});
		
		jQuery('#canvasLayer2').mousemove(function(evt) {
			
			if(evt.which==1) {
				jQuery('#contextmenu1').hide();
				var inst_text = jQuery("#totalImages").text().split("/");
				iNo = inst_text[0].split(":")[1].trim();
				var isMultiframe = (inst_text[0].indexOf("Frame") >= 0);
				if (isMultiframe) {
					frameInc = iNo;
				} else {
					imgInc = iNo;
				}

				if(state.winPtr==iNo && state.rotate==0) {
					var x = parseInt((evt.pageX-state.translationX)/state.scale);
					var y = parseInt((evt.pageY-state.translationY)/state.scale);

					huDisplay.html("X :"+x+" Y :"+y+" HU :"+lookupObj.getPixelAt(pixelBuffer[(y*imageData['nativeColumns'])+x]));
				} else { // May be a different image
					huDisplay.html("");
				}
			
				var diffX = parseInt(evt.pageX-mouseLocX);
				var diffY = parseInt(evt.pageY-mouseLocY);
			
				currentEvent = evt;
				var diff = calcAcceleration(diffX, diffY);

				diffX = diff.X;
				diffY = diff.Y;

				if(state.drag && state.winPtr==iNo) {
					jQuery('.selected',window.parent.document).removeClass('selected');
				
					modifiedWC=parseInt(modifiedWC)+diffY;
					modifiedWW=parseInt(modifiedWW)+diffX;

					if(modifiedWW < 1) {
						modifiedWW = 1;
					}

					lookupObj.setWindowingdata(modifiedWC,modifiedWW);
					iterateOverPixels();
					renderImg();

					mouseLocX=evt.pageX;
					mouseLocY=evt.pageY;

					wlDisplay.html("WL: "+modifiedWC+" / WW: "+modifiedWW);
				} else if (state.mouseDown) {
					modifiedWC = parseInt(modifiedWC) + diffY;
					modifiedWW = parseInt(modifiedWW) + diffX;
	
					if (modifiedWW < 1) {
						modifiedWW = 1;
					}
					mouseLocX = evt.pageX;
					mouseLocY = evt.pageY;
					wlDisplay.html("WL: " + modifiedWC + " / WW: " + modifiedWW);
				}
			} else {
				evt.target.style.cursor = "default";
			}
		});
		window.parent.enableWindowingContext();
	}
}

function getImageData() {
	var src = $('#frameSrc').text();
	var patientId = window.parent.pat.pat_ID;
	var studyUID = getParameter(src,'study');
	var seriesUID = getParameter(src,'series');
	var objectUID = getParameter(src,'object');
	var value = undefined;
	$.ajax({
        method: "POST",
        url: "Instance.do",
        data: {
        	"patientId": patientId,
    		"studyUID": studyUID,
    		"seriesUID": seriesUID,
    		"objectUID": objectUID,
    		"dcmURL": window.parent.pat.dicomURL,
    		"serverURL": window.parent.pat.serverURL,
    		"level": "SINGLE"
        },
        async: false,
        success: function(data) {
        	value = data;
        	updateData(value);
        },
        dataType: 'json'
    });		
	return value;
}

setInterval(function() {
    if (prevEvent && currentEvent) {
        var movementX = Math.abs(currentEvent.screenX - prevEvent.screenX);
        var movementY = Math.abs(currentEvent.screenY - prevEvent.screenY);
        var movement = Math.sqrt(movementX * movementX + movementY * movementY);
        speed = 10 * movement;
    }
    prevEvent = currentEvent;
}, 100);

function calcAcceleration(diffX, diffY) {
    if (speed != undefined) {
        speed = Math.round(speed / 2000);
        if (speed > 0) {
            diffX = speed * diffX;
            diffY = speed * diffY;
        }
    }
    var diff = {
        "X": diffX,
        "Y": diffY
    };
    return diff;
}

function applyPreset(wc,ww) {
	jQuery('.selected',window.parent.document).removeClass('selected');
	jQuery('.contextMenu',window.parent.document).hide();

	var presetValue = wc + ':' + ww;
	activateTools(presetValue, doPreset);
	/*iterateOverPixels();
	renderImg();*/

}

function doPreset(presetValue, tmpWindow) {
    presetValue = presetValue.split(':');
    if (presetValue[0] != undefined) {
        tmpWindow.modifiedWC = parseInt(presetValue[0]);
        tmpWindow.modifiedWW = parseInt(presetValue[1]);
        lookupObj.setWindowingdata(modifiedWC, modifiedWW);
        jQuery('#windowLevel', tmpWindow.document).html("WL: " + modifiedWC + " / WW: " + modifiedWW);
    } else {
        tmpWindow.modifedWC = windowCenter;
        tmpWindow.modifiedWW = windowWidth;
        lookupObj.setWindowingdata(windowCenter, windowWidth);
        jQuery('#windowLevel', tmpWindow.document).html("WL: " + windowCenter + " / WW: " + windowWidth);
    }
    window.parent.seriesImgsLoadedAgain = false;
    var inst_text = jQuery("#totalImages", tmpWindow.document).text().split("/");
    var isMultiframe = inst_text[0].indexOf("Frame") >= 0;
    tmpWindow.loadImg(isMultiframe, parseInt(inst_text[0].split(":")[1]));
}

function loadLookUp(imageData) {
	lookupObj.setData(modifiedWC, modifiedWW, parseFloat(imageData['rescaleSlope']), parseFloat(imageData['rescaleIntercept']), imageData['BitsStored'],imageData['monochrome1']);
}

function getPixelValAt(i,j) {

	return lookupObj.getPixelAt(pixelBuffer[j*columns+i]);
}

function doZoom() {
	var img = null;
	var canvasLayer2 = document.getElementById('canvasLayer2');
	var canvas = document.getElementById('imageCanvas');
	var lastY = 0,mY = 0,zoomInc = 1,scaleFac = 1.01,originX = 0,originY = 0;
	oneTimeTool();
	jQuery(canvasLayer2).mousedown(function(e) {
		if(e.which==1) {
			document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
			originX = e.offsetX || (e.pageX-canvas.offsetLeft);
			originY = lastY = e.offsetY || (e.pageY-canvas.offsetTop);
			mY = lastY;
			state.drag = true;

			e.preventDefault();
	   		e.stopPropagation();
	   		e.target.style.cursor = "url(images/zoomin.png), auto";
	   		img = getCurrentImage();
	   		loadPreview(img);
		}
	}).mousemove(function(e1) {
		lastY = e1.offsetY || (e1.pageY-canvas.offsetTop);

		if(state.drag) {
			if(lastY<mY) {
				zoomInc = 1;
			} else {
				zoomInc = -1;
			}

			var imgPosX = (originX-state.translationX)/state.scale;
			var imgPosY = (originY-state.translationY)/state.scale;

			state.scale*=Math.pow(scaleFac,zoomInc);

			var newX = (imgPosX * state.scale)+state.translationX;
			var newY = (imgPosY * state.scale)+state.translationY;

			state.translationX+=(originX-newX);
			state.translationY+=(originY-newY);

			showImg(null,img);
			jQuery('#zoomPercent').html('Zoom: ' + parseInt(state.scale * 100) + '%');


			mY = lastY;

			drawoutline();
			drawAllShapes();
		}
	}).mouseup(function(e3) {
		state.drag = false;
		e3.target.style.cursor = "default";
		var iframe = window.parent.document.getElementsByTagName('iframe');
        if (iframe.length > 1 && iframe[0].src.indexOf('TileContent.html') >= 0) {
            for (var i = 0; i < iframe.length; i++) {
                var tmpWindow = iframe[i].contentWindow;
                var iFState = tmpWindow.state;
                iFState.scale = state.scale;
                iFState.translationX = state.translationX;
                iFState.translationY = state.translationY;
                var image = tmpWindow.getCurrentImage();

                tmpWindow.showImg(null, image);
                tmpWindow.drawoutline();
            }
        }
	});
}

/**
 * enables Magnify tool
 */
function doMagnify() {
	let canvas = document.getElementById('canvasLayer2');
	let zoom = document.getElementById('zoom');
	canvas.addEventListener('mousedown', activateMagnifier);
	zoom.addEventListener('mouseup', function () {
		magnifyHandler();
	});

	zoom.addEventListener('mouseleave', function () {
        magnifyHandler();
  });
}

function magnifyHandler() {
	let canvas = document.getElementById('canvasLayer2');
	let zoom = document.getElementById('zoom');
	canvas.removeEventListener('mousemove', magnify);
		zoom.removeEventListener('mousemove', magnify);
		zoom.style.display = 'none';
		zoom.style.border = '2px solid #FF8A00';
		zoom.style.cursor = 'none';
		canvas.style.cursor = 'default';
		state.drag = false;
}

/**
 * adds Event listener to the canvas.
 * @param e
 */
function activateMagnifier(e) {
	state.drag = true;
	let canvas = document.getElementById('canvasLayer2');
	let zoom = document.getElementById('zoom');
	magnify(e);
	canvas.addEventListener('mousemove', magnify);
	zoom.addEventListener('mousemove', magnify);
}

/**
 * process the magnifying option
 * @param e
 */
function magnify(e) {
	let zoom = document.getElementById('zoom');
	let zoomCtx = zoom.getContext('2d');
	let main = document.getElementById('imageCanvas');
	zoomCtx.fillStyle = "black";
	zoomCtx.fillRect(0, 0, zoom.width, zoom.height);
	zoomCtx.drawImage(main, (e.pageX - (zoom.width) / 4), (e.pageY - (zoom.height) / 4), 150, 150, 0, 0, 300, 300);
	zoom.style.top = (e.pageY - (zoom.height / 2)) + "px";
	zoom.style.left = (e.pageX - (zoom.width / 2)) + "px";
	zoom.style.display = "block";
}

function stopZoom() {
	jQuery('#canvasLayer2').unbind('mousedown mousemove mouseup');
}

/*function renderOffScreenCanvas(offScreenCanvas,image) {
	var ctx = offScreenCanvas.getContext('2d');

	ctx.save();
	ctx.setTransform(1,0,0,1,0,0);
	ctx.clearRect(0,0,offScreenCanvas.width,offScreenCanvas.height);

	if(state.vflip) {
		ctx.translate(0,offScreenCanvas.height);
		ctx.scale(1,-1);
	}

	if(state.hflip) {
		ctx.translate(offScreenCanvas.width,0);
		ctx.scale(-1,1);
	}

	if(state.rotate!=0) {
		ctx.translate(offScreenCanvas.width/2,offScreenCanvas.height/2);
		ctx.rotate(state.rotate===90 ? Math.PI/2 : state.rotate===180? Math.PI : (Math.PI*3)/2);
		ctx.translate(-offScreenCanvas.offScreenCanvas/2,-canvas.height/2);
	}

	ctx.translate(state.translationX, state.translationY);
	ctx.scale(state.scale,state.scale);

	ctx.drawImage(image,0,0);
	ctx.restore();
}*/

function oneTimeTool() {
	var inst_text = jQuery("#totalImages").text().split("/");
	var isMultiframe = (inst_text[0].indexOf("Frame")>=0);
	var iNo = inst_text[0].split(":")[1];
	var winPos = jQuery("#wltmpImg").attr("pos");
	if((state.winPtr>=0 && state.winPtr==iNo && winPos!=iNo) || !winPos || windowingChanged) {
		windowingChanged = false;
		loadImg(isMultiframe,iNo,inst_text[1]);
	} else {
		showImg(null,getCurrentImage(),true);
	}
	drawAllShapes();
}

function setImageOnToggle() { 
	var inst_text = jQuery("#totalImages").text().split("/");
	var isMultiframe = (inst_text[0].indexOf("Frame")>=0);
	var iNo = inst_text[0].split(":")[1];
	loadImg(isMultiframe,iNo);
	drawAllShapes();
}

function hidePreview() {
	var iFrameVal = window.parent.document.getElementsByTagName('iframe');
	for(var i=0; i < iFrameVal.length; i++) {
		jQuery(iFrameVal[i]).contents().find('#previewCanvas, #highlightCanvas').hide();
	}
	jQuery(jQuery("#hide",window.parent.document).children().get(0)).attr("src","images/show-icon-orange.png");
	preview = false;
}

function showPreview() {
	var iFrameVal = window.parent.document.getElementsByTagName('iframe');
	for(var i=0; i < iFrameVal.length; i++) {
		jQuery(iFrameVal[i]).contents().find('#previewCanvas, #highlightCanvas').show();
	}
	jQuery(jQuery("#hide",window.parent.document).children().get(0)).attr("src","images/hide-preview-orange.png");
	preview = true;
}

function doShowHidePreview(e1) {
	if (preview) {
		hidePreview(e1);
		drawoutline();
	} else {
		showPreview(e1);
	}
}

function reloadSeriesImgs() {
    var inst_text = jQuery("#totalImages").text().split("/");
    var iNo = parseInt(inst_text[0].split(":")[1]);

    if(total > 1) {
    	for(var i=iNo, j=iNo+1; i>0 || j<=total; i--, j++) {
            if (i > 0) {
                var imgTmp = $("#" + (seriesUid + "_" + i).replace(/\./g,'_'), window.parent.document);
        	    var imgTmpSrc = imgTmp.attr('src');
                if (imgTmpSrc.indexOf('windowCenter') > 0) {
                    imgTmpSrc = imgTmpSrc.substring(0, imgTmpSrc.indexOf('windowCenter')-1);
                }
                if (modifiedWC != null) {
                    imgTmpSrc += "&windowCenter=" + parseInt(modifiedWC) + "&windowWidth=" + parseInt(modifiedWW);
                }
                imgTmp.attr('src', imgTmpSrc);
            }

            if (j <= total) {
                var imgTmp1 = $("#" + (seriesUid + "_" + j).replace(/\./g,'_'), window.parent.document);
        	    var imgTmpSrc1 = imgTmp1.attr('src');
                if (imgTmpSrc1.indexOf('windowCenter') > 0) {
                    imgTmpSrc1 = imgTmpSrc1.substring(0, imgTmpSrc1.indexOf('windowCenter')-1);
                }
                if (modifiedWC != null) { 
                    imgTmpSrc1 += "&windowCenter=" + parseInt(modifiedWC) + "&windowWidth=" + parseInt(modifiedWW);
                }
    
                imgTmp1.attr('src', imgTmpSrc1);
            }

        }
        window.parent.seriesImgsLoadedAgain = true;
    }
}