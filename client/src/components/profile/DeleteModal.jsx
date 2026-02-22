import React from "react";
import { AlertTriangle, X } from "lucide-react";

export default function DeleteModal({ isDark, deleteConfirmText, setDeleteConfirmText, loading, onConfirm, onCancel }) {
  return (
    <div className="modal-backdrop">
      <div className={`modal ${isDark ? "modal--dark" : "modal--light"}`}>
        <button className="modal__close" onClick={onCancel}>
          <X size={18} />
        </button>

        <div className="modal__icon-wrap">
          <AlertTriangle size={28} className="text-red-500" />
        </div>

        <h3 className={`modal__title ${isDark ? "text-white" : "text-gray-900"}`}>Delete your account?</h3>
        <p className={`modal__desc ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          This is permanent. All your data will be gone forever. Type{" "}
          <strong className="text-red-500">DELETE</strong> below to confirm.
        </p>

        <input
          type="text"
          value={deleteConfirmText}
          onChange={(e) => setDeleteConfirmText(e.target.value)}
          placeholder="Type DELETE"
          className={`form-input modal__input ${isDark ? "form-input--dark" : "form-input--light"}`}
        />

        <div className="modal__actions">
          <button onClick={onCancel} className={`btn-ghost ${isDark ? "btn-ghost--dark" : "btn-ghost--light"}`}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading || deleteConfirmText !== "DELETE"}
            className="btn-danger"
          >
            {loading ? "Deleting…" : "Delete Account"}
          </button>
        </div>
      </div>
    </div>
  );
}