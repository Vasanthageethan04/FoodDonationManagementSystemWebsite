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
    public class RequestsController : ControllerBase
    {
        private readonly FoodDonationDbContext _context;

        public RequestsController(FoodDonationDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            return claim != null ? int.Parse(claim.Value) : 0;
        }

        [HttpGet]
        public async Task<IActionResult> GetRequests()
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = GetUserId();

            var query = _context.DonationRequests
                .Include(r => r.FoodDonation)
                    .ThenInclude(f => f!.Category)
                .Include(r => r.NGO)
                    .ThenInclude(n => n!.User)
                .AsQueryable();

            if (role == "NGO")
            {
                var ngo = await _context.NGOs.FirstOrDefaultAsync(n => n.UserId == userId);
                if (ngo == null) return Unauthorized(new { message = "NGO profile not found." });
                query = query.Where(r => r.NGOId == ngo.Id);
            }
            // Admin sees all

            var requests = await query
                .OrderByDescending(r => r.RequestDate)
                .Select(r => new
                {
                    r.Id,
                    r.FoodDonationId,
                    FoodName = r.FoodDonation != null ? r.FoodDonation.FoodName : "Unknown",
                    Quantity = r.FoodDonation != null ? r.FoodDonation.Quantity : "",
                    MealsCount = r.FoodDonation != null ? r.FoodDonation.MealsCount : 0,
                    PickupAddress = r.FoodDonation != null ? r.FoodDonation.PickupAddress : "",
                    fStatus = r.FoodDonation != null ? r.FoodDonation.Status : "",
                    r.RequestStatus,
                    r.Message,
                    r.RequestDate,
                    NgoName = r.NGO != null ? r.NGO.OrgName : "Unknown NGO"
                })
                .ToListAsync();

            return Ok(requests);
        }

        public class CreateRequestDto
        {
            public int FoodDonationId { get; set; }
            public string Message { get; set; } = string.Empty;
        }

        [HttpPost]
        [Authorize(Roles = "NGO")]
        public async Task<IActionResult> CreateRequest([FromBody] CreateRequestDto dto)
        {
            var userId = GetUserId();
            var ngo = await _context.NGOs.FirstOrDefaultAsync(n => n.UserId == userId);
            if (ngo == null)
            {
                return Unauthorized(new { message = "NGO profile not found." });
            }

            var donation = await _context.FoodDonations
                .Include(d => d.Donor)
                    .ThenInclude(d => d!.User)
                .FirstOrDefaultAsync(d => d.Id == dto.FoodDonationId);

            if (donation == null)
            {
                return NotFound(new { message = "Food donation not found." });
            }

            if (donation.Status != "Approved")
            {
                return BadRequest(new { message = "This food donation is not available for request." });
            }

            // Create donation request
            var request = new DonationRequest
            {
                FoodDonationId = donation.Id,
                NGOId = ngo.Id,
                RequestStatus = "Approved", // Auto-approved for this claimed food
                Message = dto.Message,
                RequestDate = DateTime.UtcNow
            };

            _context.DonationRequests.Add(request);

            // Update donation status to Assigned
            donation.Status = "Assigned";

            // Automatically create a Delivery entry for Volunteers to claim
            var delivery = new Delivery
            {
                DonationRequestId = request.Id,
                DeliveryStatus = "Assigned", // Waiting for volunteer to accept
                AssignedAt = DateTime.UtcNow,
                PickupRouteUrl = "Delhi Central",
                DeliveryRouteUrl = "NGO Center",
                EstimatedTime = "25 mins"
            };
            _context.Deliveries.Add(delivery);

            // Notify Donor
            if (donation.Donor?.User != null)
            {
                _context.Notifications.Add(new Notification
                {
                    UserId = donation.Donor.User.Id,
                    Title = "Food Claimed by NGO",
                    Message = $"Your donation '{donation.FoodName}' has been claimed by {ngo.OrgName}. A volunteer will be assigned shortly.",
                    CreatedAt = DateTime.UtcNow
                });
            }

            // Notify Volunteers
            var volunteers = await _context.Volunteers.Include(v => v.User).Where(v => v.IsAvailable).ToListAsync();
            foreach (var vol in volunteers)
            {
                if (vol.User != null)
                {
                    _context.Notifications.Add(new Notification
                    {
                        UserId = vol.User.Id,
                        Title = "New Delivery Available",
                        Message = $"A food package is ready for pickup in {donation.PickupAddress}. Accept the delivery now!",
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }

            // Log activity
            _context.AuditLogs.Add(new AuditLog
            {
                UserId = userId,
                Action = "Request Food",
                Details = $"NGO claimed donation ID {donation.Id}. Delivery entry ID {delivery.Id} created."
            });

            await _context.SaveChangesAsync();

            return Ok(new { message = "Food requested successfully. A volunteer will pick it up.", requestId = request.Id });
        }

        [HttpPost("{id}/cancel")]
        [Authorize(Roles = "NGO")]
        public async Task<IActionResult> CancelRequest(int id)
        {
            var userId = GetUserId();
            var ngo = await _context.NGOs.FirstOrDefaultAsync(n => n.UserId == userId);
            if (ngo == null) return Unauthorized(new { message = "NGO profile not found." });

            var request = await _context.DonationRequests
                .Include(r => r.FoodDonation)
                .FirstOrDefaultAsync(r => r.Id == id && r.NGOId == ngo.Id);

            if (request == null)
            {
                return NotFound(new { message = "Request not found." });
            }

            request.RequestStatus = "Cancelled";

            // If the food donation is assigned, make it available again
            if (request.FoodDonation != null && request.FoodDonation.Status == "Assigned")
            {
                request.FoodDonation.Status = "Approved";
            }

            // Remove associated pending deliveries
            var delivery = await _context.Deliveries.FirstOrDefaultAsync(d => d.DonationRequestId == request.Id);
            if (delivery != null && (delivery.DeliveryStatus == "Assigned" || delivery.DeliveryStatus == "Accepted"))
            {
                _context.Deliveries.Remove(delivery);
            }

            _context.AuditLogs.Add(new AuditLog
            {
                UserId = userId,
                Action = "Cancel Request",
                Details = $"NGO cancelled request ID {id} for donation ID {request.FoodDonationId}"
            });

            await _context.SaveChangesAsync();
            return Ok(new { message = "Request cancelled successfully. Food is available for others." });
        }
    }
}
