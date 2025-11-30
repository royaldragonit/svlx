"use client";

import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  TextField,
  Tabs,
  Tab,
  Pagination,
  Avatar,
  Box,
} from "@mui/material";
import Image from "next/image";
import { useState, useEffect } from "react";
import { CommentItem } from "./components/Comments/types";
import CarCard from "./components/CarCard";
import ApplyArticleDialog from "./Dialogs/ApplyArticleDialog";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

type CarUiItem = {
  id: number;
  name: string;
  plateNumber: string;
  description: string;
  type: string;
  location: string;
  reportCategory: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  image: string;
  authorName: string;
  authorRank: string;
  createdAt: string;
};

type PublishPayload = {
  title: string;
  body: string;
  tags: string;
  date: string;
  time: string;
  meridiem: "AM" | "PM";
  scheduled: boolean;
  media: { kind: "image" | "video"; url: string; file?: File | null }[];
};

function mapReportToCarUiItem(r: any): CarUiItem {
  return {
    id: r.id,
    name: `${r.plateNumber} - ${r.title}`,
    plateNumber: r.plateNumber,
    description: r.description,
    type: r.carType ?? "",
    location: r.location ?? "",
    reportCategory: r.categoryTag ?? "Mới Cập Nhật",
    likeCount: r.likeCount ?? 0,
    commentCount: r._count?.comments ?? 0,
    shareCount: r.shareCount ?? 0,
    image:
      r.mainImageUrl ??
      r.media?.find((m: any) => m.mediaType === "image")?.url ??
      "/cars/car-placeholder.png",
    authorName: r.author?.displayName ?? "Ẩn danh",
    authorRank: r.author?.rank ?? "Bạc",
    createdAt: r.createdAt,
  };
}

