import React, { useEffect, useState } from 'react'
import useJwt from "utils/jwt/useJwt";

import {
    Box,
    Paper,
    Grid,
    Stack,
    Divider,
    FormControl,
    IconButton,
    InputLabel,
    InputAdornment,
    OutlinedInput,
    Typography,
    Button,
} from "@mui/material";
import { Input, Upload } from 'antd';
import Block from "ui-component/Block";
import ClientAvatar from "ui-component/ClientAvatar";

import { IconSearch, IconArrowLeft, IconPlus, IconCheck } from "@tabler/icons";
import defaultAvatar from "../../../assets/images/defaultImg.jpg";
import { styled, useTheme } from "@mui/material/styles";

import { getUserDisplayName } from 'utils/common';
import { useSelector } from "react-redux"

const CircleButton = styled(Button)(({ theme }) => ({
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

export default function SearchUser({ setIsChatClick }) {

    const theme = useTheme();
    const user = useSelector((state) => state.auth);
    const allUser = useSelector((state) => state.users.connected_users);

    const goBackButton = () => {
        setIsChatClick(false);
    }
    const [searchUser, setSearchUser] = useState([])
    const [query, setQuery] = useState("");
    const [filteredChat, setFilteredChat] = useState([]);
    const [addGroup, setAddGroup] = useState(false);
    const [connectedUsers, setConnectedUsers] = useState("")
    const [selectUser, setSelectUser] = useState([])
    const [groupName, setGroupName] = useState("")
    const [groupAvatar, setGroupAvatar] = useState("")
    const [groupFiles, setGroupFiles] = useState(null)

    useEffect(() => {
        useJwt
            .searchUsers({ search_key: query, status: 1, page: 0, limit: 0 })
            .then((res) => {
                if (res.data.ResponseCode == 0) {
                    setSearchUser(res.data.ResponseResult)
                }
                else {
                    console.log(res.data.ResponseCode)
                }
            })
            .catch((err) => console.log(err));
    }, [query])

    // ** Handles Filter
    const handleFilter = (e) => {
        setQuery(e.target.value);
        const searchFilterFunction = (users) =>
            users.username
                .toLowerCase()
                .includes(e.target.value.toLowerCase());
        const filteredChatsArr = searchUser.users.filter(searchFilterFunction);
        setFilteredChat([...filteredChatsArr]);
    };

    const createPrivate = (item) => {
        useJwt
            .createRoom({ name: item.username, opponent_ids: item.id, group: 0 })
            .then((res) => {
                if (res.data.ResponseCode == 0) {
                    console.log(res.data, "66666")
                    setIsChatClick(false)
                }
                else {
                    console.log(res.data.ResponseMessage)
                }
            })
            .catch((err) => console.log(err));
    }

    // ** Renders Chat
    const renderChats = () => {
        if (query.length) {
            if (searchUser.total == 0) {
                return <Typography sx={{ minHeight: "50vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>No Results Found</Typography>;
            }
            else {
                return filteredChat.map((item) => {
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
                            onClick={() => createPrivate(item)}
                        >
                            <ClientAvatar
                                avatar={
                                    item.photo
                                        ? item.photo
                                        : defaultAvatar
                                }
                                number={0}
                                status={item.status}
                                name={getUserDisplayName(item)}
                                group={item.photo ? "0" : item.group}
                            />
                            <Box sx={{ ml: 2 }}>
                                <Typography variant="h4" color={theme.palette.text.primary}>
                                    {getUserDisplayName(item)}
                                </Typography>
                            </Box>
                        </Box>
                    );
                });
            }
        } else {
            return <Typography sx={{ minHeight: "50vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>Use Search To Find Contacts</Typography>;
        }
    };

    const onSubmit = () => {
        if (groupFiles) {
            useJwt
                .createRoomWithImg({ name: groupName, opponent_ids: selectUser, group: 1, photo: groupFiles })
                .then((res) => {
                    if (res.data.ResponseCode == 0) {
                        console.log(res.data, "7777")
                        setIsChatClick(false)
                    }
                    else {
                        console.log(res.data.ResponseMessage)
                    }
                })
                .catch((err) => console.log(err));
        } else {
            useJwt
                .createRoom({ name: groupName, opponent_ids: selectUser, group: 1 })
                .then((res) => {
                    if (res.data.ResponseCode == 0) {
                        console.log(res.data, "66666")
                        setIsChatClick(false)
                    }
                    else {
                        console.log(res.data.ResponseMessage)
                    }
                })
                .catch((err) => console.log(err));
        }
    }

    useEffect(() => {
        const map = new Map();
        const newArr = allUser.filter(item => !map.has(item.id) && map.set(item.id, item));
        setConnectedUsers(newArr.filter(item => item.id != user.userData.id))
    }, [])

    const selectUserClick = (id) => {
        let user = selectUser.filter(item => item == id);
        if (user.length) {
            setSelectUser(selectUser.filter(item => item != id))
        } else {
            setSelectUser([...selectUser, id])
        }
    }

    const props = {
        name: 'file',
        headers: {
            authorization: 'authorization-text',
        },
        beforeUpload: {
            function() {
                return false;
            }
        },
        showUploadList: false,
        maxCount: 1,
        style: { border: "none" },
        onChange(file) {
            const fileReader = new FileReader();
            fileReader.onload = () => {
                setGroupFiles(file.file)
                setGroupAvatar(fileReader.result)
            }
            fileReader.readAsDataURL(file.file);
        },
    };

    return (
        <>
            {
                addGroup ? (<Block
                    sx={{
                        p: 2,
                        position: "absolute",
                        left: 0,
                        top: 0,
                        width: "100%",
                        zIndex: 100,
                        background: "#101010"
                    }}>
                    <Box
                        sx={{
                            borderBottom: "solid 1px #202020",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Box sx={{
                            display: "flex",
                            justifyContent: "start",
                            alignItems: "center",
                        }}>
                            <CircleButton1 onClick={() => setAddGroup(false)}>
                                <IconArrowLeft size={20} stroke={3} />
                            </CircleButton1>
                            <Typography component="p" variant="h4" sx={{ ml: 1, lineHeight: "50px" }}>Add Chat</Typography>
                        </Box>
                        <Box sx={{ mr: 2 }}>
                            <CircleButton onClick={() => onSubmit()}>
                                Save
                            </CircleButton>
                        </Box>
                    </Box>
                    <Box>
                        <Typography sx={{ pl: 2, pb: 3, pt: 1 }} variant="h1">
                            Group Info
                        </Typography>
                    </Box>
                    <Box>
                        <Paper
                            sx={{ height: "calc( 100vh - 235px)", p: 2, overflowY: "auto" }}
                        >
                            <Box
                                sx={{
                                    width: "100%",
                                    height: "100%",
                                    position: "relative",
                                    overflow: "hidden",
                                }}
                            >
                                <Grid container>
                                    <Grid item xs={12} sm={12} md={6} sx={{
                                        overflowY: "auto",
                                        height: "100%",
                                    }}>
                                        <Box
                                            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                                        >
                                            <Typography component="div"
                                                sx={{ display: "flex", justifyContent: "center", cursor: "pointer" }}
                                            >
                                                <Upload {...props}>
                                                    <ClientAvatar
                                                        avatar={groupAvatar ? groupAvatar : defaultAvatar}
                                                        size={80}
                                                    />
                                                </Upload>
                                            </Typography>
                                            <Box sx={{ ml: 2, width: "100%" }}>
                                                <Input
                                                    value={groupName}
                                                    onChange={(e) => setGroupName(e.target.value)}
                                                />
                                            </Box>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={12} md={6}>
                                        <Typography sx={{ pl: 2, pt: 2 }} variant="h4">
                                            Members :
                                        </Typography>
                                        {
                                            connectedUsers.map(item => {
                                                return <Box key={item.id}
                                                    sx={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                        p: "12px",
                                                        borderRadius: "5px",
                                                        cursor: "pointer",
                                                    }}
                                                    onClick={() => selectUserClick(item.id)}
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
                                                            name={item.username}
                                                        />
                                                        <Box sx={{ ml: 2, width: "100%" }}>
                                                            <Typography variant="h4" color={
                                                                theme.palette.text.light
                                                            }>
                                                                {item.username}
                                                            </Typography>
                                                            <Typography variant="h4" color="#b5b5b5">
                                                                {item.email}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    {selectUser.filter(ele => ele == item.id).length ? <Box >
                                                        <IconCheck size={20} stroke={3} color={theme.palette.primary.main} />
                                                    </Box> : ""}
                                                </Box>
                                            })
                                        }
                                    </Grid>
                                </Grid>
                            </Box>
                        </Paper>
                    </Box>
                </Block>) : (<Block
                    sx={{
                        p: 2,
                        position: "absolute",
                        left: 0,
                        top: 0,
                        width: "100%",
                        zIndex: 100,
                        background: "#101010"
                    }}>
                    <Box
                        sx={{
                            borderBottom: "solid 1px #202020",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Box sx={{
                            display: "flex",
                            justifyContent: "start",
                            alignItems: "center",
                        }}>
                            <CircleButton1 onClick={() => goBackButton()}>
                                <IconArrowLeft size={20} stroke={3} />
                            </CircleButton1>
                            <Typography component="p" variant="h4" sx={{ ml: 1, lineHeight: "50px" }}>{user.userData.username}</Typography>
                        </Box>
                        <Box sx={{ mr: 2 }}>
                            <CircleButton1 onClick={() => setAddGroup(true)}>
                                <IconPlus size={20} stroke={3} />
                            </CircleButton1>
                        </Box>
                    </Box>
                    <Box>
                        <Typography sx={{ pl: 2, pb: 3, pt: 1 }} variant="h1">
                            Add Chat
                        </Typography>
                    </Box>
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
                            <Paper
                                sx={{
                                    height: `calc( 100vh - 330px)`
                                    , p: 2, pt: 3, pb: 9, borderRadius: 0, overflowY: "auto"
                                }}
                            >
                                <Stack direction="column" spacing={1} divider={<Divider />}>
                                    {renderChats()}
                                </Stack>
                            </Paper>
                        </Paper>
                    </Box>
                </Block>)
            }
        </>
    )
}
