
import React from 'react';
import { ClipboardCheck } from 'lucide-react';

const Audit: React.FC = () => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Audit</h2>
            <span className="w-2.5 h-2.5 rounded-full bg-lime"></span>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Review and verify business records.</p>
      </div>

      {/* Placeholder Content */}
      <div className="bento-card bg-white dark:bg-[#1C1C1E] p-12 rounded-[32px] border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center min-h-[500px] shadow-soft">
         <div className="w-24 h-24 rounded-3xl bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-6 animate-float shadow-inner">
            <ClipboardCheck className="w-10 h-10 text-gray-400 dark:text-gray-500" />
         </div>
         <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Audit Workspace</h3>
         <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
            This module is initialized and ready. <br/>
            Please provide the data structure or specific audit logs you wish to display here.
         </p>
      </div>
    </div>
  );
};

export default Audit;
