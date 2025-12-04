import { ACTION_TYPES } from "../actionTypes";

export const fetchProfile = () => ({
  type: ACTION_TYPES.FETCH_PROFILE,
});

export const setProfile = (profile) => ({
  type: ACTION_TYPES.SET_PROFILE,
  payload: profile,
});

export const updateProfile = (userData) => {
  return {
    type: ACTION_TYPES.UPDATE_PROFILE,
    payload: userData,
  };
};
