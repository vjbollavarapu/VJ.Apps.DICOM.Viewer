var imgInc=1, inc = 5,total,frameInc=1;
var seriesUid;
var data;
var state = {translationX : 0,translationY: 0,scale: 0,vflip: false,hflip: false,rotate: 0,invert: false,drag: false, mouseDown: false, windowing:false};
var navState = {screenNavImgFactor: 0.15,navigationImgFactor:0.3,scale:0,width:0,height:0,outline:{x:0,y:0,w:0,h:0},drag:false};
var doMouseWheel = true;
var loopTimer = null;
var pixelBuffer = null, lookupObj = null, pixelData = null, tmpCanvas = null, numPixels = 0;
var windowCenter='',windowWidth,modifiedWC=undefined,modifiedWW=undefined,maxPix=0,minPix=0;
var mouseLocX;
var mouseLocY;
var mousePressed; 
var columns;
var isSliderLoaded = false;
var winProgress = 100;
var textOverlay;
var brightnessVal = 0,
	contrastVal = 0;

jQuery('#ImagePane').ready(function() {

	var ht = jQuery(window).height();
	var src = window.location.href;
	var studyUID = getParameter(src,'study');
	
    jQuery('body').css('height',ht - 3 + 'px' );
    
    jQuery('#footer').css("height",(ht-165) + "px");
    jQuery('#trackbar1').css("height",(ht-200) + "px");
    jQuery('#end').css("top",(ht-170) + "px");    

    jQuery("#frameSrc").html(window.location.href);  
 	jQuery('#studyId').html(studyUID);
 	
 	jQuery('#scoutLine', window.parent.document).show();
    jQuery('#syncSeries', window.parent.document).show();
    jQuery('#measure', window.parent.document).show();
     
    parent.window.addEventListener('selection',onTileSelection,false);
    parent.window.addEventListener('ToolSelection',onToolSelection,false); 
    parent.window.addEventListener('sync',synchronize,false);    
    window.parent.createEvent('selection',{"ImagePane":jQuery('#ImagePane')});
    $.ajax({
        url: 'overlayText.do',
        data: {
            'action': 'READ'
        },
        type: 'GET',
        datatypr: 'json',
        success: function(data) {
            textOverlay = data
        },
        async: false
    });
    loadImage(); 
    loadTextOverlay();
    
    var canvasDiv = jQuery('#canvasDiv');
    
    canvasDiv.on('mousewheel DOMMouseScroll', function (e) {
   
    	if(jQuery('body').css('border').indexOf('none')>=0){ 
	    	window.parent.createEvent('selection',{"ImagePane":jQuery('#ImagePane')});
    	}
    	
    	if(doMouseWheel) {
			if (e.originalEvent.wheelDelta < 0 || e.originalEvent.detail > 0) {
				nextImage();
			} else {
				prevImage();
			}		
		}
		//prevent page from scrolling
		return false;	
	});
	
     jQuery(document).keydown(function(e) {     
		if(doMouseWheel) {
		    if(e.which == 38 || e.which == 37) {        	
		        prevImage();
		    } else if(e.keyCode == 40 || e.keyCode == 39) {
			    nextImage();
		    }
	    }
		if(e.which==46) { 
	    	deleteSelectedMeasurement(); 
	    }
    }); 
	
      
    var oy,ny;
    canvasDiv.mousedown(function(e) {
    	if(e.which==1) {
			if(jQuery('#tool').text()==='stackImage' && doMouseWheel) {
				oy = e.pageY;
				state.drag = true;			
				
				jQuery('#canvasDiv').mousemove(function(e1) {
					if(jQuery('#tool').text()==='stackImage' && state.drag) {
						ny = e1.pageY;
						if( (oy-ny) >inc) {
							prevImage();
							oy = ny;
						} else if( (oy-ny) < -(inc)) {
							nextImage();
							oy = ny;
						}
					}
				});
				
				jQuery('#canvasDiv').mouseup(function(e2) {
					state.drag = false;
				});
				
				e.preventDefault();
				e.stopPropagation();
			}
    	}
    }); 
    
    canvasDiv.click(function(e) {
    	window.parent.createEvent('selection',{"ImagePane":jQuery('#ImagePane')});
    });   
    
    jQuery("#canvasLayer2").dblclick(function(e) {    	
//    	toggleResolution();    	
    	 toggleLayout();
		 // loadContextMenu();
    });
	// jQuery("#canvasLayer2").click(function(e) {
	// loadContextMenu();
	// });
	// jQuery(document).on("rightclick" , "#canvasLayer2", function(){
	// 	console.log("**********");
	// // loadContextMenu();
	// });
	$( "#canvasLayer2" ).contextmenu(function() {
		loadContextMenu();
		
	  });
    window.addEventListener('resize', resizeCanvas, false);  
   	jQuery('#tool').html('');	    
     
	loadInstanceText(true,true);
    
    if(window.parent.displayScout && (jQuery('#modalityDiv').html().indexOf('CT')>=0 || jQuery('#modalityDiv').html().indexOf('MR')>=0)) {
		Localizer.drawScout();
	}	
	
	if(window.parent.syncEnabled) {
			window.parent.createEvent('sync',{forUid:jQuery('#forUIDPanel').html(),fromTo:getFromToLoc()});
	}
	loadContextMenu();
	
	if (!sessionStorage[seriesUid]) {
		window.parent.getInstances(window.parent.pat.pat_ID, studyUID, seriesUid);
	}
	
	var tools = sessionStorage['tools'];
	if (tools === 'zoom') {
		activateTools(tools, activateZoom);
	} else if (tools === 'move') {
		activateTools(tools, activateMove);
	} else if (tools === 'magnify') {
		activateTools(tools, activateMagnify);
	} else if (tools === 'probe') {
		doProbe("probe", true);
	} else if (tools === 'stackImage') {
		activatestack(tools)
	} else if(tools === 'windowing') {
		activateTools("windowing", activateWindowing);
		 loadContextMenu();
	} else {
		// loadContextMenu();
	}
	
	var iNo = parseInt(jQuery("#totalImages").text().split("/")[0].split(":")[1]);
	if (window.parent.rulerMap.has(seriesUid)) {
		rulerMap = window.parent.rulerMap.get(seriesUid);
	}
	if (window.parent.rectMap.has(seriesUid)) {
		rectMap = window.parent.rectMap.get(seriesUid);
	}
	if (window.parent.ovalMap.has(seriesUid)) {
		ovalMap = window.parent.ovalMap.get(seriesUid);
	}
	if (window.parent.angleMap.has(seriesUid)) {
		angleMap = window.parent.angleMap.get(seriesUid);
	}
	if (window.parent.probeMap.has(seriesUid)) {
		probeMap = window.parent.probeMap.get(seriesUid);
	}
	if (window.parent.cobbMap.has(seriesUid)) {
		cobbMap = window.parent.cobbMap.get(seriesUid);
	}
	loadMeasurement(iNo);
	
    var tmpInsNo = parseInt(getParameter(src,'instanceNumber'))+1;
    var actImgSrc = jQuery('#' + (seriesUid+"_"+tmpInsNo).replace(/\./g,'_'), window.parent.document).get(0); 

    var tmpWC = getParameter(actImgSrc.src, "windowCenter");
    var tmpWW = getParameter(actImgSrc.src, "windowWidth");

    if (tmpWC != null && tmpWW != null) {
        reloadSeriesImgs();
    }
	
});

