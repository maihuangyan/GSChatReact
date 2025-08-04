import React, { useEffect, useCallback } from "react";
import { Box, Typography, Grid } from "@mui/material";
import { Dropdown } from "antd";
import { IconChevronDown, IconFile, IconArrowForwardUp } from "@tabler/icons";
import MessageImage from "@/ui-component/MessageImage";
import MessageImageGroup from "@/ui-component/MessageImageGroup";
import ReactPlayer from "react-player";
import { useSelector } from 'react-redux';
import { getSeenStatus, formatChatTime, getOriginalMessage, parsedMessage } from '@/utils/common';

function RightChatText({
    message,
    item,
    i,
    replyScroll,
    EditClick,
    ReplyClick,
    CopyClick,
    DeleteClick,
    showForward,
    setOpenId,
    openId,
    theme,
    imageType,
    imageSize,
    filesType,
    TimeSeperator
}) {

    const selectedRoom = useSelector((state) => state.room.selectedRoom);

    const handleEdit = useCallback(() => {
        EditClick({ message, right: true });
    }, [EditClick, message]);

    const rightItme = [
        {
            label: 'copy',
            key: '0',
            onClick: () => { CopyClick(message); setOpenId(null) }
        },
        {
            label: 'edit',
            key: '1',
            disabled: message.type === 0 ? false : true,
            onClick: handleEdit
        },
        {
            label: 'reply',
            key: '2',
            onClick: () => { ReplyClick({ message, right: true }); setOpenId(null) }
        },
        {
            label: 'forward',
            key: '3',
            onClick: () => { showForward(message); setOpenId(null) }
        },
        {
            label: 'delete',
            key: '4',
            onClick: () => { DeleteClick(message); setOpenId(null) }
        },
    ]

    const rightItmeWithFile = [
        {
            label: 'reply',
            key: '0',
            onClick: () => { ReplyClick({ message, right: true }); setOpenId(null) }
        },
        {
            label: 'forward',
            key: '1',
            onClick: () => { showForward(message); setOpenId(null) }
        },
        {
            label: 'delete',
            key: '2',
            onClick: () => { DeleteClick(message); setOpenId(null) }
        },
        {
            label: 'download',
            key: '3',
            onClick: async () => {
                setOpenId(null);

                try {
                    for (const file of message.files) {
                        const response = await fetch(file.thumbnail, { mode: 'cors' });
                        if (!response.ok) {
                            console.warn(`file ${file.origin_file_name} dowload failed `);
                            continue;
                        }

                        const blob = await response.blob();
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.download = file.origin_file_name || 'download';

                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(link.href);

                        await new Promise(resolve => setTimeout(resolve, 300));
                    }
                } catch (error) {
                    console.error('dowload failed:', error);
                }
            }
        }
    ]

    const isOpen = useCallback(() => openId === String(message.id), [openId, message.id]);

    useEffect(() => {
        if (!isOpen()) return

        setTimeout(() => {
            handleEdit()
        }, 0)
    }, [handleEdit, isOpen])

    return (
        <Box sx={{ display: "flex", justifyContent: "flex-end", "&:hover .down": { opacity: 1 } }} >
            <Typography
                id={`${message.id}`}
                component="div"
                color={theme.palette.text.black}
                sx={{
                    background: theme.palette.primary.main, p: "5px", borderRadius: item.messages.length === i + 1 ? "6px 6px 0 6px" : "6px", mt: 4, mr: 2, ml: 3, minWidth: "60px",
                    paddingRight: message.type === 1 || message.reply_on || message.type === 2 ? '5px' : '18px',
                    position: "relative",
                    wordBreak: "break-all",
                    "@media (min-width: 720px)": {
                        ml: 20,
                    },
                }}>
                {message.type === 0 ? (
                    <Grid>
                        <Grid item>
                            {message.reply_on ? <Box sx={{ p: "4px 18px 4px 4px", background: "#b5b5b5", borderRadius: "3px", mb: 1, cursor: "pointer" }}>
                                <Typography component="div" sx={{ borderLeft: "2px solid #FBC34A", p: "2px 4px" }} onClick={() => replyScroll(message)}>
                                    <Grid>
                                        <Grid item>{message.reply_on_message?.username}</Grid>
                                        <Grid item>
                                            <Typography component='pre' variant='body2'>
                                                {parsedMessage(message.reply_on_message?.type === 0 ? message.reply_on_message?.message : (message.reply_on_message?.type === 1 ? "image" : (message.reply_on_message?.type === 2 ? "file" : message.reply_on_message?.forward_message.message)))}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Typography>
                            </Box> : ""}
                        </Grid>
                        <Grid item>
                            <Typography variant="body1" component='pre' sx={{ p: "2px 8px" }} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                {parsedMessage(message.message)}
                            </Typography>
                        </Grid>
                    </Grid>
                ) : ((message.files && message.files.length > 0) ? (
                    (imageType() || message.type === 1) ?
                        (
                            <Box>
                                <Box sx={{
                                    cursor: "pointer", maxWidth: {
                                        xs: "200px",
                                        sm: "300px",
                                        md: "450px",
                                    }, height: {
                                        xs: imageSize(message.files, "xs") + "px",
                                        sm: imageSize(message.files, "sm") + "px",
                                        md: imageSize(message.files, "md") + "px",
                                    }
                                }} >
                                    {
                                        message.files.length > 1 ? <MessageImageGroup imageInfo={message?.files} /> : <MessageImage imageInfo={message?.files[0]} />
                                    }
                                </Box>
                                <Typography variant="body1" sx={{ p: "2px 8px", whiteSpace: 'break-spaces', paddingTop: message.description ? '5px' : '0px', maxWidth: "450px", }}>
                                    {message.description ? message.description : ''}
                                </Typography>
                            </Box>) : (
                            <Box>
                                {
                                    filesType(message.files) === "document" ? (
                                        <Typography component="div" sx={{ p: "2px 4px" }}>
                                            <Box sx={{ p: "8px 16px", color: '#000', fontWeight: 400, background: "#b5b5b5", borderRadius: "6px", display: "flex", alignItems: "center", }}>
                                                <IconFile size={20} stroke={2} />
                                                {message.files[0].origin_file_name}</Box>
                                        </Typography>) : (<ReactPlayer
                                            url={message.files[0].thumbnail}
                                            controls
                                            className={filesType(message.files) === "radio" ? "player-mp3" : "player"}
                                        />)
                                }
                            </Box>
                        )
                ) : (message.type === 3 ? (
                    <Grid>
                        <Grid item>
                            {message.forward_message ? <Box sx={{ p: "4px 2px", borderRadius: "3px", mb: 1, display: "flex" }}>
                                <IconArrowForwardUp size={20} stroke={2} color='#fff' />
                                <Typography component='div' color='#fff' sx={{ ml: "3px" }}>
                                    {message.forward_message?.username}
                                </Typography>
                            </Box> : ""}
                        </Grid>
                        <Grid item>
                            {
                                getOriginalMessage(message).type === 0 ?
                                    (<Typography variant="body1" component='pre' sx={{ p: "0 8px" }}>
                                        {getOriginalMessage(message).message}
                                    </Typography>)
                                    :
                                    (<Box>
                                        <Box sx={{
                                            cursor: "pointer", maxWidth: {
                                                xs: "200px",
                                                sm: "300px",
                                                md: "450px",
                                            }, height: {
                                                xs: imageSize(getOriginalMessage(message).files, "xs") + "px",
                                                sm: imageSize(getOriginalMessage(message).files, "sm") + "px",
                                                md: imageSize(getOriginalMessage(message).files, "md") + "px",
                                            }
                                        }} >
                                            <MessageImage imageInfo={getOriginalMessage(message).files[0]} />
                                        </Box>
                                        <Typography variant="body1" sx={{ p: "2px 8px", whiteSpace: 'break-spaces', paddingTop: getOriginalMessage(message).description ? '5px' : '0px', maxWidth: "450px" }} >
                                            {getOriginalMessage(message).description ? getOriginalMessage(message).description : ''}
                                        </Typography></Box>)
                            }
                        </Grid>
                    </Grid>
                ) : "")
                )}
                <Dropdown menu={{ items: message.type === 0 ? rightItme : rightItmeWithFile }} trigger={['click']}
                    getPopupContainer={(trigger) => trigger.parentNode}
                // open={openId === String(message.id)}
                >
                    <Box className
                        ='down downRight' id={message.type === 0 ? message.id : 0} sx={{ position: "absolute", top: 1, right: 1, cursor: "pointer", width: "20px", height: "20px", borderRadius: "0 6px 0 6px", transition: "all 0.4s", "&:hover": { transition: "all 0.4s", background: '#FFF' } }}>
                        <IconChevronDown size={20} stroke={2} />
                    </Box>
                </Dropdown>
                <Typography component="div" variant={"positionRight"} sx={{ color: theme.palette.text.icon, minWidth: "100px" }}>
                    <TimeSeperator content={getSeenStatus(message, selectedRoom) + formatChatTime(+item.sentTime)} />
                </Typography>
            </Typography>
        </Box >
    );
}

export default React.memo(RightChatText);