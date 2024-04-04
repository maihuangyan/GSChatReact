import { useEffect, useState, useContext, lazy, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Grid } from "@mui/material";
import mp from "../../assets/sound1.mp3"
import SearchUser from "./contacts/SearchUser";
import Settings from "./contacts/Settings";
import 'animate.css';
import Loadable from "ui-component/Loadable";
import { Outlet } from "react-router-dom";

import { audioMessages } from "store/actions/messages"

const Contacts = Loadable(lazy(() => import('./contacts')));
const Conversation = Loadable(lazy(() => import('./conversation')));

//Main Component
const Chat = (props) => {
  const soundPlayers = useSelector((state) => state.messages.receiveMessage);
  const selectedRoom = useSelector((state) => state.room.selectedRoom);
  const [roomTab, setRoomTab] = useState(false)
  const [isChatClick, setIsChatClick] = useState(false);
  const [isSettingClick, setIsSettingClick] = useState(false);

  const dispatch = useDispatch()

  useEffect(() => {
    if (selectedRoom.id) {
      setRoomTab(true)
    } else {
      setRoomTab(false)
    }
  }, [roomTab, selectedRoom])


  useEffect(() => {
    setInterval(() => {
      if (soundPlayers.length > 0) {
        playMusic()
      }
    }, 100)
  }, [])

  const handleAudioEnded = () => {
    dispatch(audioMessages())
  };

  const playMusic = () => {
    const audioElement = document.querySelector('#chatAudio');
    if (audioElement) {
      let promise = audioElement.play()
      if (promise) {
        promise.then(res => {
          audioElement.addEventListener('ended', handleAudioEnded);
        }).catch((e) => { })
      }
    }
  };

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

      <div hidden>
        <audio id='chatAudio' src={mp} />
      </div>

    </>
  );
};

export default Chat;
