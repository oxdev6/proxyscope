import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProxyScope — Governance Mutability Inspector",
  description:
    "ProxyScope surfaces contract upgrade authority and governance mutability risk across networks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
