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

export default function ChatTextLine({ item, right, content, ReplyClick, formatChatTime, TimeSeperator, EditClick }) {
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
        <Box sx={{ display: "flex", justifyContent: "flex-end", pl: "20%" }} onMouseEnter={onMouseEnterHandler}
            onMouseLeave={onMouseLeaveHandler}>
            <Typography
                component="div"
                color={theme.palette.text.black}
                sx={{
                    background: theme.palette.primary.main, p: 1, borderRadius: "8px 8px 0 8px", mt: "10px", minWidth: "150px",
                    position: "relative",
                    "&:before": {
                        backgroundColor: theme.palette.primary.main,
                        bottom: 0,
                        clipPath: "polygon(0 0,100% 110%,0 110%)",
                        content: '""',
                        height: "15px",
                        left: "99.5%",
                        position: "absolute",
                        transition: "background-color .5s ease-out",
                        transitionDelay: ".3s",
                        width: "15px",
                    }
                }}>
                <Typography variant="body1" sx={{ p: "0 10px" }}>{content}</Typography>
                <TimeSeperator
                    content={formatChatTime(+item.sentTime)}
                />
                <Typography component="div" sx={{ position: "absolute", top: 1, right: 4, cursor: "pointer", display: isHover ? "block" : "none" }} onClick={handleClick}>
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
                    <MenuItem sx={{ minWidth: "150px" }} onClick={() => { ReplyClick({ content, right}); handleClose() }}>
                        <ListItemText>reply</ListItemText>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={() => {
                        EditClick({ content,right }); handleClose()
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
            </Typography>
        </Box >
    ) : (
        <Box sx={{ display: "flex", justifyContent: "flex-start" }} onMouseEnter={onMouseEnterHandler}
            onMouseLeave={onMouseLeaveHandler}>
            <Typography
                component="div"
                color={theme.palette.text.black}
                sx={{
                    background: theme.palette.primary.light, p: 1, borderRadius: "8px 8px 8px 0", mt: "10px", minWidth: "150px",
                    position: "relative",
                    "&:before": {
                        backgroundColor: theme.palette.primary.light,
                        bottom: 0,
                        clipPath: "polygon(100% 0,0 110%,100% 110%)",
                        content: '""',
                        height: "15px",
                        left: "-13px",
                        position: "absolute",
                        transition: "background-color .5s ease-out",
                        transitionDelay: ".3s",
                        width: "15px",
                    }
                }}>
                <Typography variant="body1" sx={{ p: "0 10px" }}>{content}</Typography>
                <TimeSeperator
                    content={formatChatTime(+item.sentTime)}
                />
                <Typography component="div" sx={{ position: "absolute", top: 1, right: 4, cursor: "pointer", display: isHover ? "block" : "none" }} onClick={handleClick}>
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
                    <MenuItem sx={{ minWidth: "150px" }} onClick={() => { ReplyClick({ content, right  , senderId:item.senderId }); handleClose() }}>
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
            </Typography>
        </Box>
    );
}
