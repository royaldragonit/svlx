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
  Paper,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { io, Socket } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import SendIcon from "@mui/icons-material/Send";
import ImageIcon from "@mui/icons-material/Image";
import { useCurrentUser } from "@/hooks/useCurrentUser";

// Message type
type ChatMessage = {
  id: number;
  userId: number;
  userName: string;
  avatarUrl?: string | null;
  rank: string;
  points: number;
  joinedAt: string;
  posts: number;
  text: string;
  imageData?: string | null;
  createdAt: string;
};

export default function ChatPage() {
  const { user, loading } = useCurrentUser();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    dataUrl: string;
    fileName: string;
  } | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Init socket
  useEffect(() => {
    if (loading || !user) return;

    let active = true;

    const init = async () => {
      await fetch("/api/socket");
      if (!active) return;

      const socket = io({ path: "/api/socket_io" });
      socketRef.current = socket;

      socket.on("chat:init", (msgs: ChatMessage[]) => {
        if (active) setMessages(msgs);
      });

      socket.on("users:online", (list) => {
        setOnlineUsers(list);
      });

      socket.emit("user:online", {
        id: user.id,
        name: user.displayName,
        avatar: user.avatarUrl,
        rank: user.rank,
        points: user.points,
        joinedAt: user.joinedAt,
        postCount: user.postCount,
      });

      socket.on("chat:message", (msg: ChatMessage) => {
        if (!active) return;

        setMessages((prev) => {
          const next = [...prev, msg];
          return next.length > 200 ? next.slice(-200) : next;
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

  // Auto scroll
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  // Send message
  const handleSend = () => {
    if (!user || !socketRef.current) return;
    if (!input.trim() && !selectedImage) return;

    setSending(true);

    socketRef.current.emit("chat:message", {
      userId: user.id,
      userName: user.displayName || user.email,
      avatarUrl: user.avatarUrl,
      rank: user.rank,
      points: user.points || 0,
      joinedAt: user.joinedAt,
      posts: user.postCount || 0,
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

  // Loading state
  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>Đang kiểm tra đăng nhập...</Typography>
      </Container>
    );
  }

  // Not logged in
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

  // Logged in UI
  return (
    <Container sx={{ mt: 2, mb: 4 }}>
      <Box sx={{ display: "flex", gap: 2 }}>
        {/* LEFT CHAT */}
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static" sx={{ mb: 3, backgroundColor: "#aac9e7ff" }}>
            <Toolbar>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Chatbox realtime
              </Typography>
              <Button component={Link} href="/" color="inherit" sx={{ mr: 2 }}>
                Về trang chủ
              </Button>
              <Avatar sx={{ width: 36, height: 36 }} src={user.avatarUrl || undefined}>
                {(user.displayName || user.email || "U").charAt(0)}
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
            <Box ref={listRef} sx={{ flex: 1, overflowY: "auto", mb: 2, pr: 1 }}>
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
                      {/* Header (avatar + name + time) */}
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          mb: 0.5,
                          width: "100%",
                          justifyContent: isMe ? "flex-end" : "flex-start",
                        }}
                      >
                        {!isMe && (
                          <Avatar src={m.avatarUrl || undefined} sx={{ width: 32, height: 32 }} />
                        )}

                        <Box>
                          <Tooltip
                            arrow
                            title={
                              <Box sx={{ p: 1 }}>
                                <Typography variant="subtitle2">{m.userName}</Typography>
                                <Typography variant="body2">Rank: {m.rank}</Typography>
                                <Typography variant="body2">Điểm: {m.points}</Typography>
                                <Typography variant="body2">
                                  Tham gia: {new Date(m.joinedAt).toLocaleDateString()}
                                </Typography>
                                <Typography variant="body2">Bài viết: {m.posts}</Typography>
                              </Box>
                            }
                          >
                            <Typography
                              component={Link}
                              href={`/user/${m.userId}`}
                              variant="subtitle2"
                              sx={{
                                fontWeight: 600,
                                color: "#1976d2",
                                textDecoration: "none",
                                "&:hover": { textDecoration: "underline" },
                              }}
                            >
                              {m.userName}
                            </Typography>
                          </Tooltip>

                          <Typography variant="caption" color="text.secondary">
                            {new Date(m.createdAt).toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Typography>
                        </Box>

                        {isMe && (
                          <Avatar src={user.avatarUrl || undefined} sx={{ width: 32, height: 32 }} />
                        )}
                      </Box>

                      {/* Bubble */}
                      <Box
                        sx={{
                          maxWidth: "70%",
                          bgcolor: isMe ? "primary.main" : "grey.200",
                          color: isMe ? "primary.contrastText" : "text.primary",
                          borderRadius: 2,
                          p: 1,
                        }}
                      >
                        {m.text && (
                          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                            {m.text}
                          </Typography>
                        )}

                        {m.imageData && (
                          <Box
                            component="img"
                            src={m.imageData}
                            alt="chat-img"
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

            {/* Selected Image Preview */}
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

            {/* Input */}
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
        </Box>

        {/* RIGHT ONLINE USERS */}
        <Paper
          elevation={3}
          sx={{
            width: 260,
            height: "70vh",
            p: 2,
            overflowY: "auto",
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Đang online
          </Typography>

          <List>
            {onlineUsers.map((u) => (
              <ListItem
                key={u.id}
                component={Link}
                href={`/user/${u.id}`}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  cursor: "pointer",
                }}
              >
                <Avatar src={u.avatar || undefined} />
                <Box>
                  <Typography variant="subtitle2">{u.name}</Typography>
                  <Typography variant="caption">{u.rank}</Typography>
                </Box>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>
    </Container>
  );
}
