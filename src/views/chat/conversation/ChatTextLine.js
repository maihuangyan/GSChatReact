import React, { useState, } from 'react'
import {
    Box,
    Typography,
    Menu,
    MenuItem,
    ListItemText,
    Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { IconChevronDown } from "@tabler/icons";
import ClientAvatar from "ui-component/ClientAvatar";
import defaultAvatar from "../../../assets/images/users/default_avatar.png";

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
                    background: theme.palette.primary.main, p: 1, borderRadius: item.messages.length == i + 1 ? "6px 6px 0 6px" : "6px", mt: 4, mr: isGroup ? 5 : 2, minWidth: "60px",
                    position: "relative",
                }}>
                {message.type == 0 ? (
                    <Typography variant="body1" sx={{ p: "0 8px" }}>{message.message}</Typography>
                ) : ((message.files && message.files.length > 0) ? (
                    (message.type == 1) ? 
                    (<img
                        src={message.files[0].thumbnail}
                        srcSet={message.files[0].thumbnail}
                        alt={message.files[0].origin_file_name}
                        loading="lazy"
                        style={{width: "500px", height: "350px"}}
                    />) : (
                        <Typography variant="body1" sx={{ p: "0 8px" }}>{message.files[0].origin_file_name}</Typography>
                    )
                ) : ''
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

                <Typography component="div" variant={right ? "positionRight1" : "positionLeft1"} sx={{ display: isGroup ? "block" : "none" }}>
                    <ClientAvatar
                        avatar={
                            item.photo
                                ? item.photo
                                : defaultAvatar
                        }
                        size={30}
                    />
                </Typography>
            </Typography>
        </Box >
    ) : (
        <Box sx={{ display: "flex", justifyContent: "flex-start" }} onMouseEnter={onMouseEnterHandler}
            onMouseLeave={onMouseLeaveHandler}>
            <Typography
                component="div"
                color={theme.palette.text.black}
                sx={{
                    background: theme.palette.text.disabled, p: 1, borderRadius: item.messages.length == i + 1 ? "0 6px 6px 6px" : "6px", mt: 4, ml: isGroup ? 5 : 2, minWidth: "60px",
                    position: "relative",
                }}>
                {message.type == 0 ? (
                    <Typography variant="body1" sx={{ p: "0 8px" }}>{message.message}</Typography>
                ) : ((message.files && message.files.length > 0) ? (
                    (message.type == 1) ? 
                    (<img
                        src={message.files[0].thumbnail}
                        srcSet={message.files[0].thumbnail}
                        alt={message.files[0].origin_file_name}
                        loading="lazy"
                        style={{width: "500px", height: "350px"}}
                    />) : (
                        <Typography variant="body1" sx={{ p: "0 8px" }}>{message.files[0].origin_file_name}</Typography>
                    )
                ) : ''
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
                    <MenuItem sx={{ minWidth: "150px" }} onClick={() => { ReplyClick({ message, right, senderId: item.senderId }); handleClose() }}>
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

                <Typography component="div" variant={right ? "positionRight1" : "positionLeft1"} sx={{ display: isGroup ? "block" : "none" }}>
                    <ClientAvatar
                        avatar={
                            item.photo
                                ? item.photo
                                : defaultAvatar
                        }
                        size={30}
                    />
                </Typography>
            </Typography>
        </Box>
    );
}
