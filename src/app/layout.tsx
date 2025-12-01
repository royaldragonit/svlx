// src/app/layout.tsx
import type { Metadata } from "next";
import MuiProviders from "./MuiProviders";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://sucvatlaixe.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Súc vật lái xe – Tố cáo tài xế nguy hiểm",
    template: "%s | Súc vật lái xe",
  },
  description:
    "Trang cộng đồng tố cáo, report các tài xế lái xe nguy hiểm, đỗ xe ngu, đỗ xe óc chó. Tìm biển số, xem lịch sử vi phạm và chia sẻ để mọi người cùng né.",
  keywords: [
    "súc vật lái xe",
    "report tài xế",
    "tố cáo lái xe",
    "biển số xe",
    "tai nạn giao thông",
    "lái xe ẩu",
    "lái xe nguy hiểm",
    "đỗ xe ngu",
    "đỗ xe óc chó",
    "đậu xe ngu",
    "đỗ xe chắn lối",
  ],
  authors: [{ name: "Súc vật lái xe" }],
  creator: "Súc vật lái xe",
  publisher: "Súc vật lái xe",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: "Súc vật lái xe – Tố cáo tài xế nguy hiểm",
    description:
      "Cùng cộng đồng report những tài xế lái xe ẩu, đỗ xe ngu, đỗ xe óc chó. Tra cứu biển số, xem thông tin report và chia sẻ để cảnh báo người khác.",
    url: siteUrl,
    siteName: "Súc vật lái xe",
    locale: "vi_VN",
    type: "website",
    images: [
      {
        url: "/svlx.png",
        width: 1200,
        height: 630,
        alt: "Súc vật lái xe",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Súc vật lái xe – Tố cáo tài xế nguy hiểm",
    description:
      "Cộng đồng report tài xế lái xe nguy hiểm, đỗ xe ngu, tra cứu biển số và chia sẻ cảnh báo.",
    images: ["/svlx.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <MuiProviders>{children}</MuiProviders>
      </body>
    </html>
  );
}
