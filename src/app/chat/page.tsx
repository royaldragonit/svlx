"use client";

import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Paper,
  Toolbar,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { io } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ChatMessage, OnlineUser } from "./types";
import { MessageList } from "./MessageList";
import { OnlineUsersList } from "./OnlineUsersList";
import { ChatInput } from "./ChatInput";

export default function ChatPage() {
  const { user, loading } = useCurrentUser();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [sending, setSending] = useState(false);

  const socketRef = useRef<any>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (!socketRef.current) return;
    if (!input.trim() && !selectedImage) return;

    setSending(true);

    socketRef.current.emit("chat:message", {
      userId: user?.id,
      userName: user?.displayName,
      avatarUrl: user?.avatarUrl,
      rank: user?.rank,
      points: user?.points,
      joinedAt: user?.joinedAt,
      posts: user?.postCount,
      text: input.trim(),
      imageData: selectedImage?.dataUrl || null,
    });

    setInput("");
    setSelectedImage(null);
    setSending(false);
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (!user) return <Typography>Need login</Typography>;

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

          <Paper sx={{ p: 2, height: "70vh", display: "flex", flexDirection: "column" }}>
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
          </Paper>
        </Box>

        <Paper sx={{ width: 260, height: "70vh", p: 2, overflowY: "auto" }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Đang online
          </Typography>

          <OnlineUsersList users={onlineUsers} />
        </Paper>
      </Box>
    </Container>
  );
}
