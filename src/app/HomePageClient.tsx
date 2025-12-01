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
  Menu,
  MenuItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
} from "@mui/material";
import Image from "next/image";
import { useState, useEffect } from "react";
import { CommentItem } from "./components/Comments/types";
import CarCard from "./components/CarCard";
import ApplyArticleDialog from "./Dialogs/ApplyArticleDialog";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import AuthDialog from "./Dialogs/AuthDialog";
import Link from "next/link";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
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
    media: Array.isArray(r.media)
      ? r.media.map((m: any) => ({
        mediaType: m.mediaType as "image" | "video" | "other",
        url: m.url as string,
      }))
      : [],
    likedByCurrentUser: r.likedByCurrentUser ?? false,
  };
}

export default function HomePageClient() {
  const { user, loading, setUser } = useCurrentUser();
  const searchParams = useSearchParams();
  const reportIdFromUrl = searchParams?.get("report_id");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);
  const [page, setPage] = useState(1);
  const [openArticleDialog, setOpenArticleDialog] = useState(false);

  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [openComments, setOpenComments] = useState<Record<number, boolean>>({});
  const [commentAdds, setCommentAdds] = useState<Record<number, number>>({});
  const [comments, setComments] = useState<Record<number, CommentItem[]>>({});
  const [cars, setCars] = useState<CarUiItem[]>([]);

  const [openAuth, setOpenAuth] = useState(false);
  const [activeMenu, setActiveMenu] = useState<"home" | "qa" | "chat">("home");

  // profile dialog
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");
  const [profileNewPassword, setProfileNewPassword] = useState("");
  const [profileConfirmPassword, setProfileConfirmPassword] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);

  // share dialog
  const [shareOpen, setShareOpen] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);

  // menu avatar
  const [avatarAnchorEl, setAvatarAnchorEl] = useState<null | HTMLElement>(null);
  const avatarMenuOpen = Boolean(avatarAnchorEl);

  const ensureLoggedIn = (action: () => void) => {
    if (!user) {
      setOpenAuth(true);
      return;
    }
    action();
  };

  useEffect(() => {
    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      try {
        const params = new URLSearchParams();

        if (reportIdFromUrl) {
          // nếu có report_id -> chỉ lấy 1 report
          params.set("report_id", reportIdFromUrl);
        } else {
          // logic cũ: search + sort
          if (searchTerm) params.set("search", searchTerm);
          if (selectedTab === 1) params.set("sort", "most_commented");
          else params.set("sort", "latest");
        }

        const qs = params.toString();
        const url = qs ? `/api/reports?${qs}` : "/api/reports";

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) return;
        const data = await res.json();
        const mapped: CarUiItem[] = data.map(mapReportToCarUiItem);
        const likedMap: Record<number, boolean> = {};
        mapped.forEach((c) => {
          likedMap[c.id] = !!c.likedByCurrentUser;
        });
        setLiked(likedMap);
        setCars(mapped);
        setPage(1);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        console.error(e);
      }
    }, 500);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [searchTerm, selectedTab, reportIdFromUrl]);

  const itemsPerPage = 3;
  const totalPages = Math.max(1, Math.ceil(cars.length / itemsPerPage));
  const pagedCars = cars.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // like -> call API
  const toggleLikeInternal = async (car: CarUiItem) => {
    if (!user) return;

    const key = car.id;
    const prevLiked = !!liked[key];

    // optimistic toggle
    setLiked((prev) => ({ ...prev, [key]: !prevLiked }));

    try {
      const res = await fetch(`/api/reports/${car.id}/like`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("like failed");
      const json = await res.json() as { liked: boolean; likeCount: number };

      setLiked((prev) => ({ ...prev, [key]: json.liked }));
      setCars((prev) =>
        prev.map((c) =>
          c.id === car.id ? { ...c, likeCount: json.likeCount } : c
        )
      );
    } catch (e) {
      console.error(e);
      // rollback
      setLiked((prev) => ({ ...prev, [key]: prevLiked }));
    }
  };

  function mapApiCommentToUi(c: any): CommentItem {
    return {
      id: String(c.id),
      text: c.content,
      media: Array.isArray(c.media)
        ? c.media.map((m: any) => ({
          url: m.url as string,
          type: m.mediaType as "image" | "video" | "other",
          name: m.fileName || "",
        }))
        : [],
      createdAt: new Date(c.createdAt).getTime(),
      authorName: c.author?.displayName || c.author?.email || "Người dùng",
      authorRank: c.author?.rank || "Bạc",
    };
  }

  const toggleCommentPanelInternal = async (car: CarUiItem) => {
    const carId = car.id;

    // lần đầu mở + chưa có data -> fetch
    if (!openComments[carId] && !comments[carId]) {
      try {
        const res = await fetch(`/api/reports/${carId}/comments`);
        if (res.ok) {
          const data = await res.json();
          const mapped: CommentItem[] = data.map(mapApiCommentToUi);
          setComments((prev) => ({ ...prev, [carId]: mapped }));
        }
      } catch (e) {
        console.error(e);
      }
    }

    // toggle panel
    setOpenComments((prev) => ({ ...prev, [carId]: !prev[carId] }));
  };


  const handleUpdateProfile = async () => {
    if (!user) return;

    setProfileError(null);

    if (!profileName.trim()) {
      setProfileError("Tên hiển thị không được để trống");
      return;
    }

    if (profileNewPassword || profileConfirmPassword) {
      if (profileNewPassword !== profileConfirmPassword) {
        setProfileError("Mật khẩu nhập lại không khớp");
        return;
      }
      if (profileNewPassword.length < 6) {
        setProfileError("Mật khẩu phải >= 6 ký tự");
        return;
      }
    }

    setProfileSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: profileName.trim(),
          avatarUrl: profileAvatar.trim() || null,
          newPassword: profileNewPassword || "",
          confirmPassword: profileConfirmPassword || "",
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setProfileError(json?.error || "Cập nhật thất bại");
        return;
      }

      setUser({
        id: json.user.id,
        email: json.user.email,
        displayName: json.user.displayName,
        avatarUrl: json.user.avatarUrl || "",
        rank: json.user.rank || "Bạc",
      });

      setProfileOpen(false);
    } catch (e) {
      console.error(e);
      setProfileError("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setProfileSaving(false);
    }
  };

  // comment -> upload file (nếu có) + gọi API
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

      if (file) {
        const formData = new FormData();
        if (file.type.startsWith("image/")) {
          formData.append("image", file);
        } else if (file.type.startsWith("video/")) {
          formData.append("video", file);
        }

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadJson = await uploadRes.json();
          imageUrl = uploadJson.imageUrl;
          videoUrl = uploadJson.videoUrl;
        }
      }

      const mediaPayload: { kind: "image" | "video"; url: string; fileName?: string }[] = [];
      if (imageUrl) {
        mediaPayload.push({
          kind: "image",
          url: imageUrl,
          fileName: file?.name,
        });
      }
      if (videoUrl) {
        mediaPayload.push({
          kind: "video",
          url: videoUrl,
          fileName: file?.name,
        });
      }

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

      const created = json.comment as {
        id: number;
        createdAt: string;
      };

      const newComment: CommentItem = {
        id: String(created.id),
        text,
        media: mediaPayload.map((m) => ({
          url: m.url,
          type: m.kind,
          name: m.fileName || "",
        })),
        createdAt: new Date(created.createdAt).getTime(),
        authorName: user.displayName || user.email || "Người dùng",
        authorRank: user.rank || "Bạc",
      };

      setComments((prev) => ({
        ...prev,
        [car.id]: [...(prev[car.id] || []), newComment],
      }));

      setCommentAdds((prev) => ({
        ...prev,
        [car.id]: (prev[car.id] || 0) + 1,
      }));

      setOpenComments((prev) => ({ ...prev, [car.id]: true }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenArticleDialog = () => {
    ensureLoggedIn(() => setOpenArticleDialog(true));
  };

  const handleLoginClick = () => {
    if (user) return;
    setOpenAuth(true);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    } finally {
      setUser(null);
      setAvatarAnchorEl(null);
    }
  };

  const handleAvatarClick = (e: React.MouseEvent<HTMLElement>) => {
    setAvatarAnchorEl(e.currentTarget);
  };

  const handleAvatarMenuClose = () => {
    setAvatarAnchorEl(null);
  };

  const handlePublishArticle = async (payload: PublishPayload) => {
    await ensureLoggedIn(async () => {
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
            authorId: user?.id,
            media: mediaPayload,
          }),
        });
        if (!res.ok) return;

        const created = await res.json();
        const mapped = mapReportToCarUiItem(created);
        setCars((prev) => [mapped, ...prev]);
        setPage(1);
      } catch (e) {
        console.error(e);
      }
    });
  };

  // share
  const handleShare = (car: CarUiItem) => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const link = `${origin}/?report_id=${car.id}`;
    setShareLink(link);
    setShareOpen(true);
  };

  const handleCopyShare = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
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
            <>
              <Avatar
                sx={{ width: 36, height: 36, cursor: "pointer" }}
                src={user.avatarUrl || undefined}
                onClick={handleAvatarClick}
              >
                {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
              </Avatar>

              <Menu
                anchorEl={avatarAnchorEl}
                open={avatarMenuOpen}
                onClose={handleAvatarMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem
                  onClick={() => {
                    handleAvatarMenuClose();
                    if (user) {
                      setProfileName(user.displayName || "");
                      setProfileAvatar(user.avatarUrl || "");
                      setProfileNewPassword("");
                      setProfileConfirmPassword("");
                      setProfileError(null);
                      setProfileOpen(true);
                    }
                  }}
                >
                  Hồ sơ
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleAvatarMenuClose();
                    if (user) {
                      setProfileName(user.displayName || "");
                      setProfileAvatar(user.avatarUrl || "");
                      setProfileNewPassword("");
                      setProfileConfirmPassword("");
                      setProfileError(null);
                      setProfileOpen(true);
                    }
                  }}
                >
                  Đổi mật khẩu
                </MenuItem>

                <Divider />
                <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
              </Menu>
            </>
          ) : (
            <Button color="inherit" onClick={handleLoginClick} disabled={loading}>
              Đăng nhập
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          mt: 1,
          mb: 1,
          display: "flex",
          justifyContent: "center",
          gap: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          pb: 1,
        }}
      >
        <Button
          variant={activeMenu === "home" ? "contained" : "text"}
          size="small"
          onClick={() => setActiveMenu("home")}
        >
          Trang chủ
        </Button>
        <Button
          variant={activeMenu === "qa" ? "contained" : "text"}
          size="small"
          onClick={() => setActiveMenu("qa")}
        >
          Hỏi đáp
        </Button>
        <Button
          variant={activeMenu === "chat" ? "contained" : "text"}
          size="small"
          onClick={() => setActiveMenu("chat")}
          component={Link}
          href="/chat"
        >
          Chatbox
        </Button>
      </Box>

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

      <div
        style={{
          marginTop: 16,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {pagedCars.map((car, i) => {
          const isLiked = !!liked[car.id];
          const likeDisplay = car.likeCount;
          const commentDisplay =
            (car.commentCount || 0) + (commentAdds[car.id] || 0);
          const carComments = comments[car.id] || [];
          const isOpen = !!openComments[car.id];

          return (
            <CarCard
              key={car.id ?? i}
              car={car as any}
              liked={isLiked}
              likeDisplay={likeDisplay}
              commentDisplay={commentDisplay}
              comments={carComments}
              openComments={isOpen}
              toggleLike={() =>
                ensureLoggedIn(() => toggleLikeInternal(car))
              }
              toggleCommentPanel={() =>
                ensureLoggedIn(() => toggleCommentPanelInternal(car))
              }

              handleSubmitComment={(text, files) =>
                ensureLoggedIn(() =>
                  handleSubmitCommentInternal(car, text, files)
                )
              }
              onShare={() => handleShare(car)}
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

      <AuthDialog
        open={openAuth}
        onClose={() => setOpenAuth(false)}
        onAuthSuccess={({ user: u }) => {
          setUser({
            id: u.id,
            email: u.email,
            displayName: u.displayName || u.email || "User",
            avatarUrl: u.avatarUrl || "",
            rank: u.rank || "Bạc",
          });
        }}
      />

      {/* Profile dialog */}
      <Dialog
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Hồ sơ người dùng</DialogTitle>
        <DialogContent
          sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Email"
            value={user?.email || ""}
            fullWidth
            margin="dense"
            size="small"
            disabled
          />
          <TextField
            label="Tên hiển thị"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            fullWidth
            margin="dense"
            size="small"
          />
          <TextField
            label="Avatar URL"
            value={profileAvatar}
            onChange={(e) => setProfileAvatar(e.target.value)}
            fullWidth
            margin="dense"
            size="small"
          />

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Đổi mật khẩu
            </Typography>
            <TextField
              label="Mật khẩu mới"
              type="password"
              value={profileNewPassword}
              onChange={(e) => setProfileNewPassword(e.target.value)}
              fullWidth
              margin="dense"
              size="small"
            />
            <TextField
              label="Nhập lại mật khẩu"
              type="password"
              value={profileConfirmPassword}
              onChange={(e) => setProfileConfirmPassword(e.target.value)}
              fullWidth
              margin="dense"
              size="small"
            />
          </Box>

          {profileError && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {profileError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileOpen(false)}>Close</Button>
          <Button
            onClick={handleUpdateProfile}
            disabled={profileSaving}
            variant="contained"
          >
            {profileSaving ? "Đang lưu..." : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share dialog */}
      <Dialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Chia sẻ link report</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            value={shareLink}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleCopyShare}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {copied && (
            <Typography
              variant="body2"
              sx={{ mt: 1 }}
              color="success.main"
            >
              Đã copy vào clipboard
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
