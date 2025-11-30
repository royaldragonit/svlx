import { CommentItem } from "../components/Comments/types";

export const initialComments: Record<string, CommentItem[]> = {
  "Xe 123": [
    {
      id: "c1",
      text: "Lái ẩu quá, cần xử lý.",
      media: [],
      createdAt: Date.now() - 3600_000,
      authorName: "Nguyễn Văn A",
      authorRank: "Vàng",
    },
    {
      id: "c2",
      text: "Mình thấy lúc 7h sáng cũng vậy.",
      media: [],
      createdAt: Date.now() - 7200_000,
      authorName: "Trần Thị B",
      authorRank: "Bạc",
    },
  ],
  "Xe 456": [
    {
      id: "c3",
      text: "Đã báo công an phường.",
      media: [],
      createdAt: Date.now() - 5400_000,
      authorName: "Lê Minh C",
      authorRank: "Kim Cương",
    },
  ],
};
