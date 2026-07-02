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
    public class DeliveriesController : ControllerBase
    {
        private readonly FoodDonationDbContext _context;

        public DeliveriesController(FoodDonationDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            return claim != null ? int.Parse(claim.Value) : 0;
        }

        [HttpGet]
        public async Task<IActionResult> GetDeliveries([FromQuery] string? status)
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = GetUserId();

            var query = _context.Deliveries
                .Include(d => d.DonationRequest)
                    .ThenInclude(r => r!.FoodDonation)
                        .ThenInclude(f => f!.Category)
                .Include(d => d.DonationRequest)
                    .ThenInclude(r => r!.NGO)
                        .ThenInclude(n => n!.User)
                .Include(d => d.Volunteer)
                    .ThenInclude(v => v!.User)
                .AsQueryable();

            if (role == "Volunteer")
            {
                var volunteer = await _context.Volunteers.FirstOrDefaultAsync(v => v.UserId == userId);
                if (volunteer == null) return Unauthorized(new { message = "Volunteer profile not found." });

                // Return deliveries either unassigned ("Assigned" status with no volunteer) OR assigned to this volunteer
                query = query.Where(d => d.VolunteerId == volunteer.Id || d.VolunteerId == null);
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(d => d.DeliveryStatus == status);
            }

            var deliveries = await query
                .OrderByDescending(d => d.AssignedAt)
                .Select(d => new
                {
                    d.Id,
                    d.DeliveryStatus,
                    d.AssignedAt,
                    d.PickedUpAt,
                    d.DeliveredAt,
                    d.PickupRouteUrl,
                    d.DeliveryRouteUrl,
                    d.EstimatedTime,
                    VolunteerName = d.Volunteer != null && d.Volunteer.User != null ? d.Volunteer.User.Username : "Unassigned",
                    VolunteerId = d.VolunteerId,
                    FoodName = d.DonationRequest != null && d.DonationRequest.FoodDonation != null ? d.DonationRequest.FoodDonation.FoodName : "Unknown",
                    Quantity = d.DonationRequest != null && d.DonationRequest.FoodDonation != null ? d.DonationRequest.FoodDonation.Quantity : "",
                    MealsCount = d.DonationRequest != null && d.DonationRequest.FoodDonation != null ? d.DonationRequest.FoodDonation.MealsCount : 0,
                    PickupAddress = d.DonationRequest != null && d.DonationRequest.FoodDonation != null ? d.DonationRequest.FoodDonation.PickupAddress : "",
                    PickupContact = d.DonationRequest != null && d.DonationRequest.FoodDonation != null ? d.DonationRequest.FoodDonation.ContactNumber : "",
                    DropAddress = d.DonationRequest != null && d.DonationRequest.NGO != null ? d.DonationRequest.NGO.Address : "",
                    DropContact = d.DonationRequest != null && d.DonationRequest.NGO != null ? d.DonationRequest.NGO.ContactNumber : "",
                    NgoName = d.DonationRequest != null && d.DonationRequest.NGO != null ? d.DonationRequest.NGO.OrgName : "",
                    FoodDonationId = d.DonationRequest != null ? d.DonationRequest.FoodDonationId : 0
                })
                .ToListAsync();

            return Ok(deliveries);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDeliveryById(int id)
        {
            var delivery = await _context.Deliveries
                .Include(d => d.DonationRequest)
                    .ThenInclude(r => r!.FoodDonation)
                        .ThenInclude(f => f!.Category)
                .Include(d => d.DonationRequest)
                    .ThenInclude(r => r!.NGO)
                        .ThenInclude(n => n!.User)
                .Include(d => d.Volunteer)
                    .ThenInclude(v => v!.User)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (delivery == null)
            {
                return NotFound(new { message = "Delivery not found." });
            }

            return Ok(new
            {
                delivery.Id,
                delivery.DeliveryStatus,
                delivery.AssignedAt,
                delivery.PickedUpAt,
                delivery.DeliveredAt,
                delivery.PickupRouteUrl,
                delivery.DeliveryRouteUrl,
                delivery.EstimatedTime,
                VolunteerName = delivery.Volunteer?.User?.Username,
                delivery.VolunteerId,
                FoodName = delivery.DonationRequest?.FoodDonation?.FoodName,
                Quantity = delivery.DonationRequest?.FoodDonation?.Quantity,
                MealsCount = delivery.DonationRequest?.FoodDonation?.MealsCount,
                PickupAddress = delivery.DonationRequest?.FoodDonation?.PickupAddress,
                PickupContact = delivery.DonationRequest?.FoodDonation?.ContactNumber,
                DropAddress = delivery.DonationRequest?.NGO?.Address,
                DropContact = delivery.DonationRequest?.NGO?.ContactNumber,
                NgoName = delivery.DonationRequest?.NGO?.OrgName,
                FoodDonationId = delivery.DonationRequest?.FoodDonationId
            });
        }

        [HttpPost("{id}/accept")]
        [Authorize(Roles = "Volunteer")]
        public async Task<IActionResult> AcceptDelivery(int id)
        {
            var userId = GetUserId();
            var volunteer = await _context.Volunteers.FirstOrDefaultAsync(v => v.UserId == userId);
            if (volunteer == null) return Unauthorized(new { message = "Volunteer profile not found." });

            var delivery = await _context.Deliveries
                .Include(d => d.DonationRequest)
                    .ThenInclude(r => r!.FoodDonation)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (delivery == null)
            {
                return NotFound(new { message = "Delivery not found." });
            }

            if (delivery.VolunteerId != null)
            {
                return BadRequest(new { message = "This delivery has already been claimed by another volunteer." });
            }

            delivery.VolunteerId = volunteer.Id;
            delivery.DeliveryStatus = "Accepted";

            if (delivery.DonationRequest?.FoodDonation != null)
            {
                delivery.DonationRequest.FoodDonation.Status = "Assigned";
            }

            // Generate mockup route details
            delivery.PickupRouteUrl = "28.6139, 77.2090"; // Mock coordinates
            delivery.DeliveryRouteUrl = "28.6250, 77.2200";
            delivery.EstimatedTime = "18 mins";

            // Log action
            _context.AuditLogs.Add(new AuditLog
            {
                UserId = userId,
                Action = "Accept Delivery",
                Details = $"Volunteer {volunteer.Id} claimed delivery ID {delivery.Id}"
            });

            await _context.SaveChangesAsync();
            return Ok(new { message = "Delivery claimed successfully. View pickup route to get started." });
        }

        [HttpPatch("{id}/status")]
        [Authorize(Roles = "Volunteer")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
        {
            var userId = GetUserId();
            var volunteer = await _context.Volunteers.FirstOrDefaultAsync(v => v.UserId == userId);
            if (volunteer == null) return Unauthorized(new { message = "Volunteer profile not found." });

            var delivery = await _context.Deliveries
                .Include(d => d.DonationRequest)
                    .ThenInclude(r => r!.FoodDonation)
                        .ThenInclude(f => f!.Donor)
                            .ThenInclude(don => don!.User)
                .Include(d => d.DonationRequest)
                    .ThenInclude(r => r!.NGO)
                        .ThenInclude(n => n!.User)
                .FirstOrDefaultAsync(d => d.Id == id && d.VolunteerId == volunteer.Id);

            if (delivery == null)
            {
                return NotFound(new { message = "Delivery not found or you are not authorized to edit it." });
            }

            delivery.DeliveryStatus = status;

            if (status == "Picked Up")
            {
                delivery.PickedUpAt = DateTime.UtcNow;
                if (delivery.DonationRequest?.FoodDonation != null)
                {
                    delivery.DonationRequest.FoodDonation.Status = "Picked Up";
                }

                // Notify NGO
                if (delivery.DonationRequest?.NGO?.User != null)
                {
                    _context.Notifications.Add(new Notification
                    {
                        UserId = delivery.DonationRequest.NGO.User.Id,
                        Title = "Food Item Picked Up",
                        Message = $"Volunteer is on the way with your requested food '{delivery.DonationRequest.FoodDonation?.FoodName}'.",
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }
            else if (status == "On the Way")
            {
                if (delivery.DonationRequest?.FoodDonation != null)
                {
                    delivery.DonationRequest.FoodDonation.Status = "On the Way";
                }
            }
            else if (status == "Delivered" || status == "Completed")
            {
                delivery.DeliveryStatus = "Completed";
                delivery.DeliveredAt = DateTime.UtcNow;
                if (delivery.DonationRequest?.FoodDonation != null)
                {
                    delivery.DonationRequest.FoodDonation.Status = "Completed";
                }

                // Notify NGO and Donor
                if (delivery.DonationRequest?.NGO?.User != null)
                {
                    _context.Notifications.Add(new Notification
                    {
                        UserId = delivery.DonationRequest.NGO.User.Id,
                        Title = "Food Delivery Completed",
                        Message = $"The food item '{delivery.DonationRequest.FoodDonation?.FoodName}' has been delivered to your premises.",
                        CreatedAt = DateTime.UtcNow
                    });
                }
                if (delivery.DonationRequest?.FoodDonation?.Donor?.User != null)
                {
                    _context.Notifications.Add(new Notification
                    {
                        UserId = delivery.DonationRequest.FoodDonation.Donor.User.Id,
                        Title = "Your Donation Reached!",
                        Message = $"Great news! Your donation '{delivery.DonationRequest.FoodDonation.FoodName}' has been successfully delivered to the NGO.",
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }

            _context.AuditLogs.Add(new AuditLog
            {
                UserId = userId,
                Action = "Update Delivery Status",
                Details = $"Delivery ID {delivery.Id} status set to {status}"
            });

            await _context.SaveChangesAsync();
            return Ok(new { message = $"Delivery status updated to {status}." });
        }
    }
}
