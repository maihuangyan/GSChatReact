import React, { memo } from 'react'
import {
    Box,
} from "@mui/material";
import useJwt from "utils/jwt/useJwt";
import { useSelector } from "react-redux";

import ChatTextLine from './ChatTextLine';

let firstDate = ""
function MessagesBox({ roomMessages, ReplyClick, EditClick, CopyClick, DeleteClick, TimeSeperator, formatChatTime, replyScroll, setIsForward, setForwardMessage, DateSeperator }) {

    const selectedRoom = useSelector((state) => state.room.selectedRoom);

    return (
        <>
            {
                roomMessages.map((item, index) => {
                    const showDateDivider = firstDate != item.sentDate;
                    firstDate = item.sentDate;
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
        </>
    )
}

export default memo(MessagesBox)
