import React, { useContext, useEffect, useState } from 'react'
import {
    Box,
    FormControl,
    Typography,
    InputLabel,
    OutlinedInput,
} from "@mui/material";
import { IconSend, IconX, IconFile, IconMovie } from "@tabler/icons";
import { useTheme } from "@mui/material/styles";
import useJwt from "utils/jwt/useJwt";
import { SocketContext } from 'utils/context/SocketContext';

export default function PreviewFiles({ roomId, isPreviewFiles, setIsPreviewFiles, img, uploadFiles, CircleButton1, }) {

    const theme = useTheme();
    const socketSendMessage = useContext(SocketContext).socketSendMessage;
    const socketSendTyping = useContext(SocketContext).socketSendTyping;

    const [msg, setMsg] = useState("");
    const [isImage, setIsImage] = useState(false);
    const [isVideo, setIsVideo] = useState(false);
    
    const isPreviewFilesClose = () => {
        setIsPreviewFiles(false)
    }

    useEffect(() => {
        if (uploadFiles) {
            const isImg = uploadFiles.type.split("/")[0]
            if (isImg === 'image') {
                setIsImage(true)
                setIsVideo(false)
            } else if (isImg === 'video') {
                setIsVideo(true)
                setIsImage(false)
            } else {
                setIsImage(false)
                setIsVideo(false)
            }
        }
    }, [uploadFiles])

    const handleSendFiles = () => {
        const formData = new FormData();
        formData.append('type', isImage ? 1 : 2);
        formData.append("files", uploadFiles);

        useJwt
            .uploadFiles(formData)
            .then((res)=>{
                if (res.data.ResponseCode == 0) {
                    let fileIds = ''
                    for (let fileRes of res.data.ResponseResult) {
                        if (!fileIds) {
                            fileIds += fileRes.id
                        }
                        else {
                            fileIds += ',' + fileRes.id
                        }
                    }

                    socketSendMessage(roomId, (isImage ? 1 : 2), fileIds);
                }
                else {
                    console.log(res.data)
                }
            })
            .catch((err) => console.error(err))

        setMsg("")
        setIsPreviewFiles(false)
    }
    return <>
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
                <Typography component="span" sx={{ width: "100%", overflow: "hidden" }}>
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
                {
                    isImage ? <img
                        src={img}
                        srcSet={img}
                        alt={""}
                        loading="lazy"
                        style={{ maxWidth: "100%", maxHeight: "100%", }}
                    /> : (isVideo ? <IconMovie size={80} stroke={2} /> : <IconFile size={80} stroke={2} />)
                }

            </Typography>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <FormControl fullWidth variant="outlined" sx={{ mr: 1 }}>
                    <InputLabel sx={{ color: "white" }} htmlFor="message-box">
                        Type your title
                    </InputLabel>
                    <OutlinedInput
                        // id="message-box"
                        value={msg}
                        onChange={(e) => {
                            setMsg(e.target.value)
                        }}
                        sx={{ color: "white" }}
                        label="Type your title"
                    />
                </FormControl>
                <CircleButton1 sx={{ mt: "5px" }} onClick={() => handleSendFiles()}>
                    <IconSend size={25} stroke={1} />
                </CircleButton1>
            </Box>
        </Box >
    </>
}
