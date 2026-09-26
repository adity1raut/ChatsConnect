import { Suspense, createContext, lazy, useContext, useMemo, useState } from "react";
import { Modal, Spinner } from "../components/ui";

// Loaded on first open: the panel pulls in forms, Select and the encryption dialogs
const SettingsPanel = lazy(() => import("../features/settings/SettingsPanel"));

const SettingsModalContext = createContext(null);

// Owns the single Settings modal; any page can open it with useSettingsModal()
export function SettingsModalProvider({ children }) {
  const [open, setOpen] = useState(false);
  const controls = useMemo(
    () => ({
      openSettings: () => setOpen(true),
      closeSettings: () => setOpen(false),
    }),
    [],
  );

  return (
    <SettingsModalContext.Provider value={controls}>
      {children}
      <Modal
        open={open}
        onClose={controls.closeSettings}
        title="Settings"
        description="Appearance, AI and account security"
        size="lg"
      >
        {open && (
          <Suspense
            fallback={
              <div className="flex justify-center py-12">
                <Spinner label="Loading settings" />
              </div>
            }
          >
            <SettingsPanel onNavigate={controls.closeSettings} />
          </Suspense>
        )}
      </Modal>
    </SettingsModalContext.Provider>
  );
}

export function useSettingsModal() {
  const ctx = useContext(SettingsModalContext);
  if (!ctx) {
    throw new Error("useSettingsModal must be used within SettingsModalProvider");
  }
  return ctx;
}
