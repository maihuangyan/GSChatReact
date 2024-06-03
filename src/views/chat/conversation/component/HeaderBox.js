import React, { useState, useContext, memo, useEffect } from 'react'
import { useNavigate } from "react-router-dom";

import {
    Box,
    Grid,
    Paper,
    Button,
    FormControl,
    Typography,
    Menu,
    MenuItem,
    OutlinedInput,
    ListItemText,
    Divider,
    InputAdornment,
    IconButton,
    Dialog,
    DialogTitle,
    DialogActions
} from "@mui/material";
import { IconDotsVertical, IconArrowLeft, IconSearch, IconX, IconArrowDown, IconArrowUp } from "@tabler/icons";
import { styled } from "@mui/material/styles";
import ClientAvatar from "ui-component/ClientAvatar";

import useJwt from "utils/jwt/useJwt";
import { selectRoomClear } from "store/actions/room";
import { getRoomDisplayName, } from "utils/common";
import { useDispatch, useSelector } from "react-redux";
import { SocketContext } from "utils/context/SocketContext";
import { clearRoomMessages } from "store/actions/messages";

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

const CircleButton2 = styled(Button)(({ theme }) => ({
    borderRadius: "50%",
    minWidth: "35px",
    height: "35px",
    color: theme.palette.primary.light,
    backgroundColor: theme.palette.dark[900],
    "&:hover": {
        backgroundColor: "#FBC34A",
        color: theme.palette.common.black,
    },
}));

