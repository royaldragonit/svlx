"use client";

import {
  Box,
  IconButton,
  TextField,
  Button,
  Typography,
} from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import SendIcon from "@mui/icons-material/Send";
import { useRef } from "react";

export function ChatInput({
  input,
  setInput,
  sending,
  onSend,
  selectedImage,
  setSelectedImage,
}: {
  input: string;
  setInput: (s: string) => void;
  sending: boolean;
  onSend: () => void;
  selectedImage: { dataUrl: string; fileName: string } | null;
  setSelectedImage: (v: any) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleClickUpload = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () =>
      setSelectedImage({
        dataUrl: reader.result as string,
        fileName: file.name,
      });

    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <>
      {selectedImage && (
        <Box
          sx={{
            mb: 1,
            p: 1,
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 1,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            component="img"
            src={selectedImage.dataUrl}
            alt={selectedImage.fileName}
            sx={{
              width: 60,
              height: 60,
              objectFit: "cover",
              borderRadius: 1,
            }}
          />
          <Typography variant="caption" sx={{ flexGrow: 1 }}>
            {selectedImage.fileName}
          </Typography>
          <Button size="small" onClick={() => setSelectedImage(null)}>
            Xoá
          </Button>
        </Box>
      )}

      <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
        <IconButton onClick={handleClickUpload}>
          <ImageIcon />
        </IconButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        <TextField
          fullWidth
          multiline
          maxRows={3}
          placeholder="Nhập tin nhắn..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
        />

        <IconButton
          color="primary"
          onClick={onSend}
          disabled={sending || (!input.trim() && !selectedImage)}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </>
  );
}
