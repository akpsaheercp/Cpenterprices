
import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { LayoutDashboard, Package, FileText, Settings, Menu, X, Users, ShoppingBag, PieChart, Sun, Moon, ChevronRight, ChevronLeft, ChevronDown, Search, Filter, RotateCcw, ArrowUpDown, Check, ArrowRightLeft, Calculator as CalculatorIcon, ArrowLeft, ArrowRight, Download, Share, Cloud, RefreshCw, ClipboardCheck, GripVertical, Calendar, User as UserIcon, Box } from 'lucide-react';
import { ThemeContext } from '../App';
import { AppPreferences, SortConfig, FilterConfig, Party, Product, User as UserType, Business } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onChangeView: (view: string) => void;
  onSwitchBusiness: () => void;
  preferences: AppPreferences;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortConfig: SortConfig;
  onSortChange: (config: SortConfig) => void;
  filterConfig: FilterConfig;
  onFilterChange: (config: FilterConfig) => void;
  parties: Party[];
  products: Product[];
  currentUser: UserType;
  businesses: Business[];
  onSelectBusiness: (businessId: string) => void;
  currentBusinessId: string | null;
  currentBusiness: Business | null;
  installPrompt?: any;
  onInstallApp?: () => void;
  isSaving?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
    children, currentView, onChangeView, onSwitchBusiness, 
    searchTerm, onSearchChange, sortConfig, onSortChange,
    filterConfig, onFilterChange, currentUser, 
    parties, products,
    currentBusiness, installPrompt, onInstallApp, isSaving
}) => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 1024 : false);
  const { theme, setTheme } = useContext(ThemeContext);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  
  const [isFloatingRailExpanded, setIsFloatingRailExpanded] = useState(false);
  const [expandDirection, setExpandDirection] = useState<'up' | 'down'>('down');

  const floatingNavRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{x: number, y: number} | null>(null);
  const dragStartPosRef = useRef<{x: number, y: number} | null>(null);
  const isDraggingRef = useRef(false);
  const railPosRef = useRef<{x: number, y: number}>({ x: 0, y: 0 });
  
  const [floatingRailPosition, setFloatingRailPosition] = useState<'left' | 'right'>(() => {
    return (localStorage.getItem('floatingRailSide') as 'left' | 'right') || 'right';
  });

  const sortMenuRef = useRef<HTMLDivElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
          setIsExpanded(true); 
          setIsSidebarVisible(true);
      } else {
          setIsExpanded(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); 

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) setIsSortMenuOpen(false);
        if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) setIsFilterMenuOpen(false);
        if (floatingNavRef.current && !floatingNavRef.current.contains(event.target as Node) && !dragStartRef.current) {
             setIsFloatingRailExpanded(false); 
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navGroups = [
    { title: 'Operations', items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'inventory', label: 'Inventory', icon: Package },
      { id: 'invoices', label: 'Sales', icon: FileText },
      { id: 'purchases', label: 'Purchases', icon: ShoppingBag },
      { id: 'parties', label: 'Contacts', icon: Users },
      { id: 'transactions', label: 'Transactions', icon: ArrowRightLeft },
      { id: 'audit', label: 'Audit', icon: ClipboardCheck },
    ]},
    { title: 'Insights & Tools', items: [
      { id: 'reports', label: 'Analytics', icon: PieChart },
      { id: 'calculator', label: 'Calculator', icon: CalculatorIcon },
    ]},
    ...(currentUser.role === 'ADMIN' ? [{ title: 'Admin', items: [{ id: 'settings', label: 'Settings', icon: Settings }] }] : [])
  ];

  const allNavItems = navGroups.flatMap(group => group.items); 
  const pageTitle = allNavItems.find(i => i.id === currentView)?.label || 'CPenterprices';

  const resetFilters = () => {
      onFilterChange({
        dateRange: { start: '', end: '' },
        partyId: '', productId: '', minAmount: '', maxAmount: '',
        month: '', year: ''
      });
  };

  const hasActiveFilters = filterConfig.dateRange.start || filterConfig.dateRange.end || filterConfig.partyId || filterConfig.productId || filterConfig.minAmount || filterConfig.maxAmount || filterConfig.month || filterConfig.year;

  // Pointer Handlers for Floating Nav
  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if ((target.tagName === 'BUTTON' || target.closest('button')) && !(target.closest('.drag-handle'))) return;
    e.preventDefault(); e.stopPropagation();
    isDraggingRef.current = false;
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    const rect = floatingNavRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragStartRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    if (floatingNavRef.current) {
        floatingNavRef.current.style.transition = 'none';
        floatingNavRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStartRef.current || !floatingNavRef.current) return;
    if (!isDraggingRef.current && dragStartPosRef.current) {
        if (Math.abs(e.clientX - dragStartPosRef.current.x) > 5 || Math.abs(e.clientY - dragStartPosRef.current.y) > 5) isDraggingRef.current = true;
    }
    const newX = e.clientX - dragStartRef.current.x;
    const newY = e.clientY - dragStartRef.current.y;
    floatingNavRef.current.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
    railPosRef.current = { x: newX, y: newY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragStartRef.current || !floatingNavRef.current) return;
    const wasDragging = isDraggingRef.current;
    dragStartRef.current = null;
    floatingNavRef.current.releasePointerCapture(e.pointerId);
    if (!wasDragging) setIsFloatingRailExpanded(prev => !prev);
    const rect = floatingNavRef.current.getBoundingClientRect();
    const midPointX = window.innerWidth / 2;
    let finalX = railPosRef.current.x;
    if (railPosRef.current.x + rect.width / 2 < midPointX) {
        finalX = 12; setFloatingRailPosition('left');
    } else {
        finalX = window.innerWidth - rect.width - 12; setFloatingRailPosition('right');
    }
    let finalY = railPosRef.current.y;
    if (finalY < 12) finalY = 12;
    if (finalY > window.innerHeight - rect.height - 12) finalY = window.innerHeight - rect.height - 12;
    setExpandDirection(finalY > window.innerHeight / 2 ? 'up' : 'down');
    floatingNavRef.current.style.transition = 'transform 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)';
    floatingNavRef.current.style.transform = `translate3d(${finalX}px, ${finalY}px, 0)`;
    railPosRef.current = { x: finalX, y: finalY };
  };

  const currentYear = new Date().getFullYear();
  const months = [
      { v: '01', l: 'January' }, { v: '02', l: 'February' }, { v: '03', l: 'March' }, { v: '04', l: 'April' },
      { v: '05', l: 'May' }, { v: '06', l: 'June' }, { v: '07', l: 'July' }, { v: '08', l: 'August' },
      { v: '09', l: 'September' }, { v: '10', l: 'October' }, { v: '11', l: 'November' }, { v: '12', l: 'December' }
  ];
  const years = Array.from({ length: 6 }, (_, i) => String(currentYear - 4 + i));

  const filterSelectClass = "w-full bg-gray-50 dark:bg-black/20 border-none rounded-xl px-3 py-2.5 text-sm font-bold focus:ring-2 focus:ring-lime appearance-none cursor-pointer text-gray-900 dark:text-white shadow-sm";

  return (
    <div className="flex h-screen overflow-hidden font-sans text-light-text dark:text-dark-text bg-[#F3F4F6] dark:bg-black relative transition-colors duration-200">
      {isMobile && isSidebarVisible && <div className="fixed inset-0 bg-black/50 z-[60]" onClick={() => setIsSidebarVisible(false)} />}

      <aside className={`fixed lg:static inset-y-0 left-0 z-[70] flex flex-col ${isMobile && !isSidebarVisible ? '-translate-x-full' : 'translate-x-0'} ${!isMobile && !isExpanded ? 'w-[80px]' : 'w-[260px]'} bg-white dark:bg-[#121212] border-r border-gray-200 dark:border-gray-800 lg:h-full transition-all duration-300 ease-out will-change-transform`}>
        <div className={`h-20 flex items-center flex-shrink-0 px-6 ${!isExpanded && !isMobile ? 'justify-center px-0' : ''}`}>
            <div className={`flex items-center gap-3 transition-all duration-300 ${!isExpanded && !isMobile ? 'scale-75' : ''}`}>
                <div className="w-10 h-10 rounded-xl bg-lime shadow-sm flex items-center justify-center text-black font-black text-xl">CP</div>
                {((isExpanded && !isMobile) || isMobile) && <span className="font-extrabold text-xl tracking-tight text-gray-900 dark:text-white">Enterprices</span>}
            </div>
        </div>
        <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-6 py-2">
            {navGroups.map((group, idx) => (
                <div key={idx} className="space-y-1">
                    {((isExpanded && !isMobile) || isMobile) && group.title && <div className="px-4 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{group.title}</div>}
                    {group.items.map((item) => (
                        <button key={item.id} onClick={() => { onChangeView(item.id); if (isMobile) setIsSidebarVisible(false); }} className={`relative w-full flex items-center group transition-colors duration-200 ${currentView === item.id ? 'bg-lime text-black' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'} ${!isExpanded && !isMobile ? 'justify-center w-12 h-12 mx-auto rounded-xl' : 'px-4 py-3 rounded-xl'}`}>
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            {((isExpanded && !isMobile) || isMobile) && <span className="ml-4 text-sm font-bold whitespace-nowrap">{item.label}</span>}
                        </button>
                    ))}
                </div>
            ))}
        </nav>
        <div className="p-4 flex flex-col gap-4 mt-auto border-t border-gray-100 dark:border-white/5">
            <button onClick={onSwitchBusiness} className={`relative group flex items-center gap-3 p-2 rounded-xl transition-all duration-200 cursor-pointer w-full hover:bg-gray-100 dark:hover:bg-white/5 ${!isExpanded && !isMobile ? 'justify-center' : ''}`}>
                <div className="w-8 h-8 rounded-lg bg-gray-800 text-white flex items-center justify-center font-bold shadow-sm flex-shrink-0">{currentUser.name.charAt(0)}</div>
                {((isExpanded && !isMobile) || isMobile) && <div className="flex-1 min-w-0 text-left"><p className="text-sm font-bold text-gray-900 dark:text-white truncate">{currentUser.name}</p><p className="text-[10px] text-gray-500 truncate">{currentBusiness?.name}</p></div>}
            </button>
            <div className={`flex items-center ${!isExpanded && !isMobile ? 'flex-col gap-4' : 'justify-between'}`}>
                <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={`flex items-center gap-2 px-1 py-1 rounded-full bg-gray-200 dark:bg-white/10 transition-all ${!isExpanded && !isMobile ? 'flex-col w-9 h-14' : 'w-14 h-8'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 ${theme === 'dark' ? (!isExpanded && !isMobile ? 'translate-y-6 bg-black text-lime' : 'translate-x-6 bg-black text-lime') : 'bg-white text-yellow-500'}`}>{theme === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}</div>
                </button>
                {!isMobile && <button onClick={() => setIsExpanded(!isExpanded)} className="w-8 h-8 rounded-lg text-gray-400">{isExpanded ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}</button>}
            </div>
        </div>
      </aside>

      {isMobile && (
        <div ref={floatingNavRef} className="fixed z-[999] flex flex-col gap-3 touch-none items-center" style={{ left: 0, top: 0 }} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}>
          <button className={`drag-handle w-12 h-12 shadow-[0_8px_30px_rgb(0,0,0,0.3)] flex items-center justify-center transition-all duration-300 z-20 ${isFloatingRailExpanded ? 'bg-black dark:bg-white text-white dark:text-black rounded-full rotate-90' : 'bg-white/90 dark:bg-black/80 backdrop-blur-xl text-black dark:text-white border border-white/20 dark:border-white/10 rounded-2xl'}`}>
              {isFloatingRailExpanded ? <X className="w-5 h-5" /> : <GripVertical className="w-5 h-5" />}
          </button>
          {isFloatingRailExpanded && (
            <div className={`flex flex-col gap-1.5 absolute items-center ${expandDirection === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
              {allNavItems.map((item, index) => (
                    <button key={index} onClick={() => { onChangeView(item.id); setIsFloatingRailExpanded(false); setIsSidebarVisible(false); }} className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm border ${currentView === item.id ? 'bg-lime text-black border-lime' : 'bg-white dark:bg-[#1C1C1E] text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10'}`}><item.icon className="w-4 h-4" /></button>
                ))}
            </div>
          )}
        </div>
      )}

      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10 bg-light-base dark:bg-dark-base transition-all duration-300">
        <header className="h-16 px-4 md:px-8 flex items-center justify-between flex-shrink-0 border-b border-gray-200 dark:border-white/5">
            <div className="flex items-center gap-4">
                {isMobile && <button onClick={() => setIsSidebarVisible(true)} className="p-2 bg-white dark:bg-white/5 rounded-xl text-gray-500 shadow-sm"><Menu className="w-5 h-5" /></button>}
                <div className="hidden md:flex items-center gap-3">
                   <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">{pageTitle}</h1>
                   <span className="px-2 py-0.5 rounded-full bg-lime/20 text-lime-800 dark:text-lime text-[10px] font-bold uppercase tracking-wider">v2.0</span>
                </div>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-white/5 shadow-sm border border-gray-100 dark:border-white/5">
                    {isSaving ? <><RefreshCw className="w-3.5 h-3.5 text-orange-500 animate-spin" /><span className="text-xs font-bold text-orange-500 hidden sm:inline">Saving</span></> : <><Cloud className="w-3.5 h-3.5 text-gray-400" /><span className="text-xs font-bold text-gray-400 hidden sm:inline">Synced</span></>}
                </div>

                {['inventory', 'invoices', 'parties', 'purchases', 'transactions'].includes(currentView) && (
                    <div className="relative group hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} className="bg-white dark:bg-dark-surface pl-10 pr-4 py-2 w-64 focus:w-80 rounded-full border border-gray-200 dark:border-white/10 focus:border-lime outline-none text-sm font-medium transition-all" />
                    </div>
                )}

                <div className="relative" ref={filterMenuRef}>
                    <button onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} className={`w-10 h-10 rounded-full bg-white dark:bg-dark-surface shadow-sm border border-gray-200 dark:border-white/10 flex items-center justify-center transition-all ${hasActiveFilters ? 'ring-2 ring-lime text-lime-600 dark:text-lime' : 'text-gray-500'}`}><Filter className="w-4 h-4" /></button>
                    {isFilterMenuOpen && (
                        <div className="absolute right-0 mt-4 w-80 bg-white dark:bg-[#1C1C1E] rounded-3xl shadow-2xl z-[90] p-6 border border-gray-200 dark:border-white/10 animate-fadeIn">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Global Filters</h3>
                                <button onClick={resetFilters} className="text-xs font-bold text-gray-400 hover:text-lime flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Reset</button>
                            </div>
                            <div className="space-y-5">
                                {/* Time Period */}
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Time Period</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="relative">
                                            <select value={filterConfig.month} onChange={(e) => onFilterChange({ ...filterConfig, month: e.target.value })} className={filterSelectClass}>
                                                <option value="">Any Month</option>
                                                {months.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
                                            </select>
                                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                                        </div>
                                        <div className="relative">
                                            <select value={filterConfig.year} onChange={(e) => onFilterChange({ ...filterConfig, year: e.target.value })} className={filterSelectClass}>
                                                <option value="">Any Year</option>
                                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Filtering */}
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Wise</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                        <select value={filterConfig.partyId} onChange={(e) => onFilterChange({ ...filterConfig, partyId: e.target.value })} className={`${filterSelectClass} pl-9`}>
                                            <option value="">All Contacts</option>
                                            {parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Item Wise Filtering */}
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Item Wise</label>
                                    <div className="relative">
                                        <Box className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                        <select value={filterConfig.productId} onChange={(e) => onFilterChange({ ...filterConfig, productId: e.target.value })} className={`${filterSelectClass} pl-9`}>
                                            <option value="">All Items</option>
                                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="h-px bg-gray-100 dark:bg-white/5 my-2"></div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount Range</label>
                                    <div className="flex gap-2">
                                        <input type="number" placeholder="Min" value={filterConfig.minAmount} onChange={(e) => onFilterChange({ ...filterConfig, minAmount: e.target.value })} className="w-full bg-gray-50 dark:bg-black/20 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-lime" />
                                        <input type="number" placeholder="Max" value={filterConfig.maxAmount} onChange={(e) => onFilterChange({ ...filterConfig, maxAmount: e.target.value })} className="w-full bg-gray-50 dark:bg-black/20 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-lime" />
                                    </div>
                                </div>
                                <button onClick={() => setIsFilterMenuOpen(false)} className="w-full bg-lime text-black py-3 rounded-xl font-bold text-sm shadow-sm transition-all hover:bg-lime-hover">Show Results</button>
                            </div>
                        </div>
                    )}
                </div>

                {['inventory', 'invoices', 'parties', 'purchases', 'transactions'].includes(currentView) && (
                    <div className="relative" ref={sortMenuRef}>
                        <button onClick={() => setIsSortMenuOpen(!isSortMenuOpen)} className="w-10 h-10 rounded-full bg-white dark:bg-dark-surface shadow-sm border border-gray-200 dark:border-white/10 flex items-center justify-center transition-all text-gray-500"><ArrowUpDown className="w-4 h-4" /></button>
                        {isSortMenuOpen && (
                            <div className="absolute right-0 mt-4 w-52 bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-xl z-50 p-2 border border-gray-200 dark:border-white/10 animate-fadeIn">
                                <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sort By</div>
                                {['name', 'date', 'amount'].map(key => (
                                    <button key={key} onClick={() => { onSortChange({ ...sortConfig, key: key as any }); setIsSortMenuOpen(false); }} className={`w-full text-left px-4 py-2.5 rounded-xl text-sm flex justify-between items-center transition-colors ${sortConfig.key === key ? 'bg-lime text-black font-bold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                                        <span className="capitalize">{key}</span>
                                        {sortConfig.key === key && <Check className="w-4 h-4" />}
                                    </button>
                                ))}
                                <div className="h-px bg-gray-100 dark:bg-white/5 my-1"></div>
                                <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Order</div>
                                {['asc', 'desc'].map(dir => (
                                    <button key={dir} onClick={() => { onSortChange({ ...sortConfig, direction: dir as any }); setIsSortMenuOpen(false); }} className={`w-full text-left px-4 py-2.5 rounded-xl text-sm flex justify-between items-center transition-colors ${sortConfig.direction === dir ? 'bg-lime text-black font-bold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                                        <span className="capitalize">{dir === 'asc' ? 'Ascending' : 'Descending'}</span>
                                        {sortConfig.direction === dir && <Check className="w-4 h-4" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 md:px-8 pb-10 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto animate-fadeIn mt-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
