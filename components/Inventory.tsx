
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Product, Currency, AppPreferences, SortConfig, FilterConfig, User, TaxGroup, Invoice } from '../types';
import { Plus, Sparkles, Trash2, Edit2, X, Search, Package, MoreHorizontal, ArrowRight, AlertCircle, ChevronDown, Save, ScanBarcode, Tag, Layers, DollarSign, Box, Check, Percent, History, TrendingUp, Calendar, ShoppingCart, Info, Layers2 } from 'lucide-react';
import { generateProductDetails } from '../services/geminiService';

interface InventoryProps {
  products: Product[];
  invoices: Invoice[];
  currency: Currency;
  preferences: AppPreferences;
  onAddProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateProduct: (p: Product) => void;
  searchTerm: string;
  sortConfig: SortConfig;
  filterConfig: FilterConfig;
  currentUser: User;
  taxGroups: TaxGroup[];
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
            <div className="absolute bottom-full mb-3 left-0 right-0 sm:top-full sm:bottom-auto sm:mt-3 z-[110] animate-fadeIn origin-bottom sm:origin-top">
                <div className="bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-white/10 shadow-2xl rounded-2xl overflow-hidden ring-1 ring-black/5">
                    <div className="p-3 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input ref={searchInputRef} type="text" className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-black/20 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime/50 transition-all border border-gray-100 dark:border-white/5" placeholder={searchPlaceholder || "Search..."} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto dropdown-scrollbar p-2 space-y-1">
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

const Inventory: React.FC<InventoryProps> = ({ 
    products, invoices, currency, preferences, 
    onAddProduct, onDeleteProduct, onUpdateProduct, 
    searchTerm, sortConfig, filterConfig, currentUser, taxGroups
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [visibleCount, setVisibleCount] = useState(100);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', sku: '', category: '', description: '', price: 0, mrp: 0, costPrice: 0, 
    stockQuantity: 0, minStockLevel: 5, taxRate: 0, cessRate: 0, hsnCode: '', unit: 'Nos',
    createdAt: new Date().toISOString().split('T')[0], taxGroupId: ''
  });

  const canManage = currentUser.role === 'ADMIN' || (currentUser.permissions && currentUser.permissions.canManageInventory);
  const canDelete = currentUser.role === 'ADMIN' || (currentUser.permissions && currentUser.permissions.canDeleteData);

