// app/lib/types.ts

export type ThemeKey =
  | "yellowFrame"
  | "cleanWhite"
  | "pastelBlue"
  | "pastelPink"
  | "pastelMint";

export type Item = {
  id: string;
  name: string;
  imageUrl: string;
  linkUrl: string;

  price: number | null; // 정상가
  sale: number | null; // 할인가
  rate: number | null; // 할인율 (없으면 자동 계산)

  opt1: string; // 옵션1 값
  opt2: string; // 옵션2 값
  badge: "" | "NEW" | "HOT";
};