import { ACTION_TYPES } from '../actionTypes';

export const setUser = (user) => ({
  type: ACTION_TYPES.SET_USER,
  payload: user
});

export const updateUser = (user) => ({
  type: ACTION_TYPES.UPDATE_USER,
  payload: user
});

export const clearUser = () => ({
  type: ACTION_TYPES.CLEAR_USER
});