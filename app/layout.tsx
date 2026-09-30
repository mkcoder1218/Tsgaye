import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: "400",
  variable: "--font-instrument-serif",
});

export const metadata: Metadata = {
  title: "Tsegaye Teshome — Graphic Designer",
  description:
    "Portfolio of Tsegaye Teshome, a graphic designer and creative professional based in Addis Ababa, Ethiopia.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={instrumentSerif.variable}>
      <body>{children}</body>
    </html>
  );
}
