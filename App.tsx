
import React, { useState, useEffect, createContext } from 'react';
import { 
  getAppState, createBusiness, updateBusinessDetails, deleteBusiness, switchBusiness, addProduct, deleteProduct, updateProduct, 
  addInvoice, deleteInvoice, updateInvoice, addParty, updateParty, deleteParty, addPurchase, deletePurchase, updatePurchase,
  addExpense, updateExpense, deleteExpense, updatePreferences, bulkImportData, bulkImportPurchases, bulkImportParties,
  addUser, updateUser, deleteUser, initializeSync,
  addManualTransaction, deleteManualTransaction, addTaxGroup, updateTaxGroup, deleteTaxGroup, onSyncStatusChange, clearBusinessData
} from './services/dataService';
import { AppState, Business, Currency, Product, Invoice, Party, Purchase, Expense, Theme, SortConfig, FilterConfig, User } from './types';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Invoices from './components/Invoices'; 
import Parties from './components/Parties';
import Purchases from './components/Purchases';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Transactions from './components/Transactions';
import Calculator from './components/Calculator';
import Audit from './components/Audit';
import { Briefcase, Check, Plus, X, Trash2, Edit2, RotateCcw, ArrowRight, RefreshCw } from 'lucide-react';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}
export const ThemeContext = createContext<ThemeContextType>({ theme: 'dark', setTheme: () => {}, isDark: true });

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(() => getAppState());
  
  // Start with syncing false if we already have local data, otherwise true
  const hasLocalData = appState.businesses.length > 0;
  const [isSyncing, setIsSyncing] = useState(true);

  const [currentView, setCurrentView] = useState('dashboard');
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [newBizName, setNewBizName] = useState('');
  const [newBizCurrency, setNewBizCurrency] = useState<Currency>(Currency.INR);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' });
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    dateRange: { start: '', end: '' },
    partyId: '',
    productId: '',
    minAmount: '',
    maxAmount: '',
    month: '',
    year: ''
  });

  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'dark');
  const [isDark, setIsDark] = useState(true);

  const activeUser: User = appState.currentUser || appState.users?.[0] || {
    id: 'guest-fallback',
    name: 'Master Admin',
    username: 'admin',
    role: 'ADMIN',
    permissions: { 
        canManageInventory: true, canManageInvoices: true, canManagePurchases: true, 
        canManageParties: true, canManageExpenses: true, canDeleteData: true, canViewReports: true 
    }
  };

  useEffect(() => {
    const unsubscribe = initializeSync((newState, syncComplete) => {
      setAppState(prevState => ({
        ...newState,
        currentBusinessId: prevState.currentBusinessId || newState.currentBusinessId
      }));
      // If syncComplete is passed, it means Supabase check is finished
      if (syncComplete) setIsSyncing(false);
    });

    // Forced exit from loading screen after 4 seconds regardless of network status
    const safetyTimeout = setTimeout(() => setIsSyncing(false), 4000);
    const unsubSaveStatus = onSyncStatusChange((saving) => setIsSaving(saving));

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    const themeColorMeta = document.getElementById('theme-color-meta') as HTMLMetaElement;
    const updateThemeColor = (color: string) => {
        if (themeColorMeta) themeColorMeta.content = color;
    };

    const applyTheme = (t: Theme) => {
      let currentIsDark = false;
      if (t === 'system') {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.add(systemDark ? 'dark' : 'light');
        currentIsDark = systemDark;
        updateThemeColor(systemDark ? '#111111' : '#F5F5EF');
      } else {
        root.classList.add(t);
        currentIsDark = t === 'dark';
        updateThemeColor(t === 'dark' ? '#111111' : '#F5F5EF');
      }
      setIsDark(currentIsDark);
    };

    applyTheme(theme);
    localStorage.setItem('theme', theme);

    return () => {
      clearTimeout(safetyTimeout);
      unsubscribe();
      unsubSaveStatus();
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [theme]);

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    setSearchTerm('');
    const newFilterConfig: FilterConfig = { 
        dateRange: { start: '', end: '' }, 
        partyId: '', productId: '', minAmount: '', maxAmount: '',
        month: '', year: ''
    };
    setFilterConfig(newFilterConfig);
    if (['invoices', 'purchases', 'transactions'].includes(view)) setSortConfig({ key: 'date', direction: 'desc' });
    else if (['inventory', 'parties'].includes(view)) setSortConfig({ key: 'name', direction: 'asc' });
  };

  const currentBusiness = appState.businesses.find(b => b.id === appState.currentBusinessId);
  const currentData = appState.currentBusinessId ? appState.data[appState.currentBusinessId] : null;

  if (isSyncing) {
      return (
        <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
                <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-lime flex items-center justify-center text-black font-black text-2xl shadow-[0_0_30px_rgba(221,246,118,0.4)] animate-pulse">CP</div>
                    <div className="absolute -inset-4 rounded-full border-2 border-lime/20 border-t-lime animate-spin"></div>
                </div>
                <p className="mt-8 text-white font-bold text-sm tracking-widest uppercase opacity-70">Loading Workspace...</p>
                <p className="mt-2 text-gray-500 text-xs animate-pulse">Synchronizing Data...</p>
            </div>
        </ThemeContext.Provider>
      );
  }

  if (!appState.businesses.length) {
    return ( 
      <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
        <div className="min-h-screen bg-light-base dark:bg-dark-base flex flex-col items-center justify-center p-6 relative overflow-hidden animate-fadeIn">
             <div className="absolute top-[10%] right-[20%] w-[40vw] h-[40vw] rounded-full bg-lime/10 blur-[120px]" />
             <div className="bento-card p-10 w-full max-md z-10 relative">
                 <div className="w-16 h-16 bg-black dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"><Briefcase className="w-8 h-8" /></div>
                 <div className="text-center mb-8">
                    <p className="text-xs font-bold text-lime-600 dark:text-lime uppercase tracking-widest mb-2">Welcome</p>
                    <h1 className="text-2xl font-extrabold mb-2 text-gray-900 dark:text-white">Setup Workspace</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Create your first business profile to get started.</p>
                 </div>
                 <div className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Business Name</label>
                        <input className="bento-input w-full px-5 py-4 font-medium rounded-xl" placeholder="e.g. Neo Corp" value={newBizName} onChange={e=>setNewBizName(e.target.value)} />
                    </div>
                    <button className="w-full btn-black py-4 rounded-2xl font-bold mt-4 flex items-center justify-center gap-2" onClick={() => {
                        if (!newBizName) return;
                        const newBiz: Business = { id: crypto.randomUUID(), name: newBizName, currency: newBizCurrency };
                        setAppState(createBusiness(newBiz));
                        setAppState(switchBusiness(newBiz.id));
                    }}>Start Managing <ArrowRight className="w-4 h-4" /></button>
                 </div>
             </div>
        </div>
      </ThemeContext.Provider>
    );
  }

  if (!currentBusiness || !currentData) {
      // Emergency reset if state is corrupted
      return <div className="flex h-screen flex-col items-center justify-center text-gray-400 gap-4">
          <p className="font-bold text-xs uppercase tracking-widest">Initializing Data structures...</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-lime text-black rounded-xl font-bold text-xs">Retry</button>
      </div>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      <Layout 
        currentView={currentView} 
        onChangeView={handleViewChange} 
        onSwitchBusiness={() => setShowBusinessModal(true)} 
        preferences={appState.preferences}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortConfig={sortConfig}
        onSortChange={setSortConfig}
        filterConfig={filterConfig}
        onFilterChange={setFilterConfig}
        parties={currentData.parties}
        products={currentData.products}
        currentUser={activeUser}
        businesses={appState.businesses}
        onSelectBusiness={(id) => { setAppState(switchBusiness(id)); setShowBusinessModal(false); handleViewChange('dashboard'); }}
        currentBusinessId={appState.currentBusinessId}
        currentBusiness={currentBusiness}
        installPrompt={installPrompt}
        onInstallApp={() => { if (installPrompt) { installPrompt.prompt(); installPrompt.userChoice.then(() => setInstallPrompt(null)); } }}
        isSaving={isSaving}
      >
        {currentView === 'dashboard' && <Dashboard data={currentData} currency={currentBusiness.currency} filterConfig={filterConfig} />}
        {currentView === 'parties' && (
            <Parties 
                parties={currentData.parties || []} 
                onAddParty={(p) => setAppState(addParty(currentBusiness.id, p))} 
                onUpdateParty={(p) => setAppState(updateParty(currentBusiness.id, p))}
                onDeleteParty={(id) => setAppState(deleteParty(currentBusiness.id, id))} 
                onBulkImport={(newParties) => setAppState(bulkImportParties(currentBusiness.id, newParties))}
                searchTerm={searchTerm}
                sortConfig={sortConfig}
                filterConfig={filterConfig}
                currentUser={activeUser}
            />
        )}
        {currentView === 'inventory' && (
            <Inventory 
                products={currentData.products} 
                invoices={currentData.invoices}
                currency={currentBusiness.currency} 
                preferences={appState.preferences} 
                onAddProduct={(p) => setAppState(addProduct(currentBusiness.id, p))} 
                onDeleteProduct={(id) => setAppState(deleteProduct(currentBusiness.id, id))} 
                onUpdateProduct={(p) => setAppState(updateProduct(currentBusiness.id, p))}
                taxGroups={currentData.taxGroups || []}
                searchTerm={searchTerm}
                sortConfig={sortConfig}
                filterConfig={filterConfig}
                currentUser={activeUser}
            />
        )}
        {currentView === 'invoices' && (
            <Invoices 
                business={currentBusiness}
                products={currentData.products} 
                invoices={currentData.invoices} 
                parties={currentData.parties || []} 
                taxGroups={currentData.taxGroups || []}
                currency={currentBusiness.currency} 
                preferences={appState.preferences} 
                onAddInvoice={(inv) => setAppState(addInvoice(currentBusiness.id, inv))} 
                onDeleteInvoice={(id) => setAppState(deleteInvoice(currentBusiness.id, id))}
                onUpdateInvoice={(inv) => setAppState(updateInvoice(currentBusiness.id, inv))}
                onBulkImport={(newInvoices, newParties, newProducts) => setAppState(bulkImportData(currentBusiness.id, newInvoices, newParties, newProducts))}
                searchTerm={searchTerm}
                sortConfig={sortConfig}
                filterConfig={filterConfig}
                currentUser={activeUser}
                onFilterChange={setFilterConfig}
            />
        )}
        {currentView === 'purchases' && (
            <Purchases 
                products={currentData.products} 
                purchases={currentData.purchases || []} 
                parties={currentData.parties || []} 
                currency={currentBusiness.currency} 
                onAddPurchase={(pur) => setAppState(addPurchase(currentBusiness.id, pur))} 
                onDeletePurchase={(id) => setAppState(deletePurchase(currentBusiness.id, id))}
                onUpdatePurchase={(pur) => setAppState(updatePurchase(currentBusiness.id, pur))}
                onBulkImport={(newPurchases, newParties, newProducts) => setAppState(bulkImportPurchases(currentBusiness.id, newPurchases, newParties, newProducts))}
                searchTerm={searchTerm}
                sortConfig={sortConfig}
                filterConfig={filterConfig}
                currentUser={activeUser}
            />
        )}
        {currentView === 'transactions' && (
            <Transactions 
                manualTransactions={currentData.manualTransactions || []}
                invoices={currentData.invoices}
                purchases={currentData.purchases || []}
                expenses={currentData.expenses || []}
                products={currentData.products} 
                currency={currentBusiness.currency}
                onAddTransaction={(txn) => setAppState(addManualTransaction(currentBusiness.id, txn))}
                onDeleteTransaction={(id) => setAppState(deleteManualTransaction(currentBusiness.id, id))}
                searchTerm={searchTerm}
                sortConfig={sortConfig}
                filterConfig={filterConfig}
                onFilterChange={setFilterConfig}
                currentUser={activeUser}
            />
        )}
        {currentView === 'reports' && <Reports data={currentData} currency={currentBusiness.currency} filterConfig={filterConfig} />}
        {currentView === 'calculator' && <Calculator />}
        {currentView === 'audit' && <Audit />}
        {currentView === 'settings' && (
            <Settings 
                business={currentBusiness} 
                auditLogs={currentData.auditLogs || []} 
                taxGroups={currentData.taxGroups || []}
                preferences={appState.preferences} 
                users={appState.users}
                currentUser={activeUser}
                onUpdateBusiness={(b) => setAppState(updateBusinessDetails(currentBusiness.id, b))} 
                onUpdatePreferences={(p) => setAppState(updatePreferences(p))} 
                onAddUser={(u) => setAppState(addUser(u))}
                onUpdateUser={(u) => setAppState(updateUser(u))}
                onDeleteUser={(id) => setAppState(deleteUser(id))}
                onAddTaxGroup={(g) => setAppState(addTaxGroup(currentBusiness.id, g))}
                onUpdateTaxGroup={(g) => setAppState(updateTaxGroup(currentBusiness.id, g))}
                onDeleteTaxGroup={(id) => setAppState(deleteTaxGroup(currentBusiness.id, id))}
                onClearBusinessData={() => setAppState(clearBusinessData(currentBusiness.id))}
            />
        )}
        
        {showBusinessModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-end md:items-center justify-center z-[100] p-0 md:p-4">
                <div className="bento-card w-full md:max-w-md flex flex-col h-[80vh] md:h-auto relative rounded-t-[32px] md:rounded-[32px]">
                    <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                       <div><h2 className="font-black text-xl text-gray-900 dark:text-white">Workspaces</h2></div>
                       <button onClick={() => setShowBusinessModal(false)} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="overflow-y-auto p-4 md:p-6 flex-1 space-y-3">
                        {appState.businesses.map(b => (
                            <div key={b.id} onClick={() => { setAppState(switchBusiness(b.id)); setShowBusinessModal(false); handleViewChange('dashboard'); }} className={`p-4 rounded-2xl cursor-pointer flex justify-between items-center border-2 ${b.id === appState.currentBusinessId ? 'border-lime bg-lime/10' : 'border-transparent bg-gray-50 dark:bg-white/5'}`}>
                               <div className="flex items-center gap-4">
                                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${b.id === appState.currentBusinessId ? 'bg-lime text-black' : 'bg-white dark:bg-white/10'}`}>{b.name.substring(0,2).toUpperCase()}</div>
                                   <div><span className="font-bold text-base">{b.name}</span></div>
                               </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-6 bg-gray-50 dark:bg-white/5 border-t flex-shrink-0">
                         <div className="space-y-4">
                               <input className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-black/20 border outline-none text-sm font-medium" placeholder="New Business Name" value={newBizName} onChange={e=>setNewBizName(e.target.value)} />
                               <button className="w-full h-12 bg-black dark:bg-lime dark:text-black text-white rounded-2xl font-bold text-sm" onClick={() => {
                                   if (!newBizName) return;
                                   const newBiz: Business = { id: crypto.randomUUID(), name: newBizName, currency: newBizCurrency };
                                   setAppState(createBusiness(newBiz));
                                   setAppState(switchBusiness(newBiz.id));
                                   setShowBusinessModal(false);
                                   setNewBizName('');
                               }}>Create Workspace</button>
                         </div>
                    </div>
                </div>
            </div>
        )}
      </Layout>
    </ThemeContext.Provider>
  );
};

export default App;
