import { useState } from "react";
import { UserCheck, UserMinus, UserPlus, UserX } from "lucide-react";
import { useFriends } from "../../context/FriendContext";
import { Button, Modal } from "../../components/ui";
import { toast } from "../../lib/toast";

// Add / cancel / accept / decline / remove — whatever fits the current relationship
export default function FriendAction({ userId, name, size = "default" }) {
  const {
    getRelationship,
    incomingRequests,
    sentRequests,
    sendRequest,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    removeFriend,
  } = useFriends();
  const [busy, setBusy] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const status = getRelationship(userId).status;

  const run = async (fn) => {
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      toast({
        title: "Something went wrong",
        description: err.response?.data?.message,
        variant: "error",
      });
    } finally {
      setBusy(false);
    }
  };

  const incoming = incomingRequests.find((r) => r.sender?._id === userId);
  const sent = sentRequests.find((r) => r.receiver?._id === userId);

  if (status === "friends") {
    return (
      <>
        <Button size={size} variant="outline" icon={UserCheck} onClick={() => setConfirmRemove(true)}>
          Friends
        </Button>
        <Modal
          open={confirmRemove}
          onClose={() => setConfirmRemove(false)}
          title={`Remove ${name} from friends?`}
          description="You can send a new request later."
          size="sm"
          footer={
            <>
              <Button variant="ghost" onClick={() => setConfirmRemove(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                icon={UserMinus}
                loading={busy}
                onClick={() =>
                  run(() => removeFriend(userId)).then(() => setConfirmRemove(false))
                }
              >
                Remove friend
              </Button>
            </>
          }
        />
      </>
    );
  }
  if (status === "received" && incoming) {
    return (
      <>
        <Button
          size={size}
          icon={UserCheck}
          loading={busy}
          onClick={() => run(() => acceptRequest(incoming._id, userId))}
        >
          Accept
        </Button>
        <Button
          size={size}
          variant="outline"
          icon={UserX}
          disabled={busy}
          onClick={() => run(() => rejectRequest(incoming._id, userId))}
        >
          Decline
        </Button>
      </>
    );
  }
  if (status === "sent" && sent) {
    return (
      <Button
          size={size}
        variant="outline"
        loading={busy}
        onClick={() => run(() => cancelRequest(sent._id, userId))}
      >
        Cancel request
      </Button>
    );
  }
  return (
    <Button size={size} icon={UserPlus} loading={busy} onClick={() => run(() => sendRequest(userId))}>
      Add friend
    </Button>
  );
}
