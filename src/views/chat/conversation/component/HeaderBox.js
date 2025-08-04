import React, { useState, useContext, memo , useRef } from 'react'
import { useNavigate } from "react-router-dom";

import {
    Box,
    Grid,
    Paper,
    Button,
    Typography,
    Menu,
    MenuItem,
    ListItemText,
    Divider,
    Dialog,
    DialogTitle,
    DialogActions
} from "@mui/material";
import { IconDotsVertical, IconArrowLeft, IconSearch } from "@tabler/icons";
import { styled } from "@mui/material/styles";
import ClientAvatar from "@/ui-component/ClientAvatar";

import useJwt from "@/utils/jwt/useJwt";
import { selectRoomClear } from "@/store/actions/room";
import { getRoomDisplayName, } from "@/utils/common";
import { useDispatch, useSelector } from "react-redux";
import { SocketContext } from "@/utils/context/SocketContext";
import { clearRoomMessages } from "@/store/actions/messages";

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

const HeaderBox = () => {

    const selectedRoom = useSelector((state) => state.room.selectedRoom);

    const getRoomOnlineStatus = useContext(SocketContext).getRoomOnlineStatus;

    const dispatch = useDispatch();
    const navigate = useNavigate()
    const [dialogOpen, setDialogOpen] = useState(false);

    const searchEl = useRef(null)

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

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
        <Grid container sx={{ borderBottom: "1px solid #997017", p: 1, position: "absolute", left: "0", top: "0", zIndex: 15, background: "#101010" }}>
            {/* {console.log("HeaderBox")}  */}

            <Grid item xs={8} container>
                <Box sx={{ display: "flex", alignItems: "center", pb: 0 }}>
                    <Box sx={{
                        mr: { xs: 0, md: 1 }, display: "none",
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
                    <Box sx={{ ml: { xs: 0.5, md: 2 } }}>
                        <Typography variant={selectedRoom.group ? "h2" : "h4"} sx={{ fontSize: { xs: selectedRoom.group ? "16px" : "14px", sm: selectedRoom.group ? "24px" : "16px" } }}>
                            {getRoomDisplayName(selectedRoom)}
                        </Typography>
                        <Typography color={"#d5d5d5"}>{selectedRoom.group ? "" : (getRoomOnlineStatus(selectedRoom) ? "Online" : "Offline")}</Typography>
                    </Box>
                </Box>
            </Grid>
            <Grid item xs={4} >
                <Paper
                    sx={{
                        display: "flex",
                        justifyContent: "end",
                    }}
                >
                    <CircleButton1 sx={{ mr: 1 }} onClick={() => navigate('/historyMessage')} ref={searchEl} >
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