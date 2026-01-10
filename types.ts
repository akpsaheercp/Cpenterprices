
export type Theme = 'light' | 'dark' | 'system';

export enum Currency {
  USD = 'USD',
  INR = 'INR',
  EUR = 'EUR'
}

export interface SortConfig {
  key: 'date' | 'amount' | 'name';
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  dateRange: {
    start: string;
    end: string;
  };
  partyId: string; // For filtering by Customer/Supplier
  productId: string; // For filtering transactions involving a specific item
  minAmount: string;
  maxAmount: string;
  month?: string; // e.g., '01', '02'
  year?: string;  // e.g., '2024'
}

export interface TaxComponent {
  name: string; // e.g., 'SGST', 'CGST', 'Cess'
  percentage: number; // e.g., 9, 9, 1
}

export interface TaxGroup {
  id: string;
  name: string; // e.g., 'GST 18%'
  description?: string;
  components: TaxComponent[];
  status: 'active' | 'inactive';
}

export interface Business {
  id: string;
  name: string;
  currency: Currency;
  address?: string; // Keep for backward compat, or map to line1
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  stateCode?: string;
  pincode?: string;
  gstIn?: string; // Tax ID
  email?: string;
  phone?: string;
  bankName?: string;
  bankAccountNo?: string;
  bankBranchIFSC?: string;
  // Sequential Invoice Settings
  invoicePrefix?: string;
  invoiceStartNumber?: number;
}

export interface UserPermissions {
  canManageInventory: boolean; // Add/Edit Products
  canManageInvoices: boolean;  // Create/Edit Invoices
  canManagePurchases: boolean; // Create/Edit Purchases
  canManageParties: boolean;   // Add/Edit Parties
  canManageExpenses: boolean;  // Record Expenses
  canDeleteData: boolean;      // Critical Delete Actions
  canViewReports: boolean;     // Access Reports Tab
}

export interface User {
  id: string;
  name: string;
  username: string;
  role: 'ADMIN' | 'STAFF';
  permissions: UserPermissions;
}

export interface Party {
  id: string;
  name: string;
  type: 'CUSTOMER' | 'SUPPLIER';
  phone?: string;
  email?: string;
  gstIn?: string;
  place?: string; // City/Location
  addressLine1?: string;
  state?: string;
  stateCode?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  price: number; // Selling Price
  mrp: number;   // Maximum Retail Price
  costPrice: number;
  stockQuantity: number;
  minStockLevel: number;
  
  // Tax Logic
  taxGroupId?: string; // New: Reference to TaxGroup
  taxRate: number;     // Fallback/Legacy
  cessRate?: number;   // Fallback/Legacy
  
  hsnCode?: string;
  unit?: string; // e.g. Nos, Box, Kg
  createdAt?: string; // New field for Date
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number; // Selling Price
  mrp: number;       // MRP for Cess calc
  
  // Tax Logic - Snapshot at time of invoice creation
  taxGroupId?: string;
  taxRate: number; // Total Tax Rate (sum of components) or legacy rate
  cessRate?: number; // Legacy cess rate
  
  // Detailed breakdown for display/print
  taxComponents?: TaxComponent[]; // Snapshot of components used

  // Calculated Amounts
  cgstAmount: number;
  sgstAmount: number;
  cessAmount: number;
  taxAmount: number; // Total Tax (CGST+SGST+CESS)
  
  total: number; // Includes tax
  hsnCode?: string;
  unit?: string;
}

export interface Invoice {
  id: string;
  invoiceNo: string; // User-facing sequential number
  customerName: string;
  partyId?: string;
  date: string;
  items: InvoiceItem[];
  subTotal: number;
  taxAmount: number;
  totalAmount: number;
  status: 'PAID' | 'PENDING' | 'CANCELLED';
}

export interface Purchase {
  id: string;
  supplierName: string;
  partyId?: string;
  date: string;
  items: InvoiceItem[];
  totalAmount: number;
  status: 'PAID' | 'PENDING';
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  paymentMethod: 'CASH' | 'BANK' | 'CARD';
}

// New Interface for Manual Transactions
export type TransactionType = 'LOAN_GIVEN' | 'LOAN_TAKEN' | 'RENT_PAID' | 'RENT_RECEIVED' | 'SALARY_PAID' | 'OTHER_INCOME' | 'OTHER_EXPENSE' | 'DEBIT' | 'CREDIT';

export interface ManualTransaction {
  id: string;
  date: string;
  type: TransactionType;
  category: string; // Display label like "Room Rent"
  amount: number;
  description: string;
  partyName?: string; // Optional name of person involved
  paymentMethod: 'CASH' | 'BANK' | 'UPI' | 'CARD';
}

export interface AuditLog {
  id: string;
  date: string;
  action: string;
  details: string;
  entityType: 'INVOICE' | 'PRODUCT' | 'PURCHASE' | 'PARTY' | 'EXPENSE' | 'SETTINGS' | 'USER' | 'TRANSACTION' | 'TAX_GROUP';
  snapshot?: string; // JSON string of the object state
  entityId?: string;
}

export interface BusinessData {
  products: Product[];
  invoices: Invoice[];
  parties: Party[];
  purchases: Purchase[];
  expenses: Expense[];
  manualTransactions: ManualTransaction[];
  taxGroups: TaxGroup[]; // New List
  auditLogs: AuditLog[];
}

export interface ColumnSettings {
  inventory: {
    slNo: boolean;
    date: boolean;
    hsn: boolean;
    mrp: boolean; // New
    price: boolean;
    gst: boolean;
    cess: boolean;
    stock: boolean;
  };
  invoices: {
    slNo: boolean;
    date: boolean;
    invoiceNo: boolean;
    place: boolean;
    items: boolean;
    taxable: boolean;
    taxBreakdown: boolean; // Covers SGST, CGST, CESS
  };
}

export interface AppPreferences {
  mobileSidebarStyle: 'hidden' | 'rail'; // 'hidden' = fully hide, 'rail' = show icons
  columns: ColumnSettings;
}

export interface AppState {
  businesses: Business[];
  currentBusinessId: string | null;
  data: Record<string, BusinessData>; // Keyed by businessId
  preferences: AppPreferences;
  users: User[];
  currentUser: User | null;
}
