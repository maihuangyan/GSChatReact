import { useState, useEffect, useRef, useContext, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import useJwt from "utils/jwt/useJwt";
import { formatChatDate, formatChatTime, isMessageSeen } from "utils/common";
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
    InputLabel,
    InputAdornment,
    IconButton
} from "@mui/material";

import { styled, useTheme } from "@mui/material/styles";
import { IconSend, IconDotsVertical, IconLink, IconPhoto, IconArrowLeft, IconSearch, IconX } from "@tabler/icons";

import { SocketContext } from "utils/context/SocketContext";

import ClientAvatar from "ui-component/ClientAvatar";
import ChatTextLine from "./ChatTextLine"
import PreviewFiles from "./PreviewFiles";
import DraggerBox from "./DraggerBox";
import ReplyBox from "./ReplyBox";
import Information from "./Information";
import ForwardBox from "./ForwardBox";

import { Upload } from 'antd';
import { selectRoomClear } from "store/actions/room";

let firstDate = ""

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

//Date seperator
const DateSeperator = ({ value }) => {
    const theme = useTheme();
    return (
        <Box sx={{ display: "flex", alignItems: "center", py: 2 }}>
            <Box
                sx={{ background: theme.palette.common.silverBar, flexGrow: 1, height: "1px" }}
            />
            <Box
                variant="span"
                sx={{
                    borderRadius: "15px",
                    padding: "3px 16px",
                    color: theme.palette.text.icon
                }}
            >
                {value}
            </Box>
            <Box
                sx={{ background: theme.palette.common.silverBar, flexGrow: 1, height: "1px" }}
            />
        </Box>
    );
};

//Time seperator
const TimeSeperator = ({ content }) => {
    const theme = useTheme();
    return (
        <Box sx={{ m: 0, textAlign: "right" }}>
            {/* <IconClock size={14} stroke={1} color={theme.palette.text.dark} />{" "} */}
            <Typography
                variant="span"
                color={theme.palette.text.icon}
                sx={{ verticalAlign: "text-bottom", fontSize: "12px" }}
            >
                {content}
            </Typography>
        </Box>
    );
};

