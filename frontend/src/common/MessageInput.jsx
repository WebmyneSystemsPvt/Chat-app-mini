import { useRef, useEffect, useState } from "react";
import { Send } from "lucide-react";

function MessageInput({
  messageInput,
  setMessageInput,
  onSendMessage,
  activeChat,
}) {
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (activeChat && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeChat]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (isSending) return;
    if (!messageInput.trim() === 0) return;

    setIsSending(true);


    onSendMessage({
      text: messageInput.trim(),
    });

    setMessageInput("");
    setIsSending(false);

    if (inputRef.current) inputRef.current.style.height = "48px";
  };

  const MAX_MESSAGE_LENGTH = 1024;

  const handleTextareaChange = (e) => {
    const text = e.target.value;
    if (text.length > MAX_MESSAGE_LENGTH) {
      return;
    }
    
    setMessageInput(text);
    
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
    e.target.style.overflowY = e.target.scrollHeight > 150 ? 'auto' : 'hidden';
  };

  return (
    <div className="message-input-container">
      <div className="message-input-controls">
        <div className="message-input-text-container">
          <div className="message-input-text-wrapper">
            <textarea
              ref={inputRef}
              value={messageInput}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              className="message-input-textarea"
              rows={1}
              maxLength={MAX_MESSAGE_LENGTH}
            />
          </div>
        </div>

        <button
          onClick={handleSendMessage}
          className="message-input-send-btn"
          disabled={isSending || (!messageInput.trim() === 0)}
        >
          <Send className="w-6 h-6" />
        </button>
      </div>

    </div>
  );
}

export default MessageInput;
