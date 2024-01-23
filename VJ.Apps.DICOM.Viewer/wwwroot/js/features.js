var syncEnabled = true;
var displayScout = false;
var mouseLocX;
var mouseLocY;
var mousePressed;
var loopSpeed = 500;

var imageCanvas = null,pixelBuffer = null, lookupObj = null, pixelData = null, state = null, tmpCanvas = null, numPixels = 0;
var windowCenter,windowWidth,wlDisplay,modifiedWC,modifiedWW;
var wlApplied = false;

String.prototype.replaceAll = function(pcFrom, pcTo){
    var i = this.indexOf(pcFrom);
    var c = this;
    while (i > -1){
        c = c.replace(pcFrom, pcTo);
        i = c.indexOf(pcFrom);
    }
    return c;
}

function createEvent(eventName, obj) {
	var event = document.createEvent('CustomEvent');
	var params = { bubbles: false, cancelable: false, detail: obj };
	event.initCustomEvent(eventName, params.bubbles, params.cancelable, params.detail);
	window.dispatchEvent(event);
}

function getSelectedSeries(currSer, currStudy) {
	var seriesData = JSON.parse(sessionStorage[currStudy]);
    var selectedSeriesData;
    for (var i = 0; i < seriesData.length; i++) {
        selectedSeriesData = seriesData[i];
        if (currSer == selectedSeriesData['seriesUID']) {
            return selectedSeriesData;
        }
    }
}

jQuery(document).mouseup(function(e) {
	createEvent("ToolSelection",{tool:"mouseup"});
});

function hideToolbar() {
	jQuery("#toolbarContainer").css("display","none");
	jQuery("#westPane").css("height","100%");
	jQuery("#tabs_div").css("height","100%");
}

function doLayout() {
	let frameSources;
	try {
        jQuery('#loadingView', window.parent.document).hide();
        jQuery('.toggleOff').removeClass('toggleOff');
        var divElement = document.getElementById('tabs_div');
        jQuery(divElement).children().remove();
        
        var seriesData = JSON.parse(sessionStorage[pat.studyUID]);
		var cnt = 0,divContent='<table width="100%" height="100%" cellspacing="2" cellpadding="0" border="0" >';

		let totalFrames = (rowIndex+1) * (colIndex+1);
        frameSources = [totalFrames];
		
		for(var x=0; x<rowIndex+1;x++) {
			divContent+='<tr>';
			for(var y=0;y<colIndex+1;y++) {
				divContent += '<td><iframe id="frame' + cnt;
				divContent += '" height="100%" width="100%" frameBorder="0" scrolling="yes" ';
				
				if(cnt < seriesData.length) {
					var data = seriesData[cnt];
					while(cnt<seriesData.length && hasOnlyRawData(data['seriesUID'])) {
						cnt+=1;
						data = seriesData[cnt];
					}
					/*if (!sessionStorage[data['seriesUID']]) {
						window.parent.getInstances(pat.pat_ID, pat.studyUID, data['seriesUID']);
					}
           	   		var ser_Info = JSON.parse(sessionStorage[data['seriesUID']]);
           	   		ser_Info = ser_Info[0];*/
           	   		
           	   		if(cnt<seriesData.length) {
           	   			frameSources[cnt] = 'frameContent.html?serverURL=' + pat.serverURL + '&study=' + pat.studyUID + '&series=' + data['seriesUID'] +
           	   			//'&object=' + ser_Info['SopUID'] + '&sopClassUID=' + ser_Info['SopClassUID'] + 
           	   			'&seriesDesc=' + data['seriesDesc'] +
           	   			'&images=' + data['totalInstances'] + '&modality=' + data['modality'] +
           	   			'&contentType=' + pat.imgType + '&instanceNumber=0'; 
           	   		
           	   			divContent += 'style="background:#000;"></iframe></td>';
           	   		} else {
           	   			divContent += ' ' + 'style="background:#000;"></iframe></td>';
           	   		}
           	   		cnt+=1;
				} else {
					divContent += ' ' + 'style="background:#000; visibility: hidden;" src="frameContent.html' + '"></iframe></td>';
					cnt+=1;
				}
			} // End of column iteration
		} // End of row iteration
		divContent += '</table>';
		divElement.innerHTML = divContent;
		
		frameSources.forEach(function(item, index, array) {
            jQuery("#frame"+index, document).prop('src',item);
        });
		
	 } catch (error) {
		 //jQuery('#loadingView', window.parent.document).show();
	     setTimeout("doLayout()", 200);
	 }
}

