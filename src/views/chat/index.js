import React, { useEffect, lazy, useContext, useMemo } from "react";
import { Alert, Grid, Box } from "@mui/material";
import Loadable from "@/ui-component/Loadable";
import HiddenBox from "./HiddenBox"
import { SocketContext } from "@/utils/context/SocketContext";
import { useDispatch, useSelector } from "react-redux";
import { getMessages } from "@/store/actions/messages";
import { getAllUsers } from "@/store/actions/user"

const Contacts = Loadable(lazy(() => import('./contacts')));
const Conversation = Loadable(lazy(() => import('./conversation')));

//Main Component
const Chat = () => {
  const loadOnlineList = useContext(SocketContext).loadOnlineList;
  const selectedRoom = useSelector((state) => state.room.selectedRoom);
  const storeRooms = useSelector((state) => state.room.rooms);
  const socketConnection = useSelector((state) => state.users.socketConnection);
  const dispatch = useDispatch();

  useEffect(() => {
    loadOnlineList();
    dispatch(getAllUsers());
  }, [dispatch, loadOnlineList]);

  const unreadRoomIds = useMemo(() => {
    return storeRooms.filter(item => item.unread_count).map(item => item.id)
  }, [storeRooms])

  useEffect(() => {
    if (socketConnection && selectedRoom.id) {
      dispatch(getMessages({ id: selectedRoom.id }))
      unreadRoomIds.forEach(id => dispatch(getMessages({ id })))
    }
  }, [socketConnection, dispatch, selectedRoom?.id, unreadRoomIds])
  return (
    <>
      <Grid container
        sx={{
          height: { xs: "100%", md: "100vh" }, p: { xs: 0, md: 2 }, overflowY: "hidden",  position: "relative",
        }}>
        <Contacts />
        <Conversation />
      </Grid>
      <Box sx={{ width: "100%", position: 'fixed', top: 80, display: socketConnection ? 'flex' : 'none', justifyContent: 'center', alignContent: 'center' }}>
        <Alert severity='error'>
          Network error, please check the network
        </Alert>
      </Box>

      <HiddenBox />
    </>
  );
};

export default Chat;
