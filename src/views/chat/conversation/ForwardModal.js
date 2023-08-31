import React, { useEffect, useState } from 'react'
import { Modal } from 'antd';
import {
    Box,
    Paper,
    Stack,
    Divider,
    FormControl,
    IconButton,
    InputLabel,
    InputAdornment,
    OutlinedInput,
    Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { IconSearch } from "@tabler/icons";
import ClientAvatar from "ui-component/ClientAvatar";
import { useSelector, useDispatch } from "react-redux"
import { selectRoom } from "store/actions/room";
import { getMessages } from "store/actions/messages";

export default function ForwardModal({ isForwardModal, setIsForward, setIsForwardModal }) {

    const theme = useTheme();
    const room = useSelector((state) => state.room);
    const { selectedRoom, chats } = room
    const dispatch = useDispatch();


    const [query, setQuery] = useState("");
    const [searchUser, setSearchUser] = useState(chats.filter(item => item.id !== selectedRoom.id))
    const [filteredChat, setFilteredChat] = useState([]);

    const handleOk = () => {
        setIsForwardModal(false);
    };
    const handleCancel = () => {
        setIsForwardModal(false);
    };

    // ** Handles Filter
    const handleFilter = (e) => {
        setQuery(e.target.value);
        const searchFilterFunction = (users) =>
            users.name
                .toLowerCase()
                .includes(e.target.value.toLowerCase());
        const filteredChatsArr = searchUser.filter(searchFilterFunction);
        setFilteredChat([...filteredChatsArr]);
    };

    useEffect(() => {
        setFilteredChat(searchUser)
    }, [])

    const forwardClick = (room) => {
        dispatch(selectRoom(room));
        dispatch(getMessages({ id: room.id }))
        setIsForward(true)
        setIsForwardModal(false);
    }

    // ** Renders Chat
    const renderChats = () => {
        if (filteredChat.length == 0) {
            return <Typography sx={{ minHeight: "50vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>No Results Found</Typography>;
        }
        else {
            return filteredChat.map((item) => {
                let fullName = item.group ? item.name : (item.room_users[0].first_name.length ? `${item.room_users[0].first_name} ${item.room_users[0].last_name}` : item.room_users[0].username)
                return (
                    <Box
                        key={item.id}
                        sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            p: 1,
                            mt: 2,
                            borderRadius: "5px",
                            cursor: "pointer",
                            background: "inherit",
                            "&:hover": {
                                background: theme.palette.primary.main,
                            }
                        }}
                        onClick={() => forwardClick(item)}
                    >
                        <ClientAvatar
                            avatar={
                                item.photo_url
                                    ? item.photo_url
                                    : ""
                            }
                            name={fullName}
                        />
                        <Box sx={{ ml: 2 }}>
                            <Typography variant="h4" color={theme.palette.text.primary}>
                                {item.name}
                            </Typography>
                        </Box>
                    </Box>
                );
            });
        }
    };

    return (
        <Modal title="Forward to" open={isForwardModal} onOk={handleOk} onCancel={handleCancel}
            footer={false}>
            <Box>
                <Paper
                    sx={{ height: "calc( 100vh - 235px)", p: 2, overflowY: "auto" }}
                >
                    <FormControl fullWidth variant="outlined">
                        <InputLabel sx={{ color: "white" }} htmlFor="search-box">
                            Search
                        </InputLabel>
                        <OutlinedInput
                            // id="search-box"
                            sx={{ color: "white" }}
                            value={query}
                            onChange={handleFilter}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton aria-label="search icon" edge="end">
                                        <IconSearch />
                                    </IconButton>
                                </InputAdornment>
                            }
                            label="Search"
                        />
                    </FormControl>
                    <Stack direction="column" spacing={1} divider={<Divider />}>
                        {renderChats()}
                    </Stack>
                </Paper>
            </Box>
        </Modal>
    )
}
