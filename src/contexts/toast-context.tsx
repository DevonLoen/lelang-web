// ToastProvider.tsx
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import Toast, { ToastType } from "../components/toaster";

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>(ToastType.INFO);
  const [show, setShow] = useState(false);

  const showToast = (message: string, type: ToastType = ToastType.INFO) => {
    setToastMessage(message);
    setToastType(type);
    setShow(true);
  };

  const closeToast = () => setShow(false);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast
        message={toastMessage}
        show={show}
        onClose={closeToast}
        type={toastType}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
