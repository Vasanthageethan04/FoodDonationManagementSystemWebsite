using System;

namespace FoodDonationAPI.Models
{
    public class Feedback
    {
        public int Id { get; set; }
        
        public int UserId { get; set; } // Author of feedback
        public User? User { get; set; }
        
        public int Rating { get; set; } // 1 to 5 Stars
        public string Comments { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
