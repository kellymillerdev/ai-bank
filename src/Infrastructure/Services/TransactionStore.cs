using Core.Interfaces;
using Core.Models;

namespace Infrastructure.Services
{
    public class TransactionStore : ITransactionStore
    {
        private readonly Dictionary<string, List<Transaction>> _transactionsByCategory = new();
        private readonly List<Transaction> _allTransactions = new();

        public Task AddTransactionsAsync(IEnumerable<Transaction> transactions)
        {
            _allTransactions.Clear();
            _transactionsByCategory.Clear();

            foreach (var transaction in transactions)
            {
                _allTransactions.Add(transaction);

                if (!_transactionsByCategory.ContainsKey(transaction.CategoryId))
                {
                    _transactionsByCategory[transaction.CategoryId] = new List<Transaction>();
                }
                _transactionsByCategory[transaction.CategoryId].Add(transaction);
            }

            return Task.CompletedTask;
        }

        public Task<IEnumerable<Transaction>> GetByCategoryIdAsync(string categoryId)
        {
            IEnumerable<Transaction> transactions = _transactionsByCategory.TryGetValue(categoryId, out var categoryTransactions)
                ? categoryTransactions.OrderByDescending(t => t.Date).ToList()
                : Enumerable.Empty<Transaction>();

            return Task.FromResult(transactions);
        }

        public Task<IEnumerable<Transaction>> GetByDateRangeAsync(DateTime start, DateTime end)
        {
            IEnumerable<Transaction> transactions = _allTransactions
                .Where(t => t.Date >= start && t.Date <= end)
                .OrderByDescending(t => t.Date)
                .ToList();

            return Task.FromResult(transactions);
        }

        public Task<TransactionSummary> GetSummaryByCategoryIdAsync(string categoryId)
        {
            if (!_transactionsByCategory.TryGetValue(categoryId, out var transactions))
            {
                return Task.FromResult(new TransactionSummary());
            }

            var summary = new TransactionSummary
            {
                TotalAmount = transactions.Sum(t => t.Amount),
                TransactionCount = transactions.Count,
                AverageAmount = transactions.Any() ? transactions.Average(t => t.Amount) : 0,
                FirstTransaction = transactions.Min(t => t.Date),
                LastTransaction = transactions.Max(t => t.Date),
                LargestTransaction = transactions.OrderByDescending(t => Math.Abs(t.Amount)).First()
            };

            return Task.FromResult(summary);
        }
    }
}