jQuery(document).mouseup(function(e) {
	window.parent.createEvent("ToolSelection",{tool:"mouseup"});
});

function toggleLayout() {
	 data = sessionStorage[seriesUid];
	 if (data) {
		 jQuery('#loadingView', window.parent.document).hide();
		 var divElement = window.parent.document.getElementById('tabs_div');
		 var inst_text = jQuery("#totalImages").text().split("/");
		 var iNo = parseInt(inst_text[0].split(":")[1]);
		 var src = $('#frameSrc').text();
		 var total = 0;
		    
		 var pat = window.parent.pat;
		 var rowIndex;
		 var colIndex;
		    
		 var currSer = getParameter(src, "series");
		 var studyUID = getParameter(src, 'study');
		 selectedSeriesData = getSelectedSeries(currSer, studyUID);
		 var seriesData = JSON.parse(sessionStorage[pat.studyUID]);
		    
		 var ser_Info = JSON.parse(sessionStorage[currSer]);
		 ser_Info = ser_Info[0];
	     var multiframe = ser_Info['multiframe'];
	     if (multiframe == true) {
		     total = ser_Info['numberOfFrames'];
		 } else {
		     total = selectedSeriesData['totalInstances'];
		 }
		    
		 rowIndex = total <= 2 ? 0 : 1;
		 colIndex = total < 2 ? 0 : 1;
		 totFrame = (rowIndex + 1) * (colIndex + 1);

		 var cnt = iNo - 1,
		     divContent = '<table width="100%" height="100%" cellspacing="2" cellpadding="0" border="0" >';
		 
		 if (((cnt + 1) == total || cnt > (total - totFrame)) && total > totFrame) {
	            cnt = total - totFrame;
	     }
		 
		 if (total > 1) {
			 cnt = total < totFrame ? 0 : cnt;
		     for (x = 0; x <= rowIndex; x++) {
		    	 divContent += '<tr>';
		         for (y = 0; y <= colIndex; y++) {
		             cnt = total < totFrame ? cnt : cnt % total;
		             divContent += '<td><iframe id="frame' + cnt;
		             divContent += '" height="100%" width="100%" frameBorder="0" scrolling="yes" ';
		             if (total > cnt) {
		            	  divContent += 'src="TileContent.html?serverURL=' + pat.serverURL + 'study=' + studyUID + '&series=' + currSer +
		                 '&object=' + ser_Info['SopUID'] + '&sopClassUID=' + ser_Info['SopClassUID'] + '&seriesDesc=' + selectedSeriesData['seriesDesc'] +
		                 '&images=' + selectedSeriesData['totalInstances'] + '&modality=' + selectedSeriesData['modality'];

		                 if (modifiedWC != undefined && modifiedWW != undefined && !multiframe) {
		                	 divContent += '&windowCenter=' + modifiedWC + '&windowWidth=' + modifiedWW;
		                 }
		                 divContent += '&contentType=' + pat.imgType + '&instanceNumber=';
		                 if (multiframe) {
		                	 divContent += '0&numberOfFrames=' + ser_Info['numberOfFrames'] + '&frameNumber=' + cnt;
		                 } else {
		                	 divContent += cnt;
		                 }
		                 divContent += '" style="background:#000; visibility: hidden;"></iframe></td>';
		             } else {
		                    divContent += ' ' + 'style="background:#000"src ="TileContent.html?study=' + pat.studyUID + '"></iframe></td>';
		             }
		             cnt++;
		         }
		         divContent += '</tr>';
		     }
		     divContent += '</table>';
		     jQuery('#totRow', window.parent.document).text(rowIndex);
		     jQuery('#totColumn', window.parent.document).text(colIndex);
		     jQuery('#selectedFrame', window.parent.document).text(iNo - 1)
		     divElement.innerHTML = divContent;
		 }
	 }else{
		 jQuery('#loadingView', window.parent.document).show();
		 setTimeout("toggleLayout();", 200);
	 }
}

function getSelectedSeries(currSer, studyUID) {
    var pat = window.parent.pat;
    var seriesData = JSON.parse(sessionStorage[studyUID]);
    var selectedSeriesData;
    for (var i = 0; i < seriesData.length; i++) {
        selectedSeriesData = seriesData[i];
        if (currSer == selectedSeriesData['seriesUID']) {
            return selectedSeriesData;
        }
    }
}

function loadImage() {
	var src = jQuery('#frameSrc').html();
	seriesUid = getParameter(src,'series');
	var instanceNo = getParameter(src,'instanceNumber');
	imgInc = instanceNo!=null ? parseInt(instanceNo)+1 : 1;	

	var img = jQuery('#' + (seriesUid+"_"+imgInc).replace(/\./g,'_'), window.parent.document).get(0);  	

    if (img) {
	    if(img.src.indexOf('SR_Latest.png')>=0) {
		    loadSR(jQuery(img).attr('imgSrc'));
    	} else if(img.src.indexOf('pdf.png')>=0) {
	    	loadPDF(jQuery(img).attr('imgSrc'));
	    } else {
	    	eliminateRawData();
	    }
    }
	jQuery('#loadingView', window.parent.document).hide();	
	jQuery('iframe',window.parent.document).css('visibility','visible');
}

