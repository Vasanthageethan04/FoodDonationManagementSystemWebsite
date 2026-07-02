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
    public class FoodDonationsController : ControllerBase
    {
        private readonly FoodDonationDbContext _context;

        public FoodDonationsController(FoodDonationDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            return claim != null ? int.Parse(claim.Value) : 0;
        }

        [HttpGet]
        public async Task<IActionResult> GetDonations(
            [FromQuery] string? search,
            [FromQuery] int? categoryId,
            [FromQuery] string? foodType,
            [FromQuery] string? status)
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = GetUserId();

            var query = _context.FoodDonations
                .Include(f => f.Category)
                .Include(f => f.Donor)
                    .ThenInclude(d => d!.User)
                .Include(f => f.Images)
                .AsQueryable();

            // Filter based on roles
            if (role == "Donor")
            {
                var donor = await _context.Donors.FirstOrDefaultAsync(d => d.UserId == userId);
                if (donor == null) return Unauthorized(new { message = "Donor profile not found." });
                query = query.Where(f => f.DonorId == donor.Id);
            }
            else if (role == "NGO")
            {
                // NGOs can only see Approved donations that are not yet claimed or completed
                query = query.Where(f => f.Status == "Approved");
            }
            // Admins and Volunteers see all

            // Apply filters
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(f => f.FoodName.Contains(search) || f.Description.Contains(search));
            }
            if (categoryId.HasValue)
            {
                query = query.Where(f => f.CategoryId == categoryId.Value);
            }
            if (!string.IsNullOrEmpty(foodType))
            {
                query = query.Where(f => f.FoodType == foodType);
            }
            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(f => f.Status == status);
            }

            var donations = await query
                .OrderByDescending(f => f.CreatedAt)
                .Select(f => new
                {
                    f.Id,
                    f.FoodName,
                    f.Quantity,
                    f.MealsCount,
                    f.FoodType,
                    f.StorageType,
                    f.Description,
                    f.CookingDate,
                    f.ExpiryTime,
                    f.PickupTime,
                    f.PickupAddress,
                    f.ContactNumber,
                    f.Status,
                    f.CreatedAt,
                    CategoryName = f.Category != null ? f.Category.Name : "",
                    CategoryId = f.CategoryId,
                    DonorName = f.Donor != null && f.Donor.User != null ? f.Donor.User.Username : "Unknown Donor",
                    DonorId = f.DonorId,
                    Images = f.Images.Select(img => img.ImageUrl).ToList()
                })
                .ToListAsync();

            return Ok(donations);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDonationById(int id)
        {
            var donation = await _context.FoodDonations
                .Include(f => f.Category)
                .Include(f => f.Donor)
                    .ThenInclude(d => d!.User)
                .Include(f => f.Images)
                .FirstOrDefaultAsync(f => f.Id == id);

            if (donation == null)
            {
                return NotFound(new { message = "Donation not found." });
            }

            return Ok(new
            {
                donation.Id,
                donation.FoodName,
                donation.Quantity,
                donation.MealsCount,
                donation.FoodType,
                donation.StorageType,
                donation.Description,
                donation.CookingDate,
                donation.ExpiryTime,
                donation.PickupTime,
                donation.PickupAddress,
                donation.ContactNumber,
                donation.Status,
                donation.CreatedAt,
                CategoryName = donation.Category?.Name,
                donation.CategoryId,
                DonorName = donation.Donor?.User?.Username,
                donation.DonorId,
                Images = donation.Images.Select(img => img.ImageUrl).ToList()
            });
        }

        public class CreateDonationDto
        {
            public string FoodName { get; set; } = string.Empty;
            public int CategoryId { get; set; }
            public string Quantity { get; set; } = string.Empty;
            public int MealsCount { get; set; }
            public string FoodType { get; set; } = "Veg"; // Veg, Non Veg
            public string StorageType { get; set; } = "Ambient";
            public string Description { get; set; } = string.Empty;
            public DateTime CookingDate { get; set; } = DateTime.UtcNow;
            public DateTime ExpiryTime { get; set; }
            public DateTime PickupTime { get; set; }
            public string PickupAddress { get; set; } = string.Empty;
            public string ContactNumber { get; set; } = string.Empty;
            public string[] Images { get; set; } = Array.Empty<string>();
        }

        [HttpPost]
        [Authorize(Roles = "Donor")]
        public async Task<IActionResult> CreateDonation([FromBody] CreateDonationDto dto)
        {
            var userId = GetUserId();
            var donor = await _context.Donors.FirstOrDefaultAsync(d => d.UserId == userId);
            if (donor == null)
            {
                return Unauthorized(new { message = "Donor profile not found." });
            }

            var donation = new FoodDonation
            {
                DonorId = donor.Id,
                FoodName = dto.FoodName,
                CategoryId = dto.CategoryId,
                Quantity = dto.Quantity,
                MealsCount = dto.MealsCount,
                FoodType = dto.FoodType,
                StorageType = dto.StorageType,
                Description = dto.Description,
                CookingDate = dto.CookingDate,
                ExpiryTime = dto.ExpiryTime,
                PickupTime = dto.PickupTime,
                PickupAddress = dto.PickupAddress,
                ContactNumber = dto.ContactNumber,
                Status = "Pending", // Requires Admin approval
                CreatedAt = DateTime.UtcNow
            };

            _context.FoodDonations.Add(donation);
            await _context.SaveChangesAsync();

            // Add images if provided, otherwise add a fallback placeholder image
            if (dto.Images != null && dto.Images.Length > 0)
            {
                foreach (var imgUrl in dto.Images)
                {
                    _context.DonationImages.Add(new DonationImage
                    {
                        FoodDonationId = donation.Id,
                        ImageUrl = imgUrl
                    });
                }
            }
            else
            {
                // Pre-populate mock placeholder
                _context.DonationImages.Add(new DonationImage
                {
                    FoodDonationId = donation.Id,
                    ImageUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500"
                });
            }

            // Create notification for admin
            var admins = await _context.Users.Where(u => u.RoleId == 1).ToListAsync();
            foreach (var admin in admins)
            {
                _context.Notifications.Add(new Notification
                {
                    UserId = admin.Id,
                    Title = "New Donation Received",
                    Message = $"A new donation '{dto.FoodName}' has been submitted by {User.Identity?.Name} and is pending approval.",
                    CreatedAt = DateTime.UtcNow
                });
            }

            // Log action
            _context.AuditLogs.Add(new AuditLog
            {
                UserId = userId,
                Action = "Create Donation",
                Details = $"Donor created donation: {dto.FoodName} (Id: {donation.Id})"
            });

            await _context.SaveChangesAsync();

            return Ok(new { message = "Donation created successfully and is pending approval.", donationId = donation.Id });
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
        {
            var donation = await _context.FoodDonations.FindAsync(id);
            if (donation == null)
            {
                return NotFound(new { message = "Donation not found." });
            }

            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = GetUserId();

            // Permissions checking
            if (role == "Donor")
            {
                var donor = await _context.Donors.FirstOrDefaultAsync(d => d.UserId == userId);
                if (donor == null || donation.DonorId != donor.Id)
                {
                    return Unauthorized(new { message = "You cannot modify this donation." });
                }
                if (status != "Cancelled")
                {
                    return BadRequest(new { message = "Donors can only cancel donations." });
                }
            }
            else if (role != "Admin")
            {
                return Unauthorized(new { message = "Only Admin can approve or reject donations." });
            }

            donation.Status = status;

            // Notify Donor
            var donorUser = await _context.Donors
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.Id == donation.DonorId);
                
            if (donorUser?.User != null)
            {
                _context.Notifications.Add(new Notification
                {
                    UserId = donorUser.User.Id,
                    Title = $"Donation Status: {status}",
                    Message = $"Your donation '{donation.FoodName}' status has been updated to '{status}'.",
                    CreatedAt = DateTime.UtcNow
                });
            }

            _context.AuditLogs.Add(new AuditLog
            {
                UserId = userId,
                Action = "Update Donation Status",
                Details = $"Donation {donation.Id} status updated to {status} by role {role}"
            });

            await _context.SaveChangesAsync();
            return Ok(new { message = $"Donation status updated to {status}." });
        }
    }
}
