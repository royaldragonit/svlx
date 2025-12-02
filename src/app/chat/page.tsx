// src/app/chat/page.tsx

"use client";

import {
  AppBar,
  Box,
  Container,
  Paper,
  Toolbar,
  Typography,
  Button,
} from "@mui/material";
import { io } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ChatMessage, OnlineUser } from "./types";
import { MessageList } from "./MessageList";
import { OnlineUsersList } from "./OnlineUsersList";
import { ChatInput } from "./ChatInput";
import AuthDialog from "../Dialogs/AuthDialog";

export default function ChatPage() {
  const { user, loading, setUser } = useCurrentUser();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const [openAuth, setOpenAuth] = useState(false);

  const socketRef = useRef<any>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  // socket chỉ init khi đã có user
  useEffect(() => {
    if (loading || !user) return;

    let active = true;

    const init = async () => {
      await fetch("/api/socket");

      const socket = io({ path: "/api/socket_io" });
      socketRef.current = socket;

      socket.on("chat:init", (msgs: ChatMessage[]) => {
        if (active) setMessages(msgs);
      });

      socket.on("users:online", (list: any) => {
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
        role: user.role ?? "member",
      });

      socket.on("chat:message", (msg: ChatMessage) => {
        if (!active) return;
        setMessages((prev) => [...prev.slice(-199), msg]);
      });
    };

    init();

    return () => {
      active = false;
      socketRef.current?.disconnect();
    };
  }, [loading, user?.id]);

  // auto scroll
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  // lắng nghe event mở AuthDialog từ header
  useEffect(() => {
    const open = () => setOpenAuth(true);
    window.addEventListener("open-auth-dialog", open);
    return () => window.removeEventListener("open-auth-dialog", open);
  }, []);

  const sendMessage = () => {
    if (!socketRef.current) return;
    if (!user) {
      setOpenAuth(true);
      return;
    }
    if (!input.trim() && !selectedImage) return;

    setSending(true);

    socketRef.current.emit("chat:message", {
      userId: user.id,
      userName: user.displayName,
      avatarUrl: user.avatarUrl,
      rank: user.rank,
      points: user.points,
      joinedAt: user.joinedAt,
      posts: user.postCount,
      text: input.trim(),
      imageData: selectedImage?.dataUrl || null,
      role: user.role ?? "member",
    });

    setInput("");
    setSelectedImage(null);
    setSending(false);
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Container sx={{ mt: 2, mb: 4 }}>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static" sx={{ mb: 3, backgroundColor: "#aac9e7ff" }}>
            <Toolbar>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Cộng đồng Chat
              </Typography>
            </Toolbar>
          </AppBar>

          <Paper
            sx={{
              p: 2,
              height: "70vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {user ? (
              <>
                <Box ref={listRef} sx={{ flex: 1, overflowY: "auto", pr: 1 }}>
                  <MessageList
                    messages={messages}
                    currentUserId={user.id}
                    currentUserAvatar={user.avatarUrl}
                  />
                </Box>

                <ChatInput
                  input={input}
                  setInput={setInput}
                  sending={sending}
                  onSend={sendMessage}
                  selectedImage={selectedImage}
                  setSelectedImage={setSelectedImage}
                />
              </>
            ) : (
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  textAlign: "center",
                }}
              >
                <Typography variant="body1">
                  Bạn cần đăng nhập để tham gia chat.
                </Typography>
                <Button variant="contained" onClick={() => setOpenAuth(true)}>
                  Đăng nhập
                </Button>
              </Box>
            )}
          </Paper>
        </Box>

        <Paper sx={{ width: 260, height: "70vh", p: 2, overflowY: "auto" }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Đang online
          </Typography>

          <OnlineUsersList users={onlineUsers} />
        </Paper>
      </Box>

      {/* LOGIN DIALOG */}
      <AuthDialog
        open={openAuth}
        onClose={() => setOpenAuth(false)}
        onAuthSuccess={({ user: u }) => {
          setUser({
            id: u.id,
            email: u.email,
            displayName: u.displayName,
            avatarUrl: u.avatarUrl,
            rank: u.rank,
            points: u.points,
            joinedAt: u.joinedAt,
            postCount: u.postCount,
            role: u.role,
          });
        }}
      />
    </Container>
  );
}
