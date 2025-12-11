import { useContext } from "react";
import { AdminToastContext } from "@/components/admin/ui/AdminToastContext.js";

export default function useAdminToast() {
  const context = useContext(AdminToastContext);
    if (!context) {
        throw new Error("useAdminToast must be used inside AdminToastProvider");
    }
    return context;
}
