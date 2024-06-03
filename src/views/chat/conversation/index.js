import { useState, useEffect, useRef, useContext, useCallback, lazy, useLayoutEffect, memo, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { formatChatDate, getUserDisplayName, } from "utils/common";
import typingAnim from 'assets/images/anim/typing.gif'

import {
    Box,
    Grid,
    Paper,
    Button,
    FormControl,
    Typography,
    OutlinedInput,
} from "@mui/material";

import { styled, useTheme } from "@mui/material/styles";
import { IconSend, IconLink, IconPhoto, IconArrowNarrowDown } from "@tabler/icons";

import { SocketContext } from "utils/context/SocketContext";

import Loadable from "ui-component/Loadable";

import { Upload } from 'antd';
import { getMessages } from "store/actions/messages";
import { LoaderContext } from "utils/context/ProgressLoader";

const MessagesBox = Loadable(lazy(() => import('./MessagesBox')));
const PreviewFiles = Loadable(lazy(() => import('./PreviewFiles')));
const DraggerBox = Loadable(lazy(() => import('./DraggerBox')));
const ReplyBox = Loadable(lazy(() => import('./ReplyBox')));
const ForwardBox = Loadable(lazy(() => import('./ForwardBox')));
const HeaderBox = Loadable(lazy(() => import('./component/HeaderBox')));

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


const CircleButton3 = styled(Button)(({ theme }) => ({
    borderRadius: "50%",
    minWidth: "35px",
    height: "35px",
    color: theme.palette.common.black,
    backgroundColor: "#FBC34A",
    "&:hover": {
        backgroundColor: "#fff",
        color: "#FBC34A",
    },
}));

const Conversation = () => {
    const selectedRoom = useSelector((state) => state.room.selectedRoom);
    const userData = useSelector((state) => state.auth.userData);
    const storeMessages = useSelector((state) => state.messages.messages);
    const showToast = useContext(LoaderContext).showToast
    const [isTyping, setIsTyping] = useState(false);
    const [roomMessage, setRoomMessages] = useState([]);
    const opponentTyping = useContext(SocketContext).opponentTyping

    const socketSendTyping = useContext(SocketContext).socketSendTyping
    const socketSendMessage = useContext(SocketContext).socketSendMessage
    const socketOpenMessage = useContext(SocketContext).socketOpenMessage
    const socketUpdateMessage = useContext(SocketContext).socketUpdateMessage
    const socketDeleteMessage = useContext(SocketContext).socketDeleteMessage
    // ** Refs & Dispatch
    const theme = useTheme();
    const chatArea = useRef(null);
    const dispatch = useDispatch();

    const [msg, setMsg] = useState("");
    const [newMessageCount, setNewMessageCount] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);
    const [typingText, setTypingText] = useState('');
    const [isToTop, setIsToTop] = useState(false);
    const [roomChange, setRoomChange] = useState(false);

    // ** Scroll to chat bottom
    const actisToBottom = (send) => {
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
    };

    const actisToTop = () => {
        const chatContainer = chatArea.current;
        let roomMessages = storeMessages[selectedRoom.id] ? storeMessages[selectedRoom.id] : [];
        if (chatContainer) {
            chatContainer.onscroll = () => {
                if (chatContainer.scrollTop + chatContainer.offsetHeight + 1 >= chatContainer.scrollHeight) {
                    setShowToButton(false)
                } else {
                    setShowToButton(true)
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
        setIsReply(false);
        setImg(null)
        setIsPreviewFiles(false)
    }, [storeMessages, selectedRoom, scrollTop]);

    useLayoutEffect(() => {
        actisToTop()
    }, [scrollTop]);

    useEffect(() => {
        actisToBottom({ send: false, isOneself: false });
    }, [roomChange]);

    useLayoutEffect(() => {
        setScrollTop(0)
        setNewMessageCount(0)
        setIsToTop(false)
    }, [selectedRoom])

    const formatChatData = (message) => {
        if (!selectedRoom || message.length === 0) return setRoomMessages([]);
        let formattedChatLog = [];
        let chatLogs = [...message]
        chatLogs = chatLogs.sort((a, b) => (a.created_at > b.created_at ? 1 : a.created_at < b.created_at ? -1 : 0));
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

    // ** Sends New Msg
    const handleSendMsg = (e) => {
        e.preventDefault();
        if (editingMessage) {
            socketUpdateMessage(editingMessage, msg)
            setEditingMessage(null);

            setMsg("");
            socketSendTyping(selectedRoom.id, 0);
            setIsTyping(false);
            setIsReply(false)
        }
        else {
            if (msg.length) {
                socketSendMessage(selectedRoom.id, '0', msg, replyMessage ? replyMessage.id : 0);
                setMsg("");
                socketSendTyping(selectedRoom.id, 0);
                setIsTyping(false);
                setIsReply(false)
                actisToBottom({ send: true, isOneself: true })
                setNewMessageCount(newMessageCount + 1)
            }
        }
    };

    const [isReply, setIsReply] = useState(false);
    const [replyMessage, setReplyMessage] = useState(null);

    const [isForward, setIsForward] = useState(false);
    const [ForwardMessage, setForwardMessage] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const [isMultiline, setIsMultiline] = useState(false)

    const ReplyClick = useCallback((content) => {
        // console.log(content)
        setEditingMessage(null)
        setMsg('')
        setIsForward(false)
        setForwardMessage(null)

        setReplyMessage(content.message)
        setIsReply(true)
    }, [])

    const EditClick = useCallback((content) => {
        setIsReply(false)
        setReplyMessage(null)
        setIsForward(false)
        setForwardMessage(null)

        setEditingMessage(content.message)
        setMsg(content.message.message);
        socketSendTyping(selectedRoom.id, 1);
        setIsTyping(selectedRoom.id === content.message.room_id);
    }, [selectedRoom, socketSendTyping])

    const CopyClick = useCallback(async (content) => {
        try {
            await navigator.clipboard.writeText(content.message);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    }, [])

    const DeleteClick = useCallback((content) => {
        socketDeleteMessage(content)
    }, [socketDeleteMessage])

    const isReplyClose = () => {
        setIsReply(false)
    }

    const isForwardClose = () => {
        setIsForward(false)
    }

    useEffect(() => {
        if (!isReply) {
            setReplyMessage({})
        }
    }, [isReply, selectedRoom])

    const replyScroll = useCallback((message) => {
        const chatContainer = chatArea.current;
        let btn = document.getElementById(message.reply_on_message ? message.reply_on_message.id : message.id)
        if (btn) {
            let options = {
                top: 0,
                behavior: 'smooth'
            }
            options.top = btn.parentNode.parentNode.parentNode.offsetTop + btn.offsetTop - 70
            chatContainer.scrollTo(options)
        }
    }, [])

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

    const props = {
        name: 'file',
        headers: {
            authorization: 'authorization-text',
        },
        beforeUpload: {
            function() {
                return false;
            }
        },
        showUploadList: false,
        maxCount: 1,
        style: { border: "none" },
        onChange(file) {
            const fileReader = new FileReader();
            fileReader.onload = () => {
                if (file.file.type.split("/")[1] === "x-msdownload") {
                    showToast("error", "This file is not supported")
                    return
                } else {
                    setUploadFiles(file.file)
                    setImg(fileReader.result)
                    setIsPreviewFiles(true)
                }
            }
            fileReader.readAsDataURL(file.file);
        },
    };

    const [draggerFile, setDraggerFile] = useState(false)

    const [showToButton, setShowToButton] = useState(true)

    const searchTotal = useMemo(() => {
        let handleMessages = []
        if (roomMessage) {
            roomMessage.map(item => handleMessages.push(item.messages))
        }
        return handleMessages
    }, [roomMessage])

    useEffect(() => {
        const typingUsers = opponentTyping ? opponentTyping[selectedRoom.id] : null
        console.log('typingUsers', typingUsers);

        if (!typingUsers || typingUsers.length === 0 || !selectedRoom) {
            setTypingText('');
            return;
        }
        if (selectedRoom.group === 0) {
            setTypingText('Typing');
            return;
        }

        let usernames = [];
        let opponents = selectedRoom.opponents;
        for (let i = 0; i < typingUsers.length; i++) {
            for (let j = 0; j < opponents.length; j++) {
                if (opponents[j].id === typingUsers[i]) {
                    usernames.push(getUserDisplayName(opponents[j]));
                    break;
                }
            }
        }
        if (usernames.length === 1) {
            setTypingText(usernames[0] + " is typing");
        } else {
            let result = "";
            for (let i = 0; i < usernames.length; i++) {
                if (i === usernames.length - 1) {
                    result += " and " + usernames[i] + " are typing";
                } else {
                    if (i) result += ", ";
                    result += usernames[i];
                }
            }
            setTypingText(result);
        }
    }, [opponentTyping, selectedRoom])

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
                        msg={msg}
                        setMsg={setMsg}
                        chatArea={chatArea} />
                    <HeaderBox searchTotal={searchTotal} />
                    <Box id="chat-area">
                        <Paper
                            ref={chatArea}
                            sx={{
                                height: `calc( 100vh - ${isReply ? "209px" : "163px"})`
                                , p: 2, pt: 3, pb: 9, borderRadius: 0, overflowY: "scroll", overflowX: "hidden", position: "relative", mb: { xs: 9, md: 0 }
                            }}
                        >
                            <MessagesBox
                                roomMessages={roomMessage ? roomMessage : []}
                                ReplyClick={ReplyClick}
                                EditClick={EditClick}
                                CopyClick={CopyClick}
                                DeleteClick={DeleteClick}
                                replyScroll={replyScroll}
                                setIsForward={setIsForward}
                                setForwardMessage={setForwardMessage}
                                chatArea={chatArea}
                            />
                        </Paper>
                    </Box>

                    <Box sx={{ position: "absolute", bottom: 0, width: "100%", background: "#101010" }}>
                        <Box sx={{ position: "absolute", left: "10px", top: "-50px", opacity: showToButton ? 1 : 0, transition: "0.3s all" }} onClick={() => actisToBottom({ send: true, isOneself: true })}>
                            <CircleButton3>
                                <IconArrowNarrowDown size={20} stroke={2} />
                            </CircleButton3>
                        </Box>
                        <form onSubmit={(e) => handleSendMsg(e)}>
                            <Box sx={{ pt: 1, mb: 1, position: "relative", borderTop: "1px solid #997017" }}>
                                <ForwardBox
                                    isForward={isForward}
                                    theme={theme}
                                    setIsForward={setIsForward}
                                    isForwardClose={isForwardClose}
                                    ForwardMessage={ForwardMessage}
                                    setForwardMessage={setForwardMessage}
                                />
                                {
                                    typingText != "" &&
                                    <Box sx={{ position: "absolute", left: "30px", top: "-30px", color: theme.palette.text.disabled, fontWeight: "600" }}>
                                        {typingText}<img src={typingAnim} style={{ width: "15px", height: "5px", marginLeft: 5 }} alt="typing" />
                                    </Box>
                                }
                                <Grid>
                                    <Grid item>
                                        <ReplyBox
                                            isReply={isReply}
                                            isReplyClose={isReplyClose}
                                            theme={theme}
                                            replyMessage={replyMessage}
                                        />
                                    </Grid>
                                    <Grid item>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
                                            <Upload {...props}>
                                                <CircleButton1 type="button" sx={{ mt: "5px", color: "#FBC34A" }}>
                                                    <IconPhoto size={25} stroke={2} />
                                                </CircleButton1>
                                            </Upload>
                                            <Upload {...props}>
                                                <CircleButton1 type="button" sx={{ mt: "5px", color: "#FBC34A" }}>
                                                    <IconLink size={25} stroke={2} />
                                                </CircleButton1>
                                            </Upload>
                                            <FormControl fullWidth variant="outlined" sx={{ mr: 1 }}>
                                                <OutlinedInput
                                                    id="messages-box"
                                                    placeholder="New message"
                                                    readOnly={false}
                                                    value={msg}
                                                    multiline={isMultiline}
                                                    onPaste={async (e) => {
                                                        const clipboardItem = e.clipboardData.files[0]
                                                        const fileReader = new FileReader();
                                                        if (clipboardItem) {
                                                            fileReader.onload = () => {
                                                                if (clipboardItem.type.startsWith("x-msdownload")) {
                                                                    showToast("error", "This file is not supported")
                                                                    return
                                                                } else {
                                                                    setUploadFiles(clipboardItem)
                                                                    setImg(fileReader.result)
                                                                    setIsPreviewFiles(true)
                                                                }
                                                            }
                                                            fileReader.readAsDataURL(clipboardItem);
                                                        }
                                                    }}
                                                    onChange={(e) => {
                                                        setMsg(e.target.value);
                                                        if (e.target.value.length > 0 && !isTyping) {
                                                            setIsTyping(true);
                                                            socketSendTyping(selectedRoom.id, 1);
                                                        } else if (e.target.value.length === 0 && isTyping) {
                                                            setEditingMessage(null)
                                                            setIsTyping(false);
                                                            socketSendTyping(selectedRoom.id, 0);
                                                        }
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.shiftKey && e.key === "Enter") {
                                                            setIsMultiline(true)
                                                        } else if (e.key === "Enter") {
                                                            handleSendMsg(e)
                                                        }
                                                    }}
                                                    sx={{ color: "white" }}
                                                />
                                            </FormControl>
                                            <CircleButton1 type="submit" sx={{ mt: "5px", color: "#FBC34A" }}>
                                                <IconSend size={25} stroke={2} />
                                            </CircleButton1>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        </form >
                    </Box>
                </Box >
                </>) : (
                <Typography variant="body2">
                    Select a conversation or Create a New one
                </Typography>)
        }
    </Grid>)
};


export default memo(Conversation);
