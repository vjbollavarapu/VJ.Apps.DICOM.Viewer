using Microsoft.AspNetCore.Mvc;

namespace VCS.Apps.Dicom.Viewer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudyInfoController : ControllerBase
    {
    }
}


/*
package in.raster.oviyam.servlet;

import in.raster.oviyam.PatientInfo;
import in.raster.oviyam.model.PatientQueryModel;
import in.raster.oviyam.model.StudyModel;
import in.raster.oviyam.xml.handler.LanguageHandler;
import in.raster.oviyam.xml.handler.ListenerHandler;
import in.raster.oviyam.xml.handler.ServerHandler;
import in.raster.oviyam.xml.handler.XMLFileHandler;
import in.raster.oviyam.xml.model.Server;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.log4j.Logger;
import org.json.JSONException;
import org.json.JSONObject;

public class StudyInfoServlet extends HttpServlet {

    private static Logger log = Logger.getLogger(StudyInfoServlet.class);

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String patID = request.getParameter("patientID");
        String studyUID = request.getParameter("studyUID");
        String serverName = request.getParameter("serverName");
        if (LanguageHandler.source == null) {
            File tempDir = (File) getServletContext().getAttribute("javax.servlet.context.tempdir");
            LanguageHandler.source = new File((new XMLFileHandler()).getXMLFilePath(tempDir.getParent()));
        }
        ServerHandler sh = new ServerHandler();
        Server server = null;
        if (serverName != null && !serverName.isEmpty()) {
            server = sh.findServerByName(serverName);
        } else {
            server = sh.findServerByName("");
        }
        PrintWriter out = response.getWriter();
        JSONObject jsonObj = new JSONObject();
        if (server != null) {
            ListenerHandler lh = new ListenerHandler();
            String callingAET = lh.getListener().getAetitle();
            if (callingAET == null || callingAET.length() <= 0) {
                callingAET = "OVIYAM2";
            }
            String dcmURL = "DICOM://" + server.getAetitle() + ":" + callingAET + "@" + server.getHostname() + ":" + server.getPort();
            String serverURL = null;
            if (server.getRetrieve().equals("WADO")) {
                serverURL = "http://" + server.getHostname() + ":" + server.getWadoport() + "/" + server.getWadocontext();
            } else {
                serverURL = server.getRetrieve();
            }
            String imageType = "jpeg";
            if (server.getImageType() != null) {
                imageType = server.getImageType().toLowerCase();
            }
            PatientInfo patientInfo = new PatientInfo();
            PatientQueryModel patientQueryModel = new PatientQueryModel();
            patientQueryModel.setPatientID(patID);
            patientQueryModel.setStudyID(studyUID);
            patientQueryModel.setDcmUrl(dcmURL);
            patientInfo.callFindWithQuery(patientQueryModel);
            ArrayList<StudyModel> studyList = patientInfo.getStudyList();
            try {
                for (StudyModel sm : studyList) {
                    jsonObj.put("pat_ID", sm.getPatientID());
                    jsonObj.put("pat_Name", sm.getPatientName());
                    jsonObj.put("pat_Birthdate", sm.getPatientBirthDate());
                    jsonObj.put("accNumber", sm.getAccessionNumber());
                    jsonObj.put("studyDate", sm.getStudyDate());
                    jsonObj.put("studyDesc", sm.getStudyDescription());
                    jsonObj.put("modality", sm.getModalitiesInStudy());
                    jsonObj.put("totalIns", sm.getStudyRelatedInstances());
                    jsonObj.put("studyUID", sm.getStudyInstanceUID());
                    jsonObj.put("refPhysician", sm.getPhysicianName());
                    jsonObj.put("totalSeries", sm.getStudyRelatedSeries());
                    jsonObj.put("pat_gender", sm.getPatientGender());
                    jsonObj.put("serverURL", serverURL);
                    jsonObj.put("dicomURL", dcmURL);
                    jsonObj.put("imgType", imageType);
                    jsonObj.put("bgColor", "rgb(0, 0, 0)");
                }
            } catch (Exception e) {
                log.error(e.toString());
            }
        } else {
            try {
                jsonObj.put("error", "Server not found");
            } catch (JSONException ex) {
                log.error(ex);
            }
        }
        out.print(jsonObj);
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doGet(request, response);
    }
}
*/