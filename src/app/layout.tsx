import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "MeetingOS — One Meeting. Infinite Knowledge.",
  description:
    "MeetingOS automatically understands meetings, extracts decisions, creates action items, and stores everything forever inside your company brain. One recording becomes permanent company knowledge.",
  openGraph: {
    title: "MeetingOS — One Meeting. Infinite Knowledge.",
    description: "Turn conversations into permanent company memory.",
    type: "website",
    siteName: "MeetingOS",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable}`}>
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
