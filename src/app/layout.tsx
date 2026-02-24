import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
    title: "피복 구매관리 시스템",
    description: "군 피복 포인트 기반 온/오프라인 구매관리 시스템",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko">
            <body className={`${inter.className} antialiased`}>
                {children}
                <Toaster position="top-right" richColors />
            </body>
        </html>
    );
}
