import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "3D Eyewear Studio",
  description: "Professional 3D head model with realistic glasses try-on experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
