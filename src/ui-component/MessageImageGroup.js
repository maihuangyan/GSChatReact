import React, { useMemo, memo } from "react";
import { Image } from "antd";
import { Box } from "@mui/material";

const MessageImageGroup = ({ imageInfo = [] }) => {
  
  const safeImageInfo = useMemo(
    () => (Array.isArray(imageInfo) ? imageInfo : []),
    [imageInfo]
  );

  const { displayImages, hiddenCount } = useMemo(() => {
    const displayImages = safeImageInfo.slice(0, 4);
    const hiddenCount = Math.max(0, safeImageInfo.length - 4);
    return { displayImages, hiddenCount };
  }, [safeImageInfo]);

  if (safeImageInfo.length === 0) return null;

  return (
    <Box className={`image-group group-${Math.min(displayImages.length, 4)}`} >
      <Image.PreviewGroup>
        {safeImageInfo.map((img, index) => {
          const isLast = index === 3 && hiddenCount > 0;
          return (
            <div
              className="image-wrapper"
              key={index}
              style={index > 3 ? { display: "none" } : {}}
            >
              <Image
                alt={`img-${index}`}
                src={typeof img === "string" ? img : img.thumbnail}
                placeholder={true}
                loading="lazy"
                preview={{ src: typeof img === "string" ? img : img.url }}
                width="100%"
                height="100%"
                style={{ objectFit: "cover" }}
              />
              {isLast && (
                <div className="image-overlay">
                  <span className="overlay-text">+{hiddenCount}</span>
                </div>
              )}
            </div>
          );
        })}
      </Image.PreviewGroup>
    </Box>
  );
};

export default memo(MessageImageGroup);