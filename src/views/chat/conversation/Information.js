import React, { useContext, useEffect, useState } from 'react'
import {
    Box,
    Grid,
    Button,
    Typography,
    TextField,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { IconArrowLeft, IconEdit } from "@tabler/icons";
import { styled, useTheme } from "@mui/material/styles";
import { orange } from "@mui/material/colors";
import useJwt from "utils/jwt/useJwt";
import ClientAvatar from "ui-component/ClientAvatar";
import { useSelector } from "react-redux"
import { getUserDisplayName } from 'utils/common';

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

const CircleButton2 = styled(Button)(({ theme }) => ({
    borderRadius: "50%",
    minWidth: "30px",
    height: "35px",
    color: theme.palette.primary.light,
    backgroundColor: theme.palette.dark[900],
    "&:hover": {
        backgroundColor: "#FBC34A",
        color: theme.palette.common.black,
    },
}));

export default function Information({ CircleButton1, setShowInformation }) {

    const theme = useTheme();
    const userData = useSelector((state) => state.auth.userData);
    const selectedRoom = useSelector((state) => state.room.selectedRoom);
    const onSubmit = (data) => {
        useJwt
            .createRoom({ name: data.name, opponent_ids: data.opponentIds, group: 1 })
            .then((res) => {
                if (res.data.ResponseCode == 0) {
                    console.log(res.data, "66666")
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

    const [isCreator, setIsCreator] = useState(false)

    useEffect(() => {
        if (userData.id == selectedRoom.room_users[0].id) {
            setIsCreator(true)
        } else {
            setIsCreator(false)
        }
    }, [selectedRoom, userData])

    // console.log(selectedRoom.photo_url)
    return (
        <>
            <Box
                sx={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                <Box sx={{ pt: 1, pl: 1, mb: 2 }}>
                    <CircleButton1 onClick={() => setShowInformation(false)}>
                        <IconArrowLeft size={20} stroke={3} />
                    </CircleButton1>
                </Box>
                <Grid container>
                    <Grid item xs={12} sm={6} md={6} sx={{
                        overflowY: "auto",
                        height: "100%",
                    }}>
                        <Typography variant='h2' sx={{ ml: 2, mb: 2 }}>
                            Room Member
                        </Typography>
                        {
                            selectedRoom.room_users.map(item => {
                                return <Box key={item.id}
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        p: "12px",
                                        borderRadius: "5px",
                                    }}
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
                                            name={getUserDisplayName(item)}
                                        />
                                        <Box sx={{ ml: 2, width: "100%" }}>
                                            <Typography variant="h4" color={
                                                theme.palette.text.light
                                            }>
                                                {getUserDisplayName(item)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    {isCreator && <Box sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        background: theme.palette.primary.main,
                                        p: 1,
                                        mr: 2,
                                        cursor: "pointer",
                                        borderRadius: "16px",
                                        color: "#000"
                                    }}>
                                        delete
                                    </Box>}
                                </Box>
                            })
                        }
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                        {selectedRoom.group ? <Box
                            sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                        >
                            <Typography component="div"
                                sx={{ display: "flex", justifyContent: "center" }}
                            >
                                <Box sx={{ position: "relative" }}>
                                    <ClientAvatar
                                        avatar={selectedRoom.photo_url ? selectedRoom.photo_url : ""}
                                        size={120}
                                        name={selectedRoom.name}
                                    />
                                    {isCreator && <Box sx={{ position: "absolute", right: "-30px", bottom: "0" }}>
                                        <CircleButton2>
                                            <IconEdit size={20} stroke={2} color='#d5d5d5' />
                                        </CircleButton2>
                                    </Box>}
                                </Box>

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
                                                        placeholder={selectedRoom.name}
                                                        InputLabelProps={{ shrink: true, sx: { mb: 3 } }}
                                                        error={error !== undefined}
                                                    />
                                                )}
                                            />
                                        </Box>
                                        <Box sx={{ px: 3, mt: 1 }}>
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
                                        {isCreator && <CircleButton type="submit">Save</CircleButton>}
                                    </Box>
                                </Box>
                            </form>
                        </Box> : ""}
                    </Grid>
                </Grid>
            </Box>
        </>
    )
}
