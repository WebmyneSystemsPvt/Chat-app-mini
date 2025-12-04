import { useCallback } from "react";
import toast from "react-hot-toast";

import useSocket from "../../../hooks/useSocket";

import { SOCKET_EVENTS } from "../../../constants/socketEvents";

const useChatActions = () => {
  const socket = useSocket();

  const searchMessages = useCallback((messages, query) => {
    if (!query?.trim()) return [];

    return messages
      .map((msg, idx) => ({ ...msg, index: idx }))
      .filter((msg) => {
        try {
          const content =
            msg.content && msg.content.startsWith("U2FsdGVkX1")
              ? msg.content
              : msg.content || msg.message || "";

          return content.toLowerCase().includes(query.toLowerCase());
        } catch (error) {
          console.error("Error processing message for search:", error);
          return false;
        }
      });
  }, []);

  const deleteMessage = useCallback(
    async (messageId, forEveryone = false) => {
      if (!socket || !messageId) return false;

      try {
        socket.emit(
          SOCKET_EVENTS.MESSAGE_DELETE,
          {
            messageId,
            forEveryone,
          },
          (response) => {
            if (response?.success) {
              toast.success("Message deleted successfully");
            } else {
              toast.error(response?.message || "Failed to delete message");
            }
          }
        );

        return true;
      } catch (error) {
        console.error("Error deleting message:", error);
        toast.error("An error occurred while deleting the message");
        return false;
      }
    },
    [socket]
  );

  return {
    searchMessages,
    deleteMessage,
  };
};

export default useChatActions;
