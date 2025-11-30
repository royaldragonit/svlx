"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Divider,
  Tooltip,
  IconButton,
  Dialog,
} from "@mui/material";
import {
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  ShareOutlined as ShareOutlinedIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import CommentList from "../Comments/CommentList";
import CommentComposer from "../Comments/CommentComposer";
import { CarItem } from "@/app/data/types";
import { truncateText } from "@/app/utils/textUtils";

type CarWithMedia = CarItem & {
  media?: { mediaType: "image" | "video" | "other"; url: string }[];
};

type Props = {
  car: CarWithMedia;
  liked: boolean;
  likeDisplay: number;
  commentDisplay: number;
  comments: any[];
  openComments: boolean;
  toggleLike: () => void;
  toggleCommentPanel: () => void;
  handleSubmitComment: (text: string, files: File[]) => void;
  onShare?: () => void;
};

export default function CarCard({
  car,
  liked,
  likeDisplay,
  commentDisplay,
  comments,
  openComments,
  toggleLike,
  toggleCommentPanel,
  handleSubmitComment,
  onShare,
}: Props) {
  const imageUrl = car.image;
  const videoUrl =
    car.media?.find((m) => m.mediaType === "video")?.url || undefined;

  const [openImageViewer, setOpenImageViewer] = React.useState(false);

  const handleOpenImage = () => {
    if (!imageUrl) return;
    setOpenImageViewer(true);
  };

  const handleCloseImage = () => {
    setOpenImageViewer(false);
  };

  const mediaHeight = 140;

  return (
    <>
      <Card>
        <div style={{ display: "flex", alignItems: "stretch" }}>
          <Box
            sx={{
              width: "20%",
              minWidth: 160,
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
              p: 0.5,
            }}
          >
            {imageUrl && (
              <Box
                component="img"
                src={imageUrl}
                alt={car.name}
                title="Click để xem toàn màn hình"
                onClick={handleOpenImage}
                sx={{
                  width: "100%",
                  height: mediaHeight,
                  objectFit: "cover",
                  borderRadius: 1,
                  cursor: "pointer",
                }}
              />
            )}

            {videoUrl && (
              <Box
                component="video"
                src={videoUrl}
                controls
                muted
                sx={{
                  width: "100%",
                  height: mediaHeight,
                  borderRadius: 1,
                  objectFit: "cover",
                }}
              />
            )}
          </Box>

          <Box sx={{ flexGrow: 1 }}>
            <CardContent>
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {car.authorName} • {car.authorRank}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {car.createdAt}
                </Typography>
              </Box>

              <Typography variant="h6">{car.name}</Typography>

              <Typography variant="body2">
                {car.type} | {car.location}
              </Typography>

              <Typography variant="body2" sx={{ mt: 1 }}>
                {truncateText(car.description, 200)}
              </Typography>
            </CardContent>

            <Divider />

            <Box sx={{ p: "6px 16px" }}>
              <Typography variant="caption" color="text.secondary">
                {likeDisplay} lượt thích • {commentDisplay} bình luận •{" "}
                {car.shareCount} chia sẻ
              </Typography>
            </Box>

            <Divider />

            <div style={{ display: "flex", justifyContent: "space-around" }}>
              <Tooltip title={liked ? "Bỏ thích" : "Thích"}>
                <IconButton onClick={toggleLike}>
                  {liked ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Bình luận">
                <IconButton onClick={toggleCommentPanel}>
                  <ChatBubbleOutlineIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Chia sẻ">
                <IconButton onClick={onShare}>
                  <ShareOutlinedIcon />
                </IconButton>
              </Tooltip>
            </div>

            {openComments && (
              <>
                <Divider />
                <CommentList comments={comments} />
                <Divider />
                <CommentComposer
                  open
                  onClose={toggleCommentPanel}
                  onSubmit={handleSubmitComment}
                />
              </>
            )}
          </Box>
        </div>
      </Card>

      {imageUrl && (
        <Dialog
          open={openImageViewer}
          onClose={handleCloseImage}
          fullScreen
          PaperProps={{
            sx: {
              bgcolor: "rgba(0,0,0,0.95)",
            },
          }}
        >
          <Box
            sx={{
              position: "fixed",
              top: 16,
              right: 16,
              zIndex: 10,
            }}
          >
            <IconButton
              onClick={handleCloseImage}
              sx={{
                bgcolor: "rgba(0,0,0,0.6)",
                "&:hover": { bgcolor: "rgba(0,0,0,0.9)" },
              }}
            >
              <CloseIcon sx={{ color: "#fff" }} />
            </IconButton>
          </Box>

          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 2,
            }}
          >
            <Box
              component="img"
              src={imageUrl}
              alt={car.name}
              sx={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          </Box>
        </Dialog>
      )}
    </>
  );
}
