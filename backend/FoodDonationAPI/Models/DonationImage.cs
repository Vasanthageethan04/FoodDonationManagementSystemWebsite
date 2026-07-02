namespace FoodDonationAPI.Models
{
    public class DonationImage
    {
        public int Id { get; set; }
        public int FoodDonationId { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
    }
}
