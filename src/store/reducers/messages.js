import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const initialState = {
    messages: [],
    lastMessage: {},
};

const persistConfig = {
    key: "messages",
    storage,
    whitelist: ["messages", "lastMessage"], // place to select which state you want to persist
};

const messagesReducer = (state = initialState, action) => {
    switch (action.type) {
        case "GET_MESSAGES":
            return { ...state, messages: action.data };

        case "GET_LAST_MESSAGES":
            return { ...state, lastMessage: action.data };

        default:
            return state;
    }

}

export default persistReducer(persistConfig, messagesReducer);