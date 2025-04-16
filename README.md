# AiBank - Personal Finance Analyzer

AiBank is a full-stack application for analyzing personal bank transactions with AI-powered categorization. The application allows users to upload bank transaction data (in CSV format), automatically categorizes transactions, and provides visual insights into spending patterns.

## Technology Stack

### Frontend
- **Framework**: Next.js 
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Data Visualization**: Recharts
- **Build Tools**: ESLint, PostCSS, Autoprefixer

### Backend
- **.NET Core**: C# ASP.NET Core Web API
- **Architecture**: Clean Architecture pattern with Core, Infrastructure, and API layers
- **AI Integration**: Azure OpenAI SDK for transaction categorization
- **Documentation**: Swagger/OpenAPI

## Project Structure

The project is organized into three main parts:

### Backend (.NET Core)

- **Core**: Contains domain models, interfaces, and business logic
  - Models (Transaction, Category, etc.)
  - Interfaces (ITransactionStore, ICategoryService, etc.)
  - Core business logic (FinanceAnalyzer)

- **Infrastructure**: Implements interfaces defined in Core
  - Data access services
  - External service integrations
  - AI-powered transaction categorization

- **API**: ASP.NET Core Web API
  - Controllers for handling HTTP requests
  - Dependency registration
  - API endpoints for data analysis

### Frontend (Next.js)

- **Components**: Reusable UI components
  - Charts (PieChart, BarChart)
  - Transaction detail views
  
- **Types**: TypeScript type definitions
- **Utils**: Helper functions and API calls
- **Pages**: Main application pages

## Features

- **Transaction Analysis**
  - Upload and parse bank transaction CSV files
  - Calculate total income, expenses, and net cash flow
  - Generate spending insights

- **AI-Powered Categorization**
  - Rule-based categorization for common transactions
  - OpenAI integration for advanced categorization
  - Category and subcategory mapping

- **Data Visualization**
  - Pie chart for spending by category
  - Line chart for monthly cash flow trends
  - Bar chart for transaction details by subcategory

- **Transaction Management**
  - View transactions by category
  - Detailed transaction history
  - Data masking for sensitive information

## Getting Started

### Prerequisites
- .NET 8.0 SDK
- Node.js 18+ and npm

### Backend Setup
1. Navigate to the API project directory:
   ```
   cd src/Api
   ```
2. Run the API:
   ```
   dotnet run
   ```
3. API will be available at `http://localhost:5077`

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Run the development server:
   ```
   npm run dev
   ```
4. Frontend will be available at `http://localhost:3000`

## Usage

1. Start both the backend API and frontend development server
2. Open your browser to `http://localhost:3000`
3. Use the file upload button to select a CSV file of your bank transactions
4. View the analysis results, including spending by category and monthly trends
5. Click on categories to see detailed transaction information
6. Toggle the "Hide Values" button to mask sensitive financial information

## License

This project is licensed under the MIT License.