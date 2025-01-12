using Core.Models;

namespace Core.Interfaces
{
    public interface ICategoryService
    {
        Task<IEnumerable<Category>> GetAllCategoriesAsync();
        Task<Category?> GetCategoryByIdAsync(string id);
        Task<Category> CreateCategoryAsync(string name, string? parentId = null);
        Task<CategoryMapping> AddCategoryMappingAsync(string categoryId, string pattern, decimal? minAmount = null, decimal? maxAmount = null);
    }
}