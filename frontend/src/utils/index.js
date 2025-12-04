if (typeof crypto === "undefined") globalThis.crypto = {};
if (typeof crypto.randomUUID !== "function") {
  crypto.randomUUID = function () {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };
}

export function stringifyIfObject(obj) {
  if (typeof obj === "string") return obj;

  if (typeof obj === "object") {
    return JSON.stringify(obj);
  }

  if (!obj) return "";

  return String(obj);
}

export function safeJSONParse(payload) {
  try {
    if (typeof payload !== "string") return payload;

    return JSON.parse(payload);
  } catch (err) {
    return payload;
  }
}


const listeners = new Set();



export const notifyChatCleared = (conversationId) => {
  for (const cb of listeners) cb(conversationId);
};