import React from "react";
import socket_io from "socket.io-client"
// import socket from "@/utils/context/socket/socket";
import { createContext, useCallback, useEffect, useState, useRef, useContext } from "react"
import useJwt from "@/utils/jwt/useJwt"
import { useDispatch, useSelector } from "react-redux"
import { getRoomList, insertRoomUser, calculateUnSeenCount, updateRoomLastMessage, resetUnreadCount } from "@/store/actions/room"
import { setSocketConnection } from "@/store/actions/user";
import { reduxDeleteMessages, reduxInsertMessages, reduxUpdateMessages, receiveMessages, notifyMessage } from "@/store/actions/messages"
import OneSignal from 'react-onesignal';
import { isMessageSeen, nowSecs, randomString, getUserDisplayName } from "@/utils/common"
// import { setOnlineUsers } from "store/actions/user"
import { useLocation } from "react-router-dom";

import { handleLogout } from "@/store/actions";
import { LoaderContext } from "@/utils/context/ProgressLoader";

const SocketContext = createContext()

const SocketProvider = ({ children }) => {

  const dispatch = useDispatch();
  const room = useSelector((state) => state.room);
  const users = useSelector((state) => state.users.connected_users);
  const [opponentTyping, setOpponentTyping] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const auth = useSelector(state => state.auth)
  const { showProgress, hideProgress } = useContext(LoaderContext);

  const location = useLocation();

  const isMainLayoutRoute = () => {
    const mainLayoutPaths = ["/chat", "/settings", "/searchUser", "/information", "/historyMessage"];
    return mainLayoutPaths.some((path) => location.pathname.startsWith(path));
  };

  const socket = useRef(null);

  const initializeSocketRef = useRef(() => { });

  initializeSocketRef.current = () => {
    if (socket.current) {
      socket.current.disconnect();
    }

    const newSocket = socket_io.connect(process.env.REACT_APP_SOCKET_URL);

    newSocket.on("connect", () => {
      // console.log("Socket connected");
      const token = localStorage.getItem("accessToken");
      if (token) {
        newSocket.emit("login", { token });
      }
      dispatch(setSocketConnection(false));
      dispatch(getRoomList());
      if (isMainLayoutRoute()) {
        showProgress();
        setTimeout(() => {
          hideProgress();
        }, 2000);
      }
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      dispatch(setSocketConnection(true));
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
      dispatch(setSocketConnection(true));
    });

    socket.current = newSocket;
  };

  useEffect(() => {
    initializeSocketRef.current();

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (auth && socket.current) {
      const token = localStorage.getItem("accessToken");
      if (token) {
        socket.current.emit("login", { token });
      }
    }
  }, [auth]);

  const getUserDataAndToken = () => {
    const userData = useJwt.getUserData();
    if (!userData) {
      dispatch(handleLogout());
      return null;
    }
    return { userData, token: useJwt.getToken() };
  };

  const loadRoomData = () => {
    // load chat messages
    dispatch(getRoomList())
  }

  const loadOnlineList = useCallback(() => {
    useJwt
      .getOnlineList()
      .then((res) => {
        if (res.data.ResponseCode === 0) {
          setOnlineUsers(res.data.ResponseResult);
        }
      })
      .catch(console.error);
  }, []);

  const getRoomOnlineStatus = useCallback(
    (room) => {
      if (!room?.room_users?.length) return false;
      return room.room_users.some((u) =>
        onlineUsers.some(
          (online) =>
            Number(u.user_id) !== Number(useJwt.getUserID()) &&
            u.user_id === online.user_id
        )
      );
    },
    [onlineUsers]
  );


  const handleSocketNewUser = useCallback(
    (newUser) => {
      setOnlineUsers((prevUsers) => {
        const exists = prevUsers.some(
          (room_user) =>
            room_user.room_id === newUser.room_id && room_user.token === newUser.token
        );

        if (!exists) {
          return [...prevUsers, newUser];
        }
        return prevUsers;
      });

    },
    []
  );

  const handleSocketUserLeft = useCallback(
    (userLeft) => {
      if (!userLeft) return;

      setOnlineUsers((prevUsers) =>
        prevUsers.filter((room_user) => room_user.token !== userLeft.token)
      );
    },
    []
  );

  const getUser = useCallback(
    (user_id) => {
      if (!users) return null;

      for (let user of users) {
        if (user.user_id === user_id) {
          return user;
        }
      }

      return null;
    },
    [users]
  );

  const updateTyping = useCallback((room_id, user_id, typing) => {
    const user = getUser(user_id);
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
  }, [opponentTyping, getUser]);

  const handleSocketTyping = useCallback(
    (typing) => {
      // received typing
      // console.log('typing', typing)

      if (Number(typing.user_id) !== Number(useJwt.getUserID())) {
        updateTyping(typing.room_id, typing.user_id, typing.type === 1);
      }
    },
    [updateTyping]
  );

  const processStoreInsert = useCallback(
    (messages, action) => {
      return dispatch(action(messages));
    },
    [dispatch]
  );

  const processMessages = useCallback(
    async (messages, action) => {
      if (messages.length === 0) return;

      await processStoreInsert(messages, action);
      dispatch(updateRoomLastMessage(messages));
      dispatch(calculateUnSeenCount());
    },
    [dispatch, processStoreInsert]
  );

  const addMessages = useCallback(
    async (messages) => {
      await processMessages(messages, reduxInsertMessages);
    },
    [processMessages]
  );

  const updateMessages = useCallback(
    async (messages) => {
      await processMessages(messages, reduxUpdateMessages);

      const selectedChat = { ...room.selectedRoom };
      if (selectedChat && Object.keys(selectedChat).length > 0) {
        if (selectedChat.id === messages[0].room_id) {
          const unreadMessageIds = messages
            .filter((message) => !isMessageSeen(message))
            .map((message) => message.id);
          socketOpenMessage(unreadMessageIds);
        }
      }
    },
    [processMessages, room.selectedRoom]
  );


  const handleSocketNewMessage = useCallback(
    (message) => {
      // console.log('new message', Number(message.user_id));
      console.log('new message', Number(useJwt.getUserID()));
      // loadRoomData()
      if (Number(message.user_id) === Number(useJwt.getUserID())) {
        updateMessages([message])
        dispatch(resetUnreadCount({ room_id: message.room_id, unread_count: 0 }));
      }
      else {
        addMessages([message]);
        dispatch(receiveMessages())
        dispatch(notifyMessage(message))
      }
    },
    [addMessages, dispatch, updateMessages]
  );

  const handleSocketUpdateMessage = useCallback(
    (messages) => {
      // updated message
      // console.log('updated messages', messages)
      updateMessages(messages);
    }, [updateMessages]
  );

  const openMessage = useCallback(
    (message) => {
      dispatch(insertRoomUser(message));
    },
    [dispatch]
  );

  const handleSocketOpenMessage = useCallback(
    (message) => {
      openMessage(message);
    }, [openMessage]
  );

  const deleteMessages = useCallback(
    (message_ids) => {
      dispatch(reduxDeleteMessages(message_ids));
    },
    [dispatch]
  );

  const handleSocketDeleteMessage = useCallback(
    (message_id) => {
      // deleted message
      // console.log('deleted messages', message_id)
      deleteMessages([message_id])
    },
    [deleteMessages]
  );

  useEffect(() => {
    const socketEvents = {
      newUser: handleSocketNewUser,
      userLeft: handleSocketUserLeft,
      typing: handleSocketTyping,
      newMessage: handleSocketNewMessage,
      updateMessage: handleSocketUpdateMessage,
      openMessage: handleSocketOpenMessage,
      deleteMessage: handleSocketDeleteMessage,
    };

    Object.entries(socketEvents).forEach(([event, handler]) => {
      socket.current.on(event, handler);
    });

    return () => {
      Object.entries(socketEvents).forEach(([event, handler]) => {
        socket.current.off(event, handler);
      });
    };
  }, [
    handleSocketNewUser,
    handleSocketUserLeft,
    handleSocketTyping,
    handleSocketNewMessage,
    handleSocketUpdateMessage,
    handleSocketDeleteMessage,
    handleSocketOpenMessage,
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

  const socketSendTyping = (room_id, typing) => {
    socket.current.emit("sendTyping", {
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
    if (!userData) {
      dispatch(handleLogout())
    }
    console.log(useJwt.getToken())
    let newMessage = {
      user_id: userData.id,
      username: getUserDisplayName(userData),
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
    // console.log(userData)
    socket.current.emit("sendMessage", newMessage);
  };

  const socketUpdateMessage = (message, messageText) => {
    if (!message) return;

    let userData = useJwt.getUserData();
    if (!userData) {
      dispatch(handleLogout())
    }

    let updateMessage = {
      user_id: userData.id,
      username: getUserDisplayName(userData),
      token: useJwt.getToken(),
      room_id: message.room_id,
      message_id: message.id,
      message: messageText,
    };

    // console.log('update message', updateMessage);
    socket.current.emit("updateMessage", updateMessage);
  };

  const socketOpenMessage = (message_id) => {
    // console.log('socketOpenMessage', message_id, useJwt.getToken());
    if (!socket.current) return
    socket.current.emit("openMessage", {
      token: useJwt.getToken(),
      message_id: message_id,
    });
  };

  const socketDeleteMessage = (message) => {
    if (!message) return;

    const { userData, token } = getUserDataAndToken();

    if (!userData) return;

    socket.current.emit("deleteMessage", {
      token,
      user_id: userData.id,
      username: getUserDisplayName(userData),
      room_id: message.room_id,
      message_id: message.id
    });
    dispatch(updateRoomLastMessage([message]))
  };

  return (
    <SocketContext.Provider value={{
      opponentTyping,
      getRoomOnlineStatus,
      onlineUsers,
      addMessages,
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