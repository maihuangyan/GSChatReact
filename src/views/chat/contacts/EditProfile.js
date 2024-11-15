import React, { useContext, useState } from 'react'
import {
    Box,
    Grid,
    Button,
    Typography,
    FormControl,
    FormHelperText,
    InputLabel,
    Input,
} from "@mui/material";
import Block from "ui-component/Block";
import { IconArrowLeft, IconEdit } from "@tabler/icons";
import { Upload } from 'antd';
import { useSelector, useDispatch } from "react-redux"
import { styled } from "@mui/material/styles";
import { orange } from "@mui/material/colors";
import useJwt from "utils/jwt/useJwt";
import ClientAvatar from "ui-component/ClientAvatar";
import { useForm, Controller } from "react-hook-form"
import { LoaderContext } from "utils/context/ProgressLoader";

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


export default function EditProfile({ setEditProfile }) {

    const userData = useSelector((state) => state.auth.userData);

    const dispatch = useDispatch()

    const showToast = useContext(LoaderContext).showToast

    const { control, handleSubmit } = useForm({
        reValidateMode: "onBlur",
    });

    const [profileAvatar, setProfileAvatar] = useState(null)
    const [profileFiles, setProfileFiles] = useState(null)

    const onSubmit = (data) => {
        if (profileFiles) {
            console.log(profileFiles)
            const formData = new FormData();
            formData.append("photo", profileFiles);
            formData.append("phone", data.phone);
            formData.append("first_name", data.first_name);
            formData.append("last_name", data.last_name);
            formData.append("date_of_birth", data.date_of_birth);
            formData.append("gender", data.gender);

            useJwt
                .updateAdvisorPhoto(formData)
                .then((res) => {
                    if (res.data.ResponseCode === 0) {
                        console.log(res.data, "7777")
                        dispatch({
                            type: "LOGIN",
                            data: res.data.ResponseResult,
                        });
                        localStorage.setItem("userData", JSON.stringify(res.data.ResponseResult));
                        showToast("success", "successfully saved profile")
                        setTimeout(function () {
                            setEditProfile(false)
                        }, 3000);
                    }
                    else {
                        console.log(res.data.ResponseMessage)
                    }
                })
                .catch((err) => console.log(err));
        } else {
            useJwt
                .updateAdvisorInfo(data)
                .then((res) => {
                    if (res.data.ResponseCode === 0) {
                        console.log(res.data, "66666")
                        showToast("success", "successfully saved profile")
                        localStorage.setItem("userData", JSON.stringify(res.data.ResponseResult));
                        dispatch({
                            type: "LOGIN",
                            data: res.data.ResponseResult,
                        });
                        setTimeout(function () {
                            setEditProfile(false)
                        }, 3000);
                    }
                    else {
                        console.log(res.data.ResponseMessage)
                    }
                })
                .catch((err) => console.log(err));
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
                    setProfileFiles(file.file)
                    setProfileAvatar(fileReader.result)
                }
            }
            fileReader.readAsDataURL(file.file);
        },
    };

    console.log(userData)
    return (
        <Block
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
                    <CircleButton1 onClick={() => setEditProfile(false)}>
                        <IconArrowLeft size={20} stroke={3} />
                    </CircleButton1>
                    <Typography component="p" variant="h4" sx={{ ml: 1, lineHeight: "50px" }}>Profile</Typography>
                </Box>
            </Box>
            <Box>
                <Typography sx={{ pl: 2, pb: 3, pt: 1 }} variant="h1">
                    Edit Profile
                </Typography>
            </Box>
            <form
                onSubmit={handleSubmit(onSubmit)}
                style={{ height: "calc( 100vh - 160px)", overflowY: "auto" }}
                noValidate
            >
                <Grid container spacing={2} sx={{ pl: 2, mt: 3, justifyContent: "center" }}>
                    <Grid item xs={12} sm={12} md={8}>
                        <Typography component="div"
                            sx={{ display: "flex", justifyContent: "center" }}
                        >
                            <Box sx={{ position: "relative" }}>
                                <ClientAvatar
                                    avatar={
                                        profileAvatar ? profileAvatar : userData.photo_url
                                    }
                                    name={userData.full_name !== " " ? userData.full_name : userData.username}
                                    size={80}
                                />
                                <Box sx={{ position: "absolute", right: "-30px", bottom: "0" }}>
                                    <Upload {...props}>
                                        <CircleButton2>
                                            <IconEdit size={20} stroke={2} color='#d5d5d5' />
                                        </CircleButton2>
                                    </Upload>
                                </Box>
                            </Box>

                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={12} md={8}>
                        <Controller
                            control={control}
                            name="phone"
                            defaultValue={userData.phone}
                            rules={{
                                required: true,
                            }}
                            render={({ field, fieldState: { error } }) => (
                                <FormControl
                                    variant="standard"
                                    sx={{ width: "100%" }}
                                    {...field}
                                >
                                    <InputLabel
                                        htmlFor="edit-profile-phone"
                                        shrink={true}
                                        sx={{ color: "white" }}
                                        error={error !== undefined}
                                    >
                                        Phone
                                    </InputLabel>
                                    <Input
                                        id="edit-profile-phone"
                                        placeholder="phone"
                                        defaultValue={userData.phone}
                                        type="text"
                                        error={error !== undefined}
                                    />
                                    {error && (
                                        <FormHelperText error>
                                            there is Required.
                                        </FormHelperText>
                                    )}
                                </FormControl>
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} sm={12} md={8}>
                        <Controller
                            control={control}
                            name="gender"
                            defaultValue={userData.gender}
                            rules={{
                                required: true,
                            }}
                            render={({ field, fieldState: { error } }) => (
                                <FormControl
                                    variant="standard"
                                    sx={{ width: "100%" }}
                                    {...field}
                                >
                                    <InputLabel
                                        htmlFor="edit-profile-gender"
                                        shrink={true}
                                        sx={{ color: "white" }}
                                        error={error !== undefined}
                                    >
                                        Gender
                                    </InputLabel>
                                    <Input
                                        id="edit-profile-gender"
                                        placeholder="gender"
                                        autoComplete="gender"
                                        type="text"
                                        defaultValue={userData.gender}
                                        error={error !== undefined}
                                    />
                                    {error && (
                                        <FormHelperText error>
                                            there is Required.
                                        </FormHelperText>
                                    )}
                                </FormControl>
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} sm={12} md={8}>
                        <Controller
                            control={control}
                            name="first_name"
                            defaultValue={userData.first_name}
                            rules={{
                                required: true,
                            }}
                            render={({ field, fieldState: { error } }) => (
                                <FormControl
                                    variant="standard"
                                    sx={{ width: "100%" }}
                                    {...field}
                                >
                                    <InputLabel
                                        htmlFor="edit-profile-first-name"
                                        shrink={true}
                                        sx={{ color: "white" }}
                                        error={error !== undefined}
                                    >
                                        First Name
                                    </InputLabel>
                                    <Input
                                        id="edit-profile-first-name"
                                        placeholder="first-name"
                                        autoComplete="first-name"
                                        type="text"
                                        defaultValue={userData.first_name}
                                        error={error !== undefined}
                                    />
                                    {error && (
                                        <FormHelperText error>
                                            there is Required.
                                        </FormHelperText>
                                    )}
                                </FormControl>
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} sm={12} md={8}>
                        <Controller
                            control={control}
                            name="last_name"
                            defaultValue={userData.last_name}
                            rules={{
                                required: true,
                            }}
                            render={({ field, fieldState: { error } }) => (
                                <FormControl
                                    variant="standard"
                                    sx={{ width: "100%" }}
                                    {...field}
                                >
                                    <InputLabel
                                        htmlFor="edit-profile-last-name"
                                        shrink={true}
                                        sx={{ color: "white" }}
                                        error={error !== undefined}
                                    >
                                        Last Name
                                    </InputLabel>
                                    <Input
                                        id="edit-profile-last-name"
                                        placeholder="last-name"
                                        autoComplete="last-name"
                                        type="text"
                                        defaultValue={userData.last_name}
                                        error={error !== undefined}
                                    />
                                    {error && (
                                        <FormHelperText error>
                                            there is Required.
                                        </FormHelperText>
                                    )}
                                </FormControl>
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} sm={12} md={8}>
                        <Controller
                            control={control}
                            name="date_of_birth"
                            defaultValue={userData.date_of_birth}
                            rules={{
                                required: true,
                            }}
                            render={({ field, fieldState: { error } }) => (
                                <FormControl
                                    variant="standard"
                                    sx={{ width: "100%" }}
                                    {...field}
                                >
                                    <InputLabel
                                        htmlFor="edit-profile-date-of-birth"
                                        shrink={true}
                                        sx={{ color: "white" }}
                                        error={error !== undefined}
                                    >
                                        Date Of Birth
                                    </InputLabel>
                                    <Input
                                        id="edit-profile-date-of-birth"
                                        placeholder="date-of-birth"
                                        autoComplete="date-of-birth"
                                        type="text"
                                        defaultValue={userData.date_of_birth}
                                        error={error !== undefined}
                                    />
                                    {error && (
                                        <FormHelperText error>
                                            there is Required.
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
        </Block >
    )
}
