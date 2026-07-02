using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FoodDonationAPI.Data;
using FoodDonationAPI.Models;

namespace FoodDonationAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CategoriesController : ControllerBase
    {
        private readonly FoodDonationDbContext _context;

        public CategoriesController(FoodDonationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _context.FoodCategories.ToListAsync();
            return Ok(categories);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateCategory([FromBody] FoodCategory category)
        {
            _context.FoodCategories.Add(category);
            await _context.SaveChangesAsync();
            return Ok(category);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] FoodCategory categoryDto)
        {
            var category = await _context.FoodCategories.FindAsync(id);
            if (category == null) return NotFound();

            category.Name = categoryDto.Name;
            category.Description = categoryDto.Description;
            await _context.SaveChangesAsync();
            return Ok(category);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.FoodCategories.FindAsync(id);
            if (category == null) return NotFound();

            _context.FoodCategories.Remove(category);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Category deleted successfully." });
        }
    }
}
