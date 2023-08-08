import React, { useContext } from 'react'
import {
    Box,
    Paper,
    Grid,
    Button,
    Avatar,
    Typography,
} from "@mui/material";
import Block from "ui-component/Block";
import { IconArrowLeft } from "@tabler/icons";
import { useSelector } from "react-redux"
import { styled } from "@mui/material/styles";
import { orange } from "@mui/material/colors";
import { messageService } from "utils/jwt/messageService";
import { SocketContext } from "utils/context/SocketContext";
import useJwt from "utils/jwt/useJwt";


const CircleButton = styled(Button)(({ theme }) => ({
    borderRadius: "50px",
    width: "100%",
    height: "50px",
    fontWeight: "bold",
    color: theme.palette.getContrastText(orange[500]),
    backgroundColor: "#F8F8F8",
    "&:hover": {
        backgroundColor: "#FBC34A",
    },
}));

export default function Settings({ theme, CircleButton1, setIsSettingClick }) {

    const socket = useContext(SocketContext).socket;
    const userData = useSelector((state) => state.auth.userData);
    const goBackButton = () => {
        setIsSettingClick(false);
    }
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
                    <CircleButton1 onClick={() => goBackButton()} >
                        <IconArrowLeft size={20} stroke={3} />
                    </CircleButton1>
                    <Typography component="p" variant="h3" sx={{ ml: 1, lineHeight: "50px" }}>Account Settings</Typography>
                </Box>
                <Box sx={{ p: 3 }}>
                    <Paper
                        sx={{ height: "calc( 100vh - 235px)", p: 3, overflowY: "auto", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                    >
                        <Box>
                            <Typography component="div"
                                sx={{ display: "flex", justifyContent: "center" }}
                            >
                                <Avatar
                                    src={userData.avatar_url}
                                    sx={{
                                        ...theme.typography.mediumAvatar,
                                        margin: "8px !important",
                                        width: "120px",
                                        height: "120px",
                                    }}
                                    alt={userData.fullName}
                                    color="inherit"
                                />
                            </Typography>

                            <Grid container>
                                <Grid item xs={12} sm={6} md={6} elevation={6}>
                                    <Typography component="p" variant="settingsInfo">username</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={6} elevation={6} sx={{ display: "flex", justifyContent: "end", alignItems: "center" }}>
                                    <Typography component="p" variant="settingsInfo1">{userData.username}</Typography>
                                </Grid>
                            </Grid>

                            <Grid container>
                                <Grid item xs={12} sm={6} md={6} elevation={6}>
                                    <Typography component="p" variant="settingsInfo">gender</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={6} elevation={6} sx={{ display: "flex", justifyContent: "end", alignItems: "center" }}>
                                    <Typography component="p" variant="settingsInfo1">{userData.gender}</Typography>
                                </Grid>
                            </Grid>
                            <Grid container>
                                <Grid item xs={12} sm={6} md={6} elevation={6}>
                                    <Typography component="p" variant="settingsInfo">email</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={6} elevation={6} sx={{ display: "flex", justifyContent: "end", alignItems: "center" }}>
                                    <Typography component="p" variant="settingsInfo1">{userData.email}</Typography>
                                </Grid>
                            </Grid>
                        </Box>
                        <Box>

                            <CircleButton onClick={() => (messageService.sendMessage("Logout"), socket.emit("logout", useJwt.getToken()))} >
                                Login Out
                            </CircleButton>
                        </Box>
                    </Paper>
                </Box>
            </Block>
        </>
    )
}
