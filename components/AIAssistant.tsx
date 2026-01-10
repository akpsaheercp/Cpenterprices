import React, { useState } from 'react';
import { BusinessData } from '../types';
import { analyzeBusinessHealth } from '../services/geminiService';
import { Sparkles, RefreshCcw, Bot } from 'lucide-react';

interface AIAssistantProps {
  data: BusinessData;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ data }) => {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const getInsights = async () => {
    setLoading(true);
    const result = await analyzeBusinessHealth(data);
    setInsight(result);
    setLoading(false);
    setHasLoaded(true);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center gap-2 mb-1">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">AI Analyst</h2>
          <span className="w-2.5 h-2.5 rounded-full bg-lime"></span>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Hero Card Style */}
        <div className="lg:col-span-3 bento-card bg-[#EBE9E4] dark:bg-dark-surface p-8 relative overflow-hidden min-h-[280px] flex flex-col justify-center items-start shadow-soft">
            {/* Blurred Blobs */}
            <div className="absolute top-1/2 left-[10%] -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-lime/30 rounded-full blur-[80px] mix-blend-multiply dark:mix-blend-screen animate-float"></div>
            <div className="absolute bottom-[-20%] right-[10%] w-72 h-72 bg-blue-300/30 rounded-full blur-[90px] mix-blend-multiply dark:mix-blend-screen animate-float" style={{animationDelay: '2s'}}></div>

            <div className="relative z-10 max-w-2xl">
                <div className="w-14 h-14 bg-black dark:bg-white rounded-2xl flex items-center justify-center mb-6 shadow-lg rotate-3">
                    <Bot className="w-7 h-7 text-white dark:text-black" />
                </div>
                <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">
                    Unlock Business Insights <br/> with Gemini AI
                </h3>
                <p className="text-gray-600 dark:text-gray-300 font-medium text-lg mb-8 max-w-lg">
                    Instantly analyze your inventory, sales, and customer trends to find hidden opportunities.
                </p>
                <button
                    onClick={getInsights}
                    disabled={loading}
                    className="btn-black px-8 py-4 rounded-full font-bold text-sm shadow-xl hover:shadow-2xl hover:-translate-y-1 transform transition-all flex items-center gap-2"
                >
                    {loading ? (
                    <RefreshCcw className="w-5 h-5 animate-spin" />
                    ) : (
                    <Sparkles className="w-5 h-5 text-lime" />
                    )}
                    {loading ? "Analyzing Data..." : "Generate Analysis"}
                </button>
            </div>
        </div>

        {/* Results Area */}
        {hasLoaded && (
            <div className="lg:col-span-3 bento-card bg-light-surface/70 dark:bg-dark-surface/70 p-8 border border-gray-100 dark:border-white/5 relative">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-full bg-lime/20 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-lime-700 dark:text-lime" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Executive Summary</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {insight.split('\n').filter(line => line.trim().length > 0).map((line, i) => {
                        const isBullet = line.trim().startsWith('-') || line.trim().startsWith('*');
                        const cleanLine = line.replace(/^[-*]\s*/, '');
                        
                        if (isBullet) {
                            return (
                                <div key={i} className="bento-card bg-gray-50 dark:bg-white/5 p-6 border border-gray-100 dark:border-white/5 hover:border-lime/30 dark:hover:border-lime/30 transition-colors group">
                                    <div className="w-8 h-8 rounded-full bg-white dark:bg-white/10 flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                                        <span className="font-bold text-lime-600 dark:text-lime text-xs">{i+1}</span>
                                    </div>
                                    <p className="text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
                                        {cleanLine}
                                    </p>
                                </div>
                            );
                        }
                        return <p key={i} className="col-span-full text-gray-500 text-sm font-medium uppercase tracking-wider mt-2">{cleanLine}</p>;
                    })}
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 text-center">
                    <p className="text-xs font-bold text-gray-400">Generated by Google Gemini • Based on current snapshot</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;