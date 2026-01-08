import type { Metadata } from "next";
import { Montserrat, Russo_One } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const russoOne = Russo_One({
  variable: "--font-russo-one",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lava Chess - Molten Strategy",
  description: "Forged in Fire. Played on Hexagons.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} ${russoOne.variable} antialiased bg-deep text-white`}
      >
        {children}
      </body>
    </html>
  );
}