function eliminateRawData() {
	try {
		showImage(seriesUid + "_" + imgInc);
	} catch(err) {
		if(err=='rawdata') {
			imgInc = imgInc+1;
			eliminateRawData();
		}
	}
}

function showImage(imgSrc,image) {	
	var image = imgSrc!=null ? jQuery('#' + imgSrc.replace(/\./g,'_'), window.parent.document).get(0) : image;  	

    var imgNatHeight = image.naturalHeight;
    var imgNatWidth = image.naturalWidth;

    if (imgNatWidth == 0 || imgNatHeight == 0) {
        var seriesData = JSON.parse(sessionStorage[getParameter(image.src, 'series')]);
        imgNatWidth = seriesData[0].nativeColumns;
        imgNatHeight = seriesData[0].nativeRows;
    }    



	var canvas = document.getElementById('imageCanvas');

	
	var vWidth = canvas.parentNode.offsetWidth;
	var vHeight = canvas.parentNode.offsetHeight;  
	
	if(vWidth!=0 && vHeight!=0) {
		canvas.width = vWidth;
		canvas.height = vHeight;
		canvas.style.width = vWidth;
		canvas.style.height = vHeight;      
		
		var top = (canvas.parentNode.offsetHeight-canvas.height) / 2;
		canvas.style.marginTop = parseInt(top) + "px";

		var left = (canvas.parentNode.offsetWidth - canvas.width) / 2;
		canvas.style.marginLeft = parseInt(left) + "px";

		var siblings = jQuery(canvas).siblings().not('.preview');
		for(var j=0; j<siblings.length; j++) {    	
			var tmpCanvas = siblings.get(j);
			if(tmpCanvas != null) {
			    tmpCanvas.width = vWidth;
			    tmpCanvas.height = vHeight;
			    tmpCanvas.style.width = vWidth;
			    tmpCanvas.style.height = vHeight;
			    tmpCanvas.style.marginTop = parseInt(top) + "px";
			    tmpCanvas.style.marginLeft = parseInt(left) + "px";
			}
		};
	}

	state.scale = Math.min(canvas.width/imgNatWidth, canvas.height/imgNatHeight);	
	state.translationX = (canvas.width- parseInt(state.scale * imgNatWidth))/2;
	state.translationY = (canvas.height- parseInt(state.scale * imgNatHeight))/2;
	showImg(null,image,true);	
}

function showImg(imgSrc,img,updatePreview) {
	var image = imgSrc!=null ? jQuery('#'+imgSrc.replace(/\./g,'_'), window.parent.document).get(0) : img;

    var imgNatHeight = image.naturalHeight;
    var imgNatWidth = image.naturalWidth;

    if (imgNatWidth == 0 || imgNatHeight == 0) {
        var seriesData = JSON.parse(sessionStorage[getParameter(image.src, 'series')]);
        imgNatWidth = seriesData[0].nativeColumns;
        imgNatHeight = seriesData[0].nativeRows;
    }    

	if(image.src.indexOf('rawdata.png')>=0) {
		throw 'rawdata';
		return;
	}
	var canvas = document.getElementById('imageCanvas');
	var ctx = canvas.getContext('2d');
	
	ctx.save();
	ctx.setTransform(1,0,0,1,0,0);		
	ctx.clearRect(0,0,canvas.width,canvas.height);	
	
	var translate = true;
	if(jQuery("#tool").html()=="move") {
		ctx.translate(state.translationX, state.translationY);
		translate = false;
	}
	
	if(state.vflip) {
		ctx.translate(0,canvas.height);
		ctx.scale(1,-1);
	}

	if(state.hflip) {
		ctx.translate(canvas.width,0);
		ctx.scale(-1,1);
	}

	if(state.rotate!=0) {
		ctx.translate(canvas.width/2,canvas.height/2);
		ctx.rotate(state.rotate===90 ? Math.PI/2 : state.rotate===180? Math.PI : (Math.PI*3)/2);
		ctx.translate(-canvas.width/2,-canvas.height/2);	   
	}	
	
	if(translate) {
		ctx.translate(state.translationX, state.translationY);	
	}
	ctx.scale(state.scale,state.scale);			
	
	ctx.drawImage(image,0,0);
	ctx.restore();
	
	if(state.invert) {
		window.parent.doInvert(jQuery('#imageCanvas').get(0),false);
	}
	
	if(updatePreview===true) {
		jQuery('#zoomPercent').html('Zoom: ' + parseInt(state.scale * 100) + '%');
		jQuery('#imageSize').html('Image size:' + imgNatWidth + "x" + imgNatHeight);
		jQuery('#viewSize').html('View size:' + canvas.width + "x" + canvas.height);
		loadPreview(image);		
	}	
	
	if (brightnessVal != 0 || contrastVal != 0) {
	        changeImageData();
	}
}


var imgData = {
    "red": 0,
    "green": 0,
    "blue": 0
};

function changeImageData() {

    var tmpCanvas = document.getElementById('imageCanvas');
    var tmpCtx = tmpCanvas.getContext('2d');


    pixelData = tmpCtx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height);
    var data = pixelData.data;

    var contrast = 5;

    contrast = (contrast / 100) + 1; //convert to decimal & shift range: [0..2]
    var intercept = 128 * (1 - contrast);

    if (contrastVal < 0) {
        contrastVal = Math.abs(contrastVal);
        for (var j = 0; j < contrastVal; j++) {
            for (i = 0; i < data.length; i += 4) {
                if (j == 0) {
                    imgData = {
                        "red": data[i],
                        "green": data[i + 1],
                        "blue": data[i + 2]
                    };
                    imgData = changeBrightness(imgData);

                    data[i] = imgData.red; //RED
                    data[i + 1] = imgData.green; //GREEN
                    data[i + 2] = imgData.blue; //BLUE

                }
                data[i] = data[i] / contrast - intercept;
                data[i + 1] = data[i + 1] / contrast - intercept;
                data[i + 2] = data[i + 2] / contrast - intercept;
            }
        }
    } else {
        for (var j = 0; j < contrastVal; j++) {
            for (i = 0; i < data.length; i += 4) {
                if (j == 0) {
                    imgData = {
                        "red": data[i],
                        "green": data[i + 1],
                        "blue": data[i + 2]
                    };
                    imgData = changeBrightness(imgData);

                    data[i] = imgData.red; //RED
                    data[i + 1] = imgData.green; //GREEN
                    data[i + 2] = imgData.blue; //BLUE
                }
                data[i] = data[i] * contrast + intercept;
                data[i + 1] = data[i + 1] * contrast + intercept;
                data[i + 2] = data[i + 2] * contrast + intercept;
            }
        }
    }
    tmpCanvas.getContext('2d').putImageData(pixelData, 0, 0);
}

