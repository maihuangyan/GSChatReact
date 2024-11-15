import axios from "axios";
import { jwtDefaultConfig } from "./jwtDefaultConfig";
import OneSignal from 'react-onesignal';
import { isRefreshToken } from "utils/refreshToken";
import { store } from "store"
import { handleLogin, handleLogout } from "store/actions";

const headers = {
  headers: {
    "x-api-key": process.env.REACT_APP_X_API_KEY,
    "x-api-secret": "secret",
    "device_id": "browser",
    "device_type": "0",
    "Authorization": `Bearer ${localStorage.getItem('storageTokenKeyName')}`
  }
}
export default class JwtService {
  // ** jwtConfig <= Will be used by this service
  jwtConfig = { ...jwtDefaultConfig };

  // ** For Refreshing Token
  isAlreadyFetchingAccessToken = false;

  // ** For Refreshing Token
  subscribers = [];

  constructor(jwtOverrideConfig) {
    this.jwtConfig = { ...this.jwtConfig, ...jwtOverrideConfig };

    // ** Request Interceptor
    axios.interceptors.request.use(
      (config) => {

        // ** Get token from localStorage
        const accessToken = this.getToken();
        const refreshToken = this.getRefreshToken();

        // ** If token is present add it to request's Authorization Header
        if (OneSignal.User && OneSignal.User.PushSubscription) {
          headers.headers.device_id = OneSignal.User.PushSubscription.device_id ? OneSignal.User.PushSubscription.device_id : 'browser';
        }
        if (accessToken) {
          // ** eslint-disable-next-line no-param-reassign
          config.headers.Authorization = `${this.jwtConfig.tokenType} ${accessToken}`;
        }

        let flag = isRefreshToken(this.jwtConfig, config, store, refreshToken)
        return flag ? flag : config;

        // return config;
      },
      (error) => Promise.reject(error)
    );

    // ** Add request/response interceptor
    axios.interceptors.response.use(
      (response) => {
        if (response.data.ResponseCode === 1000004) {
          this.refreshToken()
        }
        else if (response.data.ResponseCode === 1000002 || response.data.ResponseCode === 1000003) {
          console.log(response.data.ResponseCode, 'logout: 55')
          store.dispatch(handleLogout());
        }
        else if (response.request.responseURL.endsWith(this.jwtConfig.refreshEndpoint)
          && response.data.ResponseCode === 0) {
          store.dispatch(handleLogin(response.data.ResponseResult));
        }

        return response;
      },
      (error) => {
        if (error.response) {
          console.log("error", error);
          if (error.response.status === 401) {
            store.dispatch(handleLogout());
          }
          else if (error.response.status === 403) {
            const data = {
              ResponseCode: 1000011,
              ResponseMessage: `You don't have the permisson`,
            };
            return Promise.resolve({ data });
          }
        }
        return Promise.reject(error);
      }
    );
  }

  onAccessTokenFetched(accessToken) {
    this.subscribers = this.subscribers.filter((callback) =>
      callback(accessToken)
    );
  }

  addSubscriber(callback) {
    this.subscribers.push(callback);
  }

  getToken() {
    return localStorage.getItem(this.jwtConfig.storageTokenKeyName);
  }

  getUserID() {
    return localStorage.getItem(this.jwtConfig.storageUserIDKeyName);
  }

  getUserData() {
    try {
      return JSON.parse(localStorage.getItem(this.jwtConfig.storageUserDataKeyName));
    }
    catch (e) {
      console.log('logout: 120', e);
      store.dispatch(handleLogout());
    }
  }

  getRefreshToken() {
    return localStorage.getItem(this.jwtConfig.storageRefreshTokenKeyName);
  }

  setToken(value) {
    localStorage.setItem(this.jwtConfig.storageTokenKeyName, value);
  }

  setRefreshToken(value) {
    localStorage.setItem(this.jwtConfig.storageRefreshTokenKeyName, value);
  }

