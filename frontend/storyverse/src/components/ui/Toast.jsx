import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, Sparkles, X } from 'lucide-react';

const Toast = ({ id, message, type, removeToast }) => {
  let icon = <Info size={18} className="text-purple-400" />;
  let border = "border-purple-500/20";
  let bg = "from-purple-900/40 to-[#1a0b2e]/90";
  
  if (type === "success") {
    icon = <CheckCircle2 size={18} className="text-emerald-400" />;
    border = "border-emerald-500/20";
    bg = "from-emerald-900/40 to-[#1a0b2e]/90";
  } else if (type === "error") {
    icon = <AlertCircle size={18} className="text-rose-400" />;
    border = "border-rose-500/20";
    bg = "from-rose-900/40 to-[#1a0b2e]/90";
  } else if (type === "magic") {
    icon = <Sparkles size={18} className="text-amber-400" />;
    border = "border-amber-500/40";
    bg = "from-amber-900/40 to-purple-900/50";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`flex items-center gap-3 px-5 py-3.5 mb-3 min-w-[300px] rounded-2xl shadow-2xl backdrop-blur-xl border ${border} bg-gradient-to-r ${bg}`}
    >
      {icon}
      <span className="text-sm font-medium text-slate-100 flex-1">{message}</span>
      <button 
        onClick={() => removeToast(id)}
        className="text-slate-400 hover:text-white transition-colors"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useAppStore();

  return (
    <div className="fixed bottom-20 md:bottom-10 right-4 md:right-10 z-[9999] flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              id={toast.id}
              message={toast.message}
              type={toast.type}
              removeToast={removeToast}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};
