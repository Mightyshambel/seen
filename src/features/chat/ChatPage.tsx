import { useParams } from "react-router-dom";
import { ChatLayout } from "@/components/chat/ChatLayout";

export function ChatPage() {
  const { id } = useParams<{ id?: string }>();
  return <ChatLayout activeId={id} />;
}
