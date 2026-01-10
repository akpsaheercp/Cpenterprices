
import React, { useState, useEffect, useRef } from 'react';
import { Business, AuditLog, AppPreferences, User, UserPermissions, TaxGroup, TaxComponent } from '../types';
import { 
  Building, Users, LayoutTemplate, RotateCcw, Save, Trash2, Edit2, 
  CheckSquare, Square, History, Clock, Check, X, 
  Plus, Percent, Landmark, MapPin, Phone, Mail, Hash, Globe, FileText, Key, Cloud, RefreshCw, AlertTriangle, ShieldCheck, Download, Upload, Eraser, Hash as HashIcon
} from 'lucide-react';
import { forcePushToCloud, resetSyncData, getAppState, restoreAppState } from '../services/dataService';

interface SettingsProps {
  business: Business;
  auditLogs: AuditLog[];
  taxGroups: TaxGroup[];
  preferences: AppPreferences;
  users: User[];
  currentUser: User;
  onUpdateBusiness: (b: Partial<Business>) => void;
  onUpdatePreferences: (p: Partial<AppPreferences>) => void;
  onAddUser: (u: User) => void;
  onUpdateUser: (u: User) => void;
  onDeleteUser: (id: string) => void;
  onAddTaxGroup: (g: TaxGroup) => void;
  onUpdateTaxGroup: (g: TaxGroup) => void;
  onDeleteTaxGroup: (id: string) => void;
  onClearBusinessData: () => void;
}

