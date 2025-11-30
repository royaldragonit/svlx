"use client";

import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import { Box, IconButton, TextField, Button } from "@mui/material";
import * as React from "react";

import * as s from "./styles";

type Action = "bold" | "italic" | "link" | "image";

type Props = {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  actions?: Action[];
  onAddImage?: (url: string, file?: File) => void;
  onAddVideo?: (url: string, file?: File) => void;
};

export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Write here..",
  minHeight = 160,
  actions = ["bold", "italic", "link", "image"],
  onAddImage,
  onAddVideo,
}: Props) {
  const editorRef = React.useRef<HTMLDivElement | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const linkInputRef = React.useRef<HTMLInputElement | null>(null);
  const savedRangeRef = React.useRef<Range | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const [showLinkInput, setShowLinkInput] = React.useState(false);
  const [linkUrl, setLinkUrl] = React.useState("");

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!editorRef.current) return;
    if (!value) {
      editorRef.current.innerHTML = "";
      return;
    }
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const focusEditor = () => editorRef.current?.focus();

  const exec = (cmd: string, val?: string) => {
    if (!mounted) return;
    focusEditor();
    document.execCommand(cmd, false, val);
    onChange?.(editorRef.current?.innerHTML || "");
  };

  const openLinkInput = () => {
    if (!mounted) return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0);
    }
    setShowLinkInput(true);
    setTimeout(() => {
      linkInputRef.current?.focus();
    }, 0);
  };

  const applyLink = () => {
    const url = linkUrl.trim();
    if (!url) {
      setShowLinkInput(false);
      setLinkUrl("");
      return;
    }
    if (savedRangeRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    }
    exec("createLink", url);
    setShowLinkInput(false);
    setLinkUrl("");
  };

  const handleMediaBtnClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        if (!onAddImage) return;
        const url = URL.createObjectURL(file);
        onAddImage(url, file);
      } else if (file.type.startsWith("video/")) {
        if (!onAddVideo) return;
        const url = URL.createObjectURL(file);
        const videoEl = document.createElement("video");
        videoEl.preload = "metadata";
        videoEl.onloadedmetadata = () => {
          if (videoEl.duration > 30) {
            URL.revokeObjectURL(url);
            alert("Video không được dài quá 30 giây");
            return;
          }
          onAddVideo(url, file);
        };
        videoEl.src = url;
      }
    });

    e.target.value = "";
  };

  const onInput = (e: React.FormEvent<HTMLDivElement>) => {
    onChange?.((e.target as HTMLDivElement).innerHTML);
  };

  const handleLinkKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      applyLink();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setShowLinkInput(false);
      setLinkUrl("");
    }
  };

  return (
    <Box sx={s.wrap}>
      <Box sx={s.toolbarRow}>
        {actions.includes("bold") && (
          <IconButton size="small" sx={s.iconBtn} onClick={() => exec("bold")}>
            <FormatBoldIcon sx={s.icon} />
          </IconButton>
        )}
        {actions.includes("italic") && (
          <IconButton size="small" sx={s.iconBtn} onClick={() => exec("italic")}>
            <FormatItalicIcon sx={s.icon} />
          </IconButton>
        )}
        {actions.includes("link") && (
          <IconButton size="small" sx={s.iconBtn} onClick={openLinkInput}>
            <LinkOutlinedIcon sx={s.icon} />
          </IconButton>
        )}
        {actions.includes("image") && (
          <>
            <IconButton size="small" sx={s.iconBtn} onClick={handleMediaBtnClick}>
              <ImageOutlinedIcon sx={s.icon} />
            </IconButton>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              hidden
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </>
        )}
      </Box>

      {showLinkInput && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            px: 1,
            py: 0.75,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            bgcolor: "#1b1c20",
          }}
        >
          <TextField
            inputRef={linkInputRef}
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={handleLinkKeyDown}
            placeholder="Dán URL tại đây"
            size="small"
            fullWidth
            sx={{
              "& .MuiInputBase-root": {
                fontSize: 13,
                bgcolor: "#15161a",
              },
            }}
          />
          <Button
            variant="contained"
            size="small"
            onClick={applyLink}
            sx={{ textTransform: "none", fontSize: 13, px: 1.5, py: 0.5 }}
          >
            Thêm
          </Button>
        </Box>
      )}

      <Box
        ref={editorRef}
        role="textbox"
        contentEditable
        suppressContentEditableWarning
        onInput={onInput}
        sx={{ ...s.editorArea, minHeight }}
      >
        {!value && <span style={{ opacity: 0.6 }}>{placeholder}</span>}
      </Box>
    </Box>
  );
}
