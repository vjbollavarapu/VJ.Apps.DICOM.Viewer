
loadLanguages();
function loadLanguages() {
	//getting selected language from cookies 
	var lang = getCookie('language');
	if (typeof lang == 'undefined' || lang.trim() == 'en_GB') {
		$.getScript('js/i18n/Bundle.js', function() {
			loadLabels();
		});
	} else {
		var fileName = 'js/i18n/' + "Bundle_" + lang + ".js";
		$.getScript(fileName, function() {
			loadLabels();
		});
	}
}

function loadLabels() {
    //index.html
	$(document).attr('title', languages['PageTitle']);	
	$('#productName').html(languages['PageTitle'] + "<br><span class='versionSpan' style='font-size:10px; '>" + languages['Version'] + " " + languages['VersionNo'] + "</span> ");
    $('#aboutVersion').html(languages['VersionNo']);
    $('#lblPatientName').html(languages['PatientName']);
    $('#lblPatientID').html(languages['PatientId']);
    $('#lblDOB').html(languages['BirthDate']);
    $('#lblAccessionNumber').html(languages['AccessionNumber']);
    $('#lblStudyDate').html(languages['StudyDate']);
    $('#lblStudyDescription').html(languages['StudyDesc']);
    $('#lblModality').html(languages['Modality']);
    $('#lblInstanceCount').html(languages['InstanceCount']);
    $('#lblSettings').html(languages.Settings);
    $('#lblAbout').html(languages.About);
    $('#lblOviyamAbout').html(languages.OviyamAbout);
    $('#lblVersionInfo').html(languages.VersionInfo);
    $('#lblVersion').html(languages.VersionNoTxt);
    $('#lblBuild').html(languages.BuildNo);
    $('#lblBrowser').html(languages.Browser);
    $('#lblOs').html(languages.Os);
    $('#lblLogout').html(languages.logout);

    //Tools.html
    $('#lblLayout').attr('title', languages['Layout']);
    $('#lblWindowing').attr('title', languages['Windowing']);
    $('#lblZoom').attr('title', languages['Zoom']);
    $('#lblMove').attr('title', languages['Move']);
    $('#lblScoutLine').attr('title', languages['ScoutLine']);
    $('#lblScrollImages').attr('title', languages['ScrollImage']);
    $('#lblSynchronize').attr('title', languages['Synchronize']);
    $('#lblVFlip').attr('title', languages['VFlip']);
    $('#lblHFlip').attr('title', languages['HFlip']);
    $('#lblLRotate').attr('title', languages['LRotate']);
    $('#lblRRotate').attr('title', languages['RRotate']);
    $('#lblReset').attr('title', languages['Reset']);
    $('#lblInvert').attr('title', languages['Invert']);
    $('#lblTextOverlay').attr('title', languages['TextOverlay']);
    $('#lblfullscreen').attr('title', languages['FullScreen']);
    $('#lblMetadata').attr('title', languages['MetaData']);
    $('#lblLines').attr('title', languages['Lines']);
    

    $('#abdomen').text(languages['Abdomen']);
    $('#lung').text(languages['Lung']);
    $('#brain').text(languages['Brain']);
    $('#bone').text(languages['Bone']);
    $('#head').text(languages['Head']);
    $('#defaultWin').text(languages['Default']);

    $('#line').text(languages['Line']);
    $('#rectangle').text(languages['Rectangle']);
    $('#oval').text(languages['Oval']);
    $('#angle').text(languages['Angle']);
    $('#delete').text(languages['Delete']);
    $('#deleteAll').text(languages['DeleteAll']);

    //config.html
    $('#lblServer').html(languages['Server']);
    $('#lblQueryParam').html(languages['QueryParam']);
    $('#lblPreferences').html(languages['Preferences']);

    //server.html
    $('#verifyBtn').html(languages['Verify']);
    $('#addBtn').html(languages['Add']);
    $('#editBtn').html(languages['Edit']);
    $('#deleteBtn').html(languages['Delete']);
    $('#lblDescription').html(languages['Description']);
    $('#lblAETitle').html(languages['AETitle']);
    $('#lblHostName').html(languages['HostName']);
    $('#lblDicomPort').html(languages['Port']);
    $('#lblRetrieve').html(languages['']);
    $('#lblAET').html(languages['AETitle']);
    $('#lblport').html(languages['Port']);
    $('#updateListener').html(languages['Update']);
    $('#lblIoviyamCxt').html(languages['IOviyamCxt']);
    $('#updIoviyamCxt').html(languages['Update']);
    $('#updateOverlay').html(languages['Update']);
    $('#updDownloadStudy').html(languages['Update']);
    $('#lblDownloadStudy').html(languages.downloadImgLbl);
    $('#updPatientNameConfig').html(languages['Update']);
    $('#lblRemoveCaretSymbol').html(languages.removeCaretSymbol);
    $("#panel7Header").html(languages.dwnldHeader);
    $("#panel8Header").html(languages.nameConfigHeader);

    //query param.html
    $('#qpAddBtn').html(languages['Add']);
    $('#qpDeleteBtn').html(languages['Delete']);
    $('#lblFilterName').html(languages['FilterName']);
    $('#lblStudyDateFilter').html(languages['StudyDateFilter']);
    $('#lblStudytimeFilter').html(languages['StudytimeFilter']);
    $('#lblModalityFilter').html(languages['ModalityFilter']);
    $('#lblStudyDescFilter').html(languages['StudyDesc']);
    $('#lblAutoRefresh').html(languages['AutoRefresh']);

    //preference.html
    $('#saveSlider').html(languages['Update']);
    $('#saveTimeout').html(languages['Update']);
    $('#saveTheme').html(languages['Update']);
    $('#saveLanguage').html(languages['Update']);
    $('#viewerPreferences').html(languages['Update']);
    $("[name='lblPreferences']").html(languages['ViewerPreference']);
    $("[name='lblPrefetch']").html(languages['prefetch']);
    $("[name='lblSessTimeout']").html(languages['sessTimeout']);
    $("[name='themeSelect']").text(languages['themeSelect']);
    $("[name='lblCountry']").text(languages['country']);
    $("[name='lblLanguage']").text(languages['language']);
    $("[name='lblLocale']").text(languages['locale']);
    
    //New Search.html
    $("label[for=patId]").text(languages['PatientId']);
    $('[name="patId"]').attr('placeholder', languages['PatientId']);
    $("label[for=patName]").text(languages['PatientName']);
    $('[name="patName"]').attr('placeholder', languages['PatientName']);
    $("label[for=accessionNo]").text(languages['AccessionNumber']);
    $('[name="accessionNo"]').attr('placeholder', languages['AccessionNumber']);
    $("label[for=birthDate]").text(languages['BirthDate']);
    $("label[for=studyDesc]").text(languages['StudyDesc']);
    $('[name="studyDesc"]').attr('placeholder', languages['StudyDesc']);
    $("label[for=referPhysician]").text(languages['ReferPhysician']);
    $('[name="referPhysician"]').attr('placeholder', languages['ReferPhysician']);
    $("[name='lblModality']").text(languages['Modality']);
    $(".bdate").prev().text(languages['BirthDate']);
    $('.bdate').attr('placeholder', languages['dateFormat']);
    $(".fsdate").prev().text(languages['FromStudyDate']);
    $('.fsdate').attr('placeholder', languages['dateFormat']);
    $(".tsdate").prev().text(languages['ToStudyDate']);
    $('.tsdate').attr('placeholder', languages['dateFormat']);
    $(".searchBtn").text(languages['Search']);
    $(".clearBtn").text(languages['Reset']);

    //queryResult.jsp
    $(".patientId").text(languages.PatientId);
    $(".patientName").text(languages.PatientName);
    $(".studyDate").text(languages.StudyDate);
    $(".studyDescp").text(languages.StudyDesc);
    $(".instanceCnt").text(languages.InstanceCount);
    $(".lblReferPhysician").text(languages.ReferPhysician);
    $('.lblModality').text(languages.Modality);
    $('.gender').text(languages.Gender);
}

function getCookie(c_name)
{
    var i, x, y, ARRcookies = document.cookie.split(";");
    for (i = 0; i < ARRcookies.length; i++)
    {
        x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
        y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
        x = x.replace(/^\s+|\s+$/g, "");
        if (x == c_name)
        {
            return unescape(y);
        }
    }
}

function setCookie(c_name, value, exdays)
{
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
    document.cookie = c_name + "=" + c_value;
}