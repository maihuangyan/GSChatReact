// ** UseJWT import to get config
import useJwt from "utils/jwt/useJwt";
// import { setTokenOverdueTime } from "utils/refreshToken";
const config = useJwt.jwtConfig;

// ** Handle User Login
export const handleLogin = (data) => {
  return (dispatch) => {
    // ** Add to user, accessToken & refreshToken to localStorage
    localStorage.setItem("userData", JSON.stringify(data.user));
    localStorage.setItem(config.storageUserIDKeyName, data.user.id);
    localStorage.setItem(config.storageTokenKeyName, data.access_token);
    localStorage.setItem(config.storageRefreshTokenKeyName, data.access_token);
    // localStorage.setItem("tokenOverdueTime", setTokenOverdueTime());

    setTimeout(function () {
      dispatch({
        type: "LOGIN",
        data: data.user,
        [config.storageTokenKeyName]: data.access_token,
        [config.storageRefreshTokenKeyName]: data.access_token,
      });
    }, 100);
  };
};

// ** Handle User Logout
export const handleLogout = () => {
  return (dispatch) => {
    // ** Remove user, accessToken & refreshToken from localStorage
    localStorage.removeItem("userData");
    localStorage.removeItem(config.storageUserIDKeyName);
    localStorage.removeItem(config.storageRefreshTokenKeyName);
    // localStorage.removeItem("tokenOverdueTime");
    dispatch({ type: "GET_MESSAGES", data: [] });
    dispatch({ type: "GET_LAST_MESSAGES", data: [] });
    dispatch({ type: "GET_ROOM_LIST", data: [] });
    dispatch({ type: "SELECT_ROOM", data: {} });
    dispatch({ type: "CALCULATE_UNSEEN_MESSAGE_COUNT_CLEAR"});
    dispatch({ type: "CLOSE_ALL_MESSAGES"});
    dispatch({ type: "CLEAR_ROOMS"});
    dispatch({ type: "CLEAR_USER"});

    setTimeout(function () {
      dispatch({
        type: "LOGOUT",
        [config.storageTokenKeyName]: null,
        [config.storageRefreshTokenKeyName]: null,
      });
    }, 100);
  };
};
