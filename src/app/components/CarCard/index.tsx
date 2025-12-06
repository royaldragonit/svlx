"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  Box,
  Typography,
  Divider,
  IconButton,
  Dialog,
} from "@mui/material"
import {
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  ShareOutlined as ShareOutlinedIcon,
  Close as CloseIcon,
} from "@mui/icons-material"
import Link from "next/link"
import CommentList from "../Comments/CommentList"
import CommentComposer from "../Comments/CommentComposer"
import { truncateText } from "@/app/utils/textUtils"
import { ReportDTO } from "@/app/api/reports/dto/report.dto"

type Props = {
  car: ReportDTO
  liked: boolean
  likeDisplay: number
  commentDisplay: number
  comments: any[]
  openComments: boolean
  toggleLike: () => void
  toggleCommentPanel: () => void
  handleSubmitComment: (text: string, files: File[]) => void
  onShare?: () => void
}

function getRankColor(rank: string | undefined | null) {
  if (!rank) return "text.secondary"
  if (rank.includes("Kim cương")) return "#0ea5e9"
  if (rank.includes("Bạch kim")) return "#6366f1"
  if (rank.includes("Vàng")) return "#eab308"
  return "#6b7280"
}

export default function CarCard({
  car,
  liked,
  likeDisplay,
  commentDisplay,
  comments,
  openComments,
  toggleLike,
  toggleCommentPanel,
  handleSubmitComment,
  onShare,
}: Props) {
  const imageUrl = car.image
  const videoUrl =
    car.media?.find(m => m.mediaType === "video")?.url || undefined

  const [openImageViewer, setOpenImageViewer] = React.useState(false)

  const handleOpenImage = () => {
    if (!imageUrl) return
    setOpenImageViewer(true)
  }

  const handleCloseImage = () => {
    setOpenImageViewer(false)
  }

  const createdAtText = React.useMemo(() => {
    if (!car.createdAt) return ""
    const d = new Date(car.createdAt as any)
    if (Number.isNaN(d.getTime())) return car.createdAt as any
    return d.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }, [car.createdAt])

  return (
    <>
      <Card>
        <CardContent>

          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Box
              component="img"
              src={car.avatar || "/default-avatar.png"}
              alt={car.authorName}
              sx={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                objectFit: "cover",
                mr: 1.2,
              }}
            />

            <Box>
              <Typography
                component={Link}
                href={`/user/${car.authorId}`}
                sx={{
                  fontWeight: 700,
                  color: "#2563eb",
                  textDecoration: "none",
                }}
              >
                {car.authorName}
              </Typography>

              <Typography
                sx={{
                  fontSize: 12,
                  color: getRankColor(car.authorRank),
                  fontWeight: 600,
                }}
              >
                {car.authorRank}
              </Typography>
            </Box>
          </Box>

          <Typography variant="caption" color="text.secondary">
            {createdAtText}
          </Typography>

          <Typography variant="h6" sx={{ mt: 1 }}>
            <Box component="span" sx={{ fontWeight: 600, color: "#eb4444ff" }}>
              <Link href={`/bien-so/${car.plateNumber}`}>
                [{car.plateNumber}]
              </Link>
            </Box>
            <Box component="span" sx={{ fontWeight: 600 }}>
              {" - "}
              {car.title}
            </Box>
          </Typography>

          <Typography variant="body1" sx={{ mt: 1 }}>
            {truncateText(car.description, 350)}
          </Typography>

          {(() => {
            const img = imageUrl
            const vid = videoUrl

            if (img && vid) {
              return (
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    mt: 1.5,
                    height: { xs: 220, sm: 320, md: 420 },
                  }}
                >
                  <Box
                    component="img"
                    src={img}
                    onClick={handleOpenImage}
                    sx={{
                      width: "50%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: 1,
                      cursor: "pointer",
                    }}
                  />
                  <Box
                    component="video"
                    src={vid}
                    controls
                    muted
                    sx={{
                      width: "50%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: 1,
                    }}
                  />
                </Box>
              )
            }

            if (img) {
              return (
                <Box
                  component="img"
                  src={img}
                  onClick={handleOpenImage}
                  sx={{
                    mt: 1.5,
                    width: "100%",
                    height: { xs: 260, sm: 380, md: 480 },
                    objectFit: "cover",
                    borderRadius: 1,
                    cursor: "pointer",
                  }}
                />
              )
            }

            if (vid) {
              return (
                <Box
                  component="video"
                  src={vid}
                  controls
                  muted
                  sx={{
                    mt: 1.5,
                    width: "100%",
                    height: { xs: 260, sm: 380, md: 480 },
                    objectFit: "cover",
                    borderRadius: 1,
                  }}
                />
              )
            }

            return null
          })()}

          <Box sx={{ mt: 1.5 }}>
            <Typography variant="caption" color="text.secondary">
              {likeDisplay} thích • {commentDisplay} bình luận • {car.shareCount} chia sẻ
            </Typography>
          </Box>

          <Divider sx={{ mt: 1, mb: 1 }} />

          <Box sx={{ display: "flex", justifyContent: "space-around" }}>
            <IconButton onClick={toggleLike}>
              {liked ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
            </IconButton>

            <IconButton onClick={toggleCommentPanel}>
              <ChatBubbleOutlineIcon />
            </IconButton>

            <IconButton onClick={onShare}>
              <ShareOutlinedIcon />
            </IconButton>
          </Box>

          {openComments && (
            <>
              <Divider sx={{ mt: 1 }} />
              <CommentList comments={comments} />
              <Divider />
              <CommentComposer
                open
                onClose={toggleCommentPanel}
                onSubmit={handleSubmitComment}
              />
            </>
          )}

        </CardContent>
      </Card>

      {imageUrl && (
        <Dialog
          open={openImageViewer}
          onClose={handleCloseImage}
          fullScreen
          PaperProps={{
            sx: { bgcolor: "rgba(0,0,0,0.95)" },
          }}
        >
          <Box
            sx={{
              position: "fixed",
              top: 16,
              right: 16,
              zIndex: 10,
            }}
          >
            <IconButton
              onClick={handleCloseImage}
              sx={{
                bgcolor: "rgba(0,0,0,0.6)",
                "&:hover": { bgcolor: "rgba(0,0,0,0.9)" },
              }}
            >
              <CloseIcon sx={{ color: "#fff" }} />
            </IconButton>
          </Box>

          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 2,
            }}
          >
            <Box
              component="img"
              src={imageUrl}
              alt={car.title}
              sx={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          </Box>
        </Dialog>
      )}
    </>
  )
}
