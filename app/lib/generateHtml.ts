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
  if (n == null || Number.isNaN(n)) return "";
  return n.toLocaleString("ko-KR");
}

function calcRate(price: number | null, sale: number | null) {
  if (!price || !sale || price <= 0) return null;
  const r = Math.round(((price - sale) / price) * 100);
  if (!Number.isFinite(r)) return null;
  return Math.max(0, Math.min(99, r));
}

function getTheme(themeKey: ThemeKey) {
  switch (themeKey) {
    case "pastelBlue":
      return {
        frame: "#CFE6FF",
        line: "#BFD8F4",
        chipText: "#5D90C6",
      };
    case "pastelPink":
      return {
        frame: "#F7D9E5",
        line: "#EEC4D4",
        chipText: "#C97F9F",
      };
    case "pastelMint":
      return {
        frame: "#D9F1E9",
        line: "#BFE2D7",
        chipText: "#67A996",
      };
    case "cleanWhite":
      return {
        frame: "#F3F3F3",
        line: "#E5E5E5",
        chipText: "#111111",
      };
    case "yellowFrame":
    default:
      return {
        frame: "#F6D97A",
        line: "#EDCB63",
        chipText: "#B98E18",
      };
  }
}

export function buildBoriboriHtml(args: {
  bannerText: string;
  themeKey: ThemeKey;
  items: Item[];
}) {
  const theme = getTheme(args.themeKey);
  const bannerText = esc(
    args.bannerText || "이미지를 클릭하면 상세이미지를 보실 수 있어요"
  );

  const css = `
@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css");

.ozbbWrap{
  max-width:860px;
  margin:0 auto;
  font-family:"Pretendard Variable","Pretendard",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Noto Sans KR",Arial,sans-serif;
  color:#111;
}

/* 상단 배너 */
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
  font-size:16px;
  font-weight:700;
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
  width:24px;
  height:24px;
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
  border-radius:30px;
  padding:10px;
  box-sizing:border-box;
}

/* grid 래퍼 */
.ozbbGrid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:2px;
  background:${theme.line};
  border-radius:24px;
  overflow:hidden;
}

/* 각 카드 */
.ozbbCell{
  background:#fff;
  min-width:0;
  border-radius:14px;
  overflow:hidden;
  position:relative;
}

.ozbbLink{
  display:block;
  text-decoration:none !important;
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

/* 기존 NEW/HOT 유지 */
.ozbbBadge{
  position:absolute;
  top:10px;
  right:10px;
  border-radius:999px;
  padding:6px 10px;
  font-size:14px;
  font-weight:900;
  box-shadow:0 6px 14px rgba(0,0,0,.12);
  border:1px solid rgba(0,0,0,.06);
  line-height:1;
  background:#fff;
}
.ozbbBadgeNew{ color:#1E66FF; }
.ozbbBadgeHot{ color:#E53935; }

/* 추가 배지 4개 */
.ozbbBadgeSale{
  background:#ff5d92;
  color:#fff;
  border-color:#ff5d92;
}

.ozbbBadgeOnly{
  background:#111;
  color:#fff;
  border-color:#111;
}

.ozbbBadgeToday{
  background:#3b82f6;
  color:#fff;
  border-color:#3b82f6;
}

.ozbbBadgeOnePlus{
  background:transparent;
  color:#d91c1c;
  border:none;
  box-shadow:none;
  padding:0;
  font-size:22px;
  font-weight:900;
  top:12px;
  right:12px;
}

/* 본문 */
.ozbbBody{
  padding:10px 12px 12px;
  box-sizing:border-box;
  min-height:136px;
  display:flex;
  flex-direction:column;
}

/* 제목 */
.ozbbTitle{
  font-size:16px;
  font-weight:700;
  line-height:1.24;
  margin:4px 0 8px;
  word-break:break-word;
  overflow:visible;
  text-overflow:clip;
  white-space:normal;
  min-height:39px;
}

.ozbbNo{
  color:${theme.chipText};
  font-weight:800;
  margin-right:1px;
}

.ozbbSlash{
  font-size:0.5em;
  font-weight:400;
  margin:0 3px 0 0;
}

/* 옵션 */
.ozbbMeta{
  height:52px;
  margin-bottom:8px;
  overflow:hidden;
}

.ozbbOptLine{
  font-size:13px;
  line-height:1.28;
  color:#444;
  font-weight:500;
  word-break:break-word;
}

.ozbbOptLine:first-child{
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}

.ozbbOptLine:last-child{
  display:-webkit-box;
  -webkit-line-clamp:2;
  -webkit-box-orient:vertical;
  overflow:hidden;
}

/* 가격 */
.ozbbPriceBar{
  margin-top:auto;
  display:flex;
  align-items:flex-end;
  justify-content:space-between;
  gap:8px;
  min-height:44px;
}
.ozbbRate{
  font-size:29px;
  font-weight:400;
  color:#E53935;
  line-height:1;
  letter-spacing:-0.02em;
  flex:0 0 auto;
}
.ozbbRight{
  text-align:right;
  min-width:0;
}
.ozbbOrigin{
  font-size:13px;
  color:#B5B5B5;
  text-decoration:line-through;
  margin-bottom:3px;
  font-weight:500;
  white-space:nowrap;
}
.ozbbSale{
  font-size:26px;
  font-weight:800;
  color:#E53935;
  line-height:1;
  letter-spacing:-0.02em;
  white-space:nowrap;
}
.ozbbWon{
  font-size:0.72em;
  margin-left:2px;
}

/* 모바일 */
@media (max-width:520px){
  .ozbbNotice{
    min-width:78%;
    font-size:15px;
    padding:12px 18px;
  }

  .ozbbFrame{
    border-radius:28px;
    padding:9px;
  }

  .ozbbGrid{
    border-radius:20px;
    gap:2px;
  }

  .ozbbCell{
    border-radius:12px;
  }

  .ozbbBody{
    padding:9px 10px 11px;
    min-height:128px;
  }

  .ozbbTitle{
    font-size:15px;
    line-height:1.22;
    margin:3px 0 7px;
    min-height:36px;
  }

  .ozbbMeta{
    height:46px;
    margin-bottom:7px;
    overflow:hidden;
  }

  .ozbbOptLine{
    font-size:12px;
    line-height:1.25;
  }

  .ozbbPriceBar{
    min-height:40px;
  }

  .ozbbRate{
    font-size:26px;
  }

  .ozbbOrigin{
    font-size:12px;
  }

  .ozbbSale{
    font-size:23px;
  }

  .ozbbBadgeOnePlus{
    font-size:20px;
    top:10px;
    right:10px;
  }
}
`;

  const items = args.items ?? [];

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

      const badge = (it.badge || "").trim();
      let badgeHtml = "";

      if (badge === "NEW") {
        badgeHtml = `<span class="ozbbBadge ozbbBadgeNew">NEW</span>`;
      } else if (badge === "HOT") {
        badgeHtml = `<span class="ozbbBadge ozbbBadgeHot">HOT</span>`;
      } else if (badge === "특가") {
        badgeHtml = `<span class="ozbbBadge ozbbBadgeSale">특가</span>`;
      } else if (badge === "단독") {
        badgeHtml = `<span class="ozbbBadge ozbbBadgeOnly">단독</span>`;
      } else if (badge === "오늘만") {
        badgeHtml = `<span class="ozbbBadge ozbbBadgeToday">오늘만</span>`;
      } else if (badge === "1+1") {
        badgeHtml = `<span class="ozbbBadge ozbbBadgeOnePlus">1+1</span>`;
      }

      const originHtml = price
        ? `<div class="ozbbOrigin">${won(price)}원</div>`
        : `<div class="ozbbOrigin">&nbsp;</div>`;

      const saleText = sale ? won(sale) : price ? won(price) : "가격문의";

      const rateHtml =
        rate != null && Number.isFinite(rate)
          ? `<div class="ozbbRate">${Math.round(rate)}%</div>`
          : `<div class="ozbbRate">&nbsp;</div>`;

      const opt1 = esc(it.opt1 || "").replaceAll(",", ", ");
      const opt2 = esc(it.opt2 || "").replaceAll(",", ", ");

      return `
<div class="ozbbCell">
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
      <div class="ozbbTitle"><span class="ozbbNo">${no}</span><span class="ozbbSlash">/</span>${name}</div>

      <div class="ozbbMeta">
        ${opt1 ? `<div class="ozbbOptLine">${opt1}</div>` : ""}
        ${opt2 ? `<div class="ozbbOptLine">${opt2}</div>` : ""}
      </div>

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