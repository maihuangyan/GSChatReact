import { useState, useEffect } from "react";

import {
    Box,
    Stack,
    Paper,
    Button,
    Typography,
    Divider,
    Link,
    Badge,
} from "@mui/material";

// ** Store & Actions
import { useDispatch } from "react-redux";
import { getRoomList, selectRoom } from "store/actions/room";
import { getMessages } from "store/actions/messages";
import Block from "ui-component/Block";
import defaultAvatar from "../../../assets/images/users/default_avatar.png";
import { styled, useTheme } from "@mui/material/styles";

import { formatDateToMonthShort } from "utils/common";
import ClientAvatar from "ui-component/ClientAvatar";

import UserAvatar from "./UserAvatar";
import SearchUser from "./SearchUser";
import Settings from "./Settings";

const CircleButton1 = styled(Button)(({ theme }) => ({
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

const Contacts = ({ store }) => {
    const theme = useTheme();
    const [active, setActive] = useState({});

    const { chats, selectedRoom } = store;
    const dispatch = useDispatch();

    useEffect(() => {
        if (selectedRoom && selectedRoom.id) {
            setActive({ type: "chat", id: selectedRoom.id });
        }
    }, [selectedRoom]);

    // ** Handles User Chat Click
    const handleUserClick = (type, room) => {
        dispatch(selectRoom(room));
        setActive({ type, id: room.id });
        dispatch(getMessages({ id: room.id }))
    };

    // const getUnreadMsgsCount = (room_id) => {
    //     for (let item o ) {
    //         if (item.messages.length > 0 && item.messages[0].room_id == room_id) {
    //             return item.messages.length
    //         }
    //     }
    //     return 0
    // }

    // ** Renders Chat
    const renderChats = () => {
        if (chats && chats.length) {
            const arrToMap = chats;

            const lastMessage = arrToMap.filter((item) => item.last_message !== undefined)
            const lastMessageNull = arrToMap.filter((item) => item.last_message === undefined)

            lastMessage.sort(function (a, b) {
                if (a.last_message && b.last_message) {
                    return b.last_message.created_at < a.last_message.created_at ? -1 : 1
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
            const arrToMapSort = lastMessage.concat(lastMessageNull)

            return arrToMapSort.map((item) => {
                //if (!item.chat.lastMessage) return null;
                let time = "";
                if (item.last_message) {
                    time = formatDateToMonthShort(
                        item.last_message
                            ? +item.last_message.created_at * 1000
                            : new Date().getTime()
                    );
                }

                return (
                    <Box
                        key={item.id}
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            p: 1,
                            borderRadius: "5px",
                            cursor: "pointer",
                            background:
                                active.type === "chat" && active.id === item.id
                                    ? theme.palette.primary.main
                                    : "inherit",
                            "&:hover": {
                                background: theme.palette.primary.main,
                            }
                        }}
                        onClick={() => handleUserClick("chat", item)}
                    >
                        <Box sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            width: "60%",
                        }}>
                            <ClientAvatar
                                avatar={
                                    item.photo_url
                                        ? item.photo
                                        : defaultAvatar
                                }   
                                status={item.status}
                                name={item.name}
                                group={item.photo ? "0" : item.group}
                            />
                            <Box sx={{ ml: 2 , width:"100%"}}>
                                <Typography variant="h4" color={
                                    active.type === "chat" && active.id === item.id
                                        ? theme.palette.text.black
                                        : theme.palette.text.light
                                }>
                                    {item.name}
                                </Typography>
                                <Typography
                                    variant="body1"
                                    color={
                                        active.type === "chat" && active.id === item.id
                                            ? theme.palette.text.black
                                            : theme.palette.text.dark
                                    }
                                    sx={{textOverflow:"ellipsis",whiteSpace:"nowrap",overflow:"hidden"}}
                                >
                                    {item.last_message?.message}
                                </Typography>
                            </Box>
                        </Box>
                        <Box>
                            <Box sx={{
                                display: "flex",
                                flexDirection: "column",
                            }}>

                                {time !== "" && (
                                    <Box>
                                        <Typography
                                            variant="h4"
                                            color={
                                                theme.palette.text.dark}
                                            sx={{ verticalAlign: "text-bottom" }}
                                        >
                                            {time}
                                        </Typography>
                                    </Box>
                                )}
                                <Box sx={{ width: "100%" }}>
                                    <Badge sx={{ width: "100%" }} color="primary" badgeContent={item.unread_count} overlap="circular">
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

    // console.log(store, "6666 ")

    const [isChatClick, setIsChatClick] = useState(false);
    const [isSettingClick, setIsSettingClick] = useState(false);

    // useEffect(() => {
    //     dispatch(getRoomList())
    // }, [isChatClick])

    return (
        <>
            {
                !isChatClick && !isSettingClick && <Block
                    sx={{
                        p: 2,
                        height: { xs: "auto", sm: "auto", md: "calc(100vh - 67px)" },
                    }}
                >
                    <Box
                        sx={{
                            borderBottom: "solid 1px #202020",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <UserAvatar CircleButton1={CircleButton1} theme={theme} setIsChatClick={setIsChatClick} setIsSettingClick={setIsSettingClick} />
                    </Box>
                    <Box>
                        <Paper
                            sx={{ height: "calc( 100vh - 235px)", p: 2, overflowY: "auto" }}
                        >
                            <Stack direction="column" spacing={1} divider={<Divider />}>
                                {renderChats()}
                            </Stack>
                        </Paper>
                    </Box>
                </Block>}
            {
                isChatClick && <SearchUser CircleButton1={CircleButton1} setIsChatClick={setIsChatClick} isChatClick={isChatClick} />
            }
            {
                isSettingClick && <Settings CircleButton1={CircleButton1} setIsSettingClick={setIsSettingClick} theme={theme} />
            }
        </>
    );
};

export default Contacts;
