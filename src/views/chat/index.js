import { useEffect, useState, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Grid } from "@mui/material";
import Contacts from "./contacts";
import Conversation from "./conversation";
import mp from "../../assets/sound.mp3"
import ReactPlayer from "react-player";
import { SocketContext } from "utils/context/SocketContext";
import SearchUser from "./contacts/SearchUser";


//Main Component
const Chat = (props) => {
  const soundPlayers = useContext(SocketContext).soundPlayers
  const selectedRoom = useSelector((state) => state.room.selectedRoom);
  const [roomTab, setRoomTab] = useState(false)
  const [isChatClick, setIsChatClick] = useState(false);

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
      <ReactPlayer
        playing={soundPlayers}
        url={mp}
        controls
        className="sound"
      />
      <Grid container
        sx={{
          height: "calc( 100vh )", p: 2, overflowY: "hidden", margin: "0 auto", width: "auto", position: "relative",
          "@media (min-width: 1500px)": {
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
          <Contacts setIsChatClick={setIsChatClick} isChatClick={isChatClick} />
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
        {
          isChatClick && <SearchUser setIsChatClick={setIsChatClick} />
        }
      </Grid >
    </>
  );
};

export default Chat;
