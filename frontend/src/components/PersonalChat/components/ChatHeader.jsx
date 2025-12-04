import { getUserInitials } from "../../../utils/helpers";
import { useOutletContext } from "react-router-dom";

const ChatHeader = ({ activeChat, onProfileClick }) => {
  const { handleBackToSidebar } = useOutletContext();

  return (
    <div className="personal-chat-header">
      <div className="personal-chat-header-info">
        <button
          onClick={() => window.innerWidth <= 768 && handleBackToSidebar?.()}
          className="sidebar-back-btn"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <div className="cursor-pointer" onClick={onProfileClick}>
          {activeChat.user?.profilePicture ? (
            <img
              src={activeChat.user.profilePicture}
              alt={activeChat.user.username}
              className="personal-chat-avatar"
            />
          ) : (
            <div className="personal-chat-avatar-placeholder">
              {getUserInitials(activeChat.user)}
            </div>
          )}
        </div>
        <h3
          className="personal-chat-title cursor-pointer"
          onClick={onProfileClick}
        >
          {activeChat.user.firstName && activeChat.user.lastName
            ? `${activeChat.user.firstName} ${activeChat.user.lastName}`
            : activeChat.user.username}
        </h3>
      </div>
    </div>
  );
};

export default ChatHeader;
