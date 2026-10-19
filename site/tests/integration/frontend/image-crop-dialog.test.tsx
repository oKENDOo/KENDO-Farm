import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { ImageCropDialog } from "@frontend/features/admin/image-crop-dialog";
import { demoCatalog } from "@shared/demo-catalog";

vi.mock("react-image-crop", () => ({
  default: ({ children, onChange }: { children: ReactNode; onChange: (pixels: unknown, percent: object) => void }) => <div>{children}<button type="button" onClick={() => onChange({}, { unit: "%", x: 25, y: 10, width: 50, height: 60 })}>Change crop</button></div>,
}));

afterEach(() => vi.restoreAllMocks());
function setupCanvas() {
  const drawImage = vi.fn();
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ drawImage, fillRect: vi.fn() } as unknown as CanvasRenderingContext2D);
  const encode = vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue("data:image/jpeg;base64,crop");
  return { drawImage, encode };
}
function loadImage() {
  const image = screen.getByRole("img", { name: /รูปสำหรับครอป|Photo to crop/ });
  Object.defineProperties(image, { naturalWidth: { value: 2400 }, naturalHeight: { value: 1200 } });
  fireEvent.load(image);
  return image;
}
describe("vegetable photo crop", () => {
  it("updates the card preview and exports the selected region", async () => {
    const { drawImage } = setupCanvas();
    const confirm = vi.fn();
    render(<ImageCropDialog source="data:image/png;base64,test" locale="th" card={demoCatalog.vegetables[0]} onCancel={vi.fn()} onConfirm={confirm} onError={vi.fn()} />);
    const image = loadImage();
    expect(screen.getByText("กรีนโอ๊ค")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "ตัวอย่างรูปบนการ์ด" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Change crop" }));
    await waitFor(() => expect(drawImage).toHaveBeenCalledWith(image, 600, 120, 1200, 720, 0, 0, 600, 360));
    fireEvent.click(screen.getByRole("button", { name: "ยืนยันรูป" }));
    expect(drawImage).toHaveBeenCalledWith(image, 600, 120, 1200, 720, 0, 0, 1200, 720);
    expect(confirm).toHaveBeenCalledWith("data:image/jpeg;base64,crop");
  });
  it("reduces JPEG quality when the result exceeds the API limit", () => {
    const { encode } = setupCanvas();
    encode.mockReturnValueOnce(`data:image/jpeg;base64,${"x".repeat(2_000_000)}`).mockReturnValue("data:image/jpeg;base64,smaller");
    const confirm = vi.fn();
    render(<ImageCropDialog source="test" locale="en" card={demoCatalog.vegetables[0]} onCancel={vi.fn()} onConfirm={confirm} onError={vi.fn()} />);
    loadImage();
    fireEvent.click(screen.getByRole("button", { name: "Use photo" }));
    expect(encode).toHaveBeenCalledWith("image/jpeg", 0.72);
    expect(confirm).toHaveBeenCalledWith("data:image/jpeg;base64,smaller");
  });
  it("resets the crop and reports unreadable images", () => {
    const { drawImage } = setupCanvas();
    const cancel = vi.fn(); const error = vi.fn(); const confirm = vi.fn();
    render(<ImageCropDialog source="bad" locale="en" card={demoCatalog.vegetables[0]} onCancel={cancel} onConfirm={confirm} onError={error} />);
    const image = loadImage();
    fireEvent.click(screen.getByRole("button", { name: "Change crop" }));
    fireEvent.click(screen.getByRole("button", { name: "Use whole photo" }));
    fireEvent.click(screen.getByRole("button", { name: "Use photo" }));
    expect(drawImage).toHaveBeenCalledWith(image, 0, 0, 2400, 1200, 0, 0, 1200, 600);
    fireEvent.error(image); expect(error).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" })); expect(cancel).toHaveBeenCalledOnce();
  });
});
