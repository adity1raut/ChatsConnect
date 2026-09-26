import { createContext, useContext, useMemo, useState } from "react";
import { Modal } from "../components/ui";
import SettingsPanel from "../features/settings/SettingsPanel";

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
        <SettingsPanel onNavigate={controls.closeSettings} />
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
