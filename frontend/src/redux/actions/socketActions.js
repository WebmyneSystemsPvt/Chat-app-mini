import { ACTION_TYPES } from "../actionTypes";

export const setSocket = (payload) => {
  return {
    type: ACTION_TYPES.SET_SOCKET,
    payload: payload,
  };
};
