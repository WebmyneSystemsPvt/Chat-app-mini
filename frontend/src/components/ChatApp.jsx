import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect, Suspense, lazy, useLayoutEffect } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";

import useUser from "../hooks/useUser.js";
import useSocket from "../hooks/useSocket.js";
import useIsMobile from "../hooks/useIsMobile.js";

import { SOCKET_EVENTS } from "../constants/socketEvents";
import { updateConversations } from "../redux/actions/conversationActions";
import { conversationsSelector } from "../redux/selectors/conversation.js";

const Sidebar = lazy(() => import("./Sidebar"));

function ChatApp() {
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname: currentPath } = useLocation();

  const user = useUser();
  const socket = useSocket();

  const currentConversationId = params?.id;

  const conversations = useSelector(conversationsSelector);

  const [showSidebar, setShowSidebar] = useState(true);

  const isMobile = useIsMobile();

  useLayoutEffect(() => {
    if (!isMobile) setShowSidebar(true);
  }, [isMobile]);



  const handleBackToSidebar = () => {
    if (isMobile) {
      setShowSidebar(true);
      navigate("/dashboard");
    }
  };

  function setupListeners() {
    function handleMessageSendEvent(res) {
      const { conversation } = res;

      let updatedConv = false;
      const newConversations = conversations?.map((conv) => {
        if (
          conv._id == conversation._id &&
          new Date(conversation.updatedAt) > new Date(conv.updatedAt)
        ) {
          updatedConv = true;
          return conversation;
        }
        return conv;
      });

      if (updatedConv) {
        dispatch(updateConversations(newConversations));
      }
    }

    function handleMessageReceiveEvent(res, callback) {
      const { conversation, message } = res;

      const callbackPayload = {
        status: "delivered",
      };

      const currentConvMember = conversation.members.find((cM) => {
        if (cM.userId == user._id) {
          return true;
        }
        return false;
      });

      if (currentConversationId == message?.conversationId) {
        callbackPayload.status = "read";

        if (currentConvMember) {
          currentConvMember.unreadCount = 0;
        }
      } else {
        if (currentConvMember)
          currentConvMember.unreadCount = currentConvMember.unreadCount + 1;
      }

      if (typeof callback === "function") {
        callback(callbackPayload);
      }

      message.status = callbackPayload.status + "_pending";

      let updatedConv = false;
      let newConversations = conversations?.map((conv) => {
        if (conv._id == conversation._id) {
          updatedConv = true;
          return conversation;
        }
        return conv;
      });

      if (!updatedConv) {
        newConversations = [conversation, ...newConversations];
      }

      dispatch(updateConversations(newConversations));
    }

    const handlePersonalDelete = (data) => {
      const messageId = data?.messageId;
      if (!messageId) return;
    };

    socket.on(SOCKET_EVENTS.MESSAGE_SEND, handleMessageSendEvent);
    socket.on(SOCKET_EVENTS.MESSAGE_RECEIVE, handleMessageReceiveEvent);

    socket.on(SOCKET_EVENTS.MESSAGE_DELETED, handlePersonalDelete);
    socket.on(SOCKET_EVENTS.MESSAGE_DELETE, (data) => {
      if (data?.forEveryone) handlePersonalDelete(data);
    });

    return () => {
      socket.off(SOCKET_EVENTS.MESSAGE_SEND);
      socket.off(SOCKET_EVENTS.MESSAGE_RECEIVE);
      socket.off(SOCKET_EVENTS.MESSAGE_DELETED);
      socket.off(SOCKET_EVENTS.MESSAGE_DELETE);
    };
  }

  useEffect(() => {
    if (!user || !socket) return;

    const unsubListeners = setupListeners();
    return () => unsubListeners();
  }, [socket?.id, user, socket]);

  return (
    <div className="chat-app-container">
      <Suspense fallback={null}>
        <div
          className={`chat-app-sidebar ${
            isMobile && !showSidebar ? "hidden" : ""
          }`}
        >
          <Sidebar />
        </div>
      </Suspense>
      <Suspense fallback={null}>
        <div
          className={`chat-app-chat ${
            isMobile && currentPath !== "/dashboard" ? "visible" : ""
          }`}
        >
          <Outlet
            context={{
              handleBackToSidebar,
            }}
          />
        </div>
      </Suspense>
    </div>
  );
}

export default ChatApp;
