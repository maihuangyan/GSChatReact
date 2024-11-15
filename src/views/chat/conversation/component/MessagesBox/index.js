import React, { useCallback, useContext, useState, useEffect } from 'react'
import {
    Box,
    Paper,
} from "@mui/material";
import useJwt from "utils/jwt/useJwt";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "@mui/material/styles";

import { SocketContext } from "utils/context/SocketContext";
import ChatTextLine from './component/ChatTextLine';
import { setIsReply, setReplyMessage, setEditingMessage } from 'store/actions/messageBoxConnect';
import { setIsTyping } from "store/actions/sandBoxConnect"
import { setSendMsg } from "store/actions/messages";
import { setForwardMessage, setIsForward } from 'store/actions/messageBoxConnect';

let firstDate = ""
const MessagesBox = (props) => {
    const { roomMessages, chatArea } = props

    const dispatch = useDispatch()
    const selectedRoom = useSelector((state) => state.room.selectedRoom);
    const isReply = useSelector((state) => state.messageBoxConnect.isReply);

    const socketSendTyping = useContext(SocketContext).socketSendTyping
    const socketDeleteMessage = useContext(SocketContext).socketDeleteMessage

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

    const ReplyClick = useCallback((content) => {
        // console.log(content)
        dispatch(setEditingMessage(null))
        dispatch(setIsForward(false))
        dispatch(setForwardMessage(null))
        dispatch(setSendMsg(""))
        dispatch(setReplyMessage(content.message))
        dispatch(setIsReply(true))
    }, [isReply])

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

    const EditClick = useCallback((content) => {
        dispatch(setIsReply(false))
        dispatch(setReplyMessage(null))
        dispatch(setIsForward(false))
        dispatch(setForwardMessage(null))
        dispatch(setEditingMessage(content.message))
        dispatch(setSendMsg(content.message.message))
        socketSendTyping(selectedRoom.id, 1);
        dispatch(setIsTyping(selectedRoom.id === content.message.room_id))
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

    return (
        <>
            {/* {console.log("messageBox")} */}

            <Box id="chat-area">
                <Paper
                    ref={chatArea}
                    sx={{
                        height: `calc( 100vh - ${isReply ? "209px" : "163px"})`
                        , p: 2, pt: 3, pb: 9, borderRadius: 0, overflowY: "scroll", overflowX: "hidden", position: "relative", mb: { xs: 9, md: 0 }
                    }}
                >
                    {
                        roomMessages.length ? roomMessages.map((item, index) => {
                            const showDateDivider = firstDate !== item.sentDate;
                            firstDate = item.sentDate;
                            let right = item.senderId === Number(useJwt.getUserID())

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
                                            isGroup={selectedRoom.group}
                                            replyScroll={replyScroll}
                                            setForwardMessage={setForwardMessage}
                                        />
                                    ))}
                                </Box>
                            )
                        }) : ""
                    }
                </Paper>
            </Box>
        </>
    )
}

export default React.memo(MessagesBox)
