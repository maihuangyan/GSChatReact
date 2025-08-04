import React, { useCallback, useContext, useEffect, useState, useRef } from "react";
import { Box, Paper } from "@mui/material";
import useJwt from "@/utils/jwt/useJwt";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "@mui/material/styles";
import { SocketContext } from "@/utils/context/SocketContext";
import ChatTextLine from "./component/ChatTextLine";
import { setIsReply, setReplyMessage, setEditingMessage } from "@/store/actions/messageBoxConnect";
import { setIsTyping } from "@/store/actions/sandBoxConnect";
import { setSendMsg } from "@/store/actions/messages";
import { setForwardMessage, setIsForward } from "@/store/actions/messageBoxConnect";

const MessagesBox = (props) => {
  const { roomMessages, chatArea } = props;

  const dispatch = useDispatch();
  const selectedRoom = useSelector((state) => state.room.selectedRoom);
  const isReply = useSelector((state) => state.messageBoxConnect.isReply);
  const currentTyping = useSelector((state) => state.messageBoxConnect.currentTyping);

  const socketSendTyping = useContext(SocketContext).socketSendTyping;
  const socketDeleteMessage = useContext(SocketContext).socketDeleteMessage;

  const [openId, setOpenId] = useState(null);
  const openIdRef = useRef(openId);

  useEffect(() => {
    openIdRef.current = openId;
  }, [openId]);

  useEffect(() => {
    setOpenId(null);
  }, [selectedRoom]);

  useEffect(() => {

    openIdRef.current = null;
    setOpenId(null)
    dispatch(setSendMsg(null))

    const handleKeyDown = (e) => {
      if (!["ArrowUp", "ArrowDown", "Escape", "Enter", "Shift"].includes(e.key)) return;

      if ((e.key === "ArrowUp" || e.key === "ArrowDown") && currentTyping) return;

      if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();

      const downElements = Array.from(document.querySelectorAll(".downRight"));

      if (!downElements.length) return;

      const ids = downElements.map((el) => el.id);
      let currentIndex = openIdRef.current ? ids.indexOf(openIdRef.current) : ids.length;

      if (e.key === "ArrowUp") {
        let nextIndex = currentIndex - 1;
        while (nextIndex >= 0 && ids[nextIndex] === "0") nextIndex--;

        if (nextIndex >= 0) {
          setOpenId(ids[nextIndex]);
        }
      }

      if (e.key === "ArrowDown") {
        let nextIndex = currentIndex + 1;
        while (nextIndex < ids.length && ids[nextIndex] === "0") nextIndex++;

        if (nextIndex < ids.length) {
          setOpenId(ids[nextIndex]);
        }
      }

      if (e.key === "Enter" || e.key === "Escape") {
        setOpenId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);

  }, [currentTyping,dispatch]);

  const renderMessages = () => {
    let firstDate = "";

    return roomMessages.length
      ? roomMessages.map((item, index) => {
        const showDateDivider = firstDate !== item.sentDate;
        firstDate = item.sentDate;
        const right = Number(item.senderId) === Number(useJwt.getUserID());
        return (
          <Box
            key={index}
            sx={{
              position: "relative",
              mt: 1,
            }}
          >
            {showDateDivider && <DateSeperator value={item.sentDate} />}
            {item.messages.map((message, i) => (
              <ChatTextLine
                key={message.id}
                item={item}
                i={i}
                message={message}
                right={right}
                ReplyClick={ReplyClick}
                EditClick={EditClick}
                CopyClick={CopyClick}
                DeleteClick={DeleteClick}
                isGroup={selectedRoom.group}
                replyScroll={replyScroll}
                setForwardMessage={setForwardMessage}
                setOpenId={setOpenId}
                openId={openId}
              />
            ))}
          </Box>
        );
      })
      : "";
  };

  const DateSeperator = ({ value }) => {
    const theme = useTheme();
    return (
      <Box sx={{ display: "flex", alignItems: "center", py: 2 }}>
        <Box sx={{ background: theme.palette.common.silverBar, flexGrow: 1, height: "1px" }} />
        <Box
          variant="span"
          sx={{
            borderRadius: "15px",
            padding: "3px 16px",
            color: theme.palette.text.icon,
          }}
        >
          {value}
        </Box>
        <Box sx={{ background: theme.palette.common.silverBar, flexGrow: 1, height: "1px" }} />
      </Box>
    );
  };

  const ReplyClick = useCallback(
    (content) => {
      console.log("ReplyClick", content);
      dispatch(setEditingMessage(null));
      dispatch(setIsForward(false));
      dispatch(setForwardMessage(null));
      dispatch(setSendMsg(""));
      dispatch(setReplyMessage(content.message));
      dispatch(setIsReply(true));
    },
    [dispatch]
  );

  const replyScroll = useCallback(
    (message) => {
      const chatContainer = chatArea.current;
      const btn = document.getElementById(message.reply_on_message ? message.reply_on_message.id : message.id);
      if (btn) {
        const options = {
          top: btn.parentNode.parentNode.parentNode.offsetTop + btn.offsetTop - 70,
          behavior: "smooth",
        };
        chatContainer.scrollTo(options);
      }
    },
    [chatArea]
  );

  const EditClick = useCallback(
    (content) => {
      // console.log("EditClick", content);
      dispatch(setIsReply(false));
      dispatch(setReplyMessage(null));
      dispatch(setIsForward(false));
      dispatch(setForwardMessage(null));
      dispatch(setEditingMessage(content.message));
      dispatch(setSendMsg(content.message.message));
      socketSendTyping(selectedRoom.id, 1);
      dispatch(setIsTyping(selectedRoom.id === content.message.room_id));
    },
    [dispatch, selectedRoom.id, socketSendTyping]
  );

  const CopyClick = useCallback(async (content) => {
    try {
      await navigator.clipboard.writeText(content.message);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  }, []);

  const DeleteClick = useCallback(
    (content) => {
      socketDeleteMessage(content);
    },
    [socketDeleteMessage]
  );

  return (
    <Box id="chat-area">
      <Paper
        ref={chatArea}
        sx={{
          height: { xs: "100%", md: `calc( 100vh - ${isReply ? "180px" : "163px"})` },
          p: 2,
          mt: "62px",
          pb: { xs: 18, md: 9 },
          borderRadius: 0,
          overflowY: "auto",
          overflowX: "hidden",
          position: "relative",
          overscrollBehavior: "contain",
          maxHeight: { xs: "85dvh", md: "none" },
          minHeight: { xs: "85dvh", md: "none" },
        }}
      >
        {renderMessages()}
      </Paper>
    </Box>
  );
};

export default React.memo(MessagesBox);