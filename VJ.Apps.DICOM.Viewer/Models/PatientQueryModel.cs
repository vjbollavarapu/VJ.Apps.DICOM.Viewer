namespace VCS.Apps.Dicom.Viewer.Models
{
    public class PatientQueryModel
    {
        public string patientID { get; set; } = null!;

        public string patientName { get; set; } = null!;

        public string dateOfBirth { get; set; } = null!;

        public string studyDate { get; set; } = null!;

        public string studyTime { get; set; } = null!;

        public string studyID { get; set; } = null!;

        public string modality { get; set; } = null!;

        public string accessionNumber { get; set; } = null!;

        public string referringPhysician { get; set; } = null!;

        public string studyDescription { get; set; } = null!;

        public string dcmUrl { get; set; } = null!;

        public string searchDates { get; set; } = null!;
    }
}

/*
package in.raster.oviyam.model;

public class PatientQueryModel {

    private String patientID = "";

    private String patientName = "";

    private String dateOfBirth = "";

    private String studyDate = "";

    private String studyTime = "";

    private String studyID = "";

    private String modality = "";

    private String accessionNumber = "";

    private String referringPhysician = "";

    private String studyDescription = "";

    private String dcmUrl = "";

    private String searchDates = "";

    public String getPatientID() {
        return this.patientID;
    }

    public void setPatientID(String patientID) {
        this.patientID = patientID;
    }

    public String getPatientName() {
        return this.patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public String getDateOfBirth() {
        return this.dateOfBirth;
    }

    public void setDateOfBirth(String dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getStudyDate() {
        return this.studyDate;
    }

    public void setStudyDate(String date) {
        this.studyDate = date;
    }

    public String getStudyTime() {
        return this.studyTime;
    }

    public void setStudyTime(String studyTime) {
        this.studyTime = studyTime;
    }

    public String getStudyID() {
        return this.studyID;
    }

    public void setStudyID(String studyID) {
        this.studyID = studyID;
    }

    public String getModality() {
        return this.modality;
    }

    public void setModality(String modality) {
        this.modality = modality;
    }

    public String getAccessionNumber() {
        return this.accessionNumber;
    }

    public void setAccessionNumber(String accessionNumber) {
        this.accessionNumber = accessionNumber;
    }

    public String getReferringPhysician() {
        return this.referringPhysician;
    }

    public void setReferringPhysician(String referringPhysician) {
        this.referringPhysician = referringPhysician;
    }

    public String getStudyDescription() {
        return this.studyDescription;
    }

    public void setStudyDescription(String studyDescription) {
        this.studyDescription = studyDescription;
    }

    public String getDcmUrl() {
        return this.dcmUrl;
    }

    public void setDcmUrl(String dcmUrl) {
        this.dcmUrl = dcmUrl;
    }

    public String getSearchDates() {
        return this.searchDates;
    }

    public void setSearchDates(String searchDates) {
        this.searchDates = searchDates;
    }
}
*/