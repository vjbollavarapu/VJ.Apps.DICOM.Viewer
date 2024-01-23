var pat = null;
var directLaunch = false;
var seriesImgsLoadedAgain = false;
var loadedStudy = [];

var rulerMap = new Map();
var rectMap = new Map();
var ovalMap = new Map();
var angleMap = new Map();
var probeMap = new Map();
var cobbMap = new Map();

function enableDownload(downloadStudy) {
	loadLanguages();
    $.post("DwnStudyConfig.do", {
        'action': 'READ'
    }, function(data) {
        if (data.trim() == "Yes") {
            downloadStudy.style.display = "block";
        } else {
            downloadStudy.style.display = "none";
        }
    }, 'text');
}

function loadViewerPage() {
    initPage();
    $("#toolbarContainer").load("tools");
}

function getStudyDetails() {
    pat = $.cookies.get('patient');
    var queryString = document.location.search.substring(1);
    var patId = getParameter(queryString, "patientID");
    var studyId = getParameter(queryString, "studyUID");
    var seriesId = getParameter(queryString, "seriesUID");
    var serverName = getParameter(queryString, "serverName");

    $.get("UserConfig.do", {
        'settings': 'windowing',
        'todo': 'READ'
    }, function(data) {
        data = data.trim();
        if (data === 'Yes') {
            sessionStorage["tools"] = "windowing";
        } else {
            sessionStorage["tools"] = "";
        }
    }, 'text');
    
    if (serverName == 'null') {
        serverName = '';
    }
    if (patId == 'null') {
        patId = '';
    }
    if (studyId == 'null') {
        studyId = '';
    }

    if (patId != null && studyId != null && serverName != null) {
    	if(seriesId != 'null') {
			$.post("Series.do", {
				"patientID" : patId,
				"studyUID" : studyId,
				"seriesUID" : seriesId,
				"serverName": serverName
			}, function(data) {				
				pat = data;
				data = JSON.stringify(data);
				sessionStorage.setItem('patient', data);
				loadStudy();
			},"json");
		} else {
			$.post("StudyInfo.do", {
				"patientID": patId,
				"studyUID": studyId,
				"serverName": serverName
			}, function(data) {
				if (data['error'] != null) {
					if (data['error'].trim() == 'Server not found') {
						alert("Server not found!!!");
						return;
					}
				}
				directLaunch = true;
				pat = data;
				data = JSON.stringify(data);
				$.cookies.set('patient',data);
				loadStudy();
			}, "json");
		}
    } else {
    	//check for series selection option.
		if(pat.seriesSelection != null && pat.seriesSelection == 'true') {
            showSeriesSelectionModal();
        } else {
        	loadStudy();
        }
    }
}

function isCompatible() {
    return !!(window.requestFileSystem || window.webkitRequestFileSystem);
}

function saveJpgImages() {
    if (isCompatible()) {
        window.requestFileSystem = window.requestFileSystem ||
            window.webkitRequestFileSystem;
        var secondTR = $('.seriesTable');
        secondTR.find('img').each(function() {
            if (this.complete) {
                saveLocally(this);
            } else {
                this.onload = function() {
                    saveLocally(this);
                };
            }

        });
    }
}

function saveLocally(image) {
    var cvs = document.createElement('canvas');
    var ctx = cvs.getContext("2d");

    var fn = '';
    if (image.src.indexOf('images/pdf.png') >= 0) {
        fn = getParameter($(image).attr('imgSrc'), 'object') + '.pdf';
    } else {
        fn = getParameter(image.src, 'object') + '.jpg';
    }
    cvs.width = image.naturalWidth;
    cvs.height = image.naturalHeight;
    ctx.drawImage(image, 0, 0);

    if (image.src.indexOf('images/pdf.png') >= 0) {
        var imd = cvs.toDataURL('image/pdf');
        var ui8a = convertDataURIToBinary(imd);
        var bb = new Blob([ui8a], {
            type: 'image/pdf'
        });
    } else {
        var imd = cvs.toDataURL('image/jpeg');
        var ui8a = convertDataURIToBinary(imd);
        var bb = new Blob([ui8a], {
            type: 'image/jpeg'
        });
    }

    window.requestFileSystem(window.TEMPORARY, 1024 * 1024, function(fs) {
        fs.root.getFile(fn, {
            create: true
        }, function(fileEntry) {
            // Create a FileWriter object for our FileEntry.
            fileEntry.createWriter(function(fileWriter) {
                fileWriter.onwriteend = function(e) {
                    //console.log(fileEntry.fullPath + ' Write completed.');
                };

                fileWriter.onerror = function(e) {
                    console.log('Write failed: ' + e.toString());
                };

                fileWriter.write(bb); //.getBlob(contentType[extname]));
            }, fileErrorHandler);
        }, fileErrorHandler);
    }, fileErrorHandler);
}

