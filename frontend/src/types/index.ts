interface Category {
  id: string;
  name: string;
  description?: string;
}

interface CategoryMap {
  [name: string]: string;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  memo: string;
  checkNumber: string;
}

interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

interface AnalysisData {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  spendingByCategory: Record<string, number>;
  monthlyTrends: MonthlyTrend[];
  insights: string[];
}

interface TransactionDetail {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  balance: number;
  memo: string;
  checkNumber: string;
}