// prisma/seed.ts
// DÙNG NHƯ JS THUẦN (require), KHÔNG DÙNG import/typing TS

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // clear data theo đúng thứ tự FK
  await prisma.userLike.deleteMany();
  await prisma.commentMedia.deleteMany();
  await prisma.reportMedia.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.carReport.deleteMany();
  await prisma.user.deleteMany();

  // ----- USERS -----
  const u1 = await prisma.user.create({
    data: {
      email: "demo1@sucvatlaixe.com",
      passwordHash: "hash-demo-1",
      displayName: "Demo 1",
      rank: "Bạc",
    },
  });
  const u2 = await prisma.user.create({
    data: {
      email: "demo2@sucvatlaixe.com",
      passwordHash: "hash-demo-2",
      displayName: "Demo 2",
      rank: "Vàng",
    },
  });
  const u3 = await prisma.user.create({
    data: {
      email: "demo3@sucvatlaixe.com",
      passwordHash: "hash-demo-3",
      displayName: "Demo 3",
      rank: "Kim Cương",
    },
  });

  // ----- REPORTS (12 cái) -----
  const r1 = await prisma.carReport.create({
    data: {
      authorId: u1.id,
      plateNumber: "51A-12345",
      title: "Đánh võng trên cầu",
      description:
        "Thằng này chạy như điên, đánh võng trên cầu vượt, suýt tông mấy xe phía trước.",
      carType: "Xe máy",
      location: "TP.HCM - Cầu Sài Gòn",
      categoryTag: "Mới Cập Nhật",
    },
  });
  const r2 = await prisma.carReport.create({
    data: {
      authorId: u1.id,
      plateNumber: "30G-56789",
      title: "Đỗ xe chắn cửa nhà",
      description:
        "Đỗ chắn hết cửa nhà người ta, gọi hoài không ra dắt, chủ nhà phải chờ gần 1 tiếng.",
      carType: "Ô tô",
      location: "Hà Nội - Cầu Giấy",
      categoryTag: "Nhiều Report",
    },
  });
  const r3 = await prisma.carReport.create({
    data: {
      authorId: u2.id,
      plateNumber: "59X1-88888",
      title: "Lấn làn, bóp còi inh ỏi",
      description:
        "Kẹt xe nhưng vẫn cố lấn làn, bóp còi liên tục gây ồn ào khó chịu.",
      carType: "Xe máy",
      location: "TP.HCM - Quận 1",
      categoryTag: "Mới Cập Nhật",
    },
  });
  const r4 = await prisma.carReport.create({
    data: {
      authorId: u2.id,
      plateNumber: "43A-01234",
      title: "Đua xe lúc nửa đêm",
      description:
        "Nhóm 4-5 xe nẹt pô, chạy tốc độ cao trong khu dân cư lúc hơn 1h sáng.",
      carType: "Ô tô",
      location: "Đà Nẵng - Hải Châu",
      categoryTag: "Nhiều Report",
    },
  });
  const r5 = await prisma.carReport.create({
    data: {
      authorId: u3.id,
      plateNumber: "50N1-43210",
      title: "Không nhường đường cho xe cấp cứu",
      description:
        "Xe cấp cứu xin đường rõ ràng nhưng vẫn cố chen, không chịu né.",
      carType: "Xe máy",
      location: "TP.HCM - Quốc lộ 13",
      categoryTag: "Nhiều Report",
    },
  });
  const r6 = await prisma.carReport.create({
    data: {
      authorId: u3.id,
      plateNumber: "29B-99999",
      title: "Quay đầu xe giữa hầm",
      description:
        "Tự nhiên dừng giữa hầm rồi quay đầu xe, cực kỳ nguy hiểm.",
      carType: "Ô tô",
      location: "Hà Nội - Hầm Kim Liên",
      categoryTag: "Mới Cập Nhật",
    },
  });
  const r7 = await prisma.carReport.create({
    data: {
      authorId: u1.id,
      plateNumber: "60C-123.45",
      title: "Xe tải chạy ẩu",
      description:
        "Xe tải chạy sát đuôi, thỉnh thoảng đánh lái bất ngờ.",
      carType: "Xe tải",
      location: "Đồng Nai",
      categoryTag: "Nhiều Report",
    },
  });
  const r8 = await prisma.carReport.create({
    data: {
      authorId: u2.id,
      plateNumber: "51F-54321",
      title: "Đỗ xe trên vạch người đi bộ",
      description:
        "Đèn đỏ mà vẫn tràn hết lên vạch dành cho người đi bộ.",
      carType: "Ô tô",
      location: "TP.HCM - Quận 3",
      categoryTag: "Mới Cập Nhật",
    },
  });
  const r9 = await prisma.carReport.create({
    data: {
      authorId: u2.id,
      plateNumber: "47H1-11111",
      title: "Chở hàng cồng kềnh",
      description:
        "Chở đồ phía sau dài cả mét, không có dây chằng, dễ rơi xuống đường.",
      carType: "Xe máy",
      location: "Đắk Lắk",
      categoryTag: "Mới Cập Nhật",
    },
  });
  const r10 = await prisma.carReport.create({
    data: {
      authorId: u3.id,
      plateNumber: "30E-22222",
      title: "Vượt đèn vàng như đèn xanh",
      description:
        "Đèn vàng là tăng ga vượt luôn, suýt tông xe phía bên kia.",
      carType: "Ô tô",
      location: "Hà Nội - Hoàn Kiếm",
      categoryTag: "Nhiều Report",
    },
  });
  const r11 = await prisma.carReport.create({
    data: {
      authorId: u1.id,
      plateNumber: "51H-33333",
      title: "Đi ngược chiều trong hẻm nhỏ",
      description:
        "Hẻm chỉ đủ một xe mà vẫn cố chạy ngược chiều, bắt người khác lùi.",
      carType: "Xe máy",
      location: "TP.HCM - Bình Thạnh",
      categoryTag: "Mới Cập Nhật",
    },
  });
  const r12 = await prisma.carReport.create({
    data: {
      authorId: u3.id,
      plateNumber: "72A-44444",
      title: "Vừa lái xe vừa bấm điện thoại",
      description:
        "Chạy chậm giữa đường, mắt nhìn điện thoại suốt, rất nguy hiểm.",
      carType: "Ô tô",
      location: "Vũng Tàu",
      categoryTag: "Mới Cập Nhật",
    },
  });

  // ----- COMMENTS -----
  const c1 = await prisma.comment.create({
    data: {
      reportId: r1.id,
      authorId: u2.id,
      content:
        "Thằng này quá nguy hiểm, nên report biển số cho công an giao thông.",
      likeCount: 2,
    },
  });
  const c2 = await prisma.comment.create({
    data: {
      reportId: r1.id,
      authorId: u3.id,
      content: "Tôi cũng gặp nó đoạn này rồi, chạy như điên.",
      likeCount: 1,
    },
  });
  const c3 = await prisma.comment.create({
    data: {
      reportId: r2.id,
      authorId: u1.id,
      content: "Đỗ kiểu này mà nhà có việc gấp thì sao ra được trời.",
      likeCount: 0,
    },
  });
  const c4 = await prisma.comment.create({
    data: {
      reportId: r3.id,
      authorId: u1.id,
      content: "Mỗi ngày đi làm đều gặp mấy đối tượng như thế này.",
      likeCount: 0,
    },
  });
  const c5 = await prisma.comment.create({
    data: {
      reportId: r5.id,
      authorId: u2.id,
      content: "Không nhường xe cấp cứu thì chịu rồi.",
      likeCount: 3,
    },
  });

  // ----- COMMENT MEDIA -----
  await prisma.commentMedia.createMany({
    data: [
      {
        commentId: c1.id,
        mediaType: "image",
        url: "https://example.com/comments/1/image1.jpg",
        fileName: "51A-12345-cau-saigon.jpg",
      },
      {
        commentId: c2.id,
        mediaType: "video",
        url: "https://example.com/comments/2/video1.mp4",
        fileName: "51A-12345-clip.mp4",
        durationSec: 15,
      },
      {
        commentId: c3.id,
        mediaType: "image",
        url: "https://example.com/comments/3/image1.jpg",
        fileName: "30G-56789-doxe.jpg",
      },
    ],
  });

  // ----- REPORT MEDIA -----
  await prisma.reportMedia.createMany({
    data: [
      {
        reportId: r1.id,
        mediaType: "image",
        url: "https://example.com/reports/1/img-main.jpg",
        fileName: "report-1-main.jpg",
      },
      {
        reportId: r2.id,
        mediaType: "image",
        url: "https://example.com/reports/2/img-main.jpg",
        fileName: "report-2-main.jpg",
      },
      {
        reportId: r4.id,
        mediaType: "video",
        url: "https://example.com/reports/4/duaxe.mp4",
        fileName: "duaxe.mp4",
        durationSec: 20,
      },
    ],
  });

  // ----- LIKES -----
  await prisma.userLike.createMany({
    data: [
      { userId: u1.id, targetType: "report", targetId: r1.id },
      { userId: u2.id, targetType: "report", targetId: r1.id },
      { userId: u3.id, targetType: "report", targetId: r2.id },
      { userId: u2.id, targetType: "report", targetId: r5.id },

      { userId: u1.id, targetType: "comment", targetId: c1.id },
      { userId: u3.id, targetType: "comment", targetId: c1.id },
      { userId: u3.id, targetType: "comment", targetId: c5.id },
    ],
  });

  console.log("Seed done");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
