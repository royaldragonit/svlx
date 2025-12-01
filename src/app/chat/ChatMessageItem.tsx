// src/app/chat/ChatMessageItem.tsx
import {
  Avatar,
  Box,
  ListItem,
  Tooltip,
  Typography,
} from "@mui/material";
import Link from "next/link";
import type { ChatMessage } from "./types";

type Props = {
  message: ChatMessage;
  isMe: boolean;
  currentUserAvatar?: string | null;
};

export function ChatMessageItem({ message: m, isMe, currentUserAvatar }: Props) {
  return (
    <ListItem
      sx={{
        flexDirection: "column",
        alignItems: isMe ? "flex-end" : "flex-start",
      }}
    >
      {/* Header: avatar + name + time */}
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

        <Box sx={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
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
                color: "#838181ff",
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
          <Avatar src={currentUserAvatar || undefined} sx={{ width: 32, height: 32 }} />
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
}
