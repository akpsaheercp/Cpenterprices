
import React, { useState } from 'react';
import { ManualTransaction, TransactionType, Currency, Invoice, Purchase, Expense, SortConfig, FilterConfig, User, Product } from '../types';
import { Plus, Trash2, ArrowUpRight, ArrowDownLeft, Filter, X, Calendar, DollarSign, Package, TrendingUp, Wallet, ArrowRightLeft, CreditCard, Layers2 } from 'lucide-react';

interface TransactionsProps {
  manualTransactions: ManualTransaction[];
  invoices: Invoice[];
  purchases: Purchase[];
  expenses: Expense[];
  products: Product[];
  currency: Currency;
  onAddTransaction: (txn: ManualTransaction) => void;
  onDeleteTransaction: (id: string) => void;
  searchTerm: string;
  sortConfig: SortConfig;
  filterConfig: FilterConfig;
  onFilterChange: (config: FilterConfig) => void;
  currentUser: User;
}

interface UnifiedTransaction {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  source: 'SYSTEM' | 'MANUAL';
  partyId?: string;
  productIds: string[];
  originalData?: any;
}

const Transactions: React.FC<TransactionsProps> = ({ 
    manualTransactions, invoices, purchases, expenses, products, currency, 
    onAddTransaction, onDeleteTransaction, 
    searchTerm, sortConfig, filterConfig, onFilterChange, currentUser 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [visibleCount, setVisibleCount] = useState(100);
  
  const [newTxn, setNewTxn] = useState<Partial<ManualTransaction>>({
    date: new Date().toISOString().split('T')[0],
    type: 'OTHER_EXPENSE',
    amount: 0,
    description: '',
    paymentMethod: 'CASH',
    category: ''
  });

  const canManage = currentUser.role === 'ADMIN' || (currentUser.permissions && currentUser.permissions.canManageExpenses);

  // Month names for filter display
  const monthNames: Record<string, string> = { '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec' };

  // Aggregation
  const sales: UnifiedTransaction[] = invoices.filter(i => i.status === 'PAID').map(i => ({
      id: i.id, date: i.date, category: 'Sale', description: `Invoice #${(i.invoiceNo || i.id || '').slice(0,8)} - ${i.customerName}`,
      amount: i.totalAmount, type: 'INCOME', source: 'SYSTEM',
      partyId: i.partyId, productIds: i.items.map(it => it.productId)
  }));

  const purchaseTxns: UnifiedTransaction[] = purchases.filter(p => p.status === 'PAID').map(p => ({
      id: p.id, date: p.date, category: 'Purchase', description: `Bill #${(p.id || '').slice(0,8)} - ${p.supplierName}`,
      amount: p.totalAmount, type: 'EXPENSE', source: 'SYSTEM',
      partyId: p.partyId, productIds: p.items.map(it => it.productId)
  }));

  const expenseTxns: UnifiedTransaction[] = expenses.map(e => ({
      id: e.id, date: e.date, category: e.category, description: e.description || e.category,
      amount: e.amount, type: 'EXPENSE', source: 'SYSTEM', productIds: []
  }));

  const manualTxns: UnifiedTransaction[] = manualTransactions.map(m => {
      const isIncome = ['LOAN_TAKEN', 'RENT_RECEIVED', 'OTHER_INCOME', 'CREDIT'].includes(m.type);
      return {
          id: m.id, date: m.date, category: m.category || m.type.replace('_', ' '), description: m.description,
          amount: m.amount, type: isIncome ? 'INCOME' : 'EXPENSE', source: 'MANUAL',
          productIds: [], originalData: m
      };
  });

  const allTransactions = [...sales, ...purchaseTxns, ...expenseTxns, ...manualTxns];

  // Filtering
  const filteredTransactions = allTransactions.filter(t => {
      if (activeTab !== 'ALL' && t.type !== activeTab) return false;
      
      const search = searchTerm.toLowerCase();
      const descMatch = t.description ? t.description.toLowerCase().includes(search) : false;
      const catMatch = t.category ? t.category.toLowerCase().includes(search) : false;
      
      if (!descMatch && !catMatch) return false;

      if (!t.date) return false;

      // Global Time Period
      if (filterConfig.year && filterConfig.month) {
          const parts = t.date.split('-');
          if (parts.length < 2) return false;
          const [y, m] = parts;
          if (y !== filterConfig.year || m !== filterConfig.month) return false;
      } else if (filterConfig.year) {
          if (!t.date.startsWith(filterConfig.year)) return false;
      } else if (filterConfig.month) {
          const parts = t.date.split('-');
          if (parts.length < 2) return false;
          const [, m] = parts;
          if (m !== filterConfig.month) return false;
      } else {
          if (filterConfig.dateRange.start && t.date < filterConfig.dateRange.start) return false;
          if (filterConfig.dateRange.end && t.date > filterConfig.dateRange.end) return false;
      }

      // Global Contact/Item Filter
      if (filterConfig.partyId && t.partyId !== filterConfig.partyId) return false;
      if (filterConfig.productId && !t.productIds.includes(filterConfig.productId)) return false;

      if (filterConfig.minAmount && t.amount < parseFloat(filterConfig.minAmount)) return false;
      if (filterConfig.maxAmount && t.amount > parseFloat(filterConfig.maxAmount)) return false;

      return true;
  }).sort((a, b) => {
      if (sortConfig.key === 'amount') return sortConfig.direction === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      if (sortConfig.key === 'name') return sortConfig.direction === 'asc' ? (a.category || '').localeCompare(b.category || '') : (b.category || '').localeCompare(a.category || '');
      
      const timeA = a.date ? new Date(a.date).getTime() : 0;
      const timeB = b.date ? new Date(b.date).getTime() : 0;
      return sortConfig.direction === 'asc' ? timeA - timeB : timeB - timeA;
  });

  const totalIn = filteredTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  const totalOut = filteredTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
  const net = totalIn - totalOut;

  const formatAmount = (val: number) => val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newTxn.amount || !newTxn.type) return;
      let displayCategory = newTxn.category;
      if (!displayCategory) {
          displayCategory = newTxn.type?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
      }
      onAddTransaction({
          id: crypto.randomUUID(),
          date: newTxn.date!,
          type: newTxn.type as TransactionType,
          category: displayCategory!,
          amount: Number(newTxn.amount),
          description: newTxn.description || '',
          paymentMethod: newTxn.paymentMethod as any
      });
      setIsModalOpen(false);
      setNewTxn({ date: new Date().toISOString().split('T')[0], type: 'OTHER_EXPENSE', amount: 0, description: '', paymentMethod: 'CASH', category: '' });
  };

  const handleDelete = (id: string) => {
      if (confirm("Delete this manual transaction?")) onDeleteTransaction(id);
  };

  const cardBase = "relative p-6 rounded-[22px] flex flex-col justify-between h-full transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border border-transparent";
  const inputClass = "w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-lime focus:ring-1 focus:ring-lime/50 transition-all outline-none text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400";
  const labelClass = "block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider ml-1";

  const displayedTransactions = filteredTransactions.slice(0, visibleCount);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
            <div className="flex items-center gap-3 mb-1">
               <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Transactions</h2>
               <div className="w-2 h-2 rounded-full bg-lime shadow-[0_0_10px_rgba(221,246,118,0.6)]"></div>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Unified financial auditing with global filters.</p>
        </div>
        {canManage && (
            <button onClick={() => setIsModalOpen(true)} className="hidden md:flex btn-black px-6 py-3 rounded-full items-center gap-2 shadow-lg hover:shadow-xl transition-all text-sm font-bold"><Plus className="w-5 h-5" /> Add Transaction</button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className={`${cardBase} bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900/20 group`}>
              <div className="flex justify-between items-start"><span className="text-[10px] font-bold text-green-700 dark:text-green-400 uppercase tracking-widest">Total In</span><div className="p-2 bg-white dark:bg-white/10 rounded-full text-green-600 shadow-sm"><ArrowUpRight className="w-4 h-4" /></div></div>
              <p className="text-xl lg:text-2xl font-black text-gray-900 dark:text-white mt-4 break-all">{currency} {formatAmount(totalIn)}</p>
          </div>
          <div className={`${cardBase} bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20 group`}>
              <div className="flex justify-between items-start"><span className="text-[10px] font-bold text-red-700 dark:text-red-400 uppercase tracking-widest">Total Out</span><div className="p-2 bg-white dark:bg-white/10 rounded-full text-green-600 shadow-sm"><ArrowDownLeft className="w-4 h-4" /></div></div>
              <p className="text-xl lg:text-2xl font-black text-gray-900 dark:text-white mt-4 break-all">{currency} {formatAmount(totalOut)}</p>
          </div>
          <div className={`${cardBase} bg-white dark:bg-[#1C1C1E] border-gray-100 dark:border-white/5 shadow-soft group`}>
              <div className="flex justify-between items-start"><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Net Cashflow</span><div className="p-2 bg-gray-100 dark:bg-white/5 rounded-full text-gray-600 dark:text-gray-300 shadow-sm"><Wallet className="w-4 h-4" /></div></div>
              <p className={`text-xl lg:text-2xl font-black mt-4 break-all ${net >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{net >= 0 ? '+' : ''}{currency} {formatAmount(net)}</p>
          </div>
          <div className="lg:col-span-2 hidden lg:block p-6 rounded-[22px] bg-lime/10 border border-lime/20 relative overflow-hidden">
                <div className="relative z-10 flex flex-col h-full justify-between">
                    <p className="text-lime-800 dark:text-lime font-black text-sm uppercase tracking-wider">Filtered Context</p>
                    <p className="text-xs text-lime-700/70 dark:text-lime/60 font-medium">Currently showing results based on the header filters.</p>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-lime/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
          </div>
      </div>

      <div className="flex justify-center md:justify-start overflow-x-auto custom-scrollbar-hide">
        <div className="flex p-1.5 rounded-full bg-gray-200/50 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 w-full md:w-auto">
            {['ALL', 'INCOME', 'EXPENSE'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 md:flex-none px-6 py-2.5 rounded-full text-xs font-bold transition-all duration-300 whitespace-nowrap ${activeTab === tab ? 'bg-lime text-black shadow-lg shadow-lime/20 scale-100' : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}>{tab === 'ALL' ? 'All Ledger' : tab === 'INCOME' ? 'Credit (+)' : 'Debit (-)'}</button>
            ))}
        </div>
      </div>

      {(filterConfig.month || filterConfig.year) && (
        <div className="mb-4 p-4 bento-card bg-lime/5 border border-lime/20 shadow-none flex justify-between items-center animate-fadeIn">
            <div className="flex items-center gap-3 text-lime-800 dark:text-lime">
                <div className="p-2 bg-lime/20 rounded-full"><Filter className="w-4 h-4" /></div>
                <span className="text-sm font-bold">
                    Showing Ledger: {filterConfig.month ? `${monthNames[filterConfig.month]} ` : ''}{filterConfig.year}
                </span>
            </div>
            <button 
                onClick={() => onFilterChange({ ...filterConfig, month: '', year: '' })} 
                className="text-xs bg-white dark:bg-black/20 hover:bg-lime hover:text-black text-lime-800 dark:text-lime px-5 py-2.5 rounded-xl transition-all font-bold shadow-sm"
            >
                Show All Time
            </button>
        </div>
      )}

      <div className="space-y-4">
          {displayedTransactions.map((t, idx) => {
              const isIncome = t.type === 'INCOME';
              const isSale = t.category === 'Sale';
              const isPurchase = t.category === 'Purchase';

              return (
              <div key={`${t.id}-${idx}`} className="group relative p-4 sm:p-5 rounded-[22px] bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-md border border-gray-100 dark:border-white/5 hover:border-lime/50 transition-all duration-300 hover:shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner
                          ${isSale ? 'bg-lime/20 text-lime-800 dark:text-lime' : isPurchase ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600' : isIncome ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600'}
                      `}>
                          {isSale ? <DollarSign className="w-6 h-6" /> : isPurchase ? <ArrowDownLeft className="w-6 h-6" /> : isIncome ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownLeft className="w-6 h-6" />}
                      </div>
                      <div className="flex flex-col justify-center h-14">
                          <h4 className="font-bold text-gray-900 dark:text-white text-base leading-tight group-hover:text-lime-700 transition-colors">{t.category}</h4>
                          <p className="text-xs text-gray-500 font-medium mt-1 line-clamp-1">{t.description}</p>
                      </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-gray-100 dark:border-white/5">
                      <div className="flex flex-col items-end gap-1.5 mr-4">
                          <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-full flex items-center gap-1"><Calendar className="w-3 h-3" /> {t.date}</span>
                          {t.source === 'MANUAL' && <span className="text-[9px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full uppercase tracking-wider">Manual Entry</span>}
                      </div>
                      <div className="flex items-center gap-4">
                          <span className={`text-xl font-black tabular-nums ${isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{isIncome ? '+' : '-'}{currency} {formatAmount(t.amount)}</span>
                          {t.source === 'MANUAL' && canManage ? (
                              <button onClick={() => handleDelete(t.id)} className="w-9 h-9 rounded-full bg-gray-5 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-100 sm:opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                          ) : <div className="w-9 h-9 hidden sm:block"></div>}
                      </div>
                  </div>
              </div>
          )})}
          {filteredTransactions.length === 0 && (
              <div className="text-center py-20 flex flex-col items-center justify-center rounded-[32px] bg-gray-50/50 dark:bg-white/5 border-2 border-dashed border-gray-200 dark:border-white/10">
                   <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4"><ArrowRightLeft className="w-6 h-6 text-gray-400" /></div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Filtered records are empty</h3>
                  <p className="text-gray-500 text-sm mt-1">Try resetting the global filters in the header.</p>
              </div>
          )}
          {filteredTransactions.length > visibleCount && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 pb-4">
              <button 
                onClick={() => setVisibleCount(prev => prev + 100)}
                className="flex items-center gap-2 px-8 py-3 bg-white dark:bg-dark-surface border border-gray-200 dark:border-white/10 rounded-full text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" /> Load another 100 rows
              </button>
              <button 
                onClick={() => setVisibleCount(filteredTransactions.length)}
                className="flex items-center gap-2 px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-bold transition-all shadow-lg active:scale-95"
              >
                <Layers2 className="w-4 h-4" /> Load All Records ({filteredTransactions.length})
              </button>
            </div>
          )}
      </div>

      {canManage && (
        <button onClick={() => setIsModalOpen(true)} className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-lime text-black rounded-full shadow-glow-lime flex items-center justify-center z-40 active:scale-95 transition-transform"><Plus className="w-6 h-6" /></button>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300">
          <div className="bento-card bg-white dark:bg-[#1C1C1E] w-full max-md overflow-hidden animate-fadeIn relative rounded-[32px] shadow-2xl border border-white/20 dark:border-white/10">
             <div className="p-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
              <div><h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">New Record</h3><p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wider">Financial Entry</p></div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-gray-400 hover:text-black hover:rotate-90 transition-all shadow-sm"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="group">
                <label className={labelClass}>Transaction Type</label>
                <div className="relative">
                    <select value={newTxn.type} onChange={e => setNewTxn({...newTxn, type: e.target.value as TransactionType})} className={`${inputClass} appearance-none cursor-pointer`}>
                    <optgroup label="Money Out (Expense)">
                        <option value="EXPENSE">General Expense</option>
                        <option value="LOAN_GIVEN">Loan Given</option>
                        <option value="RENT_PAID">Rent Paid</option>
                        <option value="SALARY_PAID">Salary Paid</option>
                        <option value="DEBIT">Debit Entry</option>
                        <option value="OTHER_EXPENSE">Other Expense</option>
                    </optgroup>
                    <optgroup label="Money In (Income)">
                        <option value="LOAN_TAKEN">Loan Taken</option>
                        <option value="RENT_RECEIVED">Rent Received</option>
                        <option value="CREDIT">Credit Entry</option>
                        <option value="OTHER_INCOME">Other Income</option>
                    </optgroup>
                    </select>
                    <ArrowRightLeft className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                  <div><label className={labelClass}>Date</label><input type="date" required value={newTxn.date} onChange={e => setNewTxn({...newTxn, date: e.target.value})} className={inputClass} /></div>
                  <div><label className={labelClass}>Amount</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">{currency}</span><input type="number" required min="0" step="0.01" value={newTxn.amount} onChange={e => setNewTxn({...newTxn, amount: parseFloat(e.target.value)})} className={`${inputClass} pl-10 font-bold text-lg`} /></div></div>
              </div>
              <div><label className={labelClass}>Category / Label</label><input type="text" placeholder="e.g. Shop Rent, Salary..." value={newTxn.category} onChange={e => setNewTxn({...newTxn, category: e.target.value})} className={inputClass} /></div>
              <div><label className={labelClass}>Description (Optional)</label><input type="text" placeholder="Additional details..." value={newTxn.description} onChange={e => setNewTxn({...newTxn, description: e.target.value})} className={inputClass} /></div>
              <div>
                <label className={labelClass}>Payment Method</label>
                <div className="relative">
                    <select value={newTxn.paymentMethod} onChange={e => setNewTxn({...newTxn, paymentMethod: e.target.value as any})} className={`${inputClass} appearance-none cursor-pointer`}><option value="CASH">Cash</option><option value="BANK">Bank Transfer</option><option value="UPI">UPI</option><option value="CARD">Card</option></select>
                    <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-100 dark:border-white/5 mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 rounded-2xl text-gray-500 font-bold text-sm hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">Cancel</button>
                <button type="submit" className="bg-lime hover:bg-lime-hover text-black px-10 py-4 rounded-2xl text-sm font-bold shadow-lg shadow-lime/20 hover:shadow-lime/40 hover:-translate-y-1 transform transition-all flex items-center gap-2">Save Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
