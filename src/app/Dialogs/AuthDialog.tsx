"use client";

import {
    Dialog,
    Box,
    Typography,
    TextField,
    Button,
    IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FacebookRoundedIcon from "@mui/icons-material/FacebookRounded";
import MicrosoftIcon from "@mui/icons-material/Window";
import GoogleIcon from "@mui/icons-material/Google";
import * as React from "react";

type AuthMode = "login" | "register";

type AuthDialogProps = {
    open: boolean;
    onClose: () => void;
    onAuthSuccess?: (payload: { token: string; user: any }) => void;
};

export default function AuthDialog({ open, onClose, onAuthSuccess }: AuthDialogProps) {
    const [mode, setMode] = React.useState<AuthMode>("login");
    const [loading, setLoading] = React.useState(false);
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [fullName, setFullName] = React.useState("");
    const [confirmPassword, setConfirmPassword] = React.useState("");
    const [error, setError] = React.useState("");

    const isLogin = mode === "login";

    const resetForm = () => {
        setEmail("");
        setPassword("");
        setFullName("");
        setConfirmPassword("");
        setError("");
    };

    const handleClose = () => {
        if (loading) return;
        resetForm();
        onClose();
    };

    const handleSubmit = async () => {
        setError("");
        if (!email || !password) {
            setError("Vui lòng nhập đầy đủ email và mật khẩu");
            return;
        }
        if (!isLogin && password !== confirmPassword) {
            setError("Mật khẩu nhập lại không khớp");
            return;
        }
        setLoading(true);
        try {
            const url = isLogin ? "/api/auth/login" : "/api/auth/register";
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    password,
                    displayName: fullName || undefined,
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setError(data.error || "Có lỗi xảy ra, thử lại sau");
                setLoading(false);
                return;
            }
            const data = await res.json();
            onAuthSuccess?.(data);
            setLoading(false);
            handleClose();
        } catch (e) {
            setError("Không thể kết nối máy chủ");
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        if (loading) return;
        window.location.href = "/api/auth/google";
    };

    const handleFacebookLogin = () => {
        if (loading) return;
        window.location.href = "/api/auth/facebook";
    };

    const handleMicrosoftLogin = () => {
        if (loading) return;
        window.location.href = "/api/auth/microsoft";
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            PaperProps={{
                sx: {
                    bgcolor: "transparent",
                    boxShadow: "none",
                },
            }}
        >
            <Box
                sx={{
                    position: "relative",
                    width: "90%",
                    maxWidth: 380,
                    bgcolor: "#f5f3ff",
                    borderRadius: 4,
                    p: 3,
                    color: "#1b1433",
                    boxShadow: "0 24px 80px rgba(15,23,42,0.35)",
                }}
            >
                <IconButton
                    onClick={handleClose}
                    sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        color: "#6b7280",
                    }}
                >
                    <CloseIcon />
                </IconButton>

                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 2,
                            bgcolor: "#7c4dff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: 18,
                            color: "#ffffff",
                        }}
                    >
                        SV
                    </Box>
                    <Typography sx={{ ml: 1.5, fontWeight: 700, fontSize: 18, color: "#111827" }}>
                        Súc Vật Lái Xe
                    </Typography>
                </Box>

                <Typography sx={{ fontSize: 22, fontWeight: 700, mb: 0.5, color: "#111827" }}>
                    {isLogin ? "Chào mừng quay lại" : "Tạo tài khoản mới"}
                </Typography>
                <Typography sx={{ fontSize: 13, color: "#6b7280", mb: 3 }}>
                    {isLogin
                        ? "Đăng nhập để bắt đầu bóc phốt mấy thằng lái xe ngu."
                        : "Đăng ký tài khoản để lưu lại lịch sử report của bạn."}
                </Typography>

                {!isLogin && (
                    <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        label="Họ và tên"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        sx={{
                            mb: 1.5,
                            "& .MuiInputBase-root": {
                                bgcolor: "#ffffff",
                                color: "#111827",
                            },
                        }}
                    />
                )}

                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    label="Email"
                    type="email"
                    autoComplete="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{
                        mb: 1.5,
                        "& .MuiInputBase-root": {
                            bgcolor: "#ffffff",
                            color: "#111827",
                        },
                    }}
                />

                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    label="Mật khẩu"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={{
                        mb: isLogin ? 1.5 : 1,
                        "& .MuiInputBase-root": {
                            bgcolor: "#ffffff",
                            color: "#111827",
                        },
                    }}
                />

                {!isLogin && (
                    <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        label="Nhập lại mật khẩu"
                        autoComplete="off"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        sx={{
                            mb: 1.5,
                            "& .MuiInputBase-root": {
                                bgcolor: "#ffffff",
                                color: "#111827",
                            },
                        }}
                    />
                )}

                {isLogin && (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            mb: 1.5,
                        }}
                    >
                        <Button
                            variant="text"
                            sx={{
                                p: 0,
                                minWidth: 0,
                                fontSize: 12,
                                textTransform: "none",
                                color: "#6366f1",
                            }}
                        >
                            Quên mật khẩu?
                        </Button>
                    </Box>
                )}

                {error && (
                    <Typography
                        sx={{
                            color: "#b91c1c",
                            fontSize: 12,
                            mb: 1,
                        }}
                    >
                        {error}
                    </Typography>
                )}

                <Button
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    onClick={handleSubmit}
                    sx={{
                        mt: 0.5,
                        mb: 2,
                        textTransform: "none",
                        fontWeight: 600,
                        bgcolor: "#7c4dff",
                        "&:hover": { bgcolor: "#6d28d9" },
                    }}
                >
                    {isLogin ? "Đăng nhập" : "Đăng ký"}
                </Button>

                <Typography
                    sx={{
                        fontSize: 12,
                        textAlign: "center",
                        color: "#6b7280",
                        mb: 1.5,
                    }}
                >
                    Hoặc tiếp tục với
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        gap: 1.5,
                        mb: 2,
                    }}
                >
                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<MicrosoftIcon />}
                        onClick={handleMicrosoftLogin}
                        sx={{
                            textTransform: "none",
                            borderRadius: 2,
                            borderColor: "#e5e7eb",
                            color: "#111827",
                            bgcolor: "#ffffff",
                            "&:hover": {
                                bgcolor: "#e5f0ff",
                                borderColor: "#bfdbfe",
                            },
                            fontSize: 13,
                        }}
                    >
                        Microsoft
                    </Button>

                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<GoogleIcon />}
                        onClick={handleGoogleLogin}
                        sx={{
                            textTransform: "none",
                            borderRadius: 2,
                            borderColor: "#e5e7eb",
                            color: "#374151",
                            bgcolor: "#ffffff",
                            "&:hover": {
                                bgcolor: "#f3f4f6",
                                borderColor: "#d1d5db",
                            },
                            fontSize: 13,
                        }}
                    >
                        Google
                    </Button>
                </Box>

                <Box sx={{ textAlign: "center", fontSize: 13, color: "#4b5563" }}>
                    {isLogin ? (
                        <>
                            Chưa có tài khoản?{" "}
                            <Button
                                variant="text"
                                onClick={() => {
                                    setMode("register");
                                    setError("");
                                }}
                                sx={{
                                    p: 0,
                                    minWidth: 0,
                                    textTransform: "none",
                                    fontSize: 13,
                                    color: "#6366f1",
                                }}
                            >
                                Đăng ký
                            </Button>
                        </>
                    ) : (
                        <>
                            Đã có tài khoản?{" "}
                            <Button
                                variant="text"
                                onClick={() => {
                                    setMode("login");
                                    setError("");
                                }}
                                sx={{
                                    p: 0,
                                    minWidth: 0,
                                    textTransform: "none",
                                    fontSize: 13,
                                    color: "#6366f1",
                                }}
                            >
                                Đăng nhập
                            </Button>
                        </>
                    )}
                </Box>
            </Box>
        </Dialog>
    );
}
