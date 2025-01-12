using Core.Models;

namespace Core.Interfaces
{
    public interface IFinanceAnalyzer
    {
        Task<TransactionAnalysis> AnalyzeTransactionsAsync(Stream csvStream);
        Task<List<string>> GetSpendingInsightsAsync();
        Task<Dictionary<string, decimal>> PredictNextMonthSpendingAsync();
    }
}