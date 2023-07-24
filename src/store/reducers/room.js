import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

// ** Initial State
const initialState = {
    chats: [],
    selectedRoom: {},
    selectRoomID: "",
};

const persistConfig = {
    key: "rooms",
    storage,
    whitelist: ["chats", "selectedRoom"], // place to select which state you want to persist
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

        case "SELECT_ROOM_ID":
            return { ...state, selectRoomID: action.data };

        case "SELECT_ROOM":
            return { ...state, selectedRoom: action.data };

        case "SELECT_ROOM":
            return { ...state, selectedRoom: action.data };

        default:
            return { ...state };
    }
};
export default persistReducer(persistConfig, roomReducer);