  login(...args) {
    return axios.post(this.jwtConfig.loginEndpoint, ...args, headers);
  }

  postDeviceInfo(...args) {
    const changeHeader = { ...headers }
    changeHeader.headers.Authorization = args[0].Authorization
    return axios.post(this.jwtConfig.postOneSignal, ...args, changeHeader);
  }

  forgotPassword(...args) {
    return axios.post(this.jwtConfig.forgotPasswordEndpoint, ...args, headers);
  }

  resetForgotPassword(...args) {
    return axios.post(this.jwtConfig.resetForgotPasswordEndpoint, ...args, headers);
  }

  register(...args) {
    return axios.post(this.jwtConfig.registerEndpoint, ...args, headers);
  }

  resetPassword(...args) {
    return axios.post(this.jwtConfig.resetPasswordEndpoint, ...args, headers);
  }

  refreshToken() {
    headers.headers.Authorization = this.getRefreshToken();
    return axios.post(this.jwtConfig.refreshEndpoint, {}, headers);
  }

  getAllUsers() {
    return axios.get(this.jwtConfig.getAllUsersEndpoint, headers);
  }

  getOnlineList() {
    return axios.get(this.jwtConfig.getOnlineListEndpoint, headers);
  }


  loadUnreadMessages() {
    return axios.get(this.jwtConfig.loadUnreadMessagesEndpoint);
  }

  clearRoomMessages(room_id) {
    console.log({
      headers: { ...headers.headers, Authorization: "Bearer " + this.getRefreshToken() },
    })
    return axios.post(`${this.jwtConfig.clearRoomMessagesEndpoint}${room_id}`, {}, {
      headers: { ...headers.headers, Authorization: "Bearer " + this.getRefreshToken() },
    });
  }
  updateSettingsInfo(...args) {
    return axios.post(this.jwtConfig.updateConfigurationsInfoEndpoint, ...args);
  }

  getRoomList(...args) {
    return axios.get(this.jwtConfig.getRoomListEndpoint, ...args, headers);
  }

  createRoom(...args) {
    console.log(args, {
      headers: { ...headers.headers, Authorization: "Bearer " + this.getRefreshToken() },
    });
    return axios.post(this.jwtConfig.createRoomEndpoint, ...args, {
      headers: { ...headers.headers, Authorization: "Bearer " + this.getRefreshToken() },
    });
  }

  createRoomWithImg(...args) {
    return axios.post(this.jwtConfig.createRoomWithImgEndpoint, ...args, headers);
  }

  updateRoomWithImg(...args) {
    return axios.post(this.jwtConfig.updateRoomWithImgEndpoint, ...args, headers);
  }

  updateRoom(...args) {
    return axios.post(this.jwtConfig.updateRoomEndpoint, ...args, headers);
  }

  searchUsers(...args) {
    return axios.get(`${this.jwtConfig.searchUsersEndpoint}?search_key=${args[0].search_key}&status=${args[0].status}&page=${args[0].page}&limit=${args[0].limit}`, headers);
  }

  getMessages(...args) {
    return axios.get(`${this.jwtConfig.getMessagesEndpoint}/${args[0].id}?last_message_id=${args[0].last_message_id}`, headers);
  }

  getLastMessages(...args) {
    return axios.get(`${this.jwtConfig.getLastMessagesEndpoint}/${args[0].id}?last_message_id=${args[0].last_message_id}`, headers);
  }

  uploadFiles(...args) {
    return axios.post(this.jwtConfig.uploadFilesEndpoint, ...args, headers);
  }

  updateAdvisorInfo(...args) {
    return axios.post(this.jwtConfig.updateAdvisorInfoEndpoint, ...args, headers);
  }

  updateAdvisorPhoto(...args) {
    return axios.post(this.jwtConfig.updateAdvisorPhotoEndpoint, ...args, headers);
  }

}
