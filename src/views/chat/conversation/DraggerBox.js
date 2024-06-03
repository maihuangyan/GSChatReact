import React, { useEffect ,useContext} from 'react'
import {
    Box,
} from "@mui/material";

import { Upload } from 'antd';
import { LoaderContext } from "utils/context/ProgressLoader";


const { Dragger } = Upload;

export default function DraggerBox({ draggerFile, setUploadFiles, setImg, setIsPreviewFiles, setDraggerFile }) {


    const showToast = useContext(LoaderContext).showToast
    useEffect(() => {
        const draggerStyle = document.querySelector(".ant-upload-wrapper")
        draggerStyle.style.height = "100%"
    }, [])

    const props = {
        name: 'file',
        headers: {
            authorization: 'authorization-text',
        },
        beforeUpload: {
            function() {
                return false;
            }
        },
        showUploadList: false,
        maxCount: 1,
        style: { border: "none" },
        onChange(file) {
            const fileReader = new FileReader();
            fileReader.onload = () => {
                console.log(file.file.type.split("/"))
                if (file.file.type.split("/")[1] == "x-msdownload") {
                    showToast("error", "This file is not supported")
                    return
                } else {
                    setUploadFiles(file.file)
                    setImg(fileReader.result)
                    setIsPreviewFiles(true)
                }
            }
            fileReader.readAsDataURL(file.file);
            setDraggerFile(false)
        },
    };

    return <>
        <Box
            sx={{
                display: draggerFile ? "flex" : "none",
                flexDirection: "column",
                width: "85%",
                height: { xs: "auto", sm: "auto", md: "80%" },
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                margin: "auto",
                backgroundColor: "#fff",
                zIndex: 10,
                borderRadius: "16px",
                padding: "10px",
            }}
        >
            <Dragger {...props} style={{ width: "100%", height: "100%" }}>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                        height: { xs: "auto", sm: "auto", md: "100%" },
                        borderRadius: "16px",
                        color: "#000",
                    }}
                >
                    Drag The File Here
                </Box>
            </Dragger>
        </Box>
    </>
}
