import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

// ** Initial State
const initialState = {
  isReply: false,
  replyMessage: null,
  editingMessage: null,
  isForward: false,
  forwardMessage: null,
};

const persistConfig = {
  key: "messageBox",
  storage,
  whitelist: [], // place to select which state you want to persist
};

const messageBoxConnect = (state = initialState, action) => {
  switch (action.type) {
    case "SET_IS_REPLY":
      return { ...state, isReply: action.data };
    case "SET_REPLY_MESSAGE":
      return { ...state, replyMessage: action.data };
    case "SET_EDITING_MESSAGE":
      return { ...state, editingMessage: action.data };
    case "SET_IS_FORWARD":
      return { ...state, isForward: action.data };
    case "SET_FORWARD_MESSAGE":
      return { ...state, forwardMessage: action.data };

    default:
      return { ...state };
  }
};
export default persistReducer(persistConfig, messageBoxConnect);
