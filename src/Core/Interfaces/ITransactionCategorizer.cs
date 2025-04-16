using Core.Models;

namespace Core.Interfaces
{
    public interface ITransactionCategorizer
    {
        Task<(string CategoryId, string Subcategory)> CategorizeSingleTransactionAsync(string description, decimal amount);
        Task<Dictionary<string, string>> SuggestCategoryUpdatesAsync(IEnumerable<Transaction> transactions);
    }
}