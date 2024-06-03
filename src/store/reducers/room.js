import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { isMessageSeen, sortMessages } from "utils/common";

// ** Initial State
const initialState = {
    rooms: [],
    selectedRoom: {},
    unreadCount: [],
};

const persistConfig = {
    key: "rooms",
    storage,
    whitelist: ["rooms", "selectedRoom", "unreadCount"], // place to select which state you want to persist
};

const roomReducer = (state = initialState, action) => {
    let rooms;
    switch (action.type) {
        case "GET_ROOM_LIST":
            return { ...state, rooms: action.data };
        case "CREATE_ROOM":
            rooms = [...state.rooms];
            rooms.push(action.data);
            return { ...state, rooms };

        case "SELECT_ROOM":
            return { ...state, selectedRoom: action.data };

        case "SELECT_ROOM_CLEAR":
            return { ...state, selectedRoom: {} };

        case "UPDATE_LATEST_MESSAGE":
            return updateLatestMessage(state, action.data);

        case "RESET_UNREAD_MESSAGE_COUNT":
            return resetUnreadMessageCount(state, action.data);

        case "INSERT_ROOM_USER" :
            const roomUser = action.data;
            // console.log('INSERT_ROOM_USER', roomUser);
            rooms = state.rooms;
            let room = findRoom(rooms, roomUser.room_id);
            let selectedRoom = state.selectedRoom;
            if (room) {
                room = updateRoomUser(room, roomUser.user_id, roomUser);
                rooms = updateRoom(rooms, roomUser.room_id, room);
                if (room.id == selectedRoom.id) {
                    selectedRoom = room;
                }
            }
            // console.log({ ...state, rooms, selectedRoom });
            return { ...state, rooms, selectedRoom }
        default:
            return state;
    }
};

const findRoom = (rooms, room_id) => {
    if (!rooms) return null;
    for (let i = 0; i < rooms.length; i++) {
        if (rooms[i].id == room_id) return rooms[i];
    }
    return null;
}

const updateRoom = (rooms, room_id, update) => {
    for (let i = 0; i < rooms.length; i++) {
        if (rooms[i].id == room_id) {
            rooms[i] = update;
            return rooms;
        }
    }
    rooms.push(update);
    return rooms;
}

const updateRoomUser = (room, user_id, update) => {
    if (room.room_users) {
        for (let i = 0; i < room.room_users.length; i++) {
            if (room.room_users[i].user_id == user_id) {
                room.room_users[i] = update;
                return room;
            }
        }
        room.room_users.push(update);
        return room;
    } else {
        room.room_users = [update];
        return room;
    }
}

const resetUnreadMessageCount = (state, data) => {
    if (data.unread_count == null) {
        return state;
    }

    const rooms = [...state.rooms];
    for (let i = 0; i < rooms.length; i++) {
        if (rooms[i].id == data.room_id) {
            rooms[i].unread_count = data.unread_count;
            return { ...state, rooms: rooms }
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

    // console.log('update latest room', state.selectedRoom);
    const rooms = [...state.rooms];
    const selectedRoom = state.selectedRoom;
    for (let i = 0; i < state.rooms.length; i++) {
        const latestMessage = sortMessages(messages)[0];
        if (rooms[i].id == latestMessage.room_id && (!rooms[i].last_message || rooms[i].last_message.created_at < latestMessage.created_at)) {
            rooms[i].last_message = latestMessage;
            if (selectedRoom && rooms[i].id != selectedRoom.id) {
                rooms[i].unread_count++;
            }
            return { ...state, rooms: rooms }
        }
    }

    return state
}


export default persistReducer(persistConfig, roomReducer);
