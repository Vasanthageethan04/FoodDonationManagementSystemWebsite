using System;
using System.Security.Cryptography;
using System.Text;

namespace FoodDonationAPI.Services
{
    public static class PasswordHasher
    {
        public static string HashPassword(string password)
        {
            var bytes = Encoding.UTF8.GetBytes(password);
            var hash = SHA256.HashData(bytes);
            return Convert.ToHexString(hash);
        }

        public static bool VerifyPassword(string password, string hashedPassword)
        {
            return HashPassword(password).Equals(hashedPassword, StringComparison.OrdinalIgnoreCase);
        }
    }
}
