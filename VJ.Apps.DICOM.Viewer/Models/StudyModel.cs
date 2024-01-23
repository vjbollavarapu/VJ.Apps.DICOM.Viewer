using System.Globalization;
using System;

namespace VCS.Apps.Dicom.Viewer.Models
{
    public class StudyModel
    {
        public long serialVersionUID { get; set; } = 1L;
        public string patientID { get; set; } = null!;
        public string patientName { get; set; } = null!;
        public string patientGender { get; set; } = null!;
        public string patientBirthDate { get; set; } = null!;
        public string physicianName { get; set; } = null!;
        public string studyDate { get; set; } = null!;
        public DateTime parsedDate { get; set; }
        public string studyTime { get; set; } = null!;
        public string studyDescription { get; set; } = null!;
        public string modalitiesInStudy { get; set; } = null!;
        public string studyRelatedInstances { get; set; } = null!;
        public string accessionNumber { get; set; } = null!;
        public string studyInstanceUID { get; set; } = null!;
        public string studyRelatedSeries { get; set; } = null!;
        public string instanceAvailability { get; set; } = null!;
        public bool removeCaretSymbol { get; set; }
    }
}

/*
package in.raster.oviyam.model;

import in.raster.oviyam.xml.handler.NameDisplayConfigHandler;
import in.raster.oviyam.xml.model.NameDisplayConfig;
import java.io.Serializable;
import java.util.Calendar;
import org.dcm4che.data.Dataset;

public class StudyModel implements Serializable {

    private static final long serialVersionUID = 1L;

    private String patientID;

    private String patientName;

    private String patientGender;

    private String patientBirthDate;

    private String physicianName;

    private String studyDate;

    private Calendar parsedDate = null;

    private String studyTime;

    private String studyDescription;

    private String modalitiesInStudy;

    private String studyRelatedInstances;

    private String accessionNumber;

    private String studyInstanceUID;

    private String studyRelatedSeries;

    private String instanceAvailability;

    private boolean removeCaretSymbol;

    public StudyModel() {
    }

    public StudyModel(Dataset ds) {
        NameDisplayConfigHandler handler = new NameDisplayConfigHandler();
        NameDisplayConfig dispConfig = handler.getNameDisplayConfig();
        this.removeCaretSymbol = dispConfig.getRemoveCaretSymbol().equalsIgnoreCase("YES");
        setPatientID(ds.getString(1048608));
        setPatientName(ds.getString(1048592));
        setPatientGender(ds.getString(1048640));
        setPatientBirthDate(ds.getString(1048624));
        setPhysicianName(ds.getString(524432));
        setStudyDate(ds.getString(524320));
        setParsedDate();
        setStudyTime(ds.getString(524336));
        setStudyDescription(ds.getString(528432));
        setModalitiesInStudy(ds.getStrings(524385));
        setStudyRelatedInstances(ds.getString(2101768));
        setAccessionNumber(ds.getString(524368));
        setStudyInstanceUID(ds.getString(2097165));
        setStudyRelatedSeries(ds.getString(2101766));
        setInstanceAvailability(ds.getString(524374));
    }

    public void setAccessionNumber(String accessionNumber) {
        this.accessionNumber = accessionNumber;
    }

    public String getAccessionNumber() {
        return (this.accessionNumber != null) ? this.accessionNumber : "";
    }

    public void setModalitiesInStudy(String[] modalities) {
        if (modalities != null) {
            for (int i = 0; i < modalities.length; i++) {
                if (i == 0) {
                    this.modalitiesInStudy = modalities[i];
                } else {
                    this.modalitiesInStudy += "\\" + modalities[i];
                }
            }
        }
    }

    public String getModalitiesInStudy() {
        return this.modalitiesInStudy;
    }

    public void setPatientBirthDate(String birthDate) {
        this.patientBirthDate = birthDate;
    }

    public String getPatientBirthDate() {
        return (this.patientBirthDate != null) ? this.patientBirthDate : "";
    }

    public void setPatientGender(String gender) {
        this.patientGender = gender;
    }

    public String getPatientGender() {
        return (this.patientGender != null) ? this.patientGender : "-";
    }

    public void setPatientID(String patID) {
        this.patientID = patID;
    }

    public String getPatientID() {
        return this.patientID;
    }

    public void setPatientName(String patName) {
        this.patientName = patName;
    }

    public String getPatientName() {
        if (!this.removeCaretSymbol) {
            return (this.patientName != null) ? this.patientName : "";
        }
        return (this.patientName != null) ? this.patientName.replace("^", " ") : "";
    }

    public void setPhysicianName(String physicianName) {
        this.physicianName = physicianName;
    }

    public String getPhysicianName() {
        if (!this.removeCaretSymbol) {
            return (this.physicianName != null) ? this.physicianName : "";
        }
        return (this.physicianName != null) ? this.physicianName.replace("^", " ") : "";
    }

    public void setStudyDate(String studyDate) {
        this.studyDate = studyDate;
    }

    public String getStudyDate() {
        return (this.studyDate != null) ? this.studyDate : "[No study date]";
    }

    public void setStudyDescription(String studyDescription) {
        this.studyDescription = studyDescription;
    }

    public String getStudyDescription() {
        return (this.studyDescription != null) ? this.studyDescription.replace("^", " ") : "[No study description]";
    }

    public void setStudyInstanceUID(String studyInstanceUID) {
        this.studyInstanceUID = studyInstanceUID;
    }

    public String getStudyInstanceUID() {
        return this.studyInstanceUID;
    }

    public void setStudyRelatedInstances(String relatedInstances) {
        this.studyRelatedInstances = relatedInstances;
    }

    public String getStudyRelatedInstances() {
        return (this.studyRelatedInstances != null) ? this.studyRelatedInstances : "";
    }

    public void setStudyRelatedSeries(String relatedSeries) {
        this.studyRelatedSeries = relatedSeries;
    }

    public String getStudyRelatedSeries() {
        return (this.studyRelatedSeries != null) ? this.studyRelatedSeries : "";
    }

    public void setStudyTime(String studyTime) {
        this.studyTime = studyTime;
    }

    public String getStudyTime() {
        return (this.studyTime != null) ? this.studyTime : "";
    }

    public void setParsedDate() {
        this.parsedDate = Calendar.getInstance();
        if (this.studyDate != null && !this.studyDate.contains("[No study date]")) {
            try {
                String studyDate = this.studyDate.replace("-", "").replace(":", "").replace(" ", "").replace(".", "");
                this.parsedDate.set(Integer.parseInt(studyDate.substring(0, 4)), Integer.parseInt(studyDate.substring(4, 6)) - 1, Integer.parseInt(studyDate.substring(6, 8)));
            } catch (Exception ex) {
                ex.printStackTrace();
                this.parsedDate = null;
            }
        } else {
            this.parsedDate = null;
        }
    }

    public Calendar getParsedDate() {
        return this.parsedDate;
    }

    public String getInstanceAvailability() {
        return (this.instanceAvailability != null) ? this.instanceAvailability : "";
    }

    public void setInstanceAvailability(String instanceAvailability) {
        this.instanceAvailability = instanceAvailability;
    }

    public boolean equals(Object obj) {
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }
        StudyModel other = (StudyModel) obj;
        if ((this.studyInstanceUID == null) ? (other.studyInstanceUID != null) : !this.studyInstanceUID.equals(other.studyInstanceUID)) {
            return false;
        }
        return true;
    }
}
*/
