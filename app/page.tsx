"use client";

import React, { useMemo, useState } from "react";
import { buildBoriboriHtml } from "./lib/generateHtml";
import { parseTsv } from "./lib/tsv";
import type { Item } from "./lib/types";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function toNumberOrNull(v: string) {
  const s = (v ?? "").replace(/[^\d]/g, "");
  return s ? Number(s) : null;
}

/** ✅ 깨짐 표시용 이미지 컴포넌트 */
function ImgWithFallback({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const [broken, setBroken] = useState(false);
  const valid = (src ?? "").trim().length > 0;

  if (!valid) {
    return (
      <div className="flex aspect-square w-full items-center justify-center bg-zinc-100 text-xs text-zinc-500">
        이미지 없음
      </div>
    );
  }

  return (
    <div className="relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={`aspect-square w-full object-cover ${broken ? "hidden" : ""}`}
        onError={() => setBroken(true)}
      />
      {broken && (
        <div className="flex aspect-square w-full items-center justify-center bg-zinc-100 text-xs text-red-600">
          이미지 깨짐
        </div>
      )}
    </div>
  );
}

/** ✅ 드래그 가능한 행 */
function SortableRow({
  item,
  index,
  onChange,
  onDelete,
}: {
  item: Item;
  index: number;
  onChange: (next: Item) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className="border-b border-zinc-200">
      {/* 드래그 핸들 */}
      <td className="p-2 align-top">
        <button
          className="cursor-grab rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-700 active:cursor-grabbing"
          title="드래그로 순서 변경"
          {...attributes}
          {...listeners}
        >
          ↕
        </button>
        <div className="mt-2 text-xs font-bold text-zinc-500">
          {String(index + 1).padStart(2, "0")}
        </div>
      </td>

      <td className="p-2 align-top">
        <input
          className="w-[220px] rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
          placeholder="상품명"
          value={item.name}
          onChange={(e) => onChange({ ...item, name: e.target.value })}
        />
      </td>

      <td className="p-2 align-top">
        <input
          className="w-[280px] rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
          placeholder="이미지 URL"
          value={item.imageUrl}
          onChange={(e) => onChange({ ...item, imageUrl: e.target.value })}
        />
      </td>

      <td className="p-2 align-top">
        <input
          className="w-[280px] rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
          placeholder="링크 URL"
          value={item.linkUrl}
          onChange={(e) => onChange({ ...item, linkUrl: e.target.value })}
        />
      </td>

      <td className="p-2 align-top">
        <input
          className="w-[120px] rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
          placeholder="정상가"
          value={item.price ?? ""}
          onChange={(e) => onChange({ ...item, price: toNumberOrNull(e.target.value) })}
        />
      </td>

      <td className="p-2 align-top">
        <input
          className="w-[120px] rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
          placeholder="할인가"
          value={item.salePrice ?? ""}
          onChange={(e) => onChange({ ...item, salePrice: toNumberOrNull(e.target.value) })}
        />
      </td>

      <td className="p-2 align-top">
        <input
          className="w-[180px] rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
          placeholder="옵션1"
          value={item.option1}
          onChange={(e) => onChange({ ...item, option1: e.target.value })}
        />
        <input
          className="mt-2 w-[180px] rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
          placeholder="옵션2"
          value={item.option2}
          onChange={(e) => onChange({ ...item, option2: e.target.value })}
        />
      </td>

      <td className="p-2 align-top">
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={item.badgeNew}
              onChange={(e) => onChange({ ...item, badgeNew: e.target.checked })}
            />
            NEW
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={item.badgeHot}
              onChange={(e) => onChange({ ...item, badgeHot: e.target.checked })}
            />
            HOT
          </label>
        </div>
      </td>

      <td className="p-2 align-top">
        <button
          className="rounded-xl border border-red-300 bg-white px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          onClick={onDelete}
        >
          삭제
        </button>
      </td>
    </tr>
  );
}

export default function Page() {
  const [bannerText, setBannerText] = useState(
    "이미지를 클릭하면 상세이미지를 보실 수 있어요"
  );

  const [tsv, setTsv] = useState("");

  const [items, setItems] = useState<Item[]>(() => [
    {
      id: uid(),
      name: "봉봉 슬립온",
      imageUrl: "",
      linkUrl: "",
      price: 34900,
      salePrice: 22900,
      option1: "COLOR: 그린,레인보우,블루,핑크",
      option2: "SIZE: 140,150,160,170,180,190",
      badgeNew: true,
      badgeHot: false,
    },
    {
      id: uid(),
      name: "쁘띠팝 슬립온",
      imageUrl: "",
      linkUrl: "",
      price: 31000,
      salePrice: 24900,
      option1: "COLOR: 레드,민트,베이지,옐로",
      option2: "SIZE: 140,150,160,170,180,190",
      badgeNew: false,
      badgeHot: true,
    },
  ]);

  const [generatedHtml, setGeneratedHtml] = useState("");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const previewItems = useMemo(() => items, [items]);

  const onGenerate = () => {
    const html = buildBoriboriHtml(items, bannerText);
    setGeneratedHtml(html);
  };

  const onCopy = async () => {
    if (!generatedHtml) {
      alert("먼저 생성 버튼을 눌러 HTML을 만든 다음 복사해줘.");
      return;
    }
    await navigator.clipboard.writeText(generatedHtml);
  };

  const onApplyTsv = () => {
    const parsed = parseTsv(tsv);
    const next: Item[] = parsed.map((p) => ({
      id: uid(),
      ...p,
      option1: p.option1 ?? "",
      option2: p.option2 ?? "",
      badgeNew: !!p.badgeNew,
      badgeHot: !!p.badgeHot,
    }));
    setItems(next.length ? next : items);
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* ✅ Sticky Top Bar */}
      <div className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3">
          <div className="flex-1">
            <div className="text-xs font-semibold text-zinc-500">딜 상단 안내 문구</div>
            <input
              value={bannerText}
              onChange={(e) => setBannerText(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
              placeholder="예: 이미지를 클릭하면 상세이미지를 보실 수 있어요"
            />
          </div>

          <button
            onClick={onGenerate}
            className="rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-bold text-white hover:bg-zinc-800"
          >
            생성/미리보기
          </button>

          <button
            onClick={onCopy}
            className="rounded-2xl border border-zinc-300 bg-white px-5 py-3 text-sm font-bold text-zinc-900 hover:bg-zinc-100"
          >
            HTML 복사
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 py-6">
        {/* 상단 입력 영역 */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* 수동 입력 */}
          <div className="lg:col-span-2 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="text-lg font-black text-zinc-900">수동 입력</div>
                <div className="mt-1 text-xs text-zinc-500">
                  드래그(↕)로 순서 변경. 순서가 곧 01,02 번호가 됨.
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-zinc-100"
                  onClick={() =>
                    setItems((prev) => [
                      ...prev,
                      {
                        id: uid(),
                        name: "",
                        imageUrl: "",
                        linkUrl: "",
                        price: null,
                        salePrice: null,
                        option1: "",
                        option2: "",
                        badgeNew: false,
                        badgeHot: false,
                      },
                    ])
                  }
                >
                  + 행 추가
                </button>

                <button
                  className="rounded-2xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  onClick={() => setItems([])}
                >
                  전체 삭제
                </button>
              </div>
            </div>

            <div className="mt-4 overflow-auto rounded-2xl border border-zinc-200">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => {
                  const { active, over } = e;
                  if (!over || active.id === over.id) return;
                  const oldIndex = items.findIndex((x) => x.id === active.id);
                  const newIndex = items.findIndex((x) => x.id === over.id);
                  setItems(arrayMove(items, oldIndex, newIndex));
                }}
              >
                <table className="min-w-[1100px] w-full text-left text-sm">
                  <thead className="sticky top-0 bg-zinc-50">
                    <tr className="border-b border-zinc-200 text-xs font-bold text-zinc-600">
                      <th className="p-2 w-[60px]">정렬</th>
                      <th className="p-2">상품명</th>
                      <th className="p-2">이미지URL</th>
                      <th className="p-2">링크URL</th>
                      <th className="p-2">정상가</th>
                      <th className="p-2">할인가</th>
                      <th className="p-2">옵션</th>
                      <th className="p-2">아이콘</th>
                      <th className="p-2 w-[90px]">삭제</th>
                    </tr>
                  </thead>

                  <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
                    <tbody>
                      {items.map((it, idx) => (
                        <SortableRow
                          key={it.id}
                          item={it}
                          index={idx}
                          onChange={(next) =>
                            setItems((prev) => prev.map((p) => (p.id === it.id ? next : p)))
                          }
                          onDelete={() => setItems((prev) => prev.filter((p) => p.id !== it.id))}
                        />
                      ))}
                    </tbody>
                  </SortableContext>
                </table>
              </DndContext>
            </div>
          </div>

          {/* TSV 붙여넣기 */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="text-lg font-black text-zinc-900">구글시트 복붙 (TSV)</div>
            <div className="mt-1 text-xs text-zinc-500">
              컬럼: 상품명 / 이미지URL / 링크URL / 정상가 / 할인가 / 할인률(무시) / 옵션1 / 옵션2 / 아이콘(NEW,HOT)
            </div>

            <textarea
              value={tsv}
              onChange={(e) => setTsv(e.target.value)}
              className="mt-3 h-[260px] w-full rounded-2xl border border-zinc-300 px-4 py-3 text-xs outline-none focus:border-zinc-900"
              placeholder="상품명\t이미지URL\t링크URL\t정상가\t할인가\t할인률\t옵션1\t옵션2\t아이콘"
            />

            <button
              onClick={onApplyTsv}
              className="mt-3 w-full rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-bold text-white hover:bg-zinc-800"
            >
              TSV 적용
            </button>
          </div>
        </div>

        {/* 하단: 미리보기 + HTML */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* 미리보기 */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-lg font-black text-zinc-900">미리보기</div>
                <div className="mt-1 text-xs text-zinc-500">
                  이미지 URL이 비어있거나 실패하면 “이미지 없음/깨짐”으로 표시.
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-3xl border-[8px] border-[#f2b400] bg-white p-4">
              <div className="text-center text-sm font-black text-zinc-900">{bannerText}</div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                {previewItems.map((it, idx) => {
                  const rate =
                    it.price && it.salePrice && it.salePrice < it.price
                      ? Math.round(((it.price - it.salePrice) / it.price) * 100)
                      : null;

                  const showNew = it.badgeNew && !it.badgeHot;
                  const showHot = it.badgeHot;

                  return (
                    <a
                      key={it.id}
                      href={it.linkUrl || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative overflow-hidden rounded-2xl border-2 border-[#f2b400] bg-white"
                    >
                      <div className="absolute left-3 top-3 text-lg font-black text-[#f2b400]">
                        {String(idx + 1).padStart(2, "0")}
                      </div>

                      {/* 아이콘 */}
                      {showHot && (
                        <div className="absolute right-3 top-3 rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-600">
                          HOT
                        </div>
                      )}
                      {showNew && (
                        <div className="absolute right-3 top-3 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                          NEW
                        </div>
                      )}

                      <ImgWithFallback src={it.imageUrl} alt={it.name} />

                      <div className="p-3">
                        <div className="text-sm font-black text-zinc-900">{it.name || "상품명"}</div>

                        <div className="mt-2">
                          {rate ? (
                            <div className="flex items-baseline gap-2">
                              <div className="text-xl font-black text-orange-500">{rate}%</div>
                              <div className="text-lg font-black text-rose-600">
                                {(it.salePrice ?? 0).toLocaleString("ko-KR")}원
                              </div>
                              <div className="text-xs text-zinc-500 line-through">
                                {(it.price ?? 0).toLocaleString("ko-KR")}원
                              </div>
                            </div>
                          ) : (
                            <div className="text-lg font-black text-rose-600">
                              {((it.salePrice ?? it.price) ?? 0).toLocaleString("ko-KR")}원
                            </div>
                          )}
                        </div>

                        <div className="mt-2 text-xs text-zinc-600">
                          <div>{it.option1}</div>
                          <div>{it.option2}</div>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 생성된 HTML */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="text-lg font-black text-zinc-900">생성된 HTML (보리보리 붙여넣기)</div>
            <div className="mt-1 text-xs text-zinc-500">
              상단 [생성/미리보기] 누르면 여기 채워짐 → [HTML 복사]로 복사
            </div>

            <textarea
              value={generatedHtml}
              onChange={(e) => setGeneratedHtml(e.target.value)}
              className="mt-3 h-[520px] w-full rounded-2xl border border-zinc-300 px-4 py-3 text-xs outline-none focus:border-zinc-900"
              placeholder="아직 생성 안 됨"
            />
          </div>
        </div>
      </div>
    </div>
  );
}