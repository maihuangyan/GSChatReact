import React, { useContext } from 'react'
import {
    Box,
    Typography,
    Button,
} from "@mui/material";
import { IconX, IconSend } from "@tabler/icons";
import { styled, useTheme } from "@mui/material/styles";
import { SocketContext } from "utils/context/SocketContext";
import { useSelector } from "react-redux";

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

export default function ForwardBox({ isForward, isForwardClose, ForwardMessage, setIsForward, setForwardMessage }) {

    const theme = useTheme()
    const socketSendMessage = useContext(SocketContext).socketSendMessage

    const selectedRoom = useSelector((state) => state.room.selectedRoom);
    const handleForward = () => {
        // console.log(ForwardMessage)
        if (ForwardMessage) {
            socketSendMessage(selectedRoom.id, '3', "" + ForwardMessage.id, 0, ForwardMessage);
            setIsForward(false);
            setForwardMessage(null);
        }
    }
    return (
        <Box sx={{
            display: isForward ? "flex" : "none", justifyContent: "start", alignItems: "center",
            pb: 1, pl: "5px", background: "#101010", mb: "5px", position: "absolute", left: 0, top: "5px", zIndex: 10, width: "100%"
        }}>
            <Typography component="span" sx={{ cursor: "pointer", mr: 1, }} onClick={() => isForwardClose()}>
                <IconX size={20} stroke={2} color='#b5b5b5' /></Typography>
            <Box sx={{ p: "4px 6px", width: "100%", background: "#b5b5b5", borderRadius: "4px" }}>
                <Typography component="div" sx={{
                    color: theme.palette.text.black, p: "0 6px", position: "relative", borderLeft: "2px solid #FBC34A"
                }}>
                    <Typography component="p" variant="h5" color="#000">
                        {ForwardMessage?.username}
                    </Typography>
                    <Typography component="p" variant="body2">
                        {ForwardMessage?.type == 0 ? ForwardMessage.message : (ForwardMessage?.type == 1 ? "image" : (ForwardMessage?.type == 3 ? ForwardMessage.forward_message.message : ""))}
                    </Typography>
                </Typography>
            </Box>
            <CircleButton1 type="submit" sx={{ mt: "5px", color: "#FBC34A", ml: 1 }} onClick={() => handleForward()}>
                <IconSend size={25} stroke={2} />
            </CircleButton1>
        </Box>
    )
}
