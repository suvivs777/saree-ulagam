import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  X,
  ExternalLink,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  CreditCard,
  RotateCcw
} from 'lucide-react';

export interface WalletToastNotification {
  id: string;
  reqId: string;
  type: 'approved' | 'rejected';
  amount: number;
  upiId: string;
  adminRemarks?: string;
  timestamp: string;
  autoCloseTime?: number;
}

interface WalletToastContainerProps {
  toasts: WalletToastNotification[];
  onDismiss: (id: string) => void;
  onViewRequest?: (reqId: string) => void;
}

export const WalletToastContainer: React.FC<WalletToastContainerProps> = ({
  toasts,
  onDismiss,
  onViewRequest,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm sm:max-w-md w-[calc(100vw-2.5rem)] pointer-events-none">
      {toasts.map((toast) => (
        <SingleWalletToast
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
          onViewRequest={onViewRequest}
        />
      ))}
    </div>
  );
};

const SingleWalletToast: React.FC<{
  toast: WalletToastNotification;
  onDismiss: (id: string) => void;
  onViewRequest?: (reqId: string) => void;
}> = ({ toast, onDismiss, onViewRequest }) => {
  const duration = toast.autoCloseTime || 8000;
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (elapsed >= duration) {
        clearInterval(interval);
        onDismiss(toast.id);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [toast.id, duration, onDismiss]);

  const isApproved = toast.type === 'approved';

  return (
    <div
      className={`pointer-events-auto relative overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 animate-slide-in-right ${
        isApproved
          ? 'bg-slate-900/95 border-emerald-500/50 shadow-emerald-950/50'
          : 'bg-slate-900/95 border-rose-500/50 shadow-rose-950/50'
      }`}
      role="alert"
    >
      {/* Top Banner Accent */}
      <div
        className={`h-1.5 w-full ${
          isApproved
            ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400'
            : 'bg-gradient-to-r from-rose-600 via-red-500 to-amber-500'
        }`}
      />

      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3.5">
          {/* Icon */}
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
              isApproved
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-emerald-500/20'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-rose-500/20'
            }`}
          >
            {isApproved ? (
              <CheckCircle2 className="w-5 h-5 animate-bounce-short" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  isApproved
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                }`}
              >
                {isApproved ? 'Admin Approved' : 'Admin Rejected'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {toast.timestamp}
              </span>
            </div>

            <h4 className="text-sm sm:text-base font-black text-white mt-1 leading-snug">
              {isApproved ? (
                <>Withdrawal of ₹{toast.amount.toLocaleString('en-IN')} Approved! 🎉</>
              ) : (
                <>Withdrawal of ₹{toast.amount.toLocaleString('en-IN')} Rejected</>
              )}
            </h4>

            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {isApproved ? (
                <>
                  Funds transferred successfully to UPI{' '}
                  <span className="font-mono text-amber-300 font-bold">{toast.upiId}</span>.
                </>
              ) : (
                <>
                  Request was declined. ₹{toast.amount.toLocaleString('en-IN')} has been{' '}
                  <span className="text-emerald-400 font-bold">refunded back</span> to your wallet balance.
                </>
              )}
            </p>

            {toast.adminRemarks && (
              <div className="mt-2 text-[11px] p-2 bg-slate-950/80 rounded-xl border border-slate-800 text-slate-300 flex items-start gap-1.5 font-mono">
                <span className="text-slate-500 shrink-0 font-sans font-semibold">Note:</span>
                <span className="truncate">{toast.adminRemarks}</span>
              </div>
            )}

            {/* Actions */}
            <div className="mt-3 flex items-center gap-2.5">
              {onViewRequest && (
                <button
                  onClick={() => onViewRequest(toast.reqId)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                    isApproved
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/40'
                      : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-900/40'
                  }`}
                >
                  <span>View in History</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
              <button
                onClick={() => onDismiss(toast.id)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1.5 transition font-semibold"
              >
                Dismiss
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition -mr-1 -mt-1"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar Timer */}
      <div className="w-full bg-slate-800/80 h-1">
        <div
          className={`h-full transition-all duration-100 ease-linear ${
            isApproved ? 'bg-emerald-400' : 'bg-rose-400'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
