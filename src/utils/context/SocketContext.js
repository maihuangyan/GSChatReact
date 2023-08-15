import socket_io from "socket.io-client"
import { createContext, useCallback, useEffect, useState, useContext } from "react"
import useJwt from "utils/jwt/useJwt"
import { useDispatch, useSelector } from "react-redux"
import { getRoomList, selectRoom, updateRoomLastMessage } from "store/actions/room"
import { getMessages, reduxInsertMessages, reduxUpdateMessages } from "store/actions/messages"

import { isMessageSeen, nowSecs, randomString, sortMessages } from "utils/common"

import { useLocation } from "react-router"
import { LoaderContext } from "utils/context/ProgressLoader";

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
  const room = useSelector((state) => state.room);
  const messages = useSelector((state) => state.messages.messages);
  const users = useSelector((state) => state.users)?.connected_users;
  const auth = useSelector((state) => state.auth);

  const [opponentTyping, setOpponentTyping] = useState({});
  const [scrollToBottom, setScrollToBottom] = useState(false);
  const [updateOnlineStatus, setUpdateOnlineStatus] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const hideProgress = useContext(LoaderContext).hideProgress;
  const showProgress = useContext(LoaderContext).showProgress;

  useEffect(() => {
    if (auth.userData) {
      loadRoomData()
      loadOnlineList()
    }
  }, []);

  const loadRoomData = () => {
    // load chat messages
    dispatch(getRoomList(), function (result) {
      if (result) {
        setTimeout(() => {
          setUpdateOnlineStatus(!updateOnlineStatus);
        }, 300);
      }
    })
  }

  const loadOnlineList = () => {
    useJwt
      .getOnlineList()
      .then((res) => {
        showProgress()
        if (res.data.ResponseCode == 0) {
          setOnlineUsers(res.data.ResponseResult)

          setTimeout(() => {
            setUpdateOnlineStatus(!updateOnlineStatus);
          }, 3000);
        }
        else {
          console.log(res.data.ResponseCode);
        }
      })
      .catch((err) => (console.log(err),hideProgress()));
  }

  const getRoomOnlineStatus = (room_id) => {
    for (let roomUser of onlineUsers) {
      if (roomUser.room_id == room_id && roomUser.user_id != useJwt.getUserID()) {
        return true;
      }
    }
    return false;
  }

  const handleSocketNewUser = useCallback(
    (newUser) => {
      // user joined
      const online_users = [...onlineUsers];
      let exist = false;
      for (let i = 0; i < online_users.length; i++) {
        const room_user = online_users[i];
        if (room_user.room_id == newUser.room_id &&
          room_user.token == newUser.token) {
          exist = true;
          break;
        }
      }
      if (!exist) {
        online_users.push(newUser);
      }
      setOnlineUsers(online_users);
      setTimeout(() => {
        setUpdateOnlineStatus(!updateOnlineStatus);
      }, 1000);
    },
    [onlineUsers, updateOnlineStatus]
  );

  const handleSocketUserLeft = useCallback(
    (userLeft) => {
      // user left
      const online_users = [...onlineUsers];
      for (let i = 0; i < online_users.length; i++) {
        const room_user = online_users[i];
        if (room_user.room_id == userLeft.room_id &&
          room_user.token == userLeft.token) {
          online_users.splice(i, 1);
          break;
        }
      }
      setOnlineUsers(online_users)

      setTimeout(() => {
        console.log('updateOnlineStatus on user left', userLeft)
        setUpdateOnlineStatus(!updateOnlineStatus);
      }, 1000);
    },
    [onlineUsers, updateOnlineStatus]
  );

  const handleSocketTyping = useCallback(
    (typing) => {
      // received typing
      console.log('typing', typing)
      if (typing.user_id != useJwt.getUserID()) {
        updateTyping(typing.room_id, typing.user_id, typing.type == 1);
      }
    },
    [scrollToBottom]
  );

  const handleSocketNewMessage = useCallback(
    (message) => {
      // console.log('new message', message);
      console.log('new messages', [message])
      if (message.user_id == useJwt.getUserID()) {
        updateMessages([message])
      }
      else {
        addMessages([message]);
      }
    },
    []
  );

  const handleSocketUpdateMessage = useCallback(
    (messages) => {
      // updated message
      console.log('updated messages', messages)
      updateMessages(messages);
    },
    []
  );

  const handleSocketDeleteMessage = useCallback(
    (messages) => {
      // deleted message
      console.log('deleted messages', messages)
      deleteMessages(messages)
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
  ]);

  const getUser = (user_id) => {
    console.log('users', users);
    if (!users) return null;

    for (let user of users) {
      if (user.id == user_id) {
        return user;
      }
    }

    return null;
  }

  const updateTyping = (room_id, user_id, typing) => {
    const user = getUser(user_id)
    console.log(user_id, user)
    if (user) {
      let ot = { ...opponentTyping };
      ot[room_id] = {
        user,
        typing
      };
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

  const socketSendMessage = (room_id, type, message, reply_on) => {
    const selectedChat = room;
    if (!selectedChat) return;

    let local_id = randomString();
    let userData = useJwt.getUserData();

    let newMessage = {
      user_id: userData.id,
      username: userData.username,
      token: useJwt.getToken(),
      room_id: room_id,
      local_id: local_id,
      type: type, // 0: text, 1: image, 2: file
      message: message,
      created_at: nowSecs(),
      updated_at: nowSecs(),
      reply_on,
    };
    addMessages([newMessage]);
    socket.emit("sendMessage", newMessage);
  };

  const socketOpenMessage = (message_ids) => {
    socket.emit("openMessage", {
      token: useJwt.getToken(),
      message_ids: message_ids,
    });
  };

  const addMessages = (messages) => {
    if (messages.length == 0) return;
    console.log('messages', messages)

    dispatch(updateRoomLastMessage(messages))
    dispatch(reduxInsertMessages(messages))

    setScrollToBottom(!scrollToBottom);
  }

  const updateMessages = (messages) => {
    if (messages.length == 0) return;

    dispatch(updateRoomLastMessage(messages))
    dispatch(reduxUpdateMessages(messages))

    const selectedChat = { ...room.selectedRoom };
    if (selectedChat && Object.keys(selectedChat).length > 0) {
      if (selectedChat.id == messages[0].room_id) {
        const unreadMessageIds = [];
        for (const message of messages) {
          if (!isMessageSeen(message)) {
            unreadMessageIds.push(message.id);
          }
        }
        socketOpenMessage(unreadMessageIds);
        setScrollToBottom(!scrollToBottom);
      }
    }
  };

  const deleteMessages = (messages) => {
    if (messages.length == 0) return;

    // dispatch(updateRoomLastMessage(messages))
    // dispatch(reduxUpdateMessages(messages))

    // const selectedChat = { ...room.selectedRoom };
    // if (selectedChat && Object.keys(selectedChat).length > 0) {
    //   if (selectedChat.id == messages[0].room_id) {
    //     const unreadMessageIds = [];
    //     for (const message of messages) {
    //       if (!isMessageSeen(message)) {
    //         unreadMessageIds.push(message.id);
    //       }
    //     }

    //     socketOpenMessage(unreadMessageIds);
    //     setScrollToBottom(!scrollToBottom);
    //   }
    // }
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

  const socketDeleteMessage = (room_id, message_id) => {
    socket.emit("deleteMessage", {
      token: useJwt.getToken(),
      room_id: room_id,
      message_id: message_id
    });
  };

  return (
    <SocketContext.Provider value={{
      just_started,
      socket,
      opponentTyping,
      scrollToBottom,
      updateOnlineStatus,
      getRoomOnlineStatus,
      addMessages,
      updateMessages,
      socketOpenMessage,
      socketSendTyping,
      socketSendMessage,
      socketDeleteMessage,
      loadRoomData
    }}>{children}
    </SocketContext.Provider>
  );
};

export { SocketContext, SocketProvider }
