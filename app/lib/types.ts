export type Item = {
  id: string;

  name: string;
  imageUrl: string;
  linkUrl: string;

  price: number | null;     // 정상가
  salePrice: number | null; // 할인가

  option1: string;
  option2: string;

  badgeNew: boolean;
  badgeHot: boolean;
};