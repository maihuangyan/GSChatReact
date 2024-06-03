import { useEffect, lazy, useContext } from "react";
import { Grid } from "@mui/material";
import Loadable from "ui-component/Loadable";
import HiddenBox from "./HiddenBox"
import { SocketContext } from "utils/context/SocketContext";

const Contacts = Loadable(lazy(() => import('./contacts')));
const Conversation = Loadable(lazy(() => import('./conversation')));

//Main Component
const Chat = () => {
  const loadRoomData = useContext(SocketContext).loadRoomData;
  const loadOnlineList = useContext(SocketContext).loadOnlineList;

  useEffect(() => {
    loadOnlineList()
    loadRoomData()
    setInterval(() => {
      loadOnlineList()
      let tokenOverdueTime = localStorage.getItem('tokenOverdueTime')
      console.log(tokenOverdueTime, 'loadOnlineList')
    }, 5 * 60 * 1000)
  }, [])
  
  // console.log("Chat")
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

      <HiddenBox />
    </>
  );
};

export default Chat;
