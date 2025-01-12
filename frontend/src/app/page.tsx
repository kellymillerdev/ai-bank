'use client';

import { useState, useEffect } from 'react';
import { 
    PieChart, 
    Pie, 
    LineChart, 
    Line, 
    BarChart, 
    Bar,
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer, 
    Cell 
} from 'recharts';

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface CategoryMap {
  [name: string]: string;
}

interface Transaction {
  date: string;
  description: string;
  amount: number;
  category: string;
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
  date: string;
  description: string;
  amount: number;
  category: string;
  balance: number;
}

const COLORS = [
  '#2563eb', // Blue
  '#dc2626', // Red
  '#16a34a', // Green
  '#d97706', // Orange
  '#7c3aed', // Purple
  '#2dd4bf', // Teal
  '#f59e0b', // Amber
  '#ec4899', // Pink
];

export default function Home() {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isMasked, setIsMasked] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryTransactions, setCategoryTransactions] = useState<TransactionDetail[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryMap, setCategoryMap] = useState<CategoryMap>({});

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:5077/api/Finance/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data);
        
        // Create mapping from names to IDs
        const mapping: CategoryMap = {};
        data.forEach((cat: Category) => {
          mapping[cat.name.toLowerCase()] = cat.id;
        });
        setCategoryMap(mapping);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    setLoading(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5077/api/Finance/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to analyze file');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = async (categoryNameOrId: string) => {
    setIsLoadingDetails(true);
    
    try {
        // First try using the input as an ID, if not found, try to look it up in the map
        const categoryId = categoryMap[categoryNameOrId.toLowerCase()] || categoryNameOrId;
        
        console.log('Fetching category:', categoryId); // Debug log
        
        const response = await fetch(`http://localhost:5077/api/Finance/transactions/${encodeURIComponent(categoryId)}`, {
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server response:', errorText); // Debug log
            throw new Error(`Failed to fetch transactions: ${errorText}`);
        }

        const data = await response.json();
        setSelectedCategory(categoryNameOrId);
        setCategoryTransactions(data.transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        alert('Failed to load transaction details');
    } finally {
        setIsLoadingDetails(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (isMasked) return "••••••";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPieChartData = () => {
    if (!analysis?.spendingByCategory) return [];
    return Object.entries(analysis.spendingByCategory)
      .filter(([_, value]) => value > 1000)
      .map(([name, value]) => ({
        name,
        value,
        displayName: isMasked ? `${name}: ••••••` : `${name}: ${formatCurrency(value)}`
      }))
      .sort((a, b) => b.value - a.value);
  };

  const getMonthlyTrendData = () => {
    if (!analysis?.monthlyTrends) return [];
    return analysis.monthlyTrends.map(trend => ({
      name: new Date(trend.month).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      Income: trend.income,
      Expenses: trend.expenses,
      NetFlow: trend.savings
    }));
  };

  const TransactionDetails = ({ 
    category, 
    transactions
}: { 
    category: string, 
    transactions: TransactionDetail[] 
}) => {
    // Group transactions by description pattern to identify subcategories
    const getSubcategory = (description: string) => {
        description = description.toLowerCase();
        if (description.includes('teco')) return 'Electric (TECO)';
        if (description.includes('tampa ut')) return 'City Utilities';
        if (description.includes('american express')) return 'AMEX';
        if (description.includes('venmo')) return 'Venmo';
        if (description.includes('greenlight')) return 'Greenlight';
        return 'Other';
    };

    // Prepare data for chart - group by day and subcategory
    const chartData = transactions
        .map(t => ({
            date: new Date(t.date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric'
            }),
            amount: Math.abs(t.amount),
            rawDate: new Date(t.date),
            subcategory: getSubcategory(t.description)
        }))
        .reduce((acc: any[], curr) => {
            const existing = acc.find(item => 
                item.date === curr.date && 
                item.subcategory === curr.subcategory
            );
            if (existing) {
                existing.amount += curr.amount;
            } else {
                acc.push(curr);
            }
            return acc;
        }, [])
        .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());

    // Get unique subcategories
    const subcategories = [...new Set(chartData.map(d => d.subcategory))];

    // Colors for subcategories
    const subcategoryColors = {
        'Electric (TECO)': '#2563eb',
        'City Utilities': '#16a34a',
        'AMEX': '#dc2626',
        'Venmo': '#7c3aed',
        'Greenlight': '#f59e0b',
        'Other': '#94a3b8'
    };

    // Reshape data for stacked bar chart
    const barChartData = Object.entries(
        chartData.reduce((acc: any, curr) => {
            if (!acc[curr.date]) {
                acc[curr.date] = { date: curr.date };
            }
            acc[curr.date][curr.subcategory] = curr.amount;
            return acc;
        }, {})
    ).map(([date, data]) => ({ ...data as object, date }));

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            {/* Header section - keep existing code */}
            <div className="flex justify-between items-center mb-6">
                {/* ... */}
            </div>

            {/* Stats Cards - keep existing code */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {/* ... */}
            </div>

            {/* Updated Chart Section */}
            <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">Amount Trend</h3>
                <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => formatCurrency(value)}
                            />
                            <Tooltip 
                                formatter={(value) => formatCurrency(value as number)}
                                labelStyle={{ color: '#111' }}
                            />
                            <Legend />
                            {subcategories.map((subcat, index) => (
                                <Bar 
                                    key={subcat}
                                    dataKey={subcat}
                                    stackId="a"
                                    fill={subcategoryColors[subcat as keyof typeof subcategoryColors] || COLORS[index]}
                                    name={subcat}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Transaction List - Updated to show subcategories */}
            <div>
                <h3 className="text-lg font-medium mb-4">Transaction History</h3>
                <div className="divide-y divide-gray-200">
                    {transactions
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((transaction, index) => (
                        <div key={index} className="py-4 hover:bg-gray-50 transition-colors rounded-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-medium">
                                        {new Date(transaction.date).toLocaleDateString()}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {transaction.description}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {getSubcategory(transaction.description)}
                                    </div>
                                </div>
                                <div className={`font-medium ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {formatCurrency(transaction.amount)}
                                </div>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                                Balance: {formatCurrency(transaction.balance)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
  };
  
  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={getPieChartData()}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={150}
          label={({ displayName }) => displayName}
          onClick={(data) => handleCategoryClick(data.name)}
          className="cursor-pointer"
        >
          {getPieChartData().map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => formatCurrency(value as number)}
          contentStyle={{ display: 'none' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">AiBank Analysis</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMasked(!isMasked)}
              className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              {isMasked ? 'Show Values' : 'Hide Values'}
            </button>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="block w-64 text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-violet-50 file:text-violet-700
                hover:file:bg-violet-100"
            />
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-700"></div>
          </div>
        )}

        {analysis && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-500">Total Income</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {formatCurrency(analysis.totalIncome)}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-500">Total Expenses</h3>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {formatCurrency(analysis.totalExpenses)}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-500">Net Cash Flow</h3>
                <p className={`text-3xl font-bold mt-2 ${analysis.netCashFlow >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(analysis.netCashFlow)}
                </p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Spending by Category</h2>
                <div className="h-[400px]">
                  {renderPieChart()}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Monthly Cash Flow</h2>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getMonthlyTrendData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                      <Line type="monotone" dataKey="Income" stroke="#16a34a" strokeWidth={2} />
                      <Line type="monotone" dataKey="Expenses" stroke="#dc2626" strokeWidth={2} />
                      <Line type="monotone" dataKey="NetFlow" stroke="#2563eb" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Transaction Details */}
            {selectedCategory && (
              <TransactionDetails 
                category={selectedCategory} 
                transactions={categoryTransactions}
              />
            )}

            {/* Regular Expenses & Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Regular Monthly Expenses</h2>
                <div className="space-y-4">
                  {analysis.insights
                    .filter(insight => insight.includes("occurs"))
                    .map((insight, index) => {
                      // Clean up the category name extraction
                      const category = insight.split(':')[0]
                        .replace(/^[-\s]*/, '')  // Remove leading dashes and spaces
                        .trim()
                        .toLowerCase();

                      const isSelected = category === selectedCategory;
                      return (
                        <div 
                          key={index}
                          onClick={() => handleCategoryClick(category)}
                          className={`p-4 rounded-lg cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-50 hover:bg-blue-100' : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          {insight.replace(/\$[\d,\.]+/g, match => formatCurrency(parseFloat(match.slice(1))))}
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Financial Insights</h2>
                <div className="space-y-4">
                  {analysis.insights
                    .filter(insight => !insight.includes("occurs"))
                    .map((insight, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        {insight.replace(/\$[\d,\.]+/g, match => formatCurrency(parseFloat(match.slice(1))))}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}