// ** Auth Endpoints
export const jwtDefaultConfig = {
  loginEndpoint: `${process.env.REACT_APP_BASE_API_URL}/auth/login`,
  forgotPasswordEndpoint: `${process.env.REACT_APP_BASE_API_URL}/auth/forgot_password`,
  resetForgotPasswordEndpoint: `${process.env.REACT_APP_BASE_API_URL}/auth/reset_forgot_password`,
  registerEndpoint: `${process.env.REACT_APP_BASE_API_URL}/auth/register`,
  refreshEndpoint: "/auth/refresh_token",
  logoutEndpoint: `${process.env.REACT_APP_BASE_API_URL}/auth/logout`,
  resetPasswordEndpoint: `${process.env.REACT_APP_BASE_API_URL}/auth/reset_password`,
  getAllUsersEndpoint: `${process.env.REACT_APP_BASE_API_URL}/user`,
  updateAdvisorInfoEndpoint: `${process.env.REACT_APP_BASE_API_URL}/user/update_profile`,
  updateAdvisorPhotoEndpoint: `${process.env.REACT_APP_BASE_API_URL}/user/update_photo`,
  uploadFileEndpoint: `${process.env.REACT_APP_BASE_API_URL}/user/upload`,
  loadAdvisorWorkTimes: `${process.env.REACT_APP_BASE_API_URL}/work-time`,
  setAdvisorWorkTimes: `${process.env.REACT_APP_BASE_API_URL}/work-time/set_work_times`,

  loadUnreadMessagesEndpoint: `${process.env.REACT_APP_BASE_API_URL}/message/advisor_unread_messages`,
  loadRoomsAndMessagesEndpoint: `${process.env.REACT_APP_BASE_API_URL}/message/advisor`,
  clearRoomMessagesEndpoint: `${process.env.REACT_APP_BASE_API_URL}/message/clear_room_messages/`,
  getOnlineListEndpoint: `${process.env.REACT_APP_BASE_API_URL}/online/list`,

  getRoomListEndpoint: `${process.env.REACT_APP_BASE_API_URL}/room`,
  createRoomEndpoint: `${process.env.REACT_APP_BASE_API_URL}/room`,
  searchUsersEndpoint:`${process.env.REACT_APP_BASE_API_URL}/user/search`,

  getMessagesEndpoint:`${process.env.REACT_APP_BASE_API_URL}/message/room`,
  getLastMessagesEndpoint:`${process.env.REACT_APP_BASE_API_URL}/message/last`,
  uploadFilesEndpoint:`${process.env.REACT_APP_BASE_API_URL}/message-file/uploads`,

  // ** This will be prefixed in authorization header with token
  // ? e.g. Authorization: Bearer <token>
  tokenType: "Bearer",

  // ** Value of this property will be used as key to store JWT token in storage
  storageTokenKeyName: "accessToken",
  storageUserIDKeyName: "user_id",
  storageUserDataKeyName: "userData",
  storageRefreshTokenKeyName: "refreshToken",
};
