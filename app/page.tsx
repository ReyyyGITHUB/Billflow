"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toPng } from "html-to-image";
import {
  TransformComponent,
  TransformWrapper,
  type ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";

const CANVAS_WIDTH = 412;
const CANVAS_HEIGHT = 917;
const VIEWPORT_PADDING = 40;
const RESET_SCALE = 0.64;
const RESET_OFFSET_Y = -36;
const MIN_SCALE = 0.35;
const MAX_SCALE = 3;

function getNowDateTime() {
  const now = new Date();
  const date = [
    now.getFullYear(),
    `${now.getMonth() + 1}`.padStart(2, "0"),
    `${now.getDate()}`.padStart(2, "0"),
  ].join("-");
  const time = [`${now.getHours()}`.padStart(2, "0"), `${now.getMinutes()}`.padStart(2, "0")].join(":");

  return { date, time };
}

function formatCurrency(value: string) {
  const normalized = Number(value.replace(/[^\d]/g, "")) || 0;

  return new Intl.NumberFormat("id-ID").format(normalized);
}

function formatReceiptDate(value: string) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  })
    .format(date)
    .replace(".", ":")
    .concat(" WIB");
}

function CheckIcon() {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#5ACB72]">
      <Image
        alt=""
        aria-hidden="true"
        className="h-[22px] w-7"
        height={22}
        src="/assets/check-1.svg"
        width={28}
      />
    </div>
  );
}

