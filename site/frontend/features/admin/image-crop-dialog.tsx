"use client";

import { useEffect, useRef, useState } from "react";
import ReactCrop, { type PercentCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Check, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@frontend/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@frontend/components/ui/dialog";
import type { Locale, Vegetable } from "@shared/types";

const fullImage: PercentCrop = { unit: "%", x: 0, y: 0, width: 100, height: 100 };
const maxImageLength = 2_000_000;
type CardDetails = Pick<Vegetable, "nameTh" | "nameEn" | "descriptionTh" | "descriptionEn" | "priceBaht" | "stockBags">;

function drawCrop(canvas: HTMLCanvasElement, image: HTMLImageElement, crop: PercentCrop, maxEdge: number) {
  const width = image.naturalWidth * crop.width / 100;
  const height = image.naturalHeight * crop.height / 100;
  if (!image.naturalWidth || !image.naturalHeight || width <= 0 || height <= 0) throw new Error("Invalid image or crop");
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, image.naturalWidth * crop.x / 100, image.naturalHeight * crop.y / 100, width, height, 0, 0, canvas.width, canvas.height);
}

export function ImageCropDialog({ source, locale, card, onCancel, onConfirm, onError }: {
  source: string; locale: Locale; card: CardDetails; onCancel: () => void; onConfirm: (image: string) => void; onError: () => void;
}) {
  const [crop, setCrop] = useState<PercentCrop>(fullImage);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const thai = locale === "th";
  const name = (thai ? card.nameTh : card.nameEn) || (thai ? "ชื่อผัก" : "Vegetable name");
  const description = (thai ? card.descriptionTh : card.descriptionEn) || (thai ? "รายละเอียดผัก" : "Vegetable description");

  useEffect(() => {
    if (!loaded || !imageRef.current || !previewRef.current || !crop.width || !crop.height) return;
    try { drawCrop(previewRef.current, imageRef.current, crop, 600); } catch { /* The confirmation step reports canvas errors. */ }
  }, [crop, loaded]);

  function confirm() {
    try {
      const image = imageRef.current;
      if (!image) throw new Error("Image unavailable");
      const canvas = document.createElement("canvas");
      // Reduce quality and, if necessary, dimensions until the existing API limit is met.
      for (const edge of [1200, 1000, 800, 600]) {
        drawCrop(canvas, image, crop, edge);
        for (const quality of [0.82, 0.72, 0.62, 0.5]) {
          const result = canvas.toDataURL("image/jpeg", quality);
          if (result.startsWith("data:image/jpeg;") && result.length <= maxImageLength) {
            onConfirm(result);
            return;
          }
        }
      }
      throw new Error("Image too large");
    } catch { setError(true); }
  }

  return <Dialog open onOpenChange={(open) => { if (!open) onCancel(); }}>
    <DialogContent showCloseButton={false} className="max-h-[94dvh] overflow-y-auto sm:max-w-6xl">
      <DialogHeader>
        <DialogTitle>{thai ? "ปรับรูปผัก" : "Adjust vegetable photo"}</DialogTitle>
        <DialogDescription>{thai ? "ลากกรอบหรือจุดที่ขอบเพื่อเลือกพื้นที่ รูปตัวอย่างจะแสดงเหมือนการ์ดหน้าร้าน" : "Drag the selection or its handles to crop. The preview shows how the storefront card will look."}</DialogDescription>
      </DialogHeader>
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(220px,300px)]">
        <div className="flex max-h-[50dvh] min-h-40 md:max-h-[68dvh] items-center justify-center overflow-auto rounded-xl bg-[#edf0df] p-4">
          <ReactCrop className="max-h-[42dvh] md:max-h-[60dvh]" crop={crop} onChange={(_, percent) => { setCrop(percent); setError(false); }} keepSelection>
            <img ref={imageRef} src={source} alt={thai ? "รูปสำหรับครอป" : "Photo to crop"} className="max-w-full object-contain" onLoad={() => setLoaded(true)} onError={onError} />
          </ReactCrop>
        </div>
        <div>
          <p className="mb-2 text-sm font-bold text-[#315546]">{thai ? "ตัวอย่างการ์ดหน้าร้าน" : "Storefront card preview"}</p>
          <article className="overflow-hidden rounded-[1.5rem] border border-[#dce5c4] bg-[#fffef8] p-5 shadow-[0_8px_24px_rgba(27,62,46,.06)]">
            <div className="relative -mx-5 -mt-5 mb-5 h-56 overflow-hidden rounded-t-[1.5rem] bg-[#e8f0d8]">
              <canvas ref={previewRef} role="img" aria-label={thai ? "ตัวอย่างรูปบนการ์ด" : "Card photo preview"} className="h-full w-full object-cover saturate-[1.08]" />
              <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[#174e3a]/90 px-3 py-1.5 text-[10px] font-black tracking-[.12em] text-[#ecffad] shadow-lg"><Check aria-hidden="true" className="h-3 w-3" /> {thai ? "พร้อมจัดส่ง" : "READY TO SHIP"}</span>
            </div>
            <h3 className="text-2xl font-black tracking-[-.035em] text-[#1c392d]">{name}</h3>
            <p className="mt-2 min-h-12 text-sm leading-5 text-[#637568]">{description}</p>
            <div className="mt-5 flex items-end justify-between border-t border-[#e6ead9] pt-4"><div><p className="text-2xl font-black tracking-[-.04em] text-[#174e3a]">{new Intl.NumberFormat(thai ? "th-TH" : "en-US", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(card.priceBaht)}</p><p className="text-xs font-semibold text-[#698072]">{thai ? "บาท / ถุง" : "THB / bag"}</p></div><p className="rounded-xl bg-[#f0f7d8] px-2.5 py-2 text-xs font-extrabold text-[#42613b]">{thai ? `เหลือ ${card.stockBags} ถุง` : `Only ${card.stockBags} bags left`}</p></div>
            <div aria-hidden="true" className="mt-5 flex h-11 items-center justify-center rounded-xl bg-[#1aab59] text-sm font-extrabold text-white"><MessageCircle className="mr-2 h-4 w-4" />{thai ? "ติดต่อผ่าน LINE" : "Contact on LINE"}<ArrowRight className="ml-2 h-4 w-4" /></div>
          </article>
        </div>
      </div>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{thai ? "ไม่สามารถเตรียมรูปได้ ลองปรับกรอบหรือเลือกรูปใหม่" : "Could not prepare this photo. Adjust the crop or choose another image."}</p>}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => { setCrop(fullImage); setError(false); }}>{thai ? "ใช้ทั้งภาพ" : "Use whole photo"}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>{thai ? "ยกเลิก" : "Cancel"}</Button>
        <Button type="button" onClick={confirm} disabled={!loaded || !crop.width || !crop.height}>{thai ? "ยืนยันรูป" : "Use photo"}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>;
}
