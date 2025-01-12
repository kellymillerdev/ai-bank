namespace Core.Models
{
    public class Category
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ParentCategoryId { get; set; }
        public bool IsSystem { get; set; }

        public static Category CreateSystem(string id)
        {
            // Use the ID as-is, just capitalize the words for the name
            var name = string.Join(" ",
                id.Split('-')
                  .Select(word => char.ToUpper(word[0]) + word[1..])
            );

            return new Category
            {
                Id = id,           // Keep the original format
                Name = name,       // Make it pretty for display
                IsSystem = true
            };
        }
    }
}