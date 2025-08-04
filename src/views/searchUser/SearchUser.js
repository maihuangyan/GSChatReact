import React, { useEffect, useState, useContext } from 'react'
import useJwt from "@/utils/jwt/useJwt";

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
import Block from "@/ui-component/Block";
import ClientAvatar from "@/ui-component/ClientAvatar";

import { IconSearch, IconArrowLeft, IconPlus, IconCheck } from "@tabler/icons";
import defaultAvatar from "@/assets/images/defaultImg.jpg";
import { styled, useTheme } from "@mui/material/styles";

import { getUserDisplayName } from '@/utils/common';
import { useSelector, useDispatch } from "react-redux"
import { LoaderContext } from "@/utils/context/ProgressLoader";
import { getRoomList, selectRoom } from "@/store/actions/room"
import { useNavigate } from 'react-router-dom';

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

export default function SearchUser() {

    const theme = useTheme();
    const user = useSelector((state) => state.auth);
    const rooms = useSelector((state) => state.room.rooms);
    const allUser = useSelector((state) => state.users.all_users);
    const showToast = useContext(LoaderContext).showToast
    const userData = useSelector((state) => state.auth.userData);
    const dispatch = useDispatch();
    const navigate = useNavigate()

    const goBackButton = () => {
        navigate("/chat");
    }
    const [query, setQuery] = useState("");
    const [filteredChat, setFilteredChat] = useState([]);
    const [addGroup, setAddGroup] = useState(false);
    const [connectedUsers, setConnectedUsers] = useState([])
    const [selectUser, setSelectUser] = useState([])
    const [groupName, setGroupName] = useState("")
    const [groupAvatar, setGroupAvatar] = useState("")
    const [groupFiles, setGroupFiles] = useState(null)

    const getAllUsers = async (value) => {
        await useJwt
            .searchUsers({ search_key: value, status: 1, page: 0, limit: 0 })
            .then((res) => {
                if (res.data.ResponseCode === 0) {
                    const data = res.data.ResponseResult
                    const handleFilter = data.users?.filter(item => item.id !== userData.id)
                    const searchUsers = { ...data, users: handleFilter }
                    const filteredChatsArr = searchUsers.users.filter((item) =>
                        item.username
                            .toLowerCase()
                            .includes(value.toLowerCase()));

                    setFilteredChat([...filteredChatsArr]);
                }
                else {
                    console.log(res.data.ResponseCode)
                }
            })
            .catch((err) => console.log(err));
    }

    useEffect(() => {
        const map = new Map();
        const newArr = allUser.filter(item => !map.has(item.id) && map.set(item.id, item));
        setConnectedUsers(newArr.filter(item => item.id !== user.userData.id))
    }, [allUser])

    // ** Handles Filter
    const handleFilter = (e) => {
        setFilteredChat([])
        getAllUsers(e.target.value)
        setQuery(e.target.value);
    };

    const createPrivate = (item) => {
        let isCreate = rooms.filter(room => !room.group && room.opponents[0].id === item.id)

        if (isCreate.length) {
            navigate("/chat");
            dispatch(selectRoom(isCreate[0]));
        } else {
            useJwt
                .createRoom({ name: item.id, opponent_ids: item.id, group: 0 })
                .then((res) => {
                    if (res.data.ResponseCode === 0) {
                        dispatch(getRoomList())
                        dispatch(selectRoom(res.data.ResponseResult));
                        navigate("/chat");
                    }
                    else {
                        console.log(res.data.ResponseMessage)
                    }
                })
                .catch((err) => {
                    console.log(err)
                })
        }
    }

    // ** Renders Chat
    const renderChats = () => {
        if (query.length) {
            if (!Object.keys(filteredChat).length) {
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
                                    item.photo_url
                                        ? item.photo_url
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
            console.log(groupFiles)
            const formData = new FormData();
            formData.append("name", groupName);
            formData.append("opponent_ids", selectUser.join(","));
            formData.append("photo", groupFiles);
            useJwt
                .createRoomWithImg(formData)
                .then((res) => {
                    if (res.data.ResponseCode === 0) {
                        console.log(res.data, "7777")
                        navigate(0)
                    }
                    else {
                        console.log(res.data.ResponseMessage)
                    }
                })
                .catch((err) => console.log(err));
        } else {
            useJwt
                .createRoom({ name: groupName, opponent_ids: selectUser.join(","), group: 1 })
                .then((res) => {
                    if (res.data.ResponseCode === 0) {
                        console.log(res.data, "66666")
                        navigate(0)
                    }
                    else {
                        console.log(res.data.ResponseMessage)
                    }
                })
                .catch((err) => console.log(err));
        }
    }

    const selectUserClick = (id) => {
        let user = selectUser.filter(item => item === id);
        if (user.length) {
            setSelectUser(selectUser.filter(item => item !== id))
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

                if (file.file.type.split("/")[0] !== "image") {
                    showToast("error", "This file is not supported")
                    return
                } else {
                    setGroupFiles(file.file)
                    setGroupAvatar(fileReader.result)
                }
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
                        width: "100%",
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
                                                    placeholder='Group Name'
                                                    autoComplete="name"
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
                                                    {selectUser.filter(ele => ele === item.id).length ? <Box >
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
                        width: "100%",
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
                                    id="search-box"
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
