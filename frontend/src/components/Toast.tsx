// ========================================
// Toast — Minimal toast notification system
// ========================================

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'warning' | 'info' | 'error';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const icons: Record<ToastType, ReactNode> = {
    success: <CheckCircle size={16} className="text-[var(--color-healthy)]" />,
    warning: <AlertTriangle size={16} className="text-[var(--color-watch)]" />,
    error: <AlertTriangle size={16} className="text-[var(--color-critical)]" />,
    info: <Info size={16} className="text-[var(--color-accent)]" />,
  };

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map(t => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                'pointer-events-auto flex items-center gap-3 rounded-lg border px-4 py-3 shadow-sm',
                'bg-[var(--surface)] border-[var(--border)] text-[var(--text-primary)]'
              )}
              style={{ minWidth: 280, maxWidth: 420 }}
            >
              {icons[t.type]}
              <span className="text-[14px] flex-1">{t.message}</span>
              <button
                onClick={() => removeToast(t.id)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
