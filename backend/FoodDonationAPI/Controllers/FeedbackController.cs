using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FoodDonationAPI.Data;
using FoodDonationAPI.Models;

namespace FoodDonationAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FeedbackController : ControllerBase
    {
        private readonly FoodDonationDbContext _context;

        public FeedbackController(FoodDonationDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            return claim != null ? int.Parse(claim.Value) : 0;
        }

        [HttpGet]
        public async Task<IActionResult> GetFeedback()
        {
            var feedbacks = await _context.Feedbacks
                .Include(f => f.User)
                .OrderByDescending(f => f.CreatedAt)
                .Select(f => new
                {
                    f.Id,
                    f.Rating,
                    f.Comments,
                    f.CreatedAt,
                    Username = f.User != null ? f.User.Username : "Anonymous"
                })
                .ToListAsync();

            return Ok(feedbacks);
        }

        public class SubmitFeedbackDto
        {
            public int Rating { get; set; } // 1 - 5 stars
            public string Comments { get; set; } = string.Empty;
        }

        [HttpPost]
        public async Task<IActionResult> SubmitFeedback([FromBody] SubmitFeedbackDto dto)
        {
            if (dto.Rating < 1 || dto.Rating > 5)
            {
                return BadRequest(new { message = "Rating must be between 1 and 5 stars." });
            }

            var userId = GetUserId();

            var feedback = new Feedback
            {
                UserId = userId,
                Rating = dto.Rating,
                Comments = dto.Comments,
                CreatedAt = DateTime.UtcNow
            };

            _context.Feedbacks.Add(feedback);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Feedback submitted successfully.", feedback });
        }
    }
}
