import useJwt from "@/utils/jwt/useJwt";
import { handleLogout } from "@/store/actions";

// ** Get all Data
export const getRoomList = () => {

  return async (dispatch) => {
    useJwt
      .getRoomList()
      .then((res) => {
        if (res.data.ResponseCode === 0) {
          let data = res.data.ResponseResult
          let connected_users = []
          for (let room of data) {
            for (let user of room.room_users) {
              connected_users.push(user)
            }
          }
          dispatch({
            type: "CONNECTED_USER_LIST",
            data: connected_users,
          });

          dispatch({
            type: "GET_ROOM_LIST",
            data,
          });
        } else {
          console.log(res.data.ResponseCode);
        }
      })
      .catch((err) => {
        if(err.status === 401){
          console.log("66666")
          dispatch(handleLogout())
        }
      });
  };
};

// ** create room
export const createRoom = (user) => {
  return (dispatch, getState) => {
    dispatch({
      type: "CREATE_ROOM",
      data: user,
    });
  };
};

export const insertRoomUser = (roomUser) => {
  return (dispatch) => {
    dispatch({ type: "INSERT_ROOM_USER", data: roomUser });
  }
}

// ** Select Chat
export const selectRoom = (room) => {
  return (dispatch) => {
    dispatch({ type: "SELECT_ROOM", data: room });
  };
};

export const resetUnreadCount = (payload) => {
  return (dispatch) => {
    dispatch({
      type: "RESET_UNREAD_MESSAGE_COUNT",
      data: payload
    });
  };
}

export const calculateUnSeenCount = (payload) => {
  return (dispatch) => {
    dispatch({
      type: "CALCULATE_UNSEEN_MESSAGE_COUNT",
      data: payload
    });
  };
}

export const updateRoomLastMessage = (messages) => {
  return (dispatch) => {
    dispatch({
      type: "UPDATE_LATEST_MESSAGE",
      data: messages,
    });
  };
}

export const selectRoomClear = () => {
  return (dispatch) => {
    dispatch({
      type: "SELECT_ROOM_CLEAR",
    });
  };
}
