import React, { useState, useEffect, useRef, useContext, useCallback, lazy, useLayoutEffect, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { formatChatDate, } from "@/utils/common";

import {
    Box,
    Grid,
    Button,
    Typography,
} from "@mui/material";

import { styled } from "@mui/material/styles";
import { SocketContext } from "@/utils/context/SocketContext";
import Loadable from "@/ui-component/Loadable";

import { getMessages } from "@/store/actions/messages";
import { changeShowToBottom } from "@/store/actions/sandBoxConnect"
import { setIsReply } from '@/store/actions/messageBoxConnect';

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
        if (!chatContainer) return;

        const scrollToBottom = () => {
            chatContainer.scrollTo({
                top: chatContainer.scrollHeight,
                behavior: "smooth",
            });
        };

        if (send?.send) {
            const isNearBottom =
                chatContainer.scrollTop + chatContainer.offsetHeight + 500 >=
                chatContainer.scrollHeight;

            setTimeout(scrollToBottom, send.isOneself ? 200 : isNearBottom ? 50 : 0);
        } else {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }, []);

    const actisToTop = useCallback(() => {
        const chatContainer = chatArea.current;
        if (!chatContainer) return;

        const roomMessages = storeMessages[selectedRoom.id] || [];

        const handleScroll = () => {
            const isAtBottom =
                chatContainer.scrollTop + chatContainer.offsetHeight + 1 >=
                chatContainer.scrollHeight;

            dispatch(changeShowToBottom(!isAtBottom));

            if (
                chatContainer.scrollTop === 0 &&
                chatContainer.scrollHeight > chatContainer.clientHeight
            ) {
                const lastScrollTop = chatContainer.scrollHeight - chatContainer.scrollTop;

                if (!isToTop) {
                    setScrollTop((prev) => prev + 1);
                    setTimeout(() => {
                        chatContainer.scrollTo({
                            top: chatContainer.scrollHeight - lastScrollTop,
                            behavior: "auto",
                        });
                    }, 10);
                } else {
                    setIsToTop(false);
                    setScrollTop((prev) => prev + 1);

                    if (roomMessages.length > 0) {
                        dispatch(
                            getMessages({
                                id: selectedRoom.id,
                                last_message_id: roomMessages[0].id,
                            })
                        );
                    }

                    setTimeout(() => {
                        chatContainer.scrollTo({
                            top: 500,
                            behavior: "smooth",
                        });
                    }, 1000);
                }
            }
        };

        chatContainer.onscroll = handleScroll;
    }, [dispatch, isToTop, selectedRoom?.id, storeMessages]);

    const formatChatData = useCallback((messages) => {

        if (!selectedRoom || messages.length === 0) {
            return [];
        }

        const formattedChatLog = [];
        let chatLogs = [...messages];

        if (chatLogs.length === 1) {
            formattedChatLog.push({
                sentDate: formatChatDate(chatLogs[0].created_at * 1000),
                senderId: chatLogs[0].user_id,
                sentTime: chatLogs[0].created_at * 1000,
                messages: [chatLogs[0]],
            });
            return formattedChatLog;
        }

        let msgGroup = {
            sentDate: formatChatDate(chatLogs[0].created_at * 1000),
            senderId: chatLogs[0].user_id,
            sentTime: chatLogs[0].created_at * 1000,
            messages: [chatLogs[0]],
        };

        for (let i = 1; i < chatLogs.length; i++) {
            const currentMsg = chatLogs[i];

            const isSameDate = formatChatDate(currentMsg.created_at * 1000) === msgGroup.sentDate;
            const isSameSender = msgGroup.senderId === currentMsg.user_id;
            const isWithinTimeLimit = currentMsg.created_at * 1000 - msgGroup.sentTime < 60 * 1000;

            if (isSameDate && isSameSender && isWithinTimeLimit) {
                msgGroup.messages.push(currentMsg);
            } else {
                formattedChatLog.push(msgGroup);
                msgGroup = {
                    sentDate: formatChatDate(currentMsg.created_at * 1000),
                    senderId: currentMsg.user_id,
                    sentTime: currentMsg.created_at * 1000,
                    messages: [currentMsg],
                };
            }

            if (i === chatLogs.length - 1) {
                formattedChatLog.push(msgGroup);
            }
        }

        return formattedChatLog;
    }, [selectedRoom]);

    // ** If user chat is not empty scrollToBottom
    useLayoutEffect(() => {
        if (!selectedRoom) {
            setRoomMessages([]);
            return;
        }

        let roomMessages = storeMessages[selectedRoom.id] || [];
        if (roomMessages.length > 0) {

            roomMessages = roomMessages.sort((a, b) => a.created_at - b.created_at);

            const roomUser = selectedRoom.room_users?.find(user => user.user_id === userData.id);

            const lastMessage = roomMessages[roomMessages.length - 1];

            if (roomUser && roomUser.seen_message_id < lastMessage.id) {
                socketOpenMessage(lastMessage.id);
            }
        }

        const baseMessageCount = 30;
        const additionalMessages = 10 * scrollTop;
        const totalMessagesToShow = baseMessageCount + additionalMessages + newMessageCount;

        const chatLogs = roomMessages.slice(
            Math.max(0, roomMessages.length - totalMessagesToShow)
        );

        setRoomMessages(formatChatData(chatLogs));

        setIsToTop(roomMessages.length <= chatLogs.length + 10);
        setRoomChange(prev => !prev);
    }, [storeMessages, scrollTop, newMessageCount, userData.id, socketOpenMessage, selectedRoom, formatChatData]);

    useLayoutEffect(() => {
        actisToBottom({ send: false, isOneself: false });
    }, [roomChange, actisToBottom]);

    useEffect(() => {
        setScrollTop(0)
        setNewMessageCount(0)
        setIsToTop(false)

        dispatch(setIsReply(false))
        setImg([])
        setUploadFiles([]);
        setFileList([]);
        setIsPreviewFiles(false)
    }, [selectedRoom?.id, dispatch])

    useEffect(() => {
        actisToTop();
    }, [scrollTop, actisToTop]);

    const [uploadFiles, setUploadFiles] = useState([]);
    const [img, setImg] = useState([]);
    const [fileList, setFileList] = useState([]);

    const [isPreviewFiles, setIsPreviewFiles] = useState(false);
    const [draggerFile, setDraggerFile] = useState(false)

    const handleFilesMove = useCallback(() => {
        if (selectedRoom?.id) {
            const uploadStyle = document.querySelector(".ant-upload-btn");
            if (uploadStyle) {
                uploadStyle.style.padding = "0";
            }
        }

        const handleDragLeave = (e) => {
            e.preventDefault();
            setDraggerFile(false);
        };

        const handleDragOver = (e) => {
            e.preventDefault();
            setDraggerFile(true);
        };

        const handleDrop = (e) => {
            e.preventDefault();
            setDraggerFile(false);
        };

        document.addEventListener("dragleave", handleDragLeave);
        document.addEventListener("dragover", handleDragOver);
        document.addEventListener("drop", handleDrop);

        return () => {
            document.removeEventListener("dragleave", handleDragLeave);
            document.removeEventListener("dragover", handleDragOver);
            document.removeEventListener("drop", handleDrop);
        };
    }, [selectedRoom?.id]);

    useEffect(() => {
        const cleanup = handleFilesMove();
        return cleanup;
    }, [handleFilesMove]);


    return (<Grid item xs={12} sm={12} md={9}
        sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            backgroundColor: "#101010",
            "@media (max-width: 900px)": {
                display: selectedRoom && Object.keys(selectedRoom)?.length ? "flex" : "none",
            }
        }}
    >
        {/* {console.log("index")} */}
        {
            selectedRoom && Object.keys(selectedRoom)?.length ? (
                <><Box
                    sx={{
                        display: { xs: "block", md: "flex" },
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
                        isPreviewFiles={isPreviewFiles}
                        setIsPreviewFiles={setIsPreviewFiles}
                        img={img}
                        setImg={setImg}
                        uploadFiles={uploadFiles}
                        setUploadFiles={setUploadFiles}
                        CircleButton1={CircleButton1}
                        chatArea={chatArea} />
                    <HeaderBox />
                    <MessagesBox
                        roomMessages={roomMessage ? roomMessage : []}
                        chatArea={chatArea}
                    />
                    <SendMsgBox
                        setIsPreviewFiles={setIsPreviewFiles}
                        setImg={setImg}
                        setUploadFiles={setUploadFiles}
                        fileList={fileList}
                        setFileList={setFileList}
                        actisToBottom={actisToBottom}
                        isPreviewFiles={isPreviewFiles}
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
