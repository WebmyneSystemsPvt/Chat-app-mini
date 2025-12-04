import { ACTION_TYPES } from "../actionTypes";

const initialState = {
  conversations: [],
};

const conversationReducer = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_CONVERSATIONS:
      return {
        ...state,
        conversations: Array.isArray(action.payload) ? action.payload : [],
      };
    case ACTION_TYPES.UPDATE_CONVERSATIONS: {
      const uniqueConvs = new Map();

      state.conversations.forEach((conv) => {
        uniqueConvs.set(conv._id, conv);
      });

      if (Array.isArray(action.payload)) {
        action.payload.forEach((conv) => {
          uniqueConvs.set(conv._id, conv);
        });
      } else if (action.payload?._id) {
        uniqueConvs.set(action.payload?._id, action.payload);
      }

      return {
        ...state,
        conversations: [...uniqueConvs.values()],
      };
    }

    default:
      return state;
  }
};

export default conversationReducer;
