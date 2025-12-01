// ĐÃ RÚT GỌN VÌ HEADER + MENU ĐƯỢC ĐẨY LÊN MuiProviders

"use client";

import {
  Container,
  TextField,
  Tabs,
  Tab,
  Pagination,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  InputAdornment,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CommentItem } from "./components/Comments/types";
import CarCard from "./components/CarCard";
import ApplyArticleDialog from "./Dialogs/ApplyArticleDialog";
import AuthDialog from "./Dialogs/AuthDialog";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSearchParams } from "next/navigation";

type MediaUiItem = {
  mediaType: "image" | "video" | "other";
  url: string;
};

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
  media: MediaUiItem[];
  likedByCurrentUser?: boolean;
};
export type PublishPayload = {
  title: string;
  body: string;
  tags: string;
  date: string;
  time: string;
  meridiem: "AM" | "PM";
  scheduled: boolean;
  media: {
    kind: "image" | "video";
    url: string;
    file?: File | null;
  }[];
};

export default function HomePageClient() {
  const { user, loading, setUser } = useCurrentUser();

  const searchParams = useSearchParams();
  const reportIdFromUrl = searchParams?.get("report_id");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);
  const [page, setPage] = useState(1);
  const [openArticleDialog, setOpenArticleDialog] = useState(false);
  const [cars, setCars] = useState<CarUiItem[]>([]);
  const [openAuth, setOpenAuth] = useState(false);

  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [openComments, setOpenComments] = useState<Record<number, boolean>>({});
  const [comments, setComments] = useState<Record<number, CommentItem[]>>({});
  const [commentAdds, setCommentAdds] = useState<Record<number, number>>({});
  const [shareOpen, setShareOpen] = useState(false);
  const [shareLink, setShareLink] = useState("");

  const ensureLoggedIn = (fn: () => void) => {
    if (!user) {
      setOpenAuth(true);
      return;
    }
    fn();
  };

  // fetch reports
  useEffect(() => {
    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      try {
        const params = new URLSearchParams();

        if (reportIdFromUrl) {
          params.set("report_id", reportIdFromUrl);
        } else {
          if (searchTerm) params.set("search", searchTerm);
          if (selectedTab === 1) params.set("sort", "most_commented");
          else params.set("sort", "latest");
        }

        const qs = params.toString();
        const url = qs ? `/api/reports?${qs}` : "/api/reports";

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) return;

        const data = await res.json();

        const mapped = data.map((r: any) => ({
          id: r.id,
          name: `${r.plateNumber} - ${r.title}`,
          plateNumber: r.plateNumber,
          description: r.description,
          type: r.carType ?? "",
          location: r.location ?? "",
          reportCategory: r.categoryTag ?? "Mới cập nhật",
          likeCount: r.likeCount ?? 0,
          commentCount: r._count?.comments ?? 0,
          shareCount: r.shareCount ?? 0,
          image:
            r.mainImageUrl ||
            r.media?.find((m: any) => m.mediaType === "image")?.url ||
            "/cars/car-placeholder.png",
          authorName: r.author?.displayName ?? "Ẩn danh",
          authorRank: r.author?.rank ?? "Bạc",
          createdAt: r.createdAt,
          media: Array.isArray(r.media)
            ? r.media.map((m: any) => ({
              mediaType: m.mediaType,
              url: m.url,
            }))
            : [],
          likedByCurrentUser: r.likedByCurrentUser ?? false,
        }));

        const likedMap: Record<number, boolean> = {};
        mapped.forEach((c: any) => (likedMap[c.id] = !!c.likedByCurrentUser));

        setCars(mapped);
        setLiked(likedMap);
        setPage(1);
      } catch { }
    }, 400);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [searchTerm, selectedTab, reportIdFromUrl]);
  useEffect(() => {
    const open = () => setOpenAuth(true);
    window.addEventListener("open-auth-dialog", open);
    return () => window.removeEventListener("open-auth-dialog", open);
  }, []);

  const itemsPerPage = 3;
  const totalPages = Math.max(1, Math.ceil(cars.length / itemsPerPage));
  const pagedCars = cars.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const toggleLike = async (car: CarUiItem) => {
    ensureLoggedIn(async () => {
      const prev = liked[car.id];

      setLiked((p) => ({ ...p, [car.id]: !prev }));

      try {
        const res = await fetch(`/api/reports/${car.id}/like`, {
          method: "POST",
        });
        if (!res.ok) throw 0;
        const json = await res.json();

        setLiked((p) => ({ ...p, [car.id]: json.liked }));
        setCars((prev) =>
          prev.map((c) =>
            c.id === car.id ? { ...c, likeCount: json.likeCount } : c
          )
        );
      } catch {
        setLiked((p) => ({ ...p, [car.id]: prev }));
      }
    });
  };
  const handleShare = (car: CarUiItem) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const link = `${origin}/?report_id=${car.id}`;
    setShareLink(link);
    setShareOpen(true);
  };
  const handlePublishArticle = async (payload: PublishPayload) => {
    await ensureLoggedIn(async () => {
      try {
        const imageFile = payload.media.find((m: { kind: string }) => m.kind === "image")?.file || null;
        const videoFile = payload.media.find((m: { kind: string }) => m.kind === "video")?.file || null;

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

          const uploadJson: { imageUrl?: string; videoUrl?: string } = await uploadRes.json();
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
            authorId: user?.id,
            media: mediaPayload,
          }),
        });

        const created: any = await res.json(); // API chưa typed nên dùng any

        setCars((prev) => [
          {
            id: created.id,
            name: `${created.plateNumber} - ${created.title}`,
            plateNumber: created.plateNumber,
            description: created.description,
            type: created.carType ?? "",
            location: created.location ?? "",
            reportCategory: created.categoryTag ?? "Mới cập nhật",
            likeCount: created.likeCount ?? 0,
            commentCount: created._count?.comments ?? 0,
            shareCount: created.shareCount ?? 0,
            image:
              created.mainImageUrl ||
              created.media?.find((m: any) => m.mediaType === "image")?.url ||
              "/cars/car-placeholder.png",
            authorName: created.author?.displayName ?? "Ẩn danh",
            authorRank: created.author?.rank ?? "Bạc",
            createdAt: created.createdAt,
            media: created.media ?? [],
          },
          ...prev,
        ]);

        setPage(1);
      } catch (e) {
        console.error(e);
      }
    });
  };
  const handleSubmitCommentInternal = async (
    car: CarUiItem,
    text: string,
    files: File[]
  ) => {
    if (!user) return;

    try {
      let imageUrl: string | undefined;
      let videoUrl: string | undefined;
      const file = files[0];

      // upload media nếu có
      if (file) {
        const formData = new FormData();
        if (file.type.startsWith("image/")) formData.append("image", file);
        if (file.type.startsWith("video/")) formData.append("video", file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const uploadJson = await uploadRes.json();
        imageUrl = uploadJson.imageUrl;
        videoUrl = uploadJson.videoUrl;
      }

      const mediaPayload: { kind: "image" | "video"; url: string; fileName?: string }[] = [];
      if (imageUrl)
        mediaPayload.push({ kind: "image", url: imageUrl, fileName: file?.name });
      if (videoUrl)
        mediaPayload.push({ kind: "video", url: videoUrl, fileName: file?.name });

      // gửi comment vào DB
      const res = await fetch(`/api/reports/${car.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: text,
          media: mediaPayload,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        console.error(json);
        return;
      }

      const created = json.comment; // trả về từ backend

      const newComment: CommentItem = {
        id: String(created.id),
        text,
        media: mediaPayload.map((m) => ({
          url: m.url,
          type: m.kind,
          name: m.fileName || "",
        })),
        createdAt: new Date(created.createdAt).getTime(),
        authorName: user.displayName || user.email || "User",
        authorRank: user.rank || "Bạc",
      };

      // add vào list UI
      setComments((prev) => ({
        ...prev,
        [car.id]: [...(prev[car.id] || []), newComment],
      }));

      setCommentAdds((prev) => ({
        ...prev,
        [car.id]: (prev[car.id] || 0) + 1,
      }));

      setOpenComments((prev) => ({ ...prev, [car.id]: true }));
    } catch (err) {
      console.error(err);
    }
  };

  // open/close comment panel
  const toggleCommentPanel = async (car: CarUiItem) => {
    const id = car.id;

    if (!openComments[id] && !comments[id]) {
      try {
        const res = await fetch(`/api/reports/${id}/comments`);
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map((c: any) => ({
            id: String(c.id),
            text: c.content,
            media: (c.media || []).map((m: any) => ({
              url: m.url,
              type: m.mediaType,
              name: m.fileName,
            })),
            createdAt: new Date(c.createdAt).getTime(),
            authorName: c.author?.displayName || "User",
            authorRank: c.author?.rank || "Bạc",
          }));
          setComments((p) => ({ ...p, [id]: mapped }));
        }
      } catch { }
    }

    setOpenComments((p) => ({ ...p, [id]: !p[id] }));
  };

  return (
    <Container sx={{ mt: 2 }}>
      {/* SEARCH */}
      <TextField
        fullWidth
        sx={{ mt: 1, mb: 2 }}
        label="Tìm theo biển số xe ví dụ: 51A12345"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* ADD BUTTON */}
      <Box sx={{ mb: 1, display: "flex", justifyContent: "flex-end" }}>
        <Button
          sx={{ backgroundColor: "#f8d718ff" }}
          onClick={() => ensureLoggedIn(() => setOpenArticleDialog(true))}
          startIcon={<AddCircleOutlineIcon />}
        >
          Thêm 1 thằng ngu lái xe
        </Button>
      </Box>

      {/* SORT TABS */}
      <Tabs
        value={selectedTab}
        onChange={(_, v) => setSelectedTab(v)}
        aria-label="report tabs"
      >
        <Tab label="Mới cập nhật" />
        <Tab label="Nhiều report" />
      </Tabs>

      {/* LIST CARS */}
      <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        {pagedCars.map((car) => {
          const isLiked = !!liked[car.id];

          const commentDisplay =
            (car.commentCount || 0) + (commentAdds[car.id] || 0);

          return (
            <CarCard
              key={car.id}
              car={car as any}
              liked={isLiked}
              likeDisplay={car.likeCount}
              commentDisplay={commentDisplay}
              comments={comments[car.id] || []}
              openComments={!!openComments[car.id]}
              toggleLike={() => toggleLike(car)}
              toggleCommentPanel={() => ensureLoggedIn(() => toggleCommentPanel(car))}
              handleSubmitComment={(text, files) =>
                ensureLoggedIn(() => handleSubmitCommentInternal(car, text, files))
              }

              onShare={() => handleShare(car)}
            />
          );
        })}
      </Box>

      {/* PAGINATION */}
      <Pagination
        count={totalPages}
        page={page}
        onChange={(_, v) => setPage(v)}
        sx={{ mt: 3, mb: 4, display: "flex", justifyContent: "center" }}
        shape="rounded"
        color="primary"
      />

      {/* DIALOGS */}
      <ApplyArticleDialog
        open={openArticleDialog}
        onClose={() => setOpenArticleDialog(false)}
        onPublish={handlePublishArticle}
      />

      {/* LOGIN DIALOG */}
      <AuthDialog
        open={openAuth}
        onClose={() => setOpenAuth(false)}
        onAuthSuccess={({ user: u }) =>
          setUser({
            id: u.id,
            email: u.email,
            displayName: u.displayName,
            avatarUrl: u.avatarUrl,
            rank: u.rank,
            points: u.points,
            joinedAt: u.joinedAt,
            postCount: u.postCount,
            role: u.role
          })
        }
      />
      <Dialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Chia sẻ link report</DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            value={shareLink}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => navigator.clipboard.writeText(shareLink)}>
                    <ContentCopyIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Typography variant="caption" sx={{ mt: 1 }}>
            Copy link để gửi cho người khác
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setShareOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
}
