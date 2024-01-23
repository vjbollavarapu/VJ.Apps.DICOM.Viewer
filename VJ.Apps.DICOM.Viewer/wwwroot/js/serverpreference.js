$(document).ready(function() {
	$('button').button();
	$('#preferencetabs').tabs();
    $("#updateListener").click(function() {
        $.ajax({
            url: 'Listener.do',
            type: 'POST',
            data: {
                'aetitle': $('#listener_ae').val(),
                'port': $('#listener_port').val(),
                'action': 'Update'
            },
            dataType: 'text',
            success: function(msg1) {
                if (msg1.trim() == 'success') {
                	displayMsg('success', languages.listenerUpdateSuccess);
                } else {
                	displayMsg('error', languages.listenerUpdateError);
                }
            }
        });
    });

    $('#updIoviyamCxt').click(function() {
        var iOvmCxt = $('#ioviyamCxt').val().trim();
        if (iOvmCxt.length == 0) {
        	displayMsg("error", languages.iOviyamEmpty);
            return;
        }
        if (iOvmCxt.indexOf("\/") != 0) {
        	displayMsg("error", languages.iOviyamInValid);
            return;
        }

        $.ajax({
            url: 'do/IOviyamContext',
            type: 'POST',
            data: {
                'iOviyamCxt': $('#ioviyamCxt').val(),
                'action': 'Update'
            },
            dataType: 'text',
            success: function(msg2) {
                if (msg2.trim() == 'success') {
                	displayMsg('success', languages.iOviyamUpdateSuccess);
                } else {
                	displayMsg('error', languages.iOviyamUpdateError);
                }
            }
        });
    });

    $('#updDownloadStudy').click(function() {
        var dwnStudy = $('#downloadStudy').val();
        if (dwnStudy == 'none') {
            dwnStudy = 'no';
        }
        $.ajax({
            url: 'DwnStudyConfig.do',
            type: 'POST',
            data: {
                'downloadStudy': dwnStudy,
                'action': 'update'
            },
            dataType: 'text',
            success: function(msg3) {
                if (msg3.trim() == 'success') {
                	displayMsg('success', languages.downloadUpdateSuccess);
                } else {
                	displayMsg('error', languages.downloadUpdateError);
                }
            }
        });
    });

    $.get("DwnStudyConfig.do", {
        'action': 'READ'
    }, function(data) {
        data = data.trim();
        $('#downloadStudy').val(data);
    }, 'text');

    $('#modalityList').keypress(function(e) {
        if (!((e.keyCode > 64 && e.keyCode < 91) || (e.keyCode > 96 && e.keyCode < 123) || e.keyCode == 47)) {
            e.preventDefault();
        }
    });

    $('#modalityList').keyup(function(e) {
        $(this).val($(this).val().toUpperCase());
    });

    $.get("overlayText.do", {
        'action': 'READ'
    }, function(data) {
        overlayText = data;
        if(overlayText.result =='Success'){
        	displayOverlay(overlayText);
        }else{
        	displayMsg("error", languages.overlayReadError);
        }
        
    }, 'json');

    $('#resetOverlay').click(function() {
        $.get("overlayText.do", {
            'action': 'RESET'
        }, function(data) {
            overlayText = data;
            if(overlayText.result =='Success'){
            	displayOverlay(overlayText);
            	displayMsg('success', languages.overlayUpdateSuccess);
            }else{
            	displayMsg("error", languages.overlayResetError);
            }

        }, 'json');
    });

    $('#modalityDropDown').change(function() {
        if ($(this).val() == 'ALL') {
            $('#showImgLatrModality').hide();
        } else {
            $('#showImgLatrModality').show();
            $('#modalityList').val("");
            if ($(this).val() == 'SELECTED') {
                $('#modalityList').attr('placeholder', 'MG/DX');
            } else {
                $('#modalityList').attr('placeholder', '');
            }
        }
    });

    $('#imgLaterality').change(function() {
        if ($(this).attr('checked')) {
            $('#showImgLatr').show();
            $('#modalityDropDown').val('ALL');
            $('#showImgLatrModality').hide();
        } else {
            $('#showImgLatr').hide();
            $('#showImgLatrModality').hide();
            if ($(this).val() == 'SELECTED') {
                $('#modalityList').attr('placeholder', 'MG/DX');
            } else {
                $('#modalityList').attr('placeholder', '');
            }
        }
    });

    $('#updateOverlay').click(function() {
        var display = '';
        var allModality = '';
        var modalities = '';

        display = ($('#imgLaterality').attr('checked')) ? 'Yes' : 'No';

        if (display == 'Yes') {
            allModality = $('#modalityDropDown').val();
            if (allModality != 'ALL') {
                modalities = $('#modalityList').val().trim();
                if (modalities.length < 2) {
                    displayMsg('error', languages.modalityValidError);
                    return;
                }
            }
        }
        
        var textOverlay = {
            'imageLaterality': {
               	'display': display,
               	'modality': allModality,
               	'modalityList': modalities
            }
        };

        $.ajax({
            url: 'overlayText.do',
            type: 'POST',
            data: {
                'action': 'UPDATE',
                'data': JSON.stringify(textOverlay)
            },
            dataType: 'json',
            success: function(data) {
                if (data.result.indexOf('Success') >= 0) {
                    displayMsg('success', languages.overlayUpdateSuccess);
                } else {
                    displayMsg('error', languages.overlayUpdateError);
                }
            }
        });
    });
    
    $('#updPatientNameConfig').click(function () {
        var removeCaretSymbol = $('#removeCaretSymbol').val();
        if (removeCaretSymbol == 'none') {
        	removeCaretSymbol = 'no';
        }
        var nameDisplayConfig = {
        		'removeCaretSymbol' : removeCaretSymbol
        };
        $.ajax({
            url: 'nameDisplayConfig.do',
            type: 'POST',
            data: {
                'data': JSON.stringify(nameDisplayConfig),
                'action': 'UPDATE'
            },
            dataType: 'text',
            success: function (msg3) {
            	msg3 = JSON.parse(msg3);
                if (msg3.result.trim() == 'success') {
                    displayMsg('success', languages.nameConfigUpdateSuccess);
                } else {
                    displayMsg('error', languages.nameConfigUpdateError);
                }
            }
        });
    });

    $.get("nameDisplayConfig.do", {
        'action': 'READ'
    }, function (data) {
    	 data = JSON.parse(data.trim());
        $('#removeCaretSymbol').val(data.removeCaretSymbol);
    }, 'text');
});

function displayOverlay(overlayText) {
	var imgLaterality = overlayText.imageLaterality;
	
    if (imgLaterality.display.trim() == 'Yes') {
        $('#imgLaterality').prop('checked', true);
        $('#showImgLatr').show();
        $('#modalityDropDown').val(imgLaterality.modality.trim());
        if (imgLaterality.modality.trim() == 'ALL') {
            $('#showImgLatrModality').hide();
        } else {
            $('#showImgLatrModality').show();
            $('#modalityList').val(imgLaterality.modalityList.trim());
        }
    } else {
        $('#imgLaterality').prop('checked', false);
        $('#showImgLatr').hide();
        $('#showImgLatrModality').hide();
    }
}

function displayMsg(type, msg) {
    $.ambiance({
        message: msg,
        type: type
    });
}