function convertDataURIToBinary(dataURI) {
    var BASE64_MARKER = ';base64,';
    var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
    var base64 = dataURI.substring(base64Index);
    var raw = window.atob(base64);
    var rawLength = raw.length;
    var array = new Uint8Array(new ArrayBuffer(rawLength));

    for (i = 0; i < rawLength; i++) {
        array[i] = raw.charCodeAt(i);
    }
    return array;
}

function loadStudy() {
    // load WestPane content
    var tmpUrl = "westContainer.jsp?patient=" + encodeURIComponent(pat.pat_ID) + "&study=" +
        pat.studyUID + "&patientName=" + encodeURIComponent(pat.pat_Name);
    tmpUrl += "&studyDesc=" + encodeURIComponent(pat.studyDesc) + "&studyDate=" + pat.studyDate +
        "&totalSeries=" + pat.totalSeries + "&dcmURL=" + pat.dicomURL;
    tmpUrl += "&wadoUrl=" + pat.serverURL + "&modality=" + pat.modality;
    tmpUrl += "&contentType=image/" + pat.imgType;

	if(pat.seriesUID!=null) {
		tmpUrl+= "&series=" + pat.seriesUID + "&seriesNo=" + pat.seriesNo + "&seriesDesc=" + pat.seriesDesc + "&modality=" + pat.modality + "&numberOfImages=" + pat.imgsInSeries + "&previewmode=single";
	}
	
    var addedSeries = sessionStorage.getItem('seriesUIDs'); 
    if(addedSeries != null) {
		tmpUrl+= "&seriesIds=" + addedSeries;
	}

    $('#westPane').load(encodeURI(tmpUrl));
    document.title = pat.pat_Name;
}

function loadDownloadModal() {
    if (pat.serverURL == "C-MOVE" || pat.serverURL == "C-GET") {
        $('#title').text("CANNOT INVOKE DOWNLOAD WINDOW");
        $('#errorInfo').text("Files can be downloaded only from the servers having retrieve type as WADO ");
        var downloadSelection = document.getElementById("downloadSelection-content");
        downloadSelection.style.display = "none";
        $("#downloadInfo").removeClass('modal-content').addClass('modal-error');
    } else {
        var errorMsg = document.getElementById("errorMsg");
        errorMsg.style.display = "none";
        $('#title').text("Download JPEG/DICOM files");
        var tempUrl = "downloadSelection.jsp?patient=" + encodeURIComponent(pat.pat_ID) + "&study=" +
            pat.studyUID + "&patientName=" + encodeURIComponent(pat.pat_Name);
        tempUrl += "&studyDesc=" + encodeURIComponent(pat.studyDesc) + "&studyDate=" + pat.studyDate +
            "&totalSeries=" + pat.totalSeries + "&dcmURL=" + pat.dicomURL;
        tempUrl += "&wadoUrl=" + pat.serverURL;
        tempUrl += "&contentType=image/" + pat.imgType; // Image Type - png or Jpeg
        $('#downloadSelection-content').load(encodeURI(tempUrl));
    }

}
/*function getSeries(patId, studyUID) {
	$.post("Series.do", {
		"patientID" : patId,
		"studyUID" : studyUID,
		"dcmURL" : pat.dicomURL
	}, function(data) {
		sessionStorage[studyUID] = JSON.stringify(data);
		firstSeries = data[0]['seriesUID'];
		if(pat.serverURL != 'C-MOVE' && pat.serverURL != 'C-GET') {
			$.each(data, function(i, series) {
				getInstances(patId, studyUID, series['seriesUID']);
			});
		}
	}, "json");
}

function getSeries(patId, studyUID) {

    $.post("Series.do", {
        "patientID": patId,
        "studyUID": studyUID,
        "dcmURL": pat.dicomURL,
        "retrieve": pat.serverURL
    }, function(data) {
        sessionStorage[studyUID] = JSON.stringify(data);
        if (pat.serverURL != "C-MOVE" && pat.serverURL != "C-GET") {
            $.each(data, function(i, series) {
                getInstances(patId, studyUID, series['seriesUID']);
            });
        }
    }, "json");
} */

