import { Item } from "./types";

const esc = (s: string) =>
  (s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const formatWon = (n: number | null) =>
  typeof n === "number" ? `${n.toLocaleString("ko-KR")}원` : "";

const calcRate = (price: number | null, sale: number | null) => {
  if (!price || !sale) return null;
  if (sale >= price) return null;
  return Math.round(((price - sale) / price) * 100);
};

export function buildBoriboriHtml(items: Item[], bannerText: string) {
  const css = `
.oz3-wrap{max-width:980px;margin:0 auto;padding:16px;border:8px solid #f2b400;border-radius:24px;background:#fff;}
.oz3-banner{text-align:center;font-weight:900;margin-bottom:16px;font-size:16px;}
.oz3-grid{display:flex;flex-wrap:wrap;gap:16px;}
.oz3-card{width:calc(50% - 8px);border:2px solid #f2b400;border-radius:18px;overflow:hidden;position:relative;}
.oz3-number{position:absolute;top:10px;left:10px;font-weight:900;font-size:18px;color:#f2b400;}
.oz3-img{width:100%;aspect-ratio:1/1;object-fit:cover;}
.oz3-body{padding:12px;}
.oz3-name{font-weight:900;margin-bottom:6px;}
.oz3-price{color:#e11d48;font-weight:900;font-size:18px;}
.oz3-origin{color:#888;text-decoration:line-through;font-size:13px;margin-left:6px;}
.oz3-rate{font-size:20px;font-weight:900;color:#f97316;margin-right:6px;}
`;

  const cards = items
    .map((it, idx) => {
      const rate = calcRate(it.price, it.salePrice);

      return `
<div class="oz3-card">
  <div class="oz3-number">${String(idx + 1).padStart(2, "0")}</div>
  <a href="${esc(it.linkUrl || "#")}" target="_blank">
    <img class="oz3-img" src="${esc(it.imageUrl)}" alt="${esc(it.name)}"/>
    <div class="oz3-body">
      <div class="oz3-name">${esc(it.name)}</div>
      ${
        rate
          ? `<div><span class="oz3-rate">${rate}%</span>
             <span class="oz3-price">${formatWon(it.salePrice)}</span>
             <span class="oz3-origin">${formatWon(it.price)}</span></div>`
          : `<div class="oz3-price">${
              formatWon(it.salePrice ?? it.price)
            }</div>`
      }
      <div>${esc(it.option1)}</div>
      <div>${esc(it.option2)}</div>
    </div>
  </a>
</div>
`;
    })
    .join("");

  return `
<div class="oz3-wrap">
<style>${css}</style>
<div class="oz3-banner">${esc(bannerText)}</div>
<div class="oz3-grid">
${cards}
</div>
</div>
`;
}