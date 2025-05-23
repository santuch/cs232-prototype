import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { MissingPersonsProvider } from "@/context/MissingPersonsContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "ศูนย์ค้นหาบุคคลสูญหาย",
    description: "ระบบค้นหาและแจ้งเบาะแสบุคคลสูญหาย",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="th" suppressHydrationWarning>
            <body className={inter.className}>
                <MissingPersonsProvider>
                    {children}
                    <Toaster />
                </MissingPersonsProvider>
            </body>
        </html>
    );
}
