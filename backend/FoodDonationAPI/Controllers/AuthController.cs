using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FoodDonationAPI.Data;
using FoodDonationAPI.Models;
using FoodDonationAPI.Services;

namespace FoodDonationAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly FoodDonationDbContext _context;
        private readonly TokenService _tokenService;

        public AuthController(FoodDonationDbContext context, TokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        public class LoginDto
        {
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        public class RegisterDto
        {
            public string Username { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
            public int RoleId { get; set; } // 2: Donor, 3: NGO, 4: Volunteer
            
            // Profile fields
            public string ContactNumber { get; set; } = string.Empty;
            public string Address { get; set; } = string.Empty;
            public string State { get; set; } = string.Empty;
            public string District { get; set; } = string.Empty;
            public string City { get; set; } = string.Empty;
            public string Area { get; set; } = string.Empty;
            public string Pincode { get; set; } = string.Empty;
            
            // NGO specific
            public string OrgName { get; set; } = string.Empty;
            public string RegistrationNumber { get; set; } = string.Empty;

            // Volunteer specific
            public string VehicleType { get; set; } = "Bike";
        }

        public class ResetPasswordDto
        {
            public string Email { get; set; } = string.Empty;
            public string NewPassword { get; set; } = string.Empty;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .Include(u => u.UserProfile)
                .FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (user == null || !PasswordHasher.VerifyPassword(dto.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            if (!user.IsActive)
            {
                return BadRequest(new { message = "Your account has been deactivated. Please contact support." });
            }

            var token = _tokenService.GenerateToken(user);

            // Log login
            _context.AuditLogs.Add(new AuditLog
            {
                UserId = user.Id,
                Action = "Login",
                Details = $"User logged in: {user.Username}"
            });
            await _context.SaveChangesAsync();

            // Retrieve role-specific details ID if applicable
            int profileSpecificId = 0;
            string displayTitle = user.Username;

            if (user.RoleId == 2) // Donor
            {
                var donor = await _context.Donors.FirstOrDefaultAsync(d => d.UserId == user.Id);
                profileSpecificId = donor?.Id ?? 0;
            }
            else if (user.RoleId == 3) // NGO
            {
                var ngo = await _context.NGOs.FirstOrDefaultAsync(n => n.UserId == user.Id);
                profileSpecificId = ngo?.Id ?? 0;
                displayTitle = ngo?.OrgName ?? user.Username;
            }
            else if (user.RoleId == 4) // Volunteer
            {
                var vol = await _context.Volunteers.FirstOrDefaultAsync(v => v.UserId == user.Id);
                profileSpecificId = vol?.Id ?? 0;
            }

            return Ok(new
            {
                token,
                user = new
                {
                    user.Id,
                    user.Username,
                    user.Email,
                    Role = user.Role?.Name,
                    RoleId = user.RoleId,
                    profileSpecificId,
                    displayName = displayTitle,
                    profile = user.UserProfile
                }
            });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            {
                return BadRequest(new { message = "Email is already registered." });
            }

            if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
            {
                return BadRequest(new { message = "Username is already taken." });
            }

            var role = await _context.Roles.FindAsync(dto.RoleId);
            if (role == null)
            {
                return BadRequest(new { message = "Invalid role ID." });
            }

            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                PasswordHash = PasswordHasher.HashPassword(dto.Password),
                RoleId = dto.RoleId,
                IsActive = true
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Create UserProfile
            var userProfile = new UserProfile
            {
                UserId = user.Id,
                Bio = role.Name == "NGO" ? $"NGO Account: {dto.OrgName}" : $"Joined as a {role.Name}",
                State = dto.State,
                District = dto.District,
                City = dto.City,
                Area = dto.Area,
                Pincode = dto.Pincode
            };
            _context.UserProfiles.Add(userProfile);

            // Mock coordinates
            var random = new Random();
            double defaultLat = 28.6139 + (random.NextDouble() - 0.5) * 0.1; // Delhi latitude mock
            double defaultLon = 77.2090 + (random.NextDouble() - 0.5) * 0.1; // Delhi longitude mock

            // Role specific records
            if (dto.RoleId == 2) // Donor
            {
                _context.Donors.Add(new Donor
                {
                    UserId = user.Id,
                    ContactNumber = dto.ContactNumber,
                    Address = dto.Address,
                    Latitude = defaultLat,
                    Longitude = defaultLon
                });
            }
            else if (dto.RoleId == 3) // NGO
            {
                _context.NGOs.Add(new NGO
                {
                    UserId = user.Id,
                    OrgName = dto.OrgName,
                    RegistrationNumber = dto.RegistrationNumber,
                    ContactNumber = dto.ContactNumber,
                    Address = dto.Address,
                    Latitude = defaultLat,
                    Longitude = defaultLon
                });
            }
            else if (dto.RoleId == 4) // Volunteer
            {
                _context.Volunteers.Add(new Volunteer
                {
                    UserId = user.Id,
                    ContactNumber = dto.ContactNumber,
                    Address = dto.Address,
                    VehicleType = dto.VehicleType,
                    IsAvailable = true,
                    Latitude = defaultLat,
                    Longitude = defaultLon
                });
            }

            // Add notification
            _context.Notifications.Add(new Notification
            {
                UserId = user.Id,
                Title = "Welcome!",
                Message = $"Registration successful! You are signed up as a {role.Name}.",
                CreatedAt = DateTime.UtcNow
            });

            // Log action
            _context.AuditLogs.Add(new AuditLog
            {
                UserId = user.Id,
                Action = "Register",
                Details = $"New user registered: {user.Username} ({role.Name})"
            });

            await _context.SaveChangesAsync();

            return Ok(new { message = "Registration successful! You can now log in." });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ResetPasswordDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null)
            {
                return NotFound(new { message = "Email address not found." });
            }

            // Simulate forgot password - we directly update for demo purposes
            user.PasswordHash = PasswordHasher.HashPassword(dto.NewPassword);
            _context.AuditLogs.Add(new AuditLog
            {
                UserId = user.Id,
                Action = "ResetPassword",
                Details = $"Password reset for: {user.Username}"
            });

            await _context.SaveChangesAsync();
            return Ok(new { message = "Password has been reset successfully." });
        }
    }
}
