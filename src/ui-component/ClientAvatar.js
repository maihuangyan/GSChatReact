/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { LoaderContext } from "utils/context/ProgressLoader";
import { useTheme } from "@mui/material/styles";

const { Badge, Avatar } = require("@mui/material");

const ClientAvatar = ({ name, avatar, number, status, size, sx }) => {

  let msx = {}
  if (sx) {
    msx = sx
  }
  if (size) {
    msx.width = size
    msx.height = size
  }

  const [avatarData, setAvatarData] = useState("");
  const getImage = useContext(LoaderContext).getImage;
  const addImage = useContext(LoaderContext).addImage;
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

  function stringToColor(string) {
    let hash = 0;
    let i;
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
  }

  function stringAvatar(name) {
    return {
      sx: {
        ...msx,
        bgcolor: stringToColor(name),
      },
      children: name.split(' ').length == 1 ? `${name.split(' ')[0][0].toUpperCase()}` : `${name.split(' ')[0][0].toUpperCase()}${name.split(' ')[1][0].toUpperCase()}`,
    };
  }

  return (
    status === undefined ? (
      number === undefined ? (
        <Avatar {...stringAvatar(name)} />
      ) : (
        <Badge color="primary" badgeContent={number} overlap="circular">
          <Avatar {...stringAvatar(name)} />
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
          <Avatar {...stringAvatar(name)} alt={name} src={avatar} />
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
            <Avatar {...stringAvatar(name)} alt={name} src={avatar} />
          </Badge>
        </Badge>
      )
    )
  );
};

export default ClientAvatar;
