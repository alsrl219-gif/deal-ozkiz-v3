// app/lib/tsv.ts

export type TsvRow = {
  name: string;
  imageUrl: string;
  linkUrl: string;
  price: number | null;
  sale: number | null;
  rate: number | null;
  opt1: string;
  opt2: string;
  badge?: string; // ✅ 추가 (NEW/HOT)
};

function numOnly(x: string): number | null {
  const s = String(x ?? "").replace(/[^\d]/g, "");
  return s ? Number(s) : null;
}

export function parseTsv(raw: string): TsvRow[] {
  const text = (raw ?? "").trim();
  if (!text) return [];

  const lines = text.split(/\r?\n/).filter(Boolean);

  // 헤더가 있으면 제거(대충 감지)
  const first = (lines[0] ?? "").toLowerCase();
  const hasHeader =
    first.includes("상품명") ||
    first.includes("image") ||
    first.includes("이미지") ||
    first.includes("링크");

  const rows = (hasHeader ? lines.slice(1) : lines).map((line) => line.split("\t"));

  return rows.map((c) => ({
    name: (c[0] ?? "").trim(),
    imageUrl: (c[1] ?? "").trim(),
    linkUrl: (c[2] ?? "").trim(),
    price: c[3] ? numOnly(c[3]) : null,
    sale: c[4] ? numOnly(c[4]) : null,
    rate: c[5] ? numOnly(c[5]) : null,
    opt1: (c[6] ?? "").trim(),
    opt2: (c[7] ?? "").trim(),
    badge: (c[8] ?? "").trim(), // ✅ 마지막 컬럼을 badge로
  }));
}