"use client";

import { useRef, useState } from "react";
import ReactCrop, { type PercentCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@frontend/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@frontend/components/ui/dialog";
import type { Locale } from "@shared/types";

const fullImage: PercentCrop = { unit: "%", x: 0, y: 0, width: 100, height: 100 };

export function ImageCropDialog({ source, locale, onCancel, onConfirm, onError }: {
  source: string; locale: Locale; onCancel: () => void; onConfirm: (image: string) => void; onError: () => void;
}) {
  const [crop, setCrop] = useState<PercentCrop>(fullImage);
  const imageRef = useRef<HTMLImageElement>(null);
  const thai = locale === "th";

  function confirm() {
    try {
      const image = imageRef.current;
      if (!image || !image.naturalWidth || !image.naturalHeight || crop.width <= 0 || crop.height <= 0) throw new Error();
      const x = image.naturalWidth * crop.x / 100;
      const y = image.naturalHeight * crop.y / 100;
      const width = image.naturalWidth * crop.width / 100;
      const height = image.naturalHeight * crop.height / 100;
      const scale = Math.min(1, 1200 / Math.max(width, height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error();
      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, x, y, width, height, 0, 0, canvas.width, canvas.height);
      const result = canvas.toDataURL("image/jpeg", 0.82);
      if (result.length > 2_000_000) throw new Error();
      onConfirm(result);
    } catch {
      onError();
    }
  }

  return <Dialog open onOpenChange={(open) => { if (!open) onCancel(); }}>
    <DialogContent showCloseButton={false} className="max-h-[90dvh] max-w-3xl overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{thai ? "ปรับรูปผัก" : "Adjust vegetable photo"}</DialogTitle>
        <DialogDescription>{thai ? "ลากกรอบเพื่อเลือกพื้นที่ หรือใช้ทั้งภาพ แล้วกดยืนยัน" : "Drag the selection to crop, or keep the whole photo, then confirm."}</DialogDescription>
      </DialogHeader>
      <div className="flex max-h-[60dvh] justify-center overflow-auto bg-[#edf0df]">
        <ReactCrop crop={crop} onChange={(_, percent) => setCrop(percent)} keepSelection>
          <img ref={imageRef} src={source} alt={thai ? "รูปสำหรับครอป" : "Photo to crop"} className="max-h-[60dvh] max-w-full object-contain" onError={onError} />
        </ReactCrop>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>{thai ? "ยกเลิก" : "Cancel"}</Button>
        <Button type="button" onClick={confirm} disabled={!crop.width || !crop.height}>{thai ? "ยืนยันรูป" : "Use photo"}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>;
}
