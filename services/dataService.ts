
import { AppState, Business, BusinessData, Product, Invoice, Party, Purchase, Expense, ManualTransaction, AuditLog, AppPreferences, User, TaxGroup, Currency } from '../types';
import { supabase } from './supabase';

const STORAGE_KEY = 'bizflow_ai_data_v4_clean';

const DEFAULT_PREFERENCES: AppPreferences = {
  mobileSidebarStyle: 'hidden',
  columns: {
    inventory: { slNo: true, date: true, hsn: true, mrp: true, price: true, gst: true, cess: true, stock: true },
    invoices: { slNo: true, date: true, invoiceNo: true, place: false, items: true, taxable: true, taxBreakdown: false }
  }
};

const INITIAL_STATE: AppState = {
  businesses: [],
  currentBusinessId: null,
  data: {},
  preferences: DEFAULT_PREFERENCES,
  users: [],
  currentUser: {
    id: 'admin-1',
    name: 'Master Admin',
    username: 'admin',
    role: 'ADMIN',
    permissions: { 
        canManageInventory: true, canManageInvoices: true, canManagePurchases: true, 
        canManageParties: true, canManageExpenses: true, canDeleteData: true, canViewReports: true 
    }
  }
};

export const initializeSync = (onStateChange: (newState: AppState, syncComplete?: boolean) => void) => {
  const sync = async () => {
    try {
      // 1. Fetch live data from Supabase
      const { data: dbBusinesses, error: bError } = await supabase.from('businesses').select('*');
      
      if (dbBusinesses && dbBusinesses.length > 0) {
        const businesses: Business[] = dbBusinesses.map(b => ({
          id: b.id,
          name: b.name,
          currency: b.currency as Currency,
          invoicePrefix: b.invoice_prefix,
          invoiceStartNumber: b.invoice_start_number
        }));

        const appData: Record<string, BusinessData> = {};

        // Fetch products for all businesses
        const { data: dbProducts } = await supabase.from('products').select('*');
        
        businesses.forEach(biz => {
          appData[biz.id] = {
            products: (dbProducts || [])
              .filter(p => p.business_id === biz.id)
              .map(p => ({
                id: p.id,
                name: p.name,
                sku: p.sku || '',
                category: p.category || 'General',
                price: Number(p.price) || 0,
                stockQuantity: p.stock_quantity || 0,
                taxRate: Number(p.tax_rate) || 0,
                unit: p.unit || 'Nos',
                description: '',
                mrp: Number(p.mrp) || 0,
                costPrice: Number(p.cost_price) || 0,
                minStockLevel: p.min_stock_level || 5,
                createdAt: p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
              })),
            invoices: [],
            parties: [],
            purchases: [],
            expenses: [],
            manualTransactions: [],
            taxGroups: [],
            auditLogs: []
          };
        });

        const localState = getAppState();
        const newState: AppState = {
          ...INITIAL_STATE,
          ...localState,
          businesses,
          currentBusinessId: localState.currentBusinessId && businesses.find(b => b.id === localState.currentBusinessId) 
            ? localState.currentBusinessId 
            : businesses[0].id,
          data: appData
        };

        saveAppState(newState);
        onStateChange(newState, true);
        return;
      }

      // Fallback if DB is empty: Load local storage
      onStateChange(getAppState(), true);
    } catch (error) {
      console.error("Database Sync Error:", error);
      onStateChange(getAppState(), true);
    }
  };

  sync();
  return () => { };
};

export const getAppState = (): AppState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : INITIAL_STATE;
  } catch (e) { return INITIAL_STATE; }
};

