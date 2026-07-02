using System;

namespace FoodDonationAPI.Models
{
    public class Report
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // Daily, Monthly, Yearly, Donation, Volunteer, NGO
        public string Format { get; set; } = string.Empty; // PDF, Excel, CSV
        
        public int GeneratedById { get; set; }
        public User? GeneratedBy { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string FilePath { get; set; } = string.Empty;
    }
}
