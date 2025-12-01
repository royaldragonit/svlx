"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { CssBaseline, ThemeProvider, createTheme, Box, Typography } from "@mui/material";
import * as React from "react";

const theme = createTheme({});

export default function MuiProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          {/* Marquee */}
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
              🔔 Mọi góp ý tưởng về giao diện/tính năng, xin được lắng nghe tại sucvatlaixe@gmail.com ạ. 🔔
            </Typography>
          </Box>

          {/* Nội dung chính */}
          <Box component="main" sx={{ flex: 1 }}>
            {children}
          </Box>

          {/* Footer */}
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
              © {new Date().getFullYear()} Your Site Name. All rights reserved.
            </Typography>
          </Box>
        </div>

        {/* Animation marquee */}
        <style jsx global>{`
          @keyframes marquee {
            0% {
              transform: translateX(100%);
            }
            100% {
              transform: translateX(-100%);
            }
          }
        `}</style>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
