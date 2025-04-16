import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '../utils/formatters';
import { COLORS } from '../utils/colors';

interface PieChartComponentProps {
  analysis: any;
  onClick: (category: string) => void;
  isMasked: boolean;
}

export const PieChartComponent = ({ analysis, onClick, isMasked }: PieChartComponentProps) => {
  const getPieChartData = () => {
    if (!analysis?.spendingByCategory) return [];
    return Object.entries(analysis.spendingByCategory)
      .filter(([_, value]) => value > 1000)
      .map(([name, value]) => ({
        name,
        value: Math.abs(value),
        displayName: `${name}: ${formatCurrency(Math.abs(value), isMasked)}`
      }))
      .sort((a, b) => b.value - a.value);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Spending by Category</h2>
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-600 rounded mr-2"></div>
          <span>Income</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-600 rounded mr-2"></div>
          <span>Expenses</span>
        </div>
      </div>
      <div className="h-[400px]">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={getPieChartData()}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={150}
              label={({ displayName }) => displayName}
              onClick={(data) => onClick(data.name)}
              className="cursor-pointer"
            >
              {getPieChartData().map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => formatCurrency(value as number, isMasked)}
              contentStyle={{ display: 'none' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};