function getInstances(patId, studyUID, seriesUID) {
    $.post("Instance.do", {
        "patientId": patId,
        "studyUID": studyUID,
        "seriesUID": seriesUID,
        "dcmURL": pat.dicomURL,
        "serverURL": pat.serverURL
    }, function(data) {
        sessionStorage[seriesUID] = JSON.stringify(data);
    }, "json");
}

function getIns(seriesUID) {
    jQuery.ajax({
        url: "Instance.do?patientId=" + pat.pat_ID + "&studyUID=" + pat.studyUID + "&seriesUID=" + seriesUID + "&dcmURL=" + pat.dicomURL + "&serverURL=" + pat.serverURL,
        dataType: 'json',
        cache: false,
        success: function(data) {
            sessionStorage[seriesUID] = JSON.stringify(data);
        },
        error: function(request) {
            console.log('error');
        }
    });
}

function getInstanceDetails(paramData) {
    var instanceWorker = new Worker('js/instance_worker.js');
    instanceWorker.addEventListener('message', function(e) {
        sessionStorage[paramData.seriesUID] = JSON.stringify(JSON.parse(e.data));
        instanceWorker.terminate();
    }, false);

    //send data to worker
    instanceWorker.postMessage(paramData); 
}

function fetchOtherStudies() {
    $.get("UserConfig.do", { 'settings': 'prefetch', 'todo': 'READ' }, function(data) {
        var doFetch = false;
        if (directLaunch) {
            if (data.trim() == 'Yes' && getParameter(document.location.search.substring(1), "patientID") != 'null') {
                doFetch = true;
            }
        } else {
            if (data.trim() == 'Yes' && pat.pat_ID.length > 0) {
                doFetch = true;
            }
        }

        if (doFetch) {
            $.post("otherStudies.do", {
                "patientID": pat.pat_ID,
                "studyUID": pat.studyUID,
                "dcmURL": pat.dicomURL,
                "serverURL":pat.serverURL
            }, function(data) {
                if (data.length > 0) {
                	$("#otherStudiesInfo").html( data.length + (data.length>1 ? " archived studies found." : " archived study found."));
					var res = data.reduce(function (obj, v) {
						obj[v.modality] = (obj[v.modality] || 0) + 1;
						return obj;
					}, {});
					res.ALL = data.length;
					var keys = Object.keys(res);
					var list = '';
					let modalityAvailable = false;
					keys.forEach(key => {
						let i = key + ' - ' + res[key];
						let cssClass = "otherModalities button";
						if (key == pat.modality || (key == 'ALL' && !modalityAvailable)) {
							cssClass += " selectedModality";
							modalityAvailable = true;
						} else {
							cssClass += " unselectedModality";
						}
						i = '<button class="'+cssClass+'" onclick="loadOtherStudies(this);" modality="' 
							+ key + '">' + i + '</button>';
						list += i;
					});
					$('#otherModalities').html(list);
					loadOtherModalityStudies(pat.modality);
                } else {
                    $("#otherStudiesInfo").text("No archived studies found.");
                }
                $("#otherStudies").show();
                $("#otherStudiesInfo").show();
            }, "json");
        }
    }, "text");
}

function loadOther(div1, isRet) {
	var div = div1;
	let img = $(div).children().get(0);
	var childDiv = $(div).next();	
	if($(childDiv).children().length>0) {				
		acc($(div));
	} else {	
		$(div).addClass("loading");
		$(img).remove();
		loadedStudy.push($(div).parent().attr('id'));
		$(childDiv).load($(div).attr('link'));	
		acc($(div));
		$('#otherStudies').removeClass('otherStudies-min').addClass('otherStudies-max');
	}
}

function loadOtherStudies(div) {
	var modality = $(div).attr('modality');
	$('.selectedModality').removeClass('selectedModality').addClass('unselectedModality');
	$(div).addClass('selectedModality').removeClass('unselectedModality');
	loadOtherModalityStudies(modality);
}

