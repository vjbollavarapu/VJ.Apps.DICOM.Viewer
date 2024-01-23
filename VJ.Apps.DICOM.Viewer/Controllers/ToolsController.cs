using Microsoft.AspNetCore.Mvc;

namespace VCS.Apps.Dicom.Viewer.Controllers
{
    public class ToolsController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
