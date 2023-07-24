import React, { useState } from 'react'
import { Typography, Avatar, } from "@mui/material";
import { useSelector } from "react-redux"

import { IconMessage, IconSettings } from "@tabler/icons";


export default function UserAvatar({ CircleButton1, theme ,setIsChatClick ,setIsSettingClick }) {

    const userData = useSelector((state) => state.auth.userData);

    const chatClick = () => {
        setIsChatClick(true)
    }
    const settingsClick = () => {
        setIsSettingClick(true)
    }

    return (
        <>
            <Typography component="div" sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            }}>
                <Avatar
                    src={userData.avatar_url}
                    sx={{
                        ...theme.typography.mediumAvatar,
                        margin: "8px !important",
                        width: "40px",
                        height: "40px",
                    }}
                    alt={userData.fullName}
                    color="inherit"
                />
                <Typography component="p" variant="h3">{userData.username}</Typography>
            </Typography>
            <Typography component="div" sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            }}>
                <CircleButton1 onClick={() => chatClick()}>
                    <IconMessage size={20} stroke={2} />
                </CircleButton1>
                <CircleButton1 onClick={() => settingsClick()} sx={{ ml: 1 }}>
                    <IconSettings size={20} stroke={2} />
                </CircleButton1>
            </Typography>
        </>
    )
}
