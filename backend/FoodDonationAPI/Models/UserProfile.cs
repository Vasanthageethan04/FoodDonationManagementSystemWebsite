using System;

namespace FoodDonationAPI.Models
{
    public class UserProfile
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        
        public string Bio { get; set; } = string.Empty;
        public string ProfileImageUrl { get; set; } = string.Empty;
        
        // Location address fields
        public string State { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Area { get; set; } = string.Empty;
        public string Pincode { get; set; } = string.Empty;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
