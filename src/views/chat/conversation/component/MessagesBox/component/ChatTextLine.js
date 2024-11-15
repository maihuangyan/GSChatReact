import React, { useState } from 'react'
import {
    Box,
    Typography,
    Menu,
    MenuItem,
    ListItemText,
    Divider,
    Grid,
    Button
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { IconChevronDown, IconArrowForwardUp, IconDownload } from "@tabler/icons";
import ClientAvatar from "ui-component/ClientAvatar";
import MessageImage from "ui-component/MessageImage";

import { getUserDisplayName, getSeenStatus, formatChatTime } from 'utils/common';

import Forward from './ForwardModal';
import ReactPlayer from "react-player";
import { useSelector, useDispatch } from 'react-redux';
import { setForwardMessage } from 'store/actions/messageBoxConnect';

function ChatTextLine({ item, right, message, ReplyClick, EditClick, CopyClick, DeleteClick, isGroup, i, replyScroll }) {
    const selectedRoom = useSelector((state) => state.room.selectedRoom);
    const theme = useTheme();
    const dispatch = useDispatch()

    const [isForwardModal, setIsForwardModal] = useState(false);

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const showForward = (message) => {
        dispatch(setForwardMessage(message));
        setIsForwardModal(true)
    }

    const filesType = (file) => {
        const filesType_radio = ["mp3", "wav", "wmv"]
        const filesType_video = ["mp4", "m2v", "mkv", "mov"]

        let radio = filesType_radio.filter(item => item === file)
        let video = filesType_video.filter(item => item === file)
        if (video.length) {
            return "video"
        } else if (radio.length) {
            return "radio"
        } else {
            return "word"
        }
    }

    const downloadFile = (e) => {

    }
    const imageSize = (imgInfo, size) => {
        switch (size) {
            case "xs":
                return imgInfo.height * (200 / imgInfo.width).toFixed(4);
            case "sm":
                return imgInfo.height * (300 / imgInfo.width).toFixed(4);
            case "md":
                return imgInfo.height * (450 / imgInfo.width).toFixed(3);
            default:
                break;
        }
    }

    //Time seperator
    const TimeSeperator = ({ content }) => {
        const theme = useTheme();
        return (
            <Box sx={{ m: 0, textAlign: "right" }}>
                {/* <IconClock size={14} stroke={1} color={theme.palette.text.dark} />{" "} */}
                <Typography
                    variant="span"
                    color={theme.palette.text.icon}
                    sx={{ verticalAlign: "text-bottom", fontSize: "12px" }}
                >
                    {content}
                </Typography>
            </Box>
        );
    };
    return (
        <Box>
            <Forward isForwardModal={isForwardModal} setIsForwardModal={setIsForwardModal} />
            {
                right ? (
                    <Box sx={{ display: "flex", justifyContent: "flex-end", "&:hover .down": { opacity: 1 } }} >
                        <Typography
                            id={`${message.id}`}
                            component="div"
                            color={theme.palette.text.black}
                            sx={{
                                background: theme.palette.primary.main, p: "5px", borderRadius: item.messages.length === i + 1 ? "6px 6px 0 6px" : "6px", mt: 4, mr: 2, ml: 3, minWidth: "60px",
                                paddingRight: message.type === 1 || message.reply_on ? '5px' : '18px',
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
                                                    <Grid item><Typography variant='body2'>{message.reply_on_message?.type === 0 ? message.reply_on_message?.message : (message.reply_on_message?.type === 1 ? "image" : (message.reply_on_message?.type === 2 ? "file" : message.reply_on_message?.forward_message.message))}</Typography></Grid>
                                                </Grid>
                                            </Typography>
                                        </Box> : ""}
                                    </Grid>
                                    <Grid item>
                                        <Typography variant="body1" sx={{ p: "2px 8px" }} style={{ whiteSpace: 'break-spaces' }}>
                                            {message.message}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            ) : ((message.files && message.files.length > 0) ? (
                                (message.type === 1) ?
                                    (
                                        <Box sx={{
                                            cursor: "pointer", maxWidth: {
                                                xs: "200px",
                                                sm: "300px",
                                                md: "450px",
                                            }, height: {
                                                xs: imageSize(message.files[0], "xs") + "px",
                                                sm: imageSize(message.files[0], "sm") + "px",
                                                md: imageSize(message.files[0], "md") + "px",
                                            }
                                        }} >
                                            <MessageImage imageInfo={message.files[0]} />
                                            <Typography variant="body1" sx={{ p: "2px 8px", whiteSpace: 'break-spaces', paddingTop: message.description ? '5px' : '0px', maxWidth: "450px" }}>
                                                {message.description ? message.description : ''}
                                            </Typography>
                                        </Box>) : (
                                        <Box>
                                            {
                                                filesType(message.files[0].origin_file_name.split(".")[message.files[0].origin_file_name.split(".").length - 1]) === "word" ? (
                                                    <Typography component="div" sx={{ p: "2px 4px" }}>
                                                        <form method="get" action={message.files[0].thumbnail} onSubmit={() => downloadFile()}>
                                                            <Button type="submit" sx={{ p: "8px 16px", color: '#000', fontWeight: 400, background: "#b5b5b5", borderRadius: "6px" }}>
                                                                <IconDownload size={20} stroke={2} />
                                                                {message.files[0].origin_file_name}</Button>
                                                        </form></Typography>) : (<ReactPlayer
                                                            url={message.files[0].thumbnail}
                                                            controls
                                                            className={filesType(message.files[0].origin_file_name.split(".")[message.files[0].origin_file_name.split(".").length - 1]) === "radio" ? "player-mp3" : "player"}
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
                                            message.forward_message.type === 0 ?
                                                (<Typography variant="body1" sx={{ p: "0 8px" }}>
                                                    {message?.forward_message.message}
                                                </Typography>)
                                                :
                                                (<Box sx={{
                                                    cursor: "pointer", maxWidth: {
                                                        xs: "200px",
                                                        sm: "300px",
                                                        md: "450px",
                                                    }, height: {
                                                        xs: imageSize(message.forward_message.files[0], "xs") + "px",
                                                        sm: imageSize(message.forward_message.files[0], "sm") + "px",
                                                        md: imageSize(message.forward_message.files[0], "md") + "px",
                                                    }
                                                }} >
                                                    <MessageImage imageInfo={message.forward_message.files[0]} />
                                                    <Typography variant="body1" sx={{ p: "2px 8px", whiteSpace: 'break-spaces', paddingTop: message.description ? '5px' : '0px', maxWidth: "450px" }} >
                                                        {message.description ? message.description : ''}
                                                    </Typography>
                                                </Box>)
                                        }
                                    </Grid>
                                </Grid>
                            ) : "")
                            )}
                            <Box className
                                ='down' sx={{ position: "absolute", top: 1, right: 1, cursor: "pointer", width: "20px", height: "20px", borderRadius: "0 6px 0 6px", transition: "all 0.4s", "&:hover": { transition: "all 0.4s", background: '#FFF' } }} onClick={(e) => handleClick(e)}>
                                <IconChevronDown size={20} stroke={2} />
                            </Box>
                            <Menu
                                id="basic-menu"
                                anchorEl={anchorEl}
                                open={open}
                                onClose={handleClose}
                                MenuListProps={{
                                    "aria-labelledby": "basic-button",
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                            >
                                {message.type === 0 ? (
                                    <MenuItem onClick={() => {
                                        CopyClick(message); handleClose()
                                    }}>
                                        <ListItemText>copy</ListItemText>
                                    </MenuItem>
                                ) : ''}
                                <Divider />
                                {message.type === 0 ? (
                                    <MenuItem onClick={() => {
                                        EditClick({ message, right }); handleClose()
                                    }}>
                                        <ListItemText>edit</ListItemText>
                                    </MenuItem>
                                ) : ''}
                                <Divider />
                                <MenuItem sx={{ minWidth: "150px" }} onClick={() => { ReplyClick({ message, right }); handleClose() }}>
                                    <ListItemText>reply</ListItemText>
                                </MenuItem>
                                <Divider />
                                <MenuItem onClick={() => { showForward(message); handleClose() }}>
                                    <ListItemText>forward</ListItemText>
                                </MenuItem>
                                <Divider />
                                <MenuItem onClick={() => { DeleteClick(message); handleClose() }}>
                                    <ListItemText>delete</ListItemText>
                                </MenuItem>
                                <Divider />
                            </Menu>
                            <Typography component="div" variant={right ? "positionRight" : "positionLeft"} sx={{ color: theme.palette.text.icon, width: '100px' }}>
                                <TimeSeperator content={getSeenStatus(message, selectedRoom) + formatChatTime(+item.sentTime)} />
                            </Typography>
                        </Typography>
                    </Box >
                ) : (
                    <Box sx={{ display: "flex", justifyContent: "flex-start", "&:hover .down": { opacity: 1 } }}>
                        <Typography
                            id={`${message.id}`}
                            component="div"
                            color={theme.palette.text.black}
                            sx={{
                                background: theme.palette.text.disabled, p: "5px", borderRadius: item.messages.length === i + 1 ? "0 6px 6px 6px" : "6px", mt: 4, mr: 3, ml: isGroup ? 5 : 2, minWidth: "60px",
                                paddingRight: message.type === 1 || message.reply_on ? "5px" : '18px',
                                position: "relative",
                                wordBreak: "break-all",
                                "@media (min-width: 720px)": {
                                    mr: 20,
                                },
                            }}>
                            {message.type === 0 ? (
                                <Grid>
                                    <Grid item>
                                        {message.reply_on ? <Box sx={{ p: "4px 18px 4px 4px", background: theme.palette.primary.main, borderRadius: "3px", mb: 1, cursor: "pointer" }} onClick={() => replyScroll(message)}>
                                            <Typography component="div" sx={{ borderLeft: "2px solid #000", p: "2px 4px" }}>
                                                <Grid>
                                                    <Grid item>{message.reply_on_message?.username}</Grid>
                                                    <Grid item><Typography variant='body2'>{message.reply_on_message?.type === 0 ? message.reply_on_message.message : (message.reply_on_message?.type === 1 ? "image" : (message.reply_on_message?.type === 2 ? "file" : message.reply_on_message?.forward_message.message))}</Typography></Grid>
                                                </Grid>
                                            </Typography>
                                        </Box> : ""}
                                    </Grid>
                                    <Grid item>
                                        <Typography variant="body1" sx={{ p: "2px 8px" }} style={{ whiteSpace: 'break-spaces' }}>
                                            {message.message}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            ) : ((message.files && message.files.length > 0) ? (
                                (message.type === 1) ?
                                    (
                                        <Box sx={{
                                            cursor: "pointer", maxWidth: {
                                                xs: "200px",
                                                sm: "300px",
                                                md: "450px",
                                            }, height: {
                                                xs: imageSize(message.files[0], "xs") + "px",
                                                sm: imageSize(message.files[0], "sm") + "px",
                                                md: imageSize(message.files[0], "md") + "px",
                                            }
                                        }} >
                                            <MessageImage imageInfo={message.files[0]} />
                                            <Typography variant="body1" sx={{ p: "2px 8px", whiteSpace: 'break-spaces', paddingTop: message.description ? '5px' : '0px', maxWidth: { xs: "200px", sm: "300px", md: "450px" } }}>
                                                {message.description ? message.description : ''}
                                            </Typography>
                                        </Box>) : (
                                        <Box>
                                            {
                                                filesType(message.files[0].origin_file_name.split(".")[message.files[0].origin_file_name.split(".").length - 1]) === "word" ? (
                                                    <Typography component="div" sx={{ p: "1px 4px" }}>
                                                        <form method="get" action={message.files[0].thumbnail} onSubmit={() => downloadFile()}>
                                                            <Button type="submit" sx={{ p: "8px 16px", color: '#000', fontWeight: 400, background: "#b5b5b5", borderRadius: "6px" }}>
                                                                <IconDownload size={20} stroke={2} />
                                                                {message.files[0].origin_file_name}</Button>
                                                        </form></Typography>) : (<ReactPlayer
                                                            url={message.files[0].thumbnail}
                                                            controls
                                                            className={filesType(message.files[0].origin_file_name.split(".")[message.files[0].origin_file_name.split(".").length - 1]) === "radio" ? "player-mp3" : "player"}
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
                                            message.forward_message.type === 0 ?
                                                (<Typography variant="body1" sx={{ p: "0 8px" }}>
                                                    {message.forward_message.message}
                                                </Typography>)
                                                :
                                                (<Box sx={{
                                                    cursor: "pointer",
                                                    maxWidth: {
                                                        xs: "200px",
                                                        sm: "300px",
                                                        md: "450px",
                                                    },
                                                    height: {
                                                        xs: imageSize(message.forward_message.files[0], "xs") + "px",
                                                        sm: imageSize(message.forward_message.files[0], "sm") + "px",
                                                        md: imageSize(message.forward_message.files[0], "md") + "px",
                                                    }
                                                }} >
                                                    <MessageImage imageInfo={message.forward_message.files[0]} />
                                                    <Typography variant="body1" sx={{ p: "2px 8px", whiteSpace: 'break-spaces', paddingTop: message.description ? '5px' : '0px', maxWidth: "450px" }} >
                                                        {message.description ? message.description : ''}
                                                    </Typography>
                                                </Box>)
                                        }
                                    </Grid>
                                </Grid>
                            ) : "")
                            )}
                            <Box className="down" sx={{ position: "absolute", top: 1, right: 1, cursor: "pointer", width: "20px", height: "20px", borderRadius: "0 6px 0 6px", transition: "all 0.4s", "&:hover": { transition: "all 0.4s", background: '#FBC34A' } }} onClick={(e) => handleClick(e)}>
                                <IconChevronDown size={20} stroke={2} />
                            </Box>
                            <Menu
                                id="basic-menu"
                                anchorEl={anchorEl}
                                open={open}
                                onClose={handleClose}
                                MenuListProps={{
                                    "aria-labelledby": "basic-button",
                                }}
                            >
                                {message.type === 0 ? (
                                    <MenuItem onClick={() => {
                                        CopyClick(message); handleClose()
                                    }}>
                                        <ListItemText>copy</ListItemText>
                                    </MenuItem>
                                ) : ''}
                                <Divider />
                                <MenuItem sx={{ minWidth: "150px" }} onClick={() => { ReplyClick({ message, right }); handleClose() }}>
                                    <ListItemText>reply</ListItemText>
                                </MenuItem>
                                <Divider />
                                <MenuItem onClick={() => { showForward(message); handleClose() }}>
                                    <ListItemText>forward</ListItemText>
                                </MenuItem>
                            </Menu>
                            <Typography component="div" variant={right ? "positionRight" : "positionLeft"} sx={{ color: theme.palette.text.icon }}>
                                <TimeSeperator content={formatChatTime(+item.sentTime)} />
                            </Typography>

                            <Typography component="div" variant={"positionLeft1"} sx={{ display: isGroup ? "block" : "none" }}>
                                <ClientAvatar
                                    avatar={
                                        message.user?.photo_url
                                            ? message.user?.photo_url
                                            : ""
                                    }
                                    size={35}
                                    name={message.user ? getUserDisplayName(message.user) : message.username}
                                />
                            </Typography>
                        </Typography>

                    </Box >
                )
            }
        </Box>
    )
}

export default React.memo(ChatTextLine)