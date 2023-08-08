// ** UseJWT import to get config
import { useContext } from "react";
import { LoaderContext } from "utils/context/ProgressLoader";
import useJwt from "utils/jwt/useJwt";

// action - customization reducer
export const SET_MENU = "@customization/SET_MENU";
export const MENU_TOGGLE = "@customization/MENU_TOGGLE";
export const MENU_OPEN = "@customization/MENU_OPEN";
export const SET_FONT_FAMILY = "@customization/SET_FONT_FAMILY";
export const SET_BORDER_RADIUS = "@customization/SET_BORDER_RADIUS";

const config = useJwt.jwtConfig;

// ** Handle User Login
export const handleLogin = (data) => {
  return (dispatch) => {
    // ** Add to user, accessToken & refreshToken to localStorage
    localStorage.setItem("userData", JSON.stringify(data.user));
    localStorage.setItem(config.storageUserIDKeyName, data.user.id);
    localStorage.setItem(config.storageTokenKeyName, data.access_token);
    localStorage.setItem(config.storageRefreshTokenKeyName, data.access_token);

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
    localStorage.removeItem("total_asset");
    localStorage.removeItem(config.storageUserIDKeyName);
    localStorage.removeItem(config.storageTokenKeyName);
    localStorage.removeItem(config.storageRefreshTokenKeyName);

    dispatch({ type: "GET_MESSAGES", data: [] });
    dispatch({ type: "GET_LAST_MESSAGES", data: [] });
    dispatch({ type: "GET_ROOM_LIST", data: [] });
    dispatch({ type: "SELECT_ROOM", data: {} });

    setTimeout(function () {
      dispatch({
        type: "LOGOUT",
        [config.storageTokenKeyName]: null,
        [config.storageRefreshTokenKeyName]: null,
      });
    }, 100);
  };
};
