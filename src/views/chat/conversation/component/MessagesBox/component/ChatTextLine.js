import React, { useEffect, useState, } from 'react'
import {
    Box,
    Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import Forward from './ForwardModal';
import { useDispatch } from 'react-redux';
import { setForwardMessage } from '@/store/actions/messageBoxConnect';
import RightChatText from './RightChatText';
import LeftChatText from './LeftChatText';

function ChatTextLine({ item, right, message, ReplyClick, EditClick, CopyClick, DeleteClick, isGroup, i, replyScroll, setOpenId, openId }) {


    const theme = useTheme();
    const dispatch = useDispatch()

    const [isForwardModal, setIsForwardModal] = useState(false);

    const showForward = (message) => {
        dispatch(setForwardMessage(message));
        setIsForwardModal(true)
    }

    useEffect(() => {
        // console.log(message)
    }, [])

    const imageType = () => {
        const fileName = message?.files[0]?.origin_file_name;
        const ext = fileName?.split(".").pop()?.toLowerCase();
        return ["jpeg", "jpg", "png", "webp", "gif"].includes(ext);
    };

    const filesType = (files) => {
        
        if (!files || files.length === 0) return null;
    
        
        const fileName = files[0]?.origin_file_name;
        if (!fileName) return null; 
    
        
        const ext = fileName.split('.').pop()?.toLowerCase();
        if (!ext) return null; 
    
        
        const fileTypes = {
            video: ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm', 'm4v', 'ts', '3gp', 'mpeg'],
            audio: ['mp3', 'wav', 'aac', 'flac', 'ogg', 'alac', 'aiff', 'amr', 'm4a', 'wma'],
            document: ['doc', 'docx', 'pdf', 'txt', 'json', 'xml', 'csv', 'xls', 'xlsx', 'ppt', 'pptx', 'md', 'rtf','zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz','js', 'jsx', 'ts', 'tsx', 'html', 'css', 'scss', 'py', 'java', 'c', 'cpp', 'cs', 'php', 'rb', 'go', 'sh', 'bat', 'sql'],
        };
    
        
        for (const [type, extensions] of Object.entries(fileTypes)) {
            if (extensions.includes(ext)) {
                return type;
            }
        }

        return null;
    };

const imageSize = (imgInfo, size) => {
    if (!imgInfo || imgInfo.length === 0) return 0;

    const count = Math.min(imgInfo.length, 4);

    const baseImg = imgInfo[0];
    if (!baseImg.height || !baseImg.width) return 0;

    const aspectRatio = baseImg.height / baseImg.width;
    const MAX_HEIGHT = 600;

    let targetWidth;
    switch (size) {
        case "xs":
            targetWidth = 200;
            break;
        case "sm":
            targetWidth = 300;
            break;
        case "md":
            targetWidth = 450;
            break;
        default:
            targetWidth = baseImg.width;
    }

    let singleHeight = targetWidth * aspectRatio;

    let targetHeight;
    if (count === 2) {
        targetHeight = singleHeight / 2;
    } else if (count === 3 || count === 4) {
        targetHeight = targetWidth ;
    } else {
        targetHeight = singleHeight;
    }

    if (targetHeight > MAX_HEIGHT) {
        targetHeight = MAX_HEIGHT;
    }

    return Math.round(targetHeight);
};

    //Time seperator
    const TimeSeperator = ({ content }) => {
        const theme = useTheme();
        return (
            <Box sx={{ m: 0, textAlign: right ? "right" : "left" }}>
                {/* <IconClock size={14} stroke={1} color={theme.palette.text.dark} />{" "} */}
                <Typography
                    variant="span"
                    color={theme.palette.text.icon}
                    sx={{ verticalAlign: "text-bottom", fontSize: "12px" }}
                >
                    {
                         <Typography variant="span" sx={{ textTransform: "capitalize" }}>{!right ? message.username : ""}</Typography>
                    } {content}
                </Typography>
            </Box>
        );
    };
    return (
        <Box>
            <Forward isForwardModal={isForwardModal} setIsForwardModal={setIsForwardModal} />
            {
                right ? (
                    <RightChatText
                        message={message}
                        item={item}
                        i={i}
                        replyScroll={replyScroll}
                        ReplyClick={ReplyClick}
                        EditClick={EditClick}
                        CopyClick={CopyClick}
                        DeleteClick={DeleteClick}
                        showForward={showForward}
                        setOpenId={setOpenId}
                        openId={openId}
                        theme={theme}
                        imageSize={imageSize}
                        filesType={filesType}
                        imageType={imageType}
                        TimeSeperator={TimeSeperator}
                    />
                ) : (
                    <LeftChatText
                        message={message}
                        item={item}
                        i={i}
                        replyScroll={replyScroll}
                        ReplyClick={ReplyClick}
                        CopyClick={CopyClick}
                        showForward={showForward}
                        setOpenId={setOpenId}
                        theme={theme}
                        imageSize={imageSize}
                        filesType={filesType}
                        imageType={imageType}
                        TimeSeperator={TimeSeperator}
                    />
                )
            }
        </Box>
    )
}

export default React.memo(ChatTextLine)