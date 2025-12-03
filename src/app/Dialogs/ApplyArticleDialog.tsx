"use client";

import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import TodayOutlinedIcon from "@mui/icons-material/TodayOutlined";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import * as React from "react";

import RichTextEditor from "@/app/components/inputs/RichTextEditor/RichTextEditor";

import {
  paper,
  titleBar,
  contentBox,
  titleInput,
  editorGroup,
  rteReset,
  attachInRich,
  tagsInput,
  publishBlock,
  publishRow,
  dateInput,
  timeInput,
  ampmSelect,
  scheduleRow,
  actionsBox,
  previewBtn,
  publishBtn,
} from "./ApplyArticleDialogStyles";

type MediaPayload = {
  kind: "image" | "video";
  url: string;
  file?: File | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onPublish?: (payload: {
    title: string;
    plateNumber: string;
    body: string;
    tags: string;
    date: string;
    time: string;
    meridiem: "AM" | "PM";
    scheduled: boolean;
    media: MediaPayload[];
  }) => Promise<boolean>;

};

type MediaItem = {
  id: string;
  kind: "image" | "video";
  url: string;
  file: File | null;
};

export default function ApplyArticleDialog({ open, onClose, onPublish }: Props) {
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [plateNumber, setplateNumber] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [date, setDate] = React.useState("");
  const [time, setTime] = React.useState("");
  const [meridiem, setMeridiem] = React.useState<"AM" | "PM">("AM");
  const [scheduled, setScheduled] = React.useState(false);
  const [media, setMedia] = React.useState<MediaItem[]>([]);
  const [loading, setLoading] = React.useState(false);

  const hasImage = React.useMemo(
    () => media.some((m) => m.kind === "image"),
    [media]
  );
  const hasVideo = React.useMemo(
    () => media.some((m) => m.kind === "video"),
    [media]
  );

  const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const handleAddImage = (url: string, file?: File) => {
    if (hasImage) return;
    setMedia((prev) => [
      ...prev,
      { id: genId(), kind: "image", url, file: file ?? null },
    ]);
  };

  const handleAddVideo = (url: string, file?: File) => {
    if (hasVideo) return;
    setMedia((prev) => [
      ...prev,
      { id: genId(), kind: "video", url, file: file ?? null },
    ]);
  };

  const handleRemoveMedia = (id: string) => {
    setMedia((prev) => prev.filter((m) => m.id !== id));
  };

  const handlePublish = async () => {
    if (!onPublish) return;

    setLoading(true);

    const success = await onPublish({
      title,
      plateNumber,
      body,
      tags,
      date,
      time,
      meridiem,
      scheduled,
      media: media.map((m) => ({
        kind: m.kind,
        url: m.url,
        file: m.file,
      })),
    });

    setLoading(false);

    if (success) {
      onClose();
      setTitle("");
      setBody("");
      setplateNumber("");
      setTags("");
      setDate("");
      setTime("");
      setScheduled(false);
      setMedia([]);
    }
  };


  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: paper }}>
      <DialogTitle sx={titleBar}>
        <Typography sx={{ fontWeight: 700, fontSize: 18 }}>Thêm bài đăng mới</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseRoundedIcon sx={{ color: "#BEBFC5" }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={contentBox}>
        <TextField
          placeholder="Biển số xe. Ví dụ: 30E-22222"
          value={plateNumber}
          onChange={(e) => setplateNumber(e.target.value)}
          sx={titleInput}
        />
        <TextField
          placeholder="Tiêu đề: Vượt phải khôn lỏi"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          sx={titleInput}
          variant="outlined"
        />

        <Box sx={editorGroup}>
          <Box sx={rteReset}>
            <RichTextEditor
              actions={["bold", "italic", "link", "image"]}
              onChange={setBody}
              onAddImage={handleAddImage}
              onAddVideo={handleAddVideo}
            />
          </Box>

          <Box sx={attachInRich}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AttachFileOutlinedIcon sx={{ fontSize: 20, color: "#8AB4F8" }} />
              <Box>
                <Typography sx={{ fontSize: 13, color: "#8AB4F8" }}>
                  {media.length} tệp đính kèm
                </Typography>
                <Typography sx={{ fontSize: 11, color: "#BEBFC5", mt: 0.25 }}>
                  Chỉ chấp nhận tối đa 1 hình ảnh và 1 video, video không quá 30 giây
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
              {media.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    position: "relative",
                    width: 72,
                    height: 72,
                    borderRadius: 1,
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  {item.kind === "image" ? (
                    <Box
                      component="img"
                      src={item.url}
                      alt="attachment-image"
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <Box
                      component="video"
                      src={item.url}
                      muted
                      controls
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  )}

                  <IconButton
                    size="small"
                    onClick={() => handleRemoveMedia(item.id)}
                    sx={{
                      position: "absolute",
                      top: 2,
                      right: 2,
                      bgcolor: "rgba(0,0,0,0.5)",
                      "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
                    }}
                  >
                    <DeleteOutlineRoundedIcon sx={{ fontSize: 16, color: "#fff" }} />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={actionsBox}>
        <Button
          variant="contained"
          sx={publishBtn}
          onClick={handlePublish}
          disabled={loading}
        >
          {loading ? "Đang đăng..." : "Đăng"}
        </Button>

      </DialogActions>
    </Dialog>
  );
}
