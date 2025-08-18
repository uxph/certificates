import { Poppins, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
    variable: "--font-body",
    subsets: ["latin"],
    weight: ["400", "700"],
});

const inter = Inter({
    variable: "--font-headline",
    subsets: ["latin"],
    weight: ["400", "700", "800"],
});

const geistMono = Geist_Mono({
    variable: "--font-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "UXPH Certificates",
    description: "",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={`${poppins.variable} ${inter.variable} ${geistMono.variable} antialiased`}>{children}</body>
        </html>
    );
}
