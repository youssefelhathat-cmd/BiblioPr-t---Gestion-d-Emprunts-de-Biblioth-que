import React from 'react';
import { useLibrary } from '../context/LibraryContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toasts: React.FC = () => {
  const { toasts, removeToast } = useLibrary();

  if (toasts.length === 0) return null;

  return (
    <aside aria-label="Notifications" className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg border shadow-lg transition-all duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-950 text-emerald-50 border-emerald-800'
              : toast.type === 'error'
              ? 'bg-rose-950 text-rose-50 border-rose-800'
              : 'bg-slate-900 text-slate-100 border-slate-700'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />}

          <p className="text-sm font-medium leading-snug flex-1">{toast.message}</p>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-white transition-colors p-0.5 rounded"
            aria-label="Fermer la notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </aside>
  );
};
