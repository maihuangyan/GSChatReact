import React, { useContext, memo, useEffect , useCallback } from 'react'
import { useNavigate } from "react-router-dom";

import {
    Box,
    Grid,
    Button,
    FormControl,
    Typography,
    OutlinedInput,
    InputAdornment,
    IconButton,
} from "@mui/material";
import { IconArrowLeft, IconSearch, IconX } from "@tabler/icons";
import { styled } from "@mui/material/styles";
import ClientAvatar from "@/ui-component/ClientAvatar";

import { getRoomDisplayName, } from "@/utils/common";
import { useSelector } from "react-redux";
import { SocketContext } from "@/utils/context/SocketContext";

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
    const { searchTotal, setSearchMessage , query , setQuery} = props;
    const selectedRoom = useSelector((state) => state.room.selectedRoom);

    const getRoomOnlineStatus = useContext(SocketContext).getRoomOnlineStatus;

    const navigate = useNavigate()

    const handleSearch = (e) => {
        const allSearchMessages = searchTotal.flat(Infinity)
        const newSearchMessages = allSearchMessages.filter(item => item.message.toLowerCase().includes(e.target.value.toLowerCase()))
        if (e.target.value) {
            setSearchMessage(newSearchMessages)
        } else {
            setSearchMessage([])
        }
        setQuery(e.target.value);
    };

    const handleClear = useCallback(() => {
        setQuery("");
        setSearchMessage([]);
    }, [setQuery, setSearchMessage]);

    useEffect(() => {
        handleClear(); 
    }, [selectedRoom, handleClear]);

    return (
        <Grid container sx={{ borderBottom: "1px solid #997017", p: 1, background: "#101010", pt: 3 }}>
            <Grid item xs={4} container>
                <Box sx={{ display: "flex", alignItems: "center", pb: 0 }}>
                    <Box sx={{ mr: { xs: 0, md: 1 }, }}
                        onClick={() => navigate("/chat")}>
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
            <Grid item xs={8} >
                <Box sx={{ background: "#101010", height: "90%", marginTop: '5px', }}>
                    <Box sx={{ display: "flex", justifyContent: "end", alignItems: "center" }}>
                        <FormControl fullWidth variant="outlined" sx={{ p: {xs:'0 5px',md:"0 10px"} }}>
                            <OutlinedInput
                                id="search-box"
                                placeholder="Search Messages"
                                autoComplete="messages"
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
                        <Grid container sx={{ width: "auto", mr: {xs:0,md:2} }}>
                            <Grid item xs={6} md={6} sm={6}>
                                <CircleButton2 onClick={handleClear}>
                                    <IconX size={20} stroke={2} />
                                </CircleButton2>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Grid>

        </Grid>
    )
}
export default memo(HeaderBox)