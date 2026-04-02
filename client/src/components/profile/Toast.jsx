import React, { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";

export default function Toast({ type, message, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) return;
    // Trigger entrance animation
    const showTimer = setTimeout(() => setVisible(true), 10);
    // Auto-dismiss
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 3700);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [message, onDismiss]);

  if (!message) return null;

  const isSuccess = type === "success";

  return (
    <div
      className={`fixed top-5 left-1/2 z-[200] transition-all duration-300 ease-out ${
        visible
          ? "-translate-x-1/2 translate-y-0 opacity-100 scale-100"
          : "-translate-x-1/2 -translate-y-3 opacity-0 scale-95"
      }`}
    >
      <div
        className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-semibold shadow-2xl backdrop-blur-xl max-w-sm border ${
          isSuccess
            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 shadow-emerald-500/10"
            : "bg-red-500/15 border-red-500/30 text-red-600 shadow-red-500/10"
        }`}
        style={{
          boxShadow: isSuccess
            ? "0 8px 32px rgba(16,185,129,0.15), 0 2px 8px rgba(0,0,0,0.1)"
            : "0 8px 32px rgba(239,68,68,0.15), 0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <span
          className={`w-7 h-7 flex items-center justify-center rounded-full flex-shrink-0 ${
            isSuccess ? "bg-emerald-500/20" : "bg-red-500/20"
          }`}
        >
          {isSuccess ? (
            <CheckCircle size={15} strokeWidth={2.5} />
          ) : (
            <AlertCircle size={15} strokeWidth={2.5} />
          )}
        </span>
        <span className="leading-snug">{message}</span>
        <button
          className={`ml-1 w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 transition-all duration-150 hover:scale-110 ${
            isSuccess ? "hover:bg-emerald-500/20" : "hover:bg-red-500/20"
          }`}
          onClick={() => {
            setVisible(false);
            setTimeout(onDismiss, 300);
          }}
        >
          <X size={13} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
