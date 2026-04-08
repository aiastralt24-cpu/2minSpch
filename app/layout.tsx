import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "CARE Speak AI",
  description: "Framework-driven speaking practice across CARE, PREP, and STAR."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