/**
 * 
 * @param {JSON} imgData 
 */
function changeBrightness(imgData) {
    var bRed, bGreen, bBlue;

    bRed = brightnessVal + imgData.red;
    bGreen = brightnessVal + imgData.green;
    bBlue = brightnessVal + imgData.blue;

    bRed = bRed > -255 ? bRed : imgData.red;
    bGreen = bGreen > -255 ? bGreen : imgData.green;
    bBlue = bBlue > -255 ? bBlue : imgData.blue;
    bRed = bRed < 255 ? bRed : imgData.red;
    bGreen = bGreen < 255 ? bGreen : imgData.green;
    bBlue = bBlue < 255 ? bBlue : imgData.blue;

    if (state.invert) {
        imgData.red = 255 - bRed; //RED
        imgData.green = 255 - bGreen; //GREEN
        imgData.blue = 255 - bBlue; //BLUE
    } else {
        imgData.red = bRed;
        imgData.green = bGreen;
        imgData.blue = bBlue;
    }
    return imgData;
}

function loadTextOverlay() {
    var src = jQuery('#frameSrc').html();
    try {
    	src = decodeURI(src);
    } catch(e) { }
    
    total = parseInt(getParameter(src,'images'));

    if (Number.isNaN(total)) {
        return;
    }

	jQuery('#patName').html(window.parent.pat.pat_Name);
	jQuery('#patID').html(window.parent.pat.pat_ID);
	jQuery("#patGender").html(window.parent.pat.pat_gender);

	
	jQuery('#seriesDesc').html(getParameter(src, 'seriesDesc'));
	jQuery('#modalityDiv').html(getParameter(src,'modality'));
	

	jQuery('#totalImages').html(total>1 ? 'Images:' + (imgInc) + '/' + total :'Image:' + (imgInc) + '/' + total);
	loadSlider();

	var studyData = JSON.parse(sessionStorage[window.parent.pat.pat_ID]);
	var thisStudy = getParameter(window.location.href,"study");
	
	if(studyData!=undefined) {
		for(var st=0;st<studyData.length;st++) {
			var curr_study = studyData[st];
			
			if(curr_study["studyUID"]==thisStudy) {				
				jQuery('#studyDesc').html(curr_study['studyDesc']);
				jQuery('#studyDate').html(curr_study['studyDate']);
				break;
			}
		}
	}
}

function loadInstanceText(checkForUpdate,autoplay) {
    if (Number.isNaN(total)) {
        return;
    }

	data = sessionStorage[seriesUid];
	if(data) {
//		try {
			data = JSON.parse(data);
			if(data!=null) {
				data = data[imgInc-1];		
				if(data) {
					updateData(data, autoplay);
				} else {
					jQuery('#totalImages').html(total>1 ? 'Images:' + (imgInc) + '/' + total :'Image:' + (imgInc) + '/' + total);
				}
		    }  else if(checkForUpdate===true){
		    	setTimeout("loadInstanceText("+checkForUpdate + "," + autoplay +")",200);
		    } else {
		    	jQuery('#totalImages').html(total>1 ? 'Images:' + (imgInc) + '/' + total :'Image:' + (imgInc) + '/' + total);
		    }
//		} catch(e) {
//			console.log("DICOM attributes not available " + e);
//			jQuery('#totalImages').html(total>1 ? 'Images:' + (imgInc) + '/ ' + total :'Image:' + (imgInc) + '/ ' + total);
//		}
	} else if(checkForUpdate===true) {
		if(window.parent.pat.studyUID==jQuery('#studyId').html()) {
			setTimeout("loadInstanceText("+checkForUpdate + "," + autoplay +")",200);
		} 
	} else {
		jQuery('#totalImages').html(total>1 ? 'Images:' + (imgInc) + '/' + total :'Image:' + (imgInc) + '/' + total);
	}
	setSliderValue();
	jQuery('#serId').html(seriesUid+'_'+imgInc);
	window.parent.setSeriesIdentification();

	if(window.parent.displayScout && (jQuery('#modalityDiv').html().indexOf('CT')>=0 || jQuery('#modalityDiv').html().indexOf('MR')>=0)) {
		Localizer.drawScout();
	}
}

