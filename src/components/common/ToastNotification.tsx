import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Info, AlertCircle, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const ToastNotification: React.FC = () => {
  const { toasts, dismissToast } = useStore();

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-5 right-5 z-[70] flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2.5rem)] sm:w-auto pointer-events-none"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto flex items-start gap-3 bg-white border border-[#E7C7CC] shadow-warm rounded-xl px-4 py-3 text-[#3E2F27]"
          >
            <span
              className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                toast.type === 'error'
                  ? 'bg-[#6D1836]/15 text-[#6D1836]'
                  : toast.type === 'info'
                    ? 'bg-[#F8EFEA] text-[#7A655C]'
                    : 'bg-[#C9A66B]/20 text-[#8C6B3F]'
              }`}
            >
              {toast.type === 'error' ? (
                <AlertCircle className="w-3.5 h-3.5" />
              ) : toast.type === 'info' ? (
                <Info className="w-3.5 h-3.5" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[#3E2F27] leading-snug">{toast.title}</p>
              {toast.subtitle && (
                <p className="text-xs text-[#7A655C] mt-0.5 truncate">{toast.subtitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="text-[#7A655C] hover:text-[#3E2F27] p-1 -mr-1 rounded-md transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
