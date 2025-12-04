import { combineReducers } from "redux";
import profileReducer from "./reducers/profileReducer";
import userReducer from "./reducers/userReducer";
import conversationReducer from "./reducers/conversationReducer";
import socketReducer from "./reducers/socketReducer";

const appReducer = combineReducers({
  profile: profileReducer,
  user: userReducer,
  conversations: conversationReducer,
  socket: socketReducer,
});

const rootReducer = (state, action) => {
  if (action.type === "LOGOUT") {
    state = undefined;
  }
  return appReducer(state, action);
};

export default rootReducer;
