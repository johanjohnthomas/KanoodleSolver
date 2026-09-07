import type { Metadata } from "next";
import Script from "next/script";
import { Bricolage_Grotesque, DM_Sans, Lora } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
});
const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});
const editorial = Lora({ subsets: ['latin'], variable: '--font-editorial' });

export const metadata: Metadata = {
  title: "Kanoodle Solver",
  description: "Recreate your Kanoodle board, get a guaranteed hint, or solve it completely in your browser.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {process.env.NODE_ENV === "development" && (
          <Script
            src="https://unpkg.com/react-scan/dist/auto.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}

        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body className={`${display.variable} ${body.variable} ${editorial.variable}`}>{children}</body>
    </html>
  );
}
