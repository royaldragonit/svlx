export type ReportMediaDTO = {
  mediaType: "image" | "video" | "other"
  url: string
}

export type ReportDTO = {
  id: number
  title: string
  plateNumber: string
  description: string
  type: string
  location: string
  reportCategory: string | null
  likeCount: number
  commentCount: number
  shareCount: number
  image: string | null
  media: ReportMediaDTO[]
  authorId: number
  authorName: string
  authorRank: string
  avatar: string
  createdAt: string
  likedByCurrentUser: boolean
}
