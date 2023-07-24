import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

// ** Initial State
const initialState = {
  allData: [],
  data: [],
  total: 1,
  params: {},
  selectedUser: null,
};

const persistConfig = {
  key: "users",
  storage,
  whitelist: ["allData", "data", "params", "total", "selectedUser"], // place to select which state you want to persist
};

const users = (state = initialState, action) => {
  let allData, data;
  switch (action.type) {
    case "GET_ALL_DATA":
      return { ...state, allData: action.data };

    case "GET_DATA":
      return {
        ...state,
        data: action.data,
        total: action.totalPages,
        params: action.params,
      };

    case "GET_USER":
      const userID = action.data;
      let selectedUser = null;
      if (Array.isArray(state.allData) && state.allData.length > 0) {
        for (let user of state.allData) {
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
      allData = [...state.allData];
      for (let i = 0; i < allData.length; i++) {
        const user = allData[i];
        if (user.id == action.data.id) {
          allData[i] = action.data;
          break;
        }
      }
      data = [...state.data];
      for (let i = 0; i < data.length; i++) {
        const user = data[i];
        if (user.id == action.data.id) {
          data[i] = action.data;
          break;
        }
      }
      return { ...state, allData, data, selectedUser: action.data };

    case "ADD_USER":
      allData = [...state.allData];
      allData.push(action.data);
      data = [...state.data];
      data.push(action.data);
      return { ...state, allData, data };

    case "DELETE_USER":
      const user_id = action.data;
      allData = [...state.allData];
      for (let i = 0; i < allData.length; i++) {
        const user = allData[i];
        if (user.id == user_id) {
          allData.splice(i, 1);
          break;
        }
      }
      data = [...state.data];
      for (let i = 0; i < data.length; i++) {
        const user = data[i];
        if (user.id == user_id) {
          data.splice(i, 1);
          break;
        }
      }
      return { ...state, allData, data, selectedUser: null };

    default:
      return { ...state };
  }
};
export default persistReducer(persistConfig, users);
