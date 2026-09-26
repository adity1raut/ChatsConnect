import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MessageSquare, Sparkles, SquarePen, UsersRound } from "lucide-react";
import { useCall } from "../../context/CallContext";
import { useGroupCall } from "../../context/GroupCallContext";
import { useAI } from "../../context/AIContext";
import { useE2EE } from "../../context/E2EEContext";
import EncryptionBanner from "../e2ee/EncryptionBanner";
import EncryptionModal from "../e2ee/EncryptionModal";
import SecurityCodeModal from "../e2ee/SecurityCodeModal";
import { Button, EmptyState } from "../../components/ui";
import AssistantChat from "../ai/AssistantChat";
import SmartReplies from "../ai/SmartReplies";
import { cn } from "../../lib/cn";
import ChatHeader from "./ChatHeader";
import Composer from "./Composer";
import ConversationList from "./ConversationList";
import MessageList from "./MessageList";
import CreateGroupModal from "./modals/CreateGroupModal";
import ManageGroupModal from "./modals/ManageGroupModal";
import NewDMModal from "./modals/NewDMModal";
import { useChat } from "./useChat";

const chatKeyOf = (chat) =>
  chat ? (chat.type === "group" ? `group:${chat.groupId}` : `user:${chat.id}`) : null;

export default function ChatPage() {
  const chat = useChat();
  const navigate = useNavigate();
  const location = useLocation();
  const { startCall } = useCall();
  const { startGroupCall } = useGroupCall();
  const { aiEnabled, smartReplies } = useAI();
  const e2ee = useE2EE();

  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  // Unsent text is kept per chat, so switching conversations doesn't lose it
  const [drafts, setDrafts] = useState({});
  // Dashboard quick actions deep-link here with { newChat } / { newGroup }
  const [modal, setModal] = useState(() =>
    location.state?.newGroup ? "newGroup" : location.state?.newChat ? "newDM" : null,
  );

  // Encryption dialogs: opened on demand, or once per session if encryption
  // isn't set up / unlocked on this device yet
  const [e2eeModal, setE2eeModal] = useState(null);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [promptDismissed, setPromptDismissed] = useState(
    () => sessionStorage.getItem("e2eePrompted") === "1",
  );
  const autoPrompt = promptDismissed
    ? null
    : e2ee.status === "none"
      ? "setup"
      : e2ee.status === "locked"
        ? "unlock"
        : null;
  const shownE2eeModal = e2eeModal ?? autoPrompt;
  const closeE2eeModal = () => {
    setE2eeModal(null);
    setPromptDismissed(true);
    sessionStorage.setItem("e2eePrompted", "1");
  };

  const selected = chat.selectedChat;
  const key = chatKeyOf(selected);
  const draft = drafts[key] ?? "";
  const setDraft = (text) => setDrafts((d) => ({ ...d, [key]: text }));

  // A locked device must unlock before sending DMs (never a silent plaintext fallback)
  const onSend = async (text) => {
    if (selected?.type === "user" && e2ee.status === "locked") {
      setE2eeModal("unlock");
      return false;
    }
    return chat.send(text);
  };

  return (
    <div className="flex h-full min-h-0">
      <ConversationList
        className={selected ? "hidden md:flex" : "flex"}
        contacts={chat.contacts}
        discover={chat.discover}
        selectedChat={selected}
        onSelect={chat.selectChat}
        onStartChatWith={chat.startChatWith}
        onNewDM={() => setModal("newDM")}
        onNewGroup={() => setModal("newGroup")}
      />

      <section
        className={cn("min-w-0 flex-1 flex-col bg-bg", selected ? "flex" : "hidden md:flex")}
        aria-label={selected ? `Chat with ${selected.name}` : "Chat"}
      >
        {selected ? (
          <>
            <ChatHeader
              chat={selected}
              typingNames={chat.typingNames}
              isPeerOnline={chat.isPeerOnline}
              aiPanelOpen={aiPanelOpen}
              onBack={() => chat.selectChat(null)}
              onVoiceCall={() => startCall(selected, true)}
              onVideoCall={() => startCall(selected, false)}
              onGroupCall={() => startGroupCall(selected.groupId, selected.name, "video")}
              onToggleAI={() => setAiPanelOpen((v) => !v)}
              onViewProfile={() => navigate(`/profile/${selected.id}`)}
              onManageGroup={() => setModal("manageGroup")}
              onExport={chat.exportCurrentChat}
              encrypted={chat.encryption.encrypted}
              onVerify={() => setSecurityOpen(true)}
            />
            <EncryptionBanner
              state={chat.encryption.banner}
              peerName={selected.name.split(" ")[0]}
              onSetup={() => setE2eeModal("setup")}
              onUnlock={() => setE2eeModal("unlock")}
              onVerify={() => setSecurityOpen(true)}
            />
            <MessageList
              chatKey={key}
              messages={chat.messages}
              loading={chat.loadingMessages}
              isGroup={selected.type === "group"}
              typingNames={chat.typingNames}
              onTranslate={aiEnabled ? chat.translateOne : undefined}
            />
            {aiEnabled && chat.encryption.encrypted && !smartReplies.length && chat.messages.length > 0 && (
              <div className="shrink-0 px-4 pt-2">
                <button
                  type="button"
                  onClick={chat.suggestReplies}
                  title="Sends the last few messages of this encrypted chat to the AI"
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted hover:border-accent hover:text-accent-fg"
                >
                  <Sparkles className="size-3.5" aria-hidden="true" />
                  Suggest replies
                </button>
              </div>
            )}
            <SmartReplies onSelect={setDraft} />
            <Composer
              chatKey={key}
              value={draft}
              onChange={setDraft}
              onSend={onSend}
              onTyping={chat.notifyTyping}
              placeholder={`Message ${selected.type === "group" ? selected.name : selected.name.split(" ")[0]}…`}
            />
          </>
        ) : (
          <EmptyState
            icon={MessageSquare}
            title="Your messages"
            description="Pick a conversation, or start a new one."
            className="h-full"
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button icon={SquarePen} onClick={() => setModal("newDM")}>
                  New message
                </Button>
                <Button variant="secondary" icon={UsersRound} onClick={() => setModal("newGroup")}>
                  New group
                </Button>
              </div>
            }
          />
        )}
      </section>

      {aiPanelOpen && (
        <div className="hidden h-full w-96 shrink-0 lg:flex">
          <AssistantChat compact onClose={() => setAiPanelOpen(false)} />
        </div>
      )}

      {shownE2eeModal && (
        <EncryptionModal
          key={shownE2eeModal}
          open
          mode={shownE2eeModal}
          onClose={closeE2eeModal}
        />
      )}
      {securityOpen && selected?.type === "user" && (
        <SecurityCodeModal open peer={selected} onClose={() => setSecurityOpen(false)} />
      )}

      {modal === "newGroup" && (
        <CreateGroupModal
          onClose={() => setModal(null)}
          onGroupCreated={() => chat.reloadContacts()}
        />
      )}
      {modal === "newDM" && (
        <NewDMModal
          onClose={() => setModal(null)}
          onSelectUser={(u) => {
            chat.startChatWith(u);
            setModal(null);
          }}
        />
      )}
      {modal === "manageGroup" && selected?.type === "group" && (
        <ManageGroupModal
          group={selected}
          currentUser={chat.me}
          onClose={() => setModal(null)}
          onGroupUpdated={chat.reloadContacts}
        />
      )}
    </div>
  );
}
