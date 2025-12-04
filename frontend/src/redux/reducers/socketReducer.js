import { ACTION_TYPES } from "../actionTypes";

const initialState = null;

const socketReducer = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_SOCKET:
      return action.payload;
    default:
      return state;
  }
};

export default socketReducer;
