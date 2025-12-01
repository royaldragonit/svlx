"use client";

import { List } from "@mui/material";
import { ChatMessage } from "./types";
import { ChatMessageItem } from "./ChatMessageItem";

export function MessageList({
  messages,
  currentUserId,
  currentUserAvatar,
}: {
  messages: ChatMessage[];
  currentUserId: number;
  currentUserAvatar?: string | null;
}) {
  return (
    <List>
      {messages.map((m) => (
        <ChatMessageItem
          key={m.id}
          message={m}
          isMe={m.userId === currentUserId}
          currentUserAvatar={currentUserAvatar}
        />
      ))}
    </List>
  );
}
