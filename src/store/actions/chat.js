import useJwt from "utils/jwt/useJwt";

// ** Get Chats & Contacts
export const getChatContacts = (selectedChat, selectChatRoomID, callback) => {
  return (dispatch) => {
    useJwt.loadRoomsAndMessages().then((res) => {
      if (res.data.ResponseCode == 0) {
        const chats = res.data.ResponseResult.map((chat) => {
          const contact = chat;
          let unseenMsgs = 0;
          for (let message in chat.messages) {
            if (
              message.user_id != useJwt.getUserID() &&
              message.seen_status == 0
            ) {
              unseenMsgs++;
            }
          }
          contact.chat = {
            id: chat.room.id,
            unseenMsgs: unseenMsgs,
            lastMessage: chat.messages[0],
          };
          return contact;
        });

        //console.log("chats - ", chats);
        dispatch({
          type: "GET_CHAT_CONTACTS",
          data: chats,
        });

        if (callback)
          callback(true)

        if (selectChatRoomID) {
          console.log(selectChatRoomID);
          for (let i = 0; i < chats.length; i++) {
            let chat = chats[i];
            if (chat.room.id == selectChatRoomID) {
              dispatch(selectChat(chat));
              dispatch({ type: "SELECT_CHAT_ROOM_ID", data: 0 });
              break;
            }
          }
        } else if (
          selectedChat &&
          Object.keys(selectedChat).length > 0 &&
          selectedChat.room
        ) {
          for (let i = 0; i < chats.length; i++) {
            let chat = chats[i];
            if (chat.room.id === selectedChat.room.id) {
              dispatch(selectChat(chat));
              break;
            }
          }
        }
      }
      else {
        if (callback)
          callback(false)
      }
    })
      .catch((err) => {
        if (callback)
          callback(false)
        console.log(err)
      });
  };
};

// ** Select Chat
export const selectChat = (chat) => {
  return (dispatch) => {
    dispatch({ type: "SELECT_CHAT", data: chat });
  };
};

export const clearChat = (chat) => {
  return (dispatch) => {
    dispatch({ type: "CLEAR_CHAT", data: chat });
  };
};
