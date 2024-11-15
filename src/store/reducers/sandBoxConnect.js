import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

// ** Initial State
const initialState = {
  showToBottom: false,
  isTyping: false,
  all_users: [],
  selectedUser: null,
};

const persistConfig = {
  key: "users",
  storage,
  whitelist: ["connected_users"], // place to select which state you want to persist
};

const sandBoxConnect = (state = initialState, action) => {
  switch (action.type) {
    case "CHANGE_SHOW_TO_BOTTOM":
      return { ...state, showToBottom: action.data };

    case "SET_IS_TYPING":
      return { ...state, isTyping: action.data };

    default:
      return { ...state };
  }
};
export default persistReducer(persistConfig, sandBoxConnect);
