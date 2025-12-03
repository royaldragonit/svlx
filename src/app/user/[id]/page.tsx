"use client";

import { use, useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  CircularProgress,
} from "@mui/material";
import Link from "next/link";

type UserInfo = {
  id: number;
  displayName: string;
  avatarUrl?: string | null;
  rank: string;
  points: number;
  postCount: number;
};

type UserReport = {
  id: number;
  title: string;
  plateNumber: string;
  description: string;
  createdAt: string;
  imageUrl: string;
};

export default function UserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const userId = Number(id);

  const [user, setUser] = useState<UserInfo | null>(null);
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // fetch info user
        const uRes = await fetch(`/api/user/${userId}`);
        if (uRes.ok) {
          const json = await uRes.json();
          setUser(json.user);
        }

        // fetch posts của user
        const rRes = await fetch(`/api/user/${userId}/reports`);
        if (rRes.ok) {
          const data = await rRes.json();
          setReports(
            data.map((r: any) => ({
              id: r.id,
              title: r.title,
              plateNumber: r.plateNumber,
              description: r.description,
              createdAt: r.createdAt,
              imageUrl:
                r.mainImageUrl ||
                r.media?.find((m: any) => m.mediaType === "image")?.url ||
                "/cars/car-placeholder.png",
            }))
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId]);

  if (loading)
    return (
      <Container sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );

  if (!user)
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>Không tìm thấy user.</Typography>
      </Container>
    );

  return (
    <Container sx={{ mt: 3, mb: 4 }}>
      <Box sx={{ display: "flex", gap: 3,flexDirection: { xs: "column", md: "row" }, }}>
        {/* LEFT COLUMN */}
        <Paper sx={{ width: { xs: "100%", md: 260 }, p: 2 }}>
          <Box sx={{ textAlign: "center" }}>
            <Avatar
              src={user.avatarUrl || undefined}
              sx={{ width: 100, height: 100, mx: "auto", mb: 2 }}
            >
              {user.displayName.charAt(0)}
            </Avatar>

            <Typography variant="h6">{user.displayName}</Typography>
            <Typography variant="body2" color="text.secondary">
              Rank: {user.rank}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2">Điểm: {user.points}</Typography>
            <Typography variant="body2">
              Bài viết: {user.postCount}
            </Typography>
          </Box>
        </Paper>

        {/* RIGHT COLUMN */}
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Bài viết đã đăng
          </Typography>

          {reports.length === 0 && (
            <Typography>User chưa đăng bài nào.</Typography>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {reports.map((r) => (
              <Paper
                key={r.id}
                sx={{
                  p: 2,
                  display: "flex",
                  gap: 2,
                  cursor: "pointer",
                  "&:hover": { bgcolor: "grey.100" },
                }}
                component={Link}
                href={`/?report_id=${r.id}`}
              >
                <Box
                  component="img"
                  src={r.imageUrl}
                  alt={r.title}
                  sx={{
                    width: 140,
                    height: 100,
                    objectFit: "cover",
                    borderRadius: 1,
                  }}
                />

                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {r.plateNumber} – {r.title}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {new Date(r.createdAt).toLocaleString("vi-VN")}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ mt: 1 }}
                    noWrap
                  >
                    {r.description}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
