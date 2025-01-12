// src/Core/Models/Category.cs
namespace Core.Models
{
    public class CategoryMapping
    {
        public string CategoryId { get; set; } = string.Empty;
        public List<string> Patterns { get; set; } = new();
        public decimal? MinAmount { get; set; }
        public decimal? MaxAmount { get; set; }
    }
}