function updateData(data, autoplay){

	if(data['imageOrientation']!=undefined && data['imageOrientation']!='') {
		var imgOrient = data['imageOrientation'].split("\\");
	
		jQuery('#imgOriRight').html(imgOrient[0]);
        jQuery('#imgOriBottom').html(imgOrient[1]);
        jQuery('#imgOriLeft').html(getOppositeOrientation(imgOrient[0]));
        jQuery('#imgOriTop').html(getOppositeOrientation(imgOrient[1]));
	}

	var imgLaterality = "";
	if (data['imgLaterality'] != undefined && data['imgLaterality'] != '') {
		imgLaterality = data['imgLaterality'];
	}
	var viewPosition = '';
	if (data['viewPosition'] != undefined && data['viewPosition'] != '') {
		viewPosition = data['viewPosition'];
	}

	var modality = "";
	if (data['modality'] != undefined && data['modality'] != '') {
		modality = data['modality'];
	}
	
	var imageLater = textOverlay.imageLaterality;
	
	if (!((viewPosition == '' || viewPosition == undefined) && (imgLaterality == '' || imgLaterality == undefined))) {
		var laterality = imgLaterality + "(" + viewPosition + ")";
		
		if (imageLater.display == 'Yes') {
			if (imageLater.modality == 'ALL') {
				$('#imgLaterality').text(laterality);
			} else {
				var modalityList = imageLater.modalityList.split('/');
				if (imageLater.modality == 'SELECTED') {
					for (var i = 0; i < modalityList.length; i++) {
						if (modalityList[i] == modality) {
							$('#imgLaterality').text(laterality);
						}
					}
				} else {
					for (var i = 0; i < modalityList.length; i++) {
						if (modalityList[i] != modality) {
							$('#imgLaterality').text(laterality);
						}
					}
				}
			}
		}
	}
	
	if(modifiedWC!=undefined) {
		jQuery("#windowLevel").html('WL: ' + modifiedWC + ' / ' + 'WW: ' + modifiedWW);
	} else if(windowCenter=='') {
		windowCenter = data['windowCenter'];
		windowWidth = data['windowWidth'];

		if(windowCenter && windowCenter.indexOf('|') >=0) {
	   	 	windowCenter = windowCenter.substring(0, windowCenter.indexOf('|'));
   		}

		if(windowWidth && windowWidth.indexOf('|') >=0) {
			windowWidth = windowWidth.substring(0, windowWidth.indexOf('|'));
		}				
		jQuery("#windowLevel").html('WL: ' + windowCenter + ' / ' + 'WW: ' + windowWidth);
	} 			
	
	if(data['numberOfFrames'] != undefined && data['numberOfFrames'] != '' && data['multiframe']) {
		jQuery("#totalImages").html('Frames:' + frameInc + '/' + data['numberOfFrames']);
		total = data['numberOfFrames'];
		jQuery('#multiframe').css('visibility','visible');
		
		var frmSrc = jQuery('#frameSrc').text();				
		frmSrc = frmSrc.substring(0,frmSrc.indexOf("&object"));
		jQuery('#frameSrc').html(frmSrc + "&object=" + data['SopUID']);
		
		if(!isSliderLoaded) {
			jQuery("#totalImages").text('Frames:' + frameInc + '/' + data['numberOfFrames']);
			loadSlider();
			isSliderLoaded = true;
		}						
		
		if(autoplay) {									
			var frameTime = parseFloat(data['frameTime']); 
			if(frameTime>0.0) {
				doAutoplay(frameTime);
			} else {
				doAutoplay(15); // 15 FPS by default
			}
		}
	} else {
		jQuery('#totalImages').html(total>1 ? 'Images:' + (imgInc) + '/' + total :'Image:' + (imgInc) + '/' + total);
		jQuery('#multiframe').css('visibility','hidden');				
	}
	
	var sliceInfo = '';
	
	if(data['sliceThickness'] != undefined && data['sliceThickness'] != '') {
    	sliceInfo = 'Thick: ' + parseFloat(data['sliceThickness']).toFixed(2) + ' mm ';
	}

	if(data['sliceLocation'] != undefined && data['sliceLocation'] != '') {
	    sliceInfo += 'Loc: ' + parseFloat(data['sliceLocation']).toFixed(2) + ' mm';
	}  
	
	jQuery('#thickLocationPanel').html(sliceInfo);
	
	if(data['frameOfReferenceUID'] != undefined) {
		jQuery('#forUIDPanel').html(data['frameOfReferenceUID']);
	}
	
	if(data['refSOPInsUID'] != undefined) {
		jQuery('#refSOPInsUID').html(data['refSOPInsUID']);
	}
	
	if(jQuery('#imgType').html()!=data['imageType']) {
		jQuery('#imgType').html(data['imageType']);
		Localizer.toggleLevelLine();	
	}
	
	jQuery('#imgPosition').html(data['imagePositionPatient']);
    jQuery('#imgOrientation').html(data['imageOrientPatient']);		    
    jQuery('#pixelSpacing').html(data['pixelSpacing']);
    jQuery('#imgPixelSpacing').html(data['imagerPixelSpacing']);
}

function nextImage() {
	if(!state.drag || jQuery('#tool').html() === 'stackImage'){
		var isMultiframe = jQuery('#totalImages').html().indexOf('Frame')>=0;	 
		var iNo = !isMultiframe ? imgInc : frameInc;
		iNo = parseInt(iNo);
		iNo = (iNo+1) <= total ? (iNo+1) : 1;
		loadImg(isMultiframe,iNo);
		imgLoaded();
		loadMeasurement(iNo);
	}
}

function prevImage() {
	if(!state.drag || jQuery('#tool').html() === 'stackImage'){
		var isMultiframe = jQuery('#totalImages').html().indexOf('Frame')>=0;
		var iNo = !isMultiframe ? imgInc : frameInc;
		iNo = (iNo-1) >= 1 ? (iNo-1) : total;
		loadImg(isMultiframe,iNo);
		imgLoaded();
		loadMeasurement(iNo);
	}
}

function loadImg(isMultiframe,iNo) {
	var imgSrc = null;
	
	if(window.parent.pat.serverURL.indexOf('wado')>0 && modifiedWC!=undefined && modifiedWW!=undefined && (modifiedWC!=windowCenter || modifiedWW!=windowWidth) && !window.parent.seriesImgsLoadedAgain) {
		if(!isMultiframe) {
			imgSrc = jQuery('#' + (seriesUid + "_" + iNo).replace(/\./g,'_'), window.parent.document).attr('src');
			this.imgInc = iNo;
		} else {			
			imgSrc = jQuery('#' + (getParameter(jQuery('#frameSrc').html(),'object')+"_"+iNo).replace(/\./g,'_'), window.parent.document).attr('src');
			this.frameInc = iNo;
		}
		if(imgSrc.indexOf('windowCenter') >= 0) {
			imgSrc = imgSrc.substring(0, imgSrc.indexOf('&windowCenter='));
	    }	
		imgSrc += '&windowCenter=' + modifiedWC;
		imgSrc = imgSrc.trim() + '&windowWidth=' + modifiedWW;		
		jQuery("#wltmpImg").attr('src',imgSrc);
		jQuery("#wltmpImg").attr("pos",iNo);		
	} else {		
		if(!isMultiframe) {
			try {
				showImg(seriesUid + "_" + iNo,null,true);		
			} catch(err) { // Some times it might be raw data
				if(err=='rawdata') {
					iNo = imgInc;
					loadInstanceText(false,false);
					return;
				}
			}			
			this.imgInc = iNo;
		} else {
			imgSrc = getParameter(jQuery('#frameSrc').html(),'object')+"_"+iNo;
			showImg(imgSrc,null,true);		
			this.frameInc = iNo;			
		}
	}
}

