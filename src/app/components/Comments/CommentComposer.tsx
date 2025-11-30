"use client";
import { Box, TextField, IconButton } from "@mui/material";
import { useMemo, useState } from "react";
import { CommentComposerProps } from "./types";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";

export default function CommentComposer({ open, onClose, onSubmit }: CommentComposerProps) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const preview = useMemo(() => {
    if (!file) return null;
    return {
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("video/")
        ? "video"
        : "other",
    };
  }, [file]);

  if (!open) return null;

  return (
    <Box
      sx={{
        p: 1.5,
        border: "1px solid #ccc",
        borderRadius: 2,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      {preview && (
        <Box
          sx={{
            width: 80,
            height: 80,
            position: "relative",
            borderRadius: 1,
            overflow: "hidden",
          }}
        >
          {preview.type === "image" ? (
            <img src={preview.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : preview.type === "video" ? (
            <video src={preview.url} style={{ width: "100%", height: "100%" }} />
          ) : null}

          <IconButton
            size="small"
            onClick={() => setFile(null)}
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              background: "rgba(0,0,0,0.5)",
              color: "#fff",
              width: 22,
              height: 22,
            }}
          >
            <CloseIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>
      )}

      <Box sx={{ position: "relative" }}>
        <TextField
          fullWidth
          multiline
          minRows={2}
          maxRows={6}
          placeholder="Viết bình luận..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          sx={{
            "& .MuiInputBase-root": {
              p: "8px 40px",
            },
          }}
        />

        <IconButton
          component="label"
          sx={{
            position: "absolute",
            left: 5,
            bottom: 5,
          }}
        >
          <PhotoCameraIcon />
          <input
            hidden
            type="file"
            accept="image/*,video/*"
            onChange={(e) => {
              const f = e.target.files?.[0] || null;
              setFile(f);
            }}
          />
        </IconButton>

        <IconButton
          sx={{
            position: "absolute",
            right: 5,
            bottom: 5,
          }}
          disabled={text.trim().length === 0 && !file}
          onClick={() => {
            onSubmit(text.trim(), file ? [file] : []);
            setText("");
            setFile(null);
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