export default function HomePageClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);
  const [page, setPage] = useState(1);
  const [openArticleDialog, setOpenArticleDialog] = useState(false);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [commentAdds, setCommentAdds] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, CommentItem[]>>({});
  const [cars, setCars] = useState<CarUiItem[]>([]);
  const [user, setUser] = useState<{ name: string; avatarUrl?: string } | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      const res = await fetch("/api/reports");
      const data = await res.json();
      const mapped: CarUiItem[] = data.map(mapReportToCarUiItem);
      setCars(mapped);
    };

    fetchReports();
  }, []);

  const filteredCars = cars
    .filter((car) =>
      `${car.plateNumber} ${car.name}`.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((car) =>
      selectedTab === 0
        ? car.reportCategory === "Mới Cập Nhật"
        : car.reportCategory === "Nhiều Report"
    );

  const itemsPerPage = 3;
  const totalPages = Math.max(1, Math.ceil(filteredCars.length / itemsPerPage));
  const pagedCars = filteredCars.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => setPage(1), [searchTerm, selectedTab]);

  const toggleLike = (name: string) => {
    setLiked((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const toggleCommentPanel = (name: string) => {
    setOpenComments((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSubmitComment = (name: string, text: string, files: File[]) => {
    const newMedia = files.map((f) => ({
      url: URL.createObjectURL(f),
      type: (f.type.startsWith("image/")
        ? "image"
        : f.type.startsWith("video/")
        ? "video"
        : "other") as "image" | "video" | "other",
      name: f.name,
    }));

    const newComment: CommentItem = {
      id: `${name}-${Date.now()}`,
      text,
      media: newMedia,
      createdAt: Date.now(),
      authorName: user?.name || "Người dùng ẩn danh",
      authorRank: "Bạc",
    };

    setComments((prev) => ({
      ...prev,
      [name]: [...(prev[name] || []), newComment],
    }));

    setCommentAdds((prev) => ({
      ...prev,
      [name]: (prev[name] || 0) + 1,
    }));

    setOpenComments((prev) => ({ ...prev, [name]: true }));
  };

  const handleOpenArticleDialog = () => {
    setOpenArticleDialog(true);
  };

  const handleLoginClick = () => {
    if (user) setUser(null);
    else setUser({ name: "Long", avatarUrl: "" });
  };

  const handlePublishArticle = async (payload: PublishPayload) => {
    try {
      const imageFile = payload.media.find((m) => m.kind === "image")?.file || null;
      const videoFile = payload.media.find((m) => m.kind === "video")?.file || null;

      let imageUrl: string | undefined;
      let videoUrl: string | undefined;

      if (imageFile || videoFile) {
        const formData = new FormData();
        if (imageFile) formData.append("image", imageFile);
        if (videoFile) formData.append("video", videoFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) return;

        const uploadJson = await uploadRes.json();
        imageUrl = uploadJson.imageUrl;
        videoUrl = uploadJson.videoUrl;
      }

      const mediaPayload: { kind: "image" | "video"; url: string }[] = [];
      if (imageUrl) mediaPayload.push({ kind: "image", url: imageUrl });
      if (videoUrl) mediaPayload.push({ kind: "video", url: videoUrl });

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: payload.title,
          body: payload.body,
          tags: payload.tags,
          authorId: 1,
          media: mediaPayload,
        }),
      });
      if (!res.ok) return;

      const created = await res.json();
      const mapped = mapReportToCarUiItem(created);
      setCars((prev) => [mapped, ...prev]);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Container>
      <AppBar position="sticky" sx={{ backgroundColor: "#aac9e7ff" }}>
        <Toolbar>
          <Image src="/logo2.png" alt="Logo" width={100} height={40} />
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 1 }}>
            Súc vật lái xe
          </Typography>

          {user ? (
            <Avatar
              sx={{ width: 36, height: 36, cursor: "pointer" }}
              src={user.avatarUrl}
            >
              {user.name.charAt(0).toUpperCase()}
            </Avatar>
          ) : (
            <Button color="inherit" onClick={handleLoginClick}>
              Đăng nhập
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <TextField
        fullWidth
        sx={{ mt: 2, mb: 2 }}
        label="Tìm mấy con chó khôn lỏi theo biển số xe ví dụ: 51A12345"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <Box sx={{ mb: 1, display: "flex", justifyContent: "flex-end" }}>
        <Button
          sx={{ backgroundColor: "#f8d718ff" }}
          onClick={handleOpenArticleDialog}
          startIcon={<AddCircleOutlineIcon />}
        >
          Thêm 1 thằng ngu lái xe
        </Button>
      </Box>

      <Tabs
        value={selectedTab}
        onChange={(_, v) => setSelectedTab(v)}
        aria-label="Tabs for cars report categories"
      >
        <Tab label="Mới Cập Nhật" />
        <Tab label="Nhiều Report" />
      </Tabs>

      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
        {pagedCars.map((car, i) => {
          const isLiked = !!liked[car.name];
          const likeDisplay = (car.likeCount || 0) + (isLiked ? 1 : 0);
          const commentDisplay =
            (car.commentCount || 0) + (commentAdds[car.name] || 0);
          const carComments = comments[car.name] || [];
          const isOpen = !!openComments[car.name];

          return (
            <CarCard
              key={car.id ?? i}
              car={car as any}
              liked={isLiked}
              likeDisplay={likeDisplay}
              commentDisplay={commentDisplay}
              comments={carComments}
              openComments={isOpen}
              toggleLike={() => toggleLike(car.name)}
              toggleCommentPanel={() => toggleCommentPanel(car.name)}
              handleSubmitComment={(text, files) =>
                handleSubmitComment(car.name, text, files)
              }
            />
          );
        })}
      </div>

      <Pagination
        count={totalPages}
        page={page}
        onChange={(_, v) => setPage(v)}
        sx={{ mt: 3, mb: 4, display: "flex", justifyContent: "center" }}
        shape="rounded"
        color="primary"
      />

      <ApplyArticleDialog
        open={openArticleDialog}
        onClose={() => setOpenArticleDialog(false)}
        onPublish={handlePublishArticle}
      />
    </Container>
  );
}
