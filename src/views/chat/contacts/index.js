import React, { useState, useEffect, useContext, memo, useRef } from "react";

import {
    Box,
    Stack,
    Paper,
    Typography,
    Badge,
    Grid,
} from "@mui/material";

// ** Store & Actions
import { useDispatch, useSelector } from "react-redux";
import { resetUnreadCount, selectRoom, calculateUnSeenCount } from "@/store/actions/room";
import { useTheme } from "@mui/material/styles";
import { getRoomDisplayName, getUserDisplayName, formatDateToIsToday } from "@/utils/common";
import ClientAvatar from "@/ui-component/ClientAvatar";
import { getMessages } from "@/store/actions/messages";

import UserAvatar from "./UserAvatar";
import { SocketContext } from "@/utils/context/SocketContext";

const Contacts = () => {
    const theme = useTheme();
    const storeRooms = useSelector((state) => state.room.rooms);
    const selectedRoom = useSelector((state) => state.room.selectedRoom);
    const unreadCount = useSelector((state) => state.room.unreadCount);
    const userData = useSelector((state) => state.auth.userData);
    const onlineUsers = useSelector((state) => state.users.onlineUsers);
    const getRoomOnlineStatus = useContext(SocketContext).getRoomOnlineStatus;

    const isFirstRender = useRef(true);

    const dispatch = useDispatch();
    const [active, setActive] = useState({});
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        const sortRooms = storeRooms.sort((b, a) => {
            if (a.last_message && b.last_message) {
                return a.last_message.created_at > b.last_message.created_at ? 1 : -1
            }
            else if (a.last_message) {
                return 1
            }
            else if (b.last_message) {
                return -1
            }
            else {
                return -1
            }
        })
        // console.log(sortRooms)
        setRooms(sortRooms)

    }, [dispatch, storeRooms]);

    const selectedRoomRef = useRef(null);

    useEffect(() => {
        selectedRoomRef.current = selectedRoom && Object.keys(selectedRoom).length > 0;

        const executeActions = () => {
            dispatch(resetUnreadCount({ room_id: selectedRoom?.id, unread_count: 0 }));
            dispatch(calculateUnSeenCount());
            if(selectedRoom && Object.keys(selectedRoom).length > 0) dispatch(getMessages({ id: selectedRoom?.id }));
        };
        if (isFirstRender.current) {
            setTimeout(() => {
                executeActions()
                isFirstRender.current = false;
            }, 2000)
        } else {
            executeActions()
        }

    }, [selectedRoom, dispatch]);

    useEffect(() => {
        if (!selectedRoomRef.current) {
            dispatch(selectRoom(rooms[0]));
        }
    }, [rooms, dispatch]);

    useEffect(() => {
        if (selectedRoom && selectedRoom.id) {
            setActive({ type: "chat", id: selectedRoom.id });

        } else {
            setActive({});
        }
    }, [selectedRoom]);

    useEffect(() => {
        if (active) {
            if (unreadCount) dispatch(resetUnreadCount({ room_id: active.id, unread_count: 0 }));
            dispatch(calculateUnSeenCount());
        }
    }, [onlineUsers])

    // ** Handles User Chat Click
    const handleUserClick = (type, room) => {
        dispatch(selectRoom(room));
        setActive({ type, id: room.id, room });
        // dispatch(getMessages({ id: room.id }))
        // if (!messages[room.id]) {
        //     dispatch(getMessages({ id: room.id }))
        // }
    };

    const handleTime = (item) => {
        if (item.last_message?.created_at) {
            return formatDateToIsToday(+item.last_message.created_at * 1000);
        }
        return "";
    }
    // ** Renders Chat
    const renderChats = () => {
        if (rooms && rooms.length) {
            return rooms.map((item) => <Box
                key={item.id}
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    p: "12px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    background:
                        active.type === "chat" && active.id === item.id
                            ? theme.palette.primary.main
                            : "inherit",
                    "&:hover": {
                        background: active.id === item.id ? theme.palette.primary.main : '#FFFFFF11',
                    }
                }}
                onClick={() => handleUserClick("chat", item)}
            >
                <Box sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "60%",
                }}>
                    <ClientAvatar
                        avatar={
                            item.photo_url
                                ? item.photo_url
                                : ""
                        }
                        status={getRoomOnlineStatus(item)}
                        name={getRoomDisplayName(item)}
                    />

                    <Box sx={{ ml: 2, width: "100%" }}>
                        <Typography variant="h4" color={
                            active.type === "chat" && active.id === item.id
                                ? theme.palette.text.black
                                : theme.palette.text.light
                        }>
                            {getRoomDisplayName(item)}
                        </Typography>
                        <Typography
                            variant="body1"
                            color={
                                active.type === "chat" && active.id === item.id
                                    ? theme.palette.text.black
                                    : theme.palette.text.disabled
                            }
                            sx={{ textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden" }}
                        >
                            {item.last_message ? (item.last_message?.type === 0 ? item.last_message?.message : (item.last_message?.type === 1 ? "image" : (item.last_message?.type === 2 ? "file" : "Forwared message"))) : ""}
                        </Typography>
                    </Box>
                </Box>
                <Box>
                    <Box sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                    }}>
                        {handleTime(item) !== "" && (
                            <Box>
                                <Typography
                                    variant="h5"
                                    color={
                                        active.type === "chat" && active.id === item.id
                                            ? theme.palette.text.black
                                            : theme.palette.text.disabled}
                                    sx={{ verticalAlign: "text-bottom" }}
                                >
                                    {handleTime(item)}
                                </Typography>
                            </Box>
                        )}
                        <Box sx={{ width: "100%" }}>
                            <Badge sx={{ width: "100%" }} color="error" badgeContent={item.unread_count} overlap="circular">
                            </Badge>
                        </Box>
                    </Box>
                </Box>
            </Box>
            );
        } else {
            return <Typography sx={{ minHeight: "50vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>No Contacts</Typography>;
        }
    };

    return (
        <Grid item xs={12} sm={12} md={3} sx={{
            backgroundColor: "#101010",
            height: "100%",
            "@media (max-width: 900px)": {
                display: selectedRoom && Object.keys(selectedRoom).length ? "none" : "block",
            },
            "@media (min-width: 900px)": {
                borderRight: "1px solid #383838 ",
            }
        }}>
            <Box
                sx={{
                    pt: 0,
                    height: { xs: "100%", md: "calc(100vh - 67px)" },
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        pt: 1
                    }}
                >
                    <UserAvatar />
                </Box>
                <Typography sx={{ pl: 2, pb: 3, pt: 1 }} variant="h1">
                    {getUserDisplayName(userData)}
                </Typography>
                <Box sx={{ height: { xs: "100%", md: "90%" } }}>
                    <Paper
                        sx={{ height: "100%", overflowY: "auto", borderRadius: 0, p: "0 8px" }}
                    >
                        <Stack direction="column" spacing={1} >
                            {renderChats()}
                        </Stack>
                    </Paper>
                </Box>
            </Box>
        </Grid>
    );
};

export default memo(Contacts);
