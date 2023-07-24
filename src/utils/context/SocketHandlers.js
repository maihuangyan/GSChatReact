import useJwt from "utils/jwt/useJwt"

export const getOnlineStatuses = (chatStore) => {
  let result = {};
  if (!chatStore) {
    return result;
  }
  for (let i = 0; i < chatStore.chats.length; i++) {
    let item = chatStore.chats[i];
    result[item.room.client_id] = item.room.status
  }
  return result;
}

export const getOnlineStatus = (chatStore, userId) => {
  if (!chatStore) {
    return false;
  }
  for (let i = 0; i < chatStore.chats.length; i++) {
    let item = chatStore.chats[i];
    if (item.room.client_id == userId) {
      return item.room.status;
    }
  }
  return false;
}
