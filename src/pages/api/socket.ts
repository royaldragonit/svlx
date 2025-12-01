import type { NextApiRequest, NextApiResponse } from "next";
import { Server as IOServer } from "socket.io";

type ChatUser = {
  id: number;
  name: string;
  avatar: string | null;
  rank: string;
  points: number;
  joinedAt: string;
  posts: number;
  role?: string;
};

type ChatMessage = {
  id: number;
  userId: number;
  userName: string;
  text: string;
  imageData: string | null;
  createdAt: string;
  avatarUrl?: string | null;
  rank?: string;
  points?: number;
  joinedAt?: string;
  posts?: number;
  role?: string;
};

type NextApiResponseWithIO = NextApiResponse & {
  socket: NextApiResponse["socket"] & {
    server: {
      io?: IOServer;
    };
  };
};

let MESSAGES: ChatMessage[] = [];
let onlineUsers = new Map<number, ChatUser>();

export default function handler(_req: NextApiRequest, res: NextApiResponseWithIO) {
  if (!res.socket.server.io) {
    const io = new IOServer(res.socket.server as any, {
      path: "/api/socket_io",
      maxHttpBufferSize: 5 * 1024 * 1024, // 5MB upload ảnh
    });

    res.socket.server.io = io;

    io.on("connection", (socket) => {
      // gửi lịch sử cho client mới
      socket.emit("chat:init", MESSAGES);

      // user online
      socket.on("user:online", (user: ChatUser) => {
        socket.data.userId = user.id;

        onlineUsers.set(user.id, user);
        io.emit("users:online", Array.from(onlineUsers.values()));
      });

      // disconnect
      socket.on("disconnect", () => {
        const id = socket.data.userId;
        if (id && onlineUsers.has(id)) {
          onlineUsers.delete(id);
          io.emit("users:online", Array.from(onlineUsers.values()));
        }
      });

      // nhận tin nhắn
      socket.on("chat:message", (raw) => {
        console.log("SERVER RECEIVED:", raw.imageData?.substring(0, 30));
        const text = (raw.text || "").toString().trim();
        const imageData =
          typeof raw.imageData === "string" && raw.imageData.startsWith("data:image")
            ? raw.imageData
            : null;

        const userId = Number(raw.userId);
        const userName = raw.userName || "Unknown";

        if (!userId || (!text && !imageData)) return;

        const info = onlineUsers.get(userId);

        const msg: ChatMessage = {
          id: Date.now(),
          userId,
          userName,
          text,
          imageData,
          createdAt: new Date().toISOString(),

          avatarUrl: info?.avatar ?? null,
          rank: info?.rank ?? "Bạc",
          points: info?.points ?? 0,
          joinedAt: info?.joinedAt ?? "",
          posts: info?.posts ?? 0,
          role: info?.role
        };

        MESSAGES.push(msg);
        if (MESSAGES.length > 200) MESSAGES = MESSAGES.slice(-200);

        io.emit("chat:message", msg);
      });
    });
  }

  res.end();
}
