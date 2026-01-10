
import React, { useState, useEffect, useRef } from 'react';
import { Product, Currency, Purchase, InvoiceItem, Party, SortConfig, FilterConfig, User } from '../types';
import { ShoppingBag, Plus, Trash, CheckCircle, Trash2, Edit2, Search, ChevronDown, Check, Box, Layers, ArrowRight, CreditCard, X, Truck, Calendar, Upload, Download, AlertTriangle, Layers2 } from 'lucide-react';

interface PurchasesProps {
  products: Product[];
  purchases: Purchase[];
  parties: Party[];
  currency: Currency;
  onAddPurchase: (pur: Purchase) => void;
  onDeletePurchase: (id: string) => void;
  onUpdatePurchase: (pur: Purchase) => void;
  onBulkImport: (newPurchases: Purchase[], newParties: Party[], newProducts: Product[]) => void;
  searchTerm: string;
  sortConfig: SortConfig;
  filterConfig: FilterConfig;
  currentUser: User;
}

interface DropdownOption {
  id: string;
  label: string;
  subLabel?: string;
}

const CustomDropdown = ({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  icon: Icon, 
  searchPlaceholder 
}: {
  options: DropdownOption[],
  value: string,
  onChange: (val: string) => void,
  placeholder: string,
  icon: any,
  searchPlaceholder?: string
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
      if (isOpen && searchInputRef.current) {
          setTimeout(() => searchInputRef.current?.focus(), 50);
      }
  }, [isOpen]);

  const selectedOption = options.find(o => o.id === value);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (opt.subLabel && opt.subLabel.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="relative group w-full" ref={dropdownRef}>
        <style>{`
            .dropdown-scrollbar::-webkit-scrollbar {
                width: 6px;
            }
            .dropdown-scrollbar::-webkit-scrollbar-track {
                background: transparent;
            }
            .dropdown-scrollbar::-webkit-scrollbar-thumb {
                background: rgba(221, 246, 118, 0.4);
                border-radius: 10px;
            }
            .dropdown-scrollbar::-webkit-scrollbar-thumb:hover {
                background: rgba(221, 246, 118, 0.8);
            }
        `}</style>

        <button 
            type="button"
            onClick={() => { setIsOpen(!isOpen); setSearchTerm(''); }}
            className={`w-full h-[52px] px-4 pl-11 rounded-2xl bg-gray-50 dark:bg-white/5 border transition-all outline-none text-left flex items-center justify-between
                ${isOpen 
                    ? 'border-lime ring-2 ring-lime/20 bg-white dark:bg-white/10 shadow-lg' 
                    : 'border-gray-200 dark:border-white/10 focus:border-lime focus:ring-1 focus:ring-lime/50'
                }
            `}
        >
             <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${isOpen ? 'text-lime-600 dark:text-lime' : 'text-gray-400'}`} />
             <span className={`text-sm font-medium truncate ${selectedOption ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                 {selectedOption ? selectedOption.label : placeholder}
             </span>
             <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-lime-600 dark:text-lime' : ''}`} />
        </button>

        {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-3 z-50 animate-fadeIn origin-top">
                <div className="bg-white/90 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl border border-gray-100 dark:border-white/10 shadow-soft-hover rounded-2xl overflow-hidden ring-1 ring-black/5">
                    
                    <div className="p-3 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input 
                                ref={searchInputRef}
                                type="text" 
                                className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-black/20 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime/50 transition-all border border-gray-100 dark:border-white/5"
                                placeholder={searchPlaceholder || "Search..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto dropdown-scrollbar p-2 space-y-1">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => { onChange(opt.id); setIsOpen(false); }}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm flex flex-col transition-all duration-200 group relative
                                        ${value === opt.id 
                                            ? 'bg-lime/10 dark:bg-lime/20 text-lime-900 dark:text-lime border-l-2 border-lime' 
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 border-l-2 border-transparent'
                                        }
                                    `}
                                >
                                    <div className="flex justify-between items-center w-full relative z-10">
                                        <span className={`font-semibold transition-colors ${value === opt.id ? 'text-lime-900 dark:text-lime' : 'group-hover:text-black dark:group-hover:text-white'}`}>
                                            {opt.label}
                                        </span>
                                        {value === opt.id && <Check className="w-4 h-4 text-lime-600 dark:text-lime" />}
                                    </div>
                                    {opt.subLabel && (
                                        <span className={`text-xs mt-1 transition-colors relative z-10 ${value === opt.id ? 'text-lime-800/70 dark:text-lime/80' : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-400'}`}>
                                            {opt.subLabel}
                                        </span>
                                    )}
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
                                <Search className="w-6 h-6 opacity-20" />
                                No results found.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

const Purchases: React.FC<PurchasesProps> = ({ 
    products, purchases, parties, currency, 
    onAddPurchase, onDeletePurchase, onUpdatePurchase, onBulkImport,
    searchTerm, sortConfig, filterConfig, currentUser 
}) => {
  const [view, setView] = useState<'list' | 'create'>('list');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importSummary, setImportSummary] = useState<any>(null);
  const [visibleCount, setVisibleCount] = useState(100);
  
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [cart, setCart] = useState<InvoiceItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [qty, setQty] = useState(0);
  const [costPrice, setCostPrice] = useState(0);

  const [editingPurchaseId, setEditingPurchaseId] = useState<string | null>(null);

  const formatAmount = (val: number) => val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const canManage = currentUser.role === 'ADMIN' || (currentUser.permissions && currentUser.permissions.canManagePurchases);
  const canDelete = currentUser.role === 'ADMIN' || (currentUser.permissions && currentUser.permissions.canDeleteData);

  const inputClass = "w-full h-[52px] px-4 pl-11 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-lime focus:ring-1 focus:ring-lime/50 transition-all outline-none text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400";
  const labelClass = "block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider ml-1";
  const cardClass = "bento-card bg-white dark:bg-[#1C1C1E] p-8 rounded-[32px] shadow-soft border border-gray-100 dark:border-white/5 relative";
  const sectionHeaderClass = "text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3";

  const supplierOptions = parties
    .filter(p => p.type === 'SUPPLIER')
    .map(p => ({
        id: p.id,
        label: p.name,
        subLabel: p.place ? `${p.place} • ${p.phone || ''}` : p.phone || 'No details'
    }));

  const productOptions = products.map(p => ({
      id: p.id,
      label: p.name,
      subLabel: `Cost: ${currency} ${formatAmount(p.costPrice)} • Stock: ${p.stockQuantity}`
  }));

  const onProductSelect = (id: string) => {
    setSelectedProductId(id);
    const prod = products.find(p => p.id === id);
    if (prod) {
      setCostPrice(prod.costPrice);
    }
  };

  const addToCart = () => {
    if (!selectedProductId) return;
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    const newItem: InvoiceItem = {
      productId: product.id,
      productName: product.name,
      quantity: qty,
      unitPrice: costPrice,
      mrp: product.mrp || 0,
      taxRate: 0, 
      taxAmount: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      cessAmount: 0,
      total: costPrice * qty
    };

    setCart(prev => [...prev, newItem]);
    setSelectedProductId('');
    setQty(0);
    setCostPrice(0);
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreatePurchase = () => {
    if ((!selectedPartyId && !supplierName) || cart.length === 0) return;

    const selectedParty = parties.find(p => p.id === selectedPartyId);
    const finalSupplierName = selectedParty ? selectedParty.name : supplierName;
    
    const totalAmount = cart.reduce((sum, item) => sum + item.total, 0);

    const purchaseData: Purchase = {
      id: editingPurchaseId || crypto.randomUUID(),
      date: purchases.find(p => p.id === editingPurchaseId)?.date || new Date().toISOString().split('T')[0],
      supplierName: finalSupplierName,
      partyId: selectedPartyId,
      items: cart,
      totalAmount,
      status: 'PAID' 
    };

    if (editingPurchaseId) {
        onUpdatePurchase(purchaseData);
    } else {
        onAddPurchase(purchaseData);
    }

    setCart([]); setSupplierName(''); setSelectedPartyId(''); setView('list'); setEditingPurchaseId(null);
  };

  const handleEdit = (pur: Purchase) => {
      setEditingPurchaseId(pur.id);
      setCart(pur.items);
      setSelectedPartyId(pur.partyId || '');
      setSupplierName(pur.supplierName);
      setView('create');
  };

  const handleCancelEdit = () => {
      setEditingPurchaseId(null);
      setCart([]); setSupplierName(''); setSelectedPartyId(''); setView('list');
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (confirm("Are you sure? This will delete the purchase and REDUCE stock quantities.")) {
          onDeletePurchase(id);
      }
  };

  // --- IMPORT LOGIC ---
  const handleDownloadTemplate = () => {
    const headers = "date,Bill ID,Supplier,Place,Item,Quantity,Cost Price,Total Amount";
    const sample = "2025-10-10,PB-800,Vendor Corp,Industrial Area,Swadat Swadat,50,150,7500";
    const csvContent = "data:text/csv;charset=utf-8," + [headers, sample].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "purchase_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCurrency = (str: string): number => {
    if (!str) return 0;
    const cleanStr = str.replace(/[^0-9.-]+/g, "");
    return parseFloat(cleanStr) || 0;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const dataRows = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const row = line.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
        if (row.length < 8) continue;
        dataRows.push({
            date: row[0], billId: row[1], supplier: row[2], place: row[3],
            item: row[4], qty: parseFloat(row[5]) || 0, 
            cost: parseCurrency(row[6]), total: parseCurrency(row[7])
        });
      }
      processImportData(dataRows);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const processImportData = (rows: any[]) => {
      const newParties: Map<string, Party> = new Map();
      const newProducts: Map<string, Product> = new Map();
      const purchaseMap: Map<string, any> = new Map();
      const skippedRows: { id: string; reason: string }[] = [];

      rows.forEach((row, idx) => {
          const bid = row.billId || `ROW-${idx}`;
          if (purchases.some(p => p.id === bid)) {
              skippedRows.push({ id: bid, reason: 'Duplicate Bill ID' });
              return;
          }

          if (!purchaseMap.has(bid)) {
              purchaseMap.set(bid, { id: bid, date: row.date, supplierName: row.supplier, items: [], totalAmount: 0 });
          }
          const pur = purchaseMap.get(bid);
          
          let partyId = parties.find(p => p.name && row.supplier && p.name.toLowerCase() === row.supplier.toLowerCase())?.id;
          if (!partyId && !newParties.has(row.supplier)) {
              const np: Party = { id: crypto.randomUUID(), name: row.supplier, type: 'SUPPLIER', place: row.place };
              newParties.set(row.supplier, np); partyId = np.id;
          } else if (!partyId) { partyId = newParties.get(row.supplier)?.id; }

          let productId = products.find(p => p.name && row.item && p.name.toLowerCase() === row.item.toLowerCase())?.id;
          if (!productId && !newProducts.has(row.item)) {
              const np: Product = { 
                  id: crypto.randomUUID(), name: row.item, sku: `IMP-${Math.floor(Math.random()*1000)}`, category: 'Imported', description: '',
                  price: row.cost * 1.5, mrp: row.cost * 2, costPrice: row.cost, stockQuantity: 0, minStockLevel: 5, taxRate: 0, createdAt: new Date().toISOString()
              };
              newProducts.set(row.item, np); productId = np.id;
          } else if (!productId) { productId = newProducts.get(row.item)?.id; }

          pur.items.push({
              productId, productName: row.item, quantity: row.qty, unitPrice: row.cost, 
              mrp: 0, taxRate: 0, taxAmount: 0, cgstAmount: 0, sgstAmount: 0, cessAmount: 0, total: row.total
          });
          pur.totalAmount += row.total;
          pur.partyId = partyId;
      });

      setImportSummary({ 
          newPurchases: Array.from(purchaseMap.values()), 
          newParties: Array.from(newParties.values()), 
          newProducts: Array.from(newProducts.values()), 
          skippedRows 
      });
  };

  const confirmImport = () => {
      if (!importSummary) return;
      onBulkImport(importSummary.newPurchases, importSummary.newParties, importSummary.newProducts);
      setIsImportModalOpen(false);
      setImportSummary(null);
  };

  const filteredPurchases = purchases.filter(pur => {
    const sMatch = pur.supplierName ? pur.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const iMatch = pur.id ? pur.id.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    
    if (!sMatch && !iMatch) return false;

    if (!pur.date) return false;

    // Quick Period logic
    if (filterConfig.year && filterConfig.month) {
        const parts = pur.date.split('-');
        if (parts.length < 2) return false;
        const [y, m] = parts;
        if (y !== filterConfig.year || m !== filterConfig.month) return false;
    } else if (filterConfig.year) {
        if (!pur.date.startsWith(filterConfig.year)) return false;
    } else if (filterConfig.month) {
        const parts = pur.date.split('-');
        if (parts.length < 2) return false;
        const [, m] = parts;
        if (m !== filterConfig.month) return false;
    } else {
        if (filterConfig.dateRange.start && pur.date < filterConfig.dateRange.start) return false;
        if (filterConfig.dateRange.end && pur.date > filterConfig.dateRange.end) return false;
    }

    if (filterConfig.partyId && pur.partyId !== filterConfig.partyId) return false;
    if (filterConfig.productId && !pur.items.some(i => i.productId === filterConfig.productId)) return false;
    if (filterConfig.minAmount && pur.totalAmount < parseFloat(filterConfig.minAmount)) return false;
    if (filterConfig.maxAmount && pur.totalAmount > parseFloat(filterConfig.maxAmount)) return false;
    return true;
  }).sort((a, b) => {
      let valA: any = a.date;
      let valB: any = b.date;
      if (sortConfig.key === 'amount') { valA = a.totalAmount; valB = b.totalAmount; } 
      else if (sortConfig.key === 'name') { valA = (a.supplierName || '').toLowerCase(); valB = (b.supplierName || '').toLowerCase(); } 
      else { valA = a.date ? new Date(a.date).getTime() : 0; valB = b.date ? new Date(b.date).getTime() : 0; }
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
  });

  const displayedPurchases = filteredPurchases.slice(0, visibleCount);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <div className="flex items-center gap-2 mb-1">
               <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Purchases</h2>
               <span className="w-2.5 h-2.5 rounded-full bg-lime"></span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Manage expenses and incoming stock.</p>
        </div>

        {view === 'list' ? (
          <div className="flex items-center gap-3 ml-auto">
            {canManage && (
                <>
                <button onClick={() => setIsImportModalOpen(true)} className="flex bento-card bg-white dark:bg-dark-surface/70 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 p-3 md:px-5 md:py-3 rounded-full items-center gap-2 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors font-bold text-sm shadow-sm">
                    <Upload className="w-5 h-5 md:w-4 md:h-4" />
                    <span className="hidden md:inline">Import</span>
                </button>
                <button 
                    onClick={() => setView('create')}
                    className="btn-black px-6 py-3 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all text-sm"
                >
                    <Plus className="w-5 h-5" /> Add Purchase
                </button>
                </>
            )}
          </div>
        ) : (
          <div className="flex justify-between items-center w-full">
             <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
                {editingPurchaseId ? 'Edit Bill' : 'New Purchase Entry'}
            </h2>
             <button 
                onClick={handleCancelEdit}
                className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white font-bold px-6 py-3 bento-card bg-gray-100 dark:bg-dark-surface/70 rounded-full text-sm hover:shadow-md transition-all"
              >
                Cancel
              </button>
          </div>
        )}
      </div>

      {view === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className={cardClass}>
              <h3 className={sectionHeaderClass}><div className="w-1.5 h-6 bg-lime rounded-full shadow-glow-lime"></div> Supplier Details</h3>
              <div className="space-y-6">
                 <div>
                   <label className={labelClass}>Select Supplier</label>
                   <CustomDropdown 
                        options={supplierOptions}
                        value={selectedPartyId}
                        onChange={(val) => { setSelectedPartyId(val); setSupplierName(''); }}
                        placeholder="Select Registered Supplier"
                        searchPlaceholder="Search suppliers..."
                        icon={Truck}
                   />
                 </div>

                 <div className="flex items-center gap-4">
                    <span className={`h-px flex-1 transition-colors ${!selectedPartyId && !supplierName ? 'bg-lime/50' : 'bg-gray-200 dark:bg-white/10'}`}></span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${!selectedPartyId && !supplierName ? 'bg-lime/10 text-lime-700 dark:text-lime' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>OR</span>
                    <span className={`h-px flex-1 transition-colors ${!selectedPartyId && !supplierName ? 'bg-lime/50' : 'bg-gray-200 dark:bg-white/10'}`}></span>
                 </div>
                 
                 <div>
                   <label className={labelClass}>Manual Supplier Name</label>
                   <div className="relative group">
                      <Truck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-lime transition-colors" />
                      <input 
                        type="text"
                        disabled={!!selectedPartyId}
                        className={`${inputClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                        placeholder="Enter supplier name manually..."
                        value={supplierName}
                        onChange={(e) => setSupplierName(e.target.value)}
                      />
                   </div>
                 </div>
              </div>
            </div>

            <div className={cardClass}>
              <h3 className={sectionHeaderClass}><div className="w-1.5 h-6 bg-lime rounded-full shadow-glow-lime"></div> Stock Items</h3>
              <div className="flex flex-col md:flex-row gap-4 mb-8 items-end">
                <div className="flex-1 w-full">
                  <label className={labelClass}>Select Product</label>
                  <CustomDropdown 
                        options={productOptions}
                        value={selectedProductId}
                        onChange={(val) => onProductSelect(val)}
                        placeholder="Search inventory..."
                        searchPlaceholder="Type to search products..."
                        icon={Search}
                  />
                </div>
                <div className="w-full md:w-32">
                  <label className={labelClass}>Qty</label>
                  <div className="relative group">
                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-lime transition-colors" />
                    <input 
                        type="number"
                        min="0"
                        className={inputClass}
                        value={qty}
                        onChange={(e) => setQty(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="w-full md:w-40">
                  <label className={labelClass}>Cost ({currency})</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold group-focus-within:text-lime transition-colors">{currency}</span>
                    <input 
                        type="number"
                        min="0"
                        step="0.01"
                        className={inputClass}
                        value={costPrice}
                        onChange={(e) => setCostPrice(parseFloat(e.target.value))}
                    />
                  </div>
                </div>
                <button 
                  onClick={addToCart}
                  disabled={!selectedProductId}
                  className="w-full md:w-auto h-[52px] px-8 bg-lime hover:bg-lime-hover text-black rounded-2xl font-bold shadow-lg shadow-lime/20 hover:shadow-lime/40 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Plus className="w-5 h-5" /> Add
                </button>
              </div>
              <div className="overflow-hidden rounded-2xl">
                <table className="w-full text-left border-separate border-spacing-y-2">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Item Name</th>
                      <th className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Qty</th>
                      <th className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Cost</th>
                      <th className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Total</th>
                      <th className="px-4 py-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item, idx) => (
                      <tr key={idx} className="bg-gray-50/80 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 transition-colors group">
                        <td className="px-4 py-4 rounded-l-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-white/10 flex items-center justify-center text-gray-500">
                                    <Box className="w-4 h-4" />
                                </div>
                                <div className="text-sm font-bold text-gray-900 dark:text-white">{item.productName}</div>
                            </div>
                        </td>
                        <td className="px-4 py-4 text-sm font-bold text-center text-gray-600 dark:text-gray-300">{item.quantity}</td>
                        <td className="px-4 py-4 text-sm font-medium text-right text-gray-600 dark:text-gray-300">{currency} {formatAmount(item.unitPrice)}</td>
                        <td className="px-4 py-4 text-sm font-bold text-right text-gray-900 dark:text-white">{currency} {formatAmount(item.total)}</td>
                        <td className="px-4 py-4 text-right rounded-r-2xl">
                          <button onClick={() => removeFromCart(idx)} className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {cart.length === 0 && (
                      <tr><td colSpan={5} className="py-12 text-center text-gray-400 font-medium bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                          <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-20" />
                          No items added yet.
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className={`${cardClass} sticky top-6 min-h-[300px] flex flex-col`}>
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-lime/10 rounded-xl text-lime-700 dark:text-lime">
                        <CreditCard className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Summary</h3>
                </div>
                <div className="space-y-4 flex-1">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400 font-medium">Items Total</span>
                        <span className="font-bold text-gray-900 dark:text-white">{cart.reduce((sum, i) => sum + i.quantity, 0)} Units</span>
                    </div>
                    <div className="h-px bg-dashed border-t border-gray-200 dark:border-white/10 my-4"></div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">Total Payable</span>
                        <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{currency} {formatAmount(cart.reduce((sum, i) => sum + i.total, 0))}</span>
                    </div>
                </div>
                <button 
                onClick={handleCreatePurchase}
                disabled={cart.length === 0 || (!selectedPartyId && !supplierName)}
                className="w-full py-4 mt-8 bg-black hover:bg-gray-900 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:transform-none disabled:shadow-none"
                >
                {editingPurchaseId ? 'Update Bill' : 'Create Bill'} <ArrowRight className="w-4 h-4" />
                </button>
            </div>
          </div>
        </div>
      )}

      {view === 'list' && (
        <div className="hidden sm:block">
             <table className="w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4">
                  <th className="px-6 pb-2">Bill ID</th>
                  <th className="px-6 pb-2">Date</th>
                  <th className="px-6 pb-2">Supplier</th>
                  <th className="px-6 pb-2">Amount</th>
                  <th className="px-6 pb-2">Status</th>
                  <th className="px-6 pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedPurchases.map((pur, index) => {
                  const isEven = index % 2 === 0;
                  return (
                  <tr key={pur.id} className={`bento-card ${isEven ? 'bg-light-surface/70 dark:bg-dark-surface/70' : 'bg-[#FAF9F6]/70 dark:bg-white/5'} group hover:scale-[1.01] hover:shadow-soft-hover transition-all duration-300`}>
                    <td className="px-6 py-5 rounded-l-3xl text-sm font-mono font-bold text-gray-400">#{pur.id ? pur.id.slice(0,8) : 'N/A'}</td>
                    <td className="px-6 py-5 text-sm font-medium text-gray-500 dark:text-gray-400">{pur.date || 'N/A'}</td>
                    <td className="px-6 py-5 font-bold text-gray-900 dark:text-white group-hover:text-lime-700 dark:group-hover:text-lime transition-colors">{pur.supplierName || 'N/A'}</td>
                    <td className="px-6 py-5 text-base font-extrabold text-gray-900 dark:text-white">{currency} {formatAmount(pur.totalAmount)}</td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                        <CheckCircle className="w-3.5 h-3.5" /> Paid
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right rounded-r-3xl">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {canManage && (
                                <button onClick={() => handleEdit(pur)} className="w-8 h-8 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black hover:border-transparent transition-all">
                                    <Edit2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                            {canDelete && (
                                <button onClick={(e) => handleDelete(e, pur.id)} className="w-8 h-8 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-white hover:border-transparent transition-all">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </td>
                  </tr>
                )})}
                 {filteredPurchases.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-16 text-gray-400 font-medium">
                        No purchase bills found.
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
            {filteredPurchases.length > visibleCount && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 pb-4">
                  <button 
                    onClick={() => setVisibleCount(prev => prev + 100)}
                    className="flex items-center gap-2 px-8 py-3 bg-white dark:bg-dark-surface border border-gray-200 dark:border-white/10 rounded-full text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Load another 100 rows
                  </button>
                  <button 
                    onClick={() => setVisibleCount(filteredPurchases.length)}
                    className="flex items-center gap-2 px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-bold transition-all shadow-lg active:scale-95"
                  >
                    <Layers2 className="w-4 h-4" /> Load All Data ({filteredPurchases.length})
                  </button>
                </div>
            )}
        </div>
      )}
      
      {view === 'list' && (
          <div className="sm:hidden space-y-4">
            {displayedPurchases.map(pur => (
                <div key={pur.id} className="bento-card bg-light-surface/70 dark:bg-dark-surface/70 p-5 active:scale-95 transition-transform">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-base">{pur.supplierName}</h3>
                            <p className="text-xs text-gray-400 font-mono">#{pur.id ? pur.id.slice(0, 8) : 'N/A'} / {pur.date || 'N/A'}</p>
                        </div>
                        <div className="flex gap-2">
                            {canManage && <button onClick={() => handleEdit(pur)} className="w-8 h-8 rounded-full bento-card bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-500"><Edit2 className="w-4 h-4" /></button>}
                            {canDelete && <button onClick={(e) => handleDelete(e, pur.id)} className="w-8 h-8 rounded-full bento-card bg-gray-50 dark:bg-white/5 flex items-center justify-center text-red-500"><Trash2 className="w-4 h-4" /></button>}
                        </div>
                    </div>
                    <div className="flex justify-between items-center border-t border-dashed border-gray-200 dark:border-white/10 pt-3 mt-3">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 dark:text-green-400"><CheckCircle className="w-3" /> Paid</span>
                        <span className="text-lg font-extrabold text-gray-900 dark:text-white">{currency} {formatAmount(pur.totalAmount)}</span>
                    </div>
                </div>
            ))}
          </div>
      )}

      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bento-card bg-white dark:bg-dark-surface w-full max-w-lg overflow-hidden animate-fadeIn relative rounded-3xl shadow-2xl">
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Import Purchases</h3>
                <button onClick={() => setIsImportModalOpen(false)} className="w-8 h-8 rounded-full bento-card bg-white dark:bg-white/10 flex items-center justify-center text-gray-400 hover:text-black"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-8 space-y-6">
                {!importSummary ? (
                    <div className="space-y-6">
                        <label className="block w-full cursor-pointer group">
                            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                            <div className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-3xl p-10 flex flex-col items-center justify-center gap-4 group-hover:border-lime group-hover:bg-lime/5 transition-all">
                                <div className="p-4 bento-card bg-gray-50 dark:bg-white/5 rounded-full text-gray-400 group-hover:text-lime group-hover:scale-110 transition-transform"><Upload className="w-8 h-8" /></div>
                                <div className="text-center">
                                    <p className="font-bold text-gray-900 dark:text-white">Click to upload Purchase CSV</p>
                                    <p className="text-xs text-gray-400 mt-1">or drag and drop here</p>
                                </div>
                            </div>
                        </label>
                        <div className="flex justify-center">
                            <button onClick={handleDownloadTemplate} className="text-xs font-bold text-gray-400 hover:text-black dark:hover:text-white flex items-center gap-2 transition-colors">
                                <Download className="w-4 h-4" /> Download Template
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bento-card bg-lime/10 p-4 rounded-2xl"><p className="text-xs text-lime-700 dark:text-lime font-bold uppercase mb-1">Bills</p><p className="text-2xl font-black text-gray-900 dark:text-white">{importSummary.newPurchases.length}</p></div>
                            <div className="bento-card bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl"><p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase mb-1">Suppliers</p><p className="text-2xl font-black text-gray-900 dark:text-white">{importSummary.newParties.length}</p></div>
                            <div className="bento-card bg-purple-50 dark:bg-purple-900/20 p-4 rounded-2xl"><p className="text-xs text-purple-600 dark:text-purple-400 font-bold uppercase mb-1">Products</p><p className="text-2xl font-black text-gray-900 dark:text-white">{importSummary.newProducts.length}</p></div>
                        </div>
                        {importSummary.skippedRows.length > 0 && <div className="bento-card bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl border border-red-100 dark:border-red-900/30"><h4 className="text-xs font-bold text-red-600 uppercase mb-2 flex items-center gap-2"><AlertTriangle className="w-3 h-3"/> Skipped ({importSummary.skippedRows.length})</h4><div className="max-h-24 overflow-y-auto custom-scrollbar"><table className="w-full text-left text-[10px]"><tbody className="text-red-500">{importSummary.skippedRows.map((row:any, i:number) => (<tr key={i}><td className="py-1 font-mono">{row.id}</td><td className="py-1 opacity-70">{row.reason}</td></tr>))}</tbody></table></div></div>}
                        <div className="flex justify-end gap-4 pt-4 border-t border-gray-100 dark:border-white/5">
                            <button onClick={() => setImportSummary(null)} className="px-6 py-3 text-gray-500 font-bold text-sm hover:text-black transition-colors">Back</button>
                            <button onClick={confirmImport} className="btn-black px-8 py-3 text-sm shadow-lg">Confirm Import</button>
                        </div>
                    </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchases;
