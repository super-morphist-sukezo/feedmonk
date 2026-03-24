import type { Metadata } from "next";
import { ThemeProvider } from "next-themes"; // 追加
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";

export const metadata: Metadata = {
  title: "feedmonk.app | 心の曇りを、言葉の光に。",
  description: "感情的な言葉を、建設的なフィードバックに変換します。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning は next-themes を使うときのおまじないです
    <html lang="ja" suppressHydrationWarning>
      {/* <body>の背景色指定を削除（テーマ側で制御するため） */}
      <body className="font-sans antialiased transition-colors duration-500">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}