import useJwt from "utils/jwt/useJwt";

// ** Get messages
export const getMessages = (payload) => {
    return async (dispatch) => {
        useJwt
            .getMessages(payload)
            .then((res) => {
                if (res.data.ResponseCode == 0) {
                    let data = res.data.ResponseResult
                    dispatch({
                        type: "GET_MESSAGES",
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
                        type: "GET_LAST_MESSAGES",
                        data,
                    });
                } else {
                    console.log(res.data.ResponseCode);
                }
            })
            .catch((err) => console.log(err));
    };
};
