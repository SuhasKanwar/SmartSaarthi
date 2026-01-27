import { Toast, ToastType } from "@/providers/ToastProvider";
import { AlertCircle, CheckCircle, Info, X, XCircle } from "lucide-react";
import { motion } from "framer-motion";

const ToastIcon = ({ type }: { type: ToastType }) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'error':
      return <XCircle className="w-5 h-5 text-red-600" />;
    case 'warning':
      return <AlertCircle className="w-5 h-5 text-orange-600" />;
    case 'info':
      return <Info className="w-5 h-5 text-blue-600" />;
  }
};

const ToastComponent = ({ toast, onClose }: { toast: Toast; onClose: () => void }) => {
  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-orange-50 border-orange-200 text-orange-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const closeButtonStyles = {
    success: 'text-green-600 hover:text-green-800',
    error: 'text-red-600 hover:text-red-800',
    warning: 'text-orange-600 hover:text-orange-800',
    info: 'text-blue-600 hover:text-blue-800',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
      className={`
        flex items-start gap-3 p-4 rounded-xl border shadow-lg
        ${typeStyles[toast.type]}
        max-w-md w-full
      `}
    >
      <ToastIcon type={toast.type} />
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm">{toast.title}</h4>
        {toast.message && (
          <p className="text-sm opacity-80 mt-1">{toast.message}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className={`${closeButtonStyles[toast.type]} transition-colors p-1`}
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export default ToastComponent;