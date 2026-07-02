using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FoodDonationAPI.Data;
using FoodDonationAPI.Models;
using FoodDonationAPI.Services;

namespace FoodDonationAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class UsersController : ControllerBase
    {
        private readonly FoodDonationDbContext _context;

        public UsersController(FoodDonationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users
                .Include(u => u.Role)
                .Include(u => u.UserProfile)
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    u.Email,
                    u.IsActive,
                    u.CreatedAt,
                    Role = u.Role != null ? u.Role.Name : "Donor",
                    RoleId = u.RoleId,
                    Profile = u.UserProfile
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .Include(u => u.UserProfile)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            return Ok(new
            {
                user.Id,
                user.Username,
                user.Email,
                user.IsActive,
                user.CreatedAt,
                Role = user.Role?.Name,
                user.RoleId,
                Profile = user.UserProfile
            });
        }

        public class CreateUserDto
        {
            public string Username { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
            public int RoleId { get; set; }
            public bool IsActive { get; set; } = true;
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            {
                return BadRequest(new { message = "Email is already taken." });
            }

            if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
            {
                return BadRequest(new { message = "Username is already taken." });
            }

            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                PasswordHash = PasswordHasher.HashPassword(dto.Password),
                RoleId = dto.RoleId,
                IsActive = dto.IsActive
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Create default profile
            var profile = new UserProfile { UserId = user.Id, Bio = "Created by Administrator" };
            _context.UserProfiles.Add(profile);

            // Mock profile roles
            if (dto.RoleId == 2) _context.Donors.Add(new Donor { UserId = user.Id });
            else if (dto.RoleId == 3) _context.NGOs.Add(new NGO { UserId = user.Id, OrgName = dto.Username });
            else if (dto.RoleId == 4) _context.Volunteers.Add(new Volunteer { UserId = user.Id });

            _context.AuditLogs.Add(new AuditLog
            {
                Action = "Admin Create User",
                Details = $"Admin created user {user.Username} with Role ID {dto.RoleId}"
            });

            await _context.SaveChangesAsync();

            return Ok(new { message = "User created successfully." });
        }

        public class UpdateUserDto
        {
            public string Username { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public int RoleId { get; set; }
            public bool IsActive { get; set; }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            // Check uniqueness
            if (user.Email != dto.Email && await _context.Users.AnyAsync(u => u.Email == dto.Email))
            {
                return BadRequest(new { message = "Email is already taken." });
            }
            if (user.Username != dto.Username && await _context.Users.AnyAsync(u => u.Username == dto.Username))
            {
                return BadRequest(new { message = "Username is already taken." });
            }

            user.Username = dto.Username;
            user.Email = dto.Email;
            user.RoleId = dto.RoleId;
            user.IsActive = dto.IsActive;

            _context.AuditLogs.Add(new AuditLog
            {
                Action = "Admin Update User",
                Details = $"Admin modified user {user.Username} (Role: {dto.RoleId}, Active: {dto.IsActive})"
            });

            await _context.SaveChangesAsync();
            return Ok(new { message = "User updated successfully." });
        }

        [HttpPatch("{id}/toggle-status")]
        public async Task<IActionResult> ToggleStatus(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            user.IsActive = !user.IsActive;
            _context.AuditLogs.Add(new AuditLog
            {
                Action = "Admin Toggle User Status",
                Details = $"Admin toggled user {user.Username} activity status to {user.IsActive}"
            });

            await _context.SaveChangesAsync();
            return Ok(new { message = $"User state changed to {(user.IsActive ? "Active" : "Inactive")}." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            if (user.RoleId == 1 && await _context.Users.CountAsync(u => u.RoleId == 1) <= 1)
            {
                return BadRequest(new { message = "Cannot delete the last admin user." });
            }

            _context.Users.Remove(user);
            _context.AuditLogs.Add(new AuditLog
            {
                Action = "Admin Delete User",
                Details = $"Admin deleted user {user.Username}"
            });

            await _context.SaveChangesAsync();
            return Ok(new { message = "User deleted successfully." });
        }
    }
}
