// reducer import
import customizationReducer from "./customizationReducer";
import chatReducer from "./chat";
import usersReducer from "./user";
import navbarReducer from "./navbar";
import messagesReducer from "./messages";
import roomReducer from "./room";
import useJwt from "utils/jwt/useJwt";

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
  customization: customizationReducer,
  auth: authReducer,
  chat: chatReducer,
  users: usersReducer,
  navbar: navbarReducer,
  messages:messagesReducer,
  room:roomReducer,
};

export default reducer;
