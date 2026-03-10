// app/lib/generateHtml.ts
import type { Item, ThemeKey } from "./types";

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

export function buildBoriboriHtml(args: {
  bannerText: string;
  themeKey: ThemeKey;
  items: Item[];
}) {
  // ✅ 프레임색: 기존보다 더 밝은 파스텔톤
  const theme = (() => {
    switch (args.themeKey) {
      case "pastelBlue":
        return {
          frame: "#CFE6FF",
          line: "#CFE6FF",
          numBg: "#D9ECFF",
          numText: "#4F87C7",
        };
      case "pastelPink":
        return {
          frame: "#F7D7E4",
          line: "#F7D7E4",
          numBg: "#FBE4EC",
          numText: "#C77395",
        };
      case "pastelMint":
        return {
          frame: "#D8F1E8",
          line: "#D8F1E8",
          numBg: "#E5F8F1",
          numText: "#5FAE95",
        };
      case "clean":
      case "cleanWhite":
        return {
          frame: "#F1F1F1",
          line: "#E8E8E8",
          numBg: "#F4F4F4",
          numText: "#777777",
        };
      case "yellow":
      case "yellowFrame":
      default:
        return {
          // ✅ 더 밝은 파스텔 노랑
          frame: "#F6D97A",
          line: "#F1CF62",
          numBg: "#F9E7A8",
          numText: "#B58A1A",
        };
    }
  })();

  const bannerText = esc(
    args.bannerText || "이미지를 클릭하면 상세이미지를 보실 수 있어요"
  );

  const css = `
.ozbbWrap{
  max-width:860px;
  margin:0 auto;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Noto Sans KR",Arial,sans-serif;
  color:#111;
}

/* ✅ 부드러운 말풍선/클라우드 느낌 배너 */
.ozbbNoticeWrap{
  margin:0 0 12px 0;
  display:flex;
  justify-content:center;
}
.ozbbNotice{
  position:relative;
  min-width:72%;
  max-width:100%;
  text-align:center;
  padding:14px 24px;
  font-size:18px;
  font-weight:800;
  letter-spacing:-0.02em;
  color:#111;
  background:#fffdf7;
  border:2px solid ${theme.line};
  border-radius:999px;
  box-shadow:0 4px 10px rgba(0,0,0,.04);
}
.ozbbNotice:before,
.ozbbNotice:after{
  content:"";
  position:absolute;
  top:50%;
  width:26px;
  height:26px;
  background:#fffdf7;
  border:2px solid ${theme.line};
  border-radius:50%;
  transform:translateY(-50%);
}
.ozbbNotice:before{
  left:-10px;
  border-right:none;
}
.ozbbNotice:after{
  right:-10px;
  border-left:none;
}

/* 프레임 */
.ozbbFrame{
  background:${theme.frame};
  border-radius:28px;
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
  border-radius:24px;
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

/* NEW/HOT 유지 */
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

.ozbbBody{
  padding:12px 14px 12px;
  position:relative;
  min-height:148px;
  box-sizing:border-box;
}

/* 상품명 라인 */
.ozbbNameRow{
  display:flex;
  align-items:flex-start;
  gap:8px;
  margin:4px 0 6px;
}

/* ✅ 상품번호: 동그란 배경 안에 */
.ozbbNo{
  flex:0 0 auto;
  min-width:38px;
  height:38px;
  padding:0 10px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  background:${theme.numBg};
  color:${theme.numText};
  border-radius:999px;
  font-size:18px;
  font-weight:900;
  line-height:1;
  letter-spacing:-0.02em;
}

.ozbbName{
  font-size:18px;
  font-weight:800;
  line-height:1.25;
  margin-top:4px;
  word-break:break-word;
}

/* 옵션값만 표시 */
.ozbbOpt{
  font-size:14px;
  line-height:1.3;
  color:#333;
  word-break:break-word;
  overflow-wrap:anywhere;
}
.ozbbOptRow{
  margin:4px 0;
}

/* 가격 */
.ozbbPriceBar{
  position:absolute;
  left:14px;
  right:14px;
  bottom:10px;
  display:flex;
  align-items:flex-end;
  justify-content:space-between;
  gap:12px;
}

/* 할인율 볼드 제거 유지 */
.ozbbRate{
  font-size:34px;
  font-weight:400;
  color:#E53935;
  line-height:1;
}

.ozbbRight{
  text-align:right;
}
.ozbbOrigin{
  font-size:15px;
  color:#B5B5B5;
  text-decoration:line-through;
  margin-bottom:4px;
}
.ozbbSale{
  font-size:30px;
  font-weight:900;
  color:#E53935;
  line-height:1;
}
.ozbbWon{
  font-size:0.75em;
  margin-left:2px;
}

@media (max-width:520px){
  .ozbbNotice{
    min-width:78%;
    font-size:17px;
    padding:13px 18px;
  }
  .ozbbName{
    font-size:17px;
  }
  .ozbbNo{
    min-width:34px;
    height:34px;
    font-size:17px;
  }
  .ozbbRate{
    font-size:32px;
  }
  .ozbbSale{
    font-size:30px;
  }
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
        ? `<div class="ozbbOrigin">${won(price)}원</div>`
        : `<div class="ozbbOrigin">&nbsp;</div>`;

      const saleText = sale ? won(sale) : price ? won(price) : "가격문의";

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
      <div class="ozbbNameRow">
        <span class="ozbbNo">${no}</span>
        <div class="ozbbName">${name}</div>
      </div>

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

  <div class="ozbbNoticeWrap">
    <div class="ozbbNotice">${bannerText}</div>
  </div>

  <div class="ozbbFrame">
    <div class="ozbbGrid">
      ${cards}
    </div>
  </div>
</div>
  `.trim();
}