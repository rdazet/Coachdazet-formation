import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coachdazet Formation",
  description: "Plateforme de formation en finances personnelles",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
