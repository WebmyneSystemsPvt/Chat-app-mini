import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuTrigger,
} from "rctx-contextmenu";
import { useMemo } from "react";
import { Trash } from "lucide-react";

import { formatMessageTime } from "../../../utils/helpers";

const MessageItem = ({ message, isSender, onDeleteClick }) => {
  const contextMenuId = `msg-menu-${
    message._id ||
    message.id ||
    `${message.sender?.id || message.sender}-${message.createdAt}`
  }`;

  const incomingMsg = useMemo(() => {
    if (message.content !== undefined && message.content !== null) {
      return message.content;
    }
    if (message.message !== undefined && message.message !== null) {
      return message.message;
    }
    return "";
  }, [message.content, message.message]);

  return (
    <div
      key={
        message._id ||
        `${message.sender?.id || message.sender}-${message.createdAt}`
      }
      data-message-id={message._id}
      className={`personal-chat-message ${
        isSender ? "personal-chat-message-end" : "personal-chat-message-start"
      }`}
    >
      <ContextMenuTrigger
        id={contextMenuId}
        holdToDisplay={-1}
        className="menuTrigger"
      >
        <div
          className={`personal-chat-message-bubble ${
            isSender
              ? "personal-chat-message-bubble-user"
              : "personal-chat-message-bubble-other"
          }`}
          style={{ minWidth: "100px" }}
        >
          <div className="personal-chat-message-content">
            {incomingMsg && <div>{incomingMsg}</div>}
          </div>

          <div
            className={`personal-chat-message-time ${
              isSender
                ? "personal-chat-message-time-end"
                : "personal-chat-message-time-start"
            }`}
          >
            <span className="whitespace-nowrap">
              {formatMessageTime(message.createdAt || message.timestamp)}
            </span>
          </div>
        </div>
      </ContextMenuTrigger>

      <ContextMenu
        id={contextMenuId}
        className="bg-white border rounded-lg shadow-lg z-20"
      >
        <ContextMenuItem
          onClick={() => onDeleteClick(message)}
          className="contextmenu__item px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer flex items-center"
        >
          <Trash className="w-4 h-4 mr-2" />
          Delete
        </ContextMenuItem>
      </ContextMenu>
    </div>
  );
};

export default MessageItem;
