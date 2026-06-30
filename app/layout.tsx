import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { initializeAppServices } from "@/lib/init";
import { Navbar } from "@/app/components/layout/Navbar";

// Inicializar servicios del servidor
initializeAppServices();

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "🏎️ F1 News - Últimas noticias de Fórmula 1",
  description: "Mantente actualizado con los últimos datos de Fórmula 1: pilotos, equipos, carreras y sesiones",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 ">
          {children}
        </main>
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
