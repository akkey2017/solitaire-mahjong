import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// メタデータにアイコン情報を追加
export const metadata: Metadata = {
  title: "一人麻雀 (TypeScript版)",
  description: "Next.jsで作成された一人麻雀",
  icons: {
    icon: 'https://raw.githubusercontent.com/FluffyStuff/riichi-mahjong-tiles/master/Regular/Ton.svg', // 東の牌のURL
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarningを追加して、ハイドレーションエラーを抑制
    // lang="ja" に変更
    <html lang="ja" suppressHydrationWarning={true}>
      {/* bodyタグにmahjong-tableクラスを追加 */}
      <body className={`${inter.className} mahjong-table`}>{children}</body>
    </html>
  );
}

