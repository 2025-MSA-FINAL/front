import { useState, useCallback, useEffect } from "react";
import AdminToast from "./AdminToast.jsx";
import { AdminToastContext } from "./AdminToastContext.js";

const TOAST_DURATION = 3000;

export function AdminToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => {
                setToast(null); 
            }, TOAST_DURATION);
            return () => clearTimeout(timer);
        }
    }, [toast]);

  const showToast = useCallback((message, type = "info") => {
    setToast({ id: Date.now(), message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <AdminToastContext.Provider value={{ showToast }}>
      {children}

      {/* 글로벌 토스트 렌더링 (최상단 오버레이) */}
      {toast && (
        <AdminToast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </AdminToastContext.Provider>
  );
}


