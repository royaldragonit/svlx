import type { Metadata } from "next";
import MuiProviders from "./MuiProviders";

export const metadata: Metadata = {
  title: "Súc vật lái xe",
  description: "Report mấy thằng lái xe ngu",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <MuiProviders>{children}</MuiProviders>
      </body>
    </html>
  );
}
