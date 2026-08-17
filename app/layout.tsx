import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { initializeAppServices } from "@/lib/init";
import { Navbar } from "@/app/components/layout/Navbar";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { F1Provider } from "@/lib/context/F1Context";
import { SessionProvider } from "next-auth/react";
import Link from "next/link";
import { PageTransitionLoading } from "./components/common/PageTransitionLoading";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Inicializar servicios del servidor
initializeAppServices();

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});
export const metadata: Metadata = {
  title: "F1 HUB",
  description:
    "Plataforma Argentina de Fórmula 1. Inicia sesión con tu cuenta de Google para guardar tus pronósticos en el Prode y armar tu Garaje.",
  openGraph: {
    title: "F1 HUB",
    description: "Datos, noticias, pilotos, equipos, carreras y resultados de Fórmula 1.", 
    url: "https://www.f1hub.com.ar/",
    siteName: "F1 HUB",
    images: [
      {
        url: "https://www.f1hub.com.ar/og-image-1200x630.jpg", 
        width: 1200,
        height: 630,
        alt: "F1 HUB - Portal de Fórmula 1",
      },
      {
         url: "https://www.f1hub.com.ar/cascoDrivers.png", 
        width: 512,
        height: 512,
        alt: "Casco F1 HUB",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image", 
    title: "F1 HUB",
    description: "Datos, noticias, pilotos, equipos, carreras y resultados de Fórmula 1.",
    images: ["https://www.f1hub.com.ar/og-image-1200x630.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta
          name="google-site-verification"
          content="D9ltZdI1paTPIbW9dKzIUXu7QwG5dmDWlq4dBLMSoUE"
        />
      </head>
      <body className="min-h-full flex flex-col">
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />

            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
        <PageTransitionLoading />
        <SessionProvider>
          <F1Provider>
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 ">
              <SpeedInsights />
              {children}
            </main>
          </F1Provider>
        </SessionProvider>
        <Analytics />
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              © 2026 F1 HUB | Powered by Open F1 API • Made with AI assistance
            </p>
            <div className="flex gap-6 text-sm font-semibold text-cyan-600 dark:text-cyan-400">
              <Link href="/privacy" className="hover:underline">
                Políticas de Privacidad
              </Link>
              <Link href="/terms" className="hover:underline">
                Términos de Uso
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
