import React from 'react'
import {
    Box,
} from "@mui/material";
import useJwt from "utils/jwt/useJwt";
import { useSelector } from "react-redux";
import { useTheme } from "@mui/material/styles";

import ChatTextLine from './ChatTextLine';

let firstDate = ""
function MessagesBox({ roomMessages, ReplyClick, EditClick, CopyClick, DeleteClick, replyScroll, setIsForward, setForwardMessage , chatArea}) {

    const selectedRoom = useSelector((state) => state.room.selectedRoom);
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
    
    return (
        <>
            {
                roomMessages.length ? roomMessages.map((item, index) => {
                    const showDateDivider = firstDate !== item.sentDate;
                    firstDate = item.sentDate;
                    const right = item.senderId === Number(useJwt.getUserID())

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
                                    setIsForward={setIsForward}
                                    setForwardMessage={setForwardMessage}
                                    chatArea={chatArea}
                                />
                            ))}
                        </Box>
                    )
                }) : ""
            }
        </>
    )
}

export default React.memo(MessagesBox)