const Conversation = () => {
    const selectedRoom = useSelector((state) => state.room.selectedRoom);
    const store = useSelector((state) => state.messages);
    const messagesChange = useSelector((state) => state.messages.change);

    const [isTyping, setIsTyping] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [roomMessages, setRoomMessages] = useState([]);

    const opponentsTyping = useContext(SocketContext).opponentTyping
    const opponentTyping = opponentsTyping ? opponentsTyping[selectedRoom.id] : false
    const socketSendTyping = useContext(SocketContext).socketSendTyping
    const socketSendMessage = useContext(SocketContext).socketSendMessage
    const socketOpenMessage = useContext(SocketContext).socketOpenMessage
    const socketUpdateMessage = useContext(SocketContext).socketUpdateMessage
    const socketDeleteMessage = useContext(SocketContext).socketDeleteMessage
    const scrollToBottom = useContext(SocketContext).scrollToBottom
    const addNewMessageCount = useContext(SocketContext).addNewMessageCount
    const getRoomOnlineStatus = useContext(SocketContext).getRoomOnlineStatus;
    const updateOnlineStatus = useContext(SocketContext).updateOnlineStatus;

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

    // ** Scroll to chat bottom
    const actionScrollToBottom = (send) => {
        const chatContainer = chatArea.current;
        if (chatContainer) {
            //chatContainer.scrollTop = Number.MAX_SAFE_INTEGER;
            if (send) {
                setTimeout(() => {
                    chatContainer.scrollTo({
                        top: chatContainer.scrollHeight,
                        behavior: "smooth"
                    })
                }, 50)
            } else {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
        }
    };

    const actionScrollToTop = () => {
        const chatContainer = chatArea.current;
        if (chatContainer) {
            chatContainer.onscroll = () => {
                if (chatContainer.scrollTop == 0 && chatContainer.scrollHeight > chatContainer.clientHeight) {
                    setScrollTop(scrollTop + 1)
                }
            }
        }
    };

    // ** If user chat is not empty scrollToBottom
    useEffect(() => {
        if (selectedRoom) {
            const roomMessages = store.messages[selectedRoom.id] ? store.messages[selectedRoom.id] : [];

            // console.log(roomMessages)
            // setRoomMessages([])
            formatChatData(roomMessages)
            let messageIDs = [];
            roomMessages.forEach((message) => {
                if (!isMessageSeen(message)) {
                    messageIDs.push(message.id)
                }
            });
            if (messageIDs.length > 0) socketOpenMessage(messageIDs);
        }
        setIsReply(false);
        setImg(null)
        setIsPreviewFiles(false)
    }, [store, selectedRoom]);

    useEffect(() => {
        actionScrollToTop()
    }, [scrollTop]);

    useEffect(() => {
        setScrollTop(0)
        setNewMessageCount(0)
        setRoomChange(!roomChange)
        actionScrollToTop()
    }, [selectedRoom])

    const formatChatData = (message) => {
        if (!selectedRoom || message.length == 0) return setRoomMessages([]);
        let formattedChatLog = [];
        let chatLog = [...message]
        chatLog = chatLog.sort((a, b) => (a.created_at > b.created_at ? 1 : a.created_at < b.created_at ? -1 : 0));
        let chatLogs = []
        if (scrollTop) {
            chatLogs = chatLog.filter((item, index) => index >= message.length - (30 + (10 * scrollTop)) - newMessageCount)
        } else {
            chatLogs = chatLog.filter((item, index) => index >= message.length - 30 - newMessageCount)
        }
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
        setRoomMessages(formattedChatLog)
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
                socketSendMessage(selectedRoom.id, '0', msg, replyMessage.id ? replyMessage.id : 0);
                setMsg("");
                socketSendTyping(selectedRoom.id, 0);
                setIsTyping(false);
                setIsReply(false)
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
        //console.log("clearing room id", selectedChat.room.id);

        useJwt
            .clearRoomMessages(selectedRoom.room_users[0].id)
            .then((res) => {
                if (res.data.ResponseCode == 0) {
                    //dispatch(clearChat(selectedRoom));
                }
                else {
                    console.log(res.data)
                }
            })
            .catch((err) => console.log(err));
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

    const ReplyClick = (content) => {
        console.log(content)
        setEditingMessage(null)
        setMsg('')
        setIsForward(false)
        setForwardMessage(null)

        setReplyMessage(content.message)
        setIsReply(true)
    }

    const EditClick = (content) => {
        setIsReply(false)
        setReplyMessage(null)
        setIsForward(false)
        setForwardMessage(null)

        setEditingMessage(content.message)
        setMsg(content.message.message);
        socketSendTyping(selectedRoom.id, 1);
        setIsTyping(true);
    }

    const CopyClick = async (content) => {
        try {
            await navigator.clipboard.writeText(content.message);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    }

    const DeleteClick = (content) => {
        socketDeleteMessage(content)
    }

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

    const replyScroll = (message) => {
        const chatContainer = chatArea.current;
        let btn = document.getElementById(message.reply_on_message ? message.reply_on_message.id : message.id)
        let options = {
            top: 0,
            behavior: 'smooth'
        }
        options.top = btn.parentNode.parentNode.parentNode.offsetTop + btn.offsetTop - 70
        chatContainer.scrollTo(options)
    }

    // useEffect(() => {
    //     if (selectedRoom && isChangeClient !== selectedRoom.id) {
    //         setIsReply(false);
    //         setImg(null)
    //         setIsPreviewFiles(false)
    //     }
    //     setIsChangeClient(selectedRoom && selectedRoom.id)
    // }, [store])

    const [uploadFiles, setUploadFiles] = useState(null);
    const [img, setImg] = useState(null);

    const [isPreviewFiles, setIsPreviewFiles] = useState(false);

    useEffect(() => {

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
        actionScrollToBottom(false);
    }, [showInformation, roomChange])

    useEffect(() => {
        if (scrollToBottom) {
            actionScrollToBottom(true);
            setNewMessageCount(newMessageCount + 1)
        }
    }, [scrollToBottom])
    // console.log(selectedRoom, "6666 ")

    const [navSearch, setNavSearch] = useState(false)
    const [query, setQuery] = useState("");

    const handleSearch = (e) => {
        setQuery(e.target.value);
    };

    return Object.keys(selectedRoom).length ? (
        showInformation ? <Information CircleButton1={CircleButton1} setShowInformation={setShowInformation} /> :
            <>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
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
                        <Box sx={{ background: "#101010", position: "absolute", top: 0, left: navSearch ? 0 : "100%", zIndex: 100, width: "100%", height: "100%", transition: "0.5s" }}>
                            <Box sx={{ display: "flex", justifyContent: "end", alignItems: "center" }}>
                                <FormControl fullWidth variant="outlined" sx={{ p: "0 10px" }}>
                                    <OutlinedInput
                                        // id="search-box"
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
                                <CircleButton1 onClick={() => setNavSearch(false)}>
                                    <IconX size={25} stroke={1} />
                                </CircleButton1>
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
                                    status={getRoomOnlineStatus(selectedRoom.id)}
                                    size={40}
                                    name={selectedRoom.name}
                                />
                                <Box sx={{ ml: 2 }}>
                                    <Typography variant={selectedRoom.group ? "h2" : "h4"}>
                                        {selectedRoom.name}
                                    </Typography>
                                    <Typography color={"#d5d5d5"}>{selectedRoom.group ? "" : (getRoomOnlineStatus(selectedRoom.id) ? "Online" : "Leave")}</Typography>
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
                                <MenuItem>
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
                                , p: 2, pt: 3, pb: 9, borderRadius: 0, overflowY: "auto"
                            }}
                        >
                            {
                                roomMessages.map((item, index) => {
                                    const showDateDivider = firstDate != item.sentDate;
                                    firstDate = item.sentDate;
                                    const right = item.senderId == useJwt.getUserID()
                                    console.log("6666")
                                    return (
                                        <Box key={index}
                                            sx={{
                                                position: "relative", mt: 1,
                                            }}>
                                            {showDateDivider && <DateSeperator value={item.sentDate} />}
                                            {item.messages.map((message, i) => (
                                                <ChatTextLine
                                                    item={item}
                                                    i={i}
                                                    key={i}
                                                    message={message}
                                                    right={right}
                                                    ReplyClick={ReplyClick}
                                                    EditClick={EditClick}
                                                    CopyClick={CopyClick}
                                                    DeleteClick={DeleteClick}
                                                    formatChatTime={formatChatTime}
                                                    isGroup={selectedRoom.group}
                                                    TimeSeperator={TimeSeperator}
                                                    replyScroll={replyScroll}
                                                    setIsForward={setIsForward}
                                                    setForwardMessage={setForwardMessage}
                                                />
                                            ))}
                                        </Box>
                                    )
                                })
                            }
                        </Paper>
                    </Box>

                    <form onSubmit={(e) => handleSendMsg(e)}>
                        <Box sx={{ pt: 1, mb: 1, position: "relative", borderTop: "1px solid #997017" }}>
                            <ForwardBox
                                isForward={isForward}
                                theme={theme}
                                setIsForward={setIsForward}
                                isForwardClose={isForwardClose}
                                ForwardMessage={ForwardMessage}
                            />
                            {
                                !selectedRoom.group && opponentTyping && opponentTyping.typing && <Box sx={{ position: "absolute", left: "30px", top: "-30px", color: theme.palette.text.disabled, fontWeight: "600" }}>
                                    {opponentTyping.user.username} is typing <img src={typingAnim} alt="typing..." style={{ width: "30px", height: "10px" }} />
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
                                                // id="message-box"
                                                readOnly={false}
                                                value={msg}
                                                onPaste={async (e) => {
                                                    // e.preventDefault();
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
