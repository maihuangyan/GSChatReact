import React from 'react'
import {
    Box,
    Typography,
} from "@mui/material";
import { IconX } from "@tabler/icons";

export default function ReplyBox({ isReply, isReplyClose, theme, replyUser, replyContent }) {

    return (
        <Box sx={{ display: isReply ? "flex" : "none", justifyContent: "start", alignItems: "center", p: "5px 15px 0 5px", position: "absolute", top: "-60px", left: 0, background: "#000", width: "100%", }}>
            <Typography component="span" sx={{ cursor: "pointer", pt: "5px", mr: 1 }} onClick={() => isReplyClose()}>
                <IconX size={20} stroke={2} /></Typography>
            <Typography component="div" sx={{
                width: "100%", background: theme.palette.primary.light, color: theme.palette.text.black, p: "5px 12px", position: "relative",
                borderRadius: "4px",
                "&:before": {
                    backgroundColor: theme.palette.primary.main,
                    bottom: 0,
                    content: '""',
                    height: "51px",
                    left: "-1px",
                    position: "absolute",
                    width: "5px",
                    borderRadius: "4px 0 0 4px"
                }
            }}>
                <Typography component="p" variant="h5" sx={{ color: replyUser?.right ? theme.palette.info.dark : theme.palette.primary.main, mb: "4px" }}>
                    {replyUser?.username}
                </Typography>
                <Typography component="p">{replyContent}</Typography>
            </Typography>
        </Box>
    )
}
