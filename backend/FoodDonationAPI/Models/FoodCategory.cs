namespace FoodDonationAPI.Models
{
    public class FoodCategory
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty; // Rice, Fruits, etc.
        public string Description { get; set; } = string.Empty;
    }
}
