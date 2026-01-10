
import React, { useState, useEffect, useRef } from 'react';
import { Product, Currency, Invoice, InvoiceItem, Party, Business, AppPreferences, SortConfig, FilterConfig, User, TaxGroup } from '../types';
import { Plus, Printer, Download, Upload, FileText, Trash2, Edit2, X, CheckCircle, AlertTriangle, CheckSquare, Square, Filter, Maximize2, Minimize2, User as UserIcon, Search, ChevronDown, Layers, Box, ShoppingBag, ArrowRight, CreditCard, Check, Contact, Layers2 } from 'lucide-react';

interface InvoicesProps {
  business: Business;
  products: Product[];
  invoices: Invoice[];
  parties: Party[];
  taxGroups: TaxGroup[];
  currency: Currency;
  preferences: AppPreferences;
  onAddInvoice: (inv: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onUpdateInvoice: (inv: Invoice) => void;
  onBulkImport: (newInvoices: Invoice[], newParties: Party[], newProducts: Product[]) => void;
  searchTerm: string;
  sortConfig: SortConfig;
  filterConfig: FilterConfig;
  currentUser: User;
  onFilterChange: (config: FilterConfig) => void;
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
        <button type="button" onClick={() => { setIsOpen(!isOpen); setSearchTerm(''); }} className={`w-full h-[52px] px-4 pl-11 rounded-2xl bg-gray-50 dark:bg-white/5 border transition-all outline-none text-left flex items-center justify-between ${isOpen ? 'border-lime ring-2 ring-lime/20 bg-white dark:bg-white/10 shadow-lg' : 'border-gray-200 dark:border-white/10 focus:border-lime focus:ring-1 focus:ring-lime/50'}`}>
             <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${isOpen ? 'text-lime-600 dark:text-lime' : 'text-gray-400'}`} />
             <span className={`text-sm font-medium truncate ${selectedOption ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{selectedOption ? selectedOption.label : placeholder}</span>
             <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-lime-600 dark:text-lime' : ''}`} />
        </button>
        {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-3 z-[100] animate-fadeIn origin-top">
                <div className="bg-white/90 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl border border-gray-100 dark:border-white/10 shadow-soft-hover rounded-2xl overflow-hidden ring-1 ring-black/5">
                    <div className="p-3 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input ref={searchInputRef} type="text" className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-black/20 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime/50 transition-all border border-gray-100 dark:border-white/5" placeholder={searchPlaceholder || "Search..."} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto dropdown-scrollbar p-2 space-y-1">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => (
                                <button key={opt.id} onClick={() => { onChange(opt.id); setIsOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl text-sm flex flex-col transition-all duration-200 group relative ${value === opt.id ? 'bg-lime/10 dark:bg-lime/20 text-lime-900 dark:text-lime border-l-2 border-lime' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 border-l-2 border-transparent'}`}>
                                    <div className="flex justify-between items-center w-full relative z-10">
                                        <span className={`font-semibold transition-colors ${value === opt.id ? 'text-lime-900 dark:text-lime' : 'group-hover:text-black dark:group-hover:text-white'}`}>{opt.label}</span>
                                        {value === opt.id && <Check className="w-4 h-4 text-lime-600 dark:text-lime" />}
                                    </div>
                                    {opt.subLabel && <span className={`text-xs mt-1 transition-colors relative z-10 ${value === opt.id ? 'text-lime-800/70 dark:text-lime/80' : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-400'}`}>{opt.subLabel}</span>}
                                </button>
                            ))
                        ) : <div className="px-4 py-8 text-center text-xs text-gray-400 flex flex-col items-center gap-2"><Search className="w-6 h-6 opacity-20" />No results found.</div>}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

const Invoices: React.FC<InvoicesProps> = ({ 
    business, products, invoices, parties, taxGroups, currency, preferences, 
    onAddInvoice, onDeleteInvoice, onUpdateInvoice, onBulkImport, 
    searchTerm, sortConfig, filterConfig, currentUser, onFilterChange 
}) => {
  const [view, setView] = useState<'list' | 'create'>('list');
  const [expandedView, setExpandedView] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importSummary, setImportSummary] = useState<any>(null);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [customCustomerName, setCustomCustomerName] = useState('');
  const [cart, setCart] = useState<InvoiceItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [qty, setQty] = useState(0);
  const [visibleCount, setVisibleCount] = useState(100);

  const formatAmount = (val: number) => val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const cols = preferences.columns.invoices;
  const canManage = currentUser.role === 'ADMIN' || (currentUser.permissions && currentUser.permissions.canManageInvoices);
  const canDelete = currentUser.role === 'ADMIN' || (currentUser.permissions && currentUser.permissions.canDeleteData);

  const partyOptions = parties.filter(p => p.type === 'CUSTOMER').map(p => ({ id: p.id, label: p.name, subLabel: p.phone ? `${p.phone} • ${p.place || 'No Location'}` : p.place || 'No details' }));
  const productOptions = products.map(p => ({ id: p.id, label: p.name, subLabel: `Stock: ${p.stockQuantity} ${p.unit || ''} • ${currency} ${formatAmount(p.price)}` }));

  const handleContactPicker = async () => {
    const supported = ('contacts' in navigator && 'ContactsManager' in window);
    if (!supported) {
      alert("Contact selection is not supported on this device/browser.");
      return;
    }
    try {
      const contacts = await (navigator as any).contacts.select(['name'], { multiple: false });
      if (contacts && contacts.length > 0) {
        const name = contacts[0].name && contacts[0].name[0] ? contacts[0].name[0] : '';
        if (name) {
          setCustomCustomerName(name);
          setSelectedPartyId('');
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') console.error("Contact picker error:", err);
    }
  };

  const addToCart = () => {
    if (!selectedProductId) return;
    if (qty <= 0) {
       alert("Please enter a valid quantity greater than 0.");
       return;
    }
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;
    
    if (qty > product.stockQuantity) {
        if(!confirm(`Only ${product.stockQuantity} units available. Continue?`)) return;
    }

    const basePrice = product.price * qty;
    const mrp = product.mrp || product.price;
    const mrpTotal = mrp * qty;

    let taxRate = 0;
    let currentCessRate = 0;
    let cgstAmount = 0;
    let sgstAmount = 0;
    let cessAmount = 0;
    let taxComponentsSnapshot = [];
    
    if (product.taxGroupId) {
        const group = taxGroups.find(g => g.id === product.taxGroupId);
        if (group) {
            taxComponentsSnapshot = group.components;
            taxRate = group.components.reduce((sum, c) => sum + c.percentage, 0);
            
            group.components.forEach(comp => {
                const name = comp.name.toUpperCase();
                
                if (name.includes('CESS')) {
                    cessAmount += mrpTotal * (comp.percentage / 100);
                    currentCessRate = comp.percentage;
                } else {
                    const amount = basePrice * (comp.percentage / 100);
                    if (name.includes('CGST')) cgstAmount += amount;
                    else if (name.includes('SGST')) sgstAmount += amount;
                }
            });
        }
    } else {
        taxRate = product.taxRate || 0;
        currentCessRate = product.cessRate || 0;
        
        const gstAmount = (basePrice * taxRate) / 100;
        cgstAmount = gstAmount / 2;
        sgstAmount = gstAmount / 2;
        
        cessAmount = mrpTotal * (currentCessRate / 100);
        
        taxComponentsSnapshot = [
            { name: 'CGST', percentage: taxRate / 2 },
            { name: 'SGST', percentage: taxRate / 2 }
        ];
        if (currentCessRate > 0) {
            taxComponentsSnapshot.push({ name: 'Cess', percentage: currentCessRate });
        }
    }

    const totalTax = cgstAmount + sgstAmount + cessAmount;

    const newItem: InvoiceItem = {
      productId: product.id, 
      productName: product.name, 
      quantity: qty, 
      unitPrice: product.price,
      mrp: mrp,
      taxGroupId: product.taxGroupId,
      taxRate: taxRate,
      cessRate: currentCessRate,
      taxComponents: taxComponentsSnapshot,
      
      cgstAmount,
      sgstAmount,
      cessAmount,
      taxAmount: totalTax, 
      total: basePrice + totalTax, 
      hsnCode: product.hsnCode, 
      unit: product.unit
    };
    setCart(prev => [...prev, newItem]); setSelectedProductId(''); setQty(0);
  };

  const removeFromCart = (index: number) => setCart(prev => prev.filter((_, i) => i !== index));
  
  const generateNextInvoiceNumber = () => {
      const prefix = business.invoicePrefix || '';
      const startNum = business.invoiceStartNumber || 1;
      
      // Defensively check invoiceNo before startsWith
      const existingInvoices = invoices.filter(inv => inv.invoiceNo && inv.invoiceNo.startsWith(prefix));
      
      let maxNum = startNum - 1;
      
      existingInvoices.forEach(inv => {
          const numPart = inv.invoiceNo.slice(prefix.length);
          const num = parseInt(numPart);
          if (!isNaN(num) && num > maxNum) {
              maxNum = num;
          }
      });

      return `${prefix}${maxNum + 1}`;
  };

  const handleCreateInvoice = () => {
    if ((!selectedPartyId && !customCustomerName) || cart.length === 0) return;
    const selectedParty = parties.find(p => p.id === selectedPartyId);
    const customerName = selectedParty ? selectedParty.name : customCustomerName;
    const subTotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const totalTax = cart.reduce((sum, item) => sum + item.taxAmount, 0);
    
    const existing = invoices.find(i => i.id === editingInvoiceId);
    const invoiceNo = existing ? existing.invoiceNo : generateNextInvoiceNumber();

    const invoiceData: Invoice = {
      id: editingInvoiceId || crypto.randomUUID(), 
      invoiceNo: invoiceNo,
      date: existing?.date || new Date().toISOString().split('T')[0],
      customerName, 
      partyId: selectedPartyId,
      items: cart, 
      subTotal, 
      taxAmount: totalTax, 
      totalAmount: subTotal + totalTax, 
      status: 'PAID'
    };

    if (editingInvoiceId) {
        onUpdateInvoice(invoiceData);
    } else {
        onAddInvoice(invoiceData);
    }
    
    setCart([]); setCustomCustomerName(''); setSelectedPartyId(''); setView('list'); setEditingInvoiceId(null);
  };

  const handleEdit = (inv: Invoice) => {
      setEditingInvoiceId(inv.id);
      setCart(inv.items || []); 
      setSelectedPartyId(inv.partyId || '');
      setCustomCustomerName(inv.customerName);
      setView('create');
  };

  const handleCancelEdit = () => {
      setEditingInvoiceId(null);
      setCart([]);
      setCustomCustomerName('');
      setSelectedPartyId('');
      setView('list');
  };
  
  const handleDelete = (id: string) => {
      onDeleteInvoice(id);
  }

  const filteredInvoices = invoices.filter(inv => {
    const nameMatch = inv.customerName ? inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const noMatch = inv.invoiceNo ? inv.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    
    if (!nameMatch && !noMatch) return false;

    if (!inv.date) return false;

    // Quick Period Logic
    if (filterConfig.year && filterConfig.month) {
        const parts = inv.date.split('-');
        if (parts.length < 2) return false;
        const [y, m] = parts;
        if (y !== filterConfig.year || m !== filterConfig.month) return false;
    } else if (filterConfig.year) {
        if (!inv.date.startsWith(filterConfig.year)) return false;
    } else if (filterConfig.month) {
        const parts = inv.date.split('-');
        if (parts.length < 2) return false;
        const [, m] = parts;
        if (m !== filterConfig.month) return false;
    } else {
        if (filterConfig.dateRange.start && inv.date < filterConfig.dateRange.start) return false;
        if (filterConfig.dateRange.end && inv.date > filterConfig.dateRange.end) return false;
    }

    if (filterConfig.partyId && inv.partyId !== filterConfig.partyId) return false;
    if (filterConfig.productId && !inv.items.some(i => i.productId === filterConfig.productId)) return false;
    if (filterConfig.minAmount && inv.totalAmount < parseFloat(filterConfig.minAmount)) return false;
    if (filterConfig.maxAmount && inv.totalAmount > parseFloat(filterConfig.maxAmount)) return false;

    return true;
  }).sort((a, b) => {
      let valA: any = a.date;
      let valB: any = b.date;
      if (sortConfig.key === 'amount') { valA = a.totalAmount; valB = b.totalAmount; }
      else if (sortConfig.key === 'name') { valA = (a.customerName || '').toLowerCase(); valB = (b.customerName || '').toLowerCase(); }
      else { valA = a.date ? new Date(a.date).getTime() : 0; valB = b.date ? new Date(b.date).getTime() : 0; }
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedInvoiceIds(filteredInvoices.map(inv => inv.id));
    } else {
      setSelectedInvoiceIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedInvoiceIds.includes(id)) {
      setSelectedInvoiceIds(selectedInvoiceIds.filter(sid => sid !== id));
    } else {
      setSelectedInvoiceIds([...selectedInvoiceIds, id]);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = "date,Invoice Number,Name,Place,Item,Quantity,Taxable AMOUNT,SGST,CGST,CESS,Total Amount";
    const sample1 = "2025-10-08,A1-860,Favorite Store,Manjeri road Ramanattukara,Swadat Gold mrp 7/-,300,18470.40,2585.86,2585.86,0,23642.12";
    const csvContent = "data:text/csv;charset=utf-8," + [headers, sample1].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "invoice_import_template.csv");
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
        const parseCSVLine = (str: string) => {
            const result = [];
            let cell = '';
            let inQuotes = false;
            for (let j = 0; j < str.length; j++) {
                const char = str[j];
                if (char === '"') { inQuotes = !inQuotes; } 
                else if (char === ',' && !inQuotes) { result.push(cell.trim()); cell = ''; } 
                else { cell += char; }
            }
            result.push(cell.trim());
            return result;
        };
        const row = parseCSVLine(line);
        if (row.length < 11) continue; 
        dataRows.push({
            date: row[0]?.replace(/"/g, ''), invoiceNo: row[1]?.replace(/"/g, ''),
            name: row[2]?.replace(/"/g, ''), place: row[3]?.replace(/"/g, ''),
            item: row[4]?.replace(/"/g, ''), qty: parseFloat(row[5]) || 0,
            taxableAmount: parseCurrency(row[6]), sgst: parseCurrency(row[7]),
            cgst: parseCurrency(row[8]), cess: parseCurrency(row[9]), totalAmount: parseCurrency(row[10])
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
      const invoiceMap: Map<string, any> = new Map();
      const skippedRows: { id: string; reason: string; data: any }[] = [];

      rows.forEach((row, idx) => {
          if (!row.invoiceNo) {
             skippedRows.push({ id: `Row ${idx+1}`, reason: 'Missing Invoice Number', data: row });
             return;
          }
          if (invoices.some(inv => inv.invoiceNo === row.invoiceNo)) { 
             if (!skippedRows.some(s => s.id === row.invoiceNo)) {
                 skippedRows.push({ id: row.invoiceNo, reason: 'Duplicate Invoice ID', data: row });
             }
             return; 
          }

          if (!invoiceMap.has(row.invoiceNo)) {
              invoiceMap.set(row.invoiceNo, { id: crypto.randomUUID(), invoiceNo: row.invoiceNo, date: row.date, customerName: row.name, place: row.place, items: [], rawTotal: 0 });
          }
          const inv = invoiceMap.get(row.invoiceNo);
          const totalTax = row.sgst + row.cgst + row.cess;
          const lineTotal = row.taxableAmount + totalTax;
          let partyId = parties.find(p => p.name && row.name && p.name.toLowerCase() === row.name.toLowerCase())?.id;
          if (!partyId && !newParties.has(row.name)) {
              const newParty: Party = { id: crypto.randomUUID(), name: row.name, type: 'CUSTOMER', place: row.place };
              newParties.set(row.name, newParty); partyId = newParty.id;
          } else if (!partyId && newParties.has(row.name)) { partyId = newParties.get(row.name)?.id; }
          let productId = products.find(p => p.name && row.item && p.name.toLowerCase() === row.item.toLowerCase())?.id;
          if (!productId && !newProducts.has(row.item)) {
              const taxRate = row.taxableAmount > 0 ? ((row.sgst+row.cgst) / row.taxableAmount) * 100 : 0;
              const unitPrice = row.qty > 0 ? row.taxableAmount / row.qty : 0;
              const newProduct: Product = {
                  id: crypto.randomUUID(), name: row.item, sku: `IMP-${Math.floor(Math.random()*10000)}`, category: 'Imported', description: 'Imported',
                  price: unitPrice, mrp: unitPrice, costPrice: unitPrice * 0.7, stockQuantity: 1000, minStockLevel: 10,
                  taxRate: Math.round(taxRate * 10) / 10, cessRate: 0, unit: 'Nos', createdAt: new Date().toISOString().split('T')[0]
              };
              newProducts.set(row.item, newProduct); productId = newProduct.id;
          } else if (!productId && newProducts.has(row.item)) { productId = newProducts.get(row.item)?.id; }
          inv.items.push({
              productId: productId, productName: row.item, quantity: row.qty, unitPrice: row.qty > 0 ? row.taxableAmount / row.qty : 0, mrp: 0, 
              taxRate: row.taxableAmount > 0 ? ((row.sgst + row.cgst)/row.taxableAmount)*100 : 0,
              cessRate: 0,
              cgstAmount: row.cgst, sgstAmount: row.sgst, cessAmount: row.cess,
              taxAmount: row.sgst + row.cgst + row.cess, total: lineTotal, hsnCode: '', unit: 'Nos'
          });
          inv.rawTotal += lineTotal; inv.partyId = partyId;
      });

      const preparedInvoices: Invoice[] = [];
      invoiceMap.forEach((val) => {
           let dateStr = val.date;
           const dateObj = new Date(val.date);
           if (!isNaN(dateObj.getTime())) { dateStr = dateObj.toISOString().split('T')[0]; }
           const subTotal = val.items.reduce((s:number, i:any) => s + (i.unitPrice * i.quantity), 0);
           const taxAmount = val.items.reduce((s:number, i:any) => s + i.taxAmount, 0);
           preparedInvoices.push({ id: val.id, invoiceNo: val.invoiceNo, date: dateStr, customerName: val.customerName, partyId: val.partyId, items: val.items, subTotal, taxAmount, totalAmount: subTotal + taxAmount, status: 'PAID' });
      });
      setImportSummary({ newInvoices: preparedInvoices, newParties: Array.from(newParties.values()), newProducts: Array.from(newProducts.values()), skippedRows });
  };
  const confirmImport = () => {
      if (!importSummary || !business) return;
      onBulkImport(importSummary.newInvoices, importSummary.newParties, importSummary.newProducts);
      setIsImportModalOpen(false);
      setImportSummary(null);
  };
  
  const numberToWords = (num: number): string => {
    const a = ['','One ','Two ','Three ','Four ','Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
    const b = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];

    const inWords = (n: number): string => {
        if ((n = n.toString() as any).length > 9) return 'overflow';
        let n_array: any = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
        if (!n_array) return "";
        let str = '';
        str += (Number(n_array[1]) != 0) ? (a[Number(n_array[1])] || b[n_array[1][0]] + ' ' + a[n_array[1][1]]) + 'Crore ' : '';
        str += (Number(n_array[2]) != 0) ? (a[Number(n_array[2])] || b[n_array[2][0]] + ' ' + a[n_array[2][1]]) + 'Lakh ' : '';
        str += (Number(n_array[3]) != 0) ? (a[Number(n_array[3])] || b[n_array[3][0]] + ' ' + a[n_array[3][1]]) + 'Thousand ' : '';
        str += (Number(n_array[4]) != 0) ? (a[Number(n_array[4])] || b[n_array[4][0]] + ' ' + a[n_array[4][1]]) + 'Hundred ' : '';
        str += (Number(n_array[5]) != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n_array[5])] || b[n_array[5][0]] + ' ' + a[n_array[5][1]]) : '';
        return str;
    };
    
    const whole = Math.floor(num);
    const fraction = Math.round((num - whole) * 100);
    return inWords(whole) + (fraction ? `and ${inWords(fraction)} Paise` : '') + " Rupees Only";
  };

  const handleBulkExport = () => {
      if (selectedInvoiceIds.length === 0) return;
      
      const invoicesToExport = invoices.filter(inv => selectedInvoiceIds.includes(inv.id));
      const headers = "InvoiceID,InvoiceNo,Date,Customer,Total Amount,Status\n";
      
      const rows = invoicesToExport.map(inv => {
          return `${inv.id},${inv.invoiceNo},${inv.date},"${inv.customerName}",${inv.totalAmount},${inv.status}`;
      }).join("\n");

      const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `invoices_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleBulkPrint = () => {
      if (selectedInvoiceIds.length === 0) return;
      const invoicesToPrint = invoices.filter(inv => selectedInvoiceIds.includes(inv.id));
      handlePrintInvoices(invoicesToPrint);
  };

  const handleBulkDelete = () => {
      if (selectedInvoiceIds.length === 0) return;
      selectedInvoiceIds.forEach(id => onDeleteInvoice(id));
      setSelectedInvoiceIds([]);
  };

  const handlePrint = (inv: Invoice) => {
     handlePrintInvoices([inv]);
  };

  const handlePrintInvoices = (invoiceList: Invoice[]) => {
    if (!business) {
        alert("Business details missing. Please check Settings.");
        return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const calculateTaxAnalysis = (items: InvoiceItem[]) => {
        const analysis: Record<string, { hsn: string, taxable: number, cgst: number, sgst: number, cess: number, rate: number, cessRate: number }> = {};
        
        items.forEach(item => {
            const key = `${item.hsnCode || 'NA'}-${item.taxRate}-${item.cessRate || 0}`;
            if (!analysis[key]) {
                analysis[key] = { 
                    hsn: item.hsnCode || '', 
                    taxable: 0, cgst: 0, sgst: 0, cess: 0, 
                    rate: item.taxRate,
                    cessRate: item.cessRate || 0 
                };
            }
            const taxable = item.unitPrice * item.quantity;
            analysis[key].taxable += taxable;
            analysis[key].cgst += item.cgstAmount || ((taxable * item.taxRate/2)/100);
            analysis[key].sgst += item.sgstAmount || ((taxable * item.taxRate/2)/100);
            analysis[key].cess += item.cessAmount || 0;
        });
        return Object.values(analysis);
    };

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Invoices</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Times+New+Roman&display=swap');
            
            @page { 
                size: A5 portrait; 
                margin: 0; 
            }
            
            body {
                font-family: 'Times New Roman', serif;
                font-size: 9pt;
                margin: 0;
                padding: 0;
                background: #525659;
            }

            .print-container {
                background: white;
                width: 148mm; 
                min-height: 210mm; 
                margin: 10mm auto; 
                padding: 15mm; /* CRITICAL: 1.5cm Margin as requested */
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
            }

            .invoice-box {
                border: 1px solid #000;
                flex: 1; 
                display: flex;
                flex-direction: column;
            }

            .header {
                padding: 5px;
                border-bottom: 1px solid #000;
            }

            .header-top {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
            }

            .company-info {
                text-align: center;
                flex: 1;
                padding: 0 5px;
            }

            .company-name {
                font-size: 14pt;
                font-weight: bold;
                text-transform: uppercase;
                margin-bottom: 2px;
            }

            .company-details {
                font-size: 8pt;
                line-height: 1.2;
            }

            .invoice-title {
                text-align: center;
                font-weight: bold;
                margin-top: 5px;
                font-size: 10pt;
                border: 1px solid #000;
                display: inline-block;
                padding: 2px 10px;
                border-radius: 4px;
            }

            .buyer-section {
                border-bottom: 1px solid #000;
                padding: 5px;
                display: flex;
                font-size: 9pt;
            }

            .buyer-label {
                font-weight: bold;
                width: 60px;
                flex-shrink: 0;
            }

            .buyer-details {
                flex: 1;
                line-height: 1.2;
            }

            .items-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 8pt;
                flex: 1;
                margin-top: 2px;
            }

            .items-table th {
                border: 1px solid #000;
                font-weight: bold;
                padding: 3px;
                text-align: center;
                background-color: #f0f0f0;
            }

            .items-table td {
                border-left: 1px solid #000;
                border-right: 1px solid #000;
                padding: 3px;
                vertical-align: top;
            }

            .col-desc { width: 35%; }
            .col-hsn { width: 10%; text-align: center; }
            .col-rate { width: 10%; text-align: center; }
            .col-qty { width: 10%; text-align: center; }
            .col-per { width: 8%; text-align: center; }
            .col-price { width: 12%; text-align: right; }
            .col-amount { width: 15%; text-align: right; }

            .totals-row td {
                font-weight: bold;
                background-color: #f0f0f0;
                border-top: 1px solid #000;
                border-bottom: 1px solid #000;
            }

            .footer-section {
                margin-top: auto;
                border-top: 1px solid #000;
                font-size: 8pt;
            }

            .amount-words {
                border-bottom: 1px solid #000;
                padding: 4px;
            }

            .tax-analysis {
                width: 100%;
                border-collapse: collapse;
                font-size: 7pt;
                margin-top: 2px;
            }
            .tax-analysis th, .tax-analysis td {
                border: 1px solid #000;
                padding: 2px;
                text-align: center;
            }
            .tax-analysis th { background: #f9f9f9; }

            .footer-bottom {
                display: flex;
                border-top: 1px solid #000;
            }

            .bank-details {
                flex: 1.5;
                border-right: 1px solid #000;
                padding: 5px;
                font-size: 8pt;
            }

            .declaration {
                margin-top: 5px;
                font-size: 7pt;
            }

            .signatory {
                flex: 1;
                padding: 5px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                align-items: flex-end;
                text-align: right;
                font-size: 8pt;
            }

            .computer-gen {
                text-align: center;
                font-style: italic;
                font-size: 7pt;
                padding: 1px;
            }

            .control-bar {
                position: fixed;
                top: 0; right: 0; left: 0;
                background: #333;
                padding: 10px 20px;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                z-index: 999;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            }
            .btn {
                padding: 8px 16px;
                border-radius: 4px;
                border: none;
                cursor: pointer;
                font-weight: bold;
            }
            .btn-print { background: #8ab4f8; color: #000; }
            .btn-close { background: #444; color: #fff; border: 1px solid #666; }

            @media print {
                body { background: none; margin: 0; }
                .control-bar { display: none; }
                .print-container { 
                    margin: 0; 
                    box-shadow: none; 
                    width: 148mm;
                    height: 210mm;
                    page-break-after: always;
                    padding: 15mm; /* CRITICAL: 1.5cm Margin as requested */
                }
            }
          </style>
        </head>
        <body>
            <div class="control-bar">
                <button class="btn btn-close" onclick="window.close()">Close</button>
                <button class="btn btn-print" onclick="window.print()">Print</button>
            </div>

            ${invoiceList.map(inv => {
                const party = parties.find(p => p.id === inv.partyId);
                const taxAnalysis = calculateTaxAnalysis(inv.items);
                const roundOff = Math.round(inv.totalAmount) - inv.totalAmount;
                const totalTax = inv.items.reduce((sum, i) => sum + i.taxAmount, 0);

                const representativeRate = inv.items.length > 0 ? inv.items[0].taxRate : 0;
                const representativeCessRate = inv.items.length > 0 ? (inv.items[0].cessRate || 0) : 0;
                const cgstRate = Math.round(representativeRate / 2);
                const sgstRate = Math.round(representativeRate / 2);
                const cessRate = Math.round(representativeCessRate);

                const totalCessAmount = inv.items.reduce((s,i)=>s+(i.cessAmount||0),0);

                return `
                <div class="print-container">
                    <div class="invoice-box">
                        <div class="header">
                            <div class="header-top">
                                <div style="width: 25%; font-size: 8pt;">Invoice No : <br/> <span style="font-weight:bold; font-size: 10pt;">${inv.invoiceNo}</span></div>
                                <div class="company-info">
                                    <div class="company-name">${business.name}</div>
                                    <div class="company-details">
                                        ${business.addressLine1 || ''}<br/>
                                        ${business.addressLine2 || ''} ${business.city || ''}<br/>
                                        ${business.state || ''} - ${business.pincode || ''}<br/>
                                        GSTIN : ${business.gstIn || ''}<br/>
                                        Phone : ${business.phone || ''}
                                    </div>
                                    <div class="invoice-title">TAX INVOICE</div>
                                </div>
                                <div style="width: 25%; text-align: right; font-size: 8pt;">Date : <br/> <span style="font-weight:bold; font-size: 10pt;">${inv.date}</span></div>
                            </div>
                        </div>

                        <div class="buyer-section">
                            <div class="buyer-label">Buyer :</div>
                            <div class="buyer-details">
                                <strong>${inv.customerName}</strong><br/>
                                ${party?.addressLine1 || ''}<br/>
                                ${party?.place || ''}<br/>
                                ${party?.state ? `State : ${party.state}` : ''} ${party?.stateCode ? `, Code : ${party.stateCode}` : ''}<br/>
                                ${party?.phone ? `Ph : ${party.phone}` : ''}
                            </div>
                        </div>

                        <table class="items-table">
                            <thead>
                                <tr>
                                    <th class="col-desc">Description</th>
                                    <th class="col-hsn">HSN</th>
                                    <th class="col-rate">GST %</th>
                                    <th class="col-qty">Qty</th>
                                    <th class="col-per">Per</th>
                                    <th class="col-price">Rate</th>
                                    <th class="col-amount">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${inv.items.map(item => `
                                    <tr>
                                        <td class="col-desc"><strong>${item.productName}</strong></td>
                                        <td class="col-hsn">${item.hsnCode || ''}</td>
                                        <td class="col-rate">${Math.round(item.taxRate)}%</td>
                                        <td class="col-qty">${item.quantity}</td>
                                        <td class="col-per">${item.unit || 'Nos'}</td>
                                        <td class="col-price">${item.unitPrice.toFixed(2)}</td>
                                        <td class="col-amount">${(item.unitPrice * item.quantity).toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                                <tr style="height: 100%;">
                                    <td style="border-bottom: none; border-top:none;"></td><td style="border-bottom: none; border-top:none;"></td><td style="border-bottom: none; border-top:none;"></td><td style="border-bottom: none; border-top:none;"></td><td style="border-bottom: none; border-top:none;"></td><td style="border-bottom: none; border-top:none;"></td><td style="border-bottom: none; border-top:none;"></td>
                                </tr>
                                
                                <tr>
                                    <td colspan="6" style="text-align: right; font-weight: bold; border-top: 1px solid #000;">CGST @ ${cgstRate}%</td>
                                    <td style="text-align: right; border-top: 1px solid #000;">${(totalTax/2).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td colspan="6" style="text-align: right; font-weight: bold;">SGST @ ${sgstRate}%</td>
                                    <td style="text-align: right;">${(totalTax/2).toFixed(2)}</td>
                                </tr>
                                ${totalCessAmount > 0 ? `
                                <tr>
                                    <td colspan="6" style="text-align: right; font-weight: bold;">CESS @ ${cessRate}%</td>
                                    <td style="text-align: right;">${totalCessAmount.toFixed(2)}</td>
                                </tr>
                                ` : ''}
                                <tr>
                                    <td colspan="6" style="text-align: right; font-weight: bold;">ROUND OFF</td>
                                    <td style="text-align: right;">${roundOff.toFixed(2)}</td>
                                </tr>
                                <tr class="totals-row">
                                    <td colspan="6" style="text-align: right; font-size: 10pt;">Total</td>
                                    <td style="text-align: right; font-size: 10pt;">₹ ${Math.round(inv.totalAmount).toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div class="footer-section">
                            <div class="amount-words">
                                Amount (in words) : <span style="font-weight: bold; font-style: italic;">${numberToWords(Math.round(inv.totalAmount))}</span>
                            </div>

                            <table class="tax-analysis">
                                <thead>
                                    <tr>
                                        <th rowspan="2">HSN/SAC</th>
                                        <th rowspan="2">Taxable</th>
                                        <th colspan="2">CGST</th>
                                        <th colspan="2">SGST</th>
                                        <th colspan="2">Cess</th>
                                        <th rowspan="2">Tax Amt</th>
                                    </tr>
                                    <tr>
                                        <th>%</th><th>Amt</th>
                                        <th>%</th><th>Amt</th>
                                        <th>%</th><th>Amt</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${taxAnalysis.map(t => `
                                        <tr>
                                            <td>${t.hsn}</td>
                                            <td>${t.taxable.toFixed(2)}</td>
                                            <td>${(t.rate/2).toFixed(0)}%</td>
                                            <td>${t.cgst.toFixed(2)}</td>
                                            <td>${(t.rate/2).toFixed(0)}%</td>
                                            <td>${t.sgst.toFixed(2)}</td>
                                            <td>${t.cessRate.toFixed(0)}%</td>
                                            <td>${t.cess.toFixed(2)}</td>
                                            <td>${(t.cgst + t.sgst + t.cess).toFixed(2)}</td>
                                        </tr>
                                    `).join('')}
                                    <tr style="font-weight: bold;">
                                        <td style="text-align: right">Total</td>
                                        <td>${taxAnalysis.reduce((s,t)=>s+t.taxable,0).toFixed(2)}</td>
                                        <td></td>
                                        <td>${taxAnalysis.reduce((s,t)=>s+t.cgst,0).toFixed(2)}</td>
                                        <td></td>
                                        <td>${taxAnalysis.reduce((s,t)=>s+t.sgst,0).toFixed(2)}</td>
                                        <td></td>
                                        <td>${taxAnalysis.reduce((s,t)=>s+t.cess,0).toFixed(2)}</td>
                                        <td>${taxAnalysis.reduce((s,t)=>s+(t.cgst+t.sgst+t.cess),0).toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <div style="padding: 2px 5px; border-bottom: 1px solid #000; font-size: 8pt;">
                                Tax Amount (in words) : <span style="font-weight: bold;">${numberToWords(totalTax + totalCessAmount)}</span>
                            </div>
                        </div>

                        <div class="footer-bottom">
                            <div class="bank-details">
                                <div style="font-weight: bold; text-decoration: underline; margin-bottom: 2px;">Bank Details</div>
                                Bank : <span style="font-weight: bold;">${business.bankName || ''}</span><br/>
                                A/c : <span style="font-weight: bold;">${business.bankAccountNo || ''}</span><br/>
                                IFSC : <span style="font-weight: bold;">${business.bankBranchIFSC || ''}</span>
                                
                                <div class="declaration">
                                    <span style="font-weight: bold;">Declaration :</span>
                                    We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct
                                </div>
                            </div>
                            <div class="signatory">
                                <div style="font-weight: bold;">for ${business.name}</div>
                                <div style="margin-bottom: 20px;"></div>
                                <div style="font-weight: bold;">Authorised Signatory</div>
                            </div>
                        </div>
                        
                        <div class="computer-gen">This is a computer generated invoice</div>
                    </div>
                </div>
                `;
            }).join('<div style="page-break-after: always;"></div>')}
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const monthNames: Record<string, string> = { '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec' };

  const isContactPickerSupported = typeof window !== 'undefined' && 'contacts' in navigator && 'ContactsManager' in window;

  const displayedInvoices = filteredInvoices.slice(0, visibleCount);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div>
            <div className="flex items-center gap-2 mb-1">
               <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Sales</h2>
               <span className="w-2.5 h-2.5 rounded-full bg-lime"></span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Manage invoices and track revenue.</p>
        </div>
        {view === 'list' ? (
          <div className="flex gap-3 ml-auto items-center">
            <button onClick={() => setExpandedView(!expandedView)} className={`p-3 rounded-full border transition-all flex items-center justify-center ${expandedView ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800' : 'bento-card bg-white dark:bg-dark-surface/70 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10'}`}>{expandedView ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}</button>
            {selectedInvoiceIds.length > 0 && (
                <div className="flex gap-2 mr-2 bg-indigo-50 dark:bg-indigo-900/30 p-1.5 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                    <button onClick={handleBulkPrint} className="p-2 bg-white dark:bg-gray-800 text-indigo-600 rounded-xl shadow-sm"><Printer className="w-4 h-4" /></button>
                    <button onClick={handleBulkExport} className="p-2 bg-white dark:bg-gray-800 text-green-600 rounded-xl shadow-sm"><Download className="w-4 h-4" /></button>
                    {canDelete && <button onClick={handleBulkDelete} className="p-2 bg-white dark:bg-gray-800 text-red-600 rounded-xl shadow-sm"><Trash2 className="w-4 h-4" /></button>}
                </div>
            )}
            {canManage && <><button onClick={() => setIsImportModalOpen(true)} className="flex bento-card bg-white dark:bg-dark-surface/70 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 p-3 md:px-5 md:py-3 rounded-full items-center gap-2 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors font-bold text-sm shadow-sm"><Upload className="w-5 h-5 md:w-4 md:h-4" /><span className="hidden md:inline">Import</span></button><button onClick={() => setView('create')} className="btn-black px-6 py-3 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all text-sm"><Plus className="w-5 h-5" /><span className="hidden sm:inline">Create Invoice</span><span className="sm:hidden">New</span></button></>}
          </div>
        ) : <div className="flex justify-between items-center w-full"><h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">{editingInvoiceId ? 'Edit Invoice' : 'New Invoice'}</h2><button onClick={handleCancelEdit} className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white font-bold px-6 py-3 bento-card bg-gray-100 dark:bg-dark-surface/70 rounded-full text-sm hover:shadow-md transition-all">Cancel</button></div>}
      </div>

      {view === 'list' && (
        <>
          {(filterConfig.month || filterConfig.year) && (
            <div className="mb-4 p-4 bento-card bg-lime/5 border border-lime/20 shadow-none flex justify-between items-center">
                <div className="flex items-center gap-3 text-lime-800 dark:text-lime">
                    <div className="p-2 bg-lime/20 rounded-full"><Filter className="w-4 h-4" /></div>
                    <span className="text-sm font-bold">
                        Showing: {filterConfig.month ? `${monthNames[filterConfig.month]} ` : ''}{filterConfig.year}
                    </span>
                </div>
                <button onClick={() => onFilterChange({ ...filterConfig, month: '', year: '' })} className="text-xs bg-white dark:bg-black/20 hover:bg-lime hover:text-black text-lime-800 dark:text-lime px-5 py-2.5 rounded-xl transition-all font-bold shadow-sm">Show All Time</button>
            </div>
          )}

          <div className="hidden sm:block">
              <table className="w-full border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4">
                    <th className="px-6 pb-2 w-10"><input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-lime bg-gray-100 dark:bg-white/10 focus:ring-lime" checked={filteredInvoices.length > 0 && selectedInvoiceIds.length === filteredInvoices.length} onChange={handleSelectAll} /></th>
                    {cols.slNo && <th className="px-6 pb-2">#</th>}
                    {cols.date && <th className="px-6 pb-2">Date</th>}
                    {cols.invoiceNo && <th className="px-6 pb-2">Invoice No</th>}
                    <th className="px-6 pb-2">Customer</th>
                    {cols.items && <th className="px-6 pb-2">Items</th>}
                    <th className="px-6 pb-2">Total</th>
                    <th className="px-6 pb-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedInvoices.map((inv, index) => {
                    const party = parties.find(p => p.id === inv.partyId);
                    return (
                      <tr key={inv.id} className={`bento-card ${index % 2 === 0 ? 'bg-light-surface/70 dark:bg-dark-surface/70' : 'bg-[#FAF9F6]/70 dark:bg-white/5'} group hover:scale-[1.01] hover:shadow-soft-hover transition-all duration-300`}>
                        <td className="px-6 py-5 rounded-l-3xl"><input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-lime bg-transparent focus:ring-lime" checked={selectedInvoiceIds.includes(inv.id)} onChange={() => handleSelectOne(inv.id)} /></td>
                        {cols.slNo && <td className="px-6 py-5 text-gray-400 font-mono text-xs">{index + 1}</td>}
                        {cols.date && <td className="px-6 py-5 text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">{inv.date}</td>}
                        {cols.invoiceNo && <td className="px-6 py-5 text-sm font-bold font-mono text-gray-400">{inv.invoiceNo}</td>}
                        <td className="px-6 py-5"><div className="flex flex-col"><span className="font-bold text-gray-900 dark:text-white text-base group-hover:text-lime-700 dark:group-hover:text-lime transition-colors">{inv.customerName}</span><span className="text-xs text-gray-400 font-medium">{party?.phone || '-'}</span></div></td>
                        {cols.items && <td className="px-6 py-5 text-sm font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 rounded-lg px-2 py-1 w-fit whitespace-nowrap">{(inv.items || []).length} Items</td>}
                        <td className="px-6 py-5 text-base font-extrabold text-gray-900 dark:text-white">{currency} {formatAmount(inv.totalAmount)}</td>
                        <td className="px-6 py-5 text-right rounded-r-3xl">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handlePrint(inv)} className="w-8 h-8 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"><Printer className="w-3.5 h-3.5" /></button>
                                {canManage && <button onClick={() => handleEdit(inv)} className="w-8 h-8 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"><Edit2 className="w-3.5 h-3.5" /></button>}
                                {canDelete && <button onClick={() => handleDelete(inv.id)} className="w-8 h-8 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-white transition-all"><Trash2 className="w-3.5 h-3.5" /></button>}
                            </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredInvoices.length === 0 && <tr><td colSpan={10} className="text-center py-16 text-gray-400 font-medium">No invoices found for this period.</td></tr>}
                </tbody>
              </table>
              {filteredInvoices.length > visibleCount && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 pb-4">
                  <button 
                    onClick={() => setVisibleCount(prev => prev + 100)}
                    className="flex items-center gap-2 px-8 py-3 bg-white dark:bg-dark-surface border border-gray-200 dark:border-white/10 rounded-full text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Load another 100 rows
                  </button>
                  <button 
                    onClick={() => setVisibleCount(filteredInvoices.length)}
                    className="flex items-center gap-2 px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-bold transition-all shadow-lg active:scale-95"
                  >
                    <Layers2 className="w-4 h-4" /> Load All Data ({filteredInvoices.length})
                  </button>
                </div>
              )}
            </div>
        </>
      )}

      {view === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bento-card bg-white dark:bg-[#1C1C1E] p-8 rounded-[32px] shadow-soft border border-gray-100 dark:border-white/5 relative">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3"><div className="w-1.5 h-6 bg-lime rounded-full shadow-glow-lime"></div> Customer Details</h3>
              <div className="space-y-6">
                 <div>
                   <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider ml-1">Select Registered Customer</label>
                   <CustomDropdown options={partyOptions} value={selectedPartyId} onChange={(val) => { setSelectedPartyId(val); setCustomCustomerName(''); }} placeholder="Select Registered Customer" searchPlaceholder="Search customers..." icon={UserIcon} />
                 </div>
                 <div className="flex items-center gap-4">
                    <span className={`h-px flex-1 transition-colors ${!selectedPartyId && !customCustomerName ? 'bg-lime/50' : 'bg-gray-200 dark:bg-white/10'}`}></span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${!selectedPartyId && !customCustomerName ? 'bg-lime/10 text-lime-700 dark:text-lime' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>OR</span>
                    <span className={`h-px flex-1 transition-colors ${!selectedPartyId && !customCustomerName ? 'bg-lime/50' : 'bg-gray-200 dark:border-white/10'}`}></span>
                 </div>
                 <div className="space-y-4">
                   <div className="flex justify-between items-center px-1">
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">One-time Customer Name</label>
                      {isContactPickerSupported && (
                        <button type="button" onClick={handleContactPicker} className="text-[10px] font-bold text-lime-700 dark:text-lime flex items-center gap-1.5 bg-lime/10 px-2.5 py-1 rounded-lg hover:bg-lime/20 transition-all">
                           <Contact className="w-3 h-3" /> Select from Contacts
                        </button>
                      )}
                   </div>
                   <div className="relative group">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-lime transition-colors" />
                      <input type="text" disabled={!!selectedPartyId} className="w-full h-[52px] px-4 pl-11 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-lime focus:ring-1 focus:ring-lime/50 transition-all outline-none text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed" placeholder="Enter walk-in customer name..." value={customCustomerName} onChange={(e) => setCustomCustomerName(e.target.value)} />
                   </div>
                 </div>
              </div>
            </div>
            <div className="bento-card bg-white dark:bg-[#1C1C1E] p-8 rounded-[32px] shadow-soft border border-gray-100 dark:border-white/5 relative">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3"><div className="w-1.5 h-6 bg-lime rounded-full shadow-glow-lime"></div> Items Cart</h3>
              <div className="flex flex-col md:flex-row gap-4 mb-8 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider ml-1">Select Product</label>
                  <CustomDropdown options={productOptions} value={selectedProductId} onChange={(val) => { setSelectedProductId(val); setQty(0); }} placeholder="Search inventory..." searchPlaceholder="Type to search products..." icon={Search} />
                </div>
                <div className="w-full md:w-32">
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider ml-1">Quantity</label>
                  <div className="relative group">
                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-lime transition-colors" />
                    <input type="number" min="0" className="w-full h-[52px] px-4 pl-11 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-lime focus:ring-1 focus:ring-lime/50 transition-all outline-none text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400" value={qty} onChange={(e) => setQty(parseInt(e.target.value) || 0)} />
                  </div>
                </div>
                <button onClick={addToCart} disabled={!selectedProductId} className="w-full md:w-auto h-[52px] px-8 bg-lime hover:bg-lime-hover text-black rounded-2xl font-bold shadow-lg shadow-lime/20 hover:shadow-lime/40 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"><Plus className="w-5 h-5" /> Add</button>
              </div>
              <div className="overflow-hidden rounded-2xl">
                <table className="w-full text-left border-separate border-spacing-y-2">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Item Name</th>
                      <th className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Qty</th>
                      <th className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Price</th>
                      <th className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Total</th>
                      <th className="px-4 py-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item, idx) => (
                      <tr key={idx} className="bg-gray-50/80 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 transition-colors group">
                        <td className="px-4 py-4 rounded-l-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-white/10 flex items-center justify-center text-gray-500"><Box className="w-4 h-4" /></div>
                                <div>
                                    <div className="text-sm font-bold text-gray-900 dark:text-white">{item.productName}</div>
                                    <div className="text-[10px] text-gray-400 font-medium">
                                        GST {Math.round(item.taxRate)}% 
                                        {item.cessAmount > 0 && <span className="ml-1 text-lime-600 dark:text-lime">+ Cess {item.cessRate}% ({currency} {formatAmount(item.cessAmount)})</span>}
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td className="px-4 py-4 text-sm font-bold text-center text-gray-600 dark:text-gray-300">{item.quantity}</td>
                        <td className="px-4 py-4 text-sm font-medium text-right text-gray-600 dark:text-gray-300">{currency} {formatAmount(item.unitPrice)}</td>
                        <td className="px-4 py-4 text-sm font-bold text-right text-gray-900 dark:text-white">{currency} {formatAmount(item.total)}</td>
                        <td className="px-4 py-4 text-right rounded-r-2xl"><button onClick={() => removeFromCart(idx)} className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button></td>
                      </tr>
                    ))}
                    {cart.length === 0 && (
                      <tr><td colSpan={5} className="py-12 text-center text-gray-400 font-medium bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10"><ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-20" />No items added yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bento-card bg-white dark:bg-[#1C1C1E] p-8 rounded-[32px] shadow-soft border border-gray-100 dark:border-white/5 sticky top-6 min-h-[400px] flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-lime/10 rounded-xl text-lime-700 dark:text-lime"><CreditCard className="w-5 h-5" /></div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Summary</h3>
                </div>
                <div className="space-y-4 flex-1">
                    <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-gray-400 font-medium">Subtotal</span><span className="font-bold text-gray-900 dark:text-white">{currency} {formatAmount(cart.reduce((sum, i) => sum + (i.unitPrice * i.quantity), 0))}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-gray-400 font-medium">GST (CGST+SGST)</span><span className="font-bold text-gray-900 dark:text-white">{currency} {formatAmount(cart.reduce((sum, i) => sum + (i.cgstAmount + i.sgstAmount), 0))}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-lime-700 dark:text-lime font-bold">Total Cess</span><span className="font-bold text-lime-700 dark:text-lime">{currency} {formatAmount(cart.reduce((sum, i) => sum + (i.cessAmount || 0), 0))}</span></div>
                    <div className="h-px bg-dashed border-t border-gray-200 dark:border-white/10 my-4"></div>
                    <div className="flex justify-between items-end mb-2"><span className="text-sm font-bold text-gray-500 uppercase tracking-wide">Grand Total</span><span className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{currency} {formatAmount(cart.reduce((sum, i) => sum + i.total, 0))}</span></div>
                </div>
                <button onClick={handleCreateInvoice} disabled={cart.length === 0 || (!selectedPartyId && !customCustomerName)} className="w-full py-4 mt-8 bg-black hover:bg-gray-900 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:transform-none disabled:shadow-none">{editingInvoiceId ? 'Update Invoice' : 'Generate Invoice'} <ArrowRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      )}

      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bento-card bg-white dark:bg-dark-surface w-full max-w-lg overflow-hidden animate-fadeIn relative rounded-3xl shadow-2xl">
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Import Data</h3>
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
                                    <p className="font-bold text-gray-900 dark:text-white">Click to upload CSV</p>
                                    <p className="text-xs text-gray-400 mt-1">or drag and drop here</p>
                                </div>
                            </div>
                        </label>
                        <div className="flex justify-center"><button onClick={handleDownloadTemplate} className="text-xs font-bold text-gray-400 hover:text-black dark:hover:text-white flex items-center gap-2 transition-colors"><Download className="w-4 h-4" /> Download Template</button></div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bento-card bg-lime/10 p-4 rounded-2xl"><p className="text-xs text-lime-700 dark:text-lime font-bold uppercase mb-1">Invoices</p><p className="text-2xl font-black text-gray-900 dark:text-white">{importSummary.newInvoices.length}</p></div>
                            <div className="bento-card bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl"><p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase mb-1">Parties</p><p className="text-2xl font-black text-gray-900 dark:text-white">{importSummary.newParties.length}</p></div>
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

export default Invoices;
