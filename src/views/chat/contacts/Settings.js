import React, { useContext, useState } from 'react'
import {
    Box,
    Paper,
    Grid,
    Button,
    Typography,
    FormControl,
    InputAdornment,
    FormHelperText,
    IconButton,
    InputLabel,
    Input,
} from "@mui/material";
import Block from "ui-component/Block";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons";
import { useSelector } from "react-redux"
import { styled } from "@mui/material/styles";
import { orange } from "@mui/material/colors";
import { messageService } from "utils/jwt/messageService";
import { SocketContext } from "utils/context/SocketContext";
import useJwt from "utils/jwt/useJwt";
import ClientAvatar from "ui-component/ClientAvatar";
import { useForm, Controller } from "react-hook-form"
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlined from "@mui/icons-material/VisibilityOffOutlined";

const CircleButton = styled(Button)(({ theme }) => ({
    borderRadius: "50px",
    width: "100%",
    height: "50px",
    fontWeight: "bold",
    color: theme.palette.getContrastText(orange[500]),
    backgroundColor: "#FBC34A",
    "&:hover": {
        backgroundColor: "#F8F8F8",
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

const loginHelper = {
    current_password: {
        required: "Current Password is Required.",
        minLength: "Password must be at least 8 characters long.",
    },
    new_password: {
        required: "New Password is Required.",
        minLength: "Password must be at least 8 characters long.",
    },
    confirm_password: {
        required: "Confirm Password is Required.",
        minLength: "Password must be at least 8 characters long.",
    },
};

export default function Settings({ setIsSettingClick }) {
    const socket = useContext(SocketContext).socket;
    const userData = useSelector((state) => state.auth.userData);
    const goBackButton = () => {
        setIsSettingClick(false);
    }

    const [rePass, setRePass] = useState(false)
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { control, handleSubmit } = useForm({
        reValidateMode: "onBlur",
    });

    const handleClickCurrentPassword = () => {
        setShowCurrentPassword(!showCurrentPassword);
    };

    const handleMouseDownCurrentPassword = (event) => {
        event.preventDefault();
    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleClickShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleMouseDownConfirmPassword = (event) => {
        event.preventDefault();
    };

    const onSubmit = (data) => {
        console.log('data', data)
    };

    console.log(userData)
    return (
        <>
            {
                rePass ?
                    (<Block
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
                                <CircleButton1 onClick={() => setRePass(false)}>
                                    <IconArrowLeft size={20} stroke={3} />
                                </CircleButton1>
                                <Typography component="p" variant="h4" sx={{ ml: 1, lineHeight: "50px" }}>Profile</Typography>
                            </Box>
                        </Box>
                        <Box>
                            <Typography sx={{ pl: 2, pb: 3, pt: 1 }} variant="h1">
                                Reset Password
                            </Typography>
                        </Box>
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            style={{ height: "100%" }}
                            noValidate
                        >
                            <Grid container spacing={2} sx={{ pl: 2, mt: 3, justifyContent: "center" }}>
                                <Grid item xs={12} sm={12} md={8}>
                                    <Controller
                                        control={control}
                                        name="current_password"
                                        defaultValue=""
                                        rules={{
                                            required: true,
                                            minLength: 8,
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormControl
                                                variant="standard"
                                                sx={{ width: "100%" }}
                                                {...field}
                                            >
                                                <InputLabel
                                                    htmlFor="standard-adornment-password"
                                                    shrink={true}
                                                    sx={{ color: "white" }}
                                                    error={error !== undefined}
                                                >
                                                    Current Password
                                                </InputLabel>
                                                <Input
                                                    id="standard-adornment-current-password"
                                                    placeholder="********"
                                                    sx={{ height: 50, color: "white" }}
                                                    type={showCurrentPassword ? "text" : "password"}
                                                    endAdornment={
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                aria-label="toggle password visibility"
                                                                onClick={handleClickCurrentPassword}
                                                                onMouseDown={handleMouseDownCurrentPassword}
                                                            >
                                                                {showCurrentPassword ? (
                                                                    <VisibilityOffOutlined fontSize="small" />
                                                                ) : (
                                                                    <VisibilityOutlined fontSize="small" />
                                                                )}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    }
                                                    error={error !== undefined}
                                                />
                                                {error && (
                                                    <FormHelperText error>
                                                        {loginHelper.current_password[error.type]}
                                                    </FormHelperText>
                                                )}
                                            </FormControl>
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={12} md={8}>
                                    <Controller
                                        control={control}
                                        name="new_password"
                                        defaultValue=""
                                        rules={{
                                            required: true,
                                            minLength: 8,
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormControl
                                                variant="standard"
                                                sx={{ width: "100%" }}
                                                {...field}
                                            >
                                                <InputLabel
                                                    htmlFor="standard-adornment-password"
                                                    shrink={true}
                                                    sx={{ color: "white" }}
                                                    error={error !== undefined}
                                                >
                                                    New Password
                                                </InputLabel>
                                                <Input
                                                    id="standard-adornment-password"
                                                    placeholder="********"
                                                    sx={{ height: 50, color: "white" }}
                                                    type={showPassword ? "text" : "password"}
                                                    endAdornment={
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                aria-label="toggle password visibility"
                                                                onClick={handleClickShowPassword}
                                                                onMouseDown={handleMouseDownPassword}
                                                            >
                                                                {showPassword ? (
                                                                    <VisibilityOffOutlined fontSize="small" />
                                                                ) : (
                                                                    <VisibilityOutlined fontSize="small" />
                                                                )}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    }
                                                    error={error !== undefined}
                                                />
                                                {error && (
                                                    <FormHelperText error>
                                                        {loginHelper.new_password[error.type]}
                                                    </FormHelperText>
                                                )}
                                            </FormControl>
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={12} md={8}>
                                    <Controller
                                        control={control}
                                        name="confirm_password"
                                        defaultValue=""
                                        rules={{
                                            required: true,
                                            minLength: 8,
                                        }}
                                        render={({ field, fieldState: { error } }) => (
                                            <FormControl
                                                variant="standard"
                                                sx={{ width: "100%" }}
                                                {...field}
                                            >
                                                <InputLabel
                                                    htmlFor="standard-adornment-password"
                                                    shrink={true}
                                                    sx={{ color: "white" }}
                                                    error={error !== undefined}
                                                >
                                                    Confirm Password
                                                </InputLabel>
                                                <Input
                                                    id="standard-adornment-confirm-password"
                                                    placeholder="********"
                                                    sx={{ height: 50, color: "white" }}
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    endAdornment={
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                aria-label="toggle password visibility"
                                                                onClick={handleClickShowConfirmPassword}
                                                                onMouseDown={handleMouseDownConfirmPassword}
                                                            >
                                                                {showConfirmPassword ? (
                                                                    <VisibilityOffOutlined fontSize="small" />
                                                                ) : (
                                                                    <VisibilityOutlined fontSize="small" />
                                                                )}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    }
                                                    error={error !== undefined}
                                                />
                                                {error && (
                                                    <FormHelperText error>
                                                        {loginHelper.confirm_password[error.type]}
                                                    </FormHelperText>
                                                )}
                                            </FormControl>
                                        )}
                                    />
                                </Grid>
                            </Grid>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                }}
                            >
                                <Box sx={{ mt: 4, width: { xs: "50%", sm: "30%", md: "20%" }, display: "flex", justifyContent: "center" }}>
                                    <CircleButton type="submit">
                                        SUBMIT
                                    </CircleButton>
                                </Box>
                            </Box>
                        </form>
                    </Block >) :
                    (<Block
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
                                justifyContent: "start",
                                alignItems: "center",
                            }}
                        >
                            <CircleButton1 onClick={() => goBackButton()} >
                                <IconArrowLeft size={20} stroke={3} />
                            </CircleButton1>
                            <Typography component="p" variant="h3" sx={{ ml: 1, lineHeight: "50px" }}>{userData.username}</Typography>
                        </Box>
                        <Box>
                            <Typography sx={{ pl: 2, pb: 3, pt: 1 }} variant="h1">
                                Profile
                            </Typography>
                        </Box>
                        <Box sx={{ mt: 3, pl: 2 }}>
                            <Paper
                                sx={{ height: "calc( 100vh - 235px)", overflowY: "auto", display: "flex", flexDirection: "column", justifyContent: "start", alignItems: "center" }}
                            >
                                <Box sx={{ width: { xs: "100%", sm: "100%", md: "80%" } }}>
                                    <Typography component="div"
                                        sx={{ display: "flex", justifyContent: "center" }}
                                    >
                                        <ClientAvatar
                                            avatar={
                                                userData.photo_url
                                                    ? userData.photo_url
                                                    : ""
                                            }
                                            name={userData.full_name ? userData.full_name : userData.username}
                                            size={80}
                                        />
                                    </Typography>

                                    <Grid container>
                                        <Grid item xs={6} sm={6} md={6} elevation={6}>
                                            <Typography component="p" variant="settingsInfo">Name</Typography>
                                        </Grid>
                                        <Grid item xs={6} sm={6} md={6} elevation={6} sx={{ display: "flex", justifyContent: "end", alignItems: "center" }}>
                                            <Typography component="p" variant="settingsInfo1">{userData.full_name ? userData.full_name : userData.username}</Typography>
                                        </Grid>
                                    </Grid>

                                    <Grid container>
                                        <Grid item xs={6} sm={6} md={6} elevation={6}>
                                            <Typography component="p" variant="settingsInfo">User Type </Typography>
                                        </Grid>
                                        <Grid item xs={6} sm={6} md={6} elevation={6} sx={{ display: "flex", justifyContent: "end", alignItems: "center" }}>
                                            <Typography component="p" variant="settingsInfo1">{userData.role}</Typography>
                                        </Grid>
                                    </Grid>

                                    <Grid container>
                                        <Grid item xs={6} sm={6} md={6} elevation={6}>
                                            <Typography component="p" variant="settingsInfo">Email</Typography>
                                        </Grid>
                                        <Grid item xs={6} sm={6} md={6} elevation={6} sx={{ display: "flex", justifyContent: "end", alignItems: "center" }}>
                                            <Typography component="p" variant="settingsInfo1">{userData.email}</Typography>
                                        </Grid>
                                    </Grid>

                                    <Grid container sx={{ cursor: "pointer", borderTop: "1px solid #6e6e6e", mt: 1 }} onClick={() => setRePass(true)}>
                                        <Grid item xs={6} sm={6} md={6} elevation={6}>
                                            <Typography component="p" variant="settingsInfo">Reset Password</Typography>
                                        </Grid>
                                        <Grid item xs={6} sm={6} md={6} elevation={6} sx={{ display: "flex", justifyContent: "end", alignItems: "center", pr: 1 }}>
                                            <IconArrowRight size={20} stroke={2} />
                                        </Grid>
                                    </Grid>
                                </Box>
                                <Box sx={{ mt: 4, width: { xs: "50%", sm: "30%", md: "20%" }, display: "flex", justifyContent: "center" }}>
                                    <CircleButton onClick={() => (messageService.sendMessage("Logout"), socket.emit("logout", useJwt.getToken()))} >
                                        Log Out
                                    </CircleButton>
                                </Box>
                            </Paper>
                        </Box>
                    </Block>)
            }
        </>
    )
}
