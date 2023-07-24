import { useState, useEffect, useRef, useContext } from "react";
import ReactDOM from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import useJwt from "utils/jwt/useJwt";
import { formatChatDate, formatChatTime } from "utils/common";

import {
    Box,
    Grid,
    Paper,
    Button,
    FormControl,
    Typography,
    Menu,
    MenuItem,
    InputLabel,
    OutlinedInput,
    Dialog,
    DialogActions,
    DialogTitle,
    ListItemText,
    Divider,
    Avatar,
} from "@mui/material";

import defaultAvatar from "../../../assets/images/users/default_avatar.png";
import { styled, useTheme } from "@mui/material/styles";
import { IconSend, IconDotsVertical, IconLink, IconPhoto } from "@tabler/icons";

import { getMessages } from "store/actions/messages"

import { clearChat } from "store/actions/chat";
import { SocketContext } from "utils/context/SocketContext";

import ClientAvatar from "ui-component/ClientAvatar";
import ChatTextLine from "./ChatTextLine"
import PreviewFiles from "./PreviewFiles";
import DraggerBox from "./DraggerBox";
import ReplyBox from "./ReplyBox";

import { Upload } from 'antd';

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

//Date seperator
const DateSeperator = ({ value }) => {
    const theme = useTheme();
    return (
        <Box sx={{ display: "flex", alignItems: "center", py: 2 }}>
            <Box
                sx={{ background: theme.palette.dark.main, flexGrow: 1, height: "1px" }}
            />
            <Box
                variant="span"
                sx={{
                    background: theme.palette.dark.main,
                    borderRadius: "15px",
                    padding: "3px 8px",
                }}
            >
                {value}
            </Box>
            <Box
                sx={{ background: theme.palette.dark.main, flexGrow: 1, height: "1px" }}
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
                color={theme.palette.text.dark}
                sx={{ verticalAlign: "text-bottom" }}
            >
                {content}
            </Typography>
        </Box>
    );
};

