import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";   // ✅ must be here

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ghar-se-Kaam",
  description: "Seamless Screen Sharing – Connect with your team instantly and securely.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
        />
      </head>
      <body className={`${inter.className} bg-black text-white`}>
        {children}
      </body>
    </html>
  );
}
