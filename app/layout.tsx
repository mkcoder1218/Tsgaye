import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tsegaye Teshome — Graphic Designer",
  description: "Portfolio of Tsegaye Teshome, a graphic designer and creative professional based in Addis Ababa, Ethiopia.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
