import React, { useState } from 'react'
import { Typography, Avatar, } from "@mui/material";
import { useSelector } from "react-redux"
import { EditIcon } from "themes/icons"

import {  IconEdit, IconDotsVertical } from "@tabler/icons";

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
            </Typography>
            <Typography component="div" sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            }}>
                <CircleButton1 onClick={() => chatClick()}>
                    <EditIcon />
                </CircleButton1>
                <CircleButton1 onClick={() => settingsClick()} sx={{ ml: 1 }}>
                    <IconDotsVertical size={25} stroke={2} color='#d5d5d5' />
                </CircleButton1>
            </Typography>
        </>
    )
}
