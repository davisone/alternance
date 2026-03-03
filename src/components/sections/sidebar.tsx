"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Offres", icon: "🔍" },
  { href: "/dashboard/favorites", label: "Favoris", icon: "⭐" },
  { href: "/dashboard/applications", label: "Candidatures", icon: "📋" },
  { href: "/dashboard/settings", label: "Paramètres", icon: "⚙️" },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <nav className="flex w-64 flex-col border-r border-gray-200 bg-white">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900">Alternance Tracker</h1>
      </div>
      <ul className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
