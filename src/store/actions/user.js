import useJwt from "utils/jwt/useJwt";

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
