import { Modal } from "../../../components/ui";
import UserPicker from "./UserPicker";

export default function NewDMModal({ onClose, onSelectUser }) {
  return (
    <Modal open onClose={onClose} title="New message" description="Choose who to talk to" size="md">
      <UserPicker showAllWhenEmpty onPick={onSelectUser} />
    </Modal>
  );
}
