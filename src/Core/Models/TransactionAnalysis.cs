// src/Core/Models/TransactionAnalysis.cs
namespace Core.Models
{
    public class TransactionAnalysis
    {
        public decimal TotalIncome { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal NetCashFlow { get; set; }
        public Dictionary<string, decimal> SpendingByCategory { get; set; } = new();
        public List<MonthlyTrend> MonthlyTrends { get; set; } = new();
        public List<string> Insights { get; set; } = new();
        public List<Transaction> Transactions { get; set; } = new();
    }
}