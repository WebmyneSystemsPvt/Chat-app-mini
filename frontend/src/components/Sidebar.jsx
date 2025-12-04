import { useEffect, useRef, useState } from "react";
import { ContextMenuTrigger } from "rctx-contextmenu";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { MoreVertical, LogOut, MessageSquarePlus, X } from "lucide-react";

import useUser from "../hooks/useUser.js";

import Autocomplete from "../common/Autocomplete";
import LoaderSkeleton from "./LoaderSkeleton/index.jsx";
import useHandleLogout from "../hooks/useHandleLogout.js";

import {
  getUserInitials,
  requestNotificationPermission,
} from "../utils/helpers.jsx";
import { userAPI } from "../services/api";

import useFetchConversations from "../hooks/useFetchConversations.js";
import { conversationsSelector } from "../redux/selectors/conversation.js";

function Sidebar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const menuRef = useRef(null);
  const { pathname: currentPath } = useLocation();
  const menuButtonRef = useRef(null);

  const user = useUser();
  const userId = user?.id;

  const handleLogout = useHandleLogout();

  const [fetchConversations, conversationsLoading] = useFetchConversations();

  const conversations = useSelector(conversationsSelector);

  const [filteredConversations, setFilteredConversations] =
    useState(conversations);

  const [allUsers, setAllUsers] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);

  useEffect(() => {
    if (!userId) return;
    fetchConversations();
  }, [userId, dispatch]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filteredUsers = allUsers?.filter((user) =>
      user?.username?.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filteredUsers);
  };

  const onChatSelect = (chat) => {
    if (chat?.type === "personal") {
      if (chat.conversationId) {
        navigate(`/conversation/${chat.conversationId}`);
      } else {
        sessionStorage.setItem("newChatUser", JSON.stringify(chat.user));
        navigate(`/conversation/new`);
      }
    }
  };

  const handleNewMessageClick = async () => {
    setShowNewMessageModal(true);
    setMenuOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    try {
      const response = await userAPI.getAllUsers();
      const nonCurrentUser = response.data.data.filter((u) => u.id !== userId);
      setAllUsers(nonCurrentUser);
      setSearchResults(nonCurrentUser);
    } catch (error) {
      console.error("Error fetching users:", error);
      setSearchResults([]);
    }
  };

  const handleChatSearch = (query) => {
    setChatSearchQuery(query);
    const sortedConversations = [...conversations].sort((a, b) => {
      const aTime = new Date(a.updatedAt || a.lastMessage?.createdAt || 0);
      const bTime = new Date(b.updatedAt || b.lastMessage?.createdAt || 0);
      return bTime - aTime;
    });

    if (query.trim() === "") {
      setFilteredConversations(sortedConversations);
    } else {
      const filtered = sortedConversations.filter((conv) => {
        if (conv.type === "DIRECT") {
          const otherMember = conv.members.find((m) => m.userId !== userId);
          const otherUser = otherMember?.user;
          return (
            otherUser &&
            `${otherUser.firstName} ${otherUser.lastName}`
              .toLowerCase()
              .includes(query.toLowerCase())
          );
        }
        return false;
      });
      setFilteredConversations(filtered);
    }
  };

  useEffect(() => {
    handleChatSearch(chatSearchQuery);
  }, [conversations, chatSearchQuery]);

  const renderUserItem = (user) => (
    <div className="flex items-center">
      {user?.profilePicture ? (
        <img
          src={user.profilePicture}
          alt={user.username}
          className="w-8 h-8 rounded-full object-cover mr-2"
        />
      ) : (
        <div className="w-8 h-8 bg-gray-300 rounded-full mr-2 flex items-center justify-center text-sm">
          {user?.username.charAt(0).toUpperCase()}
        </div>
      )}
      <span>{user.username}</span>
    </div>
  );

  return (
    <div className="sidebar-container" onClick={requestNotificationPermission}>
      <div className="sidebar-header">
        <div className="sidebar-header-content">
          <div className="sidebar-profile" onClick={() => navigate("/profile")}>
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.username}
                className="sidebar-avatar"
              />
            ) : (
              <div className="sidebar-avatar-placeholder">
                {getUserInitials(user || {})}
              </div>
            )}
            <h2 className="sidebar-username">{user?.username}</h2>
          </div>

          <div className="sidebar-actions">
            <button
              onClick={handleNewMessageClick}
              className="sidebar-action-btn"
            >
              <MessageSquarePlus className="w-5 h-5 text-white" />
            </button>

            <div className="relative">
              <button
                ref={menuButtonRef}
                onClick={() => setMenuOpen(!menuOpen)}
                className="sidebar-action-btn"
              >
                <MoreVertical className="w-5 h-5 text-white" />
              </button>

              {menuOpen && (
                <div ref={menuRef} className="sidebar-menu">
                  <button
                    onClick={() => handleLogout()}
                    className="sidebar-menu-item sidebar-menu-item-logout"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="sidebar-content">
        <div className="sidebar-search-section">
          <Autocomplete
            options={[]}
            onInputChange={handleChatSearch}
            onSelect={() => {}}
            renderItem={() => null}
            value={chatSearchQuery}
            placeholder="Search chats..."
            disableDropdown={true}
          />
          <h3 className="sidebar-chats-title">Recent Chats</h3>
          {conversationsLoading && <LoaderSkeleton />}
          {filteredConversations?.map((conv) => {
            const contextMenuId = `chat-menu-${conv._id}`;

            if (conv.type === "DIRECT") {
              const otherMember = conv.members.find(
                (m) => m?.userId !== userId
              );
              const otherUser = otherMember?.user;
              if (!otherUser) return null;

              return (
                <ContextMenuTrigger
                  id={contextMenuId}
                  holdToDisplay={-1}
                  key={conv._id}
                >
                  <div
                    onClick={() =>
                      onChatSelect({
                        type: "personal",
                        user: {
                          id: otherUser._id,
                          username: `${otherUser.firstName} ${otherUser.lastName}`,
                          profilePicture: otherUser.profilePicture,
                        },
                        conversationId: conv._id,
                      })
                    }
                    className={`sidebar-chat-item ${
                      currentPath === `/conversation/${conv._id}`
                        ? "sidebar-chat-item-active"
                        : ""
                    }`}
                  >
                    <div className="sidebar-chat-content">
                      <div className="sidebar-chat-info">
                        {otherUser?.profilePicture ? (
                          <img
                            src={otherUser.profilePicture}
                            alt={`${otherUser.firstName} ${otherUser.lastName}`}
                            className="sidebar-chat-avatar"
                          />
                        ) : (
                          <div className="sidebar-chat-avatar-placeholder">
                            {getUserInitials(otherUser)}
                          </div>
                        )}
                        <div className="sidebar-chat-details">
                          <span className="sidebar-chat-name">
                            {otherUser.firstName} {otherUser.lastName}
                          </span>
                          {conv.lastMessage && (
                            <div className="sidebar-chat-last-message">
                              {conv.lastMessage.senderId === userId
                                ? "You: "
                                : otherUser.firstName + ": "}
                              {conv.lastMessage.text
                                ? conv.lastMessage.text
                                : ""}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </ContextMenuTrigger>
              );
            }
            return null;
          })}
        </div>
      </div>

      {showNewMessageModal && (
        <div className="sidebar-modal-overlay">
          <div className="sidebar-modal-panel">
            <button
              onClick={() => setShowNewMessageModal(false)}
              className="sidebar-modal-close"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            <h3 className="sidebar-modal-title">New Message</h3>

            <div className="sidebar-modal-search">
              <Autocomplete
                options={searchResults}
                onInputChange={handleSearch}
                onSelect={(selectedUser) => {
                  const conversation = conversations.find(
                    (c) =>
                      c.type === "DIRECT" &&
                      c.members.some((m) => m.userId === selectedUser.id)
                  );
                  onChatSelect({
                    type: "personal",
                    user: {
                      id: selectedUser.id,
                      username: `${selectedUser.firstName} ${selectedUser.lastName}`,
                      profilePicture: selectedUser.profilePicture,
                      firstName: selectedUser.firstName,
                      lastName: selectedUser.lastName,
                    },
                    conversationId: conversation?._id || null,
                  });
                  setShowNewMessageModal(false);
                }}
                renderItem={renderUserItem}
                value={searchQuery}
                placeholder="Search users..."
                disableDropdown={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