function imgLoaded() {
	clearPixelBuffer();
	loadInstanceText(false, false);
	clearMeasurements();
	if(window.parent.syncEnabled) {
		window.parent.createEvent('sync',{forUid:jQuery('#forUIDPanel').html(),fromTo:getFromToLoc()});
	}
}


function getParameter(queryString, parameterName) {
    //Add "=" to the parameter name (i.e. parameterName=value);
    var parameterName = parameterName + "=";
    if(queryString.length > 0) {
        //Find the beginning of the string
        var begin = queryString.indexOf(parameterName);
        if(begin != -1) {
            //Add the length (integer) to the beginning
            begin += parameterName.length;
            var end = queryString.indexOf("&", begin);
            if(end == -1) {
                end = queryString.length;
            }
            return unescape(queryString.substring(begin, end));
        }

        return null;
    }
}

function onTileSelection(e) {
	if(e.detail.ImagePane.is(jQuery('#ImagePane'))) {
		jQuery('body').css('border','1px solid rgb(255, 138, 0)');
		if(window && window.parent.displayScout && jQuery('#tool').text()!='measure') {
			Localizer.hideScoutLine();
			Localizer.drawScout();
		}	
		var tool = jQuery('#tool').text();
		jQuery('.toggleOff',window.parent.document).not('#scoutLine').removeClass('toggleOff');
		if(tool!='') {
			jQuery('#'+tool,window.parent.document).removeClass('toggleOff');
			$('#measure').disableContextMenu();  	
		}
	
		if(tool=='measure') {
			init(jQuery('#totalImages').html().indexOf('Frame')>=0 ? frameInc : imgInc);
		}
	} else {
		jQuery('body').css('border','none');
		$('#measure').enableContextMenu();  
	}
}

function resizeCanvas() { //To resize the canvas on any screen size change
	var height = jQuery(window).height() - 3;
    jQuery('body').css('height',height +"px");
    jQuery('#footer').css("height",(height-195) + "px");
    var width = jQuery(window).width()-3;
    jQuery('body').css('width',width + "px");
    
    var imgSrc = seriesUid + "_" + imgInc;
    showImage(imgSrc);
	drawAllShapes();
}

function loadPDF(src) {
	var imgSrc = 'Image.do?serverURL=' + parent.pat.serverURL + '&study=' + getParameter(src,'study') + '&series=' + seriesUid + '&object=' + getParameter(src,'object');
	var frame = window.parent.getActiveFrame();

	let sopClassUID = getParameter(src, 'sopClassUID');
	if (sopClassUID.indexOf('1.2.840.10008.5.1.4.1.1.9') >= 0) {
		imgSrc += "&ECG=yes";
	}
	frame.src = imgSrc;	
}

function loadSR(src) {
	var imgSrc = 'Image.do?serverURL=' + parent.pat.serverURL + '&study=' + getParameter(src,'study') + '&series=' + seriesUid + '&object=' + getParameter(src,'object');
	imgSrc += '&contentType=text/html';	
	var frame = window.parent.getActiveFrame();
	frame.src = imgSrc;
    jQuery(frame).css("background","white");
}

function toggleResolution() {
	if(jQuery('#tool').html()!='measure') {
		var canvas = document.getElementById('imageCanvas');
		var image = getCurrentImage();				
		
		if(state.scale==1.0) { 			
			var scaleFac = Math.min(canvas.width/image.naturalWidth, canvas.height/image.naturalHeight);
			state.scale = scaleFac;
			state.translationX = (canvas.width- state.scale * image.naturalWidth)/2;
			state.translationY = (canvas.height- state.scale * image.naturalHeight)/2;
			showImg(null,image);
		} else {
			state.scale = 1.0;
			state.translationX = (canvas.width- state.scale * image.naturalWidth)/2;
			state.translationY = (canvas.height- state.scale * image.naturalHeight)/2;
			showImg(null,image);
			if(jQuery('#tool').html()!="move") {
				activateMove("move");
			}
		}
		jQuery('#zoomPercent').html('Zoom: ' + parseInt(state.scale * 100) + '%');
		drawoutline();
	}
}

String.prototype.replaceAll = function(pcFrom, pcTo){
    var i = this.indexOf(pcFrom);
    var c = this;
    while (i > -1){
        c = c.replace(pcFrom, pcTo);
        i = c.indexOf(pcFrom);
    }
    return c;
}

function parseDicom(imageData,sopUID) {	
	var wadoUrl = window.parent.pat.serverURL + "/wado?requestType=WADO&contentType=application/dicom&studyUID=" + window.parent.pat.studyUID + "&seriesUID=" + seriesUid + "&objectUID=" + (imageData!=null ? imageData['SopUID'] : sopUID);

	var reader = new DicomInputStreamReader();

	if (!(!(wadoUrl.indexOf('C-GET') >= 0) && !(wadoUrl.indexOf('C-MOVE') >= 0))) {	
		var imgSrc = jQuery('#' + (seriesUid + "_" + imgInc).replace(/\./g,'_'), window.parent.document).attr('src');
		/*var urlTmp = "Wado.do?study=" + getParameter(wadoUrl, "studyUID") + "&series=" + getParameter(wadoUrl,"seriesUID")
				+ "&object=" + getParameter(wadoUrl, "objectUID")
				+ "&contentType=application/dicom" + "&retrieveType=" + window.parent.pat.serverURL + "&dicomURL=" + window.parent.pat.dicomURL;*/
		var urlTmp = imgSrc + "&contentType=application/dicom";
		reader.readDicom(urlTmp);
	} else {		
		reader.readDicom("DcmStream.do?wadourl="
						+ wadoUrl.replaceAll("&", "_"));
	}	

	var dicomParser = new DicomParser(reader.getInputBuffer(), reader.getReader());
	dicomParser.parseAll();	
	imageData = dicomParser.imgData;	
	
	this.minPix = dicomParser.minPix;
	this.maxPix = dicomParser.maxPix;	
	this.pixelBuffer = dicomParser.pixelBuffer;	
	this.lookupObj = new LookupTable();
	
	lookupObj.setPixelInfo(this.minPix,this.maxPix,imageData['monochrome1']);
	columns = imageData['nativeColumns'];
	return imageData;
}

