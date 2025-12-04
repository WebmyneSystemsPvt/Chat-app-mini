import React from "react";

function DeleteMessageModal({ show, targetMessage, onClose, onDelete }) {
  if (!show || !targetMessage || !targetMessage.msg) return null;
  const isSender = targetMessage.role === "sender";
  const messageId = targetMessage.msg._id || targetMessage.msg.id;

  return (
    <div className="delete-modal-overlay">
      <div className="delete-modal-backdrop" onClick={onClose} />
      <div className="delete-modal-panel">
        <div className="delete-modal-content">
          <div className="delete-modal-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm1 15h-2v-2h2Zm0-4h-2V7h2Z" />
            </svg>
          </div>
          <div className="delete-modal-text">
            <h4 className="delete-modal-title">Delete message?</h4>
          </div>
        </div>
        <div className="delete-modal-actions">
          <button
            className="delete-modal-btn-cancel"
            onClick={() => onDelete(messageId, false)}
          >
            Delete for me
          </button>
          {(isSender) && (
            <button
              className="delete-modal-btn-delete"
              onClick={() => onDelete(messageId, true)}
            >
              Delete for everyone
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default DeleteMessageModal;
