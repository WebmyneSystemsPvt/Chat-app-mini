import { useMemo } from "react";

import MessageItem from "./MessageItem";

const MessageList = ({
  messages: rawMessages,
  currentUserId,
  activeSearchQuery,
  hasMore,
  loadMoreMessages,
  onDeleteMessage,
  messagesEndRef,
  messagesContainerRef,
}) => {
  const messages = useMemo(() => {
    if (!Array.isArray(rawMessages)) return [];

    return rawMessages.map((msg) => {
      const content = msg.content ?? msg.message ?? "";
      return {
        ...msg,
        content,
      };
    });
  }, [rawMessages]);

  return (
    <>
      <div ref={messagesContainerRef} className="personal-chat-messages">
        {hasMore && messages?.length >= 20 && (
          <div className="personal-chat-load-more">
            <button
              onClick={loadMoreMessages}
              className="personal-chat-load-more-btn"
            >
              Load more messages
            </button>
          </div>
        )}

        {messages?.map((message) => {
          const senderId =
            message.senderId ||
            message.sender?._id ||
            message.sender?.id ||
            message.sender;

          const isSender = senderId === currentUserId;

          return (
            <MessageItem
              key={
                message._id ||
                `${message.sender?.id || message.sender?._id}-${
                  message.createdAt
                }`
              }
              message={message}
              isSender={isSender}
              currentUserId={currentUserId}
              activeSearchQuery={activeSearchQuery}
              onDeleteClick={onDeleteMessage}
            />
          );
        })}

        <div ref={messagesEndRef} />
      </div>
    </>
  );
};

export default MessageList;
