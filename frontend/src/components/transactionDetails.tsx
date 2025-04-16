import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/formatters';
import { COLORS } from '../utils/colors';

interface TransactionDetailsProps {
  category: string;
  transactions: TransactionDetail[];
  isMasked: boolean;
}

export const TransactionDetails = ({ category, transactions, isMasked }: TransactionDetailsProps) => {
  const [selectedTransactionDate, setSelectedTransactionDate] = useState<string | null>(null);
  const getSubcategory = (trans: Transaction) => {
    let description = trans.description.toLowerCase();
    
    if (description.includes('withdrawal at')) {
      return trans.memo.split(" ")[0];
    }
    if (description.includes('withdrawal visa')) {
      return trans.memo.split(" ")[0];
    }
    if (description.includes('withdrawal crunch')) {
      return "Crunch Fit";
    }
    
    if (description.includes('teco')) return 'Electric (TECO)';
    if (description.includes('tampa ut')) return 'City Utilities';
    if (description.includes('american express')) return 'AMEX';
    if (description.includes('venmo')) return 'Venmo';
    if (description.includes('paypal')) return 'PayPal';
    if (description.includes('greenlight')) return 'Greenlight';
    if (description.includes('loan care')) return 'Housing';
    if (description.includes('check')) return trans.checkNumber;

    return 'Other';
  };

  const chartData = transactions
    .map(t => ({
      date: new Date(t.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      }),
      amount: Math.abs(t.amount),
      rawDate: new Date(t.date),
      subcategory: getSubcategory(t)
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

  const subcategories = [...new Set(chartData.map(d => d.subcategory))];

  const subcategoryColors = {
    'Electric (TECO)': '#2563eb',
    'City Utilities': '#16a34a',
    'AMEX': '#dc2626',
    'Venmo': '#7c3aed',
    'Greenlight': '#f59e0b',
    'Other': '#94a3b8'
  };

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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">{category} Details</h2>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">{category} Trend</h3>
        <div className="h-[400px]">
          <ResponsiveContainer>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => formatCurrency(value, isMasked)}
              />
              <Tooltip 
                formatter={(value) => formatCurrency(value as number, isMasked)}
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
                  onClick={(data) => {
                    if (data && data.payload) {
                      const clickedDate = data.payload.date;
                      const matchingTransaction = transactions.find(t => 
                        new Date(t.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        }) === clickedDate
                      );
                      if (matchingTransaction) {
                        setSelectedTransactionDate(matchingTransaction.date);
                        const element = document.getElementById(`transaction-${matchingTransaction.date}`);
                        element?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }
                  }}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Transaction History</h3>
        <div className="divide-y divide-gray-200">
          {transactions
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((transaction) => {
              const uniqueKey = `${transaction.date}-${transaction.amount}-${transaction.description.replace(/\s+/g, '')}-${transaction.memo || ''}-${transaction.checkNumber || ''}`;
              return (
                <div 
                  key={uniqueKey}
                  id={`transaction-${transaction.date}`}
                  className={`py-4 transition-colors rounded-lg ${
                    transaction.date === selectedTransactionDate 
                      ? 'bg-blue-50' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">
                        {new Date(transaction.date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.memo}
                        {transaction.checkNumber}
                      </div>
                      <div className="text-sm text-gray-600">
                        {transaction.description}
                      </div>
                    </div>
                    <div className={`font-medium ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(transaction.amount, isMasked)}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};