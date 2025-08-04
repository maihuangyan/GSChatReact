import React, { memo } from 'react'
import {
    Box,
    Typography,
} from "@mui/material";
import { IconX } from "@tabler/icons";
import { getUserDisplayName,getOriginalMessage } from '@/utils/common';
import { useDispatch, useSelector } from 'react-redux';
import { setIsReply } from '@/store/actions/messageBoxConnect';
import { useTheme } from "@mui/material/styles";

const ReplyBox = (props) => {
    const { replyMessage, setReplyMessage } = props;
    const theme = useTheme()

    const dispatch = useDispatch()
    const isReplyClose = () => {
        dispatch(setIsReply(false))
        dispatch(setReplyMessage(null))
    }
    const isReply = useSelector((state) => state.messageBoxConnect.isReply);

    return (
        <Box sx={{ display: isReply ? "flex" : "none", justifyContent: "start", alignItems: "center", p: "0 0 0 5px", background: "#101010", mb: "5px" }}>
            <Typography component="span" sx={{ cursor: "pointer", mr: 1, }} onClick={isReplyClose}>
                <IconX size={20} stroke={2} color='#b5b5b5' /></Typography>
            <Typography component="div" sx={{
                width: "100%", color: theme.palette.text.black, p: "0 12px", position: "relative", borderLeft: "2px solid #FBC34A"
            }}>
                {/* {console.log("ReplyBox")} */}

                <Typography component="p" variant="h5" sx={{ color: theme.palette.primary.main, mb: "4px" }}>
                    {replyMessage?.user ? getUserDisplayName(replyMessage.user) : replyMessage?.username}
                </Typography>
                <Typography component={replyMessage?.type === 3 ? 'p' : 'pre'} color="#b5b5b5">{replyMessage?.type === 0 ? replyMessage.message : (replyMessage?.type === 1 ? "image" : (replyMessage?.type === 2 ? "file" : getOriginalMessage(replyMessage))?.message)}</Typography>
            </Typography>
        </Box>
    )
}

export default memo(ReplyBox)