import React, { memo } from 'react'
import { Typography, } from "@mui/material";
import { EditIcon } from "themes/icons"
import { styled } from "@mui/material/styles";
import {
    Button,
} from "@mui/material";
import {  IconDotsVertical } from "@tabler/icons";
import { useNavigate } from 'react-router-dom';

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

function UserAvatar() {
    const navigate = useNavigate()
    const toSearchUser = () => {
        navigate("/searchUser")
    }
    const toSettings = () => {
        navigate("/settings")
    }
    return (
        <>
            <Typography component="div" sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                pl: 2,
            }}>
            </Typography>
            <Typography component="div" sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            }}>
                <CircleButton1 onClick={toSearchUser} sx={{p:"5px 5px 7px 7px"}}>
                    <EditIcon size={25} stroke={1} />
                </CircleButton1>
                <CircleButton1 onClick={toSettings} sx={{ ml: 1 }}>
                    <IconDotsVertical size={25} stroke={1} />
                </CircleButton1>
            </Typography>
        </>
    )
}
export default memo(UserAvatar)