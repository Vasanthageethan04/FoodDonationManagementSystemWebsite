using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FoodDonationAPI.Data;

namespace FoodDonationAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly FoodDonationDbContext _context;

        public NotificationsController(FoodDonationDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            return claim != null ? int.Parse(claim.Value) : 0;
        }

        [HttpGet]
        public async Task<IActionResult> GetNotifications()
        {
            var userId = GetUserId();
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            return Ok(notifications);
        }

        [HttpPatch("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var userId = GetUserId();
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

            if (notification == null) return NotFound();

            notification.IsRead = true;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Notification marked as read." });
        }

        [HttpPatch("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userId = GetUserId();
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToListAsync();

            foreach (var n in notifications)
            {
                n.IsRead = true;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "All notifications marked as read." });
        }
    }
}
