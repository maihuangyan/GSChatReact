import React, { useRef, useState } from 'react'
import {
    Box,
    Typography,
} from "@mui/material";
import { IconX } from "@tabler/icons";
import { useTheme } from "@mui/material/styles";

export default function EnlargeImgBox({ img, open, setIsModalOpen }) {

    const theme = useTheme();

    const [isImage, setIsImage] = useState(false);
    const downloadImg = useRef()
    const isPreviewFilesClose = () => {
        setIsModalOpen(false)
    }
    const aaa = () =>{
        downloadImg.current.href = img?.files[0].thumbnail;
        downloadImg.current.download = ""
        downloadImg.current.click()
    }
    return <>
        <Box
            sx={{
                display: open ? "flex" : "none",
                flexDirection: "column",
                width: "100%",
                height: { xs: "auto", sm: "auto", md: "100%" },
                position: "absolute",
                top: 0,
                left: 0,
                backgroundColor: "#000",
                zIndex: 10,
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: theme.palette.primary.main,
                    p: 1,
                    color: theme.palette.text.black,
                    borderRadius: 1,
                }}
            >
                <Typography ref={downloadImg} component="a" sx={{ width: "100%", overflow: "hidden" }} onClick={()=>aaa()}>
                    66
                </Typography>
                <Typography component="span" sx={{ cursor: "pointer", p: "5px 10px 0 10px" }} onClick={() => isPreviewFilesClose()}>
                    <IconX size={20} stroke={2} />
                </Typography>
            </Box>

            <Typography component="div"
                sx={{
                    display: "flex",
                    justifyContent: "space-around",
                    alignItems: "center",
                    overflow: "hidden",
                    width: "100%",
                    height: "100%",
                }}
            >
                <img
                    src={img?.files[0].thumbnail}
                    srcSet={img?.files[0].thumbnail}
                    alt={img?.files[0].origin_file_name}
                    loading="lazy"
                    style={{ maxWidth: "100%", maxHeight: "100%", }}
                />
            </Typography>

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-around",
                    alignItems: "center",
                    backgroundColor: theme.palette.primary.main,
                    p: 1,
                    color: theme.palette.text.black,
                    borderRadius: 1,
                }}
            >
                <Box sx={{ ml: 3 }}>
                    <Typography variant="h4">
                        Filename :
                    </Typography>
                    <Typography>{img?.files[0].origin_file_name}</Typography>
                </Box>
                <Box sx={{ ml: 3 }}>
                    <Typography variant="h4">
                        Content type :
                    </Typography>
                    <Typography>{img?.files[0].type==1? "image" : "application"}</Typography>
                </Box>
            </Box>
        </Box >
    </>
}
