import { useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ToastType } from "../enums/toast-type";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
  onClick?: () => void;
  type?: ToastType;
  duration?: number;
}

export default function Toast({
  message,
  show,
  onClose,
  onClick,
  type = ToastType.INFO,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [show, duration, onClose]);

  const typeStyles: Record<ToastType, string> = {
    [ToastType.SUCCESS]: "border-slate-200 bg-white text-slate-800",
    [ToastType.ERROR]: "border-red-200 bg-white text-red-800",
    [ToastType.WARNING]: "border-amber-200 bg-white text-amber-800",
    [ToastType.INFO]: "border-slate-200 bg-white text-slate-800",
  };

  const icons: Record<ToastType, ReactNode> = {
    [ToastType.SUCCESS]: <CheckCircle2 className="h-4 w-4 text-slate-700" />,
    [ToastType.ERROR]: <XCircle className="h-4 w-4 text-red-600" />,
    [ToastType.WARNING]: <AlertTriangle className="h-4 w-4 text-amber-600" />,
    [ToastType.INFO]: <Info className="h-4 w-4 text-slate-700" />,
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 inset-x-0 mx-auto z-50 w-fit max-w-[92%]"
        >
          <div
            role={onClick ? "button" : "status"}
            tabIndex={onClick ? 0 : undefined}
            onClick={() => {
              onClick?.();
              if (onClick) onClose();
            }}
            onKeyDown={(event) => {
              if (!onClick || (event.key !== "Enter" && event.key !== " ")) return;
              event.preventDefault();
              onClick();
              onClose();
            }}
            className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-left shadow-xl shadow-slate-950/10 break-words ${
              onClick ? "cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400" : ""
            } ${typeStyles[type]}`}
          >
            <span className="mt-0.5 flex-shrink-0">{icons[type]}</span>
            <span className="text-sm font-medium leading-5">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
