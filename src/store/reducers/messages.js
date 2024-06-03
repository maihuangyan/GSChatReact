import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const initialState = {
    messages: {},
    change: false,
    receiveMessage: [],
};

const persistConfig = {
    key: "messages",
    storage,
    whitelist: ["messages", "change", "receiveMessage"], // place to select which state you want to persist
};

const messagesReducer = (state = initialState, action) => {
    switch (action.type) {
        case "INSERT_MESSAGES":
            return addMessages(state, action.data);

        case "UPDATE_MESSAGES":
            return addOrUpdateMessages(state, action.data);

        case "DELETE_MESSAGES":
            return deleteMessages(state, action.data);

        case "CLEAR_ROOM_MESSAGES":
            const stateMessages = { ...state.messages }
            const room_id = action.data;
            console.log('CLEAR_ROOM_MESSAGES', state, action);
            stateMessages[room_id] = [];
            return { ...state, messages: stateMessages }

        case "RECEIVE_MESSAGES":
            const receiveMessage = state.receiveMessage
            receiveMessage.push(1)
            return { ...state, receiveMessage };
        case "AUDIO_MESSAGES":
            const audioMessage = state.receiveMessage
            audioMessage.pop()
            return { ...state, receiveMessage: audioMessage };

        default:
            return state;
    }
}

const addMessages = (state, messages) => {
    if (messages.length === 0) {
        return state
    }

    const stateMessages = { ...state.messages }
    const room_id = messages[0].room_id;
    const roomMessages = [...(stateMessages[room_id] ? [...stateMessages[room_id]] : []), ...messages];
    stateMessages[room_id] = roomMessages;

    return { ...state, messages: stateMessages, change: !state.change }
}

const addOrUpdateMessages = (state, messages) => {
    if (messages.length === 0) {
        return state
    }

    const stateMessages = { ...state.messages }
    const room_id = messages[0].room_id;
    const roomMessages = stateMessages[room_id] ? [...stateMessages[room_id]] : [];

    for (const km of messages) {
        let isNew = true;

        for (let j = 0; j < roomMessages.length; j++) {
            let im = { ...roomMessages[j] };
            if (im.local_id === km.local_id) {
                isNew = false;
                roomMessages[j] = km;
                break;
            }
        }
        if (isNew) {
            roomMessages.push(km);
        }
    }


    stateMessages[room_id] = roomMessages;
    return { ...state, messages: stateMessages, change: !state.change }
}

const deleteMessages = (state, message_ids) => {
    if (message_ids.length == 0) return state

    let firstMessage = null;
    const stateMessages = { ...state.messages }
    for (const [room_id, messages] of Object.entries(stateMessages)) {
        for (let item of messages) {
            if (item.id == message_ids[0]) {
                firstMessage = { ...item };
            }
        }
    }

    if (firstMessage) {
        const roomId = firstMessage.room_id;
        const roomMessages = stateMessages[roomId] ? [...stateMessages[roomId]] : [];
        const newArray = roomMessages.filter(message => message_ids.indexOf(message.id) === -1);
        stateMessages[roomId] = newArray;
        return { ...state, messages: stateMessages, change: !state.change }
    }

    return state
}

export default persistReducer(persistConfig, messagesReducer);