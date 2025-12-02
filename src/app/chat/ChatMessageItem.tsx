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
  const isAdmin = m.role === "admin";

  const bubbleBg = isAdmin
    ? "error.main"
    : isMe
    ? "primary.main"
    : "grey.200";

  const bubbleColor = isAdmin
    ? "error.contrastText"
    : isMe
    ? "primary.contrastText"
    : "text.primary";

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
                {isAdmin && (
                  <Typography variant="body2" color="error">
                    Quyền: Admin
                  </Typography>
                )}
              </Box>
            }
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {/* Label ADMIN nền xanh */}
              {isAdmin && (
                <Box
                  sx={{
                    px: 0.7,
                    py: 0.2,
                    borderRadius: 1,
                    bgcolor: "success.main",
                    color: "success.contrastText",
                    fontSize: "10px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  Admin
                </Box>
              )}

              {/* Username */}
              <Typography
                component={Link}
                href={`/user/${m.userId}`}
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: isAdmin ? "error.main" : "#838181ff",
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                {m.userName}
              </Typography>
            </Box>
          </Tooltip>

          <Typography variant="caption" color="text.secondary">
            {new Date(m.createdAt).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Typography>
        </Box>

        {isMe && (
          <Avatar
            src={currentUserAvatar || undefined}
            sx={{ width: 32, height: 32 }}
          />
        )}
      </Box>

      {/* Bubble */}
      <Box
        sx={{
          maxWidth: "70%",
          bgcolor: bubbleBg,
          color: bubbleColor,
          borderRadius: 2,
          p: 1,
          boxShadow: isAdmin ? 3 : 0,
          border: isAdmin ? "1px solid rgba(244,67,54,0.4)" : undefined,
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
