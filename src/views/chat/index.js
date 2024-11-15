import { useEffect, lazy, useContext } from "react";
import { Alert, Grid, Box } from "@mui/material";
import Loadable from "ui-component/Loadable";
import HiddenBox from "./HiddenBox"
import { SocketContext } from "utils/context/SocketContext";
import { useDispatch, useSelector } from "react-redux";
import { getMessages } from "store/actions/messages";

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
    loadOnlineList()
    setInterval(() => {
      loadOnlineList()
      let tokenOverdueTime = localStorage.getItem('tokenOverdueTime')
      console.log(tokenOverdueTime, 'loadOnlineList')
    }, 10 * 60 * 1000)
  }, [])
  // console.log(socket)
  useEffect(() => {
    if (socketConnection && selectedRoom.id) {
      dispatch(getMessages({ id: selectedRoom.id }))
      storeRooms.forEach((item, index) => {
        if (item.unread_count) {
          dispatch(getMessages({ id: item.id }))
        }
      })
    }
  }, [socketConnection])
  return (
    <>
      <Grid container
        sx={{
          height: "calc( 100vh )", p: 2, overflowY: "hidden", margin: "0 auto", width: "auto", position: "relative",
          "@media (min-width: 1500px)": {
            width: "1500px",
          },
        }}>
        <Contacts />
        <Conversation />
      </Grid>
      <Box sx={{ width: "100%", position: 'fixed', top: 80, display: !socketConnection ? 'flex' : 'none', justifyContent: 'center', alignContent: 'center' }}>
        <Alert severity='error'>
          Network error, please check the network
        </Alert>
      </Box>

      <HiddenBox />
    </>
  );
};

export default Chat;