function loadOtherModalityStudies(modality) {
	if (pat.pat_ID.length > 0) {
		$.post("otherStudies.do", {
			"patientID": pat.pat_ID,
			"studyUID": pat.studyUID,
			"dcmURL": pat.dicomURL,
			"modality": modality
		}, function (result) {
			if (result.length > 0) {
				$('#otherStudies').children("div").each(function () {
					let divId = $(this).attr('id');
					let mod = divId.substring(0, divId.indexOf('-') - 1).trim();
					let selectedModality = $('.selectedModality').attr('modality');
					if (!loadedStudy.includes(divId)) {
						$(this).remove();
					} else if (selectedModality == mod || selectedModality == 'ALL') {
						$(this).show();
					} else {
						$(this).hide();
					}
				});
	
			$.each(result, function (i, study) {
				var studyID = study['studyUID'].replace(/\./g, '_');
				var id = `${study['modality']} - ${study['dateDesc']} - ${studyID}`;
				var ele = document.getElementById(id);
				if (ele == null && !loadedStudy.includes(ele)) {
					var div1 = `<div id="${id}">`;
					var link = encodeURI("Study.jsp?patient=" + pat.pat_ID + "&patient1=" + pat.pat_ID + "&study=" + study["studyUID"] + "&dcmURL=" + pat.dicomURL 
							+ "&wadoUrl=" + pat.serverURL + "&studyDesc=" + study["studyDesc"] + "&descDisplay=false" 
							+ "&studyDate=" + study["studyDate"] + "&contentType=image/" + pat.imgType);
					var div = "<div style='width:95%;' title='" + study['studyDesc'] + "' id=" + studyID + " class='accordion' link=" + link 
						+ " onclick='loadOther(this,false);'" + " >" + study['modality'] + ' - ' + study['dateDesc'] 
						+ " <img src='images/download.png' style='float: right; position: absolute; right:0px' /> </div>";
					var child = '<div class="scrollable" style="overflow: auto; width:100%; margin-bottom: 2%; max-height: 70%; height: auto;"></div>';
					div1 += `${div} ${child} <\div>`;
					$("#otherStudies").append(div1);
				}
				ele = document.getElementById(id);
				$('#otherStudies').append(ele);
			});
		} else {
			loadOtherModalityStudies('');
		}
		}, "json");
	}
}

/**
 * Function to show the series selection modal.
 */
function showSeriesSelectionModal() {
	var errorMsg = document.getElementById("errorMsg");
	errorMsg.style.display = "none";
	
	var tempUrl = "seriesSelection.jsp?patient=" + encodeURIComponent(pat.pat_ID) + "&study=" +
		pat.studyUID + "&patientName=" + encodeURIComponent(pat.pat_Name);
	tempUrl += "&studyDesc=" + encodeURIComponent(pat.studyDesc) + "&studyDate=" + pat.studyDate +
		"&totalSeries=" + pat.totalSeries + "&dcmURL=" + pat.dicomURL;
	tempUrl += "&wadoUrl=" + pat.serverURL;
	tempUrl += "&contentType=image/" + pat.imgType; // Image Type - png or Jpeg

	$('#seriesSelection-content').load(encodeURI(tempUrl));

    document.getElementById('loadingView').style.display='none';

    var modal = document.getElementById('seriesSelModal');
    modal.style.display = "block";
}

function loadSelectedSeries(comp) {
    var instanceUrl = "instance.jsp?patientId=" + pat.pat_ID + "&study=" + pat.studyUID + "&seriesNo=" + comp.getAttribute('seriesNo') 
        + "&seriesDate=" + comp.getAttribute('seriesDate') + "&seriesDesc=" + comp.getAttribute('seriesDesc') + "&modality=" + comp.getAttribute('modality') 
        + "&numberOfImages=" + comp.getAttribute('numberOfImages') + "&series=" + comp.getAttribute('seriesId') + "&dcmURL=" + pat.dicomURL 
        + "&wadoUrl=" + pat.serverURL + "&previewmode=viewer"
        + "&contentType=image/" + pat.imgType;   
    
    $(comp).load(encodeURI(instanceUrl));
    $(comp).removeClass('not-selected-btn');
    $(comp).closest('tr').prev().css('display','none');
}
