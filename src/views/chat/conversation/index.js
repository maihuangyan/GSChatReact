import { useState, useEffect, useRef, useContext, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import useJwt from "utils/jwt/useJwt";
import { formatChatDate, getRoomDisplayName, getUserDisplayName, isMessageSeen } from "utils/common";
import typingAnim from 'assets/images/anim/typing.gif'

import {
    Box,
    Grid,
    Paper,
    Button,
    FormControl,
    Typography,
    Menu,
    MenuItem,
    OutlinedInput,
    Dialog,
    DialogActions,
    DialogTitle,
    ListItemText,
    Divider,
    InputAdornment,
    IconButton
} from "@mui/material";

import { styled, useTheme } from "@mui/material/styles";
import { IconSend, IconDotsVertical, IconLink, IconPhoto, IconArrowLeft, IconSearch, IconX, IconArrowDown, IconArrowUp, IconArrowNarrowDown } from "@tabler/icons";

import { SocketContext } from "utils/context/SocketContext";

import ClientAvatar from "ui-component/ClientAvatar";
import MessagesBox from "./MessagesBox"
import PreviewFiles from "./PreviewFiles";
import DraggerBox from "./DraggerBox";
import ReplyBox from "./ReplyBox";
import Information from "./Information";
import ForwardBox from "./ForwardBox";

import { Upload } from 'antd';
import { selectRoomClear } from "store/actions/room";
import { clearRoomMessages } from "store/actions/messages";
import { getMessages } from "store/actions/messages";

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

const CircleButton2 = styled(Button)(({ theme }) => ({
    borderRadius: "50%",
    minWidth: "35px",
    height: "35px",
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
    const store = useSelector((state) => state.messages);

    const [isTyping, setIsTyping] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [roomMessage, setRoomMessages] = useState([]);

    const opponentTyping = useContext(SocketContext).opponentTyping

    const socketSendTyping = useContext(SocketContext).socketSendTyping
    const socketSendMessage = useContext(SocketContext).socketSendMessage
    const socketOpenMessage = useContext(SocketContext).socketOpenMessage
    const socketUpdateMessage = useContext(SocketContext).socketUpdateMessage
    const socketDeleteMessage = useContext(SocketContext).socketDeleteMessage
    const scrollToBottom = useContext(SocketContext).scrollToBottom
    const getRoomOnlineStatus = useContext(SocketContext).getRoomOnlineStatus;
    const updateOnlineStatus = useContext(SocketContext).updateOnlineStatus;
    let reachedTop = false;

    useEffect(() => {
        // console.log(updateOnlineStatus)
    }, [updateOnlineStatus])

    // ** Refs & Dispatch
    const chatArea = useRef(null);
    const dispatch = useDispatch();

    const [msg, setMsg] = useState("");
    const [newMessageCount, setNewMessageCount] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);
    const [roomChange, setRoomChange] = useState(false);
    const [typingText, setTypingText] = useState('');
    const [isToTop, setIsToTop] = useState(false);

    // ** Scroll to chat bottom
    const actisToBottom = (send) => {
        // console.log('called');
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
        if (chatContainer) {
            if (chatContainer.scrollTop + chatContainer.offsetHeight + 1 >= chatContainer.scrollHeight) {
                setShowToButton(false)
            } else {
                setShowToButton(true)
            }

            let roomMessages = store.messages[selectedRoom.id] ? store.messages[selectedRoom.id] : [];

            chatContainer.onscroll = () => {

                if (chatContainer.scrollTop + chatContainer.offsetHeight + 1 >= chatContainer.scrollHeight) {
                    setShowToButton(false)
                } else {
                    setShowToButton(true)
                }
                if (chatContainer.scrollTop == 0 && chatContainer.scrollHeight > chatContainer.clientHeight) {

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
                        reachedTop = true;
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
    useEffect(() => {
        // console.log('room changed', selectedRoom);
        if (selectedRoom) {
            let roomMessages = store.messages[selectedRoom.id] ? store.messages[selectedRoom.id] : [];

            if (roomMessages.length > 0) {
                roomMessages = roomMessages.sort((a, b) => (a.created_at > b.created_at ? 1 : a.created_at < b.created_at ? -1 : 0));
                const roomUsers = selectedRoom.room_users;
                let roomUser = null;
                if (roomUsers && roomUsers.length > 0) {
                    roomUsers.forEach(user => {
                        if (user.user_id == userData.id) {
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
            }

            if (roomMessages.length == chatLogs.length + 10) {
                setIsToTop(true)
            }
        }
        setIsReply(false);
        setImg(null)
        setIsPreviewFiles(false)
    }, [store, selectedRoom, scrollTop]);

    useEffect(() => {
        actisToTop()
    }, [scrollTop]);

    useEffect(() => {
        setScrollTop(0)
        setNewMessageCount(0)
        setRoomChange(!roomChange)
        actisToTop()
        setIsToTop(false)
    }, [selectedRoom])

    const formatChatData = (message) => {
        if (!selectedRoom || message.length == 0) return setRoomMessages([]);
        let formattedChatLog = [];
        let chatLogs = [...message]
        chatLogs = chatLogs.sort((a, b) => (a.created_at > b.created_at ? 1 : a.created_at < b.created_at ? -1 : 0));
        let msgGroup = {
            sentDate: formatChatDate(chatLogs[0].created_at * 1000), // for date divide,
            senderId: chatLogs[0].user_id,
            sentTime: chatLogs[0].created_at * 1000, // for checking 1 mins delay = diff: 60 * 1000,
            messages: [chatLogs[0]],
        };
        if (chatLogs.length == 1) {
            formattedChatLog.push(msgGroup);
        }

        for (let i = 1; i < chatLogs.length; i++) {
            let msgs = chatLogs[i];

            if (
                formatChatDate(+msgs.created_at * 1000) == msgGroup.sentDate &&
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

            if (i == chatLogs.length - 1) {
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

    const handleDialogClickOpen = () => {
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    const handleConfirmClear = () => {
        setDialogOpen(false);
        // console.log("clearing room id", selectedRoom);

        useJwt
            .clearRoomMessages(selectedRoom.id)
            .then((res) => {
                // console.log('api result', res.data);
                if (res.data.ResponseCode == 0) {
                    dispatch(clearRoomMessages(selectedRoom.id));
                } else {
                    console.log(res.data)
                }
            }).catch((err) => console.log(err));
    };

    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const [isReply, setIsReply] = useState(false);
    const [replyMessage, setReplyMessage] = useState(null);

    const [isForward, setIsForward] = useState(false);
    const [ForwardMessage, setForwardMessage] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const [isMultiline, setIsMultiline] = useState(false)

    const ReplyClick = useCallback((content) => {
        console.log(content)
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
        setIsTyping(true);
    }, [selectedRoom.id, socketSendTyping])

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
            uploadStyle.style.padding = "0"
        }

        document.onmouseleave = function (e) {
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
                setUploadFiles(file.file)
                setImg(fileReader.result)
                setIsPreviewFiles(true)
            }
            fileReader.readAsDataURL(file.file);
        },
    };

    const [draggerFile, setDraggerFile] = useState(false)
    const [showInformation, setShowInformation] = useState(false)

    useEffect(() => {
        actisToBottom({ send: false, isOneself: false });
        // console.log('reachedTop', reachedTop);
        // if (!reachedTop) {
        //     actisToBottom(false);
        // }
    }, [showInformation, roomChange])

    useEffect(() => {
        if (scrollToBottom) {
            actisToBottom({ send: true, isOneself: false });
            // console.log('reachedTop', reachedTop);
            // if (!reachedTop) {
            //     actisToBottom(true);
            // }
            // setNewMessageCount(newMessageCount + 1)
        }
    }, [roomChange, scrollToBottom])
    // console.log(selectedRoom, "6666 ")

    const [navSearch, setNavSearch] = useState(false)
    const [query, setQuery] = useState("");
    const [searchMessages, setSearchMessages] = useState([]);
    const [allSearchMessages, setAllSearchMessages] = useState([]);
    const [searchCount, setSearchCount] = useState(0);

    const [showToButton, setShowToButton] = useState(true)

    useEffect(() => {
        let handleMessages = []
        if (roomMessage) {
            roomMessage.map(item => handleMessages.push(item.messages))
        }
        setAllSearchMessages(handleMessages.flat(Infinity))
        setNavSearch(false)
        setQuery("")
        setSearchCount(0)
        setSearchMessages([])
        actisToTop()
        actisToBottom({ send: true, isOneself: true });
    }, [roomChange, roomMessage])

    const handleSearch = (e) => {
        let newSearchMessages = allSearchMessages.filter(item => item.message.toLowerCase().includes(e.target.value.toLowerCase()))
        setSearchMessages(allSearchMessages.filter(item => item.message.toLowerCase().includes(e.target.value.toLowerCase())))
        setSearchCount(newSearchMessages.length)
        setQuery(e.target.value);
        if (newSearchMessages.length) {
            searchScroll(newSearchMessages.pop())
        }
    };

    const searchScroll = (message) => {
        const chatContainer = chatArea.current;
        let btn = document.getElementById(message.id)
        let options = {
            top: 0,
            behavior: 'smooth'
        }
        options.top = btn.parentNode.parentNode.parentNode.offsetTop + btn.offsetTop - 70
        chatContainer.scrollTo(options)
    }

    useEffect(() => {
        if (searchCount > 0) {
            searchScroll(searchMessages[searchCount - 1])
        }
    }, [searchCount])

    useEffect(() => {
        console.log(opponentTyping)
        const typingUsers = opponentTyping ? opponentTyping[selectedRoom.id] : null

        if (!typingUsers || typingUsers.length == 0 || !selectedRoom) {
            console.log('here')
            setTypingText('');
            return;
        }
        if (selectedRoom.group == 0) {
            setTypingText('Typing');
            return;
        }

        let usernames = [];
        let opponents = selectedRoom.opponents;
        for (let i = 0; i < typingUsers.length; i++) {
            for (let j = 0; j < opponents.length; j++) {
                if (opponents[j].id == typingUsers[i]) {
                    usernames.push(getUserDisplayName(opponents[j]));
                    break;
                }
            }
        }
        if (usernames.length == 1) {
            setTypingText(usernames[0] + " is typing");
        } else {
            let result = "";
            for (let i = 0; i < usernames.length; i++) {
                if (i == usernames.length - 1) {
                    result += " and " + usernames[i] + " are typing";
                } else {
                    if (i) result += ", ";
                    result += usernames[i];
                }
            }
            setTypingText(result);
        }
    }, [opponentTyping])


    return Object.keys(selectedRoom).length ? (
        showInformation ? <Information CircleButton1={CircleButton1} setShowInformation={setShowInformation} /> :
            <>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "start",
                        width: "100%",
                        height: { xs: "auto", sm: "auto", md: "100%" },
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
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
                        setIsTyping={setIsTyping}
                        chatArea={chatArea}
                        isTyping={isTyping} />
                    <Grid container sx={{ borderBottom: "1px solid #997017", p: 1, position: "relative" }}>
                        <Box sx={{ background: "#101010", position: "absolute", top: 0, left: navSearch ? 0 : "100%", zIndex: 100, width: "100%", height: "90%", marginTop: '5px', transition: "0.5s" }}>
                            <Box sx={{ display: "flex", justifyContent: "end", alignItems: "center" }}>
                                <FormControl fullWidth variant="outlined" sx={{ p: "0 10px" }}>
                                    <OutlinedInput
                                        placeholder="Search Messages"
                                        sx={{ color: "white" }}
                                        value={query}
                                        onChange={handleSearch}
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <IconButton aria-label="search icon" edge="end">
                                                    <IconSearch size={25} stroke={1} />
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                    />
                                </FormControl>
                                <Box sx={{ width: "66px" }}>
                                    {searchCount} / {searchMessages.length}
                                </Box>
                                <Grid container sx={{ width: "auto", mr: 2 }}>
                                    <Grid item xs={6} md={6} sm={6}>
                                        <CircleButton2 onClick={() => searchMessages.length > searchCount && setSearchCount(searchCount + 1)
                                        }>
                                            <IconArrowDown size={20} stroke={2} />
                                        </CircleButton2>
                                    </Grid>
                                    <Grid item xs={6} md={6} sm={6} sx={{ pl: 1 }}>
                                        <CircleButton2 onClick={() => searchCount > 1 && setSearchCount(searchCount - 1)
                                        }>
                                            <IconArrowUp size={20} stroke={2} />
                                        </CircleButton2>
                                    </Grid>
                                </Grid>
                                <CircleButton2 onClick={() => (setNavSearch(false), setQuery(""), setSearchCount(0), setSearchMessages([]))}>
                                    <IconX size={25} stroke={2} />
                                </CircleButton2>
                            </Box>
                        </Box>
                        <Grid item xs={6} container>
                            <Box sx={{ display: "flex", alignItems: "center", pb: 0 }}>
                                <Box sx={{
                                    mr: 1, display: "none",
                                    "@media (max-width: 900px)": {
                                        display: "block",
                                    },
                                }}
                                    onClick={() => dispatch(selectRoomClear())}
                                >
                                    <CircleButton2>
                                        <IconArrowLeft size={20} stroke={3} />
                                    </CircleButton2>
                                </Box>
                                <ClientAvatar
                                    avatar={selectedRoom.photo_url ? selectedRoom.photo_url : ""}
                                    status={getRoomOnlineStatus(selectedRoom)}
                                    size={40}
                                    name={getRoomDisplayName(selectedRoom)}
                                />
                                <Box sx={{ ml: 2 }}>
                                    <Typography variant={selectedRoom.group ? "h2" : "h4"}>
                                        {getRoomDisplayName(selectedRoom)}
                                    </Typography>
                                    <Typography color={"#d5d5d5"}>{selectedRoom.group ? "" : (getRoomOnlineStatus(selectedRoom) ? "Online" : "Leave")}</Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={6} >
                            <Paper
                                sx={{
                                    display: "flex",
                                    justifyContent: "end",
                                }}
                            >
                                <CircleButton1 sx={{ mr: 1 }} onClick={() => setNavSearch(true)}>
                                    <IconSearch size={25} stroke={1} />
                                </CircleButton1>
                                <CircleButton1 type="button" onClick={handleClick}>
                                    <IconDotsVertical size={25} stroke={1} />
                                </CircleButton1>

                            </Paper>
                            <Menu
                                id="basic-menu"
                                anchorEl={anchorEl}
                                open={open}
                                onClose={handleClose}
                                MenuListProps={{
                                    "aria-labelledby": "basic-button",
                                }}
                            >
                                <MenuItem sx={{ minWidth: "150px" }} onClick={() => (setShowInformation(true), setAnchorEl(null))}>
                                    <ListItemText>Information</ListItemText>
                                </MenuItem>
                                <Divider />
                                <MenuItem onClick={() => { setDialogOpen(true); handleClose(); }}>
                                    <ListItemText>Clear</ListItemText>
                                </MenuItem>
                            </Menu>
                        </Grid>
                    </Grid>
                    <Box>
                        <Paper
                            ref={chatArea}
                            sx={{
                                height: `calc( 100vh - ${isReply ? "209px" : "163px"})`
                                , p: 2, pt: 3, pb: 9, borderRadius: 0, overflowY: "auto", position: "relative", mb: { xs: 9, md: 0 }
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
                                        {typingText}<img src={typingAnim} style={{ width: "15px", height: "5px", marginLeft: 5 }} />
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
                                                    placeholder="New message"
                                                    readOnly={false}
                                                    value={msg}
                                                    multiline={isMultiline}
                                                    onPaste={async (e) => {
                                                        for (const clipboardItem of e.clipboardData.files) {
                                                            if (clipboardItem.type.startsWith('image/')) {
                                                                setUploadFiles(clipboardItem)
                                                                setImg(URL.createObjectURL(clipboardItem))
                                                                setIsPreviewFiles(true)
                                                            }
                                                        }
                                                    }}
                                                    onChange={(e) => {
                                                        setMsg(e.target.value);
                                                        if (e.target.value.length > 0 && !isTyping) {
                                                            setIsTyping(true);
                                                            socketSendTyping(selectedRoom.id, 1);
                                                        } else if (e.target.value.length == 0 && isTyping) {
                                                            setEditingMessage(null)
                                                            setIsTyping(false);
                                                            socketSendTyping(selectedRoom.id, 0);
                                                        }
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.shiftKey && e.key == "Enter") {
                                                            setIsMultiline(true)
                                                        } else if (e.key == "Enter") {
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
                <Dialog
                    open={dialogOpen}
                    onClose={handleDialogClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        {"Are you sure want to clear all the chat history?"}
                    </DialogTitle>
                    <DialogActions>
                        <Button onClick={handleDialogClose}>Cancel</Button>
                        <Button
                            onClick={() => {
                                handleConfirmClear();
                            }}
                            autoFocus
                        >
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
    ) : (
        <Typography variant="body2">
            Select a conversation or Create a New one
        </Typography>
    );
};

export default Conversation;
