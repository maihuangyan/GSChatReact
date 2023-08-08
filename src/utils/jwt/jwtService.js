import axios from "axios";
import { jwtDefaultConfig } from "./jwtDefaultConfig";
import { messageService } from "./messageService";

const headers = {
  headers: {
    "x-api-key": process.env.REACT_APP_X_API_KEY,
    "x-api-secret": "asdf",
    "device_id": "device_id",
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

        // ** If token is present add it to request's Authorization Header
        if (accessToken) {
          // ** eslint-disable-next-line no-param-reassign
          config.headers.Authorization = `${this.jwtConfig.tokenType} ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // ** Add request/response interceptor
    axios.interceptors.response.use(
      (response) => {
        if (
          response.data.ResponseCode == 1000002 ||
          response.data.ResponseCode == 1000003 ||
          response.data.ResponseCode == 1000004
        ) {
          console.log('logout: 42')
          messageService.sendMessage("Logout");
        }
        return response;
      },
      (error) => {
        // ** const { config, response: { status } } = error
        const { config, response } = error;
        const originalRequest = config;
        console.log("error", error);

        // ** if (status === 401) {
        if (response) {
          console.log("response", response);
          if (response.status === 401) {
            console.log('logout: 57')
            messageService.sendMessage("Logout");

            // if (!this.isAlreadyFetchingAccessToken) {
            //   this.isAlreadyFetchingAccessToken = true
            //   this.refreshToken().then(r => {
            //     this.isAlreadyFetchingAccessToken = false

            //     // ** Update accessToken in localStorage
            //     this.setToken(r.data.accessToken)
            //     this.setRefreshToken(r.data.refreshToken)

            //     this.onAccessTokenFetched(r.data.accessToken)
            //   })
            // }
            // const retryOriginalRequest = new Promise(resolve => {
            //   this.addSubscriber(accessToken => {
            //     // ** Make sure to assign accessToken according to your response.
            //     // ** Check: https://pixinvent.ticksy.com/ticket/2413870
            //     // ** Change Authorization header
            //     originalRequest.headers.Authorization = `${this.jwtConfig.tokenType} ${accessToken}`
            //     resolve(this.axios(originalRequest))
            //   })
            // })
            // return retryOriginalRequest
          }
          else if (response.status === 403) {
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
      messageService.sendMessage("Logout");
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
    return axios.post(this.jwtConfig.refreshEndpoint, {
      ...headers, Authorization: "Bearer" + this.getRefreshToken(),
    });
  }

  getAllUsers() {
    return axios.get(this.jwtConfig.getAllUsersEndpoint);
  }

  getOnlineList() {
    return axios.get(this.jwtConfig.getOnlineListEndpoint);
  }

  updateAdvisorInfo(...args) {
    return axios.post(this.jwtConfig.updateAdvisorInfoEndpoint, ...args);
  }

  updateAdvisorPhoto(...args) {
    return axios.post(this.jwtConfig.updateAdvisorPhotoEndpoint, ...args);
  }

  uploadFile(...args) {
    return axios.post(this.jwtConfig.uploadFileEndpoint, ...args);
  }

  loadAdvisorWorkTimes(advisor_id) {
    return axios.get(`${this.jwtConfig.loadAdvisorWorkTimes}/${advisor_id}`);
  }

  setAdvisorWorkTimes(...args) {
    return axios.post(this.jwtConfig.setAdvisorWorkTimes, ...args);
  }

  loadUnreadMessages() {
    return axios.get(this.jwtConfig.loadUnreadMessagesEndpoint);
  }

  loadRoomsAndMessages(...args) {
    return axios.get(this.jwtConfig.loadRoomsAndMessagesEndpoint, ...args);
  }

  clearRoomMessages(room_id) {
    return axios.post(`${this.jwtConfig.clearRoomMessagesEndpoint}${room_id}`);
  }

  // loadSettingsInfo() {
  //   return axios.get(this.jwtConfig.loadConfigurationsInfoEndpoint);
  // }

  updateSettingsInfo(...args) {
    return axios.post(this.jwtConfig.updateConfigurationsInfoEndpoint, ...args);
  }

  getRoomList(...args) {
    return axios.get(this.jwtConfig.getRoomListEndpoint, ...args, headers);
  }

  createRoom(...args) {
    return axios.post(this.jwtConfig.createRoomEndpoint, ...args, headers);
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

}
