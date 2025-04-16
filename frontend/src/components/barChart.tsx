import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/formatters';

interface BarChartComponentProps {
  analysis: any;
  isMasked: boolean;
}

export const BarChartComponent = ({ analysis, isMasked }: BarChartComponentProps) => {
  const getMonthlyTrendData = () => {
    if (!analysis?.monthlyTrends) return [];
    return analysis.monthlyTrends.map(trend => ({
      name: new Date(trend.month).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      Income: trend.income,
      Expenses: trend.expenses,
      NetFlow: trend.savings
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Monthly Cash Flow</h2>
      <div className="h-[400px]">
        <ResponsiveContainer>
          <LineChart data={getMonthlyTrendData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => formatCurrency(value, isMasked)} />
            <Tooltip formatter={(value) => formatCurrency(value as number, isMasked)} />
            <Legend />
            <Line type="monotone" dataKey="Income" stroke="#16a34a" strokeWidth={2} />
            <Line type="monotone" dataKey="Expenses" stroke="#dc2626" strokeWidth={2} />
            <Line type="monotone" dataKey="NetFlow" stroke="#2563eb" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};