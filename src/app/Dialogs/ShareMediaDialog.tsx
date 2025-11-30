"use client";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import TodayOutlinedIcon from "@mui/icons-material/TodayOutlined";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Switch,
  InputAdornment,
  MenuItem,
} from "@mui/material";
import * as React from "react";

import {
  paper,
  titleBar,
  contentBox,
  dropZone,
  dropInner,
  captionInput,
  tagsInput,
  publishBlock,
  publishRow,
  dateInput,
  timeInput,
  ampmSelect,
  actionsBox,
  schedulePill,
  scheduleSwitch,
  previewBtn,
  publishBtn,
} from "./ShareMediaDialogStyles";

type Props = {
  open: boolean;
  onClose: () => void;
  onPublish?: (payload: {
    file?: File | null;
    caption: string;
    tags: string;
    date: string;
    time: string;
    meridiem: "AM" | "PM";
    scheduled: boolean;
  }) => void;
};

export default function ShareMediaDialog({ open, onClose, onPublish }: Props) {
  const [file, setFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string>("");
  const [caption, setCaption] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [date, setDate] = React.useState("");
  const [time, setTime] = React.useState("");
  const [meridiem, setMeridiem] = React.useState<"AM" | "PM">("AM");
  const [scheduled, setScheduled] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const pickFile = () => fileInputRef.current?.click();

  const handleFile = (f?: File) => {
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    handleFile(f);
  };

  const onPublishNow = () => {
    onPublish?.({ file, caption, tags, date, time, meridiem, scheduled });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: paper }}>
      <DialogTitle sx={titleBar}>
        <Typography sx={{ fontWeight: 700, fontSize: 18 }}>Post media</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseRoundedIcon sx={{ color: "#BEBFC5" }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={contentBox}>
        <Box
          sx={dropZone}
          onClick={pickFile}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
        >
          {!previewUrl && (
            <Box sx={dropInner}>
              <CameraAltOutlinedIcon sx={{ fontSize: 168, opacity: 0.6 }} />
            </Box>
          )}
          {!!previewUrl && (
            file?.type.startsWith("video/")
              ? <Box component="video" src={previewUrl} controls style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} />
              : <Box component="img" src={previewUrl} alt="preview" sx={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" }} />
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            hidden
            onChange={(e) => handleFile(e.target.files?.[0] || undefined)}
          />
        </Box>

        <TextField
          placeholder="Write a caption.."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          fullWidth
          sx={captionInput}
        />

        <TextField
          placeholder="Tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          fullWidth
          sx={tagsInput}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocalOfferOutlinedIcon sx={{ fontSize: 20, color: "#BEBFC5" }} />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={publishBlock}>
          <Typography sx={{ fontSize: 12, opacity: 0.7, mb: 0.5 }}>Publish on:</Typography>
          <Box sx={publishRow}>
            <TextField
              placeholder="MM/DD/YYYY"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              sx={dateInput}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <TodayOutlinedIcon sx={{ fontSize: 20, color: "#BEBFC5" }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              placeholder="HH:MM"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              sx={timeInput}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <AccessTimeOutlinedIcon sx={{ fontSize: 20, color: "#BEBFC5" }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select
              value={meridiem}
              onChange={(e) => setMeridiem(e.target.value as "AM" | "PM")}
              sx={ampmSelect}
            >
              <MenuItem value="AM">AM</MenuItem>
              <MenuItem value="PM">PM</MenuItem>
            </TextField>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={actionsBox}>
        <Box sx={schedulePill}>
          <Switch checked={scheduled} onChange={(e) => setScheduled(e.target.checked)} sx={scheduleSwitch} />
          <Typography sx={{ fontSize: 14 }}>Schedule</Typography>
        </Box>
        <Button variant="outlined" sx={previewBtn}>Preview</Button>
        <Button variant="contained" sx={publishBtn} onClick={onPublishNow}>Publish Now</Button>
      </DialogActions>
    </Dialog>
  );
}