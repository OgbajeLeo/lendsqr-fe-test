import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import AuthGuard from "./components/AuthGuard";


const fig = Figtree({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lendsqr - Admin Dashboard",
  description: "Lendsqr admin dashboard for managing users and loans",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={` ${fig.variable} antialiased`}
      >
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
