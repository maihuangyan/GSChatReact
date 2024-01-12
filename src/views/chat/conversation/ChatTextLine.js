import React, { useState, useEffect, useContext, useRef } from 'react'
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

import { Image } from 'antd';
import { getUserDisplayName, getSeenStatus, formatChatTime } from 'utils/common';
import { LoaderContext } from "utils/context/ProgressLoader";
import axios from "axios";

import Forward from './ForwardModal';
import ReactPlayer from "react-player";
import { useSelector } from 'react-redux';

function ChatTextLine({ item, right, message, ReplyClick, EditClick, CopyClick, DeleteClick, isGroup, i, replyScroll, setIsForward, setForwardMessage, chatArea }) {
    const selectedRoom = useSelector((state) => state.room.selectedRoom);
    const theme = useTheme();
    const [isForwardModal, setIsForwardModal] = useState(false);
    const [imgHeight, setImgHeight] = useState("auto");

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const showForward = (message) => {
        setForwardMessage(message)
        setIsForwardModal(true)
    }

    const filesType = (file) => {
        const filesType_radio = ["mp3", "wav", "wmv"]
        const filesType_video = ["mp4", "m2v", "mkv", "mov"]

        let radio = filesType_radio.filter(item => item == file)
        let video = filesType_video.filter(item => item == file)
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
    // useEffect(() => {
    //     // setImgHeight("auto")
    //     setTimeout(() => {
    //         setImgHeight("auto")
    //     }, 50)
    // }, [message])

    // console.log(message)

    const imgLoad = () => {
        // const chatContainer = chatArea.current;
        // if (chatContainer) {
        //     chatContainer.scrollTo({
        //         top: chatContainer.scrollHeight,
        //         behavior: "smooth"
        //     })
        // }
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
            <Forward isForwardModal={isForwardModal} setIsForwardModal={setIsForwardModal} setIsForward={setIsForward} />
            {
                right ? (
                    <Box sx={{ display: "flex", justifyContent: "flex-end", "&:hover .down": { opacity: 1 } }} >
                        <Typography
                            id={`${message.id}`}
                            component="div"
                            color={theme.palette.text.black}
                            sx={{
                                background: theme.palette.primary.main, p: "5px", borderRadius: item.messages.length == i + 1 ? "6px 6px 0 6px" : "6px", mt: 4, mr: 2, ml: 3, minWidth: "60px",
                                paddingRight: '15px',
                                position: "relative",
                                wordBreak: "break-all",
                                "@media (min-width: 720px)": {
                                    ml: 20,
                                },
                            }}>
                            {message.type == 0 ? (
                                <Grid>
                                    <Grid item>
                                        {message.reply_on ? <Box sx={{ p: "4px 4px", background: "#b5b5b5", borderRadius: "3px", mb: 1, cursor: "pointer" }}>
                                            <Typography component="div" sx={{ borderLeft: "2px solid #FBC34A", p: "2px 4px" }} onClick={() => replyScroll(message)}>
                                                <Grid>
                                                    <Grid item>{message.reply_on_message?.username}</Grid>
                                                    <Grid item><Typography variant='body2'>{message.reply_on_message?.type == 0 ? message.reply_on_message?.message : (message.reply_on_message?.type == 1 ? "image" : (message.reply_on_message?.type == 2 ? "file" : message.reply_on_message?.forward_message.message))}</Typography></Grid>
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
                                (message.type == 1) ?
                                    (<Box sx={{ cursor: "pointer" }} >
                                        <Image
                                            id={message.files[0].id}
                                            alt={message.files[0].thumbnail}
                                            src={message.files[0].thumbnail}
                                            placeholder={true}
                                            loading='lazy'
                                            height={imgHeight}
                                            onError={() => console.log("eeee")}
                                            onLoad={imgLoad}
                                        />
                                        <Typography variant="body1" sx={{ p: "2px 8px", whiteSpace: 'break-spaces', paddingTop: message.description ? '5px' : '0px', width: "450px" }}>
                                            {message.description ? message.description : ''}
                                        </Typography>
                                    </Box>) : (
                                        <Box>
                                            {
                                                filesType(message.files[0].origin_file_name.split(".")[message.files[0].origin_file_name.split(".").length - 1]) == "word" ? (
                                                    <Typography component="div" sx={{ p: "2px 4px" }}>
                                                        <form method="get" action={message.files[0].thumbnail} onSubmit={() => downloadFile()}>
                                                            <Button type="submit" sx={{ p: "8px 16px", color: '#000', fontWeight: 400, background: "#b5b5b5", borderRadius: "6px" }}>
                                                                <IconDownload size={20} stroke={2} />
                                                                {message.files[0].origin_file_name}</Button>
                                                        </form></Typography>) : (<ReactPlayer
                                                            url={message.files[0].thumbnail}
                                                            controls
                                                            className={filesType(message.files[0].origin_file_name.split(".")[message.files[0].origin_file_name.split(".").length - 1]) == "radio" ? "player-mp3" : "player"}
                                                        />)
                                            }
                                        </Box>
                                    )
                            ) : (message.type == 3 ? (
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
                                            message.forward_message.type == 0 ?
                                                (<Typography variant="body1" sx={{ p: "0 8px" }}>
                                                    {message?.forward_message?.message}
                                                </Typography>)
                                                :
                                                (<Box sx={{ cursor: "pointer" }} >
                                                    <Image
                                                        id={message?.forward_message?.files[0]?.id}
                                                        alt={message?.forward_message?.files[0]?.thumbnail}
                                                        src={message?.forward_message?.files[0]?.thumbnail}
                                                        placeholder={true}
                                                        loading='lazy'
                                                        height={imgHeight}
                                                        onLoad={imgLoad}
                                                    />
                                                    <Typography variant="body1" sx={{ p: "2px 8px", whiteSpace: 'break-spaces', paddingTop: message.description ? '5px' : '0px', width: "450px"}} >
                                                        {message.description ? message.description : ''}
                                                    </Typography>
                                                </Box>)
                                        }
                                    </Grid>
                                </Grid>
                            ) : "")
                            )}
                            <Box className
                                ='down' sx={{ position: "absolute", top: 1, right: 1, cursor: "pointer" }} onClick={(e) => handleClick(e)}>
                                <IconChevronDown size={20} stroke={1} />
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
                                {message.type == 0 ? (
                                    <MenuItem onClick={() => {
                                        CopyClick(message); handleClose()
                                    }}>
                                        <ListItemText>copy</ListItemText>
                                    </MenuItem>
                                ) : ''}
                                <Divider />
                                {message.type == 0 ? (
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
                                <MenuItem onClick={() => (showForward(message), handleClose())}>
                                    <ListItemText>forward</ListItemText>
                                </MenuItem>
                                <Divider />
                                <MenuItem onClick={() => (DeleteClick(message), handleClose())}>
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
                                background: theme.palette.text.disabled, p: "5px", borderRadius: item.messages.length == i + 1 ? "0 6px 6px 6px" : "6px", mt: 4, mr: 3, ml: isGroup ? 5 : 2, minWidth: "60px",
                                paddingRight: '15px',
                                position: "relative",
                                wordBreak: "break-all",
                                "@media (min-width: 720px)": {
                                    mr: 20,
                                },
                            }}>
                            {message.type == 0 ? (
                                <Grid>
                                    <Grid item>
                                        {message.reply_on ? <Box sx={{ p: "4px 4px", background: theme.palette.primary.main, borderRadius: "3px", mb: 1, cursor: "pointer" }} onClick={() => replyScroll(message)}>
                                            <Typography component="div" sx={{ borderLeft: "2px solid #000", p: "2px 4px" }}>
                                                <Grid>
                                                    <Grid item>{message.reply_on_message?.username}</Grid>
                                                    <Grid item><Typography variant='body2'>{message.reply_on_message?.type == 0 ? message.reply_on_message.message : (message.reply_on_message?.type == 1 ? "image" : (message.reply_on_message?.type == 2 ? "file" : message.reply_on_message?.forward_message.message))}</Typography></Grid>
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
                                (message.type == 1) ?
                                    (<Box sx={{ cursor: "pointer" }} >
                                        <Image
                                            id={message.files[0].id}
                                            src={message.files[0].thumbnail}
                                            alt={message.files[0].thumbnail}
                                            placeholder={true}
                                            loading='lazy'
                                            height={imgHeight}
                                            onLoad={imgLoad}
                                        />
                                        <Typography variant="body1" sx={{ p: "2px 8px", whiteSpace: 'break-spaces', paddingTop: message.description ? '5px' : '0px', width: "450px" }}>
                                            {message.description ? message.description : ''}
                                        </Typography>
                                    </Box>) : (
                                        <Box>
                                            {
                                                filesType(message.files[0].origin_file_name.split(".")[message.files[0].origin_file_name.split(".").length - 1]) == "word" ? (
                                                    <Typography component="div" sx={{ p: "1px 4px" }}>
                                                        <form method="get" action={message.files[0].thumbnail} onSubmit={() => downloadFile()}>
                                                            <Button type="submit" sx={{ p: "8px 16px", color: '#000', fontWeight: 400, background: "#b5b5b5", borderRadius: "6px" }}>
                                                                <IconDownload size={20} stroke={2} />
                                                                {message.files[0].origin_file_name}</Button>
                                                        </form></Typography>) : (<ReactPlayer
                                                            url={message.files[0].thumbnail}
                                                            controls
                                                            className={filesType(message.files[0].origin_file_name.split(".")[message.files[0].origin_file_name.split(".").length - 1]) == "radio" ? "player-mp3" : "player"}
                                                        />)
                                            }
                                        </Box>
                                    )
                            ) : (message.type == 3 ? (
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
                                            message.forward_message.type == 0 ?
                                                (<Typography variant="body1" sx={{ p: "0 8px" }}>
                                                    {message.forward_message.message}
                                                </Typography>)
                                                :
                                                (<Box sx={{ cursor: "pointer" }} >
                                                    <Image
                                                        id={message.forward_message.files[0].id}
                                                        alt={message.forward_message.files[0].thumbnail}
                                                        src={message.forward_message.files[0].thumbnail}
                                                        placeholder={true}
                                                        loading='lazy'
                                                        height={imgHeight}
                                                        onLoad={imgLoad}
                                                    />
                                                    <Typography variant="body1" sx={{ p: "2px 8px", whiteSpace: 'break-spaces', paddingTop: message.description ? '5px' : '0px', width: "450px" }} >
                                                        {message.description ? message.description : ''}
                                                    </Typography>
                                                </Box>)
                                        }
                                    </Grid>
                                </Grid>
                            ) : "")
                            )}
                            <Box className="down" sx={{ position: "absolute", top: 1, right: 1, cursor: "pointer" }} onClick={(e) => handleClick(e)}>
                                <IconChevronDown size={20} stroke={1} />
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
                                {message.type == 0 ? (
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
                                <MenuItem onClick={() => (showForward(message), handleClose())}>
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