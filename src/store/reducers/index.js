// reducer import

import usersReducer from "./user";
import messagesReducer from "./messages";
import roomReducer from "./room";
import sendBoxConnectReducer from "./sandBoxConnect";
import messageBoxConnectReducer from "./messageBoxConnect";

// ==============================|| COMBINE REDUCER ||============================== //
// **  Initial State
const initialState = {
  userData: JSON.parse(localStorage.getItem("userData")) || null,
  accessToken:
    localStorage.getItem('accessToken') || null,
    refreshToken:
    localStorage.getItem('refreshToken') || null,
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
