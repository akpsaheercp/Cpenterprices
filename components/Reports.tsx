
import React, { useContext } from 'react';
import { BusinessData, Currency, FilterConfig } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ThemeContext } from '../App';

interface ReportsProps {
  data: BusinessData;
  currency: Currency;
  filterConfig: FilterConfig;
}

const Reports: React.FC<ReportsProps> = ({ data, currency, filterConfig }) => {
  const { isDark } = useContext(ThemeContext);

  const isWithinPeriod = (date: string) => {
    if (filterConfig.year && filterConfig.month) {
      const [y, m] = date.split('-');
      return y === filterConfig.year && m === filterConfig.month;
    } else if (filterConfig.year) {
      return date.startsWith(filterConfig.year);
    } else if (filterConfig.month) {
      const [, m] = date.split('-');
      return m === filterConfig.month;
    } else {
      if (filterConfig.dateRange.start && date < filterConfig.dateRange.start) return false;
      if (filterConfig.dateRange.end && date > filterConfig.dateRange.end) return false;
      return true;
    }
  };

  const filteredInvoices = data.invoices.filter(i => isWithinPeriod(i.date));
  const filteredPurchases = data.purchases.filter(p => isWithinPeriod(p.date));
  const filteredExpenses = data.expenses.filter(e => isWithinPeriod(e.date));

  const totalSales = filteredInvoices.reduce((acc, i) => acc + i.totalAmount, 0);
  const totalPurchases = filteredPurchases.reduce((acc, p) => acc + p.totalAmount, 0);
  const totalExpenses = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);

  const profitLossData = [
    { name: 'Sales', amount: totalSales },
    { name: 'Purchases', amount: totalPurchases },
    { name: 'Expenses', amount: totalExpenses }
  ];

  const productSales = filteredInvoices.flatMap(i => i.items).reduce((acc: Record<string, number>, item) => {
    acc[item.productName] = (acc[item.productName] || 0) + item.quantity;
    return acc;
  }, {} as Record<string, number>);

  const categoryCount = data.products.reduce((acc: Record<string, number>, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const categoryData = Object.entries(categoryCount).map(([name, value]) => ({ name, value }));
  const COLORS = ['#DDF676', '#141414', '#9CA3AF', '#FCA5A5', '#818CF8'];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <div className="flex items-center gap-2 mb-1">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Statistics</h2>
            <span className="w-2.5 h-2.5 rounded-full bg-lime"></span>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Visual insights into your business performance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bento-card bg-light-surface/70 dark:bg-dark-surface/70 p-8 min-h-[400px]">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Income vs Outflow</h3>
          <div className="w-full" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={profitLossData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#374151" : "#f0f0f0"} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} stroke={isDark ? "#9ca3af" : "#6b7280"} />
                <YAxis axisLine={false} tickLine={false} stroke={isDark ? "#9ca3af" : "#6b7280"} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="amount" fill="#DDF676" radius={[6, 6, 6, 6]} barSize={60} />
                </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bento-card bg-light-surface/70 dark:bg-dark-surface/70 p-8 min-h-[400px]">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Inventory Categories</h3>
          <div className="w-full" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={5} dataKey="value" stroke="none">
                    {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Legend />
                </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
