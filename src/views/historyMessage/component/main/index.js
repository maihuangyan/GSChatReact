import React, { useEffect } from 'react'
import {
  Box,
  Typography,
  Grid,
  Button
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { IconArrowForwardUp, IconDownload } from "@tabler/icons";
import MessageImage from "@/ui-component/MessageImage";
import ReactPlayer from "react-player";
import { useSelector, useDispatch } from 'react-redux';
import { getUserDisplayName, getSeenStatus } from '@/utils/common';
import useJwt from "@/utils/jwt/useJwt";
import ClientAvatar from "@/ui-component/ClientAvatar";
import { getAllUsers } from "@/store/actions/user"

export default function HistoryMain({ searchMessage, query }) {

  const theme = useTheme();
  const dispatch = useDispatch()
  const selectedRoom = useSelector((state) => state.room.selectedRoom);
  const allUser = useSelector((state) => state.users.all_users);

  const imageType = (message) => {
    const fileName = message?.files[0]?.origin_file_name;
    const ext = fileName?.split(".").pop()?.toLowerCase();
    return ["jpeg", "jpg", "png", "webp", "gif"].includes(ext);
  };

  const imageSize = (imgInfo, size) => {
    switch (size) {
      case "xs":
        return imgInfo?.height * (200 / imgInfo?.width).toFixed(4) || 0;
      case "sm":
        return imgInfo?.height * (300 / imgInfo?.width).toFixed(4) || 0;
      case "md":
        return imgInfo?.height * (450 / imgInfo?.width).toFixed(3) || 0;
      default:
        break;
    }
  }

  const filesType = (files) => {

    const file = files[0].origin_file_name.split('.').pop().toLowerCase();

    const videoExtensions = ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm', 'm4v', 'ts'];
    const audioExtensions = ['mp3', 'wav', 'aac', 'flac', 'ogg', 'alac', 'aiff', 'amr'];

    if (videoExtensions.includes(file)) {
      return "video"
    } else if (audioExtensions.includes(file)) {
      return "radio"
    } else {
      return "word"
    }
  }

  const getUserAvatar = (id) => {

    const user = allUser.find((user) => user.id === id);

    return user ? user.photo_url : undefined;
  };

  useEffect(() => {
    // console.log("message", selectedRoom)

    dispatch(getAllUsers())
  }, [dispatch, searchMessage])

  const TimeSeperator = ({ content, message }) => {
    const theme = useTheme();
    return (
      <Box sx={{ m: 0, textAlign: "left" }}>
        <Typography
          variant="span"
          color={theme.palette.text.icon}
          sx={{ verticalAlign: "text-bottom", fontSize: "12px" }}
        >
          {
            selectedRoom.group ? <Typography variant="span" sx={{ textTransform: "capitalize" }}>{!isMyself(message) ? message.username : ""}</Typography> : ""
          } {content}
        </Typography>
      </Box>
    );
  };

  const formatDateToIsToday = (timestamp) => {
    const time = new Date(timestamp * 1000);
    const now = new Date();

    const isSameDay =
      time.getFullYear() === now.getFullYear() &&
      time.getMonth() === now.getMonth() &&
      time.getDate() === now.getDate();

    if (isSameDay) {
      const hours = time.getHours() < 10 ? '0' + time.getHours() : '' + time.getHours();
      const minutes = time.getMinutes() < 10 ? '0' + time.getMinutes() : '' + time.getMinutes();
      return `${hours}:${minutes}`;
    }

    const isSameYear = time.getFullYear() === now.getFullYear();

    const day = time.getDate() < 10 ? '0' + time.getDate() : '' + time.getDate();
    const month = time.getMonth() + 1 < 10 ? '0' + (time.getMonth() + 1) : '' + (time.getMonth() + 1);

    if (isSameYear) {
      return `${day}-${month}`;
    }

    const year = time.getFullYear();
    return `${day}-${month}-${year}`;
  }

  const isMyself = (message) => {
    return message.user_id === Number(useJwt.getUserID());
  }

  const HandleTips = () => {
    return (<Box sx={{ display: "flex", justifyContent: "center", width: "100%", height: '100%', alignItems: "center", fontSize: { xs: '18px', md: '20px' } }}>{query.length ? `No results found for ' ${query} '` : 'Quickly search chat content'}</Box>)
  }


  return <Box sx={{ overflowY: "scroll", height: "calc(100vh - 100px)" }}>

    {searchMessage.length ? searchMessage.map((message) =>
      <Box sx={{ display: "flex", justifyContent: "flex-start", "&:hover .down": { opacity: 1 } }} key={message.id}>
        <Typography
          component="div"
          color={theme.palette.text.black}
          sx={{
            background: isMyself(message) ? theme.palette.primary.main : theme.palette.text.disabled, p: "5px", borderRadius: 1 ? "6px 6px 0 6px" : "6px", mt: 4, mr: 2, ml: { xs: 11, md: 12 }, minWidth: "60px",
            paddingRight: message.type === 1 || message.reply_on || message.type === 2 ? '5px' : '18px',
            position: "relative",
            wordBreak: "break-all",
          }}>
          {message.type === 0 ? (
            <Grid>
              <Grid item>
                {message.reply_on ? <Box sx={{ p: "4px 18px 4px 4px", background: "#b5b5b5", borderRadius: "3px", mb: 1, cursor: "pointer" }}>
                  <Typography component="div" sx={{ borderLeft: isMyself(message) ? "2px solid #FBC34A" : "2px solid #000", p: "2px 4px" }} >
                    <Grid>
                      <Grid item>{message.reply_on_message?.username}</Grid>
                      <Grid item><Typography variant='body2'>{message.reply_on_message?.type === 0 ? message.reply_on_message?.message : (message.reply_on_message?.type === 1 ? "image" : (message.reply_on_message?.type === 2 ? "file" : message.reply_on_message?.forward_message.message))}</Typography></Grid>
                    </Grid>
                  </Typography>
                </Box> : ""}
              </Grid>
              <Grid item>
                <Typography variant="body1" sx={{ p: "2px 8px" }} style={{ whiteSpace: 'break-spaces' }}>
                  {message.message}
                </Typography>
              </Grid>
            </Grid>
          ) : ((message.files && message.files.length > 0) ? (
            (imageType(message) || message.type === 1) ?
              (
                <Box>
                  <Box sx={{
                    cursor: "pointer", maxWidth: {
                      xs: "200px",
                      sm: "300px",
                      md: "450px",
                    }, height: {
                      xs: imageSize(message.files[0], "xs") + "px",
                      sm: imageSize(message.files[0], "sm") + "px",
                      md: imageSize(message.files[0], "md") + "px",
                    }
                  }} >
                    <MessageImage imageInfo={message?.files[0]} /></Box>
                  <Typography variant="body1" sx={{ p: "2px 8px", whiteSpace: 'break-spaces', paddingTop: message.description ? '5px' : '0px', maxWidth: "450px", }}>
                    {message.description ? message.description : ''}
                  </Typography>
                </Box>) : (
                <Box>
                  {
                    filesType(message.files) === "word" ? (
                      <Typography component="div" sx={{ p: "2px 4px" }}>
                        <form method="get" action={message.files[0].thumbnail} >
                          <Button type="submit" sx={{ p: "8px 16px", color: '#000', fontWeight: 400, background: "#b5b5b5", borderRadius: "6px" }}>
                            <IconDownload size={20} stroke={2} />
                            {message.files[0].origin_file_name}</Button>
                        </form></Typography>) : (<ReactPlayer
                          url={message.files[0].thumbnail}
                          controls
                          className={filesType(message.files) === "radio" ? "player-mp3" : "player"}
                        />)
                  }
                </Box>
              )
          ) : (message.type === 3 ? (
            <Grid>
              <Grid item>
                {message.forward_message ? <Box sx={{ p: "4px 2px", borderRadius: "3px", mb: 1, display: "flex" }}>
                  <IconArrowForwardUp size={20} stroke={2} color='#fff' />
                  <Typography component='div' color='#fff' sx={{ ml: "3px" }}>
                    {message.forward_message?.username}
                  </Typography>
                </Box> : ""}
              </Grid>
              <Grid item>
                {
                  message.forward_message.type === 0 ?
                    (<Typography variant="body1" sx={{ p: "0 8px" }}>
                      {message?.forward_message.message}
                    </Typography>)
                    :
                    (<Box sx={{
                      cursor: "pointer", maxWidth: {
                        xs: "200px",
                        sm: "300px",
                        md: "450px",
                      }, height: {
                        xs: imageSize(message.forward_message?.files[0], "xs") + "px",
                        sm: imageSize(message.forward_message?.files[0], "sm") + "px",
                        md: imageSize(message.forward_message?.files[0], "md") + "px",
                      }
                    }} >
                      <MessageImage imageInfo={message.forward_message?.files[0]} />
                      <Typography variant="body1" sx={{ p: "2px 8px", whiteSpace: 'break-spaces', paddingTop: message.description ? '5px' : '0px', maxWidth: "450px" }} >
                        {message.description ? message.description : ''}
                      </Typography>
                    </Box>)
                }
              </Grid>
            </Grid>
          ) : "")
          )}
          <Typography component="div" variant={"positionLeft"} sx={{ color: theme.palette.text.icon, minWidth: "150px" }}>
            <TimeSeperator content={getSeenStatus(message, selectedRoom) + formatDateToIsToday(message.updated_at)} message={message} />
          </Typography>
          <Typography component="div" variant={"positionLeft1"}>
            <ClientAvatar
              avatar={getUserAvatar(message.user_id)}
              size={35}
              name={message.user ? getUserDisplayName(message.user) : message.username}
            />
          </Typography>
        </Typography>
      </Box>
    ) : (<HandleTips />)}
  </Box>
}
