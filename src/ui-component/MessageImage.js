import axios from "axios";
import { memo, useContext, useEffect, useLayoutEffect, useState } from "react";
import { LoaderContext } from "utils/context/ProgressLoader";
import { Image } from "antd"

const MessageImage = ({ imageInfo }) => {
  const [imageUrl, setImageUrl] = useState("");
  const getImage = useContext(LoaderContext).getImage;
  const addImage = useContext(LoaderContext).addImage;
  // useEffect(() => {
  //   const img_url = imageInfo.thumbnail
  //   if (img_url) {
  //     if (img_url.includes('message-file')) {
  //       const image = getImage(img_url)
  //       if (image) {
  //         setImageUrl(image);
  //       }
  //       else {
  //         axios.get(img_url, { responseType: 'arraybuffer' })
  //           .then((res) => {
  //             let data = res.data;
  //             const file = new File([data], img_url.split('/').pop(), { type: 'image/' + img_url.split('.').pop() })
  //             const fileReader = new FileReader()
  //             fileReader.onload = () => {
  //               addImage(img_url, fileReader.result)
  //               setImageUrl(fileReader.result);
  //             }
  //             fileReader.readAsDataURL(file);
  //           })
  //           .catch((err) => console.log(err));
  //       }
  //     }
  //     else {
  //       setImageUrl(img_url);
  //     }
  //   }
  // }, [imageInfo]);

  useEffect(()=>{
    setImageUrl(imageInfo.thumbnail)
  },[imageInfo])
  return (
    <>
      <Image
        alt={imageUrl}
        src={imageUrl}
        placeholder={true}
        loading='lazy'
        width={imageInfo.width + "px"}
        height="100%"
      />
    </>
  );
};

export default memo(MessageImage);
