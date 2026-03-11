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

  price: number | null;
  sale: number | null;
  rate: number | null;

  opt1: string;
  opt2: string;

  badge: "" | "NEW" | "HOT" | "특가" | "단독" | "오늘만" | "1+1";
};