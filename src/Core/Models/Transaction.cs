// src/Core/Models/Transaction.cs
namespace Core.Models
{
    public class Transaction
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public DateTime Date { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string CategoryId { get; set; } = string.Empty;
        public decimal Balance { get; set; }
        public string? Memo { get; set; }
        public bool IsCredit => Amount > 0;
    }
}