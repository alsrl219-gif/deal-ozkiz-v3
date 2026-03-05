// app/lib/generateHtml.ts
import type { Item, ThemeKey } from "./types";

/* ============================= */
/* 유틸 */
/* ============================= */

function esc(s: unknown) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function numOnly(x: unknown) {
  const s = String(x ?? "").replace(/[^\d]/g, "");
  return s ? Number(s) : null;
}

function won(n: number | null) {
  if (!n) return "";
  return n.toLocaleString("ko-KR");
}

function calcRate(price: number | null, sale: number | null) {
  if (!price || !sale || price <= 0) return null;
  const r = Math.round(((price - sale) / price) * 100);
  if (!Number.isFinite(r)) return null;
  return Math.max(0, Math.min(99, r));
}

/* ============================= */
/* HTML 생성 */
/* ============================= */

export function buildBoriboriHtml(args: {
  bannerText: string;
  themeKey: ThemeKey;
  items: Item[];
}) {
  /* ===== 테마 (프레임색 = 라인색 완전 동일) ===== */
  const theme = (() => {
    switch (args.themeKey) {
      case "pastelBlue":
        return { frame: "#BFDDF5", line: "#BFDDF5" };
      case "pastelPink":
        return { frame: "#F2C7D3", line: "#F2C7D3" };
      case "pastelMint":
        return { frame: "#BFE8DC", line: "#BFE8DC" };

      case "clean":
      case "cleanWhite":
        return { frame: "#EAEAEA", line: "#EAEAEA" };

      case "yellow":
      case "yellowFrame":
      default:
        return { frame: "#E2B84A", line: "#E2B84A" };
    }
  })();

  const bannerText = esc(
    args.bannerText || "이미지를 클릭하면 상세이미지를 보실 수 있어요"
  );

  /* ============================= */
  /* CSS */
  /* ============================= */

  const css = `
.ozbbWrap{
  max-width:860px;
  margin:0 auto;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Noto Sans KR",Arial,sans-serif;
  color:#111;
}

/* 상단 문구: 테이블 형태 + 테두리 */
.ozbbNotice{
  width:100%;
  border-collapse:collapse;
  margin:0 0 10px 0;
}
.ozbbNotice td{
  border:2px solid ${theme.line};
  background:#fff;
  text-align:center;
  padding:12px 10px;
  font-size:18px;
  font-weight:800;
  letter-spacing:-0.02em;
}

/* 프레임 */
.ozbbFrame{
  background:${theme.frame};
  border-radius:26px;
  padding:10px;
  box-sizing:border-box;
}

/* 그리드 */
.ozbbGrid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:0;
  background:#fff;
  border:2px solid ${theme.line};
  border-radius:22px;
  overflow:hidden;
}

.ozbbCell{
  background:#fff;
  position:relative;
  box-sizing:border-box;
  border-right:2px solid ${theme.line};
  border-bottom:2px solid ${theme.line};
}

.ozbbCell:nth-child(2n){ border-right:0; }

.ozbbCell.lastRow{ border-bottom:0; }

.ozbbLink{
  display:block;
  text-decoration:none;
  color:inherit;
}

/* 이미지 */
.ozbbMedia{
  position:relative;
  background:#f6f6f6;
}
.ozbbImg{
  width:100%;
  aspect-ratio:4 / 3;
  object-fit:cover;
  display:block;
}

/* NEW/HOT */
.ozbbBadge{
  position:absolute;
  top:10px;
  right:10px;
  background:#fff;
  border-radius:999px;
  padding:6px 10px;
  font-size:14px;
  font-weight:900;
  box-shadow:0 6px 14px rgba(0,0,0,.12);
  border:1px solid rgba(0,0,0,.06);
}
.ozbbBadgeNew{ color:#1E66FF; }
.ozbbBadgeHot{ color:#E53935; }

/* 본문 */
.ozbbBody{
  padding:10px 12px 12px;
  position:relative;
  min-height:140px;
  box-sizing:border-box;
}

.ozbbName{
  font-size:18px;
  font-weight:800;
  margin:4px 0 6px;
}
.ozbbNo{
  color:#D2A51F;
  margin-right:6px;
}

/* 옵션값 (라벨 제거) */
.ozbbOpt{
  font-size:14px;
  line-height:1.3;
  color:#333;
  word-break:break-word;
}
.ozbbOptRow{
  margin:4px 0;
}

/* 가격 */
.ozbbPriceBar{
  position:absolute;
  left:12px;
  right:12px;
  bottom:10px;
  display:flex;
  align-items:flex-end;
  justify-content:space-between;
  gap:12px;
}

/* 할인율: 볼드 제거 */
.ozbbRate{
  font-size:34px;
  font-weight:400;
  color:#E53935;
  line-height:1;
}

/* 오른쪽 */
.ozbbRight{ text-align:right; }

.ozbbOrigin{
  font-size:15px;
  color:#B5B5B5;
  text-decoration:line-through;
  margin-bottom:4px;
}

/* 할인가 */
.ozbbSale{
  font-size:30px;
  font-weight:900;
  color:#E53935;
}

/* 원 단위는 조금 작게 */
.ozbbWon{
  font-size:0.75em;
  margin-left:2px;
}
`;

  const items = args.items ?? [];
  const lastRowStartIdx = Math.floor((items.length - 1) / 2) * 2;

  const cards = items
    .map((it, idx) => {
      const no = String(idx + 1).padStart(2, "0");
      const name = esc(it.name || "");
      const img = esc(it.imageUrl || "");
      const link = esc(it.linkUrl || "#");

      const price = numOnly(it.price);
      const sale = numOnly(it.sale);

      const rate =
        it.rate != null && String(it.rate).trim() !== ""
          ? Number(it.rate)
          : calcRate(price, sale);

      const badge = (it.badge || "").trim().toUpperCase();
      const badgeHtml =
        badge === "NEW"
          ? `<span class="ozbbBadge ozbbBadgeNew">NEW</span>`
          : badge === "HOT"
          ? `<span class="ozbbBadge ozbbBadgeHot">HOT</span>`
          : ``;

      const originHtml = price
        ? `<div class="ozbbOrigin">${won(price)}<span class="ozbbWon">원</span></div>`
        : `<div class="ozbbOrigin">&nbsp;</div>`;

      const saleText = sale
        ? `${won(sale)}`
        : price
        ? `${won(price)}`
        : `가격문의`;

      const rateHtml =
        rate != null && Number.isFinite(rate)
          ? `<div class="ozbbRate">${Math.round(rate)}%</div>`
          : `<div class="ozbbRate">&nbsp;</div>`;

      const opt1 = esc(it.opt1 || "").replaceAll(",", ",<wbr>");
      const opt2 = esc(it.opt2 || "").replaceAll(",", ",<wbr>");

      const optHtml = `
<div class="ozbbOpt">
  ${opt1 ? `<div class="ozbbOptRow">${opt1}</div>` : ``}
  ${opt2 ? `<div class="ozbbOptRow">${opt2}</div>` : ``}
</div>`;

      const isLastRow = idx >= lastRowStartIdx;
      const cellClass = `ozbbCell${isLastRow ? " lastRow" : ""}`;

      return `
<div class="${cellClass}">
  <a class="ozbbLink" href="${link}" target="_blank" rel="noopener noreferrer">
    <div class="ozbbMedia">
      ${
        img
          ? `<img class="ozbbImg" src="${img}" alt="${name}">`
          : `<div class="ozbbImg" style="display:flex;align-items:center;justify-content:center;color:#999;">이미지 없음</div>`
      }
      ${badgeHtml}
    </div>

    <div class="ozbbBody">
      <div class="ozbbName"><span class="ozbbNo">${no}</span>${name}</div>

      ${optHtml}

      <div class="ozbbPriceBar">
        ${rateHtml}
        <div class="ozbbRight">
          ${originHtml}
          <div class="ozbbSale">${esc(saleText)}<span class="ozbbWon">원</span></div>
        </div>
      </div>
    </div>
  </a>
</div>`;
    })
    .join("");

  return `
<div class="ozbbWrap">
  <style>${css}</style>

  <table class="ozbbNotice" role="presentation">
    <tr><td>${bannerText}</td></tr>
  </table>

  <div class="ozbbFrame">
    <div class="ozbbGrid">
      ${cards}
    </div>
  </div>
</div>
`.trim();
}