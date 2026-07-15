import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { initializeAppServices } from "@/lib/init";
import { Navbar } from "@/app/components/layout/Navbar";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next"

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
  title: "F1 HUB - Últimas noticias de Fórmula 1",
  description: "Actualizaciones de las últimas novedades sobre F1",
  openGraph: {
    title: 'F1 HUB - Últimas noticias de Fórmula 1',
    description: 'Actualizaciones de las últimas novedades sobre F1',
    url: 'https://f1-xi-ten.vercel.app/',
    siteName: 'F1 HUB',
    images: [
      {
        url: '/icon.png', 
        width: 512,
        height: 512,
        alt: 'Portada de Documentos FIA',
      },
    ],
    locale: 'es_AR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 1. Extraemos el ID de Analytics de las variables de entorno.
  // Debe empezar con NEXT_PUBLIC_ para que Next.js lo exponga al cliente de forma segura.
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
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

        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 ">
          {children}
        </main>
        <Analytics />
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              © 2026 F1 News | Powered by Open F1 API • Made with AI assistance
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}