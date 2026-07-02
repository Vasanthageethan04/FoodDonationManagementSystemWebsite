using System;

namespace FoodDonationAPI.Models
{
    public class Delivery
    {
        public int Id { get; set; }
        
        public int DonationRequestId { get; set; }
        public DonationRequest? DonationRequest { get; set; }
        
        public int? VolunteerId { get; set; }
        public Volunteer? Volunteer { get; set; }
        
        // Status: Assigned, Accepted, On the Way, Picked Up, Delivered, Completed
        public string DeliveryStatus { get; set; } = "Assigned";
        
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
        public DateTime? PickedUpAt { get; set; }
        public DateTime? DeliveredAt { get; set; }
        
        // Map integration and routes
        public string PickupRouteUrl { get; set; } = string.Empty;
        public string DeliveryRouteUrl { get; set; } = string.Empty;
        public string EstimatedTime { get; set; } = string.Empty; // e.g. "15 mins"
    }
}
