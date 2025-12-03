// src/app/components/Comments/types.ts
export type CommentMedia = {
  url: string;
  type: "image" | "video" | "other";
  name?: string;
};

export type CommentItem = {
  id: string;
  text: string;
  media: CommentMedia[];
  createdAt: number;
  authorName: string;
  avatar: string;
  authorRank: string;
};


export type CommentComposerProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (text: string, files: File[]) => void;
};
