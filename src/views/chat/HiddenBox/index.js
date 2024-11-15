import React, { memo, useEffect, useState } from 'react'
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
    let time = setInterval(() => {
      if (receiveMessage.length > 0) {
        playMusic()
      // console.log("666")
      }
    }, 1000)

    return () => {
      if (time) {
        clearInterval(time)
      }
    }
  }, [receiveMessage])

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

  const [visibilityState, setVisibilityState] = useState(null)

  useEffect(() => {
    setVisibilityState(document.visibilityState)
    document.addEventListener("visibilitychange", () => {
      setVisibilityState(document.visibilityState)
    })
  }, [])

  const notifyMe = () => {
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notification");
    } else if (Notification.permission === "granted") {
      if (visibilityState !== "visible") {
        let notification = new Notification(`${notifyMessage.username} : ${notifyMessage.message} `, {
          tag: "GSChat",
          renotify: true,
        })
        setTimeout(() => {
          dispatch(closeNotifyMessage())
        }, 2000)
      } else {
        dispatch(closeNotifyMessage())
      }
    } else if (Notification.permission === "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          if (visibilityState !== "visible") {
            let notification = new Notification(`${notifyMessage.username} : ${notifyMessage.message} `, {
              tag: "GSChat",
              renotify: true,
            })
            setTimeout(() => {
              dispatch(closeNotifyMessage())
            }, 2000)
          } else {
            dispatch(closeNotifyMessage())
          }
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
      <Favicon url={favicon} animated alertCount={unreadCount} alertFillColor="#FBC34A" alertTextColor="#010101" iconSize={16} animationDelay={500} keepIconLink={()=>false} renderOverlay={null} />
    </>
  )
}

export default memo(HiddenBox)