function doImageTile(currSer) {
    var actFrame = getActiveFrame();
    actFrame = actFrame.contentDocumnet || actFrame.contentWindow.document;
    var src = jQuery('#frameSrc', actFrame).text();
    var seriesUID = "";
    seriesUID = getParameter(src, 'series');
    var studyUID = getParameter(src, 'study');
    if (!seriesUID.indexOf("null") >= 0) {
    data = sessionStorage[seriesUID];
     if (data) {
       	jQuery('#loadingView', window.parent.document).hide();
       	jQuery('.toggleOff').removeClass('toggleOff');
       	var divElement = document.getElementById('tabs_div');
       	jQuery(divElement).children().remove();

       	var seriesData = JSON.parse(sessionStorage[studyUID]);
       	selectedSeriesData = getSelectedSeries(currSer, studyUID);
        var instCount = selectedSeriesData['totalInstances'];

        var cnt = 0,
           	divContent = '<table width="100%" height="100%" cellspacing="2" cellpadding="0" border="0" >';

        var ser_Info = JSON.parse(sessionStorage[currSer]);
        ser_Info = ser_Info[0];
        var multiframe = ser_Info['multiframe'];
		if (multiframe == true) {
           	instCount = ser_Info['numberOfFrames'];
        } else {
           	instCount = selectedSeriesData['totalInstances'];
        }

        for (var x = 0; x < rowIndex + 1; x++) {
           	divContent += '<tr>';
           	for (var y = 0; y < colIndex + 1; y++) {
               	divContent += '<td><iframe id="frame' + cnt;
               	divContent += '" height="100%" width="100%" frameBorder="0" scrolling="yes" ';

               	if (cnt < instCount) {
                   	var data = seriesData[cnt];
                   	while (cnt < instCount && hasOnlyRawData(selectedSeriesData['seriesUID'])) {
                       	cnt += 1;
                       	data = seriesData[cnt];
                   	}

                if (cnt < instCount) {
                       	divContent += 'src="TileContent.html?serverURL=' + pat.serverURL + '&study=' + pat.studyUID + '&series=' + currSer +
                           	'&object=' + ser_Info['SopUID'] + '&sopClassUID=' + ser_Info['SopClassUID'] + '&seriesDesc=' + selectedSeriesData['seriesDesc'] +
                           	'&images=' + selectedSeriesData['totalInstances'] + '&modality=' + selectedSeriesData['modality'] +
                           	'&contentType=' + pat.imgType + '&instanceNumber=';
                       	if (multiframe) {
                           	divContent += '0&numberOfFrames=' + ser_Info['numberOfFrames'] + '&frameNumber=' + cnt;
                       	} else {
                           	divContent += cnt;
                       	}

                       	divContent += '" style="background:#000; visibility: hidden;"></iframe></td>';
                   	} else {
                   		divContent += ' ' + 'style="background:#000" src ="TileContent.html?study=' + pat.studyUID + '"></iframe></td>';
                   	}
                   	cnt += 1;
                } else {
                   	divContent += ' ' + 'style="background:#000"src ="TileContent.html?study=' + pat.studyUID + '"></iframe></td>';
                   	cnt += 1;
                }
            } // End of column iteration		
        } // End of row iteration
        divContent += '</table>';
        divElement.innerHTML = divContent;
        jQuery('#totRow', window.parent.document).text(rowIndex);
        jQuery('#totColumn', window.parent.document).text(colIndex);
     } else {
       	jQuery('#loadingView', window.parent.document).show();
       	setTimeout("doImageTile('" + currSer + "')", 200);
     }
    }
}

function hasOnlyRawData(ser_Uid) {
	return $('#'+ser_Uid.replace(/\./g,'_')+"_table").find('.image').length==0;
}

