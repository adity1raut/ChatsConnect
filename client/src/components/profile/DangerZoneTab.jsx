import React from "react";
import { Trash2, AlertTriangle } from "lucide-react";

export default function DangerZoneTab({ isDark, onDeleteClick }) {
  return (
    <div className="tab-panel">
      <div className="tab-panel__header">
        <h3 className="tab-panel__title tab-panel__title--danger">Danger Zone</h3>
        <p className={`tab-panel__subtitle ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          Irreversible actions — proceed with caution
        </p>
      </div>

      <div className={`danger-card ${isDark ? "danger-card--dark" : "danger-card--light"}`}>
        <div className="danger-card__icon-wrap">
          <AlertTriangle size={22} className="text-red-500" />
        </div>
        <div className="danger-card__content">
          <h4 className={`danger-card__title ${isDark ? "text-white" : "text-gray-900"}`}>Delete Account</h4>
          <p className={`danger-card__desc ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            All messages, settings, and personal data will be permanently erased. This cannot be undone.
          </p>
          <button onClick={onDeleteClick} className="btn-danger">
            <Trash2 size={15} />
            Delete My Account
          </button>
        </div>
      </div>
    </div>
  );
}