function renderImg() {
	var canvas = document.getElementById('imageCanvas');
	var ctx = canvas.getContext('2d');
	ctx.save();
	ctx.setTransform(1,0,0,1,0,0);
	ctx.clearRect(0,0,canvas.width,canvas.height);
	
	if(state.vflip) {
		ctx.translate(0,canvas.height);
		ctx.scale(1,-1);
	}
	
	if(state.hflip) {
		ctx.translate(canvas.width,0);
		ctx.scale(-1,1);
	}
	
	if(state.rotate!=0) {
		ctx.translate(canvas.width/2,canvas.height/2);
		ctx.rotate(state.rotate===90 ? Math.PI/2 : state.rotate===180? Math.PI : (Math.PI*3)/2);
		ctx.translate(-canvas.width/2,-canvas.height/2);	   
	}	
	
	ctx.translate(state.translationX, state.translationY);	
	ctx.scale(state.scale,state.scale);	

	ctx.drawImage(tmpCanvas,0,0);
	ctx.restore();	
}

function iterateOverPixels() {
	var canvasIndex = 3, pixelIndex = 0;
	var localData = pixelData.data;
	
	lookupObj.calculateLookup();
    var lookupTable=lookupObj.ylookup;    
	
	while(pixelIndex<numPixels) {
		localData[canvasIndex] = lookupTable[pixelBuffer[pixelIndex++]];
		canvasIndex+=4;
	}
	//tmpCanvas.getContext('2d').putImageData(pixelData,0,0); 
	if(state.invert) { 
		for (var i = 0; i < pixelData.data.length; i += 4) {     
			pixelData.data[i] = pixelData.data[i]; 
	    	pixelData.data[i+1] = pixelData.data[i+1]; 
	    	pixelData.data[i+2] = pixelData.data[i+2]; 
	        pixelData.data[i+3] = 255 - pixelData.data[i+3]; 
		} 
		tmpCanvas.getContext('2d').putImageData(pixelData,0,0); 
	} else { 
		tmpCanvas.getContext('2d').putImageData(pixelData,0,0);
	}		
}

function doAutoplay(frameTime) {
	if(loopTimer==null) {
		jQuery('#loopSlider',window.parent.document).slider({max:frameTime*2,value: frameTime});
		parent.loopSpeed = frameTime;
		window.parent.document.getElementById('loopChkBox').checked = true;
		doLoop(true);
	}
}

//Preview
function loadPreview(image) {
	var imageCanvas = document.getElementById("imageCanvas");
	var previewCanvas = document.getElementById("previewCanvas");
	var highlightCanvas = document.getElementById("highlightCanvas");
	navState.width = parseInt(imageCanvas.width*navState.navigationImgFactor);
	navState.height = parseInt(navState.width*image.naturalHeight/image.naturalWidth);
	var scrNavImgWidth = parseInt(imageCanvas.width*navState.screenNavImgFactor);
	navState.scale = scrNavImgWidth/navState.width;
	previewCanvas.width = highlightCanvas.width = getScreenNavImageWidth();
	previewCanvas.height = highlightCanvas.height = getScreenNavImageHeight();
	//context.drawImage(image,0,0,getScreenNavImageWidth(),getScreenNavImageHeight());	
	drawPreview(document.getElementById("previewCanvas"), image);
	drawoutline();
	addNavigationListener(highlightCanvas); 
}

/**
 * Renders preview image in preview canvase
 * @param canvas Preview canvas
 * @param image Preview image
 */
function drawPreview(canvas,image) {
	var context = canvas.getContext('2d');
	context.save();
	context.setTransform(1,0,0,1,0,0);
	context.clearRect(0,0,canvas.width,canvas.height);	
	if(state.vflip) {
		context.translate(0,canvas.height);
		context.scale(1,-1);
	}
	if(state.hflip) {
		context.translate(canvas.width,0);
		context.scale(-1,1);
	}
	if(state.rotate!=0) {
		context.translate(canvas.width/2,canvas.height/2);
		context.rotate(state.rotate===90 ? Math.PI/2 : state.rotate===180? Math.PI : (Math.PI*3)/2);
		context.translate(-canvas.width/2,-canvas.height/2);	   
	}
	context.drawImage(image,0,0,getScreenNavImageWidth(),getScreenNavImageHeight());
	context.restore();
	
	if(state.invert) {
		window.parent.doInvert(jQuery('#previewCanvas').get(0),false);
	}
}

function getScreenNavImageWidth() {
	return parseInt(navState.scale*navState.width);
}

function getScreenNavImageHeight() {
	return parseInt(navState.scale*navState.height);
}

function getScreenImageWidth() {
	return parseInt(state.scale*parseInt(jQuery('#imageSize').html().split("x")[0].split(":")[1]));
}

function getScreenImageHeight() {
	return parseInt(state.scale*jQuery('#imageSize').html().split("x")[1]);
}

function addNavigationListener(highlightCanvas) {
	var context = highlightCanvas.getContext('2d');	
	var startCoords = [],img = null;
	
	jQuery(highlightCanvas).mousedown(function(e) {	
		if(e.which==1) {
			e.preventDefault();
			e.stopPropagation();	
			if(e.offsetX>=navState.outline.x && e.offsetX*navState.scale<=navState.outline.x+(navState.outline.w*navState.scale) && e.offsetY>=navState.outline.y && e.offsetY*navState.scale<=navState.outline.y+(navState.outline.h*navState.scale)) {
				navState.drag = true;	
				 startCoords = [
			   	 	e.offsetX - navState.outline.x,
			   		e.offsetY - navState.outline.y
			    ];
			    jQuery(highlightCanvas).css('cursor','move');
			    img = getCurrentImage();
			}
		}
	}).mousemove(function(e1) {
		e1.preventDefault();
		e1.stopPropagation();
		if(navState.drag) {			
			var x = e1.offsetX;
			var y = e1.offsetY;	
			
			navState.outline.x = x-startCoords[0];
			navState.outline.y = y-startCoords[1];	

			context.clearRect(0,0,highlightCanvas.width,highlightCanvas.height);
			context.strokeRect(navState.outline.x,navState.outline.y,navState.outline.w,navState.outline.h);
			
			var point = {x:navState.outline.x,y:navState.outline.y};
			var scrImgPoint = navToScaledImgCoords(point);
			state.translationX = -scrImgPoint.x;
			state.translationY = -scrImgPoint.y;
			showImg(null,img,false);
			drawAllShapes();
		}
	}).mouseup(function(e2) {
		e2.preventDefault();
		e2.stopPropagation();
		navState.drag = false;
		jQuery(highlightCanvas).css('cursor','default');
	});
}

