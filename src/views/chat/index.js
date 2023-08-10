import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Grid } from "@mui/material";
import useJwt from "utils/jwt/useJwt";

import Contacts from "./contacts";
import Conversation from "./conversation";

// import { getLocalStorageUsage } from "utils/common";

//Main Component
const Chat = (props) => {
  const selectedRoom = useSelector((state) => state.room.selectedRoom);
  const [roomTab, setRoomTab] = useState(false)
  useEffect(() => {
    if (selectedRoom.id) {
      setRoomTab(true)
    } else {
      setRoomTab(false)
    }
  }, [roomTab, selectedRoom])

  // useEffect(() => {
  //   // getLocalStorageUsage();
  //   // load chat messages
  //   // const selectedChat = { ...store.selectedChat };
  //   // console.log('selectChatRoomID', store.selectChatRoomID)
  //   // dispatch(getChatContacts(selectedChat, store.selectChatRoomID));
  // }, [store.selectChatRoomID]);.allMessage

  return (
    <>
      <Grid container
        sx={{
          height: "calc( 100vh )", p: 2, overflowY: "hidden", margin: "0 auto", width: "auto", "@media (min-width: 1500px)": {
            width: "1500px",
          },
        }}>
        <Grid item xs={12} sm={12} md={3} sx={{
          backgroundColor: "#101010",
          height: "100%",
          "@media (max-width: 900px)": {
            display: roomTab ? "none" : "block",
          },
          "@media (min-width: 900px)": {
            borderRight: "1px solid #383838 ",
          }
        }}>
          <Contacts />
        </Grid>
        <Grid
          item
          xs={12}
          sm={12}
          md={9}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            backgroundColor: "#101010",
            "@media (max-width: 900px)": {
              display: roomTab ? "flex" : "none",
            }
          }}
        >
          <Conversation />
        </Grid>
      </Grid >
    </>
  );
};

export default Chat;
