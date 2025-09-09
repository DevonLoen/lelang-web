import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ✅ Enum untuk type toast
export enum ToastType {
  SUCCESS = "success",
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
}

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
  type?: ToastType;
  duration?: number; // ms
}

export default function Toast({
  message,
  show,
  onClose,
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
    [ToastType.SUCCESS]: "bg-green-600",
    [ToastType.ERROR]: "bg-red-600",
    [ToastType.WARNING]: "bg-yellow-600 text-black",
    [ToastType.INFO]: "bg-blue-600",
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 inset-x-0 mx-auto z-50 w-fit max-w-[90%]"
        >
          <div
            className={`rounded-lg px-4 py-2 text-white shadow-lg text-center break-words ${typeStyles[type]}`}
          >
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
