import { useState } from "react";
import { AlertCircle, Link2, MapPin, Smile } from "lucide-react";
import axios from "../../config/axiosInstance.js";
import { API_URL } from "../../config/api.js";
import { useAuth } from "../../context/AuthContext";
import { Alert, AlertDescription, Button, Card, InputField, Switch, TextareaField } from "../../components/ui";
import { toast } from "../../lib/toast";

const LIMITS = { name: 50, bio: 300, statusMessage: 100, location: 60, website: 200 };

export default function EditProfileForm() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState(() => ({
    name: user?.name ?? "",
    bio: user?.bio ?? "",
    statusMessage: user?.statusMessage ?? "",
    location: user?.location ?? "",
    website: user?.website ?? "",
    showActivity: user?.privacy?.showActivity !== false,
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e?.target ? e.target.value : e }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.name.trim().length < 2) {
      setError({ field: "name", text: "Name must be at least 2 characters" });
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const { data } = await axios.put(`${API_URL}/profile/update`, {
        name: form.name,
        bio: form.bio,
        statusMessage: form.statusMessage,
        location: form.location,
        website: form.website,
        privacy: { showActivity: form.showActivity },
      });
      updateUser(data.user);
      setForm((f) => ({ ...f, website: data.user.website ?? f.website }));
      toast({ title: "Profile saved" });
    } catch (err) {
      const text = err.response?.data?.message || "Couldn't save your profile";
      setError({ field: /website/i.test(text) ? "website" : null, text });
    } finally {
      setSaving(false);
    }
  };

  const count = (key) => `${form[key].length} / ${LIMITS[key]}`;

  return (
    <Card asChild>
      <form onSubmit={submit}>
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="eyebrow text-primary">Public profile</h2>
          <span className="eyebrow text-faint">Visible to everyone</span>
        </div>
        <div className="space-y-5 p-5">
          <InputField
            label="Name"
            value={form.name}
            onChange={set("name")}
            maxLength={LIMITS.name}
            autoComplete="name"
            error={error?.field === "name" ? error.text : undefined}
            required
          />
          <InputField
            label="Status"
            icon={Smile}
            placeholder="What's happening? e.g. On holiday until Monday"
            value={form.statusMessage}
            onChange={set("statusMessage")}
            maxLength={LIMITS.statusMessage}
            hint={count("statusMessage")}
          />
          <TextareaField
            label="Bio"
            placeholder="Tell people a little about yourself"
            value={form.bio}
            onChange={set("bio")}
            maxLength={LIMITS.bio}
            rows={4}
            hint={count("bio")}
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <InputField
              label="Location"
              icon={MapPin}
              placeholder="City, country"
              value={form.location}
              onChange={set("location")}
              maxLength={LIMITS.location}
            />
            <InputField
              label="Website"
              icon={Link2}
              placeholder="example.com"
              value={form.website}
              onChange={set("website")}
              maxLength={LIMITS.website}
              inputMode="url"
              error={error?.field === "website" ? error.text : undefined}
            />
          </div>

          <div className="flex items-center justify-between gap-4 border border-border bg-muted/60 px-4 py-3">
            <div>
              <p className="text-xs font-bold">Show my activity status</p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                When off, nobody sees when you're online or when you were last seen.
              </p>
            </div>
            <Switch
              aria-label="Show my activity status"
              checked={form.showActivity}
              onCheckedChange={set("showActivity")}
            />
          </div>

          {error && !error.field && (
            <Alert variant="destructive">
              <AlertCircle aria-hidden="true" />
              <AlertDescription className="text-current">{error.text}</AlertDescription>
            </Alert>
          )}
        </div>
        <div className="flex justify-end border-t border-border px-5 py-4">
          <Button type="submit" loading={saving}>
            Save changes
          </Button>
        </div>
      </form>
    </Card>
  );
}