export const saveAppState = (state: AppState) => { 
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

// --- WRITE OPERATIONS ---
export const createBusiness = (business: Business) => {
    const state = getAppState();
    const newState = {
        ...state,
        businesses: [...state.businesses, business],
        currentBusinessId: business.id,
        data: { 
            ...state.data, 
            [business.id]: { products: [], invoices: [], parties: [], purchases: [], expenses: [], manualTransactions: [], auditLogs: [], taxGroups: [] } 
        }
    };
    saveAppState(newState);
    // Ideally push to Supabase here too
    return newState;
};

export const switchBusiness = (id: string) => {
    const state = getAppState();
    const newState = { ...state, currentBusinessId: id };
    saveAppState(newState);
    return newState;
};

export const addProduct = (bizId: string, p: Product) => {
    const state = getAppState();
    const d = state.data[bizId] || { products: [], invoices: [], parties: [], purchases: [], expenses: [], manualTransactions: [], auditLogs: [], taxGroups: [] };
    const newState = { ...state, data: { ...state.data, [bizId]: { ...d, products: [...d.products, p] } } };
    saveAppState(newState);
    return newState;
};

export const updateProduct = (bizId: string, p: Product) => {
    const state = getAppState();
    const d = state.data[bizId];
    const newState = { ...state, data: { ...state.data, [bizId]: { ...d, products: d.products.map(x => x.id === p.id ? p : x) } } };
    saveAppState(newState);
    return newState;
};

export const deleteProduct = (bizId: string, id: string) => {
    const state = getAppState();
    const d = state.data[bizId];
    const newState = { ...state, data: { ...state.data, [bizId]: { ...d, products: d.products.filter(p => p.id !== id) } } };
    saveAppState(newState);
    return newState;
};

export const addInvoice = (bizId: string, inv: Invoice) => {
    const state = getAppState();
    const d = state.data[bizId];
    const newState = { ...state, data: { ...state.data, [bizId]: { ...d, invoices: [inv, ...d.invoices] } } };
    saveAppState(newState);
    return newState;
};

export const deleteInvoice = (bizId: string, id: string) => {
    const state = getAppState();
    const d = state.data[bizId];
    const newState = { ...state, data: { ...state.data, [bizId]: { ...d, invoices: d.invoices.filter(x => x.id !== id) } } };
    saveAppState(newState);
    return newState;
};

export const updateInvoice = (bizId: string, inv: Invoice) => {
    const state = getAppState();
    const d = state.data[bizId];
    const newState = { ...state, data: { ...state.data, [bizId]: { ...d, invoices: d.invoices.map(x => x.id === inv.id ? inv : x) } } };
    saveAppState(newState);
    return newState;
};

export const addParty = (bizId: string, p: Party) => {
    const state = getAppState();
    const d = state.data[bizId];
    const newState = { ...state, data: { ...state.data, [bizId]: { ...d, parties: [...d.parties, p] } } };
    saveAppState(newState);
    return newState;
};

export const updateParty = (bizId: string, p: Party) => {
    const state = getAppState();
    const d = state.data[bizId];
    const newState = { ...state, data: { ...state.data, [bizId]: { ...d, parties: d.parties.map(x => x.id === p.id ? p : x) } } };
    saveAppState(newState);
    return newState;
};

export const deleteParty = (bizId: string, id: string) => {
    const state = getAppState();
    const d = state.data[bizId];
    const newState = { ...state, data: { ...state.data, [bizId]: { ...d, parties: d.parties.filter(x => x.id !== id) } } };
    saveAppState(newState);
    return newState;
};

export const addPurchase = (bizId: string, p: Purchase) => {
    const state = getAppState();
    const d = state.data[bizId];
    const newState = { ...state, data: { ...state.data, [bizId]: { ...d, purchases: [p, ...d.purchases] } } };
    saveAppState(newState);
    return newState;
};

export const deletePurchase = (bizId: string, id: string) => {
    const state = getAppState();
    const d = state.data[bizId];
    const newState = { ...state, data: { ...state.data, [bizId]: { ...d, purchases: d.purchases.filter(x => x.id !== id) } } };
    saveAppState(newState);
    return newState;
};

export const updatePurchase = (bizId: string, p: Purchase) => {
    const state = getAppState();
    const d = state.data[bizId];
    const newState = { ...state, data: { ...state.data, [bizId]: { ...d, purchases: d.purchases.map(x => x.id === p.id ? p : x) } } };
    saveAppState(newState);
    return newState;
};

export const addExpense = (bizId: string, e: Expense) => {
    const state = getAppState();
    const d = state.data[bizId];
    const newState = { ...state, data: { ...state.data, [bizId]: { ...d, expenses: [e, ...d.expenses] } } };
    saveAppState(newState);
    return newState;
};

export const updateExpense = (bizId: string, e: Expense) => {
    const state = getAppState();
    const d = state.data[bizId];
    const newState = { ...state, data: { ...state.data, [bizId]: { ...d, expenses: d.expenses.map(x => x.id === e.id ? e : x) } } };
    saveAppState(newState);
    return newState;
};

export const deleteExpense = (bizId: string, id: string) => {
    const state = getAppState();
    const d = state.data[bizId];
    const newState = { ...state, data: { ...state.data, [bizId]: { ...d, expenses: d.expenses.filter(x => x.id !== id) } } };
    saveAppState(newState);
    return newState;
};

export const addManualTransaction = (bizId: string, t: ManualTransaction) => {
    const state = getAppState();
    const d = state.data[bizId];
    const newState = { ...state, data: { ...state.data, [bizId]: { ...d, manualTransactions: [t, ...d.manualTransactions] } } };
    saveAppState(newState);
    return newState;
};

export const deleteManualTransaction = (bizId: string, id: string) => {
    const state = getAppState();
    const d = state.data[bizId];
    const newState = { ...state, data: { ...state.data, [bizId]: { ...d, manualTransactions: d.manualTransactions.filter(x => x.id !== id) } } };
    saveAppState(newState);
    return newState;
};

export const updateBusinessDetails = (bizId: string, details: Partial<Business>) => {
    const state = getAppState();
    const newState = {
        ...state,
        businesses: state.businesses.map(b => b.id === bizId ? { ...b, ...details } : b)
    };
    saveAppState(newState);
    return newState;
};

export const updatePreferences = (prefs: Partial<AppPreferences>) => {
    const state = getAppState();
    const newState = { ...state, preferences: { ...state.preferences, ...prefs } };
    saveAppState(newState);
    return newState;
};

export const onSyncStatusChange = (listener: (isSaving: boolean) => void) => {
    return () => {}; 
};

export const deleteBusiness = (id: string) => {
    const state = getAppState();
    const newData = { ...state.data };
    delete newData[id];
    const newState = {
        ...state,
        businesses: state.businesses.filter(b => b.id !== id),
        currentBusinessId: state.currentBusinessId === id ? (state.businesses.find(b => b.id !== id)?.id || null) : state.currentBusinessId,
        data: newData
    };
    saveAppState(newState);
    return newState;
};

export const clearBusinessData = (bizId: string) => {
    const state = getAppState();
    const newState = { ...state, data: { ...state.data, [bizId]: { products: [], invoices: [], parties: [], purchases: [], expenses: [], manualTransactions: [], auditLogs: [], taxGroups: [] } } };
    saveAppState(newState);
    return newState;
};

export const addTaxGroup = (bizId: string, g: TaxGroup) => {
    const state = getAppState();
    const d = state.data[bizId];
    const newState = { ...state, data: { ...state.data, [bizId]: { ...d, taxGroups: [...d.taxGroups, g] } } };
    saveAppState(newState);
    return newState;
};

export const updateTaxGroup = (bizId: string, g: TaxGroup) => {
    const state = getAppState();
    const d = state.data[bizId];
    const newState = { ...state, data: { ...state.data, [bizId]: { ...d, taxGroups: d.taxGroups.map(x => x.id === g.id ? g : x) } } };
    saveAppState(newState);
    return newState;
};

export const deleteTaxGroup = (bizId: string, id: string) => {
    const state = getAppState();
    const d = state.data[bizId];
    const newState = { ...state, data: { ...state.data, [bizId]: { ...d, taxGroups: d.taxGroups.filter(x => x.id !== id) } } };
    saveAppState(newState);
    return newState;
};

export const bulkImportData = (bizId: string, i: Invoice[], pa: Party[], pr: Product[]) => {
    const state = getAppState();
    const d = state.data[bizId];
    const newState = { 
        ...state, 
        data: { 
            ...state.data, 
            [bizId]: { 
                ...d, 
                invoices: [...i, ...d.invoices], 
                parties: [...pa, ...d.parties], 
                products: [...pr, ...d.products] 
            } 
        } 
    };
    saveAppState(newState);
    return newState;
};

export const bulkImportPurchases = (bizId: string, pu: Purchase[], pa: Party[], pr: Product[]) => {
    const state = getAppState();
    const d = state.data[bizId];
    const newState = { 
        ...state, 
        data: { 
            ...state.data, 
            [bizId]: { 
                ...d, 
                purchases: [...pu, ...d.purchases], 
                parties: [...pa, ...d.parties], 
                products: [...pr, ...d.products] 
            } 
        } 
    };
    saveAppState(newState);
    return newState;
};

export const bulkImportParties = (bizId: string, pa: Party[]) => {
    const state = getAppState();
    const d = state.data[bizId];
    const newState = { ...state, data: { ...state.data, [bizId]: { ...d, parties: [...pa, ...d.parties] } } };
    saveAppState(newState);
    return newState;
};

export const resetSyncData = async () => { localStorage.removeItem(STORAGE_KEY); window.location.reload(); };
export const forcePushToCloud = async () => { window.location.reload(); return true; };
export const addUser = (u: any) => getAppState();
export const updateUser = (u: any) => getAppState();
export const deleteUser = (id: string) => getAppState();
export const restoreAppState = (s: any) => { saveAppState(s); window.location.reload(); };
