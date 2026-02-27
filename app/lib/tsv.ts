import { Item } from "./types";

const toNum = (v: string) => {
  const s = (v ?? "").toString().replace(/[^\d]/g, "");
  return s ? Number(s) : null;
};

export function parseTsv(tsv: string): Omit<Item, "id">[] {
  const raw = (tsv ?? "").trim();
  if (!raw) return [];

  const lines = raw.split(/\r?\n/).filter(Boolean);
  const rows = lines.map((l) => l.split("\t"));

  const firstLine = rows[0]?.join(" ") ?? "";
  const looksHeader =
    /상품명|이미지|링크|정상가|할인가|옵션|아이콘/i.test(firstLine);

  const data = looksHeader ? rows.slice(1) : rows;

  return data
    .map((c) => {
      const icon = (c[8] ?? "").toUpperCase();
      return {
        name: c[0] ?? "",
        imageUrl: c[1] ?? "",
        linkUrl: c[2] ?? "",
        price: toNum(c[3] ?? ""),
        salePrice: toNum(c[4] ?? ""),
        option1: c[6] ?? "",
        option2: c[7] ?? "",
        badgeNew: icon.includes("NEW"),
        badgeHot: icon.includes("HOT"),
      };
    })
    .filter((r) => r.name || r.imageUrl || r.linkUrl);
}