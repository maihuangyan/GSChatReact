import { useState, useEffect, useRef, useContext } from "react";
import ReactDOM from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
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
} from "@mui/material";

import defaultAvatar from "../../../assets/images/users/default_avatar.png";
import { styled, useTheme } from "@mui/material/styles";
import { IconSend, IconDotsVertical, IconLink, IconPhoto, IconArrowLeft } from "@tabler/icons";

import { SocketContext } from "utils/context/SocketContext";

import ClientAvatar from "ui-component/ClientAvatar";
import ChatTextLine from "./ChatTextLine"
import PreviewFiles from "./PreviewFiles";
import DraggerBox from "./DraggerBox";
import ReplyBox from "./ReplyBox";

import { Upload } from 'antd';
import { selectRoomClear } from "store/actions/room";

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

    const [isTyping, setIsTyping] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [roomMessages, setRoomMessages] = useState([]);

    const opponentsTyping = useContext(SocketContext).opponentTyping
    const opponentTyping = opponentsTyping ? opponentsTyping[selectedRoom.id] : false
    const socketSendTyping = useContext(SocketContext).socketSendTyping
    const socketSendMessage = useContext(SocketContext).socketSendMessage
    const socketOpenMessage = useContext(SocketContext).socketOpenMessage
    const scrollToBottom = useContext(SocketContext).scrollToBottom

    // ** Refs & Dispatch
    const chatArea = useRef(null);
    const dispatch = useDispatch();

    const [msg, setMsg] = useState("");
    const [isGroup, setIsGroup] = useState(null);

    // ** Scroll to chat bottom
    const actionScrollToBottom = () => {
        const chatContainer = ReactDOM.findDOMNode(chatArea.current);
        if (chatContainer)
            //chatContainer.scrollTop = Number.MAX_SAFE_INTEGER;
            chatContainer.scrollTop = chatContainer.scrollHeight;
    };

    // ** If user chat is not empty scrollToBottom

    useEffect(() => {
        if (selectedRoom) {
            const roomMessages = store.messages[selectedRoom.id] ? store.messages[selectedRoom.id] : [];
            setRoomMessages(roomMessages)
            let messageIDs = [];
            roomMessages.forEach((message) => {
                if (!isMessageSeen(message)) {
                    messageIDs.push(message.id)
                }
            });
            if (messageIDs.length > 0) socketOpenMessage(messageIDs);
        }

        setIsGroup(selectedRoom.group)

    }, [selectedRoom, store]);

    useEffect(() => {
        actionScrollToBottom();
        setIsReply(false);
        setImg(null)
        setIsPreviewFiles(false)
    }, [store])

    const formattedChatData = () => {
        var formattedChatLog = [];
        if (!selectedRoom || roomMessages.length == 0) return [];
        var chatLog = [...roomMessages];
        chatLog = chatLog.sort((a, b) => (a.id > b.id ? 1 : a.id < b.id ? -1 : 0));
        var msgGroup = {
            sentDate: formatChatDate(+chatLog[0].created_at * 1000), // for date divide,
            senderId: chatLog[0].user_id,
            sentTime: chatLog[0].created_at * 1000, // for checking 1 mins delay = diff: 60 * 1000,
            messages: [chatLog[0]],
        };
        if (chatLog.length == 1) {
            formattedChatLog.push(msgGroup);
        }

        for (let i = 1; i < chatLog.length; i++) {
            let msg = chatLog[i];

            if (
                formatChatDate(+msg.created_at * 1000) == msgGroup.sentDate &&
                msgGroup.senderId === msg.user_id &&
                parseInt(msg.created_at * 1000) - parseInt(msgGroup.sentTime) < 60 * 1000
            ) {
                msgGroup.messages.push(msg);
            } else {
                formattedChatLog.push(msgGroup);

                msgGroup = {
                    sentDate: formatChatDate(+msg.created_at * 1000),
                    senderId: msg.user_id,
                    sentTime: msg.created_at * 1000,
                    messages: [msg],
                };
            }

            if (i == chatLog.length - 1) {
                formattedChatLog.push(msgGroup);
            }
        }

        // formattedChatLog = formattedChatLog.sort((a,b) => (a.sentTime > b.sentTime) ? 1 : ((a.sentTime < b.sentTime) ? -1 : 0))
        // console.log('formattedChatLog', formattedChatLog);
        return formattedChatLog;
    };

    // ** Renders user chat
    const renderChats = () => {
        const formattedChatLog = formattedChatData();
        if (formattedChatLog.length == 0) return <div></div>;

        let firstDate = "";
        return formattedChatLog.map((item, index) => {
            const showDateDivider = firstDate != item.sentDate;
            firstDate = item.sentDate;
            let senderUsername = selectedRoom.room_users.filter(user => user.id === item.senderId)[0]?.username
            const right = item.senderId == useJwt.getUserID()
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
                            isReplyNews={isReplyNews}
                            formatChatTime={formatChatTime}
                            isGroup={isGroup}
                            TimeSeperator={TimeSeperator}
                        />
                    ))}
                </Box>
            );
        });
    };

    // ** Sends New Msg
    const handleSendMsg = (e) => {
        e.preventDefault();
        if (msg.length) {
            socketSendMessage(selectedRoom.id, '0', msg);
            if (isReply) {
                setIsReplyNews(true)
            } else {
                setIsReplyNews(false)
            }
            setMsg("");
            socketSendTyping(selectedRoom.id, 0);
            setIsTyping(false);
            setIsReply(false)
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
    const [isReplyNews, setIsReplyNews] = useState(false);
    const [replyContent, setReplyContent] = useState(null);
    const [replyUser, setReplyUser] = useState(null);

    const ReplyClick = (content) => {
        setIsReply(true)
        setReplyContent(content.message.message)
        if (content.right) {
            setReplyUser({ username: userData.username, right: content.right })
        } else {
            let senderUsername = selectedRoom.room_users.filter(user => user.id === content.senderId)[0]?.username
            setReplyUser({ username: selectedRoom.group ? senderUsername : selectedRoom.room_users[0].username, right: content.right })
        }
    }
    const EditClick = (content) => {
        setIsReply(true)
        setReplyContent(content.message.message)
        setReplyUser({ username: "Edit", right: content.right })
    }
    const isReplyClose = () => {
        setIsReply(false)
    }

    const userData = useSelector((state) => state.auth.userData);

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

    // console.log(selectedRoom, "6666 ")

    return Object.keys(selectedRoom).length ? (
        <>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    width: "100%",
                    height: { xs: "auto", sm: "auto", md: "100%" },
                    position: "relative",
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
                    isTyping={isTyping} />
                <Grid container sx={{ borderBottom: "1px solid #997017" }}>
                    <Grid item xs={6}>
                        <Box sx={{ display: "flex", alignItems: "center", p: 1, pb: 0 }}>
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
                                avatar={selectedRoom.room_users[0].client_photo || defaultAvatar}
                                status={selectedRoom.room_users[0].status === 1}
                                size={40}
                                group={selectedRoom.group}
                                name={selectedRoom.name}
                            />
                            <Box sx={{ ml: 3 }}>
                                <Typography variant="h4">
                                    {selectedRoom.name}
                                </Typography>
                                {
                                    opponentTyping && opponentTyping.typing == 1 ? <Typography component="p">
                                        <img className='chat-typing-anim' src={typingAnim} alt="typing..." style={{ width: "30px", height: "10px" }} />
                                    </Typography> : <Typography color={"#d5d5d5"}>Online</Typography>
                                }
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={6}>
                        <Paper
                            sx={{
                                display: "flex",
                                justifyContent: "end",
                                mb: 2,
                            }}
                        >
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
                            <MenuItem sx={{ minWidth: "150px" }}>
                                <ListItemText>mute</ListItemText>
                            </MenuItem>
                            <Divider />
                            <MenuItem>
                                <ListItemText>shield</ListItemText>
                            </MenuItem>
                            <Divider />
                            <MenuItem>
                                <ListItemText>file</ListItemText>
                            </MenuItem>
                            <Divider />
                            <MenuItem>
                                <ListItemText>delete</ListItemText>
                            </MenuItem>
                        </Menu>
                    </Grid>
                </Grid>
                <Box>
                    <Paper
                        sx={{ height: "calc( 100vh - 150px)", p: 2, pt: 3, pb: 9, overflowY: "auto", borderRadius: 0, }}
                        ref={chatArea}
                    >
                        {renderChats()}
                    </Paper>
                </Box>

                <form onSubmit={(e) => handleSendMsg(e)}>
                    <Box sx={{ pt: 1, mb: 1, position: "relative", borderTop: "1px solid #997017" }}>
                        <ReplyBox
                            isReply={isReply}
                            isReplyClose={isReplyClose}
                            theme={theme}
                            replyUser={replyUser}
                            replyContent={replyContent}
                        />
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
                                    id="message-box"
                                    value={msg}
                                    onPaste={async (e) => {
                                        e.preventDefault();

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
