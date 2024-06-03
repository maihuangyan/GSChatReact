import socket_io from "socket.io-client"
import { createContext, useCallback, useEffect, useState } from "react"
import useJwt from "utils/jwt/useJwt"
import { useDispatch } from "react-redux"
import { getRoomList, insertRoomUser, calculateUnSeenCount, updateRoomLastMessage } from "store/actions/room"
import { reduxDeleteMessages, reduxInsertMessages, reduxUpdateMessages, receiveMessages, notifyMessage } from "store/actions/messages"
import OneSignal from 'react-onesignal';
import { isMessageSeen, nowSecs, randomString } from "utils/common"
import { store } from "store"
import { setOnlineUsers } from "store/actions/user"

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
  const room = store.getState().room
  const users = store.getState().users.connected_users
  const onlineUsers = store.getState().users.onlineUsers
  const [opponentTyping, setOpponentTyping] = useState({});
  
  const loadRoomData = () => {
    // load chat messages
    dispatch(getRoomList())
  }

  const loadOnlineList = () => {
    useJwt
      .getOnlineList()
      .then((res) => {
        if (res.data.ResponseCode === 0) {
          // console.log('online list', res.data.ResponseResult);
          if (res.data.ResponseResult.length) dispatch(setOnlineUsers(res.data.ResponseResult))
        }
        else {
          console.log(res.data.ResponseCode);
        }
      })
      .catch((err) => (console.log(err)));
  }

  const getRoomOnlineStatus = (room) => {
    if (room && room.room_users.length > 0) {
      for (let roomUser of room.room_users) {
        for (let onlineUser of onlineUsers) {
          if (roomUser.user_id !== Number(useJwt.getUserID()) && roomUser.user_id === onlineUser.user_id) return true;
        }
      }
    }
    return false;
  }


  const handleSocketNewUser = useCallback(
    (newUser) => {
      // user joined
      const online_users = [...onlineUsers];
      // console.log(newUser)
      let exist = false;
      for (let i = 0; i < online_users.length; i++) {
        const room_user = online_users[i];
        if (room_user.room_id === newUser.room_id &&
          room_user.token === newUser.token) {
          exist = true;
          break;
        }
      }
      if (!exist) {
        online_users.push(newUser);
      }
      dispatch(setOnlineUsers(online_users))
    },
    []
  );

  const handleSocketUserLeft = useCallback(
    (userLeft) => {
      // user left
      const online_users = [...onlineUsers];
      for (let i = 0; i < online_users.length; i++) {
        const room_user = online_users[i];
        // console.log('user left', room_user, userLeft);
        if (userLeft == null) return;
        if (room_user.token === userLeft.token) {
          online_users.splice(i, 1);
          break;
        }
      }
      dispatch(setOnlineUsers(online_users))
    },
    []
  );

  const handleSocketTyping = useCallback(
    (typing) => {
      // received typing
      //console.log('typing', typing)

      if (typing.user_id !== Number(useJwt.getUserID())) {
        updateTyping(typing.room_id, typing.user_id, typing.type === 1);
      }
    },
    []
  );

  const handleSocketNewMessage = useCallback(
    (message) => {
      // console.log('new message', message);
      if (message.user_id === Number(useJwt.getUserID())) {
        updateMessages([message])
      }
      else {
        addMessages([message]);
        dispatch(receiveMessages())
        dispatch(notifyMessage(message))
      }
    },
    []
  );

  const handleSocketUpdateMessage = useCallback(
    (messages) => {
      // updated message
      console.log('updated messages', messages)
      updateMessages(messages);
    }, []
  );

  const handleSocketOpenMessage = useCallback(
    (message) => {
      openMessage(message);
    }, []
  );

  const handleSocketDeleteMessage = useCallback(
    (message_id) => {
      // deleted message
      console.log('deleted messages', message_id)
      deleteMessages([message_id])
    },
    []
  );

  useEffect(() => {
    if (socket) {
      // subscribe to socket events
      socket.on("newUser", handleSocketNewUser);
      socket.on("userLeft", handleSocketUserLeft);
      socket.on("typing", handleSocketTyping);
      socket.on("newMessage", handleSocketNewMessage);
      socket.on("updateMessage", handleSocketUpdateMessage);
      socket.on("openMessage", handleSocketOpenMessage);
      socket.on("deleteMessage", handleSocketDeleteMessage);
    }

    return () => {
      // unsubscribe socket events
      socket.off("newUser", handleSocketNewUser);
      socket.off("userLeft", handleSocketUserLeft);
      socket.off("typing", handleSocketTyping);
      socket.off("newMessage", handleSocketNewMessage);
      socket.off("updateMessage", handleSocketUpdateMessage);
      socket.off("deleteMessage", handleSocketDeleteMessage);
    };
  }, [
    handleSocketNewUser,
    handleSocketUserLeft,
    handleSocketTyping,
    handleSocketNewMessage,
    handleSocketUpdateMessage,
    handleSocketDeleteMessage,
    handleSocketOpenMessage
  ]);

  function foregroundWillDisplayListener(notification) {
    console.log(`notification will display: ${notification}`);
  }

  function promptListener(event) {
    console.log(`permission prompt dispslayed event: ${event}`);
  }

  function permissionChangeListener(permission) {
    if (permission) {
      console.log(`permission accepted!`);
    }
  }

  useEffect(() => {
    if (OneSignal.Notifications) {
      OneSignal.Notifications.addEventListener("foregroundWillDisplay", foregroundWillDisplayListener);
      OneSignal.Notifications.addEventListener("permissionPromptDisplay", promptListener);
      OneSignal.Notifications.addEventListener("permissionChange", permissionChangeListener);
    }
  }, [])

  const getUser = (user_id) => {
    // console.log('users', users);
    if (!users) return null;

    for (let user of users) {
      if (user.user_id === user_id) {
        return user;
      }
    }

    return null;
  }

  const updateTyping = (room_id, user_id, typing) => {
    const user = getUser(user_id)
    if (user) {
      let ot = { ...opponentTyping };
      if (typing) {
        if (!ot[room_id] || ot[room_id].length === 0) {
          ot[room_id] = [user_id];
        } else {
          if (ot[room_id].indexOf(user_id) === -1) {
            ot[room_id].push(user_id);
          }
        }
      } else {
        if (ot[room_id]) {
          let idx = ot[room_id].indexOf(user_id);
          if (idx !== -1) ot[room_id].splice(idx, 1);
        }
      }
      setOpponentTyping(ot);
    }
  };

  const socketSendTyping = (room_id, typing) => {
    socket.emit("sendTyping", {
      token: useJwt.getToken(),
      room_id: room_id,
      type: typing, // 1: typing, 0: stopped typing
    });
  };

  const socketSendMessage = (room_id, type, message, reply_on, forward_message, description) => {
    const selectedChat = room;
    if (!selectedChat) return;

    let local_id = randomString();
    let userData = useJwt.getUserData();

    let newMessage = {
      user_id: userData.id,
      username: userData.username,
      token: useJwt.getToken(),
      room_id,
      local_id,
      type, // 0: text, 1: image, 2: file
      message,
      description,
      created_at: nowSecs(),
      updated_at: nowSecs(),
      reply_on,
      forward_message,
    };
    // console.log(newMessage)
    socket.emit("sendMessage", newMessage);
  };

  const socketUpdateMessage = (message, messageText) => {
    if (!message) return;
    let userData = useJwt.getUserData();
    let updateMessage = {
      user_id: userData.id,
      username: userData.username,
      token: useJwt.getToken(),
      room_id: message.room_id,
      message_id: message.id,
      message: messageText,
    };

    // console.log('update message', updateMessage);
    socket.emit("updateMessage", updateMessage);
  };

  const socketOpenMessage = (message_id) => {
    // console.log('socketOpenMessage', message_id, useJwt.getToken());
    socket.emit("openMessage", {
      token: useJwt.getToken(),
      message_id: message_id,
    });
  };

  const socketDeleteMessage = (message) => {
    if (!message) return;

    let userData = useJwt.getUserData();
    //dispatch(reduxDeleteMessages([message]))

    socket.emit("deleteMessage", {
      token: useJwt.getToken(),
      user_id: userData.id,
      username: userData.username,
      room_id: message.room_id,
      message_id: message.id
    });
  };

  const addMessages = (messages) => {
    if (messages.length === 0) return;

    dispatch(updateRoomLastMessage(messages))
    dispatch(reduxInsertMessages(messages))
    dispatch(calculateUnSeenCount())

  }

  const updateMessages = (messages) => {
    console.log('updateMessages', messages)
    if (messages.length === 0) return;

    dispatch(updateRoomLastMessage(messages))
    dispatch(reduxUpdateMessages(messages))
    dispatch(calculateUnSeenCount())


    const selectedChat = { ...room.selectedRoom };
    if (selectedChat && Object.keys(selectedChat).length > 0) {
      if (selectedChat.id === messages[0].room_id) {
        const unreadMessageIds = [];
        for (const message of messages) {
          if (!isMessageSeen(message)) {
            unreadMessageIds.push(message.id);
          }
        }
        socketOpenMessage(unreadMessageIds);
      }
    }
  };

  const deleteMessages = (message_ids) => {
    //dispatch(updateRoomLastMessage(messages))
    dispatch(reduxDeleteMessages(message_ids))
  }

  const openMessage = (message) => {
    dispatch(insertRoomUser(message));
  }

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

  return (
    <SocketContext.Provider value={{
      just_started,
      socket,
      opponentTyping,
      getRoomOnlineStatus,
      onlineUsers,
      addMessages,
      updateMessages,
      socketOpenMessage,
      socketSendTyping,
      socketSendMessage,
      socketUpdateMessage,
      socketDeleteMessage,
      loadRoomData,
      loadOnlineList
    }}>{children}
    </SocketContext.Provider>
  );
};


export { SocketContext, SocketProvider }
