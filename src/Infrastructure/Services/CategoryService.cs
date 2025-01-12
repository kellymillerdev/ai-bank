using Core.Interfaces;
using Core.Models;

namespace Infrastructure.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly Dictionary<string, Category> _categories = new();
        private readonly List<CategoryMapping> _mappings = new();

        public CategoryService()
        {
            InitializeSystemCategories();
        }

        private void InitializeSystemCategories()
        {
            var systemCategories = new[]
            {
                Category.CreateSystem("income"),
                Category.CreateSystem("digital-payments"),
                Category.CreateSystem("credit-card"),
                Category.CreateSystem("housing"),
                Category.CreateSystem("utilities"),
                Category.CreateSystem("cash-withdrawal"),
                Category.CreateSystem("transfers"),
                Category.CreateSystem("other")
            };

            foreach (var category in systemCategories)
            {
                Console.WriteLine($"Registering category: {category.Id}"); // Debug log
                _categories[category.Id] = category;
            }
        }

        public Task<Category> CreateCategoryAsync(string name, string? parentId = null)
        {
            var category = new Category
            {
                Name = name,
                ParentCategoryId = parentId
            };

            _categories[category.Id] = category;
            return Task.FromResult(category);
        }

        public Task<IEnumerable<Category>> GetAllCategoriesAsync()
        {
            return Task.FromResult(_categories.Values.AsEnumerable());
        }

        public Task<Category?> GetCategoryByIdAsync(string id)
        {
            _categories.TryGetValue(id, out var category);
            return Task.FromResult(category);
        }

        public Task<CategoryMapping> AddCategoryMappingAsync(string categoryId, string pattern, decimal? minAmount = null, decimal? maxAmount = null)
        {
            var mapping = new CategoryMapping
            {
                CategoryId = categoryId,
                Patterns = new List<string> { pattern },
                MinAmount = minAmount,
                MaxAmount = maxAmount
            };

            _mappings.Add(mapping);
            return Task.FromResult(mapping);
        }
    }
}