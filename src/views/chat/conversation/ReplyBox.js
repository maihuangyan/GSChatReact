import React from 'react'
import {
    Box,
    Typography,
} from "@mui/material";
import { IconX } from "@tabler/icons";
import { getUserDisplayName } from 'utils/common';

export default function ReplyBox({ isReply, isReplyClose, theme, replyMessage }) {
    return (
        <Box sx={{ display: isReply ? "flex" : "none", justifyContent: "start", alignItems: "center", p: "0 0 0 5px", background: "#101010", mb: "5px" }}>
            <Typography component="span" sx={{ cursor: "pointer", mr: 1, }} onClick={() => isReplyClose()}>
                <IconX size={20} stroke={2} color='#b5b5b5' /></Typography>
            <Typography component="div" sx={{
                width: "100%", color: theme.palette.text.black, p: "0 12px", position: "relative", borderLeft: "2px solid #FBC34A"
            }}>
                <Typography component="p" variant="h5" sx={{ color: theme.palette.primary.main, mb: "4px" }}>
                    {replyMessage?.user ? getUserDisplayName(replyMessage.user) : replyMessage?.username}
                </Typography>
                <Typography component="p" color="#b5b5b5">{replyMessage?.type === 0 ? replyMessage.message : (replyMessage?.type === 1 ? "image" : (replyMessage?.type === 2 ? "file" : replyMessage?.forward_message?.message))}</Typography>
            </Typography>
        </Box>
    )
}
