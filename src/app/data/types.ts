export type CarItem = {
  name: string;
  reportCount: number;
  type: string;
  location: string;
  reportCategory: "Mới Cập Nhật" | "Nhiều Report";
  image: string;
  description: string;
  videoCount: number;
  imageCount: number;
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
  authorName: string;
  authorRank: "Bạc" | "Vàng" | "Kim Cương";
  createdAt: string;
  authorId: number;
};
