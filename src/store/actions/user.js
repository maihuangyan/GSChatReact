import useJwt from "utils/jwt/useJwt";


// ** Get all User
export const getAllUsers = () => {
  return async (dispatch) => {
    useJwt
      .getAllUsers()
      .then((res) => {
        if (res.data.ResponseCode === 0) {
          let data = res.data.ResponseResult
          dispatch({
            type: "SET_ALL_USERS",
            data,
          });
        } else {
          console.log(res.data.ResponseCode);
        }
      })
      .catch((err) => console.log(err));
  };
};

// ** Get User
export const getUser = (id) => {
  return async (dispatch) => {
    dispatch({
      type: "GET_USER",
      data: id,
    });
  };
};

// ** Add new user
export const addUser = (user) => {
  return (dispatch, getState) => {
    dispatch({
      type: "ADD_USER",
      data: user,
    });
  };
};

export const updateUser = (user) => {
  return (dispatch, getState) => {
    dispatch({
      type: "UPDATE_USER",
      data: user,
    });
  };
};

// ** Delete user
export const deleteUser = (id) => {
  return (dispatch, getState) => {
    dispatch({
      type: "DELETE_USER",
      data: id,
    });
  };
};

// ** set On line Users 
export const setOnlineUsers = (data) => {
  return (dispatch, getState) => {
    dispatch({
      type: "SET_ON_LINE_USERS",
      data,
    });
  };
};

export const setSocketConnection = (data) => {
  return (dispatch, getState) => {
    dispatch({
      type: "SOCKET_CONNECTION",
      data,
    });
  };
};