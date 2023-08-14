import React, { useState, useEffect } from 'react'
import {
    Box,
    Typography,
    Menu,
    MenuItem,
    ListItemText,
    Divider,
    Grid,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { IconChevronDown, IconArrowForwardUp } from "@tabler/icons";
import ClientAvatar from "ui-component/ClientAvatar";

import { Image } from 'antd';

export default function ChatTextLine({ item, right, message, ReplyClick, EditClick, isGroup, TimeSeperator, formatChatTime, i }) {
    const theme = useTheme();
    const [isHover, setIsHover] = useState(false);
    const onMouseEnterHandler = () => {
        setIsHover(true);
    };

    const onMouseLeaveHandler = () => {
        setIsHover(false);
    };
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
        setIsHover(false);
    };

    return right ? (
        <Box sx={{ display: "flex", justifyContent: "flex-end" }} onMouseEnter={onMouseEnterHandler}
            onMouseLeave={onMouseLeaveHandler}>
            <Typography
                component="div"
                color={theme.palette.text.black}
                sx={{
                    background: theme.palette.primary.main, p: "5px", borderRadius: item.messages.length == i + 1 ? "6px 6px 0 6px" : "6px", mt: 4, mr: 2, ml: 3, minWidth: "60px",
                    position: "relative",
                    wordBreak: "break-all",
                    "@media (min-width: 720px)": {
                        ml: 20,
                    },
                }}>
                {message.type == 0 ? (
                    <Grid>
                        <Grid item>
                            {message.reply_on ? <Box sx={{ p: "4px 4px", background: "#b5b5b5", borderRadius: "3px", mb: 1 }}>
                                <Typography component="div" sx={{ borderLeft: "2px solid #FBC34A", p: "2px 4px" }}>
                                    <Grid>
                                        <Grid item>{message.reply_on_message.username}</Grid>
                                        <Grid item><Typography variant='body2'>{message.reply_on_message.type == 0 ? message.reply_on_message.message : (message.reply_on_message.type == 1 ? "image" : (message.reply_on_message.type == 3 ? message.reply_on_message.forward_message.message : ""))}</Typography></Grid>
                                    </Grid>
                                </Typography>
                            </Box> : ""}
                        </Grid>
                        <Grid item>
                            <Typography variant="body1" sx={{ p: "0 8px" }}>{message.message}</Typography>
                        </Grid>
                    </Grid>
                ) : ((message.files && message.files.length > 0) ? (
                    (message.type == 1) ?
                        (<Box sx={{ cursor: "pointer" }} >
                            <Image
                                src={message.files[0].thumbnail}
                                srcSet={message.files[0].thumbnail}
                                alt={message.files[0].origin_file_name}
                                loading="lazy"
                            /></Box>) : (
                            <Typography variant="body1" sx={{ p: "0 8px" }}>{message.files[0].origin_file_name}</Typography>
                        )
                ) : (message.type == 3 ? (
                    <Grid>
                        <Grid item>
                            {message.forward_message ? <Box sx={{ p: "4px 2px", borderRadius: "3px", mb: 1, display: "flex" }}>
                                <IconArrowForwardUp size={20} stroke={2} color='#fff' />
                                <Typography component='div' color='#fff' sx={{ ml: "3px" }}>
                                    {message.forward_message.username}
                                </Typography>
                            </Box> : ""}
                        </Grid>
                        <Grid item>
                            <Typography variant="body1" sx={{ p: "0 8px" }}>{message.forward_message.message}</Typography>
                        </Grid>
                    </Grid>
                ) : "")
                )}
                <Typography component="div" sx={{ position: "absolute", top: 1, right: 1, cursor: "pointer", display: isHover ? "block" : "none" }} onClick={handleClick}>
                    <IconChevronDown size={20} stroke={1} />
                </Typography>
                <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                        "aria-labelledby": "basic-button",
                    }}
                >
                    <MenuItem sx={{ minWidth: "150px" }} onClick={() => { ReplyClick({ message, right }); handleClose() }}>
                        <ListItemText>reply</ListItemText>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={() => {
                        EditClick({ message, right }); handleClose()
                    }}>
                        <ListItemText>edit</ListItemText>
                    </MenuItem>
                    <Divider />
                    <MenuItem>
                        <ListItemText>redirect</ListItemText>
                    </MenuItem>
                    <Divider />
                    <MenuItem>
                        <ListItemText>delete</ListItemText>
                    </MenuItem>
                    <Divider />
                </Menu>
                <Typography component="div" variant={right ? "positionRight" : "positionLeft"} sx={{ color: theme.palette.text.icon }}><TimeSeperator
                    content={formatChatTime(+item.sentTime)}
                /></Typography>

            </Typography>
        </Box >
    ) : (
        <Box sx={{ display: "flex", justifyContent: "flex-start" }} onMouseEnter={onMouseEnterHandler}
            onMouseLeave={onMouseLeaveHandler}>
            <Typography
                component="div"
                color={theme.palette.text.black}
                sx={{
                    background: theme.palette.text.disabled, p: "5px", borderRadius: item.messages.length == i + 1 ? "0 6px 6px 6px" : "6px", mt: 4, mr: 3, ml: isGroup ? 5 : 2, minWidth: "60px",
                    position: "relative",
                    wordBreak: "break-all",
                    "@media (min-width: 720px)": {
                        mr: 20,
                    },
                }}>
                {message.type == 0 ? (
                    <Grid>
                        <Grid item>
                            {message.reply_on ? <Box sx={{ p: "4px 4px", background: theme.palette.primary.main, borderRadius: "3px", mb: 1 }}>
                                <Typography component="div" sx={{ borderLeft: "2px solid #000", p: "2px 4px" }}>
                                    <Grid>
                                        <Grid item>{message.reply_on_message.username}</Grid>
                                        <Grid item><Typography variant='body2'>{message.reply_on_message.type == 0 ? message.reply_on_message.message : (message.reply_on_message.type == 1 ? "image" : (message.reply_on_message.type == 3 ? message.reply_on_message.forward_message.message : ""))}</Typography></Grid>
                                    </Grid>
                                </Typography>
                            </Box> : ""}
                        </Grid>
                        <Grid item>
                            <Typography variant="body1" sx={{ p: "0 8px" }}>{message.message}</Typography>
                        </Grid>
                    </Grid>
                ) : ((message.files && message.files.length > 0) ? (
                    (message.type == 1) ?
                        (<Box sx={{ cursor: "pointer" }} >
                            <Image
                                src={message.files[0].thumbnail}
                                srcSet={message.files[0].thumbnail}
                                alt={message.files[0].origin_file_name}
                                loading="lazy"
                            /></Box>) : (
                            <Typography variant="body1" sx={{ p: "0 8px" }}>{message.files[0].origin_file_name}</Typography>
                        )
                ) : (message.type == 3 ? (
                    <Grid>
                        <Grid item>
                            {message.forward_message ? <Box sx={{ p: "4px 2px", borderRadius: "3px", mb: 1, display: "flex" }}>
                                <IconArrowForwardUp size={20} stroke={2} color='#fff' />
                                <Typography component='div' color='#fff' sx={{ ml: "3px" }}>
                                    {message.forward_message.username}
                                </Typography>
                            </Box> : ""}
                        </Grid>
                        <Grid item>
                            <Typography variant="body1" sx={{ p: "0 8px" }}>{message.forward_message.message}</Typography>
                        </Grid>
                    </Grid>
                ) : "")
                )}
                <Typography component="div" sx={{ position: "absolute", top: 1, right: 1, cursor: "pointer", display: isHover ? "block" : "none" }} onClick={handleClick}>
                    <IconChevronDown size={20} stroke={1} />
                </Typography>
                <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                        "aria-labelledby": "basic-button",
                    }}

                >
                    <MenuItem sx={{ minWidth: "150px" }} onClick={() => { ReplyClick({ message, right }); handleClose() }}>
                        <ListItemText>reply</ListItemText>
                    </MenuItem>
                    <Divider />
                    <MenuItem>
                        <ListItemText>redirect</ListItemText>
                    </MenuItem>
                    <Divider />
                    <MenuItem>
                        <ListItemText>delete</ListItemText>
                    </MenuItem>
                    <Divider />
                </Menu>
                <Typography component="div" variant={right ? "positionRight" : "positionLeft"} sx={{ color: theme.palette.text.icon }}><TimeSeperator
                    content={formatChatTime(+item.sentTime)}
                /></Typography>

                <Typography component="div" variant={"positionLeft1"} sx={{ display: isGroup ? "block" : "none" }}>
                    <ClientAvatar
                        avatar={
                            message.user?.photo_url
                                ? message.user?.photo_url
                                : ""
                        }
                        size={35}
                        name={message.user?.username}
                    />
                </Typography>
            </Typography>
        </Box>
    );
}
