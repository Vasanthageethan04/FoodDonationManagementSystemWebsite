using Microsoft.EntityFrameworkCore;
using FoodDonationAPI.Models;

namespace FoodDonationAPI.Data
{
    public class FoodDonationDbContext : DbContext
    {
        public FoodDonationDbContext(DbContextOptions<FoodDonationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Donor> Donors { get; set; }
        public DbSet<NGO> NGOs { get; set; }
        public DbSet<Volunteer> Volunteers { get; set; }
        public DbSet<FoodCategory> FoodCategories { get; set; }
        public DbSet<FoodDonation> FoodDonations { get; set; }
        public DbSet<DonationImage> DonationImages { get; set; }
        public DbSet<DonationRequest> DonationRequests { get; set; }
        public DbSet<Delivery> Deliveries { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Feedback> Feedbacks { get; set; }
        public DbSet<UserProfile> UserProfiles { get; set; }
        public DbSet<Location> Locations { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<Report> Reports { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure relationships if needed
            modelBuilder.Entity<User>()
                .HasOne(u => u.Role)
                .WithMany()
                .HasForeignKey(u => u.RoleId);

            modelBuilder.Entity<UserProfile>()
                .HasOne(up => up.User)
                .WithOne(u => u.UserProfile)
                .HasForeignKey<UserProfile>(up => up.UserId);

            // Seed Roles
            modelBuilder.Entity<Role>().HasData(
                new Role { Id = 1, Name = "Admin" },
                new Role { Id = 2, Name = "Donor" },
                new Role { Id = 3, Name = "NGO" },
                new Role { Id = 4, Name = "Volunteer" }
            );

            // Seed Food Categories
            modelBuilder.Entity<FoodCategory>().HasData(
                new FoodCategory { Id = 1, Name = "Rice", Description = "Rice grains, biryani, cooked rice dishes" },
                new FoodCategory { Id = 2, Name = "Fruits", Description = "Fresh fruits and fruit bowls" },
                new FoodCategory { Id = 3, Name = "Vegetables", Description = "Raw or cooked vegetable items" },
                new FoodCategory { Id = 4, Name = "Bakery", Description = "Breads, cakes, buns, and pastries" },
                new FoodCategory { Id = 5, Name = "Dairy", Description = "Milk, cheese, butter, paneer, and curd" },
                new FoodCategory { Id = 6, Name = "Meat", Description = "Chicken, mutton, fish, and other non-veg items" },
                new FoodCategory { Id = 7, Name = "Drinks", Description = "Fruit juices, water, milkshakes, and soft drinks" },
                new FoodCategory { Id = 8, Name = "Packed Food", Description = "Biscuits, chips, ready-to-eat packets, and canned food" }
            );
        }
    }
}