export default function Home() {
  const defaultNow = useMemo(() => getNowDateTime(), []);
  const canvasRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);
  const [nominal, setNominal] = useState("0");
  const [tanggal, setTanggal] = useState(defaultNow.date);
  const [waktu, setWaktu] = useState(defaultNow.time);
  const [isExporting, setIsExporting] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [viewportReady, setViewportReady] = useState(false);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  const formattedNominal = useMemo(() => formatCurrency(nominal), [nominal]);
  const tanggalWaktuValue = useMemo(() => {
    if (!tanggal && !waktu) {
      return "";
    }

    return `${tanggal}T${waktu || "00:00"}`;
  }, [tanggal, waktu]);
  const formattedDate = useMemo(() => formatReceiptDate(tanggalWaktuValue), [tanggalWaktuValue]);

  const getViewportFitScale = useCallback((width: number, height: number, padding: number) => {
    if (!width || !height) {
      return 1;
    }

    const availableWidth = Math.max(width - padding * 2, 1);
    const availableHeight = Math.max(height - padding * 2, 1);

    return Math.min(
      Math.max(Math.min(availableWidth / CANVAS_WIDTH, availableHeight / CANVAS_HEIGHT), MIN_SCALE),
      MAX_SCALE,
    );
  }, []);

  const getFitScale = useCallback(
    (width: number, height: number) => {
      return getViewportFitScale(width, height, VIEWPORT_PADDING);
    },
    [getViewportFitScale],
  );

  const centerScale = useCallback(
    (scale: number) => {
      if (!transformRef.current || !viewportSize.width || !viewportSize.height) {
        return;
      }

      const positionX = (viewportSize.width - CANVAS_WIDTH * scale) / 2;
      const positionY = (viewportSize.height - CANVAS_HEIGHT * scale) / 2;

      transformRef.current.setTransform(positionX, positionY, scale, 200, "easeOut");
      setZoomLevel(Math.round(scale * 100));
    },
    [viewportSize.height, viewportSize.width],
  );

  const handleFitView = useCallback(() => {
    centerScale(getFitScale(viewportSize.width, viewportSize.height));
  }, [centerScale, getFitScale, viewportSize.height, viewportSize.width]);

  const handleResetView = useCallback(() => {
    if (!transformRef.current || !viewportSize.width || !viewportSize.height) {
      return;
    }

    const positionX = (viewportSize.width - CANVAS_WIDTH * RESET_SCALE) / 2;
    const positionY = (viewportSize.height - CANVAS_HEIGHT * RESET_SCALE) / 2 + RESET_OFFSET_Y;

    transformRef.current.setTransform(positionX, positionY, RESET_SCALE, 200, "easeOut");
    setZoomLevel(Math.round(RESET_SCALE * 100));
  }, [viewportSize.height, viewportSize.width]);

  useEffect(() => {
    const viewportElement = viewportRef.current;

    if (!viewportElement) {
      return;
    }

    const updateSize = () => {
      const nextSize = {
        width: viewportElement.clientWidth,
        height: viewportElement.clientHeight,
      };

      setViewportSize(nextSize);
      setViewportReady(nextSize.width > 0 && nextSize.height > 0);
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(viewportElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!viewportReady || !transformRef.current) {
      return;
    }

    handleFitView();
  }, [handleFitView, viewportReady]);

  const handleExport = async () => {
    if (!canvasRef.current) {
      return;
    }

    try {
      setIsExporting(true);

      const dataUrl = await toPng(canvasRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        canvasWidth: CANVAS_WIDTH,
        canvasHeight: CANVAS_HEIGHT,
      });

      const exportDate = new Date();
      const fileTimestamp = [
        exportDate.getFullYear(),
        `${exportDate.getMonth() + 1}`.padStart(2, "0"),
        `${exportDate.getDate()}`.padStart(2, "0"),
        `${exportDate.getHours()}`.padStart(2, "0"),
        `${exportDate.getMinutes()}`.padStart(2, "0"),
        `${exportDate.getSeconds()}`.padStart(2, "0"),
      ].join("");

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `Billflow-Export-${fileTimestamp}.png`;
      link.click();
    } finally {
      setIsExporting(false);
    }
  };

  const handleSetNow = () => {
    const { date, time } = getNowDateTime();
    setTanggal(date);
    setWaktu(time);
  };

  return (
    <main className="min-h-screen overflow-y-auto bg-[#f4f1ec] px-4 py-6 text-[#1f1f1f] md:px-6 md:py-8 xl:h-screen xl:overflow-hidden">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 xl:min-h-[calc(100vh-4rem)] xl:flex-row xl:items-start">
        <section className="w-full rounded-[32px] bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:p-6 xl:sticky xl:top-6 xl:max-w-[360px]">
          <div className="space-y-1">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#ff5a1f]">
              Billflow
            </p>
            <h1 className="text-2xl font-semibold">Receipt mobile preview</h1>
            <p className="text-sm leading-6 text-[#6f6f6f]">
              Ubah nominal dan tanggal. Preview di kanan sinkron real-time,
              bisa digeser, di-zoom, dan tetap diexport PNG 2x.
            </p>
          </div>

          <div className="mt-6 space-y-5">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-[#303030]">Nominal</span>
              <input
                className="h-12 w-full rounded-2xl border border-[#e9e0d8] bg-[#fffaf6] px-4 text-base outline-none transition focus:border-[#ff5a1f]"
                inputMode="numeric"
                onChange={(event) => setNominal(event.target.value)}
                value={nominal}
              />
            </label>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-[#303030]">Tanggal & Jam</span>
                <button
                  className="rounded-full border border-[#ffd8c9] bg-[#fff4ed] px-3 py-1 text-xs font-medium text-[#ff5a1f] transition hover:border-[#ff5a1f]"
                  onClick={handleSetNow}
                  type="button"
                >
                  Set waktu sekarang
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-2">
                  <span className="text-xs font-medium text-[#7d7d7d]">Tanggal</span>
                  <input
                    className="h-12 w-full rounded-2xl border border-[#e9e0d8] bg-[#fffaf6] px-4 text-base outline-none transition focus:border-[#ff5a1f]"
                    onChange={(event) => setTanggal(event.target.value)}
                    type="date"
                    value={tanggal}
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-xs font-medium text-[#7d7d7d]">Jam</span>
                  <input
                    className="h-12 w-full rounded-2xl border border-[#e9e0d8] bg-[#fffaf6] px-4 text-base outline-none transition focus:border-[#ff5a1f]"
                    onChange={(event) => setWaktu(event.target.value)}
                    type="time"
                    value={waktu}
                  />
                </label>
              </div>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-[#303030]">Template</span>
              <select
                className="h-12 w-full rounded-2xl border border-[#e9e0d8] bg-[#fffaf6] px-4 text-base text-[#7d7d7d] outline-none transition focus:border-[#ff5a1f]"
                defaultValue=""
              >
                <option value="">Pilih template</option>
              </select>
            </label>

            <button
              className="flex h-12 w-full items-center justify-center rounded-2xl bg-[#ff5a1f] text-sm font-medium text-white transition hover:bg-[#f04b11] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isExporting}
              onClick={handleExport}
              type="button"
            >
              {isExporting ? "Menyiapkan PNG..." : "Export PNG"}
            </button>
          </div>
        </section>

        <section className="preview-shell flex min-h-[720px] flex-1 flex-col">
          <TransformWrapper
            ref={transformRef}
            centerOnInit={false}
            disabled={!viewportReady}
            doubleClick={{ disabled: true }}
            limitToBounds={false}
            maxScale={MAX_SCALE}
            minScale={MIN_SCALE}
            panning={{
              disabled: false,
              velocityDisabled: true,
            }}
            pinch={{ step: 5 }}
            wheel={{ step: 0.12 }}
            onTransform={(_, state) => {
              setZoomLevel(Math.round(state.scale * 100));
            }}
          >
            {(controls) => (
              <>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-[20px] bg-white/70 px-4 py-3 backdrop-blur">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      className="rounded-xl border border-[#d9d2ca] bg-white px-3 py-2 text-sm font-medium text-[#303030] transition hover:border-[#ff5a1f] hover:text-[#ff5a1f]"
                      onClick={() => {
                        handleResetView();
                        controls.setTransform(
                          (viewportSize.width - CANVAS_WIDTH * RESET_SCALE) / 2,
                          (viewportSize.height - CANVAS_HEIGHT * RESET_SCALE) / 2 + RESET_OFFSET_Y,
                          RESET_SCALE,
                          200,
                          "easeOut",
                        );
                      }}
                      type="button"
                    >
                      100%
                    </button>
                    <button
                      aria-label="Zoom out"
                      className="rounded-xl border border-[#d9d2ca] bg-white px-3 py-2 text-sm font-medium text-[#303030] transition hover:border-[#ff5a1f] hover:text-[#ff5a1f]"
                      onClick={() => controls.zoomOut(0.2, 200, "easeOut")}
                      type="button"
                    >
                      −
                    </button>
                    <button
                      aria-label="Zoom in"
                      className="rounded-xl border border-[#d9d2ca] bg-white px-3 py-2 text-sm font-medium text-[#303030] transition hover:border-[#ff5a1f] hover:text-[#ff5a1f]"
                      onClick={() => controls.zoomIn(0.2, 200, "easeOut")}
                      type="button"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="rounded-full bg-[#fff4ed] px-3 py-1 text-[#ff5a1f]">
                      {zoomLevel}%
                    </span>
                  </div>
                </div>

                <div
                  ref={viewportRef}
                  className="viewport relative min-h-[720px] touch-none overflow-hidden rounded-[28px] border border-[#e6dfd7] bg-[#ede8e1] cursor-grab active:cursor-grabbing"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.45),rgba(237,232,225,0.95))]" />

                  <TransformComponent
                    contentClass="!w-auto !h-auto"
                    wrapperClass="!h-full !w-full"
                  >
                <div
                  className="artboard-layer origin-top-left"
                  style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
                >
                  <div
                    className="overflow-hidden rounded-[36px] bg-white shadow-[0_30px_80px_rgba(0,0,0,0.12)]"
                    style={{ width: CANVAS_WIDTH }}
                  >
                    <div
                      id="receipt-canvas"
                      ref={canvasRef}
                      className="relative bg-[#f7f7f7]"
                      style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
                    >
                      <div className="flex h-full flex-col px-4 pb-8 pt-5">
                        <div className="flex justify-end">
                          <button
                            aria-label="Close preview"
                            className="text-[22px] font-light leading-none text-[#111111]"
                            type="button"
                          >
                            ×
                          </button>
                        </div>

                        <div className="mt-[6px] flex flex-col items-center">
                          <CheckIcon />
                          <div className="mt-[27px] flex w-full max-w-[340px] flex-col items-center">
                            <p className="text-[23px] leading-none font-normal tracking-[-0.03em] text-[#171717]">
                              {`Rp ${formattedNominal}`}
                            </p>
                            <p className="mt-4 text-[13px] leading-none text-[#b0b0b0]">
                              {formattedDate}
                            </p>
                          </div>

                          <div className="mt-[22px] inline-flex h-[42px] items-center gap-[10px] rounded-full bg-[#ffefe9] px-[18px] text-[12px] leading-none font-normal text-[#fb5b2a]">
                            <Image
                              alt=""
                              aria-hidden="true"
                              className="h-5 w-5 shrink-0"
                              height={20}
                              src="/assets/ion_gift.svg"
                              width={20}
                            />
                            <span className="translate-y-[1px]">
                              Klaim dari Aplikasi ShopeePay
                            </span>
                            <Image
                              alt=""
                              aria-hidden="true"
                              className="h-[18px] w-[9px] shrink-0"
                              height={18}
                              src="/assets/weui_arrow-outlined.svg"
                              width={9}
                            />
                          </div>
                        </div>

                        <div className="mt-8 w-full overflow-hidden rounded-[8px] border border-[#f7d6ca]">
                          <Image
                            alt="SPayLater promo"
                            className="h-[159px] w-full object-cover"
                            height={159}
                            priority
                            src="/assets/banner-shoppe-cut.png"
                            width={380}
                          />
                        </div>

                        <div className="container-detail mt-5 flex w-full flex-col items-start gap-3">
                          <div className="merchant-detail flex w-full flex-col items-start gap-3 self-stretch rounded-[8px] bg-[#fafafa] px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#ff6431] text-white">
                                <Image
                                  alt=""
                                  aria-hidden="true"
                                  className="h-[15px] w-3"
                                  height={15}
                                  src="/assets/shop.svg"
                                  width={12}
                                />
                              </div>
                              <p className="text-[15px] font-normal text-[#2d2d2d]">
                                hotelmurah.com
                              </p>
                            </div>
                          </div>

                          <div className="payment-detail flex w-full flex-col items-start gap-3 self-stretch rounded-[8px] bg-[#fafafa] px-4 py-3 text-[14px]">
                            <div className="flex w-full items-center justify-between text-[#232323]">
                              <span>Kamu Membayar</span>
                              <span className="font-medium">{`Rp ${formattedNominal}`}</span>
                            </div>
                            <div className="w-full border-t border-dashed border-[#e6e6e6]" />
                            <div className="flex w-full items-center justify-between text-[#989898]">
                              <span>Total Pembelian</span>
                              <span>{`Rp ${formattedNominal}`}</span>
                            </div>
                          </div>

                          <div className="promo-detail flex w-full flex-col items-start gap-3 self-stretch rounded-[8px] bg-[#fafafa] px-4 py-3">
                            <p className="text-[15px] font-medium text-[#202020]">
                              Rincian Promo
                            </p>
                            <div className="w-full space-y-[10px] text-[14px]">
                              <p className="text-[#969696]">Promo Dipakai</p>
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-[14px] text-[#1f1f1f]">
                                  Berhasil Dapat
                                </span>
                                <span className="inline-flex min-h-[28px] items-center rounded-full bg-[#fff3c6] px-3 text-[13px] text-[#f2a41d]">
                                  Cashback s.d 100RB
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <button
                          className="z-[1] mt-[1px] flex h-[52px] items-center justify-center gap-[10px] rounded-[8px] bg-[#ff5a1f] text-[14px] font-medium text-white"
                          type="button"
                        >
                          <Image
                            alt=""
                            aria-hidden="true"
                            className="h-5 w-5 shrink-0"
                            height={20}
                            src="/assets/ion_gift-whtie.svg"
                            width={20}
                          />
                          <span>Klaim dari Aplikasi ShopeePay</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                  </TransformComponent>
                </div>
              </>
            )}
          </TransformWrapper>
        </section>
      </div>
    </main>
  );
}
