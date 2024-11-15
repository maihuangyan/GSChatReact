// reducer import
import customizationReducer from "./customizationReducer";

import useJwt from "utils/jwt/useJwt";
import usersReducer from "./user";
import messagesReducer from "./messages";
import roomReducer from "./room";
import sendBoxConnectReducer from "./sandBoxConnect";
import messageBoxConnectReducer from "./messageBoxConnect";
const config = useJwt.jwtConfig;

// ==============================|| COMBINE REDUCER ||============================== //
// **  Initial State
const initialState = {
  userData: JSON.parse(localStorage.getItem("userData")) || null,
  [config.storageTokenKeyName]:
    localStorage.getItem(config.storageTokenKeyName) || null,
  [config.storageRefreshTokenKeyName]:
    localStorage.getItem(config.storageRefreshTokenKeyName) || null,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case "LOGIN":
      const loginObj = { ...action };
      return { ...state, userData: action.data, ...loginObj };

    case "LOGOUT":
      const logoutObj = { ...action };
      return { ...state, userData: null, ...logoutObj };

    default:
      return state;
  }
};

const reducer = {
  auth: authReducer,
  users: usersReducer,
  messages: messagesReducer,
  room: roomReducer,
  sendBoxConnect: sendBoxConnectReducer,
  messageBoxConnect: messageBoxConnectReducer,
};

export default reducer;
