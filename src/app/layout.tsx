import type { Metadata } from "next";
import { AppHeader } from "@/components/AppHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "배달앱 데모",
  description: "컴퓨터과학개론 기말 프로젝트 로컬 배달앱 데모",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full bg-slate-50 text-slate-950">
        <AppHeader />
        <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
