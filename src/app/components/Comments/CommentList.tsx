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

          {/* text */}
          {c.text && (
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
              {c.text}
            </Typography>
          )}

          {/* media (ảnh / video) */}
          {c.media && c.media.length > 0 && (
            <Box
              sx={{
                mt: 0.5,
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              {c.media.map((m, idx) => (
                <Box key={m.url + idx}>
                  {m.type === "image" ? (
                    <Box
                      component="img"
                      src={m.url}
                      alt={m.name || "image"}
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 1,
                        objectFit: "cover",
                      }}
                    />
                  ) : m.type === "video" ? (
                    <Box
                      component="video"
                      src={m.url}
                      controls
                      sx={{
                        width: 160,
                        maxHeight: 120,
                        borderRadius: 1,
                      }}
                    />
                  ) : null}
                </Box>
              ))}
            </Box>
          )}

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 0.5, display: "block" }}
          >
            {new Date(c.createdAt).toLocaleString()}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
