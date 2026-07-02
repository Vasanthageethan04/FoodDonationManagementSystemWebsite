using System;
using System.Text.Json.Serialization;

namespace FoodDonationAPI.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        
        [JsonIgnore]
        public string PasswordHash { get; set; } = string.Empty;
        
        public int RoleId { get; set; }
        public Role? Role { get; set; }
        
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation links (optional but helpful for 1-1 or 1-many mappings)
        public UserProfile? UserProfile { get; set; }
    }
}
