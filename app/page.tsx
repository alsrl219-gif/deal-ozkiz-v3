// app/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import type { Item, ThemeKey } from "./lib/types";
import { THEMES } from "./lib/types";
import { buildBoriboriHtml } from "./lib/generateHtml";
import { parseTsv } from "./lib/tsv";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function clampText(s: string) {
  return (s ?? "").replace(/\s+/g, " ").trim();
}

const DEFAULT_ITEMS: Item[] = [
  {
    id: uid(),
    name: "체크보더 슬립온",
    imageUrl: "",
    linkUrl: "",
    price: 24900,
    sale: 12900,
    rate: 48,
    opt1: "그린/레드/블랙",
    opt2: "140,150,160,170,180,190,200,210,220,230",
    badge: "NEW",
  },
  {
    id: uid(),
    name: "ABCSDs",
    imageUrl: "",
    linkUrl: "",
    price: 26900,
    sale: 12900,
    rate: 52,
    opt1: "그린/레드/블랙",
    opt2: "140,150,160,170,180,190",
    badge: "HOT",
  },
];

export default function Page() {
  const [bannerText, setBannerText] = useState("이미지를 클릭하면 상세이미지를 보실 수 있어요");
  const [themeKey, setThemeKey] = useState<ThemeKey>("yellowFrame");
  const [items, setItems] = useState<Item[]>(DEFAULT_ITEMS);
  const [tsvRaw, setTsvRaw] = useState("");

  const theme = useMemo(() => THEMES.find((t) => t.key === themeKey) ?? THEMES[0], [themeKey]);

  const generatedHtml = useMemo(() => {
    return buildBoriboriHtml({ bannerText, themeKey, items });
  }, [bannerText, themeKey, items]);

  const onAddRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: uid(),
        name: "",
        imageUrl: "",
        linkUrl: "",
        price: null,
        sale: null,
        opt1: "",
        opt2: "",
        badge: "",
      },
    ]);
  };

  const onClear = () => setItems([]);

  const onApplyTsv = () => {
    const rows = parseTsv(tsvRaw);
    const next: Item[] = rows.map((r) => ({
      id: uid(),
      name: clampText(r.name),
      imageUrl: clampText(r.imageUrl),
      linkUrl: clampText(r.linkUrl),
      price: r.price ?? null,
      sale: r.sale ?? null,
      rate: r.rate ?? null,
      opt1: clampText(r.opt1),
      opt2: clampText(r.opt2),
      badge: clampText(r.badge ?? ""),
    }));
    setItems(next.length ? next : items);
  };

  const onCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(generatedHtml);
      alert("HTML 복사 완료!");
    } catch {
      alert("복사 권한이 막혀있어요. (브라우저 설정 확인)");
    }
  };

  const update = (id: string, patch: Partial<Item>) => {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };

  return (
    <div style={{ padding: 18, background: "#fff", color: "#111" }}>
      {/* 상단 바 */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6, color: "#111" }}>딜 상단 안내 문구</div>
          <input
            value={bannerText}
            onChange={(e) => setBannerText(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 14,
              border: "1px solid #D8D8D8",
              outline: "none",
              fontSize: 14,
              color: "#111", // ✅ 회색 아닌 검정
            }}
          />
        </div>

        <div style={{ width: 220 }}>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6, color: "#111" }}>테마</div>
          <select
            value={themeKey}
            onChange={(e) => setThemeKey(e.target.value as ThemeKey)}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 14,
              border: "1px solid #D8D8D8",
              outline: "none",
              fontSize: 14,
              color: "#111", // ✅ 검정
              background: "#fff",
            }}
          >
            {THEMES.map((t) => (
              <option key={t.key} value={t.key}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onCopyHtml}
          style={{
            padding: "12px 16px",
            borderRadius: 16,
            border: "1px solid #111",
            background: "#111",
            color: "#fff",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          HTML 복사
        </button>
      </div>

      {/* 4:3 느낌으로 가로 넓게 */}
      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 14 }}>
        {/* 입력 영역 */}
        <div style={{ border: "1px solid #E5E5E5", borderRadius: 18, padding: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontWeight: 900, fontSize: 16 }}>수동 입력</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={onAddRow}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid #D8D8D8",
                  background: "#fff",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                + 행 추가
              </button>
              <button
                onClick={onClear}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid #FF5A5A",
                  background: "#fff",
                  color: "#FF5A5A",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                전체 삭제
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.2fr 1.2fr 0.7fr 0.7fr 0.7fr 0.7fr", gap: 8, padding: "8px 0", fontSize: 12, color: "#111", fontWeight: 900 }}>
            <div>상품명</div>
            <div>이미지URL</div>
            <div>링크URL</div>
            <div>정상가</div>
            <div>할인가</div>
            <div>옵션1(COLOR)</div>
            <div>옵션2(SIZE)</div>
          </div>

          {items.map((it) => (
            <div key={it.id} style={{ display: "grid", gridTemplateColumns: "1.2fr 1.2fr 1.2fr 0.7fr 0.7fr 0.7fr 0.7fr", gap: 8, marginBottom: 8 }}>
              <input value={it.name} onChange={(e) => update(it.id, { name: e.target.value })} style={inp} />
              <input value={it.imageUrl} onChange={(e) => update(it.id, { imageUrl: e.target.value })} style={inp} />
              <input value={it.linkUrl} onChange={(e) => update(it.id, { linkUrl: e.target.value })} style={inp} />
              <input value={it.price ?? ""} onChange={(e) => update(it.id, { price: e.target.value ? Number(String(e.target.value).replace(/[^\d]/g, "")) : null })} style={inp} />
              <input value={it.sale ?? ""} onChange={(e) => update(it.id, { sale: e.target.value ? Number(String(e.target.value).replace(/[^\d]/g, "")) : null })} style={inp} />
              <input value={it.opt1} onChange={(e) => update(it.id, { opt1: e.target.value })} style={inp} />
              <input value={it.opt2} onChange={(e) => update(it.id, { opt2: e.target.value })} style={inp} />
              <div style={{ gridColumn: "1 / -1", display: "flex", gap: 10, marginTop: -2 }}>
                <label style={{ fontSize: 12, fontWeight: 900, color: "#111" }}>
                  <input
                    type="checkbox"
                    checked={(it.badge || "").toUpperCase() === "NEW"}
                    onChange={(e) => update(it.id, { badge: e.target.checked ? "NEW" : "" })}
                    style={{ marginRight: 6 }}
                  />
                  NEW
                </label>
                <label style={{ fontSize: 12, fontWeight: 900, color: "#111" }}>
                  <input
                    type="checkbox"
                    checked={(it.badge || "").toUpperCase() === "HOT"}
                    onChange={(e) => update(it.id, { badge: e.target.checked ? "HOT" : "" })}
                    style={{ marginRight: 6 }}
                  />
                  HOT
                </label>
                <span style={{ fontSize: 12, color: "#666" }}>※ 둘 중 하나만 선택 권장</span>
              </div>
            </div>
          ))}
        </div>

        {/* TSV + 결과 */}
        <div style={{ display: "grid", gridTemplateRows: "auto 1fr", gap: 14 }}>
          <div style={{ border: "1px solid #E5E5E5", borderRadius: 18, padding: 14 }}>
            <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 8 }}>구글시트 복붙 (TSV)</div>
            <div style={{ fontSize: 12, color: "#111", marginBottom: 8, lineHeight: 1.35 }}>
              컬럼: 상품명 / 이미지URL / 링크URL / 정상가 / 할인가 / 할인률(무시 가능) / 옵션1 / 옵션2 / 아이콘(NEW,HOT)
            </div>
            <textarea
              value={tsvRaw}
              onChange={(e) => setTsvRaw(e.target.value)}
              style={{
                width: "100%",
                minHeight: 220,
                padding: 12,
                borderRadius: 14,
                border: "1px solid #D8D8D8",
                outline: "none",
                fontSize: 12,
                color: "#111",
              }}
            />
            <button
              onClick={onApplyTsv}
              style={{
                width: "100%",
                marginTop: 10,
                padding: "12px 14px",
                borderRadius: 14,
                border: "1px solid #111",
                background: "#111",
                color: "#fff",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              TSV 적용
            </button>
          </div>

          <div style={{ border: "1px solid #E5E5E5", borderRadius: 18, padding: 14 }}>
            <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 10 }}>미리보기</div>
            <div dangerouslySetInnerHTML={{ __html: generatedHtml }} />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 14, border: "1px solid #E5E5E5", borderRadius: 18, padding: 14 }}>
        <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 10 }}>생성된 HTML (보리보리 붙여넣기)</div>
        <textarea
          readOnly
          value={generatedHtml}
          style={{
            width: "100%",
            minHeight: 260,
            padding: 12,
            borderRadius: 14,
            border: "1px solid #D8D8D8",
            outline: "none",
            fontSize: 12,
            color: "#111",
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
          }}
        />
      </div>
    </div>
  );
}

const inp: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #D8D8D8",
  outline: "none",
  fontSize: 13,
  color: "#111", // ✅ 회색 제거
  background: "#fff",
};