import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { isMessageSeen, sortMessages } from "utils/common";

// ** Initial State
const initialState = {
    chats: [],
    selectedRoom: {},
    unreadCount: [],
};

const persistConfig = {
    key: "rooms",
    storage,
    whitelist: ["chats", "selectedRoom", "unreadCount"], // place to select which state you want to persist
};

const roomReducer = (state = initialState, action) => {
    let chats;
    switch (action.type) {
        case "GET_ROOM_LIST":
            return { ...state, chats: action.data };

        case "CREATE_ROOM":
            chats = [...state.chats];
            chats.push(action.data);
            return { ...state, chats };

        case "SELECT_ROOM":
            return { ...state, selectedRoom: action.data };

        case "SELECT_ROOM_CLEAR":
            return { ...state, selectedRoom: {} };

        case "UPDATE_LATEST_MESSAGE":
            return updateLatestMessage(state, action.data);

        case "RESET_UNREAD_MESSAGE_COUNT":
            return resetUnreadMessageCount(state, action.data);

        default:
            return state;
    }
};

const resetUnreadMessageCount = (state, data) => {

    if (!data.unread_count) {
        return state;
    }

    const chats = [...state.chats];
    for (let i = 0; i < state.chats.length; i++) {
        const room = { ...chats[i] };
        if (room.id == data.room_id) {
            room.unread_count = data.unreadCount;
            chats[i] = room;
            return { ...state, chats: chats }
        }
    }

    return state
}

const calculateUnSeenMessagesCount = (messages) => {
    if (messages.length === 0) return 0;

    let result = 0;
    for (let i = 0; i < messages.length; i++) {
        const item = messages[i];
        if (!isMessageSeen(item)) {
            result++;
        }
    }
    return result;
};

const updateLatestMessage = (state, messages) => {
    if (messages.length === 0) return state;

    const chats = [...state.chats];
    for (let i = 0; i < state.chats.length; i++) {
        const room = { ...chats[i] };
        const latestMessage = sortMessages(messages)[0];
        if (room.id == latestMessage.room_id && (!room.last_message || room.last_message.created_at < latestMessage.created_at)) {
            room.last_message = latestMessage
            room.unread_count += calculateUnSeenMessagesCount(messages);
            chats[i] = room;
            return { ...state, chats: chats }
        }
    }

    return state
}


export default persistReducer(persistConfig, roomReducer);
