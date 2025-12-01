// pages/api/socket.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { Server as IOServer } from "socket.io";

type ChatMessage = {
  id: number;
  userId: string;
  userName: string;
  text: string;
  imageData?: string | null; // base64 data URL
  createdAt: string;
};

type NextApiResponseWithIO = NextApiResponse & {
  socket: NextApiResponse["socket"] & {
    server: {
      io?: IOServer;
    };
  };
};

let MESSAGES: ChatMessage[] = [];

export default function handler(_req: NextApiRequest, res: NextApiResponseWithIO) {
  if (!res.socket.server.io) {
    const io = new IOServer(res.socket.server as any, {
      path: "/api/socket_io",
    });

    res.socket.server.io = io;

    io.on("connection", (socket) => {
      // gửi lịch sử
      socket.emit("chat:init", MESSAGES);

      socket.on("chat:message", (raw: any) => {
        const text = (raw.text || "").toString().trim();
        const userId = (raw.userId || "").toString();
        const userName = (raw.userName || "Khách").toString();
        const imageData = raw.imageData ? String(raw.imageData) : null;

        if (!userId || (!text && !imageData)) return;

        const msg: ChatMessage = {
          id: Date.now(),
          userId,
          userName,
          text,
          imageData,
          createdAt: new Date().toISOString(),
        };

        MESSAGES.push(msg);
        if (MESSAGES.length > 200) {
          MESSAGES = MESSAGES.slice(-200); // giữ lại 200 tin mới nhất
        }

        io.emit("chat:message", msg);
      });
    });
  }

  res.end();
}
