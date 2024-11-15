import { useState, useEffect, useRef, useContext, useCallback, lazy, useLayoutEffect, memo, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { formatChatDate, } from "utils/common";

import {
    Box,
    Grid,
    Button,
    Typography,
} from "@mui/material";

import { styled } from "@mui/material/styles";
import { SocketContext } from "utils/context/SocketContext";
import Loadable from "ui-component/Loadable";

import { getMessages } from "store/actions/messages";
import { changeShowToBottom } from "store/actions/sandBoxConnect"
import { setIsReply } from 'store/actions/messageBoxConnect';

const PreviewFiles = Loadable(lazy(() => import('./PreviewFiles')));
const DraggerBox = Loadable(lazy(() => import('./DraggerBox')));
const HeaderBox = Loadable(lazy(() => import('./component/HeaderBox')));
const MessagesBox = Loadable(lazy(() => import('./component/MessagesBox')));
const SendMsgBox = Loadable(lazy(() => import('./component/SendMsgBox')));

const CircleButton1 = styled(Button)(({ theme }) => ({
    borderRadius: "50%",
    minWidth: "45px",
    height: "45px",
    color: theme.palette.primary.light,
    backgroundColor: theme.palette.dark[900],
    "&:hover": {
        backgroundColor: "#FBC34A",
        color: theme.palette.common.black,
    },
}));

const Conversation = () => {
    const selectedRoom = useSelector((state) => state.room.selectedRoom);
    const userData = useSelector((state) => state.auth.userData);
    const storeMessages = useSelector((state) => state.messages.messages);
    const [roomMessage, setRoomMessages] = useState([]);

    const socketOpenMessage = useContext(SocketContext).socketOpenMessage

    // ** Refs & Dispatch
    const chatArea = useRef(null);
    const dispatch = useDispatch();

    const [newMessageCount, setNewMessageCount] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);
    const [isToTop, setIsToTop] = useState(false);
    const [roomChange, setRoomChange] = useState(false);

    // ** Scroll to chat bottom
    const actisToBottom = useCallback((send) => {
        const chatContainer = chatArea.current;
        if (chatContainer) {
            if (send.send) {
                if (send.isOneself) {
                    setTimeout(() => {
                        chatContainer.scrollTo({
                            top: chatContainer.scrollHeight,
                            behavior: "smooth"
                        })
                    }, 200)
                    // console.log("6666")
                } else {
                    if (chatContainer.scrollTop + chatContainer.offsetHeight + 500 >= chatContainer.scrollHeight) {
                        setTimeout(() => {
                            chatContainer.scrollTo({
                                top: chatContainer.scrollHeight,
                                behavior: "smooth"
                            })
                        }, 50)
                        // console.log("8888")
                    }
                }
            } else {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
        }
    }, [])

    const actisToTop = () => {
        const chatContainer = chatArea.current;
        let roomMessages = storeMessages[selectedRoom.id] ? storeMessages[selectedRoom.id] : [];
        if (chatContainer) {
            chatContainer.onscroll = () => {
                if (chatContainer.scrollTop + chatContainer.offsetHeight + 1 >= chatContainer.scrollHeight) {
                    dispatch(changeShowToBottom(false))
                } else {
                    dispatch(changeShowToBottom(true))
                }
                if (chatContainer.scrollTop === 0 && chatContainer.scrollHeight > chatContainer.clientHeight) {

                    let LastScrollTop = chatContainer.scrollHeight - chatContainer.scrollTop
                    let options = {
                        top: chatContainer.scrollHeight - LastScrollTop,
                        behavior: 'smooth'
                    }
                    if (!isToTop) {
                        setScrollTop(scrollTop + 1)
                        setTimeout(() => {
                            chatContainer.scrollTo(0, chatContainer.scrollHeight - LastScrollTop);
                        }, 10);

                    } else {
                        console.log("9999")
                        setIsToTop(false)
                        dispatch(getMessages({ id: selectedRoom.id, last_message_id: roomMessages[0].id }))
                        setTimeout(() => {
                            chatContainer.scrollTo(options)
                        }, 10);
                    }
                }
            }
        }
    };

    const formatChatData = (message) => {
        if (!selectedRoom || message.length === 0) return setRoomMessages([]);
        let formattedChatLog = [];
        let chatLogs = [...message]
        let msgGroup = {
            sentDate: formatChatDate(chatLogs[0].created_at * 1000), // for date divide,
            senderId: chatLogs[0].user_id,
            sentTime: chatLogs[0].created_at * 1000, // for checking 1 mins delay = diff: 60 * 1000,
            messages: [chatLogs[0]],
        };
        if (chatLogs.length === 1) {
            formattedChatLog.push(msgGroup);
        }
        for (let i = 1; i < chatLogs.length; i++) {
            let msgs = chatLogs[i];
            if (
                formatChatDate(+msgs.created_at * 1000) === msgGroup.sentDate &&
                msgGroup.senderId === msgs.user_id &&
                parseInt(msgs.created_at * 1000) - parseInt(msgGroup.sentTime) < 60 * 1000
            ) {
                msgGroup.messages.push(msgs);
            } else {
                formattedChatLog.push(msgGroup);
                msgGroup = {
                    sentDate: formatChatDate(+msgs.created_at * 1000),
                    senderId: msgs.user_id,
                    sentTime: msgs.created_at * 1000,
                    messages: [msgs],
                };
            }
            if (i === chatLogs.length - 1) {
                formattedChatLog.push(msgGroup);
            }
        }
        return formattedChatLog
    }

    // ** If user chat is not empty scrollToBottom
    useLayoutEffect(() => {
        // console.log('room changed', selectedRoom);
        if (selectedRoom) {
            let roomMessages = storeMessages[selectedRoom.id] ? storeMessages[selectedRoom.id] : [];
            if (roomMessages.length > 0) {
                roomMessages = roomMessages.sort((a, b) => (a.created_at > b.created_at ? 1 : a.created_at < b.created_at ? -1 : 0));
                const roomUsers = selectedRoom.room_users;
                let roomUser = null;
                if (roomUsers && roomUsers.length > 0) {
                    roomUsers.forEach(user => {
                        if (user.user_id === userData.id) {
                            roomUser = user;
                        }
                    })
                }
                if (roomUser && roomUser.seen_message_id < roomMessages[roomMessages.length - 1].id) {
                    socketOpenMessage(roomMessages[roomMessages.length - 1].id);
                }
            }
            let chatLogs = []
            if (scrollTop) {
                chatLogs = roomMessages.filter((item, index) => index >= roomMessages.length - (30 + (10 * scrollTop)) - newMessageCount)
                setRoomMessages(formatChatData(chatLogs))
            } else {
                chatLogs = roomMessages.filter((item, index) => index >= roomMessages.length - 30 - newMessageCount)
                setRoomMessages(formatChatData(chatLogs))
                setRoomChange(!roomChange)
            }

            if (roomMessages.length === chatLogs.length + 10) {
                setIsToTop(true)
            }
        }
    }, [storeMessages, selectedRoom, scrollTop]);

    useLayoutEffect(() => {
        actisToBottom({ send: false, isOneself: false });
    }, [roomChange]);

    useEffect(() => {
        setScrollTop(0)
        setNewMessageCount(0)
        setIsToTop(false)
        actisToTop()

        dispatch(setIsReply(false))
        setImg(null)
        setIsPreviewFiles(false)
    }, [selectedRoom])

    useEffect(() => {
        actisToTop()
    }, [scrollTop]);

    const [uploadFiles, setUploadFiles] = useState(null);
    const [img, setImg] = useState(null);

    const [isPreviewFiles, setIsPreviewFiles] = useState(false);

    const handleFilesMove = useCallback(() => {
        if (selectedRoom.id) {
            const uploadStyle = document.querySelector(".ant-upload-btn")
            if (uploadStyle) {
                uploadStyle.style.padding = "0"
            }
        }

        document.ondragleave = function (e) {
            e.preventDefault();
            setDraggerFile(false)
        };

        document.ondragover = function (e) {
            e.preventDefault();
            setDraggerFile(true)
        }
        document.ondrop = function (e) {
            e.preventDefault();
            setDraggerFile(false)
        }
    }, [])

    useEffect(() => {
        handleFilesMove()
    }, [])

    const [draggerFile, setDraggerFile] = useState(false)

    const searchTotal = useMemo(() => {
        let handleMessages = []
        if (roomMessage) {
            roomMessage.map(item => handleMessages.push(item.messages))
        }
        return handleMessages
    }, [roomMessage])

    return (<Grid item xs={12} sm={12} md={9}
        sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            backgroundColor: "#101010",
            "@media (max-width: 900px)": {
                display: Object.keys(selectedRoom).length ? "flex" : "none",
            }
        }}
    >
            {/* {console.log("index")} */}
        {
            Object.keys(selectedRoom).length ? (
                <><Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "start",
                        width: "100%",
                        height: { xs: "auto", sm: "auto", md: "100%" },
                        position: "relative",
                        overflow: "hidden",
                    }}>
                    <DraggerBox
                        draggerFile={draggerFile}
                        setDraggerFile={setDraggerFile}
                        setIsPreviewFiles={setIsPreviewFiles}
                        setImg={setImg}
                        setUploadFiles={setUploadFiles}
                    />
                    <PreviewFiles
                        roomId={selectedRoom.id}
                        isPreviewFiles={isPreviewFiles} setIsPreviewFiles={setIsPreviewFiles}
                        img={img}
                        uploadFiles={uploadFiles}
                        CircleButton1={CircleButton1}
                        // msg={msg}
                        // setMsg={setMsg}
                        chatArea={chatArea} />
                    <HeaderBox searchTotal={searchTotal} />
                    <MessagesBox
                        roomMessages={roomMessage ? roomMessage : []}
                        chatArea={chatArea}
                    />
                    <SendMsgBox
                        setIsPreviewFiles={setIsPreviewFiles}
                        setImg={setImg}
                        setUploadFiles={setUploadFiles}
                        actisToBottom={actisToBottom}
                    />
                </Box >
                </>) : (
                <Typography variant="body2">
                    Select a conversation or Create a New one
                </Typography>)
        }
    </Grid>)
};

export default memo(Conversation);
