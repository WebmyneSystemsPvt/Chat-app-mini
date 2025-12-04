export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const playNotificationSound = () => {
  try {
    const audio = new Audio("/notification.wav");
    audio.play().catch(() => {});
  } catch (err) {
    console.error("Sound play failed:", err);
  }
};

export const showDesktopNotification = (msg, senderName) => {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const body = msg.content?.type === "image" ? "📷 Image" : "New message";
  const notification = new Notification(senderName, {
    body,
  });

  notification.onclick = () => {
    window.focus();
  };
};

export const requestNotificationPermission = () => {
  if (!("Notification" in window)) return;

  if (Notification.permission === "default") {
    Notification.requestPermission().then((permission) => {
      console.log("Notification permission:", permission);
    });
  }
};

export const formatMessageTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getUserDisplayName = (user) => {
  if (!user) return "Unknown";
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.username || user.name || "Unknown";
};

export const getUserInitials = (user) => {
  if (!user) return "?";
  if (user.firstName) {
    return user.firstName.charAt(0).toUpperCase();
  }
  if (user.username) {
    return user.username.charAt(0).toUpperCase();
  }
  return "?";
};
