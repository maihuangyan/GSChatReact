import React, { memo, useEffect } from 'react'
import Favicon from "react-favicon";
import favicon from "assets/images/favicon.png"
import mp from "assets/sound1.mp3"
import { useSelector, useDispatch } from "react-redux";
import { audioMessages, closeNotifyMessage } from "store/actions/messages"

const HiddenBox = () => {
  const unreadCount = useSelector((state) => state.room.unreadCount);
  const receiveMessage = useSelector((state) => state.messages.receiveMessage);
  const notifyMessage = useSelector((state) => state.messages.notifyMessage);
  const dispatch = useDispatch()

  useEffect(() => {
    let time;
    if (receiveMessage.length > 0) {
      time = setInterval(() => {
        if (receiveMessage.length > 0) {
          playMusic()
        }
      }, 100)
    } else {
      clearInterval(time)
    }
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


  useEffect(() => {
    if (navigator.setAppBadge) {
      if (unreadCount > 0) {
        navigator.setAppBadge(unreadCount)
      } else {
        navigator.clearAppBadge()
      }
    }
  }, [unreadCount])

  function notifyMe() {
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notification");
    } else if (Notification.permission === "granted") {
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
          let notification = new Notification(`${notifyMessage.username} : ${notifyMessage.message} `, {
            tag: "GSChat",
            renotify: true,
          })
          setTimeout(() => {
            notification.close();
            dispatch(closeNotifyMessage())
          }, 5000)
        } else {
          let notification = new Notification(`${notifyMessage.username} : ${notifyMessage.message} `, {
            tag: "GSChat",
            renotify: true,
          })
          notification.close();
          dispatch(closeNotifyMessage())
        }
      })

    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          let notification;
          document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "hidden") {
              notification = new Notification(`${notifyMessage.username} : ${notifyMessage.message} `, {
                tag: "GSChat",
                renotify: true,
              })
              console.log(notifyMessage, "okok");
              setTimeout(() => {
                notification.close();
                dispatch(closeNotifyMessage())
              }, 5000)
            } else {
              notification.close();
              dispatch(closeNotifyMessage())
            }
          })
        }
      });
    }
  }
  useEffect(() => {
    if (Object.keys(notifyMessage).length) {
      notifyMe()
    }
  }, [notifyMessage])
  return (
    <>
      <div hidden>
        <audio id='chatAudio' src={mp} />
      </div>
      <Favicon url={favicon} animated alertCount={unreadCount} alertFillColor="#FBC34A" alertTextColor="#010101" />
    </>
  )
}

export default memo(HiddenBox)
