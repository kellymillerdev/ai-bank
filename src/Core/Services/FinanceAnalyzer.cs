// src/Core/Services/FinanceAnalyzer.cs
using System.Globalization;
using CsvHelper;
using Core.Models;
using Core.Interfaces;

namespace Core.Services
{

    public class FinanceAnalyzer : IFinanceAnalyzer
    {
        private readonly CategoryMapper _categoryMapper = new CategoryMapper();

        public async Task<TransactionAnalysis> AnalyzeTransactionsAsync(Stream csvStream)
        {
            using var reader = new StreamReader(csvStream);

            // Skip header lines
            await reader.ReadLineAsync(); // Account name
            await reader.ReadLineAsync(); // Account number
            await reader.ReadLineAsync(); // Date range

            using var csv = new CsvReader(reader, new CsvHelper.Configuration.CsvConfiguration(CultureInfo.InvariantCulture)
            {
                HasHeaderRecord = true,
                MissingFieldFound = null
            });

            var transactions = new List<Transaction>();

            try
            {
                csv.Read();
                csv.ReadHeader();

                while (csv.Read())
                {
                    try
                    {
                        decimal amount = 0;
                        var debitStr = csv.GetField("Amount Debit")?.Trim();
                        if (!string.IsNullOrEmpty(debitStr))
                        {
                            amount = decimal.Parse(debitStr, NumberStyles.Currency);
                        }

                        var creditStr = csv.GetField("Amount Credit")?.Trim();
                        if (!string.IsNullOrEmpty(creditStr))
                        {
                            amount = decimal.Parse(creditStr, NumberStyles.Currency);
                        }

                        var description = csv.GetField("Description")?.Replace("\"", "").Trim() ?? "";
                        var balanceStr = csv.GetField("Balance")?.Trim().Replace("\"", "");

                        if (decimal.TryParse(balanceStr, NumberStyles.Currency, CultureInfo.InvariantCulture, out decimal balance))
                        {
                            var transaction = new Transaction
                            {
                                Date = DateTime.Parse(csv.GetField("Date")),
                                Description = description,
                                Amount = amount,
                                Balance = balance,
                                CategoryId = DetermineCategoryId(description, amount)
                            };

                            transactions.Add(transaction);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error processing row: {ex.Message}");
                        continue;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error reading CSV: {ex.Message}");
                throw;
            }

            var analysis = new TransactionAnalysis
            {
                TotalIncome = transactions.Where(t => t.Amount > 0).Sum(t => t.Amount),
                TotalExpenses = Math.Abs(transactions.Where(t => t.Amount < 0).Sum(t => t.Amount)),
                NetCashFlow = transactions.Sum(t => t.Amount),
                SpendingByCategory = GetSpendingByCategory(transactions),
                MonthlyTrends = GetMonthlyTrends(transactions),
                Insights = GenerateInsights(transactions),
                Transactions = transactions
            };

            return analysis;
        }

        public Task<List<string>> GetSpendingInsightsAsync()
        {
            // TODO: This will be enhanced with ML insights later
            var insights = new List<string>
            {
                "AI-powered insights coming soon!",
                "We'll analyze your spending patterns",
                "And provide personalized recommendations"
            };

            return Task.FromResult(insights);
        }

        public Task<Dictionary<string, decimal>> PredictNextMonthSpendingAsync()
        {
            // TODO: This will be enhanced with ML predictions later
            var predictions = new Dictionary<string, decimal>();

            // For now, return empty predictions
            // Later we'll add ML-based prediction logic here
            return Task.FromResult(predictions);
        }

        private string DetermineCategoryId(string description, decimal amount)
        {
            description = description.ToLower();
            string categoryId;

            if (description.Contains("payroll") || description.Contains("ultimatesoftware"))
                categoryId = "income";
            else if (description.Contains("greenlight"))
                categoryId = "digital-payments";
            else if (description.Contains("american express"))
                categoryId = "credit-card";
            else if (description.Contains("loan care"))
                categoryId = "housing";
            else if (description.Contains("teco") || description.Contains("tampa ut"))
                categoryId = "utilities";
            else if (description.Contains("atm"))
                categoryId = "cash-withdrawal";
            else if (description.Contains("venmo") || description.Contains("paypal"))
                categoryId = "transfers";
            else
                categoryId = "other";

            Console.WriteLine($"Categorizing '{description}' as '{categoryId}'");  // Debug log
            return categoryId;
        }

        private Dictionary<string, decimal> GetSpendingByCategory(List<Transaction> transactions)
        {
            return transactions
                .Where(t => t.Amount < 0)
                .GroupBy(t => t.CategoryId)
                .ToDictionary(
                    g => g.Key,
                    g => Math.Abs(g.Sum(t => t.Amount))
                );
        }

        private List<MonthlyTrend> GetMonthlyTrends(List<Transaction> transactions)
        {
            return transactions
                .GroupBy(t => new DateTime(t.Date.Year, t.Date.Month, 1))
                .Select(g => new MonthlyTrend
                {
                    Month = g.Key,
                    Income = g.Where(t => t.Amount > 0).Sum(t => t.Amount),
                    Expenses = Math.Abs(g.Where(t => t.Amount < 0).Sum(t => t.Amount)),
                    Savings = g.Sum(t => t.Amount)
                })
                .OrderBy(mt => mt.Month)
                .ToList();
        }

        // In FinanceAnalyzer.cs, update the insights generation:
        private List<string> GenerateInsights(List<Transaction> transactions)
        {
            var insights = new List<string>();

            if (!transactions.Any())
            {
                return new List<string> { "No transactions available for analysis." };
            }

            // Monthly spending patterns
            var monthlyExpenses = transactions
                .Where(t => t.Amount < 0)
                .GroupBy(t => new { t.Date.Year, t.Date.Month })
                .Select(g => new
                {
                    YearMonth = $"{g.Key.Year}-{g.Key.Month}",
                    Total = Math.Abs(g.Sum(t => t.Amount))
                })
                .ToList();

            if (monthlyExpenses.Any())
            {
                var avgMonthlyExpense = monthlyExpenses.Average(m => m.Total);
                insights.Add($"Average monthly expenses: ${avgMonthlyExpense:F2}");

                var highestMonth = monthlyExpenses.MaxBy(m => m.Total);
                var lowestMonth = monthlyExpenses.MinBy(m => m.Total);

                if (highestMonth != null && lowestMonth != null)
                {
                    insights.Add($"Highest spending month ({highestMonth.YearMonth}): ${highestMonth.Total:F2}");
                    insights.Add($"Lowest spending month ({lowestMonth.YearMonth}): ${lowestMonth.Total:F2}");
                }
            }

            // Category analysis
            var topCategories = GetSpendingByCategory(transactions)
                .OrderByDescending(kvp => kvp.Value)
                .Take(3);

            insights.Add("Top spending categories:");
            foreach (var category in topCategories)
            {
                insights.Add($"{category.Key}: ${category.Value:F2}");  // Removed the leading dash
            }

            // Regular payment analysis
            var regularPayments = transactions
                .Where(t => t.Amount < 0)
                .GroupBy(t => t.CategoryId)  // Using CategoryId instead of Category
                .Where(g => g.Count() >= 3)
                .Select(g => new
                {
                    Category = g.Key,
                    AverageAmount = Math.Abs(g.Average(t => t.Amount)),
                    Count = g.Count()
                })
                .Where(x => x.Count > 3)
                .OrderByDescending(x => x.AverageAmount);

            insights.Add("\nRegular monthly expenses:");
            foreach (var payment in regularPayments.Take(5))
            {
                insights.Add($"{payment.Category}: ${payment.AverageAmount:F2} (occurs {payment.Count} times)");  // Removed the leading dash
            }

            return insights;
        }
    }
}