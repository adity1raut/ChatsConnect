import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MessageSquare, SquarePen, UsersRound } from "lucide-react";
import { useCall } from "../../context/CallContext";
import { useGroupCall } from "../../context/GroupCallContext";
import { useAI } from "../../context/AIContext";
import { Button, EmptyState } from "../../components/ui";
import AIPanel from "../../components/ai/AIPanel";
import SmartReply from "../../components/ai/SmartReply";
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
  const { aiEnabled } = useAI();

  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  // Unsent text is kept per chat, so switching conversations doesn't lose it
  const [drafts, setDrafts] = useState({});
  // Dashboard quick actions deep-link here with { newChat } / { newGroup }
  const [modal, setModal] = useState(() =>
    location.state?.newGroup ? "newGroup" : location.state?.newChat ? "newDM" : null,
  );

  const selected = chat.selectedChat;
  const key = chatKeyOf(selected);
  const draft = drafts[key] ?? "";
  const setDraft = (text) => setDrafts((d) => ({ ...d, [key]: text }));

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
              aiEnabled={aiEnabled}
              aiPanelOpen={aiPanelOpen}
              onBack={() => chat.selectChat(null)}
              onVoiceCall={() => startCall(selected, true)}
              onVideoCall={() => startCall(selected, false)}
              onGroupCall={() => startGroupCall(selected.groupId, selected.name, "video")}
              onToggleAI={() => setAiPanelOpen((v) => !v)}
              onViewProfile={() => navigate(`/profile/${selected.id}`)}
              onManageGroup={() => setModal("manageGroup")}
              onExport={chat.exportCurrentChat}
            />
            <MessageList
              chatKey={key}
              messages={chat.messages}
              loading={chat.loadingMessages}
              isGroup={selected.type === "group"}
              typingNames={chat.typingNames}
            />
            <SmartReply onSelect={setDraft} />
            <Composer
              chatKey={key}
              value={draft}
              onChange={setDraft}
              onSend={chat.send}
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

      {aiPanelOpen && aiEnabled && (
        <div className="hidden h-full w-80 shrink-0 lg:flex">
          <AIPanel onClose={() => setAiPanelOpen(false)} />
        </div>
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
