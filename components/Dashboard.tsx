
import React, { useContext, useMemo } from 'react';
import { BusinessData, Currency, FilterConfig } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Package, DollarSign, AlertCircle, ShoppingBag, ArrowUpRight, Clock, Calendar, ChevronRight } from 'lucide-react';
import { ThemeContext } from '../App';

interface DashboardProps {
  data: BusinessData;
  currency: Currency;
  filterConfig: FilterConfig;
}

const Dashboard: React.FC<DashboardProps> = ({ data, currency, filterConfig }) => {
  const { isDark } = useContext(ThemeContext);

  // Helper to check if a transaction record matches global filters (Time, Party, Product)
  const matchesGlobalFilter = (date: string, partyId?: string, items?: any[]) => {
    if (!date) return false;
    
    // 1. Time Check
    if (filterConfig.year && filterConfig.month) {
      const parts = date.split('-');
      if (parts.length < 2) return false;
      const [y, m] = parts;
      if (y !== filterConfig.year || m !== filterConfig.month) return false;
    } else if (filterConfig.year) {
      if (!date.startsWith(filterConfig.year)) return false;
    } else if (filterConfig.month) {
      const parts = date.split('-');
      if (parts.length < 2) return false;
      const [, m] = parts;
      if (m !== filterConfig.month) return false;
    } else {
      if (filterConfig.dateRange.start && date < filterConfig.dateRange.start) return false;
      if (filterConfig.dateRange.end && date > filterConfig.dateRange.end) return false;
    }

    // 2. Party Check
    if (filterConfig.partyId && partyId !== filterConfig.partyId) return false;

    // 3. Product Check
    if (filterConfig.productId && items) {
      const hasProduct = items.some(item => item.productId === filterConfig.productId);
      if (!hasProduct) return false;
    }

    return true;
  };

  const filteredInvoices = useMemo(() => 
    data.invoices.filter(inv => matchesGlobalFilter(inv.date, inv.partyId, inv.items)), 
  [data.invoices, filterConfig]);

  const filteredPurchases = useMemo(() => 
    data.purchases.filter(p => matchesGlobalFilter(p.date, p.partyId, p.items)), 
  [data.purchases, filterConfig]);

  const filteredExpenses = useMemo(() => 
    data.expenses.filter(e => {
        // Expenses don't usually have a product list or party link in the simple schema
        if (filterConfig.productId || filterConfig.partyId) return false; 
        return matchesGlobalFilter(e.date);
    }), 
  [data.expenses, filterConfig]);

  // 1. KPI Metrics
  const totalRevenue = filteredInvoices.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalCost = filteredPurchases.reduce((acc, curr) => acc + curr.totalAmount, 0) + filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const netProfit = totalRevenue - totalCost;
  const totalOrders = filteredInvoices.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const lowStockCount = data.products.filter(p => p.stockQuantity <= p.minStockLevel).length;

  const formatValue = (val: number) => val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // 2. Chart Data
  const chartData = useMemo(() => {
      const dateMap: Record<string, { date: string, income: number, expense: number }> = {};
      
      filteredInvoices.forEach(i => {
          if (!i.date) return;
          if (!dateMap[i.date]) dateMap[i.date] = { date: i.date, income: 0, expense: 0 };
          dateMap[i.date].income += i.totalAmount;
      });
      
      filteredPurchases.forEach(p => {
          if (!p.date) return;
          if (!dateMap[p.date]) dateMap[p.date] = { date: p.date, income: 0, expense: 0 };
          dateMap[p.date].expense += p.totalAmount;
      });

      filteredExpenses.forEach(e => {
          if (!e.date) return;
          if (!dateMap[e.date]) dateMap[e.date] = { date: e.date, income: 0, expense: 0 };
          dateMap[e.date].expense += e.amount;
      });

      const sortedKeys = Object.keys(dateMap).sort();
      const sliceSize = (filterConfig.month || filterConfig.year || filterConfig.dateRange.start || filterConfig.partyId || filterConfig.productId) ? sortedKeys.length : 10; 
      
      return sortedKeys.slice(-sliceSize).map(key => dateMap[key]);
  }, [filteredInvoices, filteredPurchases, filteredExpenses, filterConfig]);

  // 3. Top Products
  const topProducts = useMemo(() => {
      const counts: Record<string, number> = {};
      filteredInvoices.forEach(inv => {
          inv.items.forEach(item => {
              if (filterConfig.productId && item.productId !== filterConfig.productId) return;
              counts[item.productName] = (counts[item.productName] || 0) + item.quantity;
          });
      });
      return Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(([name, qty]) => ({ name, qty }));
  }, [filteredInvoices, filterConfig.productId]);

  // 4. Expense Categories
  const expenseData = useMemo(() => {
      const cats: Record<string, number> = {};
      filteredExpenses.forEach(e => {
          if (!e.category) return;
          cats[e.category] = (cats[e.category] || 0) + e.amount;
      });
      return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [filteredExpenses]);

  const StatCard = ({ title, value, subtitle, icon: Icon, trend, colorClass, cardBgClass }: any) => (
    <div className={`p-6 flex flex-col justify-between h-full hover:scale-[1.02] transition-transform rounded-3xl ${cardBgClass || 'bento-card'}`}>
        <div className="flex justify-between items-start mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorClass}`}>
                <Icon className="w-6 h-6" />
            </div>
            {trend && (
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} flex items-center gap-1`}>
                    {trend === 'up' ? 'Active' : 'Alert'}
                </span>
            )}
        </div>
        <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1">{value}</h3>
            <p className="text-xs text-gray-500 font-medium">{subtitle}</p>
        </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
              <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">Overview</h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Insights based on your global filters.</p>
          </div>
          <div className="flex items-center gap-2 bento-card px-4 py-2 rounded-full shadow-sm text-sm font-bold text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Revenue" 
            value={`${currency} ${formatValue(totalRevenue)}`} 
            subtitle={`${totalOrders} orders matched`}
            icon={DollarSign}
            colorClass="bg-lime text-black"
            trend="up"
          />
          <StatCard 
            title="Net Profit" 
            value={`${currency} ${formatValue(netProfit)}`} 
            subtitle="Result for selected period"
            icon={TrendingUp}
            colorClass="bg-black text-white dark:bg-white dark:text-black"
            trend={netProfit > 0 ? 'up' : 'down'}
          />
          <StatCard 
            title="Average Order" 
            value={`${currency} ${formatValue(averageOrderValue)}`} 
            subtitle="Per customer transaction"
            icon={ShoppingBag}
            colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          />
          <StatCard 
            title="Low Stock" 
            value={lowStockCount} 
            subtitle="Items requiring attention"
            icon={AlertCircle}
            colorClass="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
            trend="down"
            cardBgClass="bento-card bg-red-50 dark:bg-red-900/10 rounded-3xl"
          />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bento-card p-8 rounded-3xl flex flex-col">
              <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Trend Analysis</h3>
                  <div className="flex gap-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500"><span className="w-3 h-3 rounded-full bg-lime"></span> Income</div>
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500"><span className="w-3 h-3 rounded-full bg-black dark:bg-gray-600"></span> Outflow</div>
                  </div>
              </div>
              <div className="w-full" style={{ minHeight: '350px' }}>
                <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#DDF676" stopOpacity={0.8}/><stop offset="95%" stopColor="#DDF676" stopOpacity={0}/></linearGradient>
                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#374151" stopOpacity={0.3}/><stop offset="95%" stopColor="#374151" stopOpacity={0}/></linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#333" : "#f3f3f3"} />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} />
                        <Tooltip 
                            formatter={(value: number) => [formatValue(value), '']}
                            contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} 
                            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }} 
                        />
                        <Area type="monotone" dataKey="income" stroke="#DDF676" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                        <Area type="monotone" dataKey="expense" stroke={isDark ? "#9CA3AF" : "#1F2937"} strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                    </AreaChart>
                </ResponsiveContainer>
              </div>
          </div>

          <div className="space-y-6">
              <div className="bento-card p-6 rounded-3xl">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Trending {filterConfig.productId ? 'Stats' : 'Items'}</h3>
                  <div className="space-y-4">
                      {topProducts.map((p, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-white/5 group hover:bg-lime/10 transition-colors">
                              <div className="flex items-center gap-3">
                                  <span className="w-8 h-8 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-xs font-bold text-gray-500 shadow-sm">{i+1}</span>
                                  <div>
                                      <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{p.name}</p>
                                      <p className="text-[10px] text-gray-400 font-bold uppercase">{p.qty} units</p>
                                  </div>
                              </div>
                              <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-lime-600 transition-colors" />
                          </div>
                      ))}
                      {topProducts.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No data matches filters.</p>}
                  </div>
              </div>

              <div className="bento-card p-6 rounded-3xl">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Cost Distribution</h3>
                  <div className="w-full" style={{ minHeight: '160px' }}>
                    <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={expenseData} layout="vertical" margin={{ left: 0, right: 20 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 10, fill: '#9CA3AF'}} axisLine={false} tickLine={false} />
                            <Tooltip formatter={(value: number) => formatValue(value)} cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px' }} />
                            <Bar dataKey="value" fill="#1F2937" radius={[0, 4, 4, 0]} barSize={20}>
                                {expenseData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#DDF676' : '#1F2937'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
