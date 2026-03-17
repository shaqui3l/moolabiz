import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MoolaBiz – Your 24/7 WhatsApp Business Bot",
  description:
    "Automate customer orders, appointments, and payments on WhatsApp. Built for African informal traders.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-gray-900">{children}</body>
    </html>
  );
}
