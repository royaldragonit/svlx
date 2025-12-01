"use client";

import { Avatar, Box, List, ListItem, Typography } from "@mui/material";
import Link from "next/link";
import { OnlineUser } from "./types";

export function OnlineUsersList({ users }: { users: OnlineUser[] }) {
  return (
    <List>
      {users.map((u) => (
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
  );
}
