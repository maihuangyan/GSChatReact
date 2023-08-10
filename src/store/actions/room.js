import useJwt from "utils/jwt/useJwt";

// ** Get all Data
export const getRoomList = () => {

  return async (dispatch) => {
    useJwt
      .getRoomList()
      .then((res) => {
        if (res.data.ResponseCode == 0) {
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

          // let unreadCount = data.map(item => {
          //   return { room_id: item.id, unread_count: item.unread_count }
          // })

          // dispatch({
          //   type: "GET_UNREAD_COUNT",
          //   data: unreadCount,
          // });

          dispatch({
            type: "GET_ROOM_LIST",
            data,
          });
        } else {
          console.log(res.data.ResponseCode);
        }
      })
      .catch((err) => console.log(err));
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

// ** Select Chat
export const selectRoom = (room) => {
  return (dispatch) => {
    dispatch({ type: "SELECT_ROOM", data: room });
  };
};

export const resetUnreadCount = (room_id, unread_count) => {
  return (dispatch) => {
    dispatch({
      type: "RESET_UNREAD_MESSAGE_COUNT",
      data: {
        room_id,
        unread_count,
      }
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