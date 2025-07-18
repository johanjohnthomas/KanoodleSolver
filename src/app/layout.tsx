import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { GameProvider } from "@/contexts/GameContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kanoodle Solver",
  description: "An interactive Kanoodle puzzle solver with drag & drop, hints, and auto-solving",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <GameProvider>
            {children}
          </GameProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
