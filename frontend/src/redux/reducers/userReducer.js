import { ACTION_TYPES } from '../actionTypes';

const initialState = {
  user: null
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_USER:
      return {
        ...state,
        user: action.payload
      };
    case ACTION_TYPES.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    case ACTION_TYPES.CLEAR_USER:
      return {
        ...state,
        user: null
      };
    default:
      return state;
  }
};

export default userReducer;