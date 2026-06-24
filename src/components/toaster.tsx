import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ToastType } from "../enums/toast-type";

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
            className={`rounded-lg px-4 py-2 text-white shadow-lg text-center break-words ${
              onClick ? "cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/70" : ""
            } ${typeStyles[type]}`}
          >
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
