import React, { useState } from 'react'
import { Typography, Avatar, } from "@mui/material";
import { useSelector } from "react-redux"

import {  IconEdit, IconDotsVertical, IconLayoutSidebar } from "@tabler/icons";

export default function UserAvatar({ CircleButton1, theme, setIsChatClick, setIsSettingClick }) {

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
                pl: 2,
            }}>
                <IconLayoutSidebar size={25} stroke={2} color='#d5d5d5' />
                {/* <Avatar
                    src={userData.avatar_url}
                    sx={{
                        ...theme.typography.mediumAvatar,
                        margin: "8px !important",
                        width: "40px",
                        height: "40px",
                    }}
                    alt={userData.fullName}
                    color="inherit"
                /> */}
            </Typography>
            <Typography component="div" sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            }}>
                <CircleButton1 onClick={() => chatClick()}>
                    <IconEdit size={25} stroke={2} color='#d5d5d5' />
                </CircleButton1>
                <CircleButton1 onClick={() => settingsClick()} sx={{ ml: 1 }}>
                    <IconDotsVertical size={25} stroke={2} color='#d5d5d5' />
                </CircleButton1>
            </Typography>
        </>
    )
}
