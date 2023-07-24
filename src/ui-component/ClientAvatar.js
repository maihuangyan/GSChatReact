/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import theme from "themes";
import { LoaderContext } from "utils/context/ProgressLoader";
import { useTheme } from "@mui/material/styles";

const { Badge, Avatar } = require("@mui/material");

const  ClientAvatar = ({ name, avatar, number, status, size, sx, group }) => {

  let msx = {}
  if (sx) {
    msx = sx
  }
  if (size) {
    msx.width = size
    msx.height = size
  }

  const names = name && name.split("")[0]
  
  const [avatarData, setAvatarData] = useState("");
  const getImage = useContext(LoaderContext).getImage;
  const addImage = useContext(LoaderContext).addImage;
  const themes = useTheme();
  useEffect(() => {
    if (avatar) {
      if (avatar.includes('chat.swissnonbank')) {

        const image = getImage(avatar)
        if (image) {
          setAvatarData(image);
        }
        else {
          axios.get(avatar)
            .then((res) => {
              let data = res.data;

              if (data) {
                addImage(avatar, data)
                setAvatarData(data);
              }
            })
            .catch((err) => console.log(err));
        }
      }
      else {
        setAvatarData(avatar);
      }
    }
  }, [avatar]);

  return (
    status === undefined ? (
      number === undefined ? (
        group ? <Avatar sx={{ bgcolor: themes.palette.text.hint,color:"#000" }}>{names}</Avatar> : <Avatar alt={name} src={avatarData} sx={msx} />
      ) : (
        <Badge color="primary" badgeContent={number} overlap="circular">
          {group ? <Avatar sx={{ bgcolor: themes.palette.text.hint,color:"#000" }}>{names}</Avatar> : <Avatar alt={name} src={avatarData} sx={msx} />}
        </Badge>
      )
    ) : (
      number === undefined ? (
        <Badge
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          color={status ? "success" : "warning"}
          badgeContent=""
          variant="dot"
          sx={{
            "& .MuiBadge-dot": {
              margin: "3px",
              height: "5px",
              minWidth: "5px",
            },
          }}
        >
          {group ? <Avatar sx={{ bgcolor: themes.palette.text.hint,color:"#000" }}>{names}</Avatar> : <Avatar alt={name} src={avatarData} sx={msx} />}
        </Badge>
      ) : (
        <Badge color="primary" badgeContent={number} overlap="circular">
          <Badge
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            color={status ? "success" : "warning"}
            badgeContent=""
            variant="dot"
            sx={{
              "& .MuiBadge-dot": {
                margin: "3px",
                height: "5px",
                minWidth: "5px",
              },
            }}
          >
            {group ? <Avatar sx={{ bgcolor: themes.palette.text.hint,color:"#000" }}>{names}</Avatar> : <Avatar alt={name} src={avatarData} sx={msx} />}
          </Badge>
        </Badge>
      )
    )
  );
};

export default ClientAvatar;
