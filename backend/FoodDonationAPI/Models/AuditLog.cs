using System;

namespace FoodDonationAPI.Models
{
    public class AuditLog
    {
        public int Id { get; set; }
        
        public int? UserId { get; set; }
        public User? User { get; set; }
        
        public string Action { get; set; } = string.Empty; // Login, Logout, Donation Update, etc.
        public string Details { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
