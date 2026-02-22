import React, { useEffect } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";

export default function Toast({ type, message, onDismiss }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [message, onDismiss]);

  if (!message) return null;

  const isSuccess = type === "success";
  return (
    <div className={`toast ${isSuccess ? "toast--success" : "toast--error"}`}>
      {isSuccess ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      <span>{message}</span>
      <button className="toast__close" onClick={onDismiss}>
        <X size={14} />
      </button>
    </div>
  );
}