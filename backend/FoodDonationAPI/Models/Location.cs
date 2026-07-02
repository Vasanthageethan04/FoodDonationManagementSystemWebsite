namespace FoodDonationAPI.Models
{
    public class Location
    {
        public int Id { get; set; }
        public string State { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Area { get; set; } = string.Empty;
        public string Pincode { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }
}
