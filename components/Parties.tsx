
import React, { useState } from 'react';
import { Party, SortConfig, FilterConfig, User } from '../types';
import { Plus, Trash2, User as UserIcon, Truck, Phone, MapPin, Edit2, CreditCard, X, Mail, ChevronRight, MoreHorizontal, Contact, Upload, Download, AlertTriangle } from 'lucide-react';

interface PartiesProps {
  parties: Party[];
  onAddParty: (p: Party) => void;
  onUpdateParty: (p: Party) => void;
  onDeleteParty: (id: string) => void;
  onBulkImport: (newParties: Party[]) => void;
  searchTerm: string;
  sortConfig: SortConfig;
  filterConfig: FilterConfig;
  currentUser: User;
}

const Parties: React.FC<PartiesProps> = ({ 
    parties, onAddParty, onUpdateParty, onDeleteParty, onBulkImport,
    searchTerm, sortConfig, filterConfig, currentUser 
}) => {
  const [activeTab, setActiveTab] = useState<'CUSTOMER' | 'SUPPLIER'>('CUSTOMER');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importSummary, setImportSummary] = useState<any>(null);
  
  const [formData, setFormData] = useState<Partial<Party>>({
    name: '', phone: '', email: '', gstIn: '', place: '', addressLine1: '', state: '', stateCode: '', type: 'CUSTOMER'
  });

  const canManage = currentUser.role === 'ADMIN' || (currentUser.permissions && currentUser.permissions.canManageParties);
  const canDelete = currentUser.role === 'ADMIN' || (currentUser.permissions && currentUser.permissions.canDeleteData);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContactPicker = async () => {
    const supported = ('contacts' in navigator && 'ContactsManager' in window);
    if (!supported) {
      alert("Contact selection is not supported on this device/browser. It usually works on Android Chrome and iOS Safari.");
      return;
    }
    try {
      const props = ['name', 'email', 'tel'];
      const opts = { multiple: false };
      const contacts = await (navigator as any).contacts.select(props, opts);
      
      if (contacts && contacts.length > 0) {
        const contact = contacts[0];
        
        // Robust mapping for different contact field structures
        const contactName = (Array.isArray(contact.name) ? contact.name[0] : contact.name) || '';
        const contactEmail = (Array.isArray(contact.email) ? contact.email[0] : contact.email) || '';
        const contactTel = (Array.isArray(contact.tel) ? contact.tel[0] : contact.tel) || '';
        
        setFormData(prev => ({
          ...prev,
          name: contactName || prev.name,
          phone: contactTel ? contactTel.replace(/\s+/g, '') : prev.phone,
          email: contactEmail || prev.email
        }));
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error("Contact picker error:", err);
      }
    }
  };

  const openEdit = (p: Party) => { setFormData(p); setIsModalOpen(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    const partyData: Party = {
      id: formData.id || crypto.randomUUID(),
      name: formData.name,
      type: formData.type as 'CUSTOMER' | 'SUPPLIER',
      phone: formData.phone,
      email: formData.email,
      gstIn: formData.gstIn,
      place: formData.place,
      addressLine1: formData.addressLine1,
      state: formData.state,
      stateCode: formData.stateCode
    };
    if (formData.id) onUpdateParty(partyData); else onAddParty(partyData);
    setIsModalOpen(false);
    setFormData({ name: '', phone: '', email: '', gstIn: '', place: '', addressLine1: '', state: '', stateCode: '', type: activeTab });
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this party?")) onDeleteParty(id);
  };

  const handleDownloadTemplate = () => {
    const headers = "Name,Type,Phone,Email,GSTIN,City,Address,State";
    const sample1 = "Global Traders,SUPPLIER,9876543210,info@global.com,27AAAAA0000A1Z5,Mumbai,Andheri West,Maharashtra";
    const sample2 = "John Doe,CUSTOMER,9988776655,john@example.com,,New Delhi,Sector 5,Delhi";
    const csvContent = "data:text/csv;charset=utf-8," + [headers, sample1, sample2].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "contacts_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        if (row.length < 1) continue;
        dataRows.push({
            name: row[0],
            type: (row[1] || 'CUSTOMER').toUpperCase(),
            phone: row[2],
            email: row[3],
            gstIn: row[4],
            place: row[5],
            addressLine1: row[6],
            state: row[7]
        });
      }
      processImportData(dataRows);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const processImportData = (rows: any[]) => {
      const newParties: Party[] = [];
      const skippedRows: { id: string; reason: string }[] = [];

      rows.forEach((row, idx) => {
          if (!row.name) {
              skippedRows.push({ id: `Row ${idx + 2}`, reason: 'Missing Name' });
              return;
          }
          const type = (row.type === 'SUPPLIER' || row.type === 'CUSTOMER') ? row.type : 'CUSTOMER';
          
          if (parties.some(p => p.name.toLowerCase() === row.name.toLowerCase() && p.type === type)) {
              skippedRows.push({ id: row.name, reason: 'Duplicate Record' });
              return;
          }

          newParties.push({
              id: crypto.randomUUID(),
              name: row.name,
              type: type,
              phone: row.phone || '',
              email: row.email || '',
              gstIn: row.gstIn || '',
              place: row.place || '',
              addressLine1: row.addressLine1 || '',
              state: row.state || ''
          });
      });

      setImportSummary({ newParties, skippedRows });
  };

  const confirmImport = () => {
      if (!importSummary) return;
      onBulkImport(importSummary.newParties);
      setIsImportModalOpen(false);
      setImportSummary(null);
  };

  const filteredParties = parties.filter(p => {
    if (p.type !== activeTab) return false;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.phone?.includes(searchTerm) || p.place?.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (filterConfig.partyId && p.id !== filterConfig.partyId) return false;
    return true;
  }).sort((a, b) => {
      let valA: any = a.name.toLowerCase(); let valB: any = b.name.toLowerCase();
      if (sortConfig.key === 'name') { valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); }
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
  });

  const inputClass = "w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-lime focus:ring-1 focus:ring-lime/50 transition-all outline-none text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400";
  const labelClass = "block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider ml-1";

  const isContactPickerSupported = typeof window !== 'undefined' && 'contacts' in navigator && 'ContactsManager' in window;

  return (
    <div className="space-y-8 animate-fadeIn pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
            <div className="flex items-center gap-3 mb-1">
               <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Contacts</h2>
               <div className="w-2 h-2 rounded-full bg-lime shadow-[0_0_10px_rgba(221,246,118,0.6)]"></div>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Manage your network of customers and suppliers.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
            <div className="flex p-1.5 rounded-full bg-gray-200/50 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 w-full sm:w-auto">
                <button 
                    onClick={() => setActiveTab('CUSTOMER')} 
                    className={`flex-1 sm:flex-none px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'CUSTOMER' ? 'bg-lime text-black shadow-lg shadow-lime/20 scale-100' : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}
                >
                    <UserIcon className="w-4 h-4" /> Customers
                </button>
                <button 
                    onClick={() => setActiveTab('SUPPLIER')} 
                    className={`flex-1 sm:flex-none px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'SUPPLIER' ? 'bg-lime text-black shadow-lg shadow-lime/20 scale-100' : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}
                >
                    <Truck className="w-4 h-4" /> Suppliers
                </button>
            </div>

            <div className="flex gap-2">
                {canManage && (
                    <>
                        <button onClick={() => setIsImportModalOpen(true)} className="flex bento-card bg-white dark:bg-dark-surface/70 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 p-3 md:px-5 md:py-3 rounded-full items-center gap-2 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors font-bold text-sm shadow-sm">
                            <Upload className="w-5 h-5 md:w-4 md:h-4" />
                            <span className="hidden md:inline">Import</span>
                        </button>
                        <button 
                            onClick={() => {
                                setFormData({ name: '', phone: '', email: '', gstIn: '', place: '', addressLine1: '', state: '', stateCode: '', type: activeTab });
                                setIsModalOpen(true);
                            }}
                            className="btn-black px-6 py-3 rounded-full items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all text-sm font-bold"
                        >
                            <Plus className="w-5 h-5" /> <span className="hidden sm:inline">Add {activeTab === 'CUSTOMER' ? 'Customer' : 'Supplier'}</span><span className="sm:hidden">New</span>
                        </button>
                    </>
                )}
            </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredParties.map(party => (
          <div key={party.id} className="group relative p-6 rounded-[24px] bg-white/40 dark:bg-[#1C1C1E]/60 backdrop-blur-md border border-gray-100 dark:border-white/5 hover:border-lime/50 dark:hover:border-lime/50 transition-all duration-300 hover:shadow-2xl hover:shadow-lime/5 hover:-translate-y-1 flex flex-col justify-between h-full">
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-colors duration-300 ${
                            party.type === 'CUSTOMER' 
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30' 
                            : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30'
                        }`}>
                            {party.type === 'CUSTOMER' ? <UserIcon className="w-6 h-6" /> : <Truck className="w-6 h-6" />}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-snug group-hover:text-lime-700 dark:group-hover:text-lime transition-colors line-clamp-1">{party.name}</h3>
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mt-1 inline-block ${
                                party.type === 'CUSTOMER' 
                                ? 'bg-blue-100/50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                                : 'bg-orange-100/50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                            }`}>
                                {party.type}
                            </span>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                        {canManage && (
                            <button onClick={() => openEdit(party)} className="w-8 h-8 rounded-full bg-white dark:bg-black/40 border border-gray-100 dark:border-white/10 shadow-sm flex items-center justify-center text-gray-400 hover:text-black dark:hover:text-white hover:scale-110 transition-all" title="Edit">
                                <Edit2 className="w-3.5 h-3.5" />
                            </button>
                        )}
                        {canDelete && (
                            <button onClick={() => handleDelete(party.id)} className="w-8 h-8 rounded-full bg-white dark:bg-black/40 border border-gray-100 dark:border-white/10 shadow-sm flex items-center justify-center text-gray-400 hover:text-red-500 hover:scale-110 transition-all" title="Delete">
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>
                <div className="space-y-4 pt-2">
                    <div className={`flex items-center gap-3 p-3 rounded-2xl border transition-colors ${party.phone ? 'bg-gray-50/50 dark:bg-white/5 border-transparent group-hover:border-lime/10' : 'bg-gray-50/30 dark:bg-white/5 border-transparent border-dashed'}`}>
                        <div className={`p-2 rounded-full bg-white dark:bg-white/5 transition-colors ${party.phone ? 'text-gray-400 group-hover:text-lime-600 dark:group-hover:text-lime' : 'text-gray-300'}`}>
                            <Phone className="w-3.5 h-3.5" />
                        </div>
                        <span className={`text-sm ${party.phone ? 'font-semibold text-gray-700 dark:text-gray-200' : 'font-medium text-gray-400 italic'}`}>{party.phone || 'No phone'}</span>
                    </div>
                    <div className="flex flex-col gap-2 px-1">
                        {(party.place || party.addressLine1) && (
                            <div className="flex items-start gap-3">
                                <MapPin className="w-3.5 h-3.5 text-gray-400 mt-1 flex-shrink-0" />
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                                    {party.addressLine1}{party.addressLine1 && party.place ? ', ' : ''}{party.place}
                                    {party.state && <span className="block text-gray-400 text-[10px] uppercase mt-0.5">{party.state}</span>}
                                </span>
                            </div>
                        )}
                        {(party.gstIn || party.email) && <div className="h-px bg-gray-100 dark:bg-white/5 my-1 w-full"></div>}
                        {party.gstIn && (
                            <div className="flex items-center gap-3">
                                <CreditCard className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono tracking-wide">{party.gstIn}</span>
                            </div>
                        )}
                         {party.email && (
                            <div className="flex items-center gap-3">
                                <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{party.email}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-lime/20 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          </div>
        ))}
        {filteredParties.length === 0 && (
            <div className="col-span-full py-24 text-center flex flex-col items-center justify-center rounded-[32px] bg-gray-50/50 dark:bg-white/5 border-2 border-dashed border-gray-200 dark:border-white/10">
                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-6 animate-float">
                    <UserIcon className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No {activeTab.toLowerCase()}s found</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto mb-8">It seems you haven't added any {activeTab.toLowerCase()}s matching your search yet.</p>
                {canManage && (
                    <button onClick={() => setIsModalOpen(true)} className="btn-black px-8 py-3 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add New {activeTab === 'CUSTOMER' ? 'Customer' : 'Supplier'}
                    </button>
                )}
            </div>
        )}
      </div>

      {/* Floating FAB for mobile */}
      {canManage && (
        <button 
            onClick={() => {
                setFormData({ name: '', phone: '', email: '', gstIn: '', place: '', addressLine1: '', state: '', stateCode: '', type: activeTab });
                setIsModalOpen(true);
            }}
            className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-lime text-black rounded-full shadow-glow-lime flex items-center justify-center z-40 active:scale-95 transition-transform"
        >
            <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bento-card bg-white dark:bg-dark-surface w-full max-w-lg overflow-hidden animate-fadeIn relative rounded-3xl shadow-2xl">
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Import Contacts</h3>
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
                                    <p className="font-bold text-gray-900 dark:text-white">Click to upload Contact CSV</p>
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
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="bento-card bg-lime/10 p-4 rounded-2xl"><p className="text-xs text-lime-700 dark:text-lime font-bold uppercase mb-1">New Contacts</p><p className="text-2xl font-black text-gray-900 dark:text-white">{importSummary.newParties.length}</p></div>
                            <div className="bento-card bg-orange-50 dark:bg-orange-900/20 p-4 rounded-2xl"><p className="text-xs text-orange-600 dark:text-orange-400 font-bold uppercase mb-1">Skipped</p><p className="text-2xl font-black text-gray-900 dark:text-white">{importSummary.skippedRows.length}</p></div>
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300">
          <div className="bento-card bg-white dark:bg-[#1C1C1E] w-full max-w-lg overflow-hidden animate-fadeIn relative flex flex-col max-h-[90vh] rounded-[32px] shadow-2xl border border-white/20 dark:border-white/10">
            <div className="p-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5 backdrop-blur-xl">
              <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{formData.id ? 'Edit' : 'New'} {activeTab === 'CUSTOMER' ? 'Customer' : 'Supplier'}</h3>
                  <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wider">Contact Details</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-gray-400 hover:text-black dark:hover:text-white hover:rotate-90 transition-all shadow-sm"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
              <div className="flex flex-col gap-4">
                 {isContactPickerSupported && !formData.id && (
                    <button 
                      type="button" 
                      onClick={handleContactPicker}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-lime/10 text-lime-800 dark:text-lime font-bold text-sm border border-lime/20 hover:bg-lime/20 transition-all active:scale-95 mb-2"
                    >
                      <Contact className="w-4 h-4" /> Import from Device Contacts
                    </button>
                 )}
                 <div className="group">
                    <label className={labelClass}>Name</label>
                    <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className={inputClass} placeholder="Business or Person Name" autoFocus />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                    <label className={labelClass}>Phone</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className={inputClass} placeholder="+91..." />
                </div>
                <div>
                    <label className={labelClass}>Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={inputClass} placeholder="Optional" />
                </div>
              </div>
              <div>
                  <label className={labelClass}>Address</label>
                  <input type="text" name="addressLine1" value={formData.addressLine1} onChange={handleInputChange} className={inputClass} placeholder="Street Address / Area" />
              </div>
               <div className="grid grid-cols-2 gap-5">
                <div>
                    <label className={labelClass}>City</label>
                    <input type="text" name="place" value={formData.place} onChange={handleInputChange} className={inputClass} placeholder="City/Town" />
                </div>
                 <div>
                    <label className={labelClass}>State</label>
                    <input type="text" name="state" value={formData.state} onChange={handleInputChange} className={inputClass} placeholder="State Name" />
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-white/5 p-5 rounded-3xl border border-gray-100 dark:border-white/5">
                <label className={labelClass}>Tax Information (GSTIN)</label>
                <div className="relative mt-2">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" name="gstIn" value={formData.gstIn} onChange={handleInputChange} className={`${inputClass} pl-10 font-mono uppercase bg-white dark:bg-black/20`} placeholder="GSTIN Number" />
                </div>
              </div>
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-100 dark:border-white/5 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 rounded-2xl text-gray-500 font-bold text-sm hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">Cancel</button>
                <button type="submit" className="bg-lime hover:bg-lime-hover text-black px-10 py-4 rounded-2xl text-sm font-bold shadow-lg shadow-lime/20 hover:shadow-lime/40 hover:-translate-y-1 transform transition-all flex items-center gap-2">
                    <span className="bg-black/10 p-1 rounded-full"><ChevronRight className="w-3 h-3" /></span> Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Parties;
