import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef, useMemo, lazy } from "react";

import useUser from "../../hooks/useUser.js";
import useSocket from "../../hooks/useSocket.js";
import useChatActions from "./components/ChatActions";

import SearchBar from "../../common/SearchBar";
import MessageInput from "../../common/MessageInput";
import DeleteMessageModal from "../../common/DeleteMessageModal";

import { messageAPI } from "../../services/api";
import { SOCKET_EVENTS } from "../../constants/socketEvents";
import { conversationsSelector } from "../../redux/selectors/conversation.js";
import { updateConversations } from "../../redux/actions/conversationActions.js";

const ChatHeader = lazy(() => import("./components/ChatHeader"));
const MessageList = lazy(() => import("./components/MessageList"));

function resolveId(x) {
  if (!x && x !== 0) return undefined;
  if (typeof x === "string" || typeof x === "number") return String(x);
  if (typeof x === "object") {
    return String(
      x._id ??
        x.id ??
        x.userId ??
        x.senderId ??
        x.from ??
        x.createdBy ??
        x.requestId ??
        ""
    );
  }
  return undefined;
}

function isMessageSender(msg = {}, currentUser = {}) {
  const senderCandidates = [
    msg?.sender,
    msg?.sender?.id,
    msg?.sender?._id,
    msg?.senderId,
    msg?.from,
    msg?.createdBy,
    msg?.requester,
    msg?.requestId,
  ];

  let senderId;
  for (let s of senderCandidates) {
    const id = resolveId(s);
    if (id) {
      senderId = id;
      break;
    }
  }

  if (!senderId && msg?.sender?.user) {
    senderId = resolveId(msg.sender.user);
  }

  if (!senderId && msg?.sender === msg?.sender) {
    senderId = resolveId(msg.sender);
  }

  const userId = resolveId(currentUser?._id ?? currentUser?.id ?? currentUser);

  if (!senderId || !userId) {
    return false;
  }

  return String(senderId) === String(userId);
}

