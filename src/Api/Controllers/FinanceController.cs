using Microsoft.AspNetCore.Mvc;
using Core.Interfaces;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FinanceController : ControllerBase
    {
        private readonly IFinanceAnalyzer _financeAnalyzer;
        private readonly ITransactionStore _transactionStore;
        private readonly ICategoryService _categoryService;

        public FinanceController(
            IFinanceAnalyzer financeAnalyzer,
            ITransactionStore transactionStore,
            ICategoryService categoryService)
        {
            _financeAnalyzer = financeAnalyzer;
            _transactionStore = transactionStore;
            _categoryService = categoryService;
        }

        [HttpPost("analyze")]
        public async Task<IActionResult> AnalyzeTransactions(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            try
            {
                using var stream = file.OpenReadStream();
                var analysis = await _financeAnalyzer.AnalyzeTransactionsAsync(stream);

                // Store transactions for later retrieval
                await _transactionStore.AddTransactionsAsync(analysis.Transactions);

                return Ok(analysis);
            }
            catch (FormatException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("transactions/{categoryId}")]
        public async Task<IActionResult> GetTransactionsByCategory(string categoryId)
        {
            try
            {
                var category = await _categoryService.GetCategoryByIdAsync(categoryId);
                if (category == null)
                    return NotFound($"Category with ID {categoryId} not found");

                var transactions = await _transactionStore.GetByCategoryIdAsync(categoryId);
                var summary = await _transactionStore.GetSummaryByCategoryIdAsync(categoryId);

                return Ok(new
                {
                    category,
                    transactions,
                    summary
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _categoryService.GetAllCategoriesAsync();
            return Ok(categories);
        }
    }
}