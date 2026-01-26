import type { Metadata } from "next";
import "./globals.css";
import AuthGuard from "./components/AuthGuard";
import localFont from 'next/font/local'

const avenirNext = localFont({
  src: [
    {
      path: '../public/fonts/Avenir_Next_Pro/AvenirNextLTPro-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Avenir_Next_Pro/AvenirNextLTPro-Bold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/fonts/Avenir_Next_Pro/AvenirNextLTPro-Medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/Avenir_Next_Pro/AvenirNextLTPro-Demi.otf',
      weight: '600',
      style: 'normal',
    },

  ],
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Lendsqr - Admin Dashboard",
  description: "Lendsqr admin dashboard for managing users and loans",
  icons: {
    icon: "/Union.png",
    shortcut: "/Union.png",
    apple: "/Union.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={` ${avenirNext.className} antialiased`}
      >
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
