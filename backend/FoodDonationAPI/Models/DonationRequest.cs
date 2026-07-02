using System;

namespace FoodDonationAPI.Models
{
    public class DonationRequest
    {
        public int Id { get; set; }
        
        public int FoodDonationId { get; set; }
        public FoodDonation? FoodDonation { get; set; }
        
        public int NGOId { get; set; }
        public NGO? NGO { get; set; }
        
        // Status: Pending, Approved, Rejected, Cancelled
        public string RequestStatus { get; set; } = "Pending";
        
        public string Message { get; set; } = string.Empty;
        public DateTime RequestDate { get; set; } = DateTime.UtcNow;
    }
}
