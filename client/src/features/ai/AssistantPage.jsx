import AssistantChat from "./AssistantChat";

// Full-screen assistant (the chat page shows the same conversation as a side panel)
export default function AssistantPage() {
  return (
    <div className="h-full">
      <AssistantChat />
    </div>
  );
}
