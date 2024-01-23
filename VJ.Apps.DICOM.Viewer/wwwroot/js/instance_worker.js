self.onmessage = function(e) {
    getInstancesDetails(e.data);
}

function getInstancesDetails(paramJson) {
    var paramData = "?patientId=" + paramJson.patientId + "&studyUID=" + paramJson.studyUID + "&seriesUID=" + paramJson.seriesUID;
    paramData += "&dcmURL=" + paramJson.dcmURL + "&serverURL=" + paramJson.serverURL;

    var xhr = new XMLHttpRequest();
    xhr.open("GET", "../Instance.do" + paramData, true);
    xhr.onload = function() {
        self.postMessage(xhr.responseText);
    };
    xhr.send();
}
