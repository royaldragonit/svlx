export type ChatMessage = {
  id: number;
  userId: number;
  userName: string;
  avatarUrl?: string | null;
  rank: string;
  points: number;
  joinedAt: string;
  posts: number;
  text: string;
  imageData?: string | null;
  createdAt: string;
};

export type OnlineUser = {
  id: number;
  name: string;
  avatar: string | null;
  rank: string;
};