function showMetaData(queryString) {
	jQuery('#loadingView').show();
	setTimeout(function() {
	    var insUID = getParameter(queryString, 'object');

	    var url = "";
		if(pat.serverURL.indexOf("wado") >=0) {
			url = "Image.do?serverURL=" + pat.serverURL;
	    	url += '&contentType=application/dicom&study=' + pat.studyUID;
	    	url += '&series=' + getParameter(queryString,'series');
	    	url += '&object=' + insUID;
	    	url += '&transferSyntax=1.2.840.10008.1.2';
		} else {
			url = "Wado.do?study=" + pat.studyUID + "&object=" + insUID + "&contentType=application/dicom";
		}

	    var xhr = new XMLHttpRequest();
	    xhr.open('POST', url, true);
	    xhr.responseType = 'blob';

	    xhr.onload = function(e) {
	        if (this.status == 200) {
	            var myBlob = this.response;
	            var reader = new FileReader();
	            reader.onloadend = function(evt) {
	                var dicomParser = new ovm.dicom.DicomParser(evt.target.result);
	                dicomParser.parseAll();

	                // tag list table (without the pixel data)
	                var data = dicomParser.dicomElements;
	                if(data.PixelData!=undefined) {
		                data.PixelData.value = "...";
	                }

	                var node = document.createElement('div');
	                // new table
	                var table = ovm.html.toTable(data);
	                table.className = "tagList";

	                // append new table
	                node.appendChild(table);
	                // display it
	                node.style.display='';

	                // table search form
	                var tagSearchform = document.createElement("form");
	                tagSearchform.setAttribute("class", "filter");
	                var input = document.createElement("input");
	                input.onkeyup = function() {
	                    ovm.html.filterTable(input, table);
	                };

	                var span = document.createElement("span");
	                span.innerHTML = "Search: ";
	                tagSearchform.appendChild(span);
	                tagSearchform.appendChild(input);
	                node.insertBefore(tagSearchform, table);

	                jQuery(node).dialog({
	                    title: 'Meta-data',
	                    modal: true,
	                    height: 500,
	                    width: 700
	                });
	            };

	            reader.readAsBinaryString(myBlob);
	        }
	        jQuery('#loadingView').hide();
	    };
	    xhr.send();
	},1);
}

// To view in fullscreen
function doFullScreen(fullscreenDiv) {
    var fsImg = jQuery(fullscreenDiv).children().get(0);
    var viewContent = document.documentElement;
    
    if(!window.fullScreenApi.isFullScreen()) {
        window.fullScreenApi.requestFullScreen(viewContent);
        fsImg.src = 'images/fullscreen0.png';
    } else {
        window.fullScreenApi.cancelFullScreen(viewContent);
        fsImg.src = 'images/fullscreen1.png';
    }
}

function doInvert(imageCanvas,wlApplied) {
    var iNewWidth = imageCanvas.width;
    var iNewHeight = imageCanvas.height;

    var oCtx = imageCanvas.getContext("2d");
    var dataSrc = oCtx.getImageData(0,0,iNewWidth,iNewHeight);
    var dataDst = oCtx.getImageData(0,0,iNewWidth,iNewHeight);
    var aDataSrc = dataSrc.data;
    var aDataDst = dataDst.data;

    var y = iNewHeight;
    do {
        var iOffsetY = (y-1)*iNewWidth*4;
        var x = iNewWidth;
        do {
            var iOffset = iOffsetY + (x-1)*4;
            if(!wlApplied) {
	            aDataDst[iOffset]   = 255 - aDataSrc[iOffset];
		        aDataDst[iOffset+1] = 255 - aDataSrc[iOffset+1];
		        aDataDst[iOffset+2] = 255 - aDataSrc[iOffset+2];
		        aDataDst[iOffset+3] = aDataSrc[iOffset+3];
	        } else {
	        	aDataDst[iOffset+3] = 255 - aDataSrc[iOffset+3];
	        }
        } while (--x);
    } while (--y);
    oCtx.putImageData(dataDst,0,0);
}

function getActiveFrame() {
    var frames = jQuery(document).find('iframe');

    if(frames.length <= 1) {
        return frames[0];
    } else {
        for(var k=0; k<frames.length; k++) {
            if(jQuery(frames[k]).contents().find('body').css('border-top-color') == 'rgb(255, 138, 0)') {
                return frames[k];
            }
        }
    }
}

