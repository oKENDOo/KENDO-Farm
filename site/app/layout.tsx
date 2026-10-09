import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KENDO FARM | Hydroponic harvests today",
  description: "Fresh hydroponic vegetables from KENDO FARM.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="antialiased">{children}</body>
    </html>
  );
}
