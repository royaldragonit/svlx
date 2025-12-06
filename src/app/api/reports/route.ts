import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { ReportDTO } from "./dto/report.dto"

function serializeBigInt(data: any) {
  return JSON.parse(
    JSON.stringify(data, (_k, v) => (typeof v === "bigint" ? Number(v) : v))
  )
}

function calcReportPoint(media: { kind?: string; mediaType?: string }[]): number {
  const hasImage = media.some(m => m.kind === "image" || m.mediaType === "image")
  const hasVideo = media.some(m => m.kind === "video" || m.mediaType === "video")
  if (hasImage && hasVideo) return 15
  if (hasVideo) return 13
  if (hasImage) return 12
  return 10
}

function getRank(points: number): string {
  if (points >= 700) return "Kim cương"
  if (points >= 300) return "Bạch kim"
  if (points >= 100) return "Vàng"
  return "Bạc"
}

function toDTO(r: any, liked: boolean): ReportDTO {
  const image =
    r.mainImageUrl ||
    (r.media?.find((m: any) => m.mediaType === "image")?.url ?? null)

  return {
    id: Number(r.id),
    title: r.title,
    plateNumber: r.plateNumber,
    description: r.description,
    type: r.carType || "",
    location: r.location || "",
    reportCategory: r.categoryTag || null,
    likeCount: r.likeCount ?? 0,
    commentCount: r._count?.comments ?? 0,
    shareCount: r.shareCount ?? 0,
    image,
    media: Array.isArray(r.media)
      ? r.media.map((m: any) => ({
          mediaType: m.mediaType,
          url: m.url,
        }))
      : [],
    authorId: Number(r.author?.id ?? 0),
    authorName: r.author?.displayName ?? "Ẩn danh",
    authorRank: r.author?.rank ?? "Bạc",
    avatar: r.author?.avatarUrl || "",
    createdAt: r.createdAt,
    likedByCurrentUser: liked,
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get("search")?.trim() || ""
  const sort = searchParams.get("sort")?.trim() || "latest"
  const reportIdParam = searchParams.get("report_id")

  const token = req.cookies.get("auth_token")?.value
  const payload = token ? verifyToken(token) : null
  const currentUserId = payload ? BigInt(payload.userId) : null

  if (reportIdParam) {
    try {
      const id = BigInt(reportIdParam)
      const report = await db.carReport.findUnique({
        where: { id },
        include: {
          author: true,
          media: true,
          _count: { select: { comments: true } },
        },
      })

      if (!report) return NextResponse.json([])

      let liked = false
      if (currentUserId) {
        const like = await db.userLike.findUnique({
          where: {
            userId_targetType_targetId: {
              userId: currentUserId,
              targetType: "report",
              targetId: report.id,
            },
          },
        })
        liked = !!like
      }

      const dto = toDTO(report, liked)
      return NextResponse.json(serializeBigInt([dto]))
    } catch {
      return NextResponse.json([])
    }
  }

  const where: any = {}

  if (search) {
    where.OR = [
      { plateNumber: { contains: search.toUpperCase(), mode: "insensitive" } },
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { location: { contains: search, mode: "insensitive" } },
    ]
  }

  const orderBy: any[] = []
  if (sort === "most_commented") {
    orderBy.push({ comments: { _count: "desc" } })
    orderBy.push({ createdAt: "desc" })
  } else {
    orderBy.push({ createdAt: "desc" })
  }

  const reports = await db.carReport.findMany({
    where,
    orderBy,
    take: 50,
    include: {
      author: true,
      media: true,
      _count: { select: { comments: true } },
    },
  })

  let likedMap = new Set<string>()
  if (currentUserId && reports.length > 0) {
    const ids = reports.map(r => r.id)
    const likes = await db.userLike.findMany({
      where: {
        userId: currentUserId,
        targetType: "report",
        targetId: { in: ids },
      },
      select: { targetId: true },
    })
    likedMap = new Set(likes.map(l => l.targetId.toString()))
  }

  const dtoList = reports.map(r =>
    toDTO(r, likedMap.has(r.id.toString()))
  )

  return NextResponse.json(serializeBigInt(dtoList))
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const bodyJson = await req.json()

    const title = (bodyJson.title || "").trim()
    const description = (bodyJson.body || "").trim()
    const tags = (bodyJson.tags || "").trim()
    const plateNumber = (bodyJson.plateNumber || "").trim()
    const plateRegex = /^[0-9]{2}[A-Z]-[0-9]{4,5}$/

    if (!plateRegex.test(plateNumber.toUpperCase())) {
      return NextResponse.json(
        { error: "Biển số không hợp lệ. Định dạng hợp lệ: 51F-12345" },
        { status: 400 }
      )
    }

    const carType = (bodyJson.carType || "").trim()
    const location = (bodyJson.location || "").trim()
    const media = Array.isArray(bodyJson.media) ? bodyJson.media : []

    if (!title && !description) {
      return NextResponse.json(
        { error: "Tiêu đề hoặc nội dung không được trống" },
        { status: 400 }
      )
    }

    const firstImage = media.find((m: any) => m.kind === "image")
    const authorId = BigInt(payload.userId)
    const reportPoints = calcReportPoint(media)

    const created = await db.$transaction(async tx => {
      const createdReport = await tx.carReport.create({
        data: {
          plateNumber: plateNumber,
          title,
          description,
          carType: carType,
          location: location,
          categoryTag: tags || null,
          mainImageUrl: firstImage?.url || null,
          authorId,
          likeCount: 0,
          shareCount: 0,
          media: {
            create: media.map((m: any) => ({
              mediaType: m.kind,
              url: m.url,
              fileName: m.fileName ?? null,
            })),
          },
        },
        include: {
          author: true,
          media: true,
          _count: { select: { comments: true } },
        },
      })

      const userAfterPoint = await tx.user.update({
        where: { id: authorId },
        data: {
          points: { increment: reportPoints },
          postCount: { increment: 1 },
        },
        select: { points: true },
      })

      const newRank = getRank(userAfterPoint.points)

      await tx.user.update({
        where: { id: authorId },
        data: { rank: newRank },
      })

      return createdReport
    })

    const dto = toDTO(created, false)
    return NextResponse.json(serializeBigInt(dto), { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