  const formatPrice = (val: number) => val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // CORE LOGIC: Map sales history based on unique (Price, MRP) combinations
  const getProductRateHistory = (productId: string, currentPrice: number, currentMRP: number) => {
    const historicalPointsMap: Record<string, { 
        price: number, 
        mrp: number,
        firstSold: string, 
        lastSold: string, 
        totalQty: number,
        salesCount: number
    }> = {};
    
    invoices.forEach(inv => {
        inv.items.forEach(item => {
            if (item.productId === productId) {
                const price = item.unitPrice;
                const mrp = item.mrp;
                const key = `${price}-${mrp}`;
                
                if (!historicalPointsMap[key]) {
                    historicalPointsMap[key] = { 
                        price, 
                        mrp,
                        firstSold: inv.date, 
                        lastSold: inv.date, 
                        totalQty: 0,
                        salesCount: 0
                    };
                }
                historicalPointsMap[key].totalQty += item.quantity;
                historicalPointsMap[key].salesCount += 1;
                if (inv.date < historicalPointsMap[key].firstSold) historicalPointsMap[key].firstSold = inv.date;
                if (inv.date > historicalPointsMap[key].lastSold) historicalPointsMap[key].lastSold = inv.date;
            }
        });
    });

    // Exclude current rates from history. 
    // This list strictly contains points that exist in invoices (at least one sale recorded).
    return Object.values(historicalPointsMap)
        .filter(h => h.price !== currentPrice || h.mrp !== currentMRP)
        .sort((a, b) => new Date(b.lastSold).getTime() - new Date(a.lastSold).getTime());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['price', 'mrp', 'stockQuantity', 'minStockLevel', 'costPrice', 'taxRate', 'cessRate'].includes(name)
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleAIAutoFill = async () => {
    if (!formData.name) return;
    setIsGenerating(true);
    const details = await generateProductDetails(formData.name);
    if (details) {
      setFormData(prev => ({ 
          ...prev, 
          ...details, 
          costPrice: details.price ? details.price * 0.6 : 0,
          mrp: details.price ? details.price * 1.2 : 0 
      }));
    }
    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Product = {
      id: formData.id || crypto.randomUUID(),
      name: formData.name || 'Unknown',
      sku: formData.sku || 'N/A',
      category: formData.category || 'General',
      description: formData.description || '',
      price: formData.price || 0,
      mrp: formData.mrp || formData.price || 0,
      costPrice: formData.costPrice || 0,
      stockQuantity: formData.stockQuantity || 0,
      minStockLevel: formData.minStockLevel || 5,
      taxRate: formData.taxRate || 0,
      cessRate: formData.cessRate || 0,
      hsnCode: formData.hsnCode || '',
      unit: formData.unit || 'Nos',
      createdAt: formData.createdAt || new Date().toISOString().split('T')[0],
      taxGroupId: formData.taxGroupId
    };

    if (formData.id) onUpdateProduct(newProduct);
    else onAddProduct(newProduct);
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ 
      name: '', sku: '', category: '', description: '', price: 0, mrp: 0, costPrice: 0, 
      stockQuantity: 0, minStockLevel: 5, taxRate: 0, cessRate: 0, hsnCode: '', unit: 'Nos',
      createdAt: new Date().toISOString().split('T')[0], taxGroupId: ''
    });
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    return true;
  }).sort((a, b) => {
      let valA: any = a.name.toLowerCase();
      let valB: any = b.name.toLowerCase();
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
  });

  const activeTaxGroups = taxGroups.filter(g => g.status === 'active');
  const taxGroupOptions: DropdownOption[] = [
    { id: '', label: 'No Tax Group (Manual GST)' },
    ...activeTaxGroups.map(g => ({
        id: g.id,
        label: g.name,
        subLabel: g.components.map(c => `${c.name} ${c.percentage}%`).join(' + ')
    }))
  ];

  const cols = preferences.columns.inventory;

  const inputClass = "w-full h-[52px] px-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-lime focus:ring-1 focus:ring-lime/50 transition-all outline-none text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400";
  const labelClass = "block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider ml-1";
  const sectionTitleClass = "text-sm font-bold text-gray-900 dark:text-white pb-2 mb-4 border-b border-gray-100 dark:border-white/5 flex items-center gap-2";

  const displayedProducts = filteredProducts.slice(0, visibleCount);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <div className="flex items-center gap-2 mb-1">
               <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Inventory</h2>
               <span className="w-2.5 h-2.5 rounded-full bg-lime"></span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Manage your inventory and track stock levels.</p>
        </div>
        
        {canManage && (
            <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-black px-6 py-3 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
            <Plus className="w-5 h-5" /> Add Product
            </button>
        )}
      </div>

      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4">
                {cols.slNo && <th className="px-6 pb-2">#</th>}
                <th className="px-6 pb-2">Product Details</th>
                <th className="px-6 pb-2">Category</th>
                {cols.mrp && <th className="px-6 pb-2">MRP</th>}
                {cols.price && <th className="px-6 pb-2">Selling Rate</th>}
                {cols.stock && <th className="px-6 pb-2 w-48">Stock Level</th>}
                <th className="px-6 pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedProducts.map((p, index) => {
                const stockPercent = Math.min((p.stockQuantity / (p.minStockLevel * 5)) * 100, 100);
                const isLowStock = p.stockQuantity <= p.minStockLevel;
                const isEven = index % 2 === 0;

                // Check if history exists for this product based on sales
                const historyCount = getProductRateHistory(p.id, p.price, p.mrp).length;

                return (
                  <tr key={p.id} className={`group transition-colors duration-200 ${isEven ? 'bg-white dark:bg-[#151515]' : 'bg-gray-50 dark:bg-[#111]'} hover:bg-gray-100 dark:hover:bg-[#222]`}>
                    {cols.slNo && <td className="px-6 py-4 text-gray-400 font-mono text-xs rounded-l-xl border-y border-l border-transparent group-hover:border-gray-200 dark:group-hover:border-white/5">{index + 1}</td>}
                    
                    <td className="px-6 py-4 border-y border-transparent group-hover:border-gray-200 dark:group-hover:border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-lime/10 flex items-center justify-center text-lime-700 dark:text-lime flex-shrink-0">
                            <Package className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-lime-700 dark:group-hover:text-lime transition-colors">{p.name}</span>
                          <span className="text-xs text-gray-400 font-medium tracking-wide">{p.sku}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 border-y border-transparent group-hover:border-gray-200 dark:group-hover:border-white/5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/10">
                          {p.category}
                      </span>
                    </td>

                    {cols.mrp && (
                        <td className="px-6 py-4 border-y border-transparent group-hover:border-gray-200 dark:group-hover:border-white/5">
                            <div className="font-bold text-gray-400 dark:text-gray-500 text-sm line-through">{currency} {formatPrice(p.mrp)}</div>
                        </td>
                    )}

                    {cols.price && (
                        <td className="px-6 py-4 border-y border-transparent group-hover:border-gray-200 dark:group-hover:border-white/5">
                            <div className="flex items-center gap-2">
                                <div className="font-extrabold text-gray-900 dark:text-white text-sm">{currency} {formatPrice(p.price)}</div>
                                {historyCount > 0 && (
                                    <button 
                                        onClick={() => { setSelectedProduct(p); setIsHistoryOpen(true); }}
                                        className="p-1.5 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-lime-600 dark:hover:text-lime hover:bg-lime/10 transition-all opacity-0 group-hover:opacity-100"
                                        title="View Rate History"
                                    >
                                        <History className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </td>
                    )}

                    {cols.stock && (
                      <td className="px-6 py-4 border-y border-transparent group-hover:border-gray-200 dark:group-hover:border-white/5">
                          <div className="flex flex-col gap-1.5">
                              <div className="flex justify-between items-end">
                                  <span className={`text-xs font-bold ${isLowStock ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                                      {p.stockQuantity} {p.unit}
                                  </span>
                                  {isLowStock && <AlertCircle className="w-3 h-3 text-red-500" />}
                              </div>
                              <div className="w-full h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${isLowStock ? 'bg-red-500' : 'bg-lime'}`} 
                                    style={{width: `${stockPercent}%`}}
                                  ></div>
                              </div>
                          </div>
                      </td>
                    )}

                    <td className="px-6 py-4 text-right rounded-r-xl border-y border-r border-transparent group-hover:border-gray-200 dark:group-hover:border-white/5">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {canManage && (
                              <button onClick={() => { setFormData(p); setIsModalOpen(true); }} className="w-8 h-8 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black hover:border-transparent transition-all">
                                  <Edit2 className="w-3.5 h-3.5" />
                              </button>
                          )}
                          {canDelete && (
                               <button onClick={() => { if(confirm("Delete?")) onDeleteProduct(p.id) }} className="w-8 h-8 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-white hover:border-transparent transition-all">
                                  <Trash2 className="w-3.5 h-3.5" />
                              </button>
                          )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr><td colSpan={10} className="text-center py-16 text-gray-400 font-medium">No products found. Add one to get started.</td></tr>
              )}
            </tbody>
        </table>
        {filteredProducts.length > visibleCount && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 pb-4">
                <button 
                onClick={() => setVisibleCount(prev => prev + 100)}
                className="flex items-center gap-2 px-8 py-3 bg-white dark:bg-dark-surface border border-gray-200 dark:border-white/10 rounded-full text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all shadow-sm"
                >
                <Plus className="w-4 h-4" /> Load another 100 rows
                </button>
                <button 
                onClick={() => setVisibleCount(filteredProducts.length)}
                className="flex items-center gap-2 px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-bold transition-all shadow-lg active:scale-95"
                >
                <Layers2 className="w-4 h-4" /> Load All Products ({filteredProducts.length})
                </button>
            </div>
        )}
      </div>

      <div className="sm:hidden space-y-4">
        {displayedProducts.map((p) => {
             const stockPercent = Math.min((p.stockQuantity / (p.minStockLevel * 5)) * 100, 100);
             const isLowStock = p.stockQuantity <= p.minStockLevel;
             const historyCount = getProductRateHistory(p.id, p.price, p.mrp).length;

             return (
              <div key={p.id} className="bento-card p-5 flex flex-col gap-4 active:scale-95 transition-transform">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-lime/10 flex items-center justify-center text-lime-700 dark:text-lime">
                            <Package className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-base">{p.name}</h3>
                            <p className="text-xs text-gray-400">{p.sku}</p>
                        </div>
                    </div>
                    {cols.stock && (
                        <div className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${isLowStock ? 'bg-red-100 text-red-600' : 'bg-lime text-black'}`}>
                            {p.stockQuantity} {p.unit}
                        </div>
                    )}
                </div>
                
                <div className="flex justify-between items-center text-sm pt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400">
                        {p.category}
                    </span>
                    <div className="text-right">
                        {cols.mrp && <p className="text-[10px] text-gray-400 line-through mb-0.5">{currency} {formatPrice(p.mrp)}</p>}
                        <div className="flex items-center gap-2">
                            {cols.price && <span className="font-bold text-gray-900 dark:text-white text-lg">{currency} {formatPrice(p.price)}</span>}
                            {historyCount > 0 && (
                                <button 
                                    onClick={() => { setSelectedProduct(p); setIsHistoryOpen(true); }}
                                    className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-400"
                                >
                                    <History className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {cols.stock && (
                    <div className="w-full h-1 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden mt-1">
                        <div 
                        className={`h-full rounded-full ${isLowStock ? 'bg-red-500' : 'bg-lime'}`} 
                        style={{width: `${stockPercent}%`}}
                        ></div>
                    </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-white/5 mt-1">
                    <div className="text-xs text-gray-400 font-medium">
                        {p.taxGroupId ? 'Tax Group Active' : `GST: ${p.taxRate}%`}
                    </div>
                    <div className="flex gap-2">
                        {canManage && (
                            <button onClick={() => { setFormData(p); setIsModalOpen(true); }} className="w-8 h-8 rounded-full bg-gray-5 dark:bg-white/5 flex items-center justify-center text-gray-600 dark:text-gray-300">
                                <Edit2 className="w-4 h-4" />
                            </button>
                        )}
                        {canDelete && (
                                <button onClick={() => { if(confirm("Delete?")) onDeleteProduct(p.id) }} className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
              </div>
             )
        })}
        {filteredProducts.length > visibleCount && (
            <div className="flex flex-col gap-3 pt-4">
                <button 
                onClick={() => setVisibleCount(prev => prev + 100)}
                className="w-full py-4 bg-white dark:bg-dark-surface border border-gray-200 dark:border-white/10 rounded-2xl text-sm font-bold text-gray-600 dark:text-gray-300 shadow-sm"
                >
                Load another 100 products
                </button>
                <button 
                onClick={() => setVisibleCount(filteredProducts.length)}
                className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-sm font-bold transition-all shadow-lg"
                >
                Load All Products ({filteredProducts.length})
                </button>
            </div>
        )}
      </div>

      {isHistoryOpen && selectedProduct && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300">
          <div className="bento-card w-full max-w-md overflow-hidden animate-fadeIn relative flex flex-col bg-white dark:bg-[#0D0D0D] rounded-[40px] shadow-2xl border border-white/20 dark:border-white/5">
            <div className="px-8 py-7 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/2">
              <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Price & MRP History</h3>
                  <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.15em] line-clamp-1">{selectedProduct.name}</p>
              </div>
              <button onClick={() => setIsHistoryOpen(false)} className="w-10 h-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-gray-400 hover:text-black hover:rotate-90 transition-all shadow-sm"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar max-h-[70vh]">
                <div className="space-y-4">
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Info className="w-3.5 h-3.5" /> Current Active Rates</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 bg-lime/10 rounded-3xl border border-lime/20 flex flex-col justify-between">
                            <p className="text-[10px] font-bold text-lime-800 dark:text-lime uppercase tracking-widest mb-1">Selling Price</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{currency} {formatPrice(selectedProduct.price)}</p>
                        </div>
                        <div className="p-5 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/5 flex flex-col justify-between">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">MRP Price</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{currency} {formatPrice(selectedProduct.mrp)}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Historical Rates (Sold At)</h4>
                    <div className="space-y-3">
                        {getProductRateHistory(selectedProduct.id, selectedProduct.price, selectedProduct.mrp).length > 0 ? (
                            getProductRateHistory(selectedProduct.id, selectedProduct.price, selectedProduct.mrp).map((h, i) => (
                                <div key={i} className="p-6 rounded-[32px] bg-gray-50 dark:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-all flex flex-col gap-4 group relative overflow-hidden">
                                    <div className="flex justify-between items-start relative z-10">
                                        <div className="space-y-1">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">Rate:</span>
                                                <p className="text-xl font-black text-gray-900 dark:text-white group-hover:text-lime-600 transition-colors">{currency} {formatPrice(h.price)}</p>
                                            </div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">MRP:</span>
                                                <p className="text-sm font-bold text-gray-500 dark:text-gray-400">{currency} {formatPrice(h.mrp)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-1.5 justify-end text-xs font-black text-gray-700 dark:text-gray-300">
                                                <ShoppingCart className="w-3.5 h-3.5 text-lime-600" />
                                                <span>{h.salesCount} Sales</span>
                                            </div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">{h.totalQty} {selectedProduct.unit} Total Volume</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 bg-white/50 dark:bg-black/20 w-fit px-3 py-1.5 rounded-full relative z-10">
                                        <Calendar className="w-3 h-3" />
                                        <span>Active: {h.firstSold} — {h.lastSold}</span>
                                    </div>
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-lime/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-lime/10 transition-colors"></div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-14 rounded-[36px] border-2 border-dashed border-gray-100 dark:border-white/5">
                                <History className="w-12 h-12 text-gray-200 dark:text-white/5 mx-auto mb-4" />
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">Clean Slate</p>
                                <p className="text-[10px] text-gray-500 mt-2 max-w-[200px] mx-auto">No previous price points with transactions detected.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="px-8 py-6 bg-gray-50/50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5 flex justify-center">
                <button onClick={() => setIsHistoryOpen(false)} className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-3xl text-sm font-black shadow-xl hover:-translate-y-1 transition-all active:scale-95">Close History</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300 overflow-y-auto">
          <div className="bento-card w-full max-w-3xl overflow-hidden animate-fadeIn relative flex flex-col max-h-[85vh] rounded-[32px] shadow-2xl border border-white/20 dark:border-white/5 mb-10 bg-white dark:bg-[#1C1C1E]">
            <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-white/5">
              <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{formData.id ? 'Edit Product' : 'Add New Product'}</h3>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">Fill in the details below to update your inventory.</p>
              </div>
              <button onClick={closeModal} className="w-10 h-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all shadow-sm active:scale-95"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
              
              {!formData.id && (
                <div className="bg-lime/10 p-1 rounded-3xl border border-lime/20 relative group">
                  <div className="bg-white/60 dark:bg-black/20 p-6 rounded-[20px]">
                      <div className="flex flex-col sm:flex-row gap-4 items-end">
                          <div className="flex-1 w-full">
                              <label className="block text-xs font-bold text-lime-800 dark:text-lime mb-2 flex items-center gap-2 uppercase tracking-wider">
                                <Sparkles className="w-3.5 h-3.5" /> AI Auto-Fill
                              </label>
                              <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Product Name (e.g. MacBook Pro M2)" 
                                    className="w-full h-[52px] pl-5 pr-4 rounded-2xl bg-white dark:bg-black/40 border-0 focus:ring-2 focus:ring-lime text-sm font-medium shadow-sm"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                              </div>
                          </div>
                          <button 
                            type="button"
                            onClick={handleAIAutoFill}
                            disabled={isGenerating || !formData.name}
                            className="h-[52px] px-8 bg-lime hover:bg-lime-hover text-black rounded-2xl font-bold disabled:opacity-50 transition-all shadow-lg shadow-lime/20 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap w-full sm:w-auto"
                          >
                            {isGenerating ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"/> : <Sparkles className="w-4 h-4" />}
                            <span>Generate</span>
                          </button>
                      </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                <div className="col-span-1 md:col-span-2">
                    <h4 className={sectionTitleClass}><Tag className="w-4 h-4 text-gray-400" /> General Information</h4>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className={labelClass}>Product Name</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className={inputClass} placeholder="Enter full product name" />
                </div>
                
                <div>
                  <label className={labelClass}>SKU Code</label>
                  <div className="relative">
                    <ScanBarcode className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" name="sku" value={formData.sku} onChange={handleInputChange} className={`${inputClass} pl-10`} placeholder="Stock Keeping Unit" />
                  </div>
                </div>
                
                <div>
                  <label className={labelClass}>Category</label>
                  <div className="relative">
                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" name="category" list="categories" value={formData.category} onChange={handleInputChange} className={`${inputClass} pl-10`} placeholder="e.g. Electronics" />
                  </div>
                  <datalist id="categories"><option value="Electronics" /><option value="Grocery" /><option value="Clothing" /><option value="Services" /></datalist>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                 <div className="col-span-1 md:col-span-2 pt-2">
                    <h4 className={sectionTitleClass}><DollarSign className="w-4 h-4 text-gray-400" /> Pricing & Inventory</h4>
                 </div>

                 <div>
                  <label className={labelClass}>Selling Price (Actual Rate)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">{currency}</span>
                    <input type="number" name="price" required min="0" step="0.01" value={formData.price} onChange={handleInputChange} className={`${inputClass} pl-10 font-bold`} />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 ml-1">GST is calculated on this rate.</p>
                </div>
                 
                <div>
                  <label className={labelClass}>MRP (Tax Base for Cess)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">{currency}</span>
                    <input type="number" name="mrp" min="0" step="0.01" value={formData.mrp} onChange={handleInputChange} className={`${inputClass} pl-10 font-bold`} />
                  </div>
                  <p className="text-[10px] text-lime-600 dark:text-lime mt-1 ml-1 font-bold">CESS is calculated on this rate.</p>
                </div>

                <div>
                  <label className={labelClass}>Cost Price</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">{currency}</span>
                    <input type="number" name="costPrice" min="0" step="0.01" value={formData.costPrice} onChange={handleInputChange} className={`${inputClass} pl-10`} />
                  </div>
                </div>
                
                <div>
                   <label className={labelClass}>Unit Type</label>
                   <div className="relative">
                        <Box className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" name="unit" value={formData.unit} onChange={handleInputChange} className={`${inputClass} pl-10`} placeholder="e.g. Kg, Pcs, Box" />
                   </div>
                </div>

                <div className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl col-span-1 md:col-span-2 grid grid-cols-2 gap-6 border border-gray-100 dark:border-white/5">
                    <div>
                        <label className={labelClass}>Current Stock</label>
                        <input type="number" name="stockQuantity" required value={formData.stockQuantity} onChange={handleInputChange} className={`${inputClass} bg-white dark:bg-black/20`} />
                    </div>
                    <div>
                        <label className={labelClass}>Alert Level</label>
                        <input type="number" name="minStockLevel" value={formData.minStockLevel} onChange={handleInputChange} className={`${inputClass} bg-white dark:bg-black/20`} />
                    </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                <div className="col-span-1 md:col-span-2 pt-2">
                    <h4 className={sectionTitleClass}><ScanBarcode className="w-4 h-4 text-gray-400" /> Tax Configuration</h4>
                </div>

                <div className="col-span-1 md:col-span-2">
                   <label className={labelClass}>Tax Group</label>
                   <CustomDropdown 
                        options={taxGroupOptions}
                        value={formData.taxGroupId || ''}
                        onChange={(val) => setFormData(prev => ({ ...prev, taxGroupId: val }))}
                        placeholder="Select Tax Group"
                        searchPlaceholder="Search tax configurations..."
                        icon={Percent}
                   />
                </div>

                {!formData.taxGroupId && (
                  <>
                    <div>
                        <label className={labelClass}>Manual GST (%)</label>
                        <input type="number" name="taxRate" value={formData.taxRate} onChange={handleInputChange} className={inputClass} placeholder="0" />
                    </div>
                    <div>
                        <label className={labelClass}>Manual Cess (%)</label>
                        <input type="number" name="cessRate" value={formData.cessRate} onChange={handleInputChange} className={inputClass} placeholder="0" />
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-4 pt-8 border-t border-gray-100 dark:border-white/5">
                <button type="button" onClick={closeModal} className="h-[52px] px-8 rounded-2xl text-sm font-bold text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                    Cancel
                </button>
                <button type="submit" className="h-[52px] px-10 bg-lime hover:bg-lime-hover text-black rounded-2xl font-bold shadow-lg shadow-lime/20 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2">
                    <Save className="w-4 h-4" /> Save Product
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Inventory;
