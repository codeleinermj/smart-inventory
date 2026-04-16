import type { Metadata } from "next";
import { Inter, Michroma } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const michroma = Michroma({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-michroma",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Smart Inventory",
  description: "Modern inventory management — fast, animated, keyboard-friendly.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${michroma.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
