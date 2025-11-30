"use client";
import { Box, Typography } from "@mui/material";
import type { CommentItem } from "./types";

export default function CommentList({ comments }: { comments: CommentItem[] }) {
  if (!comments || comments.length === 0)
    return (
      <Box sx={{ p: "8px 16px" }}>
        <Typography variant="body2" color="text.secondary">
          Chưa có bình luận nào.
        </Typography>
      </Box>
    );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, p: "8px 16px" }}>
      {comments.map((c) => (
        <Box key={c.id} sx={{ border: "1px solid #eee", borderRadius: 1, p: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {c.authorName}{" "}
            <Typography
              component="span"
              variant="caption"
              sx={{
                ml: 0.5,
                color:
                  c.authorRank === "Bạc"
                    ? "#9e9e9e"
                    : c.authorRank === "Vàng"
                    ? "#fbc02d"
                    : "#29b6f6",
              }}
            >
              ({c.authorRank})
            </Typography>
          </Typography>

          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
            {c.text}
          </Typography>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
            {new Date(c.createdAt).toLocaleString()}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
