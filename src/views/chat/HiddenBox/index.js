import React, { memo, useEffect, useState, useCallback } from "react";
import Favicon from "react-favicon";
import favicon from "@/assets/images/favicon.png";
import mp from "@/assets/sound2.mp3";
import { useSelector, useDispatch } from "react-redux";
import { audioMessages, closeNotifyMessage } from "@/store/actions/messages";

const HiddenBox = () => {
  const unreadCount = useSelector((state) => state.room.unreadCount);
  const receiveMessage = useSelector((state) => state.messages.receiveMessage);
  const notifyMessage = useSelector((state) => state.messages.notifyMessage);
  const dispatch = useDispatch();

  const handleAudioEnded = useCallback(() => {
    dispatch(audioMessages());
  }, [dispatch]);

  const playMusic = useCallback(() => {
    const audioElement = document.querySelector("#chatAudio");
    if (audioElement) {
      const promise = audioElement.play();
      if (promise) {
        promise
          .then(() => {
            audioElement.addEventListener("ended", handleAudioEnded);
          })
          .catch(() => {});
      }
    }
  }, [handleAudioEnded]);

  useEffect(() => {
    if (receiveMessage.length > 0) {
      playMusic();
      console.log(receiveMessage, "666");
    }

    const intervalId = setInterval(() => {
      if (receiveMessage.length > 0) {
        playMusic();
        console.log(receiveMessage, "666");
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [receiveMessage, playMusic]);

  useEffect(() => {
    if (navigator.setAppBadge) {
      if (unreadCount > 0) {
        navigator.setAppBadge(unreadCount);
      } else {
        navigator.clearAppBadge();
      }
    }
  }, [unreadCount]);

  const [visibilityState, setVisibilityState] = useState(null);

  useEffect(() => {
    setVisibilityState(document.visibilityState);
    const handleVisibilityChange = () => {
      setVisibilityState(document.visibilityState);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const notifyMe = useCallback(() => {
    const handleMessage = notifyMessage.type
      ? notifyMessage.type === 1
        ? `${notifyMessage.username} : image`
        : `${notifyMessage.username} : file`
      : `${notifyMessage.username} : ${notifyMessage.message}`;
  
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notification");
    } else if (Notification.permission === "granted") {
      if (visibilityState !== "visible") {
        new Notification(handleMessage, {
          tag: "GSChat",
          renotify: true,
        });
        setTimeout(() => {
          dispatch(closeNotifyMessage());
        }, 2000);
      } else {
        dispatch(closeNotifyMessage());
      }
    } else if (Notification.permission === "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          if (visibilityState !== "visible") {
            new Notification(handleMessage, {
              tag: "GSChat",
              renotify: true,
            });
            setTimeout(() => {
              dispatch(closeNotifyMessage());
            }, 2000);
          } else {
            dispatch(closeNotifyMessage());
          }
        }
      });
    }
  }, [notifyMessage, visibilityState, dispatch]);

  useEffect(() => {
    if (Object.keys(notifyMessage).length) {
      notifyMe();
    }
  }, [notifyMessage, notifyMe]);

  return (
    <>
      <div hidden>
        <audio id="chatAudio" src={mp} />
      </div>
      <Favicon
        url={favicon}
        animated
        alertCount={unreadCount}
        alertFillColor="#FBC34A"
        alertTextColor="#010101"
        iconSize={16}
        animationDelay={500}
        keepIconLink={() => false}
        renderOverlay={null}
      />
    </>
  );
};

export default memo(HiddenBox);