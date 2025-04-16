using Azure.AI.OpenAI;
using Core.Interfaces;
using Core.Models;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Services
{
    public class TransactionCategorizer : ITransactionCategorizer
    {
        private readonly OpenAIClient _openAIClient;
        private readonly string _modelName;

        private static readonly Dictionary<string, (string Category, string[] Subcategories)> CategoryMap = new()
        {
            ["digital-payments"] = ("Digital Payments", new[] { "Greenlight", "Venmo", "PayPal", "CashApp" }),
            ["utilities"] = ("Utilities", new[] { "Electric", "Gas", "Water", "Internet", "Phone" }),
            ["fitness"] = ("Fitness", new[] { "Gym Membership", "Equipment", "Classes" }),
            ["food"] = ("Food", new[] { "Grocery", "Restaurant", "Delivery" }),
            ["cash-withdrawal"] = ("Cash Withdrawal", new[] { "ATM", "Bank Withdrawal" }),
            ["transfers"] = ("Transfers", new[] { "Internal Transfer", "External Transfer" }),
            ["entertainment"] = ("Entertainment", new[] { "Streaming", "Movies", "Games" })
        };

        public TransactionCategorizer(IConfiguration configuration)
        {
            _openAIClient = new OpenAIClient(configuration["OpenAI:ApiKey"]);
            _modelName = configuration["OpenAI:ModelName"] ?? "gpt-3.5-turbo";
        }

        public async Task<(string CategoryId, string Subcategory)> CategorizeSingleTransactionAsync(
            string description, decimal amount)
        {
            try
            {
                description = description.ToLower();
                Console.WriteLine($"\nProcessing transaction: {description} (${amount})");

                // Fast lookup for common patterns
                if (description.Contains("greenlight"))
                {
                    return ("digital-payments", "Greenlight");
                }
                if (description.Contains("american express"))
                {
                    return ("credit-card", "AMEX");
                }
                if (description.Contains("teco"))
                {
                    return ("utilities", "Electric");
                }
                if (description.Contains("tampa ut"))
                {
                    return ("utilities", "City Services");
                }
                if (description.Contains("payroll") || description.Contains("ultimatesoftware"))
                {
                    return ("income", "Salary");
                }
                if (description.Contains("loan care"))
                {
                    return ("housing", "Mortgage");
                }
                if (description.Contains("atm"))
                {
                    return ("cash-withdrawal", "ATM");
                }
                if (description.Contains("venmo"))
                {
                    return ("digital-payments", "Venmo");
                }
                if (description.Contains("paypal"))
                {
                    return ("digital-payments", "PayPal");
                }
                if (description.Contains("crunch fit"))
                {
                    return ("fitness", "Gym Membership");
                }

                if (description.Contains("visa check card"))
                {
                    return ("visa-card", "Visa");
                }

                if (description.Contains("check"))
                {
                    return ("check", "Check");
                }

                if (description.Contains("dividend"))
                {
                    return ("income", "Interest");
                }

                // Only call API for unmatched patterns
                Console.WriteLine("→ No basic match found, calling OpenAI API...");
                
                var prompt = $"""
            Categorize this bank transaction concisely.
            Available categories and subcategories:
            {string.Join("\n", CategoryMap.Select(kvp => $"{kvp.Key}: {string.Join(", ", kvp.Value.Subcategories)}"))}
            
            Transaction: "{description}" for ${Math.Abs(amount)}
            Response format: "category-id|subcategory"
            """;

                var chatCompletionsOptions = new ChatCompletionsOptions
                {
                    Messages = { new ChatMessage(ChatRole.User, prompt) },
                    MaxTokens = 60,
                    Temperature = (float?)0.3
                };

                try
                {
                    var response = await _openAIClient.GetChatCompletionsAsync(
                        _modelName, chatCompletionsOptions);

                    var result = response.Value.Choices[0].Message.Content.Trim();
                    Console.WriteLine($"→ OpenAI categorized as: {result}");

                    var parts = result.Split('|');
                    return (parts[0], parts.Length > 1 ? parts[1] : "Other");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"→ OpenAI categorization failed: {ex.Message}");
                    return ("other", "Other");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"→ ERROR in categorization: {ex.Message}");
                return ("other", "Uncategorized");
            }
        }

        public async Task<Dictionary<string, string>> SuggestCategoryUpdatesAsync(
            IEnumerable<Transaction> transactions)
        {
            var sampleTransactions = transactions
                .GroupBy(t => t.Description)
                .Select(g => g.First())
                .Take(10);  // Process in small batches

            var suggestions = new Dictionary<string, string>();

            foreach (var transaction in sampleTransactions)
            {
                var (categoryId, subcategory) = await CategorizeSingleTransactionAsync(
                    transaction.Description, transaction.Amount);

                if (categoryId != transaction.CategoryId)
                {
                    suggestions[transaction.Description] = categoryId;
                }
            }

            return suggestions;
        }
    }
}