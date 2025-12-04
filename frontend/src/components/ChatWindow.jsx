import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Suspense, lazy, useMemo, useEffect } from "react";

import useUser from "../hooks/useUser";
import useSocket from "../hooks/useSocket";

import ChatWindowLoader from "./Loaders/ChatWindowLoader";
import { SOCKET_EVENTS } from "../constants/socketEvents";
import { conversationsSelector } from "../redux/selectors/conversation";

const PersonalChatWindow = lazy(() =>
  import("./PersonalChat/PersonalChatWindow")
);

const LABELS = {
  WELCOME_TITLE: "Welcome to Chat App",
  WELCOME_MESSAGE: "Select a chat to start messaging",
  ADD_USER: "Add User",
  TYPE_MESSAGE: "Type a message...",
  SEND: "Send",
};

export default function ChatWindow() {
  const { id: conversationId } = useParams();

  const user = useUser();
  const socket = useSocket();
  const conversations = useSelector(conversationsSelector);

  const routeActiveChat = useMemo(() => {
    if (conversationId) {
      if (conversationId === "new") {
        const storedUser = sessionStorage.getItem("newChatUser");
        const newChatUser = storedUser ? JSON.parse(storedUser) : null;
        return {
          type: "personal",
          user: newChatUser || {
            id: null,
            username: "New Chat",
            profilePicture: null,
          },
        };
      }

      const conversation = conversations?.find((c) => c._id === conversationId);

      if (conversation) {
        if (conversation.type === "DIRECT") {
          const otherMember = conversation.members.find(
            (m) => m.userId !== (user?.id || "")
          );
          if (otherMember?.user) {
            return {
              type: "personal",
              user: {
                id: otherMember.user._id,
                username: `${otherMember.user.firstName} ${otherMember.user.lastName}`,
                profilePicture: otherMember.user.profilePicture,
              },
            };
          }
        }
      }
    }
    return null;
  }, [conversationId, conversations, user?.id]);

  useEffect(() => {
    if (socket && conversationId && conversationId !== "new") {
      const conversation = conversations?.find((c) => c._id === conversationId);
      if (conversation) {
        socket.emit(SOCKET_EVENTS.JOIN_CHAT, { conversationId });
      }
    }
  }, [socket?.id, conversationId]);

  const displayChat = routeActiveChat;

  if (!displayChat) {
    return (
      <div className="chat-window-welcome">
        <div className="chat-window-welcome-content">
          <h3 className="chat-window-welcome-title">{LABELS.WELCOME_TITLE}</h3>
          <p>{LABELS.WELCOME_MESSAGE}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window-container">
      <Suspense fallback={<ChatWindowLoader />}>

        {!conversationId && <>Something Went Wrong</>}

        {conversationId && (
          <PersonalChatWindow
            activeChat={displayChat}
            conversations={conversations}
          />
        )}
      </Suspense>
    </div>
  );
}
