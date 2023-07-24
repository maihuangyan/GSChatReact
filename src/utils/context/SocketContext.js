import socket_io from "socket.io-client"
import { createContext, useCallback, useEffect, useState } from "react"
import useJwt from "utils/jwt/useJwt"
import { useDispatch, useSelector } from "react-redux"
import { getRoomList, selectRoom } from "store/actions/room"
import { getMessages } from "store/actions/messages"

import { nowSecs, randomString } from "utils/common"

import { useLocation } from "react-router"

const handleConnect = (socket) => {
  if (useJwt.getToken()) {
    //console.log("socket login", useJwt.getToken())
    socket.emit("login", { token: useJwt.getToken() })
  }
}

const handleErrors = (err) => {
  console.log("socket error", err);
};

const socket = socket_io.connect(process.env.REACT_APP_SOCKET_URL)
socket.on("connect", () => handleConnect(socket))
socket.on("connect_error", (err) => handleErrors(err))
socket.on("connect_failed", (err) => handleErrors(err))

let just_started = true;

const SocketContext = createContext()

const SocketProvider = ({ children }) => {
  const dispatch = useDispatch();
  const store = useSelector((state) => state.room);
  const message = useSelector((state) => state.messages.messages);
  const auth = useSelector((state) => state.auth);

  const [opponentTyping, setOpponentTyping] = useState({});
  const [scrollToBottom, setScrollToBottom] = useState(false);
  const [updateOnlineStatus, setUpdateOnlineStatus] = useState(false);
  const [onlineListData, setOnlineListData] = useState(null);

  useEffect(() => {
    if (auth.userData) {
      loadRoomData()
    }
  }, []);

  const loadRoomData = () => {
    if (store.chats.length) {
      // getOnlineList()
    }
    else {
      // load chat messages
      dispatch(getRoomList(), function (result) {
        if (result) {
          setTimeout(() => {
            setUpdateOnlineStatus(!updateOnlineStatus);
          }, 300);
        }
      })
    }
  }

  // const getOnlineList = () => {
  //   useJwt
  //     .getOnlineList()
  //     .then((res) => {
  //       if (res.data.ResponseCode == 0) {
  //         setOnlineListData(res.data.ResponseResult)
  //         let data = res.data.ResponseResult;
  //         let chats = [];
  //         for (let i = 0; i < store.chats.length; i++) {
  //           let item = store.chats[i];
  //           let chat = { ...item };
  //           chat.room.status = data[chat.room.id];
  //           chats.push(chat);
  //         }

  //         dispatch({
  //           type: "GET_CHAT_CONTACTS",
  //           data: chats,
  //         });
  //         setTimeout(() => {
  //           setUpdateOnlineStatus(!updateOnlineStatus);
  //         }, 3000);
  //       }
  //       else {
  //         console.log(res.data.ResponseCode);
  //       }
  //     })
  //     .catch((err) => console.log(err));
  // }

  // socket listeners
  // const handleSocketNewUser = useCallback(
  //   (newUser) => {
  //     // user joined
  //     // console.log('newUser', newUser);
  //     let onlineStatus = 0;
  //     if (newUser.token === useJwt.getToken()) {
  //       if (newUser.already_joined_user_ids) {
  //         onlineStatus = 1;
  //       }
  //     }
  //     else if (newUser.user_id !== useJwt.getUserID()) {
  //       onlineStatus = 1;
  //     }

  //     if (onlineStatus === 1) {
  //       let chats = [...store.chats];
  //       let updateChatIndex = -1;
  //       let chat = {};
  //       for (let i = 0; i < chats.length; i++) {
  //         let item = chats[i];
  //         if (item.room.id == newUser.room_id) {
  //           updateChatIndex = i;
  //           chat = { ...item };
  //           chat.room.status = 1;
  //           item.room.status = 1;
  //           break;
  //         }
  //       }

  //       //console.log("updateChatIndex on new user", updateChatIndex);
  //       if (updateChatIndex > -1) {
  //         chats[updateChatIndex] = chat;
  //         dispatch({
  //           type: "GET_CHAT_CONTACTS",
  //           data: chats,
  //         });
  //       }

  //       const selectedChat = { ...store.selectedChat };
  //       if (selectedChat && Object.keys(selectedChat).length > 0) {
  //         if (selectedChat.room && selectedChat.room.id === newUser.room_id) {
  //           let chat = { ...selectedChat };
  //           chat.room.status = 1;
  //           dispatch(selectChat(chat));
  //         }
  //       }

  //       setTimeout(() => {
  //         console.log('updateOnlineStatus on new user', updateOnlineStatus)
  //         setUpdateOnlineStatus(!updateOnlineStatus);
  //       }, 1000);
  //     }
  //   },
  //   [store, updateOnlineStatus]
  // );

  // const handleSocketUserLeft = useCallback(
  //   (userLeft) => {
  //     // user left
  //     //console.log('userLeft', userLeft);

  //     if (userLeft.user_id !== useJwt.getUserID()) {
  //       updateTyping(userLeft.room_id, false);

  //       let chats = [...store.chats];
  //       let updateChatIndex = -1;
  //       let chat = {};
  //       for (let i = 0; i < chats.length; i++) {
  //         let item = chats[i];
  //         if (item.room.id == userLeft.room_id) {
  //           updateChatIndex = i;
  //           chat = { ...item };
  //           chat.room.status = userLeft.same_accounts > 1 ? 1 : 0;
  //           item.room.status = userLeft.same_accounts > 1 ? 1 : 0;
  //           break;
  //         }
  //       }

  //       //console.log("updateChatIndex on user left", updateChatIndex);
  //       if (updateChatIndex > -1) {
  //         chats[updateChatIndex] = chat;
  //         dispatch({
  //           type: "GET_CHAT_CONTACTS",
  //           data: chats,
  //         });
  //       }

  //       const selectedChat = { ...store.selectedChat };
  //       if (selectedChat && Object.keys(selectedChat).length > 0) {
  //         if (selectedChat.room && selectedChat.room.id === userLeft.room_id) {
  //           let chat = { ...selectedChat };
  //           chat.room.status = userLeft.same_accounts > 1 ? 1 : 0;
  //           dispatch(selectChat(chat));
  //         }
  //       }

  //       setTimeout(() => {
  //         console.log('updateOnlineStatus on user left', updateOnlineStatus)
  //         setUpdateOnlineStatus(!updateOnlineStatus);
  //       }, 1000);
  //     }
  //   },
  //   [store, updateOnlineStatus]
  // );

  // const handleSocketTyping = useCallback(
  //   (typing) => {
  //     // received typing
  //     if (typing.user_id !== useJwt.getUserID()) {
  //       updateTyping(typing.room_id, typing.type === 1);
  //     }
  //   },
  //   [scrollToBottom]
  // );

  const handleSocketNewMessage = useCallback(
    (message) => {
      //console.log('new message', message);
      addOrUpdateMessages([message]);
    },
    [store]
  );

  const handleSocketUpdateMessage = useCallback(
    (messages) => {
      // updated message
      addOrUpdateMessages(messages);
    },
    [store]
  );

  const handleSocketDeleteMessage = useCallback(() => {
    // deleted message
  }, [store]);

  useEffect(() => {
    if (socket) {
      // subscribe to socket events
      // socket.on("newUser", handleSocketNewUser);
      // socket.on("typing", handleSocketTyping);
      socket.on("newMessage", handleSocketNewMessage);
      socket.on("updateMessage", handleSocketUpdateMessage);
      socket.on("deleteMessage", handleSocketDeleteMessage);
      // socket.on("userLeft", handleSocketUserLeft);
    }

    return () => {
      // unsubscribe socket events
      // socket.off("newUser", handleSocketNewUser);
      // socket.off("typing", handleSocketTyping);
      socket.off("newMessage", handleSocketNewMessage);
      socket.off("updateMessage", handleSocketUpdateMessage);
      socket.off("deleteMessage", handleSocketDeleteMessage);
      // socket.off("userLeft", handleSocketUserLeft);
    };
  }, [
    // handleSocketNewUser,
    // handleSocketTyping,
    handleSocketNewMessage,
    handleSocketUpdateMessage,
    handleSocketDeleteMessage,
    // handleSocketUserLeft
  ]);

  const updateTyping = (room_id, typing) => {
    let ot = { ...opponentTyping };
    ot[room_id] = typing;
    setOpponentTyping(ot);
    setScrollToBottom(!scrollToBottom);
  };

  const socketSendTyping = (room_id, typing) => {
    socket.emit("sendTyping", {
      token: useJwt.getToken(),
      room_id: room_id,
      type: typing, // 1: typing, 0: stopped typing
    });
  };

  const socketSendMessage = (room_id, type, message) => {
    const selectedChat = store;
    if (!selectedChat) return;

    let local_id = randomString();
    let userData = useJwt.getUserData();

    let newMessage = {
      user_id: userData.id,
      username: userData.username,
      token: useJwt.getToken(),
      room_id: room_id,
      local_id: local_id,
      type: type, // 1: text, 2: image, 3: file
      message: message,
      created_at: nowSecs(),
      updated_at: nowSecs(),
    };
    addOrUpdateMessages([newMessage]);
    socket.emit("sendMessage", newMessage);
  };

  const socketOpenMessage = (message_ids) => {
    socket.emit("openMessage", {
      token: useJwt.getToken(),
      message_ids: message_ids,
    });
  };

  const getLatestMessage = (messages) => {
    if (messages.length === 0) return null;
    if (messages.length === 1) return messages[0];

    let result = messages[0];
    for (let i = 1; i < messages.length; i++) {
      const item = messages[i];
      if (item.created_at >= result.created_at) {
        result = item;
      }
    }
    return result;
  };

  const calculateUnSeenMessagesCount = (messages) => {
    if (messages.length === 0) return 0;

    let result = 0;
    for (let i = 0; i < messages.length; i++) {
      const item = messages[i];
      if (item.seen_status !== 1) {
        result++;
      }
    }
    return result;
  };

  const addOrUpdateMessages = (messages) => {
    if (messages.length == 0) return;

    let chats = [...store.chats];
    let updatedChatIndex = -1;
    let chat = {};
    for (let i = 0; i < chats.length; i++) {
      let item = chats[i];
      if (item.id == messages[0].room_id) {
        // messages are coming from same room
        updatedChatIndex = i;
        chat = {
          room: { ...item },
          messages: [...message],
        };

        for (let k = 0; k < messages.length; k++) {
          let km = messages[k];
          let isNew = true;

          for (let j = 0; j < chat.messages.length; j++) {
            let im = chat.messages[j];
            if (im.local_id == km.local_id) {
              isNew = false;
              chat.messages[j] = km;
              break;
            }
          }
          if (isNew) {
            chat.messages.push(km);
          }
        }

        chat.room.unread_count = calculateUnSeenMessagesCount(chat.messages);
        break;
      }
    }

    if (messages[0].token) {
      dispatch(getMessages({ id: messages[0].room_id }))
      dispatch(getRoomList(chats));
    }

    const selectedChat = { ...store.selectedRoom };
    if (selectedChat && Object.keys(selectedChat).length > 0) {
      if (selectedChat.id == messages[0].room_id) {
        if (chat.room) {
          chat.room.unread_count = 0;
          dispatch(selectRoom(chat.room));
        }
        if (
          messages.length == 1 &&
          messages[0].user_id != useJwt.getUserID() &&
          messages[0].seen_status != 1
        ) {
          // currently coming only one message on this event as the opponent's new message
          socketOpenMessage([messages[0].id]);
        }
      }
    }
  };

  // const socketDeleteMessage = (room_id, message_id) => {
  //   socket.emit("deleteMessage", {
  //     token: useJwt.getToken(),
  //     room_id: room_id,
  //     message_id: message_id
  //   });
  // };

  return (
    <SocketContext.Provider value={{
      just_started,
      socket,
      opponentTyping,
      scrollToBottom,
      // updateOnlineStatus,
      addOrUpdateMessages,
      socketOpenMessage,
      socketSendTyping,
      socketSendMessage,
      // socketDeleteMessage,
      loadRoomData
    }}>{children}
    </SocketContext.Provider>
  );
};

export { SocketContext, SocketProvider }
