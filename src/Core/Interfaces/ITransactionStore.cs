using Core.Models;

namespace Core.Interfaces
{
    public interface ITransactionStore
    {
        Task<IEnumerable<Transaction>> GetByCategoryIdAsync(string categoryId);
        Task<IEnumerable<Transaction>> GetByDateRangeAsync(DateTime start, DateTime end);
        Task AddTransactionsAsync(IEnumerable<Transaction> transactions);
        Task<TransactionSummary> GetSummaryByCategoryIdAsync(string categoryId);
    }
}
