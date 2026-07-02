namespace FoodDonationAPI.Models
{
    public class Role
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty; // Admin, Donor, NGO, Volunteer
    }
}
