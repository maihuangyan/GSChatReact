import React from 'react'
import {
    Box,
    Typography,
} from "@mui/material";
import { IconX } from "@tabler/icons";

export default function ReplyBox({ isReply, isReplyClose, theme, replyUser , replyDate}) {
    return (
        <Box sx={{ display: isReply ? "flex" : "none", justifyContent: "start", alignItems: "center", p: "0 0 0 5px",background: "#000", mb:"5px"}}>
            <Typography component="span" sx={{ cursor: "pointer", mr: 1 ,}} onClick={() => isReplyClose()}>
                <IconX size={20} stroke={2} color='#b5b5b5' /></Typography>
            <Typography component="div" sx={{
                width: "100%", background: "#101010", color: theme.palette.text.black, p: "0 12px", position: "relative", borderLeft:"2px solid #FBC34A"
            }}>
                <Typography component="p" variant="h5" sx={{ color: theme.palette.primary.main, mb: "4px" }}>
                    {replyDate?.username}
                </Typography>
                <Typography component="p" color="#b5b5b5">{replyDate?.type == 0 ? replyDate.message : (replyDate?.type == 1 ? "image" : (replyDate?.type == 3 ? replyDate.forward_message.message : ""))}</Typography>
            </Typography>
        </Box>
    )
}
