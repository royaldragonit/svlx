"use client";

import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { io, Socket } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import SendIcon from "@mui/icons-material/Send";
import ImageIcon from "@mui/icons-material/Image";
import { useCurrentUser } from "@/hooks/useCurrentUser";

type ChatMessage = {
  id: number;
  userId: number;
  userName: string;
  text: string;
  imageData?: string | null;
  createdAt: string;
};

export default function ChatPage() {
  const { user, loading } = useCurrentUser();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    dataUrl: string;
    fileName: string;
  } | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // init socket – hook luôn được gọi, logic điều kiện nằm **bên trong**
  useEffect(() => {
    if (loading || !user) return;

    let active = true;

    const init = async () => {
      await fetch("/api/socket");
      if (!active) return;

      const socket = io({ path: "/api/socket_io" });
      socketRef.current = socket;

      socket.on("chat:init", (msgs: ChatMessage[]) => {
        if (!active) return;
        setMessages(msgs);
      });

      socket.on("chat:message", (msg: ChatMessage) => {
        if (!active) return;
        setMessages((prev) => {
          const next = [...prev, msg];
          if (next.length > 200) return next.slice(-200);
          return next;
        });
      });
    };

    init();

    return () => {
      active = false;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [loading, user?.id]);

  // auto scroll – hook cũng luôn được gọi
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!user) return;
    if (!socketRef.current) return;
    if (!input.trim() && !selectedImage) return;

    setSending(true);
    socketRef.current.emit("chat:message", {
      userId: user.id,
      userName: user.displayName || user.email || "User",
      text: input.trim(),
      imageData: selectedImage?.dataUrl || null,
    });
    setInput("");
    setSelectedImage(null);
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage({
        dataUrl: reader.result as string,
        fileName: file.name,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // *** các return điều kiện để SAU khi đã gọi hooks ***

  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>Đang kiểm tra đăng nhập...</Typography>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container sx={{ mt: 4 }}>
        <AppBar position="static" sx={{ mb: 3, backgroundColor: "#aac9e7ff" }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Chatbox
            </Typography>
            <Button component={Link} href="/" color="inherit">
              Về trang chủ
            </Button>
          </Toolbar>
        </AppBar>

        <Typography variant="h5" sx={{ mb: 2 }}>
          Bạn cần đăng nhập để dùng chatbox.
        </Typography>
        <Button variant="contained" component={Link} href="/">
          Quay lại trang chủ
        </Button>
      </Container>
    );
  }

  // user đã có
  return (
    <Container sx={{ mt: 2, mb: 4 }}>
      <AppBar position="static" sx={{ mb: 3, backgroundColor: "#aac9e7ff" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Chatbox realtime
          </Typography>
          <Button component={Link} href="/" color="inherit" sx={{ mr: 2 }}>
            Về trang chủ
          </Button>
          <Avatar
            sx={{ width: 36, height: 36 }}
            src={user.avatarUrl || undefined}
          >
            {(user.displayName || user.email || "U")
              .charAt(0)
              .toUpperCase()}
          </Avatar>
        </Toolbar>
      </AppBar>

      <Paper
        elevation={3}
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "70vh",
          p: 2,
        }}
      >
        <Box
          ref={listRef}
          sx={{ flex: 1, overflowY: "auto", mb: 2, pr: 1 }}
        >
          <List>
            {messages.map((m) => {
              const isMe = m.userId === user.id;
              return (
                <ListItem
                  key={m.id}
                  sx={{
                    flexDirection: "column",
                    alignItems: isMe ? "flex-end" : "flex-start",
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      display: "flex",
                      justifyContent: isMe ? "flex-end" : "space-between",
                      mb: 0.5,
                    }}
                  >
                    {!isMe && (
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600 }}
                      >
                        {m.userName}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {new Date(m.createdAt).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      maxWidth: "80%",
                      bgcolor: isMe ? "primary.main" : "grey.200",
                      color: isMe ? "primary.contrastText" : "text.primary",
                      borderRadius: 2,
                      p: 1,
                    }}
                  >
                    {m.text && (
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            sx={{ whiteSpace: "pre-wrap" }}
                          >
                            {m.text}
                          </Typography>
                        }
                      />
                    )}

                    {m.imageData && (
                      <Box
                        component="img"
                        src={m.imageData}
                        alt="image"
                        sx={{
                          mt: m.text ? 1 : 0,
                          maxWidth: "100%",
                          maxHeight: 260,
                          borderRadius: 1,
                          display: "block",
                        }}
                      />
                    )}
                  </Box>
                </ListItem>
              );
            })}
          </List>
        </Box>

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
            onKeyDown={handleKeyDown}
          />

          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={sending || (!input.trim() && !selectedImage)}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </Container>
  );
}
