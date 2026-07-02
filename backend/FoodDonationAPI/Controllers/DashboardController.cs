using System;
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
    public class DashboardController : ControllerBase
    {
        private readonly FoodDonationDbContext _context;

        public DashboardController(FoodDonationDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            return claim != null ? int.Parse(claim.Value) : 0;
        }

        [HttpGet]
        public async Task<IActionResult> GetDashboardStats()
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = GetUserId();

            if (role == "Admin")
            {
                var totalUsers = await _context.Users.CountAsync();
                var totalDonors = await _context.Donors.CountAsync();
                var totalNGOs = await _context.NGOs.CountAsync();
                var totalVolunteers = await _context.Volunteers.CountAsync();
                
                var totalDonations = await _context.FoodDonations.CountAsync();
                var completedDeliveries = await _context.Deliveries.CountAsync(d => d.DeliveryStatus == "Completed");
                var pendingRequests = await _context.DonationRequests.CountAsync(r => r.RequestStatus == "Pending");
                
                var availableFood = await _context.FoodDonations.CountAsync(f => f.Status == "Approved");
                
                // Expired food is food that has Status not completed/cancelled AND ExpiryTime < Now
                var expiredFood = await _context.FoodDonations.CountAsync(f => f.Status != "Completed" && f.Status != "Cancelled" && f.ExpiryTime < DateTime.UtcNow);

                // Mock Monthly Donation Graph Data
                var monthlyDonations = new[]
                {
                    new { Month = "Jan", Count = 12 },
                    new { Month = "Feb", Count = 19 },
                    new { Month = "Mar", Count = 25 },
                    new { Month = "Apr", Count = 32 },
                    new { Month = "May", Count = 48 },
                    new { Month = "Jun", Count = totalDonations }
                };

                return Ok(new
                {
                    role,
                    stats = new
                    {
                        totalUsers,
                        totalDonors,
                        totalNGOs,
                        totalVolunteers,
                        totalDonations,
                        completedDeliveries,
                        pendingRequests,
                        availableFood,
                        expiredFood
                    },
                    graphData = monthlyDonations
                });
            }
            else if (role == "Donor")
            {
                var donor = await _context.Donors.FirstOrDefaultAsync(d => d.UserId == userId);
                if (donor == null) return NotFound(new { message = "Donor profile not found." });

                var totalDonations = await _context.FoodDonations.CountAsync(f => f.DonorId == donor.Id);
                var pendingDonations = await _context.FoodDonations.CountAsync(f => f.DonorId == donor.Id && f.Status == "Pending");
                var acceptedDonations = await _context.FoodDonations.CountAsync(f => f.DonorId == donor.Id && f.Status == "Approved");
                var completedDonations = await _context.FoodDonations.CountAsync(f => f.DonorId == donor.Id && f.Status == "Completed");

                return Ok(new
                {
                    role,
                    stats = new
                    {
                        totalDonations,
                        pendingDonations,
                        acceptedDonations,
                        completedDonations
                    }
                });
            }
            else if (role == "NGO")
            {
                var ngo = await _context.NGOs.FirstOrDefaultAsync(n => n.UserId == userId);
                if (ngo == null) return NotFound(new { message = "NGO profile not found." });

                var nearbyDonations = await _context.FoodDonations.CountAsync(f => f.Status == "Approved");
                var acceptedDonations = await _context.DonationRequests.CountAsync(r => r.NGOId == ngo.Id && r.RequestStatus == "Approved");
                var pendingRequests = await _context.DonationRequests.CountAsync(r => r.NGOId == ngo.Id && r.RequestStatus == "Pending");
                
                var completedDeliveries = await _context.DonationRequests
                    .Include(r => r.FoodDonation)
                    .CountAsync(r => r.NGOId == ngo.Id && r.FoodDonation!.Status == "Completed");

                return Ok(new
                {
                    role,
                    stats = new
                    {
                        nearbyDonations,
                        acceptedDonations,
                        pendingRequests,
                        completedDeliveries
                    }
                });
            }
            else if (role == "Volunteer")
            {
                var volunteer = await _context.Volunteers.FirstOrDefaultAsync(v => v.UserId == userId);
                if (volunteer == null) return NotFound(new { message = "Volunteer profile not found." });

                var assignedDeliveries = await _context.Deliveries.CountAsync(d => d.VolunteerId == volunteer.Id && d.DeliveryStatus != "Completed");
                var completedDeliveries = await _context.Deliveries.CountAsync(d => d.VolunteerId == volunteer.Id && d.DeliveryStatus == "Completed");
                var pendingPickups = await _context.Deliveries.CountAsync(d => d.VolunteerId == volunteer.Id && (d.DeliveryStatus == "Accepted" || d.DeliveryStatus == "On the Way"));

                return Ok(new
                {
                    role,
                    stats = new
                    {
                        assignedDeliveries,
                        completedDeliveries,
                        pendingPickups
                    }
                });
            }

            return BadRequest(new { message = "Invalid role." });
        }
    }
}
