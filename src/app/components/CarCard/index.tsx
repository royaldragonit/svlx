"use client";
import {
  Card, CardContent, CardMedia, Box, Typography, Button,
  Divider, Tooltip, IconButton, Chip
} from "@mui/material";
import {
  PlayCircleOutline as PlayCircleOutlineIcon,
  Image as ImageIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  ShareOutlined as ShareOutlinedIcon,
} from "@mui/icons-material";
import CommentList from "../Comments/CommentList";
import CommentComposer from "../Comments/CommentComposer";
import { CarItem } from "@/app/data/types";
import { truncateText } from "@/app/utils/textUtils";

type Props = {
  car: CarItem;
  liked: boolean;
  likeDisplay: number;
  commentDisplay: number;
  comments: any[];
  openComments: boolean;
  toggleLike: () => void;
  toggleCommentPanel: () => void;
  handleSubmitComment: (text: string, files: File[]) => void;
};

export default function CarCard({
  car, liked, likeDisplay, commentDisplay,
  comments, openComments, toggleLike, toggleCommentPanel, handleSubmitComment
}: Props) {
  return (
    <Card>
      <div style={{ display: "flex", alignItems: "stretch" }}>
        {/* Image + Info */}
        <CardMedia
          component="img"
          image={car.image}
          alt={car.name}
          sx={{
            width: "20%",
            height: 140,
            objectFit: "cover",
          }}
        />

        <Box sx={{ flexGrow: 1 }}>
          <CardContent>

            {/* User info */}
            <Box sx={{ mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {car.authorName} • {car.authorRank}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {car.createdAt}
              </Typography>
            </Box>

            {/* Title */}
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
              {likeDisplay} lượt thích • {commentDisplay} bình luận • {car.shareCount} chia sẻ
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
              <IconButton>
                <ShareOutlinedIcon />
              </IconButton>
            </Tooltip>
          </div>
          {openComments && (
            <>
              <Divider />
              <CommentList comments={comments} />
              <Divider />
              <CommentComposer open onClose={toggleCommentPanel} onSubmit={handleSubmitComment} />
            </>
          )}
        </Box>
      </div>
    </Card>
  );
}
