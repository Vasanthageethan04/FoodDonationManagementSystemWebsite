namespace FoodDonationAPI.Models
{
    public class Donor
    {
        public int Id { get; set; }
        
        public int UserId { get; set; }
        public User? User { get; set; }
        
        public string ContactNumber { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }
}