function PersonalChatWindow({ activeChat }) {
  const user = useUser();
  const socket = useSocket();

  const params = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const conversationId = params.id;

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  const conversations = useSelector(conversationsSelector);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isUserAtBottom, setIsUserAtBottom] = useState(true);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);

  const { searchMessages, deleteMessage } = useChatActions({
    user,
    conversationId,
    activeChat,
    setMessages,
    setPage,
    setHasMore,
    conversation: conversations,
    dispatch,
  });

  const currentConversation = useMemo(
    () => conversations?.find((conv) => conv._id === conversationId),
    [conversations, conversationId]
  );

  const otherUser = useMemo(() => {
    if (!currentConversation || !user) return null;
    if (!currentConversation?.members) return null;
    return (
      currentConversation.members.find((member) => member.userId !== user._id)
        ?.user || null
    );
  }, [currentConversation, conversationId, user?._id]);

  const handleProfileClick = useCallback(() => {
    const id = otherUser?._id || otherUser?.id;
    if (id) navigate(`/user/${id}`);
  }, [navigate, otherUser]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearch(false);
    setIsUserAtBottom(true);
    setActiveSearchQuery("");
    setShowScrollDown(false);
    setCurrentSearchIndex(-1);
  }, [activeChat]);

  const isMessageForCurrentChat = useCallback(
    (msg) => {
      if (!conversationId) return false;
      return msg.conversationId === conversationId;
    },
    [conversationId, user?.id]
  );

  const fetchMessages = useCallback(
    async (pageNum = 1, isLoadMore = false) => {
      if (!activeChat?.user?.id || !conversationId || conversationId == "new") {
        setMessages([]);
        return;
      }
      try {
        const container = messagesContainerRef.current;
        const scrollHeightBefore = container?.scrollHeight || 0;

        const response = await messageAPI.getConversationMessages(
          conversationId,
          pageNum,
          20
        );

        let fetched = response.data.data || [];

        fetched = fetched.map((m) => ({
          ...m,
          content: m.content,
        }));

        setMessages((prev) => {
          let merged;
          if (isLoadMore) {
            merged = [...fetched, ...prev];
          } else {
            merged = [...fetched];
          }
          return merged.sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );
        });

        setHasMore(response.data.pagination?.hasNextPage || false);

        setTimeout(() => {
          if (isLoadMore && container) {
            const newHeigth = container.scrollHeight;
            container.scrollTop = newHeigth - scrollHeightBefore;
          }
          scrollToBottom();
        }, 0);
      } catch (error) {
        console.log("failed to fetch messages", error);
      }
    },
    [conversationId, activeChat?.user?.id]
  );

  useEffect(() => {
    setTimeout(() => {
      fetchMessages(1, false);
    }, 100);

    return;
  }, [conversationId, fetchMessages]);

  const scrollToBottom = useCallback(() => {
    if (!user || !activeChat?.user?.id) return;

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, conversationId, socket?.id, messagesEndRef]);

  const loadMoreMessages = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMessages(nextPage, true);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (messagesContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } =
          messagesContainerRef.current;
        const atBottom = scrollHeight - scrollTop - clientHeight < 100;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 10;

        setShowScrollDown(!isNearBottom && messages.length > 0);
        setIsUserAtBottom(atBottom);
      }
    };

    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [messages.length, activeChat.user.id, messagesContainerRef]);

  useEffect(() => {
    if (!activeChat?.user?.id || !socket) {
      return;
    }
    const convIdEq = (a, b) => String(a ?? "") === String(b ?? "");

    const handleIncomingMessage = (msg) => {
      if (!convIdEq(msg.conversation._id, conversationId)) return;

      const msgPayload = msg.message;

      const incoming = {
        ...msgPayload,
      };

      setMessages((prev) => {
        const map = new Map();
        prev.forEach((pm) => {
          const key = pm._id || pm.requestId || pm.id;
          map.set(key, pm);
        });

        const incomingKey = incoming._id || incoming.requestId || incoming.id;
        map.set(incomingKey, incoming);

        const merged = Array.from(map.values());
        merged.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        return merged;
      });

      if (isUserAtBottom)
        setTimeout(
          () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
          50
        );
    };

    socket.on(SOCKET_EVENTS.MESSAGE_RECEIVE, handleIncomingMessage);

    const removeByMessageId = async (data) => {
      const targetId = data?.messageId;
      if (!targetId) return;

      setMessages((prev) =>
        prev.filter((m) => {
          const mid = m?._id ?? m?.id;
          return String(mid) !== String(targetId);
        })
      );
    };

    socket.on(SOCKET_EVENTS.MESSAGE_DELETE, removeByMessageId);
    socket.on(SOCKET_EVENTS.MESSAGE_DELETED, removeByMessageId);

    return () => {
      socket?.off(SOCKET_EVENTS.MESSAGE_RECEIVE, handleIncomingMessage);
      socket?.off(SOCKET_EVENTS.MESSAGE_DELETE, removeByMessageId);
      socket?.off(SOCKET_EVENTS.MESSAGE_DELETED, removeByMessageId);
    };
  }, [
    activeChat,
    user?.id,
    socket,
    isUserAtBottom,
    isMessageForCurrentChat,
    messagesEndRef,
    conversationId,
    dispatch,
  ]);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setCurrentSearchIndex(-1);
      setActiveSearchQuery("");
      return;
    }

    const results = searchMessages(messages, searchQuery);
    setActiveSearchQuery(searchQuery);
    setSearchResults(results);
    setCurrentSearchIndex(results.length > 0 ? 0 : -1);

    if (results.length > 0) {
      const el = messagesContainerRef.current?.querySelector(
        `[data-message-id="${results[0]._id || results[0].id}"]`
      );
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.style.backgroundColor = "rgb(219 234 254)";
        setTimeout(() => {
          el.style.backgroundColor = "";
        }, 2000);
      }
    }
  };

  const handleSearchNavigation = (direction) => {
    if (!searchResults.length) return;
    setCurrentSearchIndex((prev) => {
      const nextIndex = direction === "up" ? prev - 1 : prev + 1;
      const clampedIndex = Math.max(
        0,
        Math.min(nextIndex, searchResults.length - 1)
      );

      const el = messagesContainerRef.current?.querySelector(
        `[data-message-id="${
          searchResults[clampedIndex]._id || searchResults[clampedIndex].id
        }"]`
      );
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.style.backgroundColor = "rgb(219 234 254)";
        setTimeout(() => {
          el.style.backgroundColor = "";
        }, 2000);
      }
      return clampedIndex;
    });
  };

  const handleCloseSearchBar = () => {
    setSearchQuery("");
    setActiveSearchQuery("");
    setSearchResults([]);
    setCurrentSearchIndex(-1);
    setShowSearch(false);
  };

  const handleSendMessage = async ({ text }) => {
    if (!text?.trim()) return;
    const senderId = user?._id;
    const conversationId = activeChat?._id || params?.id;
    const recipientId = activeChat?.user?.id;

    if (!socket) {
      toast.error("Something went wrong: ", ERROR_CODES.SOCKET_NOT_FOUND);
      console.error("Something went wrong: ", ERROR_CODES.SOCKET_NOT_FOUND);
      return;
    }
    if (!senderId) {
      toast.error("Something went wrong: ", ERROR_CODES.SEND_MESSAGE_NO_SENDER);
      console.error(
        "Something went wrong: ",
        ERROR_CODES.SEND_MESSAGE_NO_SENDER
      );
      return;
    }

    if (!conversationId) {
      toast.error(
        "Something went wrong: ",
        ERROR_CODES.SEND_MESSAGE_NO_CONVERSATION_ID
      );
      console.error(
        "Something went wrong: ",
        ERROR_CODES.SEND_MESSAGE_NO_CONVERSATION_ID
      );
      return;
    }

    if (!recipientId) {
      toast.error(
        "Something went wrong: ",
        ERROR_CODES.SEND_MESSAGE_NO_RECIPIENT
      );
      console.error(
        "Something went wrong: ",
        ERROR_CODES.SEND_MESSAGE_NO_RECIPIENT
      );
      return;
    }

    const Content = text;

    const baseMessage = {
      conversationId,
      senderId,
      to: recipientId,
      content: Content,
      type: text || [],
      createdAt: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    };

    setMessages((prev) => {
      const newMessages = [...prev, { ...baseMessage, status: "sending" }];
      return newMessages;
    });
    setMessageInput("");

    scrollToBottom();

    socket.emit(SOCKET_EVENTS.MESSAGE_SEND, baseMessage, async (res = {}) => {
      const { messages: ackMsgs, conversation: ackConvs } = res;

      if (!res.success) {
        if (
          res.errCode &&
          res.errCode === ERROR_CODES.MESSAGE_DUPLICATE_REQUEST_ID
        ) {
          return;
        } else {
          toast.error(
            res?.message ||
              "Message could not be delivered, it will be retried automatically."
          );
        }
      }

      if (Array.isArray(ackMsgs) && ackMsgs.length) {
        setMessages((prev) => {
          const map = new Map();

          prev.forEach((pm) => {
            const key = pm.requestId || pm._id || pm.id;
            map.set(key, pm);
          });

          ackMsgs.forEach((am) => {
            const incoming = {
              ...am,
            };
            const key = am.requestId || am._id || am.id;
            map.set(key, incoming);
          });

          const merged = Array.from(map.values());
          return merged.sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );
        });

        scrollToBottom();
      }

      if (ackConvs?._id) {
        dispatch(updateConversations(ackConvs));

        if (conversationId === "new") {
          navigate("/conversation/" + ackConvs?._id, {
            replace: true,
            preventScrollReset: true,
          });
        }
      }
    });
  };

  const handleContextDeleteClick = useCallback(
    (msg) => {
      const senderIsCurrentUser = isMessageSender(msg, user);
      setDeleteTarget({
        msg: msg,
        role: senderIsCurrentUser ? "sender" : "receiver",
      });
      setShowDeleteModal(true);
    },
    [user?.id]
  );

  const handleDeleteAction = useCallback(
    async (messageId, forEveryone) => {
      if (!messageId) return;

      setMessages((prev) => prev.filter((m) => (m._id || m.id) !== messageId));
      await deleteMessage(messageId, forEveryone);

      setShowDeleteModal(false);
      setDeleteTarget(null);
    },
    [deleteMessage]
  );

  return (
    <>
      <ChatHeader activeChat={activeChat} onProfileClick={handleProfileClick} />

      {showSearch && (
        <SearchBar
          searchInputRef={searchInputRef}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearch={handleSearch}
          searchResults={searchResults}
          currentSearchIndex={currentSearchIndex}
          onNavigateUp={() => handleSearchNavigation("up")}
          onNavigateDown={() => handleSearchNavigation("down")}
          onClose={handleCloseSearchBar}
        />
      )}

      <MessageList
        messages={messages}
        currentUserId={user?._id}
        activeSearchQuery={activeSearchQuery}
        hasMore={hasMore}
        loadMoreMessages={loadMoreMessages}
        onDeleteMessage={handleContextDeleteClick}
        messagesEndRef={messagesEndRef}
        messagesContainerRef={messagesContainerRef}
        showScrollDown={showScrollDown}
      />

      <MessageInput
        messageInput={messageInput}
        setMessageInput={setMessageInput}
        onSendMessage={handleSendMessage}
        activeChat={activeChat}
      />

      <DeleteMessageModal
        show={showDeleteModal}
        targetMessage={deleteTarget}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteTarget(null);
        }}
        onDelete={handleDeleteAction}
      />
    </>
  );
}

export default PersonalChatWindow;

const ERROR_CODES = {
  SEND_MESSAGE_SOCKET_NOT_FOUND: "#ERsm_1",
  SEND_MESSAGE_NO_SENDER: "ERsm_2",
  SEND_MESSAGE_NO_CONVERSATION_ID: "#ERsm_3",
  SEND_MESSAGE_NO_RECIPIENT: "#ERsm_4",
  MESSAGE_DUPLICATE_REQUEST_ID: "#ERsm_dup",
};
