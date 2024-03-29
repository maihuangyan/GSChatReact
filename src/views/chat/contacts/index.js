import { useState, useEffect, useContext } from "react";

import {
    Box,
    Stack,
    Paper,
    Button,
    Typography,
    Badge,
} from "@mui/material";

// ** Store & Actions
import { useDispatch, useSelector } from "react-redux";
import { resetUnreadCount, selectRoom } from "store/actions/room";
import { getLastMessages, getMessages } from "store/actions/messages";

import { styled, useTheme } from "@mui/material/styles";

import { formatChatDate, formatChatTime, getRoomDisplayName, getUserDisplayName } from "utils/common";
import ClientAvatar from "ui-component/ClientAvatar";

import UserAvatar from "./UserAvatar";
import SearchUser from "./SearchUser";
import Settings from "./Settings";
import { SocketContext } from "utils/context/SocketContext";

const CircleButton1 = styled(Button)(({ theme }) => ({
    borderRadius: "50%",
    minWidth: "40px",
    height: "40px",
    color: theme.palette.primary.light,
    backgroundColor: theme.palette.dark[900],
    "&:hover": {
        backgroundColor: "#FBC34A",
        color: theme.palette.common.black,
    },
}));

const Contacts = ({ setIsChatClick, setIsSettingClick }) => {
    const theme = useTheme();
    const store = useSelector((state) => state.room);
    const messages = useSelector((state) => state.messages);
    const selectedRoom = store.selectedRoom;
    const dispatch = useDispatch();
    const userData = useSelector((state) => state.auth.userData);
    const [active, setActive] = useState({});
    const [rooms, setRooms] = useState([]);

    const updateOnlineStatus = useContext(SocketContext).updateOnlineStatus;
    const getRoomOnlineStatus = useContext(SocketContext).getRoomOnlineStatus;
    useEffect(() => {
        setRooms([...store.rooms])
    }, [store]);

    useEffect(() => {
        if (selectedRoom && selectedRoom.id) {
            setActive({ type: "chat", id: selectedRoom.id });
        } else {
            setActive({});
        }
    }, [selectedRoom]);

    useEffect(() => {
        if (active) {
            dispatch(resetUnreadCount({ room_id: active.id, unread_count: 0 }))
        }
    }, [updateOnlineStatus])

    // ** Handles User Chat Click
    const handleUserClick = (type, room) => {
        dispatch(selectRoom(room));
        setActive({ type, id: room.id, room });
        dispatch(getMessages({ id: room.id }))
        dispatch(resetUnreadCount({ room_id: room.id, unread_count: 0 }))
    };

    // ** Renders Chat
    const renderChats = () => {
        if (rooms && rooms.length) {
            rooms.sort(function (b, a) {
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
            return rooms.map((item) => {
                let time = "";
                // let times = "";
                if (item.last_message) {
                    time = formatChatTime(
                        item.last_message
                            ? +item.last_message.created_at * 1000
                            : new Date().getTime()
                    );
                    // times = formatChatDate(
                    //     item.last_message
                    //         ? +item.last_message.created_at  * 1000
                    //         : new Date().getTime()
                    // );
                }
                return (
                    <Box
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
                                    {item.last_message ? (item.last_message?.type == 0 ? item.last_message?.message : (item.last_message?.type == 1 ? "image" : (item.last_message?.type == 2 ? "file" : "Forwared message"))) : ""}
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

                                {time !== "" && (
                                    <Box>
                                        <Typography
                                            variant="h5"
                                            color={
                                                active.type === "chat" && active.id === item.id
                                                    ? theme.palette.text.black
                                                    : theme.palette.text.disabled}
                                            sx={{ verticalAlign: "text-bottom" }}
                                        >
                                            {time}
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
            });
        } else {
            return <Typography sx={{ minHeight: "50vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>No Contacts</Typography>;
        }
    };

    return (
        <>
            <Box
                sx={{
                    pt: 0,
                    height: { xs: "auto", sm: "auto", md: "calc(100vh - 67px)" },
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
                    <UserAvatar CircleButton1={CircleButton1} theme={theme} setIsChatClick={setIsChatClick} setIsSettingClick={setIsSettingClick} />
                </Box>
                <Typography sx={{ pl: 2, pb: 3, pt: 1 }} variant="h1">
                    {getUserDisplayName(userData)}
                </Typography>
                <Box sx={{ height: "90%" }}>
                    <Paper
                        sx={{ height: "100%", overflowY: "auto", borderRadius: 0, p: "0 8px" }}
                    >
                        <Stack direction="column" spacing={1} >
                            {renderChats()}
                        </Stack>
                    </Paper>
                </Box>
            </Box>
        </>
    );
};

export default Contacts;
