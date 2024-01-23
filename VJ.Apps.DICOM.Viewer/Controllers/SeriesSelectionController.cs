using Microsoft.AspNetCore.Mvc;

namespace VCS.Apps.Dicom.Viewer.Controllers
{
    public class SeriesSelectionController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
