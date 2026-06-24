// ToastProvider.tsx
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import Toast from "../components/toaster";
import { ToastType } from "../enums/toast-type";

interface ToastOptions {
  duration?: number;
  onClick?: () => void;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>(ToastType.INFO);
  const [toastOptions, setToastOptions] = useState<ToastOptions>({});
  const [show, setShow] = useState(false);

  const showToast = (message: string, type: ToastType = ToastType.INFO, options: ToastOptions = {}) => {
    setToastMessage(message);
    setToastType(type);
    setToastOptions(options);
    setShow(true);
  };

  const closeToast = () => {
    setShow(false);
    setToastOptions({});
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast
        message={toastMessage}
        show={show}
        onClose={closeToast}
        onClick={toastOptions.onClick}
        type={toastType}
        duration={toastOptions.duration}
      />
    </ToastContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
