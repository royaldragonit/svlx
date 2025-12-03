"use client";

import { Avatar, Box, List, ListItem, Typography } from "@mui/material";
import Link from "next/link";
import { OnlineUser } from "./types";

export function OnlineUsersList({ users }: { users: OnlineUser[] }) {
  return (
    <>
      {/* DESKTOP: danh sách dọc */}
      <List
        className="online-desktop"
        style={{ display: "block" }}
      >
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

      {/* MOBILE: hàng ngang scroll */}
      <Box
        className="online-mobile"
        sx={{
          display: "none",
          gap: 2,
          overflowX: "auto",
          px: 1,
          py: 1,
          whiteSpace: "nowrap",
        }}
      >
        {users.map((u) => {
          const parts = u.name.trim().split(" ");
          const lastName = parts[parts.length - 1] || u.name;

          return (
            <Box
              key={u.id}
              component={Link}
              href={`/user/${u.id}`}
              sx={{
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                cursor: "pointer",
                width: 60,
              }}
            >
              <Avatar
                src={u.avatar || undefined}
                sx={{
                  width: 48,
                  height: 48,
                  mb: 0.5,
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontSize: 11,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "100%",
                }}
              >
                {lastName}
              </Typography>
            </Box>
          );
        })}
      </Box>

      <style jsx global>{`
        @media (max-width: 600px) {
          .online-desktop {
            display: none !important;
          }
          .online-mobile {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}
