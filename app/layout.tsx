import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#0f172a",
};

export const metadata: Metadata = {
  title: "Coachdazet Formation",
  description: "Plateforme de formation en finances personnelles",
  applicationName: "Coachdazet",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Coachdazet",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        {/*
          Next.js `appleWebApp.capable` (ci-dessus) genere la balise
          standard "mobile-web-app-capable". iOS Safari se fie surtout
          au manifest (display: standalone), mais on ajoute aussi la
          balise historique "apple-mobile-web-app-capable" en dur pour
          une compatibilite maximale (cf. PRD section 5.4).
        */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body>{children}</body>
    </html>
  );
}
