import { useState } from "react";
import { Link2, MapPin, Smile } from "lucide-react";
import axios from "../../config/axiosInstance.js";
import { API_URL } from "../../config/api.js";
import { useAuth } from "../../context/AuthContext";
import { Button, Card, Input, Textarea, Toggle } from "../../components/ui";
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
    <Card as="form" onSubmit={submit} className="space-y-4">
      <Input
        label="Name"
        value={form.name}
        onChange={set("name")}
        maxLength={LIMITS.name}
        autoComplete="name"
        error={error?.field === "name" ? error.text : undefined}
        required
      />
      <Input
        label="Status"
        icon={Smile}
        placeholder="What's happening? e.g. On holiday until Monday"
        value={form.statusMessage}
        onChange={set("statusMessage")}
        maxLength={LIMITS.statusMessage}
        hint={count("statusMessage")}
      />
      <Textarea
        label="Bio"
        placeholder="Tell people a little about yourself"
        value={form.bio}
        onChange={set("bio")}
        maxLength={LIMITS.bio}
        rows={4}
        hint={count("bio")}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Location"
          icon={MapPin}
          placeholder="City, country"
          value={form.location}
          onChange={set("location")}
          maxLength={LIMITS.location}
        />
        <Input
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

      <div className="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface-2 px-4 py-3">
        <div>
          <p className="text-sm font-semibold">Show my activity status</p>
          <p className="text-xs text-muted">
            When off, nobody sees when you're online or when you were last seen.
          </p>
        </div>
        <Toggle
          label="Show my activity status"
          checked={form.showActivity}
          onChange={set("showActivity")}
        />
      </div>

      {error && !error.field && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error.text}
        </p>
      )}
      <div className="flex justify-end">
        <Button type="submit" loading={saving}>
          Save changes
        </Button>
      </div>
    </Card>
  );
}
