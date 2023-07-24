import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
// import { getChatContacts } from "store/actions/chat";
import { Grid } from "@mui/material";
import useJwt from "utils/jwt/useJwt";

import Contacts from "./contacts";
import Conversation from "./conversation";
// import { getLocalStorageUsage } from "utils/common";

//Main Component
const Chat = (props) => {
  const dispatch = useDispatch();
  const store = useSelector((state) => state.room);
  const message = useSelector((state) => state.messages.messages);

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
        sx={{ height: "calc( 100vh )", p: 3, overflowY: "hidden" }}>
        <Grid item xs={12} sm={12} md={4}>
          <Contacts store={store} />
        </Grid>
        <Grid
          item
          xs={12}
          sm={12}
          md={8}
          sx={{
            pb: 3,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Conversation
            store={store}
            message={message}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default Chat;