const Settings: React.FC<SettingsProps> = ({ 
    business, auditLogs, taxGroups, preferences, users, currentUser,
    onUpdateBusiness, onUpdatePreferences,
    onAddUser, onUpdateUser, onDeleteUser,
    onAddTaxGroup, onUpdateTaxGroup, onDeleteTaxGroup, onClearBusinessData
}) => {
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'TAXES' | 'USERS' | 'HISTORY' | 'INTERFACE' | 'DATA'>('PROFILE');
  const [formData, setFormData] = useState<Partial<Business>>(business);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [userData, setUserData] = useState<Partial<User>>({
      name: '', username: '', role: 'STAFF', 
      permissions: { canManageInventory: true, canManageInvoices: true, canManagePurchases: true, canManageParties: true, canManageExpenses: true, canDeleteData: false, canViewReports: false }
  });

  const [taxData, setTaxData] = useState<Partial<TaxGroup>>({
      name: '', description: '', status: 'active', components: [{ name: 'SGST', percentage: 9 }, { name: 'CGST', percentage: 9 }]
  });

  useEffect(() => { setFormData(business); }, [business]);

  const handleSave = (e: React.FormEvent) => { e.preventDefault(); onUpdateBusiness(formData); alert("Settings saved successfully."); };

  const toggleColumn = (page: keyof AppPreferences['columns'], col: string) => {
    const currentCols = preferences.columns[page];
    onUpdatePreferences({ columns: { ...preferences.columns, [page]: { ...currentCols, [col]: !currentCols[col as keyof typeof currentCols] } } });
  };

  const handleUserSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!userData.username || !userData.name) return;
      const defaultPerms: UserPermissions = { canManageInventory: true, canManageInvoices: true, canManagePurchases: true, canManageParties: true, canManageExpenses: true, canDeleteData: false, canViewReports: false };
      const user: User = {
          id: userData.id || crypto.randomUUID(), name: userData.name, username: userData.username,
          role: userData.role as 'ADMIN' | 'STAFF',
          permissions: userData.role === 'ADMIN' ? { canManageInventory: true, canManageInvoices: true, canManagePurchases: true, canManageParties: true, canManageExpenses: true, canDeleteData: true, canViewReports: true } : (userData.permissions || defaultPerms)
      };
      if (userData.id) onUpdateUser(user); else { try { onAddUser(user); } catch(err) { alert("Error adding user: Username might already exist."); return; } }
      setIsUserModalOpen(false);
      setUserData({ name: '', username: '', role: 'STAFF', permissions: defaultPerms });
  };

  const handleTaxSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!taxData.name || !taxData.components || taxData.components.length === 0) return;
      
      const group: TaxGroup = {
          id: taxData.id || crypto.randomUUID(),
          name: taxData.name,
          description: taxData.description || '',
          components: taxData.components,
          status: taxData.status || 'active'
      };

      if (taxData.id) onUpdateTaxGroup(group); else onAddTaxGroup(group);
      setIsTaxModalOpen(false);
      setTaxData({ name: '', description: '', status: 'active', components: [{ name: 'SGST', percentage: 9 }, { name: 'CGST', percentage: 9 }] });
  };

  const handleDeleteUser = (id: string) => {
      if (id === currentUser.id) { alert("You cannot delete yourself."); return; }
      if (confirm("Delete this user?")) onDeleteUser(id);
  };

  const handleDeleteTaxGroup = (id: string) => {
      if (confirm("Delete this Tax Group? Note: Existing invoices using this group will retain their data, but new products/invoices won't be able to use it.")) {
          onDeleteTaxGroup(id);
      }
  };

  const handleForceSync = async () => {
      setIsSyncing(true);
      const success = await forcePushToCloud();
      setIsSyncing(false);
      if (success) alert("Manual Sync Completed!");
      else alert("Sync Failed. Check network or login status.");
  };

  const handleReset = async () => {
      setIsSyncing(true);
      await resetSyncData();
      setIsSyncing(false);
  };

  const handleClearData = () => {
      if (confirm(`⚠️ CRITICAL WARNING: You are about to erase ALL records (Products, Invoices, Contacts, etc.) for "${business.name}". This action cannot be undone. Are you absolutely sure?`)) {
          if (confirm(`LAST CHANCE: Type the business name "${business.name}" correctly to proceed. (Just kidding, click OK to wipe everything).`)) {
              onClearBusinessData();
              alert("All business records have been cleared.");
          }
      }
  };

  const handleBackup = () => {
      const state = getAppState();
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cp_enterprises_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
  };

  const handleRestoreClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const content = event.target?.result as string;
              const newState = JSON.parse(content);
              if (!newState.businesses || !Array.isArray(newState.businesses)) {
                  throw new Error("Invalid backup format: Missing businesses data.");
              }
              if (confirm("⚠️ WARNING: This will overwrite ALL current local data with the backup file. The app will reload. Continue?")) {
                  restoreAppState(newState);
              }
          } catch (err) {
              console.error("Restore failed:", err);
              alert("Error restoring backup: " + (err as Error).message);
          }
      };
      reader.readAsText(file);
      e.target.value = '';
  };

  const openEditUser = (u: User) => { setUserData(u); setIsUserModalOpen(true); };
  const openEditTax = (g: TaxGroup) => { setTaxData(JSON.parse(JSON.stringify(g))); setIsTaxModalOpen(true); }; 

  const togglePermission = (key: keyof UserPermissions) => {
      if (!userData.permissions) return;
      setUserData({ ...userData, permissions: { ...userData.permissions, [key]: !userData.permissions[key] } });
  };

  const addTaxComponent = () => {
      setTaxData({ ...taxData, components: [...(taxData.components || []), { name: '', percentage: 0 }] });
  };

  const removeTaxComponent = (index: number) => {
      if (!taxData.components) return;
      const newComponents = [...taxData.components];
      newComponents.splice(index, 1);
      setTaxData({ ...taxData, components: newComponents });
  };

  const updateTaxComponent = (index: number, field: keyof TaxComponent, value: any) => {
      if (!taxData.components) return;
      const newComponents = [...taxData.components];
      newComponents[index] = { ...newComponents[index], [field]: value };
      setTaxData({ ...taxData, components: newComponents });
  };

  const inputClass = "w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-lime focus:ring-1 focus:ring-lime/50 transition-all outline-none text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400";
  const labelClass = "block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider ml-1";

  return (
    <div className="space-y-8 animate-fadeIn pb-10">
      <div>
        <div className="flex items-center gap-2 mb-1">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Settings</h2>
            <span className="w-2.5 h-2.5 rounded-full bg-lime"></span>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Configure business profile, taxes, and user access.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-2">
            {[
                { id: 'PROFILE', label: 'Business Profile', icon: Building },
                { id: 'TAXES', label: 'Tax Configuration', icon: Percent },
                { id: 'USERS', label: 'User Management', icon: Users },
                { id: 'INTERFACE', label: 'Interface', icon: LayoutTemplate },
                { id: 'HISTORY', label: 'Audit Log', icon: History },
                { id: 'DATA', label: 'Data & Sync', icon: Cloud },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 ${activeTab === tab.id ? 'bg-lime text-black shadow-lg shadow-lime/20' : 'text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-white/5'}`}
                >
                    <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
            ))}
        </div>

        <div className="lg:col-span-3">
            {activeTab === 'PROFILE' && (
                <div className="bento-card bg-white dark:bg-[#1C1C1E] p-8 rounded-[32px] border border-gray-100 dark:border-white/5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Organization Details</h3>
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Business Name</label>
                                <div className="relative"><Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className={`${inputClass} pl-10`} /></div>
                            </div>
                             <div>
                                <label className={labelClass}>GSTIN / Tax ID</label>
                                <div className="relative"><Landmark className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" value={formData.gstIn || ''} onChange={e => setFormData({...formData, gstIn: e.target.value})} className={`${inputClass} pl-10`} /></div>
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Address</label>
                            <div className="relative"><MapPin className="absolute left-4 top-4 w-4 h-4 text-gray-400" /><textarea value={formData.addressLine1 || ''} onChange={e => setFormData({...formData, addressLine1: e.target.value})} className={`${inputClass} pl-10 min-h-[100px] py-4 resize-none`} placeholder="Full Business Address" /></div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div><label className={labelClass}>City</label><input type="text" value={formData.city || ''} onChange={e => setFormData({...formData, city: e.target.value})} className={inputClass} /></div>
                            <div><label className={labelClass}>State</label><input type="text" value={formData.state || ''} onChange={e => setFormData({...formData, state: e.target.value})} className={inputClass} /></div>
                            <div><label className={labelClass}>Pincode</label><input type="text" value={formData.pincode || ''} onChange={e => setFormData({...formData, pincode: e.target.value})} className={inputClass} /></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className={labelClass}>Email</label><div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className={`${inputClass} pl-10`} /></div></div>
                            <div><label className={labelClass}>Phone</label><div className="relative"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} className={`${inputClass} pl-10`} /></div></div>
                        </div>

                        {/* Sequential Invoice Configuration */}
                        <div className="bg-lime/5 p-6 rounded-3xl border border-lime/10">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-lime-600 dark:text-lime" /> Invoice Serial Number Settings</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClass}>Invoice Prefix</label>
                                    <input type="text" placeholder="e.g. INV-" value={formData.invoicePrefix || ''} onChange={e => setFormData({...formData, invoicePrefix: e.target.value})} className={`${inputClass} bg-white dark:bg-black/20`} />
                                    <p className="text-[10px] text-gray-400 mt-2 ml-1">Appears before the number (e.g. INV-1001)</p>
                                </div>
                                <div>
                                    <label className={labelClass}>Starting Number</label>
                                    <div className="relative">
                                        <HashIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input type="number" min="1" value={formData.invoiceStartNumber || 1} onChange={e => setFormData({...formData, invoiceStartNumber: parseInt(e.target.value) || 1})} className={`${inputClass} pl-10 bg-white dark:bg-black/20`} />
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-2 ml-1">The first invoice will start from this number</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/5">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Landmark className="w-4 h-4" /> Bank Details</h4>
                            <div className="space-y-4">
                                <div><label className={labelClass}>Bank Name</label><input type="text" value={formData.bankName || ''} onChange={e => setFormData({...formData, bankName: e.target.value})} className={`${inputClass} bg-white dark:bg-black/20`} /></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className={labelClass}>Account Number</label><input type="text" value={formData.bankAccountNo || ''} onChange={e => setFormData({...formData, bankAccountNo: e.target.value})} className={`${inputClass} bg-white dark:bg-black/20`} /></div>
                                    <div><label className={labelClass}>IFSC / Branch</label><input type="text" value={formData.bankBranchIFSC || ''} onChange={e => setFormData({...formData, bankBranchIFSC: e.target.value})} className={`${inputClass} bg-white dark:bg-black/20`} /></div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button type="submit" className="btn-black px-8 py-4 rounded-2xl font-bold shadow-lg flex items-center gap-2">
                                <Save className="w-4 h-4" /> Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {activeTab === 'TAXES' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center bento-card bg-white dark:bg-[#1C1C1E] p-6 rounded-[32px]">
                         <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tax Groups</h3>
                            <p className="text-xs text-gray-500">Configure GST slabs and components.</p>
                         </div>
                         <button onClick={() => { setTaxData({ name: '', description: '', status: 'active', components: [{ name: 'SGST', percentage: 9 }, { name: 'CGST', percentage: 9 }] }); setIsTaxModalOpen(true); }} className="btn-black px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2">
                             <Plus className="w-4 h-4" /> New Tax Group
                         </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {taxGroups.map(group => (
                            <div key={group.id} className="bento-card bg-white dark:bg-[#1C1C1E] p-6 rounded-[24px] border border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group">
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                                        {group.name}
                                        {group.status === 'inactive' && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase">Inactive</span>}
                                    </h4>
                                    <div className="flex gap-2 mt-2">
                                        {group.components.map((c, i) => (
                                            <span key={i} className="text-xs font-bold bg-lime/10 text-lime-700 dark:text-lime px-2 py-1 rounded-md border border-lime/20">
                                                {c.name}: {c.percentage}%
                                            </span>
                                        ))}
                                        <span className="text-xs font-bold bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md">
                                            Total: {group.components.reduce((a,b) => a + b.percentage, 0)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEditTax(group)} className="p-3 bg-gray-50 dark:bg-white/5 rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"><Edit2 className="w-4 h-4" /></button>
                                    <button onClick={() => handleDeleteTaxGroup(group.id)} className="p-3 bg-gray-50 dark:bg-white/5 rounded-full hover:bg-red-500 hover:text-white transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'USERS' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center bento-card bg-white dark:bg-[#1C1C1E] p-6 rounded-[32px]">
                         <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">User Management</h3>
                            <p className="text-xs text-gray-500">Manage staff access and permissions.</p>
                         </div>
                         <button onClick={() => { setUserData({ name: '', username: '', role: 'STAFF' }); setIsUserModalOpen(true); }} className="btn-black px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2">
                             <Plus className="w-4 h-4" /> Add User
                         </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {users.map(user => (
                            <div key={user.id} className="bento-card bg-white dark:bg-[#1C1C1E] p-6 rounded-[24px] border border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${user.role === 'ADMIN' ? 'bg-black text-lime' : 'bg-gray-100 dark:bg-white/10 text-gray-500'}`}>
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white text-base">{user.name} <span className="text-xs text-gray-400 font-normal">(@{user.username})</span></h4>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${user.role === 'ADMIN' ? 'bg-lime/20 text-lime-800 dark:text-lime' : 'bg-gray-100 text-gray-500'}`}>
                                            {user.role}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {currentUser.role === 'ADMIN' && (
                                        <>
                                            <button onClick={() => openEditUser(user)} className="p-3 bg-gray-50 dark:bg-white/5 rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => handleDeleteUser(user.id)} className="p-3 bg-gray-50 dark:bg-white/5 rounded-full hover:bg-red-500 hover:text-white transition-colors"><Trash2 className="w-4 h-4" /></button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'INTERFACE' && (
                <div className="bento-card bg-white dark:bg-[#1C1C1E] p-8 rounded-[32px] border border-gray-100 dark:border-white/5 space-y-8">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Table Columns</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Inventory Table</h4>
                                <div className="space-y-3">
                                    {Object.entries(preferences.columns.inventory).map(([key, enabled]) => (
                                        <div key={key} onClick={() => toggleColumn('inventory', key)} className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${enabled ? 'bg-lime text-black' : 'bg-gray-100 dark:bg-white/10 text-transparent'}`}>
                                                <Check className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize group-hover:text-black dark:group-hover:text-white">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Invoice Table</h4>
                                <div className="space-y-3">
                                    {Object.entries(preferences.columns.invoices).map(([key, enabled]) => (
                                        <div key={key} onClick={() => toggleColumn('invoices', key)} className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${enabled ? 'bg-lime text-black' : 'bg-gray-100 dark:bg-white/10 text-transparent'}`}>
                                                <Check className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize group-hover:text-black dark:group-hover:text-white">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'HISTORY' && (
                <div className="bento-card bg-white dark:bg-[#1C1C1E] p-8 rounded-[32px] border border-gray-100 dark:border-white/5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Activity Audit Log</h3>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                        {auditLogs.length === 0 ? (
                            <div className="text-center py-10 text-gray-400 text-sm">No activity recorded yet.</div>
                        ) : (
                            auditLogs.slice().reverse().map(log => (
                                <div key={log.id} className="flex gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-colors">
                                    <div className="mt-1">
                                        <div className="w-2 h-2 rounded-full bg-lime"></div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{log.action}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{log.details}</p>
                                        <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                            <Clock className="w-3 h-3" /> {log.date}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'DATA' && (
                <div className="bento-card bg-white dark:bg-[#1C1C1E] p-8 rounded-[32px] border border-gray-100 dark:border-white/5 space-y-8">
                     <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Cloud Sync</h3>
                        <p className="text-sm text-gray-500 mb-6">Manage how your data synchronizes with the cloud.</p>
                        
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button 
                                onClick={handleForceSync}
                                disabled={isSyncing}
                                className="w-full sm:w-auto btn-black px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-3"
                            >
                                {isSyncing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Cloud className="w-5 h-5" />}
                                {isSyncing ? "Syncing..." : "Force Cloud Sync"}
                            </button>
                        </div>
                     </div>

                     <div className="pt-8 border-t border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Local Backup & Restore</h3>
                        <p className="text-sm text-gray-500 mb-6">Download a portable backup file or restore from a previous one.</p>
                        
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button 
                                onClick={handleBackup}
                                className="w-full sm:w-auto px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 bg-blue-50 dark:bg-blue-900/10 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors border border-blue-200 dark:border-blue-900/30"
                            >
                                <Download className="w-5 h-5" /> Export Local Backup
                            </button>
                            <button 
                                onClick={handleRestoreClick}
                                className="w-full sm:w-auto px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 bg-purple-50 dark:bg-purple-900/10 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors border border-purple-200 dark:border-purple-900/30"
                            >
                                <Upload className="w-5 h-5" /> Restore from File
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept=".json" 
                                onChange={handleFileChange} 
                            />
                        </div>
                     </div>

                     <div className="pt-8 border-t border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-bold text-red-600 mb-2 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Danger Zone</h3>
                        <p className="text-sm text-gray-500 mb-6">Irreversible actions regarding your data.</p>
                        
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button 
                                onClick={handleClearData}
                                className="w-full sm:w-auto px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 bg-orange-50 dark:bg-orange-900/10 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors border border-orange-200 dark:border-orange-900/30"
                            >
                                <Eraser className="w-5 h-5" /> Wipe Business Records
                            </button>
                            <button 
                                onClick={handleReset}
                                className="w-full sm:w-auto px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 bg-red-50 dark:bg-red-900/10 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors border border-red-200 dark:border-red-900/30"
                            >
                                <Trash2 className="w-5 h-5" /> Reset & Re-Initialize App
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-4 max-w-lg leading-relaxed">
                            <span className="font-bold text-orange-600">Wipe Business Records:</span> Clears all invoices, products, and operational history for the current business but keeps the business profile.<br/>
                            <span className="font-bold text-red-600">Reset App:</span> Completely wipes all data including all business profiles and settings, forcing a fresh start.
                        </p>
                     </div>
                </div>
            )}
        </div>
      </div>

      {isUserModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className="bento-card bg-white dark:bg-[#1C1C1E] w-full max-md overflow-hidden animate-fadeIn relative rounded-[32px] shadow-2xl border border-white/20 dark:border-white/10">
                <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white">{userData.id ? 'Edit User' : 'New User'}</h3>
                    <button onClick={() => setIsUserModalOpen(false)} className="w-8 h-8 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-gray-400 hover:text-black dark:hover:text-white"><X className="w-4 h-4" /></button>
                </div>
                <form onSubmit={handleUserSubmit} className="p-6 space-y-4">
                    <div><label className={labelClass}>Full Name</label><input required type="text" value={userData.name} onChange={e => setUserData({...userData, name: e.target.value})} className={inputClass} /></div>
                    <div><label className={labelClass}>Username (for login)</label><input required type="text" value={userData.username} onChange={e => setUserData({...userData, username: e.target.value})} className={inputClass} disabled={!!userData.id} /></div>
                    <div>
                        <label className={labelClass}>Role</label>
                        <select value={userData.role} onChange={e => setUserData({...userData, role: e.target.value as any})} className={inputClass}>
                            <option value="STAFF">Staff</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>
                    {userData.role === 'STAFF' && userData.permissions && (
                        <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                            <label className={labelClass}>Permissions</label>
                            {Object.keys(userData.permissions).map((key) => (
                                <div key={key} onClick={() => togglePermission(key as keyof UserPermissions)} className="flex items-center gap-3 p-2 hover:bg-white dark:hover:bg-white/10 rounded-xl cursor-pointer">
                                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${userData.permissions![key as keyof UserPermissions] ? 'bg-lime border-lime text-black' : 'border-gray-300 dark:border-gray-600'}`}>
                                        {userData.permissions![key as keyof UserPermissions] && <Check className="w-3.5 h-3.5" />}
                                    </div>
                                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{key.replace(/can([A-Z])/g, '$1').replace(/([A-Z])/g, ' $1')}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <button type="submit" className="w-full btn-black py-4 rounded-2xl font-bold mt-2">Save User</button>
                </form>
            </div>
        </div>
      )}

      {isTaxModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className="bento-card bg-white dark:bg-[#1C1C1E] w-full max-w-lg overflow-hidden animate-fadeIn relative rounded-[32px] shadow-2xl border border-white/20 dark:border-white/10">
                <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white">{taxData.id ? 'Edit Tax Group' : 'New Tax Group'}</h3>
                    <button onClick={() => setIsTaxModalOpen(false)} className="w-8 h-8 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-gray-400 hover:text-black dark:hover:text-white"><X className="w-4 h-4" /></button>
                </div>
                <form onSubmit={handleTaxSubmit} className="p-6 space-y-4">
                    <div><label className={labelClass}>Group Name</label><input required type="text" placeholder="e.g. GST 18%" value={taxData.name} onChange={e => setTaxData({...taxData, name: e.target.value})} className={inputClass} /></div>
                    <div><label className={labelClass}>Description</label><input type="text" placeholder="Optional details" value={taxData.description} onChange={e => setTaxData({...taxData, description: e.target.value})} className={inputClass} /></div>
                    
                    <div className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl">
                         <div className="flex justify-between items-center mb-4">
                             <label className={labelClass}>Tax Components</label>
                             <button type="button" onClick={addTaxComponent} className="text-xs font-bold text-lime-600 dark:text-lime flex items-center gap-1"><Plus className="w-3 h-3" /> Add Component</button>
                         </div>
                         <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                             {taxData.components?.map((comp, idx) => (
                                 <div key={idx} className="flex gap-2 items-center">
                                     <input type="text" placeholder="Name (e.g. SGST)" value={comp.name} onChange={e => updateTaxComponent(idx, 'name', e.target.value)} className={`${inputClass} py-2 h-10`} required />
                                     <div className="relative w-24 flex-shrink-0">
                                        <input type="number" placeholder="%" value={comp.percentage} onChange={e => updateTaxComponent(idx, 'percentage', parseFloat(e.target.value))} className={`${inputClass} py-2 h-10 pr-2`} required />
                                     </div>
                                     <button type="button" onClick={() => removeTaxComponent(idx)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                 </div>
                             ))}
                         </div>
                         <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10 flex justify-between items-center">
                             <span className="text-sm font-bold text-gray-500">Total Tax Rate</span>
                             <span className="text-lg font-black text-gray-900 dark:text-white">{taxData.components?.reduce((sum, c) => sum + (c.percentage || 0), 0)}%</span>
                         </div>
                    </div>
                    <button type="submit" className="w-full btn-black py-4 rounded-2xl font-bold mt-2">Save Tax Group</button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