const Conversation = ({
    store, message
}) => {
    // const { selectedRoom } = store;
    const selectedRoom = useSelector((state) => state.room.selectedRoom);

    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    //const opponentTyping = useContext(SocketContext).opponentTyping?useContext(SocketContext).opponentTyping[store.selectedChat.room.id]:false
    const socketSendTyping = useContext(SocketContext).socketSendTyping
    const socketSendMessage = useContext(SocketContext).socketSendMessage
    const socketOpenMessage = useContext(SocketContext).socketOpenMessage

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
        setMessages(message);
        if (message && message.length) {
            let messageIDs = [];
            message.forEach((messages) => {
                messages.seens && messages.seens.forEach((seens) => {
                    if (seens.user_id != useJwt.getUserID() && seens.status != 1) {
                        messageIDs.push(messages.id);
                    }
                })
            });
            if (messageIDs.length > 0) socketOpenMessage(messageIDs);
        }

        if (selectedRoom && selectedRoom.id)
            dispatch({
                type: "NOTICE_SELECTED_CHAT_ROOM_ID",
                data: selectedRoom.id,
            });

        setMessages(message);
        setIsGroup(selectedRoom.group)

    }, [message]);


    const formattedChatData = () => {
        var formattedChatLog = [];
        if (!message || message.length == 0) return [];
        var chatLog = [...message];
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
            return (
                <Box key={index}
                    sx={{ position: "relative", pl: 2, pr: 2 , mt:1}}>
                    {showDateDivider && <DateSeperator value={item.sentDate} />}
                    {item.messages.map((message, index) => (
                        <ChatTextLine
                            item={item}
                            key={message.local_id}
                            content={message.message}
                            right={item.senderId == useJwt.getUserID()}
                            ReplyClick={ReplyClick}
                            EditClick={EditClick}
                            isReplyNews={isReplyNews}
                            TimeSeperator={TimeSeperator}
                            formatChatTime={formatChatTime}
                        />
                    ))}
                    <Typography component="div" variant={item.senderId == useJwt.getUserID() ? "positionRight" : "positionLeft"} sx={{ display: isGroup ? "block" : "none" }}>{item.senderId == useJwt.getUserID() ? userData.username : (isGroup ? senderUsername : selectedRoom.room_users[0].username)}</Typography>

                    <Typography component="div" variant={item.senderId == useJwt.getUserID() ? "positionRight1" : "positionLeft1"} sx={{ display: isGroup ? "block" : "none" }}>
                        <ClientAvatar
                            avatar={
                                item.photo
                                    ? item.photo
                                    : defaultAvatar
                            }
                            size={20}
                        />
                    </Typography>
                </Box>
            );
        });
    };

    // ** Sends New Msg
    const handleSendMsg = (e) => {
        e.preventDefault();
        if (msg.length) {
            socketSendMessage(selectedRoom.id, 1, msg);
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
                    dispatch(clearChat(selectedRoom));
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
        setReplyContent(content.content)
        if (content.right) {
            setReplyUser({ username: userData.username, right: content.right })
        } else {
            let senderUsername = selectedRoom.room_users.filter(user => user.id === content.senderId)[0]?.username
            setReplyUser({ username: selectedRoom.group ? senderUsername : selectedRoom.room_users[0].username, right: content.right })
        }
    }
    const EditClick = (content) => {
        setIsReply(true)
        setReplyContent(content.content)
        setReplyUser({ username: "Edit", right: content.right })
    }
    const isReplyClose = () => {
        setIsReply(false)
    }

    const userData = useSelector((state) => state.auth.userData);

    const [isChangeClient, setIsChangeClient] = useState(null);

    useEffect(() => {
        if (selectedRoom && isChangeClient !== selectedRoom.id) {
            setIsReply(false);
            setImg(null)
            setIsPreviewFiles(false)
        }
        setIsChangeClient(selectedRoom && selectedRoom.id)
    }, [message])

    const [uploadFiles, setUploadFiles] = useState(null);
    const [img, setImg] = useState(null);

    const onChangeFiles = (e) => {
        // useJwt
        //   .uploadFile(idata)
        //   .then((res) => {
        //     if (res.data.ResponseCode == 0) {
        //       console.log(res.data.ResponseResult.file_url)
        //       setUploadPhoto(res.data.ResponseResult.file_url)
        //     }
        //     else {
        //     }
        //   })
        //   .catch((err) => {
        //     console.log(err);
        //   });
    };

    const [isPreviewFiles, setIsPreviewFiles] = useState(false);


    const scrollToBottom = () => {
        if (selectedRoom.id) {

            const conversationBox = document.querySelector(".css-7atonj-MuiPaper-root")
            if (conversationBox.scrollHeight > conversationBox.clientHeight) {
                conversationBox.scrollTop = conversationBox.scrollHeight
            }
        }
    }

    const scrollToTop = () => {
        if (selectedRoom.id) {
            const conversationBox = document.querySelector(".css-7atonj-MuiPaper-root")
            conversationBox.onscroll = () => {
                if (conversationBox.scrollTop == 0 && conversationBox.scrollHeight > conversationBox.clientHeight) {
                    dispatch(getMessages({ id: selectedRoom.id, last_message_id: message[0]?.id }))
                }
            }

        }
    }

    useEffect(() => {
        scrollToTop()
        scrollToBottom()
    }, [message])

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
                    paddingBottom: "20px",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    width: "100%",
                    height: { xs: "auto", sm: "auto", md: "100%" },
                    position: "relative"
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
                    isPreviewFiles={isPreviewFiles} setIsPreviewFiles={setIsPreviewFiles}
                    img={img}
                    uploadFiles={uploadFiles}
                    CircleButton1={CircleButton1}
                    msg={msg}
                    setMsg={setMsg}
                    setIsTyping={setIsTyping}
                    isTyping={isTyping} />
                <Grid container>
                    <Grid item xs={12} sm={12} md={6}>
                        <Box sx={{ display: "flex", alignItems: "center", p: 2, pb: 0 }}>
                            <ClientAvatar
                                avatar={selectedRoom.room_users[0].client_photo || defaultAvatar}
                                status={selectedRoom.room_users[0].status === 1}
                                size={40}
                                group={selectedRoom.group}
                                name={selectedRoom.name}
                            />
                            <Box sx={{ ml: 3 }}>
                                <Typography variant="h3">
                                    {selectedRoom.name}
                                </Typography>
                                <Typography>
                                    {message?.length}
                                    &nbsp;
                                    messages</Typography>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={12} md={6}>
                        <Paper
                            sx={{
                                p: 2,
                                display: "flex",
                                justifyContent: "end",
                                mb: 2,
                                backgroundColor: "#000",
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
                        sx={{ height: "calc( 100vh - 281px)", p: 3, pb: 8, overflowY: "auto" }}
                        ref={chatArea}
                    >
                        {renderChats()}
                    </Paper>
                </Box>

                <form onSubmit={(e) => handleSendMsg(e)}>
                    <Box sx={{ pt: 2, position: "relative" }}>
                        <ReplyBox
                            isReply={isReply}
                            isReplyClose={isReplyClose}
                            theme={theme}
                            replyUser={replyUser}
                            replyContent={replyContent}
                        />
                        <Box sx={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
                            <Upload {...props}>
                                <CircleButton1 type="button" sx={{ mt: "5px" }}>
                                    <IconPhoto size={25} stroke={1} />
                                </CircleButton1>
                            </Upload>
                            <CircleButton1 type="button" component="label" sx={{ mt: "5px", mr: 2 }}>
                                <IconLink size={25} stroke={1} />
                                <input
                                    type="file"
                                    name="imgCollection"
                                    onChange={(e) => {
                                        onChangeFiles(e);
                                    }}
                                    multiple
                                    hidden
                                />
                            </CircleButton1>
                            <FormControl fullWidth variant="outlined" sx={{ mr: 1 }}>
                                <InputLabel sx={{ color: "white" }} htmlFor="message-box">
                                    Type your message
                                </InputLabel>
                                <OutlinedInput
                                    id="message-box"
                                    value={msg}
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
                                    label="Type your message"
                                />
                            </FormControl>
                            <CircleButton1 type="submit" sx={{ mt: "5px" }}>
                                <IconSend size={25} stroke={1} />
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
