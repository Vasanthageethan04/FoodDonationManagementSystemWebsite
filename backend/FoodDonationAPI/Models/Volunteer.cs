namespace FoodDonationAPI.Models
{
    public class Volunteer
    {
        public int Id { get; set; }
        
        public int UserId { get; set; }
        public User? User { get; set; }
        
        public string ContactNumber { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string VehicleType { get; set; } = string.Empty; // Bike, Car, Van, Walking
        public bool IsAvailable { get; set; } = true;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }
}
