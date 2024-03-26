import { useEffect, useState, useContext, lazy, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Grid } from "@mui/material";
import mp from "../../assets/sound1.mp3"
import ReactPlayer from "react-player";
import { SocketContext } from "utils/context/SocketContext";
import SearchUser from "./contacts/SearchUser";
import Settings from "./contacts/Settings";
import 'animate.css';
import Loadable from "ui-component/Loadable";
import { Outlet } from "react-router-dom";
import AdaptiveImage from "ui-component/AdaptiveImage";

const Contacts = Loadable(lazy(() => import('./contacts')));
const Conversation = Loadable(lazy(() => import('./conversation')));

//Main Component
const Chat = (props) => {
  const soundPlayers = useContext(SocketContext).soundPlayers
  const selectedRoom = useSelector((state) => state.room.selectedRoom);
  const rooms = useSelector((state) => state.room.rooms);
  const [roomTab, setRoomTab] = useState(false)
  const [isChatClick, setIsChatClick] = useState(false);
  const [isSettingClick, setIsSettingClick] = useState(false);

  useEffect(() => {
    if (selectedRoom.id) {
      setRoomTab(true)
    } else {
      setRoomTab(false)
    }
  }, [roomTab, selectedRoom])

  useEffect(() => {
    if (soundPlayers) {
      chatAudio()
    }
  }, [soundPlayers])

  function chatAudio() {
    (function (argument) {
      let src = mp;
      let audio = new Audio();
      let playPromise;
      audio.src = src;
      playPromise = audio.play();
      if (playPromise) {
        playPromise.then(() => {
          setTimeout(() => {
            // console.log("done.") 
          }, audio.duration * 1000);
        }).catch((e) => { });
      }
    })();
  }

  return (
    <>
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
          <Contacts setIsChatClick={setIsChatClick} setIsSettingClick={setIsSettingClick} />
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
          <Outlet />
          <Conversation />
        </Grid>
        {
          isChatClick && <SearchUser setIsChatClick={setIsChatClick} />
        }
        {
          isSettingClick && <Settings setIsSettingClick={setIsSettingClick} />
        }
      </Grid >
    </>
  );
};

export default Chat;
