"use client";

import React, { useMemo, useState } from "react";
import type { Item, ThemeKey } from "./lib/types";
import { buildBoriboriHtml } from "./lib/generateHtml";
import { parseTsv } from "./lib/tsv";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
    sale: 19900,
    rate: 20,
    opt1: "그린/레드/블랙",
    opt2: "140,150,160,170,180,190,200,210,220,230",
    badge: "NEW",
  },
  {
    id: uid(),
    name: "체크보더 운동화",
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

const THEME_OPTIONS: { key: ThemeKey; label: string }[] = [
  { key: "yellowFrame", label: "옐로 프레임" },
  { key: "cleanWhite", label: "깔끔 화이트" },
  { key: "pastelBlue", label: "파스텔 블루" },
  { key: "pastelPink", label: "파스텔 핑크" },
  { key: "pastelMint", label: "파스텔 민트" },
];

function SortableRow({
  item,
  onChange,
  onDelete,
}: {
  item: Item;
  onChange: (patch: Partial<Item>) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.75 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        border: "1px solid #E5E7EB",
        borderRadius: 16,
        padding: 12,
        marginBottom: 10,
        background: "#fff",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "40px 1.2fr 1.2fr 1.2fr 0.7fr 0.7fr 0.7fr 0.7fr auto",
          gap: 10,
          alignItems: "start",
        }}
      >
        <button
          type="button"
          {...attributes}
          {...listeners}
          style={{
            cursor: "grab",
            border: "1px solid #D8D8D8",
            borderRadius: 12,
            background: "#fff",
            fontWeight: 800,
            height: 40,
          }}
          title="드래그로 순서 변경"
        >
          ↕
        </button>

        <input value={item.name} onChange={(e) => onChange({ name: e.target.value })} style={inp} placeholder="상품명" />
        <input value={item.imageUrl} onChange={(e) => onChange({ imageUrl: e.target.value })} style={inp} placeholder="이미지URL" />
        <input value={item.linkUrl} onChange={(e) => onChange({ linkUrl: e.target.value })} style={inp} placeholder="링크URL" />
        <input
          value={item.price ?? ""}
          onChange={(e) =>
            onChange({
              price: e.target.value ? Number(String(e.target.value).replace(/[^\d]/g, "")) : null,
            })
          }
          style={inp}
          placeholder="정상가"
        />
        <input
          value={item.sale ?? ""}
          onChange={(e) =>
            onChange({
              sale: e.target.value ? Number(String(e.target.value).replace(/[^\d]/g, "")) : null,
            })
          }
          style={inp}
          placeholder="할인가"
        />
        <input value={item.opt1} onChange={(e) => onChange({ opt1: e.target.value })} style={inp} placeholder="옵션1" />
        <input value={item.opt2} onChange={(e) => onChange({ opt2: e.target.value })} style={inp} placeholder="옵션2" />

        <button
          type="button"
          onClick={onDelete}
          style={{
            border: "1px solid #FF6B6B",
            color: "#FF4D4D",
            background: "#fff",
            borderRadius: 12,
            padding: "10px 12px",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          삭제
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center", flexWrap: "wrap" }}>
  {(["", "NEW", "HOT", "특가", "단독", "오늘만", "1+1"] as const).map((badge) => {
    const active = item.badge === badge;

    const label = badge === "" ? "없음" : badge;

    let style: React.CSSProperties = {
      border: "1px solid #D8D8D8",
      background: "#fff",
      color: "#111",
      borderRadius: 999,
      padding: "6px 10px",
      fontSize: 12,
      fontWeight: 800,
      cursor: "pointer",
    };

    if (badge === "NEW") {
      style = {
        ...style,
        color: active ? "#fff" : "#1E66FF",
        background: active ? "#1E66FF" : "#fff",
        borderColor: "#1E66FF",
      };
    } else if (badge === "HOT") {
      style = {
        ...style,
        color: active ? "#fff" : "#E53935",
        background: active ? "#E53935" : "#fff",
        borderColor: "#E53935",
      };
    } else if (badge === "특가") {
      style = {
        ...style,
        color: "#fff",
        background: active ? "#ff5d92" : "#ff8fb2",
        borderColor: "#ff5d92",
      };
    } else if (badge === "단독") {
      style = {
        ...style,
        color: "#fff",
        background: active ? "#111" : "#444",
        borderColor: "#111",
      };
    } else if (badge === "오늘만") {
      style = {
        ...style,
        color: "#fff",
        background: active ? "#3b82f6" : "#6aa4ff",
        borderColor: "#3b82f6",
      };
    } else if (badge === "1+1") {
      style = {
        ...style,
        color: active ? "#d91c1c" : "#ef4444",
        background: "#fff",
        borderColor: active ? "#d91c1c" : "#ef4444",
        fontWeight: 900,
      };
    } else if (badge === "") {
      style = {
        ...style,
        color: active ? "#fff" : "#666",
        background: active ? "#666" : "#fff",
        borderColor: "#999",
      };
    }

    return (
      <button
        key={badge}
        type="button"
        onClick={() => onChange({ badge })}
        style={style}
      >
        {label}
      </button>
    );
  })}

  <span style={{ fontSize: 12, color: "#666" }}>배지는 1개만 선택됨</span>
</div>
    </div>
  );
}

export default function Page() {
  const [bannerText, setBannerText] = useState("이미지를 클릭하면 상세이미지를 보실 수 있어요");
  const [themeKey, setThemeKey] = useState<ThemeKey>("yellowFrame");
  const [items, setItems] = useState<Item[]>(DEFAULT_ITEMS);
  const [tsvRaw, setTsvRaw] = useState("");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

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
        rate: null,
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
      badge: (clampText(r.badge) as "" | "NEW" | "HOT") || "",
    }));
    setItems(next.length ? next : items);
  };

  const onCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(generatedHtml);
      alert("HTML 복사 완료!");
    } catch {
      alert("복사 권한을 확인해줘.");
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setItems((prev) => {
      const oldIndex = prev.findIndex((x) => x.id === active.id);
      const newIndex = prev.findIndex((x) => x.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  return (
    <div
      style={{
        padding: 18,
        background: "#fff",
        color: "#111",
        fontFamily:
          '"Pretendard Variable","Pretendard",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Noto Sans KR",Arial,sans-serif',
      }}
    >
      <style>{`
        @import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css");
      `}</style>

      {/* 상단 */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={label}>딜 상단 안내 문구</div>
          <input
            value={bannerText}
            onChange={(e) => setBannerText(e.target.value)}
            style={topInp}
          />
        </div>

        <div style={{ width: 220 }}>
          <div style={label}>테마</div>
          <select
            value={themeKey}
            onChange={(e) => setThemeKey(e.target.value as ThemeKey)}
            style={topInp}
          >
            {THEME_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <button style={btnDark} onClick={onCopyHtml}>
          HTML 복사
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 14 }}>
        {/* 좌: 수동 입력 */}
        <div style={panel}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontWeight: 900, fontSize: 16 }}>수동 입력</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={btnLight} onClick={onAddRow}>+ 행 추가</button>
              <button style={btnDanger} onClick={onClear}>전체 삭제</button>
            </div>
          </div>

          <div style={{ fontSize: 12, color: "#666", marginBottom: 10 }}>
            드래그(↕)로 상품 순서를 변경하면 미리보기/HTML 순서도 같이 바뀜
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
              {items.map((it) => (
                <SortableRow
                  key={it.id}
                  item={it}
                  onChange={(patch) =>
                    setItems((prev) => prev.map((x) => (x.id === it.id ? { ...x, ...patch } : x)))
                  }
                  onDelete={() => setItems((prev) => prev.filter((x) => x.id !== it.id))}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        {/* 우: TSV + 미리보기 */}
        <div style={{ display: "grid", gridTemplateRows: "auto auto 1fr", gap: 14 }}>
          <div style={panel}>
            <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 8 }}>구글시트 복붙 (TSV)</div>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
              컬럼: 상품명 / 이미지URL / 링크URL / 정상가 / 할인가 / 할인률 / 옵션1 / 옵션2 / 아이콘(NEW,HOT)
            </div>
            <textarea
              value={tsvRaw}
              onChange={(e) => setTsvRaw(e.target.value)}
              style={textarea}
            />
            <button style={{ ...btnDark, width: "100%", marginTop: 10 }} onClick={onApplyTsv}>
              TSV 적용
            </button>
          </div>

          <div style={panel}>
            <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 10 }}>미리보기</div>
            <div dangerouslySetInnerHTML={{ __html: generatedHtml }} />
          </div>

          <div style={panel}>
            <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 10 }}>생성된 HTML</div>
            <textarea readOnly value={generatedHtml} style={{ ...textarea, minHeight: 220 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

const label: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 800,
  marginBottom: 6,
  color: "#111",
};

const topInp: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid #D8D8D8",
  outline: "none",
  fontSize: 14,
  color: "#111",
  background: "#fff",
};

const inp: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #D8D8D8",
  outline: "none",
  fontSize: 13,
  color: "#111",
  background: "#fff",
};

const btnDark: React.CSSProperties = {
  padding: "12px 16px",
  borderRadius: 14,
  border: "1px solid #111",
  background: "#111",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
};

const btnLight: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #D8D8D8",
  background: "#fff",
  color: "#111",
  fontWeight: 800,
  cursor: "pointer",
};

const btnDanger: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #FF7B7B",
  background: "#fff",
  color: "#FF4D4D",
  fontWeight: 800,
  cursor: "pointer",
};

const panel: React.CSSProperties = {
  border: "1px solid #E5E5E5",
  borderRadius: 18,
  padding: 14,
  background: "#fff",
};

const textarea: React.CSSProperties = {
  width: "100%",
  minHeight: 180,
  padding: 12,
  borderRadius: 14,
  border: "1px solid #D8D8D8",
  outline: "none",
  fontSize: 12,
  color: "#111",
  fontFamily:
    '"Pretendard Variable","Pretendard",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Noto Sans KR",Arial,sans-serif',
  boxSizing: "border-box",
};