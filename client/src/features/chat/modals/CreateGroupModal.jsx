import { useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import axios from "../../../config/axiosInstance.js";
import { API_URL } from "../../../config/api.js";
import { Button, InputField, Modal, TextareaField, UserAvatar } from "../../../components/ui";
import { toast } from "../../../lib/toast";
import UserPicker from "./UserPicker";

// Two steps: name the group, then pick members
export default function CreateGroupModal({ onClose, onGroupCreated }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const selectedIds = new Set(members.map((m) => m._id));
  const toggle = (user) =>
    setMembers((prev) =>
      prev.some((m) => m._id === user._id) ? prev.filter((m) => m._id !== user._id) : [...prev, user],
    );

  const create = async () => {
    setCreating(true);
    setError("");
    try {
      const { data } = await axios.post(`${API_URL}/groups`, {
        name: name.trim(),
        description: description.trim(),
        memberIds: members.map((m) => m._id),
      });
      toast({ title: `${data.group.name} created` });
      onGroupCreated(data.group);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't create the group");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={step === 1 ? "New group" : `Add people to ${name.trim()}`}
      description={step === 1 ? "Give your group a name" : "You can add more people later"}
      size="md"
      footer={
        step === 1 ? (
          <>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={!name.trim()} onClick={() => setStep(2)}>
              Next
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" icon={ArrowLeft} onClick={() => setStep(1)}>
              Back
            </Button>
            <Button loading={creating} onClick={create}>
              {members.length ? `Create with ${members.length} ${members.length === 1 ? "person" : "people"}` : "Create group"}
            </Button>
          </>
        )
      }
    >
      {step === 1 ? (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) setStep(2);
          }}
        >
          <InputField
            label="Group name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            placeholder="e.g. Weekend hikers"
            data-autofocus
            required
          />
          <TextareaField
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={300}
            rows={3}
          />
        </form>
      ) : (
        <div className="space-y-3">
          {members.length > 0 && (
            <ul className="flex flex-wrap gap-1.5" aria-label="Selected people">
              {members.map((m) => (
                <li key={m._id}>
                  <button
                    type="button"
                    onClick={() => toggle(m)}
                    aria-label={`Remove ${m.name}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 py-1 pr-2 pl-1 text-xs font-medium text-primary"
                  >
                    <UserAvatar src={m.avatar} name={m.name} size="xs" />
                    {m.name.split(" ")[0]}
                    <X className="size-3" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <UserPicker showAllWhenEmpty selectedIds={selectedIds} onPick={toggle} />
          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}
