
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  History, Divide, Plus, Minus, Equal, Percent, Delete, 
  Copy, RotateCcw, ArrowLeft, Trash2, X, Circle, Share
} from 'lucide-react';

interface Calculation {
  expression: string;
  result: string;
  timestamp: number;
}

const HISTORY_STORAGE_KEY = 'advanced_calculator_history';
const MAX_HISTORY_ITEMS = 100;

const Calculator: React.FC = () => {
  const [expression, setExpression] = useState<string>('');
  const [displayResult, setDisplayResult] = useState<string>('0');
  const [livePreview, setLivePreview] = useState<string>('');
  const [history, setHistory] = useState<Calculation[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [lastActionWasEquals, setLastActionWasEquals] = useState(false);
  const [previousExpression, setPreviousExpression] = useState<string>('');

  const historyRef = useRef<HTMLDivElement>(null);
  const calculatorRef = useRef<HTMLDivElement>(null);

  const numberFormatter = new Intl.NumberFormat(navigator.language, {
    maximumFractionDigits: 8,
    useGrouping: true,
  });

  // --- Initial Load Effect ---
  useEffect(() => {
    loadHistory();
  }, []);

  // Scroll history to bottom
  useEffect(() => {
    if (historyRef.current && isHistoryOpen) {
      historyRef.current.scrollTop = 0;
    }
  }, [isHistoryOpen]);

  // --- History Management ---
  const loadHistory = () => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to load calculator history", e);
      setHistory([]);
    }
  };

  const saveHistory = (newHistory: Calculation[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
    } catch (e) {
      console.error("Failed to save calculator history", e);
    }
  };

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear all history?")) {
      saveHistory([]);
    }
  };

  // --- Calculation Logic ---
  const evaluateExpression = useCallback((expr: string): [string, boolean] => {
    if (!expr.trim()) return ['', false];

    let cleanedExpr = expr.replace(/,/g, '');
    cleanedExpr = cleanedExpr.replace(/(\d+(\.\d*)?|\.\d+)\s*%/g, '($1/100)');
    cleanedExpr = cleanedExpr.replace(/÷/g, '/').replace(/×/g, '*');

    if (/[+\-*/.]$/.test(cleanedExpr) || /\($/.test(cleanedExpr)) {
      return ['...', false];
    }
    if (/[+\-*/.]{2,}/.test(cleanedExpr) || /\(\)/.test(cleanedExpr) || /^\s*[\+\-*/]/.test(cleanedExpr)) {
        return ['Invalid', false];
    }

    const openParenCount = (cleanedExpr.match(/\(/g) || []).length;
    const closeParenCount = (cleanedExpr.match(/\)/g) || []).length;
    if (openParenCount !== closeParenCount) {
        return ['...', false]; // Incomplete paren
    }

    try {
      // eslint-disable-next-line no-eval
      const result = eval(cleanedExpr);
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        return [numberFormatter.format(result), true];
      }
      return ['Error', false];
    } catch (error) {
      return ['Invalid', false];
    }
  }, [numberFormatter]);

  useEffect(() => {
    const [result, isValid] = evaluateExpression(expression);
    setLivePreview(isValid ? result : '');
  }, [expression, evaluateExpression]);

  // --- Input Handlers ---
  const appendToExpression = (value: string) => {
    setExpression(prev => {
        if (lastActionWasEquals) setPreviousExpression(''); // Reset previous view when new input starts
        if (lastActionWasEquals && /^\d$/.test(value)) {
            setLastActionWasEquals(false);
            return value;
        }
        setLastActionWasEquals(false);
        return prev + value;
    });
  };

  const handleNumber = (num: string) => appendToExpression(num);

  const handleDecimal = () => {
    if (lastActionWasEquals) setPreviousExpression('');
    const lastNumMatch = expression.match(/(\d+(\.\d*)?|\.\d+)$/);
    if (lastNumMatch && lastNumMatch[0].includes('.')) return;
    
    if (expression === '' || /[+\-*/\(]$/.test(expression.slice(-1))) {
      appendToExpression('0.');
    } else {
      appendToExpression('.');
    }
  };

  const handleOperator = (op: string) => {
    if (lastActionWasEquals) setPreviousExpression('');
    const lastChar = expression.slice(-1);
    if (['+', '-', '*', '/', '.'].includes(lastChar) && !(op === '-' && ['+', '*', '/'].includes(lastChar))) {
        setExpression(prev => prev.slice(0, -1) + op);
    } else {
        appendToExpression(op);
    }
    setLastActionWasEquals(false);
  };

  const handleEquals = () => {
    const [result, isValid] = evaluateExpression(expression);
    if (isValid && result !== 'Error' && result !== 'Invalid' && result !== '...') {
      const newHistoryItem: Calculation = {
        expression: expression,
        result: result,
        timestamp: Date.now(),
      };
      saveHistory([newHistoryItem, ...history.slice(0, MAX_HISTORY_ITEMS - 1)]);
      
      setPreviousExpression(expression + ' =');
      setDisplayResult(result);
      setExpression(result.replace(/,/g, '')); 
      setLastActionWasEquals(true);
      setLivePreview('');
    }
  };

  const handleClear = () => {
    setExpression('');
    setDisplayResult('0');
    setLivePreview('');
    setPreviousExpression('');
    setLastActionWasEquals(false);
  };

  const handleBackspace = () => {
    if (lastActionWasEquals) setPreviousExpression('');
    setExpression(prev => {
        setLastActionWasEquals(false);
        if (prev === 'Error') return '';
        return prev.slice(0, -1);
    });
  };

  const handlePercent = () => {
    if (lastActionWasEquals) setPreviousExpression('');
    const lastNumMatch = expression.match(/(\d+(\.\d*)?)$/);
    if (lastNumMatch) {
        const num = parseFloat(lastNumMatch[0]);
        const percentValue = num / 100;
        setExpression(prev => prev.slice(0, -lastNumMatch[0].length) + `${percentValue}`);
    } else {
        appendToExpression('%');
    }
  };

  const handleSmartParen = () => {
      if (lastActionWasEquals) setPreviousExpression('');
      const openCount = (expression.match(/\(/g) || []).length;
      const closeCount = (expression.match(/\)/g) || []).length;
      const lastChar = expression.slice(-1);

      if (openCount > closeCount && /[\d\)]/.test(lastChar)) {
          appendToExpression(')');
      } else {
          if (/[\d\)]/.test(lastChar)) {
             handleOperator('*');
             appendToExpression('(');
          } else {
             appendToExpression('(');
          }
      }
  };

  const handleShare = async () => {
      if (calculatorRef.current && (window as any).html2canvas) {
        try {
          const canvas = await (window as any).html2canvas(calculatorRef.current, {
             backgroundColor: null,
             scale: 2
          });
          canvas.toBlob(async (blob: Blob | null) => {
              if (!blob) return;
              const file = new File([blob], "calculator_screenshot.png", { type: "image/png" });
              if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                  await navigator.share({
                      files: [file],
                      title: 'Calculator Result',
                  });
              } else {
                  // Fallback to download
                  const link = document.createElement('a');
                  link.download = "calculator_screenshot.png";
                  link.href = URL.createObjectURL(blob);
                  link.click();
              }
          });
        } catch (e) {
          console.error("Screenshot failed", e);
          alert("Could not share screenshot. Ensure the html2canvas library is loaded.");
        }
      } else {
          alert("Screenshot functionality unavailable.");
      }
  };

  // --- Keyboard Handling ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '')) return;

      const key = e.key;
      if ((key >= '0' && key <= '9')) handleNumber(key);
      else if (key === '.') handleDecimal();
      else if (key === '+') handleOperator('+');
      else if (key === '-') handleOperator('-');
      else if (key === '*') handleOperator('*');
      else if (key === '/') handleOperator('/');
      else if (key === 'Enter' || key === '=') { e.preventDefault(); handleEquals(); }
      else if (key === 'Backspace') handleBackspace();
      else if (key === 'Escape') handleClear();
      else if (key === '%') handlePercent();
      else if (key === '(' || key === ')') appendToExpression(key);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [expression, lastActionWasEquals]);

  // --- Components ---
  const CalcButton: React.FC<{ 
    label: string | React.ReactNode; 
    onClick: () => void; 
    variant?: 'default' | 'operator' | 'primary' | 'danger' | 'feature'; 
    className?: string;
    span?: number;
  }> = ({ label, onClick, variant = 'default', className = '', span = 1 }) => {
    
    // Modern button styles: fixed height for consistency, responsive width via grid
    let baseStyles = "relative h-[65px] sm:h-[72px] rounded-[22px] text-xl sm:text-2xl font-bold transition-all duration-200 active:scale-95 flex items-center justify-center select-none shadow-soft overflow-hidden group";
    let colorStyles = "";

    switch (variant) {
        case 'default':
            colorStyles = "bg-white/80 dark:bg-white/5 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-white/10 border border-white/20 dark:border-white/5";
            break;
        case 'operator':
            colorStyles = "bg-lime/10 dark:bg-lime/10 text-lime-700 dark:text-lime hover:bg-lime/20 border border-lime/20 dark:border-lime/10";
            break;
        case 'danger':
            colorStyles = "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20 border border-red-400/20";
            break;
        case 'feature':
            colorStyles = "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 border border-white/10";
            break;
        case 'primary':
            colorStyles = "bg-lime text-black hover:bg-lime-hover shadow-[0_0_20px_rgba(221,246,118,0.3)] border border-lime/50";
            break;
    }

    return (
      <button
        type="button"
        onClick={(e) => {
            // Ripple effect
            const btn = e.currentTarget;
            const circle = document.createElement("span");
            const diameter = Math.max(btn.clientWidth, btn.clientHeight);
            const radius = diameter / 2;
            circle.style.width = circle.style.height = `${diameter}px`;
            circle.style.left = `${e.clientX - btn.getBoundingClientRect().left - radius}px`;
            circle.style.top = `${e.clientY - btn.getBoundingClientRect().top - radius}px`;
            circle.classList.add("ripple");
            
            const existingRipple = btn.getElementsByClassName("ripple")[0];
            if (existingRipple) existingRipple.remove();
            
            btn.appendChild(circle);
            onClick();
        }}
        className={`${baseStyles} ${colorStyles} ${className}`}
        style={{ gridColumn: `span ${span}` }}
      >
        <span className="relative z-10">{label}</span>
      </button>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] sm:h-[calc(100vh-140px)] animate-fadeIn pb-4">
      <style>{`
        .ripple {
          position: absolute;
          border-radius: 50%;
          transform: scale(0);
          animation: ripple 0.6s linear;
          background-color: rgba(255, 255, 255, 0.3);
          pointer-events: none;
        }
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0 px-2">
        <div>
            <div className="flex items-center gap-2">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Calculator</h2>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-lime"></span>
                </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-1 opacity-80">V2.0 • Precision Math</p>
        </div>
        
        <div className="flex gap-2">
            <button
                onClick={handleShare}
                className="px-4 py-2 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-full text-sm font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95"
            >
                <Share className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
            </button>
            
            <button
                onClick={() => setIsHistoryOpen(true)}
                className="group px-4 py-2 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-full text-sm font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95"
            >
                <History className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                <span className="hidden sm:inline">History</span>
            </button>
        </div>
      </div>

      <div className="flex-1 flex justify-center items-start min-h-0 w-full">
        <div className="w-full max-w-[420px] h-full flex flex-col relative z-10">
            
            {/* Main Calculator Glass Container */}
            <div ref={calculatorRef} className="flex-1 bg-white/40 dark:bg-[#121212]/60 backdrop-blur-3xl rounded-[36px] shadow-2xl border border-white/40 dark:border-white/5 flex flex-col p-5 sm:p-6 relative overflow-hidden">
                
                {/* Display Screen */}
                <div 
                    className="flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#1A1A1A] dark:to-black rounded-[28px] p-6 text-right relative overflow-hidden border border-gray-200 dark:border-white/5 shadow-inner mb-6 min-h-[160px] flex flex-col justify-end group transition-all"
                    onClick={() => navigator.clipboard.writeText(livePreview || expression || '0')}
                >
                    {/* Decorative Blob */}
                    <div className="absolute top-[-50%] right-[-20%] w-48 h-48 bg-lime/20 rounded-full blur-[60px] pointer-events-none"></div>

                    {/* Top Status / Live Preview (Large) */}
                    <div className="flex justify-end items-end h-8 mb-2 relative z-10 min-h-[36px]">
                         {/* Show Previous Expression (Result context) OR Live Calculation Preview */}
                         {lastActionWasEquals && previousExpression ? (
                             <span className="text-gray-500 dark:text-gray-400 text-lg sm:text-xl font-medium">
                                {previousExpression}
                             </span>
                         ) : (
                             livePreview && livePreview.replace(/,/g, '') !== expression && (
                                 <span className="text-lime-600 dark:text-lime text-xl sm:text-2xl font-bold animate-pulse">
                                    {livePreview}
                                 </span>
                            )
                         )}
                    </div>

                    {/* Main Input/Result (Large) */}
                    <div className="relative z-10">
                        <div className={`font-mono font-black text-gray-900 dark:text-white break-all transition-all duration-300 leading-none ${
                            (expression || '0').length > 12 ? 'text-4xl' : (expression || '0').length > 9 ? 'text-5xl' : 'text-5xl sm:text-6xl'
                        }`}>
                            {expression || '0'}
                        </div>
                    </div>

                    {/* Integrated Backspace in Display */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleBackspace(); }}
                        className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 active:scale-90"
                    >
                        <Delete className="w-5 h-5" />
                    </button>
                    
                    <div className="absolute top-4 left-4 text-[10px] font-bold text-gray-400 opacity-50 select-none">DISPLAY</div>
                </div>

                {/* Keypad Grid */}
                <div className="flex-1 grid grid-cols-4 gap-3 sm:gap-4 min-h-0 content-end">
                    
                    {/* Row 1 */}
                    <CalcButton label="AC" onClick={handleClear} variant="danger" />
                    <CalcButton label="( )" onClick={handleSmartParen} variant="feature" />
                    <CalcButton label="%" onClick={handlePercent} variant="feature" />
                    <CalcButton label={<Divide className="w-6 h-6" />} onClick={() => handleOperator('/')} variant="operator" />

                    {/* Row 2 */}
                    <CalcButton label="7" onClick={() => handleNumber('7')} />
                    <CalcButton label="8" onClick={() => handleNumber('8')} />
                    <CalcButton label="9" onClick={() => handleNumber('9')} />
                    <CalcButton label={<X className="w-6 h-6" />} onClick={() => handleOperator('*')} variant="operator" />

                    {/* Row 3 */}
                    <CalcButton label="4" onClick={() => handleNumber('4')} />
                    <CalcButton label="5" onClick={() => handleNumber('5')} />
                    <CalcButton label="6" onClick={() => handleNumber('6')} />
                    <CalcButton label={<Minus className="w-6 h-6" />} onClick={() => handleOperator('-')} variant="operator" />

                    {/* Row 4 */}
                    <CalcButton label="1" onClick={() => handleNumber('1')} />
                    <CalcButton label="2" onClick={() => handleNumber('2')} />
                    <CalcButton label="3" onClick={() => handleNumber('3')} />
                    <CalcButton label={<Plus className="w-6 h-6" />} onClick={() => handleOperator('+')} variant="operator" />

                    {/* Row 5 */}
                    <CalcButton label="0" onClick={() => handleNumber('0')} />
                    <CalcButton label="." onClick={handleDecimal} />
                    <CalcButton label={<Equal className="w-8 h-8" />} onClick={handleEquals} variant="primary" span={2} className="w-full" />
                </div>
            </div>
        </div>
      </div>

      {/* History Slide-Over */}
      {isHistoryOpen && (
        <>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" onClick={() => setIsHistoryOpen(false)}></div>
            <div className="fixed right-0 top-0 bottom-0 w-full max-w-xs sm:max-w-sm bg-white dark:bg-[#18181a] z-[70] shadow-2xl p-6 flex flex-col transform transition-transform duration-300 ease-out border-l border-white/20 dark:border-white/5">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <History className="w-5 h-5 text-lime-600 dark:text-lime" /> History
                    </h3>
                    <div className="flex gap-2">
                        {history.length > 0 && (
                            <button onClick={clearHistory} className="p-2 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                        <button onClick={() => setIsHistoryOpen(false)} className="p-2 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 hover:text-black dark:hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div ref={historyRef} className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                    {history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <History className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-sm font-medium">No calculations yet</p>
                        </div>
                    ) : (
                        history.map((item, idx) => (
                            <div key={idx} className="group p-4 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-transparent hover:border-lime/20 transition-all cursor-pointer relative overflow-hidden"
                                onClick={() => { setExpression(item.expression); setDisplayResult(item.result); setIsHistoryOpen(false); }}
                            >
                                <div className="text-xs text-gray-400 mb-1 font-mono break-all opacity-70">{item.expression} =</div>
                                <div className="text-lg font-bold text-gray-900 dark:text-white break-all">{item.result}</div>
                                
                                <button 
                                    onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(item.result); }} 
                                    className="absolute top-1/2 -translate-y-1/2 right-4 p-2 rounded-lg bg-white dark:bg-black/40 text-gray-400 hover:text-lime-600 dark:hover:text-lime shadow-sm opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
      )}
    </div>
  );
};

export default Calculator;
