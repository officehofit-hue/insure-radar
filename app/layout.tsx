import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InsureRadar | הדשבורד המקצועי לשוק הביטוח והפיננסים",
  description:
    "InsureRadar - חדשות ביטוח, מדדים בזמן אמת, רגולציה, מחשבונים מקצועיים ועוד",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased bg-background">
        {children}
      </body>
    </html>
  );
}
