import { NextRequest, NextResponse } from "next/server";

// 60 request / 60s / IP
const WINDOW_MS = 60_000;
const DEFAULT_MAX_REQUESTS = 60;

// memory per instance
const ipStore = new Map<string, number[]>();

function getIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // chỉ áp dụng /api
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // ✅ bỏ qua socket (handshake + engine.io)
  if (
    pathname === "/api/socket" ||              // route init
    pathname.startsWith("/api/socket_io")      // socket.io path
  ) {
    return NextResponse.next();
  }

  const ip = getIp(req);
  const now = Date.now();
  const timestamps = ipStore.get(ip) ?? [];

  const recent = timestamps.filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  ipStore.set(ip, recent);

  let max = DEFAULT_MAX_REQUESTS;

  // thắt chặt thêm cho POST report/comment/like
  if (pathname.startsWith("/api/reports") && req.method === "POST") {
    max = 20;
  }

  if (recent.length > max) {
    return new NextResponse(
      JSON.stringify({ error: "Too many requests, please slow down" }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": "60",
        },
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
