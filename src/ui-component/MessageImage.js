import React,{ memo,  useEffect, useState } from "react";
import { Image } from "antd"

const MessageImage = ({ imageInfo }) => {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(()=>{
    setImageUrl(imageInfo?.thumbnail)
  },[imageInfo])
  return (
    <>
      <Image
        id='messageImage'
        alt={imageUrl}
        src={imageUrl}
        placeholder={true}
        loading='lazy'
        width={imageInfo?.width + "px"}
        height="100%"
      />
    </>
  );
};

export default memo(MessageImage);
