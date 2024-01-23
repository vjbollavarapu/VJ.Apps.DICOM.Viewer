namespace VCS.Apps.Dicom.Viewer.Interfaces
{
    public interface IPatientInfo
    {

    }
}


/*
package in.raster.oviyam;

import de.iftm.dcm4che.services.CDimseService;
import de.iftm.dcm4che.services.ConfigProperties;
import de.iftm.dcm4che.services.StorageService;
import in.raster.oviyam.model.PatientQueryModel;
import in.raster.oviyam.model.StudyModel;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Vector;
import org.apache.log4j.Logger;
import org.dcm4che.data.Dataset;
import org.dcm4che.util.DcmURL;

public class PatientInfo {

    private static Logger log = Logger.getLogger(PatientInfo.class);

    public ArrayList<StudyModel> studyList = new ArrayList<>();

    public PatientInfo() {
        this.studyList.clear();
    }

    public void callFindWithQuery(PatientQueryModel patientQueryModel) {
        ConfigProperties cfgProperties;
        try {
            cfgProperties = new ConfigProperties(StorageService.class.getResource("/resources/CDimseService.cfg"));
        } catch (IOException ioe) {
            log.error("Unable to create ConfigProperties instance ", ioe);
            return;
        }
        try {
            String patientId = patientQueryModel.getPatientID();
            if (patientId.length() > 0) {
                cfgProperties.put("key.PatientID", patientId);
            }
            cfgProperties.put("key.PatientName", patientQueryModel.getPatientName() + "*");
            String studyDate = patientQueryModel.getStudyDate();
            if (studyDate.length() > 0) {
                cfgProperties.put("key.StudyDate", studyDate);
            }
            String studyUID = patientQueryModel.getStudyID();
            if (studyUID.length() > 0) {
                cfgProperties.put("key.StudyInstanceUID", studyUID);
            }
            String studyTime = patientQueryModel.getStudyTime();
            if (studyTime.length() > 0) {
                cfgProperties.put("key.StudyTime", studyTime);
            }
            String dateOfBirth = patientQueryModel.getDateOfBirth();
            if (dateOfBirth.length() > 0) {
                cfgProperties.put("key.PatientBirthDate", dateOfBirth);
            }
            String accessionNumber = patientQueryModel.getAccessionNumber();
            if (accessionNumber.length() > 0) {
                cfgProperties.put("key.AccessionNumber", accessionNumber);
            }
            String referringPhysician = patientQueryModel.getReferringPhysician();
            if (referringPhysician.length() > 0) {
                cfgProperties.put("key.ReferringPhysicianName", referringPhysician);
            }
            String studyDescription = patientQueryModel.getStudyDescription();
            if (studyDescription.length() > 0) {
                cfgProperties.put("key.StudyDescription", studyDescription);
            }
            String modality = patientQueryModel.getModality().toUpperCase();
            if (!modality.equalsIgnoreCase("ALL")) {
                cfgProperties.put("key.ModalitiesInStudy", modality);
            }
        } catch (Exception e) {
            log.error("Unable to set key values for query ", e);
            return;
        }
        doQuery(cfgProperties, patientQueryModel.getDcmUrl());
    }

    private void doQuery(ConfigProperties cfgProperties, String dcmUrl) {
        Vector<Dataset> dsVector;
        CDimseService cDimseService;
        DcmURL url = new DcmURL(dcmUrl);
        try {
            cDimseService = new CDimseService(cfgProperties, url);
        } catch (ParseException pe) {
            log.error("Unable to create CDimseService instance ", pe);
            return;
        }
        try {
            boolean isOpen = cDimseService.aASSOCIATE();
            if (!isOpen) {
                return;
            }
        } catch (IOException e) {
            log.error("Error while opening association ", e);
            return;
        } catch (GeneralSecurityException gse) {
            log.error("Error while opeing association ", gse);
            return;
        }
        try {
            dsVector = cDimseService.cFIND();
        } catch (Exception e) {
            log.error("Error while calling cFIND() ", e);
            return;
        }
        for (int dsCount = 0; dsCount < dsVector.size(); dsCount++) {
            try {
                Dataset dataSet = dsVector.elementAt(dsCount);
                StudyModel studyModel = new StudyModel(dataSet);
                this.studyList.add(studyModel);
            } catch (Exception e) {
                log.error("Error while adding Dataset in studyList ", e);
            }
        }
        try {
            cDimseService.aRELEASE(true);
        } catch (IOException e) {
            log.equals(e.getMessage());
        } catch (InterruptedException ie) {
            log.error(ie.getMessage());
        }
    }

    public ArrayList<StudyModel> getStudyList() {
        return this.studyList;
    }
}
*/