function getActiveFrameForStudy(studyUid) {
    var frames = jQuery(document).find('iframe');

    for(var k=0; k<frames.length; k++) {
    	if(pat.studyUID==studyUid) {
    		if(frames.length<=1) {
    			return frames[0];
    		}

		    if(jQuery(frames[k]).contents().find('body').css('border-top-color') == 'rgb(255, 138, 0)') {
		        return frames[k];
		    }
	    } else { // Other study
			if(jQuery(frames[k]).contents().find('#studyId').html()==studyUid) {
				return frames[k];
			}
	    }
    }
    return undefined;
}

function changeLayout(layoutUrl) {
    jQuery('#contentDiv').html('');
    jQuery('#tileDiv').hide();
    jQuery('#contentDiv').load(layoutUrl);
    jQuery('#contentDiv').show();

    jQuery("#contentDiv").mouseleave(function() {
        jQuery(this).hide();
    });
}

function changeImageTile(layoutUrl) {
    jQuery('#tileDiv').html('');
    jQuery('#contentDiv').hide();
    jQuery('#tileDiv').load(layoutUrl);
    jQuery('#tileDiv').show();

    jQuery("#tileDiv").mouseleave(function() {
        jQuery(this).hide();
    });
}

function setSeriesIdentification() {
	var framesCnt = jQuery(document).find('iframe');

	jQuery('.seriesImgsIndex', document).each(function() {
		var children = jQuery(this).children();
		var imgCnt = 0;
		children.each(function() {
			var bgColor = jQuery(this).css('background-color');

			if(bgColor == 'rgb(255, 0, 0)') {
				var imgToggleMode = jQuery(this).parent().next().find('img').attr('src');
				if(imgToggleMode == 'images/three.png') {
					if(imgCnt == 0 || imgCnt == Math.round(children.size()/2)-1 || imgCnt == children.size()-1) {
						jQuery(this).css('background-color', 'rgb(0, 0, 255)');
					} else {
						jQuery(this).css('background-color', !jQuery(this).hasClass('waiting') ? 'rgb(166, 166, 166)' : 'rgb(70, 70, 70)');
					}
				} else if(imgToggleMode == "images/one.png") {
					if(imgCnt==0) {
						jQuery(this).css('background-color', 'rgb(0, 0, 255)');
					} else {
						jQuery(this).css('background-color', !jQuery(this).hasClass('waiting') ? 'rgb(166, 166, 166)' : 'rgb(70, 70, 70)');
					}
				} else {
					jQuery(this).css('background-color', 'rgb(0, 0, 255)');
				}
			}
			imgCnt++;
			});
	});
	for(var x=0;x<framesCnt.size();x++) {
		var contents = jQuery(framesCnt[x]).contents();
		if(contents.find('#serId').html()!=null){
			if(jQuery(contents.find('#multiframe')).css('visibility')!="hidden") {
				var object = getParameter(contents.find('#frameSrc').html(),"object");
				var cont_td = jQuery('#' + object.replace(/\./g,'_'), document);

				jQuery(cont_td.children().get(0)).css('background-color', 'rgb(255,0,0)');
			} else {
				var serUidTmp = contents.find('#serId').html().split('_');
				if (serUidTmp.length == 2) {
					var cont_td = jQuery('#' + serUidTmp[0].replace(/\./g,'_'), document);

					var i = 1;

					cont_td.children().each(function(){
						if(i==serUidTmp[1]) {
							jQuery(this).css('background-color', 'rgb(255,0,0)');
						}
						i++;
						});
				  }
			}
		}
    }
}

function doSyncSeries() {
	 var curr = jQuery('#syncSeries');

	    if(!syncEnabled) {
	        syncEnabled = true;
	        curr.children().get(0).src= 'images/Link.png';
	    } else {
	        syncEnabled = false;
	        curr.children().get(0).src= 'images/unlink.png';
	    }
}

function enableWindowingContext() {
	jQuery('#windowing').enableContextMenu();
}

function disableWindowingContext() {
	jQuery('#windowing').disableContextMenu();
}

function enableMeasureContext() {
	jQuery('#measure').enableContextMenu();
}

function disableMeasureContext() {
	jQuery('#measure').disableContextMenu();
}

function repositionTiles(src) {
	var table = jQuery('#tabs_div').children().get(0);
	var tr = table.rows[0];
	var td = tr.insertCell(jQuery(tr).children().length);
	td.innerHTML = '<td> <iframe height="100%" width="100%" frameBorder=0 scrolling="no" style="visibility: hidden;" src="' + src+ '"></iframe> </td>';
}
