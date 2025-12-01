// page.tsx
import { Suspense } from "react";
import HomePageClient from "./HomePageClient";

export default function Page() {
  return (
    <Suspense>
      <HomePageClient />
    </Suspense>
  );
}
