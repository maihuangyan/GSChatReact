import React, { useState, useContext, useEffect, lazy, memo } from 'react'
import {
    Box,
    Grid,
    Button,
    FormControl,
    OutlinedInput,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { IconSend, IconLink, IconPhoto, IconArrowNarrowDown } from "@tabler/icons";
import { Upload } from 'antd';
import { LoaderContext } from "utils/context/ProgressLoader";
import { SocketContext } from "utils/context/SocketContext";
import { useDispatch, useSelector } from "react-redux";
import typingAnim from 'assets/images/anim/typing.gif'
import { getUserDisplayName, } from "utils/common";
import Loadable from "ui-component/Loadable";
import { setSendMsg } from 'store/actions/messages';
import { setIsTyping } from "store/actions/sandBoxConnect"
import { setIsReply, setEditingMessage, setReplyMessage } from 'store/actions/messageBoxConnect';

const ReplyBox = Loadable(lazy(() => import('./component/ReplyBox')));
const ForwardBox = Loadable(lazy(() => import('./component/ForwardBox')));

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

function SendMsgBox(props) {
    const { actisToBottom, setIsPreviewFiles, setImg, setUploadFiles } = props

    const selectedRoom = useSelector((state) => state.room.selectedRoom);
    const sendMsg = useSelector((state) => state.messages.sendMsg);
    const showToBottom = useSelector((state) => state.sendBoxConnect.showToBottom);
    const isTyping = useSelector((state) => state.sendBoxConnect.isTyping);
    const theme = useTheme();
    const dispatch = useDispatch()

    const showToast = useContext(LoaderContext).showToast

    const opponentTyping = useContext(SocketContext).opponentTyping
    const socketSendTyping = useContext(SocketContext).socketSendTyping
    const socketSendMessage = useContext(SocketContext).socketSendMessage
    const socketUpdateMessage = useContext(SocketContext).socketUpdateMessage
    const replyMessage = useSelector((state) => state.messageBoxConnect.replyMessage);
    const editingMessage = useSelector((state) => state.messageBoxConnect.editingMessage);

    const [msg, setMsg] = useState("");
    const [typingText, setTypingText] = useState('');
    const [isMultiline, setIsMultiline] = useState(false)

    const handleSendMsg = (e) => {
        e.preventDefault();
        if (editingMessage) {
            socketUpdateMessage(editingMessage, msg)
            dispatch(setEditingMessage(null))
            setMsg("");
            dispatch(setSendMsg(""))
            socketSendTyping(selectedRoom.id, 0);
            dispatch(setIsTyping(false))
            dispatch(setIsReply(false))
        }
        else {
            if (msg.length) {
                socketSendMessage(selectedRoom.id, '0', msg, replyMessage ? replyMessage.id : 0);
                setMsg("");
                socketSendTyping(selectedRoom.id, 0);
                dispatch(setIsTyping(false))
                dispatch(setIsReply(false))
                actisToBottom({ send: true, isOneself: true })
                dispatch(setReplyMessage(null))
                // setNewMessageCount(newMessageCount + 1)
            }
        }
    };
    const handlePaste = (e) => {
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
    }

    const handleChange = (e) => {
        e.preventDefault();
        setMsg(e.target.value);
        if (e.target.value.length > 0 && !isTyping) {
            dispatch(setIsTyping(true))
            socketSendTyping(selectedRoom.id, 1);
        } else if (e.target.value.length === 0 && isTyping) {
            dispatch(setEditingMessage(null))
            dispatch(setIsTyping(false))
            socketSendTyping(selectedRoom.id, 0);
        }
    }
    const handleKeyDown = (e) => {
        if (e.shiftKey && e.key === "Enter") {
            setIsMultiline(true)
        } else if (e.key === "Enter") {
            handleSendMsg(e)
        }
    }

    const uploadProps = {
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

    useEffect(() => {
        if (replyMessage) {
            dispatch(setReplyMessage(null))
        }
    }, [selectedRoom])

    useEffect(() => {
        if (sendMsg) {
            setMsg(sendMsg)
        }
    }, [sendMsg])

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
    }, [opponentTyping,selectedRoom])


    return (
        <>
            {/* {console.log("sendbox")} */}
            <Box sx={{ position: "absolute", bottom: 0, width: "100%", background: "#101010" }}>
                <Box sx={{ position: "absolute", left: "10px", top: "-50px", opacity: showToBottom ? 1 : 0, transition: "0.3s all" }} onClick={() => actisToBottom({ send: true, isOneself: true })}>
                    <CircleButton3>
                        <IconArrowNarrowDown size={20} stroke={2} />
                    </CircleButton3>
                </Box>
                <form onSubmit={handleSendMsg}>
                    <Box sx={{ pt: 1, mb: 1, position: "relative", borderTop: "1px solid #997017" }}>
                        <ForwardBox />
                        {
                            typingText !== "" &&
                            <Box sx={{ position: "absolute", left: "30px", top: "-30px", color: theme.palette.text.disabled, fontWeight: "600" }}>
                                {typingText}<img src={typingAnim} style={{ width: "15px", height: "5px", marginLeft: 5 }} alt="typing" />
                            </Box>
                        }
                        <Grid>
                            <Grid item>
                                <ReplyBox replyMessage={replyMessage} setReplyMessage={setReplyMessage} />
                            </Grid>
                            <Grid item>
                                <Box sx={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
                                    <Upload {...uploadProps}>
                                        <CircleButton1 type="button" sx={{ mt: "5px", color: "#FBC34A" }}>
                                            <IconPhoto size={25} stroke={2} />
                                        </CircleButton1>
                                    </Upload>
                                    <Upload {...uploadProps}>
                                        <CircleButton1 type="button" sx={{ mt: "5px", color: "#FBC34A" }}>
                                            <IconLink size={25} stroke={2} />
                                        </CircleButton1>
                                    </Upload>
                                    <FormControl fullWidth variant="outlined" sx={{ mr: 1 }}>
                                        <OutlinedInput
                                            id="message-box"
                                            placeholder="New message"
                                            readOnly={false}
                                            value={msg}
                                            multiline={isMultiline}
                                            autoComplete="off"
                                            onPaste={handlePaste}
                                            onChange={handleChange}
                                            onKeyDown={handleKeyDown}
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
        </>
    )
}
export default memo(SendMsgBox)