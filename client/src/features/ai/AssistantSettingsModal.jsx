import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { useAI } from "../../context/AIContext";
import {
  Alert,
  AlertDescription,
  Button,
  InputField,
  Modal,
  SegmentedControl,
  SelectField,
  TextareaField,
} from "../../components/ui";
import { cn } from "../../lib/utils";
import { LANGUAGES } from "../../lib/languages";
import { toast } from "../../lib/toast";
import {
  AVATAR_PRESETS,
  INSTRUCTION_EXAMPLES,
  LENGTH_OPTIONS,
  TONE_OPTIONS,
} from "./assistantOptions";

const LANGUAGE_OPTIONS = [{ value: "auto", label: "Match my language" }, ...LANGUAGES];

// Mount only while open, so the form starts from the saved settings each time
export default function AssistantSettingsModal({ onClose }) {
  const { assistant, updateAssistant } = useAI();
  const [form, setForm] = useState(() => ({
    name: assistant?.name ?? "ChatBot",
    avatar: assistant?.avatar ?? "🤖",
    tone: assistant?.tone ?? "friendly",
    length: assistant?.length ?? "medium",
    language: assistant?.language ?? "auto",
    instructions: assistant?.instructions ?? "",
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (key) => (value) =>
    setForm((f) => ({ ...f, [key]: value?.target ? value.target.value : value }));

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Give your assistant a name");
    setSaving(true);
    setError("");
    try {
      await updateAssistant({ ...form, name: form.name.trim(), avatar: form.avatar.trim() || "🤖" });
      toast({ title: `${form.name.trim()} is updated`, description: "Changes apply to your next message." });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't save your assistant");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Customize your assistant"
      description="Make it yours — only you can see and use it."
      size="lg"
    >
      <form onSubmit={save} className="space-y-5">
        {/* Live preview */}
        <div className="relative flex items-center gap-3 border border-border bg-muted/60 p-3">
          <span className="eyebrow absolute top-2 right-3 text-faint">Preview</span>
          <span className="flex size-12 items-center justify-center border border-primary/40 bg-primary/10 text-2xl shadow-[0_0_14px_var(--glow)]">
            {form.avatar || "🤖"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-extrabold tracking-[0.1em] uppercase">{form.name || "Your assistant"}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {TONE_OPTIONS.find((t) => t.value === form.tone)?.label} ·{" "}
              {LENGTH_OPTIONS.find((l) => l.value === form.length)?.label} answers ·{" "}
              {form.language === "auto" ? "your language" : form.language}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
          <InputField
            label="Name"
            value={form.name}
            onChange={set("name")}
            maxLength={30}
            placeholder="e.g. Nova"
            data-autofocus
            required
          />
          <InputField
            label="Avatar"
            value={form.avatar}
            onChange={set("avatar")}
            maxLength={16}
            className="w-24 text-center text-lg"
            aria-describedby="avatar-presets"
          />
        </div>
        <div id="avatar-presets" className="-mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Avatar suggestions">
          {AVATAR_PRESETS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => set("avatar")(emoji)}
              aria-pressed={form.avatar === emoji}
              className={cn(
                "flex size-9 items-center justify-center border text-lg transition-colors",
                form.avatar === emoji ? "border-primary bg-primary/10" : "border-border hover:bg-accent",
              )}
            >
              {emoji}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <p className="eyebrow text-muted-foreground">Tone</p>
          <div className="overflow-x-auto scrollbar-none">
            <SegmentedControl label="Tone" options={TONE_OPTIONS} value={form.tone} onChange={set("tone")} size="sm" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="eyebrow text-muted-foreground">Answer length</p>
            <SegmentedControl label="Answer length" options={LENGTH_OPTIONS} value={form.length} onChange={set("length")} size="sm" />
          </div>
          <SelectField label="Reply language" options={LANGUAGE_OPTIONS} value={form.language} onValueChange={set("language")} />
        </div>

        <div className="space-y-2">
          <TextareaField
            label="Custom instructions"
            placeholder="How should your assistant behave? What should it know about you?"
            value={form.instructions}
            onChange={set("instructions")}
            maxLength={1500}
            rows={4}
            hint={`${form.instructions.length} / 1,500`}
          />
          <div className="flex flex-wrap gap-1.5">
            {INSTRUCTION_EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() =>
                  set("instructions")(
                    form.instructions ? `${form.instructions.trimEnd()}\n${example}` : example,
                  )
                }
                className="border border-dashed border-border-strong px-2 py-1 text-[11px] text-muted-foreground hover:border-primary/60 hover:text-primary"
              >
                + {example}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle aria-hidden="true" />
            <AlertDescription className="text-current">{error}</AlertDescription>
          </Alert>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            Save assistant
          </Button>
        </div>
      </form>
    </Modal>
  );
}
