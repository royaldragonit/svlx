// src/lib/points.ts
export function calcReportPoint(hasImage: boolean, hasVideo: boolean) {
  if (hasImage && hasVideo) return 15;
  if (hasVideo) return 13;
  if (hasImage) return 12;
  return 10;
}

export function calcCommentPoint(hasMedia: boolean, content: string) {
  const len = content.trim().length;
  if (len < 3) return 0;
  if (hasMedia) return 5;
  if (len >= 10) return 2;
  return 1;
}

export function getRank(points: number): string {
  if (points >= 700) return "Kim cương";
  if (points >= 300) return "Bạch kim";
  if (points >= 100) return "Vàng";
  return "Bạc";
}
