import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AutoParts Market - قطع غيار السيارات",
  description:
    "Algeria's marketplace for automotive spare parts and accessories",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
