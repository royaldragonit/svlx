"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import {
  CssBaseline,
  ThemeProvider,
  createTheme,
  Box,
  Typography,
  AppBar,
  Toolbar,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useEffect, useState } from "react";
import AuthDialog from "./Dialogs/AuthDialog";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const theme = createTheme({});

export default function MuiProviders({ children }: { children: React.ReactNode }) {
  const { user, loading, setUser } = useCurrentUser();

  const [avatarAnchorEl, setAvatarAnchorEl] = useState<null | HTMLElement>(null);
  const avatarMenuOpen = Boolean(avatarAnchorEl);

  const handleAvatarClick = (e: React.MouseEvent<HTMLElement>) =>
    setAvatarAnchorEl(e.currentTarget);

  const handleAvatarMenuClose = () => setAvatarAnchorEl(null);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setUser(null);
    handleAvatarMenuClose();
  };

  // ========== AUTH DIALOG ==========
  const [openAuth, setOpenAuth] = useState(false);

  useEffect(() => {
    const open = () => setOpenAuth(true);
    window.addEventListener("open-auth-dialog", open);
    return () => window.removeEventListener("open-auth-dialog", open);
  }, []);

  // ========== PROFILE DIALOG ==========
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");
  const [profileNewPassword, setProfileNewPassword] = useState("");
  const [profileConfirmPassword, setProfileConfirmPassword] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);

  const openProfileDialog = () => {
    if (!user) return;
    setProfileName(user.displayName || "");
    setProfileAvatar(user.avatarUrl || "");
    setProfileNewPassword("");
    setProfileConfirmPassword("");
    setProfileError(null);
    setProfileOpen(true);
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
        rank: json.user.rank,
        points: json.user.points,
        joinedAt: json.user.joinedAt,
        postCount: json.user.postCount,
      });

      setProfileOpen(false);
    } catch {
      setProfileError("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          {/* HEADER */}
          <AppBar position="sticky" sx={{ backgroundColor: "#aac9e7ff" }}>
            <Toolbar>
              <Link href="/" style={{ display: "flex", alignItems: "center" }}>
                <Image
                  src="/logo2.png"
                  alt="Logo"
                  width={100}
                  height={40}
                  style={{ cursor: "pointer" }}
                />
              </Link>

              <Typography
                component={Link}
                href="/"
                variant="h6"
                sx={{
                  flexGrow: 1,
                  ml: 1,
                  color: "inherit",
                  textDecoration: "none",
                  cursor: "pointer",
                  "&:hover": { opacity: 0.8 }
                }}
              >
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
                  >
                    <MenuItem
                      onClick={() => {
                        handleAvatarMenuClose();
                        openProfileDialog();
                      }}
                    >
                      Hồ sơ
                    </MenuItem>

                    <MenuItem
                      onClick={() => {
                        handleAvatarMenuClose();
                        openProfileDialog();
                      }}
                    >
                      Đổi mật khẩu
                    </MenuItem>

                    <MenuItem
                      component={Link}
                      href={`/user/${user.id}`}
                      onClick={handleAvatarMenuClose}
                    >
                      Bài viết
                    </MenuItem>

                    <Divider />
                    <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
                  </Menu>
                </>
              ) : (
                <Button
                  color="inherit"
                  disabled={loading}
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("open-auth-dialog"));
                  }}
                >
                  Đăng nhập
                </Button>
              )}
            </Toolbar>
          </AppBar>

          {/* MAIN MENU */}
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
            <Button size="small" component={Link} href="/">
              Trang chủ
            </Button>
            <Button size="small" component={Link} href="/qa">
              Hỏi đáp
            </Button>
            <Button size="small" component={Link} href="/chat">
              Chatbox
            </Button>
          </Box>

          {/* MARQUEE */}
          <Box
            sx={{
              width: "100%",
              bgcolor: "primary.main",
              color: "primary.contrastText",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            <Typography
              component="div"
              sx={{
                display: "inline-block",
                px: 2,
                py: 0.5,
                animation: "marquee 18s linear infinite",
                fontSize: 14,
              }}
            >
              Mọi góp ý xin gửi về sucvatlaixe@gmail.com
            </Typography>
          </Box>

          {/* CONTENT */}
          <Box component="main" sx={{ flex: 1 }}>
            {children}
          </Box>

          {/* FOOTER */}
          <Box
            component="footer"
            sx={{
              mt: 4,
              py: 2,
              textAlign: "center",
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} Óc chó lái xe
            </Typography>
          </Box>
        </Box>

        {/* PROFILE DIALOG */}
        <Dialog open={profileOpen} onClose={() => setProfileOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Hồ sơ người dùng</DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box component="fieldset" sx={{ border: "1px solid #ccc", borderRadius: 2, p: 2 }}>
              <Typography component="legend" sx={{ px: 1, fontSize: 14, fontWeight: 600 }}>
                Thông tin cá nhân
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                <TextField
                  label="Email"
                  value={user?.email || ""}
                  fullWidth
                  disabled
                  InputProps={{ sx: { bgcolor: "#f5f5f5" } }}
                />

                <TextField
                  label="Tên hiển thị"
                  value={profileName}
                  fullWidth
                  onChange={(e) => setProfileName(e.target.value)}
                />

                <TextField
                  label="Avatar URL"
                  value={profileAvatar}
                  fullWidth
                  onChange={(e) => setProfileAvatar(e.target.value)}
                />
              </Box>
            </Box>

            <Box component="fieldset" sx={{ border: "1px solid #ccc", borderRadius: 2, p: 2 }}>
              <Typography component="legend" sx={{ px: 1, fontSize: 14, fontWeight: 600 }}>
                Đổi mật khẩu
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                <TextField
                  type="password"
                  label="Mật khẩu mới"
                  value={profileNewPassword}
                  fullWidth
                  onChange={(e) => setProfileNewPassword(e.target.value)}
                />

                <TextField
                  type="password"
                  label="Nhập lại mật khẩu"
                  value={profileConfirmPassword}
                  fullWidth
                  onChange={(e) => setProfileConfirmPassword(e.target.value)}
                />
              </Box>
            </Box>

            {profileError && (
              <Typography color="error" variant="body2">
                {profileError}
              </Typography>
            )}
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setProfileOpen(false)}>Đóng</Button>
            <Button variant="contained" disabled={profileSaving} onClick={handleUpdateProfile}>
              {profileSaving ? "Đang lưu..." : "Cập nhật"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* GLOBAL AUTH DIALOG */}
        <AuthDialog
          open={openAuth}
          onClose={() => setOpenAuth(false)}
          onAuthSuccess={({ user: u }) => {
            setUser({
              id: u.id,
              email: u.email,
              displayName: u.displayName,
              avatarUrl: u.avatarUrl,
              rank: u.rank,
              points: u.points,
              joinedAt: u.joinedAt,
              postCount: u.postCount,
              role: u.role,
            });
            setOpenAuth(false);
          }}
        />

        {/* GLOBAL STYLES */}
        <style jsx global>{`
          @keyframes marquee {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
        `}</style>

      </ThemeProvider>
      <ToastContainer />
    </AppRouterCacheProvider>
  );
}
