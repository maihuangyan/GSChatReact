import React, { useState } from 'react'
import {
    Box,
    FormControl,
    Typography,
    InputLabel,
    OutlinedInput,
} from "@mui/material";
import { IconSend, IconX } from "@tabler/icons";
import { useTheme } from "@mui/material/styles";

export default function PreviewFiles({ isPreviewFiles, setIsPreviewFiles , img , uploadFiles ,CircleButton1 , msg , setMsg ,setIsTyping , isTyping }) {

    const theme = useTheme();


    const isPreviewFilesClose = () => {
        setIsPreviewFiles(false)
    }

    const handleSendFiles = () => {
        setIsPreviewFiles(false)
    }
    return <>
        <form onSubmit={(e) => handleSendFiles(e)}>
            <Box
                sx={{
                    display: isPreviewFiles ? "flex" : "none",
                    flexDirection: "column",
                    width: "100%",
                    height: { xs: "auto", sm: "auto", md: "100%" },
                    position: "absolute",
                    top: 0,
                    left: 0,
                    backgroundColor: "#000",
                    zIndex: 10,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        backgroundColor: theme.palette.primary.main,
                        p: 1,
                        color: theme.palette.text.black,
                        borderRadius: 1,
                    }}
                >
                    <Typography component="span">
                        {uploadFiles && uploadFiles.name}
                    </Typography>
                    <Typography component="span" sx={{ cursor: "pointer", p: "5px 10px 0 10px" }} onClick={() => isPreviewFilesClose()}>
                        <IconX size={20} stroke={2} />
                    </Typography>
                </Box>

                <Typography component="div"
                    sx={{
                        display: "flex",
                        justifyContent: "space-around",
                        alignItems: "center",
                        overflow: "hidden",
                        width: "100%",
                        height: "100%",
                    }}
                >
                    <img
                        src={img}
                        srcSet={img}
                        alt={""}
                        loading="lazy"
                        style={{ maxWidth: "100%", maxHeight: "100%", }}
                    />
                </Typography>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <FormControl fullWidth variant="outlined" sx={{ mr: 1 }}>
                        <InputLabel sx={{ color: "white" }} htmlFor="message-box">
                            Type your title
                        </InputLabel>
                        <OutlinedInput
                            id="message-box"
                            value={msg}
                            onChange={(e) => {
                                setMsg(e.target.value);
                                if (e.target.value.length > 0 && !isTyping) {
                                    setIsTyping(true);
                                    // socketSendTyping(selectedChat.room.id, 1);
                                } else if (e.target.value.length == 0 && isTyping) {
                                    setIsTyping(false);
                                    // socketSendTyping(selectedChat.room.id, 0);
                                }
                            }}
                            sx={{ color: "white" }}
                            label="Type your title"
                        />
                    </FormControl>
                    <CircleButton1 type="submit" sx={{ mt: "5px" }}>
                        <IconSend size={25} stroke={1} />
                    </CircleButton1>
                </Box>
            </Box >
        </form >
    </>
}
