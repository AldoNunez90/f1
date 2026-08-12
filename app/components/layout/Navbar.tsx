"use client";

import Link from "next/link";
import { useState, type MouseEvent } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";


export function Navbar() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(true);
  const { data: session, status } = useSession();

  const baseLinks = [
    { href: "/", label: "Inicio" },
    { href: "/novedades", label: "Novedades" },
    { href: "/drivers", label: "Pilotos" },
    { href: "/teams", label: "Equipos" },
    { href: "/teams/chronology", label: "Cronología" },
    { href: "/championship", label: "Campeonatos" },
    { href: "/sessions", label: "Sesiones" },
  ];

    // 2. Determinar el enlace dinámico según el estado de la sesión
  const authLink = session
    ? { href: "/perfil", label: "Mi Perfil" }
    : { href: "/auth/signin", label: "Acceder" };

  // 3. Filtrar y construir la lista final de enlaces
  const links =  status === "loading"
    ? baseLinks
    : [...baseLinks, authLink];

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
         {/* Logo en Navbar */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Image src={"/logo.webp"} alt="F1 HUB Logo" width={80} height={60} loading="eager" />
            <span className="text-gray-900 dark:text-white font-black uppercase tracking-widest">
              F1 HUB
            </span>
          </Link>

          {/* Links Desktop */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => {
              const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
                if (pathname === "/sessions" && link.href === "/sessions") {
                  event.preventDefault();
                  window.dispatchEvent(new CustomEvent("resetSessionsView"));
                }
              };

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={handleClick}
                  className="text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400 transition font-medium text-sm"
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mr-2"
              onClick={() => setHidden(!hidden)}
            >
              ☰
            </button>
            <div
              className={`flex-col absolute top-14 right-0 ${hidden ? "hidden" : "flex"} py-2 w-3/4`}
            >
              <ul className="flex flex-col bg-gray-800/95 rounded-b-3xl">
                {links.map((link) => {
                  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
                    if (pathname === "/sessions" && link.href === "/sessions") {
                      event.preventDefault();
                      window.dispatchEvent(new CustomEvent("resetSessionsView"));
                    }
                    setHidden(true);
                  };

                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={handleClick}
                        className="text-gray-800 dark:text-white transition font-medium text-xl flex justify-evenly mb-2 mt-2"
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}