"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function ProdeNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/prode", label: "Mi Prode" },
    { href: "/prode/leaderboard", label: "🏆 Tabla General" },
    { href: "/perfil", label: "👤 Mi Perfil" },
  ];

  return (
    <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-2xl w-full max-w-md mx-auto shadow-lg mb-8">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 text-center py-2.5 px-3 rounded-xl font-bold text-xs md:text-sm transition-all ${
              isActive
                ? "bg-cyan-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}