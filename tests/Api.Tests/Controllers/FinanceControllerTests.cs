using NUnit.Framework;
using Api.Controllers;
using Core.Interfaces;
using Core.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace Api.Tests.Controllers
{
    [TestFixture]
    public class FinanceControllerTests
    {
        private Mock<IFinanceAnalyzer> _financeAnalyzer;
        private Mock<ITransactionStore> _transactionStore;
        private Mock<ICategoryService> _categoryService;
        private FinanceController _controller;

        [SetUp]
        public void Setup()
        {
            _financeAnalyzer = new Mock<IFinanceAnalyzer>();
            _transactionStore = new Mock<ITransactionStore>();
            _categoryService = new Mock<ICategoryService>();

            _controller = new FinanceController(
                _financeAnalyzer.Object,
                _transactionStore.Object,
                _categoryService.Object
            );
        }

        [Test]
        public async Task AnalyzeTransactions_WithValidCsv_ReturnsAnalysis()
        {
            // Arrange
            var csvContent = "Date,Description,Amount\n2024-01-01,Test Transaction,100.00";
            var csvStream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(csvContent));
            var file = new FormFile(csvStream, 0, csvStream.Length, "test", "test.csv");

            var expectedAnalysis = new TransactionAnalysis
            {
                TotalIncome = 100.00M,
                TotalExpenses = 0M,
                NetCashFlow = 100.00M,
                Transactions = new List<Transaction>()  // Add empty list to avoid null ref
            };

            _financeAnalyzer
                .Setup(x => x.AnalyzeTransactionsAsync(It.IsAny<Stream>()))
                .ReturnsAsync(expectedAnalysis);

            // Act
            var actionResult = await _controller.AnalyzeTransactions(file);
            var okResult = actionResult as OkObjectResult;

            // Assert
            Assert.That(okResult, Is.Not.Null);
            Assert.That(okResult.Value, Is.EqualTo(expectedAnalysis));
            _financeAnalyzer.Verify(x => x.AnalyzeTransactionsAsync(It.IsAny<Stream>()), Times.Once);
            _transactionStore.Verify(x => x.AddTransactionsAsync(It.IsAny<IEnumerable<Transaction>>()), Times.Once);
        }

        [Test]
        public async Task AnalyzeTransactions_WithEmptyFile_ReturnsBadRequest()
        {
            // Arrange
            var file = new FormFile(new MemoryStream(), 0, 0, "test", "test.csv");

            // Act
            var result = await _controller.AnalyzeTransactions(file);

            // Assert
            Assert.That(result, Is.TypeOf<BadRequestObjectResult>());
        }

        [Test]
        public async Task GetTransactionsByCategory_WithValidCategory_ReturnsTransactions()
        {
            // Arrange
            var categoryId = "test-category";
            var category = new Category { Id = categoryId, Name = "Test Category" };
            var transactions = new List<Transaction>
            {
                new Transaction { CategoryId = categoryId, Amount = 100M }
            };
            var summary = new TransactionSummary { TotalAmount = 100M };

            _categoryService.Setup(x => x.GetCategoryByIdAsync(categoryId)).ReturnsAsync(category);
            _transactionStore.Setup(x => x.GetByCategoryIdAsync(categoryId)).ReturnsAsync(transactions);
            _transactionStore.Setup(x => x.GetSummaryByCategoryIdAsync(categoryId)).ReturnsAsync(summary);

            // Act
            var actionResult = await _controller.GetTransactionsByCategory(categoryId);
            var okResult = actionResult as OkObjectResult;

            // Assert
            Assert.That(okResult, Is.Not.Null);
            Assert.That(okResult.Value, Is.Not.Null);
        }
    }
}