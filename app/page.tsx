"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";

const CANVAS_WIDTH = 412;
const CANVAS_HEIGHT = 917;

const defaultDate = "2026-04-29T13:22";

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
    <svg aria-hidden="true" className="h-14 w-14" fill="none" viewBox="0 0 56 56">
      <circle cx="28" cy="28" r="28" fill="#5ACB72" />
      <path
        d="m17.5 28.4 7.16 7.1L38.5 21.7"
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4.2"
      />
    </svg>
  );
}

export default function Home() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [nominal, setNominal] = useState("32000");
  const [tanggal, setTanggal] = useState(defaultDate);
  const [isExporting, setIsExporting] = useState(false);

  const formattedNominal = useMemo(() => formatCurrency(nominal), [nominal]);
  const formattedDate = useMemo(() => formatReceiptDate(tanggal), [tanggal]);
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

  return (
    <main className="min-h-screen bg-[#f4f1ec] px-4 py-6 text-[#1f1f1f] md:px-6 md:py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 xl:items-center xl:flex-row">
        <section className="w-full rounded-[32px] bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:p-6 xl:max-w-[360px]">
          <div className="space-y-1">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#ff5a1f]">
              Billflow
            </p>
            <h1 className="text-2xl font-semibold">Receipt mobile preview</h1>
            <p className="text-sm leading-6 text-[#6f6f6f]">
              Ubah nominal dan tanggal. Preview di kanan sinkron real-time dan
              bisa diexport sebagai PNG 2x.
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

            <label className="block space-y-2">
              <span className="text-sm font-medium text-[#303030]">Tanggal</span>
              <input
                className="h-12 w-full rounded-2xl border border-[#e9e0d8] bg-[#fffaf6] px-4 text-base outline-none transition focus:border-[#ff5a1f]"
                onChange={(event) => setTanggal(event.target.value)}
                type="datetime-local"
                value={tanggal}
              />
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

        <section className="flex justify-center">
          <div className="mx-auto w-full max-w-[412px]">
            <div
              className="origin-top overflow-hidden rounded-[36px] bg-white shadow-[0_30px_80px_rgba(0,0,0,0.12)]"
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

                  <div className="pb-1 pt-6">
                    <div className="mx-auto h-[5px] w-[118px] rounded-full bg-[#111111]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
