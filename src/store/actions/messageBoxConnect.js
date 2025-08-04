
// ** change show to bottom
export const setReplyMessage = (data) => {
  return async (dispatch) => {
    dispatch({
      type: "SET_REPLY_MESSAGE",
      data
    });
  };
};

// ** set typing
export const setIsReply = (data) => {
  return async (dispatch) => {
    dispatch({
      type: "SET_IS_REPLY",
      data
    });
  };
};
// ** set edit message
export const setEditingMessage = (data) => {
  return async (dispatch) => {
    dispatch({
      type: "SET_EDITING_MESSAGE",
      data
    });
  };
};

export const setIsForward = (data) => {
  return async (dispatch) => {
    dispatch({
      type: "SET_IS_FORWARD",
      data
    });
  };
};

export const setForwardMessage = (data) => {
  return async (dispatch) => {
    dispatch({
      type: "SET_FORWARD_MESSAGE",
      data
    });
  };
};


export const setCurrentTyping = (data) => {
  return (dispatch) => {
      dispatch({
          type: "SET_CURRENT_TYPING",
          data,
      });
  };
}