function navToScaledImgCoords(point) {
	return {x:point.x * getScreenImageWidth() / getScreenNavImageHeight(),y: point.y * getScreenImageHeight() / getScreenNavImageHeight()};
}

function needPreview(canvasWidth,canvasHeight) {
	return !(state.translationX>=0 && (state.translationX+getScreenImageWidth())<=canvasWidth && state.translationY>=0 && (state.translationY+getScreenImageHeight())<=canvasHeight);
}

function drawoutline() {
	var imageCanvas = document.getElementById("imageCanvas");
	if(needPreview(imageCanvas.width,imageCanvas.height)) {	
		var highlightCanvas = document.getElementById('highlightCanvas');
		jQuery('#previewCanvas').css('visibility', 'visible');
		jQuery(highlightCanvas).css('visibility', 'visible');		
		var x = -state.translationX * getScreenNavImageWidth()/getScreenImageWidth();
		var y = -state.translationY * getScreenNavImageHeight()/getScreenImageHeight();
		var w = imageCanvas.width * getScreenNavImageWidth()/getScreenImageWidth();
		var h = imageCanvas.height * getScreenNavImageHeight()/getScreenImageHeight();
		if(x<0) {
			x = 0;			
		}
		if(y<=0) {
			y =0;
		}

		if(x+w>highlightCanvas.width) {
			w = highlightCanvas.width-x;
		}
		if(y+h>highlightCanvas.height) {
			h = highlightCanvas.height-y;
		}
		navState.outline = {x:x,y:y,w:w,h:h};
		var context = highlightCanvas.getContext('2d');
		context.clearRect(0,0,highlightCanvas.width,highlightCanvas.height);		
		context.strokeStyle="#FF8A00";
		context.lineWidth = 2;
		context.strokeRect(x,y,w,h);
	}
}

function loadContextMenu() {

	var queryString = window.location.href;
	var study = getParameter(queryString,'study');	
	var data = sessionStorage[study];
	// console.log(data);
	if(data != undefined) {
		
		var seriesData = JSON.parse(data);		
		var cxtContent = '<ul id="contextmenu1" class="menu"';	
	
		if(isCompatible()) {
			for(var i=0;i<seriesData.length;i++) {			
				var series = seriesData[i];
				var seriesComp = jQuery("#" + series['seriesUID'].replace(/\./g,'_')+"_table", window.parent.document);
                if(seriesComp.length == 1) {			
                	//	jQuery('#studyDesc').html(series['studyDesc']);
                	//	jQuery('#studyDate').html(series['studyDate']);
                	var seriesDesc = convertSplChars(series['seriesDesc']);            			
                	if(seriesDesc== undefined && seriesDesc==='') {
                		seriesDesc = 'UNKNOWN';
                	}
                	cxtContent+= '<li><a class="cmenuItem" href="#" link="frameContent.html?study=' + study + '&series=' + series['seriesUID'] + '&seriesDesc=' + series['seriesDesc'] + '&images=' + series['totalInstances'] + '&modality='+ series['modality'] + '" onclick="triggerContext(jQuery(this));">' + seriesDesc + ' </a></li>';
                }
			}
			cxtContent+='</ul>';         		
		} else {
		
			for(var i=0;i<seriesData.length;i++) {
				var series = seriesData[i];
				var seriesComp = jQuery("#" + series['seriesUID'].replace(/\./g,'_')+"_table", window.parent.document);
                if(seriesComp.length == 1) {
                	//	jQuery('#studyDesc').html(series['studyDesc']);
                	//	jQuery('#studyDate').html(series['studyDate']);
                	var seriesDesc = convertSplChars(series['seriesDesc']);
                	if(seriesDesc==undefined && seriesDesc==='') {
                		seriesDesc = 'UNKNOWN';
                	}
                	cxtContent +='<li><a href="#" link="frameContent.html?serverURL=';
                	cxtContent += getParameter(queryString, 'serverURL');
                	cxtContent += '&study=' + study;
                	cxtContent += '&series=' + series['seriesUID'];
                	cxtContent += '&seriesDesc=' + series['seriesDesc'];
                	cxtContent += '&images=' + series['totalInstances'];
                	cxtContent += '&modality=' + series['modality'] + '" onclick="triggerContext(jQuery(this));">' + seriesDesc + '</a></li>';
                }
			}
			cxtContent+='</ul>';
		}
		var div = document.createElement("div");
		div.innerHTML = cxtContent;
		document.body.appendChild(div);
		// jQuery("#canvasLayer2").css('cursor','pointer');
		jQuery("#canvasLayer2").contextMenu({menu: 'contextmenu1'});
	} else {
		// console.log("Context menu else");
		setTimeout("loadContextMenu", 100);
	}
}

function triggerContext(contextItem) {
	window.location.href = contextItem.attr('link');
}

function getCurrentImage() {	
	if(window.parent.pat.serverURL.indexOf('wado')>0 && modifiedWC!=undefined && modifiedWW!=undefined && (modifiedWC!=windowCenter || modifiedWW!=windowWidth) && !window.parent.seriesImgsLoadedAgain) {
		return jQuery("#wltmpImg").get(0);
	} else {
		var isMultiframe = jQuery('#totalImages').html().indexOf('Frame')>=0;
		var iNo = jQuery('#totalImages').text().split("/")[0].split(":")[1];
		iNo = iNo.trim();
		if(!isMultiframe) {
			return jQuery('#' + (seriesUid + "_" + iNo).replace(/\./g,'_'), window.parent.document).get(0);
		} else {
			return jQuery("#" + getParameter(jQuery('#frameSrc').html(),'object').replace(/\./g,'_')+"_"+iNo,window.parent.document).get(0);
		}
	}
}