const HeaderBox = (props) => {
    const { searchTotal } = props;
    const selectedRoom = useSelector((state) => state.room.selectedRoom);

    const getRoomOnlineStatus = useContext(SocketContext).getRoomOnlineStatus;

    const dispatch = useDispatch();
    const navigate = useNavigate()
    const [navSearch, setNavSearch] = useState(false)
    const [query, setQuery] = useState("");
    const [searchMessages, setSearchMessages] = useState([]);
    const [searchCount, setSearchCount] = useState(0);
    const [dialogOpen, setDialogOpen] = useState(false);

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSearch = (e) => {
        const allSearchMessages = searchTotal.flat(Infinity)
        const newSearchMessages = allSearchMessages.filter(item => item.message.toLowerCase().includes(e.target.value.toLowerCase()))

        setSearchMessages(allSearchMessages.filter(item => item.message.toLowerCase().includes(e.target.value.toLowerCase())))

        setSearchCount(newSearchMessages.length)
        setQuery(e.target.value);

        if (newSearchMessages.length) {
            searchScroll(newSearchMessages.pop())
        }
    };

    const searchScroll = (message) => {
        const chatContainer = document.getElementById("chat-area").children[0];
        let btn = document.getElementById(message.id)
        let options = {
            top: 0,
            behavior: 'smooth'
        }
        options.top = btn.parentNode.parentNode.parentNode.offsetTop + btn.offsetTop - 70
        chatContainer.scrollTo(options)
    }

    useEffect(() => {
        if (searchCount > 0) {
            searchScroll(searchMessages[searchCount - 1])
        }
    }, [searchCount])

    useEffect(() => {
        setNavSearch(false)
        setQuery("")
        setSearchCount(0)
        setSearchMessages([])
    }, [selectedRoom])

    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    const handleConfirmClear = () => {
        setDialogOpen(false);
        // console.log("clearing room id", selectedRoom);
        useJwt
            .clearRoomMessages(selectedRoom.id)
            .then((res) => {
                // console.log('api result', res.data);
                if (res.data.ResponseCode === 0) {
                    dispatch(clearRoomMessages(selectedRoom.id));
                } else {
                    console.log(res.data)
                }
            }).catch((err) => console.log(err));
    };

    return (
        <Grid container sx={{ borderBottom: "1px solid #997017", p: 1, position: "relative" }}>
            <Box sx={{ background: "#101010", position: "absolute", top: 0, left: 0, transform: `translate(${navSearch ? 0 : "100%"})`, zIndex: 100, width: "100%", height: "90%", marginTop: '5px', transition: "0.5s" }}>
                <Box sx={{ display: "flex", justifyContent: "end", alignItems: "center" }}>
                    <FormControl fullWidth variant="outlined" sx={{ p: "0 10px" }}>
                        <OutlinedInput
                            id="search-box"
                            placeholder="Search Messages"
                            sx={{ color: "white" }}
                            value={query}
                            onChange={handleSearch}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton aria-label="search icon" edge="end">
                                        <IconSearch size={25} stroke={1} />
                                    </IconButton>
                                </InputAdornment>
                            }
                        />
                    </FormControl>
                    <Box sx={{ width: "66px" }}>
                        {searchCount} / {searchMessages.length}
                    </Box>
                    <Grid container sx={{ width: "auto", mr: 2 }}>
                        <Grid item xs={6} md={6} sm={6}>
                            <CircleButton2 onClick={() => searchMessages.length > searchCount && setSearchCount(searchCount + 1)
                            }>
                                <IconArrowDown size={20} stroke={2} />
                            </CircleButton2>
                        </Grid>
                        <Grid item xs={6} md={6} sm={6} sx={{ pl: 1 }}>
                            <CircleButton2 onClick={() => searchCount > 1 && setSearchCount(searchCount - 1)
                            }>
                                <IconArrowUp size={20} stroke={2} />
                            </CircleButton2>
                        </Grid>
                    </Grid>
                    <CircleButton2 onClick={() => {
                        setNavSearch(false)
                        setQuery("")
                        setSearchCount(0)
                        setSearchMessages([])
                    }}>
                        <IconX size={25} stroke={2} />
                    </CircleButton2>
                </Box>
            </Box>
            <Grid item xs={6} container>
                <Box sx={{ display: "flex", alignItems: "center", pb: 0 }}>
                    <Box sx={{
                        mr: 1, display: "none",
                        "@media (max-width: 900px)": {
                            display: "block",
                        },
                    }}
                        onClick={() => dispatch(selectRoomClear())}
                    >
                        <CircleButton2>
                            <IconArrowLeft size={20} stroke={3} />
                        </CircleButton2>
                    </Box>
                    <ClientAvatar
                        avatar={selectedRoom.photo_url ? selectedRoom.photo_url : ""}
                        status={getRoomOnlineStatus(selectedRoom)}
                        size={40}
                        name={getRoomDisplayName(selectedRoom)}
                    />
                    <Box sx={{ ml: 2 }}>
                        <Typography variant={selectedRoom.group ? "h2" : "h4"}>
                            {getRoomDisplayName(selectedRoom)}
                        </Typography>
                        <Typography color={"#d5d5d5"}>{selectedRoom.group ? "" : (getRoomOnlineStatus(selectedRoom) ? "Online" : "Leave")}</Typography>
                    </Box>
                </Box>
            </Grid>
            <Grid item xs={6} >
                <Paper
                    sx={{
                        display: "flex",
                        justifyContent: "end",
                    }}
                >
                    <CircleButton1 sx={{ mr: 1 }} onClick={() => setNavSearch(true)}>
                        <IconSearch size={25} stroke={1} />
                    </CircleButton1>
                    <CircleButton1 type="button" onClick={handleClick}>
                        <IconDotsVertical size={25} stroke={1} />
                    </CircleButton1>

                </Paper>
                <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                        "aria-labelledby": "basic-button",
                    }}
                >
                    <MenuItem sx={{ minWidth: "150px" }} onClick={() => {
                        navigate("/information")
                        setAnchorEl(null)
                    }}>
                        <ListItemText>Information</ListItemText>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={() => { setDialogOpen(true); handleClose(); }}>
                        <ListItemText>Clear</ListItemText>
                    </MenuItem>
                </Menu>
            </Grid>

            <Dialog
                open={dialogOpen}
                onClose={handleDialogClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Are you sure want to clear all the chat history?"}
                </DialogTitle>
                <DialogActions>
                    <Button onClick={handleDialogClose}>Cancel</Button>
                    <Button
                        onClick={() => {
                            handleConfirmClear();
                        }}
                        autoFocus
                    >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    )
}
export default memo(HeaderBox)