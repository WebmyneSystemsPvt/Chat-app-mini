import { ACTION_TYPES } from '../actionTypes';

export const setConversations = (conversations) => ({
  type: ACTION_TYPES.SET_CONVERSATIONS,
  payload: conversations
});

export const updateConversations = (conversations) => ({
  type: ACTION_TYPES.UPDATE_CONVERSATIONS,
  payload: conversations
});
