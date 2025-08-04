import React, { useContext, useEffect, useState } from 'react'
import {
    Box,
    Grid,
    Button,
    Typography,
    TextField,
} from "@mui/material";
import { Upload } from 'antd';
import { useForm, Controller } from "react-hook-form";
import { IconArrowLeft, IconEdit, IconCheck } from "@tabler/icons";
import { styled, useTheme } from "@mui/material/styles";
import { orange } from "@mui/material/colors";
import useJwt from "@/utils/jwt/useJwt";
import ClientAvatar from "@/ui-component/ClientAvatar";
import { useSelector, useDispatch } from "react-redux"
import { getUserDisplayName } from '@/utils/common';
import { LoaderContext } from "@/utils/context/ProgressLoader";
import { selectRoom, getRoomList } from "@/store/actions/room"
import { useNavigate } from 'react-router-dom';
import { getAllUsers } from "@/store/actions/user"

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

const CircleButton1 = styled(Button)(({ theme }) => ({
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

export default function Information() {

    const theme = useTheme();
    const userData = useSelector((state) => state.auth.userData);
    const selectedRoom = useSelector((state) => state.room.selectedRoom);
    const allUsers = useSelector((state) => state.users.all_users);
    const showToast = useContext(LoaderContext).showToast

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [groupAvatar, setGroupAvatar] = useState("")
    const [groupFiles, setGroupFiles] = useState(null)
    const [opponent_ids, setOpponent_ids] = useState([])
    const [Room_Member, setRoom_Member] = useState([])
    const [roomName, setRoomName] = useState("")
    
    const { control, handleSubmit } = useForm({
        reValidateMode: "onBlur",
    });

    const [isCreator, setIsCreator] = useState(false)
    const [filterAllUsers, setFilterAllUsers] = useState([])
    const [selectUser, setSelectUser] = useState([])

    const handleCreator = () => {
        if (userData.id === selectedRoom.room_users[0].user_id) {
            setIsCreator(true)
        } else {
            setIsCreator(false)
        }
    }

    useEffect(() => {
        setSelectUser([])
        setRoomName(selectedRoom.name)
        handleCreator()
        const opponentsUsers = selectedRoom.opponents.map(item => item.id)
        setOpponent_ids(opponentsUsers)
        dispatch(getAllUsers())

        const uniqueRoom = Object.values(
            selectedRoom.opponents.reduce((acc, obj) => {
              acc[obj.id] = obj; 
              return acc;
            }, {})
          );
          setRoom_Member(uniqueRoom)
    }, [selectedRoom])

    useEffect(() => {
        const map = new Map();
        if (allUsers.length) {
            allUsers.filter(item => !map.has(item.id) && map.set(item.id, item));
            selectedRoom.opponents.forEach(ele => {
                if (map.has(ele.id)) {
                    map.delete(ele.id)
                }
            })
            let handleFilterAllUsers = []
            map.forEach((item) => {
                handleFilterAllUsers.push(item)
            })
            setFilterAllUsers(handleFilterAllUsers.filter(item => item.id !== userData.id))
        }
    }, [allUsers])


    const onSubmit = () => {
        // console.log(opponent_ids.concat(selectUser).join(","))
        if (groupFiles) {
            const formData = new FormData();
            formData.append("name", roomName);
            formData.append("room_id", selectedRoom.id);
            formData.append("opponent_ids", opponent_ids.concat(selectUser).join(","));
            formData.append("photo", groupFiles);
            useJwt
                .updateRoomWithImg(formData)
                .then((res) => {
                    if (res.data.ResponseCode === 0) {
                        console.log(res.data, "7777")
                        const data = { ...res.data.ResponseResult, group: 1 }
                        navigate("/chat")
                        dispatch(selectRoom(data));
                        dispatch(getRoomList());
                        handleCreator()
                    }
                    else {
                        console.log(res.data.ResponseMessage)
                    }
                })
                .catch((err) => console.log(err));
        } else {
            useJwt
                .updateRoom({ name: roomName, opponent_ids: opponent_ids.concat(selectUser).join(","), room_id: selectedRoom.id })
                .then((res) => {
                    if (res.data.ResponseCode === 0) {
                        console.log(res.data, "7777")
                        const data = { ...res.data.ResponseResult, group: 1 }
                        dispatch(selectRoom(data));
                        dispatch(getRoomList());
                        navigate("/chat")
                        handleCreator()
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
                    setGroupFiles(file.file)
                    setGroupAvatar(fileReader.result)
                }
            }
            fileReader.readAsDataURL(file.file);
        },
    };

    const deleteIds = (id) => {
        const isHaveId = opponent_ids.filter(item => item === id)
        if (isHaveId.length) {
            const delete_Id = opponent_ids.filter(item => item !== id)
            setOpponent_ids(delete_Id)
        } else {
            setOpponent_ids([...opponent_ids, id])
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
                    <CircleButton1 onClick={() => navigate("/chat")}>
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
                            Room_Member.map(item => {
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
                                            avatar={item.photo_url ? item.photo_url : ""}
                                            size={40}
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
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}>
                                        <Box sx={{
                                            display: opponent_ids.includes(item.id) ? "none" : "flex",
                                            p: 1,
                                        }}>
                                            <IconCheck size={20} stroke={3} color={theme.palette.primary.main} />
                                        </Box>
                                        <Box sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            background: opponent_ids.includes(item.id) ? theme.palette.primary.main : "#fff",
                                            p: 1,
                                            mr: 2,
                                            cursor: "pointer",
                                            borderRadius: "16px",
                                            color: "#000"
                                        }} onClick={() => deleteIds(item.id)}>
                                            delete
                                        </Box>
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
                                        avatar={groupAvatar ? groupAvatar : selectedRoom.photo_url}
                                        size={80}
                                        name={selectedRoom.name}
                                    />
                                    {isCreator && <Box sx={{ position: "absolute", right: "-30px", bottom: "0" }}>
                                        <Upload {...props}>
                                            <CircleButton2>
                                                <IconEdit size={20} stroke={2} color='#d5d5d5' />
                                            </CircleButton2>
                                        </Upload>
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
                                                defaultValue={roomName}
                                                rules={{
                                                    required: false,
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
                                                        value={roomName}
                                                        placeholder={roomName}
                                                        autoComplete="name"
                                                        InputLabelProps={{ shrink: true, sx: { mb: 3 } }}
                                                        onChange={(e) => setRoomName(e.target.value)}
                                                        error={error !== undefined}
                                                    />
                                                )}
                                            />
                                        </Box>
                                        {isCreator && <Box sx={{ px: 3, mt: 1 }}>
                                            Add Member:
                                            {
                                                filterAllUsers.map(item => {
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
                                        </Box>}
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
