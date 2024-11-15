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

export default function PreviewFiles({ roomId, isPreviewFiles, setIsPreviewFiles, img, uploadFiles, CircleButton1, chatArea }) {

    const theme = useTheme();
    const socketSendMessage = useContext(SocketContext).socketSendMessage;

    const [msg, setMsg] = useState("");
    const [isImage, setIsImage] = useState(false);
    const [isVideo, setIsVideo] = useState(false);

    const isPreviewFilesClose = () => {
        setIsPreviewFiles(false)
    }

    useEffect(() => {
        if (uploadFiles) {
            const isImg = uploadFiles.type.split("/")[0]
            const imgType = ["jpeg","png","webp","gif"].includes(uploadFiles.type.split("/")[1].toLowerCase())
            const imgNameType = ["jpeg","png","webp","gif"].includes(uploadFiles.name.split(".")[1].toLowerCase())
            if (isImg === 'image' || imgType || imgNameType) {
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

    const actionScrollToBottom = (send) => {
        const chatContainer = chatArea.current;
        if (chatContainer) {
            //chatContainer.scrollTop = Number.MAX_SAFE_INTEGER;
            if (send) {
                chatContainer.scrollTo({
                    top: chatContainer.scrollHeight,
                    behavior: "smooth"
                })
            } else {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
        }
    };
    const handleUseJwe = (formData) => {
        useJwt
            .uploadFiles(formData)
            .then((res) => {
                if (res.data.ResponseCode === 0) {
                    let fileIds = ''
                    for (let fileRes of res.data.ResponseResult) {
                        if (!fileIds) {
                            fileIds += fileRes.id
                        }
                        else {
                            fileIds += ',' + fileRes.id
                        }
                    }
                    socketSendMessage(roomId, (isImage ? 1 : 2), fileIds, 0, 0, msg);
                }
                else {
                    console.log(res.data)
                }
            })
            .catch((err) => console.error(err))
        setTimeout(() => {
            console.log("444")
            actionScrollToBottom(true)
        }, 3000)
        setMsg("")
        setIsPreviewFiles(false)
    }

    const handleSendFiles = () => {
        const formData = new FormData();
        if (isImage) {
            const imgInfo = (url) => {
                return new Promise((resolve, reject) => {
                    let img = new Image()
                    img.src = url
                    img.onload = () => {
                        return resolve({ width: img.naturalWidth, height: img.naturalHeight })
                    }
                })
            }
            imgInfo(img).then(res => {
                formData.append('imgInfo', JSON.stringify(res));
                formData.append('type', 1);
                formData.append("files", uploadFiles);
                handleUseJwe(formData)
            })
        } else {
            formData.append('type', 2);
            formData.append("files", uploadFiles);
            handleUseJwe(formData)
        }


    }
    return <>
            {/* {console.log("formData")} */}

        <Box
            sx={{
                display: isPreviewFiles ? "flex" : "none",
                flexDirection: "column",
                width: "100%",
                // height: { xs: "auto", sm: "auto", md: "100%" },
                height: "100%",
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

            <Box
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

            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <FormControl fullWidth variant="outlined" sx={{ mr: 1 }}>
                    <InputLabel sx={{ color: "white" }} htmlFor="message-box">
                        Type your title
                    </InputLabel>
                    <OutlinedInput
                        id="message-box"
                        value={msg}
                        onChange={(e) => {
                            setMsg(e.target.value)
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleSendFiles()
                            }
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
