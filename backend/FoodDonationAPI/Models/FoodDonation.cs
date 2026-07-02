using System;
using System.Collections.Generic;

namespace FoodDonationAPI.Models
{
    public class FoodDonation
    {
        public int Id { get; set; }
        
        public int DonorId { get; set; }
        public Donor? Donor { get; set; }
        
        public string FoodName { get; set; } = string.Empty;
        
        public int CategoryId { get; set; }
        public FoodCategory? Category { get; set; }
        
        public string Quantity { get; set; } = string.Empty; // e.g. "5 kg", "10 litres"
        public int MealsCount { get; set; }
        public string FoodType { get; set; } = "Veg"; // Veg, Non Veg
        public string StorageType { get; set; } = "Ambient"; // Dry, Refrigerated, Frozen, Ambient
        public string Description { get; set; } = string.Empty;
        
        public DateTime CookingDate { get; set; } = DateTime.UtcNow;
        public DateTime ExpiryTime { get; set; }
        public DateTime PickupTime { get; set; }
        public string PickupAddress { get; set; } = string.Empty;
        public string ContactNumber { get; set; } = string.Empty;
        
        // Status: Pending, Approved, Assigned, Picked Up, Delivered, Completed, Rejected, Cancelled
        public string Status { get; set; } = "Pending"; 
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public ICollection<DonationImage> Images { get; set; } = new List<DonationImage>();
    }
}
