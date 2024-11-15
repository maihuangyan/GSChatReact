import React, { useEffect, useState, useLayoutEffect } from 'react'
import { Image } from 'antd'

export default function AdaptiveImage({ messageInfo }) {

    const [imgSetInfo, setImgSetInfo] = useState({})

    const imgInfo = (url) => {
        return new Promise((resolve, reject) => {
            let img = document.createElement("img")
            img.src = url
            console.log(img.complete)
            if (img.complete) {
                resolve({ width: img.naturalWidth, height: img.naturalHeight })
            } else {
                img.onload = () => {
                    resolve({ width: img.naturalWidth, height: img.naturalHeight })
                }
            }
        })
    }

    useEffect(() => {
        imgInfo(messageInfo.thumbnail).then(res => {
            let imgW = res.width;
            let imgH = res.height;
            console.log()
            let maxW = 450;

            if (imgW < maxW) {
                setImgSetInfo({
                    viewWidth: imgW,
                    viewHeight: imgH,
                    imgWidth: imgW,
                    imgHeight: imgH,
                })
            } else if (imgW > maxW) {
                let ratio = Number((maxW / imgW).toFixed(2));
                setImgSetInfo({
                    viewWidth: maxW,
                    viewHeight: imgH * ratio,
                    imgWidth: maxW,
                    imgHeight: imgH * ratio,
                })
            }
        })

    }, [])

    return (
        <div style={{ width: imgSetInfo.viewWidth, height: imgSetInfo.viewHeight }} id={messageInfo.id}>
            <Image
                alt={messageInfo.thumbnail}
                src={messageInfo.thumbnail}
                placeholder={true}
                loading='lazy'
                width={imgSetInfo.imgWidth}
                height={imgSetInfo.imgHeight}
            />
        </div>
    )
}
