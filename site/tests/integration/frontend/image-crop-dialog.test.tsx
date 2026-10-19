import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ImageCropDialog } from "@frontend/features/admin/image-crop-dialog";

afterEach(() => vi.restoreAllMocks());

describe("vegetable photo crop", () => {
  it("exports the selected whole image at a maximum edge of 1200 pixels", () => {
    const drawImage = vi.fn();
    const fillRect = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ drawImage, fillRect } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue("data:image/jpeg;base64,crop");
    const confirm = vi.fn();
    render(<ImageCropDialog source="data:image/png;base64,test" locale="th" onCancel={vi.fn()} onConfirm={confirm} onError={vi.fn()} />);
    const image = screen.getByRole("img", { name: "รูปสำหรับครอป" });
    Object.defineProperties(image, { naturalWidth: { value: 2400 }, naturalHeight: { value: 1200 } });
    fireEvent.click(screen.getByRole("button", { name: "ยืนยันรูป" }));
    expect(drawImage).toHaveBeenCalledWith(image, 0, 0, 2400, 1200, 0, 0, 1200, 600);
    expect(confirm).toHaveBeenCalledWith("data:image/jpeg;base64,crop");
  });

  it("cancels without applying a photo and reports unreadable images", () => {
    const cancel = vi.fn();
    const error = vi.fn();
    const confirm = vi.fn();
    render(<ImageCropDialog source="bad" locale="en" onCancel={cancel} onConfirm={confirm} onError={error} />);
    fireEvent.error(screen.getByRole("img", { name: "Photo to crop" }));
    expect(error).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(cancel).toHaveBeenCalledOnce();
    expect(confirm).not.toHaveBeenCalled();
  });
});
