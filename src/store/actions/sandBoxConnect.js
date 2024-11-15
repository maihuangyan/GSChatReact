
// ** change show to bottom
export const changeShowToBottom = (data) => {
  return async (dispatch) => {
    dispatch({
      type: "CHANGE_SHOW_TO_BOTTOM",
      data
    });
  };
};

// ** set typing
export const setIsTyping = (data) => {
  return async (dispatch) => {
    dispatch({
      type: "SET_IS_TYPING",
      data
    });
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

