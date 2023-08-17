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
    Avatar,
    Button,
    TextField,
} from "@mui/material";
import Block from "ui-component/Block";
import ClientAvatar from "ui-component/ClientAvatar";

import { IconSearch, IconArrowLeft } from "@tabler/icons";
import defaultAvatar from "../../../assets/images/users/default_avatar.png";
import { styled, useTheme } from "@mui/material/styles";
import { orange } from "@mui/material/colors";

import { useForm, Controller } from "react-hook-form";
import { getUserDisplayName } from 'utils/common';

const Item = styled("div")(({ theme }) => ({
    borderRadius: "24px",
    padding: "8px",
    cursor: "pointer",
    textAlign: "center",
    marginRight: "10px",
    color: theme.palette.primary.light,
}));

const CircleButton = styled(Button)(({ theme }) => ({
    borderRadius: "50px",
    width: "100px",
    height: "100px",
    fontWeight: "bold",
    margin: "20px",
    color: theme.palette.getContrastText(orange[500]),
    backgroundColor: "#F8F8F8",
    "&:hover": {
        backgroundColor: "#FBC34A",
    },
}));

export default function SearchUser({ CircleButton1, setIsChatClick }) {

    const theme = useTheme();

    const goBackButton = () => {
        setIsChatClick(false);
    }
    const [searchUser, setSearchUser] = useState([])
    const [query, setQuery] = useState("");
    const [filteredChat, setFilteredChat] = useState([]);
    const [active, setActive] = useState(false);

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

    const onSubmit = (data) => {
        useJwt
            .createRoom({ name: data.name, opponent_ids: data.opponentIds, group: 1 })
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
    const { control, handleSubmit } = useForm({
        reValidateMode: "onBlur",
    });

    return (
        <>
            <Block
                sx={{
                    p: 2,
                    height: { xs: "auto", sm: "auto", md: "calc(100vh - 67px)" },
                }}>
                <Box
                    sx={{
                        borderBottom: "solid 1px #202020",
                        display: "flex",
                        justifyContent: "start",
                        alignItems: "center",
                    }}
                >
                    <CircleButton1 onClick={() => goBackButton()}>
                        <IconArrowLeft size={20} stroke={3} />
                    </CircleButton1>
                    <Typography component="p" variant="h3" sx={{ ml: 1, lineHeight: "50px" }}>Start A New Message</Typography>
                </Box>
                <Box>
                    <Grid container sx={{ p: 2, pl: 4, pr: 4 }}>
                        <Grid item xs={12} sm={12} md={6}>
                            <Item sx={{ backgroundColor: !active ? theme.palette.primary.main : "transparent", color: !active ? theme.palette.common.black : theme.palette.primary.light }} onClick={() => setActive(!active)}>Search</Item></Grid>
                        <Grid item xs={12} sm={12} md={6}><Item sx={{ backgroundColor: active ? theme.palette.primary.main : "transparent", color: active ? theme.palette.common.black : theme.palette.primary.light }} onClick={() => setActive(!active)}>New Group</Item></Grid>
                    </Grid>
                </Box>
                {
                    active ? (<Box>
                        <Paper
                            sx={{ height: "calc( 100vh - 235px)", overflowY: "auto", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                        >
                            <Typography component="div"
                                sx={{ display: "flex", justifyContent: "center" }}
                            >
                                <Avatar
                                    src={""}
                                    sx={{
                                        ...theme.typography.mediumAvatar,
                                        margin: "8px !important",
                                        width: "120px",
                                        height: "120px",
                                    }}
                                    alt={""}
                                    color="inherit"
                                />
                            </Typography>
                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                style={{ height: "100%" }}
                                noValidate
                            >
                                <Box
                                    sx={{
                                        width: "100%",
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "start",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <Box sx={{ px: 3 }}>
                                            <Box>
                                                <Controller
                                                    control={control}
                                                    name="name"
                                                    defaultValue=""
                                                    rules={{
                                                        required: true,
                                                    }}
                                                    render={({ field, fieldState: { error } }) => (
                                                        <TextField
                                                            {...field}
                                                            fullWidth
                                                            sx={{
                                                                "& .MuiFormLabel-root": {
                                                                    color: "white",
                                                                },
                                                                "& .MuiInputBase-root": {
                                                                    color: "white",
                                                                    height: 40,
                                                                    "& input": {
                                                                        textAlign: "left",
                                                                    },
                                                                },
                                                            }}
                                                            variant="standard"
                                                            type="name"
                                                            label="Group Name"
                                                            placeholder="Group Free Format Name"
                                                            InputLabelProps={{ shrink: true, sx: { mb: 3 } }}
                                                            error={error !== undefined}
                                                        />
                                                    )}
                                                />
                                            </Box>
                                        </Box>
                                        <Box sx={{ px: 3, mt: 1 }}>
                                            <Box>
                                                <Controller
                                                    control={control}
                                                    name="opponentIds"
                                                    defaultValue=""
                                                    rules={{
                                                        required: true,
                                                    }}
                                                    render={({ field, fieldState: { error } }) => (
                                                        <TextField
                                                            {...field}
                                                            fullWidth
                                                            sx={{
                                                                "& .MuiFormLabel-root": {
                                                                    color: "white",
                                                                },
                                                                "& .MuiInputBase-root": {
                                                                    color: "white",
                                                                    height: 40,
                                                                    "& input": {
                                                                        textAlign: "left",
                                                                    },
                                                                },
                                                            }}
                                                            variant="standard"
                                                            type="opponentIds"
                                                            label="Opponent Ids"
                                                            placeholder="Opponent Ids"
                                                            InputLabelProps={{ shrink: true, sx: { mb: 3 } }}
                                                            error={error !== undefined}
                                                        />
                                                    )}
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            pt: 1,
                                            flexDirection: "column",
                                            justifyContent: "space-between",
                                            alignItems: "flex-end",
                                        }}
                                    >
                                        <Grid container></Grid>
                                        <CircleButton type="submit">Create</CircleButton>
                                    </Box>
                                </Box>
                            </form>
                        </Paper>
                    </Box>) : (
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
                                <Stack direction="column" spacing={1} divider={<Divider />}>
                                    {renderChats()}
                                </Stack>
                            </Paper>
                        </Box>
                    )
                }
            </Block>
        </>
    )
}
