import { Toast, ToastType } from "@/providers/ToastProvider";
import { AlertCircle, CheckCircle, Info, X, XCircle } from "lucide-react";
import { motion } from "framer-motion";

const ToastIcon = ({ type }: { type: ToastType }) => {
  const iconProps = { className: 'w-5 h-5' };
  
  switch (type) {
    case 'success':
      return <CheckCircle {...iconProps} className="w-5 h-5 text-green-500" />;
    case 'error':
      return <XCircle {...iconProps} className="w-5 h-5 text-red-500" />;
    case 'warning':
      return <AlertCircle {...iconProps} className="w-5 h-5 text-orange-500" />;
    case 'info':
      return <Info {...iconProps} className="w-5 h-5 text-blue-500" />;
  }
};

const ToastComponent = ({ toast, onClose }: { toast: Toast; onClose: () => void }) => {
  const typeStyles = {
    success: 'bg-green-500/10 border-green-500/20 text-green-100',
    error: 'bg-red-500/10 border-red-500/20 text-red-100',
    warning: 'bg-orange-500/10 border-orange-500/20 text-orange-100',
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-100',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
      className={`
        flex items-start gap-3 p-4 rounded-xl backdrop-blur-xl border shadow-lg
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
        className="text-white/60 hover:text-white transition-colors p-1"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export default ToastComponent;