import useJwt from "utils/jwt/useJwt";

// ** Get messages
export const getMessages = (payload) => {
    return async (dispatch) => {
        useJwt
            .getMessages(payload)
            .then((res) => {
                if (res.data.ResponseCode == 0) {
                    let data = res.data.ResponseResult
                    console.log('data', data)
                    dispatch({
                        type: "UPDATE_MESSAGES",
                        data,
                    });
                } else {
                    console.log(res.data.ResponseCode);
                }
            })
            .catch((err) => console.log(err));
    };
};

// ** Get last messages
export const getLastMessages = (payload) => {
    return async (dispatch) => {
        useJwt
            .getLastMessages(payload)
            .then((res) => {
                if (res.data.ResponseCode == 0) {
                    let data = res.data.ResponseResult
                    dispatch({
                        type: "UPDATE_MESSAGES",
                        data,
                    });
                } else {
                    console.log(res.data.ResponseCode);
                }
            })
            .catch((err) => console.log(err));
    };
};

export const reduxInsertMessages = (messages) => {
    return (dispatch) => {
        dispatch({
            type: "INSERT_MESSAGES",
            data: messages,
        });
    }
}

export const reduxUpdateMessages = (messages) => {
    return (dispatch) => {
        dispatch({
            type: "UPDATE_MESSAGES",
            data: messages,
        });
    }
}

export const reduxDeleteMessages = (message_ids) => {
    return (dispatch) => {
        dispatch({
            type: "DELETE_MESSAGES",
            data: message_ids,
        });
    }
}