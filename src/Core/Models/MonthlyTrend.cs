namespace Core.Models
{
    public class MonthlyTrend
    {
        public DateTime Month { get; set; }
        public decimal Income { get; set; }
        public decimal Expenses { get; set; }
        public decimal Savings { get; set; }
        public Dictionary<string, decimal> TopCategories { get; set; }
    }
}
