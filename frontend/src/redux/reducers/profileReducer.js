import { ACTION_TYPES } from '../actionTypes';

const initialState = {
  profile: null
};

const profileReducer = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_PROFILE:
      return {
        ...state,
        profile: action.payload
      };
    case ACTION_TYPES.UPDATE_PROFILE:
      return {
        ...state,
        profile: { ...state.profile, ...action.payload }
      };
    default:
      return state;
  }
};

export default profileReducer;