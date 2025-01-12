// src/Core/Services/CategoryMapper.cs
using System.Text.RegularExpressions;

namespace Core.Services
{
    public class CategoryMapper
    {
        private readonly Dictionary<string, List<(string Pattern, decimal? MinAmount, decimal? MaxAmount)>> _categoryRules = new()
        {
            ["Salary Income"] = new()
            {
                ("ULTIMATESOFTWARE", null, null)
            },

            ["Interest Income"] = new()
            {
                ("Dividend 0.049%", null, null),
                ("Interest", null, null)
            },

            ["Internal Transfer"] = new()
            {
                ("Home Banking Transfer", null, null),
                ("Deposit Home Banking", null, null)
            },

            ["Housing - Mortgage"] = new()
            {
                ("LOAN CARE SERVIC", 3000M, null)
            },

            ["Utilities - Power/Gas"] = new()
            {
                ("TECO/PEOPLE GAS", null, null)
            },

            ["Utilities - City Services"] = new()
            {
                ("CITY OF TAMPA UT", null, null)
            },

            ["Credit Card Payment"] = new()
            {
                ("AMERICAN EXPRESS", null, null)
            },

            ["Digital Payments - GREENLIGHT"] = new()
            {
                ("GREENLIGHT", null, null)
            },

            ["Digital Payments - Other"] = new()
            {
                ("VENMO", null, null),
                ("PAYPAL", null, null)
            },

            ["Cash Withdrawal"] = new()
            {
                ("ATM #", null, null)
            },

            ["Healthcare"] = new()
            {
                ("ADVENTHEALTH", null, null),
                ("WATERMARK MEDICA", null, null),
                ("LABORATORY CORP", null, null)
            },

            ["Utilities - Phone"] = new()
            {
                ("VERIZON", null, null)
            },

            ["Banking Fees"] = new()
            {
                ("BANK OF AMERICA", 0M, 100M)
            },

            ["Investment Transfer"] = new()
            {
                ("WF ADVISORS", null, null)
            },

            ["International"] = new()
            {
                ("INTERNATIONAL CO", null, null)
            },

            ["Fitness"] = new()
            {
                ("CRUNCH FIT", null, null)
            }
        };

        public string CategorizeTransaction(string description, decimal amount)
        {
            if (string.IsNullOrEmpty(description))
                return "Uncategorized";

            // First check if it's a check payment
            if (description.Equals("check", StringComparison.OrdinalIgnoreCase))
            {
                return amount > 1000M ? "Check - Large" : "Check - Regular";
            }

            // Then try our category rules
            foreach (var category in _categoryRules)
            {
                foreach (var (pattern, minAmount, maxAmount) in category.Value)
                {
                    if (Regex.IsMatch(description, pattern, RegexOptions.IgnoreCase))
                    {
                        var absAmount = Math.Abs(amount);
                        if (minAmount.HasValue && absAmount < minAmount.Value)
                            continue;

                        if (maxAmount.HasValue && absAmount > maxAmount.Value)
                            continue;

                        return category.Key;
                    }
                }
            }

            // Special handling for Visa Card transactions
            if (description.Contains("Visa", StringComparison.OrdinalIgnoreCase))
            {
                return Math.Abs(amount) > 100M ?
                    "Credit Card - Shopping Large" :
                    "Credit Card - Shopping Small";
            }

            // Handle other withdrawals and deposits
            if (description.Contains("Withdrawal", StringComparison.OrdinalIgnoreCase))
            {
                var absAmount = Math.Abs(amount);
                if (absAmount > 5000M) return "Large Transaction";
                if (absAmount > 1000M) return "Medium Transaction";
                return "Small Transaction";
            }

            return "Uncategorized";
        }
    }
}