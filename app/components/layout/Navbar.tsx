"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
/**
 * Navbar con navegación principal
 */
export function Navbar() {
  const [hidden, setHidden] = useState(true);

  const links = [
    { href: "/", label: "Inicio", url: "/home.png" },
    { href: "/drivers", label: "Pilotos", url: "/cascoDrivers.png" },
    { href: "/teams", label: "Equipos", url: "/teamsImg.png" },
    { href: "/championship", label: "Campeonatos", url: "/banderaCuadros.png" },
    { href: "/sessions", label: "Sesiones", url: "/sessionsImg.png" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Image src={"/logo.png"} alt="logo" width={108} height={60.6} />
          </Link>

          {/* Links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-600 dark:text-gray-300 hover:cyan-500 dark:hover:text-cyan-600 transition font-medium text-sm"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              onClick={() => setHidden(!hidden)}
            >
              ☰
            </button>
            <div
              className={`flex-col absolute top-16 right-5 ${hidden ? "hidden" : "flex"} py-2 w-1/2`}
            >
              <ul className="flex flex-col">
                {links.map((link) => (
                  <li key={link.href} className="">
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-gray-600 dark:text-gray-300 transirion font-medium text-sm flex justify-evenly mb-2 mt-2
                "
                    >
                      <Image
                        src={link.url}
                        alt={link.href}
                        width={50}
                        height={50}
                      />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
