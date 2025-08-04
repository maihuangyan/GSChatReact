// ** UseJWT import to get config
import { calculateUnSeenCount } from "../actions/room"
import { setSocketConnection } from "../actions/user";

// ** Handle User Login
export const handleLogin = (data) => {
  return (dispatch) => {
    // ** Add to user, accessToken & refreshToken to localStorage
    localStorage.setItem("userData", JSON.stringify(data.user));
    localStorage.setItem("user_id", data.user.id);
    localStorage.setItem('accessToken', data.access_token);
    localStorage.setItem('refreshToken', data.access_token);

      dispatch(setSocketConnection(false))
      dispatch(calculateUnSeenCount())
      dispatch({
        type: "LOGIN",
        data: data.user,
        'accessToken': data.access_token,
        'refreshToken': data.access_token,
      });
  };
};

// ** Handle User Logout
export const handleLogout = () => {
  return (dispatch) => {
    // ** Remove user, accessToken & refreshToken from localStorage
    localStorage.removeItem("userData");
    localStorage.removeItem("user_id");
    localStorage.removeItem('refreshToken');
    dispatch({ type: "GET_MESSAGES", data: [] });
    dispatch({ type: "GET_LAST_MESSAGES", data: [] });
    dispatch({ type: "GET_ROOM_LIST", data: [] });
    dispatch({ type: "SELECT_ROOM", data: {} });
    dispatch({ type: "CALCULATE_UNSEEN_MESSAGE_COUNT_CLEAR"});
    dispatch({ type: "CLOSE_ALL_MESSAGES"});
    dispatch({ type: "CLEAR_ROOMS"});
    dispatch({ type: "CLEAR_USER"});
    dispatch({ type: "SET_SEND_MSG", data: ''});

    setTimeout(function () {
      dispatch({
        type: "LOGOUT",
        'accessToken': null,
        'refreshToken': null,
      });
    }, 100);
  };
};
