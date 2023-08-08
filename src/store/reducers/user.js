import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

// ** Initial State
const initialState = {
  connected_users: [],
  online_users: [],
  selectedUser: null,
};

const persistConfig = {
  key: "users",
  storage,
  whitelist: ["connected_users"], // place to select which state you want to persist
};

const users = (state = initialState, action) => {
  let connected_users;
  switch (action.type) {
    case "CONNECTED_USER_LIST":
      return { ...state, connected_users: action.data };

    case "GET_USER":
      const userID = action.data;
      let selectedUser = null;
      if (Array.isArray(state.connected_users) && state.connected_users.length > 0) {
        for (let user of state.connected_users) {
          if (user.id == userID) {
            selectedUser = user;
          }
        }
      }
      return { ...state, selectedUser: selectedUser };

    case "SET_USER":
      selectedUser = action.data;
      return { ...state, selectedUser: selectedUser };

    case "UPDATE_USER":
      connected_users = [...state.connected_users];
      for (let i = 0; i < connected_users.length; i++) {
        const user = connected_users[i];
        if (user.id == action.data.id) {
          connected_users[i] = action.data;
          break;
        }
      }
      return { ...state, connected_users, selectedUser: action.data };

    case "ADD_USER":
      connected_users = [...state.connected_users];
      let exist = false;
      for (let i = 0; i < connected_users.length; i++) { 
        const user = connected_users[i];
        if (user.id == action.data.id) {
          connected_users[i] = action.data;
          break;
        }
      }
      if (!exist) {
        connected_users.push(action.data);
      }
      return { ...state, connected_users };

    case "DELETE_USER":
      const user_id = action.data;
      connected_users = [...state.connected_users];
      for (let i = 0; i < connected_users.length; i++) {
        const user = connected_users[i];
        if (user.id == user_id) {
          connected_users.splice(i, 1);
          break;
        }
      }
      return { ...state, connected_users };

    default:
      return { ...state };
  }
};
export default persistReducer(persistConfig, users);
