// app/lib/types.ts

export type ThemeKey =
  | "yellowFrame"
  | "cleanWhite"
  | "pastelBlue"
  | "pastelPink"
  | "pastelMint"
  |"yellow"
  |"clean";

export type Theme = {
  key: ThemeKey;
  name: string;

  // 프레임/테두리/배경 (배경과 테두리를 "완전 동일"하게 맞추기 위해 같은 컬러를 씀)
  frame: string; // 진한 테두리색
  frameBg: string; // 프레임 배경색 (테두리색과 동일하게)
  innerBg: string; // 카드 바탕(흰색)

  // 텍스트
  text: string;
  subtext: string;

  // 가격/할인
  sale: string; // 할인가 컬러
  rate: string; // 할인율 컬러

  // 뱃지
  badgeBorder: string;
  badgeBg: string; // 보통 흰색
  badgeNew: string; // NEW 글자색(파랑)
  badgeHot: string; // HOT 글자색(빨강)

  // 카드 라인
  line: string; // 카드 사이 선 색
};

export const THEMES: Theme[] = [
  {
    key: "yellowFrame",
    name: "옐로 프레임",
    frame: "#E2B33B",
    frameBg: "#E2B33B", // ✅ 테두리색과 완전 동일
    innerBg: "#FFFFFF",
    text: "#111111",
    subtext: "#5A5A5A",
    sale: "#D33A2C",
    rate: "#D33A2C",
    badgeBorder: "#E9E9E9",
    badgeBg: "#FFFFFF",
    badgeNew: "#1E64E8", // ✅ NEW 파랑
    badgeHot: "#E53935", // ✅ HOT 빨강
    line: "#E2B33B", // ✅ 카드 구분선도 프레임 톤으로
  },
  {
    key: "cleanWhite",
    name: "깔끔 화이트",
    frame: "#E6E6E6",
    frameBg: "#E6E6E6",
    innerBg: "#FFFFFF",
    text: "#111111",
    subtext: "#666666",
    sale: "#D33A2C",
    rate: "#D33A2C",
    badgeBorder: "#E5E7EB",
    badgeBg: "#FFFFFF",
    badgeNew: "#1E64E8",
    badgeHot: "#E53935",
    line: "#E6E6E6",
  },
  {
    key: "pastelBlue",
    name: "파스텔 블루",
    frame: "#9EC9FF",
    frameBg: "#9EC9FF",
    innerBg: "#FFFFFF",
    text: "#111111",
    subtext: "#60656D",
    sale: "#D33A2C",
    rate: "#D33A2C",
    badgeBorder: "#E9E9E9",
    badgeBg: "#FFFFFF",
    badgeNew: "#1E64E8",
    badgeHot: "#E53935",
    line: "#9EC9FF",
  },
  {
    key: "pastelPink",
    name: "파스텔 핑크",
    frame: "#FFB7C7",
    frameBg: "#FFB7C7",
    innerBg: "#FFFFFF",
    text: "#111111",
    subtext: "#60656D",
    sale: "#D33A2C",
    rate: "#D33A2C",
    badgeBorder: "#E9E9E9",
    badgeBg: "#FFFFFF",
    badgeNew: "#1E64E8",
    badgeHot: "#E53935",
    line: "#FFB7C7",
  },
  {
    key: "pastelMint",
    name: "파스텔 민트",
    frame: "#AEE7D5",
    frameBg: "#AEE7D5",
    innerBg: "#FFFFFF",
    text: "#111111",
    subtext: "#60656D",
    sale: "#D33A2C",
    rate: "#D33A2C",
    badgeBorder: "#E9E9E9",
    badgeBg: "#FFFFFF",
    badgeNew: "#1E64E8",
    badgeHot: "#E53935",
    line: "#AEE7D5",
  },
];

export type Item = {
  id: string;
  name: string;
  imageUrl: string;
  linkUrl: string;

  price: number | null; // 정상가
  sale: number | null; // 할인가
  rate?: number | null; // 할인율(없으면 자동계산)

  opt1: string; // COLOR 값
  opt2: string; // SIZE 값
  badge?: string; // NEW/HOT (빈값 가능)
};