namespace Core.Models
{
    public class TransactionSummary
    {
        public decimal TotalAmount { get; set; }
        public int TransactionCount { get; set; }
        public decimal AverageAmount { get; set; }
        public DateTime FirstTransaction { get; set; }
        public DateTime LastTransaction { get; set; }
        public Transaction? LargestTransaction { get; set; }
    }
}