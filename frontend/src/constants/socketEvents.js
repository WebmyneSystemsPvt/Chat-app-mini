export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  CONNECTION_INIT: 'connection:init',
  CONNECTION_DISCONNECT: 'connection:disconnect',
  
  // User events
  USER_PROFILE_UPDATED: 'user:profileUpdated',
  USER_UPDATE_PROFILE: 'user:updateProfile',
  
  // Message events
  MESSAGE_SEND: 'message:send',
  MESSAGE_RECEIVE: 'message:receive',
  MESSAGE_DELETE: 'message:delete',
  MESSAGE_DELETED: 'message:deleted',

  // conversations
  CONVERSATION_UPDATED: "conversation:updated",

  // Join Chat
  JOIN_CHAT: "conversation:join",
};